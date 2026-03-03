"use client";

import { Message } from "@/lib/types";
import { useSocket } from "@/context/SocketContext";

interface Props {
  message: Message;
}

function computeMessageStatus(
  message: Message,
  currentUserId: string | null
): "SENT" | "DELIVERED" | "READ" | null {
  if (!currentUserId) return null;
  if (message.senderId !== currentUserId) return null;

  if (!message.receipts?.length) return "SENT";

  const hasRead = message.receipts.some(
    (r) => r.status === "READ"
  );

  if (hasRead) return "READ";

  return "DELIVERED";
}

export default function MessageBubble({ message }: Props) {
  const { userId } = useSocket();

  const isOwn = message.senderId === userId;
  const status = computeMessageStatus(message, userId);

  return (
    <div
      className={`flex w-full mb-3 ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`
          relative
          px-4 py-3
          rounded-2xl
          max-w-[70%]
          shadow-sm
          ${
            isOwn
              ? "bg-primary text-white rounded-br-md"
              : "bg-gray-800 text-gray-100 rounded-bl-md"
          }
        `}
      >
        {/* Message Content */}
        <p className="text-sm leading-relaxed break-words">
          {message.content}
        </p>

        {/* Time + Status (subtle) */}
        <div
          className={`mt-1 text-[10px] flex items-center gap-2 ${
            isOwn
              ? "justify-end text-gray-200/70"
              : "justify-start text-gray-400"
          }`}
        >
          <span>
            {new Date(message.createdAt).toLocaleTimeString(
              [],
              { hour: "2-digit", minute: "2-digit" }
            )}
          </span>

          {status && (
            <span className="uppercase tracking-wide">
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}