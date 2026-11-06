# LayerZero Studio — Architecture & Technical Specification

This document provides an in-depth technical reference for contributors and engineers working on **LayerZero Studio**.

---

## 1. High-Level Pipeline

LayerZero Studio operates in a **3-Stage Interactive Workflow**:

1. **Stage 1 — Instant 3D Morphology Profiling (`POST /api/upload` or `POST /api/load-local`)**:
   - Unpacks the `.3mf` ZIP archive in memory.
   - Extracts all 3D objects, applies their 3MF affine transformation matrices, computes vectorized surface topology metrics via NumPy, and returns compact indexed mesh buffers (`vertices`, `indices`, `vertex_zones`, `vertex_extruders`, `filament_colours`) for immediate rendering in the Three.js WebGL viewport.
   - Generates a deterministic baseline audit report (`build_baseline_audit`) used both as structured context for the AI agent and as an instant offline fallback.

2. **Stage 2 — Unleashed Multi-CLI Headless AI Audit (`GET /api/analyze/{session_id}?agent=claude|agy|engine`)**:
   - Detects available AI CLIs on the system (`claude` / `claude-code`, `agy`) and allows the user to switch dynamically.
   - Spawns either:
     - `claude -p <prompt> --dangerously-skip-permissions --output-format stream-json --verbose --json-schema <audit_schema.json>`
     - `agy -p <prompt> --dangerously-skip-permissions --output-format stream-json --json-schema <audit_schema.json>`
     - Morphology Rule Engine (100% offline fallback)
   - Streams real-time Server-Sent Events (`type: "log" | "status" | "complete"`) to the frontend Dynamic Island and Live Terminal Drawer.
   - Validates the structured JSON response containing `diagnostic_cards` and `settings_diff`.

3. **Stage 3 — Non-Destructive `.3mf` Patching & Export (`POST /api/apply`)**:
   - Clones the original `.3mf` archive and applies **only** the user-approved `diagnostic_cards` and `settings_diff` items.
   - Preserves multi-color AMS filament slots, flush matrices, prime tower settings, and build plate exclusion zones.
   - Writes `<stem>_LayerZero_Optimized.3mf` and optionally opens it directly in Bambu Studio.

---

## 2. Universal `.3mf` Parsing & World-Space Math (`backend/profiler.py`)

### 2.1 Dual `.3mf` Format Support

The 3MF specification allows two distinct ways of storing object meshes, both of which LayerZero supports natively:

1. **Bambu Studio / OrcaSlicer Production Extension**:
   - `3D/3dmodel.model` defines top-level `<object id="N">` assembly containers that reference external sub-models via `<component p:path="/3D/Objects/object_N.model" objectid="M" transform="..."/>`.
   - Each `3D/Objects/*.model` file contains one or more `<object id="M" type="model"><mesh>...</mesh></object>` blocks. Non-printable modifier meshes (`type="other"`) are automatically filtered out.
2. **Standard / PrusaSlicer / Cura Single-File `.3mf`**:
   - `3D/3dmodel.model` embeds `<mesh><vertices>...</vertices><triangles>...</triangles></mesh>` directly inside `<object id="N">`.

### 2.2 12-Float Affine Matrix Transformation & Winding Correction

In 3MF, both `<component transform="...">` and `<build><item transform="..."/>` use a 12-float string:
`m00 m01 m02 m10 m11 m12 m20 m21 m22 tx ty tz`

`profiler.py` applies the component transform followed by the build-item transform:

```python
mat = np.array([
    [tf[0], tf[3], tf[6]],
    [tf[1], tf[4], tf[7]],
    [tf[2], tf[5], tf[8]],
], dtype=np.float32)
trans = np.array([tf[9], tf[10], tf[11]], dtype=np.float32)
verts_world = verts @ mat + trans
```

If an object was mirrored in the slicer, the $3 \times 3$ rotation-scale matrix has a **negative determinant** ($\det(M_c M_i) < 0$), which inverts triangle winding and causes surface normals to point inward. LayerZero detects $\det < 0$ and swaps columns `[0, 2, 1]` of the triangle index array so outward normals remain mathematically exact.

### 2.3 Vectorized Surface Topology Zones

For every triangle with unit normal $\vec{n} = (n_x, n_y, n_z)$, relative height $z_{\text{rel}} = z - z_{\min}$, and normalized height $z_{\text{ratio}} = z_{\text{rel}} / \Delta Z$:

| Zone ID | Name | Mathematical Condition | Visual Highlight in Viewport |
| :---: | :--- | :--- | :--- |
| `0` | Standard Surface | Default | Filament Palette Color or Matte Slate |
| `1` | Author Support Enforcer | `paint_supports` contains `"4"` | Royal Blue (`#0071E3`) in Support Mode |
| `2` | Author Support Blocker | `paint_supports` contains `"8"` | Coral Red (`#FF3B30`) in Support Mode |
| `3` | Flat Horizontal Top | $z_{\text{ratio}} \ge 0.60 \land n_z \ge 0.992$ | Cyan (`#30B0C7`) in Surface Mode |
| `4` | Domed Curvature Top | $z_{\text{ratio}} \ge 0.55 \land 0.68 \le n_z < 0.985$ | Indigo (`#5856D6`) in Surface Mode |
| `5` | Steep Base Overhang | $z_{\text{rel}} \le 8.0\text{ mm} \land n_z < -0.50$ | Royal Blue (`#0071E3`) in Support Mode |

Additionally, vertices at $z_{\text{rel}} \le 0.24\text{ mm}$ are highlighted in **Emerald Green** (`#28CD41`) to show the true Layer 1 build plate contact footprint.

---

## 3. Non-Destructive `.3mf` Patching (`backend/patcher.py`)

### 3.1 Multi-Color AMS Preservation & Per-Slot Filament Merge (`backend/slicer_config_merge.py`)

`build_patched_config()` merges vendor baselines into `Metadata/project_settings.config` in two passes:

1. **Machine + process keys** come from the printer preset and the process preset resolved for that printer (e.g. `0.16mm Optimal @BBL X1C` for a P1S). `PRESERVE_ORIG_KEYS` (`filament_colour`, `flush_volumes_matrix`, `enable_prime_tower`, `filament_map`, `curr_bed_type`, ...) are never wiped. When the printer differs from the author's `printer_settings_id`, bed geometry (`printable_area`, `printable_height`, `bed_exclude_area`) is taken from the new machine.
2. **Filament keys are written per AMS slot.** `plan_slot_filaments()` decides which slots are retargeted: by default only slots in the same material group as the main body (PLA and PLA Lite form one group). Support and interface slots and other materials keep the author's values, so a PLA body with a *Support for PLA/PETG* interface is never rewritten to PLA temperatures. Each retargeted slot takes values from its own resolved vendor preset, and `filament_settings_id` is updated only for those slots.

Later edits go through `set_filament_key()`, which writes only to the retargeted slots for per-filament keys. Per-extruder-variant lists (e.g. X1C's 2-entry lists for one slot) are rewritten only when every slot is retargeted.

### 3.2 Printer, Filament & Plate Resolution (`backend/filament_profiles.py`)

- `resolve_filament_preset(printer, "PLA Basic")` returns the shortest instantiable preset named `Bambu PLA Basic @...` whose `compatible_printers` includes the printer. If Bambu Studio's profiles are missing, it falls back to a static suffix per printer.
- `bed_type_of()` maps `curr_bed_type` (`Textured PEI Plate`, `High Temp Plate`, `Cool Plate`, `Engineering Plate`, `Supertack Plate`) to the vendor temperature key prefix. A vendor value of `0` means the plate is unsupported for that filament, which raises a `SWITCH_BED_PLATE` card.
- `MATERIAL_POLICIES` holds the material deltas on top of vendor values (support Z gap, interface spacing, brim gap, Z-hop type, ironing flow/speed, overhang fan, weak layer adhesion). `patcher.guard_material_value()` enforces the floors again at export, so values from the AI agent cannot break them.
- `material_advice_cards.py` adds cards the slicer cannot apply (dry PETG, glue on Smooth PEI, open the door for PLA on enclosed printers, material mismatch with the author's file).

### 3.3 Direct Mesh Clamping (`FLATTEN_BOTTOM`)

When `FLATTEN_BOTTOM` is approved with cut height $\Delta z$ (e.g., $0.80\text{ mm}$):
1. All vertices in the target object with $z < z_{\min} + \Delta z$ are clamped to $z_{\min} + \Delta z$.
2. Every vertex $z$ is shifted by $-\Delta z / 2$, and the object's `<item transform>`, `<assemble_item transform>`, and `source_offset_z` metadata are shifted by $-\Delta z / 2$ so the new flat base rests flush on the build plate at $Z = 0$ in Bambu Studio.
3. Any `paint_supports` attributes on the newly flattened bottom contact triangles ($z_{\text{avg}} < \Delta z + 0.05\text{ mm}$) are stripped.

---

## 4. Three.js WebGL Slicer Viewport (`frontend/src/components/Viewport3D.tsx`)

- **Right-Handed Coordinate Mapping**: Slicer space is $Z$-up ($X$ right, $Y$ back, $Z$ up), whereas Three.js is $Y$-up ($X$ right, $Y$ up, $Z$ front). `Viewport3D.tsx` maps $(v_x, v_y, v_z) \mapsto (v_x, v_z, -v_y)$, which has determinant $+1$ and preserves triangle winding.
- **Single-Sided Build Plate (`THREE.FrontSide`)**: The PEI build plate plane normal points strictly $+Y$. When the user orbits the camera below the bed ($Y < 0$) or selects **Under-Bed X-Ray Mode**, back-face culling makes the plate transparent from underneath while keeping the grid visible for spatial reference.
- **Camera Headlamp Lighting**: Two directional lights (`headLight` and `headFill`) are parented to the `THREE.PerspectiveCamera` so facet shading (`flatShading: true`) remains high-contrast from any viewing angle.

---

## 5. Tauri v2 Desktop & Cross-Platform Python Sidecar Lifecycle (`frontend/src-tauri/src/main.rs`)

LayerZero Studio supports **macOS** (`.app` / `.dmg`), **Windows** (`.exe` NSIS / `.msi`), and **Linux** (`.AppImage` / `.deb`):

1. **Startup & Sidecar Resolution**:
   - On startup, the Rust binary checks if TCP port `8000` is already bound (`is_port_in_use(8000)`).
   - If not bound, it locates the bundled PyInstaller binary (`layerzero-backend` on macOS/Linux or `layerzero-backend.exe` on Windows next to the executable in production bundles, or `src-tauri/binaries/layerzero-backend-<target-triple>` in `tauri dev` mode).
   - On Unix (macOS & Linux), it spawns the sidecar in its own process group (`cmd.process_group(0)`). On Windows, it spawns the sidecar with `CREATE_NO_WINDOW` (`0x08000000`) so no console window flashes on screen.
2. **OS-Aware Storage & Bambu Studio Integration (`backend/main.py` & `backend/profiler.py`)**:
   - **Session Storage**: `~/Library/Application Support/LayerZero/storage` (macOS), `%LOCALAPPDATA%\LayerZero\storage` (Windows), or `~/.local/share/layerzero/storage` (Linux).
   - **Bambu Studio System Profiles**: Automatically resolves `BBL` system JSON profiles across macOS (`~/Library/Application Support/BambuStudio`), Windows (`%APPDATA%\BambuStudio`), and Linux (`~/.config/BambuStudio` or Flatpak `~/.var/app/com.bambulab.BambuStudio`).
   - **1-Click Launch & File Manager Reveal**: Uses `open -a BambuStudio` / `open -R` on macOS, `os.startfile` / `explorer /select` on Windows, and `xdg-open` on Linux.
3. **Clean Process Tree Termination (`kill_sidecar`)**:
   - When the user quits the desktop app (`RunEvent::Exit`), `kill_sidecar` sends `SIGTERM` to the entire Unix process group (`-pid`) on macOS/Linux or invokes `taskkill /F /T /PID <pid>` on Windows, ensuring both the PyInstaller bootloader and child Uvicorn worker processes exit cleanly without leaving orphan processes on port `8000`.
