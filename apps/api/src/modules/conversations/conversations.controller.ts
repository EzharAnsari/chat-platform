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
                some: { userId }
            }
        },
        orderBy: {
            updatedAt: "desc"
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
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

    // Fetch unread counts for all conversations in ONE query
    const unreadCounts = await prisma.messageReceipt.groupBy({
        by: ["messageId"],
        where: {
            userId,
            status: { not: "READ" }
        },
        _count: true
    });

    // Map messageId → unread
    const unreadMap = new Map<string, number>();
    unreadCounts.forEach((r:any) => {
        unreadMap.set(r.messageId, r._count);
    });

    const result = conversations.map((conversation:any) => {
        const lastMessage = conversation.messages[0] || null;

        const unreadCount = lastMessage
            ? unreadMap.get(lastMessage.id) || 0
            : 0;

        return {
            id: conversation.id,
            type: conversation.type,
            name: conversation.name,

            participants: conversation.members.map((m:any) => ({
                id: m.user.id,
                name: m.user.name,
                email: m.user.email
            })),

            lastMessage,
            unreadCount,
            updatedAt: conversation.updatedAt
        };
    });

    return reply.send(result);
}

export async function createConversationHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = (request.user as any).userId;

  const { type, participantEmails, name } =
    createConversationSchema.parse(request.body);

  if (!participantEmails || participantEmails.length === 0) {
    return reply.status(400).send({ message: "Participants required" });
  }

  // Find users by email
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: participantEmails
      }
    },
    select: {
      id: true,
      email: true
    }
  });

  if (users.length !== participantEmails.length) {
    return reply
      .status(400)
      .send({ message: "One or more users not found" });
  }

  const participantIds = users.map((u:any) => u.id);

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

    const otherUserId = participantIds[0];

    // Check if direct conversation already exists
    const existing = await prisma.conversation.findMany({
      where: {
        type: "DIRECT",
        members: {
          some: { userId }
        }
      },
      include: {
        members: true
      }
    });

    const direct = existing.find(
      (c:any) =>
        c.members.length === 2 &&
        c.members.some((m:any) => m.userId === otherUserId)
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
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  });

  return reply.status(201).send(conversation);
}
