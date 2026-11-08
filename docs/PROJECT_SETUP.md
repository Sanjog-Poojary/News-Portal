# Project Setup Guide — News Publishing Portal

This guide provides instructions to run and develop the **News Publishing Portal** locally.

---

## 1. Architecture Overview

- **Frontend (`client/`)**: React 18 / Vite / Tailwind CSS / Lucide Icons / Socket.io-client.
  - **Color Philosophy**: Strict Minimalist Cyberpunk / Premium SaaS (`#080B10` background, glass cards, `#00E5FF` electric cyan accent, strictly NO purple).
- **Backend (`server/`)**: Node.js / Express / Socket.io / JWT / bcryptjs / DOMPurify.
  - Role-Based Access Control (`Reader`, `Author`, `Admin`).
  - Real-time breaking news broadcasting and live comments.
  - AI Fact-Check verification data model with claim citations and trust rollups.

---

## 2. Quick Start

### Install All Dependencies
From the repository root:
```bash
npm run install:all
```
*(Or navigate into `server` and `client` individually and run `npm install`).*

### Run Backend and Frontend Concurrently
```bash
npm run dev
```
- **Frontend URL**: `http://localhost:5173`
- **Backend API & WebSockets**: `http://localhost:5000`

---

### MongoDB Compass

MongoDB Community Server runs locally as a Windows service. Open MongoDB Compass and connect with:

```text
mongodb://127.0.0.1:27017/news_portal
```

The backend reads `MONGO_URI` from `server/.env`; if it is not set, the same local URI is used by default. Copy `server/.env.example` to `server/.env` before configuring a custom database.

### Live Breaking News

The server supports optional GNews top-headline polling for the breaking-news ticker. Add `GNEWS_API_KEY` to `server/.env`; the default polling interval is 15 minutes, which stays below a 100-requests-per-day quota even with the initial sync. Imported items are normalized as breaking alerts and broadcast through Socket.IO only. They are not automatically converted into published articles. The server also stops making requests after `GNEWS_DAILY_REQUEST_LIMIT` is reached.

## 3. Account Setup

Create an account from the dedicated registration view. New accounts receive the `reader` role by default. To grant editorial or administrative access during development, update the user's `role` field in the MongoDB Compass `news_portal.users` collection to `author` or `admin`.

---

## 4. Operational Guardrails

- **Zero-Purple Enforcement**: Strictly dark surfaces (`#080B10`), pure white text, and electric cyan accents (`#00E5FF`).
- **DOMPurify Sanitization**: All rich text submitted is sanitized before saving to eliminate stored XSS risks.
- **WebSocket Throttling**: Live comments are throttled to 1 comment per 3 seconds per client.
