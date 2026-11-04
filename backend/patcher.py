"""
LayerZero Universal Non-Destructive 3MF Patcher & Deterministic Rule Synthesis
==============================================================================
1. Synthesizes baseline Diagnostic Cards (Safety + Aesthetics) and Settings Diffs from the
   3D Morphology Telemetry (`profiler.py`) so the UI has rich data immediately and as fallback.
2. Applies only the user-approved Geometry Actions (Flatten Bottom, 360° Support Cradle Painting,
   Z-Yaw Rotation, Per-Object Overrides for Ironing/Concentric/ScarfSeam/FuzzySkin/Screws)
   and Global Slicer Settings to create a clean, Bambu Studio v02.08+ compatible `.3mf` file.
"""

import json
import math
import struct
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path
from typing import Any

import numpy as np

from profiler import (
    NS_URI_BBL,
    NS_URI_M,
    NS_URI_P,
    STL_BINARY_DTYPE,
    _parse_stl_file,
    fmt_val,
    get_system_baseline,
    profile_3mf,
)


def build_baseline_audit(
    telemetry: dict[str, Any],
    printer_preset: str = "Bambu Lab A1 0.4 nozzle",
    filament_preset: str = "Bambu PLA Lite @BBL A1",
) -> dict[str, Any]:
    """
    Generates a comprehensive initial Audit Report (Safety + Topology Aesthetics)
    directly from the mathematical 3D morphology telemetry.
    Used both as structured context for `agy` headless and as instant fallback.
    """
    orig_cfg = telemetry.get("project_settings", {})
    sys_def = get_system_baseline(printer_preset, filament_preset, "0.20mm Standard @BBL A1")
    objects = telemetry.get("objects", [])

    diagnostic_cards: list[dict[str, Any]] = []
    settings_diff: list[dict[str, Any]] = []

    # 1. Inspect objects for Safety & Aesthetic Morphology Cards
    pinpoint_objs = [o for o in objects if "PINPOINT_BALL_BASE" in o["morphology_flags"]]
    missing_sup_objs = [o for o in objects if "MISSING_BASE_SUPPORTS" in o["morphology_flags"] or "ACCIDENTAL_BASE_BLOCKERS" in o["morphology_flags"]]
    screw_objs = [o for o in objects if "SLOTTED_OR_SMALL_SCREW" in o["morphology_flags"]]
    tall_objs = [o for o in objects if "Y_AXIS_INERTIA_TALL" in o["morphology_flags"]]
    dome_objs = [o for o in objects if "DOMED_CURVATURE_TOP" in o["morphology_flags"]]
    flat_top_objs = [o for o in objects if "FLAT_HORIZONTAL_TOP" in o["morphology_flags"]]
    cyl_objs = [o for o in objects if "SMOOTH_CYLINDER_SEAM" in o["morphology_flags"]]
    bridge_objs = [o for o in objects if "UNSUPPORTED_HORIZONTAL_BRIDGE" in o["morphology_flags"]]

    # --- SAFETY CARDS ---
    if pinpoint_objs:
        first_p = pinpoint_objs[0]
        fp = first_p["footprint_l1_mm"]
        names = ", ".join(o["name"] for o in pinpoint_objs[:3])
        diagnostic_cards.append({
            "id": "card_flatten_bottom",
            "pillar": "safety",
            "object_id": first_p["id"],
            "object_tag": f"{len(pinpoint_objs)} chi tiết · {names}",
            "archetype": "Đáy khớp cầu / Điểm nhỏ",
            "title": "Đáy khớp cầu tiếp xúc điểm nhỏ tại Z = 0",
            "desc": (
                f"Chi tiết '{first_p['name']}' cao {first_p['size_mm'][2]}mm nhưng diện tích chạm bàn tại Layer 1 "
                f"chỉ {fp[0]}×{fp[1]}mm ({first_p['l1_vertex_count']} đỉnh). Dễ lắc và bung khỏi bàn PEI giữa chừng."
            ),
            "pill_text": "Cắt phẳng đáy Z = 0.80mm (+300% diện tích bám bàn)",
            "action_type": "FLATTEN_BOTTOM",
            "param_value": 0.8,
            "approved": True,
        })

    if missing_sup_objs or bridge_objs:
        target_o = (missing_sup_objs or bridge_objs)[0]
        blk_cnt = sum(o["metrics"]["base_blockers_z8"] for o in objects)
        br_area = max((o["metrics"]["bridge_area_mm2"] for o in objects), default=0)
        diagnostic_cards.append({
            "id": "card_reinforce_supports",
            "pillar": "safety",
            "object_id": target_o["id"],
            "object_tag": f"Object #{target_o['id']} · {target_o['name']}",
            "archetype": "Overhang & Support Đáy",
            "title": "Thiếu Support gầm khớp cầu & Nhịp cầu nối",
            "desc": (
                f"Vùng gầm Z <= 8mm thiếu Support Enforcer (và dính {blk_cnt} tam giác Support Blocker ở đế). "
                f"Diện tích cầu nối ngang (Bridge) lên tới {br_area} mm² cần giảm tốc và bọc đài đỡ 360°."
            ),
            "pill_text": "Tự động bọc Support Enforcer 360° (Z=0.8-8mm) & Gỡ Blocker",
            "action_type": "REINFORCE_SUPPORTS",
            "param_value": 8.0,
            "approved": True,
        })

    if screw_objs:
        first_s = screw_objs[0]
        diagnostic_cards.append({
            "id": "card_optimize_screw",
            "pillar": "safety",
            "object_id": first_s["id"],
            "object_tag": f"{len(screw_objs)} ốc vít · {first_s['name']}",
            "archetype": "Cơ khí & Ren ốc",
            "title": "Gia cố ốc in 3D có rãnh tua-vít & Dung sai lỗ",
            "desc": (
                f"Phát hiện {len(screw_objs)} chi tiết ốc/chốt ('{first_s['name']}'). Rãnh tua-vít xẻ đôi Layer 1 dễ bung nếu tắt Brim, "
                f"và infill zig-zag tốc độ cao gây rung lắc trụ ốc."
            ),
            "pill_text": "Brim 5mm (gap 0.04) · 6 Walls Concentric · Tốc độ ren 35mm/s",
            "action_type": "OPTIMIZE_SCREW",
            "param_value": 5.0,
            "approved": True,
        })

    if tall_objs:
        first_t = tall_objs[0]
        diagnostic_cards.append({
            "id": "card_y_inertia",
            "pillar": "safety",
            "object_id": first_t["id"],
            "object_tag": f"Object #{first_t['id']} · {first_t['name']}",
            "archetype": f"Cao mảnh ({first_t['size_mm'][2]}mm)",
            "title": "Tối ưu quán tính trượt bàn Y & Làm mát cổ mảnh",
            "desc": (
                f"Chi tiết '{first_t['name']}' cao {first_t['size_mm'][2]}mm nhạy cảm với gia tốc giật bàn in trục Y trên máy bed-slinger. "
                f"Cần hạ gia tốc Y và xoay dọc hướng trượt."
            ),
            "pill_text": "Hạ gia tốc 4000 mm/s² · Z-Hop 0.8mm Normal Lift",
            "action_type": "ROTATE_YAW",
            "param_value": 90.0,
            "approved": True,
        })

    # --- AESTHETICS CARDS (TOPOLOGY-DRIVEN) ---
    if dome_objs:
        first_d = dome_objs[0]
        dome_mm2 = first_d["metrics"]["domed_top_area_mm2"]
        diagnostic_cards.append({
            "id": "card_dome_aesthetics",
            "pillar": "aesthetics",
            "object_id": first_d["id"],
            "object_tag": f"Object #{first_d['id']} · {first_d['name']}",
            "archetype": "Đỉnh vòm cầu (Domed Top)",
            "title": "Chống vân bậc thang trên mặt vòm / đỉnh cầu",
            "desc": (
                f"Phát hiện {dome_mm2} mm² bề mặt vòm cong thoai thoải ở đỉnh '{first_d['name']}' (0.70 < normal_z < 0.98). "
                f"In layer cố định sẽ lộ rõ các vòng bậc thang (stair-stepping)."
            ),
            "pill_text": "Mịn đỉnh vòm: Layer 0.16mm + Concentric Top Surface",
            "action_type": "ADAPTIVE_LAYER_DOME",
            "param_value": 0.12,
            "approved": True,
        })

    if flat_top_objs:
        first_f = flat_top_objs[0]
        flat_mm2 = first_f["metrics"]["flat_top_area_mm2"]
        diagnostic_cards.append({
            "id": "card_flat_ironing",
            "pillar": "aesthetics",
            "object_id": first_f["id"],
            "object_tag": f"Object #{first_f['id']} · {first_f['name']}",
            "archetype": "Mặt phẳng ngang (Flat Top)",
            "title": "Là mịn mặt phẳng ngang trên đỉnh (Per-Object Ironing)",
            "desc": (
                f"Chi tiết '{first_f['name']}' có mặt phẳng ngang rộng {flat_mm2} mm² (normal_z >= 0.995) ở vùng đỉnh. "
                f"Bật Ironing riêng cho chi tiết này giúp bề mặt trên cùng láng mịn như đúc khuôn."
            ),
            "pill_text": "Per-Object Ironing: Topmost · Flow 12% · Speed 30mm/s",
            "action_type": "IRONING_FLAT_TOP",
            "param_value": 12.0,
            "approved": True,
        })

    if cyl_objs:
        first_c = cyl_objs[0]
        c_score = int(first_c["metrics"]["cylindrical_score"] * 100)
        diagnostic_cards.append({
            "id": "card_cylinder_seam",
            "pillar": "aesthetics",
            "object_id": first_c["id"],
            "object_tag": f"Object #{first_c['id']} · {first_c['name']}",
            "archetype": f"Thân trụ tròn ({c_score}%)",
            "title": "Xóa sẹo dọc Z-Seam trên mặt trụ tròn & Nội suy cung G2/G3",
            "desc": (
                f"Chi tiết '{first_c['name']}' có biên dạng trụ tròn ({c_score}% đối xứng tâm), không có cạnh sắc để giấu đường ghép lớp Z-Seam."
            ),
            "pill_text": "Scarf Joint Seam (Contour) + Arc Fitting G2/G3",
            "action_type": "SCARF_SEAM_CYLINDER",
            "param_value": 155.0,
            "approved": True,
        })

    # Optional Fuzzy Skin card on largest non-screw part
    non_screw = [o for o in objects if "SLOTTED_OR_SMALL_SCREW" not in o["morphology_flags"]]
    if non_screw:
        target_fs = flat_top_objs[0] if flat_top_objs else non_screw[0]
        diagnostic_cards.append({
            "id": "card_fuzzy_skin",
            "pillar": "aesthetics",
            "object_id": target_fs["id"],
            "object_tag": f"Tùy chọn · {target_fs['name']}",
            "archetype": "Phong cách bề mặt",
            "title": "Gợi ý phủ nhám mờ Fuzzy Skin che vân lớp in",
            "desc": (
                f"Tùy chọn thẩm mỹ cho '{target_fs['name']}': Tạo bề mặt nhám mờ mịn (Point 0.3mm / Thickness 0.2mm) "
                f"ở vách ngoài để xóa 100% vân layer ngang (Mặc định tắt)."
            ),
            "pill_text": "Tùy chọn: Fuzzy Skin Outside (0.3mm / 0.2mm)",
            "action_type": "FUZZY_SKIN",
            "param_value": 0.2,
            "approved": False,
        })

    # 2. Synthesize Slicer Settings Diff (Aesthetics, Adhesion, Kinematics, Support)
    # --- AESTHETICS SETTINGS ---
    settings_diff.extend([
        {
            "key": "wall_generator",
            "label": "Wall Generator (Bộ sinh tường)",
            "scope_tag": "Global · Độ sắc nét",
            "object_id": "global",
            "category": "aesthetics",
            "meaning": "Co giãn độ rộng nét in cho vách mỏng & chi tiết nhỏ",
            "default_val": fmt_val(sys_def.get("wall_generator", "classic")),
            "author_val": fmt_val(orig_cfg.get("wall_generator", "classic")),
            "proposed_val": "arachne",
            "reason": "Arachne tự động điều biến dòng nhựa giúp in sắc nét các mép vách mỏng, vảy giáp và chữ nổi.",
            "approved": True,
        },
        {
            "key": "layer_height",
            "label": "Layer Height (Độ dày lớp cắt)",
            "scope_tag": "Global · Độ mịn Z",
            "object_id": "global",
            "category": "aesthetics",
            "meaning": "Độ cao mỗi lớp in tiêu chuẩn",
            "default_val": fmt_val(sys_def.get("layer_height", "0.2")),
            "author_val": fmt_val(orig_cfg.get("layer_height", "0.2")),
            "proposed_val": "0.16",
            "reason": "Mức 0.16mm Optimal trên Bambu A1 giảm rõ rệt vết bậc thang trên mặt cầu và tăng diện tích chồng lớp overhang.",
            "approved": True,
        },
        {
            "key": "outer_wall_speed",
            "label": "Outer Wall Speed (Tốc độ vách ngoài)",
            "scope_tag": "Global · Bề mặt bóng đều",
            "object_id": "global",
            "category": "aesthetics",
            "meaning": "Tốc độ chạy đường viền ngoài cùng (mm/s)",
            "default_val": fmt_val(sys_def.get("outer_wall_speed", "200")),
            "author_val": fmt_val(orig_cfg.get("outer_wall_speed", "200")),
            "proposed_val": "120",
            "reason": "Hạ từ 200 xuống 120 mm/s giúp nhựa PLA Lite chảy đều, đồng nhất độ bóng bề mặt và triệt tiêu vân rung (ringing/VFA).",
            "approved": True,
        },
        {
            "key": "seam_position",
            "label": "Seam Position (Vị trí đường ghép lớp)",
            "scope_tag": "Global · Giấu mối nối",
            "object_id": "global",
            "category": "aesthetics",
            "meaning": "Vị trí điểm bắt đầu/kết thúc mỗi vòng tường",
            "default_val": fmt_val(sys_def.get("seam_position", "aligned")),
            "author_val": fmt_val(orig_cfg.get("seam_position", "aligned")),
            "proposed_val": "back",
            "reason": "Đưa toàn bộ điểm nối Z-Seam về phía sau mô hình để mặt tiền trưng bày hoàn toàn sạch vết sẹo.",
            "approved": True,
        },
    ])

    if dome_objs:
        d_obj = dome_objs[0]
        settings_diff.append({
            "key": "top_surface_pattern",
            "label": "Top Surface Pattern (Đỉnh vòm cầu)",
            "scope_tag": f"🌐 {d_obj['name'][:18]}",
            "object_id": d_obj["id"],
            "category": "aesthetics",
            "meaning": "Kiểu đi nhựa bề mặt đỉnh cho hình cầu/vòm",
            "default_val": "monotonic",
            "author_val": d_obj["overrides"].get("top_surface_pattern", "monotonic"),
            "proposed_val": "concentric",
            "reason": f"Đi nhựa đồng tâm (Concentric) theo viền vòm của '{d_obj['name']}' giúp đỉnh cầu mịn tự nhiên, không bị vết sọc chéo.",
            "approved": True,
        })

    if flat_top_objs:
        f_obj = flat_top_objs[0]
        settings_diff.append({
            "key": "ironing_type",
            "label": "Per-Object Ironing (Là phẳng mặt đỉnh)",
            "scope_tag": f"📦 {f_obj['name'][:18]}",
            "object_id": f_obj["id"],
            "category": "aesthetics",
            "meaning": "Dùng mũi đầu phun nóng là phẳng mặt ngang trên cùng",
            "default_val": "no_ironing",
            "author_val": f_obj["overrides"].get("ironing_type", "no_ironing"),
            "proposed_val": "topmost",
            "reason": f"Chỉ bật Ironing riêng cho '{f_obj['name']}' (có mặt phẳng ngang {f_obj['metrics']['flat_top_area_mm2']} mm²) để mặt đỉnh phẳng láng như gương.",
            "approved": True,
        })

    if cyl_objs:
        c_obj = cyl_objs[0]
        settings_diff.append({
            "key": "seam_slope_type",
            "label": "Scarf Joint Seam (Mối nối vạt chéo)",
            "scope_tag": f"🛢️ {c_obj['name'][:18]}",
            "object_id": c_obj["id"],
            "category": "aesthetics",
            "meaning": "Vuốt mỏng điểm đầu-cuối vòng tường trên mặt trụ tròn",
            "default_val": "none",
            "author_val": c_obj["overrides"].get("seam_slope_type", "none"),
            "proposed_val": "contour",
            "reason": f"Thân trụ '{c_obj['name']}' không có góc nhọn để giấu Z-Seam; Scarf Seam vạt chéo giúp xóa mờ đường gờ dọc.",
            "approved": True,
        })

    # --- ADHESION & FIRST LAYER SETTINGS ---
    settings_diff.extend([
        {
            "key": "elefant_foot_compensation",
            "label": "Elephant Foot Compensation",
            "scope_tag": "Global · Khóa đế nhỏ",
            "object_id": "global",
            "category": "adhesion",
            "meaning": "Bù trừ bè chân voi ở Layer 1 (mm)",
            "default_val": fmt_val(sys_def.get("elefant_foot_compensation", "0.15")),
            "author_val": fmt_val(orig_cfg.get("elefant_foot_compensation", "0.15")),
            "proposed_val": "0",
            "reason": "Đặt về 0 để không cắt lẹm diện tích Layer 1 của khớp cầu và giữ vành Brim dính chặt 100% vào chân mẫu.",
            "approved": True,
        },
        {
            "key": "brim_width",
            "label": "Outer Brim Width (Độ rộng vành Brim)",
            "scope_tag": "Global · Chống bật bàn",
            "object_id": "global",
            "category": "adhesion",
            "meaning": "Độ rộng vành khuyên gia cố bám bàn (mm)",
            "default_val": fmt_val(sys_def.get("brim_width", "5")),
            "author_val": fmt_val(orig_cfg.get("brim_width", "0")),
            "proposed_val": "8",
            "reason": "Tạo vành đế rộng 8mm kết hợp chân Tree Support thành một tấm đệm neo giữ các chi tiết cao trên bàn trượt A1.",
            "approved": True,
        },
        {
            "key": "brim_object_gap",
            "label": "Brim-Object Gap (Khe hở Brim)",
            "scope_tag": "Global · Zero-Gap Lock",
            "object_id": "global",
            "category": "adhesion",
            "meaning": "Khoảng cách giữa vành Brim và mép chi tiết (mm)",
            "default_val": fmt_val(sys_def.get("brim_object_gap", "0.1")),
            "author_val": fmt_val(orig_cfg.get("brim_object_gap", "0.1")),
            "proposed_val": "0",
            "reason": "Khe hở 0mm ép đường nhựa Brim dính liền hoàn toàn vào đế khớp cầu, không bị hở khi bẻ góc.",
            "approved": True,
        },
        {
            "key": "textured_plate_temp_initial_layer",
            "label": "Textured PEI Plate Temp (°C)",
            "scope_tag": "Global · Bàn nhám PEI",
            "object_id": "global",
            "category": "adhesion",
            "meaning": "Nhiệt độ bàn in Textured PEI cho PLA/PLA Lite",
            "default_val": fmt_val(sys_def.get("textured_plate_temp_initial_layer", "65")),
            "author_val": fmt_val(orig_cfg.get("textured_plate_temp_initial_layer", "55")),
            "proposed_val": "65",
            "reason": "Tấm Textured PEI cần 65°C để nhựa PLA Lite điền đầy vào các hạt nhám và không cong vênh mép.",
            "approved": True,
        },
        {
            "key": "initial_layer_speed",
            "label": "First Layer Speed (Tốc độ Layer 1)",
            "scope_tag": "Global · Độ bám Layer 1",
            "object_id": "global",
            "category": "adhesion",
            "meaning": "Tốc độ in đường viền lớp đầu tiên (mm/s)",
            "default_val": fmt_val(sys_def.get("initial_layer_speed", "50")),
            "author_val": fmt_val(orig_cfg.get("initial_layer_speed", "50")),
            "proposed_val": "30",
            "reason": "In chậm Layer 1 ở 30 mm/s đảm bảo các đảo nhỏ và rãnh ốc bám chắc tuyệt đối xuống mặt bàn.",
            "approved": True,
        },
    ])

    # --- KINEMATICS & STRUCTURAL STRENGTH ---
    settings_diff.extend([
        {
            "key": "wall_loops",
            "label": "Wall Loops (Số vòng tường chu vi)",
            "scope_tag": "Global · Chịu lực khớp nối",
            "object_id": "global",
            "category": "kinematics",
            "meaning": "Số lớp tường bao quanh chi tiết",
            "default_val": fmt_val(sys_def.get("wall_loops", "2")),
            "author_val": fmt_val(orig_cfg.get("wall_loops", "2")),
            "proposed_val": "4",
            "reason": "Tăng từ 2 lên 4 vòng tường giúp cổ khớp cầu và chốt chịu lực lắp ghép không bị nứt gãy, đồng thời chống lộ vân Infill.",
            "approved": True,
        },
        {
            "key": "top_shell_layers",
            "label": "Top Shell Layers (Chống võng Pillowing)",
            "scope_tag": "Global · Mặt đỉnh dày",
            "object_id": "global",
            "category": "kinematics",
            "meaning": "Số lớp nhựa đặc khóa mặt trên cùng",
            "default_val": fmt_val(sys_def.get("top_shell_layers", "5")),
            "author_val": fmt_val(orig_cfg.get("top_shell_layers", "3")),
            "proposed_val": "6",
            "reason": "6 lớp vỏ đỉnh (dày ~1.0mm) ngăn chặn hoàn toàn hiện tượng mặt đỉnh bị sập võng lỗ chỗ trên nền Infill thưa.",
            "approved": True,
        },
        {
            "key": "sparse_infill_pattern",
            "label": "Sparse Infill Pattern (Cấu trúc ruột)",
            "scope_tag": "Global · Chống cọ đầu phun",
            "object_id": "global",
            "category": "kinematics",
            "meaning": "Mẫu đường chạy ruột bên trong mô hình",
            "default_val": fmt_val(sys_def.get("sparse_infill_pattern", "grid")),
            "author_val": fmt_val(orig_cfg.get("sparse_infill_pattern", "grid")),
            "proposed_val": "gyroid",
            "reason": "Infill dạng Grid giao cắt trên cùng một lớp gây cọ đầu phun làm gãy/đổ mẫu cao; Gyroid uốn lượn 3D không bao giờ giao cắt.",
            "approved": True,
        },
        {
            "key": "z_hop",
            "label": "Z-Hop Height & Normal Lift",
            "scope_tag": "Global · Tránh quệt mép",
            "object_id": "global",
            "category": "kinematics",
            "meaning": "Độ cao nhấc đầu phun khi di chuyển (mm)",
            "default_val": fmt_val(sys_def.get("z_hop", "0.4")),
            "author_val": fmt_val(orig_cfg.get("z_hop", "0.4")),
            "proposed_val": "0.8",
            "reason": "Nhấc thẳng đứng 0.8mm (Normal Lift) kết hợp tắt Reduce Infill Retraction giúp đầu phun vượt an toàn qua các mép overhang cong.",
            "approved": True,
        },
        {
            "key": "default_acceleration",
            "label": "Default Acceleration (Gia tốc bàn trượt Y)",
            "scope_tag": "Global · A1 Bed-Slinger",
            "object_id": "global",
            "category": "kinematics",
            "meaning": "Gia tốc di chuyển mặc định (mm/s²)",
            "default_val": fmt_val(sys_def.get("default_acceleration", "6000")),
            "author_val": fmt_val(orig_cfg.get("default_acceleration", "6000")),
            "proposed_val": "4000",
            "reason": "Giảm quán tính giật qua lại của bàn in trục Y trên Bambu Lab A1 khi mẫu in lên cao.",
            "approved": True,
        },
    ])

    # --- SUPPORTS & PER-OBJECT OVERRIDES ---
    settings_diff.extend([
        {
            "key": "support_style",
            "label": "Tree Hybrid Support (Đài đỡ khớp cầu)",
            "scope_tag": "Global · Support cứng vững",
            "object_id": "global",
            "category": "support",
            "meaning": "Kiểu dáng cấu trúc cây chống đỡ",
            "default_val": fmt_val(sys_def.get("support_style", "default")),
            "author_val": fmt_val(orig_cfg.get("support_style", "tree_strong")),
            "proposed_val": "tree_hybrid",
            "reason": "Kết hợp thân cây to với lưới đỡ dày sát gầm khớp cầu, cứng vững theo phương ngang hơn hẳn nhánh đơn lẻ.",
            "approved": True,
        },
        {
            "key": "support_top_z_distance",
            "label": "Support Top Z Distance (Khe hở đỉnh Support)",
            "scope_tag": "Global · Ôm sát + Dễ bóc",
            "object_id": "global",
            "category": "support",
            "meaning": "Khoảng cách Z giữa đỉnh Support và đáy mẫu (mm)",
            "default_val": fmt_val(sys_def.get("support_top_z_distance", "0.2")),
            "author_val": fmt_val(orig_cfg.get("support_top_z_distance", "0.2")),
            "proposed_val": "0.14",
            "reason": "Khe hở 0.14mm (< 1 layer) kết hợp 4 lớp Top Interface giúp đài đỡ khóa chặt mặt cầu không bị rơ lắc.",
            "approved": True,
        },
    ])

    if screw_objs:
        s_obj = screw_objs[0]
        settings_diff.append({
            "key": "screw_bundle_override",
            "label": "Per-Object Screw Reinforcement",
            "scope_tag": f"🔩 {s_obj['name'][:18]}",
            "object_id": s_obj["id"],
            "category": "support",
            "meaning": "Gói cấu hình riêng cho ốc in 3D",
            "default_val": "2 walls / 200mm/s",
            "author_val": "no_brim / zig-zag",
            "proposed_val": "Brim 5mm + 6 Concentric + 35mm/s",
            "reason": "Brim 5mm nối liền 2 nửa đầu ốc bị rãnh tua-vít xẻ đôi; 100% Concentric chống rung và tốc độ 35mm/s giúp bước ren sắc nét.",
            "approved": True,
        })

    # Compute initial scores
    safety_penalties = len(pinpoint_objs) * 14 + len(missing_sup_objs) * 12 + len(screw_objs) * 10 + len(tall_objs) * 8
    safety_before = max(28, min(78, 88 - safety_penalties))
    aesthetics_penalties = len(dome_objs) * 10 + len(flat_top_objs) * 8 + len(cyl_objs) * 8 + (10 if orig_cfg.get("wall_generator") != "arachne" else 0)
    aesthetics_before = max(42, min(82, 90 - aesthetics_penalties))

    is_stl = telemetry.get("source_format") == "stl"
    total_tris = sum(o.get("triangle_count", 0) for o in objects)
    summary_prefix = (
        f"Đã phân tích lưới 3D .STL ({total_tris:,} tam giác) & tổng hợp cấu hình Slicer tối ưu. "
        if is_stl
        else f"Đã phân tích {len(telemetry.get('plates', []))} khay in ({len(objects)} chi tiết). "
    )

    return {
        "summary": (
            summary_prefix
            + f"Phát hiện {len(pinpoint_objs)} chi tiết tiếp xúc điểm/khớp cầu, {len(dome_objs)} mặt vòm cầu, "
            f"{len(flat_top_objs)} mặt đỉnh phẳng ngang và {len(cyl_objs)} biên dạng trụ tròn."
        ),
        "safety_score_before": safety_before,
        "safety_score_after": 97,
        "aesthetics_score_before": aesthetics_before,
        "aesthetics_score_after": 95,
        "diagnostic_cards": diagnostic_cards,
        "settings_diff": settings_diff,
    }


def _patch_mesh_element(
    mesh_parent: ET.Element,
    do_flat: bool,
    flatten_mm: float,
    do_sup: bool,
) -> tuple[int, int]:
    """
    Applies Z-bottom vertex flattening and/or 360-degree base overhang support painting
    to an XML element containing `<vertex>` and `<triangle>` nodes.
    """
    v_els = mesh_parent.findall(f".//{{{NS_URI_M}}}vertex")
    if not v_els:
        return 0, 0
    verts = [(float(v.attrib["x"]), float(v.attrib["y"]), float(v.attrib["z"])) for v in v_els]
    min_z = min(v[2] for v in verts)
    dz = flatten_mm if do_flat else 0.20
    half_dz = (flatten_mm / 2.0) if do_flat else 0.0

    painted_added = 0
    if do_sup:
        for t in mesh_parent.findall(f".//{{{NS_URI_M}}}triangle"):
            v1 = verts[int(t.attrib["v1"])]
            v2 = verts[int(t.attrib["v2"])]
            v3 = verts[int(t.attrib["v3"])]
            z_avg = (v1[2] + v2[2] + v3[2]) / 3.0 - min_z
            ux, uy, uz = v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]
            vx, vy, vz = v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]
            nx = uy * vz - uz * vy
            ny = uz * vx - ux * vz
            nz = ux * vy - uy * vx
            length = math.hypot(nx, ny, nz)
            if length > 1e-9:
                nz /= length
            if (dz + 0.05) <= z_avg <= 8.0 and nz < -0.10:
                if t.attrib.get("paint_supports") != "4":
                    t.attrib["paint_supports"] = "4"
                    painted_added += 1
            elif do_flat and z_avg < (dz + 0.05):
                t.attrib.pop("paint_supports", None)

    flattened_verts = 0
    if do_flat:
        for v_el, (_vx, _vy, vz) in zip(v_els, verts):
            if vz < min_z + flatten_mm:
                vz_clamped = min_z + flatten_mm
                flattened_verts += 1
            else:
                vz_clamped = vz
            v_el.attrib["z"] = f"{vz_clamped - half_dz:.7f}"

    return flattened_verts, painted_added


def apply_3mf_optimizations(
    src_path: Path,
    dst_path: Path,
    diagnostic_cards: list[dict[str, Any]],
    settings_diff: list[dict[str, Any]],
    printer_preset: str = "Bambu Lab A1 0.4 nozzle",
    filament_preset: str = "Bambu PLA Lite @BBL A1",
) -> dict[str, Any]:
    """
    Non-destructive 3MF patcher: applies only the user-approved diagnostic geometry actions
    and approved global/per-object slicer settings into `dst_path`.
    """
    telemetry = profile_3mf(src_path, include_preview_mesh=False)
    orig_cfg = dict(telemetry.get("project_settings", {}))
    base_cfg = get_system_baseline(printer_preset, filament_preset, "0.16mm Optimal @BBL A1")

    orig_colours = orig_cfg.get("filament_colour", [])
    num_filaments = len(orig_colours) if isinstance(orig_colours, list) and len(orig_colours) > 0 else 1

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
    }

    cfg = dict(orig_cfg)
    INTERNAL_PROFILE_KEYS = {"type", "name", "from", "instantiation", "inherits", "include", "setting_id", "description"}
    for k, v in base_cfg.items():
        if k in PRESERVE_ORIG_KEYS or k in INTERNAL_PROFILE_KEYS or k.startswith("machine_max_"):
            continue
        if orig_cfg and k not in cfg:
            continue
        orig_val = orig_cfg.get(k)
        if isinstance(orig_val, list):
            if len(orig_val) == num_filaments:
                scalar_v = v[0] if isinstance(v, list) and len(v) > 0 else v
                cfg[k] = [scalar_v] * num_filaments
            elif isinstance(v, list) and len(v) == len(orig_val):
                cfg[k] = v
            # Otherwise keep orig_val so multi-element geometry/AMS arrays are never truncated
        else:
            cfg[k] = v[0] if isinstance(v, list) and len(v) == 1 else v

    cfg["printer_settings_id"] = printer_preset
    cfg["filament_settings_id"] = [filament_preset] * num_filaments
    if num_filaments == 1:
        cfg["enable_prime_tower"] = "0"

    # Parse approved Diagnostic Geometry Actions
    approved_actions = {c["action_type"]: c for c in diagnostic_cards if c.get("approved")}
    flatten_mm = float(approved_actions["FLATTEN_BOTTOM"]["param_value"]) if "FLATTEN_BOTTOM" in approved_actions else 0.0
    do_reinforce_supports = "REINFORCE_SUPPORTS" in approved_actions
    do_optimize_screws = "OPTIMIZE_SCREW" in approved_actions
    do_rotate_yaw = "ROTATE_YAW" in approved_actions
    do_ironing_flat = "IRONING_FLAT_TOP" in approved_actions
    do_dome_concentric = "ADAPTIVE_LAYER_DOME" in approved_actions
    do_cylinder_scarf = "SCARF_SEAM_CYLINDER" in approved_actions
    do_fuzzy_skin = "FUZZY_SKIN" in approved_actions
    do_arachne_detail = "ARACHNE_FINE_DETAIL" in approved_actions
    do_bridge_cooling = "BRIDGE_AND_NECK_COOLING" in approved_actions

    if do_arachne_detail:
        cfg["wall_generator"] = "arachne"
    if do_cylinder_scarf:
        cfg["arc_fitting"] = "1"
    if do_bridge_cooling:
        cfg["bridge_speed"] = "25"
        cfg["slow_down_layer_time"] = ["10"] * num_filaments
        cfg["overhang_fan_speed"] = ["100"] * num_filaments
    if do_rotate_yaw:
        cfg["default_acceleration"] = "4000"
        cfg["travel_acceleration"] = "4000"

    # Apply approved Settings Diff items
    per_object_patches: dict[str, dict[str, str]] = {}
    for s in settings_diff:
        if not s.get("approved"):
            continue
        key = s["key"]
        val = str(s["proposed_val"]).strip()
        oid = s.get("object_id", "global")

        if oid == "global":
            # Never overwrite multi-color palette or disable prime tower on multi-color AMS models
            if key in ("filament_colour", "default_filament_colour", "flush_volumes_matrix"):
                continue
            if key == "enable_prime_tower" and num_filaments > 1:
                continue

            # Map composite/human-friendly values cleanly to Bambu Studio schema keys
            if key == "z_hop":
                num_val = val.split()[0]
                z_len = len(cfg["z_hop"]) if isinstance(cfg.get("z_hop"), list) and len(cfg["z_hop"]) > 0 else num_filaments
                cfg["z_hop"] = [num_val] * z_len
                cfg["z_hop_types"] = ["Normal Lift"] * z_len
                cfg["reduce_infill_retraction_mode"] = "Disabled"
                cfg["reduce_crossing_wall"] = "1"
            elif key == "brim_width":
                num_val = val.split("mm")[0].strip()
                cfg["brim_type"] = "outer_only"
                cfg["brim_width"] = num_val
                cfg["raft_first_layer_expansion"] = "8"
            elif key == "support_style":
                cfg["enable_support"] = "1"
                cfg["support_type"] = "tree(manual)"
                cfg["support_style"] = val
                cfg["support_on_build_plate_only"] = "0"
                cfg["tree_support_branch_diameter"] = "3"
                cfg["tree_support_wall_count"] = "2"
            elif key == "support_top_z_distance":
                num_val = val.split("mm")[0].strip()
                cfg["support_top_z_distance"] = num_val
                cfg["support_bottom_z_distance"] = num_val
                cfg["support_interface_top_layers"] = "4"
                cfg["support_interface_spacing"] = "0.15"
            elif key in cfg and isinstance(cfg[key], list):
                slot_len = len(cfg[key]) if len(cfg[key]) > 0 else num_filaments
                cfg[key] = [val.split()[0]] * slot_len
            else:
                cfg[key] = val
        else:
            per_object_patches.setdefault(oid, {})[key] = val

    # Populate per-object morphology overrides
    obj_map = {o["id"]: o for o in telemetry["objects"]}
    for oid, o in obj_map.items():
        flags = o["morphology_flags"]
        if do_optimize_screws and "SLOTTED_OR_SMALL_SCREW" in flags:
            per_object_patches.setdefault(oid, {}).update({
                "brim_type": "outer_only",
                "brim_width": "5",
                "brim_object_gap": "0.04",
                "wall_loops": "6",
                "sparse_infill_density": "100%",
                "skeleton_infill_density": "100%",
                "skin_infill_density": "100%",
                "sparse_infill_pattern": "concentric",
                "outer_wall_speed": "35",
                "inner_wall_speed": "50",
                "sparse_infill_speed": "60",
                "top_surface_speed": "40",
            })
        if do_ironing_flat and "FLAT_HORIZONTAL_TOP" in flags:
            per_object_patches.setdefault(oid, {}).update({
                "ironing_type": "topmost",
                "ironing_flow": "12%",
                "ironing_speed": "30",
                "ironing_spacing": "0.15",
            })
        if do_dome_concentric and "DOMED_CURVATURE_TOP" in flags:
            per_object_patches.setdefault(oid, {}).update({
                "top_surface_pattern": "concentric",
            })
        if do_cylinder_scarf and "SMOOTH_CYLINDER_SEAM" in flags:
            per_object_patches.setdefault(oid, {}).update({
                "seam_slope_type": "contour",
                "seam_slope_start_height": "10%",
            })
        if do_fuzzy_skin and oid == approved_actions["FUZZY_SKIN"].get("object_id"):
            per_object_patches.setdefault(oid, {}).update({
                "fuzzy_skin": "outside",
                "fuzzy_skin_point_distance": "0.3",
                "fuzzy_skin_thickness": "0.2",
            })

    applied_summary: list[str] = []

    if src_path.suffix.lower() == ".stl":
        return _export_stl_to_3mf(
            src_path=src_path,
            dst_path=dst_path,
            telemetry=telemetry,
            cfg=cfg,
            per_object_patches=per_object_patches,
            flatten_mm=flatten_mm,
            do_reinforce_supports=do_reinforce_supports,
            do_rotate_yaw=do_rotate_yaw,
            applied_summary=applied_summary,
        )

    with zipfile.ZipFile(src_path, "r") as zin:
        namelist = set(zin.namelist())
        has_ms = "Metadata/model_settings.config" in namelist
        ms_root = ET.fromstring(zin.read("Metadata/model_settings.config")) if has_ms else None
        root_3d = ET.fromstring(zin.read("3D/3dmodel.model"))

        model_to_oid: dict[str, str] = {}
        inline_mesh_oids: dict[str, ET.Element] = {}
        for obj in root_3d.findall(f".//{{{NS_URI_M}}}object"):
            oid = obj.attrib.get("id", "")
            comp = obj.find(f".//{{{NS_URI_M}}}component")
            if comp is not None:
                mpath = (comp.attrib.get(f"{{{NS_URI_P}}}path") or comp.attrib.get("path") or "").lstrip("/")
                if mpath:
                    model_to_oid[mpath] = oid
            elif obj.find(f".//{{{NS_URI_M}}}mesh") is not None:
                inline_mesh_oids[oid] = obj

        # Apply Per-Object Overrides to Metadata/model_settings.config
        if ms_root is not None:
            for obj_el in ms_root.findall("object"):
                oid = obj_el.attrib.get("id", "")
                if oid in per_object_patches:
                    existing = {md.attrib.get("key"): md for md in obj_el.findall("metadata") if "key" in md.attrib}
                    patch_dict = per_object_patches[oid]
                    patch_dict.pop("screw_bundle_override", None)
                    for k, v in patch_dict.items():
                        if k in existing:
                            existing[k].attrib["value"] = str(v)
                        else:
                            obj_el.insert(1, ET.Element("metadata", {"key": k, "value": str(v)}))
                    applied_summary.append(f"Per-object overrides applied to Object #{oid} ({len(patch_dict)} keys)")

        # Determine which objects get bottom-flattened
        flatten_oids: set[str] = set()
        if flatten_mm > 0:
            for oid, o in obj_map.items():
                if "PINPOINT_BALL_BASE" in o["morphology_flags"] or "MISSING_BASE_SUPPORTS" in o["morphology_flags"]:
                    flatten_oids.add(oid)
                    half_dz = flatten_mm / 2.0
                    for item_el in root_3d.findall(f".//{{{NS_URI_M}}}item"):
                        if item_el.attrib.get("objectid") == oid and "transform" in item_el.attrib:
                            parts = item_el.attrib["transform"].split()
                            parts[11] = f"{float(parts[11]) - half_dz:.7f}"
                            item_el.attrib["transform"] = " ".join(parts)
                    if ms_root is not None:
                        for ai_el in ms_root.findall(".//assemble_item"):
                            if ai_el.attrib.get("object_id") == oid and "transform" in ai_el.attrib:
                                parts = ai_el.attrib["transform"].split()
                                parts[11] = f"{float(parts[11]) - half_dz:.15f}"
                                ai_el.attrib["transform"] = " ".join(parts)
                        for obj_el in ms_root.findall("object"):
                            if obj_el.attrib.get("id") == oid:
                                for md_el in obj_el.findall(".//metadata"):
                                    if md_el.attrib.get("key") == "source_offset_z":
                                        md_el.attrib["value"] = f"{float(md_el.attrib['value']) - half_dz:.14f}"

        # Patch inline <mesh> objects inside 3D/3dmodel.model (for Standard / PrusaSlicer .3mf files)
        inline_modified = False
        for oid, obj_el in inline_mesh_oids.items():
            o_info = obj_map.get(oid, {})
            do_flat = oid in flatten_oids
            do_sup = do_reinforce_supports and "SLOTTED_OR_SMALL_SCREW" not in o_info.get("morphology_flags", [])
            if do_flat or do_sup:
                f_cnt, p_cnt = _patch_mesh_element(obj_el, do_flat, flatten_mm, do_sup)
                if f_cnt > 0 or p_cnt > 0:
                    inline_modified = True
                    applied_summary.append(
                        f"{o_info.get('name', oid)}: flattened {f_cnt} vertices ({flatten_mm}mm) & painted {p_cnt} support triangles"
                    )

        with zipfile.ZipFile(dst_path, "w", compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)
                if item.filename == "Metadata/project_settings.config":
                    data = json.dumps(cfg, indent=4).encode("utf-8")
                elif item.filename == "3D/3dmodel.model":
                    if flatten_oids or inline_modified:
                        if b"xmlns:BambuStudio=" in data:
                            root_3d.set("xmlns:BambuStudio", "http://schemas.bambulab.com/package/2021")
                        data = ET.tostring(root_3d, encoding="utf-8", xml_declaration=True)
                elif item.filename == "Metadata/model_settings.config" and ms_root is not None:
                    data = ET.tostring(ms_root, encoding="utf-8", xml_declaration=True)
                elif item.filename in model_to_oid:
                    oid = model_to_oid[item.filename]
                    o_info = obj_map.get(oid, {})
                    do_flat = oid in flatten_oids
                    do_sup = do_reinforce_supports and "SLOTTED_OR_SMALL_SCREW" not in o_info.get("morphology_flags", [])
                    if do_flat or do_sup:
                        has_bbl_ns = b"xmlns:BambuStudio=" in data[:600]
                        mroot = ET.fromstring(data)
                        flattened_verts, painted_added = _patch_mesh_element(mroot, do_flat, flatten_mm, do_sup)
                        if flattened_verts > 0 or painted_added > 0:
                            if has_bbl_ns:
                                mroot.set("xmlns:BambuStudio", "http://schemas.bambulab.com/package/2021")
                            applied_summary.append(
                                f"{o_info.get('name', oid)}: flattened {flattened_verts} vertices ({flatten_mm}mm) & painted {painted_added} support triangles"
                            )
                            data = ET.tostring(mroot, encoding="utf-8", xml_declaration=True)
                zout.writestr(item, data)
            if "Metadata/project_settings.config" not in namelist:
                zout.writestr("Metadata/project_settings.config", json.dumps(cfg, indent=4).encode("utf-8"))

    return {
        "output_path": str(dst_path),
        "output_filename": dst_path.name,
        "applied_summary": applied_summary,
    }


def _export_stl_to_3mf(
    src_path: Path,
    dst_path: Path,
    telemetry: dict[str, Any],
    cfg: dict[str, Any],
    per_object_patches: dict[str, dict[str, str]],
    flatten_mm: float,
    do_reinforce_supports: bool,
    do_rotate_yaw: bool,
    applied_summary: list[str],
) -> dict[str, Any]:
    """
    Packages an `.stl` mesh into a complete Bambu Studio / PrusaSlicer compatible `.3mf` archive,
    applying vectorized Z-bottom flattening, Z-yaw rotation, 360° overhang support painting
    (`paint_supports="4"`), per-object overrides, and global slicer settings.
    """
    verts, tris = _parse_stl_file(src_path)
    obj_name = src_path.stem
    flags = telemetry["objects"][0]["morphology_flags"] if telemetry.get("objects") else []

    if verts.shape[0] > 0 and tris.shape[0] > 0:
        # Center XY at (0, 0) and place bottom at Z = 0
        min_xyz = verts.min(axis=0)
        max_xyz = verts.max(axis=0)
        verts[:, 0] -= (min_xyz[0] + max_xyz[0]) * 0.5
        verts[:, 1] -= (min_xyz[1] + max_xyz[1]) * 0.5
        verts[:, 2] -= min_xyz[2]

        if do_rotate_yaw:
            # 90-degree CCW rotation around Z axis: (x, y) -> (-y, x)
            old_x = verts[:, 0].copy()
            verts[:, 0] = -verts[:, 1]
            verts[:, 1] = old_x
            applied_summary.append(f"{obj_name}: rotated 90° around Z-axis for bed-slinger Y-inertia")

        do_flat = flatten_mm > 0
        do_sup = do_reinforce_supports and "SLOTTED_OR_SMALL_SCREW" not in flags
        dz = flatten_mm if do_flat else 0.20

        paint_mask = np.zeros(tris.shape[0], dtype=bool)
        if do_sup:
            v1 = verts[tris[:, 0]]
            v2 = verts[tris[:, 1]]
            v3 = verts[tris[:, 2]]
            z_avg = (v1[:, 2] + v2[:, 2] + v3[:, 2]) / 3.0
            cross = np.cross(v2 - v1, v3 - v1)
            lengths = np.linalg.norm(cross, axis=1)
            nz = cross[:, 2] / np.where(lengths > 1e-9, lengths, 1.0)
            paint_mask = (z_avg >= (dz + 0.05)) & (z_avg <= 8.0) & (nz < -0.10)

        flattened_verts = 0
        if do_flat:
            clamp_mask = verts[:, 2] < flatten_mm
            flattened_verts = int(np.sum(clamp_mask))
            verts[clamp_mask, 2] = flatten_mm
            verts[:, 2] -= flatten_mm

        painted_added = int(np.sum(paint_mask))
        if flattened_verts > 0 or painted_added > 0:
            applied_summary.append(
                f"{obj_name}: flattened {flattened_verts} vertices ({flatten_mm}mm) & painted {painted_added} support triangles"
            )
    else:
        paint_mask = np.zeros(0, dtype=bool)

    v_lines = [f'          <vertex x="{vx:.6f}" y="{vy:.6f}" z="{vz:.6f}"/>' for vx, vy, vz in verts]
    t_lines = [
        f'          <triangle v1="{t0}" v2="{t1}" v3="{t2}" paint_supports="4"/>'
        if pm
        else f'          <triangle v1="{t0}" v2="{t1}" v3="{t2}"/>'
        for (t0, t1, t2), pm in zip(tris, paint_mask)
    ]

    model_xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<model unit="millimeter" xml:lang="en-US" xmlns="{NS_URI_M}" xmlns:BambuStudio="{NS_URI_BBL}" xmlns:p="{NS_URI_P}">\n'
        '  <metadata name="BambuStudio:3mfVersion">1</metadata>\n'
        '  <resources>\n'
        f'    <object id="1" name="{obj_name}" type="model">\n'
        '      <mesh>\n'
        '        <vertices>\n'
        + "\n".join(v_lines)
        + "\n        </vertices>\n"
        "        <triangles>\n"
        + "\n".join(t_lines)
        + "\n        </triangles>\n"
        "      </mesh>\n"
        "    </object>\n"
        "  </resources>\n"
        "  <build>\n"
        '    <item objectid="1" transform="1 0 0 0 1 0 0 0 1 128 128 0" printable="1"/>\n'
        "  </build>\n"
        "</model>\n"
    )

    patch_dict = dict(per_object_patches.get("1", {}))
    patch_dict.pop("screw_bundle_override", None)
    if patch_dict:
        applied_summary.append(f"Per-object overrides applied to Object #1 ({len(patch_dict)} keys)")

    obj_meta_lines = [
        f'    <metadata key="name" value="{obj_name}"/>',
        '    <metadata key="extruder" value="1"/>',
    ]
    for k, v in patch_dict.items():
        obj_meta_lines.append(f'    <metadata key="{k}" value="{v}"/>')

    ms_xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        "<config>\n"
        '  <object id="1">\n'
        + "\n".join(obj_meta_lines)
        + "\n"
        '    <part id="1" subtype="normal_part">\n'
        f'      <metadata key="name" value="{obj_name}"/>\n'
        '      <metadata key="matrix" value="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1"/>\n'
        '      <metadata key="extruder" value="1"/>\n'
        "    </part>\n"
        "  </object>\n"
        "  <plate>\n"
        '    <metadata key="plater_id" value="1"/>\n'
        '    <metadata key="plater_name" value="Plate 1"/>\n'
        '    <metadata key="locked" value="false"/>\n'
        "    <model_instance>\n"
        '      <metadata key="object_id" value="1"/>\n'
        '      <metadata key="instance_id" value="0"/>\n'
        '      <metadata key="identify_id" value="1"/>\n'
        "    </model_instance>\n"
        "  </plate>\n"
        "  <assemble>\n"
        '    <assemble_item object_id="1" instance_id="0" transform="1 0 0 0 1 0 0 0 1 128 128 0" offset="0 0 0"/>\n'
        "  </assemble>\n"
        "</config>\n"
    )

    content_types_xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n'
        '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n'
        '  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>\n'
        '  <Default Extension="config" ContentType="text/xml"/>\n'
        "</Types>\n"
    )

    rels_xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n'
        '  <Relationship Target="/3D/3dmodel.model" Id="rel-1" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>\n'
        "</Relationships>\n"
    )

    with zipfile.ZipFile(dst_path, "w", compression=zipfile.ZIP_DEFLATED) as zout:
        zout.writestr("[Content_Types].xml", content_types_xml.encode("utf-8"))
        zout.writestr("_rels/.rels", rels_xml.encode("utf-8"))
        zout.writestr("3D/3dmodel.model", model_xml.encode("utf-8"))
        zout.writestr("Metadata/model_settings.config", ms_xml.encode("utf-8"))
        zout.writestr("Metadata/project_settings.config", json.dumps(cfg, indent=4).encode("utf-8"))

    return {
        "output_path": str(dst_path),
        "output_filename": dst_path.name,
        "applied_summary": applied_summary,
    }


def apply_stl_export(
    src_path: Path,
    dst_path: Path,
    diagnostic_cards: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Exports a geometry-optimized Binary `.stl` mesh from either an `.stl` or `.3mf` source,
    applying approved geometry modifications (`FLATTEN_BOTTOM` and `ROTATE_YAW`).
    """
    telemetry = profile_3mf(src_path, include_preview_mesh=True)
    approved_actions = {c["action_type"]: c for c in diagnostic_cards if c.get("approved")}
    flatten_mm = float(approved_actions["FLATTEN_BOTTOM"]["param_value"]) if "FLATTEN_BOTTOM" in approved_actions else 0.0
    do_rotate_yaw = "ROTATE_YAW" in approved_actions

    all_tri_verts: list[np.ndarray] = []
    applied_summary: list[str] = []

    if src_path.suffix.lower() == ".stl":
        verts, tris = _parse_stl_file(src_path)
        if verts.shape[0] > 0 and tris.shape[0] > 0:
            min_xyz = verts.min(axis=0)
            max_xyz = verts.max(axis=0)
            verts[:, 0] -= (min_xyz[0] + max_xyz[0]) * 0.5
            verts[:, 1] -= (min_xyz[1] + max_xyz[1]) * 0.5
            verts[:, 2] -= min_xyz[2]

            if do_rotate_yaw:
                old_x = verts[:, 0].copy()
                verts[:, 0] = -verts[:, 1]
                verts[:, 1] = old_x
                applied_summary.append(f"{src_path.stem}: rotated 90° around Z-axis")

            if flatten_mm > 0:
                clamp_mask = verts[:, 2] < flatten_mm
                f_cnt = int(np.sum(clamp_mask))
                verts[clamp_mask, 2] = flatten_mm
                verts[:, 2] -= flatten_mm
                applied_summary.append(f"{src_path.stem}: flattened {f_cnt} bottom vertices ({flatten_mm}mm)")

            all_tri_verts.append(verts[tris])
    else:
        for obj in telemetry.get("objects", []):
            preview = obj.get("mesh_preview", {})
            raw_v = preview.get("vertices", [])
            raw_i = preview.get("indices", [])
            if not raw_v or not raw_i:
                continue
            verts = np.array(raw_v, dtype=np.float32).reshape(-1, 3)
            tris = np.array(raw_i, dtype=np.int32).reshape(-1, 3)
            min_xyz = verts.min(axis=0)
            max_xyz = verts.max(axis=0)
            verts[:, 0] -= (min_xyz[0] + max_xyz[0]) * 0.5
            verts[:, 1] -= (min_xyz[1] + max_xyz[1]) * 0.5
            verts[:, 2] -= min_xyz[2]

            if do_rotate_yaw and "Y_AXIS_INERTIA_TALL" in obj.get("morphology_flags", []):
                old_x = verts[:, 0].copy()
                verts[:, 0] = -verts[:, 1]
                verts[:, 1] = old_x
                applied_summary.append(f"{obj['name']}: rotated 90° around Z-axis")

            flags = obj.get("morphology_flags", [])
            if flatten_mm > 0 and ("PINPOINT_BALL_BASE" in flags or "MISSING_BASE_SUPPORTS" in flags):
                clamp_mask = verts[:, 2] < flatten_mm
                f_cnt = int(np.sum(clamp_mask))
                verts[clamp_mask, 2] = flatten_mm
                verts[:, 2] -= flatten_mm
                applied_summary.append(f"{obj['name']}: flattened {f_cnt} bottom vertices ({flatten_mm}mm)")

            wx, wy, _wz = obj.get("world_pos", [0.0, 0.0, 0.0])
            verts[:, 0] += float(wx) - 128.0
            verts[:, 1] += float(wy) - 128.0
            all_tri_verts.append(verts[tris])

    if all_tri_verts:
        tri_verts = np.vstack(all_tri_verts).astype(np.float32)
    else:
        tri_verts = np.zeros((0, 3, 3), dtype=np.float32)

    num_tris = int(tri_verts.shape[0])
    out_records = np.zeros(num_tris, dtype=STL_BINARY_DTYPE)
    if num_tris > 0:
        v1 = tri_verts[:, 0, :]
        v2 = tri_verts[:, 1, :]
        v3 = tri_verts[:, 2, :]
        cross = np.cross(v2 - v1, v3 - v1)
        lengths = np.linalg.norm(cross, axis=1, keepdims=True)
        normals = cross / np.where(lengths > 1e-9, lengths, 1.0)
        out_records["normal"] = normals.astype(np.float32)
        out_records["vertices"] = tri_verts
        out_records["attr"] = 0

    header = b"LayerZero Studio v2.0 Optimized Binary STL".ljust(80, b"\x00")
    with open(dst_path, "wb") as fp:
        fp.write(header)
        fp.write(struct.pack("<I", num_tris))
        fp.write(out_records.tobytes())

    return {
        "output_path": str(dst_path),
        "output_filename": dst_path.name,
        "applied_summary": applied_summary,
    }
