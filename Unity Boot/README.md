![Unity Boot](Unity%20Boot%202.png)

# Unity Boot v01.00

Centralized boot controller for the Unity Missile System. Uses real PB-to-PB IGC handshaking and per-PB CustomData architecture to verify all systems are running before releasing LCD control.

**Location:** `Unity Missile System/Unity Boot/`
**PB Name:** `[PAD1] UNITY BOOT`
**Version:** v01.00 | 2026-01-24

---

## Table of Contents

1. [Overview](#overview)
2. [System Integration](#system-integration)
3. [Setup](#setup)
4. [Block Configuration](#block-configuration)
5. [The 23 Boot Checks](#the-23-unified-checks)
6. [IGC Communication](#igc-communication)
7. [CustomData Schema](#per-pb-customdata-architecture)
8. [LCD Displays](#lcd-allocation)
9. [Build and Deploy](#build-and-deploy)
10. [Character Budget](#character-budget)
11. [Quick Reference](#quick-reference)

---

## Overview

Unity Boot is a dedicated boot controller that:
1. **Wipes Me.CustomData on compile** and writes fresh [SYSTEM] section
2. **Finds sibling PBs by name pattern** using FindSiblingPBs()
3. **Reads ready flags from sibling PBs** (padPB.CustomData, invPB.CustomData)
4. Takes control of ALL 11 LCDs during startup
5. Runs 23 unified system checks with real IGC handshaking
6. Sets up **GPS section on button panel** for missile targeting
7. Detects miner fleet via MINER_BEACON broadcasts (check 19)
8. Signals `boot_complete=true` in its own CustomData when ready
9. **Waits for ACK** from Pad and Inventory scripts
10. Self-disables after boot, releasing LCDs to operational scripts

---

## System Integration

### The Unity Missile System

| Component | Script | PB Name | Purpose |
|-----------|--------|---------|---------|
| **Boot Controller** | **Unity Boot.cs** | **`[PAD1] UNITY BOOT`** | **23-check boot sequence** |
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
| 4 | **Unity Boot** | Reads ready flags, runs 23 checks, sets `boot_complete=true` |

*Note: UnityBeacon (miners) and UnityMissile (missiles) are on separate grids - compile anytime.*

---

## Setup

### Programmable Block

1. Add a Programmable Block to your launch pad grid
2. Load the `Unity Boot` script
3. **Name the PB:** `[PAD1] UNITY BOOT`
4. Recompile and run

**COMPILE ORDER:** PAD → INVENTORY → SIGNAL → BOOT

### Required Blocks

| Block | Tag | Purpose |
|-------|-----|---------|
| Button Panel | Contains "control" | GPS input for missile targeting |
| LCDs | `[PAD1:1]` through `[PAD1:11]` | Boot screen display |
| Sibling PBs | `[PAD1] Unity Pad`, `[PAD1] Unity Inventory` | Systems to handshake with |

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

### Button Panel Setup

Boot writes GPS section to button panel for user missile targeting:
```ini
[GPS]
; Paste GPS from clipboard below
```

---

## PRE-BOOT READY SYNC

Before running the 23 checks, Boot waits for both scripts to be ready:

| Script | Ready Flag | Required |
|--------|------------|----------|
| Unity Boot | `boot_ready=true` | Yes (auto) |
| UnityPad | `pad_ready=true` in padPB.CustomData | Yes |
| UnityInventory | `inv_ready=true` in invPB.CustomData | Yes |

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
| `UNITY_BOOT_REQ` | Boot → Pad/Inv | Request system status |
| `UNITY_BOOT_RSP` | Pad/Inv → Boot | Respond with block counts |
| `UNITY_BOOT_ACK` | Pad/Inv → Boot | Script running acknowledgment |
| `MINER_BEACON` | Beacon → Boot | Fleet status broadcasts |

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

## THE 23 UNIFIED CHECKS

| # | Check | What It Does |
|---|-------|--------------|
| 0 | Initializing Core | Grid has min 5 blocks |
| 1 | Scanning Grid | Count pad grid blocks |
| 2 | Button Panel | Control panel found |
| 3 | Detecting LCDs | Min 1 LCD tagged |
| 4 | IGC Channels | Channels registered |
| 5 | Request Pad Status | Send PAD_CHECK via IGC |
| 6 | Await Pad Response | Wait up to 18 ticks |
| 7 | Missile Merge Block | Validate merge count |
| 8 | Validate Pad Power | Validate battery count |
| 9 | Validate Pad Fuel | Validate H2/O2 tanks |
| 10 | Request Inv Status | Send INV_CHECK via IGC |
| 11 | Await Inv Response | Wait up to 18 ticks |
| 12 | Validate Inv Cargo | Validate cargo containers |
| 13 | Validate Inv Refinery | Validate refineries |
| 14 | Validate Inv Assembler | Validate assemblers |
| 15 | Validate Inv Gas | Validate generators |
| 16 | Cross-Validate | Both systems responded |
| 17 | Module Sync | Check connected modules |
| 18 | Write Config | EnsureQuotas + SetupBtnGPS |
| 19 | Beacon Detection | Count miners (optional) |
| 20 | Controller Modules | Report connected pads |
| 21 | System Ready | Mark boot complete |
| 22 | All Systems Operational | Final status |

---

## BOOT FLOW

1. **UnityPad compiles FIRST** → Writes `pad_ready=true` to Me.CustomData
2. **UnityInventory compiles SECOND** → Writes `inv_ready=true` to Me.CustomData
3. **Unity Boot compiles THIRD** → Wipes Me.CustomData, writes [SYSTEM]
4. **FindSiblingPBs()** → Locates padPB and invPB by name pattern
5. **CheckReadyFlags()** → Reads ready flags from sibling PBs
6. **Shows WAITING screen** → Until both pad_ready and inv_ready are true
7. **Checks 0-4** → Core Init (Grid, button panel, LCDs, IGC)
8. **Checks 5-9** → Pad handshake and validation
9. **Checks 10-15** → Inventory handshake and validation
10. **Checks 16-18** → Cross-validate, module sync, config
11. **Check 19** → Listens for MINER_BEACON, counts miners
12. **Checks 20-22** → Controller modules, system ready, complete
13. **WriteBootComplete()** → Sets `boot_complete=true` in Me.CustomData
14. **Wait for ACKs** → Up to 300 ticks for PAD_RUNNING and INV_RUNNING
15. **ReleaseLCDs()** → Clears all LCDs for operational scripts
16. **Self-disables** → `UpdateFrequency.None`

---

## LCD ALLOCATION

| Phase | LCDs | Content |
|-------|------|---------|
| During Boot | ALL 11 | Animated boot screen |
| After Boot | 1,2,3,7,8 | Released to UnityPad |
| After Boot | 4,5,6,9,10,11 | Released to UnityInventory |

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

- Title: "UNITY MISSILE SYSTEM"
- Version: "v01.00"
- Module indicator: "PAD CONTROLLER" or "INVENTORY MODULE"
- Progress bar with percentage
- Check list with status prefixes: `[OK]`, `[>>]`, `[!!]`, `[..]`
- Status line at bottom

---

## MODULE SYNC

Check #17 and #20 detect physically connected modules via connectors:

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

Check #19 listens for fleet beacons:

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
| `FindSiblingPBs()` | Discover padPB, invPB by name pattern |
| `CheckReadyFlags()` | Read pad_ready, inv_ready from sibling PBs |
| `InitBootCustomData()` | Wipe and write fresh [SYSTEM] section |
| `RunBootCheck(step)` | Execute single boot check |
| `CheckIGCMessages()` | Process UNITY_BOOT_RSP responses |
| `CheckCustomDataResponses()` | Fallback: read status from PB CustomData |
| `WritePadRequest()` | Send PAD_CHECK via IGC |
| `WriteInvRequest()` | Send INV_CHECK via IGC |
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
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build "Unity Boot" -c Debug
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
| Raw Lines | ~390 |
| Deployed | ~20,000 chars |
| Budget | 100,000 chars |
| Status | OK (80% margin) |

---

*Unity AI Lab - Boot Systems Division*
