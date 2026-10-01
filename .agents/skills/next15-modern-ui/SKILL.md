---
name: next15-modern-ui
description: Best practices for building performant, accessible UI with Next.js 15 App Router, React 19, Tailwind CSS v4, and Radix UI in OpenIdear.
---

# Next.js 15, React 19 & Tailwind v4 UI Guide

This skill provides guidelines and patterns for authoring UI components and pages in `open-trash-tech`.

---

## 1. Next.js 15 & React 19 Standards

### A. Client vs. Server Components
- By default, files inside `src/app/` are **React Server Components (RSC)**.
- Add `"use client";` at the top of any file that:
  - Uses React hooks (`useState`, `useEffect`, `useRef`, `useCallback`).
  - Mounts TipTap editor hooks (`useEditor`).
  - Listens to browser events (`window.addEventListener`, custom events).
  - Uses browser APIs (`localStorage`, `sessionStorage`, `navigator`).

### B. Hydration Safety
Never conditionally render DOM based directly on `window` or `Date.now()` during the initial render. Use a mounted flag:
```tsx
"use client";
import { useEffect, useState } from "react";

export function ClientOnlyComponent() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Or skeleton placeholder
  return <div>Client-rendered content</div>;
}
```

---

## 2. Tailwind CSS v4 Styling Patterns

1. **No `tailwind.config.js`**:
   Tailwind CSS v4 uses native CSS `@import "tailwindcss";` and CSS custom properties. Do not generate or modify legacy v3 config files.
2. **Dark Mode Consistency**:
   Support both light and dark themes using Tailwind's `dark:` variant:
   ```tsx
   <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800">
   ```
3. **Class Merging**:
   Always merge conditional classes using the `cn()` utility (`clsx` + `tailwind-merge`):
   ```tsx
   import { cn } from "@/lib/utils";
   // className={cn("base-classes", isSelected && "selected-classes", className)}
   ```

---

## 3. UI Component Aesthetics

- **Typography**: Clean, modern typography with clear hierarchy (H1, H2, H3, body, muted captions).
- **Interactive States**: Every clickable item must have:
  - `transition-colors` or `transition-all`.
  - Hover background / border styling.
  - Active scale feedback (`active:scale-98`).
  - Focus accessibility (`focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none`).
- **Icons**: Use `lucide-react` with consistent size classes (`w-3.5 h-3.5` or `w-4 h-4`) and semantic colors.
