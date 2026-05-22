"""Video Reference Analyzer — Qwen3-VL phân tích video viral → Viral DNA.

Tính năng "clone video ý tưởng đỉnh cao hơn":
    User upload 1 video viral mẫu → extract pattern (pacing, framing, hook formula,
    story arc) cho Director clone nhưng adapt cho product mới.

Two strategies (auto-fallback):
    Strategy A: Direct video URL → Qwen3-VL (preferred, accurate)
                Model: qwen/qwen3-vl-30b-a3b-thinking
                Cost: ~$0.05 per video 30-60s
                Time: 15-30s
    Strategy B: Keyframe extraction → Qwen3-VL multi-image (fallback)
                Tools: ffmpeg-python (extract 8 frames) + R2 upload + Qwen3-VL vision
                Cost: ~$0.04 per video
                Time: 20-40s
"""

import asyncio
import json
import re
import tempfile
from pathlib import Path
from typing import Optional

import httpx
from loguru import logger

from vendors.llm_router import llm


_PROMPT_PATH = (
    Path(__file__).parent / "personas" / "prompts" / "video_ref_analyzer_system.md"
)
SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8")

QWEN3_VL_THINKING_MODEL = "qwen/qwen3-vl-30b-a3b-thinking"
QWEN3_VL_VISION_MODEL = "qwen/qwen3-vl-30b-a3b-instruct"

KEYFRAME_COUNT = 8  # số frames extract
MAX_VIDEO_SIZE_MB = 100  # cap download
DOWNLOAD_TIMEOUT_S = 60

# Strategy preference:
#   "keyframes" — DEFAULT (verified — Qwen3-VL Vision accept multi-image)
#   "direct"    — experimental (Qwen3-VL chưa confirm accept video URL qua OpenAI-compat)
# Override qua env: VIDEO_REF_STRATEGY=direct nếu muốn thử Strategy A
import os as _os
PREFERRED_STRATEGY = _os.getenv("VIDEO_REF_STRATEGY", "keyframes")


async def analyze_video_ref(reference_videos: list[str]) -> Optional[dict]:
    """Phân tích video reference đầu tiên → ViralDNA.

    Args:
        reference_videos: list video URLs (public, accessible).

    Returns:
        ViralDNA dict, hoặc None nếu không có video hoặc fail.
    """
    if not reference_videos:
        return None

    video_url = reference_videos[0]
    if not video_url:
        return None

    logger.info(
        f"[VideoRefAnalyzer] analyzing: {video_url[:80]}... "
        f"(preferred_strategy={PREFERRED_STRATEGY})"
    )

    # Strategy ordering — default keyframes (more reliable), fallback direct
    if PREFERRED_STRATEGY == "direct":
        strategies = [("direct_video", _strategy_direct_video),
                      ("keyframes_fallback", _strategy_keyframes)]
    else:
        strategies = [("keyframes", _strategy_keyframes),
                      ("direct_video_fallback", _strategy_direct_video)]

    last_error: Optional[Exception] = None
    for strategy_name, strategy_fn in strategies:
        try:
            result = await strategy_fn(video_url)
            if result and result.get("summary"):
                result["_strategy_used"] = strategy_name
                logger.info(f"[VideoRefAnalyzer] succeeded with {strategy_name}")
                return result
        except (httpx.HTTPStatusError, ValueError, KeyError, RuntimeError) as e:
            last_error = e
            logger.warning(
                f"[VideoRefAnalyzer] {strategy_name} fail: {e}, "
                f"trying next strategy"
            )

    logger.error(
        f"[VideoRefAnalyzer] all strategies failed. Last error: {last_error}"
    )
    return None


# ============================================
# Strategy A: Direct video URL → Qwen3-VL Thinking
# ============================================

async def _strategy_direct_video(video_url: str) -> dict:
    """Pass video URL trực tiếp cho Qwen3-VL Thinking model."""
    user_msg = (
        f"Phân tích video viral sau và output ViralDNA JSON theo schema.\n\n"
        f"Video URL: {video_url}\n\n"
        f"Focus phân tích 60s đầu nếu dài hơn. Output strict JSON, KHÔNG markdown."
    )

    response = await asyncio.to_thread(
        llm.complete_with_image,
        system_prompt=SYSTEM_PROMPT,
        user_message=user_msg,
        image_urls=[video_url],
        task="vision",
        model=QWEN3_VL_THINKING_MODEL,
        max_tokens=4000,
    )

    return _parse_viral_dna(response)


# ============================================
# Strategy B: Keyframe extraction fallback
# ============================================

async def _strategy_keyframes(video_url: str) -> dict:
    """Extract N keyframes via ffmpeg → upload R2 → Qwen3-VL multi-image.

    Steps:
        1. Download video tạm
        2. ffmpeg extract N keyframes (evenly distributed timestamps)
        3. Upload mỗi frame lên R2 (hoặc convert base64 inline)
        4. Pass URLs cho Qwen3-VL Instruct với multi-image analysis prompt
    """
    with tempfile.TemporaryDirectory(prefix="vra_") as tmpdir:
        tmp_path = Path(tmpdir)
        video_local = tmp_path / "ref.mp4"

        # Step 1: download
        await _download_video(video_url, video_local)

        # Step 2: extract keyframes
        frames_dir = tmp_path / "frames"
        frames_dir.mkdir()
        await _extract_keyframes(video_local, frames_dir, KEYFRAME_COUNT)

        # Step 3: convert frames to base64 data URLs (inline, no R2 needed)
        frame_data_urls = _frames_to_data_urls(frames_dir)
        if len(frame_data_urls) < 2:
            raise ValueError(f"Only {len(frame_data_urls)} frames extracted")

        # Step 4: Qwen3-VL multi-image analysis
        user_msg = (
            f"Phân tích {len(frame_data_urls)} keyframes từ video viral 60s "
            f"(extracted evenly từ timeline 0-60s).\n\n"
            f"Output ViralDNA JSON theo schema. Lưu ý: vì là keyframes (không phải "
            f"video gốc), một số field (audio_analysis, exact cuts/sec) sẽ ước lượng.\n\n"
            f"Output strict JSON, KHÔNG markdown."
        )

        response = await asyncio.to_thread(
            llm.complete_with_image,
            system_prompt=SYSTEM_PROMPT,
            user_message=user_msg,
            image_urls=frame_data_urls,
            task="vision",
            model=QWEN3_VL_VISION_MODEL,
            max_tokens=4000,
        )

        return _parse_viral_dna(response)


async def _download_video(url: str, dest: Path):
    """Stream download video → file local. Cap size để tránh DOS."""
    async with httpx.AsyncClient(timeout=DOWNLOAD_TIMEOUT_S, follow_redirects=True) as client:
        async with client.stream("GET", url) as response:
            response.raise_for_status()
            size = 0
            with open(dest, "wb") as f:
                async for chunk in response.aiter_bytes(chunk_size=64 * 1024):
                    size += len(chunk)
                    if size > MAX_VIDEO_SIZE_MB * 1024 * 1024:
                        raise ValueError(
                            f"Video > {MAX_VIDEO_SIZE_MB}MB — quá lớn để phân tích"
                        )
                    f.write(chunk)
    logger.info(f"[VideoRefAnalyzer] downloaded {dest.stat().st_size / 1024:.0f}KB → {dest}")


async def _extract_keyframes(video_path: Path, frames_dir: Path, count: int):
    """ffmpeg extract N keyframes evenly distributed.

    Pattern: dùng `select='eq(n,0)+...` với N timestamps tính từ duration.
    Đơn giản hơn: extract every Nth frame.
    """
    # Get duration first
    duration = await _get_video_duration(video_path)
    if duration <= 0:
        raise ValueError("Cannot determine video duration")

    # Compute N timestamps evenly spaced (skip first 0.5s)
    interval = max(0.5, (duration - 1.0) / (count - 1)) if count > 1 else 0
    timestamps = [0.5 + i * interval for i in range(count)]

    # Use FFmpeg select filter to extract specific frames
    # Approach: loop ffmpeg subprocess per timestamp (simple, reliable)
    for idx, ts in enumerate(timestamps):
        out_path = frames_dir / f"frame_{idx:02d}.jpg"
        cmd = [
            "ffmpeg",
            "-y",                        # overwrite
            "-ss", f"{ts:.2f}",          # seek to timestamp
            "-i", str(video_path),
            "-vframes", "1",
            "-q:v", "3",                 # quality 1-31 (3 = high quality)
            "-vf", "scale=1280:-1",      # max 1280px wide
            str(out_path),
        ]
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.PIPE,
        )
        _, stderr = await proc.communicate()
        if proc.returncode != 0:
            logger.warning(
                f"[VideoRefAnalyzer] ffmpeg fail frame {idx}: {stderr.decode()[:200]}"
            )

    extracted = list(frames_dir.glob("frame_*.jpg"))
    logger.info(f"[VideoRefAnalyzer] extracted {len(extracted)}/{count} keyframes")


async def _get_video_duration(video_path: Path) -> float:
    """ffprobe lấy duration in seconds."""
    cmd = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(video_path),
    ]
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.DEVNULL,
    )
    stdout, _ = await proc.communicate()
    try:
        return float(stdout.decode().strip())
    except (ValueError, AttributeError):
        return 0.0


def _frames_to_data_urls(frames_dir: Path) -> list[str]:
    """Convert frames → base64 data URLs cho inline Qwen3-VL input."""
    import base64

    urls = []
    for frame_path in sorted(frames_dir.glob("frame_*.jpg")):
        try:
            with open(frame_path, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("ascii")
            urls.append(f"data:image/jpeg;base64,{b64}")
        except OSError as e:
            logger.warning(f"[VideoRefAnalyzer] read frame fail {frame_path}: {e}")
    return urls


# ============================================
# JSON parser
# ============================================

def _parse_viral_dna(response_text: str) -> dict:
    """Extract JSON, tolerant với markdown wrapper."""
    try:
        return json.loads(response_text.strip())
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{[\s\S]*\}", response_text)
    if not match:
        raise ValueError(
            f"[VideoRefAnalyzer] LLM không trả JSON. Head: {response_text[:300]}"
        )

    try:
        return json.loads(match.group())
    except json.JSONDecodeError as e:
        raise ValueError(f"[VideoRefAnalyzer] JSON parse fail: {e}") from e
