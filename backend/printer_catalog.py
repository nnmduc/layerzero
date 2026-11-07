"""
Printer catalog: every printer LayerZero can target, grouped by vendor, plus where each
vendor's system presets come from.

Bambu presets are read from the local Bambu Studio install (see `profiler.BBL_SYSTEM_DIR`).
Snapmaker U1 presets are bundled in `vendor_profiles/snapmaker-u1-presets.json`, generated from
Snapmaker Orca's official profiles by `scripts/build-snapmaker-u1-profiles.py`, so U1 support
works even before Snapmaker Orca is installed.

`kinematics` drives which rules apply: bed-slinger advice (Y-axis inertia, lower acceleration,
rotating tall parts) is only proposed for `bedslinger` printers.
"""

import json
import sys
from functools import lru_cache
from pathlib import Path
from typing import Any

from profiler import load_bbl_system_profiles

_BASE_DIR = Path(getattr(sys, "_MEIPASS", Path(__file__).parent))
SNAPMAKER_U1_PRESETS_PATH = _BASE_DIR / "vendor_profiles" / "snapmaker-u1-presets.json"

SLICERS: dict[str, dict[str, str]] = {
    "bambu_studio": {
        "label": "Bambu Studio",
        "download_url": "https://bambulab.com/en/download/studio",
    },
    "snapmaker_orca": {
        "label": "Snapmaker Orca",
        "download_url": "https://github.com/Snapmaker/OrcaSlicer/releases/latest",
    },
}


def _bambu(label: str, kinematics: str, enclosed: bool, model_id: str, suffix: str, process_suffix: str | None = None) -> dict[str, Any]:
    return {
        "label": label,
        "vendor": "bbl",
        "vendor_label": "Bambu Lab",
        "kinematics": kinematics,
        "enclosed": enclosed,
        "nozzle": "0.4",
        "slicer": "bambu_studio",
        "max_tools": None,  # AMS: filament slots are swapped through one nozzle
        "printer_model_id": model_id,
        "fallback_filament_suffix": suffix,
        "fallback_process_suffix": process_suffix or suffix,
    }


def _snapmaker_u1(nozzle: str) -> dict[str, Any]:
    return {
        "label": "U1",
        "vendor": "snapmaker",
        "vendor_label": "Snapmaker",
        "kinematics": "corexy_toolchanger",
        "enclosed": False,  # the optional Top Cover is a filtration lid, not a heated chamber
        "nozzle": nozzle,
        "slicer": "snapmaker_orca",
        "max_tools": 4,
        "printer_model_id": "SM_U1",
        "fallback_filament_suffix": f"@U1 {nozzle} nozzle",
        "fallback_process_suffix": f"@Snapmaker U1 ({nozzle} nozzle)",
    }


# Keys are the slicer's printer preset names (`printer_settings_id` in a project file).
PRINTERS: dict[str, dict[str, Any]] = {
    "Bambu Lab A1 0.4 nozzle": _bambu("A1", "bedslinger", False, "N2S", "@BBL A1"),
    "Bambu Lab A1 mini 0.4 nozzle": _bambu("A1 mini", "bedslinger", False, "N1", "@BBL A1M"),
    "Bambu Lab P1S 0.4 nozzle": _bambu("P1S", "corexy", True, "C12", "@BBL X1C"),
    "Bambu Lab X1 Carbon 0.4 nozzle": _bambu("X1C", "corexy", True, "BL-P001", "@BBL X1C"),
    **{f"Snapmaker U1 ({n} nozzle)": _snapmaker_u1(n) for n in ("0.2", "0.4", "0.6", "0.8")},
}
DEFAULT_PRINTER = "Bambu Lab A1 0.4 nozzle"

# UI filament key -> preset base name per vendor. The U1 profile set has no PLA Lite, and its
# generic PLA is the closest match for both Bambu PLA grades.
VENDOR_FILAMENTS: dict[str, dict[str, str]] = {
    "bbl": {"PLA Lite": "Bambu PLA Lite", "PLA Basic": "Bambu PLA Basic", "PETG HF": "Bambu PETG HF"},
    "snapmaker": {"PLA Lite": "Generic PLA", "PLA Basic": "Generic PLA", "PETG HF": "Generic PETG HF"},
}


def normalize_printer(printer: str) -> str:
    return printer if printer in PRINTERS else DEFAULT_PRINTER


def printer_meta(printer: str) -> dict[str, Any]:
    return PRINTERS[normalize_printer(printer)]


def vendor_of(printer: str) -> str:
    return printer_meta(printer)["vendor"]


def is_bedslinger(printer: str) -> bool:
    return printer_meta(printer)["kinematics"] == "bedslinger"


@lru_cache(maxsize=1)
def load_snapmaker_u1_bundle() -> dict[str, Any]:
    """The bundled U1 preset file: `presets`, `default_process`, `printer_model_id`, `source`."""
    try:
        return json.loads(SNAPMAKER_U1_PRESETS_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {"presets": {}, "default_process": {}, "source": {}}


def native_app_version(printer: str) -> str | None:
    """Slicer version a project for this printer should claim (`Snapmaker_Orca-<ver>`), so the
    target slicer treats it as its own file; None keeps the author's Bambu Studio version."""
    if vendor_of(printer) != "snapmaker":
        return None
    release = str(load_snapmaker_u1_bundle()["source"].get("release") or "v2.4.1")
    return release.lstrip("v")


def profiles_for(printer: str) -> dict[str, dict]:
    """System presets of the printer's vendor, keyed by preset name (read-only)."""
    if vendor_of(printer) == "snapmaker":
        return load_snapmaker_u1_bundle()["presets"]
    return load_bbl_system_profiles()


def source_vendor_of(project_settings: dict[str, Any]) -> str | None:
    """Vendor the author's project was saved for; None for STL / PrusaSlicer / unknown files."""
    printer = str(project_settings.get("printer_settings_id") or "")
    model = str(project_settings.get("printer_model") or "")
    text = f"{printer} {model}".lower()
    if "snapmaker" in text:
        return "snapmaker"
    if "bambu lab" in text:
        return "bbl"
    return None


def needs_cross_vendor_retarget(project_settings: dict[str, Any], printer: str) -> bool:
    """True when the project's machine settings come from another vendor than the target printer.
    Files without a known vendor (STL, PrusaSlicer) keep today's Bambu path when targeting Bambu."""
    return (source_vendor_of(project_settings) or "bbl") != vendor_of(printer)
