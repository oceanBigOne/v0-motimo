"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { 
  Menu,
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
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      {/* Logo in top left */}
      <div className="fixed top-3 left-3 z-50">
        <Image
          src="/images/logo.png"
          alt="Motimo"
          width={80}
          height={60}
          className="h-auto w-16 sm:w-20"
          priority
        />
      </div>

      {/* Menu button in top right */}
      <div className="fixed top-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg",
              "bg-white/90 backdrop-blur-sm",
              "touch-manipulation"
            )}
            aria-label="Ouvrir les parametres"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[320px] sm:w-[380px] px-6 flex flex-col">
          <SheetHeader className="pb-4 flex-shrink-0">
            <SheetTitle className="text-xl font-bold">Parametres</SheetTitle>
          </SheetHeader>
          
          <div className="mt-4 space-y-8 pr-2 overflow-y-auto flex-1">
            {/* Uppercase toggle */}
            <div className="flex items-center justify-between">
              <label 
                htmlFor="uppercase" 
                className="text-base font-medium cursor-pointer flex items-center gap-2"
              >
                <LetterText className="w-5 h-5" />
                Majuscules seulement
              </label>
              <Switch
                id="uppercase"
                checked={uppercaseOnly}
                onCheckedChange={setUppercaseOnly}
                aria-label="Majuscules seulement"
              />
            </div>

            {/* Show word toggle */}
            <div className="flex items-center justify-between">
              <label 
                htmlFor="showWord" 
                className="text-base font-medium cursor-pointer flex items-center gap-2"
              >
                {showWord ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
                Afficher le mot
              </label>
              <Switch
                id="showWord"
                checked={showWord}
                onCheckedChange={setShowWord}
                aria-label="Afficher le mot"
              />
            </div>

            {/* Voice toggle */}
            <div className="flex items-center justify-between">
              <label 
                htmlFor="voice" 
                className="text-base font-medium cursor-pointer flex items-center gap-2"
              >
                {voiceEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
                Voix activee
              </label>
              <Switch
                id="voice"
                checked={voiceEnabled}
                onCheckedChange={setVoiceEnabled}
                aria-label="Voix activee"
              />
            </div>

            {/* Volume slider */}
            <div className="space-y-3">
              <label className="text-base font-medium flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Volume
              </label>
              <div className="flex items-center gap-3">
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
            </div>

            {/* Divider */}
            <div className="border-t border-border pt-6" />

            {/* Action buttons */}
            <div className="space-y-4">
              <Button
                onClick={() => {
                  onListen();
                }}
                variant="outline"
                className={cn(
                  "w-full h-12",
                  "text-base font-medium",
                  "touch-manipulation"
                )}
                aria-label="Reecouter le mot"
              >
                <Volume2 className="w-5 h-5 mr-2" />
                Reecouter le mot
              </Button>

              <Button
                onClick={() => {
                  onSkip();
                  setIsOpen(false);
                }}
                variant="outline"
                className={cn(
                  "w-full h-12",
                  "text-base font-medium",
                  "touch-manipulation"
                )}
                aria-label="Mot suivant"
              >
                <SkipForward className="w-5 h-5 mr-2" />
                Passer au mot suivant
              </Button>

              <Button
                onClick={toggleFullscreen}
                variant="outline"
                className={cn(
                  "w-full h-12",
                  "text-base font-medium",
                  "touch-manipulation"
                )}
                aria-label={isFullscreen ? "Quitter le plein ecran" : "Plein ecran"}
              >
                {isFullscreen ? (
                  <>
                    <Minimize className="w-5 h-5 mr-2" />
                    Quitter le plein ecran
                  </>
                ) : (
                  <>
                    <Maximize className="w-5 h-5 mr-2" />
                    Plein ecran
                  </>
                )}
              </Button>
            </div>

            {/* Legal link */}
            <div className="border-t border-border pt-6 mt-6">
              <Link 
                href="/mentions-legales" 
                className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Mentions legales
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      </div>
    </>
  );
}
