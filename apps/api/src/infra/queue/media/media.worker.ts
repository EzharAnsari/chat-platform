import { Worker } from "bullmq";
import sharp from "sharp";
import { prisma } from "@database/client";
import { s3 } from "../../storage/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import fetch from "node-fetch";
import { randomUUID } from "crypto";
import { redisConnection } from "../../redis";

export const mediaWorker = new Worker(
  "media-processing",
  async (job) => {
    const { attachmentId, url } = job.data;

    // download image
    const response = await fetch(url);
    const buffer = await response.buffer();

    // generate thumbnail
    const thumbnail = await sharp(buffer)
      .resize(300)
      .jpeg({ quality: 80 })
      .toBuffer();

    const key = `thumbnails/${randomUUID()}.jpg`;

    // upload thumbnail to MinIO
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: thumbnail,
        ContentType: "image/jpeg"
      })
    );

    const thumbnailUrl = `${process.env.S3_PUBLIC_URL}/${process.env.S3_BUCKET}/${key}`;

    // update database
    await prisma.attachment.update({
      where: { id: attachmentId },
      data: { thumbnailUrl }
    });

    console.log("Thumbnail generated:", thumbnailUrl);
  },
  { connection: redisConnection }
);