import { Router } from 'express';
import * as blogController from '../controllers/blog.controller';
import { validate } from '../middleware/validate.middleware';
import { createBlogPostSchema, updateBlogPostSchema } from '../schemas/blog.schema';
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

// Public routes (with optional auth to show unpublished posts to admins/members)
router.get('/', optionalAuth, blogController.getAllPosts);
router.get('/:slug', optionalAuth, blogController.getPostBySlug);

// Admin/Member routes
router.post(
  '/',
  requireAuth,
  rbac('MEMBER'),
  validate(createBlogPostSchema),
  auditLog('CREATE_BLOG_POST', 'blogPost'),
  blogController.createPost
);

router.put(
  '/:id',
  requireAuth,
  rbac('MEMBER'),
  validate(updateBlogPostSchema),
  auditLog('UPDATE_BLOG_POST', 'blogPost'),
  blogController.updatePost
);

router.delete(
  '/:id',
  requireAuth,
  rbac('MEMBER'),
  auditLog('DELETE_BLOG_POST', 'blogPost'),
  blogController.deletePost
);

export default router;
