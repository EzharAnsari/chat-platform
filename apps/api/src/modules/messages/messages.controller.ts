import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@database/client";
import { Buffer } from "buffer";
import { ensureConversationMember } from "../conversations/conversation.service";

function encodeCursor(createdAt: Date, id: string) {
  return Buffer.from(
    JSON.stringify({ createdAt, id })
  ).toString("base64");
}

function decodeCursor(cursor: string) {
  return JSON.parse(
    Buffer.from(cursor, "base64").toString("utf8")
  );
}

export async function getMessagesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = (request.user as any).userId;

  const { conversationId } = request.params as {
    conversationId: string;
  };

  const { cursor, limit = "20" } = request.query as {
    cursor?: string;
    limit?: string;
  };

  await ensureConversationMember(conversationId, userId);

  const take = Math.min(parseInt(limit), 50);

  let paginationFilter = {};

  if (cursor) {
    const decoded = decodeCursor(cursor);

    paginationFilter = {
      OR: [
        {
          createdAt: {
            lt: new Date(decoded.createdAt)
          }
        },
        {
          createdAt: new Date(decoded.createdAt),
          id: {
            lt: decoded.id
          }
        }
      ]
    };
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...paginationFilter
    },
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" }
    ],
    take,
    include: {
      receipts: true
    }
  });

  const nextCursor =
    messages.length > 0
      ? encodeCursor(
        messages[messages.length - 1].createdAt,
        messages[messages.length - 1].id
      )
      : null;

  return reply.send({
    messages,
    nextCursor
  });
}