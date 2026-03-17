import { Queue } from "bullmq"
import { redis, redisConnection } from "../../redis"

export const virusQueue = new Queue("virus-scan", {
  connection: redis
})

export async function enqueueVirusScan(data: {
  attachmentId: string
  key: string
}) {
  console.log("virus task added");
  await virusQueue.add("scan-file", data)
}