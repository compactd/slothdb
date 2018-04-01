import PouchFactory from './PouchFactory'

/**
 * Base abstract entity, for all entitoies
 * The generic parameter S is the schema of the document
 * @typeparam S the document schema
 */
export default class BaseEntity<S> {
  // tslint:disable-next-line:no-empty
  constructor(factory: PouchFactory<S>, idOrProps: Partial<S> | string) {}
}
