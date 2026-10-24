import { api } from "@/lib/api/axios";

export const courseApi = {
  getAllCourses: async () => {
    return await api.get("/course");
  },
  getCoursesByUser: async (status?: string) => {
    return await api.get(`/course/me${status ? `?status=${status}` : ""}`);
  },
  getEnrolledCourses: async () => {
    return await api.get("/course/enrolled");
  },
  getCourseById: async (courseId: string) => {
    return await api.get(`/course/getById?id=${courseId}`);
  },
  getCourseBySlug: async (slug: string) => {
    return await api.get(`/course/getBySlug?slug=${slug}`);
  },
  createCourse: async (data: any) => {
    return await api.post("/course/create", data);
  },
  updateCourse: async (data: any) => {
    return await api.patch("/course/update", data);
  },
  addChapter: async (data: any) => {
    return await api.post("/course/chapter/add", data);
  },
  updateChapter: async (data: any) => {
    return await api.patch("/course/chapter/update", data);
  },
  deleteChapter: async (data: any) => {
    return await api.delete("/course/chapter/delete", { data });
  },
  addLesson: async (data: any) => {
    return await api.post("/course/lesson/add", data);
  },
  updateLesson: async (data: any) => {
    return await api.patch("/course/lesson/update", data);
  },
  deleteLesson: async (data: any) => {
    return await api.delete("/course/lesson/delete", { data });
  },
  deleteLessonVideo: async (lessonId: string) => {
    return await api.delete("/course/lesson/video/delete", { data: { lessonId } });
  },
  // ── Bunny Stream APIs ──────────────────────────────────────────────────────
  getBunnyUploadSignature: async (data: {
    title: string;
    collectionId?: string;
    idempotencyKey?: string;
  }) => {
    return await api.post("/media/bunny/upload-signature", data);
  },
  saveBunnyVideo: async (data: {
    videoId: string;
    title?: string;
    description?: string;
    duration?: number;
  }) => {
    return await api.post("/media/bunny/save", data);
  },
  getBunnyPlayback: async (lessonId: string) => {
    return await api.get(`/media/bunny/playback/${lessonId}`);
  },
  getBunnyStatus: async (videoId: string) => {
    return await api.get(`/media/bunny/status/${videoId}`);
  },
  deleteBunnyVideo: async (mediaId: string) => {
    return await api.delete(`/media/bunny/${mediaId}`);
  },

  // ── Legacy Cloudflare APIs (Deprecated / Inactive Historical Reference) ───
  /**
   * @deprecated Inactive historical reference. All active course uploads use Bunny Stream (courseApi.getBunnyUploadSignature).
   */
  getCloudflareUploadUrl: async () => {
    return await api.post("/media/cloudflare/upload-url");
  },
  /**
   * @deprecated Inactive historical reference. All video saves use Bunny Stream (courseApi.saveBunnyVideo).
   */
  saveCloudflareVideo: async (data: {
    videoId: string;
    title?: string;
    description?: string;
  }) => {
    return await api.post("/media/cloudflare/save", data);
  },
  updateCourseCurriculum: async (courseId: string, data: any) => {
    return await api.patch(`/course/curriculum?courseId=${courseId}`, data);
  },
  deleteCourse: async (courseId: string) => {
    return await api.delete(`/course?courseId=${courseId}`);
  },
  restoreCourse: async (courseId: string) => {
    return await api.patch(`/course/restore?courseId=${courseId}`);
  },
  cleanTrash: async () => {
    return await api.delete("/course/cleanTrash");
  },
  // Course Builder APIs
  getCourseForEdit: async (id: string) => {
    return await api.get(`/course/forEdit?id=${id}`);
  },
  publishCourse: async (courseId: string) => {
    return await api.post("/course/publish", { courseId });
  },
  unpublishCourse: async (courseId: string) => {
    return await api.post("/course/unpublish", { courseId });
  },
  reorderChapters: async (courseId: string, orderedIds: string[]) => {
    return await api.patch("/course/chapter/reorder", { courseId, orderedIds });
  },
  reorderLessons: async (chapterId: string, orderedIds: string[]) => {
    return await api.patch("/course/lesson/reorder", { chapterId, orderedIds });
  },
  // Enrollment APIs
  getMyEnrollments: async () => {
    return await api.get("/enrollment/my-courses");
  },
  checkEnrollment: async (courseId: string) => {
    return await api.get(`/enrollment/check?courseId=${courseId}`);
  },
  enrollCourse: async (courseId: string) => {
    return await api.post("/course/enroll", { courseId });
  },
  completeLesson: async (
    courseId: string,
    lessonId: string,
    action?: "complete" | "uncomplete" | "toggle"
  ) => {
    return await api.post("/enrollment/lesson/complete", {
      courseId,
      lessonId,
      action,
    });
  },
  toggleLesson: async (courseId: string, lessonId: string) => {
    return await api.post("/enrollment/lesson/toggle", {
      courseId,
      lessonId,
    });
  },
  // AI Course Intelligence APIs
  analyzeLesson: async (
    lessonId: string,
    options?: { force?: boolean; language?: string }
  ) => {
    return await api.post(`/ai/course/lesson/${lessonId}/analyze`, options || {});
  },
  getLessonIntelligence: async (lessonId: string) => {
    return await api.get(`/ai/course/lesson/${lessonId}/analysis`);
  },
  acceptLessonIntelligence: async (lessonId: string, acceptedData: any) => {
    return await api.post(`/ai/course/lesson/${lessonId}/accept`, acceptedData);
  },
  getLessonTranscript: async (lessonId: string) => {
    return await api.get(`/ai/course/lesson/${lessonId}/transcript`);
  },
  // AI Knowledge Check APIs
  generateKnowledgeCheck: async (
    lessonId: string,
    options?: { force?: boolean; count?: number }
  ) => {
    return await api.post(`/ai/course/lesson/${lessonId}/knowledge-check/generate`, options || {});
  },
  getKnowledgeCheck: async (lessonId: string) => {
    return await api.get(`/ai/course/lesson/${lessonId}/knowledge-check`);
  },
  updateKnowledgeCheck: async (lessonId: string, checkId: string, data: any) => {
    return await api.patch(`/ai/course/lesson/${lessonId}/knowledge-check/${checkId}`, data);
  },
  acceptKnowledgeCheck: async (lessonId: string, checkId: string) => {
    return await api.post(`/ai/course/lesson/${lessonId}/knowledge-check/${checkId}/accept`, {});
  },
  getLearnerKnowledgeCheck: async (lessonId: string) => {
    return await api.get(`/ai/course/lesson/${lessonId}/knowledge-check/learner`);
  },
  submitKnowledgeCheckAttempt: async (
    lessonId: string,
    answers: Array<{ questionId: string; selectedOptionId: string }>
  ) => {
    return await api.post(`/ai/course/lesson/${lessonId}/knowledge-check/attempt`, { answers });
  },
  getLearnerAttempts: async (lessonId: string) => {
    return await api.get(`/ai/course/lesson/${lessonId}/knowledge-check/attempts`);
  },
  // AI Learning Companion (Tutor) APIs
  getTutorSession: async (lessonId: string) => {
    return await api.get(`/ai/course/lesson/${lessonId}/tutor/session`);
  },
  getTutorMessages: async (lessonId: string, sessionId: string) => {
    return await api.get(`/ai/course/lesson/${lessonId}/tutor/messages/${sessionId}`);
  },
  sendTutorMessage: async (
    lessonId: string,
    payload: { message: string; sessionId?: string; timestampSeconds?: number }
  ) => {
    return await api.post(`/ai/course/lesson/${lessonId}/tutor/message`, payload);
  },
  // Learning Mastery Engine APIs
  getLessonMastery: async (lessonId: string) => {
    return await api.get(`/learning/mastery/lesson/${lessonId}`);
  },
  getCourseMastery: async (courseId: string) => {
    return await api.get(`/learning/mastery/course/${courseId}`);
  },
  getRecentEvidence: async (lessonId: string) => {
    return await api.get(`/learning/evidence/lesson/${lessonId}`);
  },
};
