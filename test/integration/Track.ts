import {
  BaseEntity,
  SlothDatabase,
  SlothEntity,
  SlothURI,
  SlothField,
  SlothRel,
  belongsToMapper
} from '../../src/slothdb'
import Artist from './Artist'
import Album from './Album'

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
