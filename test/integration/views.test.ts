import Artist from './Artist'
import Track, { TrackViews } from './Track'
import PouchDB from 'pouchdb'
import delay from '../utils/delay'

PouchDB.plugin(require('pouchdb-adapter-memory'))

describe('views', () => {
  const prefix = Date.now().toString(26) + '_'

  const factory = (name: string) =>
    new PouchDB(prefix + name, { adapter: 'memory' })

  beforeAll(async () => {
    await Track.put(factory, {
      name: 'Palm Trees',
      artist: 'library/flatbush-zombies',
      album: 'library/flatbush-zombies/betteroffdead',
      number: '12'
    })
    await Track.put(factory, {
      name: 'Not Palm Trees',
      artist: 'library/not-flatbush-zombies',
      album: 'library/flatbush-zombies/betteroffdead-2',
      number: '12'
    })
    await Track.put(factory, {
      name: 'Mocking Bird',
      artist: 'library/eminem',
      album: 'library/eminem/some-album-i-forgot',
      number: '12'
    })
  })

  test('create views', async () => {
    await Track.initSetup(factory)
    expect(await factory('tracks').get('_design/views')).toMatchObject({
      views: { by_album: {} }
    })
  })

  test('query by view', async () => {
    const docs = await Track.queryDocs(
      factory,
      TrackViews.ByAlbum,
      'library/flatbush-zombies'
    )

    expect(docs.length).toBe(2)
  })
})
