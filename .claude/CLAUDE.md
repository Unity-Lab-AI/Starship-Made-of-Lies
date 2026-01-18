# UNITY MISSILE SYSTEM - .claude Workflow System

**Folder:** `Unity Missile System/`

Analyzes and develops the guided missile system for Space Engineers. Uses Unity persona with strict validation hooks.

---

## PROJECT COMPONENTS

| Component | Script | PB Name | Deployed To |
|-----------|--------|---------|-------------|
| **Boot Controller** | `Unity Boot.cs` | `[PAD1-BOOT] UNITY BOOT` | `%APPDATA%\...\Unity Boot\` (21 checks with PB handshaking + miner detection) |
| **Launch Pad** | `UnityPad.cs` | `[PAD1] Unity Pad` | `%APPDATA%\...\UnityPad\` |
| **Missile** | `UnityMissile.cs` | `PAD1 Missile #1 Unity Missile` | `%APPDATA%\...\UnityMissile\` |
| **Inventory** | `UnityInventory.cs` | `[PAD1] Unity Inventory` | `%APPDATA%\...\UnityInventory\` (unified production system) |
| **Fleet Beacon** | `UnityBeacon.cs` | `[BEACON] Unity Beacon` | `%APPDATA%\...\UnityBeacon\` |

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
```

### Deploy Location

All scripts deploy automatically to:
```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\
├── Unity Boot\script.cs
├── UnityPad\script.cs
├── UnityMissile\script.cs
├── UnityInventory\script.cs
└── UnityBeacon\script.cs
```

### Wrapper Script

The `wrap-scripts.ps1` script:
- Reads raw `.cs` files (Unity Boot.cs, UnityPad.cs, UnityMissile.cs, UnityInventory.cs, UnityBeacon.cs)
- Wraps them with MDK2 namespace structure
- Writes to `[Project]/Program.cs`

**WARNING:** MDK builds from `Program.cs`, NOT from the raw `.cs` files! Always run `wrap-scripts.ps1` before building!

---

## CRITICAL RULES (ALWAYS ENFORCED)

| Rule | Value | Enforcement |
|------|-------|-------------|
| **SE Character Limit** | 100,000 chars on DEPLOYED script | Check deployed script.cs, NOT raw .cs |
| **NO COMMENTS IN SE SCRIPTS** | ABSOLUTE | Every char counts |
| **Read limit parameter** | **EXACTLY 800** | **ANY OTHER VALUE = CHEATING** |
| **Read before edit** | FULL FILE | Mandatory before ANY edit |
| **Hook validation** | DOUBLE | 2 attempts before blocking |
| **Unity persona** | REQUIRED | Validated at every phase |
| **NO TESTS - EVER** | ABSOLUTE | We code it right the first time |
| **BUILD ONE SCRIPT AT A TIME** | **ABSOLUTE** | **NEVER build multiple scripts together** |
| **VERSION NUMBERS** | **USER ONLY** | **NEVER change version numbers - only user decides** |

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
- Use Echo() debugging if needed
- Manual verification in SE > automated testing

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
| Unity Boot | ~320 | 14,576 | 100,000 | OK (85% margin) |
| UnityPad | ~2,100 | 90,354 | 100,000 | OK (10% margin) |
| UnityMissile | ~900 | ~26,000 | 100,000 | OK (74% margin) |
| UnityInventory | ~1,500 | 83,638 | 100,000 | OK (16% margin) |
| UnityBeacon | ~175 | ~10,800 | 100,000 | OK (89% margin) |

### Character Count Commands

```powershell
# ONLY check deployed script.cs - this is the ONLY number that matters
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\Unity Boot\script.cs" -Raw).Length
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityPad\script.cs" -Raw).Length
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs" -Raw).Length
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs" -Raw).Length
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs" -Raw).Length
```

**DO NOT** count UnityPad.cs or any raw source - MDK minifies it, raw size is irrelevant.

---

## IGC COMMUNICATION CHANNELS

| Channel | Sender | Receiver | Purpose |
|---------|--------|----------|---------|
| `UNITY_MSL` | Missile | Pad | Telemetry broadcast |
| `UNITY_MSL_CMD` | Pad | Missile | Commands (DETONATE, ABORT) |
| `UNITY_PAD_CMD` | Controller | Slaves | Mass commands |
| `UNITY_PAD_STATUS` | All Pads | Controller | Status updates |
| `UNITY_SAT_RELAY` | Satellite | Satellite | Inter-satellite mesh |
| `ENEMY_SIGNAL` | External | Controller | Enemy positions |
| `MINER_BEACON` | UnityBeacon | Pad | Fleet status |
| `UNITY_PRINTER` | Printer | Pad | Build completion |

---

## MISSILE SYSTEM ARCHITECTURE

### Unity Boot.cs (Boot Controller)
- **Purpose:** Centralized boot system for all LCDs with pre-boot ready sync
- **Pre-Boot:** Waits for `pad_ready=true` and `inv_ready=true` before starting checks
- **Boot Checks:** 21 unified checks with real PB-to-PB IGC handshaking
- **Check 20 (NEW):** Miner beacon detection - listens for MINER_BEACON broadcasts
- **IGC Channels:** UNITY_BOOT_REQ (request), UNITY_BOOT_RSP (response), MINER_BEACON (fleet)
- **Handshake:** Sets `boot_complete=true` in [SYSTEM] CustomData
- **Miner Data:** Stores `miner_count` and `miner_names` in CustomData
- **LCDs:** Controls all 10 during boot, releases after completion
- **Waiting Screen:** Shows script ready status when waiting for Pad/Inventory
- **Self-Disables:** Sets UpdateFrequency.None after boot

### UnityPad.cs (Launch Pad Controller)
- **State Machine:** INIT → IDLE → PRINT → BUILD → DOCK → FUEL → AMMO → READY → ARM → LAUNCH → GONE
- **LCDs:** 1,2,3,7,8 (after boot_complete)
- **Block Tags:** `[PAD#]` for merge/connector/buttons, `[PAD#:1-10]` for LCDs
- **Features:** Multi-pad controller mode, salvo/carpet bombing, printer integration, miner fleet tracking
- **Ready Flag:** Writes `pad_ready=true` on compile (for boot pre-check)
- **Boot Check:** Waits for `boot_complete=true` before taking LCD control

### UnityInventory.cs (Inventory Module)
- **LCDs:** 4,5,6,9,10 (after boot_complete)
- **Features:** Auto-production, unified quota system, tool/weapon/ammo/bottle crafting, miner tracking
- **Production System:** Uses dictionary-based quotas (cNd, tNd, paNd, bNd) with generic QueueMissing()
- **Ready Flag:** Writes `inv_ready=true` on compile (for boot pre-check)
- **Boot Check:** Waits for `boot_complete=true` before taking LCD control

### UnityMissile.cs (Missile Guidance)
- **Flight Phases:** IDLE → CLIMB → ARM → COAST → REENTRY → TARGET → DETONATE
- **Satellite Branch:** SAT_CLIMB → SAT_BRAKE → SAT_HOLD
- **Targeting Modes:** GPS, ANTENNA, SENSOR, LIDAR, MANUAL, SATELLITE

### UnityBeacon.cs (Fleet Tracker)
- **Broadcasts:** Ship status every 3 seconds on MINER_BEACON channel
- **Data:** EntityId, ShipName, Battery%, Cargo%, H2%, Position, Speed, Altitude, Distance, Status
- **Status Inference:** DOCKED, DRILLING, DRILL_MOVE, GRINDING, TRAVELING, HOME, IDLE
- **PAM Compatible:** Works alongside [PAM] Path Auto Miner by Keks (https://steamcommunity.com/sharedfiles/filedetails/?id=1507646929)

---

## The 800-Line Read Standard

```
Read tool parameters MUST be:
  limit: 800    ← ALWAYS 800
  offset: 0, 800, 1600, 2400, ...
```

| Action | Result |
|--------|--------|
| `limit: 15` | **BLOCKED - CHEATING** |
| `limit: 50` | **BLOCKED - CHEATING** |
| `limit: 800` | ALLOWED |

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

### Pre-Boot Ready Sync

Scripts can be compiled in ANY order. Boot waits for all required scripts before starting:

| Script | Ready Flag | Required |
|--------|------------|----------|
| Unity Boot | `boot_ready=true` | Yes (auto) |
| UnityPad | `pad_ready=true` | Yes |
| UnityInventory | `inv_ready=true` | Yes |
| UnityBeacon | (detected via broadcasts) | No (optional) |

### IGC Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | Boot → Pad/Inv | Request system status |
| `UNITY_BOOT_RSP` | Pad/Inv → Boot | Respond with block counts |
| `MINER_BEACON` | Beacon → Boot/Pad | Fleet status broadcasts |

### Response Formats

```
PAD|OK|merge=1,con=2,bat=4,h2=2,o2=1,prt=6
INV|OK|cargo=5,ref=2,asm=3,gen=4,h2=2,o2=1
MB|EntityId|ShipName|Bat%|Cargo%|H2%|X,Y,Z|Speed|...  (miner beacon)
```

### CustomData Structure (Button Panel [SYSTEM])

```ini
[SYSTEM]
; Pre-boot ready flags
boot_ready=true
pad_ready=true
inv_ready=true

; Boot state
boot_complete=false    ; Set TRUE by Unity Boot when 21/21 checks pass
boot_phase=RUNNING

; PB handshake data
pad_check=none         ; Boot writes "request", Pad writes "done"
pad_status=waiting     ; Pad writes response data here
inv_check=none         ; Boot writes "request", Inv writes "done"
inv_status=waiting     ; Inventory writes response data here

; Miner fleet data (from check 20)
miner_count=0          ; Number of miners detected
miner_names=           ; Comma-separated ship names
beacon_optional=true   ; If false, boot fails without miners
```

### The 21 Boot Checks

| # | Check | What It Does |
|---|-------|--------------|
| 1-4 | Core Init | Grid, button panel, LCDs, IGC |
| 5-6 | Pad Request | Send request, await response |
| 7-10 | Pad Validate | Merge, batteries, H2/O2 tanks |
| 11-12 | Inv Request | Send request, await response |
| 13-16 | Inv Validate | Cargo, refineries, assemblers, gas |
| 17-18 | Sync | Cross-validate, module sync |
| 19 | Config | Write quotas and blackbox |
| **20** | **Beacon Detection** | **Listen for MINER_BEACON, store miner names** |
| 21 | System Ready | Boot complete |

### Boot Flow

1. **Scripts compile** → Each writes its ready flag (pad_ready, inv_ready, boot_ready)
2. **Unity Boot checks flags** → If not all ready, shows "WAITING FOR SCRIPTS" screen
3. **All ready** → Clears stale data, starts 21/21 checks
4. **Checks 1-19** → Same as before (pad/inv validation, config)
5. **Check 20** → Listens for MINER_BEACON, counts miners, stores names
6. **Check 21** → Boot complete
7. **If success** → Sets `boot_complete=true` in CustomData
8. **Unity Boot disables itself** → `UpdateFrequency.None`
9. **UnityPad sees boot_complete=true** → Takes LCDs 1,2,3,7,8
10. **UnityInventory sees boot_complete=true** → Takes LCDs 4,5,6,9,10

### Checking Boot Status in Operational Scripts

```csharp
bool IsBootComplete(){
    if(btn==null)return false;
    return btn.CustomData.Contains("boot_complete=true");
}
```

---

## CREDITS & ACKNOWLEDGEMENTS

### PAM - Path Auto Miner by Keks

The **UnityBeacon** fleet tracking system is designed to work seamlessly alongside the fantastic **[PAM] Path Auto Miner** script by **Keks**.

**Steam Workshop:** https://steamcommunity.com/sharedfiles/filedetails/?id=1507646929

PAM handles pathfinding, mining operations, and automated transportation. UnityBeacon complements PAM by providing real-time status broadcasting to your launch pad. All credit for PAM goes to **Keks** - we just built the beacon system to track PAM-controlled ships!

---

*Unity AI Lab - Missile Systems Division*
