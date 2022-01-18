export class InvalidPointerSyntax extends Error {
  constructor(public readonly invalidJsonPointer: string) {
    super(`JSON Pointer ${invalidJsonPointer} has invalid pointer syntax`);

    Object.setPrototypeOf(this, InvalidPointerSyntax.prototype);
  }
}

export type JsonPointer = {
  referenceTokens: Array<string>;
  uriFragmentIdentifierRepresentation: boolean;
};

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
      return escapeReferenceToken(
        referenceToken,
        uriFragmentIdentifierRepresentation,
      );
    });

  return {
    referenceTokens,
    uriFragmentIdentifierRepresentation,
  };
};

export const createStringFromJsonPointer = (
  jsonPointer: JsonPointer,
): string => {
  const jsonPointerString =
    '/' +
    jsonPointer.referenceTokens
      .map((referenceToken): string => {
        return unescapeReferenceToken(
          referenceToken,
          jsonPointer.uriFragmentIdentifierRepresentation,
        );
      })
      .join('/');

  if (jsonPointer.uriFragmentIdentifierRepresentation) {
    return '#' + jsonPointerString;
  }

  return jsonPointerString;
};

export const escapeReferenceToken = (
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

export const unescapeReferenceToken = (
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
