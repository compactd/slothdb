import BaseEntity from '../models/BaseEntity'
import getSlothData from '../utils/getSlothData'
import getProtoData from '../utils/getProtoData'
import { RelationDescriptor } from '../models/relationDescriptors'
import SlothDatabase from '../models/SlothDatabase'

/**
 * 
 * SlothRel is used to indicate that a specific string property
 * corresponds to another entity identifier. The possible relations are:
 * 
 *   - belongsTo: one or several entities belongs to a parent entity
 * 
 * @see [[RelationDescriptor]]
 * @param rel the relation description
 */
export default function SlothRel(rel: RelationDescriptor) {
  return function(this: any, target: object, key: string) {
    const desc = Reflect.getOwnPropertyDescriptor(target, key)

    function readProp(this: any, target: any = this) {
      const { updatedProps, props } = getSlothData(target)
      if (key in updatedProps) {
        return (updatedProps as any)[key]
      }
      return (props as any)[key]
    }

    if (desc) {
      if (desc.get || desc.set) {
        throw new Error('Cannot apply SlothRel on top of another decorator')
      }
    }

    const { fields, rels } = getProtoData(target, true)

    fields.push({ key })
    rels.push({ ...rel, key })

    if ('belongsTo' in rel) {
      const { name } = getProtoData(rel.belongsTo()._model.prototype)

      if (!name) {
        throw new Error(`Name is undefined or empty`)
      }
    }

    Reflect.deleteProperty(target, key)

    Reflect.defineProperty(target, key, {
      get: readProp,
      set: function(value: string) {
        // Typescript calls this function before class decorator
        // Thus, when assigning default values in constructor we can get it and write it down
        // However this should only happen once to avoid missing bugs
        if (value === '') {
          return
        }

        Object.assign(getSlothData(this).updatedProps, { [key]: value })
      }
    })
  }
}
