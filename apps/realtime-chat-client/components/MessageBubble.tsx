"use client";

import { Message } from "@/lib/types";
import { useSocket } from "@/context/SocketContext";

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const { userId } = useSocket();

  const isOwn = message.senderId === userId;

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-4 py-2 rounded-xl max-w-md text-sm ${
          isOwn
            ? "bg-blue-600 text-white"
            : "bg-gray-700 text-gray-200"
        }`}
      >
        <p>{message.content}</p>

        <div className="text-[10px] mt-1 opacity-70 text-right">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}