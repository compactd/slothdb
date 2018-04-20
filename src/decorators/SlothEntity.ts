import BaseEntity from '../models/BaseEntity'
import SlothData from '../models/SlothData'
import StaticData from '../models/StaticData'
import PouchFactory from '../models/PouchFactory'
import EntityConstructor from '../helpers/EntityConstructor'
import getProtoData from '../utils/getProtoData'
import ProtoData from '../models/ProtoData'

const slug = require('limax')

function mapPropsOrDocToDocument({ fields }: ProtoData, data: any) {
  return fields.reduce(
    (props, { key, docKey }) => {
      if (!(key in data) && !(docKey in data)) {
        return props
      }
      if (key in data && docKey in data && key !== docKey) {
        throw new Error(`Both '${key}' and '${docKey}' exist on ${data}`)
      }
      return Object.assign({}, props, {
        [docKey]: key in data ? data[key] : data[docKey]
      })
    },
    {} as any
  )
}

/**
 * This decorator is used to mark classes that will be an entity, a document
 * This function, by extending the constructor and defining this.sloth property
 * effectively allows the usage of other property decorators
 * @param name The database name for this entity
 * @typeparam S The database schema
 */
export default function SlothEntity<S extends { _id: string }>(name: string) {
  return <T extends BaseEntity<S>>(constructor: {
    new (factory: PouchFactory<S>, idOrProps: Partial<S> | string): T
  }) => {
    const constr = (constructor as any) as { desc: StaticData }

    constr.desc = { name }

    const data = getProtoData(constructor.prototype, true)

    data.name = name

    class WrappedEntity extends (constructor as EntityConstructor<any, any>) {
      sloth: SlothData<S>

      constructor(factory: PouchFactory<S>, idOrProps: Partial<S> | string) {
        super(factory, idOrProps)
        if (typeof idOrProps === 'string') {
          this.sloth = {
            name,
            updatedProps: {},
            props: {},
            docId: idOrProps,
            factory,
            slug
          }
        } else {
          this.sloth = {
            name,
            updatedProps: {},
            props: mapPropsOrDocToDocument(getProtoData(this), idOrProps),
            docId: idOrProps._id,
            factory,
            slug
          }
        }
      }
    }
    return WrappedEntity as any
  }
}
