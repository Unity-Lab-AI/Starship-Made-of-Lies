# UNIFIED COMPILE ORDER

**Last Updated:** 2026-01-24
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
  4. Unity Boot    → Reads ready flags, runs 23 checks, sets boot_complete=true
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
| 4 | **Unity Boot** | `[PAD1] UNITY BOOT` | Finds sibling PBs by name, reads ready flags, runs 23 checks |

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
Result:  boot_complete=true after 23 checks pass
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

## RECOMPILE SCENARIOS

### Adding a New Pad

1. Build new pad module (merge, connector, LCDs, buttons)
2. Add 4 new PBs with scripts
3. Name them with new pad ID: `[PAD2] Unity Pad`, etc.
4. Compile in order: PAD2 → INV2 → SIGNAL2 → BOOT2

### Updating a Single Script

1. Edit the script
2. Recompile ONLY that script
3. If changing Pad/Inventory/Signal: recompile Boot after

### Full System Reset

1. Recompile UnityPad
2. Recompile UnityInventory
3. Recompile UnitySignal
4. Recompile Unity Boot
5. Wait for 23-check boot sequence

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
