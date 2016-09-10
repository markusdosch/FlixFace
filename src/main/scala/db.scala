
import akka.event.LoggingAdapter
import slick.driver.SQLiteDriver.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}
import scala.util.Try

trait db extends types {
  val logger: LoggingAdapter

  val db = Database.forURL("jdbc:sqlite:vecs.db", driver = "org.sqlite.JDBC")
  val persons = TableQuery[Persons]

  def initDB() = {
    try {

      val setupAction: DBIO[Unit] = persons.schema.create

      val setupFuture: Future[Unit] = db.run(setupAction)
      val f = setupFuture.map { _ =>
        logger.info("schema created")
        "success"
      }.recover {
        case ex: Exception =>
          logger.info("table already exists")
          "nothing here"
      }
      Await.result(f, Duration.Inf)

    }
  }

  def addPerson(name: String, vector: Vector): Try[Unit] ={
    val insertAction = DBIO.seq(
      persons += (1, name, vector.mkString(" "))
    )

    val f = db.run(insertAction)

    Try(Await.result(f, Duration.Inf))
  }

  def getAll: Try[Seq[(Int, String, Vector)]] ={
    val query = persons.map(p => (p.id,p.name,p.vector))

    val f = db.run(query.result)

    Try{
      Await.result(f, Duration.Inf).map {
        a: (Int, String, String) => (a._1, a._2, a._3.split(" ").map(_.toDouble).toList)
      }
    }
  }
}