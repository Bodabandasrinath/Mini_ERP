import { Router } from 'express';
import {
  getChallans,
  getChallanById,
  createChallan,
  updateChallan,
  confirmChallan,
  cancelChallan,
} from '../controllers/challan.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createChallanSchema,
  updateChallanSchema,
} from '../validators/challan.validator';
import { Role } from '../types';

const router = Router();

router.use(authenticateToken);

router.get(
  '/',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getChallans
);

router.get(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getChallanById
);

router.post(
  '/',
  requireRole(Role.ADMIN, Role.SALES),
  validateRequest(createChallanSchema),
  createChallan
);

router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES),
  validateRequest(updateChallanSchema),
  updateChallan
);

router.post(
  '/:id/confirm',
  requireRole(Role.ADMIN, Role.SALES),
  confirmChallan
);

router.post(
  '/:id/cancel',
  requireRole(Role.ADMIN, Role.SALES),
  cancelChallan
);

export default router;
