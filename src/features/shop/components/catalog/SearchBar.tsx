"use client";

// =============================================================================
//  OPENIDEAR SHOP — SEARCH BAR
//  src/features/shop/components/catalog/SearchBar.tsx
// =============================================================================

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (search: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search PC hardware by model, brand, or specification...",
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleInputChange = (val: string) => {
    setInternalValue(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      onChange(val.trim());
    }, 350);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      onChange(internalValue.trim());
    } else if (e.key === "Escape") {
      setInternalValue("");
      onChange("");
    }
  };

  const handleClear = () => {
    setInternalValue("");
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    onChange("");
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="search"
        value={internalValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 transition-all duration-200 h-10 shadow-2xs"
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          aria-label="Clear search query"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
