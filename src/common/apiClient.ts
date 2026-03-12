import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getHeadersToken } from '@/lib/api/axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_ROOT_BACKEND,
});

// Request interceptor to attach token automatically
apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const headers = getHeadersToken();
        if (headers.Authorization) {
            config.headers.Authorization = headers.Authorization;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    status: number;
    message?: string;
}

export const api = {
    get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.get<T>(url, config);
            return {
                success: true,
                data: response.data,
                status: response.status,
            };
        } catch (error: any) {
            return {
                success: false,
                data: null as any,
                status: error?.response?.status || 500,
                message: error?.response?.data?.error || error?.response?.data?.message || error?.message || 'An error occurred',
            };
        }
    },
    post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
        try {
            // Check if it's an internal API call (starts with /api/)
            const isInternalApi = url.startsWith('/api/');
            const requestUrl = isInternalApi ? url : (apiClient.defaults.baseURL ? '' : '') + url;
            const instance = isInternalApi ? axios.create() : apiClient;
            if (isInternalApi && typeof window !== 'undefined') {
                const headers = getHeadersToken();
                if (!config) config = {};
                config.headers = { ...config.headers, ...headers } as any;
            }

            const response = await instance.post<T>(requestUrl, data, config);
            return {
                success: true,
                data: response.data,
                status: response.status,
            };
        } catch (error: any) {
            return {
                success: false,
                data: null as any,
                status: error?.response?.status || 500,
                message: error?.response?.data?.error || error?.response?.data?.message || error?.message || 'An error occurred',
            };
        }
    },
    patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.patch<T>(url, data, config);
            return {
                success: true,
                data: response.data,
                status: response.status,
            };
        } catch (error: any) {
            return {
                success: false,
                data: null as any,
                status: error?.response?.status || 500,
                message: error?.response?.data?.error || error?.response?.data?.message || error?.message || 'An error occurred',
            };
        }
    },
    delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.delete<T>(url, config);
            return {
                success: true,
                data: response.data,
                status: response.status,
            };
        } catch (error: any) {
            return {
                success: false,
                data: null as any,
                status: error?.response?.status || 500,
                message: error?.response?.data?.error || error?.response?.data?.message || error?.message || 'An error occurred',
            };
        }
    }
};

export default apiClient;
