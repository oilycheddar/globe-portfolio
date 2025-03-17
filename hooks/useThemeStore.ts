import { create } from "zustand";
import { themes } from "../styles/themes";

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
  isTransitioning: boolean;
  setIsTransitioning: (isTransitioning: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "slime", // Default theme
  isTransitioning: false,
  setTheme: (theme) => set((state) => {
    // Only update if theme is different
    if (state.theme === theme) return state;
    
    // Set transitioning state
    set({ isTransitioning: true });
    
    // Update theme after a short delay to allow for animation
    setTimeout(() => {
      set({ theme, isTransitioning: false });
    }, 100);
    
    return state;
  }),
  setIsTransitioning: (isTransitioning) => set({ isTransitioning }),
}));
