# Copilot Instructions for NEWS.PORTAL

## Project shape

NEWS.PORTAL is a two-process React/Node application for an AI-assisted news publishing workflow:

- `client/` is a React 18 + Vite + Tailwind UI. `src/App.jsx` owns the top-level view state and hash-based deep links for home, article, forum, author, and admin views.
- `server/` is a CommonJS Express API with a Socket.IO server. `src/index.js` mounts the route modules and exposes the Socket.IO instance to routes through `app.set('io', io)`.
- `server/src/data/store.js` is the persistence boundary. It loads the domain collections from MongoDB at startup, keeps the existing synchronous domain API for routes, and queues explicit writes back to MongoDB after mutations.
- `client/src/services/api.js` is the browser-to-API boundary. Keep endpoint calls there rather than embedding `fetch` calls in presentational components.
- `client/src/context/AuthContext.jsx` owns the client session, JWT in `localStorage` (`news_portal_token`), login, registration, logout, and session restoration.
- Local MongoDB uses `mongodb://127.0.0.1:27017/news_portal`; configure a different value through `server/.env` and `MONGO_URI`.
- Optional live breaking-news ingestion uses the server-side GNews adapter in `server/src/services/gnews.service.js`; keep `GNEWS_API_KEY` out of client code, respect the 100-request daily quota through `GnewsUsage`, and do not auto-publish imported headlines.

The main backend flows are:

1. Auth routes issue JWTs and `middleware/auth.js` verifies the token and re-reads the current user from the store.
2. Article routes provide public discovery plus author/admin editorial operations and fact-check scanning.
3. Comment and forum routes provide authenticated participation, throttling, flagging, voting, and moderation data.
4. Admin routes handle RBAC management, moderation resolution, fact-check override audit logs, and breaking-news broadcasts.
5. Socket.IO rooms use `article:<articleId>` for live article discussions; breaking-news and comment events are broadcast by the relevant routes.

## Commands

Run these from the repository root unless noted:

```bash
npm run install:all       # install server and client dependencies
start.bat                 # launch backend and frontend in separate Windows terminals
npm run dev:server        # backend with node --watch
npm run dev:client        # Vite frontend
npm start                 # backend only
npm run build             # production build of client/dist
```

Equivalent direct commands are `cd server && npm start`, `cd server && npm run dev`, and `cd client && npm run dev|build|preview`.

There is currently no test runner, single-test command, or lint script in the root, client, or server package manifests. Do not invent a test command; add a focused test setup only when the feature requires it.

## Repository-specific conventions

- Backend route files use CommonJS and route-local validation/error responses. Preserve the existing `{ error: string }` response shape for failures.
- Authentication is bearer-token based: protected client calls must use `getAuthHeaders()` so `Authorization: Bearer <token>` is applied consistently.
- Enforce authorization in both middleware and domain operations. `requireRole()` handles route-level RBAC, while store methods still verify ownership for article mutations.
- Roles are exactly `reader`, `author`, and `admin`. Authors and admins can use author workflows; admin-only operations must remain admin-only.
- Rich text must pass through `server/src/middleware/sanitize.js` before it is stored or returned. Do not bypass sanitization when adding an article/comment/forum input.
- Preserve the operational guardrails in `docs/GAURDRAIL.md`: minimum 15-character fact-check override reasons, three-second per-user comment throttling, five breaking broadcasts per minute, and auto-hide after three flags.
- Article body edits invalidate the existing trust score and return the article to a pending-verification state. Fact-check claims include status, confidence, and source URLs; do not mark a claim verified without a source.
- New real-time behavior should use the existing Socket.IO instance and article-room naming convention instead of creating a second server or polling loop.
- Frontend components are functional JSX components using hooks and Tailwind utility classes. Reuse existing API/context helpers and keep business logic out of leaf presentation components.
- The UI palette is intentionally constrained by the design docs: dark slate/white with cyan or blue accents and no purple, violet, indigo, magenta, or pink-red-blue hybrids. Glass surfaces need a solid slate fallback.
- New registrations default to `reader`; author/admin access is assigned through RBAC management or MongoDB Compass during development. Do not add client-side role switching or demo authentication shortcuts.
- Documentation sources are `README.md`, `docs/PRD.md`, `docs/DESIGN.md`, `docs/GAURDRAIL.md`, and `docs/PROJECT_SETUP.md`. Treat the PRD and guardrails as the behavioral contract when code and prose differ.

## Teacher-manual concept mapping and current gaps

The teacher manual describes an Event Management System with React pages/components, Express controllers/routes, JWT/bcrypt authentication, protected CRUD APIs, MongoDB/Mongoose models, and Socket.IO. Apply those concepts to the News Portal as follows:

| Manual concept | News Portal equivalent |
| --- | --- |
| Event CRUD | Article CRUD and editorial lifecycle (`draft`, `pending_review`, `published`) |
| Event registration | Reader bookmarks, article likes, comments, forum threads, and replies |
| User/admin roles | Reader, author, and admin RBAC |
| Database models | Mongoose schemas under `server/src/models/`; the store migration is still in progress |
| Auth middleware | JWT verification plus `requireRole()` in `server/src/middleware/auth.js` |
| React pages and services | View selection in `App.jsx`, feature components, `AuthContext`, and `services/api.js` |
| Socket.IO updates | Live article-room comments and admin breaking-news broadcasts |

MongoDB/Mongoose now backs the existing `store.js` boundary while preserving the current client API. The project still has no dedicated event-registration-style collection or registration workflow; map that manual concept to bookmarks, likes, comments, forum threads, and replies unless the assignment explicitly requires a separate registration feature.
