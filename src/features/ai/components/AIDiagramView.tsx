"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  Loader2,
  X,
  Copy,
  Check,
  Code,
  Eye,
  Info,
  Wand2,
  FileCode,
  GitFork,
  ArrowRightLeft,
  Database,
  Network,
  HelpCircle,
  CornerDownLeft,
} from "lucide-react";
import { useAIDiagram } from "../hooks/useAIDiagram";
import type { DiagramType } from "../api/ai.api";
import { toast } from "sonner";

// ─── Config Presets ──────────────────────────────────────────────────────────

const DIAGRAM_TYPES: { value: DiagramType; label: string; description: string; icon: any }[] = [
  { value: "auto",         label: "Auto-Detect",     description: "AI decides the best visualization", icon: Sparkles },
  { value: "flowchart",    label: "Flowchart",       description: "Visualize decision paths & steps", icon: GitFork },
  { value: "sequence",     label: "Sequence Diagram",description: "Actor/system lifecycles & calls", icon: ArrowRightLeft },
  { value: "er",           label: "ER Diagram",      description: "Database relations & tables", icon: Database },
  { value: "class",        label: "Class Diagram",   description: "Object-oriented structures", icon: FileCode },
  { value: "architecture", label: "Architecture",    description: "subgraph topology dependencies", icon: Network },
];

// ─── Mermaid Live Renderer ───────────────────────────────────────────────────

function MermaidRenderer({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || !containerRef.current) return;
    setRenderError(null);

    // Create unique ID for this render to avoid conflicts
    const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
    containerRef.current.innerHTML = `<div class="mermaid" id="${uniqueId}">${code}</div>`;

    const initializeAndRender = () => {
      try {
        const m = (window as any).mermaid;
        m.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          themeVariables: {
            background: "#1e1e2e",
            primaryColor: "#cba6f7",
            primaryTextColor: "#cdd6f4",
            lineColor: "#f5e0dc",
          }
        });
        
        m.run({
          nodes: [containerRef.current?.querySelector(".mermaid")]
        }).catch((err: any) => {
          console.warn("Mermaid run error:", err);
          // If first run fails, fallback to raw text container styling
        });
      } catch (err: any) {
        setRenderError(err.message || "Mermaid rendering engine initialization failed.");
      }
    };

    if ((window as any).mermaid) {
      initializeAndRender();
    } else {
      // Lazy load CDN script
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js";
      script.async = true;
      script.onload = initializeAndRender;
      script.onerror = () => setRenderError("Failed to load Mermaid.js engine from CDN.");
      document.body.appendChild(script);
    }
  }, [code]);

  if (renderError) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs leading-relaxed font-mono">
        ⚠️ Render error: {renderError}
        <p className="mt-2 text-[10px] text-muted-foreground">The generated Mermaid code has syntax errors or the CDN is blocked.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#11111b] border border-[var(--color-editor-border)] rounded-xl p-4 overflow-x-auto flex justify-center items-center min-h-[220px]">
      <div ref={containerRef} className="w-full h-full flex justify-center" />
    </div>
  );
}

// ─── Main View ───────────────────────────────────────────────────────────────

export interface AIDiagramViewProps {
  /** Raw content of the current editor to send for analysis */
  editorContent: string;
  /** Triggered when the user inserts the diagram */
  onInsertDiagram: (mermaidCode: string, title: string) => void;
}

export const AIDiagramView: React.FC<AIDiagramViewProps> = ({
  editorContent,
  onInsertDiagram,
}) => {
  const agent = useAIDiagram();

  // Form State
  const [diagramType, setDiagramType] = useState<DiagramType>("auto");
  const [instructions, setInstructions] = useState("");
  const [activePreviewTab, setActivePreviewTab] = useState<"visual" | "code">("visual");

  const [copied, setCopied] = useState(false);
  const [inserted, setInserted] = useState(false);

  const handleGenerate = async () => {
    if (!editorContent || !editorContent.trim()) {
      toast.error("Please write some content in the editor first so the AI can build a diagram.");
      return;
    }
    await agent.generate({
      editorContent,
      diagramType,
      additionalInstructions: instructions || undefined,
    });
  };

  const handleCopy = () => {
    if (agent.result) {
      navigator.clipboard.writeText(agent.result.mermaidCode);
      setCopied(true);
      toast.success("Mermaid syntax copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsert = () => {
    if (agent.result) {
      onInsertDiagram(agent.result.mermaidCode, agent.result.title);
      setInserted(true);
      setTimeout(() => {
        setInserted(false);
        agent.clear();
      }, 2500);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 text-[var(--color-editor-text)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-editor-border)] pb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Network className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-base font-semibold">AI Diagram Generator</h2>
        </div>
        {agent.result && (
          <button
            onClick={agent.clear}
            className="text-xs text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] transition-colors cursor-pointer"
          >
            New
          </button>
        )}
      </div>

      {/* Error */}
      {agent.error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs animate-[fade-in_0.15s_ease-out]">
          <Loader2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{agent.error}</span>
        </div>
      )}

      {/* ── Active Form State ── */}
      {!agent.isGenerating && !agent.result && (
        <div className="flex flex-col gap-4 animate-[fade-in_0.15s_ease-out]">
          {/* Options */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-editor-secondary)] uppercase tracking-wider">
              Diagram Type
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {DIAGRAM_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = diagramType === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setDiagramType(t.value)}
                    className={`flex flex-col items-start gap-1 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[var(--color-editor-accent)] bg-[var(--color-editor-accent)]/10 text-[var(--color-editor-text)]"
                        : "border-[var(--color-editor-border)] hover:border-[var(--color-editor-accent)]/30 text-[var(--color-editor-secondary)]"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[var(--color-editor-accent)]" : ""}`} />
                    <span className="text-[11px] font-semibold mt-1">{t.label}</span>
                    <span className="text-[9px] leading-normal opacity-80 block mt-0.5">{t.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-editor-secondary)] uppercase tracking-wider">
              Special instructions (optional)
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Include the auth middleware block, use side-by-side layout, label API verbs..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] focus:outline-none focus:border-[var(--color-editor-accent)] transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Information box */}
          <div className="flex gap-2 p-3 bg-muted/20 border border-[var(--color-editor-border)] rounded-lg text-[10px] leading-relaxed text-[var(--color-editor-secondary)]">
            <Info className="w-4 h-4 shrink-0 text-[var(--color-editor-accent)]" />
            <span>AI analyzes your current article text in the editor canvas and generates standard renderable Mermaid diagrams.</span>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!editorContent || !editorContent.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700 transition-all cursor-pointer font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-violet-500/20 active:scale-[0.99]"
          >
            <Wand2 className="w-4 h-4" />
            Generate Diagram
          </button>
        </div>
      )}

      {/* ── Loading State ── */}
      {agent.isGenerating && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 animate-[fade-in_0.15s_ease-out]">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 animate-spin opacity-30" />
            <div className="absolute inset-1 rounded-full bg-[var(--color-editor-bg)] flex items-center justify-center">
              <Network className="w-6 h-6 text-violet-400 animate-pulse" />
            </div>
          </div>
          <div className="text-center flex flex-col gap-1">
            <p className="text-sm font-medium">Generating Diagram…</p>
            <p className="text-xs text-[var(--color-editor-secondary)]">Analyzing editor contents and writing Mermaid syntax</p>
          </div>
          <button
            onClick={agent.cancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/10 cursor-pointer transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      )}

      {/* ── Results state ── */}
      {agent.result && !agent.isGenerating && (
        <div className="flex flex-col gap-4 animate-[fade-in_0.2s_ease-out]">
          {/* Header metadata */}
          <div className="p-3 bg-muted/20 border border-[var(--color-editor-border)] rounded-xl space-y-1">
            <h4 className="text-xs font-bold text-[var(--color-editor-text)] truncate">{agent.result.title}</h4>
            <p className="text-[10px] text-[var(--color-editor-secondary)] leading-relaxed">{agent.result.description}</p>
          </div>

          {/* Visual / Code Tabs */}
          <div className="flex border-b border-[var(--color-editor-border)] text-[10px] font-bold tracking-wider uppercase mb-1">
            <button
              onClick={() => setActivePreviewTab("visual")}
              className={`flex-1 py-2 text-center border-b-2 transition-all cursor-pointer ${
                activePreviewTab === "visual"
                  ? "border-[var(--color-editor-accent)] text-[var(--color-editor-accent)]"
                  : "border-transparent text-[var(--color-editor-secondary)]"
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" />
              Live Preview
            </button>
            <button
              onClick={() => setActivePreviewTab("code")}
              className={`flex-1 py-2 text-center border-b-2 transition-all cursor-pointer ${
                activePreviewTab === "code"
                  ? "border-[var(--color-editor-accent)] text-[var(--color-editor-accent)]"
                  : "border-transparent text-[var(--color-editor-secondary)]"
              }`}
            >
              <Code className="w-3.5 h-3.5 inline mr-1" />
              Mermaid Code
            </button>
          </div>

          {/* Rendering Container */}
          {activePreviewTab === "visual" ? (
            <MermaidRenderer code={agent.result.mermaidCode} />
          ) : (
            <div className="relative">
              <pre className="p-3.5 bg-[#1e1e2e] text-[#cdd6f4] rounded-xl border border-[var(--color-editor-border)] text-[10px] font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-56">
                {agent.result.mermaidCode}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                title="Copy Mermaid code"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleInsert}
              className={`w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                inserted
                  ? "bg-green-500/20 text-green-500 border border-green-500/30"
                  : "bg-[var(--color-editor-accent)] text-white hover:opacity-90 shadow-lg shadow-[var(--color-editor-accent)]/20"
              }`}
            >
              {inserted ? (
                <><Check className="w-4 h-4" /> Inserted into Editor</>
              ) : (
                <><CornerDownLeft className="w-3.5 h-3.5" /> Insert into Document</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
