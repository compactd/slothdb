import {
  BaseEntity,
  SlothDatabase,
  SlothEntity,
  SlothURI,
  SlothField,
  SlothRel,
  SlothView,
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

export enum TrackViews {
  ByArtist = 'by_artist',
  ByAlbum = 'views/by_album'
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

  @SlothView((doc: TrackSchema, emit) => emit(doc.album))
  @SlothRel({ belongsTo: () => Album })
  album: string = ''

  rels: {
    artist
    album
  }
}

export default new SlothDatabase<TrackSchema, TrackEntity, TrackViews>(
  TrackEntity
)
