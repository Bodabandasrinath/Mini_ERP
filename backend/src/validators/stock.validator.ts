import { z } from 'zod';
import { MovementType } from '../types';

export const createStockMovementSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantityChanged: z.number().int().positive('Quantity must be greater than 0'),
  movementType: z.nativeEnum(MovementType),
  reason: z.string().min(3, 'Reason is required'),
});
