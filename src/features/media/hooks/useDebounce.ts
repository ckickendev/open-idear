"use client";

import { useState, useEffect } from "react";

/**
 * Debounces a value by the given delay in milliseconds.
 * Eliminates repeated debounce boilerplate across components.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
