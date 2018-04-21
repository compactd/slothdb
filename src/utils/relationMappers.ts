import getProtoData from './getProtoData'
import PouchFactory from '../models/PouchFactory'
import BaseEntity from '../models/BaseEntity'

export function belongsToMapper<S extends { _id: string }>(
  target: any,
  keyName: string
) {
  return (factory: PouchFactory<S>): Promise<BaseEntity<S>> => {
    const { rels } = getProtoData(target)

    const rel = rels.find(({ key }) => key === keyName)

    if (!rel) {
      throw new Error(`No relation available for ${keyName}`)
    }

    if ('belongsTo' in rel) {
      return rel.belongsTo().findById(factory, target[keyName])
    }

    throw new Error('Unsupported relation')
  }
}
