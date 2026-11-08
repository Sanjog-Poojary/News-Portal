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

## 📁 Project Structure & Documentation

All core architectural and design specifications are stored in the [`docs/`](./docs/) folder:

- [`docs/PRD.md`](./docs/PRD.md) — Product Requirements Document (Personas, Functional Requirements, Database Schema).
- [`docs/DESIGN.md`](./docs/DESIGN.md) — Visual Identity, Color System, and 7-View UI/UX Specification.
- [`docs/GAURDRAIL.md`](./docs/GAURDRAIL.md) — Operational, Security (RBAC/DOMPurify), and Zero-Purple Guardrails.
- [`docs/PROJECT_SETUP.md`](./docs/PROJECT_SETUP.md) — Detailed setup instructions, environment variables, and account setup.

---

## 🔐 Authentication

Create an account from the dedicated registration view. New accounts are assigned the `reader` role. Promote trusted users to `author` or `admin` through the MongoDB Compass `users` collection until an administrator-management workflow is configured.
