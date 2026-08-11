import { api } from './api';
import { ApiResponse, Challan, ChallanStatus } from '../types';

export const challanService = {
  getChallans: async (params?: { page?: number; limit?: number; search?: string; status?: ChallanStatus; customerId?: string }): Promise<ApiResponse<Challan[]>> => {
    const res = await api.get<ApiResponse<Challan[]>>('/challans', { params });
    return res.data;
  },

  getChallanById: async (id: string): Promise<Challan> => {
    const res = await api.get<ApiResponse<Challan>>(`/challans/${id}`);
    return res.data.data!;
  },

  createChallan: async (data: { customerId: string; items: { productId: string; quantity: number }[] }): Promise<Challan> => {
    const res = await api.post<ApiResponse<Challan>>('/challans', data);
    return res.data.data!;
  },

  updateChallan: async (id: string, data: { customerId?: string; items?: { productId: string; quantity: number }[] }): Promise<Challan> => {
    const res = await api.put<ApiResponse<Challan>>(`/challans/${id}`, data);
    return res.data.data!;
  },

  confirmChallan: async (id: string): Promise<Challan> => {
    const res = await api.post<ApiResponse<Challan>>(`/challans/${id}/confirm`);
    return res.data.data!;
  },

  cancelChallan: async (id: string): Promise<Challan> => {
    const res = await api.post<ApiResponse<Challan>>(`/challans/${id}/cancel`);
    return res.data.data!;
  },
};
