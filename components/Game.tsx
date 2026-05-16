"use client";

import { FeedbackOverlay } from "@/components/FeedbackOverlay";
import { LetterBoxes } from "@/components/LetterBoxes";
import { SettingsBar } from "@/components/SettingsBar";
import { VirtualKeyboard } from "@/components/VirtualKeyboard";
import { words, type WordItem } from "@/data/words";
import { compareWords, extractLetters, normalizeWord } from "@/lib/normalizeWord";
import { shuffle } from "@/lib/shuffle";
import { initSounds, playErrorSound, playSuccessSound } from "@/lib/sounds";
import { loadVoices, speakWord } from "@/lib/speech";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useCallback, useEffect, useRef, useState } from "react";

// localStorage keys
const STORAGE_KEYS = {
  uppercaseOnly: 'game_uppercaseOnly',
  showWord: 'game_showWord',
  voiceEnabled: 'game_voiceEnabled',
  volume: 'game_volume',
};

function loadSettings() {
  if (typeof window === 'undefined') {
    return {
      uppercaseOnly: false,
      showWord: true,
      voiceEnabled: true,
      volume: 70,
    };
  }
  
  return {
    uppercaseOnly: localStorage.getItem(STORAGE_KEYS.uppercaseOnly) === 'true',
    showWord: localStorage.getItem(STORAGE_KEYS.showWord) !== 'false',
    voiceEnabled: localStorage.getItem(STORAGE_KEYS.voiceEnabled) !== 'false',
    volume: parseInt(localStorage.getItem(STORAGE_KEYS.volume) || '70', 10),
  };
}

// Vowels for speech trigger
const VOWELS = ['a', 'e', 'i', 'o', 'u', 'y', 'A', 'E', 'I', 'O', 'U', 'Y'];

export function Game() {
  // Word state
  const [wordList, setWordList] = useState<WordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState<string[]>([]);
  
  // Feedback state
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [showError, setShowError] = useState(false);
  
  // Settings state
  const [uppercaseOnly, setUppercaseOnly] = useState(false);
  const [showWord, setShowWord] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [volume, setVolume] = useState(70);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  
  // Device detection - hide virtual keyboard on desktop
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  // Animation key to trigger re-animation on word change
  const [emojiKey, setEmojiKey] = useState(0);
  const [isEmojiExiting, setIsEmojiExiting] = useState(false);
  
  const currentWord = wordList[currentIndex];
  const normalizedWord = currentWord ? normalizeWord(currentWord.word, uppercaseOnly) : '';
  const expectedLetters = currentWord ? extractLetters(normalizedWord) : [];

  // Load settings from localStorage
  useEffect(() => {
    const settings = loadSettings();
    setUppercaseOnly(settings.uppercaseOnly);
    setShowWord(settings.showWord);
    setVoiceEnabled(settings.voiceEnabled);
    setVolume(settings.volume);
    setSettingsLoaded(true);
  }, []);

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouchScreen = 'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;
      const isSmallScreen = window.innerWidth < 1024;
      setIsTouchDevice(hasTouchScreen || isSmallScreen);
    };
    
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    if (!settingsLoaded) return;
    localStorage.setItem(STORAGE_KEYS.uppercaseOnly, String(uppercaseOnly));
  }, [uppercaseOnly, settingsLoaded]);

  useEffect(() => {
    if (!settingsLoaded) return;
    localStorage.setItem(STORAGE_KEYS.showWord, String(showWord));
  }, [showWord, settingsLoaded]);

  useEffect(() => {
    if (!settingsLoaded) return;
    localStorage.setItem(STORAGE_KEYS.voiceEnabled, String(voiceEnabled));
  }, [voiceEnabled, settingsLoaded]);

  useEffect(() => {
    if (!settingsLoaded) return;
    localStorage.setItem(STORAGE_KEYS.volume, String(volume));
  }, [volume, settingsLoaded]);

  // Initialize word list
  useEffect(() => {
    setWordList(shuffle(words));
  }, []);

  // Initialize audio and speech
  useEffect(() => {
    initSounds();
    loadVoices();
  }, []);

  // Speak word when it changes
  useEffect(() => {
    if (currentWord && settingsLoaded) {
      speakWord(currentWord.word, volume / 100, voiceEnabled);
    }
  }, [currentWord, voiceEnabled, volume, settingsLoaded]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if feedback is showing or if it's a modifier key combo
      if (feedback || e.ctrlKey || e.metaKey || e.altKey) return;
      
      const key = e.key;
      
      if (key === 'Backspace') {
        e.preventDefault();
        handleDelete();
        return;
      }
      
      // Only accept letters
      if (/^[a-zA-ZÀ-ÿ]$/.test(key)) {
        e.preventDefault();
        handleLetterPress(uppercaseOnly ? key.toUpperCase() : key.toLowerCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feedback, uppercaseOnly, input, expectedLetters]);

  const handleLetterPress = useCallback((letter: string) => {
    if (feedback) return;
    
    if (input.length < expectedLetters.length) {
      const newInput = [...input, letter];
      setInput(newInput);
      
      // If vowel is typed, speak the current input
      if (VOWELS.includes(letter) && voiceEnabled) {
        const currentInputWord = newInput.join('');
        speakWord(currentInputWord, volume / 100, true);
      }
      
      // Check if complete
      if (newInput.length === expectedLetters.length) {
        validateWord(newInput);
      }
    }
  }, [input, expectedLetters, feedback, voiceEnabled, volume]);

  const handleDelete = useCallback(() => {
    if (feedback) return;
    setInput(prev => prev.slice(0, -1));
    setShowError(false);
  }, [feedback]);

  const handleListen = useCallback(() => {
    if (currentWord) {
      speakWord(currentWord.word, volume / 100, voiceEnabled);
    }
  }, [currentWord, volume, voiceEnabled]);

  const validateWord = async (currentInput: string[]) => {
    const inputWord = currentInput.join('');
    const expectedWord = expectedLetters.join('');
    
    if (compareWords(inputWord, expectedWord, uppercaseOnly)) {
      // Success!
      setFeedback('success');
      
      // Play confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Play success sound
      await playSuccessSound(volume / 100);
      
      // Speak the word
      speakWord(currentWord.word, volume / 100, voiceEnabled);
      
      // Start emoji fade out just before moving to next word
      setTimeout(() => {
        setIsEmojiExiting(true);
      }, 2700);
      
      // Wait and move to next word
      setTimeout(() => {
        moveToNextWord();
        setFeedback(null);
      }, 3000);
    } else {
      // Error!
      setFeedback('error');
      setShowError(true);
      
      // Play error sound
      await playErrorSound(volume / 100);
      
      // Speak the word
      speakWord(currentWord.word, volume / 100, voiceEnabled);
    }
  };

  const handleErrorComplete = useCallback(() => {
    setInput([]);
    setShowError(false);
    setFeedback(null);
  }, []);

  const moveToNextWord = useCallback(() => {
    setInput([]);
    setShowError(false);
    setIsEmojiExiting(false);
    setEmojiKey(prev => prev + 1);
    
    if (currentIndex >= wordList.length - 1) {
      // Reshuffle and start over
      setWordList(shuffle(words));
      setCurrentIndex(0);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, wordList.length]);

  const handleSkip = useCallback(() => {
    if (feedback) return;
    moveToNextWord();
  }, [feedback, moveToNextWord]);

  // Focus management for accessibility
  const handleContainerClick = () => {
    // Keep focus on game area for keyboard input
    gameContainerRef.current?.focus();
  };

  if (!currentWord || !settingsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-2xl text-muted-foreground">
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-b from-sky-100 via-yellow-50 to-pink-100"
      onClick={handleContainerClick}
      ref={gameContainerRef}
      tabIndex={-1}
    >
      {/* Settings Bar */}
      <SettingsBar
        uppercaseOnly={uppercaseOnly}
        setUppercaseOnly={setUppercaseOnly}
        showWord={showWord}
        setShowWord={setShowWord}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        volume={volume}
        setVolume={setVolume}
        onListen={handleListen}
        onSkip={handleSkip}
      />

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6 sm:gap-8">
        {/* Emoji */}
        <div 
          key={emojiKey}
          className={cn(
            "text-[100px] sm:text-[120px] md:text-[150px]",
            "select-none",
            isEmojiExiting ? "animate-emoji-fade-out" : "animate-emoji-drop"
          )}
          role="img"
          aria-label={`Image representant ${currentWord.word}`}
        >
          {currentWord.emoji}
        </div>

        {/* Word Display */}
        {showWord && (
          <div 
            className={cn(
              "text-3xl sm:text-4xl md:text-5xl font-bold",
              "text-foreground",
              "text-center px-4"
            )}
            aria-label={`Le mot à écrire est ${currentWord.word}`}
          >
            {normalizedWord}
          </div>
        )}

        {/* Letter Boxes */}
        <div className="w-full max-w-2xl px-2">
          <LetterBoxes
            word={currentWord.word}
            input={input}
            uppercaseOnly={uppercaseOnly}
            showError={showError}
            expectedLetters={expectedLetters}
          />
        </div>

        {/* Hidden input for mobile keyboard (optional fallback) */}
        <input
          ref={inputRef}
          type="text"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
        />
      </main>

      {/* Virtual Keyboard - only shown on touch devices */}
      {isTouchDevice && (
        <div className="sticky bottom-0 pb-4 px-2 sm:px-4 bg-gradient-to-t from-pink-100 to-transparent pt-4">
          <VirtualKeyboard
            onLetterPress={handleLetterPress}
            onDelete={handleDelete}
            onListen={handleListen}
            uppercaseOnly={uppercaseOnly}
            disabled={!!feedback}
          />
        </div>
      )}

      {/* Feedback Overlay */}
      <FeedbackOverlay 
        type={feedback} 
        onComplete={handleErrorComplete}
      />
    </div>
  );
}
