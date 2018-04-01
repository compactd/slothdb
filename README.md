# SlothDB

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Greenkeeper badge](https://badges.greenkeeper.io/compactd/slothdb.svg)](https://greenkeeper.io/)
[![Travis](https://img.shields.io/travis/compactd/slothdb.svg)](https://travis-ci.org/compactd/slothdb)
[![Coveralls](https://img.shields.io/coveralls/compactd/slothdb.svg)](https://coveralls.io/github/compactd/slothdb)

A typescript ORM that uses annotation and classes to describe the database

### Philosophy

Since SlothDB is WIP, this is only a rough sketch 

```ts
@SlothEntity('author')
class Author extends BaseEntity<{_id: string, name: string}> {
  @SlothURI('library', 'author')
  _id: string = ''

  @SlothField()
  name: string = 'Unknown'
}

@SlothEntity('book')
class Book extend BaseEntity<{_id: string, name: string, author: string}> {
  @SlothURI('library', 'author', 'name')
  _id: string = ''

  @SlothField()
  name: string = 'Unknown'

  @SlothRel({belongsTo: Author})
  author: string = 'library/unknown'
}
```
### NPM scripts

 - `npm t`: Run test suite
 - `npm start`: Run `npm run build` in watch mode
 - `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
 - `npm run test:prod`: Run linting and generate coverage
 - `npm run build`: Generate bundles and typings, create docs
 - `npm run lint`: Lints code
 - `npm run commit`: Commit using conventional commit style ([husky](https://github.com/typicode/husky) will tell you to use it if you haven't :wink:)
