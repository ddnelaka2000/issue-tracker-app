import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/jwt';
import { ApiError } from '@/utils/ApiError';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) return next(ApiError.unauthorized('Missing access token'));

  try {
    req.user = verifyToken('access', token);
    next();
  } catch (err) {
    next(err);
  }
}
