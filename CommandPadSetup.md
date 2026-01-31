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

- All 4 PBs compiled and running: `[PAD1] Unity Pad`, `[PAD1] UNITY INVENTORY`, `[PAD1] UNITY SIGNAL`, `[PAD1] UNITY BOOT`
- Boot sequence completed (`boot_complete=true`)
- All LCDs tagged and working
- At least one connector available on your base for docking the new pad

---

## LCD Tag Format

All LCD and cockpit tags use the standard `[PAD#]` prefix followed by a space and the tag name. This ensures SETPAD can find and rename them correctly.

| Tag | Example Block Name | Script |
|-----|--------------------|--------|
| `[PAD1:1]` through `[PAD1:11]` | `[PAD1:2] LCD` | Boot (during boot), Pad (1-3,7-8), Inventory (4-6,9-11) |
| `[PAD1] SIGNAL` | `[PAD1] SIGNAL Status` | Signal |
| `[PAD1] DEFENSE` | `[PAD1] DEFENSE Panel` | Signal |
| `[PAD1] SATS` | `[PAD1] SATS Display` | Signal |
| `[PAD1] PRESSURE` | `[PAD1] PRESSURE Monitor` | Signal |
| `[PAD1] FLIGHT` | `[PAD1] FLIGHT Log` | Signal |
| `[PAD1]CAMS` | `[PAD1]CAMS Cockpit 1` | Signal (camera display) |
| `[CTRLCAMS]` | `[CTRLCAMS]:1 Cockpit` | Signal (controller camera) |

**IMPORTANT:** The SIGNAL/DEFENSE/SATS/PRESSURE/FLIGHT tags have a **space** after `]`. The CAMS tag has **no space** after `]`. This is how the scripts search for them — mismatched spacing means the LCD won't be found.

---

## Step-by-Step: Adding PAD2

### Step 1: Blueprint the Existing Pad

In Space Engineers, create a blueprint of your working PAD1 grid (the entire pad grid including all PBs, LCDs, connectors, merge block, printer pistons, welders, projector, etc.).

### Step 2: Place the Blueprint

Paste/place the blueprint as a new grid near your existing construct. **DO NOT connect it yet.** At this point, all blocks on the new grid still have `[PAD1]` tags from the original.

### Step 3: Compile All Scripts While Disconnected

**CRITICAL: The new pad must NOT be connected to your base yet.** If you connect two `[PAD1]` grids:
- **Inventory goes crazy** — `UnityInventory.Scan()` uses `IsSameConstructAs` and padTag matching, so it sees blocks on BOTH pads and doubles inventory counts
- **LCD errors** — Pad's `ShowCompileNotice()` writes to all LCDs matching the padID, hitting both pads' LCDs
- **PB discovery conflicts** — scripts may find the wrong pad's PBs

Open each PB on the **new grid** (still named `[PAD1]` at this point) and compile in order:

1. `[PAD1] Unity Pad` - compile first (clears CustomData, sets `pad_ready=true`)
2. `[PAD1] UNITY INVENTORY` - compile second (sets `inv_ready=true`)
3. `[PAD1] UNITY SIGNAL` - compile third (sets `signal_ready=true`)
4. `[PAD1] UNITY BOOT` - compile last (runs boot checks, sets `boot_complete=true`)

**Why this order matters:** Each script wipes its own PB's CustomData on compile. Boot reads ready flags from the other PBs, so they must compile first.

### Step 4: Run SETPAD:2 While Disconnected

After boot completes on the new grid, run `SETPAD:2` as a **PB argument on the Pad PB** (not the Boot PB):

1. Open the terminal for `[PAD1] Unity Pad` on the **new grid**
2. In the argument field, type: `SETPAD:2`
3. Click "Run"

**What happens:**
- The Pad PB sends `SETPAD|1|2` via IGC on the `UNITY_SETUP_CMD` channel
- The Boot PB on the same grid receives this message
- Boot's `SwapPadTag()` scans every block reachable via `IsSameConstructAs(Me)` and replaces the padID number in any `[PAD#]` tag
- Only the digit(s) after `[PAD` are changed — everything else in the name stays exactly the same

**How SwapPadTag works:** It finds `[PAD` in each block name, reads the digit(s) immediately after it, and if they don't match the target padID, replaces just those digits. This preserves slot numbers, suffixes, and everything else:
- `[PAD1:2] LCD` → `[PAD2:2] LCD` (`:2` preserved)
- `[PAD1-CON1]` → `[PAD2-CON1]` (`-CON1` preserved)
- `[PAD1] SIGNAL Status` → `[PAD2] SIGNAL Status`
- `[PAD1]CAMS Cockpit 1` → `[PAD2]CAMS Cockpit 1`
- `[PAD1] Missile #1 Thruster` → `[PAD2] Missile #1 Thruster`
- `[PAD1-PRINT] V1` → `[PAD2-PRINT] V1`

**Why SETPAD instead of SETUPMOD?** SETUPMOD auto-detects the next padID by scanning connected pads, which requires the connector to be linked. But connecting two `[PAD1]` pads causes inventory and LCD conflicts. `SETPAD:N` lets you explicitly choose the padID while disconnected, avoiding all cross-pad contamination.

**Re-running SETPAD:** If SETPAD missed some blocks (e.g., LCDs were tagged with old format), you can run `SETPAD:N` again. SwapPadTag scans for ANY `[PAD#]` tag that doesn't match the target and swaps it. So running `SETPAD:2` when PBs are already `[PAD2]` but some LCDs are still `[PAD1]` will fix those remaining LCDs.

### Step 5: Verify the Rename

After SETPAD completes, check the terminal. All blocks on the new grid should now have `[PAD2]` tags:

| Before (PAD1 tags) | After (PAD2 tags) |
|---------------------|-------------------|
| `[PAD1] Unity Pad` | `[PAD2] Unity Pad` |
| `[PAD1] UNITY BOOT` | `[PAD2] UNITY BOOT` |
| `[PAD1] UNITY INVENTORY` | `[PAD2] UNITY INVENTORY` |
| `[PAD1] UNITY SIGNAL` | `[PAD2] UNITY SIGNAL` |
| `[PAD1] Merge` | `[PAD2] Merge` |
| `[PAD1-CON1]` | `[PAD2-CON1]` |
| `[PAD1-CON2]` | `[PAD2-CON2]` |
| `[PAD1:1] LCD` | `[PAD2:1] LCD` |
| `[PAD1:2] LCD` | `[PAD2:2] LCD` |
| `[PAD1] SIGNAL Status` | `[PAD2] SIGNAL Status` |
| `[PAD1]CAMS Cockpit 1` | `[PAD2]CAMS Cockpit 1` |
| `[PAD1] Missile #1 Thruster` | `[PAD2] Missile #1 Thruster` |
| `[PAD1-PRINT] V1` | `[PAD2-PRINT] V1` |

**Every single block is renamed** — missiles, printer components, LCDs, cockpits, everything reachable via `IsSameConstructAs`. No exceptions. Only the padID digits change; all other name content is preserved.

**Miners on ore connectors:** Miners docked via ore connectors are reachable via `IsSameConstructAs` and will be renamed. However, if you want to rename miners independently (e.g., when undocked), use `SETPAD:N` on the miner's UnityBeacon PB — the Beacon script has its own SwapPadTag.

### Step 6: Connect Via Connectors

Now that all blocks are renamed to `[PAD2]`, it's safe to connect:

- Dock the new pad grid to your existing construct using connectors
- Lock the connector pair
- The pads will be on separate physical grids connected mechanically

### Step 7: Recompile All Scripts

After connecting and renaming, recompile all scripts on the PAD2 grid in order:

1. `[PAD2] Unity Pad`
2. `[PAD2] UNITY INVENTORY`
3. `[PAD2] UNITY SIGNAL`
4. `[PAD2] UNITY BOOT`

The scripts will now pick up the `[PAD2]` tags, find their own sibling PBs, and operate independently from PAD1.

**PadID persistence:** Each script extracts padID from its own PB name (`Me.CustomName`) on compile, overriding any stale value in Storage. So after SETPAD renames the PBs, recompiling correctly sets padID=2 in all scripts.

---

## Adding PAD3 and Beyond

The process is identical to adding PAD2:

1. Blueprint and place another copy of the pad grid (**don't connect yet**)
2. Compile all 4 scripts while disconnected (PAD → INV → SIGNAL → BOOT)
3. Run `SETPAD:3` on the new grid's Pad PB (or whatever the next number is)
4. Verify all blocks renamed correctly
5. Connect via connectors to the existing construct
6. Recompile all scripts on the new grid

You choose the padID yourself with `SETPAD:N`. If you have PAD1 and PAD2, use `SETPAD:3` for the next one. If PAD2 was removed and you want to reuse the number, use `SETPAD:2`.

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
| `SETPAD:N` | **Primary setup command.** Run on new pad BEFORE connecting to base. | Swaps the padID digits in every `[PAD#]` tag across all reachable blocks. Only changes the number — preserves everything else in block names. Can be re-run to catch missed blocks. Example: `SETPAD:2`, `SETPAD:5`. |
| `SETUPMOD` | After connecting, if blocks need re-tagging | Auto-detects next padID via connected pads, renames blocks using type-based naming. **Only use when already connected** — requires seeing other pads to pick the right number. |
| `SETUPFORCE` | When blocks have wrong tags or need re-renaming | Same as SETUPMOD but strips ALL existing `[PAD]` tags first, then re-applies. Use when SETUPMOD skipped blocks it shouldn't have. |
| `NAMEPAD` | After manually adding new blocks to a pad grid | Renames untagged utility blocks (batteries, tanks, cargo, etc.) with `[PAD]` prefix. Does not set padID-specific tags. |
| `NAMEMSL` | After a new missile is printed and merged | Increments build number and renames missile blocks. Called automatically during print cycle, but can be run manually. Also auto-renames connectors. |
| `SETPADCONTROL` | To designate/remove a pad as controller | Toggles controller mode on the pad. Only one pad should be controller. |
| `SETUP` | To open the setup wizard | Switches the LCD menu to the INITIAL SETUP wizard screen showing pad readiness checklist. |

**SETPAD:N vs SETUPMOD:** Use `SETPAD:N` for multi-pad setup — it's a pure tag swap that works while disconnected. Use `SETUPMOD` only for initial single-pad block naming (type-based renaming like assigning "Battery", "Merge", etc.). Never use SETUPMOD to change padID between pads — it does full type-based renaming which changes block names beyond just the padID.

---

## How SETPAD Works (Technical Details)

### SwapPadTag Algorithm

`SwapPadTag()` in Unity Boot.cs performs a digit-only replacement:

1. Scans all blocks via `IsSameConstructAs(Me)` — reaches all mechanically connected grids (connectors, pistons, rotors)
2. For each block, finds `[PAD` in the name
3. Reads the digit(s) immediately after `[PAD` (e.g., `1` from `[PAD1:2]`)
4. If those digits don't match the target padID, replaces just the digits
5. Everything after the digits stays untouched — `:2]`, `-CON1]`, `] SIGNAL`, `]CAMS`, etc.

This means `[PAD1:2] LCD` becomes `[PAD2:2] LCD`, NOT `[PAD2] LCD`. The slot number, suffix, and all other name content are preserved.

### IGC Flow

1. **Pad PB** receives `SETPAD:N` as argument
2. **Pad PB** sends `SETPAD|{currentPadID}|{N}` via IGC on `UNITY_SETUP_CMD`
3. **Boot PB** receives the message, verifies `fromID==padID` (so only this pad's Boot responds)
4. **Boot PB** updates its own padID, calls `UpdatePadTag()` and `Save()`, then runs `SwapPadTag()`

### Re-Running SETPAD

SETPAD can be safely re-run. Since SwapPadTag scans for ANY `[PAD#]` tag that doesn't match the target, it will catch blocks that were missed on a previous run. For example, if PBs were renamed to `[PAD2]` but some LCDs stayed `[PAD1]`, running `SETPAD:2` again will rename those remaining `[PAD1]` LCDs.

### Miner/Beacon SETPAD

UnityBeacon has its own `SETPAD:N` command and `SwapPadTag()` for renaming miner blocks independently. Run it on the Beacon PB when a miner is undocked and needs its padID changed.

---

## How SETUPMOD Works (Technical Details)

### Block Scope

`SetupModule()` in Unity Boot.cs renames blocks across all reachable scopes:
1. **Pad grid** (`CubeGrid==Me.CubeGrid`) - all blocks on the same physical grid
2. **Piston subgrids** - blocks on piston head grids (welders, projectors on printer arms)
3. **Connector-attached grids** - blocks on grids docked via connectors (miners, beacons), excluding grids that belong to other pads (detected by checking for UNITY BOOT/UNITY PAD PBs on those grids)

All blocks are renamed — missiles, printers, subgrids, everything. No exclusions.

### PadID Auto-Detection

`GetNextPadID()` calls `DiscoverSiblingPads()` which uses `IsSameConstructAs(Me)` to find ALL PBs named "UNITY PAD" or "UNITY BOOT" across the entire connected construct. It extracts their `[PAD#]` numbers and returns the first unused integer starting from 1.

### Force Mode

- **SETUPMOD (non-force):** Skips blocks that already have the correct `[PAD#]` tag. Strips tags from other pads (e.g., removes `[PAD1]` when assigning `[PAD2]`).
- **SETUPFORCE:** Strips ALL `[PAD]` tags from every block first, then re-applies. Use this when blocks have stale or incorrect tags.

---

## PadID Isolation

Each script finds sibling PBs using strict padID tag matching with the closing bracket:

```
FindSiblingPBs() searches for:
  Contains("[PAD2]") AND Contains("UNITY BOOT")   → finds bootPB
  Contains("[PAD2]") AND Contains("UNITY PAD")     → finds padPB
  Contains("[PAD2]") AND Contains("UNITY INVENTORY") → finds invPB
  Contains("[PAD2]") AND Contains("UNITY SIGNAL")  → finds signalPB
```

The closing bracket `]` is required to prevent PAD1 from matching PAD10, PAD11, etc.

### LCD Discovery

- **Numbered LCDs** (`[PAD1:1]` through `[PAD1:11]`): Found by Boot during boot, then handed off to Pad (1-3,7-8) and Inventory (4-6,9-11)
- **Signal LCDs** (`[PAD1] SIGNAL`, `[PAD1] DEFENSE`, `[PAD1] SATS`, `[PAD1] PRESSURE`, `[PAD1] FLIGHT`): Found by Boot during boot, then handed off to Signal
- **Camera LCDs** (`[PAD1]CAMS`): Found by Boot (generic "CAMS" check) and Signal

Boot draws to ALL LCDs during boot, then releases them with `WriteText("")` when boot completes. Operational scripts (Pad, Inventory, Signal) take over their respective LCDs after seeing `boot_complete=true`.

### ShowCompileNotice LCD Filter

When Pad compiles, `ShowCompileNotice()` writes the compile/boot notice to LCDs. It filters by `[PAD{padID}]` OR `[PAD{padID}:` OR `[PAD{padID}-` to match all tag formats while preventing cross-pad contamination (PAD1 won't write to PAD10's LCDs).

---

## Troubleshooting

### Signal LCDs stuck on compile notice

If Signal LCDs show the Pad compile notice and never update:
- Verify the LCD tag has the correct format with a **space**: `[PAD1] SIGNAL` not `[PAD1]SIGNAL`
- Verify Boot knows about all Signal LCD tags (SIGNAL, DEFENSE, SATS, PRESSURE, FLIGHT)
- Recompile Boot, then recompile Signal
- Check Signal's Echo output — it shows `PadPB: Found/---` and `BootPB: Found/---`

### LCDs not found after SETPAD rename

If SETPAD renamed blocks but scripts can't find LCDs:
- Recompile all 4 scripts in order (PAD → INV → SIGNAL → BOOT)
- Scripts extract padID from their PB name on compile, overriding stale Storage values

### Inventory goes crazy when connecting pads

This happens when two pads share the same `[PAD#]` tag. `UnityInventory.Scan()` uses `IsSameConstructAs` with padTag matching — both pads' blocks match, doubling counts. Fix:
- Disconnect the pads
- Run `SETPAD:N` on one pad to give it a unique padID
- Reconnect after renaming

### SETPAD didn't rename some blocks

- Blocks must be reachable via `IsSameConstructAs(Me)` — this includes connector-docked grids, piston subgrids, rotor subgrids
- Run `SETPAD:N` again — it catches any remaining blocks with wrong padID
- For undocked miners, use `SETPAD:N` on the Beacon PB directly

### Scripts can't find sibling PBs after rename

After SETPAD renames all blocks, you must recompile all 4 scripts. `FindSiblingPBs()` matches by padID tag in the PB name, so the scripts won't find each other until they're recompiled with the new names in place.

### Controller commands don't reach slave pads

- Verify the controller pad has `SETPADCONTROL` toggled ON
- Verify slave pads are connected via connectors (locked)
- Verify slave pads have completed boot (`boot_complete=true`)
- Mass commands use IGC which requires all PBs to be running

### Two pads got the same padID

- Disconnect one pad
- Run `SETPAD:N` with a unique number on the disconnected pad's Pad PB
- Reconnect after renaming
- Recompile all scripts on the renamed pad

---

## Satellite Array Operations

Satellites are missiles launched in SATELLITE targeting mode. Instead of attacking a target, they climb to orbit (62,000m), station-keep, scan for enemies, and auto-intercept threats. The entire satellite constellation is managed through the pad's LCD menu system and controller mode.

### Deploying Satellites

There is no dedicated "deploy satellite" PB command. Deployment works through the normal launch flow:

1. **Set targeting mode to SATELLITE** — cycle through modes on the Pad's LCD menu (LCD 1, MAIN menu) until it shows `SATELLITE`
2. **ARM and LAUNCH normally** — the missile detects SATELLITE mode and enters the satellite flight path: `SAT_CLIMB → SAT_BRAKE → SAT_HOLD`

On launch, UnityPad automatically:
- Assigns the next grid slot via `AdvanceGridSlot()` (spiral pattern outward from 0,0)
- Generates a unique satellite ID (`buildNumber * 100 + padID`)
- Writes satellite config to the missile's CustomData: `SatID`, `SatGridX`, `SatGridZ`, `GridSpacing` (5000m default), `SatAlt` (62,000m), `InterceptDist` (10m)

### Satellite Flight Phases (UnityMissile)

| Phase | Description |
|-------|-------------|
| `SAT_CLIMB` | Ascending to 62,000m orbital altitude |
| `SAT_BRAKE` | Decelerating to station-keeping velocity |
| `SAT_HOLD` | Station-keeping at grid position, scanning for enemies via sensors |
| `SAT_INTERCEPT` | Enemy detected — chasing target, detonates within 10m |

### Grid Position System

Satellites are placed on a grid with 5,000m spacing. `AdvanceGridSlot()` assigns positions in a spiral pattern expanding outward from the pad:

```
Grid slot assignment order (spiral):
        (-1,1)  (0,1)  (1,1)
        (-1,0)  (0,0)  (1,0)
        (-1,-1) (0,-1) (1,-1)
```

Each satellite broadcasts its grid position via `UNITY_SAT_RELAY_STATUS`. UnitySignal tracks the constellation and writes status to its CustomData `[SATELLITES]` section. UnityPad reads this data via `ReadSignalSatData()` and displays the satellite grid on LCD 8.

### Satellite Mesh Networking

Deployed satellites form a 5-laser mesh network:
- Each satellite attempts laser links to neighbors (N, S, E, W) and the pad
- Link status broadcast via `UNITY_SAT_MESH` IGC channel
- Mesh connectivity shown on the satellite grid LCD display

### Auto-Intercept

When a satellite's sensors detect an enemy:
1. Satellite switches to `SAT_INTERCEPT` phase
2. Chases the target, broadcasting position via `UNITY_SAT_INTERCEPT`
3. Detonates within 10m of target
4. Broadcasts `DETONATE` message with its grid position

### Auto-Replacement (Controller Mode)

When a satellite is destroyed (intercept or low power):
1. `UNITY_SAT_INTERCEPT` broadcast includes the satellite's grid position
2. UnityPad's `CheckSatIntercept()` captures the position and queues it in `satReplaceQueue`
3. If auto-replace is enabled (`aRS`), the controller automatically sends `SATLAUNCH` to the next available slave pad with the destroyed satellite's grid coordinates
4. The replacement satellite launches to the exact same grid slot

### Satellite Commands

**PB argument commands (run on Pad PB):**

| Command | Where | What It Does |
|---------|-------|--------------|
| `ABORT` | Pad PB (any pad) | Sends `DETONATE:{padID}` — destroys this pad's in-flight missile/satellite |
| `ABORTALL` | Controller Pad PB | Sends abort to ALL active missiles/satellites across all pads |

**IGC commands (sent to satellites via `UNITY_MSL_CMD`):**

| Command | What It Does |
|---------|--------------|
| `DETONATE:{padID}` | Destroys the satellite (broadcasts its grid position for replacement) |
| `DEORBIT:{padID}` | Commands satellite to leave orbit and attack its original GPS target |

**Signal PB argument commands:**

| Command | What It Does |
|---------|--------------|
| `SAT:RESCAN` | Clears all satellite tracking data in UnitySignal (forces re-discovery from broadcasts) |
| `RESCAN` | Full Signal block rescan (includes satellite LCD refresh) |

### Satellite LCD Displays

| LCD Tag | Script | Content |
|---------|--------|---------|
| `[PAD#] SATS` | UnitySignal | Satellite constellation overview — count, status, battery, H2 per satellite |
| LCD 8 (Pad) | UnityPad | Satellite grid map — visual grid showing satellite positions, status colors, mesh links |
| `[PAD#] SIGNAL` | UnitySignal | Includes satellite count in the signal status overview |

### Controller Mode Satellite Operations

In controller mode, the satellite system gains additional automation:

| Feature | Description |
|---------|-------------|
| Auto-replacement | Destroyed satellites automatically queued for replacement launch on next available slave pad |
| SATLAUNCH broadcast | Controller sends `SATLAUNCH` via `UNITY_PAD_CMD` to slave pads with specific grid coordinates |
| Grid tracking | Controller aggregates satellite positions from all pads via Signal's CustomData |
| AUTOATTACK | When enabled, controller auto-launches at enemy positions reported by satellite intercepts |

### Typical Satellite Deployment Sequence

```
1. Set targeting mode to SATELLITE (LCD menu)
2. ARM → LAUNCH (normal launch flow)
   → Missile climbs to 62,000m, takes grid slot (0,0)
3. Print next missile, ARM → LAUNCH
   → Takes grid slot (1,0)
4. Repeat for desired constellation size
5. (Optional) Enable SETPADCONTROL for auto-replacement
6. Satellites auto-intercept enemies and report back
7. Destroyed satellites auto-replaced via controller
```

---

## Quick Reference: Complete Setup Sequence

```
1. Blueprint PAD1 grid
2. Place blueprint near base — DO NOT CONNECT YET
3. On NEW grid (still [PAD1]), compile in order:
   a. [PAD1] Unity Pad        (argument field empty, just compile)
   b. [PAD1] UNITY INVENTORY
   c. [PAD1] UNITY SIGNAL
   d. [PAD1] UNITY BOOT        (wait for boot to complete)
4. On NEW grid's Pad PB, run argument: SETPAD:2
   → All blocks renamed from [PAD1] to [PAD2]
   → Slot numbers, suffixes, and names preserved
5. Verify rename in terminal — all blocks should show [PAD2]
6. NOW connect the new [PAD2] grid to your base via connectors (lock them)
7. Recompile all 4 scripts on the now-[PAD2] grid:
   a. [PAD2] Unity Pad
   b. [PAD2] UNITY INVENTORY
   c. [PAD2] UNITY SIGNAL
   d. [PAD2] UNITY BOOT
8. (Optional) On your main pad, run: SETPADCONTROL
   → Enables mass commands: BUILDALL, ARMALL, LAUNCHALL, ABORTALL
9. Repeat steps 1-7 for PAD3 (SETPAD:3), PAD4 (SETPAD:4), etc.
```

---

*Unity AI Lab - Missile Systems Division*
