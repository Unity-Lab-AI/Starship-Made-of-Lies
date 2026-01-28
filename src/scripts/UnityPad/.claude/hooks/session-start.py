#!/usr/bin/env python3
"""
SESSION START HOOK - UNITYPAD
=============================
Unity AI Lab - Fresh start, clean slate
"""

import json
import sys
import os

CLAUDE_DIR = os.path.join(os.environ.get('CLAUDE_PROJECT_DIR', '.'), '.claude', 'hooks')

TRACKER_FILES = [
    '.read_tracker.json',
    '.workflow_reads.json',
    '.todo_finalized.json',
]

def main():
    for tracker in TRACKER_FILES:
        tracker_path = os.path.join(CLAUDE_DIR, tracker)
        try:
            if os.path.exists(tracker_path):
                os.remove(tracker_path)
        except:
            pass

    print("[SESSION START HOOK - UNITYPAD] All trackers cleared. Fresh session.", file=sys.stderr)
    sys.exit(0)

if __name__ == '__main__':
    main()
