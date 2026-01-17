import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useLanguageStore } from "@/store/useLanguage";

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const lang = useLanguageStore((store) => store.lang) as "vi" | "en";
  const setLang = useLanguageStore((store) => store.setLang);
  
  const languages = {
    vi: {
      code: "vi",
      name: "Tiếng Việt",
      flag: "🇻🇳",
      nativeName: "Vietnamese",
    },
    en: {
      code: "en",
      name: "English",
      flag: "🇺🇸",
      nativeName: "English",
    },
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageSelect = (langKey: "vi" | "en") => {
    setLang(langKey);
    setIsOpen(false);
    // Here you would typically trigger a language change event
    console.log(`Language changed to: ${languages[langKey].name}`);
  };

  const currentLang = languages[lang];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
                group relative flex items-center gap-2 px-3 py-2
                bg-white/80 backdrop-blur-lg border border-white/20 
                rounded-lg shadow-md hover:shadow-lg
                transition-all duration-200 ease-out
                hover:scale-105 hover:bg-white/90
                ${isOpen ? "ring-2 ring-blue-500/20 scale-105" : ""}
              `}
      >
        {/* Globe Icon Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Flag */}
        <span className="text-lg transform group-hover:scale-110 transition-transform duration-150">
          {currentLang.flag}
        </span>

        {/* Language Code */}
        <span className="text-gray-900 font-medium text-sm uppercase tracking-wide">
          {currentLang.code}
        </span>

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={`
              absolute top-full right-0 mt-2 py-1 w-40
              bg-white/95 backdrop-blur-xl border border-white/20
              rounded-lg shadow-xl z-50
              transform transition-all duration-200 ease-out origin-top-right
              ${
                isOpen
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }
            `}
      >
        {Object.entries(languages).map(([key, language]) => (
          <button
            key={key}
            onClick={() => handleLanguageSelect(key as "vi" | "en")}
            className={`
                    w-full flex items-center gap-2 px-3 py-2
                    hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
                    transition-all duration-150 text-left
                    ${
                      lang === key
                        ? "bg-blue-50 border-r-2 border-blue-500"
                        : ""
                    }
                  `}
          >
            {/* Flag */}
            <span className="text-lg transform hover:scale-110 transition-transform duration-150">
              {language.flag}
            </span>

            {/* Language Name */}
            <span
              className={`font-medium text-sm ${
                lang === key ? "text-blue-700" : "text-gray-900"
              }`}
            >
              {language.name}
            </span>

            {/* Selected Indicator */}
            {lang === key && (
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-auto animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
