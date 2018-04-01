type PouchFactory<S> = (name: string) => PouchDB.Database<S>

export default PouchFactory
