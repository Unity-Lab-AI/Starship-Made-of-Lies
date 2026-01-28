![Unity Inventory](Unity%20Inventory%202.png)

# UnityInventory v01.00

Inventory management system for the Unity Missile System. Handles LCDs 4, 5, 6, 9, 10, 11 with sprite rendering, auto-production, miner fleet tracking, and recycling.

**Location:** `Unity Missile System/src/scripts/UnityInventory/`
**PB Name:** `[PAD1] Unity Inventory`
**Version:** v01.00 | 2026-01-28

---

## Table of Contents

1. [Overview](#overview)
2. [System Integration](#system-integration)
3. [Required Blocks](#required-blocks)
4. [LCD Displays](#lcd-displays)
5. [Container Tags](#container-tags)
6. [Production System](#production-system)
7. [Recycling System](#recycling-system)
8. [Miner Fleet Tracking](#miner-fleet-tracking)
9. [Commands](#arguments)
10. [CustomData Schema](#per-pb-customdata)
11. [Build and Deploy](#build-and-deploy)
12. [Character Budget](#character-budget)
13. [Quick Reference](#quick-reference)

---

## Overview

UnityInventory is the inventory controller that:
1. **Manages 6 LCD displays** with sprite-based rendering
2. **Tracks production** via assemblers and refineries
3. **Auto-crafts** components, tools, weapons, ammo, bottles
4. **Recycles excess** items when stock exceeds targets
5. **Routes items** to designated containers
6. **Tracks miner fleet** via MINER_BEACON broadcasts
7. **Displays missile status** during docking and flight
8. **Responds to boot handshakes** during system initialization
9. **Counts bottles reliably** using `GetItemAmount()` instead of string matching
10. **Syncs ammo type** from UnityPad for correct production targeting
11. **Counts personal ammo reliably** using `GetItemAmount()` for all ammo types
12. **Protects miner connectors** - only manipulates FUEL-tagged connectors

---

## System Integration

### The Unity Missile System

| Component | Script | PB Name | Purpose |
|-----------|--------|---------|---------|
| **Boot Controller** | Unity Boot.cs | `[PAD1] UNITY BOOT` | 26-check boot sequence |
| **Launch Pad** | UnityPad.cs | `[PAD1] Unity Pad` | Missile control, LCDs 1,2,3,7,8 |
| **Inventory** | **UnityInventory.cs** | **`[PAD1] Unity Inventory`** | **Production, LCDs 4,5,6,9,10,11** |
| **Signal Hub** | UnitySignal.cs | `[PAD1] UNITY SIGNAL` | Camera display, laser targeting, satellite tracking |
| **Missile** | UnityMissile.cs | `[PAD1] Missile #1 Program` | Guided flight |
| **Fleet Beacon** | UnityBeacon.cs | `[BEACON] Unity Beacon` | Miner status broadcast |

### Compile Order (Pad Grid)

**PAD → INVENTORY → SIGNAL → BOOT**

| Order | Script | Action |
|-------|--------|--------|
| 1 | UnityPad | Clears CustomData, writes `pad_ready=true` |
| 2 | UnityInventory | Clears CustomData, writes `inv_ready=true` |
| 3 | UnitySignal | Clears CustomData, writes `signal_ready=true` |
| 4 | Unity Boot | Reads ready flags, runs 26 checks, sets `boot_complete=true` |

*Note: UnityBeacon (miners) and UnityMissile (missiles) are on separate grids - compile anytime.*

---

## REQUIRED BLOCKS

| Block | Purpose |
|-------|---------|
| Programmable Block | Runs this script |
| LCDs [PAD1:4-11] | Status displays |
| Cargo Containers | Item storage |
| Assemblers | Production |
| Refineries | Ore processing |

## OPTIONAL BLOCKS

| Block | Purpose |
|-------|---------|
| Button Panel | GPS input (Controls) |
| Reactors | Power generation |
| Gas Generators | H2/O2 production |
| Gas Tanks | Fuel storage |
| Batteries | Power storage |
| Medical Rooms | Facility count |
| Survival Kits | Facility count |
| Cryo Chambers | Facility count |

---

## BOOT SYSTEM DEPENDENCY

**UnityInventory waits for boot_complete=true before taking LCD control.**

### Compile Order

**COMPILE ORDER: PAD -> INVENTORY -> SIGNAL -> BOOT**

| Order | Script | PB Name | Action |
|-------|--------|---------|--------|
| 1 | UnityPad | `[PAD1] Unity Pad` | Sets `pad_ready=true` |
| 2 | UnityInventory | `[PAD1] Unity Inventory` | Sets `inv_ready=true` |
| 3 | UnitySignal | `[PAD1] UNITY SIGNAL` | Sets `signal_ready=true` |
| 4 | Unity Boot | `[PAD1] UNITY BOOT` | Runs 26 checks, sets `boot_complete=true` |

### Ready Flag

On compile, ClearForBoot() writes to Me.CustomData:
```ini
[SYSTEM]
inv_ready=true
inv_for_session={padSession}
inv_status=OK:cargo=5,ref=2,asm=3,gen=4,h2=2,o2=1
```

### Boot Response Protocol

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | Boot -> Inv | Request status |
| `UNITY_BOOT_RSP` | Inv -> Boot | Respond with block counts |

**Response Format:**
```
INV|OK|cargo=5,ref=2,asm=3,gen=4,h2=2,o2=1
```

---

## LCD DISPLAYS

UnityInventory controls LCDs 4, 5, 6, 9, 10, 11 after boot completion.

| LCD | Content | Notes |
|-----|---------|-------|
| 4 | Pad Overview | Auto-cycles through 7 views |
| 5 | Power/Systems | Battery, solar, wind, reactors |
| 6 | Graphs | Auto-cycles through 12 graph types |
| 9 | Miner Fleet | Overview of tracked ships |
| 10 | Miner Details | Selected miner full stats |
| 11 | Personal Items | Tools, weapons, ammo, bottles (wide LCD) |

### LCD4 Auto-Cycle Views (7 views, ~5 seconds each)

| View | Content |
|------|---------|
| 0 | BUILD STATUS - Components stock/missing |
| 1 | MISSILE STATUS - Ready/armed counts, phase |
| 2 | FUEL/TARGET - H2/O2/battery bars, ammo, bottles |
| 3 | POWER - Battery charge, net flow, uranium |
| 4 | CARGO - Scrolling inventory list |
| 5 | PRODUCTION - Refinery/assembler queue |
| 6 | COMMS - Pad facilities, miner count |

### LCD6 Auto-Cycle Graphs (12 graphs, ~3 seconds each)

| Index | Graph |
|-------|-------|
| 0 | Battery Power (MWh) |
| 1 | Hydrogen Tanks (kL) |
| 2 | Oxygen Tanks (kL) |
| 3 | Cargo Capacity (L) |
| 4 | Refinery Input (L) |
| 5 | Assembler Input (L) |
| 6 | Production Queue |
| 7 | Power Input (MW) |
| 8 | Power Output (MW) |
| 9 | Solar Output (MW) |
| 10 | Wind Output (MW) |
| 11 | Reactor Output (MW) |

### Display Modes

LCDs adapt based on pad state:

| Mode | Description |
|------|-------------|
| NORMAL | Standard inventory/miner display |
| FLIGHT | Missile telemetry during active flight |
| CONTROLLER | Multi-pad command center |
| MISSILE | Missile docked - loading status |
| PRINT | Printer active - build progress |

---

## CONTAINER TAGS

Tag containers for automatic routing:

| Tag | Purpose |
|-----|---------|
| `[PAD1-ore]` | Ore storage |
| `[PAD1-ingot]` | Ingot storage |
| `[PAD1-comp]` | Component storage |
| `[PAD1-ammo]` | Turret ammo storage |
| `[PAD1-tools]` | Tool/weapon storage |
| `[PAD1-bottle]` | Bottle storage |
| `[PAD1-pammo]` | Personal ammo storage |
| `[PAD1-food]` | Food/consumables |
| `[PAD1-data]` | Datapads |
| `[PAD1-misc]` | Miscellaneous items |

---

## PRODUCTION SYSTEM

### Quota Dictionaries

| Dictionary | Item Type | Default Min |
|------------|-----------|-------------|
| `cNd` | Components | Per-item targets |
| `tNd` | Tools & Weapons | 20 each |
| `paNd` | Personal Ammo | 20 each |
| `bNd` | Bottles (H2/O2) | 20 each |

### Component Default Quotas

| Component | Target |
|-----------|--------|
| SteelPlate | 6,000 |
| Construction | 3,500 |
| SmallTube | 3,200 |
| LargeTube | 1,500 |
| Motor | 1,200 |
| Computer | 1,500 |
| MetalGrid | 950 |
| Display | 600 |
| BulletproofGlass | 2,050 |
| PowerCell | 800 |
| Thrust | 1,050 |
| Explosives | 2,600 |

### Production Flow

1. `CountStocks()` - Count items in all containers
2. `CalcMissing()` - Compare stock vs quotas
3. `QueueProduction()` - Queue missing items
4. `QueueMissing()` - Generic queue for tools/ammo/bottles

---

## RECYCLING SYSTEM

The RecycleExcess() function automatically disassembles excess items.

### How It Works

1. Calculate excess for all item types (stock - target)
2. Scale recycler count: `Math.Min(padAsm.Count, totEx/100+1)`
3. Set selected assemblers to Disassembly mode
4. Disable conveyor system (prevent auto-pull)
5. Transfer excess items to recycler inputs
6. Queue disassembly for transferred items
7. Return empty recyclers to Assembly mode

### Recycled Item Types

- Components (when stock > quota)
- Tools & Weapons (when stock > toolTarget)
- Personal Ammo (when stock > pAmmoTarget)
- Turret Ammo (when stock > ammoTarget)
- H2/O2 Bottles (when stock > h2/o2Target)

---

## CONNECTOR DETECTION (CRITICAL)

**Missile Fuel Connector Detection:**
- `padCon` is ONLY assigned if connector name contains "FUEL"
- Example: `[PAD1] FUEL CONNECTOR`
- This prevents detecting miner connectors as the missile fuel connector

**Miner Connectors (PROTECTED):**
- Connectors with "ORE" in name are for miners only
- Example: `[PAD1] ORE LOAD 1`, `[PAD1] Connector Miner 1`
- UnityInventory does NOT control these connectors
- Prevents miners from unlocking during missile fueling

**Connector Scan Logic:**
```csharp
if(b is IMyShipConnector){
    var cn=b as IMyShipConnector;
    string u=b.CustomName.ToUpper();
    if(u.Contains("ORE"))oreC.Add(cn);       // Miner connectors
    else if(padCon==null&&u.Contains("FUEL"))padCon=cn;  // Missile FUEL connector
}
```

---

## S-10 AMMO ROUTING

S-10 pistol ammo (10,106 rounds per missile) routes specially:

| Ammo Type | Destination | Reason |
|-----------|-------------|--------|
| S-10 (SemiAutoPistolMagazine) | Generic cargo | Bulk storage for missiles |
| All other personal ammo | pAmmoCargo | Personal carry ammo |

### LoadMissileAmmo()

When pad requests ammo (ammoReq=true):
1. Find missile [AMMO] connector
2. Push S-10 ammo from cargo to missile
3. Track transfer progress

---

## PERSONAL AMMO COUNTING

Personal ammo (S-10, S-20A, Elite, Rifles, Flares) is counted using `GetItemAmount()` for accuracy.

### pAmmoIT Array (Personal Ammo Types)

| Index | SubtypeId | Friendly Name |
|-------|-----------|---------------|
| 0 | SemiAutoPistolMagazine | S-10 Pistol |
| 1 | FullAutoPistolMagazine | S-20A Pistol |
| 2 | ElitePistolMagazine | Elite Pistol |
| 3 | AutomaticRifleGun_Mag_20rd | MR-20 Rifle |
| 4 | RapidFireAutomaticRifleGun_Mag_50rd | MR-50A Rifle |
| 5 | PreciseAutomaticRifleGun_Mag_5rd | MR-8P Rifle |
| 6 | UltimateAutomaticRifleGun_Mag_30rd | MR-30E Rifle |
| 7 | FlareGun_Mag | Flare |

### Why Not String Matching?

String-based counting via `TypeId.ToLower()` was unreliable:
- S-10 ammo could be miscounted (showed 4200 instead of 45000)
- `GetItemAmount(MyItemType)` is the only accurate method

---

## MINER FLEET TRACKING

### IGC Channel
- `MINER_BEACON` - Receives broadcasts from UnityBeacon

### Tracked Data (MinerData class)

| Field | Description |
|-------|-------------|
| name | Ship name |
| bat, crg, h2, o2 | Battery, cargo, H2, O2 percentages |
| pos | World position (Vector3D) |
| spd, alt, dist | Speed, altitude, distance from pad |
| status | DOCKED, DRILLING, TRAVELING, etc. |
| drills, drillsOn | Drill counts |
| grinders, grindersOn | Grinder counts |
| portNum | Docked connector port number |
| ice, uranium | Fuel stock counts |
| cargoItems | Dictionary of cargo contents |

### Status Types

- DOCKED - Connected to pad
- DRILLING - Drills active
- DRILL_MOVE - Moving while drilling
- GRINDING - Grinders active
- TRAVELING - In transit
- HOME - At home base
- IDLE - Stationary

### Stale Miner Cleanup

Miners not seen for 120 seconds (and not docked) are removed from tracking.

---

## CONFIGURATION

Settings stored in Me.CustomData [CONFIG] section:

| Parameter | Default | Description |
|-----------|---------|-------------|
| ammo | 500 | Turret ammo target |
| load | 10,106 | Ammo per missile |
| ice | 0 | Ice target (kg) |
| uran | 0 | Uranium target (kg) |
| h2 | 20 | H2 bottles target |
| o2 | 20 | O2 bottles target |
| tool | 20 | Tool sets target |
| pAmmo | 500 | Personal ammo target |
| s10 | 50,000 | S-10 missile ammo target |
| type | 4 | Ammo type index (0-9) |

### Ammo Types

| Index | Name | Blueprint |
|-------|------|-----------|
| 0 | S-10 Pistol | SemiAutoPistolMagazine |
| 1 | MR-20 Rifle | AutomaticRifleGun_Mag_20rd |
| 2 | MR-50A Rifle | RapidFireAutomaticRifleGun_Mag_50rd |
| 3 | 200mm Missile | Missile200mm |
| 4 | 25x184mm NATO | NATO_25x184mm |
| 5 | Autocannon | AutocannonClip |
| 6 | Assault Cannon | MediumCalibreAmmo |
| 7 | Artillery | LargeCalibreAmmo |
| 8 | Small Railgun | SmallRailgunAmmo |
| 9 | Large Railgun | LargeRailgunAmmo |

---

## ARGUMENTS

| Argument | Action |
|----------|--------|
| `SORT` | Force immediate inventory sort |
| `RESCAN` | Re-detect all blocks |
| `AUTOORG` | Toggle automatic organization |

---

## KEY FUNCTIONS

### Initialization

| Function | Purpose |
|----------|---------|
| `Program()` | Initialize, load storage, scan |
| `ClearForBoot()` | Write inv_ready flag |
| `InitBlueprints()` | Build blueprint dictionaries |
| `SetDefaultQuotas()` | Set tool/ammo/bottle quotas |
| `FindSiblingPBs()` | Find bootPB, padPB |

### Boot System

| Function | Purpose |
|----------|---------|
| `IsBootComplete()` | Check boot_complete in bootPB |
| `IsBootRunning()` | Check if boot in progress |
| `IsBootStale()` | Check if boot needs recompile |
| `CheckBootRequest()` | Listen for INV_CHECK |
| `SendBootResponse()` | Reply with block counts |

### Inventory Management

| Function | Purpose |
|----------|---------|
| `Scan()` | Find all blocks |
| `CountStocks()` | Count all item types |
| `ManageInventory()` | Route items, feed production |
| `HardSort()` | Force sort all items |
| `RouteItem()` | Get destination for item |
| `GD()` | Get designated container |

### Production

| Function | Purpose |
|----------|---------|
| `QueueProduction()` | Queue missing items |
| `QueueMissing()` | Generic queue function |
| `CalcMissing()` | Calculate shortfalls |
| `CalcAmmoIngotNeeds()` | Calculate ingots for ammo |
| `RecycleExcess()` | Disassemble excess items |
| `FeedRefineries()` | Supply ore to refineries |
| `FeedAssemblers()` | Supply ingots to assemblers |

### LCD Rendering

| Function | Purpose |
|----------|---------|
| `UpdateLCDs()` | Route to mode-specific updates |
| `UpdateHistory()` | Record graph data points |
| `UpdateLCD4()` | Pad overview (7 views) |
| `UpdateLCD5()` | Power overview |
| `UpdateLCD6()` | Graphs (12 types) |
| `UpdateLCD9()` | Miner fleet list |
| `UpdateLCD10()` | Miner details |
| `UpdateLCD11()` | Personal equipment |

### Miner Tracking

| Function | Purpose |
|----------|---------|
| `CheckBeacons()` | Process MINER_BEACON messages |
| `CorrelateDockedMiners()` | Match docked grids to miners |
| `CleanStaleMiners()` | Remove old entries |
| `ParseMinerCargo()` | Parse cargo item list |

---

## SPRITE SYSTEM

### Sprite Functions

| Function | Purpose |
|----------|---------|
| `BL(surface)` | Begin LCD frame |
| `SH(f,y,text,c)` | Draw header with underline |
| `ST(f,x,y,t,c)` | Draw text |
| `SB(f,x,y,w,h,pct,fg,bg)` | Draw progress bar |
| `SLB(f,x,y,w,h,lbl,pct,fg,bg)` | Draw labeled bar |
| `SBx(f,x,y,w,h,bg,bdr)` | Draw box |
| `SD(f,y)` | Draw divider line |
| `SGraph(...)` | Draw line graph |
| `PctCol(pct)` | Get color from percentage |

### Color Palette

| Variable | Color | Usage |
|----------|-------|-------|
| cPri | Blue (0,180,255) | Primary |
| cSec | Gray (100,100,100) | Secondary |
| cAcc | Gold (255,200,0) | Accent |
| cOK | Green (0,255,100) | Good status |
| cWrn | Orange (255,180,0) | Warning |
| cErr | Red (255,60,60) | Error |
| cBg | Dark (10,10,15) | Background |
| cBdr | Border (40,40,50) | Border |
| cTxt | Light (220,220,220) | Text |

---

## PER-PB CUSTOMDATA

**UnityInventory writes ONLY to Me.CustomData:**

| Section | Content |
|---------|---------|
| [SYSTEM] | inv_ready, inv_for_session, inv_status |
| [QUOTAS] | ammo, ice, uran, h2, o2, tool, pammo, s10 |
| [MISSILE] | status, target, distance, fuel, etc. |
| [CONFIG] | User-editable targets |
| [WAYPOINTS] | GPS coordinates |
| [STATUS] | Refinery/assembler status |
| [ORE] | Ore stock counts |
| [INGOTS] | Ingot stock/target |
| [COMPONENTS] | Component stock+need/target |
| [TURRET_AMMO] | Turret ammo stock |
| [BOTTLES] | H2/O2 bottle counts |
| [TOOLS_WEAPONS] | Tool/weapon counts |
| [PERSONAL_AMMO] | Personal ammo counts |

**UnityInventory READS from:**
- `bootPB.CustomData` - boot_complete status
- `padPB.CustomData` - pad mode, missile telemetry

---

## BUILD AND DEPLOY

### Build Commands

```powershell
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build src/scripts/UnityInventory -c Debug
```

### Deploy Location

Script auto-deploys to:
```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs
```

### Verify Deployment

```powershell
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs").Length
```

---

## CHARACTER BUDGET

| Metric | Value |
|--------|-------|
| Raw Lines | ~1,700 |
| Deployed | ~99,582 chars |
| Budget | 100,000 chars |
| Status | **CRITICAL (0.4% margin)** |

**WARNING:** Basically zero room for additions. Any new features require equal or greater code removal.

### Multi-Pad Context

UnityInventory is multi-pad safe. The BOOT_REQ handler accepts both the legacy `INV_CHECK` format and the new `INV_CHECK:{padID}` format, so it only responds to boot requests from its own pad. This prevents cross-pad interference when multiple pad grids share the same IGC channel.

---

## STORAGE FORMAT

Persistent storage via `Save()`:
```
padID|ammoTarget|toolTarget|autoOrg|h2Target|o2Target|pAmmoTarget|iceTarget|uranTarget|s10Target
```

Example: `1|500|20|1|20|20|500|0|0|50000`

---

*Unity AI Lab - Inventory Systems Division*
