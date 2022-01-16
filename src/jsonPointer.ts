function isUnsignedNumeric(value: string): boolean {
  return /^[0-9]+$/.test(value);
}

export class InvalidPointerSyntax extends Error {
  constructor(public readonly invalidPointer: string) {
    super(`JSON Pointer ${invalidPointer} has invalid pointer syntax`);

    Object.setPrototypeOf(this, InvalidPointerSyntax.prototype);
  }
}

export class JsonPointer {
  public constructor(
    public readonly referenceTokens: Array<number | string>,
    public readonly usesUriFragmentIdentifierRepresentation: boolean,
  ) {}

  public static createFromString = (jsonPointer: string): JsonPointer => {
    const usesUriFragmentIdentifierRepresentation = jsonPointer.startsWith('#');

    if (!jsonPointer.startsWith('#') && !jsonPointer.startsWith('/')) {
      throw new InvalidPointerSyntax(jsonPointer);
    }

    const referenceTokens = jsonPointer
      .split('/')
      .map((referenceToken): number | string => {
        if (isUnsignedNumeric(referenceToken)) {
          return parseInt(referenceToken, 10);
        }

        if (usesUriFragmentIdentifierRepresentation) {
          referenceToken = decodeURI(referenceToken);
        }

        return referenceToken.replaceAll('~1', '/').replaceAll('~0', '~');
      });

    if (usesUriFragmentIdentifierRepresentation) {
      referenceTokens[0] = '';
    }

    return new JsonPointer(
      referenceTokens,
      usesUriFragmentIdentifierRepresentation,
    );
  };

  public toString = (): string => {
    const jsonPointer = this.referenceTokens
      .map((referenceToken): string => {
        if (typeof referenceToken === 'string') {
          referenceToken = referenceToken
            .replaceAll('~', '~0')
            .replaceAll('/', '~1');

          if (this.usesUriFragmentIdentifierRepresentation) {
            referenceToken = encodeURI(referenceToken);
          }
        } else {
          referenceToken = referenceToken.toString();
        }

        return referenceToken;
      })
      .join('/');

    if (this.usesUriFragmentIdentifierRepresentation) {
      return '#' + jsonPointer;
    }

    return jsonPointer;
  };
}
