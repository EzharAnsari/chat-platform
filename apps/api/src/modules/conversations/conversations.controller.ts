import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@database/client";

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