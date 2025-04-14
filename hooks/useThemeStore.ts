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
  theme: "slime",
  setTheme: (theme) => set({ theme }),
  noiseEnabled: true,
  setNoiseEnabled: (enabled) => set({ noiseEnabled: enabled }),
  logo3DEnabled: true,
  setLogo3DEnabled: (enabled) => set({ logo3DEnabled: enabled }),
}));
