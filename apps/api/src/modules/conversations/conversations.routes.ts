import { FastifyInstance } from "fastify";
import { getConversationsHandler, createConversationHandler } from "./conversations.controller";

export async function conversationRoutes(app: FastifyInstance) {
  app.get(
    "/conversations",
    { preHandler: [app.authenticate] },
    getConversationsHandler
  );

  app.post(
    "/conversations",
    { preHandler: [app.authenticate] },
    createConversationHandler
  );
}