import { useEffect, useRef } from 'react';
import { useThemeStore } from './useThemeStore';

export const useHoverSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { theme, soundEnabled } = useThemeStore();

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();
    audioRef.current.volume = 0.2; // Adjustable volume
    
    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.remove();
      }
    };
  }, []);

  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.src = `/sounds/${theme}-hover.wav`;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Audio playback prevented:', err));
    }
  };

  return { playSound };
}; 