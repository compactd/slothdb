import BaseEntity from '../models/BaseEntity'
import PouchFactory from '../models/PouchFactory'

/**
 * @private
 */
export default interface EntityConstructor<
  S extends { _id: string },
  T extends BaseEntity<S>
> {
  new (factory: PouchFactory<S>, idOrProps: Partial<S> | string): T
}
