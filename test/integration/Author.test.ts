import AuthorDatabase from './Author'
import localPouchFactory from '../../src/utils/localPouchFactory'

test('creates a new author from props with valid props', () => {
  const grr = AuthorDatabase.create(localPouchFactory, { name: 'GRR Martin' })
  expect(grr.name).toBe('GRR Martin')
  expect(grr._id).toBe('authors/GRR-Martin')
})
