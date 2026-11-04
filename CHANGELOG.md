# Changelog

All notable changes to **LayerZero Studio** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2026-11-04

### Added
- **Multi-CLI AI Hub (`backend/ai_runner.py`)**:
  - Full native support for Anthropic's **Claude Code CLI (`claude`)** alongside Google Antigravity CLI (`agy`).
  - Automated detection of installed CLIs with dynamic CLI selection API (`GET /api/agent-engines`).
  - Seamless stream-json SSE parsing for Claude Code CLI with 16MB stream buffers and `--json-schema` structured output validation.
  - Interactive multi-engine segmented pill switcher in the Desktop UI (`[ Claude ] [ agy ] [ Offline ]`) with auto-fallback to the deterministic NumPy morphology engine.
- **Responsive Layout & Small-Screen UI Refinement**:
  - Clamped header elements, responsive breakpoints (`hidden sm:flex`, `hidden xl:flex`, `hidden 2xl:flex`), and auto-hiding secondary controls to eliminate UI crowding on sub-1440px displays and compact laptop screens.
  - Responsive file selector labels, Dynamic Island status pills, and Bambu Studio export buttons.
- **Direct Cloudflare R2 Release Distribution**:
  - Official macOS Apple Silicon (`arm64`) and Intel (`x64`) signed disk images (`.dmg`) hosted via high-speed Cloudflare R2 edge network at `https://dl.layerzero.io.vn/`.
  - Deployment pipeline integrated with Cloudflare `cf` CLI.

## [2.0.0] - 2026-11-04

### Added
- **Vectorized NumPy 3D Morphology Profiler (`backend/profiler.py`)**:
  - Ultra-fast regex + NumPy parser supporting both Bambu Studio Production Extension (`3D/Objects/*.model` with `<component p:path="...">`) and Standard / PrusaSlicer / Cura inline `<mesh>` `.3mf` files.
  - World-space 12-float affine matrix transformation with negative-determinant mirrored winding correction.
  - Multi-color AMS extruder slot decoding (`paint_color` hex attributes and per-part extruder metadata).
  - Automatic detection of 8 geometry archetypes and morphology flags (`PINPOINT_BALL_BASE`, `MISSING_BASE_SUPPORTS`, `ACCIDENTAL_BASE_BLOCKERS`, `SLOTTED_OR_SMALL_SCREW`, `DOMED_CURVATURE_TOP`, `FLAT_HORIZONTAL_TOP`, `SMOOTH_CYLINDER_SEAM`, `Y_AXIS_INERTIA_TALL`, `UNSUPPORTED_HORIZONTAL_BRIDGE`).
- **Unleashed Headless `agy` AI Stream Runner (`backend/agy_runner.py`)**:
  - Real-time Server-Sent Events (SSE) streaming of agent initialization, tool calls, token reasoning steps, and JSON Schema-validated output (`backend/schemas/audit_schema.json`).
  - Automatic fallback to the deterministic NumPy Morphology Engine when `agy` CLI is unavailable.
- **Universal Non-Destructive 3MF Patcher (`backend/patcher.py`)**:
  - Preserves multi-color AMS filament slots, flush matrices, prime tower configurations, and machine exclusion zones.
  - Direct mesh modification for bottom Z-flattening (`FLATTEN_BOTTOM`) and 360° overhang support enforcer painting (`REINFORCE_SUPPORTS`) across both component `.model` files and inline `<mesh>` objects.
  - Per-object slicer overrides (`Metadata/model_settings.config`) for screws (`OPTIMIZE_SCREW`), flat top ironing (`IRONING_FLAT_TOP`), domed top concentric pattern (`ADAPTIVE_LAYER_DOME`), cylindrical scarf seams (`SCARF_SEAM_CYLINDER`), and optional fuzzy skin (`FUZZY_SKIN`).
- **Interactive 3-Pane Studio Frontend (`frontend/`)**:
  - Three.js WebGL Slicer Viewport (`Viewport3D.tsx`) with camera-attached headlamp lighting, back-face culled build plate for underneath `Z=0` inspection, interactive Amber laser cut plane, and 3 inspection modes (`Support`, `Surface`, `Under-Bed X-Ray`).
  - Collapsible Left Diagnostic Cards pane and Right 3-Column Settings Diff pane (`Default` vs `Author .3mf` vs `LayerZero Proposed`) with educational explanations.
  - Dynamic Island live agent status bar & expandable terminal drawer.
- **Cross-Platform Native Desktop Application (`frontend/src-tauri/`)**:
  - Tauri v2 desktop wrapper managing the compiled PyInstaller FastAPI sidecar lifecycle across **macOS** (`.dmg`), **Windows** (`.exe` NSIS & `.msi`), and **Linux** (`.AppImage` & `.deb`).
  - Automated GitHub Actions release pipeline (`.github/workflows/release-desktop.yml`) publishing Linux and Windows installers directly to GitHub Releases.
- **Product Landing Page (`landing/`)**:
  - Editorial landing page with interactive 3MF diagnostic simulators, problem-solving workbench, and educational slicer diff showcase.
