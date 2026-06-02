import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { authLimiter } from '../middleware/rateLimit.middleware';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getMe);

export default router;
