# SlothDB

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Greenkeeper badge](https://badges.greenkeeper.io/compactd/slothdb.svg)](https://greenkeeper.io/)
[![Travis](https://img.shields.io/travis/compactd/slothdb.svg)](https://travis-ci.org/compactd/slothdb)
[![Coveralls](https://img.shields.io/coveralls/compactd/slothdb.svg)](https://coveralls.io/github/compactd/slothdb)

A typescript ORM that uses annotation and classes to describe the database

### Features

 - Built using annotations
 - Simple field support (update and read doc values)
 - URI fields - string fields which value depends on other fields
 - Versatile PouchDB support
 - Views and index support
 - Relation support : oneToMany, manyToOne and cascading removal

### Usage

```ts
interface IAuthor {
  _id: string,
  name: string
}

@SlothEntity('author')
class AuthorEntity extends BaseEntity<IAuthor> {
  @SlothURI('library', 'author')
  _id: string = ''

  @SlothField()
  name: string = 'Unknown'
}

export const Author =  new SlothDatabase<IAuthor, AuthorEntity>(AuthorEntity)

interface IBook {
  _id: string,
  name: string,
  author: string
}

export enum BookViews {
  ByName = 'views/by_name'
}

@SlothEntity('book')
class BookEntity extend BaseEntity<IBook> {
  @SlothURI('library', 'author', 'name')
  _id: string = ''

  @SlothIndex()
  @SlothField()
  name: string = 'Unknown'
  
  @SlothRel({belongsTo: Author})
  author: string = 'library/unknown'
}

export const Book = new SlothDatabase<IBook, BookEntity, BookViews>(BookEntity)
```
Then to use

```ts
const jrrTolkien = Author.create({name: 'JRR Tolkien'})

jrrTolkien._id === 'library/jrr-tolkien'
jrrTolkien.name === 'JRR Tolkien'

await jrrTolkien.exists() === false
await jrrTolkien.save()
await jrrTolkien.exists() === true

const lotr = Book.create({name: 'The Lord Of The Rings', author: jrrTolkien._id})

lotr._id === 'library/jrr-tolkien/the-lord-of-the-rings'

const golding = await Author.put({name: 'William Golding'})

await golding.exists() === true

await Book.put({name: 'The Lord of The Flies', author: golding._id})

const booksStartingWithLord = await Author.queryDocs(BookViews.ByName, 'The Lord of The')
booksStartingWithLord.length === 2

```

### NPM scripts

 - `npm t`: Run test suite
 - `npm start`: Run `npm run build` in watch mode
 - `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
 - `npm run test:prod`: Run linting and generate coverage
 - `npm run build`: Generate bundles and typings, create docs
 - `npm run lint`: Lints code
 - `npm run commit`: Commit using conventional commit style ([husky](https://github.com/typicode/husky) will tell you to use it if you haven't :wink:)
