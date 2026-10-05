from app.vector_store import search, get_first_chunks
from app.llm import generate_answer

TOP_K = 5
MIN_SCORE = 0.25


def answer_question(question: str, doc_id: str, history: list[dict] | None = None) -> dict:
    hits = search(question, doc_id, k=TOP_K)

    # No chunks at all -> this doc_id doesn't exist in the database
    if not hits:
        return {
            "answer": "Document not found. Please upload it again.",
            "sources": [],
        }

    print(f"[rag] top score = {hits[0]['score']} for: {question!r}")   # debug

    # Weak match -> probably a broad question ("what is this about?", "summarize").
    # Give the LLM the document's opening chunks instead of refusing.
    if hits[0]["score"] < MIN_SCORE:
        hits = get_first_chunks(doc_id, n=TOP_K)

    answer = generate_answer(question, hits, history)
    return {"answer": answer, "sources": hits}