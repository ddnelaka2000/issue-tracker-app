import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  clearAuthImperative,
  getAccessToken,
  setAccessTokenImperative,
} from '@/stores/authStore';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20_000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await axios.post<{ accessToken: string }>(
        `${baseURL}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const token = res.data.accessToken;
      setAccessTokenImperative(token);
      return token;
    } catch {
      clearAuthImperative();
      return null;
    } finally {
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    }
  })();

  return refreshPromise;
}

interface RetriableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    const url = original?.url ?? '';
    const isAuthRoute =
      url.includes('/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/auth/register');

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute && getAccessToken()) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { error?: { message?: string }; message?: string }
      | undefined;
    return data?.error?.message || data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
