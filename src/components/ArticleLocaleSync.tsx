"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/store/useLanguage";

interface ArticleLocaleSyncProps {
  activeLocale: string;
  alternateUrls?: Record<string, string> | null;
}

export default function ArticleLocaleSync({
  activeLocale,
  alternateUrls,
}: ArticleLocaleSyncProps) {
  const setLang = useLanguageStore((state) => state.setLang);
  const setAlternateUrls = useLanguageStore((state) => state.setAlternateUrls);

  useEffect(() => {
    if (activeLocale && (activeLocale === "en" || activeLocale === "vi")) {
      setLang(activeLocale);
    }
    setAlternateUrls(alternateUrls || null);

    return () => {
      setAlternateUrls(null);
    };
  }, [activeLocale, alternateUrls, setLang, setAlternateUrls]);

  return null;
}
