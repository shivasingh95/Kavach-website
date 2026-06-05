import { Router } from 'express';
import * as eventsController from '../controllers/events.controller';
import { validate } from '../middleware/validate.middleware';
import { createEventSchema, updateEventSchema } from '../schemas/events.schema';
import { requireAuth } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';
import { auditLog } from '../middleware/auditLog.middleware';
import { generalLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Public routes (optionally auth'd for viewing unpublished if admin is handled in controller/service via token if present, but express auth middleware blocks if no token. We can make a specialized middleware if needed, but for now we'll just use the standard flow. If public, no token. If token, it parses user).
// To allow both, we can create an optionalAuth middleware or just rely on the controller not needing req.user if it's undefined. 
// Actually, requireAuth forces a token. Let's create a quick optional auth inline for these public getters.
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

router.get('/', optionalAuth, eventsController.getAllEvents);
router.get('/:slug', optionalAuth, eventsController.getEventBySlug);

// Authenticated User routes
router.post('/:id/rsvp', requireAuth, generalLimiter, eventsController.rsvpEvent);
router.delete('/:id/rsvp', requireAuth, eventsController.cancelRsvp);

// Admin-only routes
router.post(
  '/',
  requireAuth,
  rbac('ADMIN'),
  validate(createEventSchema),
  auditLog('CREATE_EVENT', 'event'),
  eventsController.createEvent
);

router.put(
  '/:id',
  requireAuth,
  rbac('ADMIN'),
  validate(updateEventSchema),
  auditLog('UPDATE_EVENT', 'event'),
  eventsController.updateEvent
);

router.patch(
  '/:id',
  requireAuth,
  rbac('ADMIN'),
  validate(updateEventSchema),
  auditLog('UPDATE_EVENT', 'event'),
  eventsController.updateEvent
);

router.delete(
  '/:id',
  requireAuth,
  rbac('ADMIN'),
  auditLog('DELETE_EVENT', 'event'),
  eventsController.deleteEvent
);

export default router;
