import type { JsonPointer } from './jsonPointer';
import { createStringFromJsonPointer, parseJsonPointerFromString } from './jsonPointer';

export type Json = JsonArray | JsonObject | boolean | number | string | null;
type JsonArray = Array<Json>;
type JsonObject = { [property: string]: Json };

export class PointerReferencesNonexistentValue extends Error {
  constructor(public readonly jsonPointer: JsonPointer, public readonly nonexistentValueJsonPointer: JsonPointer) {
    super(
      `JSON Pointer "${createStringFromJsonPointer(
        jsonPointer,
      )}" is not valid because it references a nonexistent value: "${createStringFromJsonPointer(
        nonexistentValueJsonPointer,
      )}"`,
    );
  }
}

/**
 * Gets value from JSON at given JSON Pointer.
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
export const getValueAtJsonPointer = (json: Json, jsonPointer: JsonPointer | string): Json => {
  const jsonPointerObject: JsonPointer =
    typeof jsonPointer === 'string' ? parseJsonPointerFromString(jsonPointer) : jsonPointer;

  let currentlyReferencedValue = json;

  for (const [referenceTokenIndex, referenceToken] of jsonPointerObject.referenceTokens.entries()) {
    let foundReferencedValue: Json | undefined = undefined;

    // check is array
    if (/^(?:0|[1-9][0-9]*)$/.test(referenceToken) && Array.isArray(currentlyReferencedValue)) {
      foundReferencedValue = currentlyReferencedValue[parseInt(referenceToken, 10)];
    }

    // check is object
    if (
      currentlyReferencedValue !== null &&
      typeof currentlyReferencedValue === 'object' &&
      !Array.isArray(currentlyReferencedValue) &&
      Object.prototype.hasOwnProperty.call(currentlyReferencedValue, referenceToken)
    ) {
      foundReferencedValue = currentlyReferencedValue[referenceToken];
    }

    if (foundReferencedValue === undefined) {
      throw new PointerReferencesNonexistentValue(jsonPointerObject, {
        referenceTokens: jsonPointerObject.referenceTokens.slice(0, referenceTokenIndex + 1),
      });
    }

    currentlyReferencedValue = foundReferencedValue;
  }

  return currentlyReferencedValue;
};

/**
 * Checks value exists in JSON at given JSON Pointer.
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
 * @returns Value exists or not.
 */
export const valueExistsAtJsonPointer = (json: Json, jsonPointer: JsonPointer | string): boolean => {
  try {
    getValueAtJsonPointer(json, jsonPointer);
  } catch (error: unknown) {
    if (error instanceof PointerReferencesNonexistentValue) {
      return false;
    }

    throw error;
  }

  return true;
};
