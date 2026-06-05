import { Router } from 'express';
import * as achievementsController from '../controllers/achievements.controller';
import { validate } from '../middleware/validate.middleware';
import { createAchievementSchema, updateAchievementSchema } from '../schemas/achievements.schema';
import { requireAuth } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';

const router = Router();

// Public route to get published achievements
router.get('/', achievementsController.getAllAchievements);

// Admin routes
router.post(
  '/',
  requireAuth,
  rbac('ADMIN'),
  validate(createAchievementSchema),
  achievementsController.createAchievement
);

router.patch(
  '/:id',
  requireAuth,
  rbac('ADMIN'),
  validate(updateAchievementSchema),
  achievementsController.updateAchievement
);

router.delete(
  '/:id',
  requireAuth,
  rbac('ADMIN'),
  achievementsController.deleteAchievement
);

export default router;
