import os
import tempfile
from pathlib import Path

from fastembed import TextEmbedding

# Same model the app used with sentence-transformers, run through ONNX instead of PyTorch
# so the backend stays small enough for Vercel. 384-dimensional, normalized vectors.
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
MODEL_HF_REPO = "qdrant/all-MiniLM-L6-v2-onnx"
EMBEDDING_DIM = 384

# Downloaded into the deployment at build time by scripts/download_model.py
BUNDLED_MODEL_DIR = Path(__file__).resolve().parent.parent / "model"

_model = None


def get_model() -> TextEmbedding:
    # Load lazily and only once per server instance
    global _model
    if _model is None:
        if (BUNDLED_MODEL_DIR / "model.onnx").exists():
            _model = TextEmbedding(MODEL_NAME, specific_model_path=str(BUNDLED_MODEL_DIR))
        else:
            # Not bundled (e.g. local dev): download once into the writable temp dir
            cache_dir = os.path.join(tempfile.gettempdir(), "fastembed_cache")
            _model = TextEmbedding(MODEL_NAME, cache_dir=cache_dir)
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    return [v.tolist() for v in get_model().embed(texts)]


def embed_query(query: str) -> list[float]:
    return embed_texts([query])[0]
