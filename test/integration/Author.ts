import BaseEntity from '../../src/models/BaseEntity'
import SlothDatabase from '../../src/models/SlothDatabase'
import SlothEntity from '../../src/decorators/SlothEntity'
import SlothURI from '../../src/decorators/SlothURI'
import SlothField from '../../src/decorators/SlothField'
import localPouchFactory from '../../src/utils/localPouchFactory'

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

export default new SlothDatabase<AuthorSchema, Author, typeof Author>(Author)
