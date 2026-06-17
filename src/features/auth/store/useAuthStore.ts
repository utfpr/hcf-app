import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Usuario } from '@/features/auth/types/auth.types';

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  _hydrated: boolean;
  setHydrated: (val: boolean) => void;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,
      _hydrated: false,
      setHydrated: (val) => set({ _hydrated: val }),
      login: (token, usuario) => set({ token, usuario, isAuthenticated: true }),
      logout: () => set({ token: null, usuario: null, isAuthenticated: false }),
    }),
    {
      name: 'hcf-auth',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
