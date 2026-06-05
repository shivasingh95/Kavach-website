import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';

const router = Router();

router.get(
  '/dashboard',
  requireAuth,
  rbac('ADMIN'),
  analyticsController.getDashboardStats
);

router.get('/public', analyticsController.getPublicStats);

export default router;
