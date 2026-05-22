"""System prompts loader.

Đọc .md files trong thư mục này → cache trong memory.
KHÔNG hardcode prompts trong .py code — tách markdown để dễ iterate.
"""
from __future__ import annotations
from pathlib import Path
from functools import lru_cache

_DIR = Path(__file__).parent


@lru_cache(maxsize=8)
def load(name: str) -> str:
    """Load 1 system prompt file theo name (vd: 'director', 'scene', 'evaluation').

    Raises FileNotFoundError nếu file thiếu — fail-fast, KHÔNG silent fallback.
    """
    path = _DIR / f"{name}.md"
    if not path.exists():
        raise FileNotFoundError(f"system_prompt '{name}' not found at {path}")
    return path.read_text(encoding="utf-8")
