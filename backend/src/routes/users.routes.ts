import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema, updateUserRoleSchema, createUserSchema } from '../schemas/users.schema';
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
router.post(
  '/',
  requireAuth,
  rbac('ADMIN'),
  validate(createUserSchema),
  auditLog('CREATE_USER', 'user'),
  usersController.createUser
);

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

router.patch(
  '/:id/toggle-active',
  requireAuth,
  rbac('ADMIN'),
  auditLog('TOGGLE_USER_ACTIVE', 'user'),
  usersController.toggleActive
);

router.delete(
  '/:id',
  requireAuth,
  rbac('ADMIN'),
  auditLog('DELETE_USER', 'user'),
  usersController.deleteUser
);

export default router;
