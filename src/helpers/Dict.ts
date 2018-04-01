/**
 * Simple key value map
 * @typeparam V value type
 * @private
 */
export default interface Dict<V> {
  [name: string]: V
}
