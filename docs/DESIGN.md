# System & UI/UX Design Specification — News Publishing Portal

> **Reference Inspiration:** Dribbble (Slava Kornilov — News Platform)  
> **Aesthetic Philosophy:** Minimalist Cyberpunk meets Premium SaaS.  

---

## 1. Visual Identity & Color System

### Palette Definition
* **Background Canvas:** `#080B10` (Ultra-deep slate black)
* **Surface / Cards (Glassmorphism):** `#0F172A` with `rgba(15, 23, 42, 0.65)` background, `backdrop-blur-md`, and `border-slate-800/60`
* **Primary Neon Accent:** `#00E5FF` / `rgb(0, 229, 255)` (Electric Neon-Blue / Cyan for buttons, active tabs, live tickers, and primary highlights)
* **Secondary Accent:** `#0284C7` (Deep Sky Blue for secondary borders and badges)
* **Text Hierarchy:**
  * **Headings / Primary:** `#F8FAFC` (Pure bright slate)
  * **Body / Secondary:** `#94A3B8` (Muted cool gray)
  * **Subtle / Meta:** `#64748B` (Darker slate)
* **Status Badges:**
  * **Verified / Active:** Neon-Cyan / Emerald-Cyan (`#00F5D4`)
  * **Disputed / Warning:** Amber-Gold (`#F59E0B`)
  * **Needs Context:** Slate-Sky (`#38BDF8`)

### Strict Styling Guardrail
* **Prohibited Colors:** Absolutely NO purple, violet, magenta, or red-blue hybrid tones are permitted in backgrounds, buttons, borders, or text accents.

---

## 2. Layouts & View Specifications

### View 1: Home / Landing View
* **Top Navigation:** Brand logo (`NEWS.PORTAL`), global debounced search input, links for `Forum` and `Feed`, and dynamic auth buttons (`Login` / `Dashboard`)[cite: 1].
* **Live Breaking Ticker:** Full-width glassmorphic ribbon at the top with a pulsing neon-blue beacon showing incoming alerts via `Socket.io`[cite: 1].
* **Hero Carousel:** High-impact editorial carousel displaying trending news with trust badge rollups and author credits[cite: 1].
* **Category Filter Bar:** Horizontal chip row (`All`, `Tech`, `World`, `Sports`, `Politics`)[cite: 1].
* **Content Grid:** Responsive 3-column card grid with hover glow transitions, read-time indicators, and bookmark icons[cite: 1].

### View 2: Article Detail View (with AI Fact-Check)
* **Article Header:** Massive high-contrast headline, timestamp, reading duration, and author meta[cite: 1].
* **AI Fact-Check Banner:** Prominent expandable card directly beneath the title showing:
  * Overall Trust Badge (e.g., `Mostly Verified — 87% Confidence`)[cite: 1].
  * Claim verification summary bar[cite: 1].
  * Interactive click-to-expand list detailing verified claims and source URLs[cite: 1].
* **Reading Body:** Typography-focused layout with inline highlighted claim markers that display tooltip citations on hover[cite: 1].
* **Engagement Bar:** Floating or docked action bar with Like, Bookmark, Share, and Comment counts[cite: 1].
* **Live WebSocket Comment Stream:** Pinned interactive discussion feed with real-time incoming comment animations[cite: 1].

### View 3: Search & Discovery View
* **Query Control Hub:** Multi-variable search bar with input debouncing[cite: 1].
* **Filter Strip:** Dropdown filters for Category, Date Range, Author Name, and Sort Order (Newest, Trust Score, Most Discussed)[cite: 1].
* **Result List:** Stacked horizontal cards featuring claim highlights and metadata[cite: 1].

### View 4: Authentication View (Login / Signup)
* **Modal / Centered Glass Card:** Minimalist floating container with a tabbed switch between `Login` and `Sign Up`[cite: 1].
* **Form Structure:** Clean slate input fields with focus glow rings in neon-blue[cite: 1].
* **OAuth Options:** Two-column secondary auth integration (`Google OAuth`, `GitHub OAuth`)[cite: 1].

### View 5: Author / Editor Dashboard
* **Metrics Ribbon:** 3-card analytics strip displaying `Total Published`, `Drafts Pending`, and `30-Day Views`[cite: 1].
* **Article Management Grid:** Data table with status flags (`Draft`, `Pending Review`, `Published`) and rapid `Edit` triggers[cite: 1].
* **WYSIWYG Editor Suite:** Integrated rich-text composer with formatting bars, category/tag inputs, cover image uploaders, and a prominent `Submit for AI Fact-Check` action button[cite: 1].

### View 6: Admin Control Panel
* **Navigation Sidebar:** Left-aligned docking menu (`Overview`, `User RBAC`, `Content Moderation`, `Forum Flags`, `AI Audit Log`, `Settings`)[cite: 1].
* **Live Breaking News Dispatcher:** Direct input console allowing admins to broadcast instant push notifications to all connected clients[cite: 1].
* **AI Override Audit Log:** Dedicated data table displaying editorial overrides, claim delta, and mandatory rationale records[cite: 1].

### View 7: Community Forum View
* **Two-Column Split:**
  * **Left Column:** Category boards (`#politics`, `#technology`, `#sports`, `#general`)[cite: 1].
  * **Right Column:** Thread browser with `Recent`, `Top`, and `Unanswered` filters, a `+ New Thread` action trigger, and interactive nested replies with upvote/downvote counters[cite: 1].

---

## 3. Navigation State & Route Architecture

```text
[Home / Landing View]
 ├── (Click Article) ──────────────► [Article Detail View]
 ├── (Click Search) ───────────────► [Search & Filter View]
 ├── (Click Forum) ────────────────► [Community Forum View]
 ├── (Click Login / Sign Up) ──────► [Authentication View]
 └── (Click Dashboard — Auth'd)
      ├── Role: Author ────────────► [Author Dashboard & Editor]
      └── Role: Admin ─────────────► [Admin Control Panel]