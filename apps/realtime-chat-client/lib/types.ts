export interface User {
  id: string;
  name: string;
  online?: boolean;
  lastSeen?: string;
}

export type ReceiptStatus = "DELIVERED" | "READ";

export interface MessageReceipt {
  id: string;
  messageId: string;
  userId: string;
  status: ReceiptStatus;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  clientMessageId: string;
  createdAt: string;
  receipts: MessageReceipt[];
}

export interface Conversation {
  id: string;
  name?: string;
  participants: string[];
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}