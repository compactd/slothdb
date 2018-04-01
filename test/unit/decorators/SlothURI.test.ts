import SlothURI from '../../../src/decorators/SlothURI'
import slug from 'slug'

test('SlothURI - returns correct url', () => {
  const object = {
    _id: '',
    valueInProp: 'notfoobar',
    updatedValue: 'notbarbarz',
    defaultedValue: 'ouch',
    sloth: {
      props: {
        valueInProp: 'foobar',
        updatedValue: 'notbarbarz'
      },
      updatedProps: {
        updatedValue: 'barbarz'
      },
      slug,
      uris: []
    }
  }

  SlothURI<{
    valueInProp: string
    updatedValue: string
    defaultedValue: string
  }>('objects', 'valueInProp', 'updatedValue', 'defaultedValue')(object, '_id')

  expect(object._id).toBe('objects/foobar/barbarz/ouch')
})

test('SlothURI - pushes to uris', () => {
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
  }>('objects', 'foo', 'bar')({ desc }, '_id')

  expect(desc.uris).toEqual([
    {
      name: '_id',
      prefix: 'objects',
      propsKeys: ['foo', 'bar']
    }
  ])
})
