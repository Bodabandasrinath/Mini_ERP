import { Router } from 'express';
import {
  getStockMovements,
  getStockMovementsByProduct,
  createStockMovement,
} from '../controllers/stock.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createStockMovementSchema } from '../validators/stock.validator';
import { Role } from '../types';

const router = Router();

router.use(authenticateToken);

router.get(
  '/',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getStockMovements
);

router.post(
  '/',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(createStockMovementSchema),
  createStockMovement
);

router.get(
  '/products/:id',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getStockMovementsByProduct
);

export default router;
