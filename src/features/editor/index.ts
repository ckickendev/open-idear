// ─── Editor Feature — Public API ────────────────────────────────────────────

// Components
export { default as EditorShell } from "./components/EditorShell";
export { default as EditorCanvas } from "./components/EditorCanvas";
export { EditorErrorBoundary } from "./components/EditorErrorBoundary";
export { default as StickyOutlineNav } from "./components/StickyOutlineNav";
export { AIImageModal } from "./components/AIImageModal";

// Hooks
export { usePostEditor } from "./hooks/usePostEditor";
export { useEditorShortcuts } from "./hooks/useEditorShortcuts";
export { useHeadingOutline } from "./hooks/useHeadingOutline";

// Context
export { EditorProvider, useEditorContext } from "./context/EditorContext";

// Extensions
export { createEditorExtensions } from "./extensions";
export { HardBreakExtension } from "./extensions/hardBreak";
export { SelectionExtension } from "./extensions/selection";
export { RawHtmlExtension } from "./extensions/rawHtml";

// Types
export type {
  Post,
  PostListItem,
  CreatePostPayload,
  UpdatePostPayload,
  Category,
  Series,
  MediaAsset,
  EditorMode,
  EditorState,
  BlockType,
  BlockItem,
  AIAssistAction,
  AIAssistActionId,
  UsePostEditorOptions,
  UsePostEditorReturn,
} from "./types/editor.types";
export type { AIImageModalProps, AIImageModalState } from "./components/AIImageModal";
export { STYLE_PRESETS, ASPECT_RATIOS } from "./components/AIImageModal";

// Utilities
export {
  extractEditorContextForAiImage,
  synthesizeAiImagePrompt,
  buildImageNodeAttributes,
  getStandardAIAssistActions,
  type EditorAiImageContext,
  type VisualSuggestionInput,
} from "./utils/aiAssistContext";

