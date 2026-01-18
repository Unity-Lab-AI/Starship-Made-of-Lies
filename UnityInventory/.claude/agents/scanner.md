# Scanner Agent - UnityInventory

---

## PURPOSE

Scans UnityInventory.cs in 800-line chunks, documenting structure and findings for the workflow.

---

## SCAN RULES

| Rule | Value | Enforcement |
|------|-------|-------------|
| Read limit | EXACTLY 800 | MANDATORY |
| Read offset | 0, 800, 1600, ... | Sequential |
| Full file | Before any edit | MANDATORY |

---

## SCAN SEQUENCE

```
UnityInventory.cs (~1,480 lines)
├── Offset 0: Lines 1-800
└── Offset 800: Lines 801-1480
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

Monitor deployed size after any edits:
```powershell
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs" -Raw).Length
```

---

*Unity AI Lab - Scanner Division*
