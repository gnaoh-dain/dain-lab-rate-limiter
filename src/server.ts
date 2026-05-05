import { Server } from 'http';
import app from './app';
import { redisClient } from './configs/redis';
import env from './configs/env';

let server: Server | undefined;

(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');

    server = app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
})();

async function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down...`);
  await redisClient.quit().catch(() => {});
  server?.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
