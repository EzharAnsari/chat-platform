import { Queue } from "bullmq";
import { redisConnection } from "../../redis";
import { NotificationJobData } from "./notification.job";

export const notificationQueue = new Queue<NotificationJobData>(
  "notification-queue",
  {
    connection: redisConnection
  }
);

export async function enqueueNotification(data: NotificationJobData) {
  await notificationQueue.add("send-notification", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  });
}
