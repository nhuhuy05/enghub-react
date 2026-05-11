import { create } from 'zustand';
import type { User } from '@/types/apiTypes';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isSessionChecked: boolean;
  setToken: (token: string) => void;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  markSessionChecked: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isSessionChecked: false,

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true, isSessionChecked: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, isSessionChecked: true });
  },

  updateUser: (user) => set({ user }),

  markSessionChecked: () => set({ isSessionChecked: true }),
}));
