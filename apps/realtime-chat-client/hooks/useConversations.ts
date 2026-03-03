"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Conversation } from "@/lib/types";
import { useSocket } from "@/context/SocketContext";

export function useConversations() {
  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);
  const { socket } = useSocket();

  const fetchConversations = useCallback(async () => {
    const data = await api.get("/conversations");

    const sorted = data.sort(
      (a: Conversation, b: Conversation) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    );

    setConversations(sorted);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  /* --- new_message update preview --- */

  useEffect(() => {
    if (!socket) return;

    socket.on("new_message", (message) => {
      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv.id === message.conversationId
            ? {
                ...conv,
                lastMessage: {
                  id: message.id,
                  content: message.content,
                  createdAt: message.createdAt,
                },
                updatedAt: message.createdAt,
                unreadCount: conv.unreadCount + 1,
              }
            : conv
        );

        return updated.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
        );
      });
    });

    return () => {
      socket.off("new_message");
    };
  }, [socket]);

  return { conversations, fetchConversations };
}