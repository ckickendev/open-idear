import { create } from 'zustand';

interface LoadingState {
    isLoading: boolean;
    changeLoad: () => void;
}

const loadingStore = create<LoadingState>((set) => ({
    isLoading: false,
    changeLoad: () => set((state) =>
        ({ isLoading: !state.isLoading })
    ),
}));

export default loadingStore;
