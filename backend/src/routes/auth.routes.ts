import { Router } from 'express';
import { login, register, getMe } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticateToken, getMe);

export default router;
