import express from 'express';
import { rateLimit } from '../modules/rate-limit/rateLimit.middleware';
import rateLimitHandler from '../middlewares/errorHandler';

const router = express.Router();

router.get('/', rateLimit({ skip: (req) => req.path === '/' }), (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

router.get(
  '/public',
  rateLimit({
    limit: 100,
    windowMs: 60 * 1000, // 1 minute,
    keyGenerator: (req) => `${req.ip}:${req.path}`,
    slidingWindow: true,
    handler: (req, res, ctx) => {
      if (req.path === '/public') {
        return res.status(429).json({
          message: 'Public endpoint rate limit exceeded',
        });
      }
      return rateLimitHandler(req, res, ctx);
    },
  }),
  (req, res) => {
    return res
      .status(200)
      .json({ message: 'This is a public endpoint with rate limiting' });
  }
);

router.get(
  '/user/profile',
  rateLimit({
    limit: 100,
    windowMs: 60 * 1000, // 1 minute,
    keyGenerator: (req) => `${req.ip}:${req.path}`,
    slidingWindow: true,
    handler: (req, res, ctx) => rateLimitHandler(req, res, ctx),
  }),
  (req, res) => {
    return res
      .status(200)
      .json({ message: 'This is a user profile endpoint with rate limiting' });
  }
);

export default router;
