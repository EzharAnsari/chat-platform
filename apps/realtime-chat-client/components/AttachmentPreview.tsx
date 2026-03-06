"use client"

interface Props {
  file: File
  onRemove: () => void
}

export default function AttachmentPreview({ file, onRemove }: Props) {

  const isImage = file.type.startsWith("image")

  return (
    <div className="relative border border-gray-700 rounded-lg p-2 bg-gray-900">

      {isImage ? (
        <img
          src={URL.createObjectURL(file)}
          className="w-20 h-20 object-cover rounded"
        />
      ) : (
        <div className="w-20 h-20 flex items-center justify-center bg-gray-800 rounded text-xs">
          {file.name}
        </div>
      )}

      <button
        onClick={onRemove}
        className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded"
      >
        ✕
      </button>

    </div>
  )
}