import { NextFunction, Request, Response } from 'express';
import { RateLimiterOptions } from './rateLimit.interface';
import { rateLimitService } from './rateLimit.service';
import {
  DEFAULT_LIMIT,
  DEFAULT_WINDOW_MS,
  RATE_LIMIT_PREFIX,
} from './rateLimit.constants';

export const rateLimit = (option: RateLimiterOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (option.skip && option.skip(req)) {
        return next();
      }
      const limit = option.limit ?? DEFAULT_LIMIT;
      const windowMs = option.windowMs ?? DEFAULT_WINDOW_MS;
      const rawKey = option.keyGenerator
        ? option.keyGenerator(req)
        : req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip;
      if (!rawKey) return next();

      const redisKey = `${RATE_LIMIT_PREFIX}:${rawKey}`;
      if (!option.slidingWindow) {
        const count = await rateLimitService.increment(redisKey, windowMs);

        if (count > limit) {
          if (option.handler) {
            return option.handler(req, res);
          } else {
            return res.status(429).json({ message: 'Too many requests' });
          }
        }
      } else {
        const { allowed } = await rateLimitService.slidingWindowLua(
          redisKey,
          windowMs,
          limit
        );

        if (!allowed) {
          if (option.handler) {
            return option.handler(req, res);
          } else {
            return res.status(429).json({ message: 'Too many requests' });
          }
        }
      }
      return next();
    } catch (err) {
      console.error('Rate limit error:', err);
      return next();
    }
  };
};
