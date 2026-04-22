import 'tsconfig-paths/register';
import { createApp } from '../src/app';
import { connectDatabase } from '../src/config/database';

let connected = false;

const app = createApp();

export default async function handler(req: any, res: any) {
  if (!connected) {
    await connectDatabase();
    connected = true;
  }
  return new Promise<void>((resolve) => app(req, res, () => resolve()));
}
