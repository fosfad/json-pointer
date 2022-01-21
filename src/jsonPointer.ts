export class InvalidPointerSyntax extends Error {
  constructor(public readonly invalidJsonPointer: string) {
    super(`JSON Pointer "${invalidJsonPointer}" has invalid pointer syntax`);
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
};

/**
 * Validates input string to be valid JSON Pointer.
 *
 * @param jsonPointerString - JSON Pointer string.
 * @returns Is JSON Pointer valid or not.
 */
export const isValidJsonPointer = (jsonPointerString: string): boolean => {
  return jsonPointerString.length === 0 || jsonPointerString.startsWith('/');
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
export const parseJsonPointerFromString = (jsonPointerString: string): JsonPointer => {
  if (!isValidJsonPointer(jsonPointerString)) {
    throw new InvalidPointerSyntax(jsonPointerString);
  }

  if (jsonPointerString.length === 0) {
    return {
      referenceTokens: [],
    };
  }

  const referenceTokens = jsonPointerString
    .substring(1) // remove `/` symbol from beginning of the string
    .split('/')
    .map((referenceToken): string => {
      return unescapeReferenceToken(referenceToken);
    });

  return {
    referenceTokens,
  };
};

/**
 * Creates a string from `JsonPointer` object.
 *
 * @param jsonPointer - JSON Pointer object.
 * @returns JSON Pointer string.
 */
export const createStringFromJsonPointer = (jsonPointer: JsonPointer): string => {
  let jsonPointerString = jsonPointer.referenceTokens
    .map((referenceToken): string => {
      return escapeReferenceToken(referenceToken);
    })
    .join('/');

  if (jsonPointer.referenceTokens.length > 0) {
    jsonPointerString = '/' + jsonPointerString;
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
 * @returns Unescaped reference token.
 */
export const unescapeReferenceToken = (referenceToken: string): string => {
  return referenceToken.replaceAll('~1', '/').replaceAll('~0', '~');
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
 * @returns Escaped reference token.
 */
export const escapeReferenceToken = (referenceToken: string): string => {
  return referenceToken.replaceAll('~', '~0').replaceAll('/', '~1');
};
