import { Server, Socket } from "socket.io";

export function registerSocketEvents(io: Server, socket: Socket) {
  socket.on("ping", () => {
    socket.emit("pong", { message: "connected" });
  });
}