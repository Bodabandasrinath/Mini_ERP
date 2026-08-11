import { api } from './api';
import { ApiResponse, DashboardStats } from '../types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return res.data.data!;
  },
};
