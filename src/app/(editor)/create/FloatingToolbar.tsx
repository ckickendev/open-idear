"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Link,
  Quote,
  Code,
  Info,
  HelpCircle,
  Table2,
  Megaphone,
} from "lucide-react";

interface BlockInsertButtonProps {
  onInsert: (type: string) => void;
}

const blockItems = [
  {
    type: "paragraph",
    label: "Paragraph",
    icon: Pilcrow,
    description: "Plain text block",
    category: "Content",
  },
  {
    type: "heading1",
    label: "Heading 1",
    icon: Heading1,
    description: "Large section title",
    category: "Content",
  },
  {
    type: "heading2",
    label: "Heading 2",
    icon: Heading2,
    description: "Medium section title",
    category: "Content",
  },
  {
    type: "heading3",
    label: "Heading 3",
    icon: Heading3,
    description: "Small section title",
    category: "Content",
  },
  {
    type: "image",
    label: "Image",
    icon: Image,
    description: "Upload or embed an image",
    category: "Media",
  },
  { type: "link", label: "Link", icon: Link, description: "Add a hyperlink", category: "Content" },
  {
    type: "blockquote",
    label: "Blockquote",
    icon: Quote,
    description: "Highlight a quote",
    category: "Content",
  },
  {
    type: "codeBlock",
    label: "Code Block",
    icon: Code,
    description: "Add a code snippet",
    category: "Content",
  },
  {
    type: "callout",
    label: "Callout",
    icon: Info,
    description: "Info, tip, warning or caution box",
    category: "Interactive",
  },
  {
    type: "faq",
    label: "FAQ",
    icon: HelpCircle,
    description: "Frequently asked questions",
    category: "Interactive",
  },
  {
    type: "comparison",
    label: "Comparison",
    icon: Table2,
    description: "Side-by-side comparison table",
    category: "Interactive",
  },
  {
    type: "cta",
    label: "Call to Action",
    icon: Megaphone,
    description: "Promotional call-to-action block",
    category: "Interactive",
  },
];

const BlockInsertButton: React.FC<BlockInsertButtonProps> = ({ onInsert }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFilter("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Focus filter input when opened
  useEffect(() => {
    if (isOpen && filterRef.current) {
      filterRef.current.focus();
    }
  }, [isOpen]);

  const filteredItems = blockItems.filter(
    (item) =>
      item.label.toLowerCase().includes(filter.toLowerCase()) ||
      item.description.toLowerCase().includes(filter.toLowerCase()),
  );

  // Group by category
  const grouped = filteredItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof blockItems>,
  );

  const handleSelect = (type: string) => {
    onInsert(type);
    setIsOpen(false);
    setFilter("");
  };

  return (
    <div className="relative flex flex-col items-end" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-200 cursor-pointer shadow-lg border border-[var(--color-editor-border)]/60 animate-float ${
          isOpen
            ? "bg-[var(--color-editor-accent)] text-white shadow-[var(--color-editor-accent)]/25 [animation-play-state:paused]"
            : "bg-[var(--color-editor-surface)] text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] hover:shadow-xl"
        }`}
        aria-label="Insert block"
        aria-expanded={isOpen}
      >
        <Plus
          size={20}
          className={`transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
        />
        <span className="text-sm font-semibold pr-1">Add block</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 bottom-full mb-2 w-72 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-2xl shadow-2xl overflow-hidden animate-[slide-up_0.2s_ease-out] z-50"
          role="menu"
        >
          {/* Filter */}
          <div className="px-3 py-2.5 border-b border-[var(--color-editor-border)]">
            <input
              ref={filterRef}
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search blocks..."
              className="w-full bg-transparent text-sm text-[var(--color-editor-text)] placeholder:text-[var(--color-editor-muted)] outline-none"
              aria-label="Filter block types"
            />
          </div>

          {/* Block list — grouped */}
          <div className="max-h-72 overflow-y-auto py-1">
            {Object.keys(grouped).length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-[var(--color-editor-muted)]">
                No matching blocks
              </div>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  {/* Category header */}
                  <div className="px-3 pt-2.5 pb-1">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-[var(--color-editor-muted)]/70">
                      {category}
                    </span>
                  </div>
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.type}
                        onClick={() => handleSelect(item.type)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[var(--color-editor-elevated)] transition-all duration-150 cursor-pointer group"
                        role="menuitem"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-editor-elevated)] text-[var(--color-editor-secondary)] flex-shrink-0 group-hover:bg-[var(--color-editor-accent)]/10 group-hover:text-[var(--color-editor-accent)] transition-colors duration-200">
                          <Icon size={16} />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-medium text-[var(--color-editor-text)]">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-[var(--color-editor-muted)]">
                            {item.description}
                          </p>
                        </div>
                        {/* Hover accent bar */}
                        <div className="w-0.5 h-6 rounded-full bg-[var(--color-editor-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockInsertButton;
