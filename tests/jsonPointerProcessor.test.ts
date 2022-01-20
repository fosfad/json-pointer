import {
  PointerReferencesNonexistentValue,
  getValueAtJsonPointer,
  valueExistsAtJsonPointer,
} from '../src/jsonPointerProcessor';
import { isValidJsonPointer, parseJsonPointerFromString } from '../src/jsonPointer';
import { getError } from './utils';

/**
 * Following test cases were taken from {@link https://datatracker.ietf.org/doc/html/rfc6901 | JavaScript Object Notation (JSON) Pointer (RFC 6901) specification}.
 */
describe('Positive test cases from the specification', () => {
  const jsonHaystack = {
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
   * JSON String Representation of JSON Pointers.
   */
  test.each<[string, unknown]>([
    ['', jsonHaystack],
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
    expect(isValidJsonPointer(absoluteJsonPointer)).toBe(true);
    expect(getValueAtJsonPointer(jsonHaystack, parseJsonPointerFromString(absoluteJsonPointer))).toEqual(expectedValue);
  });

  /**
   * URI Fragment Identifier Representation of JSON Pointers.
   */
  test.each<[string, unknown]>([
    ['#', jsonHaystack],
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
  ])('JSON Pointer `%s`', (absoluteJsonPointer, expectedValue) => {
    expect(valueExistsAtJsonPointer(jsonHaystack, absoluteJsonPointer)).toBe(true);
    expect(getValueAtJsonPointer(jsonHaystack, parseJsonPointerFromString(absoluteJsonPointer))).toEqual(expectedValue);
  });
});

describe('Custom test cases', () => {
  const jsonHaystack = {
    foo: {
      1: 'bar',
      5: 'baz',
    },
  };

  describe('Positive test cases', () => {
    /**
     * JSON String Representation of JSON Pointers.
     */
    test.each<[string, unknown]>([
      ['/foo/1', 'bar'],
      ['/foo/5', 'baz'],
    ])('JSON Pointer `%s`', (absoluteJsonPointer, expectedValue) => {
      expect(valueExistsAtJsonPointer(jsonHaystack, absoluteJsonPointer)).toBe(true);
      expect(getValueAtJsonPointer(jsonHaystack, parseJsonPointerFromString(absoluteJsonPointer))).toEqual(
        expectedValue,
      );
    });
  });

  describe('Negative test cases', () => {
    /**
     * JSON String Representation of JSON Pointers.
     */
    test.each<[string, string]>([
      ['/foo/-1', '/foo/-1'],
      ['/foo/', '/foo/'],
      ['/foo/bar/baz', '/foo/bar'],
      ['/prototype', '/prototype'],
      ['/constructor', '/constructor'],
      ['/__proto__', '/__proto__'],
    ])('JSON Pointer `%s`', (absoluteJsonPointer, nonexistentValueJsonPointer) => {
      expect(valueExistsAtJsonPointer(jsonHaystack, absoluteJsonPointer)).toBe(false);

      const error = getError(() => {
        getValueAtJsonPointer(jsonHaystack, parseJsonPointerFromString(absoluteJsonPointer));
      });

      expect(error).toBeInstanceOf(PointerReferencesNonexistentValue);
      expect(error).toHaveProperty('jsonPointer', parseJsonPointerFromString(absoluteJsonPointer));
      expect(error).toHaveProperty(
        'nonexistentValueJsonPointer',
        parseJsonPointerFromString(nonexistentValueJsonPointer),
      );
    });
  });
});
