"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import ConversationList from "@/components/ConversationList";
import ChatWindow from "@/components/ChatWindow";

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { conversations } = useConversations();
  const [activeConversation, setActiveConversation] =
    useState<string>();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        Please login.
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-bg text-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div>
            <div className="font-semibold">
              {user?.email}
            </div>
          </div>
          <button
            onClick={logout}
            className="text-sm text-red-400"
          >
            Logout
          </button>
        </div>

        <ConversationList
          conversations={conversations}
          activeId={activeConversation}
          onSelect={setActiveConversation}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <ChatWindow
            conversationId={activeConversation}
          />
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-400">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}