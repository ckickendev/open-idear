"use client";

import React from "react";
import type { Editor } from "@tiptap/react";

// Re-export RawHtmlExtension from the new canonical location
// so existing imports `from "./HtmlEditor"` continue to work.
export { RawHtmlExtension } from "@/features/editor/extensions/rawHtml";

interface HtmlEditorProps {
  editor: Editor | null;
  setRawHtml: (html: string) => void;
  rawHtml: string;
}

/**
 * HTML source editor.
 *
 * Simplified: no longer depends on ContentStore for visibility
 * (the parent EditorShell controls mode). Always renders when mounted.
 */
const HtmlEditor: React.FC<HtmlEditorProps> = ({
  editor,
  setRawHtml,
  rawHtml,
}) => {
  const handleRawHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawHtml(e.target.value);
  };

  return (
    <div className="html-editor-container w-full">
      <div className="w-full flex flex-col items-center">
        <textarea
          value={rawHtml}
          onChange={handleRawHtmlChange}
          className="
 w-full min-h-[60vh] font-mono text-sm leading-relaxed
 px-6 py-5 rounded-xl
 bg-[var(--color-editor-elevated)]
 border border-[var(--color-editor-border)]
 text-[var(--color-editor-text)]
 placeholder:text-[var(--color-editor-muted)]
 focus:outline-none focus:ring-2 focus:ring-[var(--color-editor-accent)]/40 focus:border-[var(--color-editor-accent)]/50
 resize-y transition-all duration-150
 whitespace-pre
"
          placeholder="Enter raw HTML..."
          style={{
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            tabSize: 2,
          }}
          spellCheck={false}
          aria-label="HTML source editor"
        />
      </div>
    </div>
  );
};

export default HtmlEditor;
