import { prisma } from "@database/client";
import { AppError } from "../../common/errors/app-error";

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
    throw new AppError("Forbidden", 403);
  }

  return member;
}