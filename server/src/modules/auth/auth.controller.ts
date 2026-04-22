import type { Request, Response } from 'express';
import * as authService from './auth.service';
import { env } from '@/config/env';
import { ApiError } from '@/utils/ApiError';
import type { RegisterInput, LoginInput } from './auth.schema';

const REFRESH_COOKIE = 'rt';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days — should mirror JWT_REFRESH_EXPIRES_IN
    path: '/api/auth',
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
}

export async function register(req: Request<unknown, unknown, RegisterInput>, res: Response) {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ user, accessToken });
}

export async function login(req: Request<unknown, unknown, LoginInput>, res: Response) {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  const { accessToken, refreshToken } = await authService.refreshTokens(token);
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken });
}

export async function logout(_req: Request, res: Response) {
  clearRefreshCookie(res);
  res.status(204).end();
}

export async function me(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const user = await authService.getCurrentUser(req.user.sub);
  res.json({ user });
}
