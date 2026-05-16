"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface SyllableOverlayProps {
  syllable: string | null;
  onComplete: () => void;
}

export function SyllableOverlay({ syllable, onComplete }: SyllableOverlayProps) {
  useEffect(() => {
    if (syllable) {
      const timer = setTimeout(() => {
        onComplete();
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [syllable, onComplete]);

  if (!syllable) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50",
        "flex items-center justify-center",
        "bg-black/30 backdrop-blur-sm",
        "animate-in fade-in duration-150"
      )}
      aria-live="polite"
      aria-label={`Syllabe: ${syllable}`}
    >
      <div 
        className={cn(
          "bg-white rounded-3xl shadow-2xl",
          "px-12 py-8 sm:px-16 sm:py-10",
          "animate-in zoom-in-95 duration-200"
        )}
      >
        <span 
          className={cn(
            "text-5xl sm:text-6xl md:text-7xl font-bold",
            "text-primary",
            "select-none"
          )}
        >
          {syllable}
        </span>
      </div>
    </div>
  );
}
