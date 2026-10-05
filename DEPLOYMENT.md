# Deploying to Vercel

The app is deployed as **two separate Vercel projects** from this repo:

| Project  | Root Directory | Framework preset |
|----------|----------------|------------------|
| Backend  | `backend`      | FastAPI (auto-detected from `app/main.py`) |
| Frontend | `frontend`     | Vite |

## 1. Create the Upstash Vector index

Vercel functions are serverless: the local disk is temporary and not shared between
instances, and the bundle can't fit PyTorch. So document chunks are stored in
**Upstash Vector**, which also creates the embeddings.

1. Create a free index at https://console.upstash.com/vector, or through Vercel → Storage → Upstash.
2. **Embedding model:** `sentence-transformers/all-MiniLM-L6-v2` (the same model the app used locally).
   **Metric:** `COSINE`.
3. Copy `UPSTASH_VECTOR_REST_URL` and `UPSTASH_VECTOR_REST_TOKEN`.

## 2. Deploy the backend

1. Vercel → Add New Project → import the repo → set **Root Directory** to `backend`.
2. Add these environment variables:

   | Name | Value |
   |------|-------|
   | `GROQ_API_KEY` | your Groq key |
   | `GROQ_MODEL` | `openai/gpt-oss-120b` (optional) |
   | `UPSTASH_VECTOR_REST_URL` | from step 1 |
   | `UPSTASH_VECTOR_REST_TOKEN` | from step 1 |
   | `ALLOWED_ORIGINS` | the frontend URL, e.g. `https://your-frontend.vercel.app` (add it after step 3) |
   | `CRON_SECRET` | any long random string (secures the daily `/cleanup` cron) |
   | `SESSION_TTL_HOURS` | `2` (optional): how long leftover documents may live |

3. Deploy, then check `https://<backend>.vercel.app/health`. It should return `{"status":"ok"}`.

## 3. Deploy the frontend

1. Add New Project → same repo → set **Root Directory** to `frontend`.
2. Add the environment variable `VITE_API_URL` = `https://<backend>.vercel.app`.
   Vite inlines it at build time, so **redeploy after changing it**.
3. Deploy.

## 4. Connect the two

Set the backend's `ALLOWED_ORIGINS` to the frontend's production URL (comma-separate
several URLs if needed), then redeploy the backend. Preview deployments get different
URLs, so add those as well if you want previews to talk to the backend.

## Document lifecycle

Uploaded files are never written to the project. They're parsed from a temp file that's
deleted right away, so storage doesn't grow. Chunks in Upstash live only for one chat session:

1. **Eject** in the UI deletes the document.
2. **Closing or reloading the tab** sends a `navigator.sendBeacon` delete.
3. **Leftovers** (crashed tab, closed laptop) older than `SESSION_TTL_HOURS` are swept after
   uploads (at most every 15 min) and by a daily Vercel Cron job (`/cleanup`, in `backend/vercel.json`).

## Limits to know

- **Uploads are capped at 4 MB.** Vercel rejects request bodies over 4.5 MB.
- Function timeout is set to 60 s in `backend/vercel.json`. Big documents take longer
  to ingest because Upstash embeds every chunk.

## Local development

```bash
# backend (needs the same env vars in backend/.env; see backend/.env.example)
cd backend
python -m venv .venv && .venv\Scripts\activate   # macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000

# frontend (.env.development already points at http://localhost:8000)
cd frontend
npm install
npm run dev
```
