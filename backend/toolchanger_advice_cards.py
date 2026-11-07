"""
Diagnostic cards for retargeting a project to another vendor's printer and for toolchangers
(Snapmaker U1: 4 independent toolheads instead of an AMS feeding one nozzle).

All cards are advisory (`MATERIAL_ADVICE`, no approve toggle): the conversion itself always
happens on export, and the tool limit is only warned about, never auto-merged.
"""

from typing import Any

from filament_profiles import describe_filament_slots
from material_advice_cards import _card
from printer_catalog import PRINTERS, SLICERS, normalize_printer, source_vendor_of, vendor_of

ENCLOSURE_MATERIALS = ("ABS", "ASA", "PC", "PA")


def build_toolchanger_cards(orig_cfg: dict[str, Any], printer: str) -> list[dict[str, Any]]:
    printer = normalize_printer(printer)
    meta = PRINTERS[printer]
    slots = describe_filament_slots(orig_cfg) if orig_cfg else []
    n = len(slots)
    cards: list[dict[str, Any]] = []

    source = source_vendor_of(orig_cfg)
    if source and source != vendor_of(printer):
        author_printer = orig_cfg.get("printer_settings_id") or "máy khác"
        cards.append(_card(
            "card_cross_vendor_retarget",
            f"Chuyển file từ {author_printer} sang {meta['vendor_label']} {meta['label']} ({meta['nozzle']}mm)",
            (
                f"File được tác giả lưu cho {author_printer}. Mở thẳng trong {SLICERS[meta['slicer']]['label']} sẽ nạp "
                f"cấu hình máy/G-code của máy cũ. LayerZero thay toàn bộ cấu hình máy, process và filament bằng profile "
                f"hệ thống của {meta['label']}, giữ lại màu, layer height, tường, infill, support, brim và seam của tác giả. "
                f"Khi {SLICERS[meta['slicer']]['label']} hỏi, hãy chọn \"Open as project\" để giữ cấu hình đã chuyển."
            ),
            f"Profile {meta['label']} · {n} filament → {n} tool" if meta["max_tools"] else f"Profile {meta['label']}",
            "Chuyển đổi máy in",
        ))

    max_tools = meta["max_tools"]
    if max_tools and n > max_tools:
        cards.append(_card(
            "card_tool_limit",
            f"File dùng {n} filament nhưng {meta['label']} chỉ có {max_tools} đầu in",
            (
                f"Mỗi filament trên {meta['label']} là một đầu in riêng, không có AMS để đổi nhựa. Filament {max_tools + 1}–{n} "
                f"chưa có đầu in: mở file trong {SLICERS[meta['slicer']]['label']} và gán lại các vùng màu/chi tiết đó "
                f"vào {max_tools} đầu in (gộp các màu gần nhau), hoặc tách các khay in để mỗi khay dùng tối đa {max_tools} màu."
            ),
            f"Cần gộp còn ≤ {max_tools} màu",
            "Giới hạn đầu in",
        ))

    if max_tools and n > 1:
        cards.append(_card(
            "card_tool_offset_calibration",
            "Hiệu chỉnh offset XYZ giữa các đầu in trước khi in nhiều màu",
            (
                "Máy đổi đầu in ghép các màu bằng nhiều đầu phun khác nhau; lệch offset vài phần trăm milimet là lộ viền "
                "màu hoặc lệch lớp. Chạy hiệu chỉnh offset tự động sau khi lắp máy, sau khi thay hotend và sau va chạm. "
                "Tháp prime (prime tower) vẫn cần giữ lại để mồi nhựa cho đầu vừa đổi."
            ),
            "Calibrate offset · Giữ prime tower",
            "Đa đầu in",
        ))

    hot_materials = sorted({s["type"].upper() for s in slots if s["type"].upper().split("-")[0] in ENCLOSURE_MATERIALS})
    if hot_materials and vendor_of(printer) == "snapmaker":
        cards.append(_card(
            "card_top_cover_required",
            f"{', '.join(hot_materials)} cần nắp Top Cover trên {meta['label']}",
            (
                f"{meta['label']} là máy khung hở. Snapmaker yêu cầu lắp Top Cover (nắp che & lọc khí) khi in "
                f"{', '.join(hot_materials)} để giữ nhiệt, tránh cong vênh và tách lớp."
            ),
            "Lắp Top Cover",
            "Vật liệu nhiệt cao",
        ))
    return cards
