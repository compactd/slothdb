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
    let defaultValue: T

    if (desc) {
      if (desc.get || desc.set) {
        throw new Error('Cannot apply SlothField on top of another decorator')
      }
    }

    const data = getProtoData(target, true)

    data.fields.push({ key, docKey })

    Reflect.deleteProperty(target, key)

    Reflect.defineProperty(target, key, {
      get: function(): T {
        const { updatedProps, props } = getSlothData(this)
        if (docKey in updatedProps) {
          return (updatedProps as any)[docKey]
        }
        if (docKey in props) {
          return (props as any)[docKey]
        }
        return defaultValue
      },
      set: function(value: T) {
        // Typescript calls this function before class decorator
        // Thus, when assigning default values in constructor we can get it and write it down
        // However this should only happen once to avoid missing bugs
        if (!('sloth' in this) && (!defaultValue || defaultValue === value)) {
          defaultValue = value
          return
        }

        Object.assign(getSlothData(this).updatedProps, { [docKey]: value })
      }
    })
  }
}
