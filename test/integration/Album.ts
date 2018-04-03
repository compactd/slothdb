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
import Track from './Track'

export interface AlbumSchema {
  _id: string
  name: string
  artist: string
}

@SlothEntity('albums')
class Album extends BaseEntity<AlbumSchema> {
  @SlothField() name: string = ''
  @SlothRel({ belongsTo: () => Artist, cascade: true })
  artist: string = ''

  @SlothURI('library', 'artist', 'name')
  _id: string = ''

  tracks: () => Track

  rels = {
    artist: belongsToMapper<Artist>(this, 'artist')
  }
}

export default new SlothDatabase<AlbumSchema, Album>(Album)
