import { api } from '@/lib/api/axios';

export const categoryApi = {
    getCategories: async (status?: string) => {
        return await api.get(`/category${status ? `?status=${status}` : ''}`);
    },
    createCategory: async (data: any) => {
        return await api.post('/category/create', data);
    },
    updateCategory: async (categoryId: string, data: any) => {
        return await api.patch(`/category/update/${categoryId}`, data);
    },
    deleteCategory: async (categoryId: string) => {
        return await api.delete(`/category/delete/${categoryId}`);
    },
    restoreCategory: async (categoryId: string) => {
        return await api.patch(`/category/restore/${categoryId}`);
    }
};
