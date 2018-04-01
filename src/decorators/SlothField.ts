import BaseEntity from '../models/BaseEntity'
import getSlothData from '../utils/getSlothData'

export default function SlothField<T>() {
  return function(this: any, target: object, key: string) {
    const desc = Reflect.getOwnPropertyDescriptor(target, key)
    let defaultValue: T
    if (desc) {
      if (desc.get || desc.set) {
        throw new Error('Cannot apply SlothField on top of another decorator')
      }
    }

    Reflect.deleteProperty(target, key)

    Reflect.defineProperty(target, key, {
      get: function(): T {
        const { updatedProps, props } = getSlothData(this)
        if (key in updatedProps) {
          return (updatedProps as any)[key]
        }
        if (key in props) {
          return (props as any)[key]
        }
        return defaultValue
      },
      set: function(value: T) {
        // Typescript calls this function before class decorator
        // Thus, when assigning default values in constructor we can get it and write it down
        // However this should only happen once to avoid missing bugs
        if (!('sloth' in this) && !defaultValue) {
          defaultValue = value
          return
        }

        Object.assign(getSlothData(this).updatedProps, { [key]: value })
      }
    })
  }
}
