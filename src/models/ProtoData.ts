import { RelationDescriptor } from './relationDescriptors'
import SlothDatabase from './SlothDatabase'

/**
 * This object is available for every instance
 * 
 * @api private
 */
export default interface ProtoData {
  /**
   * A list of doc URIs
   * @see [[SlothURI]]
   */
  uris: {
    name: string
    prefix: string
    propsKeys: string[]
  }[]
  /**
   * Database name
   */
  name?: string
  /**
   * Fields
   */
  fields: {
    key: string
    docKey: string
  }[]

  views: {
    id: string
    name: string
    function: Function
    code: string
  }[]

  rels: (RelationDescriptor & { key: string })[]
}
