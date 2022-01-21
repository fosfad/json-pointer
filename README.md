# JSON Pointer

This package contains TypeScript implementation for [JavaScript Object Notation (JSON) Pointer (RFC 6901)](https://datatracker.ietf.org/doc/html/rfc6901), also known as **JSON Pointer**.

If you are looking for Relative JSON Pointer implementation, check out [@fosfad/relative-json-pointer](https://github.com/fosfad/relative-json-pointer) package.

**At this moment the package is not stable.** We are thinking and experimenting with its design and API. Breaking changes are possible. Do not use it in production!

## What is JSON Pointer

JSON Pointer defines a string syntax for identifying a specific value within a JSON document.

Take a look at following JSON document:

```json
{
  "song": {
    "author": "State Azure",
    "title": "Fragments",
    "tags": ["ambient", "drone"]
  }
}
```

If we need to point to `"Fragments"` value, JSON Pointer will look like `/song/title`. If we want to point to `"drone"` value, then JSON Pointer will look like `/song/tags/1`.

### JSON String Representation and URI Fragment Identifier Representation

JSON Pointer may have 2 representations: **JSON String Representation** and **URI Fragment Identifier Representation**:

- **JSON String Representation** means JSON Pointer string should be formatted as a value suitable for being placed into JSON strings: `{"someFieldThatContainsPointer": "/song/tags/1"}`. All instances of quotation mark `"`, reverse solidus `\`, and control (%x00-1F) characters must be escaped.
- **URI Fragment Identifier Representation** means JSON Pointer string should be formatted as a value suitable for being placed into URI fragment: `https://example.com/song.json#/song/tags/1`. It starts with `#` and percent-encoding is applied to some characters that are not allowed within URI fragments.

## Usage

### Installation

This package is available in [npm Registry](https://www.npmjs.com/package/@fosfad/json-pointer):

```bash
npm install @fosfad/json-pointer
```

### API

#### Managing JSON Pointer

The package exposes `JsonPointer` type. It's simple object with only 1 field:

- `referenceTokens` (array of strings) - reference tokens separated by a `/` character, also known as path segments. Empty array means JSON Pointer points to the whole document

There is no need to build this object manually, there are some helper functions described below.

##### `parseJsonPointerFromString` function

Parses input string into `JsonPointer` object.

Passing invalid string to the method will result into `InvalidPointerSyntax` error.

Usage examples:

```typescript
import { parseJsonPointerFromString } from '@fosfad/json-pointer';

const jsonPointer = parseJsonPointerFromString('/foo/bar/hello world');

console.log(jsonPointer.referenceTokens); // Output: [ 'foo', 'bar', 'hello world' ]
```

##### `createStringFromJsonPointer` function

Creates a string from `JsonPointer` object.

Usage examples:

```typescript
import { createStringFromJsonPointer } from '@fosfad/json-pointer';

const jsonPointerString = createStringFromJsonPointer({
  referenceTokens: ['foo', 'bar', 'hello world'],
});

console.log(jsonPointerString); // Output: /foo/bar/hello world
```

##### `isValidJsonPointer` function

Validates input string to be valid JSON Pointer.

Usage examples:

```typescript
import { isValidJsonPointer } from '@fosfad/json-pointer';

console.log(isValidJsonPointer('')); // Output: true
console.log(isValidJsonPointer('/')); // Output: true
console.log(isValidJsonPointer('foo')); // Output: false
console.log(isValidJsonPointer('#foo')); // Output: false

// The package does not support URI Fragment Identifier Representation,
// see FAQ below
console.log(isValidJsonPointer('#')); // Output: false
console.log(isValidJsonPointer('#/')); // Output: false
```

##### `escapeReferenceToken` function

Escapes reference token according to the specification.

Transformations made by the function in following order:

1. `~` → `~0`
2. `/` → `~1`

Usage examples:

```typescript
import { escapeReferenceToken } from '@fosfad/json-pointer';

console.log(escapeReferenceToken('hello world')); // Output: hello world
console.log(escapeReferenceToken('hello~world')); // Output: hello~0world
console.log(escapeReferenceToken('hello/world')); // Output: hello~1world
```

##### `unescapeReferenceToken` function

Unescapes reference token according to the specification.

Transformations made by the function in following order:

1. `~1` → `/`
2. `~0` → `~`

Usage examples:

```typescript
import { unescapeReferenceToken } from '@fosfad/json-pointer';

console.log(unescapeReferenceToken('hello%20world')); // Output: hello%20world
console.log(unescapeReferenceToken('hello~0world')); // Output: hello~world
console.log(unescapeReferenceToken('hello~1world')); // Output: hello/world
```

#### Processing JSON documents

Functions for processing JSON Pointers are designed to work only with JSON-like JavaScript structures, like those returned by [`JSON.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) method. If these functions meet [`undefined`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined), [`Function`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function) or [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) types or [`Infinity`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Infinity) and [`NaN`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN) numbers, then behavior is not clear because these types and values are not explicitly supported by the library. It may be changed in the future, so you may [create an issue](https://github.com/fosfad/json-pointer/issues) describing your use case why you and others may need it.

##### `getValueAtJsonPointer` function

Gets value from JSON by JSON Pointer. This method accepts JSON, JSON Pointer (it may be a string or `JsonPointer` object) and returns JSON value resolved by given Pointer.

If JSON Pointer references a nonexistent value, `PointerReferencesNonexistentValue` error will be thrown.

Usage examples:

```typescript
import {
  JsonPointer,
  parseJsonPointerFromString,
  getValueAtJsonPointer,
  PointerReferencesNonexistentValue,
} from '@fosfad/json-pointer';

const json = {
  song: {
    author: 'State Azure',
    title: 'Fragments',
    tags: ['ambient', 'drone'],
  },
};

console.log(getValueAtJsonPointer(json, parseJsonPointerFromString('/song/tags/1'))); // Output: drone

console.log(getValueAtJsonPointer(json, '')); // Output: { song: { author: 'State Azure', title: 'Chill Impromtu', tags: [ 'ambient', 'drone' ] } }
console.log(getValueAtJsonPointer(json, '/song')); // Output: { author: 'State Azure', title: 'Chill Impromtu', tags: [ 'ambient', 'drone' ] }
console.log(getValueAtJsonPointer(json, '/song')); // Output: State Azure
console.log(getValueAtJsonPointer(json, '/song/tags')); // Output: [ 'ambient', 'drone' ]
console.log(getValueAtJsonPointer(json, '/song/tags/1')); // Output: drone

try {
  getValueAtJsonPointer(json, '/foo/bar');
} catch (error: unknown) {
  if (error instanceof PointerReferencesNonexistentValue) {
    const jsonPointerString = createStringFromJsonPointer(error.jsonPointer);
    const nonexistentValueJsonPointerString = createStringFromJsonPointer(error.nonexistentValueJsonPointer);

    console.log(`Pointer ${jsonPointerString} references nonexistent value: ${nonexistentValueJsonPointerString}`);
  }
}
```

##### `valueExistsAtJsonPointer` function

Checks value exists in JSON at given JSON Pointer. This method accepts JSON, JSON Pointer (it may be a string or `JsonPointer` object) and returns boolean that indicates does value exist or not.

Usage examples:

```typescript
import {
  JsonPointer,
  createStringFromJsonPointer,
  getValueAtJsonPointer,
  PointerReferencesNonexistentValue,
} from '@fosfad/json-pointer';

const json = {
  song: {
    author: 'State Azure',
    title: 'Fragments',
    tags: ['ambient', 'drone'],
  },
};

console.log(
  valueExistsAtJsonPointer(
    json,
    createStringFromJsonPointer({
      referenceTokens: ['song', 'tags', '1'],
    }),
  ),
); // Output: true

console.log(valueExistsAtJsonPointer(json, '')); // Output: true
console.log(valueExistsAtJsonPointer(json, '/song')); // Output: true
console.log(valueExistsAtJsonPointer(json, '/song')); // Output: true
console.log(valueExistsAtJsonPointer(json, '/song/tags')); // Output: true
console.log(valueExistsAtJsonPointer(json, '/song/tags/1')); // Output: true

console.log(valueExistsAtJsonPointer(json, '/foo/bar')); // Output: false
```

### FAQ

#### Is URI Fragment Identifier Representation supported?

No. You should remove `#` from the beginning of the string and then decode string with [`decodeURI()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURI) function.
