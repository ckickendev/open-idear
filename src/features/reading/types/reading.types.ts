// =============================================================================
//  READING PROGRESS ENGINE — TYPES
//  src/features/reading/types/reading.types.ts
// =============================================================================

export interface ReadingProgressData {
  articleId: string;
  slug?: string;
  progress: number;
  lastHeadingId: string | null;
  lastParagraphIndex: number | null;
  completedAt: string | null;
  updatedAt: string | null;
}

export interface ContinueReadingItem {
  id: string;
  articleId: string;
  slug: string;
  title: string;
  description?: string;
  thumbnail: string | null;
  author?: {
    name?: string;
    username?: string;
    avatar?: string;
    avatarUrl?: string;
  };
  category?: {
    name?: string;
    slug?: string;
  };
  progress: number;
  lastHeadingId: string | null;
  lastParagraphIndex: number | null;
  totalReadingMinutes: number;
  remainingMinutes: number;
  updatedAt: string;
}

export interface ReadingStats {
  completedArticles: number;
  hoursRead: number;
  currentStreak: number;
  longestStreak: number;
}

export interface UpdateProgressPayload {
  progress: number;
  heading?: string | null;
  lastHeadingId?: string | null;
  paragraph?: number | null;
  lastParagraphIndex?: number | null;
  isBottomReached?: boolean;
}
