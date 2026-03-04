import { z } from "zod";

export const createConversationSchema = z.object({
  type: z.enum(["DIRECT", "GROUP"]),
  name: z.string().optional(),
  participantEmails: z.array(z.string().email())
});