import { create } from 'zustand';

interface NoiseState {
  isNoiseEnabled: boolean;
  toggleNoise: () => void;
}

export const useNoiseStore = create<NoiseState>((set) => ({
  isNoiseEnabled: true,
  toggleNoise: () => set((state) => ({ isNoiseEnabled: !state.isNoiseEnabled })),
})); 