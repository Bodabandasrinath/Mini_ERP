import { api } from './api';
import { ApiResponse, StockMovement, MovementType } from '../types';

export const stockService = {
  getStockMovements: async (params?: { page?: number; limit?: number; productId?: string; movementType?: MovementType }): Promise<ApiResponse<StockMovement[]>> => {
    const res = await api.get<ApiResponse<StockMovement[]>>('/stock-movements', { params });
    return res.data;
  },

  createStockMovement: async (data: { productId: string; quantityChanged: number; movementType: MovementType; reason: string }): Promise<StockMovement> => {
    const res = await api.post<ApiResponse<StockMovement>>('/stock-movements', data);
    return res.data.data!;
  },
};
