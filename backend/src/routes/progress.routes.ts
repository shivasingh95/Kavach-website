import { Router } from 'express';
import * as progressController from '../controllers/progress.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';

const router = Router();

/**
 * GET /api/v1/progress/leaderboard
 * Public — returns pre-computed leaderboard from leaderboard collection
 */
router.get('/leaderboard', progressController.getLeaderboard);

/**
 * GET /api/v1/progress/me
 * Auth required — full progress for the currently authenticated user
 */
router.get('/me', requireAuth, progressController.getMyProgress);

/**
 * GET /api/v1/progress/users/:uid
 * ADMIN only — returns full progress for any user by UID
 */
router.get('/users/:uid', requireAuth, rbac('ADMIN'), progressController.getUserProgressAdmin);

/**
 * PATCH /api/v1/progress/days/:dayNumber
 * Auth required — toggles a day as complete/incomplete
 * Body (when completing): { roomName: string, platform?: string }
 */
router.patch('/days/:dayNumber', requireAuth, progressController.toggleDay);

/**
 * POST /api/v1/progress/events/:eventId/attend
 * ADMIN or MEMBER only — marks a specific user as attended for an event
 * Body: { uid: string }
 */
router.post('/events/:eventId/attend', requireAuth, rbac('MEMBER'), progressController.markEventAttended);

export default router;
