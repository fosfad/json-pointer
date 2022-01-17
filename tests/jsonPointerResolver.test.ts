import { resolveJsonPointer } from '../src/jsonPointerResolver';
import { JsonPointer } from '../src/jsonPointer';

const jsonFromSpec = {
  foo: ['bar', 'baz'],
  '': 0,
  'a/b': 1,
  'c%d': 2,
  'e^f': 3,
  'g|h': 4,
  'i\\j': 5,
  'k"l': 6,
  ' ': 7,
  'm~n': 8,
};

/**
 * Following test cases were taken from {@link https://datatracker.ietf.org/doc/html/rfc6901 | JavaScript Object Notation (JSON) Pointer (RFC 6901) specification}.
 */
test.each<[string, unknown]>([
  ['#', jsonFromSpec],
  ['#/foo', ['bar', 'baz']],
  ['#/foo/0', 'bar'],
  ['#/', 0],
  ['#/a~1b', 1],
  ['#/c%25d', 2],
  ['#/e%5Ef', 3],
  ['#/g%7Ch', 4],
  ['#/i%5Cj', 5],
  ['#/k%22l', 6],
  ['#/%20', 7],
  ['#/m~0n', 8],
  ['', jsonFromSpec],
  ['/foo', ['bar', 'baz']],
  ['/foo/0', 'bar'],
  ['/', 0],
  ['/a~1b', 1],
  ['/c%d', 2],
  ['/e^f', 3],
  ['/g|h', 4],
  ['/i\\j', 5],
  ['/k"l', 6],
  ['/ ', 7],
  ['/m~0n', 8],
])('JSON Pointer `%s`', (absoluteJsonPointer, expectedValue) => {
  const json = jsonFromSpec;

  expect(
    resolveJsonPointer(json, JsonPointer.createFromString(absoluteJsonPointer)),
  ).toEqual(expectedValue);
});
