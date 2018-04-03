import SlothEntity from '../../src/decorators/SlothEntity'
import BaseEntity from '../../src/models/BaseEntity'
import SlothField from '../../src/decorators/SlothField'
import SlothRel from '../../src/decorators/SlothRel'
import { belongsToMapper } from '../../src/utils/relationMappers'
import SlothDatabase from '../../src/models/SlothDatabase'
import SlothURI from '../../src/decorators/SlothURI'

export interface TrackSchema {
  _id: string
  name: string
  number: string
  artist: string
  album: string
}
const artist = belongsToMapper(() => Artist, 'album')
const album = belongsToMapper(() => Album, 'artist')

@SlothEntity('tracks')
export class TrackEntity extends BaseEntity<TrackSchema> {
  @SlothURI('library', 'album', 'number', 'name')
  _id: string = ''

  @SlothField() name: string = 'Track Name'

  @SlothField() number: string = '00'

  @SlothRel({ belongsTo: () => Artist })
  artist: string = ''

  @SlothRel({ belongsTo: () => Album })
  album: string = ''

  rels: {
    artist
    album
  }
}

export default new SlothDatabase<TrackSchema, TrackEntity>(TrackEntity)
