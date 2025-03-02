import { create } from "zustand";
import { themes } from "../styles/themes";

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "slime", // Default theme
  setTheme: (theme) => set({ theme }),
}));
