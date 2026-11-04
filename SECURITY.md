# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Local-First Privacy & Security Architecture

LayerZero Studio is designed with a **Local-First** architecture:

1. **Local 3MF Processing**: All `.3mf` archives, 3D triangle meshes, and slicer configuration files are unpacked and processed locally on your machine (`127.0.0.1:8000`) inside the user's application support storage directory.
2. **Bounded Session Storage**: Uploaded session files are sanitized against path traversal (`Path(filename).name`) and automatically pruned to keep disk usage bounded.
3. **Headless AI Agent Execution (`agy`)**:
   - When the user triggers AI analysis, `backend/agy_runner.py` invokes the local `agy` CLI subprocess with structured JSON schema enforcement (`backend/schemas/audit_schema.json`).
   - If `agy` is not installed on the system, LayerZero gracefully falls back to the deterministic mathematical NumPy Morphology Engine (`backend/patcher.py`) with zero external network calls.

## Reporting a Vulnerability

If you discover a security vulnerability in LayerZero Studio, please report it responsibly:

1. **Do not open a public GitHub issue** for sensitive security vulnerabilities.
2. Use GitHub's **Private Vulnerability Reporting** feature on the repository's **Security** tab, or email the maintainers at [hello@layerzero.io.vn](mailto:hello@layerzero.io.vn).
3. Include a clear description of the issue, steps to reproduce, and affected component (`backend/`, `frontend/`, `frontend/src-tauri/`, or `landing/`).

We aim to acknowledge security reports within **48 hours** and provide a remediation plan or patch within **7 days**.
