import PouchFactory from './PouchFactory'
import BaseEntity from './BaseEntity'
import EntityConstructor from '../helpers/EntityConstructor'

/**
 * This represent a Database
 * 
 * @typeparam S the database schema
 * @typeparam E the Entity
 * @typeparam T the entity constructor
 */
export default class SlothDatabase<
  S,
  E extends BaseEntity<S>,
  T extends EntityConstructor<S, E>
> {
  private _name: string
  private _model: T

  /**
   * Create a new database instance
   * @param factory the pouch factory to use
   * @param name the database name
   * @param model the model constructor
   */
  constructor(model: T) {
    this._model = model
    if (model.desc) {
      this._name = model.desc.name
    } else {
      throw new Error('Please use SlothEntity')
    }
  }

  /**
   * Fetch a docuemt from the database
   * @param factory the PouchDB factory to use
   * @param id the document identifier to fetch
   * @return a promise resolving with the entity instance
   */
  findById(factory: PouchFactory<S>, id: string): Promise<E> {
    return factory(this._name)
      .get(id)
      .then(res => {
        return new this._model(factory, res)
      })
  }

  /**
   * Create a new model instance
   * @param factory The database factory to attach to the model
   * @param props the entity properties
   * @returns an entity instance 
   */
  create(factory: PouchFactory<S>, props: Partial<S>) {
    return new this._model(factory, props)
  }
}
