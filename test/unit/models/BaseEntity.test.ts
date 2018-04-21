import BaseEntity from '../../../src/models/BaseEntity'
import { RelationDescriptor } from '../../../src/models/relationDescriptors'
import SlothEntity from '../../../src/decorators/SlothEntity'
import emptyProtoData from '../../utils/emptyProtoData'

test('BaseEntity#isDirty returns false without any updated props', () => {
  expect(
    BaseEntity.prototype.isDirty.call({
      sloth: { updatedProps: {}, docId: '' }
    })
  ).toBe(false)
})

test('BaseEntity#isDirty returns true with updated props', () => {
  expect(
    BaseEntity.prototype.isDirty.call({
      sloth: { updatedProps: { foo: 'bar' }, docId: '' }
    })
  ).toBe(true)
})

test('BaseEntity#isDirty returns true with no docId', () => {
  expect(
    BaseEntity.prototype.isDirty.call({
      sloth: { updatedProps: { foo: 'bar' } }
    })
  ).toBe(true)
})

test('BaseEntity#save immediately returns props if not dirty', async () => {
  const isDirty = jest.fn().mockReturnValue(false)
  expect(
    await BaseEntity.prototype.save.call({
      isDirty,
      getDocument: () => 'foo',
      __protoData: { fields: [{ key: 'foo' }] },
      foo: 'bar'
    })
  ).toEqual('foo')

  expect(isDirty).toHaveBeenCalled()
})

test('BaseEntity#save create doc if does not exist', async () => {
  const isDirty = jest.fn().mockReturnValue(true)
  const getDocument = jest
    .fn()
    .mockReturnValue({ _id: 'foos/bar', name: 'bar' })

  const get = jest.fn().mockRejectedValue({ name: 'not_found' })
  const put = jest.fn().mockResolvedValue({ rev: 'revision' })

  const factory = jest.fn().mockReturnValue({ get, put })

  const { _rev } = await BaseEntity.prototype.save.call({
    isDirty,
    getDocument,
    __protoData: {
      fields: [{ key: '_id' }, { key: 'name' }]
    },
    sloth: {
      factory,
      name: 'foos'
    },
    _id: 'foos/bar',
    name: 'bar'
  })

  expect(isDirty).toHaveBeenCalled()
  expect(factory).toHaveBeenCalledWith('foos')
  expect(get).toHaveBeenCalledWith('foos/bar')
  expect(put).toHaveBeenCalledWith({ _id: 'foos/bar', name: 'bar' })
  expect(_rev).toBe('revision')
})

test('BaseEntity#save remove previous doc', async () => {
  const isDirty = jest.fn().mockReturnValue(true)
  const { getDocument } = BaseEntity.prototype

  const get = jest
    .fn()
    .mockRejectedValueOnce({ name: 'not_found' })
    .mockResolvedValueOnce('foobar')

  const put = jest.fn().mockResolvedValue({ rev: 'myrev' })
  const remove = jest.fn().mockResolvedValue(null)

  const factory = jest.fn().mockReturnValue({ get, put, remove })

  const { _rev } = await BaseEntity.prototype.save.call({
    isDirty,
    getDocument,
    __protoData: {
      fields: [{ key: '_id', docKey: '_id' }, { key: 'name', docKey: 'name' }]
    },
    sloth: {
      factory,
      name: 'foos',
      docId: 'original_doc'
    },
    _id: 'foos/bar',
    name: 'bar'
  })

  expect(isDirty).toHaveBeenCalled()

  expect(factory).toHaveBeenCalledWith('foos')

  expect(get).toHaveBeenCalledWith('foos/bar')
  expect(get).toHaveBeenCalledWith('original_doc')

  expect(put).toHaveBeenCalledWith({ _id: 'foos/bar', name: 'bar' })

  expect(remove).toHaveBeenCalledWith('foobar')
  expect(_rev).toBe('myrev')
})

test('BaseEntity#save throws error if not not_found', async () => {
  const isDirty = jest.fn().mockReturnValue(true)
  const { getDocument } = BaseEntity.prototype

  const get = jest.fn().mockRejectedValue(new Error('foo_error'))
  const put = jest.fn().mockResolvedValue(null)

  const factory = jest.fn().mockReturnValue({ get, put })

  await expect(
    BaseEntity.prototype.save.apply({
      getDocument,
      isDirty,
      __protoData: {
        fields: [{ key: '_id' }, { key: 'name' }]
      },
      sloth: {
        factory,
        name: 'foos'
      },
      _id: 'foos/bar',
      name: 'bar'
    })
  ).rejects.toMatchObject({ message: 'foo_error' })

  expect(isDirty).toHaveBeenCalled()

  expect(factory).toHaveBeenCalledWith('foos')

  expect(get).toHaveBeenCalledWith('foos/bar')

  expect(put).toHaveBeenCalledTimes(0)
})

test('BaseEntity#remove returns false if document has no docId', async () => {
  const flag = await BaseEntity.prototype.remove.call({ sloth: {} })
  expect(flag).toBe(false)
})

test('BaseEntity#remove calls db.remove with _rev', async () => {
  const get = jest.fn().mockResolvedValue({ _rev: 'revision' })
  const remove = jest.fn().mockResolvedValue(null)
  const removeRelations = jest.fn()

  const factory = jest.fn().mockReturnValue({ get, remove })

  const flag = await BaseEntity.prototype.remove.call({
    sloth: { factory, docId: 'foobar', name: 'foos' },
    removeRelations
  })

  expect(flag).toBe(true)
  expect(removeRelations).toHaveBeenCalled()
  expect(factory).toHaveBeenCalledWith('foos')
  expect(get).toHaveBeenCalledWith('foobar')
  expect(remove).toHaveBeenCalledWith('foobar', 'revision')
})

test('BaseEntity#removeRelations doesnt remove parent if cascade is set to false', async () => {
  const allDocs = jest.fn().mockResolvedValue({ rows: { length: 0 } })
  const factory = jest.fn().mockReturnValue({ allDocs })
  const remove = jest.fn()
  const belongsTo = jest.fn().mockResolvedValue({ remove })

  const name = 'foobars'

  const rels = [
    {
      belongsTo,
      cascade: false,
      key: 'foo'
    }
  ]

  await BaseEntity.prototype.removeRelations.apply({
    ...BaseEntity.prototype,
    __protoData: { rels },
    foo: 'bar',
    sloth: {
      factory,
      name
    }
  })

  expect(allDocs).not.toHaveBeenCalled()
  expect(factory).not.toHaveBeenCalledWith(name)
  expect(remove).not.toHaveBeenCalled()
  expect(belongsTo).not.toHaveBeenCalled()
})

test('BaseEntity#removeRelations doesnt remove parent if has child', async () => {
  const allDocs = jest.fn().mockResolvedValue({ rows: ['foo'] })
  const factory = jest.fn().mockReturnValue({ allDocs })
  const remove = jest.fn()
  const belongsTo = jest.fn().mockResolvedValue({ remove })

  const name = 'foobars'

  const rels = [
    {
      belongsTo,
      cascade: true,
      key: 'foo'
    }
  ]

  await BaseEntity.prototype.removeRelations.apply({
    ...BaseEntity.prototype,
    __protoData: { rels },
    foo: 'bar',
    sloth: {
      factory,
      name
    }
  })

  expect(allDocs).toHaveBeenCalledWith({
    include_docs: false,
    startkey: 'bar/',
    endkey: 'bar/\uffff'
  })
  expect(factory).toHaveBeenCalledWith(name)
  expect(remove).not.toHaveBeenCalled()
  expect(belongsTo).not.toHaveBeenCalled()
})

test('BaseEntity#removeRelations remove parent if no child', async () => {
  const allDocs = jest.fn().mockResolvedValue({ rows: [] })
  const factory = jest.fn().mockReturnValue({ allDocs })
  const remove = jest.fn()
  const findById = jest.fn().mockResolvedValue({ remove })
  const belongsTo = jest.fn().mockReturnValue({ findById })

  const name = 'foobars'

  const rels = [
    {
      belongsTo,
      cascade: true,
      key: 'foo'
    }
  ]

  await BaseEntity.prototype.removeRelations.apply({
    ...BaseEntity.prototype,
    __protoData: { rels },
    foo: 'bar',
    sloth: {
      factory,
      name
    }
  })

  expect(allDocs).toHaveBeenCalledWith({
    include_docs: false,
    startkey: 'bar/',
    endkey: 'bar/\uffff'
  })
  expect(factory).toHaveBeenCalledWith(name)
  expect(remove).toHaveBeenCalled()
  expect(belongsTo).toHaveBeenCalled()
})

test('BaseEntity#removeRelations remove parent if no child', async () => {
  const allDocs = jest.fn().mockResolvedValue({ rows: [] })
  const factory = jest.fn().mockReturnValue({ allDocs })
  const remove = jest.fn()
  const findById = jest.fn().mockResolvedValue({ remove })
  const belongsTo = jest.fn().mockReturnValue({ findById })

  const name = 'foobars'

  const rels = [
    {
      belongsTo,
      cascade: true,
      key: 'foo'
    }
  ]

  await BaseEntity.prototype.removeRelations.apply({
    ...BaseEntity.prototype,
    __protoData: { rels },
    foo: 'bar',
    sloth: {
      factory,
      name
    }
  })

  expect(allDocs).toHaveBeenCalledWith({
    include_docs: false,
    startkey: 'bar/',
    endkey: 'bar/\uffff'
  })
  expect(factory).toHaveBeenCalledWith(name)
  expect(remove).toHaveBeenCalled()
  expect(belongsTo).toHaveBeenCalled()
})

test('BaseEntity#getProps returns props', () => {
  const doc = BaseEntity.prototype.getProps.call({
    __protoData: {
      fields: [{ key: 'name' }, { key: '_id' }, { key: 'foo' }]
    },
    name: 'John',
    _id: 'john',
    foo: 'bar'
  })

  expect(doc).toEqual({
    name: 'John',
    _id: 'john',
    foo: 'bar'
  })
})

test('BaseEntity#getDocument returns props', () => {
  const doc = BaseEntity.prototype.getDocument.call({
    __protoData: {
      fields: [
        { key: 'name', docKey: 'not_name' },
        { key: '_id', docKey: '_id' },
        { key: 'foo', docKey: 'bar' }
      ]
    },
    name: 'John',
    _id: 'john',
    foo: 'bar'
  })

  expect(doc).toEqual({
    not_name: 'John',
    _id: 'john',
    bar: 'bar'
  })
})

describe('BaseEntity#constructor', () => {
  // tslint:disable-next-line:no-empty
  const constr = () => {}
  const localPouchFactory = () => null

  test('set the props when props are passed', () => {
    const context: any = {
      __protoData: emptyProtoData({
        name: 'foo',
        fields: [{ key: 'foo', docKey: 'foo' }]
      }),
      name: 'foo',
      props: {}
    }

    BaseEntity.call(context, localPouchFactory, { foo: 'bar' })

    expect(context.sloth).toBeDefined()
    expect(context.sloth.name).toBe('foo')
    expect(context.sloth.docId).toBeUndefined()
  })
  test('can use keys', () => {
    // tslint:disable-next-line:no-empty
    const constr = () => {}

    const context: any = {
      name: 'foo',
      __protoData: emptyProtoData({
        name: 'foo',
        fields: [{ key: 'foo', docKey: 'barz' }]
      })
    }

    BaseEntity.call(context, localPouchFactory, { foo: 'bar' })

    expect(context.sloth).toBeDefined()
    expect(context.sloth.name).toBe('foo')
    expect(context.sloth.docId).toBeUndefined()
  })
  test('can use docKeys', () => {
    // tslint:disable-next-line:no-empty
    const constr = () => {}

    const context: any = {
      name: 'foo',
      __protoData: emptyProtoData({
        name: 'foo',
        fields: [{ key: 'foo', docKey: 'barz' }]
      })
    }

    BaseEntity.call(context, localPouchFactory, { barz: 'bar' })

    expect(context.sloth).toBeDefined()
    expect(context.sloth.name).toBe('foo')
    expect(context.sloth.docId).toBeUndefined()
  })
  test('eventually set docId when props are passed with _id', () => {
    // tslint:disable-next-line:no-empty
    const constr = () => {}

    const context: any = {
      name: 'foo',
      __protoData: emptyProtoData({
        name: 'foo',
        fields: [{ key: 'foo', docKey: 'foo' }, { key: '_id', docKey: '_id' }]
      })
    }

    BaseEntity.call(context, localPouchFactory, { _id: 'foobar', foo: 'bar' })

    expect(context.sloth).toBeDefined()
    expect(context.sloth.name).toBe('foo')
    expect(context.sloth.updatedProps).toEqual({})
    expect(context.sloth.docId).toBe('foobar')
  })
  test('set the docId only when string is passed', () => {
    // tslint:disable-next-line:no-empty
    const constr = () => {}

    const context: any = {
      name: 'foo',
      __protoData: emptyProtoData({ name: 'foo' })
    }

    BaseEntity.call(context, localPouchFactory, 'foobar')

    expect(context.sloth).toBeDefined()
    expect(context.sloth.name).toBe('foo')
    expect(context.sloth.updatedProps).toEqual({})
    expect(context.sloth.docId).toBe('foobar')
  })
})
