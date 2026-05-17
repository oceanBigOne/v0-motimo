"use client";

import { FeedbackOverlay } from "@/components/FeedbackOverlay";
import { LetterBoxes } from "@/components/LetterBoxes";
import { SettingsBar } from "@/components/SettingsBar";
import { SyllableOverlay } from "@/components/SyllableOverlay";
import { VirtualKeyboard } from "@/components/VirtualKeyboard";
import { words, type WordItem } from "@/data/words";
import { compareWords, extractLetters, normalizeWord } from "@/lib/normalizeWord";
import { shuffle } from "@/lib/shuffle";
import { initSounds, playErrorSound, playSuccessSound } from "@/lib/sounds";
import { loadVoices, speakWord } from "@/lib/speech";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

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

export function Game() {
  // URL params
  const searchParams = useSearchParams();
  const forcedWord = searchParams.get('word');
  
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
  
  // Syllable overlay state
  const [currentSyllable, setCurrentSyllable] = useState<string | null>(null);
  const [syllableQueue, setSyllableQueue] = useState<string[]>([]);
  const [vocalQueue, setVocalQueue] = useState<string[]>([]);
  
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
    let initialList = shuffle(words);
    
    // Check if there's a forced word in URL params
    if (forcedWord) {
      const foundIndex = words.findIndex(
        w => w.word.toLowerCase() === forcedWord.toLowerCase()
      );
      if (foundIndex !== -1) {
        // Put the forced word at the beginning
        const forcedWordItem = words[foundIndex];
        initialList = [forcedWordItem, ...initialList.filter(w => w !== forcedWordItem)];
      }
    }
    
    setWordList(initialList);
  }, [forcedWord]);

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

  const moveToNextWord = useCallback(() => {
    setInput([]);
    setShowError(false);
    setIsEmojiExiting(false);
    setEmojiKey(prev => prev + 1);
    setSyllableQueue([]);
    setVocalQueue([]);
    
    if (currentIndex >= wordList.length - 1) {
      // Reshuffle and start over
      setWordList(shuffle(words));
      setCurrentIndex(0);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, wordList.length]);

  const handleLetterPress = useCallback((letter: string) => {
    if (feedback || currentSyllable) return;
    
    if (input.length < expectedLetters.length) {
      const newInput = [...input, letter];
      setInput(newInput);
      
      // Check if complete
      if (newInput.length === expectedLetters.length) {
        validateWord(newInput);
      }
    }
  }, [input, expectedLetters, feedback, currentSyllable]);

  const handleSyllableComplete = useCallback(() => {
    // Show next syllable in queue or finish
    if (syllableQueue.length > 0) {
      const [nextSyllable, ...restSyllables] = syllableQueue;
      const [nextVocal, ...restVocals] = vocalQueue.length > 0 ? vocalQueue : [nextSyllable, ...syllableQueue.slice(1)];
      setSyllableQueue(restSyllables);
      setVocalQueue(restVocals);
      
      // Small delay before showing next syllable
      setTimeout(() => {
        setCurrentSyllable(nextSyllable);
        speakWord(nextVocal, volume / 100, voiceEnabled);
      }, 200);
    } else {
      setCurrentSyllable(null);
      
      // Now show success feedback
      setFeedback('success');
      
      // Play confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Play success sound
      playSuccessSound(volume / 100);
      
      // Speak the full word
      setTimeout(() => {
        speakWord(currentWord.word, volume / 100, voiceEnabled);
      }, 300);
      
      // Start emoji fade out just before moving to next word
      setTimeout(() => {
        setIsEmojiExiting(true);
      }, 2700);
      
      // Wait and move to next word
      setTimeout(() => {
        moveToNextWord();
        setFeedback(null);
      }, 3000);
    }
  }, [syllableQueue, vocalQueue, volume, voiceEnabled, currentWord, moveToNextWord]);

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
      // Success! Start syllable sequence using phonetic syllables from word data
      // Use vocal array for pronunciation if available, otherwise fallback to syllables
      const displaySyllables = currentWord.syllables || [currentWord.word];
      const vocalSyllables = currentWord.vocal || displaySyllables;
      
      if (displaySyllables.length > 1) {
        // Multiple syllables - show them one by one
        // We display the written syllable but speak the vocal version
        const [firstDisplay, ...restDisplay] = displaySyllables;
        const [firstVocal, ...restVocal] = vocalSyllables;
        
        // Store both queues - we'll handle vocal in handleSyllableComplete
        setSyllableQueue(restDisplay);
        setVocalQueue(restVocal);
        setCurrentSyllable(firstDisplay);
        speakWord(firstVocal, volume / 100, voiceEnabled);
      } else {
        // Single syllable word - go directly to success
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
      }
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

      {/* Syllable Overlay */}
      <SyllableOverlay
        syllable={currentSyllable}
        onComplete={handleSyllableComplete}
      />
    </div>
  );
}
