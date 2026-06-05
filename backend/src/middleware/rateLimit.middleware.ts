import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

export const authLimiter = rateLimit({
  // Dev: 1-minute window with 100 attempts — never block during local testing
  // Prod: 15-minute window with 10 attempts — brute-force protection
  windowMs: isDev ? 60 * 1000 : 15 * 60 * 1000,
  max: isDev ? 100 : 10,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later',
    statusCode: 429
  },
  skip: (req) => req.path === '/health',
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDev ? 1000 : 100,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    statusCode: 429
  },
  skip: (req) => req.path === '/health',
});

export const ctfLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDev ? 100 : 5,
  message: {
    success: false,
    error: 'Too many CTF submissions for this challenge. Please wait an hour.',
    statusCode: 429
  },
});

export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 5,
  message: {
    success: false,
    error: 'Too many messages sent. Please wait 15 minutes before sending another one.',
    statusCode: 429
  },
});
