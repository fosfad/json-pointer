import type { JsonPointer } from '../src/jsonPointer';
import {
  createStringFromJsonPointer,
  InvalidPointerSyntax,
  parseJsonPointerFromString,
  isValidJsonPointer,
  isJsonPointer,
} from '../src/jsonPointer';
import { getError } from './utils';

describe('isValidJsonPointer function', () => {
  describe('Valid JSON pointers', () => {
    describe('JSON String Representation of JSON Pointers', () => {
      test.each<[string]>([
        [''],
        ['/foo'],
        ['/foo/0'],
        ['/'],
        ['/a~1b'],
        ['/c%d'],
        ['/e^f'],
        ['/g|h'],
        ['/i\\j'],
        ['/k"l'],
        ['/ '],
        ['/m~0n'],
      ])('JSON Pointer `%s`', (jsonPointerString) => {
        expect(isValidJsonPointer(jsonPointerString)).toBe(true);
      });
    });
  });

  describe('Invalid JSON pointers', () => {
    test.each<[string]>([['foo'], ['#foo'], ['foo/'], ['#foo/'], ['##/']])('JSON Pointer `%s`', (jsonPointerString) => {
      expect(isValidJsonPointer(jsonPointerString)).toBe(false);
    });
  });
});

describe('parseJsonPointerFromString function', () => {
  test.each<[string, Array<string>]>([
    ['', []],
    ['/foo', ['foo']],
    ['/foo/0', ['foo', '0']],
    ['/', ['']],
    ['/a~1b', ['a/b']],
    ['/c%d', ['c%d']],
    ['/e^f', ['e^f']],
    ['/g|h', ['g|h']],
    ['/i\\j', ['i\\j']],
    ['/k"l', ['k"l']],
    ['/ ', [' ']],
    ['/m~0n', ['m~n']],
  ])('JSON Pointer `%s`', (jsonPointer, expectedReferenceTokens) => {
    expect(parseJsonPointerFromString(jsonPointer)).toEqual<JsonPointer>({
      referenceTokens: expectedReferenceTokens,
    });
  });

  describe('InvalidPointerSyntax error', () => {
    test.each<[string]>([['foo'], ['#foo'], ['foo/'], ['#foo/'], ['##/']])('JSON Pointer `%s`', (jsonPointerString) => {
      const error = getError(() => {
        parseJsonPointerFromString(jsonPointerString);
      });

      expect(error).toBeInstanceOf(InvalidPointerSyntax);
      expect(error).toHaveProperty('message', `JSON Pointer "${jsonPointerString}" has invalid pointer syntax`);
      expect(error).toHaveProperty('invalidJsonPointer', jsonPointerString);
    });
  });
});

describe('createStringFromJsonPointer function', () => {
  test.each<[Array<string>, string]>([
    [[], ''],
    [['foo'], '/foo'],
    [['foo', '0'], '/foo/0'],
    [[''], '/'],
    [['a/b'], '/a~1b'],
    [['c%d'], '/c%d'],
    [['e^f'], '/e^f'],
    [['g|h'], '/g|h'],
    [['i\\j'], '/i\\j'],
    [['k"l'], '/k"l'],
    [[' '], '/ '],
    [['m~n'], '/m~0n'],
  ])('Reference tokens `%p`', (referenceTokens, expectedJsonPointerString) => {
    expect(
      createStringFromJsonPointer({
        referenceTokens,
      }),
    ).toBe(expectedJsonPointerString);
  });
});

describe('isJsonPointer function', () => {
  test.each<[Array<unknown>, boolean]>([
    [[], true],
    [['', ''], true],
    [['abc', 'def'], true],
    [[123], false],
    [[true], false],
  ])('Reference tokens `%p`', (referenceTokens, expectedIsValid) => {
    expect(
      isJsonPointer({
        referenceTokens,
      }),
    ).toBe(expectedIsValid);
  });
});
