import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
} from '../controllers/product.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
} from '../validators/product.validator';
import { Role } from '../types';

const router = Router();

router.use(authenticateToken);

router.get(
  '/',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getProducts
);

router.get(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getProductById
);

router.post(
  '/',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(createProductSchema),
  createProduct
);

router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(updateProductSchema),
  updateProduct
);

export default router;
