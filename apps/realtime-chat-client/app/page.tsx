"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import ConversationList from "@/components/ConversationList";
import ChatWindow from "@/components/ChatWindow";
import CreateConversationModal from "@/components/CreateConversationModal";

export default function HomePage() {
  const { user, logout } = useAuth();
  const { conversations, fetchConversations } = useConversations();

  const [activeConversation, setActiveConversation] =
    useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  return (
    <div className="h-screen flex bg-gray-950 text-white">

      {/* Sidebar */}
      <div className="w-[380px] lg:w-[420px] bg-gray-950 border-r border-gray-800 flex flex-col">

        {/* User header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <span className="text-sm text-gray-300 truncate">
            {user?.email}
          </span>

          <div className="flex gap-2">

            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 px-3 py-1 text-xs rounded"
            >
              New
            </button>

            <button
              onClick={logout}
              className="bg-red-500 px-3 py-1 text-xs rounded"
            >
              Logout
            </button>

          </div>
        </div>

        {/* Conversations */}
        <ConversationList
          conversations={conversations}
          activeId={activeConversation || undefined}
          onSelect={setActiveConversation}
        />
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        <CreateConversationModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={(id) => {
            fetchConversations();        // refresh sidebar
            setActiveConversation(id);   // open new chat
            setShowCreateModal(false);   // close modal
          }}
        />

        {activeConversation ? (
          <ChatWindow conversationId={activeConversation} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}