# Podcast Retrieval System

A full-stack app to fetch trending and searched podcasts, store them in MongoDB, and browse/play them in a React dashboard.

## Tech Stack
- Backend: FastAPI, Motor (MongoDB), httpx
- Frontend: React (Vite), TailwindCSS
- Data Source: Listen Notes API
- DB: MongoDB Atlas

## Quickstart

### 1) Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set DATABASE_URL and (optionally) LISTEN_NOTES_API_KEY
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API routes:
- GET `/podcasts/trending`
- GET `/podcasts/search?query=...`
- GET `/podcasts/saved`

### 2) Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Optionally set VITE_API_BASE (defaults to http://localhost:8000)
npm run dev
```
Open http://localhost:5173

## Notes
- Provide `LISTEN_NOTES_API_KEY` for successful trending/search responses.
- Results are stored in MongoDB collection `podcasts` under the specified database.


