import SlothField from '../../../src/decorators/SlothField'
import emptyProtoData from '../../utils/emptyProtoData'

test('SlothField - fails on a defined property using get', () => {
  const object = {}

  Reflect.defineProperty(object, 'foo', {
    get: () => {
      return 'bar'
    }
  })

  expect(() => SlothField()(object, 'foo')).toThrowError(/Cannot apply/)
})

test('SlothField - fails on a defined property using set', () => {
  const object = {}

  Reflect.defineProperty(object, 'foo', {
    set: () => {
      return 'bar'
    }
  })

  expect(() => SlothField()(object, 'foo')).toThrowError(/Cannot apply/)
})

test('SlothField - uses updatedProps first', () => {
  const object = {
    foobar: '',
    sloth: { updatedProps: { foobar: 'barz' } }
  }

  SlothField()(object, 'foobar')

  expect(object.foobar).toBe('barz')

  const object2 = {
    foobar: '',
    sloth: { updatedProps: { foobar: undefined }, props: { foobar: 'barbarz' } }
  }

  SlothField()(object2, 'foobar')

  expect(object2.foobar).toBeUndefined()
})

test('SlothField - uses props if not updated', () => {
  const object = {
    foobar: '',
    sloth: { updatedProps: {}, props: { foobar: 'barbarz' } }
  }

  SlothField()(object, 'foobar')

  expect(object.foobar).toBe('barbarz')

  const object2 = {
    foobar: 'bar',
    sloth: { updatedProps: {}, props: { foobar: undefined } }
  }

  SlothField()(object2, 'foobar')

  expect(object2.foobar).toBeUndefined()
})

test('SlothField - uses default value', () => {
  const object: any = {
    foobar: '',
    sloth: {
      defaultProps: {},
      updatedProps: {}
    },
    __protoData: emptyProtoData({
      fields: [{ key: 'foobar', docKey: 'foobar' }]
    }),
    props: null
  }

  SlothField()(object, 'foobar')
  object.foobar = 'default'

  expect(object.foobar).toBe('default')

  object.sloth.props = {}
  object.foobar = 'foobar'

  expect(object.foobar).toBe('foobar')
  object.foobar = null

  expect(object.foobar).toBe('default')
})

test('SlothField - update updatedProps', () => {
  const object = {
    foobar: '',
    sloth: { updatedProps: {}, props: {}, defaultProps: {} }
  }

  SlothField()(object, 'foobar')
  object.foobar = 'ouch'

  expect((object as any).sloth.updatedProps.foobar).toBe('ouch')
  expect((object as any).sloth.props.foobar).toBeUndefined()
  expect(object.foobar).toBe('ouch')
})
