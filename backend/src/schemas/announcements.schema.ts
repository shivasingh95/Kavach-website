import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    body: z.string().min(10),
    isPinned: z.boolean().optional(),
    targetRole: z.enum(['ADMIN', 'MEMBER', 'PUBLIC']).optional(),
    expiresAt: z.string().datetime().optional()
  })
});
