import Artist from './Artist'
import Track, { TrackViews } from './Track'
import PouchDB from 'pouchdb'
import delay from '../utils/delay'
import {
  SlothDatabase,
  SlothURI,
  BaseEntity,
  SlothEntity,
  SlothField
} from '../../src/slothdb'

PouchDB.plugin(require('pouchdb-adapter-memory'))

describe('nested objects', () => {
  const prefix = Date.now().toString(26) + '_'

  const factory = (name: string) =>
    new PouchDB(prefix + name, { adapter: 'memory' })

  interface IFoo {
    _id: string
    name: string
    foo: {
      bar: string
      barz: string
    }
  }

  @SlothEntity('foos')
  class FooEntity extends BaseEntity<IFoo> {
    @SlothURI('foos', 'name')
    _id: string
    @SlothField() name: string
    @SlothField()
    foo: {
      bar: string
      barz: string
    }
  }

  const Foo = new SlothDatabase<IFoo, FooEntity>(FooEntity)

  test('put a document with a nested doc', async () => {
    const foo = await Foo.put(factory, {
      name: 'Foobar',
      foo: {
        bar: 'foobar',
        barz: 'foobarbarz'
      }
    })
    expect(await factory('foos').get('foos/Foobar')).toMatchObject({
      name: 'Foobar',
      foo: {
        bar: 'foobar',
        barz: 'foobarbarz'
      }
    })
  })

  test('get a document with a nested doc', async () => {
    const { foo } = await Foo.findById(factory, 'foos/Foobar')
    expect(foo).toEqual({
      bar: 'foobar',
      barz: 'foobarbarz'
    })
  })

  test('update a document with a nested doc', async () => {
    const foo = await Foo.findById(factory, 'foos/Foobar')

    foo.foo = { bar: 'bar', barz: 'barz' }

    expect(foo.foo).toEqual({
      bar: 'bar',
      barz: 'barz'
    })

    await foo.save()

    expect(await factory('foos').get('foos/Foobar')).toMatchObject({
      name: 'Foobar',
      foo: {
        bar: 'bar',
        barz: 'barz'
      }
    })
  })
})
