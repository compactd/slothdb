import AuthorDatabase from './Author'
import localPouchFactory from '../../src/utils/localPouchFactory'
import PouchDB from 'pouchdb'

test('creates a new author from props with valid props', () => {
  const grr = AuthorDatabase.create(localPouchFactory, { name: 'GRR Martin' })
  expect(grr.name).toBe('GRR Martin')
  expect(grr._id).toBe('authors/GRR-Martin')
})

test('find author by id', async () => {
  const dbName = Date.now().toString(26)
  const props = { _id: 'authors/GRR-Martin', name: 'GRR Martin' }

  const factory = () => new PouchDB(dbName, { adapter: 'memory' })

  await factory().put(props)

  const doc = await AuthorDatabase.findById(factory, props._id)

  expect(doc._id).toBe(props._id)
  expect(doc.name).toBe(props.name)
})

test('isDirty returns true with updated props', () => {
  const grr = AuthorDatabase.create(localPouchFactory, { name: 'GRR Martin' })
  expect(grr.name).toBe('GRR Martin')
  expect(grr._id).toBe('authors/GRR-Martin')
  expect(grr.isDirty()).toBe(false)

  grr.name = 'grr martin'

  expect(grr.isDirty()).toBe(true)
})
