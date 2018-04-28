import PouchFactory from './PouchFactory'
import BaseEntity from './BaseEntity'
import { Subscriber, ChangeAction, ActionType } from './changes'
import EntityConstructor from '../helpers/EntityConstructor'
import getProtoData from '../utils/getProtoData'
import { join } from 'path'
import Dict from '../helpers/Dict'
import Debug from 'debug'

const debug = Debug('slothdb')

/**
 * This represent a Database
 * 
 * @typeparam S the database schema
 * @typeparam E the Entity
 * @typeparam V the (optional) view type that defines a list of possible view IDs
 */
export default class SlothDatabase<
  S extends { _id: string },
  E extends BaseEntity<S>,
  V extends string = never
> {
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

  private _setupPromise?: Promise<any>

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

    const { name } = getProtoData(model.prototype)

    /* istanbul ignore if  */
    if (!name) {
      throw new Error('SlothEntity decorator is required')
    }

    this._name = name
  }

  /**
   * Join URI params provided as specified by SlothURI
   * Useful to recreate document id from URL params
   * Please note that 
   * @param props the props 
   * @param field 
   */
  joinURIParams(props: Partial<S>, field = '_id') {
    const idURI = getProtoData(this._model.prototype).uris.find(
      ({ name }) => name === field
    )
    if (!idURI) {
      throw new Error(`Field ${field} not found in URIs`)
    }
    return join(
      idURI.prefix,
      ...idURI.propsKeys.map(key => (props as any)[key])
    )
  }

  /**
   * Run a query 
   * 
   * @param factory the pouch factory
   * @param view the view identifier
   * @param startKey the optional startkey
   * @param endKey the optional endkey
   * @param includeDocs include_docs
   */
  query(
    factory: PouchFactory<S>,
    view: V,
    startKey?: any,
    endKey: any = typeof startKey === 'string'
      ? join(startKey, '\uffff')
      : undefined,
    includeDocs = false
  ): Promise<PouchDB.Query.Response<S>> {
    return factory(this._name)
      .query<S>(view, {
        startkey: startKey,
        endkey: endKey,
        include_docs: includeDocs
      })
      .catch(err => {
        if (err.name === 'not_found') {
          debug(`Design document '%s' is missing, generating views...`, view)

          /* istanbul ignore if  */
          if (this._setupPromise) {
            this._setupPromise.then(() => {
              return this.query(factory, view, startKey, endKey, includeDocs)
            })
          }

          this._setupPromise = this.initSetup(factory)

          return this._setupPromise.then(() => {
            debug('Created design documents')
            this._setupPromise = undefined
            return this.query(factory, view, startKey, endKey, includeDocs)
          })
        }
        throw err
      })
  }
  /**
   * Queries and maps docs to Entity objects
   * 
   * @param factory the pouch factory
   * @param view the view identifier
   * @param startKey the optional startkey
   * @param endKey the optional endkey
   */
  queryDocs(
    factory: PouchFactory<S>,
    view: V,
    startKey?: any,
    endKey?: any
  ): Promise<E[]> {
    return this.query(
      factory,
      view,
      startKey,
      endKey,
      true
    ).then(({ rows }) => {
      return rows.map(({ doc }) => new this._model(factory, doc as any))
    })
  }

  /**
   * Queries keys. Returns an array of emitted keys
   * 
   * @param factory the pouch factory
   * @param view the view identifier
   * @param startKey the optional startkey
   * @param endKey the optional endkey
   */
  queryKeys(
    factory: PouchFactory<S>,
    view: V,
    startKey?: any,
    endKey?: any
  ): Promise<string[]> {
    return this.query(
      factory,
      view,
      startKey,
      endKey,
      false
    ).then(({ rows }) => {
      return rows.map(({ key }) => key)
    })
  }

  /**
   * Queries keys/_id map. Returns a map of emitted keys/ID
   * 
   * @param factory the pouch factory
   * @param view the view identifier
   * @param startKey the optional startkey
   * @param endKey the optional endkey
   */
  queryKeysIDs(
    factory: PouchFactory<S>,
    view: V,
    startKey?: any,
    endKey?: any
  ): Promise<Dict<string>> {
    return this.query(
      factory,
      view,
      startKey,
      endKey,
      false
    ).then(({ rows }) => {
      return rows.reduce(
        (acc, { key, id }) => ({ ...acc, [key]: id }),
        {} as Dict<string>
      )
    })
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
   * Create a new model instance and save it to database
   * @param factory The database factory to attach to the model
   * @param props the entity properties
   * @returns an entity instance 
   */
  put(factory: PouchFactory<S>, props: Partial<S>) {
    const doc = new this._model(factory, props)
    return doc.save().then(() => doc)
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
      debug('Creating changes ')
      const changes = factory(this._name)
        .changes({
          since: 'now',
          live: true,
          include_docs: true
        })
        .on('change', ({ deleted, doc, id }) => {
          if (deleted || !doc) {
            return this.dispatch(factory, {
              type: ActionType.REMOVED,
              payload: { [this._name]: id },
              meta: {}
            })
          }
          if (doc._rev.match(/^1-/)) {
            return this.dispatch(factory, {
              type: ActionType.ADDED,
              payload: { [this._name]: doc },
              meta: { revision: doc._rev }
            })
          }
          return this.dispatch(factory, {
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

  /**
   * Creates view documents (if required)
   * @param factory 
   */
  async initSetup(factory: PouchFactory<S>) {
    await this.setupViews(factory)
  }

  protected getSubscriberFor(factory: PouchFactory<S>) {
    return this._subscribers.find(el => el.factory === factory)
  }

  protected dispatch(facto: PouchFactory<any>, action: ChangeAction<S>) {
    this._subscribers.forEach(
      ({ sub, factory }) => facto === factory && sub(action)
    )
  }

  private setupViews(factory: PouchFactory<S>): Promise<void> {
    const { views } = getProtoData(this._model.prototype)
    const db = factory(this._name)

    const promises = views.map(({ name, id, code }) => async () => {
      const views = {}
      let _rev

      try {
        const doc = (await db.get(`_design/${id}`)) as any

        if (doc.views[name] && doc.views[name].map === code) {
          // view already exists and is up-to-date
          return
        }

        Object.assign(views, doc.views)

        _rev = doc._rev
      } catch (err) {
        // Do nothing
      }

      await db.put(Object.assign(
        {},
        {
          _id: `_design/${id}`,
          views: {
            ...views,
            [name]: {
              map: code
            }
          }
        },
        _rev ? { _rev } : {}
      ) as any)
    })

    return promises.reduce((acc, fn) => {
      return acc.then(() => fn())
    }, Promise.resolve())
  }
}
