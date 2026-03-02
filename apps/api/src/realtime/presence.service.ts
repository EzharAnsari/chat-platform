/*const onlineUsers = new Map<string, number>();
// userId -> active connection count

export function markUserOnline(userId: string) {
  const current = onlineUsers.get(userId) || 0;
  onlineUsers.set(userId, current + 1);
}

export function markUserOffline(userId: string) {
  const current = onlineUsers.get(userId);

  if (!current) return;

  if (current === 1) {
    onlineUsers.delete(userId);
  } else {
    onlineUsers.set(userId, current - 1);
  }
}

export function isUserOnline(userId: string) {
  return onlineUsers.has(userId);
}

export function getOnlineUsers() {
  return Array.from(onlineUsers.keys());
}*/

import { redis } from "../infra/redis";

const PRESENCE_PREFIX = "presence:user:";
const PRESENCE_TTL = 60; // seconds

function key(userId: string) {
  return `${PRESENCE_PREFIX}${userId}`;
}

export async function markUserOnline(userId: string) {
  const count = await redis.incr(key(userId));
  await redis.expire(key(userId), PRESENCE_TTL);
  return count;
}

export async function markUserOffline(userId: string) {
  const count = await redis.decr(key(userId));

  if (count <= 0) {
    await redis.del(key(userId));
    return 0;
  }

  return count;
}

export async function isUserOnline(userId: string) {
  const exists = await redis.exists(key(userId));
  return exists === 1;
}
