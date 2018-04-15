import AuthorDatabase from './Author'
import localPouchFactory from '../utils/localPouchFactory'
import PouchDB from 'pouchdb'

PouchDB.plugin(require('pouchdb-adapter-memory'))

test('creates a new author from props with valid props', () => {
  const grr = AuthorDatabase.create(localPouchFactory, { name: 'GRR Martin' })
  expect(grr.name).toBe('GRR Martin')
  expect(grr._id).toBe('authors/grr-martin')
})

test('exists returns false for a non-existing doc', async () => {
  const dbName = Date.now().toString(26)
  const factory = () => new PouchDB(dbName, { adapter: 'memory' })

  const doc = AuthorDatabase.create(factory, { name: 'Foobar' })

  expect(await doc.exists()).toBe(false)
})

test('exists returns true for existing doc', async () => {
  const dbName = Date.now().toString(26)
  const factory = () => new PouchDB(dbName, { adapter: 'memory' })

  await AuthorDatabase.put(factory, { name: 'Foobar' })

  const doc = AuthorDatabase.create(factory, { name: 'Foobar' })

  expect(await doc.exists()).toBe(true)
})

test('find author by id', async () => {
  const dbName = Date.now().toString(26)
  const props = { _id: 'authors/grr-martin', name: 'GRR Martin' }

  const factory = () => new PouchDB(dbName, { adapter: 'memory' })

  await factory().put(props)

  const doc = await AuthorDatabase.findById(factory, props._id)

  expect(doc._id).toBe(props._id)
  expect(doc.name).toBe(props.name)
})

test('isDirty returns true with updated props', () => {
  const grr = AuthorDatabase.create(localPouchFactory, {
    name: 'GRR Martin',
    _id: 'authors/grr-martin'
  })
  expect(grr.name).toBe('GRR Martin')
  expect(grr._id).toBe('authors/grr-martin')
  expect(grr.isDirty()).toBe(false)

  grr.name = 'grr martin'

  expect(grr.isDirty()).toBe(true)
})

test('save creates, update and eventually remove old document', async () => {
  const dbName = Date.now().toString(26)
  const props = { name: 'GRR Martin', age: 69 }

  const factory = () => new PouchDB(dbName, { adapter: 'memory' })

  const doc = await AuthorDatabase.create(factory, props)
  const originalId = 'authors/grr-martin'

  expect(doc._id).toBe(originalId)

  expect(doc.name).toBe(props.name)

  {
    const { _rev } = await doc.save()
    expect(_rev).toMatch(/^1-/)
  }

  {
    const { _rev } = await doc.save()
    expect(_rev).toBeUndefined()
  }

  {
    doc.age = 70
    const { _rev, age } = await doc.save()
    expect(_rev).toMatch(/^2-/)
  }

  {
    doc.name = 'George RR Martin'
    const newId = 'authors/george-rr-martin'
    expect(doc._id)

    const { _rev, _id } = await doc.save()

    expect(_rev).toMatch(/^1-/)
    expect(_id).toBe(newId)

    await expect(factory().get(originalId)).rejects.toMatchObject({
      name: 'not_found'
    })

    const newDoc = await factory().get(newId)

    expect(newDoc).toMatchObject({
      name: 'George RR Martin',
      age: 70,
      _id: 'authors/george-rr-martin'
    })
  }
})

test('save creates, update and eventually remove old document', async () => {
  const dbName = Date.now().toString(26)
  const props = { name: 'GRR Martin', age: 69 }

  const factory = () => new PouchDB(dbName, { adapter: 'memory' })

  const doc = await AuthorDatabase.create(factory, props)
  const originalId = 'authors/grr-martin'

  expect(doc._id).toBe(originalId)

  expect(doc.name).toBe(props.name)

  {
    const { _rev } = await doc.save()
    expect(_rev).toMatch(/^1-/)
  }

  {
    const { _rev } = await doc.save()
    expect(_rev).toBeUndefined()
  }

  {
    doc.age = 70
    const { _rev, age } = await doc.save()
    expect(_rev).toMatch(/^2-/)
  }

  {
    doc.name = 'George RR Martin'
    const newId = 'authors/george-rr-martin'
    expect(doc._id)

    const { _rev, _id } = await doc.save()

    expect(_rev).toMatch(/^1-/)
    expect(_id).toBe(newId)

    await expect(factory().get(originalId)).rejects.toMatchObject({
      name: 'not_found'
    })

    const newDoc = await factory().get(newId)

    expect(newDoc).toMatchObject({
      name: 'George RR Martin',
      age: 70,
      _id: 'authors/george-rr-martin'
    })
  }
})
