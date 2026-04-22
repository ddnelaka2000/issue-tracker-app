import express, { type Application, type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';

import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { authRouter } from '@/modules/auth/auth.routes';
import { issueRouter } from '@/modules/issues/issue.routes';
import { apiLimiter } from '@/middleware/rateLimit.middleware';
import { errorHandler, notFoundHandler } from '@/middleware/error.middleware';
import '@/types/express.d';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );

  // Parsing
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.use(cookieParser(env.COOKIE_SECRET));

  app.use(mongoSanitize());

  // Perf & observability
  app.use(compression());
  if (env.NODE_ENV !== 'test') {
    app.use(
      morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined', {
        stream: { write: (msg) => logger.info(msg.trim()) },
      }),
    );
  }

  // Global rate limit (auth routes get stricter limit inside their router)
  app.use('/api', apiLimiter);

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/auth', authRouter);
  app.use('/api/issues', issueRouter);

  // error handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
