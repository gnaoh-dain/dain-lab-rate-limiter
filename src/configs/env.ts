import dotenv from 'dotenv';

dotenv.config();

const env = {
  PORT: process.env.PORT || '3000',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
};

export default env;
