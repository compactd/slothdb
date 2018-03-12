import SlothURI from '../models/SlothURI'

const docuri = require('docuri')

export default class DocURI<P> implements SlothURI<P> {
  private route: any
  constructor(uri: string) {
    this.route = docuri.route(uri)
  }
  parse(str: string) {
    return this.route(str)
  }
  stringify(props: P) {
    return this.route(props)
  }
}
