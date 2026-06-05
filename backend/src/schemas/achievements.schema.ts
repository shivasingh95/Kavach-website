import { z } from 'zod';

export const createAchievementSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    category: z.enum(['CTF', 'HACKATHON', 'RESEARCH', 'COMMUNITY', 'ACADEMIC', 'OTHER']),
    position: z.enum(['1ST', '2ND', '3RD', 'PARTICIPATION']),
    eventName: z.string().optional(),
    userId: z.string().optional(),
    eventId: z.string().optional(),
    achievedAt: z.string().optional().transform(val => val ? new Date(val) : undefined),
    isPublished: z.boolean().default(false)
  })
});

export const updateAchievementSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    category: z.enum(['CTF', 'HACKATHON', 'RESEARCH', 'COMMUNITY', 'ACADEMIC', 'OTHER']).optional(),
    position: z.enum(['1ST', '2ND', '3RD', 'PARTICIPATION']).optional(),
    eventName: z.string().optional(),
    userId: z.string().optional(),
    eventId: z.string().optional(),
    achievedAt: z.string().optional().transform(val => val ? new Date(val) : undefined),
    isPublished: z.boolean().optional()
  })
});
