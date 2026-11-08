# Operational & Architectural Guardrails — News Publishing Portal

> **Purpose:** Enforce non-negotiable boundaries across AI operations, system security, editorial integrity, and frontend design standards.

---

## 1. Design & Aesthetic Guardrails

* **The Zero-Purple Rule:** Under no circumstances may purple, violet, indigo, magenta, or pink-red-blue hybrid hex codes (e.g., `#7C3AED`, `#8B5CF6`, `#A855F7`, `#C084FC`) be used in the UI. 
* **Permitted Palette:** Strictly dark surfaces (`#080B10` to `#1E293B`), pure white/gray text, and electric neon-blue/cyan accents (`#00E5FF`, `#0284C7`, `#38BDF8`).
* **Glassmorphism Constraint:** Any component using glassmorphism must include a fallback background color (`bg-slate-900`) for low-spec rendering environments or reduced-transparency browser settings.

---

## 2. AI Fact-Checking Engine Guardrails

* **No Blind Hallucinations:** The AI pipeline must never output a `Verified` status without providing at least one direct, resolvable external source URL or indexed reference[cite: 1].
* **Confidence Floor:** Any claim evaluated with less than $50\%$ confidence must be marked `Unverified` or `Needs Context` by default[cite: 1].
* **Mandatory Human-in-the-Loop (HITL):** 
  * AI evaluations do not block publishing directly, but an editor must explicitly review flagged claims[cite: 1].
  * Any manual override of an AI claim label requires a non-empty `reason` string (minimum 15 characters) recorded permanently to `FactCheckLog`[cite: 1].
* **Stale Verification Invalidation:** Whenever the body text of an article is modified, the previous trust badge is instantly invalidated, and the state reverts to `Pending AI Verification`[cite: 1].

---

## 3. Security & Access Control Guardrails

* **RBAC Enforcement:**
  * No user with the role `Reader` may trigger routes under `/api/articles/create`, `/api/admin/*`, or `/api/factcheck/override`[cite: 1, 2].
  * Endpoint access must validate both the JWT integrity and the current database role on sensitive mutations[cite: 1, 2].
* **Input Sanitization:**
  * All rich text submitted from the WYSIWYG editor must pass through a strict DOMPurify/sanitization layer before database insertion to prevent stored XSS attacks[cite: 1].
* **Rate Limiting:**
  * Search endpoint: Maximum 60 requests/minute per IP[cite: 1].
  * AI Fact-Check submission endpoint: Maximum 10 scans/minute per Author[cite: 1].
  * Breaking News broadcast endpoint: Restricted to Admins; rate-limited to 5 dispatches/minute to prevent socket flooding[cite: 1, 2].

---

## 4. Real-Time WebSocket Guardrails

* **Connection Authentication:** WebSocket handshakes on Socket.io must verify the client JWT before joining private author/admin rooms[cite: 1, 2].
* **Comment Throttling:** Authenticated users cannot post comments faster than 1 comment every 3 seconds to mitigate live feed spam[cite: 1].
* **Moderation Auto-Hide:** If a comment or forum post receives $\ge 3$ user flags, its visibility is automatically changed to `hidden` pending Admin review[cite: 1].