# 💬 Chat Platform Backend

A scalable, real-time chat backend built with **Node.js, Fastify, TypeScript, Redis, BullMQ, Prisma, and MinIO**, designed using **production-grade architecture patterns**.

This project simulates how modern messaging systems like **Slack / WhatsApp / Discord** are built.

---

# 🚀 Features

## 🔐 Authentication & Security

* JWT-based authentication (Access + Refresh tokens)
* Refresh token rotation
* Multi-device login support
* HTTP-only secure cookies
* Logout (single device + all devices)
* Protected routes middleware

---

## 💬 Realtime Messaging

* WebSocket-based communication (Socket.io)
* Authenticated socket connections
* Room-based messaging (per conversation)
* Idempotent message sending (`clientMessageId`)
* Message persistence (Postgres)

---

## 📩 Messaging Features

* 1:1 conversations
* Group conversations
* Message delivery receipts
* Read receipts (per user)
* Unread message count
* Cursor-based pagination
* Conversation list with last message

---

## 🟢 Presence System

* Online/offline tracking
* Redis-backed presence
* Scalable across multiple instances

---

## ⚡ Performance & Scaling

* Redis pub/sub for WebSocket scaling
* Horizontal scaling with multiple API instances
* NGINX load balancer
* Rate limiting (Redis-based)

---

## 📦 Attachments (S3-style)

* Direct file upload via presigned URLs
* MinIO (S3-compatible storage)
* No file load on API server
* Public file access

---

## 🧠 Background Processing

* BullMQ queues
* Notification worker (offline users)
* Media processing worker (thumbnails)

---

## 🛡️ Virus Scanning Pipeline

* ClamAV integration
* Async virus scanning worker
* File status tracking:

  * `UPLOADING`
  * `SCANNING`
  * `READY`
  * `INFECTED`
* Infected files automatically deleted

---

## 🐳 Dockerized Infrastructure

* Postgres
* Redis
* MinIO
* ClamAV
* API (multiple instances)
* NGINX load balancer
* Worker services

---

# 🏗️ Architecture

```
Client
   │
NGINX (Load Balancer)
   │
 ┌───────────────┐
 │   API Layer   │
 │ api1   api2   │
 └───────┬───────┘
         │
      Redis
   (pub/sub + queues)
         │
   ┌───────────────┐
   │   Workers     │
   │ virus/media   │
   └───────────────┘
         │
      Postgres
         │
      MinIO (S3)
         │
      ClamAV
```

---

# 🧭 Project Structure

```
chat-platform/
  apps/
    api/
  packages/
    config/
    database/
  prisma/
  docker/
  infra/nginx/
```

---

# ⚙️ How to Run

## 1️⃣ Clone Repository

```bash
git clone <your-repo>
cd chat-platform
```

---

## 2️⃣ Setup Environment

Create `docker/api.env`:

```env
NODE_ENV=production
DATABASE_URL=postgresql://chat:chat@postgres:5432/chat
REDIS_HOST=redis

JWT_ACCESS_SECRET=supersecretaccess
JWT_REFRESH_SECRET=supersecretrefresh

S3_ENDPOINT=http://minio:9000
S3_PUBLIC_ENDPOINT=http://localhost:9000
S3_BUCKET=chat-attachments
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123

CLAMSCAN=clamav
```

---

## 3️⃣ Start All Services

```bash
cd docker
docker compose up --build
```

---

## 4️⃣ Access Services

| Service         | URL                   |
| --------------- | --------------------- |
| API (via NGINX) | http://localhost:8080 |
| MinIO Console   | http://localhost:9001 |
| MinIO Storage   | http://localhost:9000 |

---

## 5️⃣ Run Migrations

Handled automatically on container startup:

```bash
prisma migrate deploy
```

---

# 📤 Attachment Upload Flow

```
Client
   │
POST /attachments/upload-url
   │
API returns presigned URL
   │
PUT upload directly to MinIO
   │
Send message with fileUrl
```

---

# 🛡️ Virus Scan Flow

```
Upload → MinIO
      ↓
enqueue job
      ↓
Virus Worker (ClamAV)
      ↓
Clean → READY
Virus → DELETE
```

# 📸 Media Processing Worker

```
Client uploads file → MinIO
        ↓ 
enqueue media-processing job
        ↓
Media Worker
        ↓
download file from storage
        ↓
generate thumbnail (Sharp)
        ↓
upload thumbnail to MinIO
        ↓
update database
```

# 🔔 Notification Worker

```
Message sent
        ↓ 
Check recipient presence (Redis)
        ↓ 
If offline → enqueue notification job
        ↓ 
Notification Worker
        ↓ 
Process notification
        ↓ 
(send push/email – extendable)
```

---

# 📡 Realtime Messaging Flow

```
Client (WebSocket)
      ↓
API instance
      ↓
Redis pub/sub
      ↓
Other API instances
```

---

# 🧪 Key Engineering Concepts Demonstrated

* Monorepo architecture (pnpm workspaces)
* Distributed systems design
* Event-driven architecture (queues)
* Horizontal scaling (multi-instance)
* Real-time systems (WebSockets + Redis)
* Object storage (S3 pattern)
* Async processing pipelines
* Security (JWT + cookies + validation)

---

# 🚀 Future Improvements

## 🔥 High Priority

* [ ] Worker separation (dedicated containers)
* [ ] Retry + dead-letter queues

---

## 📊 Observability

* [ ] Prometheus metrics
* [ ] Grafana dashboards
* [ ] API latency tracking
* [ ] Queue monitoring

---

## 🔍 Search

* [ ] Full-text message search (Postgres / ElasticSearch)

---

## 🔐 Security Enhancements

* [ ] File size limits
* [ ] MIME validation
* [ ] Signed download URLs
* [ ] Access control for attachments

---

## 🌍 Production Enhancements

* [ ] CDN integration for attachments
* [ ] NGINX file proxy (`/files/:key`)
* [ ] Kubernetes deployment

---

# 🎯 Summary

This project implements a **production-style chat backend** with:

* Realtime messaging
* Horizontal scalability
* Async processing
* Secure file handling
* Virus scanning pipeline

It closely mirrors architectures used by:

* Slack
* Discord
* WhatsApp Web

---

# 📌 Author

Built as a **backend engineering showcase project** demonstrating real-world system design and scalable architecture.
