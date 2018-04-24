import BaseEntity from '../models/BaseEntity'
import SlothData from '../models/SlothData'
import PouchFactory from '../models/PouchFactory'
import EntityConstructor from '../helpers/EntityConstructor'
import getProtoData from '../utils/getProtoData'
import ProtoData from '../models/ProtoData'

function mapPropsOrDocToDocument({ fields }: ProtoData, data: any) {
  if (typeof data === 'string') {
    return {}
  }
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
  }): EntityConstructor<S, T> => {
    const data = getProtoData(constructor.prototype, true)

    data.name = name

    const BaseEntity = constructor as EntityConstructor<any, any>

    return class WrappedEntity extends BaseEntity {
      constructor(factory: PouchFactory<S>, idOrProps: Partial<S> | string) {
        super(factory, idOrProps)
        this.sloth.props = mapPropsOrDocToDocument(
          getProtoData(this),
          idOrProps
        )
      }
    } as any
  }
}
