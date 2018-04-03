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

  expect(betterOffDead._id).toBe('library/Flatbush-Zombies/BetterOffDead')
})

test('updated uri', async () => {
  const dbName = Date.now().toString(26)

  const factory = () => new PouchDB(dbName, { adapter: 'memory' })

  const flatbushZombies = Artist.create(factory, { name: 'Flatbush Zombies' })

  const betterOffDead = Album.create(factory, {
    name: 'BetterOffDead',
    artist: 'library/flatbush'
  })
  expect(betterOffDead._id).toBe('library/flatbush/BetterOffDead')

  betterOffDead.artist = 'library/Flatbush-Zombies'

  expect(betterOffDead._id).toBe('library/Flatbush-Zombies/BetterOffDead')
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

  expect(await db.get('library/Flatbush-Zombies/BetterOffDead')).toMatchObject({
    _id: 'library/Flatbush-Zombies/BetterOffDead',
    artist: 'library/Flatbush-Zombies'
  })

  expect(await db.get('library/Flatbush-Zombies')).toMatchObject({
    _id: 'library/Flatbush-Zombies',
    name: 'Flatbush Zombies'
  })

  await betterOffDead.remove()
  await expect(db.get('library/Flatbush-Zombies')).rejects.toMatchObject({
    message: 'missing'
  })
  await expect(
    db.get('library/Flatbush-Zombies/BetterOffDead')
  ).rejects.toMatchObject({ message: 'missing' })
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

  expect(await db.get('library/Flatbush-Zombies/BetterOffDead')).toMatchObject({
    _id: 'library/Flatbush-Zombies/BetterOffDead',
    artist: 'library/Flatbush-Zombies'
  })

  expect(
    await db.get('library/Flatbush-Zombies/Vacation-In-Hell')
  ).toMatchObject({
    _id: 'library/Flatbush-Zombies/Vacation-In-Hell',
    artist: 'library/Flatbush-Zombies'
  })

  expect(await db.get('library/Flatbush-Zombies')).toMatchObject({
    _id: 'library/Flatbush-Zombies',
    name: 'Flatbush Zombies'
  })

  await betterOffDead.remove()

  expect(
    await db.get('library/Flatbush-Zombies/Vacation-In-Hell')
  ).toMatchObject({
    _id: 'library/Flatbush-Zombies/Vacation-In-Hell',
    artist: 'library/Flatbush-Zombies'
  })

  expect(await db.get('library/Flatbush-Zombies')).toMatchObject({
    _id: 'library/Flatbush-Zombies',
    name: 'Flatbush Zombies'
  })

  await expect(
    db.get('library/Flatbush-Zombies/BetterOffDead')
  ).rejects.toMatchObject({ message: 'missing' })
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

  expect(flatbush._id).toBe('library/Flatbush-Zombies')
  expect(flatbush.name).toBe('Flatbush Zombies')
})
