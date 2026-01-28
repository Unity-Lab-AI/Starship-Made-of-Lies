#!/usr/bin/env python3
"""
ENFORCE READ-BEFORE-EDIT HOOK - UNITYBEACON
===========================================
Unity AI Lab - You shall not pass without reading first!

This PreToolUse hook BLOCKS Edit and Write operations if the file
hasn't been read first in the current session.

Also tracks workflow file reads for the enforce-workflow-reads hook.
"""

import json
import sys
import os

HOOKS_DIR = os.path.join(os.environ.get('CLAUDE_PROJECT_DIR', '.'), '.claude', 'hooks')

READ_TRACKER_FILE = os.path.join(HOOKS_DIR, '.read_tracker.json')
WORKFLOW_TRACKER_FILE = os.path.join(HOOKS_DIR, '.workflow_reads.json')

def load_read_files():
    try:
        if os.path.exists(READ_TRACKER_FILE):
            with open(READ_TRACKER_FILE, 'r') as f:
                return set(json.load(f))
    except:
        pass
    return set()

def save_read_files(files):
    try:
        os.makedirs(os.path.dirname(READ_TRACKER_FILE), exist_ok=True)
        with open(READ_TRACKER_FILE, 'w') as f:
            json.dump(list(files), f)
    except:
        pass

def load_workflow_reads():
    try:
        if os.path.exists(WORKFLOW_TRACKER_FILE):
            with open(WORKFLOW_TRACKER_FILE, 'r') as f:
                return set(json.load(f))
    except:
        pass
    return set()

def save_workflow_reads(files):
    try:
        os.makedirs(os.path.dirname(WORKFLOW_TRACKER_FILE), exist_ok=True)
        with open(WORKFLOW_TRACKER_FILE, 'w') as f:
            json.dump(list(files), f)
    except:
        pass

def is_workflow_file(file_path):
    normalized = os.path.normpath(file_path).lower().replace('\\', '/')
    return '.claude/' in normalized or '.claude\\' in normalized.replace('/', '\\')

def main():
    try:
        input_data = json.load(sys.stdin)
    except:
        sys.exit(0)

    tool_name = input_data.get('tool_name', '')
    tool_input = input_data.get('tool_input', {})

    if tool_name == 'Read':
        file_path = tool_input.get('file_path', '')
        if file_path:
            read_files = load_read_files()
            normalized = os.path.normpath(file_path).lower()
            read_files.add(normalized)
            save_read_files(read_files)

            if is_workflow_file(file_path):
                workflow_reads = load_workflow_reads()
                workflow_reads.add(normalized)
                save_workflow_reads(workflow_reads)

        sys.exit(0)

    if tool_name in ('Edit', 'Write'):
        file_path = tool_input.get('file_path', '')

        if not file_path:
            sys.exit(0)

        normalized = os.path.normpath(file_path).lower()

        if tool_name == 'Write' and not os.path.exists(file_path):
            sys.exit(0)

        read_files = load_read_files()

        if normalized not in read_files:
            error_msg = f"""
[READ-BEFORE-EDIT HOOK - BLOCKED]
File: {file_path}
Tool: {tool_name}
Status: BLOCKED - You MUST read this file before editing!

The workflow requires reading the FULL file before any edit.
Use the Read tool first, then try again.

Unity says: "Touch the beacon files without reading them first and I'll haunt your dreams."
"""
            print(error_msg, file=sys.stderr)
            sys.exit(2)

    sys.exit(0)

if __name__ == '__main__':
    main()
