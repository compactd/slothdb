import SlothField from '../../../src/decorators/SlothField'

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
  const object = {
    foobar: 'default',
    sloth: { updatedProps: {}, props: {} }
  }

  SlothField()(object, 'foobar')

  expect(object.foobar).toBe('default')
})

test('SlothField - updated updatedProps', () => {
  const object = {
    foobar: '',
    sloth: { updatedProps: {}, props: {} }
  }

  SlothField()(object, 'foobar')
  object.foobar = 'ouch'

  expect((object as any).sloth.updatedProps.foobar).toBe('ouch')
  expect((object as any).sloth.props.foobar).toBeUndefined()
  expect(object.foobar).toBe('ouch')
})
