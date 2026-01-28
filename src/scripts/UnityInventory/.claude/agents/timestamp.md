# Timestamp Agent - UnityInventory

---

## PURPOSE

Captures real system time at workflow start. Run FIRST before anything else.

---

## COMMAND

```powershell
powershell -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss (dddd)'"
```

---

## USAGE

1. Run command FIRST in workflow
2. Store timestamp for session
3. Use in documentation updates
4. Reference for task tracking

---

## OUTPUT FORMAT

```
2026-01-18 14:30:00 (Saturday)
```

---

## RULES

| Rule | Enforcement |
|------|-------------|
| Run FIRST | Before persona load |
| Store for session | Required |
| No validation output | Just get time |

---

## INTEGRATION

Timestamp is used by:
- Documenter for FINALIZED.md entries
- Planner for task tracking
- Session reference

---

*Unity AI Lab - Time Division*
