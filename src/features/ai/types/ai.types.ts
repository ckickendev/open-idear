// ─── AI Actions ─────────────────────────────────────────────────────────────

export type AIAction =
  | "generate_outline"
  | "generate_article"
  | "improve_writing"
  | "expand_section"
  | "generate_tags"
  | "generate_seo_title"
  | "generate_meta_description"
  | "summarize"
  | "rewrite_paragraph";

export type AIState =
  | "idle"
  | "generating"
  | "streaming"
  | "complete"
  | "error";

// ─── Hook Return ────────────────────────────────────────────────────────────

export interface UseAIWriterReturn {
  /** Execute an AI action with optional context (selected text, etc). */
  execute: (action: AIAction, context?: string) => Promise<void>;
  /** Whether AI is currently generating. */
  isGenerating: boolean;
  /** The streamed/completed content from AI. */
  result: string;
  /** Current AI state. */
  state: AIState;
  /** Error message if generation failed. */
  error: string | null;
  /** Cancel an in-flight generation. */
  cancel: () => void;
  /** Clear the result. */
  clear: () => void;
}

// ─── AI Request/Response ────────────────────────────────────────────────────

export interface AIGenerateRequest {
  action: AIAction;
  title: string;
  context?: string;
  currentContent?: string;
}

export interface AIGenerateResponse {
  content: string;
  action: AIAction;
}
