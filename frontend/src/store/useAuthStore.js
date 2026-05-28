import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (correo, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { correo, password });
          set({ user: data.user, token: data.token, loading: false });
          return data;
        } catch (err) {
          const error = err.response?.data?.error || 'Error al iniciar sesión';
          set({ loading: false, error });
          throw new Error(error);
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', userData);
          set({ loading: false });
          return data;
        } catch (err) {
          const error = err.response?.data?.error || err.response?.data?.errors || 'Error al registrarse';
          set({ loading: false, error: typeof error === 'string' ? error : JSON.stringify(error) });
          throw error;
        }
      },

      fetchProfile: async () => {
        try {
          const { data } = await api.get('/auth/profile');
          set((state) => ({ user: { ...state.user, ...data } }));
          return data;
        } catch {
          set({ user: null, token: null });
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
