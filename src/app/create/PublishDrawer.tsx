'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Plus, Send, Image as ImageIcon } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface PublishDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  /** Categories */
  categories: any[];
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  /** Series */
  seriesList: any[];
  selectedSeries: string;
  onSeriesChange: (val: string) => void;
  onCreateSeries: (name: string) => void;
  /** Description */
  description: string;
  onDescriptionChange: (val: string) => void;
  /** Cover image */
  onCoverImageUploaded: (image: any) => void;
  /** Is publishing in progress */
  isPublishing?: boolean;
}

const PublishDrawer: React.FC<PublishDrawerProps> = ({
  isOpen,
  onClose,
  onPublish,
  categories,
  selectedCategory,
  onCategoryChange,
  seriesList,
  selectedSeries,
  onSeriesChange,
  onCreateSeries,
  description,
  onDescriptionChange,
  onCoverImageUploaded,
  isPublishing = false,
}) => {
  const [showCreateSeries, setShowCreateSeries] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    coverImage: true,
    category: true,
    series: false,
  });
  const [isClosing, setIsClosing] = useState(false);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  };

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreateSeries = () => {
    if (newSeriesName.trim()) {
      onCreateSeries(newSeriesName.trim());
      setNewSeriesName('');
      setShowCreateSeries(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-[fade-in_0.15s_ease-out]"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`relative w-full max-w-md h-full bg-[var(--color-editor-surface)] border-l border-[var(--color-editor-border)] flex flex-col shadow-2xl ${
          isClosing ? 'animate-[slide-out-right_0.25s_ease-in_forwards]' : 'animate-[slide-in-right_0.3s_ease-out]'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Publish settings"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-editor-border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-editor-text)]">Publish</h2>
            <p className="text-xs text-[var(--color-editor-muted)] mt-0.5">
              Configure your post before publishing
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] transition-all duration-150 cursor-pointer"
            aria-label="Close publish drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-1">

          {/* Description Section */}
          <CollapsibleSection
            title="Description"
            subtitle="Recommended for SEO"
            expanded={expandedSections.description}
            onToggle={() => toggleSection('description')}
          >
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={3}
              placeholder="Write a compelling summary of your post..."
              className="w-full bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-editor-text)] placeholder:text-[var(--color-editor-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-editor-accent)]/40 focus:border-[var(--color-editor-accent)]/50 resize-none transition-all duration-150"
              aria-label="Post description"
            />
          </CollapsibleSection>

          {/* Cover Image Section */}
          <CollapsibleSection
            title="Cover Image"
            subtitle="Recommended for SEO"
            expanded={expandedSections.coverImage}
            onToggle={() => toggleSection('coverImage')}
          >
            <div className="rounded-xl overflow-hidden">
              <ImageUpload
                onImageUploaded={onCoverImageUploaded}
                onClose={() => {}}
                isTitleDisplay={false}

              />
            </div>
          </CollapsibleSection>

          {/* Category Section */}
          <CollapsibleSection
            title="Category"
            subtitle="Required"
            expanded={expandedSections.category}
            onToggle={() => toggleSection('category')}
            required
          >
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-editor-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-editor-accent)]/40 focus:border-[var(--color-editor-accent)]/50 transition-all duration-150 cursor-pointer appearance-none"
              aria-label="Select category"
            >
              <option value="">Select a category</option>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </CollapsibleSection>

          {/* Series Section */}
          <CollapsibleSection
            title="Series"
            subtitle="Optional"
            expanded={expandedSections.series}
            onToggle={() => toggleSection('series')}
          >
            {!showCreateSeries ? (
              <div className="space-y-3">
                <select
                  value={selectedSeries}
                  onChange={(e) => onSeriesChange(e.target.value)}
                  className="w-full bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-editor-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-editor-accent)]/40 focus:border-[var(--color-editor-accent)]/50 transition-all duration-150 cursor-pointer appearance-none"
                  aria-label="Select series"
                >
                  <option value="">No series</option>
                  {seriesList.map((ser: any) => (
                    <option key={ser._id} value={ser._id}>{ser.title}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowCreateSeries(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-editor-accent)] hover:text-[var(--color-editor-accent-hover)] transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Create new series
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newSeriesName}
                  onChange={(e) => setNewSeriesName(e.target.value)}
                  placeholder="Series name"
                  className="w-full bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-editor-text)] placeholder:text-[var(--color-editor-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-editor-accent)]/40 focus:border-[var(--color-editor-accent)]/50 transition-all duration-150"
                  aria-label="New series name"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowCreateSeries(false); setNewSeriesName(''); }}
                    className="flex-1 px-3 py-2 text-xs font-medium text-[var(--color-editor-secondary)] border border-[var(--color-editor-border)] rounded-lg hover:bg-[var(--color-editor-elevated)] transition-all duration-150 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSeries}
                    disabled={!newSeriesName.trim()}
                    className="flex-1 px-3 py-2 text-xs font-medium bg-[var(--color-editor-accent)] text-white rounded-lg hover:bg-[var(--color-editor-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}
          </CollapsibleSection>
        </div>

        {/* Footer — sticky at bottom */}
        <div className="px-6 py-4 border-t border-[var(--color-editor-border)] bg-[var(--color-editor-surface)]">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--color-editor-secondary)] border border-[var(--color-editor-border)] rounded-xl hover:bg-[var(--color-editor-elevated)] hover:text-[var(--color-editor-text)] transition-all duration-150 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onPublish}
              disabled={isPublishing || !selectedCategory}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[var(--color-editor-accent)] text-white rounded-xl hover:bg-[var(--color-editor-accent-hover)] shadow-lg shadow-[var(--color-editor-accent)]/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-150 cursor-pointer active:scale-[0.97]"
            >
              {isPublishing ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Publishing...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Publish Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---- Collapsible Section ---- */
interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  expanded: boolean;
  onToggle: () => void;
  required?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  expanded,
  onToggle,
  required,
  children,
}) => (
  <div className="border-b border-[var(--color-editor-border)]/50 last:border-0">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full py-4 group cursor-pointer"
      aria-expanded={expanded}
    >
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-editor-text)]">
          {title}
          {required && <span className="text-[var(--color-editor-danger)] ml-0.5">*</span>}
        </h3>
        {subtitle && (
          <span className="text-[10px] text-[var(--color-editor-muted)] font-medium uppercase tracking-wider">
            {subtitle}
          </span>
        )}
      </div>
      {expanded ? (
        <ChevronUp size={16} className="text-[var(--color-editor-muted)] group-hover:text-[var(--color-editor-secondary)] transition-colors" />
      ) : (
        <ChevronDown size={16} className="text-[var(--color-editor-muted)] group-hover:text-[var(--color-editor-secondary)] transition-colors" />
      )}
    </button>
    {expanded && (
      <div className="pb-4 animate-[fade-in_0.15s_ease-out]">
        {children}
      </div>
    )}
  </div>
);

export default PublishDrawer;
