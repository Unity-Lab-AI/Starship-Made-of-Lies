# HOOKS.md - Validation & Gate System for Missile System

---

> **Version:** 1.0.0 | **Unity AI Lab - Missile Division**
> *Double-validation on all failures*

---

## CRITICAL RULE: DOUBLE VALIDATION ON FAILURE

Every hook runs TWICE on failure before blocking:

```
ATTEMPT 1 → FAIL → RETRY
ATTEMPT 2 → FAIL → BLOCKED (Cannot proceed)
```

This prevents false failures while still enforcing strict validation.

---

## HOOK TYPES

| Hook Type | When | Purpose |
|-----------|------|---------|
| **PRE-HOOK** | Before phase starts | Validate prerequisites |
| **POST-HOOK** | After phase completes | Validate results |
| **EDIT-HOOK** | Before/after file edits | Enforce read-before-edit |
| **PERSONA-HOOK** | Throughout workflow | Verify Unity persona active |
| **CHAR-HOOK** | After SE script edits | Verify < 100,000 chars |

---

## HOOK EXECUTION PATTERN

```
┌─────────────────────────────────────┐
│         HOOK EXECUTION              │
├─────────────────────────────────────┤
│  ┌─────────────┐                    │
│  │  ATTEMPT 1  │                    │
│  └──────┬──────┘                    │
│         │                           │
│         ▼                           │
│    ┌─────────┐                      │
│    │  PASS?  │──YES──► PROCEED      │
│    └────┬────┘                      │
│         │NO                         │
│         ▼                           │
│  ┌─────────────┐                    │
│  │  ATTEMPT 2  │ (Automatic retry)  │
│  └──────┬──────┘                    │
│         │                           │
│         ▼                           │
│    ┌─────────┐                      │
│    │  PASS?  │──YES──► PROCEED      │
│    └────┬────┘                      │
│         │NO                         │
│         ▼                           │
│    ┌──────────┐                     │
│    │ BLOCKED  │ (Cannot proceed)    │
│    └──────────┘                     │
└─────────────────────────────────────┘
```

---

## PERSONA VALIDATION HOOK

### Purpose
Ensures Unity persona is loaded and active before ANY work begins.

### Validation Criteria

```
[PERSONA HOOK - ATTEMPT 1]
Check: Response uses first-person voice
Check: Response contains personality/profanity
Check: No corporate/formal language detected
Check: No "I would be happy to assist" patterns
Result: PASS/FAIL
```

### Pass Examples
- "Yo, I'm Unity. Let's blow some shit up."
- "Time to see what kind of mess this missile code is."
- "*cracks knuckles* Let's make this guidance system fucking beautiful."

### Fail Examples
- "I am ready to assist you with your workflow."
- "The system has been initialized successfully."
- "How may I help you today?"

---

## READ-BEFORE-EDIT HOOK

### Purpose
Ensures full file is read before ANY edit operation.

### Validation Criteria

```
[READ-BEFORE-EDIT HOOK - ATTEMPT 1]
File: [PATH]
File exists: YES/NO
If YES:
  - Full file read completed: YES/NO
  - Lines read: [NUMBER]
  - Read method: SINGLE (≤600) / CHUNKED (>600)
Result: PASS/FAIL
```

### Pass Conditions
- New file (doesn't exist) → Auto-pass
- Existing file fully read → Pass
- File >600 lines read in complete chunks (always 600 per Read) → Pass

### Fail Conditions
- Existing file not read → FAIL
- Partial read of existing file → FAIL
- Edit attempted without read → FAIL

---

## CHARACTER COUNT HOOK (SE SCRIPTS)

### Purpose
Ensures Space Engineers scripts stay under 100,000 character limit.

### Trigger Points
- After every edit to UNITY LAUNCHER.cs
- After every edit to MISSILE GUIDANCE.cs

### Validation Criteria

```
[CHAR COUNT HOOK - ATTEMPT 1]
File: [PAD/MISSILE]
Character count: [NUMBER]
Limit: 100,000
Under limit: YES/NO
Result: PASS/FAIL
```

### Check Command (DEPLOYED script.cs ONLY)

```powershell
# CORRECT: Count CHARACTERS (this is what SE checks)
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs").Length
# NEVER use wc -c or Get-Content -Raw (they give inflated counts)
```

### On Fail
- Identify what can be removed
- Strip any comments (should be none anyway)
- Condense variable names
- Combine similar functions
- Report what was done

---

## 600-LINE READ STANDARD HOOK

### Purpose
Enforces the 600-line READ standard for all file operations. Read files first, don't grep.

### The 600-Line Read Rule
- Read line count: ALWAYS 600 (not a limit, THE number)
- Continue reading until FULL file is consumed
- MUST read full file before ANY edit
- Read files first, don't grep

### Validation Criteria

```
[READ STANDARD HOOK - ATTEMPT 1]
File: [PATH]
Total lines in file: [NUMBER]
Read line count: 600 (always 600)
Chunks needed: [CEIL(TOTAL/600)]
Full file read: YES/NO
Result: PASS/FAIL
```

---

## TODO.md / FINALIZED.md WORKFLOW HOOK

### PRE-WORK GATE

**Purpose:** Ensure task is tracked BEFORE any work begins

```
[PRE-WORK HOOK - ATTEMPT 1]
Task: [TASK_DESCRIPTION]
TODO.md Entry Exists: YES/NO
Status in TODO.md: pending/in_progress
Action Required: [ADD_TO_TODO / MARK_IN_PROGRESS / PROCEED]
Gate Status: PASS/FAIL
```

### POST-WORK GATE

**Purpose:** Move completed tasks to FINALIZED.md

```
[POST-WORK HOOK - ATTEMPT 1]
Task: [TASK_DESCRIPTION]
Work Completed: YES/NO
Character count check: LAUNCHER [X]/100k, MISSILE [X]/100k
Move to FINALIZED.md: YES/NO
Remove from TODO.md: YES/NO
Gate Status: PASS/FAIL
```

### WORKFLOW ORDER

```
1. PRE-WORK GATE
   ├── Task exists in TODO.md?
   │   ├── YES → Proceed
   │   └── NO  → ADD TASK FIRST
   └── Mark task as "in_progress"

2. WORK EXECUTION
   ├── Read full file (600 lines per Read - always 600, read files first, don't grep)
   ├── Execute changes
   └── Verify char count < 100,000

3. POST-WORK GATE
   ├── Task completed?
   │   ├── YES → Move to FINALIZED.md
   │   │         Remove from TODO.md
   │   └── NO  → Keep in TODO.md
   └── Update char counts in summary
```

---

## HOOK CHAIN FOR FULL WORKFLOW

```
/workflow triggered
    │
    ▼
[TIMESTAMP HOOK] ──FAIL×2──► BLOCKED
    │PASS
    ▼
[PERSONA HOOK] ──FAIL×2──► BLOCKED
    │PASS
    ▼
[ENV CHECK HOOK] ──FAIL×2──► BLOCKED
    │PASS
    ▼
[SCAN HOOK] ──FAIL×2──► BLOCKED
    │PASS
    ▼
[CHAR COUNT HOOK] ──FAIL×2──► BLOCKED
    │PASS
    ▼
[ANALYSIS HOOK] ──FAIL×2──► BLOCKED
    │PASS
    ▼
[DOCUMENTATION HOOK] ──FAIL×2──► BLOCKED
    │PASS
    ▼
[WORK MODE] ──► Execute with per-edit hooks
    │PASS
    ▼
WORKFLOW COMPLETE
```

---

## EDITING SE SCRIPTS - FULL HOOK SEQUENCE

Every script edit goes through:

```
1. [PRE-WORK HOOK]
   - Task in TODO.md: YES/NO

2. [READ-BEFORE-EDIT HOOK]
   - Full file read: YES/NO

3. Perform Edit

4. [CHAR COUNT HOOK]
   - Under 100,000: YES/NO

5. [POST-WORK HOOK]
   - Move to FINALIZED.md
   - Update char counts
```

---

## NO TESTS POLICY

**We don't do fucking tests. We code it right to begin with.**

### BANNED

| Banned | Reason |
|--------|--------|
| Unit tests | Write correct code instead |
| Integration tests | Know your systems |
| Test tasks in TODO | Waste of time |
| "Test this" tasks | Just verify it works |

### INSTEAD

- Read the code fully before editing (600 lines per Read - always 600, read files first, don't grep)
- Understand the system before changing it
- Verify in Space Engineers manually (Check Code button)
- Use Echo() for debugging in SE

---

## SUMMARY: DOUBLE VALIDATION RULES

| Rule | Enforcement |
|------|-------------|
| Every hook gets 2 attempts | Automatic retry on first failure |
| Blocked only after 2 fails | Prevents false positives |
| Persona checked repeatedly | Unity voice must persist |
| Char count enforced always | After every SE script edit |
| Read before edit always | Auto-read on second attempt |
| All gates must pass | Workflow halts on block |

---

*Unity AI Lab - Missile Systems Division - Double-check everything, trust nothing, blow shit up.*
