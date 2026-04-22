import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncHandler<P = unknown, ResBody = unknown, ReqBody = unknown, ReqQuery = unknown> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction,
) => Promise<unknown>;

/**
 * Wraps an async controller so any rejected promise is forwarded to the
 * Express error middleware. Without this, an `await` that throws would
 * result in an unhandled rejection and the request would hang.
 */
export const asyncHandler =
  <P = unknown, ResBody = unknown, ReqBody = unknown, ReqQuery = unknown>(
    fn: AsyncHandler<P, ResBody, ReqBody, ReqQuery>,
  ): RequestHandler<P, ResBody, ReqBody, ReqQuery> =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
