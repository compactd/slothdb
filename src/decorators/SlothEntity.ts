import BaseEntity from '../models/BaseEntity'
import SlothData from '../models/SlothData'

export default function SlothEntity<S extends { _id: string }>(name: string) {
  return (target: Function) => {
    return class WrappedEntity extends BaseEntity<S> {
      sloth: SlothData<S>

      constructor(idOrProps: Partial<S> | string) {
        super()
        if (typeof idOrProps === 'string') {
          this.sloth = {
            name,
            updatedProps: {},
            props: {},
            docId: idOrProps
          }
        } else {
          this.sloth = {
            name,
            updatedProps: {},
            props: idOrProps,
            docId: idOrProps._id
          }
        }
      }
    }
  }
}
