"""Persona 2: Trend Watcher — cache TikTok VN trends, inject vào Director.

Mục đích: cập nhật xu hướng mỗi 6h để Director Agent luôn AWARE.

Hai layer:
    1. Cache layer (SQLite trend_cache.db) — đọc cực nhanh, không LLM call
    2. Match layer (LLM filter trends theo niche/audience) — Haiku, cheap

Background worker `workers/trend_scanner.py` (Week 2 chunk 3) sẽ scan TikTok VN
+ X/Twitter VN mỗi 6h → ghi vào trend_cache.db.

Bootstrap: nếu trend_cache.db empty (lần đầu chạy) → return seed trends hardcoded
(các format đã viral lâu dài như POV, before/after, rant style).
"""

import sqlite3
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

from loguru import logger


# ============================================
# Cache schema + bootstrap
# ============================================

DB_PATH = Path(__file__).parent.parent.parent / "data" / "trend_cache.db"

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trend_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    format_type TEXT,
    target_niches TEXT,
    audience_age_min INTEGER,
    audience_age_max INTEGER,
    trending_score INTEGER DEFAULT 5,
    source TEXT,
    discovered_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP,
    raw_example TEXT
);

CREATE INDEX IF NOT EXISTS idx_trends_score ON trends(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_trends_expires ON trends(expires_at);

CREATE TABLE IF NOT EXISTS scan_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    scanned_at TIMESTAMP NOT NULL,
    items_found INTEGER DEFAULT 0,
    status TEXT
);
"""

SEED_TRENDS = [
    {
        "trend_id": "seed_pov_thanh_can",
        "title": "POV thành viên thân cận",
        "description": "POV format: 'POV: [người thân] tự nhiên hỏi/làm gì đó về vẻ ngoài của bạn'",
        "format_type": "POV",
        "target_niches": "beauty,fashion,lifestyle",
        "audience_age_min": 18,
        "audience_age_max": 35,
        "trending_score": 9,
        "source": "seed",
        "raw_example": "POV: bạn trai tự nhiên hỏi 'em đánh son gì mà bóng thế'",
    },
    {
        "trend_id": "seed_before_after_n_days",
        "title": "Before/After N ngày",
        "description": "Visual proof: Ngày 1 vs ngày N (N = 7/14/21/30/60)",
        "format_type": "before_after",
        "target_niches": "beauty,supplement,fitness",
        "audience_age_min": 22,
        "audience_age_max": 45,
        "trending_score": 10,
        "source": "seed",
        "raw_example": "Ngày 1 vs ngày 30, mình không tin vào mắt mình",
    },
    {
        "trend_id": "seed_tested_n_kept_one",
        "title": "Tested N - giữ 1",
        "description": "Authority + curiosity: 'Mình đã thử N sản phẩm, đây là cái duy nhất giữ'",
        "format_type": "curiosity_gap",
        "target_niches": "beauty,tech,fashion,food",
        "audience_age_min": 22,
        "audience_age_max": 40,
        "trending_score": 9,
        "source": "seed",
        "raw_example": "Mình đã thử 12 thỏi son 800k+, đây là thỏi duy nhất giữ",
    },
    {
        "trend_id": "seed_rant_industry",
        "title": "Rant về ngành",
        "description": "Controversial: 'Mình nói thật, ngành X đang scam bằng Y'",
        "format_type": "controversial",
        "target_niches": "beauty,supplement,tech,fashion",
        "audience_age_min": 20,
        "audience_age_max": 40,
        "trending_score": 9,
        "source": "seed",
        "raw_example": "Mình nói thật, ngành mỹ phẩm VN đang scam bằng 'whitening'",
    },
    {
        "trend_id": "seed_stop_action",
        "title": "Stop X — đây là Y",
        "description": "Hot take: 'Stop [hành động phổ biến], đây là [alternative]'",
        "format_type": "controversial",
        "target_niches": "beauty,tech,fashion,lifestyle",
        "audience_age_min": 18,
        "audience_age_max": 35,
        "trending_score": 8,
        "source": "seed",
        "raw_example": "Stop mua serum 1 triệu, đây là loại 89k đang viral",
    },
    {
        "trend_id": "seed_chi_em_test",
        "title": "Mấy chị em ơi",
        "description": "Community appeal: 'Mấy chị em ơi mình [test/try] cái này và...'",
        "format_type": "relatable",
        "target_niches": "beauty,mom_baby,fashion,food",
        "audience_age_min": 22,
        "audience_age_max": 40,
        "trending_score": 7,
        "source": "seed",
        "raw_example": "Mấy chị em ơi mình thử mặt nạ giấy này và da căng bóng luôn",
    },
]


def _ensure_db():
    """Init DB + schema + seed nếu lần đầu.

    BUG-L2 fix: WAL mode để concurrent read khi background scanner writes.
    """
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), timeout=10.0)
    try:
        conn.execute("PRAGMA journal_mode=WAL")
        conn.executescript(SCHEMA_SQL)
        # Seed nếu empty
        count = conn.execute("SELECT COUNT(*) FROM trends").fetchone()[0]
        if count == 0:
            logger.info("[TrendWatcher] DB empty — seeding default trends")
            for trend in SEED_TRENDS:
                _insert_trend(conn, trend)
            conn.commit()
    finally:
        conn.close()


def _insert_trend(conn: sqlite3.Connection, trend: dict):
    """Upsert trend (replace nếu trend_id existed)."""
    expires = trend.get("expires_at") or (datetime.now() + timedelta(days=30)).isoformat()
    conn.execute(
        """
        INSERT OR REPLACE INTO trends
            (trend_id, title, description, format_type, target_niches,
             audience_age_min, audience_age_max, trending_score, source,
             discovered_at, expires_at, raw_example)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            trend["trend_id"],
            trend["title"],
            trend.get("description", ""),
            trend.get("format_type", "general"),
            trend.get("target_niches", ""),
            trend.get("audience_age_min", 18),
            trend.get("audience_age_max", 50),
            trend.get("trending_score", 5),
            trend.get("source", "manual"),
            datetime.now().isoformat(),
            expires,
            trend.get("raw_example", ""),
        ),
    )


# ============================================
# Query API — gọi từ director_brain
# ============================================

def fetch_relevant_trends(
    niche: Optional[str] = None,
    audience_age: Optional[tuple[int, int]] = None,
    limit: int = 5,
    min_score: int = 6,
) -> list[dict]:
    """Lấy top N trends fit niche + audience.

    Args:
        niche: vd "beauty.skincare" hoặc "beauty" — match prefix.
        audience_age: (min_age, max_age) — overlap với trend's age range.
        limit: số trend tối đa trả về.
        min_score: chỉ lấy trend có score >= ngưỡng.

    Returns:
        List of trend dicts sorted by trending_score DESC.
    """
    _ensure_db()
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    try:
        # Filter trends chưa expired
        query = (
            "SELECT * FROM trends "
            "WHERE trending_score >= ? "
            "AND (expires_at IS NULL OR expires_at > ?) "
        )
        params: list = [min_score, datetime.now().isoformat()]

        # Niche filter — match root sau khi strip suffix (vd "beauty_skincare" → "beauty")
        # Hỗ trợ cả 2 convention: dotted ("beauty.skincare") và underscored ("beauty_skincare")
        if niche:
            niche_str = str(niche)
            # Split theo cả "." và "_" lấy phần ROOT category để fuzzy match
            niche_root = niche_str.split(".")[0].split("_")[0].lower()
            query += "AND LOWER(target_niches) LIKE ? "
            params.append(f"%{niche_root}%")

        # Age overlap (trend.range ∩ audience.range ≠ ∅)
        if audience_age:
            a_min, a_max = audience_age
            query += "AND audience_age_min <= ? AND audience_age_max >= ? "
            params.extend([a_max, a_min])

        query += "ORDER BY trending_score DESC LIMIT ?"
        params.append(limit)

        rows = conn.execute(query, params).fetchall()
        trends = [dict(row) for row in rows]

        logger.info(
            f"[TrendWatcher] fetched {len(trends)} trends "
            f"(niche={niche}, age={audience_age}, min_score={min_score})"
        )
        return trends
    finally:
        conn.close()


def insert_scanned_trend(trend: dict):
    """Background worker `trend_scanner.py` gọi insert trend mới scan được."""
    _ensure_db()
    conn = sqlite3.connect(str(DB_PATH))
    try:
        _insert_trend(conn, trend)
        conn.commit()
        logger.info(f"[TrendWatcher] inserted trend: {trend.get('trend_id')}")
    finally:
        conn.close()


def log_scan(source: str, items_found: int, status: str = "ok"):
    """Log scan history cho debug."""
    _ensure_db()
    conn = sqlite3.connect(str(DB_PATH))
    try:
        conn.execute(
            "INSERT INTO scan_log (source, scanned_at, items_found, status) VALUES (?, ?, ?, ?)",
            (source, datetime.now().isoformat(), items_found, status),
        )
        conn.commit()
    finally:
        conn.close()
