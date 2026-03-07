import Redis from "ioredis";

const redisHost = process.env.REDIS_HOST

export const redis = new Redis({
  host: redisHost,
  port: 6379
});

// For Socket.io adapter
export const pubClient = new Redis({
  host: redisHost,
  port: 6379
});

export const subClient = pubClient.duplicate();

export const redisConnection = {
  host: redisHost,
  port: 6379
};
