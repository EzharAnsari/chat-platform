import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@database/client";

export async function getCurrentUserHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = (request.user as any).userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      lastSeen: true
    }
  });

  if (!user) {
    return reply.status(404).send({
      success: false,
      message: "User not found"
    });
  }

  return reply.send({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    lastSeen: user.lastSeen
  });
}