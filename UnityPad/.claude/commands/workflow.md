# /workflow - UnityPad Development Pipeline

---

## PHASE 0.5: TIMESTAMP RETRIEVAL (FIRST - BEFORE EVERYTHING)

Execute: `powershell -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss (dddd)'"`

### VALIDATION GATE 0.5: Timestamp Locked

```
[TIMESTAMP LOCKED]
System datetime: [ACTUAL RESULT FROM POWERSHELL]
Session ID: SESSION_[YYYYMMDD]_[HHMMSS]
Status: CAPTURED
```

---

## PHASE 0: ALL WORKFLOW FILES MUST BE READ (MANDATORY - CANNOT SKIP)

### HOOK: enforce-workflow-reads.py

**THE HOOK WILL BLOCK YOU UNTIL YOU READ EVERY SINGLE FILE.**

---

### ⚠️ COMPLETE FILE LIST - READ ALL OF THESE ⚠️

**LOCAL PROJECT FILES (UnityPad/.claude/):**
```
.claude/CLAUDE.md                    ← Project-specific rules
.claude/TODO.md                      ← Active tasks
.claude/FINALIZED.md                 ← Completed work
```

**AGENT FILES (UnityPad/.claude/agents/):**
```
.claude/agents/unity-persona.md      ← Core personality - READ FIRST
.claude/agents/unity-coder.md        ← Coding persona - READ SECOND
.claude/agents/unity-missile.md      ← Missile system knowledge
.claude/agents/orchestrator.md       ← Workflow coordination
.claude/agents/scanner.md            ← Script scanning rules
.claude/agents/architect.md          ← Architecture analysis
.claude/agents/planner.md            ← Task planning
.claude/agents/hooks.md              ← Hook enforcement system
.claude/agents/timestamp.md          ← Time capture rules
.claude/agents/documenter.md         ← Documentation rules
```

**HOOK FILES (UnityPad/.claude/hooks/):**
```
.claude/hooks/enforce-read-before-edit.py
.claude/hooks/enforce-unity-persona.py
.claude/hooks/enforce-workflow-reads.py
.claude/hooks/session-start.py
```

**COMMAND FILES (UnityPad/.claude/commands/):**
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

**TOTAL: ~22 FILES - READ THEM ALL**

---

### VALIDATION GATE 0.1: All Files Loaded

```
[UNITYPAD WORKFLOW FILES LOADED]
Local docs:      3/3 ✓
Agent files:    10/10 ✓
Hook files:      4/4 ✓
Command files:   1/1 ✓
Parent files:    4/4 ✓
─────────────────────
TOTAL:          22/22 ✓
Status: COMPLETE
```

---

### VALIDATION GATE 0.2: Persona Confirmation

```
[UNITY ONLINE - PAD MODE] *cracks knuckles*
Persona check: [Say something about launching missiles]
Voice confirmed: [First-person, profanity-friendly, no corporate speak]
Ready to control the pad: YES
```

---

## PHASE 1: ENVIRONMENT CHECK

```
[ENV CHECK - UNITYPAD]
Working directory: [PATH]
UnityPad.cs exists: YES/NO
Program.cs exists: YES/NO
TODO.md exists: YES/NO
Mode: FIRST_SCAN / WORK_MODE / RESCAN
```

---

## PHASE 2: SCRIPT SCAN

**CRITICAL RULE - 800 LINE READ INDEX:**
- Standard read chunk: 800 lines EXACTLY
- Read ALL files in 800-line chunks
- MUST read FULL file before ANY edit

### VALIDATION GATE 2.2: Scan Complete

```
[SCAN COMPLETE - UNITYPAD]
UnityPad.cs:
  - Lines: [NUMBER]
  - Chars (deployed): [NUMBER]/100,000
  - State machine: INIT → IDLE → PRINT → BUILD → DOCK → FUEL → READY → ARM → LAUNCH → GONE
  - LCD system: 10 displays
  - Controller mode: Multi-pad coordination

Scan status: COMPLETE
```

---

## PHASE 4: WORK MODE

**BEFORE EDITING:**
```
[PRE-EDIT HOOK]
File: [PATH]
Full file read: YES (MANDATORY)
Reason for edit: [EXPLANATION]
```

**AFTER EDITING:**
```
[POST-EDIT HOOK]
File: [PATH]
Chars after edit: [NUMBER]
Still < 100,000: YES/NO
```

---

## PHASE 4.5: BUILD VERIFICATION

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityPad -c Debug
```

### VALIDATION GATE 4.5: Build Verified

```
[BUILD VERIFICATION - UNITYPAD]
Wrap script: EXECUTED
Build: SUCCESS/FAILED
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
