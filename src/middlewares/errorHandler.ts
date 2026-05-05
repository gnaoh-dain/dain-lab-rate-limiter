import { Request, Response } from 'express';

type RateLimitHandler = (
  req: Request,
  res: Response,
  context: {
    limit: number;
    remaining: number;
    retryAfter?: number;
  }
) => Response;

const rateLimitHandler: RateLimitHandler = (req, res, ctx) => {
  res.setHeader('X-RateLimit-Limit', ctx.limit);
  res.setHeader('X-RateLimit-Remaining', ctx.remaining);

  if (ctx.retryAfter !== undefined) {
    res.setHeader('Retry-After', ctx.retryAfter);
  }

  return res.status(429).json({
    message: 'Too many requests',
    meta: {
      limit: ctx.limit,
      remaining: ctx.remaining,
      retryAfter: ctx.retryAfter,
    },
  });
};

export default rateLimitHandler;
