import Artist from './Artist'
import PouchDB from 'pouchdb'
import Album from './Album'
import Track from './Track'

PouchDB.plugin(require('pouchdb-adapter-memory'))

test("find artis's albums", async () => {
  const prefix = Date.now().toString(26) + '_'

  const factory = (name: string) =>
    new PouchDB(prefix + name, { adapter: 'memory' })

  const artist1 = Artist.create(factory, { name: 'artist 1' })
  await artist1.save()

  const artist2 = Artist.create(factory, { name: 'artist 2' })
  await artist2.save()

  const album1 = Album.create(factory, {
    artist: artist1._id,
    name: 'album 1'
  })
  await album1.save()

  const album2 = Album.create(factory, {
    artist: artist1._id,
    name: 'album 2'
  })
  await album2.save()

  const album3 = Album.create(factory, {
    artist: artist2._id,
    name: 'album 3'
  })
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

  const album1 = Album.create(factory, {
    artist: artist1._id,
    name: 'album 1'
  })
  await album1.save()

  const album2 = Album.create(factory, {
    artist: artist1._id,
    name: 'album 2'
  })
  await album2.save()

  const album3 = Album.create(factory, {
    artist: artist2._id,
    name: 'album 3'
  })
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

test('removes childrens children', async () => {
  const prefix = Date.now().toString(26) + '_'

  const factory = (name: string) =>
    new PouchDB(prefix + name, { adapter: 'memory' })

  const artist1 = Artist.create(factory, { name: 'artist 1' })
  await artist1.save()

  const artist2 = Artist.create(factory, { name: 'artist 2' })
  await artist2.save()

  const album1 = Album.create(factory, {
    artist: artist1._id,
    name: 'album 1'
  })
  await album1.save()

  const album2 = Album.create(factory, {
    artist: artist1._id,
    name: 'album 2'
  })
  await album2.save()

  const album3 = Album.create(factory, {
    artist: artist2._id,
    name: 'album 3'
  })
  await album3.save()

  const track1 = Track.create(factory, {
    name: 'track 1',
    album: album1._id,
    number: '01',
    artist: artist1._id
  })
  await track1.save()

  const track2 = Track.create(factory, {
    name: 'track 2',
    album: album1._id,
    number: '02',
    artist: artist1._id
  })
  await track2.save()

  const track3 = Track.create(factory, {
    name: 'track 3',
    album: album3._id,
    number: '01',
    artist: artist2._id
  })
  await track3.save()
  {
    const tracks = await artist1.tracks().findAllIDs(factory)

    expect(tracks).toEqual([
      'library/artist-1/album-1/01/track-1',
      'library/artist-1/album-1/02/track-2'
    ])
  }

  {
    const albums = await Album.findAllIDs(factory)
    const tracks = await Track.findAllIDs(factory)

    expect(albums).toEqual([
      'library/artist-1/album-1',
      'library/artist-1/album-2',
      'library/artist-2/album-3'
    ])
    expect(tracks).toEqual([
      'library/artist-1/album-1/01/track-1',
      'library/artist-1/album-1/02/track-2',
      'library/artist-2/album-3/01/track-3'
    ])
  }
  await artist1.remove()
  {
    const albums = await Album.findAllIDs(factory)
    const tracks = await Track.findAllIDs(factory)

    expect(albums).toEqual(['library/artist-2/album-3'])
    expect(tracks).toEqual(['library/artist-2/album-3/01/track-3'])
  }
})
