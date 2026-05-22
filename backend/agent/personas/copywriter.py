"""Persona 4: Copywriter — 3 sub-agents (Hook/Body/CTA) + Ranker.

Pipeline (parallel khi có thể):
    [Stage 1 parallel] HookWriter + BodyWriter + CTAWriter chạy đồng thời
    [Stage 2 sync]     Ranker ghép + rank → top 3 variants

Model:
    - Hook/Body/CTA: deepseek-v4-flash (task=analyzer, $0.14/$0.28)
    - Ranker:        deepseek-v4-flash (task=analyzer, low temp 0.3 cho consistency)
                     ⚠️ Pro model hangs trên prompt nặng JSON — Flash đủ judgment

Total cost copywriter pipeline: ~$0.005-0.01 per proposal.
"""

import asyncio
import json
import re
from pathlib import Path
from typing import Optional

from loguru import logger

from vendors.llm_router import llm
from core.llm_redact import safe_dumps

_PROMPTS_DIR = Path(__file__).parent / "prompts"
HOOK_SYSTEM = (_PROMPTS_DIR / "copywriter_hook_system.md").read_text(encoding="utf-8")
BODY_SYSTEM = (_PROMPTS_DIR / "copywriter_body_system.md").read_text(encoding="utf-8")
CTA_SYSTEM = (_PROMPTS_DIR / "copywriter_cta_system.md").read_text(encoding="utf-8")
RANKER_SYSTEM = (_PROMPTS_DIR / "copywriter_ranker_system.md").read_text(encoding="utf-8")


async def write_script_variants(
    cinematic_brief: dict,
    product_positioning: dict,
    context_injection: dict,
    trends_vn: list[dict],
    skill_pack: dict,
    tech_config: dict,
) -> list[dict]:
    """Main entry — gen 3 final script variants.

    Internally:
        1. Parallel: HookWriter + BodyWriter + CTAWriter (5 variants mỗi cái)
        2. Sync: Ranker → top 3 final variants

    Returns:
        list of 3 dicts {variant_id, rank, hook, body, cta, total_duration_s, ...}
    """
    logger.info(
        f"[Copywriter] writing variants: niche={skill_pack.get('id')}, "
        f"duration={tech_config.get('duration_s')}, has_context={bool(context_injection)}"
    )

    # Fix runtime bug: Hook MUST run FIRST — Body+CTA prompts require hook context.
    # Hooks → parallel (Body + CTA) với hooks_raw injected.
    hooks_raw = await _write_hooks(
        cinematic_brief, product_positioning, context_injection,
        trends_vn, skill_pack,
    )

    bodies_raw, ctas_raw = await asyncio.gather(
        _write_bodies(cinematic_brief, product_positioning, context_injection,
                      hooks_raw, skill_pack, tech_config),
        _write_ctas(cinematic_brief, product_positioning, hooks_raw,
                    skill_pack, tech_config),
    )

    # Stage 2: Ranker
    ranked = await _rank_variants(
        hooks_raw, bodies_raw, ctas_raw, skill_pack, tech_config
    )

    logger.info(
        f"[Copywriter] done: top_variants={[v.get('variant_id') for v in ranked]}, "
        f"top_score={ranked[0].get('composite_score') if ranked else 'N/A'}"
    )

    return ranked


# ============================================
# Sub-agent 4a: Hook Writer
# ============================================

async def _write_hooks(
    cinematic_brief: dict,
    product_positioning: dict,
    context_injection: dict,
    trends_vn: list[dict],
    skill_pack: dict,
) -> list[dict]:
    user_msg = safe_dumps({
        "cinematic_brief": cinematic_brief,
        "product_positioning": product_positioning,
        "context_injection": context_injection,
        "trends_vn": trends_vn,
        "skill_pack_hooks_library": skill_pack.get("hooks", []),
        "skill_pack_forbidden": skill_pack.get("forbidden_claims", {}),
        "skill_pack_tone": skill_pack.get("tone_guide", {}),
    })

    response = await asyncio.to_thread(
        llm.complete,
        system_prompt=HOOK_SYSTEM,
        user_message=user_msg,
        task="analyzer",
        max_tokens=2048,
        temperature=0.85,  # high creativity for hooks
    )

    parsed = _parse_json(response, persona="HookWriter")
    return parsed.get("variants", [])


# ============================================
# Sub-agent 4b: Body Writer
# ============================================

async def _write_bodies(
    cinematic_brief: dict,
    product_positioning: dict,
    context_injection: dict,
    hooks_raw: list[dict],  # ← Fix: inject hooks để Body biết match từng hook nào
    skill_pack: dict,
    tech_config: dict,
) -> list[dict]:
    user_msg = safe_dumps({
        "cinematic_brief": cinematic_brief,
        "product_positioning": product_positioning,
        "context_injection": context_injection,
        "hook_variants": hooks_raw,  # ← Required theo prompt template
        "skill_pack_frameworks": skill_pack.get("recommended_frameworks", []),
        "skill_pack_must_include": skill_pack.get("must_include", []),
        "skill_pack_forbidden": skill_pack.get("forbidden_claims", {}),
        "tech_config": tech_config,
    })

    response = await asyncio.to_thread(
        llm.complete,
        system_prompt=BODY_SYSTEM,
        user_message=user_msg,
        task="analyzer",
        max_tokens=4500,  # body content giàu — cần đủ headroom để JSON không bị truncate giữa chừng
        temperature=0.7,
    )

    parsed = _parse_json(response, persona="BodyWriter")
    return parsed.get("variants", [])


# ============================================
# Sub-agent 4c: CTA Writer
# ============================================

async def _write_ctas(
    cinematic_brief: dict,
    product_positioning: dict,
    hooks_raw: list[dict],  # ← Inject hooks để CTA match hook narrative
    skill_pack: dict,
    tech_config: dict,
) -> list[dict]:
    user_msg = safe_dumps({
        "cinematic_brief": cinematic_brief,
        "product_positioning": product_positioning,
        "hook_variants": hooks_raw,  # ← Required theo prompt template
        "decision_trigger": product_positioning.get("audience_insight", {}).get("decision_trigger"),
        "skill_pack_id": skill_pack.get("id"),
        "tech_config": tech_config,
    })

    response = await asyncio.to_thread(
        llm.complete,
        system_prompt=CTA_SYSTEM,
        user_message=user_msg,
        task="analyzer",
        max_tokens=1500,
        temperature=0.75,
    )

    parsed = _parse_json(response, persona="CTAWriter")
    return parsed.get("variants", [])


# ============================================
# Stage 2: Ranker
# ============================================

async def _rank_variants(
    hooks: list[dict],
    bodies: list[dict],
    ctas: list[dict],
    skill_pack: dict,
    tech_config: dict,
) -> list[dict]:
    # Truncate inputs để tránh prompt nặng — top 3 mỗi loại đủ cho Ranker combine
    user_msg = safe_dumps({
        "hook_variants": (hooks or [])[:3],
        "body_variants": (bodies or [])[:3],
        "cta_variants": (ctas or [])[:3],
        "scoring_weights": skill_pack.get("scoring_weights",
                                          {"trending_alignment": 0.30,
                                           "pattern_interrupt": 0.25,
                                           "relatability": 0.20,
                                           "authenticity": 0.15,
                                           "cta_setup": 0.10}),
        "ranker_strategy": skill_pack.get("ranker_strategy",
                                          {"top_n_keep": 3,
                                           "diversity_constraint": True}),
        "tech_config": tech_config,
    })

    response = await asyncio.to_thread(
        llm.complete,
        system_prompt=RANKER_SYSTEM,
        user_message=user_msg,
        task="analyzer",  # → flash (fail-fast, đủ judgment với temp thấp)
        max_tokens=3500,  # đủ để output 3 variants với detail không bị truncate
        temperature=0.3,  # low — consistency cao
    )

    parsed = _parse_json(response, persona="Ranker")
    return parsed.get("variants", [])


# ============================================
# Helpers
# ============================================

def _parse_json(response_text: str, persona: str) -> dict:
    """Extract JSON tolerant với markdown wrapper + control chars + truncation salvage."""
    cleaned = response_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```\s*$", "", cleaned)

    try:
        return json.loads(cleaned, strict=False)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{[\s\S]*\}", cleaned)
    if not match:
        raise ValueError(
            f"[{persona}] LLM không trả JSON valid. Head: {response_text[:300]}"
        )

    raw = match.group()
    try:
        return json.loads(raw, strict=False)
    except json.JSONDecodeError as orig_err:
        # Strategy 1: salvage truncation (LLM hit max_tokens, cut middle)
        salvaged = _salvage_truncated_json(raw)
        if salvaged is not None:
            try:
                return json.loads(salvaged, strict=False)
            except json.JSONDecodeError:
                pass

        # Strategy 2: fix common LLM JSON malformations
        # (unescaped quote, trailing comma, control chars)
        cleaned2 = _fix_common_json_errors(raw)
        try:
            return json.loads(cleaned2, strict=False)
        except json.JSONDecodeError:
            pass

        # Strategy 3: combine — fix + truncate
        cleaned3 = _salvage_truncated_json(cleaned2)
        if cleaned3 is not None:
            try:
                return json.loads(cleaned3, strict=False)
            except json.JSONDecodeError as e:
                raise ValueError(
                    f"[{persona}] JSON parse fail sau 3 salvage strategies: {e}. "
                    f"Original error: {orig_err}. Head: {raw[:300]}"
                ) from e

        raise ValueError(
            f"[{persona}] JSON parse fail không salvage được. "
            f"Error: {orig_err}. Head: {raw[:300]}"
        )


def _fix_common_json_errors(raw: str) -> str:
    """Strategy 2 salvage: fix common LLM JSON malformations.

    1. Trailing commas trước } hoặc ]
    2. Strip control characters (except \\n, \\r, \\t)
    3. Smart quotes → straight quotes
    4. Unescaped newlines in strings (heuristic)
    """
    s = raw

    # Strip control chars (preserve printable + whitespace)
    s = "".join(ch for ch in s if ch == "\n" or ch == "\r" or ch == "\t" or ord(ch) >= 0x20)

    # Smart quotes → straight (common LLM output)
    s = s.replace("“", '"').replace("”", '"')  # curly double
    s = s.replace("‘", "'").replace("’", "'")  # curly single

    # Trailing commas: `,}` → `}` và `,]` → `]`
    s = re.sub(r",(\s*[}\]])", r"\1", s)

    return s


def _salvage_truncated_json(raw: str) -> str | None:
    """Salvage truncated/malformed JSON với 3 strategy fallback.

    Strategy 1: Cut to last balanced top-level `}` (original behavior).
    Strategy 2 (NEW): Auto-close mọi bracket/quote đang mở khi LLM cut giữa chừng.
        - Đóng string đang mở: append `"`
        - Đóng các container `{`, `[` trong stack theo thứ tự reverse
        - Strip trailing comma trước `]`/`}` (LLM hay output `[..., ]` invalid)
    Strategy 3 (NEW): Remove trailing dangling key (LLM truncate giữa `"key":`).
    """
    # ===== Strategy 1: Cut to last balanced top-level } =====
    stack: list[str] = []
    last_balanced = -1
    in_string = False
    escape = False
    for i, ch in enumerate(raw):
        if escape:
            escape = False
            continue
        if ch == "\\":
            escape = True
            continue
        if ch == '"' and not escape:
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch in "{[":
            stack.append(ch)
        elif ch in "}]":
            if not stack:
                return None
            stack.pop()
            if not stack:
                last_balanced = i
    if last_balanced >= 0:
        return raw[: last_balanced + 1]

    # ===== Strategy 2: Auto-close brackets + quotes (LLM truncate giữa container) =====
    # Walk lại với state, accumulate string content, track open brackets
    stack2: list[str] = []
    in_str = False
    esc = False
    for ch in raw:
        if esc:
            esc = False
            continue
        if ch == "\\":
            esc = True
            continue
        if ch == '"' and not esc:
            in_str = not in_str
            continue
        if in_str:
            continue
        if ch in "{[":
            stack2.append(ch)
        elif ch in "}]":
            if stack2:
                stack2.pop()
    # Phải có ít nhất 1 `{` mở (top-level object) để salvage được
    if not stack2:
        return None

    # Build closing sequence: đóng string nếu đang mở → strip trailing dangling token →
    # đóng từng bracket trong stack reverse
    salvaged = raw
    if in_str:
        salvaged += '"'

    # Strip trailing dangling tokens iteratively. Chỉ break khi salvaged empty —
    # `{` rỗng OK (close `}` thành `{}` valid).
    import re as _re
    prev = None
    while prev != salvaged:
        prev = salvaged
        # 1. Trailing open brace `{ ` (LLM mở NESTED nhưng cut ngay).
        #    Lookbehind require `:` hoặc `,` hoặc `[` trước → KHÔNG strip top-level `{`.
        salvaged = _re.sub(r"(?<=[\[,:])\s*\{\s*$", "", salvaged)
        # 2a. Strip trailing PARTIAL value sau colon — number incomplete (`: 8.`),
        #     literal incomplete (`: tr`, `: nu`). KHÔNG strip closed value `"abc"`.
        salvaged = _re.sub(r"\s*:\s*(\d+\.|\.?\d+\.|[a-zA-Z_]+)$", ":", salvaged)
        # 2b. Strip trailing colon cô đơn `: ` (sau khi value gone)
        salvaged = _re.sub(r"\s*:\s*$", "", salvaged)
        # 2c. Strip trailing dangling KEY (sau khi colon gone hoặc input cuối là key cô đơn).
        #     Match: `, "key"` (comma trước) hoặc `{\s*"key"` (sau open brace).
        salvaged = _re.sub(r'\s*,\s*"[^"]*"\s*$', "", salvaged)
        salvaged = _re.sub(r'(?<=\{)\s*"[^"]*"\s*$', "", salvaged)
        # 3. Trailing comma cô đơn
        salvaged = _re.sub(r",\s*$", "", salvaged)
        # 4. Break khi truly empty (KHÔNG break khi còn `{` — close sẽ thành `{}`)
        if salvaged.strip() == "":
            return None

    # Recompute stack sau strip — số bracket có thể giảm
    stack3: list[str] = []
    in_str = False
    esc = False
    for ch in salvaged:
        if esc:
            esc = False; continue
        if ch == "\\":
            esc = True; continue
        if ch == '"' and not esc:
            in_str = not in_str; continue
        if in_str:
            continue
        if ch in "{[":
            stack3.append(ch)
        elif ch in "}]":
            if stack3:
                stack3.pop()
    # Đóng quote nếu còn open
    if in_str:
        salvaged += '"'
    # Close brackets reverse
    closer_map = {"{": "}", "[": "]"}
    while stack3:
        salvaged += closer_map[stack3.pop()]

    return salvaged
