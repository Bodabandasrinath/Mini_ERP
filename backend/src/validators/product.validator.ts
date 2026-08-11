import { z } from 'zod';

export const createProductSchema = z.object({
  productName: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().min(2, 'Category is required'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  currentStock: z.number().int().min(0, 'Stock must be non-negative').default(0),
  minimumStockAlertQuantity: z.number().int().min(0, 'Minimum stock alert must be non-negative').default(5),
  warehouseLocation: z.string().min(1, 'Warehouse location is required'),
});

export const updateProductSchema = createProductSchema.partial();
