"""Director Agent personas — 8 chuyên gia cộng tác như 1 studio film.

Personas (chạy theo thứ tự stage trong director_brain.py):
    0. VisualPlanner (NEW)  — pre-analyze refs, detect role + extract face anchor (Qwen3-VL)
    1. ProductStrategist    — analyze sản phẩm + positioning (Qwen3-VL vision)
    2. TrendWatcher         — cache TikTok VN trends, inject vào Director
    3. Director             — cinematic vision + clone Viral DNA (đọc anchor từ Planner)
    4. Copywriter (3 sub)   — Hook / Body / CTA parallel + Ranker
    5. ReferenceAnalyzer    — shot-level mapping (Planner đã làm role detection)
    6. Editor               — chia storyboard shots
    7. Critic               — viral score 1-10 + suggestions

Pattern: học từ ViMax "Visual Asset Planning Agent" + TopView V2 + Huobao `extractor`.
Visual Planner chạy SỚM NHẤT (parallel Strategist) để mọi persona sau có context refs.

DEPRECATED:
    - casting_director.py  — kept for backward compat, KHÔNG dùng (anh không có preset avatar)
    - personas_db.yaml     — kept reference only

Orchestrator: agent/director_brain.py
"""
