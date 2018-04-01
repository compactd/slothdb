import BaseEntity from '../../src/models/BaseEntity'
import SlothEntity from '../../src/decorators/SlothEntity'
import SlothURI from '../../src/decorators/SlothURI'
import SlothField from '../../src/decorators/SlothField'

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
