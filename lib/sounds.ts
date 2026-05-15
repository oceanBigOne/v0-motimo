/**
 * Sound utilities for playing success and error sounds
 * Handles cases where audio files might not be available
 */

let successAudio: HTMLAudioElement | null = null;
let errorAudio: HTMLAudioElement | null = null;
let audioInitialized = false;

/**
 * Initializes audio elements
 */
export function initSounds(): void {
  if (typeof window === 'undefined' || audioInitialized) {
    return;
  }

  try {
    successAudio = new Audio('/sounds/success.mp3');
    successAudio.preload = 'auto';
    
    errorAudio = new Audio('/sounds/error.mp3');
    errorAudio.preload = 'auto';
    
    audioInitialized = true;
  } catch {
    console.warn('Could not initialize audio');
  }
}

/**
 * Plays the success sound
 * @param volume - Volume from 0 to 1
 */
export async function playSuccessSound(volume: number): Promise<void> {
  if (!successAudio) {
    initSounds();
  }
  
  if (successAudio) {
    try {
      successAudio.volume = volume;
      successAudio.currentTime = 0;
      await successAudio.play();
    } catch {
      // Silently fail if audio cannot be played
    }
  }
}

/**
 * Plays the error sound
 * @param volume - Volume from 0 to 1
 */
export async function playErrorSound(volume: number): Promise<void> {
  if (!errorAudio) {
    initSounds();
  }
  
  if (errorAudio) {
    try {
      errorAudio.volume = volume;
      errorAudio.currentTime = 0;
      await errorAudio.play();
    } catch {
      // Silently fail if audio cannot be played
    }
  }
}
