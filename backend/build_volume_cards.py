"""
Warns when a part does not fit the target printer's build volume.

Slicers refuse such plates ("Nothing to be sliced ... no object is fully inside the print
volume"), which is easy to hit when retargeting: a part laid out for a 256 mm Bambu bed can be
too tall for the U1 (270 mm) or too wide for the A1 mini (180 mm). Advisory only: the fix is
to scale, split or reorient the part in the slicer.
"""

from typing import Any

from material_advice_cards import _card
from printer_catalog import PRINTERS, normalize_printer

FIT_TOLERANCE_MM = 0.5


def _float(v: Any) -> float | None:
    try:
        return float(v[0] if isinstance(v, list) and v else v)
    except (TypeError, ValueError):
        return None


def _bed_xy(printable_area: Any) -> tuple[float, float] | None:
    points = printable_area if isinstance(printable_area, list) else []
    xs, ys = [], []
    for pt in points:
        x, _, y = str(pt).partition("x")
        if _float(x) is None or _float(y) is None:
            return None
        xs.append(float(x))
        ys.append(float(y))
    return (max(xs) - min(xs), max(ys) - min(ys)) if xs else None


def oversized_objects(objects: list[dict[str, Any]], machine: dict[str, Any]) -> list[dict[str, Any]]:
    """Parts taller than the printable height, or whose footprint fits the bed in neither orientation."""
    height = _float(machine.get("printable_height"))
    bed = _bed_xy(machine.get("printable_area"))
    if height is None or bed is None:
        return []  # vendor profile not available: nothing reliable to compare against
    big, small = max(bed), min(bed)
    out = []
    for obj in objects:
        w, d, h = obj["size_mm"]
        too_tall = h > height + FIT_TOLERANCE_MM
        too_wide = max(w, d) > big + FIT_TOLERANCE_MM or min(w, d) > small + FIT_TOLERANCE_MM
        if too_tall or too_wide:
            out.append(obj)
    return out


def build_volume_cards(objects: list[dict[str, Any]], printer: str, machine: dict[str, Any]) -> list[dict[str, Any]]:
    oversized = oversized_objects(objects, machine)
    if not oversized:
        return []
    meta = PRINTERS[normalize_printer(printer)]
    bed = _bed_xy(machine.get("printable_area")) or (0.0, 0.0)
    height = _float(machine.get("printable_height")) or 0.0
    names = ", ".join(
        f"{o['name']} ({o['size_mm'][0]:.0f}×{o['size_mm'][1]:.0f}×{o['size_mm'][2]:.0f}mm)" for o in oversized[:3]
    )
    more = f" và {len(oversized) - 3} chi tiết khác" if len(oversized) > 3 else ""
    return [_card(
        "card_exceeds_build_volume",
        f"{len(oversized)} chi tiết vượt kích thước in của {meta['label']}",
        (
            f"{names}{more} lớn hơn vùng in của {meta['vendor_label']} {meta['label']} "
            f"({bed[0]:.0f}×{bed[1]:.0f}×{height:.0f}mm). Slicer sẽ không cắt lớp được khay này: "
            "hãy thu nhỏ (scale), cắt đôi (cut) hoặc xoay nằm chi tiết trong slicer trước khi in."
        ),
        f"Vùng in {bed[0]:.0f}×{bed[1]:.0f}×{height:.0f}mm",
        "Kích thước máy in",
    )]
