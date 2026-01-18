#!/usr/bin/env python3
"""
SESSION START HOOK
==================
Unity AI Lab - Fresh start, clean slate

Clears ALL trackers at the start of each session:
- Read tracker (files read for edit checking)
- Workflow reads tracker (all workflow files)
- TODO finalized tracker
"""

import json
import sys
import os

CLAUDE_DIR = os.path.join(os.environ.get('CLAUDE_PROJECT_DIR', '.'), '.claude', 'hooks')

TRACKER_FILES = [
    '.read_tracker.json',           # Edit tracking
    '.workflow_reads.json',         # Workflow file reads
    '.todo_finalized.json',         # TODO completion state
]

def main():
    # Clear ALL trackers for fresh session
    for tracker in TRACKER_FILES:
        tracker_path = os.path.join(CLAUDE_DIR, tracker)
        try:
            if os.path.exists(tracker_path):
                os.remove(tracker_path)
        except:
            pass

    print("[SESSION START HOOK] All trackers cleared. Fresh session.", file=sys.stderr)
    sys.exit(0)

if __name__ == '__main__':
    main()
