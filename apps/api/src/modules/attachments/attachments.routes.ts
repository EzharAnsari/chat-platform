import { FastifyInstance } from "fastify";
import { createAttachmentHandler, downloadAttachmentHandler, getUploadUrlHandler, uploadAttachmentHandler } from "./attachments.controller";

export async function attachmentRoutes(app: FastifyInstance) {
  app.post(
    "/attachments/upload-url",
    { preHandler: [app.authenticate] },
    getUploadUrlHandler
  );

  app.post(
    "/attachments",
    { preHandler: [app.authenticate] },
    createAttachmentHandler
  );

  app.put("/upload/attachments/:key", uploadAttachmentHandler)

  app.get("/files/attachments/:key", { preHandler: [app.authenticate] }, downloadAttachmentHandler)
}