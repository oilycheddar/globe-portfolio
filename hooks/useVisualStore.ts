import { create } from "zustand";
import { themes } from "../styles/themes";
import { persist } from 'zustand/middleware';

interface VisualState {
  theme: string;
  isNoiseEnabled: boolean;
  setTheme: (theme: string) => void;
  toggleNoise: () => void;
  initializeTheme: () => void;
}

const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'slime';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'slime' : 'light';
};

export const useVisualStore = create<VisualState>()(
  persist(
    (set) => ({
      theme: 'slime',
      isNoiseEnabled: true,
      setTheme: (theme) => set({ theme }),
      toggleNoise: () => set((state) => ({ isNoiseEnabled: !state.isNoiseEnabled })),
      initializeTheme: () => {
        const systemTheme = getSystemTheme();
        set({ theme: systemTheme });
      },
    }),
    {
      name: 'visual-storage',
      skipHydration: true,
    }
  )
); 