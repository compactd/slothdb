import StaticData from '../models/StaticData'

/**
 * Extract the StaticData from a class, creating it if needed
 * @see [[StaticData]]
 * @param obj the object to extract data from
 * @private
 */
export default function getDescData(obj: any) {
  const wrapped = obj as { desc: StaticData }

  if (!wrapped.desc) {
    wrapped.desc = {
      uris: []
    }
  }

  return wrapped.desc
}
