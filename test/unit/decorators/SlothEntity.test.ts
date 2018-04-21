import SlothEntity from '../../../src/decorators/SlothEntity'
import localPouchFactory from '../../utils/localPouchFactory'
import emptyProtoData from '../../utils/emptyProtoData'

test('SlothEntity - attaches a sloth object to class', () => {
  // tslint:disable-next-line:no-empty
  const constr = () => {}

  const wrapper = SlothEntity('foo')(constr as any)
  const context: any = {
    __protoData: { fields: [] },
    sloth: {}
  }

  wrapper.call(context, localPouchFactory, 'foos/foo')

  expect(context.sloth).toBeDefined()
  expect(context.sloth.props).toBeDefined()
})
