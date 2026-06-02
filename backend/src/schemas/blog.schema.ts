import { z } from 'zod';

export const createBlogPostSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    content: z.string().min(10),
    excerpt: z.string().max(200),
    tags: z.array(z.string()).max(5),
    isPublished: z.boolean().optional()
  })
});

export const updateBlogPostSchema = createBlogPostSchema.deepPartial();
