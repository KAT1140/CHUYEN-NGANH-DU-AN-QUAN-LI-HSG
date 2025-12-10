# HSG Management — Backend + Frontend (scaffold)

This repository contains a scaffold for the HSG Management app.

Tech stack
- Backend: Node.js, Express, Sequelize (MySQL)
- Frontend: React (Vite) + Ant Design

Quick start (backend)

1. Copy `.env.example` to `.env` and set DB credentials.
2. From repository root:
```powershell
cd d:/xampp/htdocs/hsg-management-backend
npm install
npm start
```

Quick start (client)

```powershell
cd d:/xampp/htdocs/hsg-management-backend/client
npm install
npm run dev
```

Notes
- The backend serves static files from `client/dist` if available.
- Add Docker support later if desired.
