/**
 * Represents the inherent sloth data for each entity
 * It is available via this
 * @api private
 * @typeparam S the document schema
 */
export default interface SlothData<S> {
  /**
   * Database name, described by SlothEntity
   * @see [[SlothEntity]]
   */
  name: string
  /**
   * Loaded properties from database or constructor
   */
  props: Partial<S>
  /**
   * Properties updated at runtime
   */
  updatedProps: Partial<S>
  /**
   * Original document _id, only populated if passed in constructor
   */
  docId?: string
  /**
   * A slug function that slugifies a string, should move this
   */
  slug: (str: string) => string
}
