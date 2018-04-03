import PouchFactory from './PouchFactory'
import BaseEntity from './BaseEntity'
import EntityConstructor from '../helpers/EntityConstructor'
import getProtoData from '../utils/getProtoData'
import { join } from 'path'

/**
 * This represent a Database
 * 
 * @typeparam S the database schema
 * @typeparam E the Entity
 * @typeparam T the entity constructor
 */
export default class SlothDatabase<S, E extends BaseEntity<S>> {
  /**
   * 
   * @private
   * @type {string}
   * @memberof SlothDatabase
   */
  _name: string
  /**
   * 
   * 
   * @type {T}
   * @memberof SlothDatabase
   * @private
   */
  _model: EntityConstructor<S, E>

  /**
   * Create a new database instance
   * @param factory the pouch factory to use
   * @param name the database name
   * @param model the model constructor
   */
  constructor(model: T) {
    this._model = model
    if (model.desc && model.desc.name) {
      this._name = model.desc.name
    } else {
      throw new Error('Please use SlothEntity')
    }
  }

  /**
   * Fetches all documents IDs for this database and return them
   * 
   * @param {PouchFactory<S>} factory the PouchDB factory to use 
   * @param {string} [startKey=''] the startkey to use
   * @param {string} [endKey=path.join(startKey, '\uffff')] the endkey to use
   * @returns a promise that resolves into an array of string IDs
   * @see PouchDB#allDocs
   * @memberof SlothDatabase
   */
  findAllIDs(
    factory: PouchFactory<S>,
    startKey = '',
    endKey = join(startKey, '\uffff')
  ) {
    const db = factory(this._name)

    return db
      .allDocs({
        include_docs: false,
        startkey: startKey,
        endkey: endKey
      })
      .then(({ rows }) => {
        return rows.map(({ id }) => id)
      })
  }

  /**
   * Fetches all documents for this database and map them with the model
   * 
   * @param {PouchFactory<S>} factory the PouchDB factory to use 
   * @param {string} [startKey=''] the startkey to use
   * @param {string} [endKey=path.join(startKey, '\uffff')] the endkey to use
   * @returns a promise that resolves into an array of entity instances
   * @see PouchDB#allDocs
   * @memberof SlothDatabase
   */
  findAllDocs(
    factory: PouchFactory<S>,
    startKey = '',
    endKey = join(startKey, '\uffff')
  ) {
    const db = factory(this._name)

    return db
      .allDocs({
        include_docs: true,
        startkey: startKey,
        endkey: endKey
      })
      .then(({ rows }) => {
        return rows.map(({ doc }) => this.create(factory, doc as S))
      })
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
