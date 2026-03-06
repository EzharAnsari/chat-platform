import { Queue } from "bullmq";
import { redisConnection } from "../../redis";
import { MediaJobData } from "./media.job";

export const mediaQueue = new Queue("media-processing", {
  connection: redisConnection
});

export async function enqueueMediaJob(data: MediaJobData) {
  await mediaQueue.add("generate-thumbnail", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000
    }
  });
}