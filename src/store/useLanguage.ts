import { create } from 'zustand';

interface LanguageState {
  lang: string;
  setLang: (lang: string) => void;
  initializeLang: () => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: 'en', // default value for SSR
  setLang: (lang) => {
    set({ lang });
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  },
  initializeLang: () => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language');
      if (savedLang) {
        set({ lang: savedLang });
      }
    }
  },
}));