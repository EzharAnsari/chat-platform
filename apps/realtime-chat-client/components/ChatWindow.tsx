"use client";

import { useRef, useEffect, useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { useSocket } from "@/context/SocketContext";

interface Props {
  conversationId: string;
}

export default function ChatWindow({ conversationId }: Props) {
  const { socket, userId } = useSocket();

  const { messages, setMessages, fetchMessages, hasMore } =
    useMessages(conversationId);

  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  /* ---------------- SCROLL RETENTION ---------------- */

  const loadOlderMessages = async () => {
    if (!hasMore || loadingMore) return;

    const container = containerRef.current;
    if (!container) return;

    const previousHeight = container.scrollHeight;

    setLoadingMore(true);
    await fetchMessages();
    setLoadingMore(false);

    requestAnimationFrame(() => {
      const newHeight = container.scrollHeight;
      container.scrollTop += newHeight - previousHeight;
    });
  };

  /* Infinite scroll trigger */

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop <= 50) {
        loadOlderMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () =>
      container.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore]);

  /* Auto scroll to bottom for new messages */

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages.length]);

  /* ---------------- SEND MESSAGE ---------------- */

  const sendMessage = (
    content: string,
    attachments: any[] = []
  ) => {
    if (!socket || !userId) return;

    const clientMessageId = crypto.randomUUID();

    const optimisticMessage = {
      id: clientMessageId,
      conversationId,
      senderId: userId,
      content,
      attachments,
      clientMessageId,
      createdAt: new Date().toISOString(),
      receipts: [],
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    socket.emit(
      "send_message",
      {
        conversationId,
        content,
        attachments,
        clientMessageId,
      },
      (response: any) => {
        if (!response.success) {
          setMessages((prev) =>
            prev.filter(
              (m) => m.clientMessageId !== clientMessageId
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.clientMessageId === clientMessageId
                ? response.message
                : m
            )
          );
        }
      }
    );
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="h-16 border-b border-gray-800 flex items-center px-6 bg-gray-950">
        <span className="font-semibold text-sm">
          Conversation
        </span>
      </div>

      {/* Messages */}

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Chat Input */}

      <ChatInput
        conversationId={conversationId}
        socket={socket}
        onSend={sendMessage}
      />

    </div>
  );
}