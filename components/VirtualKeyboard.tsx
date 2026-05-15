"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Delete, Volume2 } from "lucide-react";

interface VirtualKeyboardProps {
  onLetterPress: (letter: string) => void;
  onDelete: () => void;
  onListen: () => void;
  uppercaseOnly: boolean;
  disabled?: boolean;
}

const KEYBOARD_ROWS = [
  ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
  ['W', 'X', 'C', 'V', 'B', 'N'],
];

export function VirtualKeyboard({ 
  onLetterPress, 
  onDelete, 
  onListen, 
  uppercaseOnly,
  disabled 
}: VirtualKeyboardProps) {
  const handleLetterClick = (letter: string) => {
    if (disabled) return;
    onLetterPress(uppercaseOnly ? letter : letter.toLowerCase());
  };

  return (
    <div 
      className="w-full max-w-3xl mx-auto p-2 sm:p-4 bg-muted/50 rounded-2xl"
      role="group"
      aria-label="Clavier virtuel"
    >
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-[4px] sm:gap-1.5 md:gap-2 mb-[4px] sm:mb-2 px-1">
          {row.map((letter) => (
            <Button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              disabled={disabled}
              variant="secondary"
              className={cn(
                "flex-1 max-w-[42px] h-11 p-0 sm:max-w-[48px] sm:h-12 md:max-w-[56px] md:h-14",
                "text-lg sm:text-xl md:text-2xl font-bold",
                "rounded-lg shadow-md",
                "transition-all active:scale-95",
                "touch-manipulation"
              )}
              aria-label={`Lettre ${letter}`}
            >
              {uppercaseOnly ? letter : letter.toLowerCase()}
            </Button>
          ))}
        </div>
      ))}
      
      {/* Action buttons row */}
      <div className="flex justify-center gap-3 sm:gap-4 mt-3 sm:mt-4 px-1">
        <Button
          onClick={onDelete}
          disabled={disabled}
          variant="destructive"
          className={cn(
            "flex-1 max-w-[160px] h-11 sm:h-12 md:h-14",
            "text-base sm:text-lg md:text-xl font-bold",
            "rounded-lg shadow-md",
            "transition-all active:scale-95",
            "touch-manipulation"
          )}
          aria-label="Effacer la derniere lettre"
        >
          <Delete className="w-5 h-5 sm:w-5 sm:h-5 mr-2" />
          Effacer
        </Button>
        
        <Button
          onClick={onListen}
          disabled={disabled}
          variant="outline"
          className={cn(
            "flex-1 max-w-[160px] h-11 sm:h-12 md:h-14",
            "text-base sm:text-lg md:text-xl font-bold",
            "rounded-lg shadow-md border-2",
            "transition-all active:scale-95",
            "touch-manipulation bg-card"
          )}
          aria-label="Reecouter le mot"
        >
          <Volume2 className="w-5 h-5 sm:w-5 sm:h-5 mr-2" />
          Reecouter
        </Button>
      </div>
    </div>
  );
}
