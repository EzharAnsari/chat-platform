"use client";

import { useEffect, useState, useCallback } from "react";
import { Message } from "@/lib/types";
import { api } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";

function sortMessages(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => {
    const timeDiff =
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime();

    if (timeDiff !== 0) return timeDiff;

    // fallback if same timestamp
    return a.id.localeCompare(b.id);
  });
}

export function useMessages(conversationId: string) {
  const [messages, setMessagesState] = useState<Message[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const { socket, userId } = useSocket();

  /* ---------- SAFE SETTER (always sorted) ---------- */

  const setMessages = (
    updater: (prev: Message[]) => Message[]
  ) => {
    setMessagesState((prev) =>
      sortMessages(updater(prev))
    );
  };

  /* ---------- FETCH PAGINATION ---------- */

  const fetchMessages = useCallback(async () => {
    if (!hasMore) return;

    const res = await api.get(
      `/conversations/${conversationId}/messages?cursor=${cursor ?? ""}`
    );

    setMessages((prev) => {
      // Merge older messages safely
      const merged = [...res.messages, ...prev];

      // Remove duplicates by id
      const unique = Array.from(
        new Map(merged.map((m) => [m.id, m])).values()
      );

      return unique;
    });

    setCursor(res.nextCursor);
    setHasMore(!!res.nextCursor);
  }, [conversationId, cursor, hasMore]);

  /* ---------- RESET ON CONVERSATION CHANGE ---------- */

  useEffect(() => {
    setMessagesState([]);
    setCursor(null);
    setHasMore(true);
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  /* ---------- JOIN ROOM ---------- */

  useEffect(() => {
    if (!socket) return;
    socket.emit("join_conversation", { conversationId });
  }, [socket, conversationId]);

  /* ---------- NEW MESSAGE ---------- */

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (serverMessage: Message) => {
      if (serverMessage.conversationId !== conversationId) return;

      setMessages((prev) => {
        // If already exists → ignore
        if (prev.some((m) => m.id === serverMessage.id)) {
          return prev;
        }

        // Replace optimistic
        const optimisticIndex = prev.findIndex(
          (m) =>
            m.clientMessageId &&
            m.clientMessageId === serverMessage.clientMessageId
        );

        if (optimisticIndex !== -1) {
          const updated = [...prev];
          updated[optimisticIndex] = serverMessage;
          return updated;
        }

        return [...prev, serverMessage];
      });

      if (serverMessage.senderId !== userId) {
        socket.emit("message_delivered", {
          messageId: serverMessage.id,
        });
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, conversationId, userId]);

  /* ---------- RECEIPT UPDATED ---------- */

  useEffect(() => {
    if (!socket) return;

    const handleReceiptUpdate = ({
      messageId,
      userId,
      status,
    }: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                receipts: msg.receipts.map((r) =>
                  r.userId === userId
                    ? { ...r, status }
                    : r
                ),
              }
            : msg
        )
      );
    };

    socket.on("receipt_updated", handleReceiptUpdate);

    return () => {
      socket.off("receipt_updated", handleReceiptUpdate);
    };
  }, [socket]);

  return {
    messages,
    setMessages,
    fetchMessages,
    hasMore,
  };
}