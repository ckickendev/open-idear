import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  changeLoad: () => void;
  setIsLoading: (loading: boolean) => void;
}

const loadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  changeLoad: () => set((state) => ({ isLoading: !state.isLoading })),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
}));

export default loadingStore;
