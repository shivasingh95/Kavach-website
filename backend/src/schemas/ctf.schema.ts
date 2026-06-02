import { z } from 'zod';

export const createChallengeSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string(),
    category: z.enum(['WEB', 'CRYPTO', 'FORENSICS', 'PWNING', 'MISC', 'OSINT', 'REVERSE_ENGINEERING']),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
    points: z.number().int().positive(),
    flag: z.string().min(5),
    hints: z.array(z.object({
      id: z.string(),
      text: z.string(),
      cost: z.number().int().nonnegative()
    })).optional(),
    isActive: z.boolean().optional()
  })
});

export const submitFlagSchema = z.object({
  body: z.object({
    challengeId: z.string(),
    flag: z.string().min(1, 'Flag cannot be empty')
  })
});
