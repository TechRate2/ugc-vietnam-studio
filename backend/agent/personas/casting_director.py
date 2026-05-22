"""DEPRECATED — Persona 5: Casting Director.

BUG-L4 fix: file giữ chỉ để backward compat, KHÔNG dùng nữa.
Lý do deprecate: anh không có preset avatar library. User upload `referenceImages`
trực tiếp → ReferenceAnalyzer (`reference_analyzer.py`) phân tích role + map vào shots.

→ Nếu import file này nhầm, raise warning để dev biết.

Replacement: `from agent.personas import reference_analyzer`
"""

import warnings as _warnings
_warnings.warn(
    "casting_director is DEPRECATED — use reference_analyzer instead. "
    "Anh không có preset avatar library; user upload ref images trực tiếp.",
    DeprecationWarning,
    stacklevel=2,
)

from pathlib import Path
from typing import Optional

import yaml
from loguru import logger


_DB_PATH = Path(__file__).parent.parent.parent / "skill_packs" / "_shared" / "personas_db.yaml"


def _load_db() -> dict:
    """Load personas DB từ YAML (cached on first call)."""
    if not hasattr(_load_db, "_cache"):
        with open(_DB_PATH, encoding="utf-8") as f:
            _load_db._cache = yaml.safe_load(f)
    return _load_db._cache


def cast_avatars(
    cinematic_brief: dict,
    skill_pack: dict,
    product_positioning: dict,
    top_n: int = 3,
) -> list[dict]:
    """Match top N avatar candidates.

    Args:
        cinematic_brief: từ Director (visual_style.mood, etc).
        skill_pack: niche skill pack với persona_filter.
        product_positioning: từ ProductStrategist (target_persona).
        top_n: số candidates trả về.

    Returns:
        list of avatar dicts sorted by composite_score DESC.
    """
    db = _load_db()
    all_avatars: list[dict] = db.get("avatars", [])
    weights: dict = db.get("casting_weights", {})
    mood_map: dict = db.get("mood_to_vibes", {})

    persona_filter = (
        skill_pack.get("preferred_models", {}).get("persona_filter")
        or skill_pack.get("persona_filter")
        or {}
    )
    target_persona = product_positioning.get("product", {}).get("target_persona", {})

    # === Step 1: Hard filter ===
    candidates = _hard_filter(all_avatars, persona_filter, target_persona)
    logger.info(
        f"[CastingDirector] hard filter: {len(all_avatars)} → {len(candidates)} candidates "
        f"(gender={persona_filter.get('gender')}, vibes={persona_filter.get('vibes')})"
    )

    if not candidates:
        # Fallback L1: nếu filter quá strict → relax gender check (giữ age overlap)
        logger.warning("[CastingDirector] empty after filter — relaxing gender constraint")
        candidates = _hard_filter(all_avatars, {}, target_persona)

    if not candidates:
        # Fallback L2: cả age cũng fail → return ALL avatars (UI luôn có lựa chọn)
        # Production-safe: KHÔNG trả empty cho UI vì user không có ai để pick.
        logger.warning(
            f"[CastingDirector] empty sau cả gender+age relax — fallback return all {len(all_avatars)} avatars"
        )
        candidates = list(all_avatars)

    # === Step 2: Score each candidate ===
    niche = skill_pack.get("id", "")
    raw_mood = cinematic_brief.get("visual_style", {}).get("mood", "") or ""
    # Normalize: lowercase + take first word (Director may return "energetic, playful")
    cinematic_mood = (
        str(raw_mood).lower().split(",")[0].strip().replace(" ", "-")
    )
    mood_compatible_vibes: list[str] = mood_map.get(cinematic_mood, [])

    scored: list[tuple[float, dict]] = []
    for avatar in candidates:
        score = _score_avatar(
            avatar=avatar,
            niche=niche,
            cinematic_mood=cinematic_mood,
            mood_compatible_vibes=mood_compatible_vibes,
            target_persona=target_persona,
            persona_filter=persona_filter,
            weights=weights,
        )
        scored.append((score, avatar))

    # === Step 3: Sort + top N + add score to output ===
    scored.sort(key=lambda x: x[0], reverse=True)
    result = []
    for score, avatar in scored[:top_n]:
        avatar_out = dict(avatar)
        avatar_out["casting_score"] = round(score, 2)
        avatar_out["casting_rationale"] = _rationale(avatar, niche, cinematic_mood)
        result.append(avatar_out)

    logger.info(
        f"[CastingDirector] top {len(result)}: "
        + ", ".join(f"{a['id']}={a['casting_score']}" for a in result)
    )
    return result


# ============================================
# Filtering helpers
# ============================================

def _hard_filter(
    avatars: list[dict],
    persona_filter: dict,
    target_persona: dict,
) -> list[dict]:
    """Apply hard constraints — gender, age overlap."""
    result = []
    for avatar in avatars:
        # Gender check (nếu skill pack specify)
        wanted_gender = persona_filter.get("gender")
        if wanted_gender and wanted_gender != "any":
            if avatar.get("gender") != wanted_gender:
                continue

        # Age overlap (avatar.age_range ∩ filter/target.age_range ≠ ∅)
        wanted_age = persona_filter.get("age_range") or _parse_age_range(
            target_persona.get("age_range")
        )
        if wanted_age:
            wmin, wmax = wanted_age
            amin, amax = avatar.get("age_range", [18, 50])
            if amax < wmin or amin > wmax:
                continue

        result.append(avatar)
    return result


def _parse_age_range(age_str: Optional[str]) -> Optional[list[int]]:
    """'22-32' → [22, 32]."""
    if not age_str:
        return None
    try:
        parts = age_str.replace(" ", "").split("-")
        return [int(parts[0]), int(parts[1])]
    except (ValueError, IndexError):
        return None


# ============================================
# Scoring
# ============================================

def _score_avatar(
    avatar: dict,
    niche: str,
    cinematic_mood: str,
    mood_compatible_vibes: list[str],
    target_persona: dict,
    persona_filter: dict,
    weights: dict,
) -> float:
    """Composite score 0-10."""
    score = 0.0

    # 1. Niche tag match (40%)
    niche_root = niche.split(".")[0] if niche else ""
    avatar_tags = [t.lower() for t in avatar.get("niche_tags", [])]
    if niche and niche.lower() in avatar_tags:
        score += weights.get("niche_tag_match", 0.40) * 10.0
    elif niche_root and any(t.startswith(niche_root.lower()) for t in avatar_tags):
        score += weights.get("niche_tag_match", 0.40) * 7.0
    # else: 0

    # 2. Vibe match (25%) — avatar's vibes ∩ mood_compatible_vibes
    avatar_vibes = set(avatar.get("vibes", []))
    if mood_compatible_vibes:
        overlap = avatar_vibes.intersection(set(mood_compatible_vibes))
        if overlap:
            score += weights.get("vibe_match", 0.25) * (10.0 if len(overlap) >= 2 else 7.0)

    # Also check explicit skill_pack vibes preference
    wanted_vibes = set(persona_filter.get("vibes", []))
    if wanted_vibes:
        overlap2 = avatar_vibes.intersection(wanted_vibes)
        if overlap2:
            score += weights.get("vibe_match", 0.25) * 5.0  # bonus

    # 3. Voice gender match (15%)
    wanted_voice_gender = persona_filter.get("voice_gender")
    if wanted_voice_gender:
        if (wanted_voice_gender == "female" and avatar.get("gender") == "F") or \
           (wanted_voice_gender == "male" and avatar.get("gender") == "M"):
            score += weights.get("voice_gender_match", 0.15) * 10.0

    # 4. Age match overlap quality (15%)
    target_age = _parse_age_range(target_persona.get("age_range"))
    if target_age:
        tmin, tmax = target_age
        amin, amax = avatar.get("age_range", [18, 50])
        overlap_size = max(0, min(tmax, amax) - max(tmin, amin))
        target_span = tmax - tmin or 1
        match_quality = min(1.0, overlap_size / target_span)
        score += weights.get("age_match", 0.15) * 10.0 * match_quality

    # 5. Personality fit (5%) — based on cinematic mood semantics
    personality_traits = avatar.get("personality_traits", [])
    if cinematic_mood == "energetic" and "energetic" in personality_traits:
        score += weights.get("personality_fit", 0.05) * 10.0
    elif cinematic_mood == "luxury" and "professional" in personality_traits:
        score += weights.get("personality_fit", 0.05) * 10.0
    elif cinematic_mood == "authentic-raw" and "authentic" in personality_traits:
        score += weights.get("personality_fit", 0.05) * 10.0

    return score


def _rationale(avatar: dict, niche: str, cinematic_mood: str) -> str:
    """Short human-readable rationale."""
    parts = []
    if niche and niche in (avatar.get("niche_tags") or []):
        parts.append(f"niche match exact ({niche})")
    if cinematic_mood:
        parts.append(f"vibe phù mood '{cinematic_mood}'")
    if avatar.get("voice_label"):
        parts.append(f"voice {avatar['voice_label']}")
    return " + ".join(parts) if parts else "fallback candidate"
