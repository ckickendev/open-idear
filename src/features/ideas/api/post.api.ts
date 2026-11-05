import { api } from "@/lib/api/axios";

export const postApi = {
  getPostToEdit: async (postId: string, locale?: string) => {
    return await api.get(`/post/getPostToEdit?postId=${postId}${locale ? `&locale=${locale}` : ""}`);
  },
  createPost: async (data: any) => {
    return await api.post("/post/create", data);
  },
  updatePost: async (data: any) => {
    return await api.patch("/post/update", data);
  },
  publishPost: async (data: any) => {
    return await api.post("/post/public", data);
  },
  getHotPosts: async () => {
    return await api.get("/post/getHotTopics");
  },
  getRecentlyPosts: async (locale?: string) => {
    return await api.get(`/post/getRecentlyPosts${locale ? `?locale=${locale}` : ""}`);
  },
  getAllPosts: async (status?: string) => {
    return await api.get(`/post${status ? `?status=${status}` : ""}`);
  },
  getPostsByProfile: async (profileId: string, locale?: string) => {
    return await api.get(`/post/getPostByAuthorId?profileId=${profileId}${locale ? `&locale=${locale}` : ""}`);
  },
  getMarkedPosts: async (profileId?: string, locale?: string) => {
    const params = new URLSearchParams();
    if (profileId) params.set("profileId", profileId);
    if (locale) params.set("locale", locale);
    const qs = params.toString();
    return await api.get(`/post/getMarkedByUser${qs ? `?${qs}` : ""}`);
  },
  toggleMarkPost: async (postId: string) => {
    return await api.post(`/post/marked?postId=${postId}`);
  },
  getPostsByAuthor: async (locale?: string) => {
    return await api.get(`/post/getPostByAuthor${locale ? `?locale=${locale}` : ""}`);
  },
  deletePost: async (postId: string) => {
    return await api.post("/post/deletePost", { postId });
  },
  restorePost: async (postId: string) => {
    return await api.post("/post/restorePost", { postId });
  },
  deletePostForever: async (postId: string) => {
    return await api.post("/post/deleteForever", { postId });
  },
  cleanTrash: async () => {
    return await api.post("/post/cleanTrash");
  },
  changePublicManager: async (postId: string, published: boolean, locale?: string) => {
    return await api.patch(`/post/changePublicManager?id=${postId}${locale ? `&locale=${locale}` : ""}`, {
      published,
      locale,
    });
  },
};
