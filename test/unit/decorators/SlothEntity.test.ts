import SlothEntity from '../../../src/decorators/SlothEntity'
import localPouchFactory from '../../utils/localPouchFactory'
import emptyProtoData from '../../utils/emptyProtoData'

test('SlothEntity - attaches a sloth object to class', () => {
  // tslint:disable-next-line:no-empty
  const constr = () => {}

  const wrapper = SlothEntity('foo')(constr as any)
  const context: any = {}

  wrapper.call(context, localPouchFactory, 'foos/foo')

  expect(context.sloth).toBeDefined()
})

test('SlothEntity - set the name using the passed argument', () => {
  // tslint:disable-next-line:no-empty
  const constr = () => {}

  const wrapper = SlothEntity('foo')(constr as any)
  const context: any = {}

  wrapper.call(context, localPouchFactory, 'foos/foo')

  expect(context.sloth).toBeDefined()
  expect(context.sloth.name).toBe('foo')
})

test('SlothEntity - set the props when props are passed', () => {
  // tslint:disable-next-line:no-empty
  const constr = () => {}

  const wrapper = SlothEntity('foo')(constr as any)
  const context: any = {
    __protoData: emptyProtoData({ fields: [{ key: 'foo', docKey: 'foo' }] })
  }

  wrapper.call(context, localPouchFactory, { foo: 'bar' })

  expect(context.sloth).toBeDefined()
  expect(context.sloth.name).toBe('foo')
  expect(context.sloth.props.foo).toBe('bar')
  expect(context.sloth.docId).toBeUndefined()
})
test('SlothEntity - can use keys', () => {
  // tslint:disable-next-line:no-empty
  const constr = () => {}

  const wrapper = SlothEntity('foo')(constr as any)
  const context: any = {
    __protoData: emptyProtoData({ fields: [{ key: 'foo', docKey: 'barz' }] })
  }

  wrapper.call(context, localPouchFactory, { foo: 'bar' })

  expect(context.sloth).toBeDefined()
  expect(context.sloth.name).toBe('foo')
  expect(context.sloth.props.barz).toBe('bar')
  expect(context.sloth.docId).toBeUndefined()
})
test('SlothEntity - can use docKeys', () => {
  // tslint:disable-next-line:no-empty
  const constr = () => {}

  const wrapper = SlothEntity('foo')(constr as any)
  const context: any = {
    __protoData: emptyProtoData({ fields: [{ key: 'foo', docKey: 'barz' }] })
  }

  wrapper.call(context, localPouchFactory, { barz: 'bar' })

  expect(context.sloth).toBeDefined()
  expect(context.sloth.name).toBe('foo')
  expect(context.sloth.props.barz).toBe('bar')
  expect(context.sloth.docId).toBeUndefined()
})
test('SlothEntity - throws an error when both keys and docKeys maps are passed', () => {
  // tslint:disable-next-line:no-empty
  const constr = () => {}

  const wrapper = SlothEntity('foo')(constr as any)
  const context: any = {
    __protoData: emptyProtoData({ fields: [{ key: 'foo', docKey: 'barz' }] })
  }

  expect(() =>
    wrapper.call(context, localPouchFactory, { barz: 'bar', foo: 'barz' })
  ).toThrowError(/Both 'foo' and 'barz' exist/)
})
test('SlothEntity - eventually set docId when props are passed with _id', () => {
  // tslint:disable-next-line:no-empty
  const constr = () => {}

  const wrapper = SlothEntity('foo')(constr as any)
  const context: any = {
    __protoData: emptyProtoData({
      fields: [{ key: 'foo', docKey: 'foo' }, { key: '_id', docKey: '_id' }]
    })
  }

  wrapper.call(context, localPouchFactory, { _id: 'foobar', foo: 'bar' })

  expect(context.sloth).toBeDefined()
  expect(context.sloth.name).toBe('foo')
  expect(context.sloth.props.foo).toBe('bar')
  expect(context.sloth.updatedProps).toEqual({})
  expect(context.sloth.docId).toBe('foobar')
})
test('SlothEntity - set the docId only when string is passed', () => {
  // tslint:disable-next-line:no-empty
  const constr = () => {}

  const wrapper = SlothEntity('foo')(constr as any)
  const context: any = {}

  wrapper.call(context, localPouchFactory, 'foobar')

  expect(context.sloth).toBeDefined()
  expect(context.sloth.name).toBe('foo')
  expect(context.sloth.props).toEqual({})
  expect(context.sloth.updatedProps).toEqual({})
  expect(context.sloth.docId).toBe('foobar')
})
