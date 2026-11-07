"""
Retargets a project to a printer of another vendor (e.g. a MakerWorld Bambu file -> Snapmaker U1).

Unlike `slicer_config_merge.build_patched_config`, which patches the author's config in place and
only touches keys the file already has, this starts from the TARGET printer's system presets
(machine + process + one filament preset per slot) and lays a small allowlist of author choices
on top (layer height, walls, infill, supports, brim, seam...). That is required because a Bambu
file lacks every toolchanger key (`machine_tool_change_time`, `retract_length_toolchange`,
`wipe_tower_wall_type`, 4-entry per-extruder arrays...) and carries Bambu-only AMS keys.

Slot order is preserved (slot N stays filament N, so `extruder` ids and `paint_color` states in
the model stay valid). Projects with more filaments than the printer has tools are written as-is
and flagged by a diagnostic card; the user reassigns them in the slicer.
"""

from typing import Any

from filament_profiles import (
    bed_type_of,
    describe_filament_slots,
    equivalent_filament_preset,
    normalize_printer,
    plan_slot_filaments,
    resolve_filament_preset,
    resolve_process_preset,
)
from printer_catalog import PRINTERS, native_app_version, profiles_for, source_vendor_of
from profiler import resolve_profile
from slicer_config_merge import INTERNAL_PROFILE_KEYS

# Author choices that describe the model, not the machine: kept when retargeting.
CARRY_OVER_KEYS = (
    "layer_height", "initial_layer_print_height",
    "wall_loops", "top_shell_layers", "bottom_shell_layers", "top_shell_thickness", "bottom_shell_thickness",
    "sparse_infill_density", "sparse_infill_pattern", "top_surface_pattern", "bottom_surface_pattern",
    "only_one_wall_top", "wall_generator", "seam_position",
    "enable_support", "support_type", "support_style", "support_threshold_angle", "support_on_build_plate_only",
    "support_critical_regions_only", "support_top_z_distance", "support_bottom_z_distance",
    "support_interface_top_layers", "support_interface_bottom_layers", "support_interface_spacing",
    "support_base_pattern",
    "brim_type", "brim_width", "brim_object_gap", "raft_layers", "skirt_loops",
    "ironing_type", "ironing_flow", "ironing_spacing", "ironing_speed",
    "fuzzy_skin", "fuzzy_skin_thickness", "fuzzy_skin_point_distance",
    "spiral_mode", "print_sequence", "wipe_tower_x", "wipe_tower_y",
)
# Tree-support tuning keys are left out on purpose: Bambu allows values Orca rejects
# (e.g. `tree_support_wall_count = -1`, out of Orca's 0..2 range), which aborts slicing.
# Values that only make sense when they fit the target nozzle's layer-height range.
LAYER_HEIGHT_KEYS = ("layer_height", "initial_layer_print_height")
UNUSED_TOOL_COLOUR = "#FFFFFF"
# Project-level identity keys never listed as "different from system".
PROJECT_ID_KEYS = {"different_settings_to_system", "inherits_group", "filament_settings_id",
                   "print_settings_id", "printer_settings_id", "version"}
TOWER_MARGIN_MM = 20.0


def _first(v: Any) -> Any:
    return v[0] if isinstance(v, list) and v else v


def _as_list(v: Any) -> list:
    return v if isinstance(v, list) else [v]


def _float(v: Any, default: float) -> float:
    try:
        return float(str(_first(v)).rstrip("%"))
    except (TypeError, ValueError):
        return default


def _bed_size(printable_area: Any) -> tuple[float, float]:
    xs, ys = [], []
    for pt in _as_list(printable_area or []):
        x, _, y = str(pt).partition("x")
        xs.append(_float(x, 0.0))
        ys.append(_float(y, 0.0))
    return (max(xs), max(ys)) if xs else (256.0, 256.0)


def _layer_height_fits(value: Any, machine: dict[str, Any]) -> bool:
    h = _float(value, -1.0)
    return _float(machine.get("min_layer_height"), 0.04) <= h <= _float(machine.get("max_layer_height"), 0.32)


def _clamp_tower(values: Any, limit: float) -> list[str]:
    return [f"{min(max(_float(v, 15.0), 0.0), limit):g}" for v in _as_list(values)]


def _flush_matrix(orig_cfg: dict[str, Any], n: int, toolchanger: bool) -> list[str]:
    """Toolchangers have no shared-nozzle purge; AMS printers keep the author's volumes when sized right."""
    if toolchanger:
        return ["0"] * (n * n)
    orig = orig_cfg.get("flush_volumes_matrix")
    if isinstance(orig, list) and len(orig) == n * n and any(_float(v, 0) > 0 for v in orig):
        return orig
    return ["0" if i == j else "280" for i in range(n) for j in range(n)]


def _diff_keys(cfg: dict[str, Any], preset: dict[str, Any], slot: int | None = None) -> str:
    """`different_settings_to_system` entry: keys whose project value differs from the system preset."""
    keys = []
    for k, v in preset.items():
        if k in INTERNAL_PROFILE_KEYS or k == "version" or k not in cfg:
            continue
        cur = cfg[k]
        if slot is not None:
            if isinstance(cur, list) and slot < len(cur) and str(cur[slot]) != str(_first(v)):
                keys.append(k)
        elif cur != v and not (isinstance(v, list) and len(v) == 1 and cur == v[0]):
            keys.append(k)
    return ";".join(sorted(keys))


def build_cross_vendor_config(
    orig_cfg: dict[str, Any],
    printer: str,
    filament: str,
    slot_overrides: list[str | None] | None = None,
) -> tuple[dict[str, Any], dict[int, str], set[str]]:
    """Same contract as `build_patched_config`: returns (cfg, slot_plan, filament_keys)."""
    printer = normalize_printer(printer)
    meta = PRINTERS[printer]
    profiles = profiles_for(printer)
    slots = describe_filament_slots(orig_cfg)
    n = len(slots)
    plan = plan_slot_filaments(slots, filament, slot_overrides)

    process_name = resolve_process_preset(printer)
    machine = resolve_profile(printer, profiles)
    process = resolve_profile(process_name, profiles)
    slot_presets = [
        resolve_filament_preset(printer, plan[i]) if i in plan else equivalent_filament_preset(printer, slots[i])
        for i in range(n)
    ]
    toolchanger = meta["max_tools"] is not None
    # Snapmaker Orca always loads a toolchanger project with one filament per toolhead and reports
    # the unnamed extra slots as "customized presets". Fill the unused toolheads with the first
    # slot's preset; painted colours and part assignments only ever reference slots 1..n.
    pad = max(0, meta["max_tools"] - n) if toolchanger else 0
    slot_presets += [slot_presets[0]] * pad
    slot_profiles = [resolve_profile(name, profiles) for name in slot_presets]
    total = n + pad

    cfg: dict[str, Any] = {}
    for preset in (machine, process):
        cfg.update({k: v for k, v in preset.items() if k not in INTERNAL_PROFILE_KEYS})

    # One value per slot, each from that slot's own target preset. Only vector options are per
    # slot; scalar keys a filament preset happens to carry (e.g. `is_custom_defined`) must stay
    # scalar, or the slicer fails to parse the project ("type must be string, but is array").
    filament_keys: set[str] = set()
    for prof in slot_profiles:
        filament_keys.update(k for k, v in prof.items() if k not in INTERNAL_PROFILE_KEYS and isinstance(v, list))
    for k in filament_keys:
        cfg[k] = [str(_first(prof.get(k, slot_profiles[0].get(k, "")))) for prof in slot_profiles]
    for prof in slot_profiles:
        for k, v in prof.items():
            if k not in INTERNAL_PROFILE_KEYS and not isinstance(v, list):
                cfg.setdefault(k, v)

    # Author choices about the model itself.
    for k in CARRY_OVER_KEYS:
        if k not in orig_cfg or orig_cfg[k] in ("", None, []):
            continue
        if k in LAYER_HEIGHT_KEYS and not _layer_height_fits(orig_cfg[k], machine):
            continue
        cfg[k] = orig_cfg[k]

    bed_x, bed_y = _bed_size(cfg.get("printable_area"))
    tower_w = _float(cfg.get("prime_tower_width"), 35.0)
    if "wipe_tower_x" in cfg:
        cfg["wipe_tower_x"] = _clamp_tower(cfg["wipe_tower_x"], bed_x - tower_w - TOWER_MARGIN_MM)
        cfg["wipe_tower_y"] = _clamp_tower(cfg.get("wipe_tower_y", ["200"]), bed_y - tower_w - TOWER_MARGIN_MM)

    colours = orig_cfg.get("filament_colour")
    cfg.update({
        "from": "project",
        "name": "project_settings",
        "printer_settings_id": printer,
        "print_settings_id": process_name,
        "filament_settings_id": slot_presets,
        "filament_colour": (list(colours) if isinstance(colours, list) and len(colours) == n else ["#FFFFFF"] * n)
        + [UNUSED_TOOL_COLOUR] * pad,
        "curr_bed_type": bed_type_of(orig_cfg, printer),
        "enable_prime_tower": "1" if n > 1 else "0",
        "flush_volumes_matrix": _flush_matrix(orig_cfg, total, toolchanger),
        "inherits_group": [""] * (total + 2),
    })
    if not toolchanger:
        cfg["filament_map"] = ["1"] * n
    author_version = str(orig_cfg.get("version") or "") if source_vendor_of(orig_cfg) == "bbl" else ""
    cfg["version"] = native_app_version(printer) or author_version or "02.00.00.00"
    refresh_different_settings_to_system(cfg, printer)
    return cfg, plan, filament_keys


def refresh_different_settings_to_system(cfg: dict[str, Any], printer: str) -> None:
    """Lists, per preset, every key whose project value differs from the named system preset.

    Bambu Studio / Snapmaker Orca reset every key NOT listed here to the system preset's value
    when they load a project that names a system preset (`PresetCollection::load_external_preset`),
    so this must run after all LayerZero edits, right before the project is written.
    Entries whose preset is unknown (vendor profiles not installed) keep the author's value.
    """
    profiles = profiles_for(printer)
    ids = cfg.get("filament_settings_id")
    filament_ids = ids if isinstance(ids, list) else [ids or ""]
    n = len(filament_ids)
    old = cfg.get("different_settings_to_system")
    old = list(old) if isinstance(old, list) else []
    old += [""] * (n + 2 - len(old))
    names = [cfg.get("print_settings_id", ""), *filament_ids, cfg.get("printer_settings_id", "")]
    presets = [resolve_profile(str(name), profiles) if name else {} for name in names]
    # Keys no named preset defines (e.g. `brim_type`) are compared by the slicer against its
    # built-in defaults, which we cannot see: list them all so LayerZero's values survive the load.
    owned = set().union(*(p.keys() for p in presets))
    unowned = {k for k in cfg if k not in owned and k not in PROJECT_ID_KEYS and k not in INTERNAL_PROFILE_KEYS}
    out: list[str] = []
    for idx, preset in enumerate(presets):
        if not preset:
            out.append(str(old[idx]))
            continue
        keys = set(filter(None, _diff_keys(cfg, preset, idx - 1 if 0 < idx <= n else None).split(";")))
        out.append(";".join(sorted(keys | unowned)))
    cfg["different_settings_to_system"] = out
