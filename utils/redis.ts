import { createClient } from 'redis';

// Global is used here to maintain a cached connection across hot reloads in development
const globalForRedis = global as unknown as {
  redis: ReturnType<typeof createClient> | undefined;
};

export async function getRedisClient() {
  if (!globalForRedis.redis) {
    console.log('Creating new Redis client with URL:', process.env.REDIS_URL);
    
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    globalForRedis.redis = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          console.log('Redis reconnection attempt:', retries);
          return Math.min(retries * 100, 3000);
        },
        connectTimeout: 10000, // 10 seconds
        keepAlive: 10000 // 10 seconds
      }
    });

    // Handle errors to prevent unhandled promise rejections
    globalForRedis.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    globalForRedis.redis.on('connect', () => {
      console.log('Redis client connected');
    });

    globalForRedis.redis.on('ready', () => {
      console.log('Redis client ready');
    });

    globalForRedis.redis.on('end', () => {
      console.log('Redis client connection ended');
    });

    // Connect to Redis
    try {
      await globalForRedis.redis.connect();
      console.log('Redis connection established');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  return globalForRedis.redis;
}