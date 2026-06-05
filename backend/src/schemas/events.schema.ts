import { z } from 'zod';

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    content: z.string(),
    date: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    location: z.string().optional(),
    isPublished: z.boolean().optional(),
    capacity: z.number().int().positive().optional(),
    isOnline: z.boolean().optional(),
    meetLink: z.string().optional(),
    imageUrl: z.string().optional(),
    slug: z.string().optional(),
  })
});

export const updateEventSchema = createEventSchema.deepPartial();
