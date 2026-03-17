# 💬 Real-Time Chat Client (Next.js + Socket.IO)

A modern real-time chat client built with **Next.js (App Router)**, **TypeScript**, and **TailwindCSS**, supporting:

* Authentication with JWT + refresh tokens
* Real-time messaging via WebSocket
* File & image attachments using presigned uploads (S3/MinIO)
* Message receipts (DELIVERED / READ)
* Presence (online/offline)
* Infinite scroll with scroll retention
* WhatsApp-style UI

---

# 🚀 Features

## 🔐 Authentication

* Register & Login
* Access token stored **in-memory**
* Refresh token stored in **HTTP-only cookie**
* Auto token refresh on 401
* Session restore on page reload

---

## 💬 Conversations

* View conversation list
* Supports:

  * Direct chats
  * Group chats
* Shows:

  * Last message
  * Unread count
  * Participant names
* Auto-scroll to newly created conversation

---

## 🧵 Messaging

* Real-time messaging via WebSocket
* Optimistic UI updates
* Cursor-based pagination (infinite scroll)
* Scroll retention when loading older messages
* Proper chronological ordering

---

## 📎 Attachments (Images & Files)

* Upload flow:

  1. Get presigned upload URL
  2. Upload file to storage (MinIO/S3)
  3. Send message with attachment metadata

### Supported:

* Images (preview + click to open)
* Files (download link)
* Multiple attachments per message

### UX:

* File preview before sending
* Upload indicator
* Disabled send button while uploading

---

## 📡 WebSocket Events

### Client → Server

* `join_conversation`
* `send_message`
* `message_delivered`
* `message_read`

### Server → Client

* `new_message`
* `receipt_updated`
* `presence_update`
* `authenticated`

---

## 🟢 Presence

* Online / Offline updates
* Last seen tracking

---

## ✅ Message Status

* SENT
* DELIVERED
* READ

---

## 🎨 UI Features

* Two-column layout
* WhatsApp-style chat bubbles
* Gradient chat background
* Responsive layout
* Clean Tailwind UI
* Avatar-based conversation list

---

# 🏗️ Tech Stack

* Next.js (App Router)
* TypeScript
* TailwindCSS
* Socket.IO Client
* Fetch API
* MinIO (S3-compatible storage)

---

# 📁 Project Structure

```
src/
│
├── app/
│   └── page.tsx
│
├── components/
│   ├── ChatWindow.tsx
│   ├── ChatInput.tsx
│   ├── MessageBubble.tsx
│   ├── ConversationList.tsx
│   ├── AttachmentPreview.tsx
│   └── CreateConversationModal.tsx
│
├── context/
│   ├── AuthContext.tsx
│   └── SocketContext.tsx
│
├── hooks/
│   ├── useMessages.ts
│   └── useConversations.ts
│
├── services/
│   └── uploadService.ts
│
├── lib/
│   ├── api.ts
│   └── chatHelpers.ts
│
├── types/
│   ├── message.ts
│   └── attachment.ts
```

---

# ⚙️ Environment Setup

Create `.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

---

# ▶️ How to Run

## 1️⃣ Install dependencies

```bash
npm install
```

## 2️⃣ Run development server

```bash
npm run dev
```

## 3️⃣ Open app

```
http://localhost:4000
```

---

# 🔄 Attachment Upload Flow

1. Request upload URL

```
POST /attachments/upload-url
```

2. Upload file

```
PUT uploadUrl
```

3. Send message via WebSocket

```
send_message
```

---

# ⚠️ Important Notes

### Authentication Rules

| Request           | Auth Required        |
| ----------------- | -------------------- |
| REST APIs         | ✅ Bearer Token       |
| Upload URL API    | ✅ Bearer Token       |
| File Upload (PUT) | ❌ NO AUTH            |
| WebSocket         | ✅ token in handshake |

---

### Common Issues Fixed

#### ❌ Attachments not visible after refresh [Fixed]

* Ensure backend returns `attachments` in messages API

#### ❌ Unauthorized on upload [Fixed]

* Make sure `/attachments/upload-url` uses authenticated API client

#### ❌ Duplicate messages

* Ensure deduplication by `id` and `clientMessageId`

---

# 📈 Future Improvements

* Drag & Drop uploads
* Image lightbox viewer
* Upload progress bar
* Typing indicator
* Message reactions
* Search conversations
* Pinned chats
* Mobile UI optimization

---

# 🧠 Architecture Highlights

* Token stored in memory → secure
* Refresh via HTTP-only cookies → safe auth
* Socket-based real-time updates
* Idempotent message sending via `clientMessageId`
* Scalable (Redis adapter supported backend)

---

# 👨‍💻 Author Notes

This project demonstrates a **production-ready chat client architecture** with:

* Clean separation of concerns
* Minimal dependencies
* Scalable real-time design
* Modern UI patterns

---

# 📄 License

MIT
