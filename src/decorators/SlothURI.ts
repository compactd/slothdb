import BaseEntity from '../models/BaseEntity'
import getSlothData from '../utils/getSlothData'
import { join } from 'path'

function readProp<T>(
  target: object,
  key: string,
  defaultValue?: T
): T | undefined {
  const { updatedProps, props } = getSlothData(target)
  if (key in updatedProps) {
    return (updatedProps as any)[key]
  }
  if (key in props) {
    return (props as any)[key]
  }
  return defaultValue
}

/**
 * 
 * @param prefix the URI root, a constant. Could be 'books' for a book entity
 * @param propsKeys key names from the props to pick
 */
export default function SlothURI<T>(prefix: string, ...propsKeys: (keyof T)[]) {
  return (target: object, key: string) => {
    const desc = Reflect.getOwnPropertyDescriptor(target, key)
    const defaultValue = desc ? desc.value : null

    if (desc) {
      if (desc.get || desc.set) {
        throw new Error('Cannot apply SlothURI on top of another decorator')
      }
    }

    Reflect.deleteProperty(target, key)

    Reflect.defineProperty(target, key, {
      get: () => {
        const { slug } = getSlothData(target)
        return join(
          prefix,
          ...propsKeys.map(propKey => {
            return slug(
              readProp(
                target,
                propKey,
                (Reflect.getOwnPropertyDescriptor(target, propKey) || {}).value
              )
            )
          })
        )
      },
      set: undefined
    })
  }
}
