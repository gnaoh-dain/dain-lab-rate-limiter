import { Request, Response } from 'express';

export interface RateLimiterOptions {
  windowMs?: number;
  limit?: number;

  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;

  handler?: (
    req: Request,
    res: Response,
    ctx: { limit: number; remaining: number; retryAfter?: number }
  ) => void;
  slidingWindow?: boolean;
}
