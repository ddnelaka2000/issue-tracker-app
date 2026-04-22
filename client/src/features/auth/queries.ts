import { queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types/issue';

export const authKeys = {
  me: ['auth', 'me'] as const,
  bootstrap: ['auth', 'bootstrap'] as const,
} as const;

export const authQueries = {
  bootstrap: (isBootstrapped: boolean) =>
    queryOptions({
      queryKey: authKeys.bootstrap,
      enabled: !isBootstrapped,
      retry: false,
      staleTime: Infinity,
      queryFn: async () => {
        const { setAuth, setBootstrapped, clear, setAccessToken } =
          useAuthStore.getState();
        try {
          const refreshRes = await api.post<{ accessToken: string }>('/auth/refresh');
          setAccessToken(refreshRes.data.accessToken);

          const meRes = await api.get<{ user: User }>('/auth/me');
          setAuth(meRes.data.user, refreshRes.data.accessToken);
          return { user: meRes.data.user };
        } catch {
          clear();
          return { user: null };
        } finally {
          setBootstrapped(true);
        }
      },
    }),
} as const;
