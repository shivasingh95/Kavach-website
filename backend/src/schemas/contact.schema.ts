import { z } from 'zod';

export const contactSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    subject: z.enum(['General', 'CTF Help', 'Partnership', 'Other']),
    message: z.string().min(20)
  })
});
