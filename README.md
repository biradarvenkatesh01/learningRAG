# Pixel Study Buddy

> An interactive, retro pixel-art aesthetic study companion powered by Retrieval-Augmented Generation (RAG). Upload your course notes, slides, or documents and ask questions—answers come strictly from your document with cited sources and match percentages.

---

## Features

- **Document Cartridge Slot**: Supports `.pdf`, `.docx`, `.pptx`, `.txt`, and `.md` files up to 20MB (4MB on serverless deployments).
- **Strict Grounded RAG**: Answers cite verbatim passages with source match percentages and confidence tags (`HIGH CONFIDENCE`, `PARTIAL MATCH`, etc.).
- **Byte the Study Mascot**: Pixel-art companion with dynamic mood states (happy, curious, thinking, excited).
- **Interactive Study Tools**:
  - **Pixel Pomodoro Timer**: 25/5 study & break intervals with retro chiptune sound cues.
  - **Procedural 8-Bit BGM Synth**: Zero external MP3 files—a pure Web Audio API procedural lo-fi study groove that loops seamlessly.
  - **RAG Inspector**: Expandable sources drawer showing chunk snippets, match scores, and metadata.
- **Privacy-First Ephemeral Storage**: Uploaded files and vector embeddings live only for your session. They are automatically pruned on cartridge eject or tab closure.
- **Day & Night Themes**: Nostalgic newspaper halftone day palette and sleek arcade CRT dark mode.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite | High-performance SPA with instant HMR |
| **Animation & Audio** | Motion (`motion/react`), Web Audio API | Micro-interactions & procedural chiptune synth |
| **Backend API** | FastAPI, Python 3.11+ | Serverless REST API endpoints |
| **Vector DB** | Upstash Vector | Cloud-native vector search (`all-MiniLM-L6-v2`) |
| **LLM Inference** | Groq (`openai/gpt-oss-120b` or Llama 3) | Sub-second generative response latency |
| **Parsers** | PyPDF, `python-docx`, `python-pptx` | Comprehensive multi-format text extraction |

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application & endpoints
│   │   ├── rag.py           # RAG retrieval & answer generation pipeline
│   │   ├── vector_store.py  # Upstash Vector store integration
│   │   ├── llm.py           # Groq LLM integration
│   │   ├── parsers.py       # PDF, DOCX, PPTX, TXT document parsers
│   │   ├── chunker.py       # Semantic text chunking
│   │   └── ingest.py        # Ingestion pipeline
│   ├── requirements.txt     # Python production dependencies
│   ├── vercel.json          # Serverless deployment configuration
│   └── .env.example         # Backend environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/      # Byte, ChatScreen, UploadScreen, Pomodoro, etc.
│   │   ├── ambient/         # Web Audio procedural BGM synthesizer
│   │   ├── styles/          # Pixel design system, retro typography & themes
│   │   └── api.js           # Frontend API client
│   ├── package.json         # Node.js dependencies
│   └── .env.example         # Frontend environment variables template
└── README.md
```

---

## Local Development

### 1. Prerequisites

- Python 3.11 or newer
- Node.js 18 or newer
- Free [Groq API Key](https://console.groq.com/keys)
- Free [Upstash Vector Index](https://console.upstash.com/vector) (Model: `sentence-transformers/all-MiniLM-L6-v2`, Metric: `COSINE`)

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements-dev.txt

# Configure environment variables
cp .env.example .env
```

Fill in `backend/.env`:
```ini
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
UPSTASH_VECTOR_REST_URL=https://your-index.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your_upstash_token_here
ALLOWED_ORIGINS=http://localhost:5173
SESSION_TTL_HOURS=2
```

Run the backend development server:
```bash
uvicorn app.main:app --reload --port 8000
```
Verify the health check at `http://localhost:8000/health`.

### 3. Frontend Setup

In another terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Deployment (Vercel)

Both parts can be deployed as two projects in the same Vercel account:

### 1. Deploy the Backend

1. Import the repository in Vercel.
2. Set **Root Directory** to `backend`.
3. Add the environment variables:
   - `GROQ_API_KEY`
   - `GROQ_MODEL` (e.g. `openai/gpt-oss-120b`)
   - `UPSTASH_VECTOR_REST_URL`
   - `UPSTASH_VECTOR_REST_TOKEN`
   - `ALLOWED_ORIGINS` (set to your frontend domain after step 2)
   - `CRON_SECRET` (random secret key for scheduled cleanup)
   - `SESSION_TTL_HOURS` (`2`)
4. Deploy and verify `https://<your-backend>.vercel.app/health`.

### 2. Deploy the Frontend

1. Import the same repository in Vercel as a new project.
2. Set **Root Directory** to `frontend`.
3. Set the environment variable:
   - `VITE_API_URL` = `https://<your-backend>.vercel.app`
4. Deploy the frontend.
5. Update `ALLOWED_ORIGINS` in the backend settings with your frontend URL and trigger a redeploy of the backend.

---

## Document Lifecycle & Security

- **No Persistent Document Storage**: Uploaded files are temporarily read into memory/temp buffers for chunking and discarded immediately.
- **Session Cleanup**: Chunks stored in Upstash Vector are indexed under an ephemeral `doc_id`.
- **Eject & Unload**: Ejecting the document from the chat UI or closing the tab sends a delete beacon to remove vectors from Upstash.
- **Automated Sweeper**: Stale sessions older than `SESSION_TTL_HOURS` are purged automatically via `/cleanup`.

---

## License

MIT
