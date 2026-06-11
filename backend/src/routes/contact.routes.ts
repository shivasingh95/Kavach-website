import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { validate } from '../middleware/validate.middleware';
import { contactSchema } from '../schemas/contact.schema';
import { contactLimiter } from '../middleware/rateLimit.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';

const router = Router();

// Public route for submitting messages
router.post(
  '/',
  contactLimiter,
  validate(contactSchema),
  contactController.submitContact
);

// Admin only routes
router.use(requireAuth);
router.use(rbac('ADMIN'));

router.get('/', contactController.getAllContacts);
router.patch('/:id', contactController.updateContactStatus);
router.delete('/:id', contactController.deleteContact);

export default router;
