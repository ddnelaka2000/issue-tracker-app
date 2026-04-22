import { mutationOptions, useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { authKeys, authQueries } from './queries';
import type { AuthResponse } from '@/types/issue';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const authMutations = {
  login: mutationOptions({
    mutationKey: ['auth', 'login'] as const,
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<AuthResponse>('/auth/login', payload);
      return data;
    },
    onSuccess: (data) => {
      useAuthStore.getState().setAuth(data.user, data.accessToken);
      queryClient.setQueryData(authKeys.me, { user: data.user });
    },
  }),

  register: mutationOptions({
    mutationKey: ['auth', 'register'] as const,
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await api.post<AuthResponse>('/auth/register', payload);
      return data;
    },
    onSuccess: (data) => {
      useAuthStore.getState().setAuth(data.user, data.accessToken);
      queryClient.setQueryData(authKeys.me, { user: data.user });
    },
  }),

  logout: mutationOptions({
    mutationKey: ['auth', 'logout'] as const,
    mutationFn: async () => {
      try {
        await api.post('/auth/logout');
      } catch {}
    },
    onSettled: () => {
      useAuthStore.getState().clear();
      queryClient.cancelQueries().finally(() => queryClient.removeQueries());
    },
  }),
} as const;

export function useLogin() {
  return useMutation(authMutations.login);
}

export function useRegister() {
  return useMutation(authMutations.register);
}

export function useLogout() {
  return useMutation(authMutations.logout);
}

export function useBootstrap() {
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);
  return useQuery(authQueries.bootstrap(isBootstrapped));
}
