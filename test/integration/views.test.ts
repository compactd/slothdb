import Artist from './Artist'
import Track, { TrackViews } from './Track'
import PouchDB from 'pouchdb'
import delay from '../utils/delay'
import {
  SlothEntity,
  BaseEntity,
  SlothURI,
  SlothField,
  SlothDatabase,
  SlothIndex
} from '../../src/slothdb'

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

  test('doesnt recreate views', async () => {
    const tracks = factory('tracks')
    const { _rev } = await tracks.get('_design/views')
    await Track.initSetup(factory)
    expect(await tracks.get('_design/views')).toMatchObject({
      views: { by_album: {} },
      _rev
    })
  })

  test('creates views on a new database when querying docs', async () => {
    const prefix = Date.now().toString(26) + '_'

    const factory = (name: string) =>
      new PouchDB(prefix + name, { adapter: 'memory' })

    const docs = await Track.queryDocs(factory, TrackViews.ByAlbum)
    expect(docs).toHaveLength(0)
  })

  test('creates views on a new database when querying keys', async () => {
    const prefix = Date.now().toString(26) + '_'

    const factory = (name: string) =>
      new PouchDB(prefix + name, { adapter: 'memory' })

    const docs = await Track.queryKeys(factory, TrackViews.ByAlbum)
    expect(docs).toHaveLength(0)
  })

  test('creates views on a new database when querying keys ids', async () => {
    const prefix = Date.now().toString(26) + '_'

    const factory = (name: string) =>
      new PouchDB(prefix + name, { adapter: 'memory' })

    const docs = await Track.queryKeysIDs(factory, TrackViews.ByAlbum)
    expect(docs).toEqual({})
  })

  test('query by view', async () => {
    const docs = await Track.queryDocs(
      factory,
      TrackViews.ByAlbum,
      'library/flatbush-zombies'
    )

    expect(docs).toHaveLength(2)
  })
  test('queryKeys', async () => {
    const docs = await Track.queryKeys(
      factory,
      TrackViews.ByAlbum,
      'library/flatbush-zombies'
    )

    expect(docs.length).toBe(2)
    expect(docs).toEqual([
      'library/flatbush-zombies/betteroffdead',
      'library/flatbush-zombies/betteroffdead-2'
    ])
  })
  test('queryKeysIDs', async () => {
    const docs = await Track.queryKeysIDs(
      factory,
      TrackViews.ByAlbum,
      'library/flatbush-zombies'
    )
    expect(docs).toEqual({
      'library/flatbush-zombies/betteroffdead':
        'library/flatbush-zombies/betteroffdead/12/palm-trees',
      'library/flatbush-zombies/betteroffdead-2':
        'library/flatbush-zombies/betteroffdead-2/12/not-palm-trees'
    })
  })
})

describe('views and docKeys', () => {
  const prefix = Date.now().toString(26) + '_'

  const factory = (name: string) =>
    new PouchDB(prefix + name, { adapter: 'memory' })

  @SlothEntity('foos')
  class FooEnt extends BaseEntity<any> {
    @SlothURI('foos', 'name')
    _id = ''

    @SlothIndex()
    @SlothField('not_name')
    name = ''
  }

  const Foo = new SlothDatabase<any, any, string>(FooEnt)

  test('uses docKeys', async () => {
    await Foo.put(factory, { name: 'foo' })
    await Foo.put(factory, { name: 'foobar' })
    await Foo.put(factory, { name: 'bar' })

    const keys = await Foo.queryKeys(
      factory,
      'views/by_not_name',
      'foo',
      'foo\uffff'
    )

    expect(keys).toEqual(['foo', 'foobar'])
  })
})
