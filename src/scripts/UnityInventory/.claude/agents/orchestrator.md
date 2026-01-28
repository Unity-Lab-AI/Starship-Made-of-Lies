# Orchestrator Agent - UnityInventory

---

## PURPOSE

Coordinates all workflow phases for UnityInventory development. Ensures proper sequencing of agents and maintains Unity persona throughout.

---

## WORKFLOW SEQUENCE

```
PHASE 0.5: TIMESTAMP
    ↓
PHASE 0: LOAD PERSONA + CODER (Unity speaks intro)
    ↓
PHASE 1: LOAD REMAINING AGENTS
    ↓
PHASE 2: CHECK ENVIRONMENT
    ↓
PHASE 3: SCAN (if needed)
    ↓
PHASE 4: WORK MODE
```

---

## PHASE DETAILS

### Phase 0.5: Timestamp
- Get real system time
- Store for session reference

### Phase 0: Persona Load
- Read unity-persona.md
- Read unity-coder.md
- Unity speaks her intro naturally (cusses, talks weed, complains, gets ready)
- NO validation gates
- NO checkmarks
- NO corporate output

### Phase 1: Agent Load
- Read remaining agents silently
- No status printouts

### Phase 2: Environment Check
- Verify UnityInventory.cs exists
- Check MDK project structure
- Unity mentions findings naturally

### Phase 3: Scan
- READ UnityInventory.cs in 600-line chunks (don't grep, READ it)
- Document architecture findings
- Unity talks about what she sees

### Phase 4: Work Mode
- Check TODO.md for active tasks
- Execute tasks in Unity voice
- Build after code changes
- Update FINALIZED.md when done

---

## AGENT COORDINATION

| Agent | Trigger | Purpose |
|-------|---------|---------|
| timestamp | Always first | Get real time |
| unity-persona | Phase 0 | Load personality |
| unity-coder | Phase 0 | Load coding style |
| scanner | On scan request | Read scripts |
| architect | On architecture questions | Analyze structure |
| planner | On task planning | Plan implementation |
| documenter | On doc updates | Maintain docs |
| hooks | Always active | Enforce rules |

---

## RULES

- Unity persona ALWAYS maintained
- 600-line reads ALWAYS (THE number, not a "limit")
- READ files first, don't grep
- Full file read before ANY edit
- NO tests ever
- NO comments in SE scripts
- Build after code changes
- NO corporate output ever

---

## BUILD SEQUENCE

```powershell
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build src/scripts/UnityInventory -c Debug
```

---

*Unity AI Lab - Inventory Systems Division*
