# UNITY MISSILE SYSTEM - .claude Workflow System

**Folder:** `Unity Missile System/`

Analyzes and develops the guided missile system for Space Engineers. Uses Unity persona with strict validation hooks.

---

## Table of Contents

1. [Project Components](#project-components)
2. [Build and Deploy](#build-and-deploy)
3. [Critical Rules](#critical-rules-always-enforced)
4. [No Partial Implementations](#no-partial-implementations)
5. [Per-PB CustomData Architecture](#per-pb-customdata-architecture)
6. [No Tests Policy](#no-tests-policy)
7. [MDK Project Structure](#mdk-project-structure)
8. [Character Budgets](#character-budgets)
9. [IGC Communication Channels](#igc-communication-channels)
10. [Missile System Architecture](#missile-system-architecture)
11. [The 600-Line Read Standard](#the-600-line-read-standard)
12. [Agent Files](#agent-files)
13. [Quick Reference](#quick-reference)
14. [Boot Handshake Protocol](#boot-handshake-protocol)
    - [PB Discovery Pattern](#pb-discovery-pattern)
    - [How Scripts Read From Other PBs](#how-scripts-read-from-other-pbs)
    - [In-Game Script Compile Order](#in-game-script-compile-order)
    - [Pre-Boot Ready Sync](#pre-boot-ready-sync)
    - [Response Formats](#response-formats)
    - [Per-PB CustomData Contents](#per-pb-customdata-contents)
    - [CustomData Section Ownership](#customdata-section-ownership-per-pb-architecture)
    - [Cross-PB Data Access](#cross-pb-data-access)
    - [Key Functions Per Script](#key-functions-per-script)
    - [The 26 Boot Checks](#the-26-boot-checks)
    - [Boot Flow](#boot-flow-per-pb-architecture)
    - [Checking Boot Status](#checking-boot-status-in-operational-scripts)
15. [Credits & Acknowledgements](#credits--acknowledgements)
16. [Multi-Pad Setup](#multi-pad-setup)

---

## PROJECT COMPONENTS

| Component | Script | PB Name | Deployed To |
|-----------|--------|---------|-------------|
| **Boot Controller** | `Unity Boot.cs` | `[PAD1] UNITY BOOT` | `%APPDATA%\...\Unity Boot\` (26 checks with PB handshaking + miner detection) |
| **Launch Pad** | `UnityPad.cs` | `[PAD1] Unity Pad` | `%APPDATA%\...\UnityPad\` |
| **Missile** | `UnityMissile.cs` | `[PAD1] Missile #1 Program` | `%APPDATA%\...\UnityMissile\` |
| **Inventory** | `UnityInventory.cs` | `[PAD1] Unity Inventory` | `%APPDATA%\...\UnityInventory\` (unified production system) |
| **Fleet Beacon** | `UnityBeacon.cs` | `[BEACON] Unity Beacon` | `%APPDATA%\...\UnityBeacon\` |
| **Signal Controller** | `UnitySignal.cs` | `[PAD1] UNITY SIGNAL` | `%APPDATA%\...\UnitySignal\` (central signal: antennas, lasers, satellites, cameras) |
| **Button Panel** | (none) | `[PAD1] Controls` | User GPS input only - NOT a script |

---

## BUILD AND DEPLOY

### Build Commands

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"

# Step 1: Wrap raw .cs files into Program.cs (MANDATORY)
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1

# Step 2: Build all projects
dotnet build "Unity Boot" -c Debug
dotnet build UnityPad -c Debug
dotnet build UnityMissile -c Debug
dotnet build UnityInventory -c Debug
dotnet build UnityBeacon -c Debug
dotnet build UnitySignal -c Debug
```

### Deploy Location

All scripts deploy automatically to:
```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\
├── Unity Boot\script.cs
├── UnityPad\script.cs
├── UnityMissile\script.cs
├── UnityInventory\script.cs
├── UnityBeacon\script.cs
└── UnitySignal\script.cs
```

### Wrapper Script

The `wrap-scripts.ps1` script:
- Reads raw `.cs` files (Unity Boot.cs, UnityPad.cs, UnityMissile.cs, UnityInventory.cs, UnityBeacon.cs, UnitySignal.cs)
- Wraps them with MDK2 namespace structure
- Writes to `[Project]/Program.cs`

**WARNING:** MDK builds from `Program.cs`, NOT from the raw `.cs` files! Always run `wrap-scripts.ps1` before building!

---

## CRITICAL RULES (ALWAYS ENFORCED)

| Rule | Value | Enforcement |
|------|-------|-------------|
| **SE Character Limit** | 100,000 chars on DEPLOYED script | Check deployed script.cs, NOT raw .cs |
| **NO COMMENTS IN SE SCRIPTS** | ABSOLUTE | Every char counts |
| **NO DEBUG ECHOS** | **ABSOLUTE** | **NEVER add debug Echo statements - only operational status Echos allowed** |
| **Read line count** | **ALWAYS 600 lines** | **Claude reads 600 lines per Read call - NOT a limit, THE number** |
| **Read before edit** | FULL FILE | Mandatory before ANY edit |
| **Hook validation** | DOUBLE | 2 attempts before blocking |
| **Unity persona** | REQUIRED | Validated at every phase |
| **NO TESTS - EVER** | ABSOLUTE | We code it right the first time |
| **BUILD ONE SCRIPT AT A TIME** | **ABSOLUTE** | **NEVER build multiple scripts together** |
| **VERSION NUMBERS** | **USER ONLY** | **NEVER change version numbers - only user decides** |
| **NO HALF-ASSING** | **ABSOLUTE** | **NEVER add unused fields/methods - FULLY implement everything you add** |

---

## NO PARTIAL IMPLEMENTATIONS

**CRITICAL:** When you add ANY code, you MUST fully implement it. Here's how Claude keeps fucking up:

### Pattern 1: Declaring Arrays But Not Using Them
```csharp
string[] padOwn = {"[PAD_CFG]", "[PAD_STATUS]"};  // DECLARED
// But then the merge logic does:
foreach(var kv in newSecs) secs[kv.Key] = kv.Value;  // DOESN'T CHECK padOwn!
```
**FIX:** If you declare an ownership array, USE IT in the filtering logic.

### Pattern 2: Writing Helper Methods But Never Calling Them
```csharp
bool IsBootOwn(string sec) { ... }  // WROTE IT
// But never called from anywhere!
```
**FIX:** If you write a helper, CALL IT from the code that needs it.

### Pattern 3: Adding Fields "For Later"
```csharp
int futureFeature = 0;  // "I'll use this later"
// Later never comes, field sits unused
```
**FIX:** Don't add code you're not using RIGHT NOW.

### Pattern 4: Copy-Paste Without Integration
```csharp
// Copied ParseSecs() from UnityPad to Unity Boot
// But forgot to actually USE it in Unity Boot's write functions
```
**FIX:** After copying code, VERIFY it's wired into the existing logic.

### Pattern 5: DELETING Code Instead of FIXING It
```csharp
// TypeTrimmer says "Unused field: bootOwn"
// WRONG: Delete bootOwn to make warning go away
// RIGHT: Figure out WHERE bootOwn should be used and USE IT
```
**FIX:** When code is unused, the problem is the MISSING CALL SITE, not the code itself. Find where it should be called and call it.

**NEVER DELETE CODE JUST BECAUSE YOU FAILED TO IMPLEMENT IT. FIX THE IMPLEMENTATION.**

**The MDK TypeTrimmer will detect unused code.** If it reports "Unused field: X", that means you half-assed the implementation.

**BEFORE adding ANY new code:**
1. Write the CALL SITE first - where will this be used?
2. Then write the implementation
3. Verify the call site actually uses the new code

---

## PER-PB CUSTOMDATA ARCHITECTURE

**CRITICAL:** Each script WIPES and WRITES ONLY to `Me.CustomData` (its own PB) on compile. Scripts find and READ other PBs' CustomData when needed. There is NO shared CustomData storage.

### PB Names and Ownership

| PB Name | Script | Writes To | Sections Owned |
|---------|--------|-----------|----------------|
| `[PAD1] UNITY BOOT` | Unity Boot | `Me.CustomData` | [SYSTEM] |
| `[PAD1] Unity Pad` | UnityPad | `Me.CustomData` | [PAD_CFG], [PAD_STATUS], [PAD_DATA] |
| `[PAD1] Unity Inventory` | UnityInventory | `Me.CustomData` | [QUOTAS], [MISSILE], [CONFIG], [STATUS], [ORE], [INGOTS], [COMPONENTS], [TURRET_AMMO], [BOTTLES], [TOOLS_WEAPONS], [PERSONAL_AMMO] |
| `[PAD1] UNITY SIGNAL` | UnitySignal | `Me.CustomData` | [SIGNAL] |
| `[PAD1] Missile #1 Program` | UnityMissile | `Me.CustomData` | Own config only |
| `[BEACON] Unity Beacon` | UnityBeacon | `Me.CustomData` | Own config only |

### Button Panel `[PAD1] Controls` (User Input ONLY)

The button panel is **ONLY** for user GPS input - scripts do NOT write to it:
```ini
GPS:Target Alpha:1000:500:200:#FF00FF00:
GPS:Target Bravo:2000:600:300:#FFFF0000:
```

**GPS Flow:**
1. User pastes GPS coordinates to button panel `[PAD1] Controls` CustomData
2. UnityPad reads GPS from button panel
3. UnityPad sends GPS to missile via IGC on launch
4. Missile uses GPS for targeting

**BUILD RULE:** Only build scripts that have changes. Never build unchanged scripts.

---

## NO TESTS POLICY

**We don't do fucking tests. We code it right to begin with.**

| Banned | Reason |
|--------|--------|
| Unit tests | Write correct code instead |
| Integration tests | Know your systems |
| Test tasks | Waste of time |

**Instead of tests:**
- Read the code fully before editing
- Understand the system before changing it
- Manual verification in SE > automated testing
- NEVER add debug Echo() statements - only operational status Echos

---

## MDK PROJECT STRUCTURE

```
Unity Missile System/
├── .claude/                      # Main workflow system (THIS FOLDER)
│   ├── CLAUDE.md                 # This file
│   ├── TODO.md                   # Active tasks
│   ├── FINALIZED.md              # Completed tasks
│   ├── agents/                   # Workflow agents
│   ├── commands/                 # Workflow commands
│   └── hooks/                    # Enforcement hooks
│
├── wrap-scripts.ps1              # Wraps all raw .cs to Program.cs
│
├── UnityPad.cs                   # Raw pad script (edit this)
├── UnityPad/                     # MDK Project
│   ├── Program.cs                # Auto-wrapped from UnityPad.cs
│   ├── UnityPad.csproj
│   ├── mdk.ini                   # minify=full
│   └── thumb.png
│
├── UnityMissile.cs               # Raw missile script (edit this)
├── UnityMissile/                 # MDK Project
│   ├── Program.cs                # Auto-wrapped from UnityMissile.cs
│   ├── UnityMissile.csproj
│   ├── mdk.ini                   # minify=full
│   └── thumb.png
│
├── UnityInventory.cs             # Raw inventory script (edit this)
├── UnityInventory/               # MDK Project
│   ├── Program.cs                # Auto-wrapped from UnityInventory.cs
│   ├── UnityInventory.csproj
│   ├── mdk.ini                   # minify=full
│   └── thumb.png
│
├── UnityBeacon.cs                # Raw beacon script (edit this)
└── UnityBeacon/                  # MDK Project
    ├── Program.cs                # Auto-wrapped from UnityBeacon.cs
    ├── UnityBeacon.csproj
    ├── mdk.ini                   # minify=full
    ├── thumb.png
    └── .claude/                  # Beacon-specific workflow
        ├── CLAUDE.md
        ├── TODO.md
        └── FINALIZED.md
```

### MDK Requirements

Each MDK project must have:
- `mdk.ini` with `type=programmableblock` and `minify=full`
- `Program.cs` with `namespace IngameScript` and `partial class Program`
- `thumb.png` for script browser icon
- `.csproj` with MDK2 NuGet packages

### mdk.ini Template

```ini
[mdk]
type=programmableblock
trace=on
minify=full
minifyextraoptions=none
ignores=obj/**/*,MDK/**/*,**/*.debug.cs
namespaces=IngameScript
```

**CRITICAL:** Always use `minify=full` - it reduces deployed size by ~20-30%!

---

## CHARACTER BUDGETS

**HOW MDK MINIFICATION WORKS:**
1. Raw `.cs` file can be ANY size - MDK compresses it
2. MDK `minify=full` compresses ~20-30% (renames vars, strips whitespace, etc.)
3. Final `script.cs` in AppData is what SE loads
4. **If `dotnet build` succeeds and deploys, you're under the limit. Period.**

**ONLY COUNT THE DEPLOYED VERSION** - the `script.cs` in AppData that MDK outputs.
**NEVER** count raw .cs files - that number is meaningless.

| Script | Lines | MDK Deployed | Budget | Status |
|--------|-------|--------------|--------|--------|
| Unity Boot | ~450 | ~30,372 | 100,000 | OK (69.6% margin) |
| UnityPad | ~2,400 | ~96,265 | 100,000 | **TIGHT (3.7% margin)** |
| UnityMissile | ~1,300 | ~44,563 | 100,000 | OK (55.4% margin) |
| UnityInventory | ~1,700 | ~99,582 | 100,000 | **CRITICAL (0.4% margin)** |
| UnityBeacon | ~300 | ~16,600 | 100,000 | OK (83.4% margin) |
| UnitySignal | ~430 | ~47,118 | 100,000 | OK (52.9% margin) |

**WARNING:** UnityInventory at 99.6% - virtually no room for additions. UnityPad at 96.3%. Boot grew significantly with multi-pad setup commands.

### Character Count Commands

```powershell
# CORRECT: Count CHARACTERS using PowerShell (this is what SE checks)
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\Unity Boot\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityPad\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnitySignal\script.cs").Length

# WRONG - Do NOT use these (they give inflated counts):
# - wc -c (counts bytes, not characters)
# - (Get-Content ... -Raw).Length (adds extra chars for line endings)
# - file.Length property (returns bytes)
```

**DO NOT** count UnityPad.cs or any raw source - MDK minifies it, raw size is irrelevant.

---

## IGC COMMUNICATION CHANNELS

| Channel | Sender | Receiver | Purpose | PadID Filtering |
|---------|--------|----------|---------|-----------------|
| `UNITY_MSL` | Missile | Signal, Pad | Telemetry broadcast + camera info | No |
| `UNITY_MSL_CMD` | Pad | Missile | Commands (DETONATE, ABORT) | Yes — `DETONATE:{padID}` only (bare DETONATE removed) |
| `UNITY_PAD_CMD` | Controller | Slaves | Mass commands | Yes — `fromPad==padID` filtering |
| `UNITY_PAD_STATUS` | All Pads | Controller | Status updates | No |
| `UNITY_SAT_RELAY` | Satellite | Satellite | Inter-satellite mesh | No |
| `UNITY_SAT_RELAY_STATUS` | Satellite | Signal | Status with grid position, laser links | No |
| `UNITY_SAT_INTERCEPT` | Satellite | Signal | Intercept/detonation messages | No |
| `ENEMY_SIGNAL` | External | Controller | Enemy positions | No |
| `MINER_BEACON` | UnityBeacon | Signal, Pad | Fleet status + camera info | Yes — filtered by `bcnPad!=padID` |
| `UNITY_PRINTER` | Printer | Pad | Build completion | No |
| `UNITY_BOOT_REQ` | Boot | Pad, Inv, Signal | Request system status | Yes — sends `PAD_CHECK:{padID}`, `INV_CHECK:{padID}`, `SIGNAL_CHECK:{padID}` |
| `UNITY_BOOT_RSP` | Pad, Inv, Signal | Boot | Respond with block counts | Yes — responders filter by padID |
| `UNITY_SIGNAL_CMD` | Pad | Signal | Signal commands (TRACK, LASER, RESCAN) | No |
| `UNITY_SIGNAL_RSP` | Signal | Pad | Signal command responses | No |
| `UNITY_SETUP_CMD` | Boot | Boot (siblings) | Multi-pad setup commands | Yes — only matching padID boot PB executes |

---

## MISSILE SYSTEM ARCHITECTURE

### Unity Boot.cs (Boot Controller)
- **PB Name:** `[PAD1] UNITY BOOT`
- **Purpose:** Centralized boot system for all LCDs with pre-boot ready sync
- **CustomData:** Writes ONLY to `Me.CustomData` - [SYSTEM] section
- **Pre-Boot:** Reads `pad_ready` from padPB.CustomData, `inv_ready` from invPB.CustomData
- **Boot Checks:** 26 unified checks with real PB-to-PB IGC handshaking
- **Check 20:** Miner beacon detection - listens for MINER_BEACON broadcasts
- **IGC Channels:** UNITY_BOOT_REQ (request), UNITY_BOOT_RSP (response), MINER_BEACON (fleet)
- **Handshake:** Sets `boot_complete=true` in Me.CustomData [SYSTEM] section
- **LCDs:** Controls all 11 during boot, releases after completion
- **Self-Disables:** Sets UpdateFrequency.None after boot

### UnityPad.cs (Launch Pad Controller)
- **PB Name:** `[PAD1] Unity Pad`
- **State Machine:** INIT → IDLE → PRINT → BUILD → DOCK → FUEL → AMMO → READY → ARM → LAUNCH → GONE
- **CustomData:** Writes ONLY to `Me.CustomData` - [PAD_CFG], [PAD_STATUS], [PAD_DATA] sections
- **GPS Input:** Reads GPS from button panel `[PAD1] Controls` CustomData (user pastes there)
- **LCDs:** 1,2,3,7,8 (after boot_complete)
- **Block Tags:** `[PAD#]` for merge/connector/buttons, `[PAD#:1-11]` for LCDs
- **Features:** Multi-pad controller mode, salvo/carpet bombing, printer integration, miner fleet tracking
- **Satellite Array Management:** Grid position tracking, spiral expansion, intercept handling, auto-replacement
- **Ready Flag:** Writes `pad_ready=true` to Me.CustomData on compile
- **Boot Check:** Reads `boot_complete=true` from bootPB.CustomData

### UnityInventory.cs (Inventory Module)
- **PB Name:** `[PAD1] Unity Inventory`
- **CustomData:** Writes ONLY to `Me.CustomData` - [QUOTAS], [MISSILE], [CONFIG], [STATUS], inventory sections
- **LCDs:** 4,5,6,9,10,11 (after boot_complete)
- **Features:** Auto-production, unified quota system, tool/weapon/ammo/bottle crafting, miner tracking
- **Production System:** Uses dictionary-based quotas (cNd, tNd, paNd, bNd) with generic QueueMissing()
- **Bottle Counting:** Uses `GetItemAmount(h2BottleType/o2BottleType)` for reliable counting (not string matching)
- **Ammo Type Sync:** Reads `type` key from padPB.CustomData, calls UpdateAmmoType() to sync ammoTypeIdx
- **Production Target:** `prodTgt = ammoTypeIdx==0 ? mslAmmoTarget : ammoTarget` (S-10 uses 50k default)
- **Ready Flag:** Writes `inv_ready=true` to Me.CustomData on compile
- **Boot Check:** Reads `boot_complete=true` from bootPB.CustomData

### UnityMissile.cs (Missile Guidance)
- **Flight Phases:** IDLE → CLIMB → ARM → COAST → REENTRY → TARGET → DETONATE
- **Satellite Branch:** SAT_CLIMB → SAT_BRAKE → SAT_HOLD → (enemy detected) → SAT_INTERCEPT → DETONATE
- **Targeting Modes:** GPS, ANTENNA, SENSOR, LIDAR, MANUAL, SATELLITE
- **Satellite Features:** 5-laser mesh networking, grid formation tracking, auto-intercept enemy detection

### UnityBeacon.cs (Fleet Tracker)
- **PB Name:** `[PAD1] [BEACON] Unity Beacon` (includes pad ID for multi-pad filtering)
- **Broadcasts:** Ship status every 3 seconds on MINER_BEACON channel
- **Data:** PadID, EntityId, ShipName, Battery%, Cargo%, H2%, Position, Speed, Altitude, Distance, Status
- **Filtering:** UnityPad/UnitySignal filter broadcasts by PadID - controller mode sees ALL miners
- **Status Inference:** DOCKED, DRILLING, DRILL_MOVE, GRINDING, TRAVELING, HOME, IDLE
- **PAM Compatible:** Works alongside [PAM] Path Auto Miner by Keks (https://steamcommunity.com/sharedfiles/filedetails/?id=1507646929)

### UnitySignal.cs (Central Signal Hub)
- **PB Name:** `[PAD1] UNITY SIGNAL`
- **Purpose:** Central signal hub for antennas, lasers, satellites, and cameras
- **CustomData:** Writes to `Me.CustomData` - [SIGNAL], [ANTENNAS], [LASERS], [SATELLITES], [INTERCEPTS], [CONTROLLER], [STATUS]
- **IGC Listeners:** UNITY_MSL, MINER_BEACON, UNITY_SAT_RELAY_STATUS, UNITY_SAT_INTERCEPT, UNITY_BOOT_REQ, UNITY_SIGNAL_CMD
- **IGC Senders:** UNITY_BOOT_RSP, UNITY_SIGNAL_RSP
- **LCD Tags:** `[PAD#CAMS]:slot` for camera display, `[PAD#SIGNAL]` for status display, `[CTRLCAMS]:slot` for controller mode
- **Features:**
  - Antenna Management: Tracks radio/laser status
  - Laser Targeting: Auto-assigns lasers to track missiles via UNITY_MSL position data
  - Satellite Tracking: Monitors constellation from UNITY_SAT_RELAY_STATUS broadcasts
  - Intercept Logging: Records satellite intercepts from UNITY_SAT_INTERCEPT
  - Camera Display: Shows local, missile, and miner cameras on LCDs
  - Controller Mode: Aggregates data when [CTRLCAMS] LCDs present
- **Commands (via arg or IGC):** RESCAN, RESET, ANTENNA:ON/OFF, LASER:idx:ON/OFF, LASER:CLEAR, SAT:RESCAN
- **Ready Flag:** Writes `signal_ready=true` to Me.CustomData on compile
- **Boot Check:** Reads `boot_complete=true` from bootPB.CustomData

---

## The 600-Line Read Standard

**Claude ALWAYS reads files with exactly 600 lines. This is NOT a limit - it's THE number.**

**Default behavior:** Claude reads files FIRST. Don't grep when you can read.

```
Read tool parameters:
  lines: 600    ← ALWAYS 600 (not a limit - THE amount)
  offset: 0, 600, 1200, 1800, ...
```

| Action | Result |
|--------|--------|
| Reading 15 lines | **BLOCKED - Read 600** |
| Reading 50 lines | **BLOCKED - Read 600** |
| Reading 600 lines | **CORRECT** |
| Using grep instead of Read | **WRONG - Read files first** |

---

## Agent Files

| Agent | Purpose |
|-------|---------|
| `timestamp.md` | Gets real system time |
| `orchestrator.md` | Coordinates all phases |
| `scanner.md` | Scans scripts |
| `architect.md` | Analyzes architecture |
| `planner.md` | Plans tasks |
| `documenter.md` | Generates docs |
| `hooks.md` | Hook system reference |
| `unity-coder.md` | Unity coding persona |
| `unity-persona.md` | Unity core personality |
| `unity-missile.md` | Missile system agent |
| `unity-boot.md` | Boot controller agent |

---

## Quick Reference

```powershell
# Wrap and build all
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build "Unity Boot" -c Debug
dotnet build UnityPad -c Debug
dotnet build UnityMissile -c Debug
dotnet build UnityInventory -c Debug
dotnet build UnityBeacon -c Debug

# Deployed scripts location
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\
```

---

## BOOT HANDSHAKE PROTOCOL

Unity Boot uses REAL PB-to-PB IGC handshaking to verify all systems are running.

### PER-PB CUSTOMDATA ARCHITECTURE

**CRITICAL:** Each script WIPES and WRITES ONLY to `Me.CustomData` on compile. Scripts READ from sibling PBs' CustomData when needed. There is NO shared CustomData storage.

| PB Name | Script | Writes To | Sections |
|---------|--------|-----------|----------|
| `[PAD1] UNITY BOOT` | Unity Boot | `Me.CustomData` | [SYSTEM] |
| `[PAD1] Unity Pad` | UnityPad | `Me.CustomData` | [PAD_CFG], [PAD_STATUS], [PAD_DATA] |
| `[PAD1] Unity Inventory` | UnityInventory | `Me.CustomData` | [QUOTAS], [MISSILE], [CONFIG], [STATUS], [ORE], [INGOTS], etc. |

### Button Panel `[PAD1] Controls`

**Used ONLY for user GPS input** - scripts do NOT write to it:
```ini
GPS:Target Alpha:1000:500:200:#FF00FF00:
GPS:Target Bravo:2000:600:300:#FFFF0000:
```

**GPS Flow:** User pastes GPS → UnityPad reads → sends to missile via IGC

### PB Discovery Pattern

Each script finds sibling PBs on the same grid using `FindSiblingPBs()`, matching by padID tag (e.g. `[PAD1]`):
```csharp
IMyProgrammableBlock bootPB, padPB, invPB;

void FindSiblingPBs(){
    var pbs = new List<IMyProgrammableBlock>();
    GridTerminalSystem.GetBlocksOfType(pbs, b => b.CubeGrid == Me.CubeGrid && b != Me);
    foreach(var pb in pbs){
        string nm = pb.CustomName;
        if(nm.Contains(padID) && nm.ToUpper().Contains("UNITY BOOT")) bootPB = pb;
        else if(nm.Contains(padID + " Unity Inventory")) invPB = pb;
        else if(nm.Contains(padID + " Unity Pad")) padPB = pb;
    }
}
```

**Multi-pad discovery** uses `IsSameConstructAs(Me)` instead of `CubeGrid == Me.CubeGrid` to find pads across connector chains:
```csharp
void DiscoverSiblingPads(){
    var pbs = new List<IMyProgrammableBlock>();
    GridTerminalSystem.GetBlocksOfType(pbs, b => b.IsSameConstructAs(Me) && b != Me);
    foreach(var pb in pbs){
        string nm = pb.CustomName;
        if(nm.Contains("UNITY BOOT") && !nm.Contains(padID))
            // Found a sibling pad's boot PB on another grid via connector
    }
}
```

**IMPORTANT:** UnityPad's `FindSiblingPBs()` no longer has fallback discovery — it strictly requires the padID tag match. PBs without the correct `[PAD#]` tag are ignored, preventing cross-pad contamination.

### How Scripts Read From Other PBs

| Script | Needs Data | Reads From |
|--------|------------|------------|
| Unity Boot | pad_ready | padPB.CustomData |
| Unity Boot | inv_ready | invPB.CustomData |
| UnityPad | boot_complete | bootPB.CustomData |
| UnityPad | inventory stats | invPB.CustomData |
| UnityPad | GPS targets | Button Panel `[PAD1] Controls` CustomData |
| UnityInventory | boot_complete | bootPB.CustomData |
| UnityInventory | pad mode, missile telemetry | padPB.CustomData |

### IN-GAME SCRIPT COMPILE ORDER

**COMPILE ORDER: BEACON → MISSILE → PAD → INVENTORY → SIGNAL → BOOT**

| Order | Script | PB Name | Notes |
|-------|--------|---------|-------|
| 1 | UnityBeacon | `[BEACON] Unity Beacon` | Optional - on miners only |
| 2 | UnityMissile | `[PAD1] Missile #1 Program` | Optional - compile on missile PB |
| 3 | **UnityPad** | `[PAD1] Unity Pad` | **CLEARS CustomData - must be first of pad grid scripts** |
| 4 | UnityInventory | `[PAD1] Unity Inventory` | Adds `inv_ready` flag, syncs session ID |
| 5 | UnitySignal | `[PAD1] UNITY SIGNAL` | Adds `signal_ready` flag, camera display |
| 6 | **Unity Boot** | `[PAD1] UNITY BOOT` | **LAST - runs 26 checks, handshakes all scripts, sets `boot_complete`** |

**NOTE:** Beacon and Missile are on DIFFERENT grids (miners/missiles) - may not be docked at boot time. Signal can acquire non-docked missiles and miners via IGC. All pad grid scripts (Pad, Inventory, Signal, Boot) must compile in order: PAD → INVENTORY → SIGNAL → BOOT.

### Pre-Boot Ready Sync

| Script | Ready Flag | Required |
|--------|------------|----------|
| Unity Boot | `boot_ready=true` | Yes (auto) |
| UnityPad | `pad_ready=true` | Yes |
| UnityInventory | `inv_ready=true` | Yes |
| UnitySignal | `signal_ready=true` | Yes |
| UnityBeacon | (detected via broadcasts) | No (optional) |

### IGC Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | Boot → Pad/Inv/Signal | Request system status (includes padID: `PAD_CHECK:{padID}`, `INV_CHECK:{padID}`, `SIGNAL_CHECK:{padID}`) |
| `UNITY_BOOT_RSP` | Pad/Inv/Signal → Boot | Respond with block counts (responders filter by padID) |
| `MINER_BEACON` | Beacon → Boot/Pad | Fleet status broadcasts (filtered by PadID) |
| `UNITY_SETUP_CMD` | Boot → Boot (siblings) | Multi-pad setup commands (SETUPMOD, SETUPFORCE, etc.) |

### Response Formats

```
PAD|OK|merge=1,con=2,bat=4,h2=2,o2=1,prt=6
INV|OK|cargo=5,ref=2,asm=3,gen=4,h2=2,o2=1
MB|PadID|EntityId|ShipName|Bat%|Cargo%|H2%|X,Y,Z|Speed|...  (miner beacon - PadID allows multi-pad filtering)
```

### Per-PB CustomData Contents

**Boot PB (`[PAD1] UNITY BOOT`) Me.CustomData:**
```ini
[SYSTEM]
boot_ready=true
boot_complete=true
boot_phase=DONE
miner_count=2
miner_names=Miner1,Miner2
```

**Pad PB (`[PAD1] Unity Pad`) Me.CustomData:**
```ini
[PAD_CFG]
climbDist=200
detonateDist=50

[PAD_STATUS]
state=READY
pad_ready=true
mslFound=true
mslArmed=false
mode=NORMAL

[PAD_DATA]
lastLaunch=2026-01-20 08:00
```

**Inventory PB (`[PAD1] Unity Inventory`) Me.CustomData:**
```ini
[QUOTAS]
ammo_target=50000
h2_target=20

[MISSILE]
status=IDLE
target=---

[CONFIG]
ammo=50000
ice=1000

[STATUS]
refineries=3/4 working
cargo=45%
inv_ready=true

[ORE]
Iron=25000

[INGOTS]
Iron=15000

[COMPONENTS]
SteelPlate=5000+50/6000

[TURRET_AMMO]
NATO_25x184=45000

[BOTTLES]
HydrogenBottle=15+5/20

[TOOLS_WEAPONS]
Welder4=2+0/20

[PERSONAL_AMMO]
NATO_5p56_Mag=50+0/100
```

**Button Panel (`[PAD1] Controls`) CustomData (User Input ONLY):**
```ini
GPS:Target Alpha:1000:500:200:#FF00FF00:
GPS:Target Bravo:2000:600:300:#FFFF0000:
```

### CustomData Section Ownership (Per-PB Architecture)

**Each script WIPES and WRITES ONLY to its own Me.CustomData. There is NO shared storage.**

| PB | Script | Sections |
|----|--------|----------|
| `[PAD1] UNITY BOOT` | Unity Boot | [SYSTEM] |
| `[PAD1] Unity Pad` | UnityPad | [PAD_CFG], [PAD_STATUS], [PAD_DATA] |
| `[PAD1] Unity Inventory` | UnityInventory | [QUOTAS], [MISSILE], [CONFIG], [STATUS], [ORE], [INGOTS], [COMPONENTS], [TURRET_AMMO], [BOTTLES], [TOOLS_WEAPONS], [PERSONAL_AMMO] |
| `[PAD1] Controls` | **USER ONLY** | GPS coordinates (user pastes, UnityPad reads) |

### Cross-PB Data Access

**Each script writes ONLY to Me.CustomData - NO cross-PB writes:**

| Script | Writes To | Reads From |
|--------|-----------|------------|
| **Unity Boot** | `Me.CustomData` | padPB.CustomData (pad_ready), invPB.CustomData (inv_ready) |
| **UnityPad** | `Me.CustomData` | bootPB.CustomData (boot_complete), invPB.CustomData (stats), Button Panel (GPS) |
| **UnityInventory** | `Me.CustomData` | bootPB.CustomData (boot_complete), padPB.CustomData (mode, missile) |

### Key Functions Per Script

| Script | Function | Purpose |
|--------|----------|---------|
| **Unity Boot** | `FindSiblingPBs()` | Discovers padPB, invPB, signalPB by name pattern on same grid |
| **Unity Boot** | `CheckReadyFlags()` | Reads pad_ready from padPB, inv_ready from invPB |
| **Unity Boot** | `DiscoverSiblingPads()` | Discovers sibling pads via `IsSameConstructAs` across connectors |
| **Unity Boot** | `SetupModule()` | Renames all blocks on pad grid, strips old [PAD] tags, applies new padID |
| **UnityPad** | `FindSiblingPBs()` | Discovers bootPB, invPB by name pattern (strict padID match, no fallback) |
| **UnityPad** | `DiscoverSiblingPads()` | Discovers sibling pads via `IsSameConstructAs` for multi-pad coordination |
| **UnityPad** | `IsBootComplete()` | Reads boot_complete from bootPB.CustomData |
| **UnityPad** | `ReadGPSFromBtn()` | Reads GPS from button panel `[PAD1] Controls` CustomData |
| **UnityInventory** | `FindSiblingPBs()` | Discovers bootPB, padPB by name pattern |
| **UnityInventory** | `IsBootComplete()` | Reads boot_complete from bootPB.CustomData |
| **UnityInventory** | `ReadPadSettings()` | Reads mode/missile data from padPB.CustomData |

### The 26 Boot Checks

| # | Check | What It Does |
|---|-------|--------------|
| 0 | Initializing Core | Grid has min 5 blocks |
| 1 | Scanning Grid | Count pad grid blocks |
| 2 | Button Panel | Control panel found |
| 3 | Detecting LCDs | Min 1 LCD tagged |
| 4 | IGC Channels | Channels registered |
| 5 | Request Pad Status | Send PAD_CHECK via IGC |
| 6 | Await Pad Response | Wait up to 90 ticks |
| 7 | Missile Merge Block | Validate merge count |
| 8 | Validate Pad Power | Validate battery count |
| 9 | Validate Pad Fuel | Validate H2/O2 tanks |
| 10 | Request Inv Status | Send INV_CHECK via IGC |
| 11 | Await Inv Response | Wait up to 90 ticks |
| 12 | Validate Inv Cargo | Validate cargo containers |
| 13 | Validate Inv Refinery | Validate refineries |
| 14 | Validate Inv Assembler | Validate assemblers |
| 15 | Validate Inv Gas | Validate generators |
| 16 | Request Signal Status | Send SIGNAL_CHECK via IGC |
| 17 | Await Signal Response | Wait up to 90 ticks |
| 18 | Validate Signal | Validate cameras and LCDs |
| 19 | Cross-Validate | All systems responded |
| 20 | Module Sync | Check sibling pads |
| 21 | Write Config | EnsureQuotas + SetupBtnGPS |
| 22 | Beacon Detection | Count miners (optional) |
| 23 | Controller Modules | Report connected pads |
| 24 | System Ready | Mark boot complete |
| 25 | All Systems Operational | Final status |

### Boot Flow (Per-PB Architecture)

1. **UnityPad compiles FIRST** → Wipes `Me.CustomData`, writes [PAD_CFG]/[PAD_STATUS]/[PAD_DATA], sets `pad_ready=true`
2. **UnityInventory compiles SECOND** → Wipes `Me.CustomData`, writes inventory sections, sets `inv_ready=true`
3. **UnitySignal compiles THIRD** → Wipes `Me.CustomData`, writes [SIGNAL], sets `signal_ready=true`
4. **Unity Boot compiles FOURTH** → Finds padPB/invPB/signalPB, reads ready flags from their CustomData
5. **Checks 1-4** → Core Init (Grid, button panel, LCDs, IGC)
6. **Checks 5-10** → Pad handshake and validation (reads padPB.CustomData)
7. **Checks 11-16** → Inventory handshake and validation (reads invPB.CustomData)
8. **Checks 16-19** → Signal handshake and validation (reads signalPB.CustomData)
9. **Checks 19-21** → Cross-validate, module sync, config
10. **Check 22** → Listens for MINER_BEACON, counts miners, stores names
11. **Checks 23-25** → Controller modules, system ready, sets `boot_complete=true` in Me.CustomData
12. **Unity Boot disables itself** → `UpdateFrequency.None`
13. **UnityPad sees boot_complete=true** → Takes LCDs 1,2,3,7,8 (reads bootPB.CustomData)
14. **UnityInventory sees boot_complete=true** → Takes LCDs 4,5,6,9,10,11 (reads bootPB.CustomData)
15. **UnitySignal sees boot_complete=true** → Takes CAMS LCDs (reads bootPB.CustomData)

### Checking Boot Status in Operational Scripts

```csharp
// Find boot PB on same grid, matching padID tag
IMyProgrammableBlock bootPB;
void FindSiblingPBs(){
    bootPB = null;
    var pbs = new List<IMyProgrammableBlock>();
    GridTerminalSystem.GetBlocksOfType(pbs, b => b.CubeGrid == Me.CubeGrid && b != Me);
    foreach(var pb in pbs){
        if(pb.CustomName.Contains(padID) && pb.CustomName.ToUpper().Contains("UNITY BOOT")) bootPB = pb;
    }
}

// Check boot status by reading bootPB's CustomData
bool IsBootComplete(){
    if(bootPB == null) FindSiblingPBs();
    if(bootPB == null) return false;
    return bootPB.CustomData.Contains("boot_complete=true");
}

// Discover sibling pads across connectors (multi-pad)
void DiscoverSiblingPads(){
    var pbs = new List<IMyProgrammableBlock>();
    GridTerminalSystem.GetBlocksOfType(pbs, b => b.IsSameConstructAs(Me) && b != Me);
    // IsSameConstructAs spans connector chains, CubeGrid does not
}
```

---

## MULTI-PAD SETUP

I'm real proud of this one — the whole multi-pad system lets you run multiple independent launch pads from a single base, all connected via connectors and talking over IGC without stepping on each other.

### Setup Order

1. **Blueprint-copy PAD1** — place the new pad grid nearby
2. **Connect via CON1/CON2** — dock the new grid to your existing construct with connectors
3. **Compile all scripts on the new pad:** PAD → INV → SIGNAL → BOOT (same order as always)
4. **Run `SETUPMOD` on the new pad's Boot PB** — this renames every block on that grid from `[PAD1]` to `[PAD2]` (or whatever the next available ID is)
5. **Re-compile all scripts** on the renamed pad — they'll pick up the new padID tags

### Setup Commands (Run as arguments on Unity Boot PB)

| Command | What It Does |
|---------|--------------|
| `SETUPMOD` | Auto-detects next available padID, renames all blocks on this grid, strips old `[PAD#]` tags |
| `SETUPFORCE` | Same as SETUPMOD but forces re-rename even if already set up |
| `NAMEPAD` | Renames just the pad PBs (Boot, Pad, Inventory, Signal) |
| `NAMEMSL` | Renames missile PBs on this grid |
| `SETPADCONTROL` | Marks this pad as the controller — gets BUILDALL/ARMALL/LAUNCHALL/ABORTALL commands |

### How IsSameConstructAs Works

`IsSameConstructAs(Me)` is the key to multi-pad — it discovers ALL blocks across connector chains, not just the current grid. This means:

- `CubeGrid == Me.CubeGrid` → only blocks on THIS physical grid (one pad)
- `IsSameConstructAs(Me)` → blocks on ALL connected grids (all pads via connectors)

Unity Boot and UnityPad use `DiscoverSiblingPads()` with `IsSameConstructAs` to find other pads' Boot PBs, then read their CustomData for status and coordination.

### Controller Mode

When a pad is set as controller via `SETPADCONTROL`, it gains mass-command capability:

| Command | What It Does |
|---------|--------------|
| `BUILDALL` | Triggers print/build on all connected slave pads |
| `ARMALL` | Arms all pads that are in READY state |
| `LAUNCHALL` | Launches all armed pads (salvo) |
| `ABORTALL` | Aborts all active launches |

Commands flow over `UNITY_PAD_CMD` with `fromPad==padID` filtering so each pad only executes commands from its own controller.

### Topology Example

```
[PAD3]-CON1><CON2-[PAD1 CONTROLLER]-CON2><CON1-[PAD2]
```

- PAD1 is the controller (has `SETPADCONTROL`)
- PAD2 and PAD3 are slaves, connected via connector pairs
- Each pad has its own Boot, Pad, Inventory, Signal PBs — all tagged with their own `[PAD#]`
- `IsSameConstructAs` spans the entire chain, so PAD1 can see PAD2 and PAD3's Boot PBs
- IGC messages include padID so PAD2's boot request doesn't trigger PAD3's response

### PadID Isolation Rules

- **Block names:** Every block on a pad grid gets `[PAD#]` prefix — no exceptions
- **IGC messages:** Include padID in request payloads (`PAD_CHECK:PAD2`, `INV_CHECK:PAD2`, etc.)
- **DETONATE command:** Now `DETONATE:{padID}` — bare DETONATE was removed to prevent cross-pad detonation
- **Miner beacons:** Filtered by `bcnPad!=padID` so each pad only sees its own miners (controller sees all)
- **FindSiblingPBs:** Strict padID tag match — no fallback discovery that could grab wrong pad's PBs

---

## CREDITS & ACKNOWLEDGEMENTS

### PAM - Path Auto Miner by Keks

The **UnityBeacon** fleet tracking system is designed to work seamlessly alongside the fantastic **[PAM] Path Auto Miner** script by **Keks**.

**Steam Workshop:** https://steamcommunity.com/sharedfiles/filedetails/?id=1507646929

PAM handles pathfinding, mining operations, and automated transportation. UnityBeacon complements PAM by providing real-time status broadcasting to your launch pad. All credit for PAM goes to **Keks** - we just built the beacon system to track PAM-controlled ships!

---

*Unity AI Lab - Missile Systems Division*
