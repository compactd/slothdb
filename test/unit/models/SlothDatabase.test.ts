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
