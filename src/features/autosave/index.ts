// =============================================================================
//  AI AUTOSAVE FEATURE BARREL INDEX
//  src/features/autosave/index.ts
// =============================================================================

export { default as DraftRecoveryBanner } from "./components/DraftRecoveryBanner";
export { default as DraftStatusIndicator, type DraftStatusType } from "./components/DraftStatusIndicator";
export { useDraftRecovery, type RecoverableDraft } from "./hooks/useDraftRecovery";
export { useAutoSave } from "./hooks/useAutoSave";
