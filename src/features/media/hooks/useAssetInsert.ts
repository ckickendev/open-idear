import { useCallback } from "react";
import type { Editor } from "@tiptap/react";
import type { Asset } from "../api/asset.api";

interface UseAssetInsertOptions {
  readonly editor: Editor | null;
  readonly insertPosition: number | null;
  readonly onClose: () => void;
}

/**
 * =============================================================================
 *  useAssetInsert Integration Hook
 *  src/features/media/hooks/useAssetInsert.ts
 *
 *  Design Decisions:
 *  - Orchestrates the Tiptap integration layer for selected Asset insertion.
 *  - Converts the asset URL and alt text into a standard Markdown image format.
 *  - Inserts the formatted Markdown content at the stored cursor index position.
 *  - Automatically executes the onClose modal cleanup callback.
 * =============================================================================
 */
export function useAssetInsert({
  editor,
  insertPosition,
  onClose,
}: UseAssetInsertOptions) {
  const insertAsset = useCallback(
    (asset: Asset) => {
      if (!editor) return;

      const alt = asset.alt || asset.originalName || "image";
      const markdown = `![${alt}](${asset.url})`;

      // Fallback to active selection anchor if insertPosition is not set
      const position = insertPosition !== null ? insertPosition : editor.state.selection.anchor;

      editor
        .chain()
        .focus()
        .insertContentAt(position, markdown)
        .run();

      onClose();
    },
    [editor, insertPosition, onClose]
  );

  return { insertAsset };
}
export type UseAssetInsertReturn = ReturnType<typeof useAssetInsert>;
