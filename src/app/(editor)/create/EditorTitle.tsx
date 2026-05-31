"use client";

import React, { useEffect, useRef } from "react";

interface EditorTitleProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const EditorTitle: React.FC<EditorTitleProps> = ({
  value,
  onChange,
  placeholder = "Untitled",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="relative w-full group">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={1}
        className="
 w-full resize-none overflow-hidden
 bg-transparent border-none outline-none
 text-[2.5rem] leading-[1.2] font-bold tracking-[-0.02em]
 text-[var(--color-editor-text)]
 placeholder:text-[var(--color-editor-muted)]
 placeholder:transition-opacity placeholder:duration-200
 focus:placeholder:opacity-50
 caret-[var(--color-editor-accent)]
 py-2
"
        style={{ fontFamily: "inherit" }}
        aria-label="Post title"
        id="editor-title"
      />
      {/* Subtle bottom divider — fades out when title is filled */}
      <div
        className={`
 h-px w-full transition-opacity duration-300
 bg-[var(--color-editor-border)]
 ${value.trim() ? "opacity-0" : "opacity-100 group-focus-within:opacity-60"}
 `}
      />
      {/* Character count on focus */}
      <div className="absolute right-0 -bottom-5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200">
        <span className="text-[11px] text-[var(--color-editor-muted)] tabular-nums">
          {value.length} characters
        </span>
      </div>
    </div>
  );
};

export default EditorTitle;
