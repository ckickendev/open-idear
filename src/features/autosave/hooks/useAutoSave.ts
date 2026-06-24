"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type {
  SaveStatus,
  UseAutoSaveOptions,
  UseAutoSaveReturn,
} from "../types/autosave.types";
import { postApi } from "@/features/ideas/api/post.api";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

const DEFAULT_DEBOUNCE_MS = 3000;
const STATUS_FADE_DELAY = 4000;

/**
 * Auto-save hook with debounce, content hashing, and beforeunload guard.
 *
 * KEY DESIGN DECISIONS:
 * 1. Uses content hashing (simple string comparison) to avoid saving
 *    identical content on every keystroke.
 * 2. The debounce timer is reset on every `markDirty()` call.
 * 3. `beforeunload` event is registered when there are unsaved changes.
 * 4. All closures use refs to avoid stale captures.
 */
export function useAutoSave(options: UseAutoSaveOptions): UseAutoSaveReturn {
  const {
    postId,
    getContent,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    enabled = true,
  } = options;

  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Refs for values that callbacks need without re-creating the callback
  const postIdRef = useRef(postId);
  const getContentRef = useRef(getContent);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedHash = useRef<string>("");
  const statusFadeTimer = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync
  useEffect(() => {
    postIdRef.current = postId;
  }, [postId]);

  useEffect(() => {
    getContentRef.current = getContent;
  }, [getContent]);

  // ─── Content Hash ───────────────────────────────────────────────────────

  const computeHash = useCallback(
    (content: { title: string; html: string }): string => {
      return `${content.title}::${content.html}`;
    },
    [],
  );

  // ─── Perform Save ──────────────────────────────────────────────────────

  const performSave = useCallback(
    async (isAutoSave: boolean) => {
      const content = getContentRef.current();
      const currentPostId = postIdRef.current;

      // Don't save empty titles
      if (!content.title.trim()) return;

      // Don't save if content hasn't changed
      const hash = computeHash(content);
      if (hash === lastSavedHash.current && currentPostId) return;

      setStatus("saving");

      try {
        if (currentPostId) {
          // Update existing post
          const res = await postApi.updatePost({
            postId: currentPostId,
            title: content.title,
            text: content.text,
            content: content.html,
          });

          if (res.success) {
            lastSavedHash.current = hash;
            setStatus("saved");
            setLastSavedAt(new Date());
            if (!isAutoSave) {
              toast.success("Post updated successfully!");
            }
          } else {
            setStatus("error");
            toast.error(res.message || "Error updating post");
          }
        } else {
          // Create new post
          const res = await postApi.createPost({
            title: content.title,
            text: content.text,
            content: content.html,
          });

          if (res.success) {
            lastSavedHash.current = hash;
            postIdRef.current = res.data.post._id;
            setStatus("saved");
            setLastSavedAt(new Date());

            // Update URL with new post ID (without full navigation)
            const params = new URLSearchParams();
            params.set("id", res.data.post._id);
            router.push(`${pathname}?${params.toString()}`);

            if (!isAutoSave) {
              toast.success("Post created successfully!");
            }
          } else {
            setStatus("error");
            toast.error(res.message || "Error creating post");
          }
        }
      } catch {
        setStatus("error");
      }

      // Fade status after delay
      if (statusFadeTimer.current) clearTimeout(statusFadeTimer.current);
      statusFadeTimer.current = setTimeout(() => {
        setStatus((prev) => (prev === "saved" ? "idle" : prev));
      }, STATUS_FADE_DELAY);
    },
    [computeHash, router, pathname],
  );

  // ─── Mark Dirty (triggers debounced auto-save) ─────────────────────────

  const markDirty = useCallback(() => {
    if (!enabled) return;

    setStatus("unsaved");

    // Reset debounce timer
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      performSave(true);
    }, debounceMs);
  }, [enabled, debounceMs, performSave]);

  // ─── Manual Save ──────────────────────────────────────────────────────

  const save = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    await performSave(false);
  }, [performSave]);

  // ─── Retry ────────────────────────────────────────────────────────────

  const retry = useCallback(async () => {
    await performSave(false);
  }, [performSave]);

  // ─── Cleanup timers ───────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (statusFadeTimer.current) clearTimeout(statusFadeTimer.current);
    };
  }, []);

  // ─── Beforeunload guard ───────────────────────────────────────────────

  const hasUnsavedChanges = status === "unsaved" || status === "saving";

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  return {
    status,
    lastSavedAt,
    save,
    retry,
    hasUnsavedChanges,
    markDirty,
  };
}
