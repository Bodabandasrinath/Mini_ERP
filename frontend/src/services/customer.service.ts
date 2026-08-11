import { api } from './api';
import { ApiResponse, Customer, CustomerFollowup } from '../types';

export const customerService = {
  getCustomers: async (params?: { page?: number; limit?: number; search?: string; type?: string; status?: string }): Promise<ApiResponse<Customer[]>> => {
    const res = await api.get<ApiResponse<Customer[]>>('/customers', { params });
    return res.data;
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    const res = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return res.data.data!;
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const res = await api.post<ApiResponse<Customer>>('/customers', data);
    return res.data.data!;
  },

  updateCustomer: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const res = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return res.data.data!;
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },

  getFollowups: async (customerId: string): Promise<CustomerFollowup[]> => {
    const res = await api.get<ApiResponse<CustomerFollowup[]>>(`/customers/${customerId}/follow-ups`);
    return res.data.data!;
  },

  createFollowup: async (customerId: string, note: string, followUpDate: string): Promise<CustomerFollowup> => {
    const res = await api.post<ApiResponse<CustomerFollowup>>(`/customers/${customerId}/follow-ups`, {
      note,
      followUpDate,
    });
    return res.data.data!;
  },
};
