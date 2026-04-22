import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);
  return {
    user,
    isAuthenticated: Boolean(user && accessToken),
    isBootstrapped,
  };
}
