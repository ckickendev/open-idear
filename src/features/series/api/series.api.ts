import { api } from '@/lib/api/axios';

export const seriesApi = {
    getSeriesByUser: async () => {
        return await api.get('/series/getByUser');
    },
    getAllSeries: async () => {
        return await api.get('/series');
    },
    createSeries: async (data: any) => {
        return await api.post('/series/create', data);
    },
    updateSeries: async (data: any) => {
        return await api.patch('/series/update', data);
    },
    deleteSeries: async (seriesId: string) => {
        return await api.delete('/series/delete', { data: { seriesId } });
    }
};
