// =============================================================================
//  READING PROGRESS ENGINE — PUBLIC API
//  src/features/reading/index.ts
// =============================================================================

export { readingApi } from "./api/reading.api";
export { useReadingTracker } from "./hooks/useReadingTracker";
export { default as ResumeReadingToast } from "./components/ResumeReadingToast";
export { default as ReadingTrackerWrapper } from "./components/ReadingTrackerWrapper";
export { default as ContinueReadingSection } from "./components/ContinueReadingSection";
export { default as ReadingStatsCard } from "./components/ReadingStatsCard";

export type {
  ReadingProgressData,
  ContinueReadingItem,
  ReadingStats,
  UpdateProgressPayload,
} from "./types/reading.types";
