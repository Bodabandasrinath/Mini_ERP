import { api } from './api';
import { ApiResponse, User, Role } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  mobileNumber?: string;
  role?: Role;
  password: string;
  confirmPassword: string;
}

export const authService = {
  register: async (payload: RegisterPayload): Promise<User> => {
    const res = await api.post<ApiResponse<User>>('/auth/register', payload);
    return res.data.data!;
  },

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
