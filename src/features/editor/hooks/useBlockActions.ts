"use client";

// =============================================================================
//  useBlockActions — Block-level action hook for the TipTap editor
//  src/features/editor/hooks/useBlockActions.ts
//
//  Exposes:
//    - hoveredBlockRect   : DOMRect | null — bounding rect of the hovered block
//    - duplicateHovered() : duplicate the block the cursor is over
//    - deleteHovered()    : delete the block the cursor is over
//    - rewriteBlock()     : replace selected block text via AI
//    - shortenBlock()     : shorten block text via AI
//    - expandBlock()      : expand block text via AI
//    - moveHoveredUp()    : move block one position earlier
//    - moveHoveredDown()  : move block one position later
//
//  Design decisions:
//    - Mouse-tracking approach: no TipTap extensions patched.
//    - "Block" = top-level ProseMirror node (paragraph, heading, codeBlock, etc.)
//    - AI actions call the existing /api/editor/action endpoint.
// =============================================================================

import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import type { Editor } from "@tiptap/react";
import type { ResolvedPos } from "@tiptap/pm/model";
import { toast } from "sonner";
import { api } from "@/lib/api/axios";

export interface BlockActionsState {
  /** DOMRect of the hovered ProseMirror top-level node, or null when none */
  hoveredBlockRect: DOMRect | null;
  /** Whether an AI action is in progress */
  isAIWorking: boolean;
  /** Which AI action label is running (for UX feedback) */
  aiActionLabel: string;
  /** Duplicate the currently hovered block */
  duplicateHovered: () => void;
  /** Delete the currently hovered block */
  deleteHovered: () => void;
  /** Move hovered block one node up in the document */
  moveHoveredUp: () => void;
  /** Move hovered block one node down in the document */
  moveHoveredDown: () => void;
  /** AI: Rewrite the hovered block content */
  rewriteBlock: () => Promise<void>;
  /** AI: Shorten the hovered block content */
  shortenBlock: () => Promise<void>;
  /** AI: Expand the hovered block content */
  expandBlock: () => Promise<void>;
}

interface UseBlockActionsOptions {
  editor: Editor | null;
  /** Article title — passed as context to AI actions */
  title?: string;
  /** Article category — passed as context to AI actions */
  category?: string;
  /** Whether the editor is in visual mode */
  enabled?: boolean;
}

/**
 * Finds the top-level ProseMirror node position at a given document position.
 *
 * Returns { pos, nodeSize } for the node that contains `at`, or null if none.
 */
function getTopLevelNodeAt(
  editor: Editor,
  at: number,
): { pos: number; nodeSize: number; node: ReturnType<ResolvedPos["node"]> } | null {
  const { doc } = editor.state;
  let result: { pos: number; nodeSize: number; node: ReturnType<ResolvedPos["node"]> } | null = null;

  doc.forEach((node, offset) => {
    if (result) return; // already found
    if (at >= offset && at <= offset + node.nodeSize) {
      result = { pos: offset, nodeSize: node.nodeSize, node };
    }
  });

  return result;
}

/**
 * Returns the DOM element corresponding to the top-level block at `pos`.
 * TipTap keeps a nodeDOM map accessible via `editor.view.domAtPos`.
 */
function getBlockDomElement(
  editor: Editor,
  pos: number,
): Element | null {
  try {
    const domResult = editor.view.domAtPos(pos + 1);
    let el: Node | null = domResult.node;
    while (el && el.parentNode !== editor.view.dom) {
      el = el.parentNode;
    }
    return el instanceof Element ? el : null;
  } catch {
    return null;
  }
}

export function useBlockActions({
  editor,
  title = "",
  category = "",
  enabled = true,
}: UseBlockActionsOptions): BlockActionsState {
  const [hoveredBlockRect, setHoveredBlockRect] = useState<DOMRect | null>(null);
  const [isAIWorking, setIsAIWorking] = useState(false);
  const [aiActionLabel, setAIActionLabel] = useState("");

  // Cache the last hovered block's document position
  const hoveredBlockPosRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // ─── Mouse-tracking: detect hovered block ───────────────────────────────

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!editor || !enabled) return;

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (!editor.view?.dom) return;

        // Use ProseMirror's posAtCoords to get the doc position under cursor
        const coords = { left: e.clientX, top: e.clientY };
        const posResult = editor.view.posAtCoords(coords);

        if (!posResult) {
          setHoveredBlockRect(null);
          hoveredBlockPosRef.current = null;
          return;
        }

        const block = getTopLevelNodeAt(editor, posResult.pos);
        if (!block) {
          setHoveredBlockRect(null);
          hoveredBlockPosRef.current = null;
          return;
        }

        hoveredBlockPosRef.current = block.pos;

        const domEl = getBlockDomElement(editor, block.pos);
        if (!domEl) {
          setHoveredBlockRect(null);
          return;
        }

        setHoveredBlockRect(domEl.getBoundingClientRect());
      });
    },
    [editor, enabled],
  );

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    // Small delay so the action menu itself doesn't vanish immediately
    setTimeout(() => {
      setHoveredBlockRect(null);
      hoveredBlockPosRef.current = null;
    }, 200);
  }, []);

  useEffect(() => {
    if (!editor || !enabled) return;
    const dom = editor.view?.dom;
    if (!dom) return;

    dom.addEventListener("mousemove", handleMouseMove);
    dom.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      dom.removeEventListener("mousemove", handleMouseMove);
      dom.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [editor, enabled, handleMouseMove, handleMouseLeave]);

  // ─── Block mutation helpers ──────────────────────────────────────────────

  /** Returns { from, to, text } for the currently hovered block, or null. */
  const getHoveredBlockRange = useCallback(():
    | { from: number; to: number; text: string }
    | null => {
    if (!editor || hoveredBlockPosRef.current === null) return null;
    const block = getTopLevelNodeAt(editor, hoveredBlockPosRef.current + 1);
    if (!block) return null;
    const from = block.pos + 1;
    const to = block.pos + block.nodeSize - 1;
    const text = editor.state.doc.textBetween(from, to, "\n");
    return { from, to, text };
  }, [editor]);

  const duplicateHovered = useCallback(() => {
    if (!editor || hoveredBlockPosRef.current === null) return;
    const block = getTopLevelNodeAt(editor, hoveredBlockPosRef.current + 1);
    if (!block) return;

    const { doc, tr } = editor.state;
    const node = doc.nodeAt(block.pos);
    if (!node) return;

    const insertAt = block.pos + block.nodeSize;
    const newTr = tr.insert(insertAt, node);
    editor.view.dispatch(newTr);
    toast.success("Block duplicated");
  }, [editor]);

  const deleteHovered = useCallback(() => {
    if (!editor || hoveredBlockPosRef.current === null) return;
    const block = getTopLevelNodeAt(editor, hoveredBlockPosRef.current + 1);
    if (!block) return;

    const { tr } = editor.state;
    const newTr = tr.delete(block.pos, block.pos + block.nodeSize);
    editor.view.dispatch(newTr);
    setHoveredBlockRect(null);
    hoveredBlockPosRef.current = null;
    toast.success("Block deleted");
  }, [editor]);

  const moveHoveredUp = useCallback(() => {
    if (!editor || hoveredBlockPosRef.current === null) return;
    const { doc, tr } = editor.state;
    const block = getTopLevelNodeAt(editor, hoveredBlockPosRef.current + 1);
    if (!block || block.pos === 0) return;

    // Find the node before this one
    let prevPos: number | null = null;
    let prevNodeSize: number | null = null;
    doc.forEach((node, offset) => {
      if (offset + node.nodeSize === block.pos) {
        prevPos = offset;
        prevNodeSize = node.nodeSize;
      }
    });

    if (prevPos === null || prevNodeSize === null) return;

    const currentNode = doc.nodeAt(block.pos);
    const prevNode = doc.nodeAt(prevPos);
    if (!currentNode || !prevNode) return;

    let newTr = tr.delete(block.pos, block.pos + block.nodeSize);
    newTr = newTr.insert(prevPos, currentNode);
    editor.view.dispatch(newTr);
    hoveredBlockPosRef.current = prevPos;
  }, [editor]);

  const moveHoveredDown = useCallback(() => {
    if (!editor || hoveredBlockPosRef.current === null) return;
    const { doc, tr } = editor.state;
    const block = getTopLevelNodeAt(editor, hoveredBlockPosRef.current + 1);
    if (!block) return;

    const nextPos = block.pos + block.nodeSize;
    const nextNode = doc.nodeAt(nextPos);
    if (!nextNode) return;

    const currentNode = doc.nodeAt(block.pos);
    if (!currentNode) return;

    // Delete current, insert after next
    let newTr = tr.delete(block.pos, block.pos + block.nodeSize);
    newTr = newTr.insert(block.pos + nextNode.nodeSize, currentNode);
    editor.view.dispatch(newTr);
    hoveredBlockPosRef.current = block.pos + nextNode.nodeSize;
  }, [editor]);

  // ─── AI actions ──────────────────────────────────────────────────────────

  async function runAIAction(
    action: "improve" | "shorten" | "expand",
    actionLabel: string,
    instruction: string,
  ): Promise<void> {
    if (!editor || isAIWorking) return;
    const range = getHoveredBlockRange();
    if (!range || !range.text.trim()) {
      toast.error("Block has no text content.");
      return;
    }

    setIsAIWorking(true);
    setAIActionLabel(actionLabel);

    try {
      const res = await api.post("/api/editor/action", {
        action,
        context: {
          selectedText: range.text,
          instruction,
          surroundingContext: range.text,
          articleTitle: title,
          audience: category || "Developers",
          tone: "professional",
        },
      });

      if (res.data?.status === "success" && res.data?.data?.improvedText) {
        // Replace block content with improved text
        editor
          .chain()
          .focus()
          .setTextSelection({ from: range.from, to: range.to })
          .insertContent(res.data.data.improvedText)
          .run();
        toast.success(`${actionLabel} applied!`);
      } else if (res.data?.status === "success" && res.data?.data?.text) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from: range.from, to: range.to })
          .insertContent(res.data.data.text)
          .run();
        toast.success(`${actionLabel} applied!`);
      } else {
        toast.error(`${actionLabel} failed. Please try again.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      toast.error(msg);
    } finally {
      setIsAIWorking(false);
      setAIActionLabel("");
    }
  }

  const rewriteBlock = useCallback(
    () => runAIAction("improve", "Rewrite", "Rewrite this block to be clearer and more engaging."),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, title, category, isAIWorking],
  );

  const shortenBlock = useCallback(
    () => runAIAction("shorten", "Shorten", "Shorten this block while preserving the core meaning."),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, title, category, isAIWorking],
  );

  const expandBlock = useCallback(
    () => runAIAction("expand", "Expand", "Expand this block with more detail and examples."),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, title, category, isAIWorking],
  );

  return {
    hoveredBlockRect,
    isAIWorking,
    aiActionLabel,
    duplicateHovered,
    deleteHovered,
    moveHoveredUp,
    moveHoveredDown,
    rewriteBlock,
    shortenBlock,
    expandBlock,
  };
}
