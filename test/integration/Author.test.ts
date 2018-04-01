import Author from './Author'

test('creates a new author from props with valid props', () => {
  const grr = new Author({
    name: 'GRR Martin'
  })
  expect(grr.name).toBe('GRR Martin')
  expect(grr._id).toBe('authors/GRR-Martin')
})
