import { api } from '@/lib/api/axios';

export const postApi = {
    getPostToEdit: async (postId: string) => {
        return await api.get(`/post/getPostToEdit?postId=${postId}`);
    },
    createPost: async (data: any) => {
        return await api.post('/post/create', data);
    },
    updatePost: async (data: any) => {
        return await api.patch('/post/update', data);
    },
    publishPost: async (data: any) => {
        return await api.post('/post/public', data);
    },
    getHotPosts: async () => {
        return await api.get('/post/getHotTopics');
    },
    getRecentlyPosts: async () => {
        return await api.get('/post/getRecentlyPosts');
    },
    getAllPosts: async (status?: string) => {
        return await api.get(`/post${status ? `?status=${status}` : ''}`);
    },
    getPostsByProfile: async (profileId: string) => {
        return await api.get(`/post/getPostByAuthorId?profileId=${profileId}`);
    },
    getMarkedPosts: async (profileId?: string) => {
        return await api.get(`/post/getMarkedByUser${profileId ? `?profileId=${profileId}` : ''}`);
    },
    toggleMarkPost: async (postId: string) => {
        return await api.post(`/post/marked?postId=${postId}`);
    },
    deletePost: async (postId: string) => {
        return await api.post('/post/deletePost', { postId });
    },
    restorePost: async (postId: string) => {
        return await api.post('/post/restorePost', { postId });
    },
    changePublicManager: async (postId: string, published: boolean) => {
        return await api.patch(`/post/changePublicManager?id=${postId}`, { published });
    }
};
