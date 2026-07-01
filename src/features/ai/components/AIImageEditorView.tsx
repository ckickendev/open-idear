"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  X,
  ImagePlus,
  RefreshCw,
  AlertCircle,
  Wand2,
  Undo2,
  Crop,
  Layers,
  Maximize2,
  Paintbrush,
  Image as ImageIcon,
  Check,
  ChevronRight,
} from "lucide-react";

import { useAIImageEditor } from "../hooks/useAIImageEditor";
import type { EditOperation, ChangeStylePreset, ExpandDirection, UpscaleFactor } from "../api/ai.api";
import type { MediaAsset } from "@/features/media-library/types/mediaLibrary.types";

// ─── Config Presets ──────────────────────────────────────────────────────────

const OPERATIONS: { value: EditOperation; label: string; description: string; icon: any }[] = [
  { value: "remove-background", label: "Remove Background", description: "Isolate the main subject", icon: Layers },
  { value: "upscale",           label: "Upscale",           description: "Enhance resolution & clarity", icon: Maximize2 },
  { value: "crop",              label: "Crop",              description: "Deterministic extract region", icon: Crop },
  { value: "expand",            label: "Expand (Outpaint)", description: "Generate matching content outward", icon: Maximize2 },
  { value: "replace-object",    label: "Replace Object",    description: "AI Inpaint objects in context", icon: Wand2 },
  { value: "change-style",      label: "Artistic Style",    description: "Re-render in a new artistic style", icon: Paintbrush },
];

const STYLE_PRESETS: { value: ChangeStylePreset; label: string; icon: string }[] = [
  { value: "oil-painting",   label: "Oil Painting",   icon: "🎨" },
  { value: "watercolor",     label: "Watercolor",     icon: "💧" },
  { value: "anime",          label: "Anime / Manga",  icon: "🎌" },
  { value: "sketch",         label: "Pencil Sketch",  icon: "✏️" },
  { value: "pixel-art",      label: "Pixel Art",      icon: "👾" },
  { value: "3d-render",      label: "3D Render",      icon: "🧱" },
  { value: "vintage-photo",  label: "Vintage Film",   icon: "📷" },
  { value: "neon-cyberpunk", label: "Cyberpunk",      icon: "🌆" },
];

const DIRECTIONS: { value: ExpandDirection; label: string; arrow: string }[] = [
  { value: "top",    label: "Up",      arrow: "↑" },
  { value: "bottom", label: "Down",    arrow: "↓" },
  { value: "left",   label: "Left",    arrow: "←" },
  { value: "right",  label: "Right",   arrow: "→" },
  { value: "all",    label: "All Sides", arrow: "⤢" },
];

export interface AIImageEditorViewProps {
  /** The selected asset to edit. If null, the user will be prompted to select one. */
  sourceAsset: MediaAsset | null;
  /** Trigger callback when user wants to open the Media Picker to select an image. */
  onSelectSourceTrigger: () => void;
  /** Triggered when the edited asset is successfully saved and inserted. */
  onInsertEditedImage: (asset: MediaAsset) => void;
  /** Cancel editing or clear selection. */
  onCancel: () => void;
}

export const AIImageEditorView: React.FC<AIImageEditorViewProps> = ({
  sourceAsset,
  onSelectSourceTrigger,
  onInsertEditedImage,
  onCancel,
}) => {
  const editor = useAIImageEditor();

  // ─── Component form states ──────────────────────────────────────────────────
  const [operation, setOperation] = useState<EditOperation>("remove-background");

  // Upscale State
  const [factor, setFactor] = useState<UpscaleFactor>(2);

  // Crop State
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300);

  // Expand State
  const [direction, setDirection] = useState<ExpandDirection>("all");
  const [fillPrompt, setFillPrompt] = useState("");
  const [pixels, setPixels] = useState(256);

  // Replace Object State
  const [targetDescription, setTargetDescription] = useState("");
  const [replacementDescription, setReplacementDescription] = useState("");

  // Style State
  const [preset, setPreset] = useState<ChangeStylePreset>("oil-painting");
  const [customPrompt, setCustomPrompt] = useState("");

  // Feedback State
  const [inserted, setInserted] = useState(false);

  // Populate crop values from original dimensions if loaded
  useEffect(() => {
    if (sourceAsset?.dimensions) {
      setLeft(0);
      setTop(0);
      setWidth(Math.min(300, sourceAsset.dimensions.width));
      setHeight(Math.min(300, sourceAsset.dimensions.height));
    }
  }, [sourceAsset]);

  const handleEdit = async () => {
    if (!sourceAsset) return;

    let payload: any = {
      sourceMediaId: sourceAsset._id,
      operation,
    };

    switch (operation) {
      case "remove-background":
        break;
      case "upscale":
        payload.factor = factor;
        break;
      case "crop":
        payload.left = Number(left);
        payload.top = Number(top);
        payload.width = Number(width);
        payload.height = Number(height);
        break;
      case "expand":
        payload.direction = direction;
        payload.fillPrompt = fillPrompt || undefined;
        payload.pixels = Number(pixels);
        break;
      case "replace-object":
        payload.targetDescription = targetDescription;
        payload.replacementDescription = replacementDescription;
        break;
      case "change-style":
        payload.preset = preset;
        payload.customPrompt = customPrompt || undefined;
        break;
    }

    await editor.edit(payload);
  };

  const handleInsert = () => {
    if (editor.editedAsset) {
      onInsertEditedImage(editor.editedAsset);
      setInserted(true);
      setTimeout(() => {
        setInserted(false);
        editor.clear();
      }, 2000);
    }
  };

  const sourceImgUrl = sourceAsset?.urls?.thumbnail_md || sourceAsset?.urls?.webp || sourceAsset?.urls?.original;
  const editedImgUrl = editor.editedAsset?.urls?.thumbnail_md || editor.editedAsset?.urls?.webp || editor.editedAsset?.urls?.original;

  return (
    <div className="w-full flex flex-col gap-5 text-[var(--color-editor-text)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-editor-border)] pb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Paintbrush className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-base font-semibold">AI Image Editor</h2>
        </div>
        {sourceAsset && (
          <button
            onClick={onCancel}
            className="text-xs text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Immutability Alert */}
      <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] leading-snug">
        ⚠️ <strong>Immutability Guarantee:</strong> Editing operations never overwrite the original image. Every change generates and saves a completely new library asset.
      </div>

      {/* Error display */}
      {editor.error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs animate-[fade-in_0.15s_ease-out]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{editor.error}</span>
        </div>
      )}

      {/* Step 1: Select source image */}
      {!sourceAsset && (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[var(--color-editor-border)] rounded-xl bg-[var(--color-editor-elevated)] hover:border-[var(--color-editor-accent)]/50 transition-all text-center gap-3">
          <div className="p-3 bg-[var(--color-editor-surface)] rounded-full text-[var(--color-editor-secondary)]">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">No source image selected</h4>
            <p className="text-xs text-[var(--color-editor-secondary)] mt-1">Select an image from your library to begin editing.</p>
          </div>
          <button
            onClick={onSelectSourceTrigger}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-editor-accent)] hover:bg-[var(--color-editor-accent-hover)] text-white text-xs font-semibold rounded-lg shadow cursor-pointer transition-all active:scale-[0.98]"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            Choose Image
          </button>
        </div>
      )}

      {/* Source Selected State */}
      {sourceAsset && !editor.editedAsset && !editor.isEditing && (
        <div className="flex flex-col gap-4 animate-[fade-in_0.15s_ease-out]">
          {/* Source Thumbnail display */}
          <div className="relative rounded-xl border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] p-2.5 flex gap-3 items-center">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[var(--color-editor-surface)] border shrink-0">
              {sourceImgUrl && (
                <img
                  src={sourceImgUrl}
                  alt={sourceAsset.originalFilename}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-[var(--color-editor-text)]">
                {sourceAsset.originalFilename}
              </p>
              <p className="text-[10px] text-[var(--color-editor-secondary)] mt-0.5">
                {sourceAsset.dimensions ? `${sourceAsset.dimensions.width} × ${sourceAsset.dimensions.height}px` : ""}
              </p>
              <button
                onClick={onSelectSourceTrigger}
                className="text-[10px] text-[var(--color-editor-accent)] hover:underline mt-1 block cursor-pointer"
              >
                Change source image
              </button>
            </div>
          </div>

          {/* Operation Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-editor-secondary)]">
              Choose editing operation
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {OPERATIONS.map((op) => {
                const IconComponent = op.icon;
                const isSelected = operation === op.value;
                return (
                  <button
                    key={op.value}
                    onClick={() => setOperation(op.value)}
                    className={`flex flex-col items-start gap-1 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[var(--color-editor-accent)] bg-[var(--color-editor-accent)]/10 text-[var(--color-editor-text)]"
                        : "border-[var(--color-editor-border)] hover:border-[var(--color-editor-accent)]/30 text-[var(--color-editor-secondary)]"
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isSelected ? "text-[var(--color-editor-accent)]" : ""}`} />
                    <span className="text-[11px] font-semibold mt-1">{op.label}</span>
                    <span className="text-[9px] leading-normal opacity-85 block mt-0.5">{op.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operation Specific Inputs */}
          <div className="border-t border-[var(--color-editor-border)] pt-4 mt-1 flex flex-col gap-4">
            {/* 1. Remove background */}
            {operation === "remove-background" && (
              <p className="text-xs text-[var(--color-editor-secondary)] leading-relaxed">
                Isolates the primary subject and strips the background. Done automatically using advanced AI segmentation.
              </p>
            )}

            {/* 2. Upscale */}
            {operation === "upscale" && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[var(--color-editor-secondary)]">Upscale factor</label>
                <div className="flex gap-2">
                  {[2, 4].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFactor(f as UpscaleFactor)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        factor === f
                          ? "border-[var(--color-editor-accent)] bg-[var(--color-editor-accent)]/10 text-[var(--color-editor-accent)]"
                          : "border-[var(--color-editor-border)] text-[var(--color-editor-secondary)]"
                      }`}
                    >
                      {f}x Resolution
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--color-editor-secondary)] mt-1">
                  Enlarges physical dimensions and applies Lanczos3 sharpening.
                </p>
              </div>
            )}

            {/* 3. Crop */}
            {operation === "crop" && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[var(--color-editor-secondary)]">Left (X)</label>
                    <input
                      type="number"
                      value={left}
                      onChange={(e) => setLeft(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[var(--color-editor-secondary)]">Top (Y)</label>
                    <input
                      type="number"
                      value={top}
                      onChange={(e) => setTop(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[var(--color-editor-secondary)]">Width (px)</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[var(--color-editor-secondary)]">Height (px)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Expand */}
            {operation === "expand" && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--color-editor-secondary)]">Direction</label>
                  <div className="flex gap-1 flex-wrap">
                    {DIRECTIONS.map((dir) => (
                      <button
                        key={dir.value}
                        onClick={() => setDirection(dir.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                          direction === dir.value
                            ? "border-[var(--color-editor-accent)] bg-[var(--color-editor-accent)]/10 text-[var(--color-editor-accent)]"
                            : "border-[var(--color-editor-border)] text-[var(--color-editor-secondary)]"
                        }`}
                      >
                        <span className="font-semibold text-xs">{dir.arrow}</span>
                        <span>{dir.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--color-editor-secondary)]">Pixels to add</label>
                  <input
                    type="range"
                    min={128}
                    max={512}
                    step={64}
                    value={pixels}
                    onChange={(e) => setPixels(Number(e.target.value))}
                    className="w-full accent-[var(--color-editor-accent)] cursor-pointer mt-1"
                  />
                  <div className="flex justify-between text-[9px] text-[var(--color-editor-secondary)] mt-0.5">
                    <span>128px</span><span>256px</span><span>384px</span><span>512px</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--color-editor-secondary)]">Describe scene extension (optional)</label>
                  <input
                    type="text"
                    value={fillPrompt}
                    onChange={(e) => setFillPrompt(e.target.value)}
                    placeholder="e.g. Continue the wooden table and add green plants"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]"
                  />
                </div>
              </div>
            )}

            {/* 5. Replace object */}
            {operation === "replace-object" && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--color-editor-secondary)]">What object should be replaced? *</label>
                  <input
                    type="text"
                    value={targetDescription}
                    onChange={(e) => setTargetDescription(e.target.value)}
                    placeholder="e.g. The black phone on the table"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--color-editor-secondary)]">What should replace it? *</label>
                  <input
                    type="text"
                    value={replacementDescription}
                    onChange={(e) => setReplacementDescription(e.target.value)}
                    placeholder="e.g. A white coffee cup with latte art"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]"
                  />
                </div>
              </div>
            )}

            {/* 6. Change style */}
            {operation === "change-style" && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--color-editor-secondary)]">Select Preset</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {STYLE_PRESETS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setPreset(s.value)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                          preset === s.value
                            ? "border-[var(--color-editor-accent)] bg-[var(--color-editor-accent)]/10 text-[var(--color-editor-accent)]"
                            : "border-[var(--color-editor-border)] text-[var(--color-editor-secondary)]"
                        }`}
                      >
                        <span className="text-sm">{s.icon}</span>
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--color-editor-secondary)]">Custom prompt adjustments (optional)</label>
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Add glowing lights, warm color grading"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={handleEdit}
            disabled={
              editor.isEditing ||
              (operation === "replace-object" && (!targetDescription.trim() || !replacementDescription.trim()))
            }
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700 transition-all cursor-pointer font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-3 shadow-lg shadow-violet-500/20 active:scale-[0.99]"
          >
            <Wand2 className="w-4 h-4" />
            Apply Edit with AI
          </button>
        </div>
      )}

      {/* Editing Loading State */}
      {editor.isEditing && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 animate-[fade-in_0.15s_ease-out]">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 animate-spin opacity-30" />
            <div className="absolute inset-1 rounded-full bg-[var(--color-editor-bg)] flex items-center justify-center">
              <Paintbrush className="w-6 h-6 text-violet-400 animate-pulse" />
            </div>
          </div>
          <div className="text-center flex flex-col gap-1">
            <p className="text-sm font-medium">Processing Image Edit…</p>
            <p className="text-xs text-[var(--color-editor-secondary)]">This usually takes 10–25 seconds</p>
          </div>
          <button
            onClick={editor.cancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/10 cursor-pointer transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      )}

      {/* Step 3: Preview and Insert edited result */}
      {editor.editedAsset && !editor.isEditing && (
        <div className="flex flex-col gap-4 animate-[fade-in_0.2s_ease-out]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[var(--color-editor-secondary)] uppercase tracking-wider">
              Edited Result Preview
            </p>
            <button
              onClick={editor.clear}
              className="flex items-center gap-1 text-xs text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] cursor-pointer"
            >
              <Undo2 className="w-3 h-3" />
              Discard & Edit Again
            </button>
          </div>

          {/* Before/After Split Preview */}
          <div className="grid grid-cols-2 gap-2 border border-[var(--color-editor-border)] rounded-xl overflow-hidden bg-[var(--color-editor-elevated)] p-1.5">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-[var(--color-editor-surface)]">
              {sourceImgUrl && (
                <img
                  src={sourceImgUrl}
                  alt="Original Image"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-semibold">
                Original
              </div>
            </div>

            <div className="relative aspect-square rounded-lg overflow-hidden bg-[var(--color-editor-surface)]">
              {editedImgUrl && (
                <img
                  src={editedImgUrl}
                  alt="Edited Result"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-gradient-to-r from-violet-500 to-indigo-600 text-[9px] text-white font-semibold">
                AI Edited
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {editor.summary && (
              <p className="text-xs text-[var(--color-editor-secondary)] leading-relaxed italic bg-[var(--color-editor-elevated)] p-2.5 rounded-lg border border-[var(--color-editor-border)]">
                &ldquo;{editor.summary}&rdquo;
              </p>
            )}

            <button
              onClick={handleInsert}
              className={`w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                inserted
                  ? "bg-green-500/20 text-green-500 border border-green-500/30"
                  : "bg-[var(--color-editor-accent)] text-white hover:opacity-90 shadow-lg shadow-[var(--color-editor-accent)]/20"
              }`}
            >
              {inserted ? (
                <><Check className="w-4 h-4" /> Saved & Inserted</>
              ) : (
                <><ImagePlus className="w-4 h-4" /> Save as New Asset & Insert</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
