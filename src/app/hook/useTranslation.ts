import vi from "../locales/vi.json";
import en from "../locales/en.json";
import { useLanguageStore } from "@/store/useLanguage";

const translations = {
  vi,
  en,
};

type Language = keyof typeof translations;

export function useTranslation() {
  const lang = (useLanguageStore((state) => state.lang) || "en") as Language;
  const t = (key: string, params?: Record<string, string | number>) => {
    const keys = key.split(".");
    let value: any = translations[lang] || translations.en;
    for (const k of keys) {
      value = value?.[k];
    }

    if (value === undefined) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[i18n] Missing translation key "${key}" for locale "${lang}".`);
      }
      return key; // fallback if key not found
    }

    if (typeof value === "string" && params) {
      return Object.entries(params).reduce(
        (acc, [paramKey, paramVal]) =>
          acc.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramVal)),
        value
      );
    }

    return value;
  };
  return { t, lang, language: lang };
}
