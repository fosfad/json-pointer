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
  ])('JSON Pointer `%s`', (jsonPointerString, expectedValue) => {
    expect(isValidJsonPointer(jsonPointerString)).toBe(true);
    expect(getValueAtJsonPointer(jsonHaystack, parseJsonPointerFromString(jsonPointerString))).toEqual(expectedValue);
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
    test.each<[string, unknown]>([
      ['/foo/1', 'bar'],
      ['/foo/5', 'baz'],
    ])('JSON Pointer `%s`', (jsonPointerString, expectedValue) => {
      expect(valueExistsAtJsonPointer(jsonHaystack, jsonPointerString)).toBe(true);
      expect(getValueAtJsonPointer(jsonHaystack, parseJsonPointerFromString(jsonPointerString))).toEqual(expectedValue);
    });
  });

  describe('Negative test cases', () => {
    test.each<[string, string]>([
      ['/foo/-1', '/foo/-1'],
      ['/foo/', '/foo/'],
      ['/foo/bar/baz', '/foo/bar'],
      ['/prototype', '/prototype'],
      ['/constructor', '/constructor'],
      ['/__proto__', '/__proto__'],
    ])('JSON Pointer `%s`', (jsonPointerString, nonexistentValueJsonPointerString) => {
      expect(valueExistsAtJsonPointer(jsonHaystack, jsonPointerString)).toBe(false);

      const error = getError(() => {
        getValueAtJsonPointer(jsonHaystack, parseJsonPointerFromString(jsonPointerString));
      });

      expect(error).toBeInstanceOf(PointerReferencesNonexistentValue);
      expect(error).toHaveProperty(
        'message',
        `JSON Pointer "${jsonPointerString}" is not valid because it references a nonexistent value: "${nonexistentValueJsonPointerString}"`,
      );
      expect(error).toHaveProperty('jsonPointer', parseJsonPointerFromString(jsonPointerString));
      expect(error).toHaveProperty(
        'nonexistentValueJsonPointer',
        parseJsonPointerFromString(nonexistentValueJsonPointerString),
      );
    });
  });
});
