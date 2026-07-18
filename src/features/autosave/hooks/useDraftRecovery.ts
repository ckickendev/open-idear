// =============================================================================
//  AI AUTOSAVE FEATURE — DRAFT RECOVERY & OFFLINE ENGINE
//  src/features/autosave/hooks/useDraftRecovery.ts
//
//  Design Decisions:
//  - Tracks browser online/offline status in real time.
//  - Caches draft revisions locally in localStorage when offline.
//  - Compares local draft timestamps against server timestamps on editor mount.
//  - Prompts authors with recovery options if a newer local backup is found.
//  - Auto-flushes local backups to the backend upon re-establishing connection.
// =============================================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { postApi } from "@/features/ideas/api/post.api";

export interface RecoverableDraft {
  readonly title: string;
  readonly html: string;
  readonly text: string;
  readonly timestamp: number;
}

interface UseDraftRecoveryProps {
  readonly postId: string | null;
  readonly serverUpdatedAt: string | null; // Server timestamp (ISO string)
  readonly onRestoreDraft: (draft: RecoverableDraft) => void;
  readonly getEditorContent: () => { title: string; html: string; text: string };
}

export function useDraftRecovery({
  postId,
  serverUpdatedAt,
  onRestoreDraft,
  getEditorContent,
}: UseDraftRecoveryProps) {
  const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? window.navigator.onLine : true);
  const [recoveredDraft, setRecoveredDraft] = useState<RecoverableDraft | null>(null);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);

  const storageKey = useMemoKey(postId);

  function useMemoKey(id: string | null): string {
    return id ? `draft_recovery_${id}` : "draft_recovery_new_post";
  }

  // 1. Offline monitoring listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored. Synchronizing drafts...");
      syncLocalDraftToServer();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You are offline. Autosaves will fallback to offline local storage.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [postId]);

  // 2. Draft recovery pre-flight checks on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const localData = localStorage.getItem(storageKey);
    if (!localData) return;

    try {
      const parsed: RecoverableDraft = JSON.parse(localData);
      const serverTime = serverUpdatedAt ? new Date(serverUpdatedAt).getTime() : 0;

      // If local backup is newer than server draft by at least 3 seconds, prompt recovery
      if (parsed.timestamp > serverTime + 3000) {
        setRecoveredDraft(parsed);
        setShowRecoveryBanner(true);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey, serverUpdatedAt]);

  // 3. Write updates to local cache
  const saveLocalDraft = useCallback((title: string, html: string, text: string) => {
    if (typeof window === "undefined") return;

    const backup: RecoverableDraft = {
      title,
      html,
      text,
      timestamp: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(backup));
  }, [storageKey]);

  // 4. Clear local cache
  const clearLocalDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(storageKey);
    setRecoveredDraft(null);
    setShowRecoveryBanner(false);
  }, [storageKey]);

  // 5. Restore local cache to editor state
  const restoreDraft = useCallback(() => {
    if (recoveredDraft) {
      onRestoreDraft(recoveredDraft);
      toast.success("Draft successfully restored from local backup!");
      setShowRecoveryBanner(false);
    }
  }, [recoveredDraft, onRestoreDraft]);

  // 6. Sync local storage draft back to server
  const syncLocalDraftToServer = useCallback(async () => {
    if (typeof window === "undefined" || !postId) return;

    const localData = localStorage.getItem(storageKey);
    if (!localData) return;

    try {
      const parsed: RecoverableDraft = JSON.parse(localData);
      
      const res = await postApi.updatePost({
        postId,
        title: parsed.title,
        text: parsed.text,
        content: parsed.html,
      });

      if (res.success) {
        toast.success("Synced local backup with database server.");
        localStorage.removeItem(storageKey);
      }
    } catch {
      // Sync failed; retain local cache for next sync cycle
    }
  }, [postId, storageKey]);

  return {
    isOnline,
    showRecoveryBanner,
    recoveredDraft,
    restoreDraft,
    discardDraft: clearLocalDraft,
    saveLocalDraft,
    clearLocalDraft,
  };
}
