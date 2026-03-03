import { FastifyInstance } from "fastify";
import { getMessagesHandler } from "./messages.controller";


export async function messageRoutes(app: FastifyInstance) {
    app.get(
        "/conversations/:conversationId/messages",
        { preHandler: [app.authenticate] },
        getMessagesHandler
    );
}