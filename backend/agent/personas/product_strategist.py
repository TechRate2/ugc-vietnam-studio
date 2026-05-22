"""Persona 1: Product Strategist — analyze sản phẩm + positioning.

Đọc product_input + reference_images → output ProductPositioning với:
- Product details + visual attributes
- Audience thật (age/income/lifestyle/psychographic)
- Selling angles + competitors VN
- Pain points cụ thể + objection-aware

Model:
    - With images: qwen3-vl-30b-instruct (task=vision, $0.15/$0.60)
    - Text-only: deepseek-v4-flash (task=analyzer, $0.14/$0.28)

Note: Logic gần với analyzer.py có sẵn của anh nhưng schema GIÀU HƠN (positioning,
selling_angles, audience_insight). Em wrap analyzer.py thay vì refactor để zero-risk.
"""

import base64
import io
import json
import re
from pathlib import Path

from loguru import logger

from core.llm_redact import safe_dumps
from vendors.llm_router import llm

_PROMPT_PATH = Path(__file__).parent / "prompts" / "product_strategist_system.md"
SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8")


# BUG-B13 + FIX 4 (post-400-incident): resize aggressive hơn để giảm payload 60%
# vision LLM xử lý nhanh + tránh 400/413. 768px đủ cho product analysis.
MAX_IMAGE_DIMENSION = 768  # giảm từ 1024 → 768 (FIX 4)
JPEG_QUALITY = 75  # giảm từ 80 → 75 (FIX 4)


def _maybe_resize_data_url(url: str) -> str:
    """Resize data URL base64 ảnh xuống MAX_IMAGE_DIMENSION + JPEG 80%.

    External URLs pass through (không control được).
    Lỗi parse/resize fail → return original url.
    """
    if not url or not url.startswith("data:image"):
        return url

    try:
        from PIL import Image  # pillow đã trong requirements.txt
    except ImportError:
        logger.warning("[product_strategist] PIL không có — skip resize")
        return url

    try:
        # Parse data URL: data:image/jpeg;base64,xxx
        _, payload = url.split(",", 1)
        raw = base64.b64decode(payload)
        img = Image.open(io.BytesIO(raw))

        # Skip nếu đã nhỏ
        if max(img.size) <= MAX_IMAGE_DIMENSION:
            return url

        img.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION), Image.Resampling.LANCZOS)
        # Convert RGBA → RGB cho JPEG
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        out = io.BytesIO()
        img.save(out, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        b64 = base64.b64encode(out.getvalue()).decode("ascii")
        return f"data:image/jpeg;base64,{b64}"
    except Exception as e:
        logger.warning(f"[product_strategist] resize fail (non-fatal): {e}")
        return url


def analyze(
    product_input: dict,
    reference_images: list[str],
    tech_config: dict,
) -> dict:
    """Run Product Strategist → ProductPositioning JSON.

    Args:
        product_input: {url, text_description, image_urls}.
        reference_images: 0-12 URL/base64.
        tech_config: {duration_s, aspect_ratio, audio_mode, model}.

    Returns:
        ProductPositioning dict (xem schema trong product_strategist_system.md).
    """
    user_msg = _build_user_message(product_input, reference_images, tech_config)
    # BUG-B13 fix: resize base64 data URLs để tránh 413 payload too large
    valid_imgs = [
        _maybe_resize_data_url(u)
        for u in reference_images[:12]
        if u
    ]

    logger.info(
        f"[ProductStrategist] analyze: product={product_input.get('url') or 'text-only'}, "
        f"refs={len(valid_imgs)}, model={tech_config.get('model')}"
    )

    if valid_imgs:
        response_text = llm.complete_with_image(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_msg,
            image_urls=valid_imgs,
            task="vision",  # → qwen3-vl-30b
            max_tokens=4096,
        )
    else:
        response_text = llm.complete(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_msg,
            task="analyzer",  # → deepseek-v4-flash
            max_tokens=4096,
        )

    positioning = _parse_positioning(response_text)

    logger.info(
        f"[ProductStrategist] done: product={positioning.get('product', {}).get('name')}, "
        f"category={positioning.get('product', {}).get('category')}, "
        f"angles={len(positioning.get('selling_angles', []))}"
    )

    return positioning


def _build_user_message(
    product_input: dict, reference_images: list[str], tech_config: dict
) -> str:
    """Compose user message — KHÔNG include tech_config full (save tokens).

    Chỉ pass tech_config fields ảnh hưởng phân tích (audio_mode hint cho tone,
    duration cho pacing suggestion). KHÔNG cần aspect/resolution/voice cho Strategist.
    """
    relevant_tech = {
        "audio_mode": tech_config.get("audio_mode"),
        "duration_s": tech_config.get("duration_s"),
    }
    parts = [
        "[PRODUCT INPUT]",
        safe_dumps(product_input),  # V3.1 — strip base64 image_urls
        "",
        f"[REFERENCE IMAGES] {len(reference_images)} ảnh (xem attachments)",
        "",
        "[TECH HINTS — context cho audience analysis]",
        safe_dumps(relevant_tech),
        "",
        "[YOUR TASK]",
        "Output JSON ProductPositioning theo schema. Audience THẬT, pain point CỤ THỂ, "
        "competitor VN. KHÔNG generic.",
    ]
    return "\n".join(parts)


def _parse_positioning(response_text: str) -> dict:
    """Tolerant parse — markdown wrapper + control chars in strings."""
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
            f"[ProductStrategist] LLM không trả JSON valid. Head: {response_text[:300]}"
        )
    try:
        return json.loads(match.group(), strict=False)
    except json.JSONDecodeError as e:
        raise ValueError(f"[ProductStrategist] JSON parse fail: {e}") from e
