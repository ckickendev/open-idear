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
    addChapter: async (data: any) => {
        return await api.post('/course/chapter/add', data);
    },
    updateChapter: async (data: any) => {
        return await api.patch('/course/chapter/update', data);
    },
    deleteChapter: async (data: any) => {
        return await api.delete('/course/chapter/delete', { data });
    },
    addLesson: async (data: any) => {
        return await api.post('/course/lesson/add', data);
    },
    updateLesson: async (data: any) => {
        return await api.patch('/course/lesson/update', data);
    },
    deleteLesson: async (data: any) => {
        return await api.delete('/course/lesson/delete', { data });
    },
    getCloudflareUploadUrl: async () => {
        return await api.post('/media/cloudflare/upload-url');
    },
    saveCloudflareVideo: async (data: { videoId: string, title?: string, description?: string }) => {
        return await api.post('/media/cloudflare/save', data);
    },
    updateCourseCurriculum: async (courseId: string, data: any) => {
        return await api.patch(`/course/curriculum?courseId=${courseId}`, data);
    },
    deleteCourse: async (courseId: string) => {
        return await api.delete(`/course?courseId=${courseId}`);
    }
};
