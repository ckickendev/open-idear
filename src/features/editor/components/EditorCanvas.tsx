"use client";

import React, { useRef, useCallback } from "react";
import { EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";

interface EditorCanvasProps {
  editor: Editor | null;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

/**
 * EditorCanvas — thin wrapper around TipTap's EditorContent.
 *
 * Handles drag/drop area and provides the container ref for
 * position calculations (e.g., FloatingToolbar, image drops).
 */
const EditorCanvas: React.FC<EditorCanvasProps> = ({
  editor,
  onDragOver,
  onDrop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      onDragOver?.(e);
    },
    [onDragOver],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDrop?.(e);
    },
    [onDrop],
  );

  if (!editor) return null;

  return (
    <div
      ref={containerRef}
      className="mt-1 min-h-[60vh]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <EditorContent editor={editor} />
    </div>
  );
};

export default EditorCanvas;
