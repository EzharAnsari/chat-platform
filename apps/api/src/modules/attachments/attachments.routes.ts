import { FastifyInstance } from "fastify";
import { getUploadUrlHandler } from "./attachments.controller";

export async function attachmentRoutes(app: FastifyInstance) {
  app.post(
    "/attachments/upload-url",
    { preHandler: [app.authenticate] },
    getUploadUrlHandler
  );
}