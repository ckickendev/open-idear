import { create } from "zustand";

interface LanguageState {
  lang: string;
  alternateUrls: Record<string, string> | null;
  setLang: (lang: string) => void;
  setAlternateUrls: (urls: Record<string, string> | null) => void;
  initializeLang: () => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: "en", // default value for SSR
  alternateUrls: null,
  setLang: (lang) => {
    set({ lang });
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
      document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = lang;
    }
  },
  setAlternateUrls: (alternateUrls) => {
    set({ alternateUrls });
  },
  initializeLang: () => {
    if (typeof window !== "undefined") {
      // 1. Check path first
      const pathname = window.location.pathname;
      if (pathname === "/vi" || pathname.startsWith("/vi/")) {
        set({ lang: "vi" });
        localStorage.setItem("language", "vi");
        document.cookie = "NEXT_LOCALE=vi; path=/; max-age=31536000; SameSite=Lax";
        document.documentElement.lang = "vi";
        return;
      }

      // 2. Check NEXT_LOCALE cookie
      const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/);
      const cookieLang = match ? decodeURIComponent(match[1]) : null;
      if (cookieLang && (cookieLang === "en" || cookieLang === "vi")) {
        set({ lang: cookieLang });
        localStorage.setItem("language", cookieLang);
        return;
      }

      // 3. Fallback to localStorage
      const savedLang = localStorage.getItem("language");
      if (savedLang && (savedLang === "en" || savedLang === "vi")) {
        set({ lang: savedLang });
      }
    }
  },
}));
