import {
  BaseEntity,
  SlothDatabase,
  SlothEntity,
  SlothURI,
  SlothField,
  SlothRel
} from '../../src/slothdb'

import Track from './Track'
import Album from './Album'

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
