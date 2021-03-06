import BaseEntity from '../models/BaseEntity'
import getSlothData from '../utils/getSlothData'
import { join } from 'path'
import getProtoData from '../utils/getProtoData'

/**
 * The SlothURI decorator describes a class parameter that has no intrisic value
 * but which value depends on the other properties described as a path.
 * 
 * The path has a root value, which is a constant and should be either the database name 
 * pluralized, or a namespace. For example in library management system, the root could be
 * either `library` or `books`. It is  recommended to use a namespace for relational
 * databases and the database name for orphans.
 * 
 * The path components, following the root, should be slugified properties of the entity.
 * If the path needs to include another entity identifier, as often it needs to be in relational
 * database, then the root of the other entity id should be omitted, but path separator (/) 
 * should NOT be escaped;, even in URLs. The path components are described using their property names.
 * 
 * @param prefix the URI root
 * @param propsKeys key names to pick from the document
 * @typeparam S the document schema
 */
export default function SlothURI<S>(prefix: string, ...propsKeys: (keyof S)[]) {
  return (target: object, key: string) => {
    const desc = Reflect.getOwnPropertyDescriptor(target, key)

    if (desc) {
      if (desc.get || desc.set) {
        throw new Error('Cannot apply SlothURI on top of another decorator')
      }
    }

    Reflect.deleteProperty(target, key)
    const { uris, fields } = getProtoData(target, true)

    uris.push({
      name: key,
      prefix,
      propsKeys
    })

    fields.push({ key, docKey: key })

    Reflect.defineProperty(target, key, {
      get: function() {
        const { slug } = getSlothData(this)

        return join(
          prefix,
          ...propsKeys.map(propKey => {
            const value = (this as any)[propKey]

            if (!value) {
              throw new Error(
                `Key ${propKey} has no value, but is required for the ${key} URI`
              )
            }

            const { rels } = getProtoData(target)
            const relation = rels.find(({ key }) => key === propKey)

            if (relation && 'belongsTo' in relation) {
              const splat: string[] = (value as string).split('/')

              if (splat.length > 1) {
                return splat.slice(1).join('/')
              }

              throw new Error(`URI '${value}' is invalid'`)
            }

            return slug(value.toString())
          })
        )
      },
      set: function(val: string) {
        if (val === '') {
          return
        }
        throw new Error(`Property ${key} is not writable`)
      }
    })
  }
}
