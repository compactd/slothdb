import PouchDB from 'pouchdb'
import {
  SlothDatabase,
  SlothURI,
  BaseEntity,
  SlothEntity,
  SlothField
} from '../../src/slothdb'

PouchDB.plugin(require('pouchdb-adapter-memory'))

describe('docKeys', () => {
  let prefix: string

  const factory = (pre: string) => (name: string) =>
    new PouchDB(pre + name, { adapter: 'memory' })

  interface IFoo {
    _id: string
    name: string
    bar: string
  }

  @SlothEntity('foos')
  class FooEntity extends BaseEntity<IFoo> {
    @SlothURI('foos', 'name', 'bar')
    _id: string
    @SlothField() name: string
    @SlothField('barz') bar: string
  }

  const Foo = new SlothDatabase<IFoo, FooEntity>(FooEntity)

  beforeEach(() => {
    prefix = '__' + Date.now().toString(16) + '_'
  })

  test('getProps maps props', () => {
    const doc = Foo.create(factory(prefix), { name: 'Foo Bar', bar: 'barz' })

    expect(doc.getProps()).toEqual({
      _id: 'foos/foo-bar/barz',
      name: 'Foo Bar',
      bar: 'barz'
    })
  })

  test('getProps maps props from doc', () => {
    const doc = Foo.create(factory(prefix), {
      name: 'Foo Bar',
      barz: 'barz'
    } as any)

    expect(doc.getProps()).toEqual({
      _id: 'foos/foo-bar/barz',
      name: 'Foo Bar',
      bar: 'barz'
    })
  })

  test('getDocument maps document', () => {
    const doc = Foo.create(factory(prefix), { name: 'Foo Bar', bar: 'barz' })

    expect(doc.getDocument()).toEqual({
      _id: 'foos/foo-bar/barz',
      name: 'Foo Bar',
      barz: 'barz'
    })
  })

  test('getDocument maps document from doc', () => {
    const doc = Foo.create(factory(prefix), {
      name: 'Foo Bar',
      barz: 'barz'
    } as any)

    expect(doc.getDocument()).toEqual({
      _id: 'foos/foo-bar/barz',
      name: 'Foo Bar',
      barz: 'barz'
    })
  })
})
