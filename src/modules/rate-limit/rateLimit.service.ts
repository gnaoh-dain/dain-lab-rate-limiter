import { loadLuaScript } from './luaLoader';
import { redisClient, RedisInstance } from '../../configs/redis';

export class RateLimitService {
  private redis: RedisInstance;
  private slidingScript: string;
  private slidingSha?: string;

  constructor(redisClient: RedisInstance) {
    this.redis = redisClient;
    this.slidingScript = loadLuaScript('slidingWindow.lua');
  }

  async init() {
    this.slidingSha = await this.redis.scriptLoad(this.slidingScript);
  }

  async fixedWindow(key: string, windowMs: number): Promise<number> {
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.pExpire(key, windowMs);
    }
    return count;
  }

  async slidingWindowLua(
    key: string,
    windowMs: number,
    limit: number
  ): Promise<{ allowed: boolean; count: number }> {
    const now = Date.now();
    if (!this.slidingSha) await this.init();

    try {
      const result = await this.redis.evalSha(this.slidingSha!, {
        keys: [key],
        arguments: [now.toString(), windowMs.toString(), limit.toString()],
      });
      const [allowed, count] = result as [number, number];
      return { allowed: allowed === 1, count };
    } catch (err) {
      throw err;
    }
  }
}

export const rateLimitService = new RateLimitService(redisClient);
