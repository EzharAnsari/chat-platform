import { z } from "zod";

export const createConversationSchema = z.object({
  type: z.enum(["DIRECT", "GROUP"]),
  participantIds: z.array(z.string().uuid()).min(1),
  name: z.string().optional()
});