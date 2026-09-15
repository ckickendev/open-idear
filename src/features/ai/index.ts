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
export { AIDiagramView } from "./components/AIDiagramView";
export { useAIPlanner } from "./hooks/useAIPlanner";
export { useAIImageGenerator } from "./hooks/useAIImageGenerator";
export { useAIImageEditor } from "./hooks/useAIImageEditor";
export { ImageEnhancementReviewModal } from "./components/ImageEnhancementReviewModal";
export { useImageEnhancementReview } from "./hooks/useImageEnhancementReview";
export { AIGenerationModal } from "./components/AIGenerationModal";
export { useAIGeneratorPipeline } from "./hooks/useAIGeneratorPipeline";
export { aiApi } from "./api/ai.api";
export { publisherApi } from "./api/publisher.api";
export { usePublishByAI } from "./hooks/usePublishByAI";
export { PublishByAIModal } from "./components/PublishByAIModal";
export { AIPublisherPanel, type AIPublisherResult } from "./components/AIPublisherPanel";
export {
  AIPublisherCard,
  type AIPublisherCardProps,
  TopicInput,
  type TopicInputProps,
  PublisherConfigGrid,
  type PublisherConfigGridProps,
  PresetChips,
  type PresetChipsProps,
  GenerateActions,
  type GenerateActionsProps,
  GenerationProgress,
  type GenerationProgressProps,
} from "./components/publisher";
export { OneClickPublisherModal } from "./components/OneClickPublisherModal";
export { BrandVoiceSelector } from "./components/BrandVoiceSelector";
export { brandVoiceApi, type BrandVoiceProfile } from "./api/brandVoice.api";
export { internalLinkApi, type InternalLinkRequest, type InternalLinkResponse } from "./api/internalLink.api";
export type { AspectRatio, ImageStyle, ImageGenerationRequest, ImageProviderMeta, EditOperation, ChangeStylePreset, ExpandDirection, UpscaleFactor, ImageEditRequest, ImageEditResponse, DiagramType, DiagramRequest, DiagramResponse, ResolvedImage } from "./api/ai.api";
export type { PublisherRequest, PublisherResponse, CoverImageResult } from "./api/publisher.api";
export type {
  PipelineStageId,
  PipelineStageStatus,
  PipelineStageState,
  PipelineInput,
  PipelineData,
} from "./types/pipeline.types";
