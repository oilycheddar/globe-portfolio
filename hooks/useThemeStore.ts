import { create } from "zustand";
import { themes } from "../styles/themes";

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
  noiseEnabled: boolean;
  setNoiseEnabled: (enabled: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "slime", // Default theme
  setTheme: (theme) => set({ theme }),
  noiseEnabled: true, // Default noise state
  setNoiseEnabled: (enabled) => set({ noiseEnabled: enabled }),
}));
