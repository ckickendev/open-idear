import { ENV } from "@/api/const";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// Helper to read cookie by name
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

// Get token securely with localStorage + cookie fallback
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    try {
      const localToken = localStorage.getItem("access_token");
      if (localToken) return localToken;
    } catch {
      // ignore localStorage security / storage quota errors
    }

    // Fallback: check cookie for access_token or token
    const cookieToken = getCookie("access_token") || getCookie("token");
    if (cookieToken) {
      try {
        localStorage.setItem("access_token", cookieToken);
      } catch {
        // ignore
      }
      return cookieToken;
    }
  }
  return null;
};

export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("access_token", token);
    } catch {
      // ignore
    }
    document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
  }
};

export const removeToken = () => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("access_token");
    } catch {
      // ignore
    }
    document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
  }
};

const apiClient = axios.create({
  baseURL: ENV.ROOT_API || "http://localhost:5000",
});

export const getHeadersToken = () => {
  const token = getToken();
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// Request interceptor to attach token automatically
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const headers = getHeadersToken();
      if (headers.Authorization) {
        config.headers.Authorization = headers.Authorization;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor with resilient retry for rate limits
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const config = error?.config;
    // Transparent retry on 429 Too Many Requests for idempotent GET requests
    if (
      error?.response?.status === 429 &&
      config &&
      (!config.method || config.method.toLowerCase() === "get") &&
      !config._isRetry
    ) {
      config._isRetry = true;
      const retryAfterHeader = error.response.headers?.["retry-after"];
      const delayMs = retryAfterHeader
        ? Math.min(Math.max(parseInt(retryAfterHeader, 10) * 1000, 1000), 5000)
        : 1500;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return apiClient(config);
    }
    return Promise.reject(error);
  },
);

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  status: number;
  message?: string;
}

const extractErrorMessage = (error: any): string => {
  const data = error?.response?.data;
  if (data?.details && data?.error) {
    return `${data.error}: ${data.details}`;
  }
  return (
    data?.details ||
    data?.error ||
    data?.message ||
    error?.message ||
    "An error occurred"
  );
};

export const api = {
  get: async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
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
        message: extractErrorMessage(error),
      };
    }
  },
  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
    try {
      // Check if it's an internal API call (starts with /api/ inside Next.js)
      const isInternalApi = url.startsWith("/api/");
      const requestUrl = isInternalApi
        ? url
        : (apiClient.defaults.baseURL ? "" : "") + url;
      const instance = isInternalApi ? axios.create() : apiClient;
      if (isInternalApi && typeof window !== "undefined") {
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
        message: extractErrorMessage(error),
      };
    }
  },
  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
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
        message: extractErrorMessage(error),
      };
    }
  },
  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.put<T>(url, data, config);
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
        message: extractErrorMessage(error),
      };
    }
  },
  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
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
        message: extractErrorMessage(error),
      };
    }
  },
};

export default apiClient;
