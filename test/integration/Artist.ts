import BaseEntity from '../../src/models/BaseEntity'
import SlothDatabase from '../../src/models/SlothDatabase'
import SlothEntity from '../../src/decorators/SlothEntity'
import SlothURI from '../../src/decorators/SlothURI'
import SlothField from '../../src/decorators/SlothField'

export interface ArtistSchema {
  _id: string
  name: string
  age: number
}

@SlothEntity('authors')
class Artist extends BaseEntity<ArtistSchema> {
  @SlothField() name: string = ''

  @SlothURI('library', 'name')
  _id: string = ''
}

export default new SlothDatabase<ArtistSchema, Artist>(Artist)
