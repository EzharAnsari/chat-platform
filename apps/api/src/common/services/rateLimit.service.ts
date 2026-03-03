import { redis } from "../../infra/redis";

const WINDOW = 10; // seconds
const MAX_MESSAGES = 20;

function key(userId: string) {
  return `rate:message:${userId}`;
}

export async function checkMessageRateLimit(userId: string) {
  const current = await redis.incr(key(userId));

  if (current === 1) {
    await redis.expire(key(userId), WINDOW);
  }

  if (current > MAX_MESSAGES) {
    return false;
  }

  return true;
}