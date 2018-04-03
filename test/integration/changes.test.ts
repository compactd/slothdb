import Artist from './Artist'
import PouchDB from 'pouchdb'
import delay from '../utils/delay'

PouchDB.plugin(require('pouchdb-adapter-memory'))

describe('changes#subscribe', () => {
  test('fire one sub on document added', async () => {
    const prefix = Date.now().toString(26) + '_'

    const factory = (name: string) =>
      new PouchDB(prefix + name, { adapter: 'memory' })

    const subscriber = jest.fn()

    Artist.subscribe(factory, subscriber)

    await Artist.create(factory, { name: 'foo' }).save()

    await delay(10)

    const { calls } = subscriber.mock

    const [call1, ...never] = calls

    expect(never).toHaveLength(0)

    expect(call1[0].payload).toMatchObject({
      artists: { _id: 'library/foo', name: 'foo' }
    })
  })

  test('fire one sub on document removed', async () => {
    const prefix = Date.now().toString(26) + '_'

    const factory = (name: string) =>
      new PouchDB(prefix + name, { adapter: 'memory' })

    const subscriber = jest.fn()

    const foo = Artist.create(factory, { name: 'foo' })
    await foo.save()

    Artist.subscribe(factory, subscriber)

    await foo.remove()

    const { calls } = subscriber.mock

    const [call1, ...never] = calls

    expect(never).toHaveLength(0)

    expect(call1[0].payload).toMatchObject({
      artists: 'library/foo'
    })
  })

  test('fire one sub on document changed', async () => {
    const prefix = Date.now().toString(26) + '_'

    const factory = (name: string) =>
      new PouchDB(prefix + name, { adapter: 'memory' })

    const subscriber = jest.fn()

    const foo = Artist.create(factory, { name: 'foo' })
    const doc = await foo.save()

    Artist.subscribe(factory, subscriber)

    await factory('artists').put(Object.assign({}, doc, { foo: 'bar' }))
    await delay(10)

    const { calls } = subscriber.mock

    const [call1, ...never] = calls

    expect(never).toHaveLength(0)

    expect(call1[0].payload).toMatchObject({
      artists: { foo: 'bar', _id: 'library/foo' }
    })
  })
})
