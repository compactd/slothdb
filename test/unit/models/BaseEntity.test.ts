import BaseEntity from '../../../src/models/BaseEntity'
import { RelationDescriptor } from '../../../src/models/relationDescriptors'

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
      __protoData: { fields: [{ key: 'foo' }] },
      foo: 'bar'
    })
  ).toEqual({ foo: 'bar' })

  expect(isDirty).toHaveBeenCalled()
})

test('BaseEntity#save create doc if does not exist', async () => {
  const isDirty = jest.fn().mockReturnValue(true)

  const get = jest.fn().mockRejectedValue({ name: 'not_found' })
  const put = jest.fn().mockResolvedValue({ rev: 'revision' })

  const factory = jest.fn().mockReturnValue({ get, put })

  const { _rev } = await BaseEntity.prototype.save.call({
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

  expect(isDirty).toHaveBeenCalled()
  expect(factory).toHaveBeenCalledWith('foos')
  expect(get).toHaveBeenCalledWith('foos/bar')
  expect(put).toHaveBeenCalledWith({ _id: 'foos/bar', name: 'bar' })
  expect(_rev).toBe('revision')
})

test('BaseEntity#save remove previous doc', async () => {
  const isDirty = jest.fn().mockReturnValue(true)

  const get = jest
    .fn()
    .mockRejectedValueOnce({ name: 'not_found' })
    .mockResolvedValueOnce('foobar')

  const put = jest.fn().mockResolvedValue({ rev: 'myrev' })
  const remove = jest.fn().mockResolvedValue(null)

  const factory = jest.fn().mockReturnValue({ get, put, remove })

  const { _rev } = await BaseEntity.prototype.save.call({
    isDirty,
    __protoData: {
      fields: [{ key: '_id' }, { key: 'name' }]
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

  const get = jest.fn().mockRejectedValue(new Error('foo_error'))
  const put = jest.fn().mockResolvedValue(null)

  const factory = jest.fn().mockReturnValue({ get, put })

  await expect(
    BaseEntity.prototype.save.apply({
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
