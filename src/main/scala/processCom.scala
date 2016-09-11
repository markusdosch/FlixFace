import java.io._

import Implicits._
import akka.event.LoggingAdapter

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.concurrent.{Await, Future, Promise}
import scala.sys.process.{ProcessIO, _}
/**
  * Created by johan on 11.09.2016.
  */
object Implicits {

  implicit class Expiry(val d: Deadline) extends AnyVal {
    def expiring(f: => Unit) =
      Future(Await.ready(Promise().future, d.timeLeft)) onComplete (_ => f)
  }

}


trait processCom extends types {

  def logger: LoggingAdapter

  var outputStream: OutputStream = new OutputStream {
    override def write(b: Int): Unit = ???
  }
  var inputStream: InputStream= new InputStream {
    override def read(): Int = ???
  }


  def initFaceDetection(): Unit = {
    Seq("th", "/mnt/vggface/demo.lua") run new ProcessIO(writeJob, readJob, errJob)
    2 seconds fromNow expiring {
      writeToStream("/mnt/vggface/ak.png")
    }
  }

  def writeToStream(input: String): Vector = {

    logger.info("issues another command"+input)
    logger.info("bla")

    outputStream.write((input+"\n").getBytes())
    outputStream.flush()

    val inputStreamReader = new InputStreamReader(inputStream)
    val bufferedReader = new BufferedReader(inputStreamReader)
    var count = 0
    val res = Iterator continually bufferedReader.readLine() takeWhile{
      byte: String => {
        inputStream.available() > 0
      }
    }

    val res2 = res.toList.dropRight(1).map(_.toDouble)
    logger.info("no more blocking"+res2.length.toString)

    res2
  }

  def readJob(in: InputStream) {
    inputStream = in
    // do smthing with in
  }
  def writeJob(out: OutputStream) {
    outputStream = out
  }
  def errJob(err: InputStream) {
    // do smthing with err
  }
}



