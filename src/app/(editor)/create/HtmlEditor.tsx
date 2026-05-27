'use client';

import React from 'react';
import { Extension } from '@tiptap/core';
import contentStore from '@/store/ContentStore';

const RawHtmlExtension = Extension.create({
  name: 'rawHtml',

  addCommands() {
    return {
      setRawHtml:
        (html: string) =>
          ({ commands }: { commands: any }) => {
            commands.setContent(html);
            return true;
          },
    } as Partial<Record<string, any>>;
  },
});

const HtmlEditor = ({ editor, setRawHtml, rawHtml }: any) => {
  const showHtmlEditor = contentStore((state) => state.showHtmlEditor);

  interface RawHtmlChangeEvent extends React.ChangeEvent<HTMLTextAreaElement> {}

  const handleRawHtmlChange = (e: RawHtmlChangeEvent) => {
    setRawHtml(e.target.value);
  };

  return (
    <div className="html-editor-container w-full">
      {showHtmlEditor && (
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
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', tabSize: 2 }}
            spellCheck={false}
            aria-label="HTML source editor"
          />
        </div>
      )}
    </div>
  );
};

export default HtmlEditor;
export { RawHtmlExtension };