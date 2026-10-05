import os
import re
import shutil
import tempfile
import time
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.ingest import ingest_file
from app.parsers import PARSERS
from app.rag import answer_question
from app.vector_store import delete_document, delete_expired

# Vercel Functions reject request bodies over 4.5 MB, so keep uploads under that
MAX_FILE_MB = 4
DOC_ID_RE = re.compile(r"^[0-9a-f]{12}$")

# Documents only live for one chat session. The browser deletes its document when the
# session ends; anything left behind (closed laptop, crashed tab) is removed after this long.
SESSION_TTL_SECONDS = int(float(os.getenv("SESSION_TTL_HOURS", "2")) * 3600)
CLEANUP_EVERY_SECONDS = 15 * 60
_last_cleanup = 0.0

app = FastAPI(title="RAG Document Chat")

# Comma-separated list of frontend URLs allowed to call this API,
# e.g. "https://my-frontend.vercel.app,http://localhost:5173"
ALLOWED_ORIGINS = [
    o.strip().rstrip("/")
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Request / response shapes ----------

class ChatMessage(BaseModel):
    role: str        # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    doc_id: str
    question: str
    history: list[ChatMessage] = []


def check_doc_id(doc_id: str) -> None:
    if not DOC_ID_RE.match(doc_id):
        raise HTTPException(400, "Invalid document id.")


def cleanup_expired() -> list[str]:
    global _last_cleanup
    _last_cleanup = time.time()
    try:
        return delete_expired(SESSION_TTL_SECONDS)
    except Exception as e:
        print(f"[cleanup] failed: {e}")
        return []


# ---------- Routes ----------

@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload")
def upload(background: BackgroundTasks, file: UploadFile = File(...)):
    filename = Path(file.filename or "").name     # strip any folder path the client sent
    ext = Path(filename).suffix.lower()

    if ext not in PARSERS:
        raise HTTPException(400, f"Unsupported file type '{ext}'. Allowed: {', '.join(PARSERS)}")

    # Serverless filesystems are read-only except the temp dir, so parse from there
    fd, tmp_name = tempfile.mkstemp(suffix=ext)
    save_path = Path(tmp_name)
    try:
        with os.fdopen(fd, "wb") as out:
            shutil.copyfileobj(file.file, out)

        if save_path.stat().st_size > MAX_FILE_MB * 1024 * 1024:
            raise HTTPException(400, f"File too large. Max {MAX_FILE_MB} MB.")

        try:
            info = ingest_file(save_path)
        except ValueError as e:                    # e.g. scanned PDF with no text
            raise HTTPException(400, str(e))
        except Exception as e:                     # most likely the vector database
            raise HTTPException(502, f"Could not store the document: {e}")
    finally:
        save_path.unlink(missing_ok=True)

    info["filename"] = filename                    # show the original name, not the temp one

    # Sweep abandoned sessions now and then, after the response is sent
    if time.time() - _last_cleanup > CLEANUP_EVERY_SECONDS:
        background.add_task(cleanup_expired)
    return info


@app.post("/chat")
def chat(req: ChatRequest):
    check_doc_id(req.doc_id)
    question = req.question.strip()
    if not question:
        raise HTTPException(400, "Question cannot be empty.")

    history = [m.model_dump() for m in req.history]
    try:
        return answer_question(question, req.doc_id, history)
    except Exception as e:
        # Most likely a Groq or Upstash problem: bad key, rate limit, model removed
        raise HTTPException(502, f"LLM request failed: {e}")


@app.delete("/documents/{doc_id}")
def remove_document(doc_id: str):
    check_doc_id(doc_id)
    delete_document(doc_id)
    return {"deleted": doc_id}


@app.post("/documents/{doc_id}/delete")
def remove_document_beacon(doc_id: str):
    # Same as DELETE above, but reachable with navigator.sendBeacon (POST only),
    # which the frontend uses to clean up when the tab is closed
    return remove_document(doc_id)


@app.get("/cleanup")
def cleanup(authorization: str | None = Header(default=None)):
    # Called daily by Vercel Cron, which sends "Authorization: Bearer $CRON_SECRET"
    secret = os.getenv("CRON_SECRET")
    if not secret or authorization != f"Bearer {secret}":
        raise HTTPException(401, "Unauthorized")
    return {"deleted": cleanup_expired()}
