"use client";

import { useState } from "react";
import { createConversation } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}

export default function CreateConversationModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const [type, setType] = useState<"DIRECT" | "GROUP">("DIRECT");
  const [emails, setEmails] = useState("");
  const [groupName, setGroupName] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const participantEmails = emails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    const payload: any = {
      type,
      participantEmails,
    };

    if (type === "GROUP") {
      payload.name = groupName;
    }

    try {
      const res = await createConversation(payload);
      onCreated(res.id);
      onClose();
    } catch (err) {
      alert("Failed to create conversation");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

      <div className="bg-gray-900 w-[420px] rounded-lg p-6">

        <h2 className="text-lg font-semibold mb-4">
          New Conversation
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Type */}
          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as any)
            }
            className="w-full bg-gray-800 p-2 rounded"
          >
            <option value="DIRECT">Direct</option>
            <option value="GROUP">Group</option>
          </select>

          {/* Group name */}
          {type === "GROUP" && (
            <input
              placeholder="Group name"
              value={groupName}
              onChange={(e) =>
                setGroupName(e.target.value)
              }
              className="w-full bg-gray-800 p-2 rounded"
            />
          )}

          {/* Emails */}
          <input
            placeholder="Participant emails (comma separated)"
            value={emails}
            onChange={(e) =>
              setEmails(e.target.value)
            }
            className="w-full bg-gray-800 p-2 rounded"
          />

          {/* Buttons */}
          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-gray-700 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded"
            >
              Create
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}