import SlothURI from '../../../src/decorators/SlothURI'
import slug from 'slug'

test('SlothURI - returns correct url', () => {
  const object = {
    _id: '',
    valueInProp: '',
    updatedValue: '',
    defaultedValue: 'ouch',
    sloth: {
      props: {
        valueInProp: 'foobar'
      },
      updatedProps: {
        updatedValue: 'barbarz'
      },
      slug
    }
  }

  SlothURI<{
    valueInProp: string
    updatedValue: string
    defaultedValue: string
  }>('objects', 'valueInProp', 'updatedValue', 'defaultedValue')(object, '_id')

  expect(object._id).toBe('objects/foobar/barbarz/ouch')
})
