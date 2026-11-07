"""
LayerZero Studio FastAPI Backend
================================
Provides REST & SSE endpoints for:
- Uploading or loading local sample `.3mf` files
- Extracting real 3D mesh buffers & surface topology telemetry
- Streaming headless `agy` AI analysis via Server-Sent Events (SSE)
- Applying approved geometry & slicer modifications to export a new `.3mf`
- Launching the optimized `.3mf` directly in Bambu Studio on macOS
"""

import multiprocessing
import os
import shutil
import subprocess
import sys
import uuid
from pathlib import Path
from typing import Any

import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

from ai_runner import _ensure_desktop_path, get_available_engines, stream_agent_audit
from patcher import apply_3mf_optimizations, apply_stl_export, build_baseline_audit
from filament_profiles import build_material_context, list_preset_options
from printer_catalog import PRINTERS, normalize_printer
from slicer_launcher import open_in_slicer, reveal_in_file_manager, slicer_installed
from profiler import profile_3mf

SUPPORTED_EXTENSIONS = (".3mf", ".stl")

_ensure_desktop_path()

if sys.platform == "darwin":
    STORAGE_DIR = Path.home() / "Library" / "Application Support" / "LayerZero" / "storage"
elif sys.platform == "win32":
    STORAGE_DIR = Path(os.environ.get("LOCALAPPDATA", str(Path.home()))) / "LayerZero" / "storage"
else:
    STORAGE_DIR = Path.home() / ".local" / "share" / "layerzero" / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="LayerZero 3MF AI Optimizer API",
    description="REST & SSE API for 3D Morphology Profiling, Headless AI Slicer Auditing, and Non-Destructive 3MF Patching.",
    version="2.3.0",
)

cors_origins = [o.strip() for o in os.environ.get("LAYERZERO_CORS_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store mapping session_id -> {path, telemetry, baseline_audit, last_output_path}
SESSIONS: dict[str, dict[str, Any]] = {}
MAX_STORED_SESSIONS = 20


def _prune_old_sessions() -> None:
    """Keeps disk storage bounded by pruning oldest session directories beyond MAX_STORED_SESSIONS."""
    try:
        subdirs = [d for d in STORAGE_DIR.iterdir() if d.is_dir()]
        if len(subdirs) > MAX_STORED_SESSIONS:
            subdirs.sort(key=lambda d: d.stat().st_mtime)
            for old_dir in subdirs[:-MAX_STORED_SESSIONS]:
                shutil.rmtree(old_dir, ignore_errors=True)
                SESSIONS.pop(old_dir.name, None)
    except Exception:
        pass


class LoadLocalRequest(BaseModel):
    path: str
    printer_preset: str = "Bambu Lab A1 0.4 nozzle"
    filament_preset: str = "PLA Lite"


class BaselineRequest(BaseModel):
    session_id: str
    printer_preset: str = "Bambu Lab A1 0.4 nozzle"
    filament_preset: str = "PLA Lite"
    slot_filaments: list[str | None] | None = None


class ApplyRequest(BaseModel):
    session_id: str
    diagnostic_cards: list[dict[str, Any]]
    settings_diff: list[dict[str, Any]]
    printer_preset: str = "Bambu Lab A1 0.4 nozzle"
    # Printer the audit was computed for; differs from printer_preset when exporting for another printer.
    audit_printer_preset: str | None = None
    filament_preset: str = "PLA Lite"
    slot_filaments: list[str | None] | None = None
    export_format: str = "3mf"
    open_in_slicer: bool = False  # opens the printer's own slicer (Bambu Studio / Snapmaker Orca)
    open_in_bambu: bool = False  # legacy name of open_in_slicer
    reveal_in_finder: bool = False


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "layerzero-backend", "version": "2.3.0"}


@app.get("/api/presets")
def list_presets() -> dict[str, Any]:
    """Printer and filament choices with the exact Bambu preset each pair resolves to."""
    return list_preset_options()


def _material_context(telemetry: dict[str, Any], printer: str, filament: str,
                      slot_filaments: list[str | None] | None = None) -> dict[str, Any]:
    return build_material_context(telemetry.get("project_settings", {}), printer, filament, slot_filaments)


@app.post("/api/baseline")
def rebuild_baseline(req: BaselineRequest) -> dict[str, Any]:
    """Recomputes the rule-engine audit after the user changes printer, filament or slot mapping."""
    if req.session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session không tồn tại")
    sess = SESSIONS[req.session_id]
    audit = build_baseline_audit(sess["telemetry"], req.printer_preset, req.filament_preset)
    sess["baseline_audit"] = audit
    return {
        "audit": audit,
        "material_context": _material_context(sess["telemetry"], req.printer_preset, req.filament_preset, req.slot_filaments),
    }


@app.get("/api/agent-engines")
def list_agent_engines() -> dict[str, Any]:
    """Returns detected AI agent CLI engines (Claude Code, agy, Morphology Rule Engine)."""
    return get_available_engines()


@app.get("/api/samples")
def list_local_samples() -> list[dict[str, str]]:
    """Finds available .3mf and .stl files in ~/Downloads for instant 1-click testing."""
    downloads = Path.home() / "Downloads"
    samples: list[dict[str, str]] = []
    if downloads.exists():
        candidates = [
            p
            for p in downloads.rglob("*")
            if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS and "Optimized" not in p.name
        ]
        candidates.sort(key=lambda p: p.stat().st_mtime, reverse=True)
        for p in candidates[:8]:
            samples.append({
                "name": p.name,
                "path": str(p),
                "size_mb": f"{round(p.stat().st_size / (1024 * 1024), 2)} MB",
            })
    return samples


@app.post("/api/upload")
async def upload_3mf(
    file: UploadFile = File(...),
    printer_preset: str = "Bambu Lab A1 0.4 nozzle",
    filament_preset: str = "PLA Lite",
) -> dict[str, Any]:
    safe_filename = Path(file.filename or "").name
    if not safe_filename.lower().endswith(SUPPORTED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Vui lòng chọn file định dạng .3mf hoặc .stl")

    _prune_old_sessions()
    session_id = str(uuid.uuid4())[:8]
    session_dir = STORAGE_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    saved_path = session_dir / safe_filename

    with open(saved_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    telemetry = profile_3mf(saved_path, include_preview_mesh=True)
    baseline_audit = build_baseline_audit(telemetry, printer_preset, filament_preset)

    SESSIONS[session_id] = {
        "path": saved_path,
        "telemetry": telemetry,
        "baseline_audit": baseline_audit,
        "last_output_path": None,
    }

    return {
        "session_id": session_id,
        "telemetry": telemetry,
        "audit": baseline_audit,
        "material_context": _material_context(telemetry, printer_preset, filament_preset),
    }


@app.post("/api/load-local")
def load_local_3mf(req: LoadLocalRequest) -> dict[str, Any]:
    src = Path(req.path).expanduser().resolve()
    if not src.exists() or not src.is_file() or not src.name.lower().endswith(SUPPORTED_EXTENSIONS):
        raise HTTPException(status_code=404, detail=f"Không tìm thấy file .3mf hoặc .stl: {req.path}")

    _prune_old_sessions()
    session_id = str(uuid.uuid4())[:8]
    session_dir = STORAGE_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    saved_path = session_dir / src.name
    shutil.copy2(src, saved_path)

    telemetry = profile_3mf(saved_path, include_preview_mesh=True)
    baseline_audit = build_baseline_audit(telemetry, req.printer_preset, req.filament_preset)

    SESSIONS[session_id] = {
        "path": saved_path,
        "telemetry": telemetry,
        "baseline_audit": baseline_audit,
        "last_output_path": None,
    }

    return {
        "session_id": session_id,
        "telemetry": telemetry,
        "audit": baseline_audit,
        "material_context": _material_context(telemetry, req.printer_preset, req.filament_preset),
    }


@app.get("/api/analyze/{session_id}")
async def analyze_with_ai_agent(
    session_id: str,
    printer_preset: str = "Bambu Lab A1 0.4 nozzle",
    filament_preset: str = "PLA Lite",
    agent: str = "auto",
) -> StreamingResponse:
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session không tồn tại")

    sess = SESSIONS[session_id]
    file_path: Path = sess["path"]
    # Strip heavy mesh_preview before passing telemetry to AI agent prompt
    light_telemetry = dict(sess["telemetry"])
    light_telemetry["objects"] = [
        {k: v for k, v in obj.items() if k != "mesh_preview"}
        for obj in sess["telemetry"].get("objects", [])
    ]
    baseline = build_baseline_audit(light_telemetry, printer_preset, filament_preset)

    return StreamingResponse(
        stream_agent_audit(file_path, light_telemetry, baseline, printer_preset, filament_preset, agent_id=agent),
        media_type="text/event-stream",
    )


# Proposals that only exist for some printers (bed-slinger inertia, plate-specific temperatures).
PRINTER_SPECIFIC_KEY_SUFFIXES = ("_acceleration", "plate_temp_initial_layer")


def _settings_diff_for_printer(settings_diff: list[dict[str, Any]], telemetry: dict[str, Any],
                               printer: str, filament: str) -> list[dict[str, Any]]:
    """Keeps the user's approvals but re-proposes vendor-derived values for another export printer
    (e.g. the audit ran for a U1 and the user exports the same project for a Bambu A1)."""
    target = {
        (s["key"], s.get("object_id", "global")): s
        for s in build_baseline_audit(telemetry, printer, filament)["settings_diff"]
    }
    out: list[dict[str, Any]] = []
    for s in settings_diff:
        t = target.get((s["key"], s.get("object_id", "global")))
        if t:
            out.append({**s, "proposed_val": t["proposed_val"], "default_val": t["default_val"]})
        elif not s["key"].endswith(PRINTER_SPECIFIC_KEY_SUFFIXES):
            out.append(s)
    return out


@app.post("/api/apply")
def apply_and_export(req: ApplyRequest) -> dict[str, Any]:
    if req.session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session không tồn tại")

    sess = SESSIONS[req.session_id]
    src_path: Path = sess["path"]
    stem = src_path.stem
    for suffix in ("_prusaslicer_bambu-studio", "_bambu-studio", "_bambu_studio"):
        if stem.lower().endswith(suffix):
            stem = stem[: -len(suffix)]
            break

    fmt = "stl" if req.export_format.lower() == "stl" else "3mf"
    target = PRINTERS[normalize_printer(req.printer_preset)]
    # Tag non-Bambu exports so a U1 file is never confused with the Bambu one in ~/Downloads.
    printer_tag = "" if target["vendor"] == "bbl" or fmt == "stl" else f"_{target['label']}-{target['nozzle']}"
    dst_path = src_path.with_name(f"{stem}_LayerZero_Optimized{printer_tag}.{fmt}")
    if fmt == "stl":
        res = apply_stl_export(
            src_path=src_path,
            dst_path=dst_path,
            diagnostic_cards=req.diagnostic_cards,
        )
    else:
        settings_diff = req.settings_diff
        if req.audit_printer_preset and normalize_printer(req.audit_printer_preset) != normalize_printer(req.printer_preset):
            settings_diff = _settings_diff_for_printer(
                settings_diff, sess["telemetry"], req.printer_preset, req.filament_preset
            )
        res = apply_3mf_optimizations(
            src_path=src_path,
            dst_path=dst_path,
            diagnostic_cards=req.diagnostic_cards,
            settings_diff=settings_diff,
            printer_preset=req.printer_preset,
            filament_preset=req.filament_preset,
            slot_overrides=req.slot_filaments,
        )
    sess["last_output_path"] = dst_path

    # Also copy to ~/Downloads so desktop users always have direct access
    downloads_dir = Path.home() / "Downloads"
    saved_downloads_path: Path | None = None
    if downloads_dir.exists():
        try:
            saved_downloads_path = downloads_dir / dst_path.name
            shutil.copy2(dst_path, saved_downloads_path)
        except Exception:
            saved_downloads_path = None

    target_to_open = saved_downloads_path or dst_path

    slicer = PRINTERS[normalize_printer(req.printer_preset)]["slicer"]
    opened = False
    if req.open_in_slicer or req.open_in_bambu:
        # Never hand a U1 project to the system's default .3mf app (often Bambu Studio):
        # without Snapmaker Orca installed, reveal the file instead.
        if slicer == "bambu_studio" or slicer_installed(slicer):
            open_in_slicer(slicer, target_to_open)
            opened = True
    if not opened and (req.reveal_in_finder or req.open_in_slicer or req.open_in_bambu):
        reveal_in_file_manager(target_to_open)

    return {
        "session_id": req.session_id,
        "download_url": f"/api/download/{req.session_id}",
        "saved_path": str(target_to_open),
        "slicer": slicer,
        "opened_in_slicer": opened,
        **res,
    }


@app.get("/api/download/{session_id}")
def download_optimized_3mf(session_id: str) -> FileResponse:
    if session_id not in SESSIONS or not SESSIONS[session_id].get("last_output_path"):
        raise HTTPException(status_code=404, detail="Chưa có file được xuất trong phiên này")

    out_path: Path = SESSIONS[session_id]["last_output_path"]
    media_type = (
        "model/stl"
        if out_path.suffix.lower() == ".stl"
        else "application/vnd.ms-package.3dmanufacturing-3dmodel+xml"
    )
    return FileResponse(
        path=out_path,
        filename=out_path.name,
        media_type=media_type,
    )


if __name__ == "__main__":
    multiprocessing.freeze_support()
    port = int(os.environ.get("LAYERZERO_PORT", "8008"))
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
