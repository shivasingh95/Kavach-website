import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { validate } from '../middleware/validate.middleware';
import { contactSchema } from '../schemas/contact.schema';
import { contactLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// 5 requests per 15 minutes to prevent spam
router.post(
  '/',
  contactLimiter,
  validate(contactSchema),
  contactController.submitContact
);

export default router;
