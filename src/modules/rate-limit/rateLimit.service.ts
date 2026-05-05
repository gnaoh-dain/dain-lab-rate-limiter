import { redisClient } from '../../configs/redis';
import fs from 'fs';
import path from 'path';

const luaPath = path.join(__dirname, 'scripts', 'slidingWindow.lua');

const luaScript = fs.readFileSync(luaPath, 'utf-8');

async function increment(key: string, windowMs: number): Promise<number> {
  const count = await redisClient.incr(key);
  if (count === 1) {
    await redisClient.pExpire(key, windowMs);
  }
  return count;
}

async function slidingWindowLua(
  key: string,
  windowMs: number,
  limit: number
): Promise<{ allowed: boolean; count: number }> {
  const now = Date.now();

  const result = (await redisClient.eval(luaScript, {
    keys: [key],
    arguments: [now.toString(), windowMs.toString(), limit.toString()],
  })) as [number, number];

  return {
    allowed: result[0] === 1,
    count: result[1],
  };
}
export const rateLimitService = {
  increment,
  slidingWindowLua,
};
