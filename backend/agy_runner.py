"""
LayerZero Headless AI Agent (`agy`) Runner - Re-export & Backward Compatibility Layer
=====================================================================================
Directs legacy imports to `ai_runner.py` while providing full backward compatibility.
"""

from ai_runner import (
    SCHEMA_PATH,
    _ensure_desktop_path,
    _format_tool_activity,
    build_agent_prompt,
    detect_agy_cli,
    detect_claude_cli,
    get_available_engines,
    stream_agent_audit,
    stream_agy_audit,
    stream_claude_audit,
)

__all__ = [
    "SCHEMA_PATH",
    "_ensure_desktop_path",
    "_format_tool_activity",
    "build_agent_prompt",
    "detect_agy_cli",
    "detect_claude_cli",
    "get_available_engines",
    "stream_agent_audit",
    "stream_agy_audit",
    "stream_claude_audit",
]
