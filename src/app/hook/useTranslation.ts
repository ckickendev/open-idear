import vi from "../locales/vi";
import en from "../locales/en";
import { useLanguageStore } from "@/store/useLanguage";

const translations = {
  vi,
  en,
};

type Language = keyof typeof translations;

export function useTranslation() {
  const lang = (useLanguageStore((state) => state.lang) || "en") as Language;

  const t = (
    key: string,
    params?: Record<string, string | number> | string,
    fallbackText?: string
  ) => {
    const fallback = typeof params === "string" ? params : fallbackText;
    const interpolationParams = typeof params === "object" ? params : undefined;

    const resolveFromObj = (obj: any, path: string) => {
      if (!obj || typeof obj !== "object") return undefined;
      const keys = path.split(".");
      let val: any = obj;
      for (const k of keys) {
        val = val?.[k];
        if (val === undefined) break;
      }
      return val;
    };

    const currentDict = translations[lang] || translations.en;
    const enDict = translations.en;

    // 1. Direct path lookup in current language
    let value = resolveFromObj(currentDict, key);

    // 2. If key starts with "home.", check "component."
    if (value === undefined && key.startsWith("home.")) {
      value = resolveFromObj(currentDict, key.replace(/^home\./, "component."));
    }

    // 3. If key doesn't start with "component.", try "component."
    if (value === undefined && !key.startsWith("component.")) {
      value = resolveFromObj(currentDict, `component.${key}`);
    }

    // 4. Fallback to English dictionary if not found in current language
    if (value === undefined && lang !== "en") {
      value = resolveFromObj(enDict, key);
      if (value === undefined && key.startsWith("home.")) {
        value = resolveFromObj(enDict, key.replace(/^home\./, "component."));
      }
      if (value === undefined && !key.startsWith("component.")) {
        value = resolveFromObj(enDict, `component.${key}`);
      }
    }

    if (value === undefined) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[i18n] Missing translation key "${key}" for locale "${lang}".`);
      }
      return fallback !== undefined ? fallback : key;
    }

    if (typeof value === "string" && interpolationParams) {
      return Object.entries(interpolationParams).reduce(
        (acc, [paramKey, paramVal]) =>
          acc.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramVal)),
        value
      );
    }

    return value;
  };

  return { t, lang, language: lang };
}

