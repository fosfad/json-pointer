export class InvalidPointerSyntax extends Error {
  constructor(public readonly invalidJsonPointer: string) {
    super(`JSON Pointer ${invalidJsonPointer} has invalid pointer syntax`);

    Object.setPrototypeOf(this, InvalidPointerSyntax.prototype);
  }
}

/**
 * JSON Pointer representation as object.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6901|JavaScript Object Notation (JSON) Pointer}
 */
export type JsonPointer = {
  /**
   * Reference tokens separated by a `/` character, also known as path segments.
   * Empty array means JSON Pointer points to the whole document.
   */
  referenceTokens: Array<string>;

  /**
   * Does this JSON Pointer use URI Fragment Identifier Representation or not.
   * If value is `true`, JSON Pointer string representation will be prepended with `#`
   * and percent-encoding will be applied to some characters.
   *
   * @see {@link https://datatracker.ietf.org/doc/html/rfc6901#section-6|URI Fragment Identifier Representation}
   */
  uriFragmentIdentifierRepresentation: boolean;
};

/**
 * Parses input string into `JsonPointer` object.
 *
 * @param jsonPointerString - JSON Pointer string.
 * @returns Parsed JSON Pointer.
 *
 * @throws InvalidPointerSyntax
 * If string contains JSON Pointer in invalid format.
 */
export const parseJsonPointerFromString = (
  jsonPointerString: string,
): JsonPointer => {
  let jsonPointer = jsonPointerString;

  const uriFragmentIdentifierRepresentation = jsonPointerString.startsWith('#');

  if (uriFragmentIdentifierRepresentation) {
    jsonPointer = jsonPointer.substring(1); // remove `#` symbol from beginning of the string
  }

  if (jsonPointer.length === 0) {
    return {
      referenceTokens: [],
      uriFragmentIdentifierRepresentation,
    };
  }

  if (!jsonPointer.startsWith('/')) {
    throw new InvalidPointerSyntax(jsonPointer);
  }

  const referenceTokens = jsonPointer
    .substring(1) // remove `/` symbol from beginning of the string
    .split('/')
    .map((referenceToken): string => {
      return unescapeReferenceToken(
        referenceToken,
        uriFragmentIdentifierRepresentation,
      );
    });

  return {
    referenceTokens,
    uriFragmentIdentifierRepresentation,
  };
};

/**
 * Creates a string from `JsonPointer` object.
 *
 * @param jsonPointer - JSON Pointer object.
 * @returns JSON Pointer string.
 */
export const createStringFromJsonPointer = (
  jsonPointer: JsonPointer,
): string => {
  let jsonPointerString = jsonPointer.referenceTokens
    .map((referenceToken): string => {
      return escapeReferenceToken(
        referenceToken,
        jsonPointer.uriFragmentIdentifierRepresentation,
      );
    })
    .join('/');

  if (jsonPointer.referenceTokens.length > 0) {
    jsonPointerString = '/' + jsonPointerString;
  }

  if (jsonPointer.uriFragmentIdentifierRepresentation) {
    jsonPointerString = '#' + jsonPointerString;
  }

  return jsonPointerString;
};

/**
 * Unescapes reference token according to the specification.
 *
 * Transformations made by the function in following order:
 *
 * 1. `~1` → `/`
 * 2. `~0` → `~`
 *
 * @param referenceToken - One reference token (also known as path segment).
 * @param uriFragmentIdentifierRepresentation - Is `true`, percent-decoding with `decodeURIComponent` will be applied.
 * @returns Unescaped reference token.
 */
export const unescapeReferenceToken = (
  referenceToken: string,
  uriFragmentIdentifierRepresentation: boolean,
): string => {
  let escapedReferenceToken = referenceToken
    .replaceAll('~1', '/')
    .replaceAll('~0', '~');

  if (uriFragmentIdentifierRepresentation) {
    escapedReferenceToken = decodeURIComponent(escapedReferenceToken);
  }

  return escapedReferenceToken;
};

/**
 * Unescapes reference token according to the specification.
 *
 * Transformations made by the function in following order:
 *
 * 1. `~` → `~0`
 * 2. `/` → `~1`
 *
 * @param referenceToken - One reference token (also known as path segment).
 * @param uriFragmentIdentifierRepresentation - If `true`, percent-encoding with `encodeURIComponent` will be applied.
 * @returns Escaped reference token.
 */
export const escapeReferenceToken = (
  referenceToken: string,
  uriFragmentIdentifierRepresentation: boolean,
): string => {
  let unescapedReferenceToken = referenceToken
    .replaceAll('~', '~0')
    .replaceAll('/', '~1');

  if (uriFragmentIdentifierRepresentation) {
    unescapedReferenceToken = encodeURIComponent(unescapedReferenceToken);
  }

  return unescapedReferenceToken;
};
