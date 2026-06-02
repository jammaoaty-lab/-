'use client';
/**
 * Auth Store - 用户认证状态管理 (Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import type { UserProfile } from '@neural-town/shared';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: UserProfile, token: string) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, roleTags: string[]) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  refreshFromToken: () => Promise<void>;
}

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user, token) => {
        localStorage.setItem('auth-token', token);
        set({ user, token, isAuthenticated: true });
      },

      login: async (username, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', { username, password });
          const { access_token, user } = res.data;
          localStorage.setItem('auth-token', access_token);
          set({ user, token: access_token, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          throw new Error(err.response?.data?.detail || '登录失败');
        }
      },

      register: async (username, email, password, roleTags) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', {
            username, email, password, role_tags: roleTags,
          });
          const { access_token, user } = res.data;
          localStorage.setItem('auth-token', access_token);
          set({ user, token: access_token, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          throw new Error(err.response?.data?.detail || '注册失败');
        }
      },

      logout: () => {
        localStorage.removeItem('auth-token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (updates) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...updates } });
        }
      },

      refreshFromToken: async () => {
        const token = localStorage.getItem('auth-token');
        if (!token) return;
        try {
          const res = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ user: res.data, token, isAuthenticated: true });
        } catch {
          localStorage.removeItem('auth-token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'neural-town-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return children;
}

export { api };