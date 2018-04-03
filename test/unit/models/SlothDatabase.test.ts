import SlothDatabase from '../../../src/models/SlothDatabase'
import localPouchFactory from '../../utils/localPouchFactory'

test('SlothDatabase#constructor - sets the db name from desc', () => {
  const db1 = new SlothDatabase({ desc: { name: 'foos' } } as any)

  expect((db1 as any)._name).toBe('foos')
})

test('SlothDatabase#constructor - throws without a desc', () => {
  expect(() => {
    const db1 = new SlothDatabase({} as any)
  }).toThrowError(/SlothEntity/)
})

test('SlothDatabase#create - create a model instance with props', async () => {
  const _model = jest.fn()
  const props = { foo: 'bar' }
  const doc = SlothDatabase.prototype.create.call(
    { _model },
    localPouchFactory,
    props
  )

  expect(_model).toHaveBeenCalledTimes(1)
  expect(_model).toHaveBeenCalledWith(localPouchFactory, props)
})

test('SlothDatabase#create - create a model instance with props', async () => {
  const create = jest.fn().mockImplementation((omit: never, el: object) => el)

  const _model = jest.fn()
  const props = { _id: 'foos/bar', foo: 'bar' }
  const dbMock = {
    get: jest.fn().mockResolvedValue(props)
  }
  const factory = jest.fn().mockReturnValue(dbMock)

  const doc = await SlothDatabase.prototype.findById.call(
    { _model, _name: 'foos' },
    factory,
    'foos/bar'
  )

  expect(factory).toHaveBeenCalledTimes(1)
  expect(factory).toHaveBeenCalledWith('foos')

  expect(dbMock.get).toHaveBeenCalledTimes(1)
  expect(dbMock.get).toHaveBeenCalledWith('foos/bar')

  expect(_model).toHaveBeenCalledWith(factory, props)
})

test('SlothDatabase#findAllDocs - calls allDocs and creates models', async () => {
  const props = { _id: 'foos/bar', foo: 'bar' }
  const docs = [{ foo: 'bar' }, { bar: 'foo' }]

  const allDocs = jest
    .fn()
    .mockResolvedValue({ rows: docs.map(doc => ({ doc })) })
  const factory = jest.fn().mockReturnValue({ allDocs })

  expect(
    await SlothDatabase.prototype.findAllDocs.call({ _name: 'foos' }, factory)
  ).toEqual(docs)
  expect(
    await SlothDatabase.prototype.findAllDocs.call(
      { _name: 'foos' },
      factory,
      'foos/bar'
    )
  ).toEqual(docs)
  expect(
    await SlothDatabase.prototype.findAllDocs.call(
      { _name: 'foos' },
      factory,
      'foo',
      'bar'
    )
  ).toEqual(docs)

  expect(create).toHaveBeenCalledWith(factory, docs[0])
  expect(create).toHaveBeenCalledWith(factory, docs[1])
  expect(create).toHaveBeenCalledTimes(6)

  expect(factory).toHaveBeenCalledTimes(3)
  expect(factory).toHaveBeenCalledWith('foos')

  expect(allDocs).toHaveBeenCalledTimes(3)
  expect(allDocs.mock.calls).toMatchObject([
    [
      {
        include_docs: true,
        startkey: '',
        endkey: '\uffff'
      }
    ],
    [
      {
        include_docs: true,
        startkey: 'foos/bar',
        endkey: 'foos/bar/\uffff'
      }
    ],
    [
      {
        include_docs: true,
        startkey: 'foo',
        endkey: 'bar'
      }
    ]
  ])
})

test('SlothDatabase#findAllID - calls allDocs and return ids', async () => {
  const rows = ['foo', 'bar']

  const allDocs = jest.fn().mockResolvedValue({ rows })

  const factory = jest.fn().mockReturnValue({ allDocs })

  expect(
    await SlothDatabase.prototype.findAllDocs.call(
      { create, _name: 'foos' },
      factory
    )
  ).toEqual(rows)
  expect(
    await SlothDatabase.prototype.findAllDocs.call(
      { create, _name: 'foos' },
      factory,
      'foos/bar'
    )
  ).toEqual(rows)
  expect(
    await SlothDatabase.prototype.findAllDocs.call(
      { create, _name: 'foos' },
      factory,
      'foo',
      'bar'
    )
  ).toEqual(rows)

  expect(factory).toHaveBeenCalledTimes(3)
  expect(factory).toHaveBeenCalledWith('foos')

  expect(allDocs).toHaveBeenCalledTimes(3)
  expect(allDocs.mock.calls).toMatchObject([
    [
      {
        include_docs: false,
        startkey: '',
        endkey: '\uffff'
      }
    ],
    [
      {
        include_docs: false,
        startkey: 'foos/bar',
        endkey: 'foos/bar/\uffff'
      }
    ],
    [
      {
        include_docs: false,
        startkey: 'foo',
        endkey: 'bar'
      }
    ]
  ])
})
