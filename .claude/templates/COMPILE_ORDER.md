# UNIFIED COMPILE ORDER

**Last Updated:** 2026-01-28
**Purpose:** In-game script compile order for Unity Missile System

---

## COMPILE ORDER SUMMARY

```
SEPARATE GRIDS (any order):
  Miner Grid:   UnityBeacon
  Missile Grid: UnityMissile

PAD GRID (must be in order):
  1. UnityPad      → Clears CustomData, sets pad_ready=true
  2. UnityInventory → Clears CustomData, sets inv_ready=true
  3. UnitySignal   → Clears CustomData, sets signal_ready=true
  4. Unity Boot    → Reads ready flags, runs 26 checks, sets boot_complete=true
```

---

## WHY THIS ORDER MATTERS

### Per-PB CustomData Architecture

**CRITICAL:** Each script writes ONLY to its own PB's `Me.CustomData`. There is NO shared CustomData storage.

| Step | Script | PB Name | Action |
|------|--------|---------|--------|
| 1 | **UnityPad** | `[PAD1] Unity Pad` | `ClearForBoot()` wipes Me.CustomData, writes `pad_ready=true` |
| 2 | **UnityInventory** | `[PAD1] Unity Inventory` | `ClearForBoot()` wipes Me.CustomData, writes `inv_ready=true` |
| 3 | **UnitySignal** | `[PAD1] UNITY SIGNAL` | `ClearForBoot()` wipes Me.CustomData, writes `signal_ready=true` |
| 4 | **Unity Boot** | `[PAD1] UNITY BOOT` | Finds sibling PBs by name, reads ready flags, runs 26 checks |

### How Boot Finds Other Scripts

Unity Boot uses `FindSiblingPBs()` to locate sibling PBs by name pattern:

```csharp
// Boot PB name: "[PAD1] UNITY BOOT"
// Searches grid for:
//   padPB: Contains "[PAD1]" AND "Unity Pad"
//   invPB: Contains "[PAD1]" AND "Unity Inventory"
//   signalPB: Contains "[PAD1]" AND "UNITY SIGNAL"
```

### Ready Flag Locations

| Script | Ready Flag | Written To |
|--------|------------|------------|
| UnityPad | `pad_ready=true` | `padPB.CustomData` [SYSTEM] section |
| UnityInventory | `inv_ready=true` | `invPB.CustomData` [SYSTEM] section |
| UnitySignal | `signal_ready=true` | `signalPB.CustomData` [SIGNAL] section |
| Unity Boot | `boot_complete=true` | `bootPB.CustomData` [SYSTEM] section |

---

## SEPARATE GRID SCRIPTS

These scripts run on different grids and can be compiled at any time:

### UnityBeacon (Miner Grid)

| PB Name | Grid | Compile When |
|---------|------|--------------|
| `[BEACON] Unity Beacon` | Miner ship | Any time |

- Runs independently on each miner
- Broadcasts via IGC to pad
- No dependencies on pad scripts

### UnityMissile (Missile Grid)

| PB Name | Grid | Compile When |
|---------|------|--------------|
| `[PAD1] Missile #1 Program` | Missile | Any time |

- Runs independently on each missile
- Receives config from pad via IGC at launch
- No dependencies on pad scripts (receives config at launch)

---

## PAD GRID COMPILE SEQUENCE

### Step 1: Compile UnityPad FIRST

```
PB Name: [PAD1] Unity Pad
Action:  ClearForBoot() wipes Me.CustomData
Result:  pad_ready=true in [SYSTEM] section
LCDs:    Show "PAD SCRIPT COMPILED - Next: Compile INVENTORY"
```

### Step 2: Compile UnityInventory SECOND

```
PB Name: [PAD1] Unity Inventory
Action:  ClearForBoot() wipes Me.CustomData
Result:  inv_ready=true in [SYSTEM] section
LCDs:    Show "INVENTORY SCRIPT COMPILED - Next: Compile SIGNAL"
```

### Step 3: Compile UnitySignal THIRD

```
PB Name: [PAD1] UNITY SIGNAL
Action:  ClearForBoot() wipes Me.CustomData
Result:  signal_ready=true in [SIGNAL] section
LCDs:    Show "SIGNAL SCRIPT COMPILED - Next: Compile BOOT"
```

### Step 4: Compile Unity Boot LAST

```
PB Name: [PAD1] UNITY BOOT
Action:  FindSiblingPBs(), CheckReadyFlags(), RunBootSequence()
Result:  boot_complete=true after 26 checks pass
LCDs:    Boot animation on ALL 11 LCDs, then releases to Pad/Inv/Signal
```

---

## AFTER BOOT COMPLETES

### LCD Allocation

| LCDs | Controller | Content |
|------|------------|---------|
| 1, 2, 3, 7, 8 | UnityPad | Main menu, build, missile, telemetry, target |
| 4, 5, 6, 9, 10, 11 | UnityInventory | Overview, power, graphs, miners, personal |
| `[PAD#CAMS]:*` | UnitySignal | Camera list display |

### Script States

| Script | State After Boot |
|--------|------------------|
| Unity Boot | Self-disabled (`UpdateFrequency.None`) |
| UnityPad | Running, owns LCDs 1,2,3,7,8 |
| UnityInventory | Running, owns LCDs 4,5,6,9,10,11 |
| UnitySignal | Running, owns camera LCDs |

---

## MULTI-PAD SETUP ORDER

Adding a new pad module to an existing grid? Here's the full setup flow. I'm gonna walk you through every step.

### Step-by-Step: Adding PAD2 (or PAD3, PAD4, etc.)

```
1. BLUEPRINT COPY    → Place the pad module blueprint on your grid
2. CONNECT           → Attach via CON1 (fuel) and CON2 (ammo) connectors
3. COMPILE PAD       → Compile UnityPad on the new module's PB
4. COMPILE INVENTORY → Compile UnityInventory on the new module's PB
5. COMPILE SIGNAL    → Compile UnitySignal on the new module's PB
6. COMPILE BOOT      → Compile Unity Boot on the new module's PB
7. RUN SETUPMOD      → Run "SETUPMOD" argument on the Boot PB
8. RE-COMPILE ALL    → Re-compile PAD → INV → SIGNAL → BOOT (now with correct names)
```

### Boot Setup Commands

These commands are run as arguments on the **Unity Boot** PB:

| Command | What It Does |
|---------|--------------|
| `SETUPMOD` | Auto-detects the next available pad number, renames ALL blocks on the module with `[PAD#]` tags (PBs, LCDs, merge, connectors, buttons, etc.) |
| `SETUPFORCE` | Same as SETUPMOD but forces re-rename even if blocks already have `[PAD#]` tags. Use when fixing a botched setup. |
| `NAMEPAD` | Renames just the pad PBs (Boot, Pad, Inventory, Signal) with the correct `[PAD#]` prefix |
| `NAMEMSL` | Renames the missile PB to `[PAD#] Missile #1 Program` matching the pad's number |
| `SETPADCONTROL` | Designates this pad as the controller pad - enables multi-pad aggregation mode |

### Why SETUPMOD Needs a Re-Compile

SETUPMOD renames all the blocks, but the scripts discovered their sibling PBs at compile time using the OLD names. After SETUPMOD renames everything from `[PAD1]` to `[PAD2]`, the PB references are stale. Re-compiling in order (PAD → INV → SIGNAL → BOOT) lets each script re-discover siblings with the new `[PAD2]` tag.

### Multi-Pad Isolation

Each pad module is fully isolated:
- All blocks tagged with `[PAD#]` (e.g., `[PAD2] Unity Pad`)
- LCDs tagged with `[PAD#:1-11]` (e.g., `[PAD2:1]`, `[PAD2:7]`)
- IGC messages filtered by padID so PAD1 and PAD2 don't interfere
- Missiles tagged with pad number so DETONATE only affects the right missile
- Miner beacons include `bcnPad` for per-pad fleet filtering
- Controller pad sees ALL pads and can issue mass commands

---

## RECOMPILE SCENARIOS

### Adding a New Pad

1. Place pad module blueprint on grid
2. Connect via CON1/CON2 connectors
3. Compile scripts in order: PAD → INV → SIGNAL → BOOT
4. Run `SETUPMOD` on Boot PB to auto-rename blocks
5. Re-compile all four scripts in order (PAD → INV → SIGNAL → BOOT)
6. Boot runs 26 checks and you're operational

### Updating a Single Script

1. Edit the script
2. Recompile ONLY that script
3. If changing Pad/Inventory/Signal: recompile Boot after

### Full System Reset

1. Recompile UnityPad
2. Recompile UnityInventory
3. Recompile UnitySignal
4. Recompile Unity Boot
5. Wait for 26-check boot sequence

---

## TROUBLESHOOTING

### Boot Shows "WAITING FOR SCRIPTS"

**Cause:** Boot can't find ready flags from sibling PBs

**Fix:**
1. Check PB names match pattern: `[PAD1] Unity Pad`, `[PAD1] Unity Inventory`
2. Recompile Pad, then Inventory, then Boot

### Boot Stuck on Check #6 or #11

**Cause:** Pad or Inventory not responding to IGC

**Fix:**
1. Check both scripts are running (not stopped)
2. Recompile in correct order

### LCDs Not Updating After Boot

**Cause:** Boot didn't release LCD control

**Fix:**
1. Check boot_complete=true in Boot PB's CustomData
2. Recompile Boot if needed

---

## QUICK REFERENCE

```
MINER:    UnityBeacon (any time)
MISSILE:  UnityMissile (any time)

PAD GRID (in order):
  1. UnityPad      [PAD1] Unity Pad
  2. UnityInventory [PAD1] Unity Inventory
  3. UnitySignal   [PAD1] UNITY SIGNAL
  4. Unity Boot    [PAD1] UNITY BOOT
```

---

*Unity AI Lab - Compile Order Reference*
