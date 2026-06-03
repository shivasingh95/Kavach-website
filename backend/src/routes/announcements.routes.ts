import { Router } from 'express';
import * as announcementsController from '../controllers/announcements.controller';
import { validate } from '../middleware/validate.middleware';
import { createAnnouncementSchema } from '../schemas/announcements.schema';
import { requireAuth } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';
import { auditLog } from '../middleware/auditLog.middleware';

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyAccessToken(token);
    } catch (e) {
      // ignore invalid token for optional auth
    }
  }
  next();
};

const router = Router();

// Get active announcements (filters by role internally)
router.get('/', optionalAuth, announcementsController.getAnnouncements);

// Admin-only routes
router.post(
  '/',
  requireAuth,
  rbac('ADMIN'),
  validate(createAnnouncementSchema),
  auditLog('CREATE_ANNOUNCEMENT', 'announcement'),
  announcementsController.createAnnouncement
);

router.delete(
  '/:id',
  requireAuth,
  rbac('ADMIN'),
  auditLog('DELETE_ANNOUNCEMENT', 'announcement'),
  announcementsController.deleteAnnouncement
);

export default router;
