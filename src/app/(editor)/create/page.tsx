"use client";

import React, { Suspense } from "react";
import EditorShell from "@/features/editor/components/EditorShell";

/**
 * Create/Edit Post page.
 *
 * This is now a thin shell that delegates everything to EditorShell.
 * The old 762-line god component has been decomposed into:
 *
 *   - usePostEditor()     → Editor instance lifecycle
 *   - useAutoSave()       → Debounced save with hash comparison
 *   - usePublishPost()    → Publish workflow with validation
 *   - useImageUpload()    → CDN-first image upload
 *   - useEditorShortcuts()→ ⌘+S, ⌘+Enter, ⌘+Shift+P
 *   - useContentMetrics() → Word count, reading time, heading analysis
 *
 * All composed inside EditorShell with proper error boundaries.
 */
export default function CreatePost() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-editor-bg flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-editor-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-editor-muted">Loading editor...</p>
          </div>
        </div>
      }
    >
      <EditorShell />
    </Suspense>
  );
}
