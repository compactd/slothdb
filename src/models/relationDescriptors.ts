import SlothDatabase from './SlothDatabase'

/**
 * Describes a manyToOne or oneToOne relation where the entity
 * specified here is the parent and the entity owner is the child
 */
export type BelongsToDescriptor = {
  /**
   * Specify a database factory, a simple function that returns a database
   * This is useful for circular dependency
   * @type {SlothDatabase} the parent database factory
   */
  belongsTo: () => SlothDatabase<any, any>
  /**
   * Specify that no parent should have no children, so that whenever deleting
   * a child entity the parent is automatically deleted as well if it's  an only child
   * 
   * @type {boolean}
   */
  cascade?: boolean
}
/**
 * Describes a oneToMany relation where the entity
 * specified here is the child entity, and the entity owner
 * is the parent
 */
export type HasManyDescriptor = {
  /**
   * Specify a database factory, a simple function that returns a database
   * This is useful for circular dependency
   * 
   * @type {() => SlothDatabase} the child database factory
   */
  hasMany: () => SlothDatabase<any, any>

  /**
   * Specifies that whenever removing the parent entity, the children
   * should get removed as well
   * 
   * 
   * @type {boolean}
   */
  cascade?: boolean
}

/**
 * An relation descriptor, either hasMany or belongsTo
 * 
 * @see [[SlothRel]]
 */
export type RelationDescriptor = HasManyDescriptor | BelongsToDescriptor
