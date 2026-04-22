import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

const { MongoServerError } = mongoose.mongo;
import { ApiError } from '@/utils/ApiError';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const { status, body } = normalize(err);

  if (status >= 500) {
    logger.error({ err, path: req.path, method: req.method }, 'Request failed');
  } else {
    logger.debug({ err, path: req.path, method: req.method }, 'Request rejected');
  }

  res.status(status).json(body);
}

function normalize(err: unknown): { status: number; body: ErrorResponse } {

  if (err instanceof ApiError) {
    return {
      status: err.statusCode,
      body: { error: { message: err.message, details: err.details } },
    };
  }

  // Mongoose validation
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      path: e.path,
      message: e.message,
    }));
    return {
      status: 400,
      body: { error: { message: 'Validation failed', details } },
    };
  }

  // Duplicate key
  if (err instanceof MongoServerError && (err.code as number) === 11000) {
    const field = Object.keys((err.keyValue as Record<string, unknown>) ?? {})[0] ?? 'field';
    return {
      status: 409,
      body: { error: { message: `${field} already exists`, code: 'DUPLICATE_KEY' } },
    };
  }

  if (err instanceof mongoose.Error.CastError) {
    return {
      status: 400,
      body: { error: { message: `Invalid ${err.path}`, code: 'INVALID_ID' } },
    };
  }
  const message = env.NODE_ENV === 'production' ? 'Internal Server Error' : (err as Error)?.message ?? 'Unknown error';
  return { status: 500, body: { error: { message } } };
}

// 404 catch-all must be registered after all routes, before errorHandler
export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound('Route not found'));
}
