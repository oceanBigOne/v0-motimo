/**
 * Normalizes a word based on the uppercase-only setting.
 * When uppercase-only is enabled:
 * - Removes all accents/diacritics
 * - Converts to uppercase
 * When disabled:
 * - Returns the word as-is
 */
export function normalizeWord(word: string, uppercaseOnly: boolean): string {
  if (uppercaseOnly) {
    return word
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

  return word;
}

/**
 * Extracts only the letters from a word (removing spaces, hyphens, apostrophes)
 * This is used to determine which letters the child needs to type
 */
export function extractLetters(word: string): string[] {
  return word.split('').filter(char => /[a-zA-ZÀ-ÿ]/i.test(char));
}

/**
 * Checks if a character is a separator (space, hyphen, apostrophe)
 */
export function isSeparator(char: string): boolean {
  return char === ' ' || char === '-' || char === "'" || char === '\u2019';
}

/**
 * Compares input with expected word, case-insensitive and accent-insensitive
 */
export function compareWords(input: string, expected: string, uppercaseOnly: boolean): boolean {
  const normalizedInput = normalizeWord(input, true);
  const normalizedExpected = normalizeWord(expected, true);
  return normalizedInput === normalizedExpected;
}
