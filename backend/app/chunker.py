import re


def clean_text(text: str) -> str:
    text = text.replace("\r", "")
    text = re.sub(r"[ \t]+", " ", text)      # many spaces/tabs -> one space
    text = re.sub(r"\n{3,}", "\n\n", text)   # 3+ newlines -> one blank line
    return text.strip()


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 150) -> list[str]:
    text = clean_text(text)
    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))

        # If we're not at the end, move `end` back to a natural break point
        if end < len(text):
            window = text[start:end]
            for sep in ["\n\n", "\n", ". ", " "]:
                idx = window.rfind(sep)
                # only accept a break in the second half, so chunks don't get tiny
                if idx > chunk_size * 0.5:
                    end = start + idx + len(sep)
                    break

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        if end >= len(text):
            break
        start = end - overlap   # step back to create the overlap

    return chunks


def chunk_sections(sections: list[dict], chunk_size: int = 800, overlap: int = 150) -> list[dict]:
    """Chunk every parsed section, keeping track of where each chunk came from."""
    all_chunks = []
    for section in sections:
        for piece in chunk_text(section["text"], chunk_size, overlap):
            all_chunks.append({"text": piece, "source": section["source"]})
    return all_chunks