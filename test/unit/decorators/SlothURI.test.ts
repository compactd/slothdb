import SlothURI from '../../../src/decorators/SlothURI'
import emptyProtoData from '../../utils/emptyProtoData'
import slug from 'slug'

test('SlothURI - returns correct url', () => {
  const object = {
    _id: '',
    valueInProp: 'notfoobar',
    updatedValue: 'notbarbarz',
    sloth: { slug }
  }

  SlothURI<{
    valueInProp: string
    updatedValue: string
  }>('objects', 'valueInProp', 'updatedValue')(object, '_id')

  expect(object._id).toBe('objects/notfoobar/notbarbarz')
})

test('SlothURI - pushes to uris', () => {
  const object = {
    _id: '',
    sloth: {
      props: {},
      updatedProps: {}
    }
  }

  // tslint:disable-next-line:variable-name
  const __protoData = {
    uris: [],
    fields: []
  }

  SlothURI<{
    foo: string
    bar: string
  }>('objects', 'foo', 'bar')({ __protoData }, '_id')

  expect(__protoData.uris).toEqual([
    {
      name: '_id',
      prefix: 'objects',
      propsKeys: ['foo', 'bar']
    }
  ])

  expect(__protoData.fields).toEqual([{ key: '_id' }])
})

test('SlothURI - throws if on top of another decorator', () => {
  const object = {}

  Reflect.defineProperty(object, '_id', { get: () => 'foo' })
  Reflect.defineProperty(object, 'bar', { set: () => null })

  expect(() =>
    SlothURI<{
      foo: string
      bar: string
    }>('objects', 'foo', 'bar')(object, '_id')
  ).toThrowError(/Cannot apply/)

  expect(() =>
    SlothURI<{
      foo: string
      bar: string
    }>('objects', 'foo', 'bar')(object, 'bar')
  ).toThrowError(/Cannot apply/)
})

test('SlothURI - throw when updating', () => {
  const object = {
    _id: '',
    sloth: {
      props: {},
      updatedProps: {}
    }
  }

  const desc = {
    uris: []
  }

  SlothURI<{
    foo: string
    bar: string
  }>('objects', 'foo', 'bar')(object, '_id')

  object._id = ''

  expect(() => (object._id = 'bar')).toThrow(/_id is not writable/)
})

test('SlothURI - uses relations', () => {
  const object = {
    _id: '',
    foo: 'foos/foo/bar',
    bar: 'foobar',
    sloth: {
      props: {},
      updatedProps: {},
      slug: str => str
    },
    __protoData: emptyProtoData({
      rels: [
        {
          belongsTo: {} as any,
          cascade: true,
          key: 'foo'
        }
      ]
    })
  }

  SlothURI<{
    foo: string
    bar: string
  }>('objects', 'foo', 'bar')(object, '_id')

  expect(object._id).toBe('objects/foo/bar/foobar')
})

test('SlothURI - throws error if no value', () => {
  const object = {
    _id: '',
    bar: 'foobar',
    sloth: {
      props: {},
      updatedProps: {},
      slug: str => str
    },
    __protoData: emptyProtoData({
      rels: [
        {
          belongsTo: {} as any,
          cascade: true,
          key: 'foo'
        }
      ]
    })
  }

  SlothURI<{
    foo: string
    bar: string
  }>('objects', 'foo', 'bar')(object, '_id')

  expect(() => object._id).toThrowError(/Key foo has no value/)
})

test('SlothURI - throws error if URI is invalid', () => {
  const object = {
    _id: '',
    foo: 'foo',
    bar: 'foobar',
    sloth: {
      props: {},
      updatedProps: {},
      slug: str => str
    },
    __protoData: emptyProtoData({
      rels: [
        {
          belongsTo: {} as any,
          cascade: true,
          key: 'foo'
        }
      ]
    })
  }

  SlothURI<{
    foo: string
    bar: string
  }>('objects', 'foo', 'bar')(object, '_id')

  expect(() => object._id).toThrowError(/URI 'foo' is invalid/)
})
