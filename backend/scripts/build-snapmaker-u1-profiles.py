"""
Builds the bundled Snapmaker U1 preset file from Snapmaker's official profile repository.

LayerZero ships these presets so U1 support works without Snapmaker Orca installed. Each preset
is flattened (its `inherits` chain resolved), so the backend reads it like a Bambu system preset.

Use the profiles of the Snapmaker Orca release users actually run, so preset names match:
    git clone --depth 1 --branch v2.4.1 --filter=blob:none --sparse \
        https://github.com/Snapmaker/OrcaSlicer /tmp/sm-orca
    git -C /tmp/sm-orca sparse-checkout set --no-cone /resources/profiles/Snapmaker/ /resources/profiles/Snapmaker.json
    .venv/bin/python scripts/build-snapmaker-u1-profiles.py /tmp/sm-orca/resources/profiles   # from backend/

Newer releases keep the same layout in https://github.com/Snapmaker/snapmaker-profiles (pass its root).
"""

import json
import subprocess
import sys
from pathlib import Path

OUT_PATH = Path(__file__).resolve().parent.parent / "vendor_profiles" / "snapmaker-u1-presets.json"
NOZZLES = ("0.2", "0.4", "0.6", "0.8")
# Bundled filament families: the generic presets cover every material the U1 profile set knows.
FILAMENT_PREFIXES = ("Generic ",)
# Keys that only describe the profile file itself, or carry junk values in the vendor JSON.
DROP_KEYS = {"inherits", "include", "printer_settings_id", "print_settings_id", "filament_settings_id"}


def load_profiles(vendor_dir: Path) -> dict[str, dict]:
    profiles: dict[str, dict] = {}
    for path in vendor_dir.rglob("*.json"):
        data = json.loads(path.read_text(encoding="utf-8-sig"))
        if isinstance(data, dict) and data.get("name"):
            profiles[data["name"]] = data
    return profiles


def resolve(name: str, profiles: dict[str, dict]) -> dict:
    data = profiles[name]
    out: dict = {}
    if data.get("inherits"):
        out.update(resolve(data["inherits"], profiles))
    out.update(data)
    return out


def renamed_index(profiles: dict[str, dict]) -> dict[str, str]:
    """Old preset name -> current name, from each preset's `renamed_from` list."""
    index: dict[str, str] = {}
    for name, data in profiles.items():
        for old in str(data.get("renamed_from") or "").split(";"):
            if old.strip():
                index[old.strip()] = name
    return index


def is_u1_instance(data: dict, nozzle: str) -> bool:
    return (
        str(data.get("instantiation", "")).lower() == "true"
        and f"Snapmaker U1 ({nozzle} nozzle)" in (data.get("compatible_printers") or [])
    )


def main(repo_dir: Path) -> None:
    vendor_dir = repo_dir / "Snapmaker"
    profiles = load_profiles(vendor_dir)
    renamed = renamed_index(profiles)
    model = json.loads((vendor_dir / "machine" / "Snapmaker U1.json").read_text(encoding="utf-8-sig"))
    index = json.loads((repo_dir / "Snapmaker.json").read_text(encoding="utf-8-sig"))

    presets: dict[str, dict] = {}
    default_process: dict[str, str] = {}
    for nozzle in NOZZLES:
        machine_name = f"Snapmaker U1 ({nozzle} nozzle)"
        machine = resolve(machine_name, profiles)
        default = machine.get("default_print_profile", "")
        default_process[machine_name] = renamed.get(default, default)
        presets[machine_name] = machine
        for name, data in profiles.items():
            if data.get("type") == "process" and is_u1_instance(resolve(name, profiles), nozzle):
                presets[name] = resolve(name, profiles)
            elif data.get("type") == "filament" and name.startswith(FILAMENT_PREFIXES):
                resolved = resolve(name, profiles)
                if is_u1_instance(resolved, nozzle):
                    presets[name] = resolved

    for name, data in presets.items():
        presets[name] = {k: v for k, v in data.items() if k not in DROP_KEYS}
        presets[name]["name"] = name

    missing = [p for p in default_process.values() if p not in presets]
    if missing:
        raise SystemExit(f"Default process presets not found: {missing}")

    def git(*args: str) -> str:
        return subprocess.run(["git", "-C", str(repo_dir), *args], capture_output=True, text=True, check=False).stdout.strip()

    commit = git("rev-parse", "HEAD")
    remote = git("remote", "get-url", "origin").removesuffix(".git")
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps({
        "source": {
            "repository": remote,
            "release": git("describe", "--tags", "--exact-match"),
            "commit": commit,
            "vendor_version": index.get("version"),
        },
        "printer_model_id": model.get("model_id", "SM_U1"),
        "default_process": default_process,
        "presets": dict(sorted(presets.items())),
    }, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(presets)} presets to {OUT_PATH} (commit {commit[:7]})")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(Path(sys.argv[1]).resolve())
