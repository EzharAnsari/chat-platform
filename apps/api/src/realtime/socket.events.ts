import { Server, Socket } from "socket.io";
import { prisma } from "@database/client";
import { ensureConversationMember } from "../modules/conversations/conversation.service";


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

            await ensureConversationMember(conversationId, senderId);

            if (!clientMessageId) {
                return callback({ error: "clientMessageId required" });
            }

            const members = await prisma.conversationMember.findMany({
                where: { conversationId }
            });

            if (!members) {
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
                        receipts: {
                            create: members
                                .filter(m => m.userId !== senderId)
                                .map(m => ({
                                    userId: m.userId,
                                    status: "DELIVERED"
                                }))
                        }
                    },
                    include: {
                        receipts: true
                    }
                });

                await prisma.conversation.update({
                    where: { id: conversationId },
                    data: { updatedAt: new Date() }
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
        const userId = socket.data.userId;

        await prisma.messageReceipt.updateMany({
            where: {
                messageId,
                userId
            },
            data: {
                status: "DELIVERED"
            }
        });

        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        io.to(`conversation:${message?.conversationId}`)
            .emit("receipt_updated", {
                messageId,
                userId,
                status: "DELIVERED"
            });
    });

    socket.on("message_read", async ({ messageId }) => {
        const userId = socket.data.userId;

        const receipt = await prisma.messageReceipt.updateMany({
            where: {
                messageId,
                userId
            },
            data: {
                status: "READ"
            }
        });

        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        io.to(`conversation:${message?.conversationId}`)
            .emit("receipt_updated", {
                messageId,
                userId,
                status: "READ"
            });
    });
}