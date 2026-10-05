import uuid
from pathlib import Path

from app.parsers import parse_document
from app.chunker import chunk_sections
from app.vector_store import add_chunks


def ingest_file(path: str | Path) -> dict:
    path = Path(path)
    sections = parse_document(path)
    if not sections:
        raise ValueError("No text could be extracted from this file.")

    chunks = chunk_sections(sections)
    doc_id = uuid.uuid4().hex[:12]   # random unique id for this upload
    add_chunks(doc_id, chunks)

    return {
        "doc_id": doc_id,
        "filename": path.name,
        "num_sections": len(sections),
        "num_chunks": len(chunks),
    }