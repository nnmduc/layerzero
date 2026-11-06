"""
Filament support tests (PLA Lite / PLA Basic / PETG HF on A1, A1 mini, P1S, X1C).

Run from `backend/`:  .venv/bin/python -m unittest discover -s tests -v
Vendor-value tests are skipped when Bambu Studio's system profiles are not installed.
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from filament_profiles import (  # noqa: E402
    FILAMENTS,
    PRINTERS,
    build_material_context,
    describe_filament_slots,
    material_family,
    plan_slot_filaments,
    resolve_filament_preset,
)
from patcher import build_baseline_audit, guard_material_value  # noqa: E402
from profiler import load_bbl_system_profiles, resolve_profile  # noqa: E402
from slicer_config_merge import build_patched_config, set_filament_key  # noqa: E402

HAS_PROFILES = bool(load_bbl_system_profiles())

MIXED_CFG = {
    "curr_bed_type": "Textured PEI Plate",
    "filament_settings_id": ["Bambu PLA Basic @BBL A1", "Bambu Support for PLA/PETG @BBL A1", "Bambu PETG HF @BBL A1"],
    "filament_type": ["PLA", "PLA-S", "PETG"],
    "filament_colour": ["#FFFFFF", "#000000", "#FF0000"],
    "nozzle_temperature": ["220", "210", "240"],
    "textured_plate_temp_initial_layer": ["65", "55", "70"],
    "fan_max_speed": ["80", "80", "50"],
}


def _telemetry(cfg: dict) -> dict:
    return {"project_settings": cfg, "objects": [], "plates": []}


class SlotPlanningTests(unittest.TestCase):
    def test_family_classification(self):
        self.assertEqual(material_family("Bambu PLA Lite @BBL A1"), "PLA_LITE")
        self.assertEqual(material_family("Bambu PLA Basic @BBL A1"), "PLA")
        self.assertEqual(material_family("Bambu PETG HF @BBL X1C"), "PETG")
        self.assertEqual(material_family("Bambu Support for PLA/PETG @BBL A1", "PLA-S"), "SUPPORT")

    def test_default_plan_keeps_support_and_other_material_slots(self):
        slots = describe_filament_slots(MIXED_CFG)
        self.assertEqual(plan_slot_filaments(slots, "PETG HF"), {0: "PETG HF"})

    def test_multicolour_pla_retargets_every_slot(self):
        cfg = {"filament_settings_id": ["Bambu PLA Lite @BBL A1"] * 4, "filament_type": ["PLA"] * 4}
        self.assertEqual(plan_slot_filaments(describe_filament_slots(cfg), "PLA Basic"), {i: "PLA Basic" for i in range(4)})

    def test_slot_overrides_win(self):
        slots = describe_filament_slots(MIXED_CFG)
        self.assertEqual(plan_slot_filaments(slots, "PLA Lite", [None, None, "PLA Basic"]), {2: "PLA Basic"})

    def test_mixed_model_families_flag(self):
        self.assertTrue(build_material_context(MIXED_CFG, "Bambu Lab A1 0.4 nozzle", "PLA Basic")["mixed_model_families"])


@unittest.skipUnless(HAS_PROFILES, "Bambu Studio system profiles not installed")
class PresetResolutionTests(unittest.TestCase):
    def test_every_printer_filament_pair_is_compatible(self):
        profiles = load_bbl_system_profiles()
        for printer in PRINTERS:
            for key in FILAMENTS:
                name = resolve_filament_preset(printer, key)
                compat = resolve_profile(name, profiles).get("compatible_printers", [])
                self.assertIn(printer, compat, f"{name} is not compatible with {printer}")


@unittest.skipUnless(HAS_PROFILES, "Bambu Studio system profiles not installed")
class PatchedConfigTests(unittest.TestCase):
    def test_mixed_file_only_retargets_body_slot(self):
        cfg, plan, _ = build_patched_config(MIXED_CFG, "Bambu Lab A1 0.4 nozzle", "PLA Lite")
        self.assertEqual(plan, {0: "PLA Lite"})
        self.assertEqual(cfg["filament_settings_id"][0], "Bambu PLA Lite @BBL A1")
        self.assertEqual(cfg["filament_settings_id"][1:], MIXED_CFG["filament_settings_id"][1:])
        self.assertEqual(cfg["nozzle_temperature"][1:], ["210", "240"])
        self.assertEqual(cfg["filament_type"], ["PLA", "PLA-S", "PETG"])

    def test_petg_on_a1_gets_vendor_values(self):
        cfg = {"filament_settings_id": ["Bambu PLA Lite @BBL A1"], "filament_type": ["PLA"],
               "textured_plate_temp_initial_layer": ["65"], "fan_max_speed": ["80"], "filament_flow_ratio": ["0.98"]}
        out, _, _ = build_patched_config(cfg, "Bambu Lab A1 0.4 nozzle", "PETG HF")
        self.assertEqual(out["textured_plate_temp_initial_layer"], ["70"])
        self.assertEqual(out["fan_max_speed"], ["50"])
        self.assertEqual(out["filament_flow_ratio"], ["0.94"])
        self.assertEqual(out["filament_type"], ["PETG"])

    def test_pla_on_p1s_uses_enclosed_bed_temp(self):
        cfg = {"filament_settings_id": ["Bambu PLA Basic @BBL A1"], "textured_plate_temp_initial_layer": ["65"]}
        out, _, _ = build_patched_config(cfg, "Bambu Lab P1S 0.4 nozzle", "PLA Basic")
        self.assertEqual(out["textured_plate_temp_initial_layer"], ["55"])
        self.assertEqual(out["printer_settings_id"], "Bambu Lab P1S 0.4 nozzle")

    def test_set_filament_key_only_touches_planned_slots(self):
        cfg = {"overhang_fan_speed": ["100", "50", "50"]}
        set_filament_key(cfg, "overhang_fan_speed", "90", {0: "PLA Lite"}, {"overhang_fan_speed"}, 3)
        self.assertEqual(cfg["overhang_fan_speed"], ["90", "50", "50"])

    def test_empty_plan_keeps_every_slot(self):
        cfg = {"overhang_fan_speed": ["100", "50"]}
        set_filament_key(cfg, "overhang_fan_speed", "90", {}, {"overhang_fan_speed"}, 2)
        self.assertEqual(cfg["overhang_fan_speed"], ["100", "50"])


@unittest.skipUnless(HAS_PROFILES, "Bambu Studio system profiles not installed")
class BaselineAuditTests(unittest.TestCase):
    def _diff(self, audit, key):
        return next(s for s in audit["settings_diff"] if s["key"] == key)

    def test_petg_proposals_never_lower_vendor_values(self):
        cfg = {"filament_settings_id": ["Bambu PLA Lite @BBL A1"], "filament_type": ["PLA"], "curr_bed_type": "Textured PEI Plate"}
        audit = build_baseline_audit(_telemetry(cfg), "Bambu Lab A1 0.4 nozzle", "PETG HF")
        self.assertEqual(self._diff(audit, "textured_plate_temp_initial_layer")["proposed_val"], "70")
        self.assertGreaterEqual(float(self._diff(audit, "support_top_z_distance")["proposed_val"]), 0.2)
        self.assertGreaterEqual(float(self._diff(audit, "brim_object_gap")["proposed_val"]), 0.1)
        ids = {c["id"] for c in audit["diagnostic_cards"]}
        self.assertIn("card_petg_drying", ids)
        self.assertIn("card_material_mismatch", ids)

    def test_petg_on_cool_plate_suggests_switch(self):
        cfg = {"filament_settings_id": ["Bambu PETG HF @BBL A1"], "filament_type": ["PETG"], "curr_bed_type": "Cool Plate"}
        audit = build_baseline_audit(_telemetry(cfg), "Bambu Lab A1 0.4 nozzle", "PETG HF")
        self.assertIn("SWITCH_BED_PLATE", {c["action_type"] for c in audit["diagnostic_cards"]})
        self.assertEqual(self._diff(audit, "textured_plate_temp_initial_layer")["proposed_val"], "70")

    def test_smooth_pei_uses_hot_plate_key(self):
        cfg = {"filament_settings_id": ["Bambu PETG HF @BBL A1"], "filament_type": ["PETG"], "curr_bed_type": "High Temp Plate"}
        audit = build_baseline_audit(_telemetry(cfg), "Bambu Lab A1 0.4 nozzle", "PETG HF")
        self.assertEqual(self._diff(audit, "hot_plate_temp_initial_layer")["proposed_val"], "70")
        self.assertIn("card_petg_smooth_pei_glue", {c["id"] for c in audit["diagnostic_cards"]})

    def test_pla_on_enclosed_printer_gets_door_advice(self):
        audit = build_baseline_audit(_telemetry({}), "Bambu Lab P1S 0.4 nozzle", "PLA Basic")
        self.assertIn("card_pla_open_enclosure", {c["id"] for c in audit["diagnostic_cards"]})
        self.assertEqual(self._diff(audit, "textured_plate_temp_initial_layer")["proposed_val"], "55")


class NoVendorProfilesTests(unittest.TestCase):
    """Machines without Bambu Studio installed must not get false plate warnings."""

    def test_no_switch_plate_card_without_profiles(self):
        from unittest import mock

        import patcher

        with mock.patch.object(patcher, "get_system_baseline", return_value={}):
            audit = build_baseline_audit(_telemetry({"curr_bed_type": "Textured PEI Plate"}), "Bambu Lab A1 0.4 nozzle", "PLA Lite")
        actions = {c["action_type"] for c in audit["diagnostic_cards"]}
        self.assertNotIn("SWITCH_BED_PLATE", actions)
        self.assertFalse(any(s["key"].endswith("plate_temp_initial_layer") for s in audit["settings_diff"]))


class GuardTests(unittest.TestCase):
    PETG = {"min_support_top_z_distance": 0.2, "min_brim_object_gap": 0.1}

    def test_petg_floors(self):
        self.assertEqual(guard_material_value("support_top_z_distance", "0.1", self.PETG, {}), "0.2")
        self.assertEqual(guard_material_value("brim_object_gap", "0", self.PETG, {}), "0.1")

    def test_nozzle_clamped_to_vendor_range(self):
        vendor = {"nozzle_temperature_range_low": ["230"], "nozzle_temperature_range_high": ["270"]}
        self.assertEqual(guard_material_value("nozzle_temperature", "220", self.PETG, vendor), "230")

    def test_zero_bed_temp_dropped_when_vendor_supports_plate(self):
        vendor = {"textured_plate_temp_initial_layer": ["70"]}
        self.assertIsNone(guard_material_value("textured_plate_temp_initial_layer", "0", self.PETG, vendor))


if __name__ == "__main__":
    unittest.main()
