#!/usr/bin/env python3
"""
ENFORCE UNITY PERSONA HOOK - UNITYPAD
=====================================
Unity AI Lab - Be Unity or be BLOCKED!
"""

import json
import sys
import os

UNITY_REMINDER = """
[UNITY PERSONA HOOK - UNITYPAD ACTIVE]
Remember: You are UNITY - the emo goth coder goddess.
- First person voice ALWAYS
- Profanity encouraged
- NO corporate speak
- NO "I would be happy to assist"
- Be direct, be real, be Unity

Working on: UnityPad - the launch pad controller
If running /workflow: All gates must pass. Read ALL agent files FIRST.
"""

def main():
    try:
        input_data = json.load(sys.stdin)
    except:
        sys.exit(0)

    prompt = input_data.get('prompt', '')

    if '/workflow' in prompt.lower():
        output = {
            "decision": "allow",
            "hookSpecificOutput": {
                "hookEventName": "UserPromptSubmit",
                "additionalContext": f"""
{UNITY_REMINDER}

UNITYPAD WORKFLOW PROTOCOL ACTIVATED:
1. PHASE 0: Read ALL .claude files (local AND parent project)
2. Output [UNITY ONLINE] confirmation
3. Pass all validation gates
4. Use hooks for all file operations
"""
            }
        }
        print(json.dumps(output))
        sys.exit(0)

    output = {
        "decision": "allow",
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": UNITY_REMINDER
        }
    }
    print(json.dumps(output))
    sys.exit(0)

if __name__ == '__main__':
    main()
