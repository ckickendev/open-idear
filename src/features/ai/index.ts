/**
 * src/features/ai/index.ts
 *
 * Responsibility:
 *   Public barrel export for the entire frontend AI feature module.
 *   Exports all hooks, components, store, API client, and types.
 *
 * Why it exists:
 *   Other features (editor, publish) import from "@/features/ai" — never
 *   from internal paths. This keeps the module's internal structure free
 *   to change without breaking consumers.
 */
export { AIPlannerView } from "./components/AIPlannerView";
export { AIImageGeneratorView } from "./components/AIImageGeneratorView";
export { AIImageEditorView } from "./components/AIImageEditorView";
export { useAIPlanner } from "./hooks/useAIPlanner";
export { useAIImageGenerator } from "./hooks/useAIImageGenerator";
export { useAIImageEditor } from "./hooks/useAIImageEditor";
export type { AspectRatio, ImageStyle, ImageGenerationRequest, ImageProviderMeta, EditOperation, ChangeStylePreset, ExpandDirection, UpscaleFactor, ImageEditRequest, ImageEditResponse } from "./api/ai.api";

