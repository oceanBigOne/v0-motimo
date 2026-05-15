/**
 * Speech synthesis utility using the Web Speech API
 * Uses French voice if available
 */

let frenchVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

/**
 * Loads available voices and selects a French voice
 */
export function loadVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (voicesLoaded) {
      resolve();
      return;
    }

    const loadVoicesInternal = () => {
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find a French voice
      frenchVoice = voices.find(voice => voice.lang.startsWith('fr')) || null;
      
      // Fallback: try to find any voice that includes 'fr' in its name
      if (!frenchVoice) {
        frenchVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('french') ||
          voice.name.toLowerCase().includes('français')
        ) || null;
      }
      
      voicesLoaded = true;
      resolve();
    };

    // Chrome requires waiting for voiceschanged event
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoicesInternal();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoicesInternal, { once: true });
      // Fallback timeout in case voiceschanged never fires
      setTimeout(() => {
        if (!voicesLoaded) {
          loadVoicesInternal();
        }
      }, 1000);
    }
  });
}

/**
 * Speaks a word using the Web Speech API
 * @param word - The word to speak
 * @param volume - Volume from 0 to 1
 * @param enabled - Whether speech is enabled
 */
export function speakWord(word: string, volume: number, enabled: boolean): void {
  if (!enabled || typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.volume = volume;
  utterance.rate = 0.9; // Slightly slower for children
  utterance.pitch = 1;
  utterance.lang = 'fr-FR';

  if (frenchVoice) {
    utterance.voice = frenchVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Checks if speech synthesis is available
 */
export function isSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
