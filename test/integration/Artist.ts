import BaseEntity from '../../src/models/BaseEntity'
import SlothDatabase from '../../src/models/SlothDatabase'
import SlothEntity from '../../src/decorators/SlothEntity'
import SlothURI from '../../src/decorators/SlothURI'
import SlothField from '../../src/decorators/SlothField'
import Album from './Album'
import SlothRel from '../../src/decorators/SlothRel'
import Track from './Track'

export interface ArtistSchema {
  _id: string
  name: string
  age: number
}

@SlothEntity('artists')
class Artist extends BaseEntity<ArtistSchema> {
  @SlothField() name: string = ''

  @SlothURI('library', 'name')
  _id: string = ''

  @SlothRel({ hasMany: () => Album })
  albums: () => Album

  @SlothRel({ hasMany: () => Track })
  tracks: () => Track
}

export default new SlothDatabase<ArtistSchema, Artist>(Artist)
