import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { validate } from '@/middleware/validate.middleware';
import { requireAuth } from '@/middleware/auth.middleware';
import { authLimiter, refreshLimiter } from '@/middleware/rateLimit.middleware';
import * as authController from './auth.controller';
import { registerSchema, loginSchema } from './auth.schema';

export const authRouter = Router();

authRouter.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(authController.register),
);

authRouter.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(authController.login),
);

authRouter.post('/refresh', refreshLimiter, asyncHandler(authController.refresh));
authRouter.post('/logout', asyncHandler(authController.logout));
authRouter.get('/me', requireAuth, asyncHandler(authController.me));
