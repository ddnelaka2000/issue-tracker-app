import { create } from 'zustand';
import type { User } from '@/types/issue';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isBootstrapped: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setBootstrapped: (value: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isBootstrapped: false,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setBootstrapped: (value) => set({ isBootstrapped: value }),
  clear: () => set({ user: null, accessToken: null }),
}));

export const getAccessToken = () => useAuthStore.getState().accessToken;
export const setAccessTokenImperative = (token: string | null) =>
  useAuthStore.getState().setAccessToken(token);
export const clearAuthImperative = () => useAuthStore.getState().clear();
