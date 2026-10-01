---
name: tiptap-node-views
description: Guide for creating, modifying, and debugging TipTap v3 extensions, custom NodeViews, and ProseMirror transactions in OpenIdear.
---

# TipTap NodeViews & Extensions Runbook

This skill outlines best practices and safety rules for working with the rich-text editor in `open-trash-tech`, specifically `@tiptap/core v3`, `@tiptap/react`, and custom interactive nodes like `imagePlaceholder`.

---

## 1. Architecture of a TipTap Custom Node

A custom TipTap node consists of two parts:
1. **The Extension Definition** (`src/features/editor/extensions/yourNode.ts`):
   Defines node schema, attributes, parsing, serialization, and mounts the React component via `ReactNodeViewRenderer`.
2. **The React NodeView Component** (`src/features/editor/components/YourNodeView.tsx`):
   Renders the interactive UI inside `<NodeViewWrapper>`.

---

## 2. Best Practices for React NodeViews

### A. Wrapping & Selection Styling
Always wrap the component in `NodeViewWrapper` and handle the `selected` prop:
```tsx
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

export function CustomNodeView({ node, getPos, deleteNode, editor, selected }: NodeViewProps) {
  return (
    <NodeViewWrapper
      className={`my-4 transition-all ${selected ? "ring-2 ring-violet-500/50 rounded-xl" : ""}`}
    >
      <div contentEditable={false}>
        {/* Interactive UI */}
      </div>
    </NodeViewWrapper>
  );
}
```

### B. Safe Replacement / In-Place Insertion
When replacing a placeholder or custom node with standard content (e.g. an image):
```tsx
const handleInsertImage = (imageUrl: string, altText: string) => {
  if (!editor) return;

  const pos = typeof getPos === "function" ? getPos() : undefined;

  if (typeof pos === "number" && pos >= 0) {
    try {
      editor
        .chain()
        .focus()
        .setNodeSelection(pos)
        .deleteSelection()
        .insertContentAt(pos, {
          type: "image",
          attrs: { src: imageUrl, alt: altText },
        })
        .run();
    } catch {
      editor.chain().focus().setImage({ src: imageUrl, alt: altText }).run();
    }
  } else {
    editor.chain().focus().setImage({ src: imageUrl, alt: altText }).run();
  }
};
```

---

## 3. Critical Invariants & Pitfalls†h

1. **Never Call `editor.commands.*` in Render Loops**:
   Keep TipTap mutations strictly inside event handlers (`onClick`, `onSubmit`) or controlled `useEffect` with proper guards to avoid infinite dispatch loops.
2. **Handle Non-Numeric `getPos`**:
   `getPos()` can return `false` or `undefined` if the node has already been unmounted or detached from the document. Always verify `typeof pos === "number" && pos >= 0` before operating on document positions.
3. **Preserve Undo/Redo History**:
   Do not modify the DOM directly via raw `document.getElementById` or `element.remove()`. Always use `deleteNode()` or `editor.chain().deleteSelection().run()` so that ProseMirror history tracks the change.
4. **Prevent Event Bubbling**:
   For buttons, inputs, or dropdowns inside a NodeView, call `e.stopPropagation()` and `e.preventDefault()` on clicks to prevent TipTap from hijacking cursor focus.
