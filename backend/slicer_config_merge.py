"""
Builds the patched Bambu Studio `project_settings` from the author's config plus vendor baselines.

Machine and process keys are reset to the vendor baseline for the selected printer. Filament keys
are written per AMS slot: only the slots chosen by `plan_slot_filaments` get the selected
filament's vendor values; every other slot (support interfaces, other materials) keeps the
author's values. This keeps mixed PLA + PETG / "Support for PLA/PETG" projects intact.
"""

from typing import Any

from filament_profiles import (
    describe_filament_slots,
    normalize_printer,
    plan_slot_filaments,
    resolve_filament_preset,
    resolve_process_preset,
    system_baseline,
)
from printer_catalog import profiles_for
from profiler import resolve_profile

# Keys that define multi-color AMS slots, purge matrix, prime tower, or machine geometry and must NOT be wiped
PRESERVE_ORIG_KEYS = {
    "filament_colour",
    "default_filament_colour",
    "filament_colour_type",
    "extruder_colour",
    "flush_volumes_matrix",
    "flush_volumes_vector",
    "flush_multiplier",
    "wiping_volumes_extruders",
    "filament_map",
    "filament_volume_map",
    "enable_prime_tower",
    "prime_tower_width",
    "prime_tower_brim_width",
    "prime_volume",
    "wipe_tower_no_sparse_layers",
    "printable_area",
    "bed_exclude_area",
    "head_wrap_detect_zone",
    "extruder_ams_count",
    "filament_dev_ams_drying_ams_limitations",
    "filament_dev_ams_drying_temperature",
    "filament_dev_ams_drying_time",
    "inherits_group",
    "upward_compatible_machine",
    "different_settings_to_system",
    "start_end_points",
    "curr_bed_type",
}
MACHINE_GEOMETRY_KEYS = ("printable_area", "printable_height", "bed_exclude_area", "head_wrap_detect_zone")
INTERNAL_PROFILE_KEYS = {
    "type", "name", "from", "instantiation", "inherits", "include", "setting_id", "description",
    "compatible_printers", "compatible_printers_condition", "compatible_prints", "compatible_prints_condition",
}


def _first(v: Any) -> Any:
    return v[0] if isinstance(v, list) and len(v) > 0 else v


def _skip(k: str) -> bool:
    return k in PRESERVE_ORIG_KEYS or k in INTERNAL_PROFILE_KEYS or k.startswith("machine_max_")


def build_patched_config(
    orig_cfg: dict[str, Any],
    printer: str,
    filament: str,
    slot_overrides: list[str | None] | None = None,
) -> tuple[dict[str, Any], dict[int, str], set[str]]:
    """
    Returns (cfg, slot_plan, filament_keys).
    slot_plan: {slot_index: UI filament key} for retargeted slots.
    filament_keys: keys that are per-filament-slot (so later edits touch only planned slots).
    """
    printer = normalize_printer(printer)
    slots = describe_filament_slots(orig_cfg)
    num_filaments = len(slots)
    plan = plan_slot_filaments(slots, filament, slot_overrides)

    # 1. Machine + process keys from the vendor baseline for this printer.
    process_name = resolve_process_preset(printer, "0.16mm Optimal")
    machine_process = system_baseline(printer, "", process_name)
    cfg = dict(orig_cfg)
    # Switching printer (e.g. A1 -> A1 mini) must take the new machine's bed geometry.
    printer_changed = bool(orig_cfg) and orig_cfg.get("printer_settings_id") != printer
    for k in MACHINE_GEOMETRY_KEYS if printer_changed else ():
        if k in machine_process:
            cfg[k] = machine_process[k]
    for k, v in machine_process.items():
        if _skip(k) or (orig_cfg and k not in cfg):
            continue
        orig_val = orig_cfg.get(k)
        if isinstance(orig_val, list):
            if len(orig_val) == num_filaments:
                cfg[k] = [_first(v)] * num_filaments
            elif isinstance(v, list) and len(v) == len(orig_val):
                cfg[k] = v
            # Otherwise keep orig_val so multi-element geometry/AMS arrays are never truncated
        else:
            cfg[k] = v[0] if isinstance(v, list) and len(v) == 1 else v

    # 2. Filament keys, slot by slot, from each planned slot's own vendor preset.
    profiles = profiles_for(printer)
    slot_presets = {i: resolve_filament_preset(printer, key) for i, key in plan.items()}
    slot_profiles = {i: resolve_profile(name, profiles) for i, name in slot_presets.items()}
    filament_keys: set[str] = set()
    for prof in slot_profiles.values():
        filament_keys.update(k for k in prof if not _skip(k))

    all_slots_planned = len(plan) == num_filaments
    primary = slot_profiles[min(slot_profiles)] if slot_profiles else {}
    for k in filament_keys:
        if orig_cfg and k not in cfg:
            continue
        orig_val = orig_cfg.get(k)
        if isinstance(orig_val, list) and len(orig_val) == num_filaments:
            new_val = list(orig_val)
            for i, prof in slot_profiles.items():
                if k in prof:
                    new_val[i] = _first(prof[k])
            cfg[k] = new_val
        elif isinstance(orig_val, list):
            # Per-extruder-variant list (e.g. X1C lists of 2 for one slot): only safe when every slot is retargeted.
            v = primary.get(k)
            if all_slots_planned and isinstance(v, list) and len(v) == len(orig_val):
                cfg[k] = v
        elif k in primary:
            v = primary[k]
            cfg[k] = v[0] if isinstance(v, list) and len(v) == 1 else v

    cfg["printer_settings_id"] = printer
    # System presets carry an empty `print_settings_id`; name the process preset the values came from.
    cfg["print_settings_id"] = process_name
    ids = orig_cfg.get("filament_settings_id")
    ids = list(ids) if isinstance(ids, list) and len(ids) == num_filaments else [""] * num_filaments
    for i, name in slot_presets.items():
        ids[i] = name
    cfg["filament_settings_id"] = ids
    if num_filaments == 1:
        cfg["enable_prime_tower"] = "0"
    return cfg, plan, filament_keys


def set_filament_key(
    cfg: dict[str, Any],
    key: str,
    value: str,
    plan: dict[int, str],
    filament_keys: set[str],
    num_slots: int,
) -> None:
    """Writes a setting; per-slot filament keys only change the retargeted slots.
    An empty plan (every slot kept as the author's) leaves filament keys untouched."""
    cur = cfg.get(key)
    if key in filament_keys:
        if not plan:
            return
        if isinstance(cur, list) and len(cur) == num_slots:
            new_val = list(cur)
            for i in plan:
                new_val[i] = value
            cfg[key] = new_val
        elif isinstance(cur, list) and cur:
            # Per-extruder-variant list: only safe to rewrite when every slot is retargeted.
            if len(plan) == num_slots:
                cfg[key] = [value] * len(cur)
        else:
            cfg[key] = value
    elif isinstance(cur, list) and cur:
        cfg[key] = [value] * len(cur)
    else:
        cfg[key] = value
