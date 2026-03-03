import { prisma } from "@database/client";

export async function ensureConversationMember(
  conversationId: string,
  userId: string
) {
  const member = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId
      }
    }
  });

  if (!member) {
    throw new Error("Forbidden: Not a conversation member");
  }

  return member;
}