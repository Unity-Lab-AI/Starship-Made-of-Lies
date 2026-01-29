# UNITY MISSILE SYSTEM - Active Tasks

**Last Updated:** 2026-01-29
**Status:** Ammo recycling fixes, PB ABORT, missile session detection deployed to develop

---

## Table of Contents

1. [Ore Connector Investigation (Complete)](#investigation-complete-ore-connector-issue)
2. [Documentation Update Tasks](#documentation-update-tasks)
3. [Code Bugs (Pending)](#code-bugs-pending)
4. [Features (Pending)](#features-pending)
5. [Completed Today (2026-01-27)](#completed-today-2026-01-27)
6. [Character Budgets](#character-budgets)

---

## INVESTIGATION COMPLETE: Ore Connector Issue

**Issue:** Ore connectors (miner docking) randomly turn off, dropping miners.

### Code Search Results - NOT CAUSED BY UNITY SCRIPTS

Searched all `.Enabled=false` and `.Disconnect()` calls across all scripts:

| Script | Ore Connector Manipulation | Connector Code Found |
|--------|---------------------------|---------------------|
| **UnityPad.cs** | **NONE** | Only `padCon` (missile) - lines 1005, 1052, 1144 |
| **UnityInventory.cs** | **NONE** | Only reads `oreC` list status |
| **Unity Boot.cs** | **NONE** | Only reads status for sibling detection |
| **UnityBeacon.cs** | **NONE** | No connector code at all |
| **UnitySignal.cs** | **NONE** | No connector code at all |
| **UnityMissile.cs** | **NONE** | Only disables merge blocks |

### What Unity Scripts DO With Ore Connectors

**src/scripts/UnityPad.cs:**
```
Line 138: List<IMyShipConnector> oreC - declares list
Line 755: oreC.Clear() - clears list on rescan (doesn't touch actual blocks)
Line 777: Adds connectors with "ORE" in name to list
Line 647: CorrelateDockedMiners() - READS status only, never writes
```

**src/scripts/UnityInventory.cs:**
```
Line 42:  List<IMyShipConnector> oreC - declares list
Line 241: oreC.Clear() - clears list on rescan
Line 258: Adds connectors with "ORE" in name to list
Line 306: ScanMinerGrids() - READS status only
Line 452: Transfers items FROM connected miners, never touches connector
```

### CONCLUSION: External Cause

**Unity scripts DO NOT disable or disconnect ore connectors.** The issue must be:

1. **PAM Script** - Check if PAM manipulates connectors on arrival/departure
2. **Connector Block Settings** - Verify strength is maxed, auto-lock enabled
3. **Timer Blocks** - Check for connector toggle commands
4. **Sensor Blocks** - Check for connector triggers
5. **SE Physics** - Ships pushing apart on grid merge/unmerge
6. **Power Loss** - Connectors release when unpowered

### User Action Required

Check in-game:
- [ ] Ore connector "Strength" setting (should be max)
- [ ] Ore connector "Auto-Lock" enabled
- [ ] PAM script connector handling
- [ ] Timer blocks with connector actions
- [ ] Sensor blocks near docking area

---

## Documentation Refresh — Multi-Pad Isolation (2026-01-28)

**What changed in code (already deployed):**
1. `DiscoverSiblingPads()` uses `IsSameConstructAs(Me)` in Boot + Pad
2. `UNITY_BOOT_REQ` messages include padID (`PAD_CHECK:{padID}`)
3. `UNITY_SETUP_CMD` filtered by padID — only matching boot PB runs setup
4. `DETONATE` / `DEORBIT` bare commands removed — must include `:{padID}`
5. Fallback PB discovery removed from UnityPad `FindSiblingPBs()`
6. SETUPMOD re-tags blocks with old [PAD] tags instead of skipping

**Updated deployed sizes:** Boot=30,372 | Pad=96,265 | Missile=44,563 | Inventory=99,582 | Beacon=~16,600 | Signal=47,118

### BATCH 1: Main Project .claude/ (6 files)

| # | File | Status | Update |
|---|------|--------|--------|
| M1 | `.claude/CLAUDE.md` | **DONE** | IGC channels, char budgets, multi-pad setup, DiscoverSiblingPads, PB discovery |
| M2 | `.claude/TODO.md` | **DONE** | This file — fresh task list |
| M3 | `.claude/FINALIZED.md` | **DONE** | Add multi-pad isolation work |
| M4 | `.claude/ARCHITECTURE.md` | **DONE** | IGC padID filtering, multi-pad arch |
| M5 | `.claude/README.md` | **DONE** | .claude folder overview refresh |
| M6 | `.claude/MINIFY.md` | **DONE** | Update char counts |

### BATCH 2: Main Templates (3 files)

| # | File | Status | Update |
|---|------|--------|--------|
| T1 | `.claude/templates/CHARACTER_BUDGETS.md` | **DONE** | All new deployed counts |
| T2 | `.claude/templates/IGC_CHANNELS.md` | **DONE** | padID filtering docs |
| T3 | `.claude/templates/COMPILE_ORDER.md` | **DONE** | Multi-pad setup order |

### BATCH 3: Main Agents (6 script-specific)

| # | File | Status | Update |
|---|------|--------|--------|
| A1 | `.claude/agents/unity-boot.md` | **DONE** | IsSameConstructAs, setup filtering, BOOT_REQ padID |
| A2 | `.claude/agents/unity-pad.md` | **DONE** | DiscoverSiblingPads, removed fallback, BOOT_REQ |
| A3 | `.claude/agents/unity-missile.md` | **DONE** | DETONATE padID-only safety |
| A4 | `.claude/agents/unity-inventory.md` | **DONE** | BOOT_REQ filtering, char budget |
| A5 | `.claude/agents/unity-signal.md` | **DONE** | BOOT_REQ filtering, char budget |
| A6 | `.claude/agents/unity-beacon.md` | **DONE** | Multi-pad context |

### BATCH 4: Main README

| # | File | Status | Update |
|---|------|--------|--------|
| R1 | `README.md` | **DONE** | Multi-pad setup guide, char budgets, setup commands |

### BATCH 5: Unity Boot sub-project (5 files)

| # | File | Status | Update |
|---|------|--------|--------|
| B1 | `src/scripts/Unity Boot/.claude/CLAUDE.md` | **DONE** | IsSameConstructAs, SETUP_CMD filter, BOOT_REQ padID |
| B2 | `src/scripts/Unity Boot/.claude/TODO.md` | **DONE** | Clear completed items |
| B3 | `src/scripts/Unity Boot/.claude/FINALIZED.md` | **DONE** | Add multi-pad work |
| B4 | `src/scripts/Unity Boot/README.md` | **DONE** | Multi-pad discovery, char count |
| B5 | `src/scripts/Unity Boot/Instructions.readme` | **DONE** | Check/update |

### BATCH 6: UnityPad sub-project (5 files)

| # | File | Status | Update |
|---|------|--------|--------|
| P1 | `src/scripts/UnityPad/.claude/CLAUDE.md` | **DONE** | IsSameConstructAs, removed fallback, BOOT_REQ, char budget |
| P2 | `src/scripts/UnityPad/.claude/TODO.md` | **DONE** | Clear completed items |
| P3 | `src/scripts/UnityPad/.claude/FINALIZED.md` | **DONE** | Add multi-pad work |
| P4 | `src/scripts/UnityPad/README.md` | **DONE** | Multi-pad, char count, setup commands |
| P5 | `src/scripts/UnityPad/Instructions.readme` | **DONE** | Check/update |

### BATCH 7: UnityMissile sub-project (5 files)

| # | File | Status | Update |
|---|------|--------|--------|
| MS1 | `src/scripts/UnityMissile/.claude/CLAUDE.md` | **DONE** | DETONATE padID-only, char budget |
| MS2 | `src/scripts/UnityMissile/.claude/TODO.md` | **DONE** | Clear completed items |
| MS3 | `src/scripts/UnityMissile/.claude/FINALIZED.md` | **DONE** | Add completed work |
| MS4 | `src/scripts/UnityMissile/README.md` | **DONE** | DETONATE docs, char count |
| MS5 | `src/scripts/UnityMissile/Instructions.readme` | **DONE** | Check/update |

### BATCH 8: UnityInventory sub-project (5 files)

| # | File | Status | Update |
|---|------|--------|--------|
| I1 | `src/scripts/UnityInventory/.claude/CLAUDE.md` | **DONE** | BOOT_REQ filtering, char budget (0.4%!) |
| I2 | `src/scripts/UnityInventory/.claude/TODO.md` | **DONE** | Clear completed items |
| I3 | `src/scripts/UnityInventory/.claude/FINALIZED.md` | **DONE** | Add completed work |
| I4 | `src/scripts/UnityInventory/README.md` | **DONE** | Char count, multi-pad context |
| I5 | `src/scripts/UnityInventory/Instructions.readme` | **DONE** | Check/update |

### BATCH 9: UnityBeacon sub-project (5 files)

| # | File | Status | Update |
|---|------|--------|--------|
| BC1 | `src/scripts/UnityBeacon/.claude/CLAUDE.md` | **DONE** | Multi-pad context, PadID filtering |
| BC2 | `src/scripts/UnityBeacon/.claude/TODO.md` | **DONE** | Clear completed items |
| BC3 | `src/scripts/UnityBeacon/.claude/FINALIZED.md` | **DONE** | Add completed work |
| BC4 | `src/scripts/UnityBeacon/README.md` | **DONE** | Multi-pad filtering |
| BC5 | `src/scripts/UnityBeacon/Instructions.readme` | **DONE** | Check/update |

### BATCH 10: UnitySignal sub-project (4 files)

| # | File | Status | Update |
|---|------|--------|--------|
| S1 | `src/scripts/UnitySignal/.claude/CLAUDE.md` | **DONE** | BOOT_REQ filtering, char budget |
| S2 | `src/scripts/UnitySignal/.claude/TODO.md` | **DONE** | Clear completed items |
| S3 | `src/scripts/UnitySignal/.claude/FINALIZED.md` | **DONE** | Add completed work |
| S4 | `src/scripts/UnitySignal/README.md` | **DONE** | Char count, multi-pad context |

### BATCH 11: UnityNuke sub-project (2 files)

| # | File | Status | Update |
|---|------|--------|--------|
| N1 | `src/scripts/UnityNuke/README.md` | **DONE** | Check/update |
| N2 | `src/scripts/UnityNuke/Instructions.readme` | **DONE** | Check/update |

### BATCH 12: Cross-project agent copies (~70 files)

| # | Location | Status | Update |
|---|----------|--------|--------|
| X1 | `src/scripts/Unity Boot/.claude/agents/*.md` | **DONE** | Sync with main agents |
| X2 | `src/scripts/UnityPad/.claude/agents/*.md` | **DONE** | Sync with main agents |
| X3 | `src/scripts/UnityMissile/.claude/agents/*.md` | **DONE** | Sync with main agents |
| X4 | `src/scripts/UnityInventory/.claude/agents/*.md` | **DONE** | Sync with main agents |
| X5 | `src/scripts/UnityBeacon/.claude/agents/*.md` | **DONE** | Sync with main agents |
| X6 | `src/scripts/UnitySignal/.claude/agents/*.md` | **DONE** | Sync with main agents |

### BATCH 13: Workspace root + misc

| # | File | Status | Update |
|---|------|--------|--------|
| W1 | `../.claude/CLAUDE.md` (workspace root) | **DONE** | Project table, UnityNuke status |
| W2 | `.claude/PROBLEMS.md` | **DONE** | Char budgets |
| W3 | `.claude/plans/documentation-update-2026-01-26.md` | **DONE** | Mark superseded |

### Previous Doc Tasks (2026-01-26/27) — ALL COMPLETE

| # | File | Status | Description |
|---|------|--------|-------------|
| D1-D3 | Core docs | **COMPLETE** | FINALIZED, CLAUDE.md, ARCHITECTURE.md |
| D4-D6 | UnityInventory docs | **COMPLETE** | CLAUDE.md, FINALIZED.md, README.md |
| D7-D13 | Agent files (7 locations) | **COMPLETE** | unity-inventory.md across all projects |
| D14 | CHARACTER_BUDGETS template | **COMPLETE** | Updated to 95,641 |

---

## Code Bugs (Pending)

### Critical

| # | Bug | Script | Status |
|---|-----|--------|--------|
| C1 | CustomData Overwrite | src/scripts/UnityPad.cs:924 | PENDING |
| C2 | Inventory Boot Listener | src/scripts/UnityInventory.cs | PENDING |
| C3 | REENTRY Instant Transition | src/scripts/UnityMissile.cs:306 | PENDING |
| C4 | MANUAL Mode Null Target | src/scripts/UnityMissile.cs | PENDING |

### High Priority

| # | Bug | Script | Status |
|---|-----|--------|--------|
| H1 | Signal Laser Target Logic | src/scripts/UnitySignal.cs:350 | PENDING |
| H2 | Filter Antennas by Tag | src/scripts/UnitySignal.cs | PENDING |
| H3 | S.AMMO State Dead Code | src/scripts/UnityPad.cs | PENDING |
| H4 | Satellite Grid Always (0,0) | src/scripts/UnityPad.cs | PENDING |
| H5 | SAT_HOLD Instant Deorbit | src/scripts/UnityMissile.cs | PENDING |
| H6 | Satellite Never Detonates | src/scripts/UnityMissile.cs | PENDING |
| H7 | Boot Timeout Fakes Responses | src/scripts/Unity Boot.cs | PENDING |
| H8 | Clean Button Panel Writes | src/scripts/UnityPad.cs | PENDING |

---

## Features (Pending)

| # | Feature | Script | Status |
|---|---------|--------|--------|
| F1 | Multi-Pad Door Coordination | src/scripts/UnitySignal.cs | PENDING |
| F2 | Boot Door & Pressure Checks | src/scripts/Unity Boot.cs | PENDING |

---

## Completed Today (2026-01-27)

### Missile Loading/Fueling Fix

| Fix | Description | Lines |
|-----|-------------|-------|
| **Pad H2 Stockpile** | Set `padH2.Stockpile=false` in FUEL state so gas flows TO missile | src/scripts/UnityPad.cs:971 |
| **Remove Stale ammoStock Check** | Removed `&&ammoStock>0` guard that blocked ammo transfer | src/scripts/UnityPad.cs:980 |
| **Fix ammoReady Logic** | Removed stale `(ammoStock<=0&&mslAmmo>0)` fallback - now checks missile directly | src/scripts/UnityPad.cs:989 |
| **Remove CanTransferItemTo** | Removed conveyor check that blocked ammo transfers in LoadMissileAmmo | src/scripts/UnityInventory.cs:704 |

**Root Causes Fixed:**
1. H2 wasn't transferring because pad tanks had `Stockpile=true` (hoarding gas instead of pushing)
2. Ammo transfer was blocked by stale `ammoStock` variable that only updated from CustomData
3. `ammoReady` check had faulty logic that never passed when ammoStock was stale
4. Inventory's `CanTransferItemTo()` check was blocking valid same-construct transfers

### UnityInventory Fixes

| Fix | Description | Lines |
|-----|-------------|-------|
| **Turret Ammo Recycling** | Fixed using wrong target variable, added Missile200mm to turBP | src/scripts/UnityInventory.cs:361-365 |
| **Hard Floor Lock** | Added `if(stk<=tgt)continue;` to prevent recycling at/below target | src/scripts/UnityInventory.cs:402, 413 |
| **Personal Ammo Defaults** | Each ammo independent, defaults to 500, switchable individually | src/scripts/UnityInventory.cs:428 |
| **Ammo Type Switch** | Old type resets to 500, new type gets mslAmmoTarget | src/scripts/UnityInventory.cs:606, 677 |
| **Bottle Recycling** | Added bottleCargo loop to RecycleExcess | src/scripts/UnityInventory.cs:408+ |
| **Display Format** | All items show excess with `-` sign (e.g., `500-100/400`) | src/scripts/UnityInventory.cs:549-558 |
| **Turret Ammo Counting** | Now counts from oreCargo, sharedCargo, subgridCargo | src/scripts/UnityInventory.cs:337-341 |
| **Defense LCD** | UnitySignal shows all 7 turret ammo types (was 4) | src/scripts/UnitySignal.cs:863 |

### Previous (2026-01-26)

| Fix | Description | Lines |
|-----|-------------|-------|
| **Bottle Counting** | Uses `GetItemAmount(h2BottleType/o2BottleType)` instead of unreliable string matching | src/scripts/UnityInventory.cs:318-320 |
| **mslAmmoTarget Minimum** | `if(mslAmmoTarget<1000)mslAmmoTarget=50000;` prevents corrupted Storage | src/scripts/UnityInventory.cs:142 |
| **ammoTypeIdx Sync** | ReadPadSettings reads `type` from padPB.CustomData, calls UpdateAmmoType() | src/scripts/UnityInventory.cs:675 |
| **CanTransferItemTo Removed** | Removed conveyor check bottleneck - subgrid transfers now work | src/scripts/UnityInventory.cs:446, 458 |
| **Production Target Logic** | `prodTgt = ammoTypeIdx==0 ? mslAmmoTarget : ammoTarget` | src/scripts/UnityInventory.cs:350 |

---

## Character Budgets (Updated 2026-01-28)

| Script | Deployed | Budget | Margin | Status |
|--------|----------|--------|--------|--------|
| Unity Boot | 30,372 | 100,000 | 69.6% | OK |
| UnityPad | **96,265** | 100,000 | **3.7%** | **CRITICAL** |
| UnityMissile | 44,563 | 100,000 | 55.4% | OK |
| UnityInventory | **99,582** | 100,000 | **0.4%** | **CRITICAL** |
| UnityBeacon | ~16,600 | 100,000 | 83.4% | OK |
| UnitySignal | 47,118 | 100,000 | 52.9% | OK |

**WARNING:** UnityInventory at 99.6% — basically ZERO room. UnityPad at 96.3% — very tight.

---

*Unity AI Lab - Task Management Division*
