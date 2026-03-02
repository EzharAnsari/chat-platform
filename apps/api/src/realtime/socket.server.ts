import { Server } from "socket.io";
import { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "@config/env";
import { registerSocketEvents } from "./socket.events";
import { registerConnection } from "./socket.registry";

export function setupSocketServer(app: FastifyInstance) {
  const io = new Server(app.server, {
    cors: {
      origin: true,
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        userId: string;
      };

      socket.data.userId = payload.userId;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    registerConnection(userId, socket);

    // Personal room
    socket.join(`user:${userId}`);

    registerSocketEvents(io, socket);

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
}