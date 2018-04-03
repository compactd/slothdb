import SlothRel from '../../../src/decorators/SlothRel'

test('SlothRel - fails on top of another decorator', () => {
  const obj = {}

  Reflect.defineProperty(obj, 'foo', { get: () => 'bar' })

  expect(() => SlothRel({} as any)(obj, 'foo')).toThrowError(
    /Cannot apply SlothRel/
  )
})
