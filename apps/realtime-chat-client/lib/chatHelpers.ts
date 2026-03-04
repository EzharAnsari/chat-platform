import { Conversation } from "./types";

export function getConversationTitle(
  conv: Conversation,
  currentUserId: string | null
) {
  if (conv.type === "GROUP") {
    return conv.name || "Unnamed Group";
  }

  const other = conv.participants.find(
    (p) => p.id !== currentUserId
  );

  return other?.name || other?.email || "User";
}

export function getAvatarLetter(name: string) {
  return name.charAt(0).toUpperCase();
}

export function formatTime(time: string) {
  return new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}