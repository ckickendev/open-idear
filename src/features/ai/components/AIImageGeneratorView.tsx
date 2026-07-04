"use client";

import React, { useState, useCallback } from "react";
import {
  Sparkles,
  Loader2,
  X,
  Download,
  ImagePlus,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  Wand2,
  ZoomIn,
  Check,
} from "lucide-react";

import { useAIImageGenerator } from "../hooks/useAIImageGenerator";
import type { AspectRatio, ImageStyle } from "../api/ai.api";
import type { MediaAsset } from "@/features/media-library/types/mediaLibrary.types";

// ─── Config ───────────────────────────────────────────────────────────────────

const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: string }[] = [
  { value: "1:1",  label: "Square",    icon: "⬛" },
  { value: "16:9", label: "Landscape", icon: "▬" },
  { value: "9:16", label: "Portrait",  icon: "▮" },
  { value: "4:3",  label: "Classic",   icon: "▭" },
  { value: "3:4",  label: "Tall",      icon: "▯" },
];

const STYLES: { value: ImageStyle; label: string; description: string }[] = [
  { value: "photorealistic", label: "Photo",       description: "Sharp, realistic photography" },
  { value: "digital-art",    label: "Digital Art", description: "Vibrant concept art style" },
  { value: "illustration",   label: "Illustration",description: "Hand-drawn artistic look" },
  { value: "sketch",         label: "Sketch",      description: "Pencil drawing, B&W" },
  { value: "cinematic",      label: "Cinematic",   description: "Movie-grade lighting" },
  { value: "minimalist",     label: "Minimalist",  description: "Clean, simple forms" },
];

const PROMPT_SUGGESTIONS = [
  "A futuristic server room with glowing blue LED lights",
  "Abstract geometric pattern representing data flow",
  "Modern developer workspace with multiple monitors",
  "Cloud infrastructure diagram as a digital painting",
  "Open source community collaboration, warm colors",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function GeneratedImageCard({
  asset,
  revisedPrompt,
  onInsert,
  onPreview,
}: {
  asset: MediaAsset;
  revisedPrompt?: string;
  onInsert: (asset: MediaAsset) => void;
  onPreview: (url: string) => void;
}) {
  const [inserted, setInserted] = useState(false);
  const imgUrl = asset.urls?.thumbnail_md || asset.urls?.webp || asset.urls?.original;

  const handleInsert = () => {
    onInsert(asset);
    setInserted(true);
    setTimeout(() => setInserted(false), 2500);
  };

  return (
    <div className="group relative rounded-xl overflow-hidden border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] transition-all duration-200 hover:border-[var(--color-editor-accent)]/50 hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[var(--color-editor-surface)]">
        {imgUrl && (
          <img
            src={imgUrl}
            alt={asset.altText || "AI generated image"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <button
            onClick={() => onPreview(asset.urls?.original || imgUrl || "")}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer backdrop-blur-sm"
            title="Preview full size"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* AI badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--color-editor-accent)]/90 text-white text-[9px] font-semibold tracking-wider uppercase backdrop-blur-sm">
          <Sparkles className="w-2.5 h-2.5" />
          AI
        </div>
      </div>

      {/* Footer */}
      <div className="p-2.5 flex flex-col gap-2">
        {revisedPrompt && (
          <p className="text-[10px] text-[var(--color-editor-secondary)] leading-tight line-clamp-2" title={revisedPrompt}>
            {revisedPrompt}
          </p>
        )}

        <button
          onClick={handleInsert}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            inserted
              ? "bg-green-500/20 text-green-500 border border-green-500/30"
              : "bg-[var(--color-editor-accent)] text-white hover:opacity-90"
          }`}
        >
          {inserted ? (
            <><Check className="w-3.5 h-3.5" /> Inserted</>
          ) : (
            <><ImagePlus className="w-3.5 h-3.5" /> Insert</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Full-size preview overlay ────────────────────────────────────────────────

function ImagePreviewOverlay({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-[fade-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-all"
        >
          <X className="w-4 h-4" />
        </button>
        <img
          src={url}
          alt="Preview"
          className="w-full h-full object-contain rounded-xl shadow-2xl max-h-[85vh]"
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface AIImageGeneratorViewProps {
  onInsertImage?: (asset: MediaAsset) => void;
}

export const AIImageGeneratorView: React.FC<AIImageGeneratorViewProps> = ({
  onInsertImage,
}) => {
  const generator = useAIImageGenerator();

  // ── Form state ───────────────────────────────────────────────────────────
  const [prompt, setPrompt]             = useState("");
  const [negativePrompt, setNegPrompt]  = useState("");
  const [aspectRatio, setAspectRatio]   = useState<AspectRatio>("1:1");
  const [style, setStyle]               = useState<ImageStyle>("photorealistic");
  const [count, setCount]               = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<number | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || generator.isGenerating) return;
    await generator.generate({ prompt, negativePrompt: negativePrompt || undefined, aspectRatio, style, count });
  }, [prompt, negativePrompt, aspectRatio, style, count, generator]);

  const handleSuggestion = (text: string, idx: number) => {
    setPrompt(text);
    setActiveSuggestion(idx);
  };

  return (
    <>
      {/* Full-size preview overlay */}
      {previewUrl && (
        <ImagePreviewOverlay url={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}

      <div className="w-full flex flex-col gap-5 text-[var(--color-editor-text)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-editor-border)] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Wand2 className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-base font-semibold">AI Image Generator</h2>
          </div>

          {/* Provider badge */}
          {generator.lastUsedProviderId && (
            <span className="text-[10px] text-[var(--color-editor-secondary)] px-2 py-0.5 rounded-full border border-[var(--color-editor-border)]">
              {generator.providers.find(p => p.id === generator.lastUsedProviderId)?.displayName ?? generator.lastUsedProviderId}
            </span>
          )}

          {generator.generatedAssets.length > 0 && (
            <button
              onClick={generator.clear}
              className="text-xs text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] transition-colors cursor-pointer"
            >
              New
            </button>
          )}
        </div>

        {/* Error */}
        {generator.error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs animate-[fade-in_0.15s_ease-out]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{generator.error}</span>
          </div>
        )}

        {/* ── Results ─────────────────────────────────────────────────────── */}
        {generator.generatedAssets.length > 0 && !generator.isGenerating && (
          <div className="flex flex-col gap-3 animate-[fade-in_0.2s_ease-out]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[var(--color-editor-secondary)] uppercase tracking-wider">
                Generated — {generator.generatedAssets.length} {generator.generatedAssets.length === 1 ? "image" : "images"}
              </p>
              <button
                onClick={handleGenerate}
                disabled={generator.isGenerating}
                className="flex items-center gap-1 text-xs text-[var(--color-editor-accent)] hover:underline cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            </div>

            <div className={`grid gap-2.5 ${generator.generatedAssets.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {generator.generatedAssets.map((asset, i) => (
                <GeneratedImageCard
                  key={asset._id}
                  asset={asset}
                  revisedPrompt={generator.revisedPrompts[i]}
                  onInsert={(a) => onInsertImage?.(a)}
                  onPreview={(url) => setPreviewUrl(url)}
                />
              ))}
            </div>

            <p className="text-[10px] text-[var(--color-editor-secondary)] text-center">
              ✓ Saved to your Media Library · AI metadata generating in background
            </p>
          </div>
        )}

        {/* ── Loading ──────────────────────────────────────────────────────── */}
        {generator.isGenerating && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 animate-[fade-in_0.15s_ease-out]">
            {/* Animated gradient ring */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 animate-spin opacity-30" />
              <div className="absolute inset-1 rounded-full bg-[var(--color-editor-bg)] flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-violet-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center flex flex-col gap-1">
              <p className="text-sm font-medium">Generating image{count > 1 ? "s" : ""}…</p>
              <p className="text-xs text-[var(--color-editor-secondary)]">This may take 15–30 seconds</p>
            </div>
            <button
              onClick={generator.cancel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/10 cursor-pointer transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        )}

        {/* ── Form ────────────────────────────────────────────────────────── */}
        {!generator.isGenerating && generator.generatedAssets.length === 0 && (
          <div className="flex flex-col gap-4 animate-[fade-in_0.15s_ease-out]">
            {/* Prompt */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-editor-secondary)]">
                Describe the image you want *
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => { setPrompt(e.target.value); setActiveSuggestion(null); }}
                placeholder="e.g. A futuristic API gateway diagram with glowing data streams…"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] focus:outline-none focus:border-[var(--color-editor-accent)] transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Prompt suggestions */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-medium text-[var(--color-editor-secondary)] uppercase tracking-wider">
                Quick prompts
              </p>
              <div className="flex flex-col gap-1">
                {PROMPT_SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(s, i)}
                    className={`text-left text-[11px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer truncate ${
                      activeSuggestion === i
                        ? "border-[var(--color-editor-accent)]/50 bg-[var(--color-editor-accent)]/10 text-[var(--color-editor-accent)]"
                        : "border-transparent hover:border-[var(--color-editor-border)] hover:bg-[var(--color-editor-elevated)] text-[var(--color-editor-secondary)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Style grid */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-editor-secondary)]">Style</label>
              <div className="grid grid-cols-3 gap-1.5">
                {STYLES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    title={s.description}
                    className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                      style === s.value
                        ? "border-[var(--color-editor-accent)] bg-[var(--color-editor-accent)]/10 text-[var(--color-editor-accent)]"
                        : "border-[var(--color-editor-border)] hover:border-[var(--color-editor-accent)]/40 text-[var(--color-editor-secondary)]"
                    }`}
                  >
                    <span className="text-[10px] font-semibold">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect ratio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-editor-secondary)]">Aspect Ratio</label>
              <div className="flex gap-1.5 flex-wrap">
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                      aspectRatio === r.value
                        ? "border-[var(--color-editor-accent)] bg-[var(--color-editor-accent)]/10 text-[var(--color-editor-accent)]"
                        : "border-[var(--color-editor-border)] hover:border-[var(--color-editor-accent)]/40 text-[var(--color-editor-secondary)]"
                    }`}
                  >
                    <span>{r.icon}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced options */}
            <div className="border border-[var(--color-editor-border)] rounded-lg overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] transition-colors cursor-pointer"
              >
                <span>Advanced Options</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="px-3 pb-3 flex flex-col gap-3 border-t border-[var(--color-editor-border)] pt-3 animate-[fade-in_0.1s_ease-out]">
                  {/* Count */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--color-editor-secondary)]">
                      Number of images: {count}
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="w-full accent-[var(--color-editor-accent)] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[var(--color-editor-secondary)]">
                      <span>1</span><span>2</span><span>3</span><span>4</span>
                    </div>
                  </div>

                  {/* Negative prompt */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--color-editor-secondary)]">
                      Negative Prompt
                      <span className="ml-1 font-normal opacity-60">(what to avoid)</span>
                    </label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegPrompt(e.target.value)}
                      placeholder="e.g. blurry, watermark, text"
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] focus:outline-none focus:border-[var(--color-editor-accent)] transition-all"
                    />
                  </div>

                  {/* Provider selector */}
                  {generator.providers.filter(p => p.available).length > 1 && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-[var(--color-editor-secondary)]">Provider</label>
                      <div className="flex flex-wrap gap-1.5">
                        {generator.providers.filter(p => p.available).map((p) => (
                          <span
                            key={p.id}
                            className={`px-2 py-0.5 rounded-full text-[10px] border ${
                              p.active
                                ? "border-[var(--color-editor-accent)] text-[var(--color-editor-accent)] bg-[var(--color-editor-accent)]/10"
                                : "border-[var(--color-editor-border)] text-[var(--color-editor-secondary)]"
                            }`}
                          >
                            {p.displayName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generator.isGenerating}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700 transition-all cursor-pointer font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-violet-500/20 active:scale-[0.99]"
            >
              <Wand2 className="w-4 h-4" />
              Generate {count > 1 ? `${count} Images` : "Image"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};
