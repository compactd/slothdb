import Artist from './Artist'
import PouchDB from 'pouchdb'
import Album from './Album'

PouchDB.plugin(require('pouchdb-adapter-memory'))

test("find artis's albums", async () => {
  const prefix = Date.now().toString(26) + '_'

  const factory = (name: string) =>
    new PouchDB(prefix + name, { adapter: 'memory' })

  const artist1 = Artist.create(factory, { name: 'artist 1' })
  await artist1.save()

  const artist2 = Artist.create(factory, { name: 'artist 2' })
  await artist2.save()

  const album1 = Album.create(factory, { artist: artist1._id, name: 'album 1' })
  await album1.save()

  const album2 = Album.create(factory, { artist: artist1._id, name: 'album 2' })
  await album2.save()

  const album3 = Album.create(factory, { artist: artist2._id, name: 'album 3' })
  await album3.save()

  const artist1Albums = await artist1.albums().findAllIDs(factory)

  expect(artist1Albums).toEqual([
    'library/artist-1/album-1',
    'library/artist-1/album-2'
  ])
})

test('removes children', async () => {
  const prefix = Date.now().toString(26) + '_'

  const factory = (name: string) =>
    new PouchDB(prefix + name, { adapter: 'memory' })

  const artist1 = Artist.create(factory, { name: 'artist 1' })
  await artist1.save()

  const artist2 = Artist.create(factory, { name: 'artist 2' })
  await artist2.save()

  const album1 = Album.create(factory, { artist: artist1._id, name: 'album 1' })
  await album1.save()

  const album2 = Album.create(factory, { artist: artist1._id, name: 'album 2' })
  await album2.save()

  const album3 = Album.create(factory, { artist: artist2._id, name: 'album 3' })
  await album3.save()

  const artist1Albums = await artist1.albums().findAllIDs(factory)

  expect(artist1Albums).toEqual([
    'library/artist-1/album-1',
    'library/artist-1/album-2'
  ])

  await artist1.remove()

  const albums = await Album.findAllIDs(factory)

  expect(albums).toEqual(['library/artist-2/album-3'])
})
