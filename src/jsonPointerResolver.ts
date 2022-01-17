import { JsonPointer } from './jsonPointer';

type Json = JsonArray | JsonObject | boolean | number | string | null;
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

  jsonPointer.referenceTokens.forEach(
    (referenceToken, referenceTokenIndex): void => {
      let foundReferencedValue: Json | undefined;

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
        throw new PointerReferencesNonexistentValue(
          jsonPointer,
          new JsonPointer(
            jsonPointer.referenceTokens.slice(0, referenceTokenIndex + 1),
            jsonPointer.usesUriFragmentIdentifierRepresentation,
          ),
        );
      }

      currentlyReferencedValue = foundReferencedValue;
    },
  );

  return currentlyReferencedValue;
};
