"use client";

import { useRef, useEffect, useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import MessageBubble from "./MessageBubble";
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

  const sendMessage = (content: string) => {
    if (!socket || !userId) return;

    const clientMessageId = crypto.randomUUID();

    const optimisticMessage = {
      id: clientMessageId,
      conversationId,
      senderId: userId,
      content,
      clientMessageId,
      createdAt: new Date().toISOString(),
      receipts: [],
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    socket.emit(
      "send_message",
      { conversationId, content, clientMessageId },
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
      <div className="h-16 border-b border-gray-800 flex items-center px-6">
        <span className="font-medium text-sm">
          Conversation
        </span>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-900"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        <form
          className="flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();

            const input =
              e.currentTarget.elements.namedItem(
                "message"
              ) as HTMLInputElement;

            if (!input.value.trim()) return;

            sendMessage(input.value);
            input.value = "";
          }}
        >
          <input
            name="message"
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 px-4 py-3 rounded-lg text-sm outline-none"
          />

          <button
            type="submit"
            className="bg-blue-600 px-5 py-3 rounded-lg text-sm"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}