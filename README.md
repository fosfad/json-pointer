# JSON Pointer

This package contains TypeScript implementation for [JavaScript Object Notation (JSON) Pointer (RFC 6901)](https://datatracker.ietf.org/doc/html/rfc6901), also known as **JSON Pointer**. All features described by the specification are supported, both representations of JSON Pointer supported too: **JSON String Representation** and **URI Fragment Identifier Representation**.

**At this moment the package is not stable.** We are thinking and experimenting with its design and API. Breaking changes are possible. Do not use it in production!

# Usage

## Installation

This package is available in [npm Registry](https://www.npmjs.com/package/@fosfad/json-pointer):

```bash
npm install @fosfad/json-pointer
```

## API

### Managing JSON Pointer

The package exposes `JsonPointer` type. It's simple object with only 2 fields:

- `referenceTokens` (array of strings) - reference tokens, also known as path segments. If array is empty, it represents entire JSON document.
- `uriFragmentIdentifierRepresentation` (boolean) - does this JSON Pointer use URI Fragment Identifier Representation. If value is `true`, JSON Pointer string representation will be prepended with `#` and percent-encoding will be applied to some characters.

There is no need to build this object manually, there are some helper functions described below.

#### `parseJsonPointerFromString` function

It parses input string into `JsonPointer` object. Passing invalid string to the method will result into `InvalidPointerSyntax` error.

Usage examples:

```typescript
import { parseJsonPointerFromString } from '@fosfad/json-pointer';

const jsonPointer = parseJsonPointerFromString('/foo/bar/hello world');

console.log(jsonPointer.referenceTokens); // Output: [ 'foo', 'bar', 'hello world' ]
console.log(jsonPointer.usesUriFragmentIdentifierRepresentation); // Output: false
```

```typescript
import { parseJsonPointerFromString } from '@fosfad/json-pointer';

const jsonPointer = parseJsonPointerFromString('#/foo/bar/hello%20world');

console.log(jsonPointer.referenceTokens); // Output: [ 'foo', 'bar' , 'hello world' ]
console.log(jsonPointer.usesUriFragmentIdentifierRepresentation); // Output: true
```

#### `createStringFromJsonPointer` function

It creates a string from `JsonPointer` object.

Usage examples:

```typescript
import { createStringFromJsonPointer } from '@fosfad/json-pointer';

const jsonPointerString = createStringFromJsonPointer(
  ['foo', 'bar', 'hello world'],
  false,
);

console.log(jsonPointerString); // Output: /foo/bar/hello world
```

```typescript
import { createStringFromJsonPointer } from '@fosfad/json-pointer';

const jsonPointerString = createStringFromJsonPointer(
  ['foo', 'bar', 'hello world'],
  true,
);

console.log(jsonPointerString); // Output: #/foo/bar/hello%20world
```

#### `escapeReferenceToken` function

Escapes reference token according to the specification.

Transformations made by the function in following order:

1. `~` → `~0`
2. `/` → `~1`

If second argument `uriFragmentIdentifierRepresentation` is `true`, percent-decoding with `decodeURIComponent` will be applied too.

Usage examples:

```typescript
import { escapeReferenceToken } from '@fosfad/json-pointer';

const escapedReferenceToken1 = escapeReferenceToken('hello world', false);
const escapedReferenceToken2 = escapeReferenceToken('hello~world', false);
const escapedReferenceToken3 = escapeReferenceToken('hello/world', false);

console.log(escapedReferenceToken1); // Output: hello world
console.log(escapedReferenceToken2); // Output: hello~0world
console.log(escapedReferenceToken3); // Output: hello~1world
```

```typescript
import { escapeReferenceToken } from '@fosfad/json-pointer';

const escapedReferenceToken1 = escapeReferenceToken('hello world', true);
const escapedReferenceToken2 = escapeReferenceToken('hello~world', true);
const escapedReferenceToken3 = escapeReferenceToken('hello/world', true);

console.log(escapedReferenceToken1); // Output: hello%20world
console.log(escapedReferenceToken2); // Output: hello~0world
console.log(escapedReferenceToken3); // Output: hello~1world
```

#### `unescapeReferenceToken` function

Unescapes reference token according to the specification.

Transformations made by the function in following order:

1. `~1` → `/`
2. `~0` → `~`

If second argument `uriFragmentIdentifierRepresentation` is `true`, percent-encoding with `encodeURIComponent` will be applied too.

Usage examples:

```typescript
import { unescapeReferenceToken } from '@fosfad/json-pointer';

const unescapedReferenceToken1 = unescapeReferenceToken('hello%20world', false);
const unescapedReferenceToken2 = unescapeReferenceToken('hello~0world', false);
const unescapedReferenceToken3 = unescapeReferenceToken('hello~1world', false);

console.log(unescapedReferenceToken1); // Output: hello%20world
console.log(unescapedReferenceToken2); // Output: hello~world
console.log(unescapedReferenceToken3); // Output: hello/world
```

```typescript
import { unescapeReferenceToken } from '@fosfad/json-pointer';

const unescapedReferenceToken1 = unescapeReferenceToken('hello%20world', true);
const unescapedReferenceToken2 = unescapeReferenceToken('hello~0world', true);
const unescapedReferenceToken3 = unescapeReferenceToken('hello~1world', true);

console.log(unescapedReferenceToken1); // Output: hello world
console.log(unescapedReferenceToken2); // Output: hello~world
console.log(unescapedReferenceToken3); // Output: hello/world
```

### Processing JSON documents

Functions for processing JSON Pointers are designed to work only with JSON-like JavaScript structures, like those returned by [`JSON.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) method. It means these functions may work incorrectly if used with complex JavaScript objects, for example, if some properties of passed object contain functions.

#### `getValueByJsonPointer` function

This method allows you to resolve JSON Pointer references. This method accepts JSON, JSON Pointer (it may be a string or `JsonPointer` object) and returns JSON value resolved by given Pointer. If JSON Pointer references a nonexistent value, `PointerReferencesNonexistentValue` error will be thrown.

Usage example:

```typescript
import {
  JsonPointer,
  createStringFromJsonPointer,
  getValueByJsonPointer,
  PointerReferencesNonexistentValue,
} from '@fosfad/json-pointer';

const json = {
  song: {
    author: 'State Azure',
    title: 'Fragments',
    tags: ['ambient', 'drone'],
  },
};

console.log(getValueByJsonPointer(json, '/')); // Output: { song: { author: 'State Azure', title: 'Chill Impromtu', tags: [ 'ambient', 'drone' ] } }
console.log(getValueByJsonPointer(json, '/song')); // Output: { author: 'State Azure', title: 'Chill Impromtu', tags: [ 'ambient', 'drone' ] }
console.log(getValueByJsonPointer(json, '/song')); // Output: State Azure
console.log(getValueByJsonPointer(json, '/song/tags')); // Output: [ 'ambient', 'drone' ]
console.log(getValueByJsonPointer(json, '/song/tags/1')); // Output: drone

const jsonPointer = createStringFromJsonPointer('/song/tags/1');

console.log(getValueByJsonPointer(json, jsonPointer)); // Output: drone

try {
  getValueByJsonPointer(json, '/foo/bar');
} catch (error: unknown) {
  if (error instanceof PointerReferencesNonexistentValue) {
    const jsonPointerString = createStringFromJsonPointer(error.jsonPointer);
    const nonexistentValueJsonPointerString = createStringFromJsonPointer(
      error.nonexistentValueJsonPointer,
    );

    console.log(
      `Pointer ${jsonPointerString} references nonexistent value: ${nonexistentValueJsonPointerString}`,
    );
  }
}
```
