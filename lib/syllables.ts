/**
 * French syllable detection utility
 * Splits a French word into syllables based on common patterns
 */

const VOWELS = ['a', 'e', 'i', 'o', 'u', 'y', 'à', 'â', 'ä', 'é', 'è', 'ê', 'ë', 'ï', 'î', 'ô', 'ö', 'ù', 'û', 'ü', 'ÿ', 'œ', 'æ'];

function isVowel(char: string): boolean {
  return VOWELS.includes(char.toLowerCase());
}

/**
 * Splits a French word into syllables
 * Uses a simplified algorithm based on vowel-consonant patterns
 */
export function splitIntoSyllables(word: string): string[] {
  if (!word || word.length === 0) return [];
  
  const normalizedWord = word.toLowerCase();
  const syllables: string[] = [];
  let currentSyllable = '';
  
  for (let i = 0; i < normalizedWord.length; i++) {
    const char = normalizedWord[i];
    const nextChar = normalizedWord[i + 1];
    const nextNextChar = normalizedWord[i + 2];
    
    currentSyllable += char;
    
    // Skip non-letter characters
    if (!/[a-zà-ÿœæ]/i.test(char)) {
      continue;
    }
    
    // If current char is a vowel
    if (isVowel(char)) {
      // Check if we should split here
      if (nextChar && !isVowel(nextChar)) {
        // Consonant after vowel
        if (nextNextChar && isVowel(nextNextChar)) {
          // Pattern: V-CV (e.g., "ma-man")
          syllables.push(currentSyllable);
          currentSyllable = '';
        } else if (nextNextChar && !isVowel(nextNextChar)) {
          // Two consonants ahead
          const thirdChar = normalizedWord[i + 3];
          if (thirdChar && isVowel(thirdChar)) {
            // Pattern: VC-CV (e.g., "par-tir")
            // Keep one consonant with current syllable
            currentSyllable += nextChar;
            i++;
            syllables.push(currentSyllable);
            currentSyllable = '';
          }
        }
      } else if (nextChar && isVowel(nextChar)) {
        // Two vowels - usually split unless it's a common digraph
        const digraph = char + nextChar;
        const commonDigraphs = ['ai', 'au', 'ea', 'ei', 'eu', 'ie', 'oe', 'oi', 'ou', 'ui'];
        if (!commonDigraphs.includes(digraph)) {
          syllables.push(currentSyllable);
          currentSyllable = '';
        }
      }
    }
  }
  
  // Add remaining syllable
  if (currentSyllable) {
    syllables.push(currentSyllable);
  }
  
  // Merge very short syllables with neighbors
  const mergedSyllables: string[] = [];
  for (let i = 0; i < syllables.length; i++) {
    const syllable = syllables[i];
    if (syllable.length === 1 && !isVowel(syllable) && mergedSyllables.length > 0) {
      // Single consonant - merge with previous
      mergedSyllables[mergedSyllables.length - 1] += syllable;
    } else if (syllable.length === 1 && !isVowel(syllable) && syllables[i + 1]) {
      // Single consonant at start - merge with next
      syllables[i + 1] = syllable + syllables[i + 1];
    } else {
      mergedSyllables.push(syllable);
    }
  }
  
  return mergedSyllables.length > 0 ? mergedSyllables : [word];
}

/**
 * Gets the syllable boundaries as character indices
 * Returns an array of ending indices for each syllable
 */
export function getSyllableBoundaries(word: string): number[] {
  const syllables = splitIntoSyllables(word);
  const boundaries: number[] = [];
  let currentIndex = 0;
  
  for (const syllable of syllables) {
    currentIndex += syllable.length;
    boundaries.push(currentIndex);
  }
  
  return boundaries;
}

/**
 * Gets the current syllable being typed based on input length
 */
export function getCurrentSyllable(word: string, inputLength: number): { syllable: string; isComplete: boolean; syllableIndex: number } | null {
  const syllables = splitIntoSyllables(word);
  let charCount = 0;
  
  for (let i = 0; i < syllables.length; i++) {
    const syllableEnd = charCount + syllables[i].length;
    
    if (inputLength <= syllableEnd) {
      return {
        syllable: syllables[i],
        isComplete: inputLength === syllableEnd,
        syllableIndex: i
      };
    }
    
    charCount = syllableEnd;
  }
  
  return null;
}
