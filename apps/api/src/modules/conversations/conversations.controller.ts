import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@database/client";
import { createConversationSchema } from "./conversations.schema";

export async function getConversationsHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const userId = request.user.userId;

    const conversations = await prisma.conversation.findMany({
        where: {
            members: {
                some: {
                    userId
                }
            }
        },
        orderBy: {
            updatedAt: "desc"
        },
        include: {
            members: {
                select: {
                    userId: true
                }
            },
            messages: {
                orderBy: {
                    createdAt: "desc"
                },
                take: 1,
                include: {
                    receipts: true
                }
            }
        }
    });

    const result = await Promise.all(
        conversations.map(async (conversation) => {
            // Unread count
            const unreadCount = await prisma.messageReceipt.count({
                where: {
                    userId,
                    status: {
                        not: "READ"
                    },
                    message: {
                        conversationId: conversation.id
                    }
                }
            });

            // Single aggregation query
            /*const unreadCount = await prisma.messageReceipt.groupBy({
                by: ["messageId"],
                where: {
                    userId,
                    status: { not: "READ" }
                },
                _count: true
            });*/

            return {
                id: conversation.id,
                participants: conversation.members.map(m => m.userId),
                lastMessage: conversation.messages[0] || null,
                unreadCount,
                updatedAt: conversation.updatedAt
            };
        })
    );

    return reply.send(result);
}

export async function createConversationHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const userId = (request.user as any).userId;

    const { type, participantIds, name } = createConversationSchema.parse(request.body);

    if (!participantIds || participantIds.length === 0) {
        return reply.status(400).send({ message: "Participants required" });
    }

    // Always include creator
    const uniqueParticipants = Array.from(
        new Set([...participantIds, userId])
    );

    if (type === "DIRECT") {
        if (uniqueParticipants.length !== 2) {
            return reply
                .status(400)
                .send({ message: "Direct conversation must have 2 participants" });
        }

        // Check if direct conversation already exists
        const existing = await prisma.conversation.findMany({
            where: {
                type: "DIRECT",
                members: {
                    some: { userId }
                }
            },
            include: { members: true }
        });

        const direct = existing.find(c =>
            c.members.length === 2 &&
            c.members.some(m => m.userId === participantIds[0])
        );

        if (direct) return reply.send(direct);
    }

    // Create conversation
    const conversation = await prisma.conversation.create({
        data: {
            type,
            name: type === "GROUP" ? name : null,
            createdBy: userId,
            members: {
                create: uniqueParticipants.map((id) => ({
                    userId: id,
                    role: id === userId ? "ADMIN" : "MEMBER"
                }))
            }
        },
        include: {
            members: true
        }
    });

    return reply.status(201).send(conversation);
}
