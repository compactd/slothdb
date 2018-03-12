import PouchDB from 'pouchdb'
/**
 * PouchFactory is a class that creates PouchDB instances
 * using the opts provided
 */
export default interface PouchFactory {
  create: (name: string) => PouchDB.Database
}
