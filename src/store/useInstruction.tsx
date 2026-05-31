import { create } from "zustand";

const STORAGE_KEY_DISPLAY = "openidear_instruction_dismissed";
const STORAGE_KEY_PAGE = "openidear_instruction_page";

/**
 * Check if the instruction tutorial has been previously dismissed.
 * Returns false (don't display) if user has already seen/skipped it.
 */
function getInitialDisplay(): boolean {
  if (typeof window === "undefined") return false; // SSR: hide by default
  const stored = localStorage.getItem(STORAGE_KEY_DISPLAY);
  // If user has previously dismissed, don't show again
  if (stored === "true") return false;
  return true;
}

function getInitialPage(): number {
  if (typeof window === "undefined") return 1;
  const stored = localStorage.getItem(STORAGE_KEY_PAGE);
  return stored ? parseInt(stored, 10) || 1 : 1;
}

interface InstructionState {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  displayInstructions: boolean;
  setDisplayInstructions: (display: boolean) => void;
  /** Permanently dismiss the tutorial (won't show again) */
  dismissForever: () => void;
  /** Reset so the tutorial shows again (for settings/help menu) */
  resetTutorial: () => void;
}

export const useInstructionStore = create<InstructionState>((set) => ({
  currentPage: getInitialPage(),
  setCurrentPage: (page) => {
    set({ currentPage: page });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_PAGE, page.toString());
    }
  },
  displayInstructions: getInitialDisplay(),
  setDisplayInstructions: (display) => {
    set({ displayInstructions: display });
    // When hiding, mark as dismissed permanently
    if (!display && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_DISPLAY, "true");
    }
  },
  dismissForever: () => {
    set({ displayInstructions: false, currentPage: 1 });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_DISPLAY, "true");
      localStorage.setItem(STORAGE_KEY_PAGE, "1");
    }
  },
  resetTutorial: () => {
    set({ displayInstructions: true, currentPage: 1 });
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_DISPLAY);
      localStorage.setItem(STORAGE_KEY_PAGE, "1");
    }
  },
}));
