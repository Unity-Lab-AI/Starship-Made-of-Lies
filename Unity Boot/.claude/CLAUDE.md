# Unity Boot - .claude Workflow System

Centralized boot controller for the Unity Missile System. Uses Per-PB CustomData architecture where each script writes ONLY to its own PB's CustomData and reads sibling PBs by name pattern.

**Location:** `Unity Missile System/Unity Boot/`
**PB Name:** `[PAD1] UNITY BOOT`
**Version:** v01.00 | 2026-01-24

---

## Table of Contents

1. [Purpose](#purpose)
2. [File Sync Rule](#critical-file-sync-rule)
3. [Build and Deploy](#build-and-deploy)
4. [In-Game Compile Order](#in-game-script-compile-order)
5. [Pre-Boot Ready Sync](#pre-boot-ready-sync)
6. [Real Handshake Protocol](#real-handshake-protocol)
7. [The 26 Unified Checks](#the-26-unified-checks)
8. [LCD Allocation](#lcd-allocation)
9. [Per-PB CustomData Architecture](#per-pb-customdata-architecture)
10. [CustomData Ownership](#customdata-ownership)
11. [Multi-Pad Discovery](#multi-pad-discovery)
12. [Multi-Pad Setup Commands](#multi-pad-setup-commands)
13. [Error Handling](#error-handling)
14. [Critical Rules](#critical-rules-always-enforced)
15. [Character Budget](#character-budget)
16. [Quick Reference](#quick-reference)

---

## PURPOSE

Unity Boot is a dedicated boot controller that:
1. **Wipes Me.CustomData on compile** and writes fresh [SYSTEM], [QUOTAS], [BLACKBOX]
2. **Finds sibling PBs using IsSameConstructAs(Me)** via DiscoverSiblingPads() - works across CON1/CON2 connectors, not just same CubeGrid
3. **Discovers both UNITY PAD and UNITY BOOT PBs** for pad ID detection and multi-pad awareness
4. **Reads ready flags from sibling PBs** (not button panel)
5. Takes control of ALL 11 LCDs during startup
6. Runs 26 unified system checks with real IGC handshaking
7. Sets up **GPS section on button panel** for missile targeting
8. Detects miner fleet via MINER_BEACON broadcasts (check 20)
9. Signals `boot_complete=true` in its own CustomData when ready
10. Self-disables after boot, releasing LCDs to operational scripts

---

## CRITICAL: FILE SYNC RULE

**BOTH files MUST be kept in sync:**
- `Unity Boot.cs` - Raw script file (edit this)
- `Unity Boot/Program.cs` - MDK build file (auto-wrapped)

**WHEN EDITING:**
1. Edit `Unity Boot.cs` directly
2. Run `wrap-scripts.ps1` to sync to Program.cs
3. Build with `dotnet build "Unity Boot" -c Debug`

---

## BUILD AND DEPLOY

### Build Command

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build "Unity Boot" -c Debug
```

### Deploy Location

Script auto-deploys to:
```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\Unity Boot\script.cs
```

---

## IN-GAME SCRIPT COMPILE ORDER

**COMPILE ORDER: BEACON -> MISSILE -> PAD -> INVENTORY -> SIGNAL -> BOOT**

| Order | Script | PB Name Pattern | What Happens |
|-------|--------|-----------------|--------------|
| 1 | **UnityBeacon** | `[BEACON] Unity Beacon` | Optional - broadcasts miner status |
| 2 | **UnityMissile** | `[PAD1] Missile #1 Program` | Optional - missile guidance |
| 3 | **UnityPad** | `[PAD1] Unity Pad` | Wipes Me.CustomData, writes `pad_ready=true` |
| 4 | **UnityInventory** | `[PAD1] Unity Inventory` | Wipes Me.CustomData, writes `inv_ready=true` |
| 5 | **UnitySignal** | `[PAD1] UNITY SIGNAL` | Wipes Me.CustomData, writes `signal_ready=true` |
| 6 | **Unity Boot** | `[PAD1] UNITY BOOT` | Finds sibling PBs, reads ready flags, runs 26 checks |

**NOTE:** BEACON and MISSILE are on different PBs, so can compile any time. The 4 pad scripts are on SEPARATE PBs but Unity Boot finds them using IsSameConstructAs(Me) which works across connector boundaries.

**HOW IT WORKS:**
- **Each script wipes its OWN Me.CustomData on compile** - no shared CustomData
- Unity Boot uses DiscoverSiblingPads() with IsSameConstructAs(Me) to locate padPB, invPB, and signalPB across CON1/CON2 connectors
- Also discovers other UNITY BOOT PBs for pad ID detection in multi-pad setups
- Unity Boot reads `pad_ready=true` from padPB.CustomData
- Unity Boot reads `inv_ready=true` from invPB.CustomData
- Unity Boot reads `signal_ready=true` from signalPB.CustomData
- Boot then runs 26 checks and sets `boot_complete=true` in its own CustomData

---

## PRE-BOOT READY SYNC

| Script | PB Name | Ready Flag Location | Required |
|--------|---------|---------------------|----------|
| Unity Boot | `[PAD1] UNITY BOOT` | Me.CustomData | Yes (auto) |
| UnityPad | `[PAD1] Unity Pad` | padPB.CustomData | Yes |
| UnityInventory | `[PAD1] Unity Inventory` | invPB.CustomData | Yes |
| UnitySignal | `[PAD1] UNITY SIGNAL` | signalPB.CustomData | Yes |
| UnityBeacon | `[BEACON] Unity Beacon` | (detected via MINER_BEACON) | No (optional) |

**DiscoverSiblingPads() - How Boot Finds Other Scripts:**
```csharp
// Uses IsSameConstructAs(Me) instead of CubeGrid==Me.CubeGrid
// This finds PBs across CON1/CON2 connector boundaries - not just same grid!
// Extracts pad ID from own name: "[PAD1] UNITY BOOT" -> "PAD1"
// Then searches for:
//   padPB: Contains "[PAD1]" AND "Unity Pad"
//   invPB: Contains "[PAD1]" AND "Unity Inventory"
//   signalPB: Contains "[PAD1]" AND "UNITY SIGNAL"
//   Other UNITY BOOT PBs: for multi-pad awareness
```

**CheckReadyFlags() - How Boot Reads Ready State:**
```csharp
// Reads padPB.CustomData for "pad_ready=true"
// Reads invPB.CustomData for "inv_ready=true"
// Reads signalPB.CustomData for "signal_ready=true"
// All must be true before starting checks
```

When waiting, shows "WAITING FOR SCRIPTS" screen on all 11 LCDs.

---

## REAL HANDSHAKE PROTOCOL

Unlike simple block scanning, Unity Boot uses actual PB-to-PB communication via IGC.

### IGC Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | Boot -> Pad/Inv/Signal | Request system status (includes padID) |
| `UNITY_BOOT_RSP` | Pad/Inv/Signal -> Boot | Respond with block counts |
| `UNITY_SETUP_CMD` | External -> Boot | Setup commands (filtered by padID) |
| `MINER_BEACON` | Beacon -> Boot | Fleet status broadcasts |

### Request Format

Boot now sends padID with every request so sibling scripts know which pad is asking:
```
PAD_CHECK:{padID}
INV_CHECK:{padID}
SIGNAL_CHECK:{padID}
```

### Response Format

```
PAD|OK|merge=1,con=2,bat=4,h2=2,o2=1,prt=6
INV|OK|cargo=5,ref=2,asm=3,gen=4,h2=2,o2=1
MB|EntityId|ShipName|Bat%|Cargo%|H2%|...  (miner beacon)
```

### Unity Boot's Me.CustomData (Written on Compile)

Unity Boot **wipes and rewrites** its own CustomData on every compile:

```ini
[SYSTEM]
boot_ready=true
boot_complete=false
miner_count=0
miner_names=
beacon_optional=true

[QUOTAS]
; Production targets - UnityInventory reads these

[BLACKBOX]
; Error/event log - all scripts can append
```

**NOTE:** Ready flags for pad/inv are NOT stored here - they're read from sibling PBs.

### Button Panel GPS Setup

Unity Boot sets up the GPS section on button panel `[PAD1] Controls` for missile targeting:

```csharp
// SetupBtnGPS() wipes btn.CustomData and writes:
[GPS]
; Paste GPS from clipboard below

```

**User pastes GPS coordinates here for missile targeting.** This is the ONLY thing Unity Boot writes to the button panel.

### Boot Flow

1. **UnityPad compiles** -> Wipes Me.CustomData, writes `pad_ready=true` to own PB
2. **UnityInventory compiles** -> Wipes Me.CustomData, writes `inv_ready=true` to own PB
3. **UnitySignal compiles** -> Wipes Me.CustomData, writes `signal_ready=true` to own PB
4. **Unity Boot compiles** -> Wipes Me.CustomData, writes [SYSTEM], [QUOTAS], [BLACKBOX]
5. **DiscoverSiblingPads()** -> Uses IsSameConstructAs(Me) to locate padPB, invPB, signalPB across connectors
6. **CheckReadyFlags()** -> Reads padPB.CustomData, invPB.CustomData, signalPB.CustomData for ready flags
7. **SetupBtnGPS()** -> Wipes button panel CustomData, writes [GPS] section
8. **Checks 1-4** -> Local block scan (grid, panel, LCDs, IGC)
9. **Checks 5-10** -> Pad handshake and validation (merge, power, fuel)
10. **Checks 11-16** -> Inventory handshake and validation (cargo, ref, asm, gas)
11. **Checks 16-19** -> Signal handshake, cross-validate, module sync, write config
12. **Check 20** -> Beacon detection - listens for MINER_BEACON, stores miner names
13. **Checks 21-25** -> Controller modules, system ready
14. **If success** -> Sets `boot_complete=true` in Me.CustomData
15. **Unity Boot disables itself** -> `UpdateFrequency.None`
16. **UnityPad sees boot_complete=true** -> Takes LCDs 1,2,3,7,8
17. **UnityInventory sees boot_complete=true** -> Takes LCDs 4,5,6,9,10,11

---

## THE 26 UNIFIED CHECKS

| # | Check | What It Does |
|---|-------|--------------|
| 0 | Initializing Core | Grid has min 5 blocks |
| 1 | Scanning Grid | Count pad grid blocks |
| 2 | Button Panel | Control panel found |
| 3 | Detecting LCDs | Min 1 LCD tagged |
| 4 | IGC Channels | Channels registered |
| 5 | Request Pad Status | Send PAD_CHECK:{padID} via IGC |
| 6 | Await Pad Response | Wait up to 90 ticks |
| 7 | Missile Merge Block | Validate merge count |
| 8 | Validate Pad Power | Validate battery count |
| 9 | Validate Pad Fuel | Validate H2/O2 tanks |
| 10 | Request Inv Status | Send INV_CHECK:{padID} via IGC |
| 11 | Await Inv Response | Wait up to 90 ticks |
| 12 | Validate Inv Cargo | Validate cargo containers |
| 13 | Validate Inv Refinery | Validate refineries |
| 14 | Validate Inv Assembler | Validate assemblers |
| 15 | Validate Inv Gas | Validate generators |
| 16 | Request Signal Status | Send SIGNAL_CHECK:{padID} via IGC |
| 17 | Await Signal Response | Wait up to 90 ticks |
| 18 | Validate Signal | Validate cameras and LCDs |
| 19 | Cross-Validate | All systems responded |
| 20 | Module Sync | Check sibling pads |
| 21 | Write Config | EnsureQuotas + SetupBtnGPS |
| 22 | Beacon Detection | Count miners (optional) |
| 23 | Controller Modules | Report connected pads |
| 24 | System Ready | Mark boot complete |
| 25 | All Systems Operational | Final status |

---

## LCD ALLOCATION

During boot, Unity Boot controls ALL LCDs:

| LCD | Content During Boot |
|-----|---------------------|
| 1,2,3,7,8 | PAD CONTROLLER boot screen |
| 4,5,6,9,10,11 | INVENTORY MODULE boot screen |

After boot completes:
- LCDs 1,2,3,7,8 -> Released to UnityPad
- LCDs 4,5,6,9,10,11 -> Released to UnityInventory

---

## PER-PB CUSTOMDATA ARCHITECTURE

**CRITICAL:** Each script writes ONLY to `Me.CustomData` (its own PB). Scripts find and READ other PBs' CustomData when needed.

| PB Name Pattern | Script | Me.CustomData Contents |
|-----------------|--------|------------------------|
| `[PAD1] UNITY BOOT` | Unity Boot | [SYSTEM], [QUOTAS], [BLACKBOX] |
| `[PAD1] Unity Pad` | UnityPad | [PAD_CFG], [PAD_STATUS], [PAD_DATA], pad_ready=true |
| `[PAD1] Unity Inventory` | UnityInventory | [MISSILE], [CONFIG], [WAYPOINTS], [STATUS], [ORE], [INGOTS], [COMPONENTS], [TURRET_AMMO], [BOTTLES], [TOOLS_WEAPONS], [PERSONAL_AMMO], inv_ready=true |
| `[PAD1] UNITY SIGNAL` | UnitySignal | [SIGNAL], signal_ready=true |
| Missile PB | UnityMissile | Own config only |
| `[BEACON] Unity Beacon` | UnityBeacon | Own config only |

**BUILD RULE:** Only build scripts that have changes. Never build unchanged scripts.

### Unity Boot's Me.CustomData Sections
```
[SYSTEM]           ; boot_ready, boot_complete, miner_count, miner_names
[QUOTAS]           ; Production targets (UnityInventory reads from here)
[BLACKBOX]         ; Error/event log
```

### Button Panel `[PAD1] Controls` CustomData
```
[GPS]
; Paste GPS from clipboard below
GPS:Target:1000:500:200:#FF00FF00:
```

**Unity Boot sets up [GPS] on button panel via SetupBtnGPS(). User pastes GPS here for missile targeting.**

### How Scripts Find Each Other

Unity Boot uses DiscoverSiblingPads() with IsSameConstructAs(Me) to locate sibling PBs:
```csharp
// Boot PB name: "[PAD1] UNITY BOOT"
// Extracts "PAD1" from the name
// Uses IsSameConstructAs(Me) - finds PBs across CON1/CON2 connectors!
// Searches for:
//   padPB: Contains "[PAD1]" AND "Unity Pad"
//   invPB: Contains "[PAD1]" AND "Unity Inventory"
//   signalPB: Contains "[PAD1]" AND "UNITY SIGNAL"
//   Other UNITY BOOT PBs: for multi-pad ID detection
```

UnityPad and UnityInventory use similar patterns to find Unity Boot's PB when checking `boot_complete`.

---

## CUSTOMDATA OWNERSHIP

**Per-PB Architecture - NO shared CustomData between scripts!**

| Script | Writes To | Reads From |
|--------|-----------|------------|
| Unity Boot | Me.CustomData (Boot PB) | padPB.CustomData, invPB.CustomData, signalPB.CustomData |
| UnityPad | Me.CustomData (Pad PB) | bootPB.CustomData (for boot_complete) |
| UnityInventory | Me.CustomData (Inv PB) | bootPB.CustomData (for boot_complete, QUOTAS) |
| UnitySignal | Me.CustomData (Signal PB) | bootPB.CustomData (for boot_complete) |

**Unity Boot writes to TWO places:**
1. **Me.CustomData** - [SYSTEM], [QUOTAS], [BLACKBOX]
2. **btn.CustomData** - [GPS] section for missile targeting (via SetupBtnGPS())

**Unity Boot does NOT write system data to button panel.** The button panel is ONLY for GPS coordinates.

**After boot_complete=true, Unity Boot self-disables and stops running entirely.**

---

## MULTI-PAD DISCOVERY

I use `IsSameConstructAs(Me)` instead of the old `CubeGrid==Me.CubeGrid` check. This is a big deal for multi-pad setups because it finds PBs across mechanical connections (connectors, rotors, pistons) - not just blocks welded to the same grid.

### Why IsSameConstructAs?

In a multi-pad base, pads connect via CON1/CON2 connectors. With the old `CubeGrid` check, I'd only see blocks on my own physical grid. With `IsSameConstructAs`, I see the entire construct - every grid connected through connectors. That means I can:

- Find my own pad's scripts (padPB, invPB, signalPB) by matching `[PAD1]` tag
- Discover OTHER boot PBs (e.g., `[PAD2] UNITY BOOT`) for multi-pad awareness
- Detect sibling pads for controller mode aggregation

### What Gets Discovered

| Discovery | Name Pattern | Purpose |
|-----------|-------------|---------|
| Own padPB | `[PAD1] Unity Pad` | Handshake target |
| Own invPB | `[PAD1] Unity Inventory` | Handshake target |
| Own signalPB | `[PAD1] UNITY SIGNAL` | Handshake target |
| Other BOOT PBs | `[PAD2] UNITY BOOT`, etc. | Pad ID detection |

---

## MULTI-PAD SETUP COMMANDS

When you're setting up a new pad or re-tagging blocks, Boot handles these setup commands via UNITY_SETUP_CMD:

### SETUPMOD Command

Received via IGC as `SETUPMOD|{padID}`. Boot checks if the padID matches its own - only the matching boot instance runs the setup. This re-tags blocks with old `[PAD]` tags, stripping the old tag and applying the correct padID.

### Order of Operations (Multi-Pad Setup)

1. Build and deploy all scripts
2. Compile UnityPad on each pad's PB (sets pad_ready)
3. Compile UnityInventory on each pad's PB (sets inv_ready)
4. Compile UnitySignal on each pad's PB (sets signal_ready)
5. Compile Unity Boot on each pad's PB LAST (runs 26 checks)
6. If blocks need re-tagging, send SETUPMOD via IGC - only the matching boot runs it

### Available Setup Commands

| Command | Action |
|---------|--------|
| `SETUPMOD` | Re-tag blocks: strips old [PAD] tags, applies correct padID |
| `SETUPFORCE` | Force re-tag even if blocks already have correct tags |
| `NAMEPAD` | Rename the pad's PB with correct [PAD#] prefix |
| `NAMEMSL` | Rename the missile's PB with correct [PAD#] prefix |

### PadID Filtering

All UNITY_SETUP_CMD messages include the padID: `data==$"SETUPMOD|{padID}"`. Boot checks if the padID in the message matches its own before executing. This prevents PAD1's boot from running PAD2's setup commands.

---

## ERROR HANDLING

When a boot check fails:
1. Error message displayed on all relevant LCDs
2. `[!!]` prefix shown for failed step
3. 5-second pause (50 ticks at Update100)
4. Error clears, retry continues
5. Boot will not complete until all checks pass

Timeout handling:
- If Pad/Inventory doesn't respond within 30 ticks, shows timeout error
- Retries request after error pause

---

## CRITICAL RULES (ALWAYS ENFORCED)

| Rule | Value | Enforcement |
|------|-------|-------------|
| **SE Character Limit** | 100,000 chars on DEPLOYED script | Check deployed script.cs |
| **NO COMMENTS IN SE SCRIPTS** | ABSOLUTE | Every char counts |
| **Read line count** | **ALWAYS 600 lines** | **Claude reads 600 lines per Read - NOT a limit, THE number. Read files, don't grep.** |
| **Read before edit** | FULL FILE | Mandatory before ANY edit |
| **Unity persona** | REQUIRED | Validated at every phase |
| **NO TESTS - EVER** | ABSOLUTE | We code it right the first time |

---

## CHARACTER BUDGET

| Script | Raw .cs | Deployed | Budget | Status |
|--------|---------|----------|--------|--------|
| Unity Boot | ~450 | 30,372 | 100,000 | OK (69.6% margin) |

---

## Quick Reference

```powershell
# Build and deploy
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build "Unity Boot" -c Debug

# Check deployed size (CHARACTERS, not bytes)
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\Unity Boot\script.cs").Length
```

---

*Unity AI Lab - Boot Systems Division*
