import { Router } from 'express';
import * as joinController from '../controllers/join.controller';
import { validate } from '../middleware/validate.middleware';
import { createJoinRequestSchema, updateJoinRequestSchema } from '../schemas/join.schema';
import { requireAuth } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';

const router = Router();

// Public route to submit join request
router.post(
  '/',
  validate(createJoinRequestSchema),
  joinController.createJoinRequest
);

// Admin routes
router.get(
  '/',
  requireAuth,
  rbac('ADMIN'),
  joinController.getAllJoinRequests
);

router.patch(
  '/:id',
  requireAuth,
  rbac('ADMIN'),
  validate(updateJoinRequestSchema),
  joinController.updateJoinRequest
);

router.delete(
  '/:id',
  requireAuth,
  rbac('ADMIN'),
  joinController.deleteJoinRequest
);

export default router;
