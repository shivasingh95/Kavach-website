import { Router } from 'express';
import * as ctfController from '../controllers/ctf.controller';
import { validate } from '../middleware/validate.middleware';
import { createChallengeSchema, submitFlagSchema } from '../schemas/ctf.schema';
import { requireAuth } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';
import { ctfLimiter } from '../middleware/rateLimit.middleware';
import { auditLog } from '../middleware/auditLog.middleware';

const router = Router();

// Public routes (optionally auth'd for solve-status)
router.get('/challenges', ctfController.getAllChallenges);
router.get('/challenges/:id', ctfController.getChallengeById);
router.get('/leaderboard', ctfController.getLeaderboard);

// Authenticated routes
router.post(
  '/submit',
  requireAuth,
  ctfLimiter,
  validate(submitFlagSchema),
  auditLog('CTF_SUBMIT_FLAG', 'ctfSubmission'),
  ctfController.submitFlag
);

router.get('/my-submissions', requireAuth, ctfController.getMySubmissions);

// Admin-only routes
router.post(
  '/challenges',
  requireAuth,
  rbac('ADMIN'),
  validate(createChallengeSchema),
  auditLog('CTF_CREATE_CHALLENGE', 'ctfChallenge'),
  ctfController.createChallenge
);

router.put(
  '/challenges/:id',
  requireAuth,
  rbac('ADMIN'),
  auditLog('CTF_UPDATE_CHALLENGE', 'ctfChallenge'),
  ctfController.updateChallenge
);

router.delete(
  '/challenges/:id',
  requireAuth,
  rbac('ADMIN'),
  auditLog('CTF_DELETE_CHALLENGE', 'ctfChallenge'),
  ctfController.deleteChallenge
);

router.get(
  '/submissions',
  requireAuth,
  rbac('ADMIN'),
  ctfController.getAllSubmissions
);

router.patch(
  '/submissions/:id',
  requireAuth,
  rbac('ADMIN'),
  auditLog('CTF_REVIEW_SUBMISSION', 'ctfSubmission'),
  ctfController.reviewSubmission
);

export default router;
