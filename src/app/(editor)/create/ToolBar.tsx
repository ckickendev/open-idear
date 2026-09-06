"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
} from "lucide-react";

interface ToolbarProps {
  editor: Editor | null;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive,
  title,
  children,
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
      isActive
        ? "bg-[var(--color-editor-accent)]/15 text-[var(--color-editor-accent)] shadow-[0_0_0_1px_var(--color-editor-accent)]/20"
        : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]"
    }`}
    title={title}
    aria-label={title}
    aria-pressed={isActive}
  >
    {children}
  </button>
);

const Divider = () => (
  <div className="w-px h-5 bg-gradient-to-b from-transparent via-[var(--color-editor-border)] to-transparent mx-1 flex-shrink-0" />
);

const GroupLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[8px] uppercase tracking-widest font-bold text-[var(--color-editor-muted)]/60 px-1 select-none hidden md:inline">
    {children}
  </span>
);

const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  const iconSize = 16;

  return (
    <div
      className="flex items-center justify-center flex-wrap gap-0.5 px-4 py-2.5 editor-glass rounded-2xl shadow-sm mb-4"
      role="toolbar"
      aria-label="Formatting toolbar"
    >
      {/* Text formatting */}
      <GroupLabel>Format</GroupLabel>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold (⌘B)"
      >
        <Bold size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic (⌘I)"
      >
        <Italic size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline (⌘U)"
      >
        <Underline size={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Alignment */}
      <GroupLabel>Align</GroupLabel>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Align left"
      >
        <AlignLeft size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Align center"
      >
        <AlignCenter size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Align right"
      >
        <AlignRight size={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <GroupLabel>Lists</GroupLabel>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <List size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Numbered list"
      >
        <ListOrdered size={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Block elements */}
      <GroupLabel>Block</GroupLabel>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Blockquote (⌘⇧B)"
      >
        <Quote size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        title="Code block (⌘⇧C)"
      >
        <Code size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
      >
        <Minus size={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Heading shortcuts */}
      <GroupLabel>Heading</GroupLabel>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1 (⌘⌥1)"
      >
        <span className="text-xs font-bold">H1</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2 (⌘⌥2)"
      >
        <span className="text-xs font-bold">H2</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3 (⌘⌥3)"
      >
        <span className="text-xs font-bold">H3</span>
      </ToolbarButton>
    </div>
  );
};

export default Toolbar;
