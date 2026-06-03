import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema, updateUserRoleSchema } from '../schemas/users.schema';
import { requireAuth } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';
import { auditLog } from '../middleware/auditLog.middleware';

const router = Router();

// Public (authenticated) profile viewing
router.get('/:id', requireAuth, usersController.getUserProfile);

// Update own profile
router.patch(
  '/profile',
  requireAuth,
  validate(updateProfileSchema),
  usersController.updateProfile
);

// Admin-only routes
router.get(
  '/',
  requireAuth,
  rbac('ADMIN'),
  usersController.getAllUsers
);

router.patch(
  '/:id/role',
  requireAuth,
  rbac('ADMIN'),
  validate(updateUserRoleSchema),
  auditLog('UPDATE_USER_ROLE', 'user'),
  usersController.updateUserRole
);

export default router;
