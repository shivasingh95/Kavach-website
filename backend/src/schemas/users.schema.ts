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

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['ADMIN', 'MEMBER', 'PUBLIC']).optional().default('MEMBER'),
  })
});

