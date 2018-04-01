/**
 * Represents that is not inherent to each entity,
 * but needed by each one
 * Available statically
 * @api private
 */
export default interface StaticData {
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
  name: string
}
