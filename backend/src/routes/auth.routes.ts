import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticateToken, getMe);

export default router;
