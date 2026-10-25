import { create } from "zustand";
import { courseApi } from "@/features/series/api/course.api";
import { startBunnyTusUpload, BunnyTusUploadHandle } from "@/lib/bunnyTusUploader";

export interface VideoUploadTask {
  id: string;
  lessonId: string;
  lessonTitle: string;
  fileName: string;
  fileSize: number;
  progress: number;
  bytesUploaded: number;
  totalBytes: number;
  status: "authorizing" | "uploading" | "saving" | "done" | "error" | "aborted";
  error?: string;
  mediaId?: string;
  videoId?: string;
  file: File;
  handle?: BunnyTusUploadHandle;
  createdAt: number;
  onComplete?: (mediaId: string, title: string) => void;
}

interface VideoUploadState {
  tasks: VideoUploadTask[];
  isDockMinimized: boolean;
  isDockVisible: boolean;
  toggleDockMinimized: () => void;
  setDockMinimized: (minimized: boolean) => void;
  setDockVisible: (visible: boolean) => void;
  startUpload: (params: {
    file: File;
    lessonId: string;
    lessonTitle: string;
    onComplete?: (mediaId: string, title: string) => void;
  }) => Promise<string>;
  abortUpload: (id: string) => void;
  retryUpload: (id: string) => Promise<void>;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
}

export const useVideoUploadStore = create<VideoUploadState>((set, get) => ({
  tasks: [],
  isDockMinimized: false,
  isDockVisible: false,

  toggleDockMinimized: () => set((state) => ({ isDockMinimized: !state.isDockMinimized })),
  setDockMinimized: (minimized) => set({ isDockMinimized: minimized }),
  setDockVisible: (visible) => set({ isDockVisible: visible }),

  startUpload: async ({ file, lessonId, lessonTitle, onComplete }) => {
    const id = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const initialTask: VideoUploadTask = {
      id,
      lessonId,
      lessonTitle: lessonTitle.trim() || file.name,
      fileName: file.name,
      fileSize: file.size,
      progress: 0,
      bytesUploaded: 0,
      totalBytes: file.size,
      status: "authorizing",
      file,
      onComplete,
      createdAt: Date.now(),
    };

    // Add task to store and open dock
    set((state) => ({
      tasks: [initialTask, ...state.tasks],
      isDockVisible: true,
    }));

    // Execute upload workflow asynchronously
    (async () => {
      try {
        // Step 1: Obtain upload signature
        const idempotencyKey = `upload-${file.name}-${file.size}-${file.lastModified}`;
        const signRes = await courseApi.getBunnyUploadSignature({
          title: lessonTitle.trim(),
          idempotencyKey,
        });

        if (!signRes.success || !signRes.data?.data) {
          throw new Error(
            signRes.message ||
              (signRes.data as any)?.message ||
              "Could not obtain upload authorization from server."
          );
        }

        const { videoId, libraryId, signature, expires, uploadEndpoint } = signRes.data.data;

        // Step 2: Upload directly to Bunny Stream via TUS
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: "uploading", videoId } : t
          ),
        }));

        const handle = startBunnyTusUpload({
          file,
          endpoint: uploadEndpoint || "https://video.bunnycdn.com/tusupload",
          libraryId,
          videoId,
          signature,
          expires,
          onProgress: (percent, bytesUploaded, totalBytes) => {
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === id ? { ...t, progress: percent, bytesUploaded, totalBytes } : t
              ),
            }));
          },
        });

        // Store handle for abort capability
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, handle } : t)),
        }));

        await handle.promise;

        // Step 3: Persist video metadata
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: "saving" } : t
          ),
        }));

        const saveRes = await courseApi.saveBunnyVideo({
          videoId,
          title: lessonTitle.trim(),
        });

        if (!saveRes.success || !saveRes.data?.data?._id) {
          throw new Error(
            saveRes.message ||
              (saveRes.data as any)?.message ||
              "Could not save video metadata on server."
          );
        }

        const mediaId: string = saveRes.data.data._id;

        // Step 4: Mark completed
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, status: "done", progress: 100, mediaId, handle: undefined }
              : t
          ),
        }));

        // Execute local callback
        if (onComplete) {
          onComplete(mediaId, lessonTitle.trim());
        }

        // Dispatch window event for curriculum sync
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("openidear:video-attached", {
              detail: { lessonId, mediaId, title: lessonTitle.trim() },
            })
          );
        }
      } catch (err: any) {
        // Only set error if not intentionally aborted
        const task = get().tasks.find((t) => t.id === id);
        if (task && task.status !== "aborted") {
          const errorMsg = err.message || "An error occurred during upload.";
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, status: "error", error: errorMsg, handle: undefined } : t
            ),
          }));
        }
      }
    })();

    return id;
  },

  abortUpload: (id: string) => {
    const task = get().tasks.find((t) => t.id === id);
    if (task?.handle) {
      task.handle.abort();
    }
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, status: "aborted", error: "Upload cancelled by user.", handle: undefined }
          : t
      ),
    }));
  },

  retryUpload: async (id: string) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    // Remove old task and re-start
    get().removeUpload(id);
    await get().startUpload({
      file: task.file,
      lessonId: task.lessonId,
      lessonTitle: task.lessonTitle,
      onComplete: task.onComplete,
    });
  },

  removeUpload: (id: string) => {
    const task = get().tasks.find((t) => t.id === id);
    if (task?.handle) {
      task.handle.abort();
    }
    set((state) => {
      const remaining = state.tasks.filter((t) => t.id !== id);
      return {
        tasks: remaining,
        isDockVisible: remaining.length > 0,
      };
    });
  },

  clearCompleted: () => {
    set((state) => {
      const remaining = state.tasks.filter((t) => t.status !== "done" && t.status !== "aborted");
      return {
        tasks: remaining,
        isDockVisible: remaining.length > 0,
      };
    });
  },
}));
