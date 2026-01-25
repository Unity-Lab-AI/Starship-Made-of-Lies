# UNITY MISSILE SYSTEM - Architecture

*Last updated: 2026-01-24 (Documentation Unification)*

---

## System Overview

Six-script guided missile system for Space Engineers:
- **Unity Boot** - Boot controller runs 26 unified checks with real IGC handshaking
- **UnityPad** - Pad handles everything pre-launch (menus, fueling, targeting, printing)
- **UnityInventory** - Inventory management (sorting, production, fleet tracking)
- **UnitySignal** - Central signal controller (antennas, lasers, satellites, cameras)
- **UnityMissile** - Missile handles everything in-flight (guidance, targeting, detonation)
- **UnityBeacon** - Optional miner fleet status broadcasting

---

## Per-PB CustomData Architecture

**CRITICAL:** Each script wipes and writes ONLY to `Me.CustomData` (its own PB) on compile. Scripts find and READ other PBs' CustomData via `FindSiblingPBs()` when needed. This prevents race conditions when multiple scripts run in the same tick.

### PB and Block Names

| Block Type | Name Pattern | Example | Purpose |
|------------|--------------|---------|---------|
| **Boot PB** | `[PAD{id}]` | `[PAD1] UNITY BOOT` | Boot controller |
| **Pad PB** | `[PAD{id}]` (no suffix) | `[PAD1] Unity Pad` | Launch pad controller |
| **Inventory PB** | `[PAD{id}]` | `[PAD1] Unity Inventory` | Inventory manager |
| **Signal PB** | `[PAD{id}]` | `[PAD1] UNITY SIGNAL` | Signal controller |
| **Missile PB** | `[PAD{id}] Missile #X` | `[PAD1] Missile #1 Program` | Missile guidance |
| **Beacon PB** | `[BEACON]` | `[BEACON] Unity Beacon` | Fleet tracker |
| **Button Panel** | `[PAD{id}]` | `[PAD1] Controls` | GPS input (NOT a PB) |

**NOTE:** UnityPad, UnityInventory, and UnitySignal all use `[PAD{id}]` naming. They are distinguished by the full name ("Unity Pad" vs "Unity Inventory" vs "UNITY SIGNAL").

### Section Ownership (Who Writes What)

Each script writes ONLY to its own `Me.CustomData` with specific sections:

| PB | Script | Sections Owned (from code arrays) |
|----|--------|-----------------------------------|
| `[PAD{id}] UNITY BOOT` | Unity Boot | `[SYSTEM]` (bootOwn array) |
| `[PAD{id}] Unity Pad` | UnityPad | `[BLACKBOX]`, `[PAD_CFG]`, `[PAD_STATUS]`, `[PAD_DATA]` (padOwn array) |
| `[PAD{id}] Unity Inventory` | UnityInventory | `[QUOTAS]`, `[MISSILE]`, `[CONFIG]`, `[WAYPOINTS]`, `[STATUS]`, `[ORE]`, `[INGOTS]`, `[COMPONENTS]`, `[TURRET_AMMO]`, `[BOTTLES]`, `[TOOLS_WEAPONS]`, `[PERSONAL_AMMO]` (invOwn array) |
| `[PAD{id}] UNITY SIGNAL` | UnitySignal | `[SIGNAL]` (signalOwn array) |

### Button Panel GPS (User Input Only)

The `[PAD1] Controls` button panel is **NOT a PB** - it's used for user GPS input only:

- **Unity Boot** sets up `[GPS]` section template on compile
- **User** pastes GPS coordinates from clipboard (exact SE format: `GPS:Name:X:Y:Z:#Color:`)
- **UnityPad** reads GPS from `btn.CustomData` and sends to missile at launch

**Button Panel CustomData Format:**
```ini
[GPS]
GPS:Target Alpha:1000:500:200:#FF00FF00:
GPS:Target Beta:2000:1000:400:#FFFF0000:
```

**NOTE:** Only UnityPad reads from btn.CustomData for GPS targets. No script writes to the button panel CustomData except Unity Boot's initial template setup.

### PB Discovery Pattern

Each script finds sibling PBs using `FindSiblingPBs()`:

```csharp
IMyProgrammableBlock bootPB, padPB, invPB;

void FindSiblingPBs(){
    var pbs = new List<IMyProgrammableBlock>();
    GridTerminalSystem.GetBlocksOfType(pbs, b => b.CubeGrid == Me.CubeGrid && b != Me);
    foreach(var pb in pbs){
        string nm = pb.CustomName;
        if(nm.Contains($"[PAD{padID}]") && nm.ToUpper().Contains("UNITY BOOT")) bootPB = pb;
        else if(nm.Contains($"[PAD{padID}]") && nm.Contains("Inventory")) invPB = pb;
        else if(nm.Contains($"[PAD{padID}]") && nm.Contains("Pad")) padPB = pb;
    }
}
```

### Cross-PB Reading

Scripts read from other PBs' CustomData (never write to them):

| Script | Needs Data | Reads From |
|--------|------------|------------|
| Unity Boot | pad_ready | padPB.CustomData |
| Unity Boot | inv_ready | invPB.CustomData |
| UnityPad | boot_complete | bootPB.CustomData |
| UnityPad | inventory stats | invPB.CustomData |
| UnityPad | GPS targets | btn.CustomData (button panel) |
| UnityInventory | boot_complete | bootPB.CustomData |
| UnityInventory | pad mode | padPB.CustomData |

---

## Boot System Architecture

Unity Boot is a dedicated boot controller that runs 26 boot checks after UnityPad, UnityInventory, and UnitySignal compile.

### IN-GAME COMPILE ORDER

**COMPILE ORDER: BEACON → MISSILE → PAD → INVENTORY → SIGNAL → BOOT**

| Order | Script | PB Name | Notes |
|-------|--------|---------|-------|
| 1 | UnityBeacon | `[BEACON] Unity Beacon` | Optional - on miners only |
| 2 | UnityMissile | `[PAD1] Missile #1 Program` | Optional - compile on missile PB |
| 3 | **UnityPad** | `[PAD1] Unity Pad` | **CLEARS CustomData - must be first of pad grid scripts** |
| 4 | UnityInventory | `[PAD1] Unity Inventory` | Adds `inv_ready` flag, syncs session ID |
| 5 | UnitySignal | `[PAD1] UNITY SIGNAL` | Adds `signal_ready` flag, camera display |
| 6 | **Unity Boot** | `[PAD1] UNITY BOOT` | **LAST - runs 26 checks, handshakes all scripts, sets `boot_complete`** |

**NOTE:** Beacon and Missile are on DIFFERENT grids (miners/missiles) - may not be docked at boot time. Signal can acquire non-docked missiles and miners via IGC. All pad grid scripts (Pad, Inventory, Signal, Boot) wipe and write ONLY to their own Me.CustomData on compile.

### Boot Flow Diagram

```
UnityPad compiles       -> Wipes Me.CustomData, writes pad_ready=true
UnityInventory compiles -> Wipes Me.CustomData, writes inv_ready=true
UnitySignal compiles    -> Wipes Me.CustomData, writes signal_ready=true
Unity Boot compiles     -> Wipes Me.CustomData, writes boot_ready=true
                        -> FindSiblingPBs() discovers padPB, invPB, signalPB
                        -> Reads ready flags from sibling PBs
                        -> Runs 26 checks -> Controls ALL 11 LCDs
                        -> Writes boot_complete=true to Me.CustomData
                        -> Self-disables (UpdateFrequency.None)
                                       |
                                       v
UnityPad's IsBootComplete() reads bootPB.CustomData -> Takes LCDs 1,2,3,7,8
UnityInventory's IsBootComplete() reads bootPB.CustomData -> Takes LCDs 4,5,6,9,10,11
UnitySignal's IsBootComplete() reads bootPB.CustomData -> Takes CAMS LCDs
```

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

---

## Per-PB CustomData Contents

### Boot PB (`[PAD1] UNITY BOOT`) Me.CustomData
```ini
[SYSTEM]
boot_ready=true
boot_complete=true
boot_phase=DONE
miner_count=2
miner_names=Miner1,Miner2

[QUOTAS]
ammo_target=50000
h2_target=20
o2_target=20

[BLACKBOX]
boot_errors=
last_boot=2026-01-20 12:00
```

### Pad PB (`[PAD1] Unity Pad`) Me.CustomData
```ini
[SYSTEM]
pad_ready=true

[PAD_CFG]
climbDist=200
detonateDist=50
tMinus=3

[PAD_STATUS]
state=READY
mslFound=true
mslArmed=false
mode=NORMAL

[PAD_DATA]
lastLaunch=2026-01-20 08:00

[BLACKBOX]
pad_errors=
last_launch=
```

### Inventory PB (`[PAD1] Unity Inventory`) Me.CustomData
```ini
[SYSTEM]
inv_ready=true

[QUOTAS]
ammo_target=50000
h2_target=20

[MISSILE]
status=IDLE
target=---

[CONFIG]
ammo=50000
ice=1000
uran=50
h2=20
o2=20

[WAYPOINTS]
GPS:Target Alpha:1000:500:200:#FF00FF00:

[STATUS]
refineries=3/4 working
cargo=45%

[ORE]
Iron=25000
Ice=2500

[INGOTS]
Iron=15000
Nickel=8000

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

### Button Panel (`[PAD1] Controls`) CustomData (User GPS Input)
```ini
[GPS]
GPS:Target Alpha:1000:500:200:#FF00FF00:
GPS:Enemy Base:5000:2000:800:#FFFF0000:
```

---

## Script Architecture

### Unity Boot.cs (~20,000 chars deployed)

Boot controller running on dedicated PB `[PAD1] UNITY BOOT`.

**On Compile:**
- Wipes Me.CustomData
- Writes [SYSTEM] with boot_ready=true
- Finds padPB, invPB, signalPB via FindSiblingPBs()
- Reads ready flags from all sibling PBs
- Runs 26 boot checks
- Writes boot_complete=true to Me.CustomData
- Self-disables

**Key Functions:**
- `FindSiblingPBs()` - Discovers padPB, invPB, signalPB by name pattern
- `CheckReadyFlags()` - Reads ready flags from all sibling PBs
- `WriteBootComplete()` - Writes boot_complete=true to Me.CustomData

### UnityPad.cs (~97,400 chars deployed - WARNING: 2.6% margin)

Launch pad controller running on `[PAD1] Unity Pad` PB.

**On Compile:**
- Wipes Me.CustomData
- Writes [SYSTEM] with pad_ready=true
- Writes [PAD_CFG], [PAD_STATUS], [PAD_DATA], [BLACKBOX]

**State Machine:**
```
INIT -> IDLE -> PRINT -> BUILD -> DOCK -> FUEL -> AMMO -> READY -> ARM -> LAUNCH -> GONE
```

**Key Functions:**
- `FindSiblingPBs()` - Discovers bootPB and invPB
- `IsBootComplete()` - Reads boot_complete from bootPB.CustomData
- `ReadGPSFromBtn()` - Reads GPS targets from btn.CustomData (button panel)
- `UpdateMyData()` - Writes pad sections to Me.CustomData

### UnityInventory.cs (~90,200 chars deployed)

Inventory manager running on `[PAD1] Unity Inventory` PB.

**On Compile:**
- Wipes Me.CustomData
- Writes [SYSTEM] with inv_ready=true
- Writes [QUOTAS], [MISSILE], [CONFIG], and all inventory sections

**Key Functions:**
- `FindSiblingPBs()` - Discovers bootPB and padPB
- `IsBootComplete()` - Reads boot_complete from bootPB.CustomData
- `WriteMyData()` - Writes inventory sections to Me.CustomData
- `ReadPadSettings()` - Reads mode/status from padPB.CustomData
- `RecycleExcess()` - Multi-assembler recycling system
- `QueueProduction()` - Queue missing items to assemblers
- `GD()` - Item routing with S-10 exception

**Recycling System (RecycleExcess):**
- Calculates excess for: components, tools, personal ammo, bottles, turret ammo
- Scales recycler count based on total excess: `Math.Min(padAsm.Count, totEx/100+1)`
- Switches assemblers to Disassembly mode with `UseConveyorSystem=false`
- Transfers items to assembler input, queues disassembly
- Tools use `GetInventory(1)`, components/ammo use `GetInventory(0)`
- Re-enables conveyor when switching back to Assembly mode

**S-10 Ammo Routing:**
- S-10 (SemiAutoPistolMagazine) routes to generic cargo, not pAmmoCargo
- Used for missile warhead loading (10,106 rounds per missile)
- pAmmoTarget minimum enforced at 50,000 (was incorrectly 100 in old storage)
- Active cleanup pushes S-10 from pAmmoCargo to generic storage

### UnityMissile.cs (~34,200 chars deployed)

In-flight guidance running on missile PB.

**Flight Phases:**
```
IDLE -> CLIMB -> ARM -> COAST -> REENTRY -> TARGET -> DETONATE
```

**Satellite Branch:**
```
SAT_CLIMB -> SAT_BRAKE -> SAT_HOLD
```

### UnityBeacon.cs (~16,600 chars deployed)

Miner fleet broadcaster running on mining ship PBs.

**Broadcasts:** Ship status every 3 seconds on MINER_BEACON channel.

### UnitySignal.cs (~41,800 chars deployed)

Central signal controller running on `[PAD1] UNITY SIGNAL` PB.

**On Compile:**
- Wipes Me.CustomData
- Writes [SYSTEM] with signal_ready=true
- Writes [SIGNAL] section

**Key Functions:**
- `FindSiblingPBs()` - Discovers bootPB, padPB by name pattern
- `IsBootComplete()` - Reads boot_complete from bootPB.CustomData
- Manages: antennas, laser antennas, satellite constellation, cameras

---

## IGC Communication Channels

| Channel | Sender | Receiver | Purpose |
|---------|--------|----------|---------|
| `UNITY_BOOT_REQ` | Boot | Pad/Inv | Request system status |
| `UNITY_BOOT_RSP` | Pad/Inv | Boot | Respond with block counts |
| `UNITY_MSL` | Missile | Pad | Telemetry broadcast |
| `UNITY_MSL_CMD` | Pad | Missile | Commands (DETONATE, ABORT) |
| `UNITY_PAD_CMD` | Controller | Slaves | Mass commands |
| `UNITY_PAD_STATUS` | All Pads | Controller | Status updates |
| `UNITY_SAT_RELAY` | Satellite | Satellite | Inter-satellite mesh |
| `MINER_BEACON` | UnityBeacon | Pad/Boot | Fleet status |

---

## Block Detection Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `[PAD#]` | Pad blocks | `[PAD1] Merge Block` |
| `[PAD#:1-11]` | LCD panels | `[PAD1:1]` through `[PAD1:11]` |
| `[PAD#-PRINT]` | Printer components | `[PAD1-PRINT] Piston` |
| `[DOCK]` | Fuel connector | Auto-named on setup |
| `[AMMO]` | Ammo connector | Auto-named on setup |
| `-ore` | Ore storage | `Large Cargo -ore` |
| `-ingot` | Ingot storage | |
| `-comp` | Component storage | |
| `-tools` | Tools storage | |
| `-ammo` | Turret ammo | |
| `-bottle` | H2/O2 bottles | |

---

## File Structure

```
Unity Missile System/
|-- Unity Boot.cs            # RAW boot script (EDIT THIS)
|-- UnityPad.cs              # RAW pad script (EDIT THIS)
|-- UnityMissile.cs          # RAW missile script (EDIT THIS)
|-- UnityInventory.cs        # RAW inventory script (EDIT THIS)
|-- UnityBeacon.cs           # RAW beacon script (EDIT THIS)
|-- UnitySignal.cs           # RAW signal script (EDIT THIS)
|-- wrap-scripts.ps1         # Wraps all raw .cs to Program.cs
|
|-- Unity Boot/              # MDK Project
|   |-- Program.cs           # Wrapped from Unity Boot.cs
|   +-- .claude/             # Boot-specific docs
|
|-- UnityPad/                # MDK Project
|   |-- Program.cs           # Wrapped from UnityPad.cs
|   +-- .claude/             # Pad-specific docs
|
|-- UnityMissile/            # MDK Project
|-- UnityInventory/          # MDK Project
|-- UnityBeacon/             # MDK Project
|-- UnitySignal/             # MDK Project
|
+-- .claude/                 # Main workflow system
    |-- ARCHITECTURE.md      # This file
    |-- CLAUDE.md            # Rules and enforcement
    |-- TODO.md              # Active tasks
    +-- FINALIZED.md         # Completed tasks
```

---

## Character Budget

| Script | Deployed | Limit | Margin | Status |
|--------|----------|-------|--------|--------|
| Unity Boot | ~20,000 | 100,000 | 80% | OK |
| UnityPad | ~97,400 | 100,000 | 2.6% | **WARNING** |
| UnityMissile | ~34,200 | 100,000 | 66% | OK |
| UnityInventory | ~90,200 | 100,000 | 9.8% | OK |
| UnityBeacon | ~16,600 | 100,000 | 83% | OK |
| UnitySignal | ~41,800 | 100,000 | 58% | OK |

**WARNING:** UnityPad is at 97.4% capacity. Code optimizations required before adding features.

---

## Development Workflow

1. Edit raw `.cs` file (e.g., `UnityPad.cs`)
2. Run `powershell -File wrap-scripts.ps1`
3. Build: `dotnet build UnityPad -c Debug`
4. MDK auto-deploys to SE ingame scripts folder
5. Check deployed size (CHARACTERS):
```powershell
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityPad\script.cs").Length
```

---

## Checking Boot Status (Code Pattern)

```csharp
// Find boot PB first (call in Program() or when needed)
IMyProgrammableBlock bootPB;

void FindSiblingPBs(){
    bootPB = null;
    var pbs = new List<IMyProgrammableBlock>();
    GridTerminalSystem.GetBlocksOfType(pbs, b => b.CubeGrid == Me.CubeGrid && b != Me);
    foreach(var pb in pbs){
        if(pb.CustomName.Contains($"[PAD{padID}]") && pb.CustomName.ToUpper().Contains("UNITY BOOT")) bootPB = pb;
    }
}

// Check boot status by reading bootPB's CustomData
bool IsBootComplete(){
    if(bootPB == null) FindSiblingPBs();
    if(bootPB == null) return false;
    return bootPB.CustomData.Contains("boot_complete=true");
}
```

---

*Unity AI Lab - Missile Systems Division*
