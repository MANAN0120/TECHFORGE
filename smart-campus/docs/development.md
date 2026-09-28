# Development Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm 9+

## Backend Setup

```bash
cd smart-campus/backend
python -m venv venv
venv\Scripts\activate         # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
python ../scripts/seed_database.py
uvicorn app.main:app --reload --port 8000
```

## Frontend Setup

```bash
cd smart-campus/frontend
npm install
npm run dev
```

## Running Tests

```bash
cd smart-campus/backend
pytest tests/ -v
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

See `docs/folder-structure.md` for detailed directory layout.
