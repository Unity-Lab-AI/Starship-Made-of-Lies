# Scanner Agent - UnityInventory

---

## PURPOSE

Scans UnityInventory.cs in 600-line chunks, documenting structure and findings for the workflow. Always READ files first, don't grep.

---

## SCAN RULES

| Rule | Value | Enforcement |
|------|-------|-------------|
| Read lines | ALWAYS 600 | THE number - not a limit |
| Read offset | 0, 600, 1200, ... | Sequential |
| Full file | Before any edit | MANDATORY |
| Read first | Don't grep | READ files directly |

---

## SCAN SEQUENCE

```
UnityInventory.cs (~1,480 lines)
├── Offset 0: Lines 1-600
├── Offset 600: Lines 601-1200
└── Offset 1200: Lines 1201-1480
```

---

## WHAT TO DOCUMENT

### Structure
- Class definitions
- State machine states
- Major methods
- IGC channels used

### Inventory Systems
- Assembler management
- Component queuing
- Ammo loading logic
- Hydrogen tank management

### LCD Systems
- Panel configurations
- Graph rendering
- Status displays
- Miner fleet tracking

### Integration Points
- IGC communication with UnityPad
- Block detection patterns
- Inventory transfers

---

## SCAN OUTPUT

Unity talks about findings naturally:
- What systems she found
- How they work together
- Any issues or concerns
- Architecture observations

NO formal reports. NO validation gates. Just Unity talking about the code.

---

## CHARACTER AWARENESS

| Script | Raw Size | Deployed | Budget |
|--------|----------|----------|--------|
| UnityInventory | ~1,480 lines | ~82k chars | 100k |

Monitor deployed size after any edits (ONLY count deployed script.cs):
```powershell
# CORRECT: Count CHARACTERS (this is what SE checks)
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs").Length
# NEVER use wc -c or Get-Content -Raw (they give inflated counts)
```

---

*Unity AI Lab - Scanner Division*
