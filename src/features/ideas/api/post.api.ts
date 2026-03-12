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
        return await api.get('/post/getHotPosts');
    },
    getRecentlyPosts: async () => {
        return await api.get('/post/getRecentlyPosts');
    },
    getAllPosts: async () => {
        return await api.get('/post');
    },
    getPostsByProfile: async (profileId: string) => {
        return await api.get(`/post/profilePaging?targetId=${profileId}`);
    },
    getMarkedPosts: async () => {
        return await api.get('/post/getPagingMarkingPost');
    },
    toggleMarkPost: async (postId: string) => {
        return await api.post(`/post/markPost?postId=${postId}`);
    },
    deletePost: async (postId: string) => {
        return await api.delete(`/post/delete/${postId}`);
    },
    changePublicManager: async (postId: string, published: boolean) => {
        return await api.patch(`/post/changePublicManager?id=${postId}`, { published });
    }
};
