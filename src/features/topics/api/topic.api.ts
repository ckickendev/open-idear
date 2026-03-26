import { api } from '@/lib/api/axios';

export const topicApi = {
    getTopics: async () => {
        return await api.get('/topic');
    },
    createTopic: async (data: any) => {
        return await api.post('/topic/create', data);
    },
    updateTopic: async (topicId: string, data: any) => {
        return await api.patch(`/topic/update/${topicId}`, data);
    },
    deleteTopic: async (topicId: string) => {
        return await api.delete(`/topic/delete/${topicId}`);
    }
};
