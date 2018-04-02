import PouchDB from 'pouchdb'

PouchDB.plugin(require('pouchdb-adapter-memory'))

export default function localPouchFactory(name: string) {
  return new PouchDB<any>(name, {
    adapter: 'memory'
  })
}
