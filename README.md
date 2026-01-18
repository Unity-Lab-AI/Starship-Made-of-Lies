![Unity Missile System](Unity%20Missile%20System%202.png)

# UNITY MISSILE SYSTEM v01.00

**5-Script Modular System | 10 LCD Displays | Sprite-Based Rendering | Full Automation | Satellite Relay | Carpet Bomb | Auto-Attack | Fleet Tracking | Inventory Management**

**Works on LARGE or SMALL grids (auto-detect)**
**Works in SPACE or ATMOSPHERE (auto-detect)**
**Multiple pads on one grid (modular)**

---

## SCRIPT COMPONENTS

| Script | PB Name | Function |
|--------|---------|----------|
| **Unity Boot** | `[PAD1-BOOT] UNITY BOOT` | Boot controller, 40 system checks, LCD init |
| **UnityPad** | `[PAD1] Unity Pad` | Launch control, LCDs, targeting, printing |
| **UnityMissile** | `PAD1 Missile #1 Unity Missile` | In-flight guidance, targeting, detonation |
| **UnityInventory** | `[PAD1] Unity Inventory` | Inventory management, production, sorting |
| **UnityBeacon** | `[BEACON] Unity Beacon` | Fleet status broadcasting (on miners) |

---

## TABLE OF CONTENTS

1. [Complete Setup Guide](#complete-setup-guide)
2. [Missile Design Options](#missile-design-options)
3. [Modular Base Expansion](#modular-base-expansion)
4. [Feature Reference](#what-new-in-v32)
5. [Future Roadmap](#future-expansions-code-additions)

---

## COMPLETE SETUP GUIDE

### PART 1: Building Your First Launch Base

This is the complete step-by-step guide from empty grid to fully operational launch system.

#### Step 1: Core Infrastructure (Build First)

Build these foundational blocks - they power everything else:

```
PRIORITY ORDER:
1. Large Cargo Container (ore/ingot storage)
2. Basic Refinery (ore processing)
3. Basic Assembler (component building)
4. Small Reactor + Uranium (power)
5. O2/H2 Generator (ice processing)
6. Large Hydrogen Tank (fuel storage)
7. Large Battery (power buffer)
```

**Tips:**
- Use conveyor tubes to connect everything
- Reactor needs uranium ingots, not ore
- H2 Generator needs ice
- Test conveyor system by putting ice in cargo, should flow to generator

#### Step 2: Launch Pad Module

Build the actual missile pad structure:

```
LAUNCH PAD ESSENTIALS:
1. Merge Block (facing UP or OUT) - this is where missile docks
2. Connector (near merge block) - for fuel/ammo transfer to missile
3. 10x LCD Panels (monospace font, text size 0.5-0.7)
4. Button Panel (4 buttons minimum)
5. Programmable Block (for UnityPad script)
```

**LCD Arrangement:**
```
LCD LAYOUT (suggested):
┌─────┬─────┐
│ 1   │  2  │   1=Control  2=Build
├─────┼─────┤
│ 3   │  4  │   3=Missile  4=Fuel
├─────┼─────┤
│ 5   │  6  │   5=Power    6=Cargo
├─────┼─────┤
│ 7   │  8  │   7=Telemetry 8=GPS/Sat
├─────┼─────┤
│ 9   │ 10  │   9=MinerFleet 10=MinerDetail
└─────┴─────┘
```

**Button Panel Setup:**
```
Button 1 → Run PB with argument: UP
Button 2 → Run PB with argument: DOWN
Button 3 → Run PB with argument: APPLY
Button 4 → Run PB with argument: LAUNCH
```

#### Step 3: Install Scripts

**Three PBs required on pad grid:**

1. **Boot PB:**
   - Copy `Unity Boot.cs` into a Programmable Block
   - Name it: `[PAD1-BOOT] UNITY BOOT`
   - Run once to initialize boot sequence

2. **Pad PB:**
   - Copy `UnityPad.cs` into another Programmable Block
   - Click "Check Code" - should show no errors
   - Click "Run" or "Recompile"
   - Waits for boot_complete before taking LCD control

3. **Inventory PB:**
   - Copy `UnityInventory.cs` into a third Programmable Block
   - Name it: `[PAD1] Unity Inventory`
   - Waits for boot_complete before taking LCD control

#### Step 4: SETUPMOD - Automatic Configuration

Run this command to auto-configure everything:

```
SETUPMOD
```

**What SETUPMOD Does:**
1. Scans all blocks within range of the PB
2. Claims next available pad ID (PAD1, PAD2, etc.)
3. Tags the merge block: `[PAD1]`
4. Tags the nearest connector: `[PAD1]` (same as merge = docking connector)
5. Tags 8 LCDs: `[PAD1:1]` through `[PAD1:8]`
6. Tags button panel: `[PAD1]`
7. Tags printer blocks (if present): `[PAD1-PRINT]`
8. Auto-finds missile connectors if missile is docked:
   - Closest to pad = `[DOCK]` (fuel/ammo loading)
   - Farthest from pad = `[AMMO]` (ejection connector)

**After SETUPMOD:**
- All 8 LCDs should start displaying
- LCD1 shows main menu
- State shows INIT until missile docks

#### Step 5: Optional Printer System

Build automated missile printer:

```
PRINTER COMPONENTS:
1. Projector (loaded with missile blueprint)
2. 2-4 Pistons (extend toward build area)
3. 2-4 Welders (mounted on piston heads)
```

**Blueprint Setup:**
1. Build missile by hand once
2. Stand in front of it
3. In terminal, find missile merge block
4. Click "Create from selection"
5. Save blueprint
6. Load into projector
7. Align blueprint so merge blocks match up

**Printer Cycle (automatic):**
```
IDLE → RESET → EXTEND → WELD → EXTEND → WELD → DONE
         ↓        ↓        ↓        ↓
       Retract  Pistons  Build   Repeat
       pistons  extend   parts   if needed
```

#### Step 6: First Missile Build

**Option A - Creative Mode:**
1. Paste missile blueprint
2. Merge block auto-docks to pad
3. State changes to DOCK
4. Run `NAMEMSL` to name blocks

**Option B - Survival with Printer:**
1. Press PRINT button or select BUILD from menu
2. Watch LCD2 for progress
3. Welders auto-build missile
4. When done, state changes to DOCK

**Option C - Survival without Printer:**
1. Hand-weld missile from blueprint
2. Use Build Planner for components
3. Connect to pad merge block when done

#### Step 7: Missile Configuration

Once missile is docked:

1. Copy `UnityMissile.cs` into the missile's Programmable Block
2. Pad automatically detects missile PB
3. LCD3 shows missile systems

#### Step 8: Fueling & Arming

Automatic fueling process:

```
DOCK → FUEL → AMMO → READY → ARM
  ↓       ↓       ↓       ↓      ↓
Detect  Fill    Load   Button  Armed
PB      H2/Bat  Ammo   press   for
        ice             ARM    launch
```

**Fuel requirements (auto-detected):**
- Battery: Charges from pad power
- H2 Tank: Fills from pad H2
- Ice: Transfers if missile has O2/H2 generator

#### Step 9: Targeting

Select target before launch:

1. From LCD1 menu, select **TARGET**
2. Choose targeting mode:
   - GPS: Enter coordinates or pick from list
   - ANTENNA: Enter target antenna name
   - SENSOR: No setup needed
   - LIDAR: No setup needed
   - MANUAL: No guidance
   - SATELLITE: Deploy as relay sat

3. For GPS targets:
   - Add waypoints in GPS menu
   - Or run `GPS:X,Y,Z` command
   - Select waypoint from list

#### Step 10: Launch!

When state shows ARMED:

```
1. Select LAUNCH from menu
2. Confirm countdown
3. T-MINUS counts down
4. LAUNCH - merge disconnects
5. State changes to GONE
6. LCD7 shows telemetry
7. Track until IMPACT or timeout
```

---

### PART 2: Multi-Pad Base Setup

Adding more launch pads to the same base:

#### Step 1: Build Second Pad Module

Build another complete pad setup (merge, connector, LCDs, buttons, PB) but **DO NOT** manually name anything.

#### Step 2: Run SETUPMOD on New Pad

The system auto-claims the next ID:

```
First pad: PAD1
Second pad: PAD2 (auto-claimed)
Third pad: PAD3
etc.
```

#### Step 3: Shared Resources

All pads share:
- Cargo containers (ore, ingots, components)
- Refineries (ore processing)
- Assemblers (component building)
- Power grid (batteries, reactors, solar)
- H2/O2 systems (tanks, generators)

Each pad has its own:
- Merge block
- Docking connector
- 8 LCDs
- Button panel
- Programmable block

#### Step 4: Controller Mode (Optional)

Make one pad the command center:

1. On PAD1, run: `SETPADCONTROL`
2. PAD1 LCD layout changes to controller view
3. See all pad statuses on LCD2
4. Issue mass commands from LCD1
5. Run again to toggle off

---

## MISSILE DESIGN OPTIONS

### Basic Combat Missile

Cheapest, fastest to build. For short-range planetary strikes.

```
COMPONENTS:
- 1x Small Reactor
- 1x Gyroscope
- 1x Remote Control
- 4x Hydrogen Thrusters
- 1x Small H2 Tank
- 2x Warheads
- 1x Programmable Block
- 1x Merge Block
- 1x Connector [DOCK]

STATS:
- Cost: ~500 components
- Range: 5-10km (planetary)
- Speed: 100+ m/s
- Payload: 2 warheads
```

### Heavy Assault Missile

Maximum damage, slower but devastating.

```
COMPONENTS:
- 1x Small Reactor
- 2x Gyroscope
- 1x Remote Control
- 8x Hydrogen Thrusters
- 2x Small H2 Tank
- 6x Warheads
- 1x Programmable Block
- 1x Merge Block
- 2x Connector [DOCK] + [AMMO]
- 1x Sensor (optional)

STATS:
- Cost: ~1500 components
- Range: 10-20km
- Speed: 80+ m/s
- Payload: 6 warheads + ammo ejection
```

### ICBM (Intercontinental Ballistic Missile)

For orbital strikes. Climbs to space, coasts, re-enters.

```
COMPONENTS:
- 1x Large Reactor
- 4x Gyroscope
- 1x Remote Control
- 12x Hydrogen Thrusters (need escape velocity)
- 4x Large H2 Tank
- 4-6x Warheads
- 1x Programmable Block
- 1x Merge Block
- 1x Connector [DOCK]
- 1x Radio Antenna (50km range)
- 1x Laser Antenna (optional - no blackout)

SETTINGS:
- Flight: ICBM
- Burn: 5-15 seconds
- Climb: 200-500m
- Reentry: 2000-5000m

STATS:
- Cost: ~3000+ components
- Range: 50km+ (cross-planet)
- Flight time: 2-5 minutes
- Blackout: Yes (unless laser antenna)
```

### Satellite/Relay

Not a weapon - communication relay in zero-G orbit.

```
COMPONENTS:
- 1x Small Reactor + Uranium
- 2x Gyroscope
- 1x Remote Control
- 4x Ion Thrusters (station keeping)
- 2x Hydrogen Thrusters (climb assist)
- 1x Small H2 Tank
- 2x Battery (stay charged)
- 1x Programmable Block
- 1x Merge Block
- 1x Connector [DOCK]
- 1x Radio Antenna (high power)

NO WARHEADS - isSatellite flag keeps them safe

SETTINGS:
- Mode: SATELLITE
- Climb until gravity < 0.05
- Auto-brake to zero velocity
- Station-keep at orbit point

STATS:
- Extends controller range
- Relays missile telemetry
- Shows on LCD8 network display
```

### Torpedo (Space Combat)

For space-to-space engagements. No climb phase needed.

```
COMPONENTS:
- 1x Battery (smaller = faster)
- 2x Gyroscope
- 1x Remote Control
- 6x Ion Thrusters (all directions)
- 4x Warheads
- 1x Sensor
- 1x Camera (LIDAR lock)
- 1x Programmable Block
- 1x Merge Block
- 1x Connector [DOCK]

SETTINGS:
- Flight: DIRECT
- Mode: LIDAR or SENSOR

STATS:
- Cost: ~800 components
- No H2 needed (battery+ion)
- Lock-on tracking
- High maneuverability
```

### Ammo Carrier Missile

Secondary payload delivery. Ejects ammo cloud before impact.

```
COMPONENTS:
- Standard missile base
- 2x Connectors:
  - [DOCK] - receives ammo from pad
  - [AMMO] - ejects ammo before impact
- 1+ Warhead

AMMO LOAD OPTIONS:
- Pistol: Cheap, light
- Rifle: Good damage/weight
- Rapid: Heavy but lethal
- Rocket: Expensive, devastating
- Gatling: High volume

EJECTION:
- Triggers when warheads ARM
- Ammo cloud flies toward target
- Extra damage + chaff effect
```

---

## MODULAR BASE EXPANSION

### Expansion Option 1: More Pads

```
BASE LAYOUT - LINEAR:
┌─────┬─────┬─────┬─────┐
│PAD1 │PAD2 │PAD3 │PAD4 │
└─────┴─────┴─────┴─────┘
     Shared Infrastructure

BASE LAYOUT - RADIAL:
       ┌─────┐
       │PAD1 │
  ┌────┼─────┼────┐
  │PAD4│CTRL │PAD2│
  └────┼─────┼────┘
       │PAD3 │
       └─────┘
```

### Expansion Option 2: Dedicated Roles

```
PAD1 - Combat Missiles (GPS/SENSOR)
PAD2 - ICBM Platform (ICBM flight mode)
PAD3 - Satellite Deployer (SATELLITE mode)
PAD4 - Torpedo Rack (LIDAR mode)
```

### Expansion Option 3: Controller + Workers

```
PAD1 (CONTROLLER):
- Issues mass commands
- Monitors all pads
- Salvo coordination

PAD2-8 (WORKERS):
- Receive commands via IGC
- Execute builds
- Auto-launch on command
```

### Expansion Option 4: Distributed Bases

```
BASE ALPHA (Planetary):
- 4 launch pads
- Ground targeting
- Atmosphere missiles

SATELLITE NETWORK:
- 3-5 relay sats in orbit
- Extend controller range
- Relay telemetry through blackout

BASE BETA (Orbital Station):
- 2 torpedo racks
- Space combat ready
- Ion-powered missiles
```

---

## WHAT'S NEW IN v01.00

- **Auto-Cycling Pad Overview** - LCD4 cycles through 7 status views every 5 seconds:
  - BUILD STATUS (ores, ingots, components, missing)
  - MISSILE STATUS (ready, armed, count, phase)
  - FUEL/TARGET (H2, O2, battery, ammo, bottles)
  - POWER (battery charge, flow, uranium)
  - CARGO (fill percentage, ore/ingot counts)
  - PRODUCTION (refineries, assemblers, queue)
  - COMMS (facilities, miners tracked)
- **Auto-Cycling Graphs** - LCD6 cycles through 7 graph types every 5 seconds (Power, H2, O2, Cargo, Refinery, Assembler, Production)
- **Improved Survival Kit Detection** - Now recognizes "KIT mark II" and other mod survival kits
- **Uranium/Ice Split Display** - Shows storage vs reactor/generator amounts separately
- **Bottle Queue Fix** - Bottles now correctly show queued counts
- **Pad Facilities in COMMS View** - Medical rooms, survival kits, and cryo chambers shown in cycling display

## PREVIOUS FEATURES

- **Storage Management System** - Auto-organize items from small to large containers
- **Container Classification** - Containers auto-sorted by size (Large/Medium/Small)
- **ORGANIZE Command** - Force immediate storage organization pass
- **AUTOORG Command** - Toggle auto-organization on/off (default: ON)
- **LCD Storage Display** - LCD4 shows container breakdown, LCD10 shows inventory totals

## WHAT'S IN v3.7

- **MinerBeacon Fleet Tracking** - Monitor mining ships on LCD9/LCD10 via IGC
- **10 LCD Display System** - Two additional LCDs for miner fleet status
- **MINER_BEACON Channel** - Receives miner status broadcasts (battery, cargo, H2, drills, state)
- **Auto-Correlation** - Matches docked ships to beacon data by EntityId
- **Works with PAM Miner** - MinerBeacon runs alongside PAM (2019 Steam Workshop version)

## WHAT'S IN v3.4

- Removed SPONGE integration - replaced with MinerBeacon system
- Ore auto-pull from docked miners to pad storage

## WHAT'S IN v3.3

- **Carpet Bomb Mode** - Controller spreads targets across multiple pads (LINE/GRID/CIRCLE patterns)
- **KILL ALL Auto-Attack** - Continuous attack mode until all detected targets destroyed
- **Smart Warhead Arming** - Arms based on distance to target, never on pad
- **Ammo Ejection** - [AMMO] connector ejects chaff/decoy payload when warheads arm
- **Auto-Setup on Dock** - Missiles auto-named when they dock (no manual NAMEMSL needed)
- **Auto-Launch** - T-minus countdown auto-launches (no second button press)

## WHAT'S IN v3.2

- **SATELLITE Mode** - Deploy missiles as communication relay satellites
- **Controller Mode** - One pad becomes command center for all others
- **Pad Resource Targets** - Set and monitor Ice, Uranium, H2/O2 tank levels, bottles
- **Bottle Auto-Production** - H2/O2 bottles auto-queued when below target
- **Ammo Material Display** - Shows ingot/ore needs for selected ammo type
- **Inter-Pad IGC Communication** - Pads communicate via broadcast messages
- **Mass Commands** - BUILD ALL, ARM ALL, LAUNCH ALL, ABORT ALL, SALVO MODE

---

## SATELLITE RELAY NETWORK

Deploy missiles as stationary communication satellites in zero-G orbit.

### How It Works
1. Set targeting mode to **SATELLITE**
2. Launch the missile
3. Missile climbs until gravity < 0.05 m/s²
4. Flips and brakes to zero velocity
5. Holds position as relay satellite
6. Broadcasts status and relays communications

### Satellite Features
- Extends controller range via relay chain
- Relays missile telemetry through network
- Warheads stay SAFE (won't arm or detonate)
- Broadcasts battery/H2 status
- Shows on LCD8 SATELLITE NET display

### Flight Phases
```
LAUNCH → SAT_CLIMB → SAT_BRAKE → SAT_HOLD
```

---

## CONTROLLER MODE

Turn any pad into a command center that controls all others.

### Enable Controller
```
SETPADCONTROL
```
(Run again to toggle off)

### Controller LCD Layout
| LCD | Shows |
|-----|-------|
| 1 | Command menu with mass actions |
| 2 | All pad status (M/P/A/R indicators) |
| 3 | Missile inventory summary |
| 4 | Mass target settings |
| 5 | Launch control, salvo status |
| 6 | Build queue status |
| 7 | Fleet flight status |
| 8 | Satellite network status |

### Mass Commands
| Command | Action |
|---------|--------|
| COPY TGT ALL | Send your target to all pads |
| BUILD ALL | Start printing on all empty pads |
| ARM ALL | Arm all ready missiles |
| LAUNCH ALL | Launch all armed missiles |
| SALVO MODE | Sequential launch with interval |
| ABORT ALL | Remote detonate all in-flight |

### Salvo Mode
Launches missiles sequentially with configurable interval (default 3s).

---

## CARPET BOMB MODE (Controller)

Spread targets across multiple pads for area saturation attacks.

### How It Works
1. Set your target GPS (center of attack zone)
2. Select CARPET from controller menu
3. Choose pattern: LINE, GRID, or CIRCLE
4. System calculates offset targets for each ready pad
5. Arms all missiles and starts salvo launch

### Patterns

| Pattern | Description |
|---------|-------------|
| **LINE** | Impacts spread along a line perpendicular to attack direction |
| **GRID** | Impacts in a square grid pattern centered on target |
| **CIRCLE** | Impacts in a circle around target |

### Settings
```
carpetSpread=50    # Meters between impact points (default 50)
carpetPattern=0    # 0=LINE, 1=GRID, 2=CIRCLE
```

### Commands
| Command | Action |
|---------|--------|
| `CARPET` | Start carpet bomb with current settings |
| Menu selection | CARPET:LINE / CARPET:GRID / CARPET:CIRCLE |

### Example
4 pads with LINE pattern, 50m spread:
```
       Target
         ▼
[PAD4] ← 75m → [PAD2] ← 0m → [PAD1] ← 75m → [PAD3]
         ↑
    Attack Line (150m total)
```

---

## KILL ALL AUTO-ATTACK MODE

Continuous attack until all detected enemies are destroyed.

### How It Works
1. Enable KILL ALL from controller menu (or `KILLALL` command)
2. Controller scans sensors for enemies/neutrals
3. Listens for ENEMY_SIGNAL broadcasts
4. Auto-assigns detected targets to ready pads
5. Arms and launches automatically
6. Continues until target queue is empty

### Detection Sources
- **Sensors** - Pad sensors detect enemies/neutrals
- **Broadcasts** - Listens on `ENEMY_SIGNAL` IGC channel
  - Send `Vector3D` position directly
  - Or send `"X,Y,Z"` string format

### Commands
| Command | Action |
|---------|--------|
| `KILLALL` | Toggle auto-attack mode |
| `AUTOATTACK` | Same as KILLALL |

### Triggering from External Scripts
Other scripts can broadcast enemy positions:
```csharp
IGC.SendBroadcastMessage("ENEMY_SIGNAL", enemyPosition);
// or
IGC.SendBroadcastMessage("ENEMY_SIGNAL", "1000,500,2000");
```

### Safety
- Only activates when isController=true
- Pads must be in READY state to receive targets
- Queue clears when disabled or all targets destroyed

---

## PAD RESOURCE MANAGEMENT

Monitor and set targets for pad consumables.

### Settings (in CONFIG menu)
| Setting | Range | Default |
|---------|-------|---------|
| Ice | 500-5000 | 1000 |
| Uranium | 10-200 | 50 |
| H2 Tank % | 50-100% | 90% |
| O2 Tank % | 50-100% | 90% |
| H2 Bottles | 10-100 | 20 |
| O2 Bottles | 10-100 | 20 |

### LCD4 Display (when no missile docked)
Shows PAD RESOURCES with have/need and status:
```
H2: 85/90% ○
O2: 92/90% ●
Ice: 1200/1000 ●
Uran: 45/50 ○
H2Bot: 15/20
O2Bot: 22/20
```

### Auto-Production
In SURVIVAL mode:
- Queues H2/O2 bottles when below target
- Shows bottle queue status on LCD6
- Displays material needs (~30Fe/10Ni/10Si per bottle)

---

## UNITY BOOT SYSTEM

Centralized boot controller that runs 40 system checks before operational scripts take over.

### How It Works

1. **Boot PB starts first** → Takes control of ALL 10 LCDs
2. **Runs 40 checks** → Displays progress (1/40, 2/40, etc.)
3. **On error** → Pauses 5 seconds, shows error message, retries
4. **On success** → Sets `boot_complete=true` in [SYSTEM] CustomData
5. **Self-disables** → UpdateFrequency.None (stops running)
6. **Handoff** → UnityPad and UnityInventory detect boot_complete and take their LCDs

### Setup

1. Add a **third** Programmable Block on the pad grid
2. Load `Unity Boot` script
3. Name PB: `[PAD1-BOOT] UNITY BOOT`
4. The boot PB communicates via button panel [SYSTEM] CustomData

### Boot Checks (40 Total)

**Pad Checks (1-20):** Grid, GTS, merge, connector, projector, RC, gyros, thrusters, warheads, batteries, tanks, cameras, sensors, antennas, waypoints, system panel, LCDs, config, IGC, pad ready

**Inventory Checks (21-40):** Grid, GTS, assemblers, refineries, storage, sorters, connectors, O2 gens, H2 tanks, O2 tanks, ingots, components, ores, tools, ammo, LCDs, quotas, blueprints, IGC, inventory ready

### LCD Control

| Phase | LCDs Controlled |
|-------|-----------------|
| **Boot** | ALL 10 (animated boot screen) |
| **After boot_complete** | Boot releases all |
| **UnityPad** | 1, 2, 3, 7, 8 |
| **UnityInventory** | 4, 5, 6, 9, 10 |

### Boot Handshake

```ini
[SYSTEM]
boot_complete=false    ; Set TRUE by Unity Boot on success
```

---

## UNITYINVENTORY SYSTEM

Dedicated inventory management running on a separate PB from UnityPad.

### Setup
1. Add SECOND Programmable Block on pad grid
2. Load `UnityInventory` script
3. Name PB: `[PAD1] Unity Inventory`
4. Both PBs share data via button panel CustomData

### User-Configurable Targets

Edit these in button panel CustomData under `[TARGETS]`:

| Setting | Default | Purpose |
|---------|---------|---------|
| `ammo` | 50000 | Turret ammo target |
| `load` | 10106 | Ammo per missile |
| `ice` | 1000 | Ice stockpile |
| `uran` | 50 | Uranium target |
| `h2` | 20 | H2 bottles |
| `o2` | 20 | O2 bottles |
| `tool` | 20 | Tools per tier |
| `pAmmo` | 100 | Personal ammo |

### 21 Component Targets (Auto-Queued)

| Component | Target | Component | Target |
|-----------|--------|-----------|--------|
| SteelPlate | 6000 | Thrust | 1050 |
| Construction | 3500 | Explosives | 2600 |
| InteriorPlate | 3000 | Detector | 1500 |
| SmallTube | 3200 | RadioCommunication | 900 |
| LargeTube | 1500 | GravityGenerator | 600 |
| Motor | 1200 | Girder | 500 |
| Computer | 1500 | Medical | 200 |
| MetalGrid | 950 | Reactor | 300 |
| Display | 600 | SolarCell | 500 |
| BulletproofGlass | 2050 | Superconductor | 300 |
| PowerCell | 800 | | |

### Container Tags for Routing

| Tag | Contents |
|-----|----------|
| `-ore` | Raw ores |
| `-ingot` | Ingots (incl Gravel) |
| `-comp` | Components |
| `-tools` | Hand tools |
| `-ammo` | Turret ammo |
| `-PAmmo` | Personal ammo |
| `-bottle` | H2/O2 bottles |

### Auto-Organization
- Enabled by default (`autoOrg=true`)
- Routes items to designated containers
- Prefers Large → Medium → Small containers

### Miner Handling
- Pulls ore/ingots FROM miner cargo, drills, grinders
- Pushes ice TO miner O2/H2 generators (if miner has one)
- Pushes uranium TO miner reactors (keeps 10 uranium stocked)
- O2/H2 gas auto-fills miner tanks via conveyor when docked
- Does NOT touch miner batteries (PAM compatibility)

### Commands
| Command | Action |
|---------|--------|
| `SORT` | Force immediate hard sort |
| `AUTOORG` | Toggle auto-organization |
| `RESCAN` | Re-scan for blocks |

### Button Panel CustomData Protocol

UnityInventory writes stock data that UnityPad reads for LCD display:
```
[CMP] Item = Stock + Queued / Target
SteelPlate          =  5000 +   50 /  6000
[AMO]
Rocket              = 45000 + 1000 / 50000
[BTL]
Hydrogen            =    15 +    5 /    20
[ORE]
Iron        = 25000
[ING]
Iron        = 15000
[STAT]
Refineries  = 3/4 working
Cargo       = 45%
```

---

## AMMO BUILD STATUS

LCD6 shows complete material chain for selected ammo type.

### Per-Ammo Material Costs
| Ammo Type | Iron | Nickel | Silicon | Magnesium | Platinum | Uranium |
|-----------|------|--------|---------|-----------|----------|---------|
| Pistol | 0.04 | 0.01 | - | - | - | - |
| Rifle | 0.18 | 0.02 | - | - | - | - |
| Rapid | 0.45 | 0.05 | - | - | - | - |
| Rocket | 15 | 1.2 | 0.36 | 0.6 | 0.12 | 0.24 |
| Gatling | 0.04 | 0.01 | - | 0.001 | - | - |

### LCD6 Shows
- Ingots needed for ammo load (have/need with status)
- Ore needed to make missing ingots
- Bottle production status
- Storage levels

---

## QUICK START

### New Pad Setup
1. Build your launch pad with all components
2. Add the PB with UnityPad.cs script
3. Run command: `SETUPMOD`
4. All blocks get automatically tagged `[PAD1]`, `[PAD1:1-8]`, `[PAD1-PRINT]`
5. Done! Pad is ready.

### Adding More Pads (Modular)
1. Build another pad module
2. Connect it to your existing grid
3. Add a new PB with the same script
4. Run `SETUPMOD` on the new PB
5. It automatically claims `[PAD2]` and tags its blocks differently
6. Both pads operate independently!

### Setting Up Controller
1. Pick one pad to be command center
2. Run `SETPADCONTROL` on that pad
3. LCD layout changes to controller view
4. Other pads broadcast status to controller

---

## MODULAR PAD SYSTEM

Multiple pads can share one grid. Each pad:
- Has its own PB running the script
- Gets a unique ID: PAD1, PAD2, PAD3, etc.
- Only controls blocks with its specific tag
- Shares cargo, assemblers, and refineries with other pads
- Operates completely independently

### Tag Format
| Old Format | New Modular Format |
|------------|-------------------|
| `[PAD1]` | Pad core blocks (merge, connector, button) |
| `[PAD1:1-10]` | LCD displays 1-10 |
| `[PRINT]` | `[PAD1-PRINT]`, `[PAD2-PRINT]`, etc. |

### SETUPMOD Safety
- Only renames blocks close to the PB
- Skips blocks already named "Missile #X"
- Skips connected merge blocks (won't rename docked missile parts)
- Skips connected connectors
- Safe to run anytime

---

## 10 LCD DISPLAY SYSTEM

| LCD | Name | Shows |
|-----|------|-------|
| 1 | CONTROL | Main menu, settings, navigation, wizard |
| 2 | BUILD | Projector progress, components, ore needs |
| 3 | MISSILE | Systems, thrusters, batteries, warheads |
| 4 | FUEL | Power/H2/Ice bars, ammo, state, countdown |
| 5 | POWER | Battery stats, net flow, graphs, time estimates |
| 6 | CARGO | Production, ammo crafting, ore/ingot stocks, bottles |
| 7 | TELEMETRY | Flight tracking, comms, position, graphs |
| 8 | GPS/SAT | Targeting mode, waypoints, satellite network |
| 9 | MINER FLEET | Overview of all MinerBeacon-tracked ships |
| 10 | MINER DETAIL | Detailed status with progress bars (bat, cargo, H2) |

### VIEW Mode
1. From main menu, select **VIEW**
2. Choose LCD 2-8 to expand
3. LCD1 shows that content with scrolling
4. UP/DOWN scrolls the content
5. APPLY exits back to menu

### Flight Mode Displays
During missile flight (S.GONE), all LCDs switch to show:
- Flight time, velocity, ETA
- Missile position (X, Y, Z)
- Phase, distance to target
- Blackout status
- Telemetry graphs
- Abort option

---

## TARGETING MODES

| Mode | Behavior |
|------|----------|
| **GPS** | Fly to X,Y,Z coordinates from waypoint list |
| **ANTENNA** | Track broadcasting antenna signal |
| **SENSOR** | Hunt enemies with onboard sensors |
| **LIDAR** | Camera raycast lock-on targeting |
| **MANUAL** | No guidance, fly straight |
| **SATELLITE** | Deploy as relay satellite in zero-G orbit |

---

## ALL SETTINGS

| Setting | Range | Description |
|---------|-------|-------------|
| Climb | 50-500m | Distance before warheads arm |
| Detonate | 10-100m | Proximity explosion range |
| T-Minus | 0-10s | Countdown timer |
| Sensor | 10-100m | Sensor detection range |
| LIDAR | 500-5000m | Camera raycast range |
| Flight | AUTO/ICBM/DIRECT | Flight mode override |
| Burn | 1-15s | ICBM burn time |
| Reentry | 500-5000m | Reentry thrust distance |
| Broadcast | ON/OFF | Antenna position broadcast |
| Payload | Pistol/Rifle/Rapid/Rocket/Gatling | Ammo type |
| Load | 1k-50k | Ammo to load per missile |
| Eject | 1k-50k | Ammo to eject per strike |
| Stock | 10k-100k | Target ammo stockpile |
| Ice | 500-5000 | Target ice in cargo |
| Uranium | 10-200 | Target uranium in reactors |
| H2 Tank | 50-100% | Target H2 tank fill level |
| O2 Tank | 50-100% | Target O2 tank fill level |
| H2 Bot | 10-100 | Target H2 bottle count |
| O2 Bot | 10-100 | Target O2 bottle count |
| Mode | CREATIVE/SURVIVAL | Auto-production mode |
| Connector | LOCK/OPEN | Manual connector control |
| Timeout | 300-1800s | Telemetry loss timeout |
| Graph | 30m/1h/6h/12h/1d/ALL | Power graph range |
| RESET ALL | - | Reset to defaults |

---

## COMMANDS

| Command | Action |
|---------|--------|
| `UP` | Menu navigation up |
| `DOWN` | Menu navigation down |
| `APPLY` | Select/confirm |
| `LAUNCH` | Launch missile / Remote detonate |
| `PRINT` | Start/stop printer |
| `SETUP` | Open setup wizard |
| `RESCAN` | Re-detect environment and blocks |
| `SETUPMOD` | Initialize pad module (claim ID, tag blocks) |
| `CLAIM` | Manually claim next pad ID |
| `NAMEPAD` | Rename pad blocks with clean names |
| `NAMEMSL` | Rename missile blocks with clean names |
| `CREATIVE` | Toggle creative/survival mode |
| `SETPADCONTROL` | Toggle controller mode |
| `COPYTGT` | Send target to all pads (controller) |
| `BUILDALL` | Start build on all pads (controller) |
| `ARMALL` | Arm all missiles (controller) |
| `LAUNCHALL` | Launch all missiles (controller) |
| `ABORTALL` | Abort all in-flight (controller) |
| `STARTSALVO` | Start salvo mode (controller) |
| `STOPSALVO` | Stop salvo mode (controller) |
| `CARPET` | Start carpet bomb (controller) |
| `KILLALL` | Toggle auto-attack mode (controller) |
| `AUTOATTACK` | Same as KILLALL |
| `ORGANIZE` | Force storage organization pass |
| `AUTOORG` | Toggle auto-organization on/off |
| `GPS:X,Y,Z` | Set GPS target coordinates |

---

## IGC BROADCAST TAGS

| Tag | Purpose |
|-----|---------|
| `UNITY_MSL` | Missile telemetry (position, phase, distance) |
| `UNITY_MSL_CMD` | Missile commands (DETONATE, etc.) |
| `UNITY_MSL_RELAY` | Relayed missile telemetry via satellite |
| `UNITY_PAD_CMD` | Pad-to-pad commands |
| `UNITY_PAD_STATUS` | Pad status broadcast |
| `UNITY_SAT_RELAY` | Satellite relay network |
| `UNITY_SAT_RELAY_STATUS` | Satellite status broadcast |
| `ENEMY_SIGNAL` | Enemy broadcast detection (for auto-attack) |
| `MINER_BEACON` | MinerBeacon ship status (bat, cargo, drills, status) |

---

## BUILD THE LAUNCH PAD

### Required Blocks (will be auto-tagged by SETUPMOD)
1. **MERGE BLOCK** - Missile docking point
2. **CONNECTOR** - Fuel transfer
3. **8 LCD PANELS** - Status displays
4. **BUTTON PANEL** - Control input
5. **PROGRAMMABLE BLOCK** - Runs the script

### Printer Blocks (optional)
6. **PISTONS** - Move welders
7. **WELDERS** - Build missile
8. **PROJECTOR** - Blueprint source

### Pad Infrastructure
9. **BATTERIES** - Power storage
10. **SOLAR/WIND/REACTOR** - Power generation
11. **H2 TANK** - Fuel storage
12. **O2 TANK** - Life support
13. **O2/H2 GENERATOR** - Ice processing
14. **CARGO CONTAINERS** - Material storage
15. **ASSEMBLERS** - Component production
16. **REFINERIES** - Ore processing
17. **ANTENNAS** - Communication
18. **LASER ANTENNA** - Long-range link

---

## BUILD THE MISSILE

### Required Blocks
1. **MERGE BLOCK** - Docks to pad
2. **CONNECTOR** - For refueling (tag [DOCK])
3. **REMOTE CONTROL** - Orientation reference
4. **GYROSCOPE** - At least 1
5. **THRUSTER** - At least 1 forward-facing
6. **BATTERY** - At least 1
7. **WARHEAD** - At least 1 (not for SATELLITE mode)
8. **PROGRAMMABLE BLOCK** - Runs guidance script

### Optional Blocks
- 2nd **CONNECTOR** (tag [AMMO]) - For ammo ejection
- **HYDROGEN TANK** - More fuel capacity
- **O2/H2 GENERATOR** - Makes fuel from ice
- **SENSOR** - For SENSOR targeting mode
- **CAMERA** - For LIDAR targeting mode
- **ANTENNA** - Position broadcast
- **LASER ANTENNA** - Direct data link

---

## BUTTON SETUP

| Button | Argument | Action |
|--------|----------|--------|
| 1 | UP | Navigate up |
| 2 | DOWN | Navigate down |
| 3 | APPLY | Select/confirm |
| 4 | LAUNCH | Launch or remote detonate |

---

## ICBM FLIGHT PROFILE

When launching from a planet:

```
LAUNCH → CLIMB → ARM → BURN → COAST → REENTRY → TARGET → IMPACT
```

| Phase | Behavior |
|-------|----------|
| CLIMB | Thrust UP until gravity < 0.05 m/s² |
| ARM | Arm warheads, enter space |
| BURN | Orient toward target, thrust for X seconds |
| COAST | Engines OFF, ballistic trajectory |
| REENTRY | Gravity detected, re-enable thrusters |
| TARGET | Full thrust terminal guidance |

---

## BLACKOUT HANDLING

Radio antennas have 50km range. ICBM climbs to 60km+. This creates blackout.

| Status | Meaning |
|--------|---------|
| `ENTERING_BLACKOUT` | 95% of antenna range |
| (no signal) | Beyond 50km |
| `CONTACT_RESTORED` | Back in range |

**ABORT during blackout** gets queued and executes when contact restored.

**Laser Antenna** provides unlimited range link through blackout.

---

## PRINTER SYSTEM

### Tag Printer Blocks (Auto-Named by SETUPMOD)
- Pistons: `[PAD1-PRINT] Piston 1`, `[PAD1-PRINT] Piston 2`, etc.
- Welders: `[PAD1-PRINT] Welder 1`, `[PAD1-PRINT] Welder 2`, etc.
- Projector: `[PAD1-PRINT] Projector`

SETUPMOD automatically:
- Numbers each piston and welder uniquely
- Finds blocks on subgrids (piston heads, rotor heads)
- Scans within 50m for subgrid print blocks

### Print Cycle
1. **RESET** - Pistons retract to start
2. **EXTEND** - Pistons extend to max
3. **WELD** - Welders ON, pistons retract slowly
4. **CHECK** - If blocks remain, extend again
5. **DONE** - Missile complete, systems disabled

---

## AUTO-PRODUCTION (Survival Mode)

When in SURVIVAL mode, the pad automatically:
- Queues missing components for missile blueprint
- Maintains ammo stockpile target
- Queues H2/O2 bottles when below target
- Displays ore requirements for missing ingots
- Shows material needs for selected ammo type

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| No LCDs updating | Run `SETUPMOD` to tag blocks |
| Missile not detected | Check merge block connection |
| Printer not working | Tag pistons/welders with `[PAD#-PRINT]` |
| Wrong pad ID | Run `CLAIM` to get next available ID |
| Blocks not found | Run `RESCAN` to re-detect |
| Settings not applying | Scroll down in settings, indices 13-24 are new |
| Satellites not showing | Check LCD8 or controller LCD8 |

---

## CHARACTER COUNTS

| Script | Deployed | Limit | Status |
|--------|----------|-------|--------|
| Unity Boot | 12,697 | 100,000 | OK (87% margin) |
| UnityPad | 89,239 | 100,000 | OK (11% margin) |
| UnityMissile | 26,058 | 100,000 | OK (74% margin) |
| UnityInventory | 78,680 | 100,000 | OK (21% margin) |
| UnityBeacon | 10,800 | 100,000 | OK (89% margin) |

*Note: The 100k limit applies to DEPLOYED script.cs in AppData. MDK2 with `minify=full` compresses the raw source by ~20-30%.*

---

## FIND BLOCKS UTILITY

Use the **FIND BLOCKS** script to analyze your grid before setup:
1. Add FIND BLOCKS script to a PB on your grid
2. Run it once
3. Check Custom Data for full report showing:
   - All blocks with distance from PB
   - Merge block connections
   - Connector status
   - System tags detected
   - Subtype references for naming

---

## FUTURE EXPANSIONS (Code Additions)

These features are planned or partially implemented. Some require code additions.

### Phase 1: Satellite Network v2 (Partially Complete)

**Current:**
- Single satellites hold position in zero-G
- Basic relay of missile telemetry
- Status broadcast to controller LCD8

**Future Code Additions:**
```csharp
// GROUND RELAY STATIONS
// Satellites that work in gravity wells
// Useful for remote bases without direct line-of-sight

// In UnityMissile.cs, add to DoSatHold():
bool isGroundRelay = currentGrav > 0.1;
if (isGroundRelay) {
    // Station keeping with gravity compensation
    // Hover mode instead of zero-G drift compensation
}

// SATELLITE MESH NETWORKING
// Sats relay to each other, creating range extension chains

// New IGC channel:
string satMeshTag = "UNITY_SAT_MESH";
// Each sat tracks other sats and picks closest to forward data

// AUTO-DEPLOY SATELLITE CHAIN
// Controller calculates gaps in coverage and deploys sats

// In UnityPad.cs controller mode:
void AnalyzeCoverage() {
    // Get all sat positions
    // Calculate coverage gaps
    // Suggest deployment points
}
```

### Phase 2: Advanced Targeting

**Future Code Additions:**
```csharp
// PREDICTIVE INTERCEPT
// Lead target based on velocity, not current position

Vector3D predictedTarget = targetPos + targetVel * timeToImpact;

// EVASIVE MANEUVERS
// Spiral or weave pattern during approach to avoid point defense

bool evasiveEnabled = dist < 500;
if (evasiveEnabled) {
    double wobble = Math.Sin(Runtime.TimeSinceLastRun.TotalSeconds * 5);
    targetOffset = rc.WorldMatrix.Right * wobble * 10;
}

// MULTI-STAGE TARGETING
// Different targeting modes for different flight phases
// GPS for cruise, LIDAR for terminal

if (phase == F.COAST) mode = T.GPS;
if (phase == F.TARGET && dist < lidarRange) mode = T.LIDAR;
```

### Phase 3: Formation Flying

**Future Code Additions:**
```csharp
// SALVO FORMATION
// Multiple missiles coordinate approach angles

// IGC formation channel:
string formationTag = "UNITY_MSL_FORM";

// In UnityMissile.cs:
int formationSlot = 0; // Set by launcher
Vector3D GetFormationOffset() {
    // Slot 0: Center
    // Slot 1-4: Cardinal offset
    // Slot 5-8: Diagonal offset
    double angle = formationSlot * (360 / 8) * Math.PI / 180;
    return new Vector3D(Math.Cos(angle) * 50, 0, Math.Sin(angle) * 50);
}

// SWARM MODE
// Missiles cluster and attack from random angles

// Each missile picks random offset, recalculates periodically
Vector3D swarmOffset = new Vector3D(
    random.Next(-100, 100),
    random.Next(-100, 100),
    random.Next(-100, 100)
);
```

### Phase 4: Defense Systems

**Future Code Additions:**
```csharp
// POINT DEFENSE INTEGRATION
// Pad script controls turrets to defend against incoming

// In UnityPad.cs:
List<IMyLargeTurretBase> turrets = new List<IMyLargeTurretBase>();

void ConfigureDefense() {
    foreach (var t in turrets) {
        t.EnableIdleRotation = true;
        t.TargetMissiles = true;
        t.TargetMeteors = true;
    }
}

// DECOY DEPLOYMENT
// Launch cheap decoys to distract enemy targeting

// Decoy missiles: small, fast, cheap, no warhead
// Just needs to broadcast antenna signal

// CHAFF/FLARE
// Current ammo ejection system could be expanded
// Different ammo types for different countermeasures
```

### Phase 5: Autonomous Operations

**Future Code Additions:**
```csharp
// AUTO-RETALIATION
// Detect incoming attack, auto-select target, launch

// In UnityPad.cs:
bool autoRetaliateEnabled = false;
IMySensorBlock defenseSensor;

void CheckThreat() {
    if (defenseSensor == null) return;
    var threats = new List<MyDetectedEntityInfo>();
    defenseSensor.DetectedEntities(threats);
    foreach (var t in threats) {
        if (t.Relationship == MyRelationsBetweenPlayerAndBlock.Enemies) {
            AutoTarget(t.Position);
            if (state == S.READY) AutoLaunch();
        }
    }
}

// PATROL MODE
// Satellite or drone flies pattern, reports contacts

// In UnityMissile.cs:
List<Vector3D> patrolPoints = new List<Vector3D>();
int currentPatrolPoint = 0;

void DoPatrol() {
    // Fly to next point
    // Report any sensor contacts
    // Loop indefinitely
}
```

### Phase 6: Remote Operations

**Future Code Additions:**
```csharp
// DRONE CARRIER
// Large ship deploys multiple small drones
// Each drone has missile script but no warhead
// Acts as mobile sensor/relay platform

// REMOTE BASE CONTROL
// Control distant bases via satellite relay
// Requires new IGC channels and auth tokens

string remoteBaseTag = "UNITY_REMOTE_BASE";

void SendRemoteCommand(string baseId, string command) {
    string msg = $"{baseId}|{authToken}|{command}";
    IGC.SendBroadcastMessage(remoteBaseTag, msg);
}

// MOBILE LAUNCH PLATFORM
// Ship-based launcher with all pad functionality
// Auto-stabilize for launch, gravity compensation
```

### Implementation Priority

| Feature | Complexity | Value | Priority |
|---------|-----------|-------|----------|
| Ground Relay Stations | Low | High | 1 |
| Predictive Intercept | Medium | High | 2 |
| Satellite Mesh | Medium | Medium | 3 |
| Evasive Maneuvers | Low | Medium | 4 |
| Formation Flying | High | Medium | 5 |
| Auto-Retaliation | Medium | High | 6 |
| Point Defense | High | High | 7 |
| Remote Base Control | High | Medium | 8 |

---

## SMART WARHEAD ARMING (v3.3)

Warheads now use intelligent arming logic:

| Condition | Result |
|-----------|--------|
| Distance from pad < Climb * 2 | Stay SAFE (too close to base) |
| Distance to target < ArmDist | ARM warheads |
| Default ArmDist | Detonate * 4 |

**Safety Features:**
- Never arms on pad even if target is close
- Arms only when approaching target
- Ejects ammo from [AMMO] connector when arming
- Tracks warheadsArmed flag to prevent double-arming

**Settings:**
```
ArmDist=200     # Custom arm distance (optional)
Detonate=50     # Proximity detonation range
Climb=200       # Safety distance = Climb * 2
```

**Ammo Ejection:**
When warheads arm, the [AMMO] connector (if present) automatically enables ThrowOut, ejecting any loaded ammo as chaff/decoy payload toward the target.

---

## MINERBEACON FLEET TRACKING

Track mining ships via IGC whether docked or flying. Works with PAM Miner.

### How It Works
```
+------------------+                    +------------------+
|   YOUR MINER     |     IGC Radio     |   UNITY PAD      |
|------------------|    ==========>    |------------------|
| [BEACON] Blocks  |   MINER_BEACON    | LCD 9: Fleet     |
| MinerBeacon PB   |                   | LCD 10: Details  |
+------------------+                    +------------------+
```

### Setup
1. Build ORE connectors on pad (name contains "ORE")
2. Add LCD9 `[PAD1:9]` and LCD10 `[PAD1:10]` to pad
3. Install MinerBeacon script on each miner (separate project)
4. Tag miner blocks with `[BEACON]` (or dual-tag `[PAM] [BEACON]`)
5. Run `SETHOME` on miner when docked at base
6. Miners auto-appear on LCD9/LCD10 when broadcasting

### MinerBeacon Script (Separate Project)
Located at: `Space Engineers/MinerBeacon/`

**Required on each miner:**
- 1x Programmable Block with MinerBeacon.cs
- 1x Remote Control tagged `[BEACON]`
- 1x Antenna tagged `[BEACON]`
- Optional: Connector, LCD with `[BEACON]` tag

**Commands on miner PB:**
- `SETUP` - Auto-tag first available blocks
- `SETHOME` - Save current position as home base
- `RESCAN` - Re-scan for tagged blocks

### LCD9 - Miner Fleet
Shows overview of all tracked miners:
- Miner name (from CustomData ShipName setting)
- Status (see inference table below)
- Battery % and Cargo %
- Distance from pad

**Status Inference:**
| Status | Condition |
|--------|-----------|
| DOCKED | Connector locked |
| DRILLING | Drills on, speed < 2 m/s |
| DRILL_MOVE | Drills on, moving |
| GRINDING | Grinders on, speed < 2 m/s |
| GRIND_MOVE | Grinders on, moving |
| DEPARTING | Speed > 5 m/s, near home (<500m) |
| TRAVELING | Speed > 5 m/s |
| HOME | At home position (<100m), idle |
| IDLE | Default when none of above |

### LCD10 - Miner Detail
Shows detailed status with:
- Full progress bars for Battery, Cargo, H2
- Speed, altitude, distance from home
- Drill count and active drills
- Port number when docked

### Auto-Correlation
When miner docks at ORE connector:
- Pad reads EntityId from connected grid
- Matches with beacon data
- Shows "Docked @Port1" etc.
- Persists tracking when undocked

### Stale Cleanup
Miners with no beacon signal for 120+ seconds (and not docked) are removed from tracking.

### PAM Compatibility
MinerBeacon runs alongside PAM Miner (2019 Steam Workshop):
- Use dual-tag: `[PAM] [BEACON] Remote Control`
- MinerBeacon only reads - never controls autopilot
- Both scripts run in separate PBs

---

## AUTO-SETUP ON DOCK

When a missile docks to a pad, all blocks are automatically named:

### Automatic Actions on Dock
1. **NameMissileParts()** - Names all missile blocks as "Missile #X [BlockType]"
2. **AutoNameConnectors()** - Tags connectors as [DOCK] and [AMMO]

### Block Naming Format
```
Missile #1 Battery
Missile #1 Gyroscope
Missile #1 H2 Thruster
Missile #1 Warhead
Missile #1 [DOCK] Connector
Missile #1 [AMMO] Connector
```

### No Manual Setup Needed
- Just dock the missile
- System auto-detects new missile (partsNamed=false)
- All blocks get named automatically
- Build number increments for next missile

---

---

## THE COMPLETE SYSTEM

| Script | Location | PB Name | Purpose |
|--------|----------|---------|---------|
| **Unity Boot.cs** | `Unity Missile System/` | `[PAD1-BOOT] UNITY BOOT` | Boot controller, 40 system checks, LCD init |
| **UnityPad.cs** | `Unity Missile System/` | `[PAD1] Unity Pad` | Launch control, LCDs, targeting, printing |
| **UnityMissile.cs** | `Unity Missile System/` | `PAD1 Missile #1 Unity Missile` | Guided missile with multiple targeting modes |
| **UnityInventory.cs** | `Unity Missile System/` | `[PAD1] Unity Inventory` | Inventory management, production, auto-sorting |
| **UnityBeacon.cs** | `Unity Missile System/` | `[BEACON] Unity Beacon` | Broadcasts miner status to pad |

---

## PROGRAMMABLE BLOCK NAMING

Scripts use specific PB naming conventions:

| Script | PB Name Format | Example |
|--------|----------------|---------|
| **Unity Boot** | `[PAD#-BOOT] UNITY BOOT` | `[PAD1-BOOT] UNITY BOOT` |
| **UnityPad** | `[PAD#] Unity Pad` | `[PAD1] Unity Pad` |
| **UnityMissile** | `PAD# Missile #X Unity Missile` | `PAD1 Missile #1 Unity Missile` |
| **UnityInventory** | `[PAD#] Unity Inventory` | `[PAD1] Unity Inventory` |
| **UnityBeacon** | `[BEACON] Unity Beacon` | `[BEACON] Unity Beacon` |

**Notes:**
- The `[PAD#]` tag in the PB name ties it to a specific pad
- Unity Boot runs FIRST and controls all 10 LCDs during startup
- UnityPad takes LCDs 1,2,3,7,8 after boot_complete
- UnityInventory takes LCDs 4,5,6,9,10 after boot_complete
- Missile PB names include pad ID and missile build number
- UnityInventory runs on a SEPARATE PB from UnityPad (same grid)
- All block tags remain unchanged: `[PAD1]`, `[PAD1:1-10]`, `-ore`, `[DOCK]`, etc.

---

*Unity AI Lab - Missile Systems Division*
*She codes, she cusses, she makes things go boom.*
