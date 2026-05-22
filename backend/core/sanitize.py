"""Sanitization utilities — BUG-B6 (prompt injection) + BUG-B12 (PII strip).

Áp dụng cho `context_injection` từ user trước khi pass vào LLM prompt.
"""

import re
from typing import Any


# ============================================
# BUG-B6: Prompt injection patterns
# ============================================
# Các pattern phổ biến hacker dùng để bypass system prompt.
PROMPT_INJECTION_PATTERNS = [
    re.compile(r"(?i)\bignore\s+(?:previous|prior|above|earlier|all)\s+(?:instruction|prompt|rule)s?", re.UNICODE),
    re.compile(r"(?i)\bdisregard\s+(?:previous|prior|all)", re.UNICODE),
    re.compile(r"(?i)\b(?:system|assistant|user)\s*:\s*", re.UNICODE),  # role hijack
    re.compile(r"(?i)\byou\s+are\s+now\b", re.UNICODE),
    re.compile(r"(?i)\bnew\s+(?:instruction|directive|role)s?\b", re.UNICODE),
    re.compile(r"```\s*system\b", re.IGNORECASE | re.UNICODE),
    re.compile(r"<\s*system\b", re.IGNORECASE | re.UNICODE),
    re.compile(r"\[INST\]|\[/INST\]", re.UNICODE),  # Llama-style instruction tokens
]


def sanitize_prompt_injection(text: str) -> tuple[str, list[str]]:
    """Detect + neutralize prompt injection attempts.

    Returns:
        (cleaned_text, list_of_flagged_patterns)
    """
    if not text:
        return text, []

    flagged: list[str] = []
    cleaned = text

    for pattern in PROMPT_INJECTION_PATTERNS:
        matches = pattern.findall(cleaned)
        if matches:
            flagged.extend(str(m)[:50] for m in matches)
            # Neutralize: replace với marker (KHÔNG xoá hẳn để giữ length context)
            cleaned = pattern.sub("[REDACTED]", cleaned)

    return cleaned, flagged


# ============================================
# BUG-B12: PII strip (Vietnamese context)
# ============================================
# Detect + redact thông tin cá nhân trước khi pass LLM/log.
PII_PATTERNS = {
    "phone_vn": re.compile(
        r"\b(?:\+?84|0)(?:3|5|7|8|9)\d{8}\b"
    ),  # SĐT VN: 0xxx hoặc +84xxx
    "email": re.compile(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
    ),
    "cccd": re.compile(
        r"\b\d{12}\b"  # CCCD VN 12 số (cả CMND 9 số ko match — safe)
    ),
    "credit_card": re.compile(
        r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b"
    ),
    "url_with_token": re.compile(
        r"https?://\S+[?&](?:token|key|secret|password|api_key)=\S+",
        re.IGNORECASE,
    ),
}


def strip_pii(text: str) -> tuple[str, dict[str, int]]:
    """Redact PII patterns. Trả về (cleaned, counts).

    counts = {phone_vn: 2, email: 1, ...}
    """
    if not text:
        return text, {}

    cleaned = text
    counts: dict[str, int] = {}

    for pii_type, pattern in PII_PATTERNS.items():
        matches = pattern.findall(cleaned)
        if matches:
            counts[pii_type] = len(matches)
            cleaned = pattern.sub(f"[{pii_type.upper()}_REDACTED]", cleaned)

    return cleaned, counts


# ============================================
# Combined sanitizer for ContextInjection
# ============================================

def sanitize_context_injection(ctx: dict[str, Any]) -> tuple[dict[str, Any], dict]:
    """Sanitize tất cả text fields trong ContextInjection.

    Returns:
        (cleaned_ctx, report) — report = {flagged_injections: [...], pii_counts: {...}}.
    """
    if not ctx:
        return ctx, {"flagged_injections": [], "pii_counts": {}}

    cleaned: dict[str, Any] = {}
    all_flagged: list[str] = []
    all_pii: dict[str, int] = {}

    text_fields = ("pain_points", "real_reviews", "usps", "forbidden_to_say", "mood_hint")

    for key, value in ctx.items():
        if key in text_fields and isinstance(value, str):
            # Step 1: strip PII (trước)
            clean1, pii = strip_pii(value)
            for k, v in pii.items():
                all_pii[k] = all_pii.get(k, 0) + v

            # Step 2: neutralize prompt injection
            clean2, flagged = sanitize_prompt_injection(clean1)
            all_flagged.extend(flagged)

            cleaned[key] = clean2
        else:
            cleaned[key] = value

    report = {
        "flagged_injections": all_flagged,
        "pii_counts": all_pii,
    }
    return cleaned, report
