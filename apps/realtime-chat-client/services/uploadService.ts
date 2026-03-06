import { api } from "@/lib/api"
import { Attachment } from "@/lib/types"

export async function uploadFile(file: File): Promise<Attachment> {

  // Step 1 — request upload URL (authenticated)
  const data = await api.post("/attachments/upload-url", {
    mimeType: file.type,
  })

  const { uploadUrl, fileUrl } = data

  // Step 2 — upload to storage (NO AUTH HEADER)
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  })

  if (!uploadRes.ok) {
    throw new Error("Upload failed")
  }

  // Step 3 — return metadata
  return {
    url: fileUrl,
    mimeType: file.type,
    fileName: file.name,
    size: file.size,
  }
}