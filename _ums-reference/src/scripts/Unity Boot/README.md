![Unity Boot](Unity%20Boot%202.png)

# Unity Boot v01.00

Centralized boot controller for the Starship Made of Lies. Uses real PB-to-PB IGC handshaking and per-PB CustomData architecture to verify all systems are running before releasing LCD control.

**Location:** `Starship Made of Lies/src/scripts/Unity Boot/`
**PB Name:** `[PAD1] UNITY BOOT`
**Version:** v01.00 | 2026-01-24

---

## Table of Contents

1. [Overview](#overview)
2. [System Integration](#system-integration)
3. [Setup](#setup)
4. [Block Configuration](#block-configuration)
5. [The 26 Boot Checks](#the-26-unified-checks)
6. [IGC Communication](#igc-communication)
7. [CustomData Schema](#per-pb-customdata-architecture)
8. [LCD Displays](#lcd-allocation)
9. [Multi-Pad Discovery](#multi-pad-discovery)
10. [Setup Commands](#setup-commands)
11. [Build and Deploy](#build-and-deploy)
12. [Character Budget](#character-budget)
13. [Quick Reference](#quick-reference)

---

## Overview

Unity Boot is a dedicated boot controller that:
1. **Wipes Me.CustomData on compile** and writes fresh [SYSTEM] section
2. **Finds sibling PBs using IsSameConstructAs(Me)** via DiscoverSiblingPads() - works across CON1/CON2 connectors
3. **Discovers both UNITY PAD and UNITY BOOT PBs** for pad ID detection and multi-pad awareness
4. **Reads ready flags from sibling PBs** (padPB.CustomData, invPB.CustomData, signalPB.CustomData)
5. Takes control of ALL 11 LCDs during startup
6. Runs 26 unified system checks with real IGC handshaking
7. Sets up **GPS section on button panel** for missile targeting
8. Detects miner fleet via MINER_BEACON broadcasts (check 22)
9. Signals `boot_complete=true` in its own CustomData when ready
10. **Waits for ACK** from Pad and Inventory scripts
11. Self-disables after boot, releasing LCDs to operational scripts

---

## System Integration

### The Starship Made of Lies

| Component | Script | PB Name | Purpose |
|-----------|--------|---------|---------|
| **Boot Controller** | **Unity Boot.cs** | **`[PAD1] UNITY BOOT`** | **26-check boot sequence** |
| Launch Pad | UnityPad.cs | `[PAD1] Unity Pad` | Missile control, LCDs 1,2,3,7,8 |
| Inventory | UnityInventory.cs | `[PAD1] Unity Inventory` | Production, LCDs 4,5,6,9,10,11 |
| Signal Hub | UnitySignal.cs | `[PAD1] UNITY SIGNAL` | Camera display, laser targeting |
| Missile | UnityMissile.cs | `[PAD1] Missile #1 Program` | Guided flight |
| Fleet Beacon | UnityBeacon.cs | `[BEACON] Unity Beacon` | Miner status broadcast |

### Compile Order (Pad Grid)

**PAD > INVENTORY > SIGNAL > BOOT**

| Order | Script | Action |
|-------|--------|--------|
| 1 | UnityPad | Clears CustomData, writes `pad_ready=true` |
| 2 | UnityInventory | Clears CustomData, writes `inv_ready=true` |
| 3 | UnitySignal | Clears CustomData, writes `signal_ready=true` |
| 4 | **Unity Boot** | Reads ready flags, runs 26 checks, sets `boot_complete=true` |

*Note: UnityBeacon (miners) and UnityMissile (missiles) are on separate grids - compile anytime.*

---

## Setup

### Programmable Block

1. Add a Programmable Block to your launch pad grid
2. Load the `Unity Boot` script
3. **Name the PB:** `[PAD1] UNITY BOOT`
4. Recompile and run

**COMPILE ORDER:** PAD -> INVENTORY -> SIGNAL -> BOOT

### Required Blocks

| Block | Tag | Purpose |
|-------|-----|---------|
| Button Panel | Contains "control" | GPS input for missile targeting |
| LCDs | `[PAD1:1]` through `[PAD1:11]` | Boot screen display |
| Sibling PBs | `[PAD1] Unity Pad`, `[PAD1] Unity Inventory`, `[PAD1] UNITY SIGNAL` | Systems to handshake with |

### Optional Blocks

| Block | Tag | Purpose |
|-------|-----|---------|
| Connector | `[PAD#-CON1]` | First module connection point |
| Connector | `[PAD#-CON2]` | Second module connection point |
| Antennas | Any | Enabled for IGC broadcasts |

---

## PER-PB CUSTOMDATA ARCHITECTURE

**CRITICAL:** Each script writes ONLY to `Me.CustomData`. Unity Boot reads from sibling PBs.

### Unity Boot's Me.CustomData (Written on Compile)

```ini
[SYSTEM]
boot_ready=true
boot_complete=false
boot_phase=INIT
miner_count=0
miner_names=
beacon_optional=true
```

### What Boot Reads From Other PBs

| PB | Data Read |
|----|-----------|
| padPB | `pad_ready=true`, `pad_session={guid}` |
| invPB | `inv_ready=true`, `inv_for_session={guid}` |
| signalPB | `signal_ready=true` |

### Button Panel Setup

Boot writes GPS section to button panel for user missile targeting:
```ini
[GPS]
; Paste GPS from clipboard below
```

---

## PRE-BOOT READY SYNC

Before running the 26 checks, Boot waits for all scripts to be ready:

| Script | Ready Flag | Required |
|--------|------------|----------|
| Unity Boot | `boot_ready=true` | Yes (auto) |
| UnityPad | `pad_ready=true` in padPB.CustomData | Yes |
| UnityInventory | `inv_ready=true` in invPB.CustomData | Yes |
| UnitySignal | `signal_ready=true` in signalPB.CustomData | Yes |

### Session Validation

Boot validates that Inventory was compiled for the correct Pad session:
```csharp
// Reads pad_session from padPB.CustomData
// Checks invPB.CustomData contains inv_for_session={pad_session}
// Only considers invReady=true if sessions match
```

When waiting, shows "WAITING FOR SCRIPTS" screen on all 11 LCDs.

---

## IGC COMMUNICATION

### Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | Boot -> Pad/Inv/Signal | Request system status (includes padID) |
| `UNITY_BOOT_RSP` | Pad/Inv/Signal -> Boot | Respond with block counts |
| `UNITY_BOOT_ACK` | Pad/Inv -> Boot | Script running acknowledgment |
| `UNITY_SETUP_CMD` | External -> Boot | Setup commands (filtered by padID) |
| `MINER_BEACON` | Beacon -> Boot | Fleet status broadcasts |

### Request Formats

Boot sends padID with every request:
```
PAD_CHECK:{padID}
INV_CHECK:{padID}
SIGNAL_CHECK:{padID}
```

### Response Formats

```
PAD|OK|merge=1,con=2,bat=4,h2=2,o2=1,prt=6
INV|OK|cargo=5,ref=2,asm=3,gen=4,h2=2,o2=1
```

### ACK Messages

After setting `boot_complete=true`, Boot waits for:
- `PAD_RUNNING` - Pad script acknowledged
- `INV_RUNNING` - Inventory script acknowledged

Timeout: 300 ticks (30 seconds) before releasing LCDs anyway.

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
| 6 | Await Pad Response | Wait up to 18 ticks |
| 7 | Missile Merge Block | Validate merge count |
| 8 | Validate Pad Power | Validate battery count |
| 9 | Validate Pad Fuel | Validate H2/O2 tanks |
| 10 | Request Inv Status | Send INV_CHECK:{padID} via IGC |
| 11 | Await Inv Response | Wait up to 18 ticks |
| 12 | Validate Inv Cargo | Validate cargo containers |
| 13 | Validate Inv Refinery | Validate refineries |
| 14 | Validate Inv Assembler | Validate assemblers |
| 15 | Validate Inv Gas | Validate generators |
| 16 | Request Signal Status | Send SIGNAL_CHECK:{padID} via IGC |
| 17 | Await Signal Response | Wait up to 18 ticks |
| 18 | Validate Signal | Validate cameras and LCDs |
| 19 | Cross-Validate | All systems responded |
| 20 | Module Sync | Check connected modules |
| 21 | Write Config | EnsureQuotas + SetupBtnGPS |
| 22 | Beacon Detection | Count miners (optional) |
| 23 | Controller Modules | Report connected pads |
| 24 | System Ready | Mark boot complete |
| 25 | All Systems Operational | Final status |

---

## BOOT FLOW

1. **UnityPad compiles FIRST** -> Writes `pad_ready=true` to Me.CustomData
2. **UnityInventory compiles SECOND** -> Writes `inv_ready=true` to Me.CustomData
3. **UnitySignal compiles THIRD** -> Writes `signal_ready=true` to Me.CustomData
4. **Unity Boot compiles FOURTH** -> Wipes Me.CustomData, writes [SYSTEM]
5. **DiscoverSiblingPads()** -> Uses IsSameConstructAs(Me) to find PBs across connectors
6. **CheckReadyFlags()** -> Reads ready flags from sibling PBs
7. **Shows WAITING screen** -> Until all ready flags are true
8. **Checks 0-4** -> Core Init (Grid, button panel, LCDs, IGC)
9. **Checks 5-9** -> Pad handshake and validation
10. **Checks 10-15** -> Inventory handshake and validation
11. **Checks 16-18** -> Signal handshake and validation
12. **Checks 19-21** -> Cross-validate, module sync, config
13. **Check 22** -> Listens for MINER_BEACON, counts miners
14. **Checks 23-25** -> Controller modules, system ready, complete
15. **WriteBootComplete()** -> Sets `boot_complete=true` in Me.CustomData
16. **Wait for ACKs** -> Up to 300 ticks for PAD_RUNNING and INV_RUNNING
17. **ReleaseLCDs()** -> Clears all LCDs for operational scripts
18. **Self-disables** -> `UpdateFrequency.None`

---

## LCD ALLOCATION

| Phase | LCDs | Content |
|-------|------|---------|
| During Boot | ALL 11 | Animated boot screen |
| After Boot | 1,2,3,7,8 | Released to UnityPad |
| After Boot | 4,5,6,9,10,11 | Released to UnityInventory |

---

## MULTI-PAD DISCOVERY

I use `IsSameConstructAs(Me)` instead of the old `CubeGrid==Me.CubeGrid` check. This finds PBs across mechanical connections (connectors, rotors, pistons) - not just blocks welded to the same grid.

### What Gets Discovered

| Discovery | Name Pattern | Purpose |
|-----------|-------------|---------|
| Own padPB | `[PAD1] Unity Pad` | Handshake target |
| Own invPB | `[PAD1] Unity Inventory` | Handshake target |
| Own signalPB | `[PAD1] UNITY SIGNAL` | Handshake target |
| Other BOOT PBs | `[PAD2] UNITY BOOT`, etc. | Pad ID detection |

### How It Works

```csharp
// DiscoverSiblingPads() uses IsSameConstructAs(Me)
// Finds ALL PBs in the construct (across connectors)
// Filters by padID tag to find own scripts
// Also finds other UNITY BOOT PBs for multi-pad awareness
```

---

## SETUP COMMANDS

Boot handles setup commands via UNITY_SETUP_CMD, filtered by padID so only the matching boot instance responds.

| Command | IGC Data | Action |
|---------|----------|--------|
| `SETUPMOD` | `SETUPMOD\|{padID}` | Re-tag blocks: strips old [PAD] tags, applies correct padID |
| `SETUPFORCE` | `SETUPFORCE\|{padID}` | Force re-tag even if blocks already have correct tags |
| `NAMEPAD` | `NAMEPAD\|{padID}` | Rename the pad's PB with correct [PAD#] prefix |
| `NAMEMSL` | `NAMEMSL\|{padID}` | Rename the missile's PB with correct [PAD#] prefix |

**PadID filtering:** `data==$"SETUPMOD|{padID}"` - prevents PAD1's boot from running PAD2's setup.

---

## SPRITE-BASED LCD SYSTEM

Boot uses sprite rendering for the boot screen display.

### Color Palette

```csharp
cPri = Blue (0,180,255)      // Primary - title, progress bar
cSec = Gray (100,100,100)    // Secondary - version, dividers
cAcc = Gold (255,200,0)      // Accent - module names
cOK  = Green (0,255,100)     // Good status - completed checks
cWrn = Orange (255,180,0)    // Warning - waiting states
cErr = Red (255,60,60)       // Error - failed checks
cBg  = Dark (10,10,15)       // Background
cBdr = Border (40,40,50)     // Progress bar border
cTxt = Light (220,220,220)   // General text
```

### Boot Screen Elements

- Title: "STARSHIP MADE OF LIES"
- Version: "v01.00"
- Module indicator: "PAD CONTROLLER" or "INVENTORY MODULE"
- Progress bar with percentage
- Check list with status prefixes: `[OK]`, `[>>]`, `[!!]`, `[..]`
- Status line at bottom

---

## MODULE SYNC

Check #20 detects physically connected modules via connectors:

1. Boot scans for connectors tagged `[PAD#-CON1]` and `[PAD#-CON2]`
2. Checks if each connector is connected (`Status == Connected`)
3. Reports connected module count

| Display | Meaning |
|---------|---------|
| "Standalone mode" | No modules connected |
| "Syncing 1 module(s)" | CON1 connected |
| "Syncing 2 module(s)" | Both connected |

---

## MINER BEACON DETECTION

Check #22 listens for fleet beacons:

| Field | Description |
|-------|-------------|
| `miner_count` | Number of miners detected |
| `miner_names` | Comma-separated ship names |
| `beacon_optional` | If false, boot fails without miners |

Beacon format: `MB|EntityId|ShipName|...`

Fun error messages when no miners found (and required):
- "Miners AWOL"
- "No beacons found"
- "Fleet ghosted you"

---

## ERROR HANDLING

When a boot check fails:
1. Error message displayed on all relevant LCDs
2. `[!!]` prefix shown for failed step
3. 12-tick pause
4. Error clears, retry continues
5. Boot will not complete until all checks pass

Timeout handling:
- If Pad/Inventory doesn't respond within 18 ticks, proceeds anyway
- ACK wait times out after 300 ticks

---

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `DiscoverSiblingPads()` | Discover padPB, invPB, signalPB using IsSameConstructAs(Me) |
| `CheckReadyFlags()` | Read pad_ready, inv_ready, signal_ready from sibling PBs |
| `InitBootCustomData()` | Wipe and write fresh [SYSTEM] section |
| `RunBootCheck(step)` | Execute single boot check |
| `CheckIGCMessages()` | Process UNITY_BOOT_RSP responses |
| `CheckCustomDataResponses()` | Fallback: read status from PB CustomData |
| `WritePadRequest()` | Send PAD_CHECK:{padID} via IGC |
| `WriteInvRequest()` | Send INV_CHECK:{padID} via IGC |
| `ParsePadResponse(data)` | Extract merge/con/bat/h2/o2/prt counts |
| `ParseInvResponse(data)` | Extract cargo/ref/asm/gen/h2/o2 counts |
| `WriteBootComplete()` | Set boot_complete=true in Me.CustomData |
| `CheckAcks()` | Process PAD_RUNNING/INV_RUNNING acknowledgments |
| `CheckMinerBeacons()` | Process MINER_BEACON broadcasts |
| `WriteMinerData()` | Update miner_count/miner_names in CustomData |
| `SetupBtnGPS()` | Write [GPS] section to button panel |
| `DrawBootScreen()` | Render sprite-based boot display |
| `DrawWaitingScreen()` | Render "WAITING FOR SCRIPTS" display |
| `ReleaseLCDs()` | Clear all LCDs for operational scripts |

---

## BUILD AND DEPLOY

### Build Commands

```powershell
cd "S:\FastDevelopment\SE\Starship Made of Lies"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build "src/scripts/Unity Boot" -c Debug
```

### Deploy Location

Script auto-deploys to:
```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\Unity Boot\script.cs
```

### Verify Deployment

```powershell
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\Unity Boot\script.cs").Length
```

---

## CHARACTER BUDGET

| Metric | Value |
|--------|-------|
| Raw Lines | ~450 |
| Deployed | 30,372 chars |
| Budget | 100,000 chars |
| Status | OK (69.6% margin) |

---

*Unity AI Lab - Boot Systems Division*
