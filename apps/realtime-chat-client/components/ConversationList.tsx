"use client";

import { Conversation } from "@/lib/types";
import { useSocket } from "@/context/SocketContext";

interface Props {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
}: Props) {
  const { userId } = useSocket();

  const getTitle = (conv: Conversation) => {
    if (conv.type === "GROUP") return conv.name;

    const other = conv.participants.find(
      (p) => p.id !== userId
    );

    return other?.name;
  };

  return (
    <div className="flex-1 overflow-y-auto">

      {conversations.map((conv) => {

        const title = getTitle(conv);

        return (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-800 ${
              activeId === conv.id
                ? "bg-gray-800"
                : "hover:bg-gray-900"
            }`}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold">
              {title?.charAt(0).toUpperCase()}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">

              <div className="flex justify-between">
                <span className="text-sm font-medium truncate">
                  {title}
                </span>

                {conv.lastMessage && (
                  <span className="text-xs text-gray-400">
                    {new Date(
                      conv.lastMessage.createdAt
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              {conv.lastMessage && (
                <p className="text-xs text-gray-400 truncate">
                  {conv.lastMessage.content}
                </p>
              )}

            </div>

            {conv.unreadCount > 0 && (
              <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full">
                {conv.unreadCount}
              </span>
            )}

          </div>
        );
      })}
    </div>
  );
}