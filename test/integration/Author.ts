import {
  BaseEntity,
  SlothDatabase,
  SlothEntity,
  SlothURI,
  SlothField,
  SlothRel
} from '../../src/slothdb'

export interface AuthorSchema {
  _id: string
  name: string
  age: number
}

@SlothEntity('authors')
class Author extends BaseEntity<AuthorSchema> {
  @SlothField() name: string = ''

  @SlothURI('authors', 'name')
  _id: string = ''

  @SlothField() age = 40
}

export default new SlothDatabase<AuthorSchema, Author>(Author)
