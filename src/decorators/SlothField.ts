import BaseEntity from '../models/BaseEntity'
import getSlothData from '../utils/getSlothData'
import getProtoData from '../utils/getProtoData'

/**
 * SlothField decorator is used to mark a specific class property
 * as a document key. This introduces a few behaviors:
 *  - setting the value in the constructor (or directly alongside declaration)
 *    will set its default value
 *  - mutating the value will update it in updatedProps
 *  - accessing the value will first look into updatedProps, then props and then default values
 * @typeparam T the value type
 * @param docKeyName specifies the document key name, default to prop key name
 */
export default function SlothField<T>(docKeyName?: string) {
  return function(this: any, target: object, key: string) {
    const docKey = docKeyName || key

    const desc = Reflect.getOwnPropertyDescriptor(target, key)

    if (desc) {
      if (desc.get || desc.set) {
        throw new Error('Cannot apply SlothField on top of another decorator')
      }
    }

    const data = getProtoData(target, true)

    data.fields.push({ key, docKey })

    Reflect.deleteProperty(target, key)

    Reflect.defineProperty(target, key, {
      enumerable: true,
      get: function(): T | undefined {
        const { updatedProps, props = {}, defaultProps } = getSlothData(this)
        if (docKey in updatedProps) {
          return (updatedProps as any)[docKey]
        }
        if (docKey in props) {
          return (props as any)[docKey]
        }
        return (defaultProps as any)[docKey]
      },
      set: function(value: T) {
        const { props, defaultProps, updatedProps } = getSlothData<any>(this)

        if (!props) {
          defaultProps[docKey] = value

          return
        }

        if (docKey in defaultProps && value == null) {
          delete props[docKey]
          delete updatedProps[docKey]

          return
        }

        Object.assign(updatedProps, { [docKey]: value })
      }
    })
  }
}
