import type { JsonPointer } from './jsonPointer';
import {
  createStringFromJsonPointer,
  parseJsonPointerFromString,
} from './jsonPointer';

type Json = JsonArray | JsonObject | boolean | number | string | null;
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

export const getValueByJsonPointer = (
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
