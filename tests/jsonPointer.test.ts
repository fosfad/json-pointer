import type { JsonPointer } from '../src/jsonPointer';
import {
  createStringFromJsonPointer,
  InvalidPointerSyntax,
  parseJsonPointerFromString,
  isValidJsonPointer,
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

    describe('URI Fragment Identifier Representation of JSON Pointers', () => {
      test.each<[string]>([
        ['#'],
        ['#/foo'],
        ['#/foo/0'],
        ['#/'],
        ['#/a~1b'],
        ['#/c%25d'],
        ['#/e%5Ef'],
        ['#/g%7Ch'],
        ['#/i%5Cj'],
        ['#/k%22l'],
        ['#/%20'],
        ['#/m~0n'],
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
  describe('JSON String Representation of JSON Pointers', () => {
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
        uriFragmentIdentifierRepresentation: false,
      });
    });
  });

  describe('URI Fragment Identifier Representation of JSON Pointers', () => {
    test.each<[string, Array<string>]>([
      ['#', []],
      ['#/foo', ['foo']],
      ['#/foo/0', ['foo', '0']],
      ['#/', ['']],
      ['#/a~1b', ['a/b']],
      ['#/c%25d', ['c%d']],
      ['#/e%5Ef', ['e^f']],
      ['#/g%7Ch', ['g|h']],
      ['#/i%5Cj', ['i\\j']],
      ['#/k%22l', ['k"l']],
      ['#/%20', [' ']],
      ['#/m~0n', ['m~n']],
    ])('JSON Pointer `%s`', (jsonPointerString, expectedReferenceTokens) => {
      expect(parseJsonPointerFromString(jsonPointerString)).toEqual<JsonPointer>({
        referenceTokens: expectedReferenceTokens,
        uriFragmentIdentifierRepresentation: true,
      });
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
  describe('JSON String Representation of JSON Pointers', () => {
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
          uriFragmentIdentifierRepresentation: false,
        }),
      ).toBe(expectedJsonPointerString);
    });
  });

  describe('URI Fragment Identifier Representation of JSON Pointers', () => {
    test.each<[Array<string>, string]>([
      [[], '#'],
      [['foo'], '#/foo'],
      [['foo', '0'], '#/foo/0'],
      [[''], '#/'],
      [['a/b'], '#/a~1b'],
      [['c%d'], '#/c%25d'],
      [['e^f'], '#/e%5Ef'],
      [['g|h'], '#/g%7Ch'],
      [['i\\j'], '#/i%5Cj'],
      [['k"l'], '#/k%22l'],
      [[' '], '#/%20'],
      [['m~n'], '#/m~0n'],
    ])('Reference tokens `%p`', (referenceTokens, expectedJsonPointerString) => {
      expect(
        createStringFromJsonPointer({
          referenceTokens,
          uriFragmentIdentifierRepresentation: true,
        }),
      ).toBe(expectedJsonPointerString);
    });
  });
});
