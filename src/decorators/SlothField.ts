import BaseEntity from '../models/BaseEntity'
import getSlothData from '../utils/getSlothData'

export default function SlothField<T>() {
  return (target: object, key: string) => {
    const desc = Reflect.getOwnPropertyDescriptor(target, key)
    const defaultValue = desc ? desc.value : null

    if (desc) {
      if (desc.get || desc.set) {
        throw new Error('Cannot apply SlothField on top of another decorator')
      }
    }

    Reflect.deleteProperty(target, key)

    Reflect.defineProperty(target, key, {
      get: (): T => {
        const { updatedProps, props } = getSlothData(target)
        if (key in updatedProps) {
          return (updatedProps as any)[key]
        }
        if (key in props) {
          return (props as any)[key]
        }
        return defaultValue
      },
      set: (value: T) => {
        Object.assign(getSlothData(target).updatedProps, { [key]: value })
      }
    })
  }
}
