import { Socket } from "socket.io";

const userConnections = new Map<string, Set<Socket>>();

export function registerConnection(userId: string, socket: Socket) {
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }

  userConnections.get(userId)!.add(socket);

  socket.on("disconnect", () => {
    userConnections.get(userId)?.delete(socket);

    if (userConnections.get(userId)?.size === 0) {
      userConnections.delete(userId);
    }
  });
}

export function getUserSockets(userId: string) {
  return userConnections.get(userId);
}