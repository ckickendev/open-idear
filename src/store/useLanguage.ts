import { create } from "zustand";

type Language = "vi" | "en";

interface LanguageState {
  lang: Language;
  setLang: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: "vi",
  setLang: (lang) => set({ lang }),
}));
