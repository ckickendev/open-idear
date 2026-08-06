import React, { useState } from "react";
import { Check, X, CheckCheck, Sparkles, Image as ImageIcon, ExternalLink } from "lucide-react";
import { ResolvedImage } from "../api/ai.api";

export interface ImageEnhancementReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resolvedImages: ResolvedImage[];
  onConfirm: (approvedImages: ResolvedImage[]) => void;
  isLoading?: boolean;
}

export const ImageEnhancementReviewModal: React.FC<ImageEnhancementReviewModalProps> = ({
  isOpen,
  onClose,
  resolvedImages,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(resolvedImages.map((img) => img.id)));

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(resolvedImages.map((img) => img.id)));
  };

  const handleRejectAll = () => {
    setSelectedIds(new Set());
  };

  const handleConfirm = () => {
    const approved = resolvedImages.filter((img) => selectedIds.has(img.id));
    onConfirm(approved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl text-white overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Review AI Image Suggestions</h2>
              <p className="text-sm text-neutral-400">
                Select contextual images to auto-insert into matching article sections.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Accept All
            </button>
            <button
              onClick={handleRejectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Reject All
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[60vh]">
          {resolvedImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="w-12 h-12 text-neutral-600 mb-3" />
              <p className="text-base text-neutral-400 font-medium">No suitable image suggestions found.</p>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                Try adding more section headings or broadening your topic context.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resolvedImages.map((img) => {
                const isSelected = selectedIds.has(img.id);

                return (
                  <div
                    key={img.id}
                    onClick={() => toggleSelect(img.id)}
                    className={`group relative flex flex-col rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-500/5"
                        : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 opacity-70"
                    }`}
                  >
                    {/* Badge & Toggle */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                        Section: {img.alt || "Body Section"}
                      </span>

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/50"
                            : "bg-neutral-800 text-neutral-500 border border-neutral-700"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Image Preview Container */}
                    <div className="relative w-full h-44 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 mb-3 group-hover:border-neutral-700 transition-colors">
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-black/60 backdrop-blur-md text-neutral-300 border border-white/10">
                        {img.provider}
                      </div>
                    </div>

                    {/* Meta Metadata */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-neutral-200 line-clamp-1">
                        Alt: <span className="text-neutral-400 font-normal">{img.alt}</span>
                      </p>
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 truncate"
                      >
                        <ExternalLink className="w-3 h-3" /> View original asset
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-900/80">
          <span className="text-xs text-neutral-400 font-medium">
            Selected: <strong className="text-indigo-400 font-semibold">{selectedIds.size}</strong> of {resolvedImages.length} images
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> Apply Selected Images
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
