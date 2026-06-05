import { z } from 'zod';

export const createJoinRequestSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    college: z.string().min(2),
    yearOfStudy: z.string(),
    githubUrl: z.string().url().optional().or(z.literal('')),
    linkedinUrl: z.string().url().optional().or(z.literal('')),
    whyJoin: z.string().min(10),
    experienceLevel: z.string(),
    skills: z.array(z.string()).min(1),
  })
});

export const updateJoinRequestSchema = z.object({
  body: z.object({
    status: z.enum(['ACCEPTED', 'REJECTED']),
    reviewNote: z.string().optional()
  })
});
