"""Vercel build step: bundle the embedding model so cold starts don't download it.

Never fails the build: if the download doesn't work, the backend downloads
the model at runtime instead (slower first request, same results).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

try:
    from huggingface_hub import snapshot_download

    from app.embeddings import BUNDLED_MODEL_DIR, MODEL_HF_REPO

    snapshot_download(repo_id=MODEL_HF_REPO, local_dir=str(BUNDLED_MODEL_DIR))
    print(f"Embedding model bundled in {BUNDLED_MODEL_DIR}")
except Exception as e:
    print(f"Could not bundle the embedding model ({e}); it will be downloaded at runtime.")
