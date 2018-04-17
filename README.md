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

#### Describing the document schema

Simply use an interface to describe the document schema, with at least an `_id` string field

#### Describing the entity class

The entity class needs to extend `BaseEntity` and requires the SlothEntity annotation (passing the database name).

```ts
@SlothEntity('students')
class StudentEnt extends BaseEntity<IStudent> {
```

#### Describing the fields

Add your document fields to the entity class and decorate them using `SlothField`. The assigned value will be used as a default value.

```ts
@SlothField()
age: number = 18
```

####  Describing your URIs

It is common practice to generate string URIs from the other document values and use it as an `_id` or on other indices for easier sorting and relationship description (especially oneToMany). The SlothURI decorator takes at least two arguments: the first one is the root, which is a constant string value. Using the database name when not describing relation is recommended. For example `students/john-doe` has the `students` root, but does not describe any relationship. If your document belongs to a parent document then a root that includes all documents types would be recommended, for example `university` would cover students, marks and courses. The other values are field names, included in you document, to be used to build the URI in the following order. Each specified field will then be stringified and slugified using `toString()` and `limax`.
For example:

```
@SlothURI('students', 'surname', 'name')
_id: string = ''
```

Please note we are assigning a default value to the `_id` field that will get ignored.

This is the equivalent of a `students/:surname/:name` DocURI.

#### PouchDB Factory

A [PouchFactory](https://compactd.github.io/slothdb/globals.html#pouchfactory) is a simple function that returns a PouchDB instance for a given database name. Every function in [`SlothDatabase`](https://compactd.github.io/slothdb/classes/slothdatabase.html) except `withRoot` requires as an argument a PouchFactory. Entities are attached a PouchFactory in the constructor, so the entity functions (`save()`, `remove()`, etc) does not require  a factory. A simple factory would be `(name: string) => new PouchDB(name)`

#### Database operations

```ts
const author1 = Author.create(factory, {...})

await author.save()

author.age = 42

await author.save()

await author.remove()
```

#### Relationships

SlothDB supports for now one type of relationship: belongsTo/oneToMany (which is the same relationship, but with a different perspective).

The annotation [`SlothRel`](https://compactd.github.io/slothdb/globals.html#slothrel) can be used on the field that describes a belongsTo relationship, that-is-to-say the field value is a string representing the parent document `_id` field. The SlothField decorator is not usable with this annotation. If the target field is included in SlothURI, then the string value of this field (which is the `_id` of the parent document) will have its root removed in order to include it in the URI. The value is not slugified using limax, so `/` are not escaped. For example `students/mit/john-doe` will become `mit/john-doe` and a mark URI for this student would become `marks/mit/john-doe/chemistry/2018-04-20` whereas the original URI has only 3 parts (student, course, date).

To describe a belongsTo relationship you can use SlothRel with a `belongsTo` object:

```ts
@SlothRel({belongsTo: () => Student})
student_id: string = ''
```

The `belongsTo` value is just a simple function that returns the parent SlothDatabase instance, to avoid circular dependency conflicts. 

If the `cascade` option is not present or `true`, removing all child document of a single parent will also remove the parent.

The annotation SlothRel can also be used on a non-document field, with the `hasMany` function, which returns the SlothDatabase instance of the child entity. The target field is a function that returns a child instance. This function should null, the annotation will replace it with an impl:

```ts
@SlothRel({ hasMany: () => Album })
albums: () => Album
```

The SlothRel uses the `withRoot` function of `SlothDatabase` which return a SlothDatabase that prefixes the startkey argument of the allDocs calls with the current document `_id` hence the id needs to be described using the same root and the first key of the child's `_id` must be the parent id field.

#### Views and indexes

The [`SlothView`](https://compactd.github.io/slothdb/globals.html#slothview) annotation describes a CouchDB map function. It takes as an argument a function `(doc, emit) => void`, the view name (default to `by_<field name>`) and the optional design document identifier (default to `views`). Please note that this function does not modify any behavior of the target, so the decorated field requires another decorator (like [`SlothField`](https://compactd.github.io/slothdb/globals.html#slothfield) or [`SlothURI`](https://compactd.github.io/slothdb/globals.html#slothuri)) and the choice of the decorated field is purely semantic and decorating another field will only change the view name. **Depending on the typescript target, you might want to use es5 functions** (avoid fat-arrow functions).

The [`SlothIndex`](https://compactd.github.io/slothdb/globals.html#slothindex) is a function that applies the SlothView decorator with `emit(doc['${key}'].toString())` as a function to create a basic index on the decorated field.

The [`SlothDatabase`](https://compactd.github.io/slothdb/classes/slothdatabase.html) class takes as a third generic argument extending a string that describes the possible view values. The [`queryDocs`](https://compactd.github.io/slothdb/classes/slothdatabase.html#querydocs) function then takes as an argument the string constrained by the generic parameter. It is then recommended to use an enum to identify views:

```ts
enum AuthorView {
  byName = 'views/by_name'
  byAge = 'views/by_age'
}

...

const Author = new SlothDatabase<IAuthor, AuthorEntity, AuthorView>(AuthorEntity)

const seniorAuthors = await Author.queryDocs(factory, AuthorView.byAge, 60, 130)
```


## Full example


```ts
interface IAuthor {
  _id: string,
  name: string
}

@SlothEntity('authors')
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

@SlothEntity('books')
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
const jrrTolkien = Author.create(factory, {name: 'JRR Tolkien'})

jrrTolkien._id === 'library/jrr-tolkien'
jrrTolkien.name === 'JRR Tolkien'

await jrrTolkien.exists() === false
await jrrTolkien.save()
await jrrTolkien.exists() === true

const lotr = Book.create(factory, {name: 'The Lord Of The Rings', author: jrrTolkien._id})

lotr._id === 'library/jrr-tolkien/the-lord-of-the-rings'

const golding = await Author.put(factory, {name: 'William Golding'})

await golding.exists() === true

await Book.put(factory, {name: 'The Lord of The Flies', author: golding._id})

const booksStartingWithLord = await Author.queryDocs(factory, BookViews.ByName, 'The Lord of The')
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
