import type { JsonPointer } from '../src/jsonPointer';
import { parseJsonPointerFromString } from '../src/jsonPointer';

describe('parseJsonPointerFromString function', () => {
  /**
   * JSON String Representation of JSON Pointers.
   */
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

  /**
   * URI Fragment Identifier Representation of JSON Pointers.
   */
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
