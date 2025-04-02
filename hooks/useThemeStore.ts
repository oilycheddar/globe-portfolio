import { create } from "zustand";
import { themes } from "../styles/themes";

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
  noiseEnabled: boolean;
  setNoiseEnabled: (enabled: boolean) => void;
  logo3DEnabled: boolean;
  setLogo3DEnabled: (enabled: boolean) => void;
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
  logo3DEnabled: true, // Changed to true for default 3D state
  setLogo3DEnabled: (enabled) => set({ logo3DEnabled: enabled }),
}));
