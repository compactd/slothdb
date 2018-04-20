import BaseEntity from '../models/BaseEntity'
import getSlothData from '../utils/getSlothData'
import { join } from 'path'
import getProtoData from '../utils/getProtoData'
import SlothView from './SlothView'

/**
 * Creates an index for a field. It's a view function that simply emits
 * the document key
 * 
 * @see [[SlothDatabase.queryDocs]]
 * @export
 * @template S 
 * @param {(doc: S, emit: Function) => void} fn the view function, as arrow or es5 function
 * @param {string} [docId='views'] the _design document identifier
 * @param {string} [viewId] the view identifier, default by_<property name>
 * @returns the decorator to apply on the field
 */
export default function SlothIndex<S, V extends string = string>(
  viewId?: V,
  docId?: string
) {
  return (target: object, key: string) => {
    const field = getProtoData(target).fields.find(field => field.key === key)

    if (!field) {
      throw new Error('Please use SlothIndex on top of a SlothField')
    }

    SlothView(
      new Function(
        'doc',
        'emit',
        `emit(doc['${field.docKey}'].toString());`
      ) as any,
      viewId,
      docId
    )(target, key)
  }
}
