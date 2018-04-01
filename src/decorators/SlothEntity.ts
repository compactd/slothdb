import BaseEntity from '../models/BaseEntity'
import SlothData from '../models/SlothData'
import slug from 'slug'
import StaticData from '../models/StaticData'

export interface Entity<S, T extends BaseEntity<S>> {
  new (idOrProps: Partial<S> | string): T
}
export default function SlothEntity<S extends { _id: string }, K>(
  name: string
) {
  return <T extends BaseEntity<S>>(constructor: Entity<S, T>) => {
    class WrappedEntity extends (constructor as Entity<any, any>) {
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
