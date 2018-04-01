import BaseEntity from '../models/BaseEntity'
import PouchFactory from '../models/PouchFactory'
import StaticData from '../models/StaticData'

export default interface EntityConstructor<S, T extends BaseEntity<S>> {
  desc?: StaticData
  new (factory: PouchFactory, idOrProps: Partial<S> | string): T
}
