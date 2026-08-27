"use client";

// =============================================================================
//  BlockActionMenu — Per-block hover action overlay
//  src/features/editor/components/BlockActionMenu.tsx
//
//  Renders a floating action panel beside the hovered TipTap block.
//  Receives all callbacks from useBlockActions — no internal state.
//
//  Actions shown:
//    Move up ↑ / Move down ↓
//    Duplicate
//    Delete
//    AI: Rewrite | Shorten | Expand
//
//  Accessibility:
//    - role="toolbar" + aria-label
//    - Each button has aria-label
//    - Keyboard: Tab navigates through buttons
//    - Does not steal focus from the editor
// =============================================================================

import React, { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Wand2,
  Minimize2,
  Maximize2,
  Loader2,
} from "lucide-react";

interface BlockActionMenuProps {
  /** Bounding rect of the hovered block (viewport-relative) */
  blockRect: DOMRect;
  /** Whether an AI action is currently running */
  isAIWorking: boolean;
  /** Label of the running AI action */
  aiActionLabel: string;
  /** Callbacks */
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRewrite: () => void;
  onShorten: () => void;
  onExpand: () => void;
}

const MENU_WIDTH = 36; // px — single icon column
const OFFSET_X = 6;   // px gap between block left edge and menu

export const BlockActionMenu: React.FC<BlockActionMenuProps> = ({
  blockRect,
  isAIWorking,
  aiActionLabel,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onRewrite,
  onShorten,
  onExpand,
}) => {
  const [showAIMenu, setShowAIMenu] = useState(false);

  // Position: left of the block, vertically centered
  const top = blockRect.top + window.scrollY + blockRect.height / 2;
  const left = blockRect.left + window.scrollX - MENU_WIDTH - OFFSET_X;

  // Ensure we don't overflow the left edge
  const safeLeft = Math.max(4, left);

  const btnClass =
    "flex items-center justify-center w-7 h-7 rounded-md text-[var(--color-editor-secondary)] " +
    "hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] " +
    "transition-colors duration-100 cursor-pointer focus-visible:outline-2 " +
    "focus-visible:outline-[var(--color-editor-accent)] focus-visible:outline-offset-1 " +
    "disabled:opacity-40 disabled:cursor-not-allowed";

  const dangerBtnClass =
    "flex items-center justify-center w-7 h-7 rounded-md text-[var(--color-editor-secondary)] " +
    "hover:text-red-500 hover:bg-red-500/10 " +
    "transition-colors duration-100 cursor-pointer focus-visible:outline-2 " +
    "focus-visible:outline-red-500 focus-visible:outline-offset-1 " +
    "disabled:opacity-40 disabled:cursor-not-allowed";

  const aiBtnClass =
    "flex items-center justify-center w-7 h-7 rounded-md " +
    "text-violet-500 hover:bg-violet-500/10 " +
    "transition-colors duration-100 cursor-pointer focus-visible:outline-2 " +
    "focus-visible:outline-violet-500 focus-visible:outline-offset-1 " +
    "disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div
      role="toolbar"
      aria-label="Block actions"
      style={{
        position: "fixed",
        top: `${top}px`,
        left: `${safeLeft}px`,
        transform: "translateY(-50%)",
        zIndex: 50,
      }}
      // Prevent the menu from disappearing when moving cursor to it
      onMouseEnter={() => { /* intentionally keep menu open */ }}
    >
      <div className="flex flex-col gap-0.5 p-1 rounded-xl bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] shadow-lg shadow-black/10 animate-[fade-in_0.1s_ease-out]">
        {/* Move */}
        <button
          type="button"
          className={btnClass}
          onClick={onMoveUp}
          disabled={isAIWorking}
          aria-label="Move block up"
          title="Move up"
        >
          <ArrowUp size={13} />
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={onMoveDown}
          disabled={isAIWorking}
          aria-label="Move block down"
          title="Move down"
        >
          <ArrowDown size={13} />
        </button>

        {/* Divider */}
        <div className="w-4 h-px bg-[var(--color-editor-border)] mx-auto my-0.5" />

        {/* Duplicate */}
        <button
          type="button"
          className={btnClass}
          onClick={onDuplicate}
          disabled={isAIWorking}
          aria-label="Duplicate block"
          title="Duplicate"
        >
          <Copy size={13} />
        </button>

        {/* Delete */}
        <button
          type="button"
          className={dangerBtnClass}
          onClick={onDelete}
          disabled={isAIWorking}
          aria-label="Delete block"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>

        {/* Divider */}
        <div className="w-4 h-px bg-[var(--color-editor-border)] mx-auto my-0.5" />

        {/* AI Wand — opens AI submenu */}
        {!isAIWorking ? (
          <button
            type="button"
            className={aiBtnClass}
            onClick={() => setShowAIMenu(!showAIMenu)}
            aria-label="AI actions"
            aria-expanded={showAIMenu}
            title="AI actions"
          >
            <Wand2 size={13} />
          </button>
        ) : (
          <div className={aiBtnClass} title={aiActionLabel} aria-live="polite">
            <Loader2 size={13} className="animate-spin" />
          </div>
        )}
      </div>

      {/* AI submenu — pops to the right of the main menu */}
      {showAIMenu && !isAIWorking && (
        <div
          className="absolute top-0 left-full ml-1.5 flex flex-col gap-0.5 p-1.5 rounded-xl bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] shadow-lg shadow-black/10 animate-[fade-in_0.1s_ease-out] w-32"
          role="menu"
          aria-label="AI block actions"
        >
          <p className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-editor-muted)] px-1.5 pb-0.5">
            ✨ AI
          </p>

          <button
            type="button"
            className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-violet-500/10 text-xs text-[var(--color-editor-text)] hover:text-violet-500 transition-colors cursor-pointer"
            role="menuitem"
            onClick={() => {
              setShowAIMenu(false);
              onRewrite();
            }}
          >
            <Wand2 size={11} className="text-violet-500 shrink-0" />
            Rewrite
          </button>

          <button
            type="button"
            className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-violet-500/10 text-xs text-[var(--color-editor-text)] hover:text-violet-500 transition-colors cursor-pointer"
            role="menuitem"
            onClick={() => {
              setShowAIMenu(false);
              onShorten();
            }}
          >
            <Minimize2 size={11} className="text-violet-500 shrink-0" />
            Shorten
          </button>

          <button
            type="button"
            className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-violet-500/10 text-xs text-[var(--color-editor-text)] hover:text-violet-500 transition-colors cursor-pointer"
            role="menuitem"
            onClick={() => {
              setShowAIMenu(false);
              onExpand();
            }}
          >
            <Maximize2 size={11} className="text-violet-500 shrink-0" />
            Expand
          </button>
        </div>
      )}
    </div>
  );
};

export default BlockActionMenu;
