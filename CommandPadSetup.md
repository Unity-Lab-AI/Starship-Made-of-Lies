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

Paste/place the blueprint as a new grid near your existing construct. **DO NOT connect it yet.** At this point, all blocks on the new grid still have `[PAD1]` tags from the original.

### Step 3: Compile All Scripts While Disconnected

**CRITICAL: The new pad must NOT be connected to your base yet.** If you connect two `[PAD1]` grids, the inventory and signal scripts will see blocks on both pads and cause conflicts (doubled inventory counts, LCD errors, etc.).

Open each PB on the **new grid** (still named `[PAD1]` at this point) and compile in order:

1. `[PAD1] Unity Pad` - compile first (clears CustomData, sets `pad_ready=true`)
2. `[PAD1] Unity Inventory` - compile second (sets `inv_ready=true`)
3. `[PAD1] UNITY SIGNAL` - compile third (sets `signal_ready=true`)
4. `[PAD1] UNITY BOOT` - compile last (runs 26 boot checks, sets `boot_complete=true`)

**Why this order matters:** Each script wipes its own PB's CustomData on compile. Boot reads ready flags from the other PBs, so they must compile first.

### Step 4: Run SETPAD:2 While Disconnected

After boot completes on the new grid, run `SETPAD:2` as a **PB argument on the Pad PB** (not the Boot PB):

1. Open the terminal for `[PAD1] Unity Pad` on the **new grid**
2. In the argument field, type: `SETPAD:2`
3. Click "Run"

**What happens:**
- The Pad PB sends `SETPAD|1|2` via IGC on the `UNITY_SETUP_CMD` channel
- The Boot PB on the same grid receives this message
- Boot sets padID to 2 and calls `SetupModule(true)` (force mode)
- All blocks on the pad grid, subgrids, and connected ships are renamed from `[PAD1]` to `[PAD2]`

**Why SETPAD instead of SETUPMOD?** SETUPMOD auto-detects the next padID by scanning connected pads, which requires the connector to be linked. But connecting two `[PAD1]` pads causes inventory and LCD conflicts. `SETPAD:N` lets you explicitly choose the padID while disconnected, avoiding all cross-pad contamination.

### Step 5: Verify the Rename

After SETPAD completes, check the terminal. All blocks on the new grid should now have `[PAD2]` tags:

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

**Every single block is renamed** — missiles, printer components, docked ships (miners/beacons on ore connectors), PBs, everything. No exceptions. The Boot PB itself is handled by `RenameSiblingPBs()` which gives all 4 PBs their proper names (e.g., `[PAD2] UNITY BOOT`, `[PAD2] Unity Pad`, etc.).

### Step 6: Connect Via Connectors

Now that all blocks are renamed to `[PAD2]`, it's safe to connect:

- Dock the new pad grid to your existing construct using connectors
- Lock the connector pair
- The pads will be on separate physical grids connected mechanically

### Step 7: Recompile All Scripts

After connecting and renaming, recompile all scripts on the PAD2 grid in order:

1. `[PAD2] Unity Pad`
2. `[PAD2] Unity Inventory`
3. `[PAD2] UNITY SIGNAL`
4. `[PAD2] UNITY BOOT`

The scripts will now pick up the `[PAD2]` tags, find their own sibling PBs, and operate independently from PAD1.

---

## Adding PAD3 and Beyond

The process is identical to adding PAD2:

1. Blueprint and place another copy of the pad grid (**don't connect yet**)
2. Compile all 4 scripts while disconnected (PAD -> INV -> SIGNAL -> BOOT)
3. Run `SETPAD:3` on the new grid's Pad PB (or whatever the next number is)
4. Connect via connectors to the existing construct
5. Recompile all scripts on the new grid

You choose the padID yourself with `SETPAD:N`. If you have PAD1 and PAD2, use `SETPAD:3` for the next one. If PAD2 was removed and you want to reuse the number, use `SETPAD:2`.

Alternatively, if the pad is **already connected** and you know what number to assign, you can still use `SETPAD:N` — but connect only AFTER renaming to avoid inventory conflicts from duplicate `[PAD1]` tags.

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
| `SETPAD:N` | **Primary setup command.** Run on new pad BEFORE connecting to base. | Sets padID to N and force-renames all blocks from current padID to `[PAD{N}]`. Works disconnected — no auto-detection needed. Example: `SETPAD:2`, `SETPAD:5`. |
| `SETUPMOD` | After connecting, if blocks need re-tagging | Auto-detects next padID via connected pads, renames blocks. **Only use when already connected** — requires seeing other pads to pick the right number. Skips blocks already tagged with the correct padID. |
| `SETUPFORCE` | When blocks have wrong tags or need re-renaming | Same as SETUPMOD but strips ALL existing `[PAD]` tags first, then re-applies. Use when SETUPMOD skipped blocks it shouldn't have. |
| `NAMEPAD` | After manually adding new blocks to a pad grid | Renames untagged utility blocks (batteries, tanks, cargo, etc.) with `[PAD]` prefix. Does not set padID-specific tags. |
| `NAMEMSL` | After a new missile is printed and merged | Increments build number and renames missile blocks. Called automatically during print cycle, but can be run manually. Also auto-renames connectors. |
| `SETPADCONTROL` | To designate/remove a pad as controller | Toggles controller mode on the pad. Only one pad should be controller. |
| `CLAIM` | If padID is 0 (unset) | Claims the next available padID and updates the pad tag. Normally not needed since SETUPMOD handles this. |
| `SETUP` | To open the setup wizard | Switches the LCD menu to the INITIAL SETUP wizard screen showing pad readiness checklist. |

---

## How SETUPMOD Works (Technical Details)

### Block Scope

`SetupModule()` in Unity Boot.cs renames blocks across three scopes:
1. **Pad grid** (`CubeGrid==Me.CubeGrid`) - all blocks on the same physical grid, including missiles, printer parts, and everything else (within 80m)
2. **Piston subgrids** - blocks on piston head grids (welders, projectors on printer arms)
3. **Connector-attached grids** - blocks on grids docked via connectors (miners, beacons), excluding grids that belong to other pads (detected by checking for UNITY BOOT/UNITY PAD PBs on those grids)

### PadID Auto-Detection

`GetNextPadID()` (line 554) calls `DiscoverSiblingPads()` which uses `IsSameConstructAs(Me)` to find ALL PBs named "UNITY PAD" or "UNITY BOOT" across the entire connected construct. It extracts their `[PAD#]` numbers and returns the first unused integer starting from 1.

### Missile Renaming

When a missile is merged, SETUPMOD renames all missile blocks with the new `[PAD#]` tag, preserving the `Missile #N` naming pattern. For example, `[PAD1] Missile #1 Thruster` becomes `[PAD2] Missile #1 Thruster`. This ensures missiles always carry the correct padID for their parent pad.

### Piston Subgrid Inclusion

Blocks on piston subgrids (the moving heads of pistons) are tracked via a `sG` HashSet of grid EntityIds. These subgrid blocks are renamed even though they're on a different `CubeGrid`, because they're part of the pad's printer mechanism. Printer blocks (with `-PRINT]` tags) get their padID portion updated: `[PAD1-PRINT] V1` becomes `[PAD2-PRINT] V1`.

### Connector-Attached Grid Renaming

SETUPMOD also renames blocks on grids docked via connectors (e.g., miners with beacons on ore connectors). It identifies these grids by finding all locked connectors on the pad grid and collecting their connected grids, excluding:
- Piston subgrids (already handled separately)
- Grids belonging to other pads (detected by presence of UNITY BOOT or UNITY PAD PBs)
- The pad grid itself

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
2. Place blueprint near base — DO NOT CONNECT YET
3. On NEW grid (still [PAD1]), compile in order:
   a. [PAD1] Unity Pad        (argument field empty, just compile)
   b. [PAD1] Unity Inventory
   c. [PAD1] UNITY SIGNAL
   d. [PAD1] UNITY BOOT        (wait for boot to complete)
4. On NEW grid's Pad PB, run argument: SETPAD:2
   → All blocks renamed from [PAD1] to [PAD2]
5. NOW connect the new [PAD2] grid to your base via connectors (lock them)
6. Recompile all 4 scripts on the now-[PAD2] grid:
   a. [PAD2] Unity Pad
   b. [PAD2] Unity Inventory
   c. [PAD2] UNITY SIGNAL
   d. [PAD2] UNITY BOOT
7. (Optional) On your main pad, run: SETPADCONTROL
   → Enables mass commands: BUILDALL, ARMALL, LAUNCHALL, ABORTALL
8. Repeat steps 1-6 for PAD3 (SETPAD:3), PAD4 (SETPAD:4), etc.
```

---

*Unity AI Lab - Missile Systems Division*
