import PouchFactory from './PouchFactory'
import BaseEntity from './BaseEntity'
import { Subscriber, ChangeAction, ActionType } from './changes'
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
  _root: string
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

  private _subscribers: {
    factory: any
    sub: Subscriber<S>
    changes: PouchDB.Core.Changes<S>
  }[] = []

  /**
   * Create a new database instance
   * @param factory the pouch factory to use
   * @param name the database name
   * @param model the model constructor
   * @param root the root name, which is the startKey. I don't recommend it
   */
  constructor(model: EntityConstructor<S, E>, root: string = '') {
    this._model = model
    this._root = root
    if (model.desc && model.desc.name) {
      this._name = model.desc.name
    } else {
      throw new Error('Please use SlothEntity')
    }
  }

  /**
   * Returns a database that will only find entities with _id
   * starting with the root path
   * @param root the root path
   */
  withRoot(root: string) {
    return new SlothDatabase<S, E>(this._model, join(this._root, root))
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
    startKey = this._root || '',
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
    startKey = this._root || '',
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

  /**
   * Subscribes a function to PouchDB changes, so that
   * the function will be called when changes are made
   * 
   * @param factory the PouchDB factory
   * @param sub the subscriber function
   * @see [[Subscriber]]
   * @see [[ChangeAction]]
   */
  subscribe(factory: PouchFactory<S>, sub: Subscriber<S>) {
    if (!this.getSubscriberFor(factory)) {
      const changes = factory(this._name)
        .changes({
          since: 'now',
          live: true,
          include_docs: true
        })
        .on('change', ({ deleted, doc, id }) => {
          if (deleted || !doc) {
            return this.dispatch({
              type: ActionType.REMOVED,
              payload: { [this._name]: id },
              meta: {}
            })
          }
          if (doc._rev.match(/^1-/)) {
            return this.dispatch({
              type: ActionType.ADDED,
              payload: { [this._name]: doc },
              meta: { revision: doc._rev }
            })
          }
          return this.dispatch({
            type: ActionType.CHANGED,
            payload: { [this._name]: doc },
            meta: { revision: doc._rev }
          })
        })
      this._subscribers.push({ factory, sub, changes })
      return
    }
    const { changes } = this.getSubscriberFor(factory)!
    this._subscribers.push({ factory, sub, changes })
  }

  /**
   * Unsubscribe a subscriber, so it will not be called anymore
   * Possibly cancel PouchDB changes
   * 
   * @param factory The pouchDB factory to unsubscribe from
   * @param sub the subscriber to unsubscribe
   */
  cancel(factory: PouchFactory<S>, sub: Subscriber<S>) {
    const index = this._subscribers.findIndex(
      el => el.factory === factory && el.sub === sub
    )

    const [{ changes }] = this._subscribers.splice(index, 1)

    if (!this.getSubscriberFor(factory)) {
      changes.cancel()
    }
  }

  protected getSubscriberFor(factory: PouchFactory<S>) {
    return this._subscribers.find(el => el.factory === factory)
  }

  protected dispatch(action: ChangeAction<S>) {
    this._subscribers.forEach(({ sub }) => sub(action))
  }
}
