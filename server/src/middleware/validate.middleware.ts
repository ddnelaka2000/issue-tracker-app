import type { Request, Response, NextFunction } from 'express';
import { z, ZodError, type ZodTypeAny } from 'zod';
import { ApiError } from '@/utils/ApiError';

type Source = 'body' | 'query' | 'params';

export function validate<S extends ZodTypeAny>(schema: S, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        ApiError.badRequest('Validation failed', formatZodError(result.error)),
      );
    }
    (req as unknown as Record<Source, unknown>)[source] = result.data;
    next();
  };
}

function formatZodError(err: ZodError) {
  return err.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
    code: i.code,
  }));
}

export { z };
