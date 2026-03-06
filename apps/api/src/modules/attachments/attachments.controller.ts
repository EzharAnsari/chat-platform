import { FastifyRequest, FastifyReply } from "fastify";
import { generateUploadUrl } from "./attachments.service";

export async function getUploadUrlHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { mimeType } = request.body as {
    mimeType: string;
  };

  const result = await generateUploadUrl(mimeType);

  return reply.send(result);
}