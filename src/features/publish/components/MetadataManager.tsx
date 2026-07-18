// =============================================================================
//  AI PUBLISHING FEATURE — METADATA MANAGER COMPONENT
//  src/features/publish/components/MetadataManager.tsx
//
//  Design Decisions:
//  - Reusable, interactive metadata editor with tabs and state bindings.
//  - Displays real-time Google Search (SERP), Facebook (Open Graph), and
//    Twitter Card preview mocks.
//  - Validates character lengths (SEO title, meta description) and slug matches.
//  - Extensible design supporting Robots indexes and advanced settings.
// =============================================================================

import React, { useState } from "react";
import { Globe, Share2, ShieldAlert, CheckCircle, Search, Eye } from "lucide-react";

export interface PublishMetadata {
  seoTitle: string;
  seoDescription: string;
  slug: string;
  canonicalUrl: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterCard: "summary" | "summary_large_image";
  robotsIndex: boolean;
  robotsFollow: boolean;
}

interface MetadataManagerProps {
  readonly metadata: PublishMetadata;
  readonly onChange: (updated: PublishMetadata) => void;
  readonly defaultCanonicalDomain?: string;
}

type TabType = "seo" | "social" | "advanced";
type PreviewTabType = "google" | "facebook" | "twitter";

export default function MetadataManager({
  metadata,
  onChange,
  defaultCanonicalDomain = "https://openidear.com",
}: MetadataManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("seo");
  const [previewTab, setPreviewTab] = useState<PreviewTabType>("google");
  const [keywordInput, setKeywordInput] = useState("");

  // Helper helper to update fields cleanly
  const updateField = (key: keyof PublishMetadata, value: any) => {
    onChange({
      ...metadata,
      [key]: value,
    });
  };

  // Add keywords to tag array
  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = keywordInput.trim().toLowerCase().replace(/,/g, "");
      if (trimmed && !metadata.keywords.includes(trimmed)) {
        updateField("keywords", [...metadata.keywords, trimmed]);
      }
      setKeywordInput("");
    }
  };

  // Remove keywords from tag array
  const handleRemoveKeyword = (keywordToRemove: string) => {
    updateField(
      "keywords",
      metadata.keywords.filter((k) => k !== keywordToRemove)
    );
  };

  return (
    <div className="metadata-manager-root grid grid-cols-1 lg:grid-cols-2 gap-6 w-full text-xs text-[var(--color-editor-text)] animate-[fade-in_0.2s_ease-out]">
      {/* ─── Column 1: Config Fields Panel ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 p-5 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-2xl shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-[var(--color-editor-border)] pb-2 mb-2">
          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`px-4 py-2 border-b-2 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "seo"
                ? "border-[var(--color-editor-accent)] text-[var(--color-editor-accent)]"
                : "border-transparent text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)]"
            }`}
          >
            <Globe size={13} />
            <span>Search (SEO)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("social")}
            className={`px-4 py-2 border-b-2 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "social"
                ? "border-[var(--color-editor-accent)] text-[var(--color-editor-accent)]"
                : "border-transparent text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)]"
            }`}
          >
            <Share2 size={13} />
            <span>Social (OG)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("advanced")}
            className={`px-4 py-2 border-b-2 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "advanced"
                ? "border-[var(--color-editor-accent)] text-[var(--color-editor-accent)]"
                : "border-transparent text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)]"
            }`}
          >
            <ShieldAlert size={13} />
            <span>Advanced</span>
          </button>
        </div>

        {/* Tab Content Canvas */}
        <div className="space-y-4 min-h-[380px]">
          {/* Tab 1: SEO */}
          {activeTab === "seo" && (
            <div className="space-y-4 animate-[fade-in_0.1s_ease-out]">
              {/* Slug */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--color-editor-secondary)]">URL Slug</label>
                <div className="flex rounded-lg border border-[var(--color-editor-border)] overflow-hidden bg-[var(--color-editor-elevated)]">
                  <span className="bg-[var(--color-editor-border)] px-3 py-2 text-[var(--color-editor-muted)] border-r border-[var(--color-editor-border)] flex items-center select-none font-mono">
                    /posts/
                  </span>
                  <input
                    type="text"
                    value={metadata.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                    placeholder="my-post-url-slug"
                    className="flex-1 px-3 py-2 bg-transparent border-none outline-none font-mono text-xs text-[var(--color-editor-text)]"
                  />
                </div>
              </div>

              {/* SEO Title */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-[var(--color-editor-secondary)]">SEO Title</label>
                  <span className={`text-[10px] font-mono ${metadata.seoTitle.length > 60 ? "text-amber-500" : "text-[var(--color-editor-muted)]"}`}>
                    {metadata.seoTitle.length}/60 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={metadata.seoTitle}
                  onChange={(e) => {
                    updateField("seoTitle", e.target.value);
                    // Sync OG & Twitter Title if identical initially
                    if (!metadata.ogTitle || metadata.ogTitle === metadata.seoTitle) updateField("ogTitle", e.target.value);
                    if (!metadata.twitterTitle || metadata.twitterTitle === metadata.seoTitle) updateField("twitterTitle", e.target.value);
                  }}
                  placeholder="Compelling and high-click title tag"
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] outline-none focus:border-[var(--color-editor-accent)] text-xs text-[var(--color-editor-text)]"
                />
              </div>

              {/* SEO Description */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-[var(--color-editor-secondary)]">Meta Description</label>
                  <span className={`text-[10px] font-mono ${metadata.seoDescription.length > 160 ? "text-amber-500" : "text-[var(--color-editor-muted)]"}`}>
                    {metadata.seoDescription.length}/160 chars
                  </span>
                </div>
                <textarea
                  value={metadata.seoDescription}
                  onChange={(e) => {
                    updateField("seoDescription", e.target.value);
                    if (!metadata.ogDescription || metadata.ogDescription === metadata.seoDescription) updateField("ogDescription", e.target.value);
                    if (!metadata.twitterDescription || metadata.twitterDescription === metadata.seoDescription) updateField("twitterDescription", e.target.value);
                  }}
                  placeholder="Summary for search card snippets (max 160 characters)"
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] outline-none focus:border-[var(--color-editor-accent)] text-xs resize-none text-[var(--color-editor-text)]"
                />
              </div>

              {/* Canonical URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--color-editor-secondary)]">Canonical URL</label>
                <input
                  type="url"
                  value={metadata.canonicalUrl}
                  onChange={(e) => updateField("canonicalUrl", e.target.value)}
                  placeholder={`${defaultCanonicalDomain}/posts/${metadata.slug || "post"}`}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] outline-none focus:border-[var(--color-editor-accent)] text-xs text-[var(--color-editor-text)]"
                />
              </div>

              {/* Keywords tags */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--color-editor-secondary)]">Focus Keywords</label>
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder="Press Enter or comma to insert tags"
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] outline-none focus:border-[var(--color-editor-accent)] text-xs text-[var(--color-editor-text)]"
                />
                {metadata.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {metadata.keywords.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[var(--color-editor-border)] text-[var(--color-editor-secondary)] px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 select-none animate-[scale-in_0.1s_ease-out]"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(tag)}
                          className="hover:text-[var(--color-editor-text)] font-bold text-[8px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Social OG */}
          {activeTab === "social" && (
            <div className="space-y-4 animate-[fade-in_0.1s_ease-out]">
              {/* OG Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--color-editor-secondary)]">Open Graph Title</label>
                <input
                  type="text"
                  value={metadata.ogTitle}
                  onChange={(e) => updateField("ogTitle", e.target.value)}
                  placeholder="Custom title for social networks"
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] outline-none focus:border-[var(--color-editor-accent)] text-xs text-[var(--color-editor-text)]"
                />
              </div>

              {/* OG Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--color-editor-secondary)]">Open Graph Description</label>
                <textarea
                  value={metadata.ogDescription}
                  onChange={(e) => updateField("ogDescription", e.target.value)}
                  placeholder="Custom description for social network cards"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] outline-none focus:border-[var(--color-editor-accent)] text-xs resize-none text-[var(--color-editor-text)]"
                />
              </div>

              {/* OG & Twitter Image URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--color-editor-secondary)]">Social Share Image URL</label>
                <input
                  type="url"
                  value={metadata.ogImage}
                  onChange={(e) => {
                    updateField("ogImage", e.target.value);
                    updateField("twitterImage", e.target.value);
                  }}
                  placeholder="https://cdn.example.com/banner-image.jpg"
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] outline-none focus:border-[var(--color-editor-accent)] text-xs text-[var(--color-editor-text)]"
                />
              </div>

              {/* Twitter Card Layout Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--color-editor-secondary)]">Twitter Card Layout</label>
                <select
                  value={metadata.twitterCard}
                  onChange={(e) => updateField("twitterCard", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] outline-none text-xs text-[var(--color-editor-text)]"
                >
                  <option value="summary">Summary Card (Small Image)</option>
                  <option value="summary_large_image">Summary Card with Large Image</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab 3: Advanced */}
          {activeTab === "advanced" && (
            <div className="space-y-4 animate-[fade-in_0.1s_ease-out]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-editor-muted)] block border-b border-[var(--color-editor-border)] pb-1 mb-2">
                Robots Instructions
              </span>

              {/* Robots index Checkbox */}
              <label className="flex items-center gap-3 p-3 bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={metadata.robotsIndex}
                  onChange={(e) => updateField("robotsIndex", e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--color-editor-border)] text-[var(--color-editor-accent)]"
                />
                <div>
                  <span className="font-semibold block text-xs">Allow indexing (index)</span>
                  <span className="text-[10px] text-[var(--color-editor-muted)] leading-relaxed block mt-0.5">
                    Permit search crawlers to list this post in search results.
                  </span>
                </div>
              </label>

              {/* Robots follow Checkbox */}
              <label className="flex items-center gap-3 p-3 bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={metadata.robotsFollow}
                  onChange={(e) => updateField("robotsFollow", e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--color-editor-border)] text-[var(--color-editor-accent)]"
                />
                <div>
                  <span className="font-semibold block text-xs">Follow links (follow)</span>
                  <span className="text-[10px] text-[var(--color-editor-muted)] leading-relaxed block mt-0.5">
                    Permit crawlers to follow the links present on this page to index outer sources.
                  </span>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* ─── Column 2: Live Preview Panel ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 p-5 bg-[var(--color-editor-bg)] border border-[var(--color-editor-border)] rounded-2xl shadow-sm h-full justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-editor-border)] pb-2 mb-2 select-none">
            <span className="font-bold text-xs uppercase tracking-wider text-[var(--color-editor-secondary)] flex items-center gap-1.5">
              <Eye size={14} />
              <span>Real-Time Search & Card Previews</span>
            </span>

            {/* Preview selectors */}
            <div className="flex items-center gap-1 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setPreviewTab("google")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                  previewTab === "google"
                    ? "bg-[var(--color-editor-accent)] text-white shadow-sm"
                    : "text-[var(--color-editor-secondary)] hover:bg-[var(--color-editor-elevated)]"
                }`}
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("facebook")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                  previewTab === "facebook"
                    ? "bg-[var(--color-editor-accent)] text-white shadow-sm"
                    : "text-[var(--color-editor-secondary)] hover:bg-[var(--color-editor-elevated)]"
                }`}
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("twitter")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                  previewTab === "twitter"
                    ? "bg-[var(--color-editor-accent)] text-white shadow-sm"
                    : "text-[var(--color-editor-secondary)] hover:bg-[var(--color-editor-elevated)]"
                }`}
              >
                Twitter
              </button>
            </div>
          </div>

          {/* Preview canvas */}
          <div className="preview-canvas-box bg-slate-900 border border-slate-800 rounded-xl p-5 min-h-[220px] flex items-center justify-center">
            {/* Google Preview */}
            {previewTab === "google" && (
              <div className="w-full text-left font-sans text-slate-100 max-w-lg space-y-1 bg-white p-4 rounded border border-zinc-200">
                <span className="text-[11px] text-zinc-600 block truncate leading-none">
                  {defaultCanonicalDomain}/posts/{metadata.slug || "post"}
                </span>
                <span className="text-xl font-medium text-blue-800 hover:underline cursor-pointer block leading-tight truncate">
                  {metadata.seoTitle || "Untitled Draft - OpenIdear"}
                </span>
                <p className="text-zinc-600 text-xs leading-relaxed mt-1 block line-clamp-2">
                  {metadata.seoDescription || "Please provide a description inside the meta description editor field."}
                </p>
              </div>
            )}

            {/* Facebook OG Card Preview */}
            {previewTab === "facebook" && (
              <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg font-sans">
                {metadata.ogImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={metadata.ogImage} alt="OG Social Banner Preview" className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-slate-800 flex items-center justify-center text-slate-500 font-semibold italic text-xs select-none">
                    Missing OG Cover Image
                  </div>
                )}
                <div className="p-3 border-t border-slate-800 bg-slate-950 text-left">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 block leading-none font-semibold mb-1">
                    {window?.location?.host || "openidear.com"}
                  </span>
                  <span className="font-bold text-sm text-slate-100 block truncate leading-snug">
                    {metadata.ogTitle || metadata.seoTitle || "Social Card Title"}
                  </span>
                  <p className="text-slate-400 text-[11px] leading-snug mt-1 truncate block">
                    {metadata.ogDescription || metadata.seoDescription || "Social Card Description"}
                  </p>
                </div>
              </div>
            )}

            {/* Twitter Card Preview */}
            {previewTab === "twitter" && (
              <div className="w-full max-w-md border border-slate-800 bg-slate-950 rounded-xl overflow-hidden text-left font-sans flex flex-col">
                {metadata.twitterCard === "summary_large_image" ? (
                  /* Twitter Large Image Card */
                  <>
                    {metadata.ogImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={metadata.ogImage} alt="Twitter Large Card Preview" className="w-full h-44 object-cover" />
                    ) : (
                      <div className="w-full h-44 bg-slate-800 flex items-center justify-center text-slate-500 font-semibold italic text-xs select-none">
                        No Twitter Image URL
                      </div>
                    )}
                    <div className="p-3 bg-slate-950 border-t border-slate-800">
                      <span className="text-[10px] text-slate-500 block leading-none mb-1 font-semibold">
                        {window?.location?.host || "openidear.com"}
                      </span>
                      <span className="font-bold text-sm text-slate-100 block truncate leading-snug">
                        {metadata.twitterTitle || metadata.seoTitle || "Twitter Card Title"}
                      </span>
                      <p className="text-slate-400 text-[11px] leading-snug mt-1 truncate block">
                        {metadata.twitterDescription || metadata.seoDescription || "Twitter Card Description"}
                      </p>
                    </div>
                  </>
                ) : (
                  /* Twitter Small Summary Card */
                  <div className="flex border-t border-slate-800 bg-slate-950 p-3 items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] text-slate-500 block font-semibold leading-none mb-1">
                        {window?.location?.host || "openidear.com"}
                      </span>
                      <span className="font-bold text-xs text-slate-100 block truncate leading-none">
                        {metadata.twitterTitle || metadata.seoTitle || "Twitter Card Title"}
                      </span>
                      <p className="text-slate-400 text-[10px] leading-snug mt-1 truncate block">
                        {metadata.twitterDescription || metadata.seoDescription || "Twitter Card Description"}
                      </p>
                    </div>
                    {metadata.ogImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={metadata.ogImage} alt="Twitter Summary Preview" className="w-20 h-20 object-cover rounded-lg border border-slate-800 shrink-0" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-800 flex items-center justify-center rounded-lg text-slate-500 font-semibold italic text-[9px] select-none text-center leading-none shrink-0 border border-slate-800">
                        No Image
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quality Audit Checklist Hints */}
        <div className="p-3 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl flex items-start gap-2 text-[10px] leading-relaxed text-[var(--color-editor-muted)] font-medium">
          <CheckCircle size={13} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[var(--color-editor-text)] block">SEO Verification Engine</span>
            <p className="mt-0.5">Meta data changes feed instantly into the validation checkers. Keep titles below 60 and descriptions below 160 for optimal search indexing scores.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
