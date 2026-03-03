import { FastifyInstance } from "fastify";
import { getCurrentUserHandler } from "./users.controller";

export async function userRoutes(app: FastifyInstance) {
  app.get(
    "/me",
    { preHandler: [app.authenticate] },
    getCurrentUserHandler
  );
}