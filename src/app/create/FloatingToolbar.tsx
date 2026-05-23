'use client';

import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';

interface BlockInsertButtonProps {
  onInsert: (type: string) => void;
}

const blockItems = [
  { type: 'paragraph', label: 'Paragraph', icon: Pilcrow, description: 'Plain text block' },
  { type: 'heading1', label: 'Heading 1', icon: Heading1, description: 'Large section title' },
  { type: 'heading2', label: 'Heading 2', icon: Heading2, description: 'Medium section title' },
  { type: 'heading3', label: 'Heading 3', icon: Heading3, description: 'Small section title' },
  { type: 'image', label: 'Image', icon: Image, description: 'Upload or embed an image' },
  { type: 'link', label: 'Link', icon: Link, description: 'Add a hyperlink' },
  { type: 'blockquote', label: 'Blockquote', icon: Quote, description: 'Highlight a quote' },
  { type: 'codeBlock', label: 'Code Block', icon: Code, description: 'Add a code snippet' },
];

const BlockInsertButton: React.FC<BlockInsertButtonProps> = ({ onInsert }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFilter('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
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
      item.description.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSelect = (type: string) => {
    onInsert(type);
    setIsOpen(false);
    setFilter('');
  };

  return (
    <div className="relative flex flex-col items-end" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-200 cursor-pointer shadow-lg shadow-gray-300/40 border border-[var(--color-editor-border)] ${
          isOpen
            ? 'bg-[var(--color-editor-accent)] text-white'
            : 'bg-[var(--color-editor-surface)] text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]'
        }`}
        aria-label="Insert block"
        aria-expanded={isOpen}
      >
        <Plus size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
        <span className="text-sm font-semibold pr-1">Add block</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 bottom-full mb-2 w-64 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl shadow-xl shadow-gray-300/40 overflow-hidden animate-[slide-up_0.15s_ease-out] z-50"
          role="menu"
        >
          {/* Filter */}
          <div className="px-3 py-2 border-b border-[var(--color-editor-border)]">
            <input
              ref={filterRef}
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter blocks..."
              className="w-full bg-transparent text-sm text-[var(--color-editor-text)] placeholder:text-[var(--color-editor-muted)] outline-none"
              aria-label="Filter block types"
            />
          </div>

          {/* Block list */}
          <div className="max-h-64 overflow-y-auto py-1">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-[var(--color-editor-muted)]">
                No matching blocks
              </div>
            ) : (
              filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => handleSelect(item.type)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[var(--color-editor-elevated)] transition-colors duration-100 cursor-pointer"
                    role="menuitem"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-editor-elevated)] text-[var(--color-editor-secondary)] flex-shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-[var(--color-editor-text)]">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-[var(--color-editor-muted)]">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockInsertButton;