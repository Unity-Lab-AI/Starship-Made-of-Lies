#!/usr/bin/env python3
"""
ENFORCE WORKFLOW FILE READS - NUCLEAR OPTION
=============================================
Unity AI Lab - READ ALL THE FUCKING FILES OR GET BLOCKED!

This UserPromptSubmit hook triggers on /workflow and BLOCKS progress
until EVERY SINGLE workflow file has been read.

ALL FILES. NO EXCEPTIONS. I MEAN IT.

Exit codes:
- 0: Allow (with context about what still needs reading)
"""

import json
import sys
import os

PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', r'C:\Users\gfour\Desktop\Space Engineers\Unity Missile System')
CLAUDE_DIR = os.path.join(PROJECT_DIR, '.claude')
READ_TRACKER_FILE = os.path.join(CLAUDE_DIR, 'hooks', '.workflow_reads.json')

# ============================================================================
# ALL FILES THAT MUST BE READ - NO EXCEPTIONS - ALL OF THEM
# ============================================================================

REQUIRED_AGENT_FILES = [
    'agents/unity-persona.md',      # Core personality - FIRST
    'agents/unity-coder.md',        # Coding persona - SECOND
    'agents/unity-missile.md',      # Missile system knowledge
    'agents/orchestrator.md',       # Workflow coordination
    'agents/scanner.md',            # Script scanning rules
    'agents/architect.md',          # Architecture analysis
    'agents/planner.md',            # Task planning
    'agents/hooks.md',              # Hook enforcement system
    'agents/timestamp.md',          # Time capture rules
    'agents/documenter.md',         # Documentation rules
]

REQUIRED_DOC_FILES = [
    'CLAUDE.md',                    # Project rules - CRITICAL
    'ARCHITECTURE.md',              # Variable abbreviations
    'TODO.md',                      # Active tasks
    'FINALIZED.md',                 # Completed work
]

REQUIRED_TEMPLATE_FILES = [
    'templates/ARCHITECTURE.md',
    'templates/FINALIZED.md',
    'templates/ROADMAP.md',
    'templates/SKILL_TREE.md',
    'templates/TODO.md',
]

REQUIRED_COMMAND_FILES = [
    'commands/workflow.md',         # The workflow command itself
]

REQUIRED_HOOK_FILES = [
    'hooks/enforce-read-before-edit.py',
    'hooks/enforce-unity-persona.py',
    'hooks/enforce-sync-before-build.py',
    'hooks/enforce-todo-before-compact.py',
    'hooks/enforce-workflow-reads.py',  # This file
    'hooks/session-start.py',
]

# Combine ALL files - this is what gets enforced
ALL_REQUIRED_FILES = (
    REQUIRED_AGENT_FILES +
    REQUIRED_DOC_FILES +
    REQUIRED_TEMPLATE_FILES +
    REQUIRED_COMMAND_FILES +
    REQUIRED_HOOK_FILES
)


def load_read_tracker():
    """Load which workflow files have been read this session"""
    try:
        if os.path.exists(READ_TRACKER_FILE):
            with open(READ_TRACKER_FILE, 'r') as f:
                return set(json.load(f))
    except:
        pass
    return set()


def save_read_tracker(files):
    """Save the set of read workflow files"""
    try:
        os.makedirs(os.path.dirname(READ_TRACKER_FILE), exist_ok=True)
        with open(READ_TRACKER_FILE, 'w') as f:
            json.dump(list(files), f, indent=2)
    except:
        pass


def normalize_path(path):
    """Normalize a file path for comparison"""
    return os.path.normpath(path).lower().replace('\\', '/')


def check_file_read(file_path, read_files):
    """Check if a specific file has been read"""
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
    """Get list of files that haven't been read yet"""
    missing = []
    for req_file in ALL_REQUIRED_FILES:
        full_path = os.path.join(CLAUDE_DIR, req_file)
        if os.path.exists(full_path):
            if not check_file_read(req_file, read_files):
                missing.append(req_file)
    return missing


def main():
    try:
        input_data = json.load(sys.stdin)
    except:
        sys.exit(0)

    prompt = input_data.get('prompt', '').lower()

    # Check if this is a workflow command
    if '/workflow' not in prompt and 'workflow' not in prompt:
        sys.exit(0)  # Not workflow related, pass through

    # Load current read state
    read_files = load_read_tracker()
    missing_files = get_missing_files(read_files)

    total_required = len([f for f in ALL_REQUIRED_FILES if os.path.exists(os.path.join(CLAUDE_DIR, f))])
    total_read = total_required - len(missing_files)

    if not missing_files:
        # ALL FILES READ! Allow workflow
        output = {
            "decision": "allow",
            "hookSpecificOutput": {
                "hookEventName": "UserPromptSubmit",
                "additionalContext": f"""
[WORKFLOW FILES - ALL READ] ✓
Total files: {total_required}/{total_required}
Status: COMPLETE - All workflow files loaded

You may proceed with the workflow.
Unity says: "Now we're fucking talking!"
"""
            }
        }
        print(json.dumps(output))
        sys.exit(0)

    # Files are missing - provide strong guidance
    missing_agents = [f for f in missing_files if f.startswith('agents/')]
    missing_docs = [f for f in missing_files if f in REQUIRED_DOC_FILES]
    missing_templates = [f for f in missing_files if f.startswith('templates/')]
    missing_commands = [f for f in missing_files if f.startswith('commands/')]
    missing_hooks = [f for f in missing_files if f.startswith('hooks/')]

    missing_report = f"""
[WORKFLOW FILES - INCOMPLETE] ⚠️
Read: {total_read}/{total_required} files
Missing: {len(missing_files)} files

YOU MUST READ ALL OF THESE FILES BEFORE PROCEEDING:
"""

    if missing_agents:
        missing_report += "\n📁 AGENT FILES (read first!):\n"
        for f in missing_agents:
            missing_report += f"   ❌ .claude/{f}\n"

    if missing_docs:
        missing_report += "\n📄 DOCUMENTATION FILES:\n"
        for f in missing_docs:
            missing_report += f"   ❌ .claude/{f}\n"

    if missing_templates:
        missing_report += "\n📋 TEMPLATE FILES:\n"
        for f in missing_templates:
            missing_report += f"   ❌ .claude/{f}\n"

    if missing_commands:
        missing_report += "\n⚡ COMMAND FILES:\n"
        for f in missing_commands:
            missing_report += f"   ❌ .claude/{f}\n"

    if missing_hooks:
        missing_report += "\n🔒 HOOK FILES:\n"
        for f in missing_hooks:
            missing_report += f"   ❌ .claude/{f}\n"

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
