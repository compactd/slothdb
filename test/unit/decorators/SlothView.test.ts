import { SlothView } from '../../../src/slothdb'
import emptyProtoData from '../../utils/emptyProtoData'

test('SlothView - fails without a decorator', () => {
  const obj = { foo: 'bar' }
  expect(() => SlothView(() => ({}))(obj, 'foo')).toThrowError(
    /Required SlothView/
  )
})

test('SlothView - generates a working function for es5 view', () => {
  const proto = emptyProtoData({})
  const obj = { __protoData: proto }

  Reflect.defineProperty(obj, 'foo', { get: () => 42 })

  SlothView(function(doc: { bar: string }, emit) {
    emit(doc.bar)
  })(obj, 'foo')

  expect(proto.views).toHaveLength(1)

  const { views } = proto
  const [{ id, name, code }] = views

  expect(name).toBe('by_foo')

  let fun: Function

  const emit = jest.fn()

  // tslint:disable-next-line:no-eval
  eval('fun = ' + code)
  fun({ bar: 'barz' })

  expect(emit).toHaveBeenCalledWith('barz')
})
