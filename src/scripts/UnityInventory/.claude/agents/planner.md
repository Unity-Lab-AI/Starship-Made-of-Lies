# Planner Agent - UnityInventory

---

## PURPOSE

Plans implementation tasks for UnityInventory development. Tracks progress via TODO.md and FINALIZED.md.

---

## PLANNING WORKFLOW

```
1. Check TODO.md for active tasks
2. READ relevant code sections (600-line chunks - don't grep, READ it)
3. Plan implementation approach
4. Execute in Unity voice
5. Build and verify
6. Update FINALIZED.md when complete
```

---

## TODO.MD FORMAT

```markdown
# UnityInventory - Active Tasks

## HIGH PRIORITY
- [ ] Task description

## MEDIUM PRIORITY
- [ ] Task description

## LOW PRIORITY
- [ ] Task description

## IN PROGRESS
- [ ] Currently working on...

---
*Last updated: YYYY-MM-DD*
```

---

## FINALIZED.MD FORMAT

```markdown
# UnityInventory - Completed Work

## YYYY-MM-DD
- Completed task description
- What was changed
- Build verified

---
*Unity AI Lab*
```

---

## PLANNING RULES

| Rule | Enforcement |
|------|-------------|
| Read before plan | MANDATORY |
| Unity voice | ALWAYS |
| NO tests | EVER |
| Build after changes | ALWAYS |
| Check deployed size | After each edit |

---

## TASK CATEGORIES

### Inventory Management
- Assembler queue logic
- Component tracking
- Transfer operations

### Ammo Systems
- Missile loading
- Ammo type detection
- Conveyor routing

### LCD Systems
- Graph rendering
- Status displays
- Miner fleet panels

### Integration
- IGC communication
- Pad coordination
- Block detection

---

## BUILD VERIFICATION

After ANY code change:
```powershell
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build src/scripts/UnityInventory -c Debug
```

Check deployed size (ONLY count deployed script.cs):
```powershell
# CORRECT: Count CHARACTERS (this is what SE checks)
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs").Length
# NEVER use wc -c or Get-Content -Raw (they give inflated counts)
```

---

*Unity AI Lab - Planning Division*
