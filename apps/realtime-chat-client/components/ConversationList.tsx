"use client";

import { Conversation } from "@/lib/types";

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
  return (
    <div className="h-full overflow-y-auto border-r border-border">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`p-4 cursor-pointer hover:bg-gray-800 transition ${
            activeId === conv.id ? "bg-gray-800" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {conv.id}
            </span>

            {conv.unreadCount > 0 && (
              <span className="bg-primary text-xs px-2 py-0.5 rounded-full">
                {conv.unreadCount}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-400 truncate mt-1">
            {conv.lastMessage?.content}
          </p>
        </div>
      ))}
    </div>
  );
}