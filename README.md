# JSON Pointer

This package contains TypeScript implementation for [JavaScript Object Notation (JSON) Pointer (RFC 6901)](https://datatracker.ietf.org/doc/html/rfc6901), also known as **JSON Pointer**. All features described by the specification are supported, both representations of JSON Pointer supported too: **JSON String Representation** and **URI Fragment Identifier Representation**.

**At this moment the package is not stable.** We are thinking and experimenting with its design and API. Breaking changes are possible. Do not use it in production!

# Usage

This package is available in [npm Registry](https://www.npmjs.com/package/@fosfad/json-pointer):

```bash
npm install @fosfad/json-pointer
```

## `JsonPointer` value object

It represents JSON Pointer as value object.

Constructor of `JsonPointer` accepts 2 parameters:

- `referenceTokens` - array of reference tokens, also known as path segments;
- `usesUriFragmentIdentifierRepresentation` - should URI Fragment Identifier Representation be used or not. If value is `true`, JSON Pointer string representation will be prepended with `#` and percent-encoding will be applied to some characters.

It's also possible to create instance of `JsonPointer` class by invoking static factory method `JsonPointer.createFromString('/some/pointer')`, which accepts only JSON Pointer as string. This method will parse JSON Pointer string into reference tokens, and it will determine should URI Fragment Identifier Representation be used or not. Passing invalid string to the method will result into `InvalidPointerSyntax` error.

Example of creating `JsonPointer` using JSON String Representation:

```typescript
import { JsonPointer } from '@fosfad/json-pointer';

const jsonPointer = new JsonPointer(['foo', 'bar', 'hello world'], false);

console.log(jsonPointer.referenceTokens); // Output: [ 'foo', 'bar' , 'hello world' ]
console.log(jsonPointer.usesUriFragmentIdentifierRepresentation); // Output: false
console.log(jsonPointer.toString()); // Output: /foo/bar/hello world
```

```typescript
import { JsonPointer } from '@fosfad/json-pointer';

const jsonPointer = JsonPointer.createFromString('/foo/bar/hello world');

console.log(jsonPointer.referenceTokens); // Output: [ 'foo', 'bar' , 'hello world' ]
console.log(jsonPointer.usesUriFragmentIdentifierRepresentation); // Output: false
console.log(jsonPointer.toString()); // Output: /foo/bar/hello world
```

Example of creating `JsonPointer` using URI Fragment Identifier Representation:

```typescript
import { JsonPointer } from '@fosfad/json-pointer';

const jsonPointer = new JsonPointer(['foo', 'bar', 'hello world'], true);

console.log(jsonPointer.referenceTokens); // Output: [ 'foo', 'bar', 'hello world' ]
console.log(jsonPointer.usesUriFragmentIdentifierRepresentation); // Output: true
console.log(jsonPointer.toString()); // Output: #/foo/bar/hello%20world
```

```typescript
import { JsonPointer } from '@fosfad/json-pointer';

const jsonPointer = JsonPointer.createFromString('#/foo/bar/hello%20world');

console.log(jsonPointer.referenceTokens); // Output: [ 'foo', 'bar', 'hello world' ]
console.log(jsonPointer.usesUriFragmentIdentifierRepresentation); // Output: true
console.log(jsonPointer.toString()); // Output: #/foo/bar/hello%20world
```

## `resolveJsonPointer` method

This method allows you to resolve JSON Pointer references. This method accepts JSON, JSON Pointer and returns JSON value resolved by given Pointer. If JSON Pointer references a nonexistent value, `PointerReferencesNonexistentValue` error will be thrown.

Example of using `resolveJsonPointer` method:

```typescript
import {
  JsonPointer,
  resolveJsonPointer,
  PointerReferencesNonexistentValue,
} from '@fosfad/json-pointer';

const json = {
  song: {
    author: 'State Azure',
    title: 'Fragments',
    tags: ['ambient', 'drone'],
  },
};

console.log(resolveJsonPointer(json, JsonPointer.createFromString('/'))); // Output: { song: { author: 'State Azure', title: 'Chill Impromtu', tags: [ 'ambient', 'drone' ] } }
console.log(resolveJsonPointer(json, JsonPointer.createFromString('/song'))); // Output: { author: 'State Azure', title: 'Chill Impromtu', tags: [ 'ambient', 'drone' ] }
console.log(
  resolveJsonPointer(json, JsonPointer.createFromString('/song/author')),
); // Output: State Azure
console.log(
  resolveJsonPointer(json, JsonPointer.createFromString('/song/tags')),
); // Output: [ 'ambient', 'drone' ]
console.log(
  resolveJsonPointer(json, JsonPointer.createFromString('/song/tags/1')),
); // Output: drone

try {
  resolveJsonPointer(json, JsonPointer.createFromString('/foo/bar'));
} catch (error: unknown) {
  if (error instanceof PointerReferencesNonexistentValue) {
    console.log('Pointer references nonexistent value');
  }
}
```
