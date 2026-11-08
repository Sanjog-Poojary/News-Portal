# Product Requirements Document (PRD) — News Publishing Portal

> **Status:** Approved / Single Source of Truth  
> **Author:** Sanjog Poojary  
> **Version:** 1.0.0  
> **Target Release:** Q3 2026  

---

## 1. Executive Summary

The News Publishing Portal is an AI-augmented media platform engineered to bridge the gap between rapid journalistic publishing and factual integrity[cite: 1]. The system provides role-gated editorial workflows, instant breaking news broadcasting via WebSockets, interactive real-time commenting, dedicated community discussion boards, and an automated asynchronous AI fact-checking engine that assigns claim-level confidence ratings and article trust badges[cite: 1].

---

## 2. User Personas & Permissions

| Role | Description | Core Capabilities |
| :--- | :--- | :--- |
| **Reader (Public / Authenticated)** | Consumes public news and participates in community discourse[cite: 1]. | • Browse categorized feeds, featured hero carousels, and search results[cite: 1].<br>• View AI Fact-Check trust scores and claim citation markers[cite: 1].<br>• Like, bookmark, and stream live comments via WebSockets[cite: 1].<br>• Post threads and nested replies in the Community Forum[cite: 1]. |
| **Author / Editor** | Content creator and journalist[cite: 1]. | • Create, edit, and archive stories using a rich-text WYSIWYG editor[cite: 1].<br>• Track post analytics (views, engagement)[cite: 1].<br>• Review AI fact-check scan reports prior to publishing[cite: 1].<br>• Override or dismiss individual AI claim flags with mandatory logging[cite: 1]. |
| **Administrator** | Global platform supervisor[cite: 1]. | • Manage users and adjust Role-Based Access Control (RBAC) levels[cite: 1].<br>• Moderate reported comments and flagged forum posts[cite: 1].<br>• Dispatch platform-wide live breaking alerts to all connected clients[cite: 1].<br>• Audit AI fact-check override trails[cite: 1]. |

---

## 3. Functional Requirements

### 3.1. Authentication & Role-Based Access Control (RBAC)
* Secure registration and login flows utilizing JSON Web Tokens (JWT) and `bcrypt` password hashing (minimum 10 salt rounds)[cite: 1, 2].
* Path-level and API-level middleware to enforce route authorization for `Reader`, `Author`, and `Admin`[cite: 1, 2].
* Session persistence handled via HTTP-only cookies or local storage with secure token invalidation upon logout[cite: 1].

### 3.2. Content Management & Editorial Workflow
* **Rich Text Editing:** Full CRUD operations on articles featuring rich-text formatting, media attachments, metadata tagging, and category assignment[cite: 1].
* **Article States:** Progression lifecycle supporting `Draft`, `Pending Review`, and `Published` states[cite: 1].
* **Version Control:** Immutable change tracking and version logging on article updates[cite: 1].

### 3.3. AI-Powered Fact-Checking Pipeline
* **Async Trigger:** On article submission, an asynchronous AI pipeline processes the body content[cite: 1].
* **Claim Extraction:** Discrete factual assertions are extracted and cross-referenced against verified indexes and knowledge bases[cite: 1].
* **Claim Labeling:** Each claim receives one of four statuses: `Verified`, `Unverified`, `Disputed`, or `Needs Context`, coupled with a confidence percentage ($0\text{--}100\%$) and source citation links[cite: 1].
* **Article Trust Badge:** Computes an aggregated rollup score (e.g., "Mostly Verified — 87% Confidence") displayed on article cards and detail pages[cite: 1].
* **Editorial Review & Overrides:** Editors must review the generated report prior to publication[cite: 1]. Manual overrides require an audit trail reason entry[cite: 1].
* **Auto Re-Scan:** Editing a published article invalidates the prior badge and triggers an automatic re-scan[cite: 1].

### 3.4. Discovery, Search, & Live Interactivity
* **Search:** Debounced full-text search with dynamic client-side filtering by author, date range, tag, and category[cite: 1].
* **Live Notifications:** Server-sent breaking alerts dispatched via `Socket.io` to all active sessions[cite: 1, 2].
* **Live Comments:** Real-time WebSocket comment feeds appended to article detail views without page reloads[cite: 1].

### 3.5. Standalone Community Forum
* Separate, board-based discussion system categorized by topics (e.g., Politics, Technology, Sports, General)[cite: 1].
* Support for thread creation, nested replies, upvotin`g/downvoting, and moderation reporting[cite: 1].
* User reports route directly into the Admin Control Panel moderation queue[cite: 1].

---

## 4. Database Schema Specifications

### `User` Collection
* `_id` (ObjectId, Primary Key)[cite: 2]
* `name` (String, Required)
* `email` (String, Unique, Required)[cite: 2]
* `password` (String, Required — Hashed)[cite: 2]
* `role` (Enum: `reader`, `author`, `admin`; Default: `reader`)[cite: 1]
* `bookmarks` (Array of ObjectIds referencing `Article`)[cite: 1]
* `createdAt` / `updatedAt` (Timestamps)

### `Article` Collection
* `_id` (ObjectId, Primary Key)[cite: 2]
* `title` (String, Required)[cite: 1]
* `slug` (String, Unique, Indexed)
* `body` (String, Required — HTML / Markdown)[cite: 1]
* `author` (ObjectId referencing `User`, Required)[cite: 1]
* `category` (String, Indexed, Required)[cite: 1]
* `tags` (Array of Strings)[cite: 1]
* `coverImage` (String URL)[cite: 1]
* `status` (Enum: `draft`, `pending_review`, `published`; Default: `draft`)[cite: 1]
* `trustScore` (Object: `{ rollup: String, score: Number }`)[cite: 1]
* `claims` (Array of Objects: `[{ claimText, status, confidence, sources: [] }]`)[cite: 1]
* `viewCount` / `likeCount` (Numbers, Default: 0)[cite: 1]
* `createdAt` / `updatedAt` (Timestamps)

### `Comment` Collection
* `_id` (ObjectId, Primary Key)[cite: 2]
* `articleId` (ObjectId referencing `Article`, Required, Indexed)[cite: 1]
* `author` (ObjectId referencing `User`, Required)[cite: 1]
* `content` (String, Required)[cite: 1]
* `flagged` (Boolean, Default: false)[cite: 1]
* `createdAt` (Timestamp)

### `ForumThread` Collection
* `_id` (ObjectId, Primary Key)[cite: 2]
* `board` (Enum: `politics`, `technology`, `sports`, `general`, Indexed)[cite: 1]
* `title` (String, Required)[cite: 1]
* `content` (String, Required)[cite: 1]
* `author` (ObjectId referencing `User`, Required)[cite: 1]
* `upvotes` / `downvotes` (Array of ObjectIds referencing `User`)[cite: 1]
* `replies` (Array of Objects: `[{ author, content, parentReplyId, createdAt }]`)[cite: 1]
* `flagged` (Boolean, Default: false)[cite: 1]
* `createdAt` / `updatedAt` (Timestamps)

### `FactCheckLog` Collection
* `_id` (ObjectId, Primary Key)[cite: 2]
* `articleId` (ObjectId referencing `Article`, Required)[cite: 1]
* `editorId` (ObjectId referencing `User`, Required)[cite: 1]
* `claimIndex` (Number, Required)[cite: 1]
* `originalStatus` (String)[cite: 1]
* `overriddenStatus` (String)[cite: 1]
* `reason` (String, Required)[cite: 1]
* `timestamp` (Date, Default: Date.now)[cite: 1]

---

## 5. Non-Functional Requirements

* **Performance:** Maximum initial page load time under 1.5 seconds; live WebSocket comment propagation latency under 150 ms[cite: 1].
* **Scalability:** Stateless JWT authentication to facilitate horizontal API scaling[cite: 1, 2].
* **Security:** Complete sanitization of WYSIWYG rich text to eliminate XSS; bcrypt password hashing with salt factor $\ge 10$[cite: 1, 2].