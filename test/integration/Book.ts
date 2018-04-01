import SlothDocument from '../../src/models/SlothDocument'
import Author from './Author'
import slothField from '../../src/decorators/slothField'
import slothURI from '../../src/decorators/slothURI'
import slothCollection from '../../src/decorators/slothCollection'
import manyToOne from '../../src/decorators/manyToOne'

export interface BookSchema {
  _id: string
  title: string
  author: string
  date: number
}

@slothCollection('books')
export default class Book extends SlothDocument<BookSchema> {
  @slothField() title: string

  @slothURI('books/:author/:title') _id: string

  @manyToOne(Author, {
    shiftId: true
  })
  @slothField()
  author: string
}
