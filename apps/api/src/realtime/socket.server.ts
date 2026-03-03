import { Server } from "socket.io";
import { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "@config/env";
import { registerSocketEvents } from "./socket.events";
import { registerConnection } from "./socket.registry";
import { markUserOnline, markUserOffline, isUserOnline } from "./presence.service";
import { prisma } from "@database/client";
import { createAdapter } from "@socket.io/redis-adapter";
import { redis, pubClient, subClient } from "../infra/redis";

export function setupSocketServer(app: FastifyInstance) {
    const io = new Server(app.server, {
        cors: {
            origin: true,
            credentials: true
        }
    });

    // Attach Redis adapter
    io.adapter(createAdapter(pubClient, subClient));

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

    io.on("connection", async (socket) => {
        const userId = socket.data.userId;

        // registerConnection(userId, socket);
        // 🔥 Send identity to client
        socket.emit("authenticated", {
            userId
        });

        // Personal room
        socket.join(`user:${userId}`);

        const count = await markUserOnline(userId);

        if (count === 1) {
            io.emit("presence_update", {
                userId,
                status: "ONLINE"
            });
        }

        registerSocketEvents(io, socket);

        const interval = setInterval(() => {
            redis.expire(`presence:user:${userId}`, 60);
        }, 30000);

        socket.on("disconnect", async () => {
            clearInterval(interval);

            const remaining = await markUserOffline(userId);

            if (remaining === 0) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { lastSeen: new Date() }
                });

                io.emit("presence_update", {
                    userId,
                    status: "OFFLINE",
                    lastSeen: new Date()
                });
            }
        });
    });

    return io;
}