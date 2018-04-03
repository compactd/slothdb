import { belongsToMapper } from '../../../src/utils/relationMappers'
import emptyProtoData from '../../utils/emptyProtoData'

describe('belongsToMapper', () => {
  test('Throws error if no relation available', () => {
    const mapper = belongsToMapper({ __protoData: emptyProtoData({}) }, 'foo')

    expect(() => mapper(null)).toThrowError(/No relation available/)
  })

  test('Throws an error for unsupported relation', () => {
    const mapper = belongsToMapper(
      {
        __protoData: emptyProtoData({
          rels: [
            {
              unsupported: 'foo',
              key: 'foo'
            } as any
          ]
        })
      },
      'foo'
    )

    expect(() => mapper(null)).toThrowError(/Unsupported/)
  })
})
