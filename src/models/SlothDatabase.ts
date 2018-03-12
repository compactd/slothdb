import { JoiObject, validate, ValidationResult, ObjectSchema } from 'joi'
import PouchFactory from './PouchFactory'
import PouchDB from 'pouchdb'
import slug from 'slug'
import SlothURI from './SlothURI'

export interface SlothDatabasesOptions<T, P> {
  schema: ObjectSchema
  defaults?: Partial<T>
  factory?: PouchFactory
  name: string
  /**
   * Slugifies a string, removing spaces etc
   * @param str the string to slugify
   */
  slug?: (str: string) => string
  uri: SlothURI<P>
}

export default class SlothDatabase<T, P> {
  opts: SlothDatabasesOptions<T, P>

  constructor(opts: SlothDatabasesOptions<T, P>) {
    this.opts = Object.assign(
      {
        factory: (name: string) => new PouchDB(name),
        slug: (str: string) =>
          slug(str, {
            replacement: '-',
            symbols: true,
            remove: null,
            lower: true,
            charmap: slug.defaults.charmap,
            multicharmap: slug.defaults.multicharmap
          }),
        defaults: {}
      },
      opts
    )
  }
}
