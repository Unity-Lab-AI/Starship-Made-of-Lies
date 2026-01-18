# UNITY MISSILE SYSTEM - COMPLETE SETUP GUIDE

**Version:** v01.00
**Last Updated:** 2026-01-18

---

## OVERVIEW

The Unity Missile System consists of 5 scripts working together:

| Script | Location | Purpose |
|--------|----------|---------|
| **Unity Boot** | Launch pad PB | Boot controller, 20 unified checks with IGC handshaking |
| **UnityPad** | Launch pad PB | Menus, LCDs, targeting, printing, launch control |
| **UnityMissile** | Missile PB | In-flight guidance, targeting, detonation |
| **UnityInventory** | Separate pad PB | Inventory, production, sorting, miner handling |
| **UnityBeacon** | Miner PB | Fleet status broadcasting |

---

## PART 1: BUILDING THE LAUNCH PAD

### Step 1.1: Core Infrastructure

Build these foundational blocks first:

```
PRIORITY ORDER:
1. Large Cargo Containers (multiple, for organization)
2. Basic Refinery (ore → ingots)
3. Basic Assembler (ingots → components)
4. Small Reactor + Uranium (power)
5. O2/H2 Generator (ice → H2/O2)
6. Large Hydrogen Tank (fuel storage)
7. Large Battery (power buffer)
```

### Step 1.2: Launch Pad Module

Build the missile pad structure:

```
LAUNCH PAD ESSENTIALS:
1. Merge Block (facing UP or OUT) - missile docks here
2. Connector (near merge) - fuel/ammo transfer [DOCK]
3. 10x LCD Panels (monospace font)
4. Button Panel (4 buttons minimum)
5. 2x Programmable Blocks (UnityPad + UnityInventory)
```

### Step 1.3: Cargo Container Organization

Tag containers for inventory routing:

| Container Tag | Contents | Example Name |
|--------------|----------|--------------|
| `-ore` | Raw ores | `Large Cargo -ore` |
| `-ingot` | Ingots | `Large Cargo -ingot` |
| `-comp` | Components | `Large Cargo -comp` |
| `-tools` | Hand tools | `Large Cargo -tools` |
| `-ammo` | Turret ammo | `Large Cargo -ammo` |
| `-PAmmo` | Personal ammo | `Small Cargo -PAmmo` |
| `-bottle` | H2/O2 bottles | `Large Cargo -bottle` |

### Step 1.4: Optional Printer System

For automated missile building:

```
PRINTER COMPONENTS:
1. Projector (loaded with missile blueprint)
2. 2-4 Pistons (extend toward build area)
3. 2-4 Welders (mounted on piston heads)
```

---

## PART 2: PROGRAMMABLE BLOCK SETUP

**IMPORTANT:** Three PBs are required on your launch pad grid:
1. Unity Boot (runs first, controls boot sequence)
2. UnityPad (launch control, waits for boot_complete)
3. UnityInventory (inventory management, waits for boot_complete)

### Step 2.1: Install Unity Boot Script (FIRST)

1. Add Programmable Block near pad controls
2. Load `Unity Boot` script from workshop/local
3. **Name the PB:** `[PAD1-BOOT] UNITY BOOT`
4. Click "Recompile"
5. Boot runs 20 system checks with real PB-to-PB IGC handshaking
6. Sends requests to Pad and Inventory PBs, validates their responses
7. Sets `boot_complete=true` in [SYSTEM] CustomData when done
7. Self-disables after boot (UpdateFrequency.None)

### Step 2.2: Install UnityPad Script

1. Add SECOND Programmable Block on same grid
2. Load `UnityPad` script from workshop/local
3. **Name the PB:** `[PAD1] Unity Pad`
4. Click "Recompile"
5. Script waits for boot_complete before taking LCDs 1,2,3,7,8

### Step 2.3: Install UnityInventory Script

1. Add THIRD Programmable Block on same grid
2. Load `UnityInventory` script from workshop/local
3. **Name the PB:** `[PAD1] Unity Inventory`
4. Click "Recompile"
5. Script waits for boot_complete before taking LCDs 4,5,6,9,10

### Step 2.4: Run SETUPMOD

On the UnityPad PB, run this command:

```
SETUPMOD
```

**What SETUPMOD Does:**
1. Scans all blocks within range
2. Claims next available pad ID (PAD1, PAD2, etc.)
3. Tags the merge block: `[PAD1]`
4. Tags the connector: `[PAD1]`
5. Tags 10 LCDs: `[PAD1:1]` through `[PAD1:10]`
6. Tags button panel: `[PAD1]`
7. Tags printer blocks: `[PAD1-PRINT]`

### Step 2.5: Button Panel Setup

Configure button actions:

| Button | Argument | Action |
|--------|----------|--------|
| 1 | `UP` | Navigate up |
| 2 | `DOWN` | Navigate down |
| 3 | `APPLY` | Select/confirm |
| 4 | `LAUNCH` | Launch or detonate |

---

## PART 3: LCD LAYOUT

### Standard Layout (10 Panels)

```
┌─────┬─────┐
│  1  │  2  │   1=Control Menu  2=Build Requirements
├─────┼─────┤
│  3  │  4  │   3=Missile Systems  4=Pad Overview (auto-cycles 7 views)
├─────┼─────┤
│  5  │  6  │   5=Pad Power  6=Graphs (auto-cycles 7 graphs)
├─────┼─────┤
│  7  │  8  │   7=Telemetry  8=GPS/Satellites
├─────┼─────┤
│  9  │ 10  │   9=Miner Fleet  10=Miner Detail
└─────┴─────┘
```

**LCD4 Auto-Cycles Through:**
1. BUILD STATUS - Ores, ingots, components, missing
2. MISSILE STATUS - Ready/armed counts
3. FUEL/TARGET - H2, O2, battery, ammo, bottles
4. POWER - Battery charge, uranium (storage+reactors)
5. CARGO - Fill percentage, ore/ingot counts
6. PRODUCTION - Refineries, assemblers, queue
7. COMMS - Pad facilities (Medical/Kit/Cryo), miners

**LCD6 Auto-Cycles Through:**
Power, Hydrogen, Oxygen, Cargo, Refinery, Assembler, Production graphs

### LCD Settings

For each LCD panel:
- Font: `Monospace`
- Font Size: `0.5` to `0.7`
- Text Padding: `0`
- Content Type: `Text and Images`

---

## PART 4: BUILDING MISSILES

### Required Missile Blocks

```
MINIMUM MISSILE:
1. Merge Block - docks to pad
2. Connector [DOCK] - fuel transfer
3. Remote Control - orientation
4. Gyroscope - steering
5. Thruster - forward facing
6. Battery - power
7. Warhead - payload
8. Programmable Block - guidance
```

### Install UnityMissile Script

1. Add Programmable Block to missile
2. Load `UnityMissile` script
3. **Name the PB:** `PAD1 Missile #1 Unity Missile`
4. Click "Recompile"

### Auto-Naming on Dock

When missile docks to pad:
1. Pad automatically detects missile PB
2. All missile blocks get renamed: `Missile #1 [BlockType]`
3. Connectors tagged: `[DOCK]` (closest to pad) and `[AMMO]` (farthest)
4. Build number increments for next missile

---

## PART 5: FUELING & ARMING

### Automatic Fueling Sequence

```
DOCK → FUEL → AMMO → READY → ARM → LAUNCH
  ↓       ↓       ↓       ↓      ↓       ↓
Detect  Fill    Load   Button  Armed  Merge
missile H2/Bat  ammo   press   for    release
                       ARM     launch
```

### Fuel Requirements (Auto-Detected)

- **Battery:** Charges from pad power
- **H2 Tank:** Fills from pad H2 storage
- **Ice:** Transfers if missile has O2/H2 generator
- **Ammo:** Loads selected ammo type to [AMMO] connector

---

## PART 6: TARGETING

### Select Target Mode

From LCD1 menu, select **TARGET**:

| Mode | Behavior |
|------|----------|
| **GPS** | Fly to X,Y,Z coordinates |
| **ANTENNA** | Track broadcasting antenna |
| **SENSOR** | Hunt with onboard sensors |
| **LIDAR** | Camera raycast lock-on |
| **MANUAL** | No guidance, fly straight |
| **SATELLITE** | Deploy as orbital relay |

### Set GPS Target

1. Navigate to TARGET → GPS
2. Add waypoint: `GPS:X,Y,Z` command
3. Or select from detected waypoints
4. Confirm target selection

---

## PART 7: LAUNCH

### Launch Sequence

1. Confirm state shows **ARMED**
2. Select LAUNCH from menu
3. T-MINUS countdown begins
4. Merge disconnects at T-0
5. State changes to **GONE**
6. LCD7 shows live telemetry

### Remote Detonation

During flight:
1. Press LAUNCH button again
2. Sends DETONATE command via IGC
3. Missile detonates immediately

---

## PART 8: MULTI-PAD SETUP

### Adding More Pads

1. Build another complete pad module
2. Add new PB: `[PAD2-BOOT] UNITY BOOT`
3. Add new PB: `[PAD2] Unity Pad`
4. Add new PB: `[PAD2] Unity Inventory`
5. Run `SETUPMOD` on PAD2
6. System auto-claims ID and tags blocks

### Shared Resources

All pads share:
- Cargo containers
- Refineries
- Assemblers
- Power grid
- H2/O2 systems

Each pad has its own:
- Merge block
- Docking connector
- 10 LCDs
- Button panel
- 3 Programmable blocks (Boot, Pad, Inventory)

### Controller Mode

Make one pad the command center:

1. On PAD1, run: `SETPADCONTROL`
2. LCD layout changes to controller view
3. See all pad statuses on LCD2
4. Issue mass commands from LCD1

---

## PART 9: INVENTORY SYSTEM CONFIGURATION

### How UnityPad and UnityInventory Communicate

Both scripts share data via the button panel's CustomData. UnityInventory writes stock levels, UnityPad reads them for LCD display.

### User-Configurable Targets

Edit these values in the button panel CustomData under `[TARGETS]`:

| Setting | Default | Purpose |
|---------|---------|---------|
| `ammo` | 50000 | Turret ammo target |
| `load` | 10106 | Ammo per missile |
| `ice` | 1000 | Ice stockpile target |
| `uran` | 50 | Uranium target |
| `h2` | 20 | H2 bottle target |
| `o2` | 20 | O2 bottle target |
| `tool` | 20 | Tool target per tier |
| `pAmmo` | 100 | Personal ammo target |

**Example CustomData:**
```ini
[TARGETS] Edit values below:
ammo     = 50000
load     = 10106
ice      = 1000
uran     = 50
h2       = 20
o2       = 20
tool     = 20
pAmmo    = 100
```

### Component Build Targets (21 Components)

UnityInventory tracks and queues these components automatically:

| Component | Default Target |
|-----------|----------------|
| SteelPlate | 6000 |
| Construction | 3500 |
| InteriorPlate | 3000 |
| SmallTube | 3200 |
| LargeTube | 1500 |
| Motor | 1200 |
| Computer | 1500 |
| MetalGrid | 950 |
| Display | 600 |
| BulletproofGlass | 2050 |
| PowerCell | 800 |
| Thrust | 1050 |
| Explosives | 2600 |
| Detector | 1500 |
| RadioCommunication | 900 |
| GravityGenerator | 600 |
| Girder | 500 |
| Medical | 200 |
| Reactor | 300 |
| SolarCell | 500 |
| Superconductor | 300 |

### Button Panel CustomData Format

UnityInventory writes this data for UnityPad to display:

```
[PAD1 INV] @HH:mm
=====================================
[TARGETS] Edit values below:
ammo     = 50000
...
=====================================
[CMP] Item = Stock + Queued / Target
SteelPlate          =  5000 +   50 /  6000
Construction        =  3200 +  100 /  3500
...
[AMO]
Rocket              = 45000 + 1000 / 50000
[BTL]
Hydrogen            =    15 +    5 /    20
[TLS] Tool = T1/T2/T3/T4 | Target
Drill        = 3/2/1/0      | 20
[ORE]
Iron        = 25000
[ING]
Iron        = 15000
Gravel      = 5000
[STAT]
Refineries  = 3/4 working
Assemblers  = 2/3 working
Cargo       = 45%
```

### Inventory Commands

| Command | Action |
|---------|--------|
| `SORT` | Force immediate hard sort |
| `AUTOORG` | Toggle auto-organization |
| `RESCAN` | Re-scan for blocks |

### Miner Handling

UnityInventory manages docked miner transfers:
- Pulls ore/ingots FROM miner cargo, drills, grinders
- Pushes ice TO miner O2/H2 generators (if miner has one)
- Pushes uranium TO miner reactors (keeps 10 uranium stocked)
- O2/H2 gas auto-fills miner tanks via conveyor when docked
- Does NOT touch miner batteries (PAM compatibility)
- Prevents general inventory from routing TO miners

---

## PART 10: MINER FLEET TRACKING (Optional)

### Install UnityBeacon on Miners

1. Add PB to miner ship
2. Load `UnityBeacon` script
3. **Name the PB:** `[BEACON] Unity Beacon`
4. Run `SETUP` to auto-tag blocks
5. Run `SETHOME` when docked at base

### Required Miner Blocks

- Remote Control tagged `[BEACON]`
- Radio Antenna tagged `[BEACON]`
- Optional: Connector, LCD with `[BEACON]`

### Fleet Display

- **LCD9:** Fleet overview (all tracked miners)
- **LCD10:** Selected miner details

---

## QUICK REFERENCE

### PB Naming Convention

| Script | PB Name Format |
|--------|----------------|
| Unity Boot | `[PAD#-BOOT] UNITY BOOT` |
| UnityPad | `[PAD#] Unity Pad` |
| UnityMissile | `PAD# Missile #X Unity Missile` |
| UnityInventory | `[PAD#] Unity Inventory` |
| UnityBeacon | `[BEACON] Unity Beacon` |

### Block Tags

| Tag | Purpose |
|-----|---------|
| `[PAD#]` | Pad blocks (merge, connector, button) |
| `[PAD#:1-10]` | LCD panels |
| `[PAD#-PRINT]` | Printer blocks |
| `[PAD#-CON1]` | Module connector 1 (for module sync) |
| `[PAD#-CON2]` | Module connector 2 (for module sync) |
| `[DOCK]` | Missile fuel connector |
| `[AMMO]` | Missile ammo connector |
| `[BEACON]` | Miner beacon blocks |

### Container Tags

| Tag | Contents |
|-----|----------|
| `-ore` | Raw ores |
| `-ingot` | Ingots (including Gravel) |
| `-comp` | Components |
| `-tools` | Hand tools |
| `-ammo` | Turret ammo |
| `-PAmmo` | Personal ammo |
| `-bottle` | H2/O2 bottles |

### Essential Commands

| Command | Action |
|---------|--------|
| `SETUPMOD` | Initialize pad module |
| `RESCAN` | Re-detect blocks |
| `CREATIVE` | Toggle creative mode |
| `SETPADCONTROL` | Toggle controller mode |
| `ORGANIZE` | Force inventory sort |

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| LCDs not updating | Run `SETUPMOD` to tag blocks |
| Missile not detected | Check merge block connection |
| Inventory not working | Check UnityInventory PB is running |
| Items not sorting | Check container tags (-ore, -ingot, etc.) |
| Printer stuck | Check piston limits, run `RESCAN` |
| No miner tracking | Install UnityBeacon on miners |
| Wrong pad ID | Run `CLAIM` to get next available |

---

## SCRIPT LOCATIONS

**Workshop (Steam):** TBD

**Local (after build):**
```
%APPDATA%\SpaceEngineers\IngameScripts\local\
├── Unity Boot\script.cs
├── UnityPad\script.cs
├── UnityMissile\script.cs
├── UnityInventory\script.cs
└── UnityBeacon\script.cs
```

---

*Unity AI Lab - Missile Systems Division*
