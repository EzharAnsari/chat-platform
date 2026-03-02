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

    socket.on("send_message", async (data, callback?: Function) => {
        try {
            const { conversationId, content } = data;
            const senderId = socket.data.userId;

            // Validate membership
            const member = await prisma.conversationMember.findFirst({
                where: { conversationId, userId: senderId }
            });

            if (!member) {
                if (callback) callback({ error: "Not part of conversation" });
                return
            }

            // Save message
            const message = await prisma.message.create({
                data: {
                    conversationId,
                    senderId,
                    content
                }
            });

            // Emit to conversation room
            io.to(`conversation:${conversationId}`).emit("new_message", message);

            if (callback) callback({ success: true });
        } catch (err) {
            if (callback) callback({ error: "Message failed" });
        }
    });
}