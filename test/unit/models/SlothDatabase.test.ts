import SlothDatabase from '../../../src/models/SlothDatabase'
import localPouchFactory from '../../utils/localPouchFactory'
import emptyProtoData from '../../utils/emptyProtoData'

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
  const create = jest.fn().mockImplementation((omit: never, el: object) => el)

  const props = { _id: 'foos/bar', foo: 'bar' }
  const docs = [{ foo: 'bar' }, { bar: 'foo' }]

  const allDocs = jest
    .fn()
    .mockResolvedValue({ rows: docs.map(doc => ({ doc })) })
  const factory = jest.fn().mockReturnValue({ allDocs })

  expect(
    await SlothDatabase.prototype.findAllDocs.call(
      { create, _name: 'foos' },
      factory
    )
  ).toEqual(docs)
  expect(
    await SlothDatabase.prototype.findAllDocs.call(
      { create, _name: 'foos' },
      factory,
      'foos/bar'
    )
  ).toEqual(docs)
  expect(
    await SlothDatabase.prototype.findAllDocs.call(
      { create, _name: 'foos' },
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

test('SlothDatabase#findAllIDs - calls allDocs and return ids', async () => {
  const create = jest.fn().mockImplementation((omit: never, el: object) => el)

  const rows = ['foo', 'bar']

  const allDocs = jest
    .fn()
    .mockResolvedValue({ rows: rows.map(id => ({ id })) })

  const factory = jest.fn().mockReturnValue({ allDocs })

  expect(
    await SlothDatabase.prototype.findAllIDs.call({ _name: 'foos' }, factory)
  ).toEqual(rows)
  expect(
    await SlothDatabase.prototype.findAllIDs.call(
      { _name: 'foos' },
      factory,
      'foos/bar'
    )
  ).toEqual(rows)
  expect(
    await SlothDatabase.prototype.findAllIDs.call(
      { _name: 'foos' },
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

describe('SlothDatabase#subscribe', () => {
  test('')
})

describe('SlothDatabase#changes', () => {
  const proto = Object.assign({}, SlothDatabase.prototype, { _subscribers: [] })

  const cancel = jest.fn()
  const on = jest.fn().mockReturnValue({ cancel })
  const changes = jest.fn().mockReturnValue({ on })

  const factory1 = () => ({ changes })
  const factory2 = () => ({ changes })

  const sub1 = () => ({})
  const sub2 = () => ({})

  test(`Pushes sub and start listening`, () => {
    SlothDatabase.prototype.subscribe.call(proto, factory1, sub1)

    expect(on).toHaveBeenCalledTimes(1)
    expect(changes).toHaveBeenCalledTimes(1)
    expect(cancel).not.toHaveBeenCalled()
  })

  test(`Pushes sub and doesn't listen if already`, () => {
    SlothDatabase.prototype.subscribe.call(proto, factory1, sub2)

    expect(on).toHaveBeenCalledTimes(1)
    expect(changes).toHaveBeenCalledTimes(1)
    expect(cancel).not.toHaveBeenCalled()
  })

  test(`Doesn't call changes.cancel with remaining subs`, () => {
    SlothDatabase.prototype.cancel.call(proto, factory1, sub2)

    expect(on).toHaveBeenCalledTimes(1)
    expect(changes).toHaveBeenCalledTimes(1)
    expect(cancel).not.toHaveBeenCalled()
  })

  test(`Call changes.cancel without remaining subs`, () => {
    SlothDatabase.prototype.cancel.call(proto, factory1, sub2)

    expect(on).toHaveBeenCalledTimes(1)
    expect(changes).toHaveBeenCalledTimes(1)
    expect(cancel).toHaveBeenCalled()
  })
})

describe('SlothDatabase#initSetup', () => {
  const proto = Object.assign({}, SlothDatabase.prototype, {
    _model: {
      prototype: {
        __protoData: emptyProtoData({
          views: [
            {
              id: 'views',
              name: 'by_bar',
              code: 'function (doc) { emit(doc.bar); }',
              function: () => ({})
            },
            {
              id: 'views',
              name: 'by_barz',
              code: 'function (doc) { emit(doc.barz); }',
              function: () => ({})
            }
          ]
        })
      }
    }
  })

  const get = jest.fn()
  const put = jest.fn()

  const factory = () => ({ get, put })

  const sub1 = () => ({})
  const sub2 = () => ({})

  test(`Creates views if no document found`, async () => {
    get.mockRejectedValue(new Error(''))
    put.mockResolvedValue(null)

    await SlothDatabase.prototype.initSetup.call(proto, factory)

    expect(get).toHaveBeenCalledTimes(2)
    expect(get).toHaveBeenCalledWith('_design/views')

    expect(put).toHaveBeenCalledTimes(2)
    expect(put.mock.calls).toEqual([
      [
        {
          _id: '_design/views',
          views: {
            by_bar: { map: 'function (doc) { emit(doc.bar); }' }
          }
        }
      ],
      [
        {
          _id: '_design/views',
          views: {
            by_barz: { map: 'function (doc) { emit(doc.barz); }' }
          }
        }
      ]
    ])
  })

  test('Update document if already exists', async () => {
    put.mockClear()
    get.mockClear()

    get.mockResolvedValue({
      _rev: 'foobar',
      views: {
        by_foobar: {
          map: 'foobar!'
        }
      }
    })
    put.mockResolvedValue(null)

    await SlothDatabase.prototype.initSetup.call(proto, factory)

    expect(get).toHaveBeenCalledTimes(2)
    expect(get).toHaveBeenCalledWith('_design/views')

    expect(put).toHaveBeenCalledTimes(2)
    expect(put.mock.calls).toEqual([
      [
        {
          _rev: 'foobar',
          _id: '_design/views',
          views: {
            by_bar: { map: 'function (doc) { emit(doc.bar); }' },
            by_foobar: {
              map: 'foobar!'
            }
          }
        }
      ],
      [
        {
          _rev: 'foobar',
          _id: '_design/views',
          views: {
            by_barz: { map: 'function (doc) { emit(doc.barz); }' },
            by_foobar: {
              map: 'foobar!'
            }
          }
        }
      ]
    ])
  })
})
