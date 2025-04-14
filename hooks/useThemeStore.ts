import { create } from "zustand";
import { themes } from "../styles/themes";

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
  noiseEnabled: boolean;
  setNoiseEnabled: (enabled: boolean) => void;
  logo3DEnabled: boolean;
  setLogo3DEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  soundVolume: number;
  setSoundVolume: (volume: number) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "slime", // Default theme
  setTheme: (theme) => {
    // Force hardware acceleration for color transitions
    document.documentElement.style.setProperty('transform', 'translateZ(0)');
    document.documentElement.style.setProperty('-webkit-transform', 'translateZ(0)');
    set({ theme });
  },
  noiseEnabled: true, // Default noise state
  setNoiseEnabled: (enabled) => set({ noiseEnabled: enabled }),
  logo3DEnabled: true, // Changed to true for initial test
  setLogo3DEnabled: (enabled) => set({ logo3DEnabled: enabled }),
  soundEnabled: false,
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  soundVolume: 0.15, // Default volume (0 to 1)
  setSoundVolume: (volume) => set({ soundVolume: volume }),
}));
