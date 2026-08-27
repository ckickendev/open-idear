import type { Editor, JSONContent } from "@tiptap/react";
import type {
  ArticleBlock,
  ArticleHero,
  ArticleAIContext,
  ArticleSEO,
  ContentVersion,
} from "@/features/article/types/article.types";

// ─── Editor State ───────────────────────────────────────────────────────────

export type EditorMode = "visual" | "html" | "preview";

export interface EditorState {
  editor: Editor | null;
  isReady: boolean;
  mode: EditorMode;
  isEmpty: boolean;
}

// ─── Post Data ──────────────────────────────────────────────────────────────

export interface Post {
  _id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  text: string;
  author: string;
  image?: MediaAsset | null;
  category?: string;
  tags: string[];
  published: boolean;
  views: number;
  likes: string[];
  marked: string[];
  comments: string[];
  readtime: number;
  createdAt: string;
  updatedAt: string;

  // ─── Structured Article Fields (Sprint 1) ──────────────────────────────
  contentVersion?: ContentVersion;
  blocks?: ArticleBlock[] | null;
  hero?: ArticleHero | null;
  aiContext?: ArticleAIContext | null;
  seo?: ArticleSEO | null;
}

export interface PostListItem {
  _id: string;
  title: string;
  createdAt: string;
  published?: boolean;
}

export interface CreatePostPayload {
  title: string;
  text: string;
  content: string;
  /** Defaults to "html-v1" on the backend when not supplied. */
  contentVersion?: ContentVersion;
}

export interface UpdatePostPayload {
  postId: string;
  title: string;
  text: string;
  content: string;
  /** Pass to update the content version alongside a save. */
  contentVersion?: ContentVersion;
}


// ─── Category & Series ──────────────────────────────────────────────────────

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
}

export interface Series {
  _id: string;
  title: string;
  description?: string;
  posts?: string[];
  createdAt?: string;
}

// ─── Media ──────────────────────────────────────────────────────────────────

export interface MediaAsset {
  _id: string;
  url: string;
  description?: string;
  type?: "image" | "video";
  createdAt?: string;
}

// ─── Editor Hook Returns ────────────────────────────────────────────────────

export interface UsePostEditorOptions {
  initialContent?: string;
  placeholder?: string;
  onContentChange?: () => void;
}

export interface UsePostEditorReturn {
  editor: Editor | null;
  isReady: boolean;
  getHTML: () => string;
  getJSON: () => JSONContent;
  getText: () => string;
  setContent: (html: string) => void;
  isEmpty: boolean;
  characterCount: number;
  wordCount: number;
}

// ─── Block Insert ───────────────────────────────────────────────────────────

export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "image"
  | "link"
  | "blockquote"
  | "codeBlock";

export interface BlockItem {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
}
