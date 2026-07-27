// ─── Editor Feature — Public API ────────────────────────────────────────────

// Components
export { default as EditorShell } from "./components/EditorShell";
export { default as EditorCanvas } from "./components/EditorCanvas";
export { EditorErrorBoundary } from "./components/EditorErrorBoundary";
export { default as StickyOutlineNav } from "./components/StickyOutlineNav";

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
  UsePostEditorOptions,
  UsePostEditorReturn,
} from "./types/editor.types";
