import slick.driver.SQLiteDriver.api._
import slick.lifted.{ProvenShape, ForeignKeyQuery}

class Persons(tag: Tag)
  extends Table[(Int, String, String)](tag, "PERSONS") {

  // This is the primary key column:
  def id = column[Int]("PERSON_ID", O.PrimaryKey, O.AutoInc)
  def name = column[String]("NAME")
  def vector = column[String]("VECTOR")

  def * = (id, name, vector)
}
