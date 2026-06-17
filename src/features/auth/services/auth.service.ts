import api from '@/config/axios';
import { LoginRequest, LoginResponse } from '@/features/auth/types/auth.types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/login', credentials);
    return data;
  },
};
