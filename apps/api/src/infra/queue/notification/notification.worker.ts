import { Worker } from "bullmq";
import { redisConnection } from "../../redis";
import { NotificationJobData } from "./notification.job";
import { prisma } from "@database/client";

export const notificationWorker = new Worker<NotificationJobData>(
  "notification-queue",
  async (job) => {
    const { userId, messageId, conversationId } = job.data;

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return;
    }

    console.log("🔔 Simulated push notification", {
      userId,
      conversationId,
      content: message.content
    });

    /**
     * Future integrations:
     * - Firebase push notifications
     * - Email notifications
     * - Mobile push
     */
  },
  {
    connection: redisConnection
  }
);
