import { FastifyInstance } from "fastify";
import { getConversationsHandler } from "./conversations.controller";

export async function conversationRoutes(app: FastifyInstance) {
  app.get(
    "/conversations",
    { preHandler: [app.authenticate] },
    getConversationsHandler
  );
}