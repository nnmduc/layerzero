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
    version="2.0.0",
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


def _open_in_bambu_studio(target: Path) -> None:
    """Launches the exported .3mf file in Bambu Studio (or system default handler) across platforms."""
    try:
        if sys.platform == "darwin":
            subprocess.Popen(["open", "-a", "BambuStudio", str(target)])
        elif sys.platform == "win32":
            os.startfile(str(target))  # type: ignore[attr-defined]
        else:
            subprocess.Popen(["xdg-open", str(target)])
    except Exception:
        if sys.platform == "darwin":
            subprocess.Popen(["open", str(target)])


def _reveal_in_file_manager(target: Path) -> None:
    """Reveals the exported .3mf file in macOS Finder, Windows Explorer, or Linux file manager."""
    try:
        if sys.platform == "darwin":
            subprocess.Popen(["open", "-R", str(target)])
        elif sys.platform == "win32":
            subprocess.Popen(["explorer", f"/select,{target}"])
        else:
            subprocess.Popen(["xdg-open", str(target.parent)])
    except Exception:
        pass


class LoadLocalRequest(BaseModel):
    path: str
    printer_preset: str = "Bambu Lab A1 0.4 nozzle"
    filament_preset: str = "Bambu PLA Lite @BBL A1"


class ApplyRequest(BaseModel):
    session_id: str
    diagnostic_cards: list[dict[str, Any]]
    settings_diff: list[dict[str, Any]]
    printer_preset: str = "Bambu Lab A1 0.4 nozzle"
    filament_preset: str = "Bambu PLA Lite @BBL A1"
    export_format: str = "3mf"
    open_in_bambu: bool = False
    reveal_in_finder: bool = False


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "layerzero-backend", "version": "2.0.0"}


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
    filament_preset: str = "Bambu PLA Lite @BBL A1",
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
    }


@app.get("/api/analyze/{session_id}")
async def analyze_with_ai_agent(
    session_id: str,
    printer_preset: str = "Bambu Lab A1 0.4 nozzle",
    filament_preset: str = "Bambu PLA Lite @BBL A1",
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
    dst_path = src_path.with_name(f"{stem}_LayerZero_Optimized.{fmt}")
    if fmt == "stl":
        res = apply_stl_export(
            src_path=src_path,
            dst_path=dst_path,
            diagnostic_cards=req.diagnostic_cards,
        )
    else:
        res = apply_3mf_optimizations(
            src_path=src_path,
            dst_path=dst_path,
            diagnostic_cards=req.diagnostic_cards,
            settings_diff=req.settings_diff,
            printer_preset=req.printer_preset,
            filament_preset=req.filament_preset,
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

    if req.open_in_bambu:
        _open_in_bambu_studio(target_to_open)
    elif req.reveal_in_finder:
        _reveal_in_file_manager(target_to_open)

    return {
        "session_id": req.session_id,
        "download_url": f"/api/download/{req.session_id}",
        "saved_path": str(target_to_open),
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
