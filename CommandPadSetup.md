# Unity Missile System - Multi-Pad Setup Guide

## Overview

The Unity Missile System supports multiple independent launch pads connected via connectors, all coordinated through IGC messaging. Each pad has its own set of 4 Programmable Blocks (Boot, Pad, Inventory, Signal) and operates independently with its own padID tag (e.g., `[PAD1]`, `[PAD2]`, `[PAD3]`).

One pad can be designated as the **Controller**, gaining mass-command capability over all connected slave pads.

### Topology

```
[PAD3 Grid]-CON1><CON2-[PAD1 Grid (CONTROLLER)]-CON2><CON1-[PAD2 Grid]
```

Each pad grid connects to the construct via a CON1/CON2 connector pair. `IsSameConstructAs` spans all connected grids, allowing pads to discover each other. `CubeGrid` isolates each pad's blocks to its own physical grid only.

---

## Prerequisites

Before adding a second pad, your existing PAD1 must be fully operational:

- All 4 PBs compiled and running: `[PAD1] Unity Pad`, `[PAD1] Unity Inventory`, `[PAD1] UNITY SIGNAL`, `[PAD1] UNITY BOOT`
- Boot sequence completed (`boot_complete=true`)
- All LCDs tagged and working
- At least one connector available on your base for docking the new pad

---

## Step-by-Step: Adding PAD2

### Step 1: Blueprint the Existing Pad

In Space Engineers, create a blueprint of your working PAD1 grid (the entire pad grid including all PBs, LCDs, connectors, merge block, printer pistons, welders, projector, etc.).

### Step 2: Place the Blueprint

Paste/place the blueprint as a new grid near your existing construct. At this point, all blocks on the new grid still have `[PAD1]` tags from the original.

### Step 3: Connect Via Connectors

Dock the new grid to your existing construct using connectors:

- The new pad grid should have connectors that will become `[PAD2-CON1]` and `[PAD2-CON2]`
- Connect one of them to a connector on your base/existing construct
- Lock the connector pair

The connector naming convention:
- **CON1** and **CON2** are the first two connectors found on the pad grid (excluding ore ejectors)
- These are the pad's "umbilical" connectors for linking to the base construct
- Additional connectors beyond the first two get named `[PAD#] Con`

### Step 4: Compile All Scripts on the New Grid

Open each PB on the **new grid** (still named `[PAD1]` at this point) and compile in order:

1. `[PAD1] Unity Pad` - compile first (clears CustomData, sets `pad_ready=true`)
2. `[PAD1] Unity Inventory` - compile second (sets `inv_ready=true`)
3. `[PAD1] UNITY SIGNAL` - compile third (sets `signal_ready=true`)
4. `[PAD1] UNITY BOOT` - compile last (runs 26 boot checks, sets `boot_complete=true`)

**Why this order matters:** Each script wipes its own PB's CustomData on compile. Boot reads ready flags from the other PBs, so they must compile first.

### Step 5: Run SETUPMOD

After boot completes on the new grid, run `SETUPMOD` as a **PB argument on the Pad PB** (not the Boot PB):

1. Open the terminal for `[PAD1] Unity Pad` on the **new grid**
2. In the argument field, type: `SETUPMOD`
3. Click "Run"

**What happens:**
- The Pad PB sends `SETUPMOD|{padID}` via IGC on the `UNITY_SETUP_CMD` channel
- The Boot PB on the same grid receives this message
- Boot calls `GetNextPadID()` which scans ALL connected pads via `IsSameConstructAs` and finds the next unused integer (in this case, 2)
- Boot calls `SetupModule()` which renames every block on `CubeGrid==Me.CubeGrid` (same physical grid only)

### Step 6: Verify the Rename

After SETUPMOD completes, check the terminal. All blocks on the new grid should now have `[PAD2]` tags:

| Before (PAD1 tags) | After (PAD2 tags) |
|---------------------|-------------------|
| `[PAD1] Unity Pad` | `[PAD2] Unity Pad` |
| `[PAD1] UNITY BOOT` | `[PAD2] UNITY BOOT` |
| `[PAD1] Unity Inventory` | `[PAD2] Unity Inventory` |
| `[PAD1] UNITY SIGNAL` | `[PAD2] UNITY SIGNAL` |
| `[PAD1] Merge` | `[PAD2] Merge` |
| `[PAD1-CON1]` | `[PAD2-CON1]` |
| `[PAD1-CON2]` | `[PAD2-CON2]` |
| `[PAD1:1] LCD` | `[PAD2:1] LCD` |
| `[PAD1:2] LCD` | `[PAD2:2] LCD` |
| ... | ... |

**Blocks that are NOT renamed:**
- Blocks containing `Missile #` (missile PB and parts)
- Blocks containing `-PRINT` (printer components already tagged)
- The Boot PB itself (`Me` is skipped, but `RenameSiblingPBs()` renames it afterward)
- Blocks more than 80m from the Boot PB
- Blocks on the missile side of the merge block (dot product check)

### Step 7: Recompile All Scripts

After renaming, recompile all scripts on the newly renamed PAD2 grid in order:

1. `[PAD2] Unity Pad`
2. `[PAD2] Unity Inventory`
3. `[PAD2] UNITY SIGNAL`
4. `[PAD2] UNITY BOOT`

The scripts will now pick up the new `[PAD2]` tags and operate independently from PAD1.

---

## Adding PAD3 and Beyond

The process is identical to adding PAD2:

1. Blueprint and place another copy of the pad grid
2. Connect via connectors to the existing construct
3. Compile all 4 scripts (PAD -> INV -> SIGNAL -> BOOT)
4. Run `SETUPMOD` on the new grid's Pad PB
5. `GetNextPadID()` automatically finds the next available ID (3, 4, etc.)
6. Recompile all scripts on the new grid

The system auto-increments padIDs. If you have PAD1 and PAD3 (PAD2 was removed), the next `SETUPMOD` will assign PAD2 to fill the gap.

---

## Setting Up Controller Mode

One pad should be designated as the controller to coordinate mass operations.

### Enable Controller Mode

On the pad you want as controller, run `SETPADCONTROL` as a PB argument on the **Pad PB**:

1. Open the terminal for `[PAD1] Unity Pad` (or whichever pad)
2. Type `SETPADCONTROL` in the argument field
3. Click "Run"

This toggles the `isCtl` flag (persisted in Storage). Run it again to disable controller mode.

### Controller Mass Commands

When a pad is in controller mode, these commands become available (run as PB arguments on the controller Pad PB):

| Command | What It Does |
|---------|--------------|
| `BUILDALL` | Triggers print/build on all connected slave pads |
| `ARMALL` | Arms all slave pads that are in READY state |
| `LAUNCHALL` | Launches all armed slave pads (salvo fire) |
| `ABORTALL` | Sends abort/detonate to all active slave pad launches |
| `COPYTGT` | Copies the controller's current target GPS to all slaves |
| `STARTSALVO` | Begins automated salvo sequence across all pads |
| `STOPSALVO` | Stops the salvo sequence |

Mass commands are broadcast on the `UNITY_PAD_CMD` IGC channel. Slave pads filter by `fromPad==padID` to only execute commands from their controller, and the `!isCtl` check ensures the controller doesn't execute its own mass commands as a slave.

---

## Command Reference

All setup commands are run as **PB arguments on the Pad PB** (`[PAD#] Unity Pad`). The Pad PB forwards them to the Boot PB via IGC.

| Command | When to Use | What It Does |
|---------|-------------|--------------|
| `SETUPMOD` | After placing and booting a new pad grid | Auto-detects next padID, renames all blocks on this grid from old tags to new `[PAD#]` tags. Skips blocks already tagged with the correct padID. |
| `SETUPFORCE` | When blocks have wrong tags or need re-renaming | Same as SETUPMOD but strips ALL existing `[PAD]` tags first, then re-applies. Use when SETUPMOD skipped blocks it shouldn't have. |
| `NAMEPAD` | After manually adding new blocks to a pad grid | Renames untagged utility blocks (batteries, tanks, cargo, etc.) with `[PAD]` prefix. Does not set padID-specific tags. |
| `NAMEMSL` | After a new missile is printed and merged | Increments build number and renames missile blocks. Called automatically during print cycle, but can be run manually. Also auto-renames connectors. |
| `SETPADCONTROL` | To designate/remove a pad as controller | Toggles controller mode on the pad. Only one pad should be controller. |
| `CLAIM` | If padID is 0 (unset) | Claims the next available padID and updates the pad tag. Normally not needed since SETUPMOD handles this. |
| `SETUP` | To open the setup wizard | Switches the LCD menu to the INITIAL SETUP wizard screen showing pad readiness checklist. |

---

## How SETUPMOD Works (Technical Details)

### Block Scope

`SetupModule()` in Unity Boot.cs (line 560) operates on blocks matching `CubeGrid==Me.CubeGrid` - only blocks on the same physical grid as the Boot PB. This is the critical safety mechanism that prevents renaming blocks on other pads across connectors.

### PadID Auto-Detection

`GetNextPadID()` (line 554) calls `DiscoverSiblingPads()` which uses `IsSameConstructAs(Me)` to find ALL PBs named "UNITY PAD" or "UNITY BOOT" across the entire connected construct. It extracts their `[PAD#]` numbers and returns the first unused integer starting from 1.

### Missile-Side Exclusion

When a missile is merged (connected via merge block), the system:
1. Finds the closest merge block to the Boot PB
2. Determines the direction vector from the pad merge block toward the missile merge block
3. Any block with a dot product > 1 in that direction is excluded from renaming

This prevents SETUPMOD from accidentally renaming missile blocks that are temporarily merged to the pad.

### Piston Subgrid Inclusion

Blocks on piston subgrids (the moving heads of pistons) are tracked via a `sG` HashSet of grid EntityIds. These subgrid blocks ARE renamed even though they're on a different `CubeGrid`, because they're part of the pad's printer mechanism.

### Connector Naming

The first two connectors found on the grid (excluding those with "ORE" or "EJECTOR" in the name) become `[PAD#-CON1]` and `[PAD#-CON2]`. Additional connectors become `[PAD#] Con`. The CON1/CON2 connectors are the ones used for inter-pad docking.

### Force Mode

- **SETUPMOD (non-force):** Skips blocks that already have the correct `[PAD#]` tag. Strips tags from other pads (e.g., removes `[PAD1]` when assigning `[PAD2]`).
- **SETUPFORCE:** Strips ALL `[PAD]` tags from every block first, then re-applies. Use this when blocks have stale or incorrect tags.

---

## Troubleshooting

### Blocks on PAD1 got renamed to PAD2

This should not happen. `SetupModule()` uses `CubeGrid==Me.CubeGrid` which is physically isolated per grid. If this occurs:
- Check that the connectors are actually separate grids (not welded together)
- Run `SETUPFORCE` on the affected pad to re-rename its blocks correctly

### SETUPMOD didn't rename some blocks

- Blocks more than 80m from the Boot PB are excluded
- Blocks already tagged with the correct padID are skipped (non-force mode)
- Missile blocks (`Missile #`) and printer blocks (`-PRINT`) are excluded by design
- Try `SETUPFORCE` to force re-rename all blocks

### Missile blocks got wrong pad tag

Missile blocks should never be renamed by SETUPMOD (excluded by the `Missile #` name check and dot product direction check). If a missile has wrong tags:
- Run `NAMEMSL` on the Pad PB to properly name missile parts
- This is normally done automatically during the print cycle

### Scripts can't find sibling PBs after rename

After SETUPMOD renames all blocks, you must recompile all 4 scripts. `FindSiblingPBs()` matches by padID tag in the PB name, so the scripts won't find each other until they're recompiled with the new names in place.

### Controller commands don't reach slave pads

- Verify the controller pad has `SETPADCONTROL` toggled ON
- Verify slave pads are connected via connectors (locked)
- Verify slave pads have completed boot (`boot_complete=true`)
- Mass commands use IGC which requires all PBs to be running

### Two pads got the same padID

This shouldn't happen since `GetNextPadID()` scans all connected pads. If it does:
- Disconnect one pad
- Run `SETUPFORCE` on it
- Reconnect and run `SETUPMOD` again

---

## Quick Reference: Complete Setup Sequence

```
1. Blueprint PAD1 grid
2. Place blueprint near base
3. Connect new grid to base via connectors (lock them)
4. On NEW grid, compile in order:
   a. [PAD1] Unity Pad        (argument field empty, just compile)
   b. [PAD1] Unity Inventory
   c. [PAD1] UNITY SIGNAL
   d. [PAD1] UNITY BOOT        (wait for boot to complete)
5. On NEW grid's Pad PB, run argument: SETUPMOD
   → All blocks renamed from [PAD1] to [PAD2]
6. Recompile all 4 scripts on the now-[PAD2] grid:
   a. [PAD2] Unity Pad
   b. [PAD2] Unity Inventory
   c. [PAD2] UNITY SIGNAL
   d. [PAD2] UNITY BOOT
7. (Optional) On your main pad, run: SETPADCONTROL
   → Enables mass commands: BUILDALL, ARMALL, LAUNCHALL, ABORTALL
8. Repeat steps 1-6 for PAD3, PAD4, etc.
```

---

*Unity AI Lab - Missile Systems Division*
