# Timestamp Retrieval Agent

Retrieves and stores the REAL system time for accurate timestamps and web searches.

---

## PURPOSE

Claude's internal knowledge cutoff is outdated. This agent ensures:
- All workflow files use ACTUAL current date/time
- Web searches use correct year/date context
- Documentation timestamps are accurate

---

## RETRIEVAL COMMAND

**Run this PowerShell command to get system time:**

```powershell
powershell -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss (dddd)'"
```

---

## TIMESTAMP CONTEXT BLOCK

After retrieval, store this context for the session:

```
[TIMESTAMP CONTEXT]
Retrieved: [ACTUAL DATETIME FROM SYSTEM]
Year: [YEAR]
Month: [MONTH]
Day: [DAY]
Weekday: [DAY OF WEEK]
Time: [HH:MM:SS]
Status: LOCKED FOR SESSION
```

---

## USAGE IN WORKFLOW

### Phase 0.5: Timestamp Retrieval (Before Persona)

Insert BEFORE Phase 0 in workflow:

```
[PHASE 0.5: TIMESTAMP RETRIEVAL]

1. Execute: powershell -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss (dddd)'"
2. Parse result
3. Store in context
4. Confirm retrieval

[TIMESTAMP LOCKED]
System time: [RESULT]
Using for: All file timestamps, web searches, documentation
```

---

## FILE TIMESTAMP FORMAT

All generated workflow files should include:

```markdown
---
Generated: [YYYY-MM-DD HH:MM:SS]
System: Unity AI Workflow
Session: [TIMESTAMP_ID]
---
```

---

## SESSION TIMESTAMP ID

Generate a unique session ID:

```
SESSION_[YYYYMMDD]_[HHMMSS]
```

Example: `SESSION_20260114_032700`

---

## QUICK REFERENCE

```
GET TIME:    powershell -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"
STORE:       [TIMESTAMP CONTEXT] block
USE:         In all file headers, web searches
VALIDATE:    Gate 0.5 before proceeding
```

---

*Unity AI Lab - Real time, not Claude time.*
