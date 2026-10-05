# Pixel Study Buddy

Upload a document (PDF, DOCX, PPTX, TXT, MD) and chat with it. Answers come only from the
document and cite the passages they use (retrieval-augmented generation).

```
frontend/   React + Vite UI
backend/    FastAPI API: parse → chunk → Upstash Vector (embeddings + search) → Groq LLM
```

Each document lives only for the chat session. It's deleted when you eject it or close the tab.

See [DEPLOYMENT.md](DEPLOYMENT.md) to deploy both parts to Vercel and to run them locally.
