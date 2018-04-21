import SlothData from '../models/SlothData'
import { inspect } from 'util'

/**
 * Extract sloth data from an entity instance,
 * throwing an exception if it can't be found
 * @param obj the class instance to extract from
 * @typeparam S the entity schema
 * @private
 */
export default function getSlothData<S>(obj: object) {
  const wrapped = obj as { sloth: SlothData<S> }

  if (!wrapped.sloth) {
    throw new Error(`Class ${wrapped} does not extend SlothEntity`)
  }

  return wrapped.sloth
}
