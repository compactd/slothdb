import SlothRel from '../../../src/decorators/SlothRel'

test('SlothRel - fails on top of another decorator', () => {
  const obj = {}

  Reflect.defineProperty(obj, 'foo', { get: () => 'bar' })
  Reflect.defineProperty(obj, 'bar', { set: () => 'bar' })
  Reflect.defineProperty(obj, 'barz', { value: 42 })

  expect(() => SlothRel({} as any)(obj, 'foo')).toThrowError(
    /Cannot apply SlothRel/
  )
  expect(() => SlothRel({} as any)(obj, 'bar')).toThrowError(
    /Cannot apply SlothRel/
  )

  SlothRel({} as any)(obj, 'barz')
})
