"use client";

import { isSeparator, normalizeWord } from "@/lib/normalizeWord";
import { cn } from "@/lib/utils";

interface LetterBoxesProps {
  word: string;
  input: string[];
  uppercaseOnly: boolean;
  showError: boolean;
  expectedLetters: string[];
}

export function LetterBoxes({ word, input, uppercaseOnly, showError, expectedLetters }: LetterBoxesProps) {
  const normalizedWord = normalizeWord(word, uppercaseOnly);
  
  // Build display with letters and separators
  let letterIndex = 0;
  const displayChars = normalizedWord.split('').map((char, index) => {
    if (isSeparator(char)) {
      return {
        type: 'separator' as const,
        char,
        index,
      };
    }
    const inputChar = input[letterIndex] || '';
    const expectedChar = expectedLetters[letterIndex] || '';
    // Normalize both characters to compare without accents
    const normalizeChar = (c: string) => c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    const isCorrect = inputChar ? normalizeChar(inputChar) === normalizeChar(expectedChar) : false;
    letterIndex++;
    return {
      type: 'letter' as const,
      char,
      inputChar: uppercaseOnly ? inputChar.toUpperCase() : inputChar,
      expectedChar,
      isCorrect,
      index,
    };
  });

  return (
    <div 
      className="flex flex-wrap justify-center gap-2 sm:gap-3" 
      role="group" 
      aria-label="Cases de lettres"
    >
      {displayChars.map((item) => {
        if (item.type === 'separator') {
          return (
            <div
              key={item.index}
              className="flex items-center justify-center w-4 sm:w-6 text-2xl sm:text-3xl font-bold text-foreground"
              aria-label={item.char === ' ' ? 'espace' : item.char === '-' ? 'tiret' : 'apostrophe'}
            >
              {item.char === ' ' ? '' : item.char}
            </div>
          );
        }

        return (
          <div
            key={item.index}
            className={cn(
              "flex items-center justify-center w-12 h-14 sm:w-16 sm:h-20 md:w-20 md:h-24",
              "rounded-xl border-4 transition-all duration-200",
              "text-2xl sm:text-3xl md:text-4xl font-bold",
              showError 
                ? "border-red-500 bg-red-50"
                : item.inputChar 
                  ? item.isCorrect
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-red-500 bg-red-50 text-red-700"
                  : "border-muted-foreground/30 bg-card"
            )}
            aria-label={item.inputChar ? `Lettre ${item.inputChar}` : "Case vide"}
          >
            {item.inputChar}
          </div>
        );
      })}
    </div>
  );
}
