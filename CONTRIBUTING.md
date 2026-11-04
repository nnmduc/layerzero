# Contributing to LayerZero Studio

Thank you for your interest in contributing to **LayerZero Studio**! Whether you are fixing a bug, adding support for a new 3D printer/filament preset, refining a 3D morphology rule, or improving the UI, your contributions are warmly welcomed.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Architecture Overview](#project-architecture-overview)
4. [How to Add New Morphology Rules or Actions](#how-to-add-new-morphology-rules-or-actions)
5. [How to Add Printer or Filament Presets](#how-to-add-printer-or-filament-presets)
6. [Coding Standards & Verification](#coding-standards--verification)
7. [Pull Request Process](#pull-request-process)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Development Environment Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/<your-username>/layerzero.git
   cd layerzero
   ```

2. **Start the Development Stack**:
   ```bash
   ./start.sh
   ```
   This script sets up `backend/.venv`, installs Python dependencies from `backend/requirements.txt`, installs Node packages in `frontend/`, and runs both the FastAPI server (`http://127.0.0.1:8000`) and Vite dev server (`http://localhost:5173`).

3. **Working on the Landing Page (Optional)**:
   ```bash
   cd landing
   npm install
   npm run dev
   ```

---

## Project Architecture Overview

- **`backend/profiler.py`**: Parses `.3mf` files (both Bambu Studio multi-file component archives and standard single-file inline meshes) into NumPy arrays, applies 12-float world transforms, and computes surface topology metrics and `morphology_flags`.
- **`backend/patcher.py`**: Synthesizes deterministic diagnostic cards (`build_baseline_audit`) and applies user-approved modifications (`apply_3mf_optimizations`) back into a valid `.3mf` archive.
- **`backend/agy_runner.py`**: Streams headless `agy` AI analysis via Server-Sent Events (SSE) using `backend/schemas/audit_schema.json`.
- **`frontend/src/`**: React 18 + TypeScript + Tailwind CSS 3-pane Studio interface with a custom Three.js slicer viewport (`Viewport3D.tsx`).

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete technical specifications.

---

## How to Add New Morphology Rules or Actions

If you want to teach LayerZero to detect and fix a new 3D printing failure mode:

1. **Detect the Geometry Pattern (`backend/profiler.py`)**:
   - In `_analyze_mesh_arrays()`, compute your geometric metric using vectorized NumPy operations on `verts`, `tris`, `normals`, and `tri_areas`.
   - Append a descriptive flag to `morphology_flags` (e.g., `"THIN_CANTILEVER_ARM"`).
2. **Register the Action Type (`backend/schemas/audit_schema.json` & `frontend/src/types.ts`)**:
   - Add the new `action_type` enum to `backend/schemas/audit_schema.json` and `DiagnosticCard['action_type']` in `frontend/src/types.ts`.
3. **Synthesize & Patch (`backend/patcher.py`)**:
   - Add a baseline diagnostic card in `build_baseline_audit()`.
   - Implement the mesh or XML metadata transformation in `apply_3mf_optimizations()`.

---

## How to Add Printer or Filament Presets

1. In `frontend/src/App.tsx`, add the `<option>` to the Printer or Filament `<select>` in the top navigation bar.
2. Ensure the preset name matches the Bambu Studio / OrcaSlicer system profile JSON name (or provide fallback defaults in `backend/patcher.py`).

---

## Coding Standards & Verification

Before opening a Pull Request, please verify that all components compile and pass checks cleanly:

### Python Backend
- Target **Python 3.12+** with full type annotations (`dict[str, Any]`, `list[str]`, `Path`).
- Verify syntax and imports:
  ```bash
  cd backend
  ./.venv/bin/python -m py_compile main.py profiler.py patcher.py agy_runner.py
  ```

### TypeScript Frontends (`frontend/` & `landing/`)
- Ensure zero TypeScript or Vite build errors:
  ```bash
  cd frontend && npm run build
  cd ../landing && npm run build
  ```

### Rust / Tauri Desktop (`frontend/src-tauri/`)
- If modifying `src-tauri/`, ensure `cargo check` passes:
  ```bash
  cd frontend/src-tauri && cargo check
  ```

---

## Pull Request Process

1. Create a feature branch (`git checkout -b feat/your-feature-name` or `fix/issue-description`).
2. Keep commits focused and write clear commit messages.
3. Never commit temporary `.3mf` files in `backend/storage/`, compiled PyInstaller binaries, `.dmg` installers, or personal signing certificates.
4. Fill out the Pull Request template explaining the problem, solution, and verification steps.
