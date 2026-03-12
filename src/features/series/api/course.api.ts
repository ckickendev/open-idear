import { api } from '@/lib/api/axios';

export const courseApi = {
    getAllCourses: async () => {
        return await api.get('/course/search');
    },
    getCoursesByUser: async () => {
        return await api.get('/course');
    },
    getCourseById: async (courseId: string) => {
        return await api.get(`/course/detail?courseId=${courseId}`);
    },
    createCourse: async (data: any) => {
        return await api.post('/course/create', data);
    },
    updateCourse: async (data: any) => {
        return await api.patch('/course/update', data);
    },
    updateCourseCurriculum: async (courseId: string, data: any) => {
        return await api.patch(`/course/curriculum?courseId=${courseId}`, data);
    },
    deleteCourse: async (courseId: string) => {
        return await api.delete(`/course?courseId=${courseId}`);
    }
};
