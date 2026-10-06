# OPENIDEAR — Frontend Guidelines & Architecture (CLAUDE.md)

Welcome to **OpenIdear Frontend** (`open-trash-tech`). This document provides architectural context, commands, and invariants for AI agents (Claude, Gemini, Antigravity) working on this codebase.

---

## 1. Tech Stack Overview

- **Framework**: Next.js 15 (App Router with Turbopack)
- **Core Library**: React 19 (`react`, `react-dom`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) + `tw-animate-css` + CSS variables
- **Rich Text Editor**: TipTap v3 (`@tiptap/core`, `@tiptap/react`, `@tiptap/starter-kit`, ProseMirror)
- **State Management**: Zustand v5 + TanStack Query v5
- **UI & Icons**: Radix UI primitives (`@radix-ui/react-*`), `lucide-react`, `sonner` (toasts)
- **Validation**: Zod + React Hook Form

---

## 2. Essential Commands

```bash
# Start development server
npm run dev

# Run TypeScript verification (MANDATORY before completing tasks)
npx tsc --noEmit --skipLibCheck

# Run ESLint
npm run lint

# Production build
npm run build
```

---

## 3. Directory Layout

```
open-trash-tech/
├── src/
│   ├── app/                               # Next.js 15 App Router pages & route groups
│   │   ├── (editor)/create/               # OpenIdear Article Editor (ToolBar, Canvas, Header)
│   │   └── (marketing)/                   # Public article reader, collections, profile
│   ├── features/                          # Domain-driven feature modules
│   │   ├── ai-visual/                     # AI Visual Assistant (types, API client, search, telemetry)
│   │   ├── editor/                        # TipTap extensions, NodeViews, AssetPicker, BatchVisualsModal
│   │   ├── ai/                            # AI Publisher, Content Enhancements
│   │   ├── media-library/                 # Asset library modal & hooks
│   │   └── article/                       # Versioning, reading progress, article actions
│   ├── components/                        # Shared UI components (Radix + Tailwind)
│   ├── hooks/                             # Shared React hooks
│   └── lib/                               # Axios clients, utilities, helpers
├── .agents/skills/                        # Agent Skills (TipTap, AI Visual, Next.js 15, Verification)
└── public/                                # Static assets
```

---

## 4. Architectural Rules & Invariants

### 1. TipTap & ProseMirror Mutations
- **Never mutate DOM nodes directly** inside TipTap NodeViews. Always use `editor.chain().focus()` and ProseMirror transactions.
- Use `getPos()` safely (ensure `typeof pos === "number" && pos >= 0`).
- When replacing a placeholder node with an image, delete the node selection and insert the image at `pos` to preserve editor history (undo/redo).

### 2. Next.js 15 & React 19 Standards
- Pages and leaf components with hooks (`useState`, `useEffect`, TipTap `useEditor`) **must** include `"use client";` at the top.
- Avoid hydration mismatch bugs: don't render browser-only data (e.g. `window.location`, local time) without mounting checks.
- Handle `async` params in Next.js 15 route handlers / page props properly.

### 3. Tailwind CSS v4 Styling
- **Do NOT create or reference `tailwind.config.js`**; this project uses Tailwind v4 with `@tailwindcss/postcss`.
- Support both Light and Dark themes via `dark:` variant classes and CSS variable tokens.
- For interactive controls, use accessible focus states (`focus-visible:ring-2`) and smooth micro-transitions.

### 4. AI Visual Assistant Governance
- **Canonical Decision Types**: `SEARCH_IMAGE`, `GENERATE_IMAGE`, `DIAGRAM`, `SCREENSHOT`, `CHART`, `CODE_VISUAL`, `NO_VISUAL`.
- **Never Silently Publish**: AI-generated visuals must present a preview and require explicit author approval before inserting into the editor.
- **Deduplication**: When batch generating, reuse existing matching concepts when similarity is ≥ 0.75 (`isReused: true`).
- **Telemetry**: Maintain the 8 canonical lifecycle events (`visual_suggestion_created`, `visual_search_started`, `visual_search_selected`, `visual_generation_started`, `visual_generation_accepted`, `visual_generation_rejected`, `visual_generation_regenerated`, `visual_suggestion_dismissed`).

---

## 5. Skills Reference

Specialized workflows are located in `.agents/skills/`:
- `tiptap-node-views`: Modifying editor extensions, NodeViews, and ProseMirror state.
- `ai-visual-assistant`: Maintaining AI visual classification, batch generation, and asset picking.
- `next15-modern-ui`: Standards for React 19 components, Tailwind v4 design tokens, and Radix UI.
- `frontend-verification`: Pre-commit checklist, TypeScript checks, and regression prevention.
