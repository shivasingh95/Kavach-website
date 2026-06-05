import { Router } from 'express';
import multer from 'multer';
import * as uploadController from '../controllers/upload.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';
import os from 'os';

const router = Router();
const upload = multer({ dest: os.tmpdir() });

router.post(
  '/image',
  requireAuth,
  rbac('ADMIN'),
  upload.single('file'), // or 'image' if that's what frontend sends
  uploadController.uploadImageHandler
);

router.post(
  '/file',
  requireAuth,
  rbac('ADMIN'),
  upload.single('file'),
  uploadController.uploadFileHandler
);

export default router;
