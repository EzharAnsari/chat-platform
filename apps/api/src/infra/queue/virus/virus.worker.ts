import { Worker } from "bullmq"
import { redis } from "../../redis"
import NodeClam from "clamscan"
import { prisma } from "@database/client"
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { s3 } from "../../storage/s3"
import { Readable } from "stream"

// const clamscan = await new NodeClam().init({
//   clamdscan: {
//     host: process.env.CLAMSCAN_HOST,
//     port: 3310
//   }
// })

let clamscan: any;

async function initClam() {
  clamscan = await new NodeClam().init({
    debugMode: false,
    clamdscan: {
      host: process.env.CLAMSCAN_HOST || '127.0.0.1',
      port: 3310,
      timeout: 60000
    }
  });


  new Worker(
    "virus-scan",
    async job => {
      const { attachmentId, key } = job.data

      // download file from storage
      const object = await s3.send(
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key
        })
      )

      const buffer = object.Body as Readable;

      console.log("Starting virus scan...");

      if (!buffer) return

      const result = await clamscan.scanStream(buffer)

      console.log("Scan result:", result);

      if (result.isInfected) {
        console.log("Virus detected:", result.viruses)

        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: key
          })
        )

        await prisma.attachment.update({
          where: { id: attachmentId },
          data: { status: "INFECTED" }
        })

        return
      }

      await prisma.attachment.update({
        where: { id: attachmentId },
        data: { status: "READY" }
      })

      console.log("File clean:", key)
    },
    { connection: redis }
  )
}

initClam();