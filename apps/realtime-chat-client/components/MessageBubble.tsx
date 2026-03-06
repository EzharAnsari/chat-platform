"use client";

import { Message } from "@/lib/types";
import { useSocket } from "@/context/SocketContext";

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const { userId } = useSocket();

  const isOwn = message.senderId === userId;

  const attachments = message.attachments || [];

  return (
    <div
      className={`flex w-full ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`
          max-w-[70%]
          px-3 py-2
          rounded-xl
          text-sm
          ${
            isOwn
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-200 border border-gray-700"
          }
        `}
      >
        {/* TEXT MESSAGE */}
        {message.content && (
          <p className="mb-1">{message.content}</p>
        )}

        {/* ATTACHMENTS */}
        {attachments.map((att: any, i: number) => {
          const isImage = att.mimeType.startsWith("image");

          if (isImage) {
            return (
              <a
                key={i}
                href={att.url}
                target="_blank"
                className="block mt-2"
              >
                <img
                  src={att.thumbnailUrl ? att.thumbnailUrl : att.url}
                  alt={att.fileName}
                  className="max-w-[260px] max-h-[260px] object-cover rounded-lg"
                />
              </a>
            );
          }

          return (
            <a
              key={i}
              href={att.url}
              target="_blank"
              className="
                flex items-center gap-2
                bg-gray-700
                px-3 py-2
                rounded-lg
                mt-2
                text-sm
              "
            >
              📄 {att.fileName}
            </a>
          );
        })}

        {/* TIMESTAMP */}
        <div className="text-[10px] opacity-70 mt-1 text-right">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}