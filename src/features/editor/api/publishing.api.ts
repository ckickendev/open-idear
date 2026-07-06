import { api } from "@/lib/api/axios";

export interface PublishTaskResult {
  readonly taskId: string;
  readonly success: boolean;
  readonly severity: "info" | "warning" | "error";
  readonly message?: string;
  readonly outputData?: Record<string, any>;
}

export interface PublishTaskPayload {
  readonly task: string;
  readonly articleId: string;
  readonly context?: Record<string, any>;
}

export const publishingApi = {
  /**
   * Executes a single preflight publishing task.
   */
  runTask: (payload: PublishTaskPayload) => {
    return api.post<PublishTaskResult>("/api/publishing/task", payload);
  },

  /**
   * Saves metadata and publishes the post (status update).
   */
  publishPost: (id: string, updates: Record<string, any>) => {
    return api.put<{ success: boolean; message?: string }>(`/api/posts/${id}`, {
      ...updates,
      published: true,
    });
  },
};
