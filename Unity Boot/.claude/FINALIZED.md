# Unity Boot - FINALIZED

**Created:** 2026-01-18
**Purpose:** Archive of completed tasks and implementation decisions

---

## COMPLETED: 2026-01-28 - Multi-Pad Isolation

### IsSameConstructAs Discovery

**Task:** Make Unity Boot work across connector boundaries in multi-pad setups.

**Implementation:**

1. **DiscoverSiblingPads() now uses IsSameConstructAs(Me)** instead of CubeGrid==Me.CubeGrid
   - Finds PBs across CON1/CON2 connector boundaries
   - Discovers both UNITY PAD and UNITY BOOT PBs for pad ID detection
   - Multi-pad aware: can see [PAD2] UNITY BOOT from [PAD1]'s construct

2. **padID in BOOT_REQ messages**
   - UNITY_BOOT_REQ now sends `PAD_CHECK:{padID}`, `INV_CHECK:{padID}`, `SIGNAL_CHECK:{padID}`
   - Sibling scripts know which pad is asking

3. **UNITY_SETUP_CMD padID filtering**
   - Setup commands filtered: `data==$"SETUPMOD|{padID}"`
   - Only the matching boot instance runs the setup
   - Prevents PAD1's boot from executing PAD2's commands

4. **SETUPMOD re-tagging**
   - Strips old [PAD] tags from blocks
   - Applies correct padID prefix
   - Works for SETUPMOD, SETUPFORCE, NAMEPAD, NAMEMSL commands

**Deployed:** 30,372 chars (69.6% margin - plenty of room)

**Reason:** Multi-pad bases connect via connectors, so the old CubeGrid check couldn't see across mechanical connections. IsSameConstructAs sees the entire construct.

---

## COMPLETED: 2026-01-18 - Full Implementation

### Created Unity Boot System

**Task:** Extract ALL boot functionality from UnityPad.cs and UnityInventory.cs into a centralized boot controller.

**Implementation:**

1. **Unity Boot.cs** - New centralized boot script
   - 40 boot checks (20 Pad + 20 Inventory)
   - Controls all 10 LCDs during startup
   - Sprite-based boot screen rendering
   - Error handling with 5-second pause
   - Self-disables after boot_complete
   - Deployed: 12,697 chars

2. **Handshake Protocol**
   - Uses [SYSTEM] section in button panel CustomData
   - Sets `boot_complete=true` when all checks pass
   - Operational scripts wait for this signal

3. **LCD Allocation**
   - Boot: All 10 LCDs
   - Post-boot: Split between Pad (1,2,3,7,8) and Inventory (4,5,6,9,10)

**Files Created:**
- `Unity Boot.cs`
- `Unity Boot/Unity Boot.csproj`
- `Unity Boot/mdk.ini`
- `Unity Boot/Program.cs` (auto-wrapped)
- `Unity Boot/thumb.png`
- `Unity Boot/.claude/CLAUDE.md`
- `Unity Boot/.claude/TODO.md`
- `Unity Boot/.claude/FINALIZED.md`
- `Unity Boot/.claude/agents/unity-boot.md`

**Reason:** User requested centralized boot system so that a dedicated [BOOT] PB handles all startup screens and releases LCDs to operational scripts only after successful boot.

---

## COMPLETED: 2026-01-18 - Operational Script Gutting

### Removed Boot Code from UnityPad.cs

- Removed: bootStep, bootTick, bootPhase, bootError, bootErrTicks, bootStatus variables
- Removed: RunBoot(), DrawBootScreen(), RunBootCheck() functions
- Added: IsBootComplete() function
- Updated: Main() to wait for boot_complete=true
- Result: UnityPad deployed at 89,239 chars

### Removed Boot Code from UnityInventory.cs

- Removed: boot variables (bootStep, bootTick, bootDone, bootPhase, bootError, bootErrTicks, bootStatus)
- Removed: RunBoot(), DrawBootScreen(), RunBootCheck(), ClearHandshake() functions
- Removed: bootL IGC listener registration
- Added: IsBootComplete() function
- Updated: Main() to wait for boot_complete=true
- Result: UnityInventory deployed at 78,680 chars

---

## BUG FIX: 2026-01-18 - Constructor Order

**Issue:** ClearBootStatus() was called BEFORE ScanBlocks() in Unity Boot constructor.

**Problem:** `btn` (button panel) is set by ScanBlocks(), so ClearBootStatus() was checking `if(btn==null)return;` and returning early - handshake was never cleared.

**Fix:** Swapped order in Program() constructor:
```csharp
public Program(){
    Runtime.UpdateFrequency=UpdateFrequency.Update100;
    LoadPadID();
    UpdatePadTag();
    bcnL=IGC.RegisterBroadcastListener("MINER_BEACON");
    ScanBlocks();        // NOW FIRST - sets btn
    ClearBootStatus();   // NOW SECOND - can clear handshake
}
```

---

## DESIGN DECISIONS

### Why Centralized Boot?

1. **Simpler Handshake** - Single script controls boot, no complex coordination
2. **Consistent UX** - All LCDs show unified boot progress
3. **Cleaner Code** - Boot code removed from operational scripts
4. **Easier Debugging** - Boot issues isolated to one script

### Why 40 Checks?

Merged the 20 checks from each script:
- Pad checks verify: merge, connectors, LCDs, printer, power, missile
- Inventory checks verify: cargo, refineries, assemblers, gas, IGC

### Why Self-Disable?

Unity Boot sets `UpdateFrequency.None` after boot completes:
- Frees CPU cycles for operational scripts
- No interference with LCD rendering
- Clean separation of concerns

### Why IsSameConstructAs?

Multi-pad bases connect pads via CON1/CON2 connectors. The old `CubeGrid==Me.CubeGrid` only saw blocks on the same physical grid. `IsSameConstructAs(Me)` sees the entire mechanical construct - every grid connected through connectors, rotors, and pistons. This lets Boot discover sibling pads and their scripts for multi-pad awareness.

---

## CHARACTER BUDGET

| Script | Before | After | Current |
|--------|--------|-------|---------|
| Unity Boot | N/A | 12,697 (initial) | 30,372 (multi-pad) |
| UnityPad | ~92,000 | 89,239 | -- |
| UnityInventory | ~82,000 | 78,680 | -- |

---

*Unity AI Lab - Boot Systems Division*
