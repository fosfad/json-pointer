import type { JsonPointer } from './jsonPointer';
import {
  createStringFromJsonPointer,
  parseJsonPointerFromString,
} from './jsonPointer';

export type Json = JsonArray | JsonObject | boolean | number | string | null;
type JsonArray = Array<Json>;
type JsonObject = { [property: string]: Json };

export class PointerReferencesNonexistentValue extends Error {
  public readonly jsonPointer: JsonPointer;
  public readonly nonexistentValueJsonPointer: JsonPointer;

  constructor(
    jsonPointer: JsonPointer,
    nonexistentValueJsonPointer: JsonPointer,
  ) {
    const jsonPointerString = createStringFromJsonPointer(jsonPointer);
    const nonexistentValueJsonPointerString = createStringFromJsonPointer(
      nonexistentValueJsonPointer,
    );

    super(
      `JSON Pointer ${jsonPointerString} is not valid because it references a nonexistent value: ${nonexistentValueJsonPointerString}`,
    );

    this.jsonPointer = jsonPointer;
    this.nonexistentValueJsonPointer = nonexistentValueJsonPointer;

    Object.setPrototypeOf(this, PointerReferencesNonexistentValue.prototype);
  }
}

/**
 * Gets value from JSON by JSON Pointer.
 *
 * @remarks
 *
 * Functions for processing JSON Pointers are designed to work only with JSON-like JavaScript structures,
 * like those returned by `JSON.parse()` method. If these functions meet `undefined`, `Function`
 * or `Symbol` types or `Infinity` and `NaN` numbers, then behavior is not clear
 * because these types and values are not explicitly supported by the library. It may be changed in the future,
 * so you may create an issue describing your use case why you and others may need it.
 *
 * @param json - JSON-like object you are searching in.
 * @param jsonPointer - JSON Pointer string or object.
 * @returns Referenced by JSON Pointer value.
 *
 * @throws PointerReferencesNonexistentValue
 * If JSON Pointer references a nonexistent value.
 */
export const getValueAtJsonPointer = (
  json: Json,
  jsonPointer: JsonPointer | string,
): Json => {
  if (typeof jsonPointer === 'string') {
    jsonPointer = parseJsonPointerFromString(jsonPointer);
  }

  let currentlyReferencedValue = json;

  for (const [
    referenceTokenIndex,
    referenceToken,
  ] of jsonPointer.referenceTokens.entries()) {
    let foundReferencedValue: Json | undefined = undefined;

    // check is array
    if (
      /^(?:0|[1-9][0-9]*)$/.test(referenceToken) &&
      Array.isArray(currentlyReferencedValue)
    ) {
      foundReferencedValue =
        currentlyReferencedValue[parseInt(referenceToken, 10)];
    }

    // check is object
    if (
      currentlyReferencedValue !== null &&
      typeof currentlyReferencedValue === 'object' &&
      !Array.isArray(currentlyReferencedValue) &&
      Object.prototype.hasOwnProperty.call(
        currentlyReferencedValue,
        referenceToken,
      )
    ) {
      foundReferencedValue = currentlyReferencedValue[referenceToken];
    }

    if (foundReferencedValue === undefined) {
      throw new PointerReferencesNonexistentValue(jsonPointer, {
        referenceTokens: jsonPointer.referenceTokens.slice(
          0,
          referenceTokenIndex + 1,
        ),
        uriFragmentIdentifierRepresentation:
          jsonPointer.uriFragmentIdentifierRepresentation,
      });
    }

    currentlyReferencedValue = foundReferencedValue;
  }

  return currentlyReferencedValue;
};
