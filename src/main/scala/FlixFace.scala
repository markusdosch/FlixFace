import java.io._

import akka.actor.ActorSystem
import akka.event.{Logging, LoggingAdapter}
import akka.http.scaladsl.Http
import akka.http.scaladsl.model._
import akka.stream.{ActorMaterializer, Materializer}
import com.typesafe.config.{Config, ConfigFactory}

import scala.concurrent.ExecutionContextExecutor
import scala.sys.process.Process
import akka.http.scaladsl.model.headers._
import akka.http.scaladsl.server.Directives._

trait types {
  type Vector = List[Double]
}

trait Service extends types with db {
  implicit val system: ActorSystem

  implicit def executor: ExecutionContextExecutor

  implicit val materializer: Materializer

  def config: Config

  val logger: LoggingAdapter
  val THRESHOLD = 0.9

  val routes =
    respondWithHeader(
      RawHeader("Access-Control-Allow-Origin", "*")
    ) {
      pathPrefix("static") {
        // optionally compresses the response with Gzip or Deflate
        // if the client accepts compressed responses
        encodeResponse {
          // serve up static content from a JAR resource
          getFromResourceDirectory("static")
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
            val (name, res) = check(file.toString)
            file.delete()

            if (res > THRESHOLD)
              complete(s"You are $name with confidence $res")
            else
              complete(s"STOP! (could be $name with confidence $res)")
        }
      }
    }

  private def getTorchVector(filePath: String): Vector = {
    val luaScriptDir = "/home/markus/techfest/vgg_face_torch"
    val output = Process("th demo.lua " + filePath, new File(luaScriptDir)).!!
    output.split("\n").toList.dropRight(1).map(_.toDouble)
  }

  def check(filePath: String): (String, Double) = {
    // 1. calculate vector for image
    val vector = getTorchVector(filePath: String)

    // get all from db
    val list = getAll.get

    // find closest vector
    val res = list.foldLeft("", 0.0) {
      case ((name, currentHighestConfidence), (id, name2, vec)) =>
        val d = confidence(dist(vector, vec))
        if (d > currentHighestConfidence) (name2, d)
        else (name, currentHighestConfidence)
    }
    logger.info(s"detected ${res._1} with distance ${res._2} ")
    res
  }

  def dist(vec1: Vector, vec2: Vector): Double = {
    vec1.zip(vec2).foldLeft(0.0) {
      case (sum, (x, y)) => sum + (x - y) * (x - y)
    }
  }

  def confidence(x: Double): Double = {
    Math.exp(-x)
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

  logger.info(dist(List(2.1, 2.2, 2.5), List(2.1, 2.2, 2.5)).toString)
  Http().bindAndHandle(routes, config.getString("http.interface"), config.getInt("http.port"))
}
