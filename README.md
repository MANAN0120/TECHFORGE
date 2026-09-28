<p align="center">
  <img src="https://img.shields.io/badge/TECHFORGE-Smart%20Campus-A3E635?style=for-the-badge&labelColor=09090B" alt="TECHFORGE Badge" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React%2018-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Gemini%20AI-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
</p>

# 🏫 TECHFORGE — Smart Campus Navigation & Assistance System

> An intelligent, full-stack campus navigation platform with AI-powered assistance, real-time cart tracking, event management, and accessibility-first routing — built for **Chandigarh University (CU), Gharuan, Punjab, India**.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Campus Data Format](#-campus-data-format)
- [Testing](#-testing)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

**TECHFORGE Smart Campus** is a production-quality platform that transforms how students, faculty, and visitors navigate and interact with a university campus. It combines an interactive dark-themed map, intelligent search, graph-powered turn-by-turn navigation, and a Google Gemini–powered AI assistant into a single cohesive experience.

The system is designed to be **campus-agnostic** — while the primary deployment targets Chandigarh University, the JSON-based data layer makes it easy to add any campus.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🗺️ **Interactive Dark Map** | CartoDB Dark Matter tiles with building polygons, POI markers, and real-time overlays via Leaflet |
| 🔍 **Intelligent Search** | Fuzzy search across buildings, departments, POIs, shops, and events with instant results |
| 🧭 **Turn-by-Turn Navigation** | NetworkX-powered graph routing with step-by-step walking directions |
| ♿ **Accessibility Mode** | Wheelchair-friendly route planning that avoids stairs and inaccessible paths |
| 🤖 **AI Campus Assistant** | Natural-language Q&A powered by Google Gemini 1.5 Flash with campus context |
| 📅 **Campus Events** | Live event feed with photo uploads, categorization, and date filtering |
| 🛒 **Campus Cart Tracking** | Real-time golf cart / shuttle positions with ETA estimates |
| 🏪 **Shop Directory** | Browse campus shops with reviews, ratings, and photo galleries |
| 🔔 **Notifications** | Real-time campus alerts and condition reports |
| 🛡️ **Admin Dashboard** | Manage events, carts, conditions, notifications, and campus data |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework with TypeScript |
| Vite 5 | Lightning-fast dev server & bundler |
| Tailwind CSS 3 | Utility-first styling with custom dark theme |
| Leaflet + react-leaflet | Interactive map rendering |
| Lucide React | Icon system |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.11+ | Core language |
| FastAPI | High-performance async API framework |
| SQLAlchemy 2.0 | Async ORM with SQLite (PostgreSQL-ready) |
| NetworkX | Graph-based campus route computation |
| Google Generative AI | Gemini 1.5 Flash for AI assistant |
| Pydantic v2 | Request/response validation |
| Uvicorn | ASGI server |

---

## 🏗 Architecture

```
TECHFORGE/
└── smart-campus/
    ├── frontend/                 # React + TypeScript + Tailwind
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── Admin/        # Admin dashboard panels
    │   │   │   ├── Assistant/    # AI chatbot interface
    │   │   │   ├── BuildingDetail/ # Building info overlays
    │   │   │   ├── Carts/        # Cart tracking UI
    │   │   │   ├── Events/       # Event feed & creation
    │   │   │   ├── Map/          # Leaflet map container
    │   │   │   ├── Navbar/       # Top navigation bar
    │   │   │   ├── Navigation/   # Route display & directions
    │   │   │   ├── Notifications/ # Alert banners
    │   │   │   ├── Search/       # Search bar & results
    │   │   │   └── Shops/        # Shop listings & reviews
    │   │   ├── services/         # API client functions
    │   │   └── types/            # TypeScript type definitions
    │   └── ...config files
    │
    ├── backend/                  # Python + FastAPI
    │   └── app/
    │       ├── ai/               # Gemini AI integration
    │       ├── api/              # Route handlers
    │       │   ├── admin.py      # Admin CRUD endpoints
    │       │   ├── assistant.py  # AI chat endpoint
    │       │   ├── campus.py     # Buildings, departments, POIs
    │       │   ├── carts.py      # Cart tracking endpoints
    │       │   ├── events.py     # Event management
    │       │   ├── notifications.py
    │       │   ├── routing.py    # Navigation & pathfinding
    │       │   ├── search.py     # Unified search
    │       │   └── shops.py      # Shop & review endpoints
    │       ├── core/             # Config, database, dependencies
    │       ├── models/           # SQLAlchemy ORM models
    │       ├── repositories/     # Data access layer
    │       ├── schemas/          # Pydantic request/response schemas
    │       └── services/         # Business logic layer
    │
    ├── campus-data/              # JSON campus manifests (campus-agnostic)
    │   └── cu-gharaun/           # Chandigarh University dataset
    │       ├── campus.json       # Campus metadata & center coords
    │       ├── buildings.json    # Building polygons & metadata
    │       ├── departments.json  # Academic departments
    │       ├── pois.json         # Points of interest
    │       ├── shops.json        # On-campus shops
    │       ├── carts.json        # Cart routes & stops
    │       ├── nodes.json        # Navigation graph nodes
    │       ├── paths.json        # Navigation graph edges
    │       └── events.sample.json
    │
    ├── database/                 # SQL schema definitions
    │   └── schema.sql
    ├── scripts/                  # Database seeding & utilities
    │   └── seed_database.py
    ├── tests/                    # Comprehensive test suites
    │   ├── api/                  # API endpoint tests
    │   ├── routing/              # Pathfinding tests
    │   ├── search/               # Search tests
    │   ├── carts/                # Cart tracking tests
    │   ├── events/               # Event tests
    │   ├── shops/                # Shop & review tests
    │   ├── assistant/            # AI assistant tests
    │   ├── accessibility/        # Accessibility route tests
    │   └── campus/               # Campus data tests
    ├── docs/                     # Project documentation
    └── uploads/                  # User-uploaded media (gitignored)
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.11 or higher
- **Node.js** 18+ and npm
- **Git**
- A **Google Gemini API Key** ([get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/MANAN0120/TECHFORGE.git
cd TECHFORGE/smart-campus
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env
# Edit .env and set your GEMINI_API_KEY

# Seed the database with campus data
python ../scripts/seed_database.py

# Start the API server
uvicorn app.main:app --reload
```

The API will be available at **http://localhost:8000**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173**

### 4. Verify Everything Works

| Endpoint | URL |
|---|---|
| 🟢 Health Check | http://localhost:8000/health |
| 📖 Swagger Docs | http://localhost:8000/docs |
| 🖥️ Frontend | http://localhost:5173 |

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`. Full interactive documentation is available at `/docs` when the backend is running.

| Module | Endpoints | Description |
|---|---|---|
| **Campus** | `GET /campus`, `GET /buildings`, `GET /departments`, `GET /pois` | Campus metadata and spatial data |
| **Search** | `GET /search?q=...` | Unified fuzzy search across all entities |
| **Routing** | `POST /route` | Turn-by-turn navigation between two points |
| **Events** | `GET /events`, `POST /events`, `PUT /events/{id}` | Campus event CRUD with photo upload |
| **Carts** | `GET /carts`, `GET /carts/{id}` | Real-time campus cart positions & ETAs |
| **Shops** | `GET /shops`, `GET /shops/{id}`, `POST /shops/{id}/reviews` | Shop directory with reviews & ratings |
| **Assistant** | `POST /assistant/ask` | AI-powered campus Q&A |
| **Notifications** | `GET /notifications` | Campus alerts and condition reports |
| **Admin** | `POST /admin/*` | Protected admin management endpoints |

---

## 🗂 Campus Data Format

The system is designed to support **multiple campuses**. Each campus is a directory under `campus-data/` containing JSON files that describe the campus layout, buildings, navigation graph, and amenities.

To add a new campus:

1. Create a directory: `campus-data/<campus-id>/`
2. Populate the required JSON files (see `campus-data/cu-gharaun/README.md` for the schema)
3. Update `DEFAULT_CAMPUS_ID` in your `.env`
4. Re-run `python scripts/seed_database.py`

---

## 🧪 Testing

```bash
cd smart-campus

# Run all tests
pytest tests/ -v

# Run specific test suites
pytest tests/routing/ -v         # Navigation & pathfinding
pytest tests/search/ -v          # Search functionality
pytest tests/accessibility/ -v   # Accessibility routing
pytest tests/api/ -v             # API endpoint tests
```

---

## 🎨 Design System

The frontend uses a premium dark theme with vibrant lime accents:

| Token | Value | Usage |
|---|---|---|
| Background | `#09090B` | Page background |
| Surface | `#18181B` | Cards, panels, modals |
| Primary (Lime) | `#A3E635` | Buttons, highlights, active states |
| Text | `#FAFAFA` | Primary text |
| Muted | `#71717A` | Secondary text, borders |

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. **Fork** this repository
2. **Create a branch**: `git checkout -b feature/your-feature`
3. **Make your changes** and commit: `git commit -m "Add your feature"`
4. **Push** to your fork: `git push origin feature/your-feature`
5. Open a **Pull Request**

Please ensure:
- Code follows the existing project conventions
- New features include appropriate tests
- The README is updated if you add new endpoints or features

---

## 👥 Team

**TECHFORGE** — Built with ❤️ for university hackathons.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
