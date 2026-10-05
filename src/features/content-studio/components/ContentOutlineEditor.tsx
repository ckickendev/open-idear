"use client";

// =============================================================================
//  AI CONTENT STUDIO — OUTLINE EDITOR COMPONENT
//  src/features/content-studio/components/ContentOutlineEditor.tsx
//
//  Design Decisions:
//  - Allows full customization of AI-generated content outline:
//    * Edit title, introduction, conclusion, and FAQ.
//    * Reorder sections (Move Up / Move Down).
//    * Add new sections or delete sections.
//    * Add, edit, or remove key bullet points.
//  - Preserves edits across idea tabs and navigation steps.
//  - Matches OpenIdear design system tokens, font styles, and card aesthetics.
// =============================================================================

import React, { useState } from "react";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  RefreshCw,
  HelpCircle,
  Layers,
  FileText,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import type {
  ContentIdea,
  ContentBrief,
  ContentOutline,
} from "../types/contentStudio.types";

interface ContentOutlineEditorProps {
  selectedIdeas: ContentIdea[];
  activeIdeaIndex: number;
  onSelectIdeaIndex: (index: number) => void;
  outline: ContentOutline;
  brief: ContentBrief;
  isGeneratingOutline: boolean;
  onRegenerateOutline: () => void;
  onUpdateTitle: (title: string) => void;
  onUpdateIntroduction: (intro: string) => void;
  onUpdateConclusion: (conclusion: string) => void;
  onUpdateSectionHeading: (sectionId: string, heading: string) => void;
  onUpdateSectionPurpose: (sectionId: string, purpose: string) => void;
  onReorderSections: (fromIndex: number, toIndex: number) => void;
  onAddSection: (afterIndex?: number) => void;
  onDeleteSection: (sectionId: string) => void;
  onAddKeyPoint: (sectionId: string, pointText?: string) => void;
  onUpdateKeyPoint: (sectionId: string, pointIndex: number, text: string) => void;
  onDeleteKeyPoint: (sectionId: string, pointIndex: number) => void;
  onAddFaqItem: () => void;
  onUpdateFaqItem: (faqIndex: number, question: string, answerDirection: string) => void;
  onDeleteFaqItem: (faqIndex: number) => void;
  onBack: () => void;
  onGenerateArticle: () => void;
}

export function ContentOutlineEditor({
  selectedIdeas,
  activeIdeaIndex,
  onSelectIdeaIndex,
  outline,
  brief,
  isGeneratingOutline,
  onRegenerateOutline,
  onUpdateTitle,
  onUpdateIntroduction,
  onUpdateConclusion,
  onUpdateSectionHeading,
  onUpdateSectionPurpose,
  onReorderSections,
  onAddSection,
  onDeleteSection,
  onAddKeyPoint,
  onUpdateKeyPoint,
  onDeleteKeyPoint,
  onAddFaqItem,
  onUpdateFaqItem,
  onDeleteFaqItem,
  onBack,
  onGenerateArticle,
}: ContentOutlineEditorProps) {
  const currentIdea = selectedIdeas[activeIdeaIndex] || selectedIdeas[0];
  const [showFaq, setShowFaq] = useState(true);

  if (!currentIdea || !outline) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-border/60">
        <Sparkles className="w-8 h-8 text-primary animate-pulse mb-3" />
        <p className="text-muted-foreground font-medium">
          Loading outline specifications...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Multi-Idea Tabs (if more than 1 selected) ───────────────────── */}
      {selectedIdeas.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1 shrink-0">
            Selected Ideas ({selectedIdeas.length}):
          </span>
          {selectedIdeas.map((idea, idx) => {
            const isActive = idx === activeIdeaIndex;
            return (
              <button
                key={idea.id}
                type="button"
                onClick={() => onSelectIdeaIndex(idx)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                    : "bg-background text-muted-foreground border-border hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="max-w-[200px] truncate">{idea.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ─── Main Outline Card ───────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border/70 shadow-sm overflow-hidden transition-all">
        {/* Header Banner */}
        <div className="px-6 py-5 border-b border-border/60 bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <Layers className="w-3 h-3" />
                Step 3: Content Outline
              </span>
              <span className="text-xs text-muted-foreground">
                Idea {activeIdeaIndex + 1} of {selectedIdeas.length}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                {brief.length}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground line-clamp-2">
              {currentIdea.title}
            </h2>
            {currentIdea.hook && (
              <p className="text-xs text-muted-foreground line-clamp-1 italic">
                Hook: &ldquo;{currentIdea.hook}&rdquo;
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onRegenerateOutline}
            disabled={isGeneratingOutline}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-background hover:bg-muted/70 text-foreground transition-all shrink-0 disabled:opacity-60 shadow-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isGeneratingOutline ? "animate-spin text-primary" : "text-muted-foreground"
              }`}
            />
            {isGeneratingOutline ? "Regenerating..." : "Regenerate outline"}
          </button>
        </div>

        {/* Outline Form Body */}
        <div className="p-6 md:p-8 space-y-8">
          {/* 1. Article Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Article Title (H1)
              </label>
              <span className="text-[11px] text-muted-foreground">
                {outline.title.length} characters
              </span>
            </div>
            <input
              type="text"
              value={outline.title}
              onChange={(e) => onUpdateTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
              placeholder="Enter comprehensive article title..."
            />
          </div>

          {/* 2. Introduction */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Introduction & Hook
              </label>
              <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                Hook & Context Preview
              </span>
            </div>
            <textarea
              rows={2}
              value={outline.introduction}
              onChange={(e) => onUpdateIntroduction(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-xs"
              placeholder="Outline the hook, problem statement, and key expectations for the reader..."
            />
          </div>

          {/* 3. Sections Hierarchy */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Article Sections ({outline.sections.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Reorder, add, or tailor headings and key discussion points.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onAddSection()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Section
              </button>
            </div>

            <div className="space-y-4">
              {outline.sections.map((section, sIdx) => {
                const isFirst = sIdx === 0;
                const isLast = sIdx === outline.sections.length - 1;

                return (
                  <div
                    key={section.id}
                    className="p-5 rounded-xl border border-border/80 bg-background/60 hover:border-primary/40 hover:bg-background transition-all space-y-3.5 group shadow-xs"
                  >
                    {/* Section Card Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center shrink-0">
                          {sIdx + 1}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Section {sIdx + 1}
                        </span>
                      </div>

                      {/* Controls: Move Up, Move Down, Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onReorderSections(sIdx, sIdx - 1)}
                          disabled={isFirst}
                          title="Move Up"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onReorderSections(sIdx, sIdx + 1)}
                          disabled={isLast}
                          title="Move Down"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {outline.sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeleteSection(section.id)}
                            title="Delete Section"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Section Heading Input */}
                    <div>
                      <input
                        type="text"
                        value={section.heading}
                        onChange={(e) =>
                          onUpdateSectionHeading(section.id, e.target.value)
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="H2 Section Heading..."
                      />
                    </div>

                    {/* Section Purpose */}
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                        Editorial Purpose:
                      </label>
                      <input
                        type="text"
                        value={section.purpose}
                        onChange={(e) =>
                          onUpdateSectionPurpose(section.id, e.target.value)
                        }
                        className="w-full px-3.5 py-1.5 rounded-lg border border-border/70 bg-muted/20 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Explain why this section matters for the reader..."
                      />
                    </div>

                    {/* Key Discussion Points */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                          Key Discussion Points & Benchmarks:
                        </span>
                        <button
                          type="button"
                          onClick={() => onAddKeyPoint(section.id)}
                          className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add Point
                        </button>
                      </div>

                      <div className="space-y-1.5 pl-2">
                        {section.keyPoints.map((point, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex items-center gap-2 group/pt"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                            <input
                              type="text"
                              value={point}
                              onChange={(e) =>
                                onUpdateKeyPoint(
                                  section.id,
                                  pIdx,
                                  e.target.value
                                )
                              }
                              className="flex-1 px-2.5 py-1 rounded-md border border-border/60 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all"
                              placeholder="Key takeaway, code hint, or benchmark..."
                            />
                            {section.keyPoints.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  onDeleteKeyPoint(section.id, pIdx)
                                }
                                className="opacity-0 group-hover/pt:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                                title="Remove point"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Conclusion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Conclusion & Next Steps
              </label>
              <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                Summary & Final Advice
              </span>
            </div>
            <textarea
              rows={2}
              value={outline.conclusion}
              onChange={(e) => onUpdateConclusion(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-xs"
              placeholder="Synthesize core insights, recommendation matrix, and actionable next steps..."
            />
          </div>

          {/* 5. Frequently Asked Questions (FAQ) */}
          <div className="space-y-3 border-t border-border/60 pt-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowFaq(!showFaq)}
                className="text-sm font-bold text-foreground flex items-center gap-2 hover:text-primary transition-all"
              >
                <HelpCircle className="w-4 h-4 text-primary" />
                Frequently Asked Questions ({outline.faq?.length || 0})
                <span className="text-xs font-normal text-muted-foreground">
                  {showFaq ? "(Click to hide)" : "(Click to expand)"}
                </span>
              </button>

              <button
                type="button"
                onClick={onAddFaqItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add FAQ
              </button>
            </div>

            {showFaq && outline.faq && outline.faq.length > 0 && (
              <div className="space-y-3 pt-2">
                {outline.faq.map((item, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-3.5 rounded-xl border border-border/60 bg-muted/10 space-y-2 group/faq"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) =>
                          onUpdateFaqItem(
                            fIdx,
                            e.target.value,
                            item.answerDirection
                          )
                        }
                        className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                        placeholder="User search intent question..."
                      />
                      <button
                        type="button"
                        onClick={() => onDeleteFaqItem(fIdx)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-all"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <textarea
                      rows={1}
                      value={item.answerDirection}
                      onChange={(e) =>
                        onUpdateFaqItem(fIdx, item.question, e.target.value)
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-border/70 bg-background/80 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                      placeholder="Direction or key bullet to answer this question..."
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Footer Action Bar ────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-border/60 bg-muted/20 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border bg-background hover:bg-muted/70 text-foreground transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            Back to Brief
          </button>

          <button
            type="button"
            onClick={onGenerateArticle}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-primary text-white hover:brightness-105 active:scale-[0.98] shadow-md shadow-primary/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Generate Article
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
