import { useEffect, useRef } from 'react';
import { useThemeStore } from './useThemeStore';

export const useHoverSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayedRef = useRef<number>(0);
  const { theme, soundEnabled } = useThemeStore();

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();
    audioRef.current.volume = 0.035; // Set a lower fixed volume (0 to 1)
    
    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.remove();
      }
    };
  }, []);

  const playSound = () => {
    if (!soundEnabled) return; // Only play if sound is enabled
    
    const now = Date.now();
    if (now - lastPlayedRef.current < 100) return;
    
    if (audioRef.current) {
      audioRef.current.src = `/sounds/${theme}-hover.wav`;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.debug('Audio playback prevented:', err);
      });
      lastPlayedRef.current = now;
    }
  };

  return { playSound };
}; 