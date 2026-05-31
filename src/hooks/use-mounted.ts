"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe mount detection hook.
 * Returns false during SSR and true after first client-side render.
 * Use for components that depend on browser APIs (localStorage, theme state, etc.)
 *
 * @example
 * ```tsx
 * const mounted = useMounted();
 * if (!mounted) return <Skeleton className="size-9"/>;
 * return <ThemeToggle />;
 * ```
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
