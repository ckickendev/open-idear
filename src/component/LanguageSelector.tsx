import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const dropdownRef = useRef(null);

  const languages = {
    vietnamese: {
      code: "vi",
      name: "Tiếng Việt",
      flag: "🇻🇳",
      nativeName: "Vietnamese",
    },
    english: {
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

  const handleLanguageSelect = (langKey) => {
    setSelectedLanguage(langKey);
    setIsOpen(false);
    // Here you would typically trigger a language change event
    console.log(`Language changed to: ${languages[langKey].name}`);
  };

  const currentLang = languages[selectedLanguage];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="relative" ref={dropdownRef}>
        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            group relative flex items-center gap-3 px-6 py-4 
            bg-white/80 backdrop-blur-lg border border-white/20 
            rounded-2xl shadow-xl hover:shadow-2xl
            transition-all duration-300 ease-out
            hover:scale-105 hover:bg-white/90
            ${isOpen ? "ring-4 ring-blue-500/20 scale-105" : ""}
          `}
        >
          {/* Globe Icon Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Flag */}
          <span className="text-2xl transform group-hover:scale-110 transition-transform duration-200">
            {currentLang.flag}
          </span>

          {/* Language Info */}
          <div className="flex flex-col items-start">
            <span className="text-gray-900 font-semibold text-lg">
              {currentLang.name}
            </span>
            <span className="text-gray-500 text-sm">
              {currentLang.nativeName}
            </span>
          </div>

          {/* Chevron */}
          <ChevronDown
            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        <div
          className={`
          absolute top-full left-0 right-0 mt-2 py-2
          bg-white/95 backdrop-blur-xl border border-white/20
          rounded-2xl shadow-2xl
          transform transition-all duration-200 ease-out origin-top
          ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }
        `}
        >
          {Object.entries(languages).map(([key, lang]) => (
            <button
              key={key}
              onClick={() => handleLanguageSelect(key)}
              className={`
                w-full flex items-center gap-3 px-6 py-4
                hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
                transition-all duration-150
                ${
                  selectedLanguage === key
                    ? "bg-blue-50 border-r-4 border-blue-500"
                    : ""
                }
              `}
            >
              {/* Flag */}
              <span className="text-2xl transform hover:scale-110 transition-transform duration-150">
                {lang.flag}
              </span>

              {/* Language Info */}
              <div className="flex flex-col items-start flex-1">
                <span
                  className={`font-medium ${
                    selectedLanguage === key ? "text-blue-700" : "text-gray-900"
                  }`}
                >
                  {lang.name}
                </span>
                <span className="text-gray-500 text-sm">{lang.nativeName}</span>
              </div>

              {/* Selected Indicator */}
              {selectedLanguage === key && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Background Blur Effect */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/5 backdrop-blur-sm -z-10 transition-opacity duration-200" />
        )}
      </div>

      {/* Demo Info */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm text-gray-600">
          <Globe className="w-4 h-4" />
          <span>Selected: {currentLang.name}</span>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
