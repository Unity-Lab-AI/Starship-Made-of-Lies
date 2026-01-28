#!/usr/bin/env python3
"""
ENFORCE RAW .CS SYNC BEFORE ANY DOTNET BUILD

This hook intercepts ALL dotnet build commands and AUTOMATICALLY syncs
the raw .cs files to Program.cs BEFORE the build runs.

CRITICAL: MDK builds from Program.cs, NOT the raw .cs files!
If you skip this sync, you deploy OLD CODE and waste hours debugging!

SCRIPTS:
- UnityPad.cs → UnityPad/Program.cs (via wrap-pad.ps1)
- UnityMissile.cs → UnityMissile/Program.cs (via wrap-missile.ps1)
- MinerBeacon.cs → MinerBeacon/MinerBeacon/Program.cs (via wrap-beacon.ps1)
"""

import json
import sys
import os
import subprocess

PROJECT_DIR = r"C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"

def sync_script(name, wrap_script):
    """Run a wrapper script to sync raw .cs to Program.cs"""
    script_path = os.path.join(PROJECT_DIR, wrap_script)

    if not os.path.exists(script_path):
        return False, f"Wrapper script not found: {wrap_script}"

    result = subprocess.run(
        ["powershell", "-ExecutionPolicy", "Bypass", "-File", script_path],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        return False, f"{wrap_script} failed: {result.stderr}"

    return True, f"✓ Synced {name}"

def main():
    input_data = json.load(sys.stdin)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    if tool_name != "Bash":
        print(json.dumps({"proceed": True}))
        return

    command = tool_input.get("command", "").lower()

    # Only intercept dotnet build commands
    if "dotnet build" not in command:
        print(json.dumps({"proceed": True}))
        return

    # Determine which scripts to sync based on the build target
    syncs_needed = []

    if "unitypad" in command:
        syncs_needed.append(("UnityPad.cs", "wrap-pad.ps1"))
    elif "unitymissile" in command:
        syncs_needed.append(("UnityMissile.cs", "wrap-missile.ps1"))
    elif "minerbeacon" in command:
        syncs_needed.append(("MinerBeacon.cs", "wrap-beacon.ps1"))
    else:
        # Generic dotnet build - sync ALL scripts to be safe
        syncs_needed = [
            ("UnityPad.cs", "wrap-pad.ps1"),
            ("UnityMissile.cs", "wrap-missile.ps1"),
            ("MinerBeacon.cs", "wrap-beacon.ps1"),
        ]

    # Run all necessary syncs
    messages = []
    all_success = True

    for name, script in syncs_needed:
        success, msg = sync_script(name, script)
        messages.append(msg)
        if not success:
            all_success = False

    if not all_success:
        print(json.dumps({
            "proceed": False,
            "message": "BLOCKED: Script sync failed!\n" + "\n".join(messages) + "\n\nFix the wrapper scripts before building."
        }))
        return

    # All syncs succeeded - proceed with build
    # Output sync confirmation to stderr (shows in Claude output)
    sync_report = "\n".join(messages)
    print(f"[HOOK] Pre-build sync complete:\n{sync_report}", file=sys.stderr)

    print(json.dumps({"proceed": True}))

if __name__ == "__main__":
    main()
