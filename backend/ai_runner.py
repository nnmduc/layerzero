"""
LayerZero Unified AI Agent Stream Runner (Claude Code & Antigravity agy)
========================================================================
Supports:
1. Anthropic Claude Code CLI (`claude` / `claude-code`) via:
   `claude -p <prompt> --dangerously-skip-permissions --output-format stream-json --verbose --json-schema <schema>`
2. Google Antigravity CLI (`agy`) via:
   `agy -p <prompt> --dangerously-skip-permissions --output-format stream-json --json-schema <schema>`
3. Morphology Rule Engine:
   Deterministic NumPy vectorized morphology synthesis (100% Offline fallback)

Both CLIs operate in unleashed mode (all tools, file reading, bash execution enabled)
and stream real-time events via Server-Sent Events (SSE) to the frontend.
"""

import asyncio
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Any, AsyncGenerator


def _ensure_desktop_path() -> None:
    """Ensures macOS GUI `.app` bundles can locate `claude`, `agy`, Homebrew, and local CLI binaries."""
    extra_paths = [
        str(Path.home() / ".local" / "bin"),
        str(Path.home() / ".cargo" / "bin"),
        "/opt/homebrew/bin",
        "/opt/homebrew/sbin",
        "/usr/local/bin",
        "/usr/bin",
        "/bin",
        "/usr/sbin",
        "/sbin",
    ]
    current = os.environ.get("PATH", "").split(os.pathsep)
    merged = list(dict.fromkeys([p for p in extra_paths + current if p]))
    os.environ["PATH"] = os.pathsep.join(merged)


_ensure_desktop_path()

_BASE_DIR = Path(getattr(sys, "_MEIPASS", Path(__file__).parent))
SCHEMA_PATH = _BASE_DIR / "schemas" / "audit_schema.json"


def detect_claude_cli() -> dict[str, Any]:
    """Detects if Claude Code CLI (`claude` or `claude-code`) is installed and extracts its version."""
    _ensure_desktop_path()
    bin_path = shutil.which("claude") or shutil.which("claude-code")
    if not bin_path:
        return {
            "id": "claude",
            "name": "Claude Code CLI",
            "binary": "claude",
            "path": None,
            "version": None,
            "available": False,
            "badge": "Anthropic",
            "description": "Anthropic Claude Code headless agent (chưa cài đặt)",
        }

    ver_str = None
    try:
        res = subprocess.run([bin_path, "--version"], capture_output=True, text=True, timeout=4)
        if res.returncode == 0 and res.stdout.strip():
            ver_str = res.stdout.strip().splitlines()[0]
    except Exception:
        pass

    return {
        "id": "claude",
        "name": "Claude Code CLI",
        "binary": Path(bin_path).name,
        "path": bin_path,
        "version": ver_str or "Installed",
        "available": True,
        "badge": "Anthropic",
        "description": "Anthropic Claude Code headless agent với khả năng gọi Bash, đọc file & tối ưu Slicer chuyên sâu.",
    }


def detect_agy_cli() -> dict[str, Any]:
    """Detects if Antigravity CLI (`agy`) is installed and extracts its version."""
    _ensure_desktop_path()
    bin_path = shutil.which("agy")
    if not bin_path:
        return {
            "id": "agy",
            "name": "Antigravity agy CLI",
            "binary": "agy",
            "path": None,
            "version": None,
            "available": False,
            "badge": "Google",
            "description": "Google Antigravity headless agent (chưa cài đặt)",
        }

    ver_str = None
    try:
        res = subprocess.run([bin_path, "--version"], capture_output=True, text=True, timeout=4)
        if res.returncode == 0 and res.stdout.strip():
            ver_str = res.stdout.strip().splitlines()[0]
    except Exception:
        pass

    return {
        "id": "agy",
        "name": "Antigravity agy CLI",
        "binary": "agy",
        "path": bin_path,
        "version": ver_str or "Installed",
        "available": True,
        "badge": "Google",
        "description": "Google Antigravity headless agent stream với các công cụ tối ưu .3mf.",
    }


def get_available_engines() -> dict[str, Any]:
    """Returns all supported AI engines and their current availability on the host."""
    claude_info = detect_claude_cli()
    agy_info = detect_agy_cli()
    engine_info = {
        "id": "engine",
        "name": "Morphology Rule Engine",
        "binary": "builtin",
        "path": "builtin",
        "version": "2.0.0",
        "available": True,
        "badge": "Offline",
        "description": "Bộ quy tắc phân tích hình học NumPy thuần túy, hoạt động 100% offline không cần LLM.",
    }

    engines = [claude_info, agy_info, engine_info]
    # Default to claude if available, then agy, then offline engine
    if claude_info["available"]:
        default_engine = "claude"
    elif agy_info["available"]:
        default_engine = "agy"
    else:
        default_engine = "engine"

    available_count = sum(1 for e in engines if e["available"])

    return {
        "engines": engines,
        "default_engine": default_engine,
        "has_multiple_clis": (claude_info["available"] and agy_info["available"]),
        "available_count": available_count,
    }


def build_agent_prompt(
    file_path: Path,
    telemetry: dict[str, Any],
    baseline_audit: dict[str, Any],
    printer_preset: str,
    filament_preset: str,
    agent_brand: str = "AI Agent",
) -> str:
    compact_objects = [
        {
            "id": o["id"],
            "name": o["name"],
            "model_file": o.get("model_file", ""),
            "archetypes": o["archetypes"],
            "morphology_flags": o["morphology_flags"],
            "size_mm": o["size_mm"],
            "world_pos": o.get("world_pos", [0, 0, 0]),
            "footprint_l1_mm": o["footprint_l1_mm"],
            "footprint_l10_mm": o.get("footprint_l10_mm", [0, 0]),
            "l1_vertex_count": o["l1_vertex_count"],
            "triangle_count": o.get("triangle_count", 0),
            "metrics": o["metrics"],
            "overrides": o["overrides"],
        }
        for o in telemetry.get("objects", [])
    ]

    prompt_payload = {
        "file_path": str(file_path),
        "filename": telemetry.get("filename"),
        "source_format": telemetry.get("source_format", "3mf"),
        "target_printer": printer_preset,
        "target_filament": filament_preset,
        "plates": telemetry.get("plates", []),
        "objects": compact_objects,
        "initial_morphology_hints": baseline_audit,
    }

    return (
        f"Bạn là Principal 3D Print Engineer & Slicer Architect của hệ thống LayerZero Studio.\n"
        f"Người dùng vừa nạp file mô hình 3D định dạng `.{telemetry.get('source_format', '3mf')}` tại đường dẫn thực tế: `{file_path}`\n"
        f"Mục tiêu cấu hình máy in: `{printer_preset}` | Vật liệu nhựa: `{filament_preset}`.\n\n"
        "QUYỀN HẠN & CÔNG CỤ CỦA BẠN (UNLEASHED MODE):\n"
        f"- Bạn có TOÀN QUYỀN chạy lệnh Bash / Python (`run_command`), đọc file (`view_file`), hoặc tham chiếu skill `bambu-3mf-optimizer` "
        f"để kiểm tra sâu bên trong file `{file_path}` (nếu là `.3mf`: kiểm tra `Metadata/project_settings.config`, `Metadata/model_settings.config`; "
        "nếu là `.stl`: kiểm tra lưới tam giác 3D, mặt cắt Z, diện tích bám bàn hoặc chạy script Python kiểm định thêm bất kỳ thông số nào bạn muốn).\n"
        "- Dưới đây đã có sẵn `initial_morphology_hints` do bộ đo NumPy quét nhanh trên lưới tam giác 3D để giúp bạn nắm bắt tổng quan ngay lập tức. "
        "Hãy kiểm tra thêm (nếu cần) và dùng trí tuệ kỹ thuật in 3D của bạn để tổng hợp, nâng cấp hoặc điều chỉnh lại thành Báo cáo Chẩn đoán & Tối ưu cuối cùng.\n\n"
        "YÊU CẦU KẾT QUẢ ĐẦU RA:\n"
        "1. KHÔNG hỏi lại người dùng. Tự đưa ra quyết định kỹ thuật tối ưu nhất.\n"
        "2. Bao phủ toàn diện 2 trụ cột:\n"
        "   - `safety` (Độ an toàn & Chống lỗi in): Đáy khớp cầu/điểm tiếp xúc nhỏ tại Z=0 (`FLATTEN_BOTTOM`), thiếu Support gầm hoặc dính Support Blocker ở đế (`REINFORCE_SUPPORTS`), "
        "ốc vít có rãnh tua-vít không Brim / dung sai lỗ chốt (`OPTIMIZE_SCREW`), chi tiết cao mảnh nhạy quán tính trượt bàn Y / cổ thắt (`ROTATE_YAW`, `BRIDGE_AND_NECK_COOLING`).\n"
        "   - `aesthetics` (Độ đẹp bề mặt theo hình thái): Đỉnh vòm/mặt cầu bị bậc thang (`ADAPTIVE_LAYER_DOME` + Concentric Top), mặt hộp phẳng ngang rộng cần là mịn (`IRONING_FLAT_TOP`), "
        "thân trụ tròn không có góc giấu Z-Seam (`SCARF_SEAM_CYLINDER` + Arc Fitting G2/G3), chi tiết mảnh/nhiều đa giác (`ARACHNE_FINE_DETAIL`), và gợi ý tùy chọn nhám mờ (`FUZZY_SKIN` với `approved: false`).\n"
        "3. Mọi mô tả (`summary`, `title`, `desc`, `pill_text`, `meaning`, `reason`) viết bằng tiếng Việt sắc sảo, giải thích rõ 'Vì sao' dựa trên con số thực tế của mô hình này.\n\n"
        f"HỒ SƠ DỮ LIỆU ĐẦU VÀO:\n{json.dumps(prompt_payload, ensure_ascii=False)}"
    )


def _format_tool_activity(agent_label: str, tool_name: str, tool_info: dict[str, Any]) -> tuple[str, str]:
    """Formats a human-readable Vietnamese activity log entry from an agent tool call."""
    params = tool_info.get("parameters", {}) if isinstance(tool_info, dict) else tool_info
    if not isinstance(params, dict):
        params = {}

    if tool_name in ("run_command", "Bash", "bash"):
        cmd_str = str(params.get("CommandLine") or params.get("command") or "")
        summary = str(params.get("toolSummary") or "Thực thi lệnh kiểm tra 3D/Slicer")
        return f"🛠️ {agent_label} chạy lệnh: {summary}", cmd_str[:160]

    if tool_name in ("view_file", "read_file", "Read", "read", "View"):
        path_str = str(params.get("Path") or params.get("AbsolutePath") or params.get("file_path") or params.get("path") or "")
        return f"📖 {agent_label} đọc file: {Path(path_str).name if path_str else 'cấu hình'}", path_str

    if tool_name in ("finish", "StructuredOutput"):
        return f"✅ {agent_label} đã đóng gói báo cáo JSON chuẩn Schema", "Hoàn tất suy luận kỹ thuật"

    return f"⚡ {agent_label} gọi công cụ: {tool_name}", json.dumps(params, ensure_ascii=False)[:140]


async def stream_claude_audit(
    file_path: Path,
    telemetry: dict[str, Any],
    baseline_audit: dict[str, Any],
    printer_preset: str = "Bambu Lab A1 0.4 nozzle",
    filament_preset: str = "Bambu PLA Lite @BBL A1",
) -> AsyncGenerator[str, None]:
    """Streams real-time SSE events while running Claude Code CLI (`claude`)."""
    t0 = time.time()

    def sse(payload: dict[str, Any]) -> str:
        payload["elapsed_s"] = round(time.time() - t0, 1)
        return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

    yield sse({
        "type": "log",
        "step": "profiler",
        "title": f"📐 NumPy Morphology Profiler đã đo đạc {len(telemetry.get('objects', []))} chi tiết 3D",
        "detail": f"File: {telemetry.get('filename')} ({telemetry.get('file_size_mb')} MB) · Đã trích xuất pháp tuyến, diện tích đáy Z=0, mặt phẳng đỉnh & độ cong vòm.",
    })

    claude_info = detect_claude_cli()
    claude_bin = claude_info.get("path")
    if not claude_bin:
        yield sse({
            "type": "log",
            "step": "fallback",
            "title": "⚠️ Không tìm thấy Claude Code CLI trong PATH, sử dụng kết quả Morphology Engine",
            "detail": "Hãy cài đặt Claude Code CLI (https://claude.ai/code) để kích hoạt chế độ AI Agent chuyên sâu.",
        })
        yield sse({"type": "complete", "report": baseline_audit, "source": "engine"})
        return

    prompt = build_agent_prompt(file_path, telemetry, baseline_audit, printer_preset, filament_preset, "Claude Code")
    schema_str = SCHEMA_PATH.read_text(encoding="utf-8")

    cmd = [
        claude_bin,
        "-p",
        prompt,
        "--dangerously-skip-permissions",
        "--output-format",
        "stream-json",
        "--verbose",
        "--json-schema",
        schema_str,
    ]

    yield sse({
        "type": "log",
        "step": "spawn",
        "title": f"🚀 Khởi chạy Claude Code CLI ({claude_info.get('version', 'v2.x')}) Unleashed",
        "detail": "claude -p <prompt> --dangerously-skip-permissions --output-format stream-json --verbose --json-schema",
    })
    yield sse({
        "type": "status",
        "message": "Claude Code đang khởi tạo phiên làm việc & nạp công cụ...",
    })

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            limit=16 * 1024 * 1024,
        )

        final_report: dict[str, Any] | None = None
        seen_tool_ids: set[str] = set()
        step_counter = 0

        assert proc.stdout is not None
        while True:
            try:
                line_bytes = await asyncio.wait_for(proc.stdout.readline(), timeout=180.0)
            except asyncio.TimeoutError:
                proc.kill()
                yield sse({
                    "type": "log",
                    "step": "timeout",
                    "title": "⏱️ Claude Code chạy quá 180s, sử dụng báo cáo kết hợp",
                    "detail": "",
                })
                break

            if not line_bytes:
                break

            line = line_bytes.decode("utf-8", errors="ignore").strip()
            if not line:
                continue

            try:
                evt = json.loads(line)
            except Exception:
                continue

            if not isinstance(evt, dict):
                continue

            ev_type = evt.get("type")
            subtype = evt.get("subtype")

            # 1. System initialization
            if ev_type == "system" and subtype == "init":
                tools_cnt = len(evt.get("tools", []))
                sid = evt.get("session_id", "")[:8]
                model = evt.get("model", "claude")
                yield sse({
                    "type": "log",
                    "step": "init",
                    "title": f"🧠 Phiên Claude Code #{sid} ({model}) đã sẵn sàng ({tools_cnt} tools)",
                    "detail": f"Workspace: {evt.get('cwd', '')}",
                })
                yield sse({
                    "type": "status",
                    "message": f"Claude Code #{sid} đang phân tích hình học & cấu hình .3mf...",
                })

            # 2. Assistant message (thinking, tool use, or reasoning text)
            elif ev_type == "assistant":
                msg = evt.get("message", {})
                content_items = msg.get("content", [])
                if isinstance(content_items, list):
                    for item in content_items:
                        if not isinstance(item, dict):
                            continue
                        c_type = item.get("type")

                        if c_type == "tool_use":
                            tool_id = item.get("id", str(step_counter))
                            if tool_id in seen_tool_ids:
                                continue
                            seen_tool_ids.add(tool_id)
                            step_counter += 1

                            t_name = item.get("name", "tool")
                            t_input = item.get("input", {})
                            if t_name == "StructuredOutput" and isinstance(t_input, dict):
                                if "diagnostic_cards" in t_input and "settings_diff" in t_input:
                                    final_report = t_input

                            title, detail = _format_tool_activity("Claude Code", t_name, t_input)
                            yield sse({
                                "type": "log",
                                "step": f"tool_{step_counter}",
                                "title": title,
                                "detail": detail,
                            })
                            yield sse({
                                "type": "status",
                                "message": title,
                            })

                        elif c_type == "thinking":
                            th_text = str(item.get("thinking", "")).strip()
                            if th_text and len(th_text) > 20:
                                step_counter += 1
                                preview = th_text[:140] + ("..." if len(th_text) > 140 else "")
                                yield sse({
                                    "type": "log",
                                    "step": f"think_{step_counter}",
                                    "title": f"💭 Claude Code suy luận bước #{step_counter}",
                                    "detail": preview,
                                })

                        elif c_type == "text":
                            txt = str(item.get("text", "")).strip()
                            if txt and not txt.startswith("{"):
                                step_counter += 1
                                preview = txt[:140] + ("..." if len(txt) > 140 else "")
                                yield sse({
                                    "type": "log",
                                    "step": f"resp_{step_counter}",
                                    "title": f"💬 Claude Code phân tích chuyên gia",
                                    "detail": preview,
                                })

            # 3. Final Result
            elif ev_type == "result":
                struct_out = evt.get("structured_output")
                if isinstance(struct_out, dict) and "diagnostic_cards" in struct_out:
                    final_report = struct_out
                elif isinstance(evt.get("result"), str):
                    raw_r = evt["result"]
                    s_i = raw_r.find("{")
                    e_i = raw_r.rfind("}")
                    if s_i != -1 and e_i != -1:
                        try:
                            parsed = json.loads(raw_r[s_i : e_i + 1])
                            if "diagnostic_cards" in parsed:
                                final_report = parsed
                        except Exception:
                            pass

                dur_total = round(float(evt.get("duration_ms", 0)) / 1000.0, 1)
                turns = evt.get("num_turns", 1)
                cost = evt.get("total_cost_usd")
                cost_str = f" · ${cost:.4f}" if cost is not None else ""
                yield sse({
                    "type": "log",
                    "step": "result",
                    "title": f"✨ Claude Code hoàn tất trong {dur_total}s ({turns} turns{cost_str})",
                    "detail": "Đã trả về báo cáo JSON tuân thủ Schema.",
                })

        await proc.wait()

        if final_report:
            yield sse({
                "type": "status",
                "message": "Claude Code AI Audit hoàn tất · Đã hiển thị kết quả của AI",
            })
            yield sse({
                "type": "complete",
                "report": final_report,
                "source": "claude",
            })
        else:
            yield sse({
                "type": "log",
                "step": "fallback_done",
                "title": "ℹ️ Sử dụng báo cáo tổng hợp từ Morphology Engine",
                "detail": "",
            })
            yield sse({
                "type": "complete",
                "report": baseline_audit,
                "source": "engine",
            })

    except Exception as exc:
        yield sse({
            "type": "log",
            "step": "error",
            "title": f"⚠️ Lỗi khi chạy Claude Code: {exc}",
            "detail": "",
        })
        yield sse({
            "type": "complete",
            "report": baseline_audit,
            "source": "engine",
        })


async def stream_agy_audit(
    file_path: Path,
    telemetry: dict[str, Any],
    baseline_audit: dict[str, Any],
    printer_preset: str = "Bambu Lab A1 0.4 nozzle",
    filament_preset: str = "Bambu PLA Lite @BBL A1",
) -> AsyncGenerator[str, None]:
    """Streams real-time SSE events while running Antigravity CLI (`agy`)."""
    t0 = time.time()

    def sse(payload: dict[str, Any]) -> str:
        payload["elapsed_s"] = round(time.time() - t0, 1)
        return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

    yield sse({
        "type": "log",
        "step": "profiler",
        "title": f"📐 NumPy Morphology Profiler đã đo đạc {len(telemetry.get('objects', []))} chi tiết 3D",
        "detail": f"File: {telemetry.get('filename')} ({telemetry.get('file_size_mb')} MB) · Đã trích xuất pháp tuyến, diện tích đáy Z=0, mặt phẳng đỉnh & độ cong vòm.",
    })

    agy_info = detect_agy_cli()
    agy_bin = agy_info.get("path")
    if not agy_bin:
        yield sse({
            "type": "log",
            "step": "fallback",
            "title": "⚠️ Không tìm thấy agy CLI trong PATH, sử dụng kết quả Morphology Engine",
            "detail": "",
        })
        yield sse({"type": "complete", "report": baseline_audit, "source": "engine"})
        return

    prompt = build_agent_prompt(file_path, telemetry, baseline_audit, printer_preset, filament_preset, "Antigravity agy")
    schema_str = SCHEMA_PATH.read_text(encoding="utf-8")

    cmd = [
        agy_bin,
        "-p",
        prompt,
        "--dangerously-skip-permissions",
        "--output-format",
        "stream-json",
        "--json-schema",
        schema_str,
    ]

    yield sse({
        "type": "log",
        "step": "spawn",
        "title": f"🚀 Khởi chạy agy CLI Headless ({agy_info.get('version', 'v1.x')}) Unleashed",
        "detail": "agy -p <prompt> --dangerously-skip-permissions --output-format stream-json --json-schema",
    })
    yield sse({
        "type": "status",
        "message": "agy AI đang khởi tạo phiên làm việc & nạp công cụ...",
    })

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            limit=16 * 1024 * 1024,
        )

        final_report: dict[str, Any] | None = None
        seen_steps: set[tuple[Any, Any, Any]] = set()

        assert proc.stdout is not None
        while True:
            try:
                line_bytes = await asyncio.wait_for(proc.stdout.readline(), timeout=180.0)
            except asyncio.TimeoutError:
                proc.kill()
                yield sse({
                    "type": "log",
                    "step": "timeout",
                    "title": "⏱️ agy chạy quá 180s, sử dụng báo cáo kết hợp",
                    "detail": "",
                })
                break

            if not line_bytes:
                break

            line = line_bytes.decode("utf-8", errors="ignore").strip()
            if not line:
                continue

            try:
                evt = json.loads(line)
            except Exception:
                continue

            if not isinstance(evt, dict):
                continue

            ev_type = evt.get("event")

            if ev_type == "init":
                init_obj = evt.get("init", {})
                tools_cnt = len(init_obj.get("tools", []))
                conv_id = evt.get("conversation_id", "")[:8]
                yield sse({
                    "type": "log",
                    "step": "init",
                    "title": f"🧠 Phiên agy #{conv_id} đã sẵn sàng ({tools_cnt} tools được cấp quyền always-proceed)",
                    "detail": f"Workspace: {init_obj.get('cwd', '')}",
                })
                yield sse({
                    "type": "status",
                    "message": f"agy #{conv_id} đang phân tích hình học & cấu hình .3mf...",
                })

            elif ev_type == "step_update":
                su = evt.get("step_update", {})
                s_idx = su.get("step_index")
                s_state = su.get("state")
                s_type = su.get("step_type")
                dedup_key = (s_idx, s_state, s_type)
                if dedup_key in seen_steps:
                    continue
                seen_steps.add(dedup_key)

                if s_type == "tool" and s_state == "ACTIVE":
                    t_name = su.get("tool_name", "tool")
                    t_info = su.get("tool_info", {})
                    if t_name == "finish" and isinstance(t_info, dict) and isinstance(t_info.get("parameters"), dict):
                        params = t_info["parameters"]
                        if "diagnostic_cards" in params and "settings_diff" in params:
                            final_report = params
                    title, detail = _format_tool_activity("agy", t_name, t_info)
                    yield sse({
                        "type": "log",
                        "step": f"tool_{s_idx}",
                        "title": title,
                        "detail": detail,
                    })
                    yield sse({
                        "type": "status",
                        "message": title,
                    })

                elif s_type == "agent_response" and s_state == "DONE":
                    usage = su.get("usage", {})
                    think_tok = usage.get("thinking_tokens", 0)
                    out_tok = usage.get("output_tokens", 0)
                    dur = round(float(su.get("duration_seconds", 0)), 1)
                    text_delta = str(su.get("text_delta", "")).strip()
                    preview_txt = text_delta[:160] + ("..." if len(text_delta) > 160 else "")
                    yield sse({
                        "type": "log",
                        "step": f"resp_{s_idx}",
                        "title": f"💭 agy suy luận bước #{s_idx} ({dur}s · {think_tok} thinking tokens · {out_tok} output tokens)",
                        "detail": preview_txt if not preview_txt.startswith("{") else "Đang cấu trúc hóa báo cáo chẩn đoán 3MF...",
                    })
                    yield sse({
                        "type": "status",
                        "message": f"agy đã suy luận xong bước #{s_idx} ({think_tok} thinking tokens)...",
                    })

            elif ev_type == "result":
                res_obj = evt.get("result", {})
                struct_out = res_obj.get("structured_output")
                if isinstance(struct_out, dict) and "diagnostic_cards" in struct_out:
                    final_report = struct_out
                elif isinstance(res_obj.get("response"), str):
                    raw_r = res_obj["response"]
                    s_i = raw_r.find("{")
                    e_i = raw_r.rfind("}")
                    if s_i != -1 and e_i != -1:
                        try:
                            parsed = json.loads(raw_r[s_i : e_i + 1])
                            if "diagnostic_cards" in parsed:
                                final_report = parsed
                        except Exception:
                            pass

                dur_total = round(float(res_obj.get("duration_seconds", 0)), 1)
                turns = res_obj.get("num_turns", 1)
                yield sse({
                    "type": "log",
                    "step": "result",
                    "title": f"✨ agy hoàn tất trong {dur_total}s ({turns} turns)",
                    "detail": "Đã trả về báo cáo JSON tuân thủ Schema.",
                })

        await proc.wait()

        if final_report:
            yield sse({
                "type": "status",
                "message": "agy AI Audit hoàn tất · Đã hiển thị kết quả của AI",
            })
            yield sse({
                "type": "complete",
                "report": final_report,
                "source": "agy",
            })
        else:
            yield sse({
                "type": "log",
                "step": "fallback_done",
                "title": "ℹ️ Sử dụng báo cáo tổng hợp từ Morphology Engine",
                "detail": "",
            })
            yield sse({
                "type": "complete",
                "report": baseline_audit,
                "source": "engine",
            })

    except Exception as exc:
        yield sse({
            "type": "log",
            "step": "error",
            "title": f"⚠️ Lỗi khi chạy agy: {exc}",
            "detail": "",
        })
        yield sse({
            "type": "complete",
            "report": baseline_audit,
            "source": "engine",
        })


async def stream_agent_audit(
    file_path: Path,
    telemetry: dict[str, Any],
    baseline_audit: dict[str, Any],
    printer_preset: str = "Bambu Lab A1 0.4 nozzle",
    filament_preset: str = "Bambu PLA Lite @BBL A1",
    agent_id: str = "auto",
) -> AsyncGenerator[str, None]:
    """
    Unified entry point for streaming AI analysis.
    Dispatches to Claude Code CLI, Antigravity agy CLI, or Morphology Engine.
    """
    selected = agent_id.lower().strip()
    if selected in ("auto", ""):
        claude_avail = detect_claude_cli()["available"]
        agy_avail = detect_agy_cli()["available"]
        if claude_avail:
            selected = "claude"
        elif agy_avail:
            selected = "agy"
        else:
            selected = "engine"

    if selected in ("claude", "claude-code"):
        async for chunk in stream_claude_audit(file_path, telemetry, baseline_audit, printer_preset, filament_preset):
            yield chunk
    elif selected == "agy":
        async for chunk in stream_agy_audit(file_path, telemetry, baseline_audit, printer_preset, filament_preset):
            yield chunk
    else:
        # Offline deterministic engine
        t0 = time.time()
        def sse(payload: dict[str, Any]) -> str:
            payload["elapsed_s"] = round(time.time() - t0, 1)
            return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

        yield sse({
            "type": "log",
            "step": "engine",
            "title": "⚙️ Sử dụng Bộ Quy tắc Morphology Rule Engine (100% Offline)",
            "detail": f"Đã tính toán dựa trên {len(telemetry.get('objects', []))} chi tiết và {len(baseline_audit.get('diagnostic_cards', []))} đề xuất tối ưu.",
        })
        yield sse({
            "type": "status",
            "message": "Morphology Rule Engine hoàn tất",
        })
        yield sse({
            "type": "complete",
            "report": baseline_audit,
            "source": "engine",
        })
