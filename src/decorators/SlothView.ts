import BaseEntity from '../models/BaseEntity'
import getSlothData from '../utils/getSlothData'
import { join } from 'path'
import getProtoData from '../utils/getProtoData'

/**
 * Creates a view for a field. This function does not modify the 
 * behavior of the current field, hence requires another decorator
 * such as SlothURI or SlothField.  The view  will be created by the SlothDatabase
 * 
 * @export
 * @template S 
 * @param {(doc: S, emit: Function) => void} fn the view function, as arrow or es5 function
 * @param {string} [docId='views'] the _design document identifier
 * @param {string} [viewId] the view identifier, default by_<property name>
 * @returns the decorator to apply on the field
 */
export default function SlothView<S, V extends string = string>(
  fn: (doc: S, emit: Function) => void,
  viewId?: V,
  docId = 'views'
) {
  return (target: object, key: string) => {
    const desc = Reflect.getOwnPropertyDescriptor(target, key)

    if (desc) {
      if (!desc.get && !desc.set) {
        throw new Error('Required SlothView on top of another decorator')
      }
    }

    const fun = `function (__doc) { 
      (${fn.toString()})(__doc, emit);
    }`

    const { views } = getProtoData(target, true)

    views.push({
      id: docId,
      name: viewId || `by_${key}`,
      function: fn,
      code: fun
    })
  }
}
