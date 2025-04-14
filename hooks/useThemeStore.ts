import { create } from "zustand";

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
  noiseEnabled: boolean;
  setNoiseEnabled: (enabled: boolean) => void;
  logo3DEnabled: boolean;
  setLogo3DEnabled: (enabled: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "default",
  setTheme: (theme) => set({ theme }),
  noiseEnabled: true,
  setNoiseEnabled: (enabled) => set({ noiseEnabled: enabled }),
  logo3DEnabled: false,
  setLogo3DEnabled: (enabled) => set({ logo3DEnabled: enabled }),
}));
