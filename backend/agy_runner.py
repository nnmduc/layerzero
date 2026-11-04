"""
LayerZero Unleashed Headless AI Agent (`agy`) Stream Runner
===========================================================
Invokes `agy -p --dangerously-skip-permissions --output-format stream-json --json-schema`
with FULL agentic capabilities (all tools, skills, bash/python execution enabled)
and streams every real-time step (`init`, `tool`, `agent_response`, `result`) via SSE to the frontend.
"""

import asyncio
import json
import os
import shutil
import sys
import time
from pathlib import Path
from typing import Any, AsyncGenerator


def _ensure_desktop_path() -> None:
    """Ensures macOS GUI `.app` bundles can locate `agy`, Homebrew, and local CLI binaries."""
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


def build_agent_prompt(
    file_path: Path,
    telemetry: dict[str, Any],
    baseline_audit: dict[str, Any],
    printer_preset: str,
    filament_preset: str,
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
        "target_printer": printer_preset,
        "target_filament": filament_preset,
        "plates": telemetry.get("plates", []),
        "objects": compact_objects,
        "initial_morphology_hints": baseline_audit,
    }

    return (
        "Bạn là Principal 3D Print Engineer & Slicer Architect của hệ thống LayerZero Studio.\n"
        f"Người dùng vừa nạp file mô hình 3D `.3mf` tại đường dẫn thực tế: `{file_path}`\n"
        f"Mục tiêu cấu hình máy in: `{printer_preset}` | Vật liệu nhựa: `{filament_preset}`.\n\n"
        "QUYỀN HẠN & CÔNG CỤ CỦA BẠN (UNLEASHED MODE):\n"
        "- Bạn có TOÀN QUYỀN chạy lệnh Bash / Python (`run_command`), đọc file (`view_file`), hoặc tham chiếu skill `bambu-3mf-optimizer` "
        f"để kiểm tra sâu bên trong file `{file_path}` (ví dụ: kiểm tra chi tiết `Metadata/project_settings.config`, `Metadata/model_settings.config`, "
        "kiểm tra mặt cắt Z, kiểm tra khoảng cách giữa các chi tiết, hoặc chạy script Python kiểm định thêm bất kỳ thông số nào bạn muốn).\n"
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


def _format_tool_activity(tool_name: str, tool_info: dict[str, Any]) -> tuple[str, str]:
    """Formats a human-readable Vietnamese activity log entry from an `agy` tool call."""
    params = tool_info.get("parameters", {}) if isinstance(tool_info, dict) else {}
    if tool_name == "run_command":
        cmd_str = str(params.get("CommandLine") or params.get("command") or "")
        summary = str(params.get("toolSummary") or "Thực thi lệnh kiểm tra chuyên sâu")
        return f"🛠️ agy chạy lệnh: {summary}", cmd_str[:160]
    if tool_name in ("view_file", "read_file"):
        path_str = str(params.get("Path") or params.get("AbsolutePath") or "")
        return f"📖 agy đọc file: {Path(path_str).name if path_str else 'cấu hình'}", path_str
    if tool_name == "finish":
        return "✅ agy đã đóng gói báo cáo JSON chuẩn Schema", "Hoàn tất suy luận kỹ thuật"
    return f"⚡ agy gọi công cụ: {tool_name}", json.dumps(params, ensure_ascii=False)[:140]


async def stream_agy_audit(
    file_path: Path,
    telemetry: dict[str, Any],
    baseline_audit: dict[str, Any],
    printer_preset: str = "Bambu Lab A1 0.4 nozzle",
    filament_preset: str = "Bambu PLA Lite @BBL A1",
) -> AsyncGenerator[str, None]:
    """
    Streams real-time SSE events (`log`, `status`, `complete`) while running `agy` headless
    with full permissions and tools enabled.
    """
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

    agy_bin = shutil.which("agy")
    if not agy_bin:
        yield sse({
            "type": "log",
            "step": "fallback",
            "title": "⚠️ Không tìm thấy agy CLI trong PATH, sử dụng kết quả Morphology Engine",
            "detail": "",
        })
        yield sse({"type": "complete", "report": baseline_audit, "source": "engine"})
        return

    prompt = build_agent_prompt(file_path, telemetry, baseline_audit, printer_preset, filament_preset)
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
        "title": "🚀 Khởi chạy agy CLI Headless (Full Permissions & Tools Unleashed)",
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
                    title, detail = _format_tool_activity(t_name, t_info)
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
