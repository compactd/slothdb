import BaseEntity from '../models/BaseEntity'
import SlothData from '../models/SlothData'
import slug from 'slug'
import StaticData from '../models/StaticData'

/**
 * This decorator is used to mark classes that will be an entity, a document
 * This function, by extending the constructor and defining this.sloth property
 * effectively allows the usage of other property decorators
 * @param name The database name for this entity
 * @typeparam S The database schema
 */
export default function SlothEntity<S extends { _id: string }>(name: string) {
  return <T extends BaseEntity<S>>(constructor: {
    new (idOrProps: Partial<S> | string): T
  }) => {
    class WrappedEntity extends (constructor as {
      new (idOrProps: Partial<any> | string): any
    }) {
      sloth: SlothData<S>
      constructor(idOrProps: Partial<S> | string) {
        super(idOrProps)
        if (typeof idOrProps === 'string') {
          this.sloth = {
            name,
            updatedProps: {},
            props: {},
            docId: idOrProps,
            slug
          }
        } else {
          this.sloth = {
            name,
            updatedProps: {},
            props: idOrProps,
            docId: idOrProps._id,
            slug
          }
        }
      }
    }
    return WrappedEntity as any
  }
}
