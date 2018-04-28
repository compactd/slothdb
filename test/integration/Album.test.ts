import PouchDB from 'pouchdb'
import Artist from './Artist'
import Album from './Album'

import { transpileModule } from 'typescript'
const { compilerOptions } = require('../../tsconfig.json')

PouchDB.plugin(require('pouchdb-adapter-memory'))

test('typescript transpiles', () => {
  transpileModule('./Album.ts', { compilerOptions })
})

test('generate uri', async () => {
  const dbName = Date.now().toString(26)

  const factory = () => new PouchDB(dbName, { adapter: 'memory' })

  const flatbushZombies = Artist.create(factory, { name: 'Flatbush Zombies' })

  const betterOffDead = Album.create(factory, {
    name: 'BetterOffDead',
    artist: flatbushZombies._id
  })

  expect(betterOffDead._id).toBe('library/flatbush-zombies/betteroffdead')
})

test('updated uri', async () => {
  const dbName = Date.now().toString(26)

  const factory = () => new PouchDB(dbName, { adapter: 'memory' })

  const flatbushZombies = Artist.create(factory, { name: 'Flatbush Zombies' })

  const betterOffDead = Album.create(factory, {
    name: 'BetterOffDead',
    artist: 'library/flatbush'
  })
  expect(betterOffDead._id).toBe('library/flatbush/betteroffdead')

  betterOffDead.artist = 'library/flatbush-zombies'

  expect(betterOffDead._id).toBe('library/flatbush-zombies/betteroffdead')
})

test('remove parent if last child is removed', async () => {
  const dbName = Date.now().toString(26)
  const db = new PouchDB(dbName, { adapter: 'memory' })

  const factory = () => new PouchDB(dbName, { adapter: 'memory' })

  const flatbushZombies = Artist.create(factory, { name: 'Flatbush Zombies' })

  await flatbushZombies.save()

  const betterOffDead = Album.create(factory, {
    name: 'BetterOffDead',
    artist: flatbushZombies._id
  })

  await betterOffDead.save()

  expect(await db.get('library/flatbush-zombies/betteroffdead')).toMatchObject({
    _id: 'library/flatbush-zombies/betteroffdead',
    artist: 'library/flatbush-zombies'
  })

  expect(await db.get('library/flatbush-zombies')).toMatchObject({
    _id: 'library/flatbush-zombies',
    name: 'Flatbush Zombies'
  })

  await betterOffDead.remove()
  await expect(db.get('library/flatbush-zombies')).rejects.toMatchObject({
    message: 'missing'
  })
  await expect(
    db.get('library/flatbush-zombies/betteroffdead')
  ).rejects.toMatchObject({
    message: 'missing'
  })
})

test('doesnt remove parent if still has children', async () => {
  const dbName = Date.now().toString(26)
  const db = new PouchDB(dbName, { adapter: 'memory' })

  const factory = () => new PouchDB(dbName, { adapter: 'memory' })

  const flatbushZombies = Artist.create(factory, { name: 'Flatbush Zombies' })

  await flatbushZombies.save()

  const betterOffDead = Album.create(factory, {
    name: 'BetterOffDead',
    artist: flatbushZombies._id
  })

  await betterOffDead.save()

  const vacationInHell = Album.create(factory, {
    name: 'Vacation In Hell',
    artist: flatbushZombies._id
  })

  await vacationInHell.save()

  expect(await db.get('library/flatbush-zombies/betteroffdead')).toMatchObject({
    _id: 'library/flatbush-zombies/betteroffdead',
    artist: 'library/flatbush-zombies'
  })

  expect(
    await db.get('library/flatbush-zombies/vacation-in-hell')
  ).toMatchObject({
    _id: 'library/flatbush-zombies/vacation-in-hell',
    artist: 'library/flatbush-zombies'
  })

  expect(await db.get('library/flatbush-zombies')).toMatchObject({
    _id: 'library/flatbush-zombies',
    name: 'Flatbush Zombies'
  })

  await betterOffDead.remove()

  expect(
    await db.get('library/flatbush-zombies/vacation-in-hell')
  ).toMatchObject({
    _id: 'library/flatbush-zombies/vacation-in-hell',
    artist: 'library/flatbush-zombies'
  })

  expect(await db.get('library/flatbush-zombies')).toMatchObject({
    _id: 'library/flatbush-zombies',
    name: 'Flatbush Zombies'
  })

  await expect(
    db.get('library/flatbush-zombies/betteroffdead')
  ).rejects.toMatchObject({
    message: 'missing'
  })
})

test('rels.artist - maps with artist', async () => {
  const dbName = Date.now().toString(26)
  const db = new PouchDB(dbName, { adapter: 'memory' })

  const factory = () => new PouchDB(dbName, { adapter: 'memory' })

  const flatbushZombies = Artist.create(factory, { name: 'Flatbush Zombies' })

  await flatbushZombies.save()

  const betterOffDead = Album.create(factory, {
    name: 'BetterOffDead',
    artist: flatbushZombies._id
  })

  const flatbush = await betterOffDead.rels.artist(factory)

  expect(flatbush._id).toBe('library/flatbush-zombies')
  expect(flatbush.name).toBe('Flatbush Zombies')
})

test('joinURIParams', () => {
  expect(
    Album.joinURIParams({ name: 'betteroffdead', artist: 'flatbush-zombies' })
  ).toBe('library/flatbush-zombies/betteroffdead')
})
