import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { Role } from '../types';

const router = Router();

router.use(authenticateToken);

router.get(
  '/stats',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getDashboardStats
);

export default router;
