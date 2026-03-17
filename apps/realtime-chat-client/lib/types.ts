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
  attachments: Attachment[];
}

export interface Participant {
  id: string;
  name: string;
  email: string;
}

export interface Conversation {
  id: string;
  type: "DIRECT" | "GROUP";
  name: string | null;
  participants: Participant[];

  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
  };

  unreadCount: number;
  updatedAt: string;
}

export interface Attachment {
  url: string
  mimeType: string
  fileName: string
  size?: number
  thumbnailUrl?: string
  key: string
}

export interface UploadUrlResponse {
  uploadUrl: string
  fileUrl: string
  key: string
}
