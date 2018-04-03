import BaseEntity from '../../src/models/BaseEntity'
import SlothDatabase from '../../src/models/SlothDatabase'
import SlothEntity from '../../src/decorators/SlothEntity'
import SlothURI from '../../src/decorators/SlothURI'
import SlothField from '../../src/decorators/SlothField'
import SlothRel from '../../src/decorators/SlothRel'
import Artist from './Artist'

export interface AlbumSchema {
  _id: string
  name: string
  artist: string
}

@SlothEntity('artists')
class Album extends BaseEntity<AlbumSchema> {
  @SlothField() name: string = ''
  @SlothRel({ belongsTo: () => Artist, cascade: true })
  artist: string = ''

  @SlothURI('library', 'artist', 'name')
  _id: string = ''
}

export default new SlothDatabase<AlbumSchema, Album>(Album)
