import { api } from '@/lib/api/axios';

export const userApi = {
    getUsersList: async (params?: any) => {
        return await api.get('/user', { params });
    },
    updateProfile: async (data: any) => {
        return await api.patch('/user/updateProfile', data);
    },
    getProfile: async (profileId: string) => {
        return await api.get(`/auth/getProfileById?id=${profileId}`);
    },
    updateRole: async (userId: string, roleNum: number) => {
        return await api.post(`/user/updateRole?userId=${userId}&roleNum=${roleNum}`);
    },
    toggleLock: async (userId: string) => {
        return await api.post(`/user/lockUser?userId=${userId}`);
    },
    createUser: async (data: any) => {
        return await api.post('/user/create', data);
    },
    updateUser: async (userId: string, data: any) => {
        return await api.patch(`/user/update/${userId}`, data);
    },
    deleteUser: async (userId: string) => {
        return await api.delete(`/user/delete/${userId}`);
    },
    restoreUser: async (userId: string) => {
        return await api.patch(`/user/restore/${userId}`);
    },
    toggleUserStatus: async (userId: string, data: any) => {
        return await api.patch(`/user/toggle-status/${userId}`, data);
    }
};
