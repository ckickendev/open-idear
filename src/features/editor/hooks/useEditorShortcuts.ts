"use client";

import { useEffect, useRef } from "react";
import type { Editor } from "@tiptap/react";

interface UseEditorShortcutsOptions {
  editor: Editor | null;
  onSave: () => void;
  onPublish: () => void;
  onTogglePreview: () => void;
  onTogglePostList?: () => void;
}

/**
 * Keyboard shortcuts for the editor.
 *
 * Registers global keyboard shortcuts that work regardless of
 * whether the editor has focus.
 *
 * ⌘+S → Save
 * ⌘+Enter → Open publish
 * ⌘+Shift+P → Toggle preview
 * ⌘+\ → Toggle posts menu
 */
export function useEditorShortcuts(options: UseEditorShortcutsOptions): void {
  const { editor, onSave, onPublish, onTogglePreview, onTogglePostList } = options;

  // Use refs to avoid re-registering handlers on every render
  const onSaveRef = useRef(onSave);
  const onPublishRef = useRef(onPublish);
  const onTogglePreviewRef = useRef(onTogglePreview);
  const onTogglePostListRef = useRef(onTogglePostList);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    onPublishRef.current = onPublish;
  }, [onPublish]);

  useEffect(() => {
    onTogglePreviewRef.current = onTogglePreview;
  }, [onTogglePreview]);

  useEffect(() => {
    onTogglePostListRef.current = onTogglePostList;
  }, [onTogglePostList]);

  useEffect(() => {
    if (!editor) return;

    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // ⌘+S → Save
      if (isMod && e.key === "s") {
        e.preventDefault();
        onSaveRef.current();
        return;
      }

      // ⌘+Enter → Publish
      if (isMod && e.key === "Enter") {
        e.preventDefault();
        onPublishRef.current();
        return;
      }

      // ⌘+Shift+P → Toggle preview
      if (isMod && e.shiftKey && e.key === "p") {
        e.preventDefault();
        onTogglePreviewRef.current();
        return;
      }

      // ⌘+\ → Toggle post menu
      if (isMod && e.key === "\\") {
        e.preventDefault();
        onTogglePostListRef.current?.();
        return;
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [editor]);
}
