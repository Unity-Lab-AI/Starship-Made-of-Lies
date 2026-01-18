![Unity Inventory](Unity%20Inventory%202.png)

# UNITY INVENTORY v01.00

**Inventory Management System | Sprite-Based LCD Displays | Auto-Cycling Views | Miner Fleet Tracking | Auto-Crafting | Container Organization**

---

## BOOT SYSTEM DEPENDENCY

**UnityInventory requires Unity Boot to run first.**

Unity Boot must complete 40 system checks before UnityInventory takes control of LCDs 4, 5, 6, 9, 10.

UnityInventory waits for `boot_complete=true` in the [SYSTEM] button panel CustomData.

---

## FEATURES

- **5 LCD Displays** - LCD4, LCD5, LCD6, LCD9, LCD10 with sprite rendering
- **Miner Fleet Tracking** - Monitor mining ships via MinerBeacon broadcasts
- **Auto-Crafting** - Tools, ammo, bottles, components
- **Container Organization** - Auto-sort items to designated containers
- **Production Management** - Feed refineries and assemblers automatically
- **Sprite-Based Rendering** - Modern visual LCD system

---

## OVERVIEW

UnityInventory runs on a separate Programmable Block from UnityPad. It handles all inventory management, freeing UnityPad to focus on missile operations. The two scripts communicate via button panel CustomData.

---

## LCD DISPLAYS

| LCD | Name | Content |
|-----|------|---------|
| 4 | PAD OVERVIEW | **Auto-cycles through 7 views every ~5 seconds** |
| 5 | POWER | Battery details, power production, solar/reactor status |
| 6 | GRAPHS | **Auto-cycles through 7 graph types every ~5 seconds** |
| 9 | MINER FLEET | Overview of all MinerBeacon-tracked ships |
| 10 | MINER DETAIL | Selected miner details with full stats |

### LCD4 Auto-Cycle Views (7 views)

1. **BUILD STATUS** - Ores, ingots, components, missing items
2. **MISSILE STATUS** - Ready/armed counts, phase info
3. **FUEL/TARGET** - H2/O2/battery bars, ammo, bottles
4. **POWER** - Battery charge, power flow, uranium (storage+reactors)
5. **CARGO** - Fill percentage, ore/ingot counts
6. **PRODUCTION** - Refinery/assembler status, queued items
7. **COMMS** - Pad facilities (Medical/Kit/Cryo), miners tracked

### LCD6 Auto-Cycle Graphs (7 graphs)

1. **Power** - Battery charge over time
2. **Hydrogen** - H2 tank fill percentage
3. **Oxygen** - O2 tank fill percentage
4. **Cargo Fill** - Cargo volume usage
5. **Refinery** - Refinery activity %
6. **Assembler** - Assembler activity %
7. **Production** - Combined production activity

### Display Modes

Each LCD adapts based on pad state:
- **NORMAL** - Standard inventory/miner display with auto-cycling
- **FLIGHT** - Missile telemetry mode
- **CTRL** - Controller mode (multi-pad)
- **MISSILE** - Docked missile stats
- **PRINT** - Build progress display

---

## CONTAINER TAGS

Tag containers for automatic routing:

| Tag | Purpose |
|-----|---------|
| `[PAD1-ore]` | Ore storage |
| `[PAD1-ingot]` | Ingot storage |
| `[PAD1-comp]` | Component storage |
| `[PAD1-ammo]` | Ammo storage |
| `[PAD1-tools]` | Tool storage |
| `[PAD1-bottle]` | Bottle storage |
| `[PAD1-pammo]` | Personal ammo storage |

---

## AUTO-ORGANIZATION

- Enabled by default (`autoOrg=true`)
- Routes items to designated containers
- Overflow handling when containers full
- Prefers Large > Medium > Small containers

---

## PRODUCTION MANAGEMENT

### Refinery Feeding
- Pulls ore from cargo to refineries
- Maintains input level at 500-1000 ore
- Skips ice (used for H2 generation)

### Assembler Feeding
- Supplies ingots to assemblers
- Monitors output fullness
- Auto-queues component production

### Tool Crafting
- Tracks tool inventory by tier
- Auto-queues missing tools
- Supports all 4 tiers per tool type

### Ammo Crafting
- Missile ammo (Pistol, Rifle, Rapid, Rocket, Gatling)
- Personal ammo for hand weapons
- Configurable stock targets

---

## MINER FLEET TRACKING

Receives broadcasts from MinerBeacon scripts on mining ships.

**Works with [PAM] Path Auto Miner by Keks** - https://steamcommunity.com/sharedfiles/filedetails/?id=1507646929

MinerBeacon is designed to complement PAM - PAM handles autopilot and mining, UnityBeacon broadcasts status to your base. All credit for PAM goes to **Keks**!

### Tracked Data
- Ship name and status
- Battery, cargo, H2 percentages
- Position, speed, altitude
- Distance from home
- Drill/grinder counts and states
- Cycle timing and ETA

### Status Types
- DOCKED, DRILLING, DRILL_MOVE
- GRINDING, GRIND_MOVE
- TRAVELING, DEPARTING
- HOME, IDLE

---

## COMMUNICATION PROTOCOL

UnityInventory reads/writes to button panel CustomData:

### Read from Pad (REQ section)
```ini
[UNITY_INV]
padID=1
status=FUEL
missileType=4

[REQ]
missiles=2
fuelReady=1
ammoType=4
```

### Write to Pad (Stock sections)
```ini
[ORE]
Iron=25000
[ING]
Iron=15000
[CMP]
SteelPlate=500
[AMO]
Missile200mm=45+5
[BTL]
HydrogenBottle=15+5
[TLS]
Drl=3/2/1/0
[STAT]
refWorking=3
asmWorking=2
```

---

## CHARACTER BUDGET

| Metric | Value |
|--------|-------|
| Raw Source | ~98,000 chars |
| Deployed | 78,680 chars |
| Budget | 100,000 chars |
| Status | OK (21% margin) |

*Note: Boot code removed in v01.00. Boot functionality moved to Unity Boot.*

---

## BUILD COMMAND

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityInventory -c Debug
```

Deploys to: `%APPDATA%\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs`

---

## FEATURES IN v01.00

- **Auto-Cycling Pad Overview** - LCD4 cycles through 7 views every ~5 seconds
- **Auto-Cycling Graphs** - LCD6 cycles through 7 graph types every ~5 seconds
- **Pad Facilities Display** - Medical rooms, survival kits, cryo chambers in COMMS view
- **Improved Survival Kit Detection** - Recognizes "KIT mark II" and other mod kits
- **Uranium/Ice Split** - Shows storage vs reactor/generator amounts separately
- **Bottle Queue Fix** - Bottles now correctly show queued production counts

---

*Unity AI Lab - Inventory Systems Division*
*Version v01.00 | 2026-01-18*
