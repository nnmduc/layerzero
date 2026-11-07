"""
Snapmaker U1 support: printer catalog, bundled U1 presets, Bambu -> U1 project retargeting,
toolchanger cards and bed-slinger rule gating.

Run from `backend/`:  .venv/bin/python -m unittest discover -s tests -v
U1 tests use the bundled presets and always run; Bambu-baseline tests need Bambu Studio installed.
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from cross_vendor_config import build_cross_vendor_config  # noqa: E402
from filament_profiles import resolve_filament_preset, resolve_process_preset  # noqa: E402
from patcher import _fit_layer_heights, _set_application_tag, _target_application_tag, build_baseline_audit  # noqa: E402
from printer_catalog import (  # noqa: E402
    PRINTERS,
    load_snapmaker_u1_bundle,
    needs_cross_vendor_retarget,
    profiles_for,
    source_vendor_of,
)
from profiler import load_bbl_system_profiles, resolve_profile  # noqa: E402

U1 = "Snapmaker U1 (0.4 nozzle)"
U1_NOZZLES = [p for p in PRINTERS if p.startswith("Snapmaker U1")]

BAMBU_CFG = {
    "printer_settings_id": "Bambu Lab A1 0.4 nozzle",
    "printer_model": "Bambu Lab A1",
    "print_settings_id": "0.20mm Standard @BBL A1",
    "curr_bed_type": "Cool Plate",
    "filament_settings_id": ["Bambu PLA Basic @BBL A1", "Bambu Support for PLA/PETG @BBL A1", "Bambu PLA Basic @BBL A1"],
    "filament_type": ["PLA", "PLA-S", "PLA"],
    "filament_colour": ["#FFFFFF", "#000000", "#FF0000"],
    "filament_map": ["1", "1", "1"],
    "flush_volumes_matrix": ["0", "280", "280", "280", "0", "280", "280", "280", "0"],
    "layer_height": "0.12",
    "wall_loops": "3",
    "sparse_infill_density": "25%",
    "enable_support": "1",
    "wipe_tower_x": ["240"],
    "wipe_tower_y": ["250"],
    "version": "02.08.02.61",
}


def _telemetry(cfg: dict) -> dict:
    return {"project_settings": cfg, "objects": [], "plates": []}


class U1BundleTests(unittest.TestCase):
    def test_bundle_has_every_nozzle_machine_and_default_process(self):
        bundle = load_snapmaker_u1_bundle()
        self.assertEqual(bundle["source"]["release"], "v2.4.1")
        for printer in U1_NOZZLES:
            self.assertIn(printer, bundle["presets"])
            self.assertIn(bundle["default_process"][printer], bundle["presets"])

    def test_every_u1_filament_choice_resolves_to_a_compatible_preset(self):
        for printer in U1_NOZZLES:
            for key in ("PLA Lite", "PLA Basic", "PETG HF"):
                name = resolve_filament_preset(printer, key)
                compat = resolve_profile(name, profiles_for(printer)).get("compatible_printers", [])
                self.assertIn(printer, compat, f"{name} is not compatible with {printer}")

    def test_u1_process_matches_nozzle(self):
        self.assertEqual(resolve_process_preset(U1), "0.20mm Standard @Snapmaker U1 (0.4 nozzle)")
        self.assertIn("(0.8 nozzle)", resolve_process_preset("Snapmaker U1 (0.8 nozzle)"))


class VendorDetectionTests(unittest.TestCase):
    def test_source_vendor(self):
        self.assertEqual(source_vendor_of(BAMBU_CFG), "bbl")
        self.assertEqual(source_vendor_of({"printer_settings_id": U1}), "snapmaker")
        self.assertIsNone(source_vendor_of({}))

    def test_retarget_needed_only_across_vendors(self):
        self.assertTrue(needs_cross_vendor_retarget(BAMBU_CFG, U1))
        self.assertTrue(needs_cross_vendor_retarget({}, U1))  # STL / PrusaSlicer -> U1
        self.assertFalse(needs_cross_vendor_retarget(BAMBU_CFG, "Bambu Lab P1S 0.4 nozzle"))
        self.assertFalse(needs_cross_vendor_retarget({"printer_settings_id": U1}, "Snapmaker U1 (0.8 nozzle)"))


class CrossVendorConfigTests(unittest.TestCase):
    def setUp(self):
        self.cfg, self.plan, self.keys = build_cross_vendor_config(BAMBU_CFG, U1, "PLA Basic")

    def test_identity_is_u1_system_presets(self):
        cfg = self.cfg
        self.assertEqual(cfg["printer_settings_id"], U1)
        self.assertEqual(cfg["printer_model"], "Snapmaker U1")
        self.assertEqual(cfg["print_settings_id"], "0.20mm Standard @Snapmaker U1 (0.4 nozzle)")
        presets = profiles_for(U1)
        for name in [cfg["print_settings_id"], *cfg["filament_settings_id"]]:
            self.assertIn(name, presets)
        self.assertEqual(cfg["version"], "2.4.1")

    def test_support_slot_gets_u1_support_preset_and_slot_order_is_kept(self):
        ids = self.cfg["filament_settings_id"]
        self.assertEqual(len(ids), 4)  # one per U1 toolhead; the unused 4th repeats slot 1
        self.assertIn("Support", ids[1])
        self.assertEqual(ids[3], ids[0])
        self.assertEqual(self.cfg["filament_colour"][:3], BAMBU_CFG["filament_colour"])
        self.assertEqual(self.plan, {0: "PLA Basic", 2: "PLA Basic"})

    def test_toolchanger_machine_keys_and_no_ams_keys(self):
        cfg = self.cfg
        self.assertEqual(cfg["machine_tool_change_time"], "5")
        self.assertEqual(len(cfg["nozzle_diameter"]), 4)
        self.assertEqual(len(cfg["retract_length_toolchange"]), 4)
        self.assertEqual(cfg["gcode_flavor"], "klipper")
        self.assertNotIn("filament_map", cfg)
        self.assertEqual(cfg["flush_volumes_matrix"], ["0"] * 16)
        self.assertEqual(cfg["enable_prime_tower"], "1")
        self.assertEqual(len(cfg["filament_type"]), 4)
        self.assertEqual(len(cfg["filament_diameter"]), 4)  # the slicer counts filaments from this key
        self.assertEqual(len(cfg["different_settings_to_system"]), 4 + 2)

    def test_author_model_choices_are_kept_and_plate_mapped(self):
        cfg = self.cfg
        self.assertEqual((cfg["layer_height"], cfg["wall_loops"], cfg["sparse_infill_density"]), ("0.12", "3", "25%"))
        self.assertEqual(cfg["curr_bed_type"], "Textured PEI Plate")  # U1 has no Cool Plate

    def test_prime_tower_is_moved_inside_the_u1_bed(self):
        self.assertLessEqual(float(self.cfg["wipe_tower_x"][0]), 270 - 30)
        self.assertLessEqual(float(self.cfg["wipe_tower_y"][0]), 271 - 30)

    def test_layer_height_outside_small_nozzle_range_falls_back_to_preset(self):
        cfg, _, _ = build_cross_vendor_config({**BAMBU_CFG, "layer_height": "0.28"}, "Snapmaker U1 (0.2 nozzle)", "PLA Basic")
        self.assertLessEqual(float(cfg["layer_height"]), 0.14)

    def test_single_filament_disables_prime_tower(self):
        cfg, _, _ = build_cross_vendor_config({}, U1, "PETG HF")
        self.assertEqual(cfg["enable_prime_tower"], "0")  # one colour used, even with 4 toolhead slots
        self.assertEqual(cfg["filament_settings_id"], ["Generic PETG HF"] * 4)


class ToolchangerCardTests(unittest.TestCase):
    def _cards(self, cfg: dict, printer: str = U1) -> set[str]:
        return {c["id"] for c in build_baseline_audit(_telemetry(cfg), printer, "PLA Basic")["diagnostic_cards"]}

    def test_more_than_four_filaments_warns(self):
        cfg = {**BAMBU_CFG, "filament_settings_id": ["Bambu PLA Basic @BBL A1"] * 6, "filament_type": ["PLA"] * 6,
               "filament_colour": ["#FFFFFF"] * 6}
        cards = self._cards(cfg)
        self.assertIn("card_tool_limit", cards)
        self.assertIn("card_cross_vendor_retarget", cards)
        self.assertIn("card_tool_offset_calibration", cards)

    def test_abs_needs_top_cover(self):
        cfg = {**BAMBU_CFG, "filament_settings_id": ["Bambu ABS @BBL A1"], "filament_type": ["ABS"]}
        self.assertIn("card_top_cover_required", self._cards(cfg))

    def test_bambu_target_gets_no_toolchanger_cards(self):
        cards = self._cards(BAMBU_CFG, "Bambu Lab A1 0.4 nozzle")
        self.assertFalse(cards & {"card_tool_limit", "card_tool_offset_calibration", "card_cross_vendor_retarget"})


class KinematicsGatingTests(unittest.TestCase):
    TALL = {"id": "1", "name": "tower", "morphology_flags": ["Y_AXIS_INERTIA_TALL"], "size_mm": [10, 10, 150],
            "footprint_l1_mm": 10, "metrics": {}}

    def _audit(self, printer: str) -> dict:
        return build_baseline_audit({"project_settings": {}, "objects": [self.TALL], "plates": []}, printer, "PLA Basic")

    def test_corexy_printers_get_no_bed_slinger_advice(self):
        for printer in ("Bambu Lab P1S 0.4 nozzle", "Bambu Lab X1 Carbon 0.4 nozzle", U1):
            audit = self._audit(printer)
            self.assertFalse(any(s["key"] == "default_acceleration" for s in audit["settings_diff"]), printer)
            self.assertFalse(any(c["action_type"] == "ROTATE_YAW" for c in audit["diagnostic_cards"]), printer)

    def test_bed_slingers_keep_it(self):
        audit = self._audit("Bambu Lab A1 0.4 nozzle")
        self.assertTrue(any(s["key"] == "default_acceleration" for s in audit["settings_diff"]))
        self.assertTrue(any(c["action_type"] == "ROTATE_YAW" for c in audit["diagnostic_cards"]))

    def test_fine_layer_proposal_scales_with_nozzle(self):
        def fine(printer):
            return next(s["proposed_val"] for s in self._audit(printer)["settings_diff"] if s["key"] == "layer_height")
        self.assertEqual(fine("Snapmaker U1 (0.2 nozzle)"), "0.08")
        self.assertEqual(fine(U1), "0.16")


class ProjectMetadataTests(unittest.TestCase):
    MODEL = b'<model><metadata name="Application">BambuStudio-02.08.02.61</metadata></model>'

    def test_u1_projects_claim_snapmaker_orca(self):
        tag = _target_application_tag(U1, self.MODEL)
        self.assertEqual(tag, "Snapmaker_Orca-2.4.1")
        self.assertIn(b"Snapmaker_Orca-2.4.1", _set_application_tag(self.MODEL, tag))

    def test_bambu_projects_keep_a_bambu_studio_tag(self):
        self.assertEqual(_target_application_tag("Bambu Lab A1 0.4 nozzle", self.MODEL), "BambuStudio-02.08.02.61")
        orca = b'<metadata name="Application">Snapmaker_Orca-2.4.1</metadata>'
        self.assertTrue(_target_application_tag("Bambu Lab A1 0.4 nozzle", orca).startswith("BambuStudio-"))

    def test_layer_heights_are_clamped_to_nozzle_range(self):
        cfg = {"min_layer_height": ["0.04"] * 4, "max_layer_height": ["0.14"] * 4, "layer_height": "0.16"}
        _fit_layer_heights(cfg)
        self.assertEqual(cfg["layer_height"], "0.14")


@unittest.skipUnless(load_bbl_system_profiles(), "Bambu Studio system profiles not installed")
class U1ToBambuTests(unittest.TestCase):
    def test_u1_project_converts_back_to_bambu(self):
        u1_cfg, _, _ = build_cross_vendor_config(BAMBU_CFG, U1, "PLA Basic")
        cfg, _, _ = build_cross_vendor_config(u1_cfg, "Bambu Lab A1 0.4 nozzle", "PLA Basic")
        self.assertEqual(cfg["printer_settings_id"], "Bambu Lab A1 0.4 nozzle")
        self.assertEqual(cfg["filament_map"], ["1"] * 4)  # the U1 project carried 4 toolhead slots
        self.assertTrue(cfg["version"].startswith("02."))
        self.assertIn("280", cfg["flush_volumes_matrix"])


if __name__ == "__main__":
    unittest.main()


class DifferentSettingsTests(unittest.TestCase):
    """Slicers reset every key not listed in `different_settings_to_system` to the system value on load."""

    def test_layerzero_edits_are_listed_so_the_slicer_keeps_them(self):
        from cross_vendor_config import refresh_different_settings_to_system

        cfg, _, _ = build_cross_vendor_config(BAMBU_CFG, U1, "PLA Basic")
        cfg["z_hop"] = ["0.8"] * 4  # machine key
        cfg["nozzle_temperature"] = ["225", cfg["nozzle_temperature"][1], "225"]  # filament key, slots 0 and 2
        cfg["wall_loops"] = "4"  # process key
        cfg["brim_type"] = "outer_only"  # key no preset defines
        refresh_different_settings_to_system(cfg, U1)
        diff = cfg["different_settings_to_system"]
        self.assertIn("wall_loops", diff[0].split(";"))
        self.assertIn("brim_type", diff[0].split(";"))  # no U1 preset defines it: always listed
        self.assertIn("nozzle_temperature", diff[1].split(";"))
        self.assertNotIn("nozzle_temperature", diff[2].split(";"))
        self.assertIn("z_hop", diff[-1].split(";"))

    def test_unknown_presets_keep_the_author_entry(self):
        from cross_vendor_config import refresh_different_settings_to_system

        cfg = {"print_settings_id": "Nope", "printer_settings_id": "Nope", "filament_settings_id": ["Nope"],
               "different_settings_to_system": ["a;b", "c", "d"]}
        refresh_different_settings_to_system(cfg, U1)
        self.assertEqual(cfg["different_settings_to_system"], ["a;b", "c", "d"])


class LaunchGuardTests(unittest.TestCase):
    """Without Snapmaker Orca, a U1 project must be revealed, never handed to the default .3mf app."""

    def test_missing_snapmaker_orca_reveals_instead_of_opening(self):
        import tempfile
        from unittest import mock

        import main

        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "model.3mf"
            src.write_bytes(b"")
            main.SESSIONS["t"] = {"path": src, "telemetry": _telemetry({})}
            calls = []
            fake = {"output_filename": "x.3mf", "output_path": str(src), "applied_summary": []}
            with mock.patch.object(main, "apply_3mf_optimizations", return_value=fake), \
                 mock.patch.object(main.Path, "home", return_value=Path(tmp)), \
                 mock.patch.object(main, "slicer_installed", return_value=False), \
                 mock.patch.object(main, "open_in_slicer", lambda *a: calls.append("open")), \
                 mock.patch.object(main, "reveal_in_file_manager", lambda *a: calls.append("reveal")):
                res = main.apply_and_export(main.ApplyRequest(
                    session_id="t", diagnostic_cards=[], settings_diff=[], printer_preset=U1, open_in_slicer=True))
            main.SESSIONS.pop("t", None)
        self.assertEqual(calls, ["reveal"])
        self.assertFalse(res["opened_in_slicer"])


def _obj(oid: str, x: float, y: float, flags: list[str], size=(20.0, 20.0, 20.0)) -> dict:
    return {"id": oid, "name": f"part{oid}", "world_pos": [x, y, 0.0], "size_mm": list(size),
            "morphology_flags": flags, "footprint_l1_mm": [5, 5], "metrics": {"base_blockers_z8": 0, "bridge_area_mm2": 0}}


class SupportCradleTargetTests(unittest.TestCase):
    """Cradles only on weak-base parts with room around them, so tree supports never reach a neighbour."""

    def test_only_weak_base_parts_with_clearance_get_a_cradle(self):
        from support_cradle_targets import support_cradle_object_ids

        objs = [
            _obj("1", 50, 50, ["PINPOINT_BALL_BASE"]),           # isolated weak base -> cradle
            _obj("2", 150, 50, ["UNSUPPORTED_HORIZONTAL_BRIDGE"]),  # no weak base -> none
            _obj("3", 50, 150, ["MISSING_BASE_SUPPORTS"]),         # 7 mm from part 4 -> skipped
            _obj("4", 77, 150, []),
            _obj("5", 150, 150, ["PINPOINT_BALL_BASE", "SLOTTED_OR_SMALL_SCREW"]),  # screw -> none
        ]
        tel = {"objects": objs, "plates": [{"id": "1", "object_ids": [o["id"] for o in objs]}]}
        self.assertEqual(support_cradle_object_ids(tel), {"1"})

    def test_parts_on_other_plates_do_not_count_as_neighbours(self):
        from support_cradle_targets import support_cradle_object_ids

        objs = [_obj("1", 50, 50, ["PINPOINT_BALL_BASE"]), _obj("2", 55, 50, [])]
        tel = {"objects": objs, "plates": [{"id": "1", "object_ids": ["1"]}, {"id": "2", "object_ids": ["2"]}]}
        self.assertEqual(support_cradle_object_ids(tel), {"1"})


class BuildVolumeTests(unittest.TestCase):
    U1_MACHINE = {"printable_area": ["0.5x1", "270.5x1", "270.5x271", "0.5x271"], "printable_height": "270.05"}

    def test_too_tall_and_too_wide_parts_are_flagged(self):
        from build_volume_cards import build_volume_cards, oversized_objects

        tall = _obj("1", 100, 100, [], size=(185, 185, 332))
        wide = _obj("2", 100, 100, [], size=(280, 50, 10))
        ok = _obj("3", 100, 100, [], size=(260, 200, 260))
        self.assertEqual([o["id"] for o in oversized_objects([tall, wide, ok], self.U1_MACHINE)], ["1", "2"])
        cards = build_volume_cards([tall, ok], U1, self.U1_MACHINE)
        self.assertEqual([c["id"] for c in cards], ["card_exceeds_build_volume"])

    def test_no_card_without_vendor_profile(self):
        from build_volume_cards import build_volume_cards

        self.assertEqual(build_volume_cards([_obj("1", 0, 0, [], size=(999, 999, 999))], U1, {}), [])
