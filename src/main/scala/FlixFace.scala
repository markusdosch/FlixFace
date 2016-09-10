import java.io._

import akka.actor.ActorSystem
import akka.event.{Logging, LoggingAdapter}
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Directives._
import akka.stream.{ActorMaterializer, Materializer}
import com.typesafe.config.{Config, ConfigFactory}

import scala.concurrent.ExecutionContextExecutor
import scala.sys.process.Process

trait types {
  type Vector = List[Double]
}

trait Service extends types with db {
  implicit val system: ActorSystem
  implicit def executor: ExecutionContextExecutor
  implicit val materializer: Materializer

  def config: Config
  val logger: LoggingAdapter
  val THRESHOLD = 0.47

  val routes = {
    logRequestResult("flixface") {
      pathPrefix("static") {
        // optionally compresses the response with Gzip or Deflate
        // if the client accepts compressed responses
        encodeResponse {
          // serve up static content from a JAR resource
          getFromResourceDirectory("static")
        }
      }
    } ~ (path("add") & post) {
      uploadedFile("image") {
        case (metadata, file) =>
          formFields('name.as[String]) { (name) =>
            val vector = getTorchVector(file.toString)
            addPerson(name, vector)
            file.delete()
            complete(s"Successfully uploaded a picture for user: $name")
          }

      }
    } ~ (path("verify") & post) {
      uploadedFile("image") {
        case (metadata, file) =>
          formFields('name.as[String]) { (name) =>
            val res = check(name, file.toString)
            file.delete()

            if(res._1 == name && res._2 < THRESHOLD)
              complete(s"You are really who you want to be")
            else
              complete(s"STOP!!!!!!!!")
          }
      }
    }
  }

  private def getTorchVector(filePath: String): Vector = {
    val luaScriptDir = "/home/markus/techfest/vgg_face_torch"
    val output = Process("th demo.lua " + filePath, new File(luaScriptDir)).!!
    output.split("\n").toList.dropRight(1).map(_.toDouble)
  }

  def check(userName: String, filePath: String): (String, Double) = {
    // 1. calculate vector for image
    val vector = getTorchVector(filePath: String)

    // get all from db
    val list = getAll.get

    // find closest vector
    val res = list.foldLeft("", 999999.0){
      case ((name, currentBestDistance), (id, name2, vec)) =>
        val d = dist(vector, vec)
        if( d < currentBestDistance) (name2, d)
        else (name, currentBestDistance)
    }
    logger.info(s"detected ${res._1} with distance ${res._2} ")
    res
  }

  def dist(vec1: Vector, vec2: Vector): Double = {
    vec1.zip(vec2).foldLeft(0.0) {
      case (sum, (x, y)) => sum + (x - y) * (x - y)
    }
  }
}

object FlixFace extends App with Service with db {
  override implicit val system = ActorSystem()
  override implicit val executor = system.dispatcher
  override implicit val materializer = ActorMaterializer()

  override val config = ConfigFactory.load()
  override val logger = Logging(system, getClass)

  initDB()

  /*
  addPerson("test", List(2.1,2.2,4.7))
  addPerson("markus", List(0.0,0.0,0.2,47.47))

  logger.info(getAll.get mkString ",")
  */

  logger.info(dist(List(2.1,2.2,2.5), List(2.1,2.2,2.5)).toString)
  Http().bindAndHandle(routes, config.getString("http.interface"), config.getInt("http.port"))
}
