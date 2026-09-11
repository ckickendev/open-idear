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
        <div className="relative w-full">
          {/* Line number gutter hint */}
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-[var(--color-editor-accent)]/20 via-[var(--color-editor-accent)]/5 to-transparent pointer-events-none" />
          <textarea
            value={rawHtml}
            onChange={handleRawHtmlChange}
            className="
 w-full min-h-[60vh] font-mono text-sm leading-relaxed
 pl-6 pr-6 py-5 rounded-2xl
 bg-[var(--color-editor-elevated)]
 border border-[var(--color-editor-border)]
 text-[var(--color-editor-text)]
 placeholder:text-[var(--color-editor-muted)]
 focus:outline-none focus:ring-2 focus:ring-[var(--color-editor-accent)]/40 focus:border-[var(--color-editor-accent)]/50
 resize-y transition-all duration-200
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
    </div>
  );
};

export default HtmlEditor;
