import { api } from '@/lib/api/axios';

export const authApi = {
    login: async (data: any) => {
        return await api.post('/auth/login', data);
    },
    register: async (data: any) => {
        return await api.post('/auth/register', data);
    },
    confirmRegister: async (data: any) => {
        return await api.post('/auth/confirm-register', data);
    },
    resetPasswordLink: async (data: any) => {
        return await api.post('/auth/reset-password-link', data);
    },
    resetPasswordConfirm: async (data: any) => {
        return await api.post('/auth/reset-password-confirm', data);
    }
};
