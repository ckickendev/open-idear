import React, { useState } from "react";
import { Sparkles, Loader2, BookOpen, AlertCircle, Copy, Check, X, FileText } from "lucide-react";
import { type PlannerResponse } from "../api/ai.api";

interface AIPlannerViewProps {
  readonly plan: (payload: any) => Promise<void>;
  readonly writeStream: (options: any, onChunk: (t: string) => void, onComplete: () => void) => Promise<void>;
  readonly cancelWriting: () => void;
  readonly isRunning: boolean;
  readonly isWriting: boolean;
  readonly outline: PlannerResponse | null;
  readonly error: string | null;
  readonly clear: () => void;
  readonly onApplyTitle: (title: string) => void;
  readonly onStartWriting: (instructions: string) => void;
  readonly initialTopic?: string;
}

export const AIPlannerView: React.FC<AIPlannerViewProps> = ({
  plan,
  writeStream,
  cancelWriting,
  isRunning,
  isWriting,
  outline,
  error,
  clear,
  onApplyTitle,
  onStartWriting,
  initialTopic = "",
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Form states
  const [topic, setTopic] = useState(initialTopic);
  const [audience, setAudience] = useState("developers");
  const [tone, setTone] = useState("informative");
  const [length, setLength] = useState("medium");
  const [goal, setGoal] = useState("educate and provide practical examples");
  const [category, setCategory] = useState("programming");
  const [instructions, setInstructions] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    plan({ topic, audience, tone, length, goal, category });
  };

  const handleCopyOutline = () => {
    if (!outline) return;
    const outlineText = outline.outline
      .map((item) => `${item.level === 3 ? "  " : ""}- ${item.title}: ${item.description}`)
      .join("\n");
    navigator.clipboard.writeText(outlineText);
    toastSuccess();
  };

  const toastSuccess = () => {
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-[var(--color-editor-text)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-editor-border)] pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--color-editor-accent)]" />
          <h2 className="text-base font-semibold">AI Article Planner</h2>
        </div>
        {(outline || error || isRunning || isWriting) && (
          <button
            onClick={clear}
            className="text-xs text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] transition-colors cursor-pointer"
          >
            Reset Form
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs animate-[fade-in_0.15s_ease-out]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── Planning Form ────────────────────────────────────────────────── */}
      {!outline && !isRunning && !isWriting && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-editor-secondary)]">
              Article Topic / Idea *
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Docker containerization vs virtual machines"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] focus:outline-none focus:border-[var(--color-editor-accent)] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-editor-secondary)]">
                Target Audience
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. beginners, senior engineers"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] focus:outline-none focus:border-[var(--color-editor-accent)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-editor-secondary)]">
                Tone
              </label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. professional, casual"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] focus:outline-none focus:border-[var(--color-editor-accent)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-editor-secondary)]">
                Length
              </label>
              <input
                type="text"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="e.g. short, 1500 words"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] focus:outline-none focus:border-[var(--color-editor-accent)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-editor-secondary)]">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Cloud, Frontend"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] focus:outline-none focus:border-[var(--color-editor-accent)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-editor-secondary)]">
              Objective / Goal
            </label>
            <textarea
              rows={2}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What should this article achieve?"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] focus:outline-none focus:border-[var(--color-editor-accent)] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!topic.trim()}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[var(--color-editor-accent)] text-white hover:bg-[var(--color-editor-accent-hover)] transition-all cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            Generate Plan
          </button>
        </form>
      )}

      {/* ─── Loading state (Planning) ────────────────────────────────────── */}
      {isRunning && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <Loader2 className="w-8 h-8 text-[var(--color-editor-accent)] animate-spin" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Assembling Outline Plan...</p>
            <p className="text-xs text-[var(--color-editor-secondary)]">Gemini is structuring headings and mapping keywords.</p>
          </div>
        </div>
      )}

      {/* ─── Loading state (Writing / Drafting Stream) ────────────────────── */}
      {isWriting && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <Loader2 className="w-8 h-8 text-[var(--color-editor-accent)] animate-spin" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Drafting Article Body...</p>
            <p className="text-xs text-[var(--color-editor-secondary)]">Content is streaming directly into the editor.</p>
          </div>
          <button
            onClick={cancelWriting}
            className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/10 cursor-pointer transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Cancel Writing
          </button>
        </div>
      )}

      {/* ─── Result outline display ────────────────────────────────────────── */}
      {outline && !isWriting && (
        <div className="flex flex-col gap-5 animate-[slide-up_0.2s_ease-out]">
          {/* Metadata Block */}
          <div className="flex flex-col gap-2 p-4 rounded-lg bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)]">
            <h3 className="text-sm font-bold leading-tight">{outline.title}</h3>
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-[10px] font-semibold tracking-wider uppercase bg-[var(--color-editor-accent)]/10 text-[var(--color-editor-accent)] px-2 py-0.5 rounded-full">
                {outline.difficulty}
              </span>
              <span className="flex items-center gap-1 text-xs text-[var(--color-editor-secondary)]">
                <BookOpen className="w-3.5 h-3.5" />
                {outline.estimatedReadingTime} min read
              </span>
            </div>

            <button
              onClick={() => onApplyTitle(outline.title)}
              className="mt-3 text-left self-start text-xs font-semibold text-[var(--color-editor-accent)] hover:underline cursor-pointer"
            >
              Use this title for post
            </button>
          </div>

          {/* Keywords */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-editor-secondary)]">
              Target SEO Keywords
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {outline.keywords.map((kw, i) => (
                <span key={i} className="text-xs bg-[var(--color-editor-border)]/40 text-[var(--color-editor-secondary)] px-2.5 py-1 rounded-md">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Outline Tree */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-editor-secondary)]">
                Article Outline Structure
              </h4>
              <button
                onClick={handleCopyOutline}
                className="flex items-center gap-1.5 text-xs text-[var(--color-editor-accent)] hover:underline cursor-pointer"
              >
                {copiedIndex === -1 ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Outline</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col border-l-2 border-[var(--color-editor-border)] pl-3 gap-4">
              {outline.outline.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-1 ${item.level === 3 ? "pl-4 border-l border-dashed border-[var(--color-editor-border)]" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[var(--color-editor-secondary)]">
                      H{item.level}
                    </span>
                    <h5 className="text-xs font-semibold">{item.title}</h5>
                  </div>
                  <p className="text-[11px] text-[var(--color-editor-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Instructions & Article Trigger */}
          <div className="flex flex-col gap-3 pt-4 border-t border-[var(--color-editor-border)]">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-editor-secondary)]">
                Additional Writing Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Include code snippets for each topic, use a friendly tone..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] focus:outline-none focus:border-[var(--color-editor-accent)] resize-none"
              />
            </div>

            <button
              onClick={() => onStartWriting(instructions)}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[var(--color-editor-accent)] text-white hover:bg-[var(--color-editor-accent-hover)] transition-all cursor-pointer font-medium text-sm shadow-md"
            >
              <FileText className="w-4 h-4" />
              Generate Article (Stream)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
