# Podcast Retrieval System

## Backend (FastAPI)

Requirements: Python 3.11+

1. Create `.env` in `backend/`:

```
DATABASE_URL=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
LISTEN_NOTES_API_KEY=<optional>
SPOTIFY_CLIENT_ID=<optional>
SPOTIFY_CLIENT_SECRET=<optional>
```

2. Install dependencies and run:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Endpoints:
- `GET /podcasts/trending`
- `GET /podcasts/search?query=...&provider=listen_notes|spotify`
- `GET /podcasts/saved`

Notes:
- Spotify API via Client Credentials cannot provide direct audio URLs; the frontend player will show "No audio available" for Spotify results.
- Listen Notes often provides direct episode audio URLs so the player works there.
- All results are stored in MongoDB `podcasts` collection.

## Frontend (React + Vite + Tailwind)

```bash
cd frontend
npm install
npm run dev
```

Environment variable (optional):
- `VITE_API_BASE` (default `http://localhost:8000`)

Open http://localhost:5173

## Notes
- Uses Listen Notes public API. Provide `LISTEN_NOTES_API_KEY` for higher rate limits.
- Stores normalized podcast documents in MongoDB `podcasts` collection.
- Sanitizes search inputs and handles API failures by returning empty lists.
