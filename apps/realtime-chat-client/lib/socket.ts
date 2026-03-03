import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(WS_URL, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  });

  return socket;
}

export function getSocket(): Socket {
  if (!socket) {
    throw new Error("Socket not initialized");
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}