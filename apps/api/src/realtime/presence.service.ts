const onlineUsers = new Map<string, number>();
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
}