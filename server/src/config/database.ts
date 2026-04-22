import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

mongoose.set('strictQuery', true);

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10_000,
      autoIndex: env.NODE_ENV !== 'production',
      maxPoolSize: 10,
      minPoolSize: 1,
    } as mongoose.ConnectOptions);
    logger.info({ uri: maskUri(env.MONGODB_URI) }, '✓ MongoDB connected');
  } catch (err) {
    logger.fatal({ err }, '✗ MongoDB connection failed');
    throw err;
  }

  mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB error'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
}

/** Masks the password segment in mongodb URIs for safe logging. */
function maskUri(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
}
