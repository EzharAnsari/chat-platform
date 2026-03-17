import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@database/client";
import { randomUUID } from "crypto";
import { s3 } from "../../infra/storage/s3";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getUploadUrlHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { mimeType } = request.body as {
    mimeType: string;
  };

  const key = `attachments/${randomUUID()}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: mimeType
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 300
  });

  const fileUrl = `${process.env.S3_PUBLIC_URL}/${process.env.S3_BUCKET}/${key}`;

  return reply.send({
    uploadUrl,
    fileUrl,
    key
  });
}

export async function createAttachmentHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { fileName, mimeType, size } = request.body as {
    fileName: string;
    mimeType: string;
    size: number;
  };

  const key = `attachments/${randomUUID()}`

  const attachment = await prisma.attachment.create({
    data: {
      url: key,  // TODO -> need to fix
      fileName,
      mimeType,
      size,
      key: key
    }
  })

  return reply.send({
    attachmentId: attachment.id,
    uploadUrl: `/upload/${key}`,
    fileUrl: `/files/${key}`
  })
}

export async function uploadAttachmentHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { key } = request.params as { key: string }

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: request.raw,
      ContentType: request.headers["content-type"]
    })
  )

  reply.send({ success: true })
}

export async function downloadAttachmentHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { key } = request.params as { key: string }

  const object = await s3.send(
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key
    })
  )

  reply.header("Content-Type", object.ContentType || "application/octet-stream")

  return reply.send(object.Body)
}