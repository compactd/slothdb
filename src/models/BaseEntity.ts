import PouchFactory from './PouchFactory'
import getSlothData from '../utils/getSlothData'
import getProtoData from '../utils/getProtoData'
import Dict from '../helpers/Dict'
import { RelationDescriptor } from './relationDescriptors'
import { join } from 'path'

/**
 * Base abstract entity, for all entitoies
 * The generic parameter S is the schema of the document
 * @typeparam S the document schema
 */
export default class BaseEntity<S> {
  _id: string = ''
  // tslint:disable-next-line:no-empty
  constructor(factory: PouchFactory<S>, idOrProps: Partial<S> | string) {}

  /**
   * Returns whether this document hhas unsaved updated properties
   */
  isDirty() {
    const { docId, updatedProps } = getSlothData(this)

    return Object.keys(updatedProps).length > 0 || docId == null
  }

  /**
   * Saves document to database. If the document doesn't exist,
   * create it. If it exists, update it. If the _id was changed
   * (due to props changing), remove to old document and create a new one
   * 
   * @returns a Promise resolving into document props
   *   - If the document was updated, the _rev prop would be defined
   *     and start with an index greater than 1
   *   - If the document was created, the _rev prop would be defined
   *     and start with 1
   *   - If the document was not updated, because it is not dirty,
   *     then no _rev property is returned
   */
  async save(): Promise<S & { _rev?: string }> {
    const { fields } = getProtoData(this, false)

    const props: S = fields
      .map(({ key }) => {
        return { [key]: (this as any)[key] }
      })
      .reduce((acc, val) => ({ ...acc, ...val }), {}) as any

    if (!this.isDirty()) {
      return props as S
    }

    const { factory, name, docId } = getSlothData(this)
    const db = factory(name)

    try {
      const { _rev } = await db.get(this._id)

      const { rev } = await db.put(Object.assign({}, props, { _rev }))

      getSlothData(this).docId = this._id

      return Object.assign({}, props, { _rev: rev })
    } catch (err) {
      // Then document was not found

      if (err.name === 'not_found') {
        if (docId) {
          // We need to delete old doc
          const originalDoc = await db.get(docId)
          await db.remove(originalDoc)

          getSlothData(this).docId = this._id
        }
        const { rev, id } = await db.put(props)

        getSlothData(this).docId = this._id

        return Object.assign({}, props, { _rev: rev })
      }

      throw err
    }
  }
  /**
   * Remove a document from the database
   * @returns a Promise that resolves into a boolean, true if document was removed,
   *          false if the document doesn't have a docId in its slothdata
   */
  async remove() {
    const { docId, factory, name } = getSlothData(this)

    if (!docId) {
      return false
    }

    const db = factory(name)
    const { _rev } = await db.get(docId)

    await db.remove(docId, _rev)

    getSlothData(this).docId = undefined

    await this.removeRelations()

    return true
  }

  /**
   * @private
   */
  removeRelations() {
    const { rels } = getProtoData(this, false)

    return Promise.all(
      rels.map(rel => this.removeEntityRelation(rel))
    ).then(() => {
      return
    })
  }

  protected getProp(key: string) {
    return (this as any)[key]
  }

  protected getRelationDescriptor(
    keyName: keyof S
  ): RelationDescriptor & { key: string } {
    const { rels } = getProtoData(this)
    const rel = rels.find(rel => {
      return rel.key === keyName
    })

    return rel!
  }

  protected getRelationEntity(keyName: keyof S) {
    const rel = this.getRelationDescriptor(keyName)
    const { factory } = getSlothData(this)

    if ('belongsTo' in rel) {
      return rel.belongsTo().findById(factory, this.getProp(keyName))
    }

    throw new Error(
      `Cannot use getRelationEntity on ${keyName} as hasMany relation`
    )
  }

  private async removeEntityRelation(
    rel: RelationDescriptor & { key: string }
  ) {
    const { factory, name } = getSlothData(this)

    if ('belongsTo' in rel && rel.cascade) {
      const relId = this.getProp(rel.key)

      const children = await factory(name).allDocs({
        include_docs: false,
        startkey: join(relId, '/'),
        endkey: join(relId, '/\uffff')
      })
      if (children.rows.length === 0) {
        try {
          const parent = await this.getRelationEntity(rel.key as any)

          await parent.remove()
        } catch (err) {
          if (err.message === 'missing') {
            return
          }
          throw err
        }
      }
    }

    if ('hasMany' in rel && rel.cascade !== false) {
      const db = rel.hasMany().withRoot(this._id)
      const children = await db.findAllDocs(factory)

      await Promise.all(children.map(child => child.remove()))
    }
  }
}
