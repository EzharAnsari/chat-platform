import Redis from "ioredis";

export const redis = new Redis({
  host: "localhost",
  port: 6379
});

// For Socket.io adapter
export const pubClient = new Redis({
  host: "localhost",
  port: 6379
});

export const subClient = pubClient.duplicate();

export const redisConnection = {
  host: "localhost",
  port: 6379
};
