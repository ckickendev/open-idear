import { create } from "zustand";

interface LanguageState {
  lang: string;
  setLang: (lang: string) => void;
}

const defaultLang =
  typeof window !== "undefined"
    ? localStorage.getItem("language") || "en"
    : "en";

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: defaultLang,
  setLang: (lang) => {
    set({ lang });
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
  },
}));
