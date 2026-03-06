"use client"

import { useRef, useState } from "react"
import AttachmentPreview from "./AttachmentPreview"
import { Attachment } from "@/lib/types"
import { uploadFile } from "@/services/uploadService"

interface Props {
  conversationId: string
  socket: any
  onSend: (content: string, attachments: any[]) => void
}

export default function ChatInput({ conversationId, socket, onSend }: Props) {

  const inputRef = useRef<HTMLInputElement>(null)

  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = (e: any) => {
    const selected: File[] = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selected])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const sendMessage = async () => {

    if (!socket) return

    setUploading(true)

    let attachments: Attachment[] = []

    try {

      // Upload files
      for (const file of files) {
        const uploaded = await uploadFile(file)
        attachments.push(uploaded)
      }

      onSend(message,attachments)

      setMessage("")
      setFiles([])

    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border-t border-gray-800 p-3 bg-gray-950">

      {/* Attachment previews */}
      {files.length > 0 && (
        <div className="flex gap-2 mb-2">
          {files.map((file, i) => (
            <AttachmentPreview
              key={i}
              file={file}
              onRemove={() => removeFile(i)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">

        {/* Attachment Button */}
        <button
          onClick={() => inputRef.current?.click()}
          className="text-xl px-2"
        >
          📎
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={handleFileSelect}
        />

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          className="flex-1 bg-gray-800 px-4 py-2 rounded-full text-sm outline-none"
        />

        <button
          onClick={sendMessage}
          disabled={uploading}
          className="bg-blue-600 px-4 py-2 rounded-full text-sm disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Send"}
        </button>

      </div>
    </div>
  )
}