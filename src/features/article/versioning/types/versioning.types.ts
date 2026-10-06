// =============================================================================
//  ARTICLE VERSIONING SYSTEM — TYPES
//  src/features/article/versioning/types/versioning.types.ts
// =============================================================================

export interface VersionAuthor {
  readonly id: string;
  readonly username: string;
  readonly avatar?: string;
  readonly email?: string;
}

export interface VersionHistoryItem {
  readonly id: string;
  readonly version: string;
  readonly changelog: string;
  readonly source: "manual" | "ai";
  readonly createdAt: string;
  readonly author: VersionAuthor;
  readonly isCurrent: boolean;
}

export interface ArticleVersionDetail {
  readonly id: string;
  readonly version: string;
  readonly markdown: string;
  readonly html: string;
  readonly blocks?: any[];
  readonly changelog: string;
  readonly source: "manual" | "ai";
  readonly createdAt: string;
  readonly author: VersionAuthor;
  readonly isCurrent: boolean;
}

export interface ArticleMetadataSummary {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly latestVersion: string;
  readonly published?: boolean;
  readonly authorId?: string;
}

export interface ArticleHistoryResponse {
  readonly success: boolean;
  readonly article: ArticleMetadataSummary;
  readonly history: readonly VersionHistoryItem[];
}

export interface ArticleVersionResponse {
  readonly success: boolean;
  readonly article: ArticleMetadataSummary;
  readonly version: ArticleVersionDetail;
}

export interface CreateVersionPayload {
  readonly markdown?: string;
  readonly html?: string;
  readonly blocks?: any[];
  readonly changelog?: string;
  readonly source?: "manual" | "ai";
  readonly isMajor?: boolean;
}

export type DiffChangeType = "added" | "removed" | "unchanged";

export interface DiffLine {
  readonly type: DiffChangeType;
  readonly content: string;
  readonly oldLineNumber?: number;
  readonly newLineNumber?: number;
}

export interface DiffResult {
  readonly lines: readonly DiffLine[];
  readonly additions: number;
  readonly deletions: number;
  readonly unchanged: number;
}
