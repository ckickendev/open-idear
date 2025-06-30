import { create } from 'zustand';

interface InstructionState {
    currentPage: number;
    setCurrentPage: (page: number) => void;
    displayInstructions: boolean;
    setDisplayInstructions: (display: boolean) => void;
}

export const useInstructionStore = create<InstructionState>((set) => ({
    currentPage: 1, // default value for SSR
    setCurrentPage: (page) => {
        set({ currentPage: page });
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentPage', page.toString());
        }
    },
    displayInstructions: true, // default value for SSR
    setDisplayInstructions: (display) => {
        set({ displayInstructions: display });
        if (typeof window !== 'undefined') {
            localStorage.setItem('displayInstructions', JSON.stringify(display));
        }
    },
}));
