"""
Finds the installed slicer for a printer and opens an exported .3mf in it.

Bambu Studio opens Bambu Lab printers; Snapmaker Orca opens the Snapmaker U1. Snapmaker Orca's
`snapmaker-orca://open?file=` URL scheme only downloads HTTP(S) URLs, so local files are passed
to the app directly: by bundle id on macOS, by executable path on Windows and Linux.
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path

MAC_APPS: dict[str, dict[str, object]] = {
    "bambu_studio": {"bundle_id": "com.bambulab.bambu-studio", "names": ("BambuStudio.app", "Bambu Studio.app")},
    "snapmaker_orca": {"bundle_id": "com.snapmaker.snapmaker-orca", "names": ("Snapmaker Orca.app", "Snapmaker_Orca.app")},
}
WINDOWS_EXES: dict[str, tuple[str, str]] = {
    "bambu_studio": ("Bambu Studio", "bambu-studio.exe"),
    "snapmaker_orca": ("Snapmaker_Orca", "snapmaker-orca.exe"),
}
LINUX_COMMANDS: dict[str, tuple[str, ...]] = {
    "bambu_studio": ("bambu-studio", "BambuStudio"),
    "snapmaker_orca": ("snapmaker-orca", "Snapmaker_Orca"),
}


def _mac_app_path(slicer: str) -> Path | None:
    info = MAC_APPS[slicer]
    for root in (Path("/Applications"), Path.home() / "Applications"):
        for name in info["names"]:  # type: ignore[union-attr]
            if (root / name).exists():
                return root / name
    try:
        out = subprocess.run(
            ["mdfind", f"kMDItemCFBundleIdentifier == '{info['bundle_id']}'"],
            capture_output=True, text=True, timeout=3, check=False,
        ).stdout.split("\n")[0].strip()
        return Path(out) if out else None
    except (OSError, subprocess.SubprocessError):
        return None


def _windows_exe(slicer: str) -> Path | None:
    folder, exe = WINDOWS_EXES[slicer]
    for env in ("ProgramW6432", "ProgramFiles", "ProgramFiles(x86)", "LOCALAPPDATA"):
        base = os.environ.get(env)
        if base and (Path(base) / folder / exe).exists():
            return Path(base) / folder / exe
    return None


def _linux_command(slicer: str) -> str | None:
    return next((c for c in LINUX_COMMANDS[slicer] if shutil.which(c)), None)


def slicer_installed(slicer: str) -> bool:
    if slicer not in MAC_APPS:
        return False
    if sys.platform == "darwin":
        return _mac_app_path(slicer) is not None
    if sys.platform == "win32":
        return _windows_exe(slicer) is not None
    return _linux_command(slicer) is not None


def open_in_slicer(slicer: str, target: Path) -> None:
    """Opens `target` in the given slicer, falling back to the system default .3mf handler."""
    try:
        if sys.platform == "darwin":
            app = _mac_app_path(slicer)
            subprocess.Popen(["open", "-a", str(app), str(target)] if app else ["open", str(target)])
        elif sys.platform == "win32":
            exe = _windows_exe(slicer)
            if exe:
                subprocess.Popen([str(exe), str(target)])
            else:
                os.startfile(str(target))  # type: ignore[attr-defined]
        else:
            cmd = _linux_command(slicer)
            subprocess.Popen([cmd, str(target)] if cmd else ["xdg-open", str(target)])
    except Exception:
        reveal_in_file_manager(target)


def reveal_in_file_manager(target: Path) -> None:
    """Reveals the exported file in macOS Finder, Windows Explorer, or the Linux file manager."""
    try:
        if sys.platform == "darwin":
            subprocess.Popen(["open", "-R", str(target)])
        elif sys.platform == "win32":
            subprocess.Popen(["explorer", f"/select,{target}"])
        else:
            subprocess.Popen(["xdg-open", str(target.parent)])
    except Exception:
        pass
