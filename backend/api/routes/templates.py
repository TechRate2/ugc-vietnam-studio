"""Templates endpoint — list 30 templates skeleton."""

import json
from pathlib import Path

from fastapi import APIRouter, HTTPException
from loguru import logger

from core.config import settings

router = APIRouter()


def load_all_templates() -> list[dict]:
    """Load tất cả template JSON từ templates/ dir."""
    templates = []
    for json_file in settings.templates_dir.glob("*.json"):
        if json_file.name.startswith("_"):
            continue  # Skip _index.json
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                templates.append(json.load(f))
        except Exception as e:
            logger.warning(f"Failed to load {json_file}: {e}")
    return templates


@router.get("/")
async def list_templates(
    category: str = None,
    tier: str = None,
    audio_mode: str = None,
):
    """List templates với filter optional."""
    templates = load_all_templates()

    if category:
        templates = [t for t in templates if t.get("category") == category]

    if tier:
        templates = [t for t in templates if t.get("tier") == tier]

    if audio_mode:
        templates = [t for t in templates if t.get("audio_mode_default") == audio_mode]

    # Return summary (không trả full skeleton)
    summaries = [
        {
            "id": t["id"],
            "name_vn": t.get("name_vn"),
            "name_en": t.get("name_en"),
            "category": t.get("category"),
            "tier": t.get("tier"),
            "default_duration_s": t.get("default_duration_s"),
            "default_audio_mode": t.get("audio_mode_default"),
            "aspect_ratio": t.get("aspect_ratio"),
            "use_cases_vn": t.get("use_cases_vn", []),
        }
        for t in templates
    ]

    return {"templates": summaries, "total": len(summaries)}


@router.get("/{template_id}")
async def get_template_detail(template_id: str):
    """Get full skeleton của 1 template."""
    template_file = settings.templates_dir / f"{template_id}.json"
    if not template_file.exists():
        raise HTTPException(status_code=404, detail=f"Template {template_id} không tồn tại")

    with open(template_file, "r", encoding="utf-8") as f:
        return json.load(f)
