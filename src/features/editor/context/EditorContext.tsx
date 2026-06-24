"use client";

import React, { createContext, useContext } from "react";
import type { Editor } from "@tiptap/react";

/**
 * EditorContext — provides the Tiptap editor instance to all child components.
 *
 * This replaces prop-drilling the editor through 5+ component levels.
 * Components like Toolbar, BlockInsert, WriterMetrics can access the
 * editor directly via useEditorContext().
 */

interface EditorContextValue {
  editor: Editor | null;
}

const EditorContext = createContext<EditorContextValue>({ editor: null });

export function EditorProvider({
  editor,
  children,
}: {
  editor: Editor | null;
  children: React.ReactNode;
}) {
  return (
    <EditorContext.Provider value={{ editor }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext(): EditorContextValue {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context;
}
