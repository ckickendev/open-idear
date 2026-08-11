// =============================================================================
//  AI PUBLISHING FEATURE — PUBLIC BARREL
//  src/features/publish/index.ts
// =============================================================================

export { default as PublishChecklist, type ChecklistItem } from "./components/PublishChecklist";
export { default as MetadataManager, type PublishMetadata } from "./components/MetadataManager";
export { default as FeaturedImageManager, type FeaturedImageState } from "./components/FeaturedImageManager";
export { default as PublishScheduler, type ClientPublishStatus } from "./components/PublishScheduler";
export { default as VersionHistory, type VersionItem } from "./components/VersionHistory";
export { default as PublishMetrics } from "./components/PublishMetrics";
export { default as PostInsights, type ClientPostInsights } from "./components/PostInsights";
export { default as PublishConfirmationModal, type ConfirmationDetails } from "./components/PublishConfirmationModal";
export { default as PublishWizard, type WizardStepType } from "./components/PublishWizard";
export { default as PublishSuccessConsole } from "./components/PublishSuccessConsole";
export { default as SharePanel } from "./components/SharePanel";
export { default as SmartFillButton } from "./components/SmartFillButton";
export { default as SmartPublishResult } from "./components/SmartPublishResult";
export { usePublishPost } from "./hooks/usePublishPost";
export { usePublishIntegration } from "./hooks/usePublishIntegration";
export { useSmartPublish, type SmartPublishStatus, type UseSmartPublishReturn } from "./hooks/useSmartPublish";
export { smartPublishApi, type SmartPublishResult as SmartPublishResultData } from "./services/smart-publish.service";
