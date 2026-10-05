import os
import time
from pathlib import Path

from dotenv import load_dotenv
from upstash_vector import Index, Vector

from app.embeddings import embed_query, embed_texts

load_dotenv(Path(__file__).resolve().parent.parent / ".env")   # backend/.env

# Upstash Vector is a hosted vector database: data survives across serverless
# invocations. The index uses a "Custom" embedding model (384 dims, cosine):
# we embed the text ourselves in app/embeddings.py and send the vectors.
# Each uploaded document lives in its own namespace, named after its doc_id.
BATCH_SIZE = 100
_index = None


def get_index() -> Index:
    # Create lazily so a missing env var shows up as a request error, not a crash on import
    global _index
    if _index is None:
        _index = Index(
            url=os.environ["UPSTASH_VECTOR_REST_URL"],
            token=os.environ["UPSTASH_VECTOR_REST_TOKEN"],
        )
    return _index


def _to_similarity(score: float) -> float:
    # Upstash reports cosine as (1 + cos) / 2 in [0, 1]; convert back to plain cosine similarity
    return round(2 * score - 1, 3)


def add_chunks(doc_id: str, chunks: list[dict]) -> int:
    """Embed chunks and store them in the doc_id namespace."""
    index = get_index()
    created_at = int(time.time())   # lets expired sessions be cleaned up later
    for start in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[start:start + BATCH_SIZE]
        vectors = embed_texts([c["text"] for c in batch])
        index.upsert(
            vectors=[
                Vector(
                    id=f"{doc_id}_{start + i}",
                    vector=vectors[i],
                    metadata={
                        "text": c["text"],
                        "source": c["source"],
                        "chunk_index": start + i,
                        "created_at": created_at,
                    },
                )
                for i, c in enumerate(batch)
            ],
            namespace=doc_id,
        )
    return len(chunks)


def search(query: str, doc_id: str, k: int = 5) -> list[dict]:
    """Return the k chunks from this document most similar to the query."""
    results = get_index().query(
        vector=embed_query(query),
        top_k=k,
        include_metadata=True,
        namespace=doc_id,
    )
    return [
        {
            "text": r.metadata["text"],
            "source": r.metadata["source"],
            "score": _to_similarity(r.score),
        }
        for r in results
    ]


def delete_document(doc_id: str) -> None:
    try:
        get_index().delete_namespace(doc_id)
    except Exception:
        pass   # namespace already gone (or never existed) -> nothing to delete


def delete_expired(max_age_seconds: int) -> list[str]:
    """Delete documents older than max_age_seconds (sessions the browser never closed cleanly)."""
    index = get_index()
    cutoff = time.time() - max_age_seconds
    deleted = []
    for doc_id in index.list_namespaces():
        if not doc_id:
            continue   # the default namespace isn't used by this app
        first = index.fetch(ids=[f"{doc_id}_0"], include_metadata=True, namespace=doc_id)[0]
        created_at = (first.metadata or {}).get("created_at", 0) if first else 0
        if created_at < cutoff:
            delete_document(doc_id)
            deleted.append(doc_id)
    return deleted


def get_first_chunks(doc_id: str, n: int = 5) -> list[dict]:
    """Return the first n chunks of a document (title, intro, abstract usually live here)."""
    results = get_index().fetch(
        ids=[f"{doc_id}_{i}" for i in range(n)],
        include_metadata=True,
        namespace=doc_id,
    )
    # fetch() keeps the order of the ids and returns None for ids that don't exist
    return [
        {"text": r.metadata["text"], "source": r.metadata["source"], "score": None}
        for r in results
        if r is not None
    ]
