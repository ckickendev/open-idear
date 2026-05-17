import { api } from '@/lib/api/axios';

export const courseCategoryApi = {
    getCourseCategories: async () => {
        return await api.get('/courseCategory');
    },
    createCourseCategory: async (data: any) => {
        return await api.post('/courseCategory/create', data);
    },
    updateCourseCategory: async (categoryId: string, data: any) => {
        return await api.patch(`/courseCategory/update/${categoryId}`, data);
    },
    deleteCourseCategory: async (categoryId: string) => {
        return await api.delete(`/courseCategory/delete/${categoryId}`);
    }
};
