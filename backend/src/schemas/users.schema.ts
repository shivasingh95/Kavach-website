import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    role: z.enum(['ADMIN', 'MEMBER', 'PUBLIC'])
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    bio: z.string().max(160).optional(),
    github: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal(''))
  })
});
