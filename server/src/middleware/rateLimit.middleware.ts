import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: { message: 'Too many auth attempts, try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { error: { message: 'Too many refresh attempts, try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: { message: 'Too many requests, slow down.' } },
  standardHeaders: true,
  legacyHeaders: false,
});
