import { createClient } from 'redis';

// Global is used here to maintain a cached connection across hot reloads in development
const globalForRedis = global as unknown as {
  redis: ReturnType<typeof createClient> | undefined;
};

export async function getRedisClient() {
  if (!globalForRedis.redis) {
    globalForRedis.redis = createClient({
      url: process.env.REDIS_URL
    });

    // Handle errors to prevent unhandled promise rejections
    globalForRedis.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    await globalForRedis.redis.connect();
  }

  return globalForRedis.redis;
} 