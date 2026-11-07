"""
Chooses which objects get the REINFORCE_SUPPORTS 360° base cradle (painted Support Enforcers).

Only parts the profiler flagged with a weak base get a cradle, and only when no other part on
the same plate is close by. Tree supports grow outward from a cradle, so on a tightly packed
plate they reach the neighbouring part and the slicer stops with "gcode path conflicts found
between <A> and <B>". Seen on the Jointed Ankylosaurus (parts 7 mm apart) and KeySwitchHammer
(two caps 8 mm apart) in Snapmaker Orca, which refuses to slice such plates.
"""

from typing import Any

# Weak-base flags the cradle is meant to fix (bridges higher up are not helped by a base cradle).
CRADLE_FLAGS = {"MISSING_BASE_SUPPORTS", "ACCIDENTAL_BASE_BLOCKERS", "PINPOINT_BALL_BASE"}
# Screws get a brim and solid infill instead; supports would fill their slots.
EXCLUDED_FLAGS = {"SLOTTED_OR_SMALL_SCREW"}
# Free space a cradle's tree supports need around a part.
SUPPORT_CLEARANCE_MM = 10.0


def _xy_box(obj: dict[str, Any]) -> tuple[float, float, float, float]:
    (cx, cy), (w, d) = obj["world_pos"][:2], obj["size_mm"][:2]
    return cx - w / 2, cy - d / 2, cx + w / 2, cy + d / 2


def xy_gap_mm(a: dict[str, Any], b: dict[str, Any]) -> float:
    """Shortest distance between two parts' XY bounding boxes (0 when they overlap)."""
    ax0, ay0, ax1, ay1 = _xy_box(a)
    bx0, by0, bx1, by1 = _xy_box(b)
    dx = max(bx0 - ax1, ax0 - bx1, 0.0)
    dy = max(by0 - ay1, ay0 - by1, 0.0)
    return (dx * dx + dy * dy) ** 0.5


def _plates(telemetry: dict[str, Any]) -> list[list[str]]:
    plates = [p.get("object_ids", []) for p in telemetry.get("plates", []) if p.get("object_ids")]
    return plates or [[o["id"] for o in telemetry.get("objects", [])]]


def support_cradle_object_ids(telemetry: dict[str, Any]) -> set[str]:
    objects = {o["id"]: o for o in telemetry.get("objects", [])}
    targets: set[str] = set()
    for ids in _plates(telemetry):
        plate = [objects[i] for i in ids if i in objects]
        for obj in plate:
            flags = set(obj.get("morphology_flags", []))
            if not flags & CRADLE_FLAGS or flags & EXCLUDED_FLAGS:
                continue
            if all(xy_gap_mm(obj, other) >= SUPPORT_CLEARANCE_MM for other in plate if other is not obj):
                targets.add(obj["id"])
    return targets
