import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq

load_dotenv(Path(__file__).resolve().parent.parent / ".env")   # backend/.env

MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
_client = None


def get_client() -> Groq:
    # Create lazily so a missing GROQ_API_KEY shows up as a request error, not a crash on import
    global _client
    if _client is None:
        _client = Groq(api_key=os.environ["GROQ_API_KEY"])
    return _client

SYSTEM_PROMPT = """You are a helpful assistant that answers questions about a document the user uploaded.

Rules:
- Answer ONLY using the numbered context excerpts provided. Do not use outside knowledge.
- If the context does not contain the answer, say: "I couldn't find that in the document."
- Cite the excerpts you used with their numbers, like [1] or [2][3], right after the claim.
- Be clear and concise. Use bullet points or short paragraphs when helpful."""


def build_context(hits: list[dict]) -> str:
    blocks = []
    for i, hit in enumerate(hits, 1):
        blocks.append(f"[{i}] ({hit['source']})\n{hit['text']}")
    return "\n\n".join(blocks)


def generate_answer(question: str, hits: list[dict], history: list[dict] | None = None) -> str:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Earlier turns of the conversation (we'll use this from the web app)
    if history:
        messages.extend(history[-6:])   # last 3 Q&A pairs keeps the prompt small

    messages.append({
        "role": "user",
        "content": f"Context excerpts:\n\n{build_context(hits)}\n\nQuestion: {question}",
    })

    response = get_client().chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.2,
        max_completion_tokens=1024,
    )
    return response.choices[0].message.content