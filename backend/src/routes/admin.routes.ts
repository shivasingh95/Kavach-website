import { Router } from 'express';
import * as progressService from '../services/progress.service';
import { requireAuth } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';

const router = Router();

router.post(
  '/recalculate-leaderboard',
  requireAuth,
  rbac('ADMIN'),
  async (req, res, next) => {
    try {
      await progressService.updateLeaderboard();
      res.status(200).json({ success: true, message: 'Leaderboard recalculated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
