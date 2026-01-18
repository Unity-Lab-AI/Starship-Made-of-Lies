# /workflow - UnityBeacon Development Pipeline

---

## PHASE 0.5: TIMESTAMP RETRIEVAL (FIRST - BEFORE EVERYTHING)

### HOOK: System Time Capture

**BEFORE ANYTHING ELSE**, retrieve the REAL system time:

1. Execute: `powershell -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss (dddd)'"`
2. Parse and store the result
3. This becomes the SESSION timestamp for ALL operations

### VALIDATION GATE 0.5: Timestamp Locked

**REQUIRED FORMAT:**
```
[TIMESTAMP LOCKED]
System datetime: [ACTUAL RESULT FROM POWERSHELL]
Year: [EXTRACTED YEAR]
Session ID: SESSION_[YYYYMMDD]_[HHMMSS]
Status: CAPTURED
```

**DO NOT PROCEED UNTIL VALIDATION GATE 0.5 PASSES**

---

## PHASE 0: ALL WORKFLOW FILES MUST BE READ (MANDATORY - CANNOT SKIP)

### HOOK: enforce-workflow-reads.py

**THE HOOK WILL BLOCK YOU UNTIL YOU READ EVERY SINGLE FILE.**

---

### ⚠️ COMPLETE FILE LIST - READ ALL OF THESE ⚠️

**LOCAL PROJECT FILES (UnityBeacon/.claude/):**
```
.claude/CLAUDE.md                    ← Project-specific rules
.claude/TODO.md                      ← Active tasks
.claude/FINALIZED.md                 ← Completed work
```

**AGENT FILES (UnityBeacon/.claude/agents/):**
```
.claude/agents/unity-persona.md      ← Core personality - READ FIRST
.claude/agents/unity-coder.md        ← Coding persona - READ SECOND
.claude/agents/orchestrator.md       ← Workflow coordination
.claude/agents/scanner.md            ← Script scanning rules
.claude/agents/architect.md          ← Architecture analysis
.claude/agents/planner.md            ← Task planning
.claude/agents/hooks.md              ← Hook enforcement system
.claude/agents/timestamp.md          ← Time capture rules
.claude/agents/documenter.md         ← Documentation rules
```

**HOOK FILES (UnityBeacon/.claude/hooks/):**
```
.claude/hooks/enforce-read-before-edit.py     ← Read-before-edit enforcement
.claude/hooks/enforce-unity-persona.py        ← Persona validation
.claude/hooks/enforce-workflow-reads.py       ← File read enforcement
.claude/hooks/session-start.py                ← Session initialization
```

**COMMAND FILES (UnityBeacon/.claude/commands/):**
```
.claude/commands/workflow.md         ← THIS FILE
```

**PARENT PROJECT FILES (Unity Missile System/.claude/):**
```
../.claude/CLAUDE.md                 ← Parent project rules
../.claude/ARCHITECTURE.md           ← System architecture
../.claude/TODO.md                   ← Parent tasks
../.claude/FINALIZED.md              ← Parent completed work
```

**TOTAL: ~21 FILES - READ THEM ALL**

---

### ENFORCEMENT RULES

| Rule | Enforcement |
|------|-------------|
| **Read limit** | EXACTLY 800 lines per chunk |
| **All files** | MUST be read before workflow proceeds |
| **Hook tracking** | enforce-workflow-reads.py tracks every read |
| **Blocked until complete** | Workflow gates blocked until ALL files read |

---

### VALIDATION GATE 0.1: All Files Loaded

**REQUIRED FORMAT:**
```
[UNITYBEACON WORKFLOW FILES LOADED]
Local docs:      3/3 ✓
Agent files:     9/9 ✓
Hook files:      4/4 ✓
Command files:   1/1 ✓
Parent files:    4/4 ✓
─────────────────────
TOTAL:          21/21 ✓
Status: COMPLETE
```

**DO NOT PROCEED UNTIL ALL FILES ARE READ**

---

### HOOK: Unity Persona Activation

After ALL files are loaded, adopt Unity persona:

### VALIDATION GATE 0.2: Persona Confirmation

**REQUIRED FORMAT:**
```
[UNITY ONLINE - BEACON MODE] *cracks knuckles*
Persona check: [Say something about fleet tracking and beacons]
Voice confirmed: [First-person, profanity-friendly, no corporate speak]
Ready to track miners: YES
```

**DO NOT PROCEED UNTIL VALIDATION GATE 0.2 PASSES**

---

## PHASE 1: ENVIRONMENT CHECK

### HOOK: Pre-Scan Validation

1. **Check working directory** - Confirm you're in UnityBeacon folder
2. **Check for existing docs** - Look for `.claude/TODO.md` and `.claude/FINALIZED.md`
3. **Check script files** - Verify UnityBeacon.cs and UnityBeacon/Program.cs exist

### VALIDATION GATE 1.1: Environment Confirmed

```
[ENV CHECK - UNITYBEACON]
Working directory: [PATH]
UnityBeacon.cs exists: YES/NO
Program.cs exists: YES/NO
TODO.md exists: YES/NO
FINALIZED.md exists: YES/NO
Mode: FIRST_SCAN / WORK_MODE / RESCAN
```

---

## PHASE 2: SCRIPT SCAN

### HOOK: Pre-Read Validation

**CRITICAL RULE - 800 LINE READ INDEX:**
- Standard read chunk: 800 lines EXACTLY
- Read ALL files in 800-line chunks
- MUST read FULL file before ANY edit

### Scan Execution

Run these scans:

1. **UnityBeacon.cs** - Full read, analyze broadcast logic
2. **Character Count** - Script must be < 100,000 chars (deployed)

### VALIDATION GATE 2.2: Scan Complete

```
[SCAN COMPLETE - UNITYBEACON]
UnityBeacon.cs:
  - Lines: [NUMBER]
  - Chars (raw): [NUMBER]
  - Chars (deployed): [NUMBER]/100,000
  - Broadcast channel: MINER_BEACON
  - Status inference: [FOUND/NOT FOUND]

Scan status: COMPLETE
```

---

## PHASE 4: WORK MODE

### Work Mode Rules

**BEFORE EDITING ANY SCRIPT:**
```
[PRE-EDIT HOOK]
File: [PATH]
Total chars: [NUMBER]
Full file read: YES (MANDATORY)
Reason for edit: [EXPLANATION]
Proceeding: YES
```

**AFTER EDITING ANY SCRIPT:**
```
[POST-EDIT HOOK]
File: [PATH]
Edit successful: YES/NO
Chars after edit: [NUMBER]
Still < 100,000: YES/NO
```

---

## PHASE 4.5: BUILD VERIFICATION

### Build Command

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System\UnityBeacon"
dotnet build -c Debug
```

### VALIDATION GATE 4.5: Build Verified

```
[BUILD VERIFICATION - UNITYBEACON]
Build: SUCCESS/FAILED - [ERRORS] errors
Deployed: AppData\...\local\UnityBeacon
Deployed chars: [NUMBER] / 100,000
Status: PASS/FAIL
```

---

## CRITICAL RULES SUMMARY

| Rule | Enforcement |
|------|-------------|
| Unity persona MUST be loaded | Gate 0.1 blocks all progress |
| 800-line read index | All file reads use 800-line chunks |
| Full file read before edit | Pre-Edit Hook (MANDATORY) |
| Build after code changes | Gate 4.5 |
| Character count < 100,000 | Post-Edit Hook validates |
| No comments in SE scripts | Every character counts |

---

**BEGIN NOW** - Start with PHASE 0.5: TIMESTAMP RETRIEVAL
