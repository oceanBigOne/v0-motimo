"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface FeedbackOverlayProps {
  type: 'success' | 'error' | null;
  onComplete?: () => void;
}

export function FeedbackOverlay({ type, onComplete }: FeedbackOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (type) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (type === 'error') {
          onComplete?.();
        }
      }, type === 'success' ? 2000 : 1000);
      return () => clearTimeout(timer);
    }
  }, [type, onComplete]);

  if (!type || !visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "pointer-events-none",
        "animate-in fade-in duration-200"
      )}
      aria-live="polite"
      aria-label={type === 'success' ? 'Bravo !' : 'Réessaie !'}
    >
      {type === 'success' ? (
        <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
          <CheckCircle2 
            className="w-32 h-32 sm:w-40 sm:h-40 text-green-500 drop-shadow-lg" 
            strokeWidth={2.5}
          />
          <span className="text-4xl sm:text-5xl font-bold text-green-500 drop-shadow-lg">
            Bravo !
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-200">
          <XCircle 
            className="w-32 h-32 sm:w-40 sm:h-40 text-red-500 drop-shadow-lg animate-pulse" 
            strokeWidth={2.5}
          />
          <span className="text-4xl sm:text-5xl font-bold text-red-500 drop-shadow-lg">
            Réessaie !
          </span>
        </div>
      )}
    </div>
  );
}
