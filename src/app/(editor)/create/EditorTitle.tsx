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
 text-[2.5rem] leading-[1.15] font-bold tracking-[-0.025em]
 text-[var(--color-editor-text)]
 placeholder:text-[var(--color-editor-muted)]/60
 placeholder:transition-all placeholder:duration-300
 focus:placeholder:opacity-40 focus:placeholder:translate-x-1
 caret-[var(--color-editor-accent)]
 py-2
"
        style={{ fontFamily: "inherit" }}
        aria-label="Post title"
        id="editor-title"
      />
      {/* Gradient underline — scales from center on focus */}
      <div className="relative h-px w-full overflow-hidden">
        <div
          className={`
 absolute inset-0
 bg-gradient-to-r from-transparent via-[var(--color-editor-accent)] to-transparent
 transition-all duration-500 ease-out
 ${value.trim() ? "opacity-0 scale-x-0" : "opacity-30 scale-x-50 group-focus-within:opacity-80 group-focus-within:scale-x-100"}
 `}
          style={{ transformOrigin: "center" }}
        />
        <div
          className={`
 absolute inset-0
 bg-[var(--color-editor-border)]
 transition-opacity duration-300
 ${value.trim() ? "opacity-0" : "opacity-100 group-focus-within:opacity-0"}
 `}
        />
      </div>
      {/* Character count on focus */}
      <div className="absolute right-0 -bottom-6 opacity-0 group-focus-within:opacity-100 translate-y-1 group-focus-within:translate-y-0 transition-all duration-300 ease-out">
        <span className="text-[11px] text-[var(--color-editor-muted)] tabular-nums font-medium">
          {value.length} characters
        </span>
      </div>
    </div>
  );
};

export default EditorTitle;
