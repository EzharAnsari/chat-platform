import { Server, Socket } from "socket.io";
import { prisma } from "@database/client";


export function registerSocketEvents(io: Server, socket: Socket) {
    socket.on("ping", () => {
        socket.emit("pong", { message: "connected" });
    });

    socket.on("join_conversation", async ({ conversationId }) => {
        const room = `conversation:${conversationId}`;
        socket.join(room);

        console.log("User joined room:", room);
        console.log("Current rooms:", io.sockets.adapter.rooms);
    });

    socket.on("send_message", async (data, callback) => {
        try {
            const { conversationId, content, clientMessageId } = data;
            const senderId = socket.data.userId;

            if (!clientMessageId) {
                return callback({ error: "clientMessageId required" });
            }

            const member = await prisma.conversationMember.findFirst({
                where: { conversationId, userId: senderId }
            });

            if (!member) {
                return callback({ error: "Not part of conversation" });
            }

            let message;

            try {
                message = await prisma.message.create({
                    data: {
                        conversationId,
                        senderId,
                        content,
                        clientMessageId,
                        status: "SENT"
                    }
                });
            } catch (err: any) {
                // Unique constraint failed → duplicate
                message = await prisma.message.findFirst({
                    where: { conversationId, clientMessageId }
                });
            }

            io.to(`conversation:${conversationId}`).emit("new_message", message);

            callback({ success: true, message });

        } catch (err) {
            callback({ error: "Message failed" });
        }
    });

    socket.on("message_delivered", async ({ messageId }) => {
        const message = await prisma.message.update({
            where: { id: messageId },
            data: { status: "DELIVERED" }
        });

        io.to(`conversation:${message.conversationId}`)
            .emit("message_status_updated", {
                messageId,
                status: "DELIVERED"
            });
    });

    socket.on("message_read", async ({ messageId }) => {
        const message = await prisma.message.update({
            where: { id: messageId },
            data: { status: "READ" }
        });

        io.to(`conversation:${message.conversationId}`)
            .emit("message_status_updated", {
                messageId,
                status: "READ"
            });
    });
}