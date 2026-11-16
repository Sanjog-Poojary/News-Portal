# NEWS.PORTAL — AI-Verified Media Publishing System

> **Aesthetic:** Minimalist Cyberpunk meets Premium SaaS  
> **Key Colors:** Deep Slate `#080B10`, Electric Neon Cyan `#00E5FF`, Sky Blue `#0284C7` (Strict Zero-Purple Rule)

---

## ⚡ Quick Launch

Double-click `start.bat` (or `run.bat`) or run from terminal:
```bash
start.bat
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API & WebSockets:** [http://localhost:5000](http://localhost:5000)

---

## Docker

Docker Compose runs MongoDB, the Express/Socket.IO server, and the production Nginx frontend:

```bash
copy server\.env.example server\.env
docker compose up --build
```

- **Production frontend container:** [http://localhost:8080](http://localhost:8080)
- **Backend health check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **MongoDB data:** stored in the `newsportal_mongo_data` Docker volume

Keep `server/.env` local. For deployment, provide `JWT_SECRET`, `GNEWS_API_KEY`, and other environment values through the hosting platform's secret manager.

The GitHub Actions workflow in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) validates the client and server on pushes and pull requests. A push to `main` additionally builds and publishes immutable server and client images to GitHub Container Registry:

```text
ghcr.io/sanjog-poojary/news-portal-server:latest
ghcr.io/sanjog-poojary/news-portal-client:latest
```

The images are also tagged with the commit SHA. To trigger a Render deployment after a successful publish, add a repository secret named `RENDER_DEPLOY_HOOK_URL` containing the Render deploy-hook URL. For a separately hosted client container, add repository variables named `VITE_API_BASE_URL` and `VITE_SOCKET_URL` so the production URLs are baked into the client image.

---

## 📁 Project Structure & Documentation

All core architectural and design specifications are stored in the [`docs/`](./docs/) folder:

- [`docs/PRD.md`](./docs/PRD.md) — Product Requirements Document (Personas, Functional Requirements, Database Schema).
- [`docs/DESIGN.md`](./docs/DESIGN.md) — Visual Identity, Color System, and 7-View UI/UX Specification.
- [`docs/GAURDRAIL.md`](./docs/GAURDRAIL.md) — Operational, Security (RBAC/DOMPurify), and Zero-Purple Guardrails.
- [`docs/PROJECT_SETUP.md`](./docs/PROJECT_SETUP.md) — Detailed setup instructions, environment variables, and account setup.

---

## 🔐 Authentication

Create an account from the dedicated registration view. New accounts are assigned the `reader` role. Promote trusted users to `author` or `admin` through the MongoDB Compass `users` collection until an administrator-management workflow is configured.
