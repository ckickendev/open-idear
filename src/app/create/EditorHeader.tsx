'use client';

import React from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Code,
  Save,
  Send,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react';
import SaveStatusIndicator, { SaveStatus } from './SaveStatusIndicator';
import Link from 'next/link';

interface EditorHeaderProps {
  /** Whether we're editing an existing post */
  isEditMode: boolean;
  /** Post is already published */
  isPublished: boolean;
  /** Current preview mode */
  previewMode: boolean;
  onTogglePreview: () => void;
  /** HTML mode */
  htmlMode: boolean;
  onToggleHtmlMode: () => void;
  /** Save */
  onSave: () => void;
  /** Open publish drawer */
  onPublish: () => void;
  /** Toggle post list panel */
  onTogglePostList: () => void;
  /** Auto-save status */
  saveStatus: SaveStatus;
  onRetrySave?: () => void;
  /** Has title — needed to enable save */
  hasTitle: boolean;
  /** AI Generate handler */
  onAIGenerate: () => void;
  isGenerating: boolean;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  isEditMode,
  isPublished,
  previewMode,
  onTogglePreview,
  htmlMode,
  onToggleHtmlMode,
  onSave,
  onPublish,
  onTogglePostList,
  saveStatus,
  onRetrySave,
  hasTitle,
  onAIGenerate,
  isGenerating,
}) => {
  const canSave = hasTitle;
  const canPublish = isEditMode && !isPublished;

  return (
    <header
      className="sticky top-0 z-40 w-full h-14 flex items-center justify-between px-4 md:px-6 border-b border-[var(--color-editor-border)] bg-[var(--color-editor-bg)]/80 backdrop-blur-xl"
      role="banner"
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Post list toggle */}
        <button
          onClick={onTogglePostList}
          className="p-2 rounded-lg text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] transition-all duration-150 cursor-pointer"
          aria-label="Toggle post list"
        >
          <PanelLeftOpen size={18} />
        </button>

        {/* Back link */}
        <Link
          href="/"
          className="hidden sm:flex items-center gap-1.5 text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] transition-colors duration-150"
          aria-label="Go home"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">OpenIdear</span>
        </Link>

        {/* Separator */}
        <div className="hidden sm:block w-px h-5 bg-[var(--color-editor-border)]" />

        {/* Status indicator */}
        <SaveStatusIndicator status={saveStatus} onRetry={onRetrySave} />

        {/* Draft / Published badge */}
        <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
          isPublished
            ? 'bg-[var(--color-editor-success)]/15 text-[var(--color-editor-success)]'
            : 'bg-[var(--color-editor-warning)]/15 text-[var(--color-editor-warning)]'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-[var(--color-editor-success)]' : 'bg-[var(--color-editor-warning)]'}`} />
          {isPublished ? 'Published' : 'Draft'}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5">
        {/* AI Generate */}
        <button
          onClick={onAIGenerate}
          disabled={isGenerating || !hasTitle}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
            isGenerating || !hasTitle
              ? 'text-[var(--color-editor-muted)] cursor-not-allowed'
              : 'text-[var(--color-editor-accent)] hover:bg-[var(--color-editor-accent)]/10'
          }`}
          aria-label="Generate content with AI"
        >
          <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
          <span>{isGenerating ? 'Generating...' : 'AI Generate'}</span>
        </button>

        {/* Separator */}
        <div className="hidden sm:block w-px h-5 bg-[var(--color-editor-border)]" />

        {/* HTML mode toggle */}
        <button
          onClick={onToggleHtmlMode}
          className={`p-2 rounded-lg transition-all duration-150 cursor-pointer ${
            htmlMode
              ? 'bg-[var(--color-editor-accent)]/15 text-[var(--color-editor-accent)]'
              : 'text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]'
          }`}
          aria-label={htmlMode ? 'Switch to visual editor' : 'Switch to HTML mode'}
          title={htmlMode ? 'Visual mode' : 'HTML mode'}
        >
          <Code size={16} />
        </button>

        {/* Preview toggle */}
        {!htmlMode && (
          <button
            onClick={onTogglePreview}
            className={`p-2 rounded-lg transition-all duration-150 cursor-pointer ${
              previewMode
                ? 'bg-[var(--color-editor-accent)]/15 text-[var(--color-editor-accent)]'
                : 'text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]'
            }`}
            aria-label={previewMode ? 'Exit preview' : 'Preview post'}
            title={previewMode ? 'Exit preview' : 'Preview'}
          >
            {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {/* Save button */}
        <button
          onClick={onSave}
          disabled={!canSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
            canSave
              ? 'text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] hover:border-[var(--color-editor-secondary)]'
              : 'text-[var(--color-editor-muted)] cursor-not-allowed border border-transparent'
          }`}
          aria-label="Save draft"
        >
          <Save size={14} />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Publish button */}
        <button
          onClick={onPublish}
          disabled={!canPublish}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
            canPublish
              ? 'bg-[var(--color-editor-accent)] hover:bg-[var(--color-editor-accent-hover)] text-white shadow-lg shadow-[var(--color-editor-accent)]/25 hover:shadow-[var(--color-editor-accent-hover)]/30 active:scale-[0.97]'
              : 'bg-[var(--color-editor-elevated)] text-[var(--color-editor-muted)] cursor-not-allowed'
          }`}
          aria-label={isPublished ? 'Already published' : 'Publish post'}
        >
          <Send size={14} />
          <span>{isPublished ? 'Published' : 'Publish'}</span>
        </button>
      </div>
    </header>
  );
};

export default EditorHeader;
