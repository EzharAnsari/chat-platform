import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../../infra/storage/s3";
import { randomUUID } from "crypto";

export async function generateUploadUrl(fileType: string) {
  const key = `attachments/${randomUUID()}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: fileType
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 300
  });

  const fileUrl = `${process.env.S3_PUBLIC_URL}/${key}`;

  return {
    uploadUrl,
    fileUrl,
    key
  };
}