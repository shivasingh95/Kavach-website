import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, setPasswordSchema } from '../schemas/auth.schema';
import { authLimiter } from '../middleware/rateLimit.middleware';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/set-password', authLimiter, validate(setPasswordSchema), authController.setPassword);
router.post('/google', authLimiter, authController.googleLogin);
router.post('/logout', requireAuth, authController.logout);
router.post('/refresh', authController.refreshTokenHandler);
router.get('/me', requireAuth, authController.getMe);

export default router;
