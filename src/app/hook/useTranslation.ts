import vi from "../locales/vi.json";
import en from "../locales/en.json";
import { useLanguageStore } from "@/store/useLanguage";

const translations = {
  vi,
  en,
};

export function useTranslation() {
  const lang = useLanguageStore((state) => state.lang) as keyof typeof translations;
  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = translations[lang];
    for (const k of keys) {
      value = value?.[k];
    }
    return value ?? key; // fallback nếu không có key
  };
  return { t, lang };
}
