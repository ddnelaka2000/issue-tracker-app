import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './config/logger';

async function main(): Promise<void> {
  await connectDatabase();
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });

  //  Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down...`);
    server.close(async (err) => {
      if (err) {
        logger.error({ err }, 'Error closing HTTP server');
        process.exit(1);
      }
      await disconnectDatabase();
      process.exit(0);
    });

    // Hard kill after 10s if something's stuck
    setTimeout(() => {
      logger.error('Forced shutdown — timed out');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection');
  });
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception — exiting');
    process.exit(1);
  });
}

void main();
