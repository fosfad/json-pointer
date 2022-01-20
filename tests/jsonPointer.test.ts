import type { JsonPointer } from '../src/jsonPointer';
import {
  createStringFromJsonPointer,
  InvalidPointerSyntax,
  parseJsonPointerFromString,
} from '../src/jsonPointer';

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
    ])('JSON Pointer `%s`', (jsonPointer, expectedValue) => {
      expect(parseJsonPointerFromString(jsonPointer)).toEqual<JsonPointer>({
        referenceTokens: expectedValue,
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
    ])('JSON Pointer `%s`', (jsonPointer, expectedValue) => {
      expect(parseJsonPointerFromString(jsonPointer)).toEqual<JsonPointer>({
        referenceTokens: expectedValue,
        uriFragmentIdentifierRepresentation: true,
      });
    });
  });

  describe('InvalidPointerSyntax error', () => {
    test.each<[string]>([['foo'], ['#foo'], ['foo/'], ['#foo/'], ['##/']])(
      'JSON Pointer `%s`',
      (jsonPointer) => {
        expect(() => {
          parseJsonPointerFromString(jsonPointer);
        }).toThrowError(InvalidPointerSyntax);
      },
    );
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
    ])('Reference tokens `%p`', (referenceTokens, expectedJsonPointer) => {
      expect(
        createStringFromJsonPointer({
          referenceTokens,
          uriFragmentIdentifierRepresentation: false,
        }),
      ).toBe(expectedJsonPointer);
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
    ])('Reference tokens `%p`', (referenceTokens, expectedJsonPointer) => {
      expect(
        createStringFromJsonPointer({
          referenceTokens,
          uriFragmentIdentifierRepresentation: true,
        }),
      ).toBe(expectedJsonPointer);
    });
  });
});
