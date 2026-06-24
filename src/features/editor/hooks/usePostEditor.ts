"use client";

import { useCallback, useMemo } from "react";
import { useEditor } from "@tiptap/react";
import type { JSONContent, Editor } from "@tiptap/react";
import { createEditorExtensions } from "../extensions";
import type { UsePostEditorOptions, UsePostEditorReturn } from "../types/editor.types";

/**
 * Core editor hook — owns the Tiptap editor instance lifecycle.
 *
 * KEY DESIGN DECISION: The Tiptap editor IS the single source of truth
 * for document content. No external store (Zustand, Context, etc.)
 * duplicates the content. All other hooks read from this editor via
 * getHTML() / getJSON() / getText() when they need content.
 *
 * This eliminates the infinite-loop and stale-closure bugs from the
 * original architecture where ContentStore and Tiptap were fighting.
 */
export function usePostEditor(
  options: UsePostEditorOptions = {},
): UsePostEditorReturn {
  const {
    initialContent = "",
    placeholder = "Start writing your ideas...",
    onContentChange,
  } = options;

  // Stable ref for the content-change callback so editor's onUpdate
  // never captures a stale closure.
  const onContentChangeRef = useCallback(() => {
    onContentChange?.();
  }, [onContentChange]);

  const editor = useEditor({
    extensions: createEditorExtensions({
      placeholder,
      imageCallbacks: {
        // Image drop/paste callback will be connected by useImageUpload
        // For now, noop — the EditorShell wires this up
        onImageFile: undefined,
      },
    }),
    content: initialContent,
    editorProps: {
      attributes: {
        class: "editor-canvas prose prose-lg focus:outline-none max-w-none",
      },
    },
    immediatelyRender: false,
    onUpdate: () => {
      // Just notify that content changed — let useAutoSave handle the rest
      onContentChangeRef();
    },
  });

  // ─── Derived State ────────────────────────────────────────────────────────

  const isEmpty = useMemo(() => {
    if (!editor) return true;
    return editor.isEmpty;
  }, [editor, editor?.isEmpty]);

  const textContent = useMemo(() => {
    if (!editor) return "";
    return editor.getText();
  }, [editor, editor?.getText]);

  const wordCount = useMemo(() => {
    const trimmed = textContent.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [textContent]);

  const characterCount = useMemo(() => {
    return textContent.trim().length;
  }, [textContent]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const getHTML = useCallback((): string => {
    return editor?.getHTML() ?? "";
  }, [editor]);

  const getJSON = useCallback((): JSONContent => {
    return editor?.getJSON() ?? { type: "doc", content: [] };
  }, [editor]);

  const getText = useCallback((): string => {
    return editor?.getText() ?? "";
  }, [editor]);

  const setContent = useCallback(
    (html: string) => {
      if (editor) {
        editor.commands.setContent(html);
      }
    },
    [editor],
  );

  return {
    editor,
    isReady: !!editor,
    getHTML,
    getJSON,
    getText,
    setContent,
    isEmpty,
    characterCount,
    wordCount,
  };
}
