import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createFollowup,
  getFollowups,
} from '../controllers/customer.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  createFollowupSchema,
} from '../validators/customer.validator';
import { Role } from '../types';

const router = Router();

router.use(authenticateToken);

router.get(
  '/',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getCustomers
);

router.get(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getCustomerById
);

router.post(
  '/',
  requireRole(Role.ADMIN, Role.SALES),
  validateRequest(createCustomerSchema),
  createCustomer
);

router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES),
  validateRequest(updateCustomerSchema),
  updateCustomer
);

router.delete(
  '/:id',
  requireRole(Role.ADMIN),
  deleteCustomer
);

router.post(
  '/:id/follow-ups',
  requireRole(Role.ADMIN, Role.SALES),
  validateRequest(createFollowupSchema),
  createFollowup
);

router.get(
  '/:id/follow-ups',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getFollowups
);

export default router;
