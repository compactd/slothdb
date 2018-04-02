import ProtoData from '../models/ProtoData'

/**
 * Extract the ProtoData from a class prototype,
 * possibly creating it if needed
 * @see [[ProtoData]]
 * @param obj the object to extract data from
 * @param createIfNotFound create the protoData if it is undefined
 * @private
 */
export default function getProtoData(
  obj: any,
  createIfNotFound: boolean = true
) {
  const wrapped = obj as { __protoData?: ProtoData }

  if (!wrapped.__protoData) {
    if (createIfNotFound) {
      wrapped.__protoData = {
        uris: [],
        fields: []
      }
    } else {
      throw new Error(`Object ${wrapped} has no __protoData`)
    }
  }

  return wrapped.__protoData
}
