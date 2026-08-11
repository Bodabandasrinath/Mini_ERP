import { api } from './api';
import { ApiResponse, User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      email,
      password,
    });
    return res.data.data!;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data!;
  },
};
