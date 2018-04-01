import BaseEntity from './models/BaseEntity'
import SlothEntity from './decorators/SlothEntity'
import SlothURI from './decorators/SlothURI'
import SlothField from './decorators/SlothField'

export interface AuthorSchema {
  _id: string
  name: string
}

@SlothEntity('authors')
export default class Author extends BaseEntity<AuthorSchema> {
  @SlothField() name: string = ''

  @SlothURI('authors', 'name')
  _id: string = ''
}

const author = new Author('fff')
const de = author.name
