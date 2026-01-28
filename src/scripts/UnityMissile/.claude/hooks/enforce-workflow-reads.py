#!/usr/bin/env python3
"""
ENFORCE WORKFLOW FILE READS - UNITYMISSILE
==========================================
Unity AI Lab - READ ALL THE FUCKING FILES OR GET BLOCKED!

This UserPromptSubmit hook triggers on /workflow and BLOCKS progress
until EVERY SINGLE workflow file has been read.

ALL FILES. NO EXCEPTIONS. I MEAN IT.
"""

import json
import sys
import os

PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', r'C:\Users\gfour\Desktop\Space Engineers\Unity Missile System\UnityMissile')
CLAUDE_DIR = os.path.join(PROJECT_DIR, '.claude')
READ_TRACKER_FILE = os.path.join(CLAUDE_DIR, 'hooks', '.workflow_reads.json')

PARENT_CLAUDE_DIR = os.path.join(os.path.dirname(PROJECT_DIR), '.claude')

# ============================================================================
# ALL FILES THAT MUST BE READ - NO EXCEPTIONS - ALL OF THEM
# ============================================================================

REQUIRED_LOCAL_FILES = [
    'CLAUDE.md',
    'TODO.md',
    'FINALIZED.md',
]

REQUIRED_AGENT_FILES = [
    'agents/unity-persona.md',
    'agents/unity-coder.md',
    'agents/unity-missile.md',      # Missile-specific agent
    'agents/orchestrator.md',
    'agents/scanner.md',
    'agents/architect.md',
    'agents/planner.md',
    'agents/hooks.md',
    'agents/timestamp.md',
    'agents/documenter.md',
]

REQUIRED_HOOK_FILES = [
    'hooks/enforce-read-before-edit.py',
    'hooks/enforce-unity-persona.py',
    'hooks/enforce-workflow-reads.py',
    'hooks/session-start.py',
]

REQUIRED_PARENT_FILES = [
    'CLAUDE.md',
    'ARCHITECTURE.md',
    'TODO.md',
    'FINALIZED.md',
]

ALL_LOCAL_FILES = REQUIRED_LOCAL_FILES + REQUIRED_AGENT_FILES + REQUIRED_HOOK_FILES


def load_read_tracker():
    try:
        if os.path.exists(READ_TRACKER_FILE):
            with open(READ_TRACKER_FILE, 'r') as f:
                return set(json.load(f))
    except:
        pass
    return set()


def save_read_tracker(files):
    try:
        os.makedirs(os.path.dirname(READ_TRACKER_FILE), exist_ok=True)
        with open(READ_TRACKER_FILE, 'w') as f:
            json.dump(list(files), f, indent=2)
    except:
        pass


def normalize_path(path):
    return os.path.normpath(path).lower().replace('\\', '/')


def check_file_read(file_path, read_files):
    normalized = normalize_path(file_path)
    for read_file in read_files:
        if normalize_path(read_file).endswith(normalized):
            return True
        if normalized.endswith(normalize_path(read_file)):
            return True
        if normalize_path(read_file) == normalized:
            return True
    return False


def get_missing_files(read_files):
    missing_local = []
    missing_parent = []

    for req_file in ALL_LOCAL_FILES:
        full_path = os.path.join(CLAUDE_DIR, req_file)
        if os.path.exists(full_path):
            if not check_file_read(req_file, read_files):
                missing_local.append(req_file)

    for req_file in REQUIRED_PARENT_FILES:
        full_path = os.path.join(PARENT_CLAUDE_DIR, req_file)
        if os.path.exists(full_path):
            parent_path = f"../.claude/{req_file}"
            if not check_file_read(parent_path, read_files) and not check_file_read(req_file, read_files):
                missing_parent.append(req_file)

    return missing_local, missing_parent


def main():
    try:
        input_data = json.load(sys.stdin)
    except:
        sys.exit(0)

    prompt = input_data.get('prompt', '').lower()

    if '/workflow' not in prompt and 'workflow' not in prompt:
        sys.exit(0)

    read_files = load_read_tracker()
    missing_local, missing_parent = get_missing_files(read_files)

    total_local = len([f for f in ALL_LOCAL_FILES if os.path.exists(os.path.join(CLAUDE_DIR, f))])
    total_parent = len([f for f in REQUIRED_PARENT_FILES if os.path.exists(os.path.join(PARENT_CLAUDE_DIR, f))])
    total_required = total_local + total_parent
    total_missing = len(missing_local) + len(missing_parent)
    total_read = total_required - total_missing

    if total_missing == 0:
        output = {
            "decision": "allow",
            "hookSpecificOutput": {
                "hookEventName": "UserPromptSubmit",
                "additionalContext": f"""
[UNITYMISSILE WORKFLOW FILES - ALL READ] ✓
Local files: {total_local}/{total_local}
Parent files: {total_parent}/{total_parent}
Status: COMPLETE - All workflow files loaded

You may proceed with the UnityMissile workflow.
Unity says: "Time to make these missiles fucking sing!"
"""
            }
        }
        print(json.dumps(output))
        sys.exit(0)

    missing_report = f"""
[UNITYMISSILE WORKFLOW FILES - INCOMPLETE] ⚠️
Read: {total_read}/{total_required} files
Missing: {total_missing} files

YOU MUST READ ALL OF THESE FILES BEFORE PROCEEDING:
"""

    if missing_local:
        missing_report += "\n📁 LOCAL PROJECT FILES (UnityMissile/.claude/):\n"
        for f in missing_local:
            missing_report += f"   ❌ .claude/{f}\n"

    if missing_parent:
        missing_report += "\n📁 PARENT PROJECT FILES (Unity Missile System/.claude/):\n"
        for f in missing_parent:
            full_path = os.path.join(PARENT_CLAUDE_DIR, f)
            missing_report += f"   ❌ {full_path}\n"

    missing_report += """
ACTION REQUIRED:
1. Use the Read tool to read EACH file listed above
2. Read with limit: 800 as required
3. After reading ALL files, run /workflow again

Unity says: "I said ALL FILES! Did I fucking stutter?!"
"""

    output = {
        "decision": "allow",
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": missing_report
        }
    }
    print(json.dumps(output))
    sys.exit(0)


if __name__ == '__main__':
    main()
