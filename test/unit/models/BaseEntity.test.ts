import BaseEntity from '../../../src/models/BaseEntity'

test('BaseEntity#isDirty returns false without any updated props', () => {
  expect(
    BaseEntity.prototype.isDirty.call({ sloth: { updatedProps: {} } })
  ).toBe(false)
})

test('BaseEntity#isDirty returns true with updated props', () => {
  expect(
    BaseEntity.prototype.isDirty.call({
      sloth: { updatedProps: { foo: 'bar' } }
    })
  ).toBe(true)
})
