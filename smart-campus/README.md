# 🏫 Smart Campus Navigation & Assistance System

A production-quality campus navigation platform built for university hackathons. The primary demo campus is **Chandigarh University (CU), Gharuan, Punjab, India**.

## ✨ Features

- **Interactive Dark Map** — CartoDB Dark Matter tiles with building polygons, POI markers, and cart tracking
- **Intelligent Search** — Fuzzy search across buildings, departments, POIs, shops, and events
- **Turn-by-Turn Navigation** — NetworkX-powered routing with walking directions
- **Accessibility Mode** — Wheelchair-friendly routes avoiding stairs
- **AI Campus Assistant** — Natural language Q&A powered by Google Gemini
- **Campus Events** — Live event feed with photo uploads
- **Campus Carts** — Real-time cart tracking with ETA estimates
- **Shop Directory** — Reviews, ratings, and photo galleries
- **Admin Dashboard** — Manage events, carts, conditions, and notifications

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Map | Leaflet, react-leaflet, OpenStreetMap |
| Backend | Python 3.11, FastAPI, Uvicorn |
| Graph Engine | NetworkX |
| Database | SQLite (PostgreSQL-ready) |
| AI | Google Gemini 1.5 Flash |
| Validation | Pydantic v2 |

## 🚀 Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GEMINI_API_KEY
python ../scripts/seed_database.py
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Verify

- Backend health: http://localhost:8000/health
- API docs: http://localhost:8000/docs
- Frontend: http://localhost:5173

## 📁 Architecture

```
smart-campus/
├── frontend/          React + TypeScript + Tailwind
├── backend/           Python + FastAPI
├── campus-data/       JSON manifests (campus-agnostic)
├── database/          SQL schema
├── scripts/           Seeding and utilities
├── docs/              Architecture documentation
├── tests/             Test suites
└── uploads/           User uploads (gitignored)
```

## 🎨 Design System

Premium dark theme with lime accents:
- **Background**: `#09090B`
- **Surface**: `#18181B`
- **Primary (Lime)**: `#A3E635`
- **Text**: `#FAFAFA`

## 📄 License

MIT
