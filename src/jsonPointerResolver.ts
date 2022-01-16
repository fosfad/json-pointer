import { JsonPointer } from './jsonPointer';

type Json = boolean | number | string | null | JsonArray | JsonObject;
type JsonArray = Array<Json>;
type JsonObject = { [property: string]: Json };

export class PointerReferencesNonexistentValue extends Error {
  constructor(
    public readonly jsonPointer: JsonPointer,
    public readonly nonexistentValueJsonPointer: JsonPointer,
  ) {
    super(
      `JSON Pointer ${jsonPointer.toString()} is not valid because it references a nonexistent value: ${nonexistentValueJsonPointer.toString()}`,
    );

    Object.setPrototypeOf(this, PointerReferencesNonexistentValue.prototype);
  }
}

export const resolveJsonPointer = (
  json: Json,
  jsonPointer: JsonPointer,
): Json => {
  let currentlyReferencedValue = json;

  if (
    jsonPointer.referenceTokens.length === 1 &&
    jsonPointer.referenceTokens[0] === ''
  ) {
    return currentlyReferencedValue;
  }

  jsonPointer.referenceTokens
    .slice(1)
    .forEach((referenceToken, referenceTokenIndex): void => {
      let foundReferencedValue: Json | undefined;

      if (
        typeof referenceToken === 'number' &&
        Array.isArray(currentlyReferencedValue)
      ) {
        foundReferencedValue = currentlyReferencedValue[referenceToken];
      }

      if (
        currentlyReferencedValue !== null &&
        typeof currentlyReferencedValue === 'object' &&
        Object.prototype.hasOwnProperty.call(
          currentlyReferencedValue,
          referenceToken,
        ) &&
        !Array.isArray(currentlyReferencedValue)
      ) {
        foundReferencedValue = currentlyReferencedValue[referenceToken];
      }

      if (foundReferencedValue === undefined) {
        throw new PointerReferencesNonexistentValue(
          jsonPointer,
          new JsonPointer(
            jsonPointer.referenceTokens.slice(0, referenceTokenIndex),
            jsonPointer.usesUriFragmentIdentifierRepresentation,
          ),
        );
      }

      currentlyReferencedValue = foundReferencedValue;
    });

  return currentlyReferencedValue;
};
