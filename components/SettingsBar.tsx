"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { 
  Eye, 
  EyeOff, 
  Maximize, 
  Minimize, 
  LetterText, 
  Volume2, 
  VolumeX,
  SkipForward
} from "lucide-react";
import { useEffect, useState } from "react";

interface SettingsBarProps {
  uppercaseOnly: boolean;
  setUppercaseOnly: (value: boolean) => void;
  showWord: boolean;
  setShowWord: (value: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (value: boolean) => void;
  volume: number;
  setVolume: (value: number) => void;
  onListen: () => void;
  onSkip: () => void;
}

export function SettingsBar({
  uppercaseOnly,
  setUppercaseOnly,
  showWord,
  setShowWord,
  voiceEnabled,
  setVoiceEnabled,
  volume,
  setVolume,
  onListen,
  onSkip,
}: SettingsBarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <div className="w-full bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        {/* Mobile: 2 rows, Desktop: 1 row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          {/* Toggles group */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Uppercase toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="uppercase"
                checked={uppercaseOnly}
                onCheckedChange={setUppercaseOnly}
                aria-label="Majuscules seulement"
              />
              <label 
                htmlFor="uppercase" 
                className="text-xs sm:text-sm font-medium cursor-pointer flex items-center gap-1"
              >
                <LetterText className="w-4 h-4 hidden sm:inline" />
                <span className="hidden sm:inline">Majuscules</span>
                <span className="sm:hidden">MAJ</span>
              </label>
            </div>

            {/* Show word toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="showWord"
                checked={showWord}
                onCheckedChange={setShowWord}
                aria-label="Afficher le mot"
              />
              <label 
                htmlFor="showWord" 
                className="text-xs sm:text-sm font-medium cursor-pointer flex items-center gap-1"
              >
                {showWord ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Mot</span>
              </label>
            </div>

            {/* Voice toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="voice"
                checked={voiceEnabled}
                onCheckedChange={setVoiceEnabled}
                aria-label="Voix activée"
              />
              <label 
                htmlFor="voice" 
                className="text-xs sm:text-sm font-medium cursor-pointer flex items-center gap-1"
              >
                {voiceEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Voix</span>
              </label>
            </div>
          </div>

          {/* Volume slider */}
          <div className="flex items-center gap-2 flex-1 min-w-[120px] max-w-[200px]">
            <VolumeX className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Slider
              value={[volume]}
              onValueChange={([value]) => setVolume(value)}
              min={0}
              max={100}
              step={5}
              className="flex-1"
              aria-label="Volume"
            />
            <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <Button
              onClick={onListen}
              variant="outline"
              size="sm"
              className={cn(
                "h-9 sm:h-10 px-3 sm:px-4",
                "text-xs sm:text-sm font-medium",
                "touch-manipulation"
              )}
              aria-label="Réécouter le mot"
            >
              <Volume2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Réécouter</span>
            </Button>

            <Button
              onClick={onSkip}
              variant="outline"
              size="sm"
              className={cn(
                "h-9 sm:h-10 px-3 sm:px-4",
                "text-xs sm:text-sm font-medium",
                "touch-manipulation"
              )}
              aria-label="Mot suivant"
            >
              <SkipForward className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Passer</span>
            </Button>

            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="sm"
              className={cn(
                "h-9 sm:h-10 px-3",
                "text-xs sm:text-sm font-medium",
                "touch-manipulation"
              )}
              aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
