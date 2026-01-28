![Unity Pad](Unity%20Pad%202.png)

# UnityPad v01.00

Modular launch pad controller for the Unity Missile System. Manages missile printing, fueling, arming, and launch. Features sprite-based LCD rendering, multi-pad controller mode, and fleet tracking.

**Location:** `Unity Missile System/src/scripts/UnityPad/`
**PB Name:** `[PAD1] Unity Pad`
**Version:** v01.00 | 2026-01-24

---

## Table of Contents

1. [Overview](#overview)
2. [System Integration](#system-integration)
3. [Setup](#setup)
4. [Block Configuration](#block-configuration)
5. [State Machine](#state-machine)
6. [Commands](#arguments)
7. [IGC Communication](#igc-communication)
8. [CustomData Schema](#per-pb-customdata-architecture)
9. [LCD Displays](#lcd-layout)
10. [Controller Mode](#controller-mode)
11. [Satellite Array](#satellite-array-management)
12. [Build and Deploy](#build-and-deploy)
13. [Character Budget](#character-budget)
14. [Quick Reference](#quick-reference)

---

## Overview

UnityPad is the launch pad controller that:
1. **Wipes Me.CustomData on compile** via `ClearForBoot()`
2. **Writes `pad_ready=true`** for Unity Boot to detect
3. **Waits for boot_complete** from bootPB before taking LCD control
4. **Manages missile lifecycle:** IDLE → PRINT → BUILD → DOCK → FUEL → READY → ARM → LAUNCH → GONE
5. **Controls LCDs 1, 2, 3, 7, 8** (after boot)
6. **Tracks in-flight missiles** via IGC telemetry
7. **Coordinates multi-pad operations** in controller mode
8. **Monitors mining fleet** via UnityBeacon broadcasts

---

## System Integration

### The Unity Missile System

| Component | Script | PB Name | Purpose |
|-----------|--------|---------|---------|
| **Boot Controller** | Unity Boot.cs | `[PAD1] UNITY BOOT` | 23-check boot sequence |
| **Launch Pad** | **UnityPad.cs** | **`[PAD1] Unity Pad`** | **Missile control, LCDs 1,2,3,7,8** |
| **Inventory** | UnityInventory.cs | `[PAD1] Unity Inventory` | Production, LCDs 4,5,6,9,10,11 |
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
| 4 | Unity Boot | Reads ready flags, runs 23 checks, sets `boot_complete=true` |

*Note: UnityBeacon (miners) and UnityMissile (missiles) are on separate grids - compile anytime.*

---

## SETUP

### Programmable Block

1. Add a Programmable Block to your launch pad grid
2. Load the `UnityPad` script
3. **Name the PB:** `[PAD1] Unity Pad`
4. Run command: `SETUPMOD` to auto-tag all blocks

**COMPILE ORDER:** PAD → INVENTORY → SIGNAL → BOOT

### Required Blocks

| Block | Tag | Purpose |
|-------|-----|---------|
| Merge Block | `[PAD1]` | Missile attachment point |
| Connector | `[PAD1]` | Fuel/data transfer |
| Button Panel | Contains "control" | Navigation and GPS input |
| LCDs | `[PAD1:1]` through `[PAD1:8]` | Status displays |

### Printer Blocks (Optional)

| Block | Tag | Purpose |
|-------|-----|---------|
| V Pistons | `[PAD1-PRINT] V1`, `V2`... | Vertical welding motion |
| H Pistons | `[PAD1-PRINT] H1`, `H2`... | Horizontal stepping |
| Welders | `[PAD1-PRINT] W1`, `W2`... | Build welders |
| Projector | `[PAD1-PRINT] Proj` | Blueprint projection |

---

## PER-PB CUSTOMDATA ARCHITECTURE

**CRITICAL:** UnityPad writes ONLY to `Me.CustomData`. GPS input comes from button panel.

### ClearForBoot() - Written on Compile

```ini
[SYSTEM]
pad_ready=true
pad_session={timestamp}
[PAD_CFG]
[PAD_STATUS]
[PAD_DATA]
[BLACKBOX]
```

### What UnityPad Reads From Other PBs

| Source | Data Read |
|--------|-----------|
| bootPB | `boot_complete=true`, `boot_for_session={guid}` |
| invPB | Inventory stats, quotas, ammo stock |
| Button Panel | GPS coordinates (user input) |

### Session Validation

UnityPad generates a unique `pad_session` on compile. Unity Boot validates this when setting `boot_complete=true` to ensure scripts are in sync.

---

## BOOT SYSTEM DEPENDENCY

**UnityPad waits for boot_complete=true before taking LCD control.**

### Finding Sibling PBs

Uses `IsSameConstructAs(Me)` for multi-pad safe discovery. No fallback -- if a PB doesn't have the exact `[PAD{id}]` tag, it's ignored.

```csharp
void FindSiblingPBs(){
    // IsSameConstructAs(Me) -- multi-pad safe, no fallback
    // bootPB: Contains "[PAD{id}]" AND "UNITY BOOT"
    // invPB: Contains "[PAD{id}]" AND "Unity Inventory"
    // signalPB: Contains "[PAD{id}]" AND "UNITY SIGNAL"
}
```

### Boot Response Protocol

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | Boot → Pad | Request system status |
| `UNITY_BOOT_RSP` | Pad → Boot | Respond with block counts |
| `UNITY_BOOT_ACK` | Pad → Boot | Script running acknowledgment |

**Response Format:**
```
PAD|OK|merge=1,con=2,bat=4,h2=2,o2=1,prt=6
```

---

## STATE MACHINE

```
INIT → IDLE → PRINT → BUILD → DOCK → FUEL → AMMO → READY → ARM → LAUNCH → GONE
                ^                                                         |
                |_________________________________________________________| (auto-reset)
```

| State | Description |
|-------|-------------|
| INIT | Scanning for blocks |
| IDLE | No missile, waiting |
| PRINT | Running printer cycle |
| BUILD | Monitoring build progress |
| DOCK | Missile docked, connecting |
| FUEL | Transferring fuel/ice/uranium/ammo |
| AMMO | Loading ammo into missile |
| READY | Fully fueled, awaiting ARM |
| ARM | Armed with countdown |
| LAUNCH | Separation sequence |
| GONE | Tracking in-flight missile |

---

## PRINTER STATE MACHINE

5-state machine for welding missiles with vertical/horizontal pistons:

```
ALIGN(0) → UP(1) → DOWN(2) → ZERO(3) → H_STEP(4) → UP(1) → repeat
```

| State | Action |
|-------|--------|
| 0 (ALIGN) | V pistons to prtVZero (1.4m), H pistons to max (7.2m), then welders ON |
| 1 (UP) | V pistons extend toward prtVMax (10m) |
| 2 (DOWN) | V pistons retract toward 0 |
| 3 (ZERO) | V pistons return to prtVZero (1.4m) |
| 4 (H_STEP) | H pistons retract by prtHStep (0.2m), then back to state 1 |

### Printer Constants

| Variable | Value | Purpose |
|----------|-------|---------|
| prtVZero | 1.4m | V piston home position |
| prtVMax | 10m | V piston max extension |
| prtHMax | 7.2m | H piston starting position |
| prtHStep | 0.2m | Horizontal step per pass |
| prtVSpeed | 0.5 m/s | V piston velocity |
| prtHSpeed | 0.3 m/s | H piston velocity |

### Print Completion

Printing stops when:
- `prtProj.RemainingBlocks == 0` (projector done)
- `prtHPos <= 0.05f` (H pistons fully retracted)

---

## LCD LAYOUT

**UnityPad controls LCDs 1, 2, 3, 7, 8.** LCDs 4, 5, 6, 9, 10, 11 are controlled by UnityInventory.

| LCD | Content |
|-----|---------|
| 1 | CONTROL - Main menu, settings, navigation |
| 2 | BUILD - Projector progress, components, production |
| 3 | MISSILE - Systems, thrusters, batteries, warheads |
| 7 | TELEMETRY - Flight tracking, position, velocity |
| 8 | GPS/SAT - Targeting mode, waypoints, satellite network |

---

## MENU SYSTEM

Menu modes cycle with `MENU` argument:

| Mode | Purpose |
|------|---------|
| MAIN | Primary actions (Launch, Target, Settings, Print) |
| TGT | Target mode selection and waypoint cycling |
| SET | Configuration settings |
| ARM | Arm/Disarm controls |
| WIZARD | Initial setup wizard |
| VIEW | LCD detail view selection |

---

## TARGETING MODES

| Mode | Description |
|------|-------------|
| GPS | Target specific GPS coordinates |
| ANTENNA | Home on broadcasting antenna |
| SENSOR | Acquire target via sensor |
| LIDAR | Lock on with raycast |
| MANUAL | Manual flight control |
| SATELLITE | Deploy as communication satellite |

---

## ARGUMENTS

### Navigation

| Argument | Action |
|----------|--------|
| `UP` | Navigate menu up / Scroll in VIEW mode |
| `DOWN` | Navigate menu down / Scroll in VIEW mode |
| `APPLY` | Select/confirm / Exit VIEW mode |
| `MENU` | Cycle menu modes |

### Missile Operations

| Argument | Action |
|----------|--------|
| `LAUNCH` | Launch armed missile / Detonate in-flight |
| `ARM` | Arm missile when READY |
| `DISARM` | Disarm armed missile |
| `REFUEL` | Start refuel cycle when IDLE |
| `ACK` / `OK` / `CLEAR` | Acknowledge launch outcome |

### Printer Operations

| Argument | Action |
|----------|--------|
| `PRINT` | Start printer cycle |
| `STOP` | Stop printer cycle |
| `RESET#` | Reset build number to 0 |

### Setup & Configuration

| Argument | Action |
|----------|--------|
| `SETUP` | Open setup wizard menu |
| `SETUPMOD` | Auto-setup module (claim ID, tag all blocks) |
| `SETUPFORCE` | Force setup even if blocks already tagged |
| `RESCAN` | Re-detect environment and rescan blocks |
| `CLAIM` | Manually claim next available pad ID |
| `NAMEPAD` | Rename all pad blocks with clean names |
| `NAMEMSL` | Rename all missile blocks with clean names |
| `CREATIVE` | Toggle creative/survival mode |
| `RESET` | Reset state machine to IDLE |
| `BBRESET` | Clear blackbox log |

### Controller Mode (Multi-Pad)

| Argument | Action |
|----------|--------|
| `SETPADCONTROL` | Toggle controller mode |
| `COPYTGT` | Broadcast target to all pads |
| `BUILDALL` | Start build on all empty pads |
| `ARMALL` | Arm all missiles in READY state |
| `LAUNCHALL` | Launch all armed missiles |
| `ABORTALL` | Remote detonate all in-flight missiles |
| `STARTSALVO` | Start salvo launch (sequential) |
| `STOPSALVO` | Stop salvo mode |
| `CARPET` | Start carpet bomb pattern |
| `AUTOATTACK` / `KILLALL` | Toggle auto-attack mode |

### Direct GPS Input

```
GPS:1000,500,200   (Set GPS target to coordinates)
```

---

## IGC COMMUNICATION

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_MSL` | Missile → Pad | Telemetry broadcast |
| `UNITY_MSL_CMD` | Pad → Missile | Commands (DETONATE, RESET) |
| `UNITY_PAD_CMD` | Controller → Slaves | Mass commands |
| `UNITY_PAD_STATUS` | All Pads → Controller | Status updates |
| `UNITY_SAT_RELAY` | Satellite ↔ Satellite | Inter-satellite mesh |
| `UNITY_SAT_RELAY_STATUS` | Satellite → Pad | Status with grid position, laser links |
| `UNITY_SAT_INTERCEPT` | Satellite → Pad | Intercept/detonation messages |
| `ENEMY_SIGNAL` | External → Controller | Enemy positions |
| `MINER_BEACON` | UnityBeacon → Pad | Fleet status |
| `UNITY_BOOT_REQ` | Boot → Pad | Boot handshake request |
| `UNITY_BOOT_RSP` | Pad → Boot | Boot handshake response |
| `UNITY_BOOT_ACK` | Pad → Boot | Script running acknowledgment |

---

## TELEMETRY FORMAT

Missile broadcasts telemetry as comma-separated values:
```
X,Y,Z,DTT,Phase,Gravity,DFP,Altitude,Speed,Fuel,GuideState
```

| Field | Description |
|-------|-------------|
| X,Y,Z | Position |
| DTT | Distance to target |
| Phase | Flight phase (CLIMB, ARM, COAST, TARGET, etc.) |
| Gravity | Current gravity strength |
| DFP | Distance from pad |
| Altitude | Sea level altitude |
| Speed | Current velocity |
| Fuel | H2 percentage |
| GuideState | Guidance status |

---

## CONTROLLER MODE

Enable controller mode to command multiple pads from one location:

```
SETPADCONTROL
```

### Controller Features

- View all pad statuses on LCD 1
- Coordinate salvo attacks (sequential launch)
- Execute carpet bomb patterns (spread targets)
- Run KILL ALL auto-attack (continuous until targets destroyed)
- Manage satellite network

### Carpet Bomb Patterns

| Pattern | Description |
|---------|-------------|
| 0 | Line spread |
| 1 | Grid pattern |
| 2 | Circle pattern |

---

## SATELLITE ARRAY MANAGEMENT

UnityPad manages the satellite mesh network including grid positioning and auto-replacement.

### Satellite Grid Tracking

| Variable | Purpose |
|----------|---------|
| `satGridX` | Dictionary mapping satellite ID to grid X coordinate |
| `satGridZ` | Dictionary mapping satellite ID to grid Z coordinate |
| `satGridSpacing` | Distance between satellites (default 5km) |
| `nextGridX`, `nextGridZ` | Next available grid slot |
| `satReplaceQueue` | Queue of positions needing replacement satellites |

### Grid Expansion Algorithm

Satellites deploy in expanding spiral pattern via `AdvanceGridSlot()`:
```
(0,0) → (1,0) → (1,1) → (0,1) → (-1,1) → (-1,0) → (-1,-1) → (0,-1) → (1,-1) → (2,-1)...
```

### Intercept Handling

When satellite detects and intercepts an enemy:

1. **CheckSatIntercept()** - Listens for `UNITY_SAT_INTERCEPT` messages
2. **DETONATE message received** - Parse satellite ID, pad ID, enemy position, grid slot
3. **Queue replacement** - Add detonation position to `satReplaceQueue`
4. **Remove from tracking** - Remove satellite from `kSats`, `sPos`, `satGridX`, `satGridZ`
5. **Auto-launch** - Next SATLAUNCH uses queued position or next grid slot

### SATLAUNCH Command Formats

| Format | Description |
|--------|-------------|
| `SATLAUNCH` | Launch to next available grid slot |
| `SATLAUNCH:{padID}` | Launch from specific pad |
| `SATLAUNCH:{padID}\|{x,y,z}` | Launch to specific world position |
| `SATLAUNCH:{padID}\|GRID\|{gx,gz}` | Launch to specific grid coordinates |

### Missile Config for Satellites

When launching a satellite, UnityPad adds to missile config:
```ini
SatGridX={gridX}
SatGridZ={gridZ}
GridSpacing={satGridSpacing}
InterceptDist=10
```

### IGC Channels for Satellites

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_SAT_RELAY_STATUS` | Satellite → Pad | Status with grid position |
| `UNITY_SAT_INTERCEPT` | Satellite → Pad | Intercept/detonation messages |

---

## MINER BEACON INTEGRATION

Monitors mining ships via MINER_BEACON broadcasts.

**Works with [PAM] Path Auto Miner by Keks** - https://steamcommunity.com/sharedfiles/filedetails/?id=1507646929

### Beacon Data Tracked

| Field | Description |
|-------|-------------|
| name | Ship name |
| bat | Battery percentage |
| crg | Cargo percentage |
| h2 | Hydrogen percentage |
| pos | Position (X,Y,Z) |
| spd | Speed |
| alt | Altitude |
| dist | Distance from pad |
| status | DOCKED, DRILLING, TRAVELING, etc. |
| drills | Drill count and active status |
| docked | Currently docked to pad |

---

## SPRITE-BASED LCD SYSTEM

All LCDs use sprite rendering via `MySpriteDrawFrame`.

### Color Palette

```csharp
cPri = Blue (0,180,255)      // Primary
cSec = Gray (100,100,100)    // Secondary
cAcc = Gold (255,200,0)      // Accent
cOK  = Green (0,255,100)     // Good status
cWrn = Orange (255,180,0)    // Warning
cErr = Red (255,60,60)       // Error
cBg  = Dark (10,10,15)       // Background
cBdr = Border (40,40,50)     // Border
cTxt = Light (220,220,220)   // Text
```

### Sprite Functions

| Function | Purpose |
|----------|---------|
| `BL(surface)` | Begin LCD frame with background |
| `SH(f,y,text,c)` | Draw header with underline |
| `ST(f,x,y,t,c,sz,align)` | Draw text |
| `SB(f,x,y,w,h,pct,fg,bg)` | Draw progress bar |
| `SLB(f,x,y,w,h,lbl,pct,fg,bg)` | Draw labeled bar |
| `SMI(f,y,idx,text,sel)` | Draw menu item |
| `SBx(f,x,y,w,h,bg,bdr)` | Draw box |
| `PctCol(pct)` | Get color from percentage |

---

## MISSILE LIGHTS

UnityPad controls missile lights to indicate status:

| State | Light Color | Behavior |
|-------|-------------|----------|
| PRINT/BUILD | Orange | Blinking |
| FUEL/DOCK | Blue | Pulsing |
| Config Active | Yellow | Pulsing |
| Low Resources | Purple | Pulsing |
| READY | Green | Solid |
| ARM | Red | Blinking (fast near launch) |
| Other | Dim Gray | Solid |

---

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `ClearForBoot()` | Wipe Me.CustomData, write fresh sections with pad_ready |
| `FindSiblingPBs()` | Discover bootPB, invPB by name pattern |
| `IsBootComplete()` | Check bootPB.CustomData for boot_complete=true |
| `SendRunningAck()` | Send PAD_RUNNING acknowledgment after boot |
| `CheckBootRequest()` | Listen for UNITY_BOOT_REQ, call SendBootResponse() |
| `SendBootResponse()` | Send PAD block counts via UNITY_BOOT_RSP |
| `Scan()` | Rescan all blocks |
| `ScanMissile()` | Detect and catalog missile components |
| `UpdateState()` | State machine logic |
| `UpdatePrinter()` | Printer state machine logic |
| `StartPrint()` | Initialize print cycle |
| `StopPrint()` | Stop print cycle, retract pistons |
| `ArmMissile()` | Enable missile systems, start countdown |
| `StartLaunch()` | Disconnect merge, send launch config to missile |
| `CheckTelemetry()` | Process incoming IGC telemetry |
| `BroadcastStatus()` | Broadcast pad status on UNITY_PAD_STATUS |
| `CheckBeacons()` | Process MINER_BEACON broadcasts |
| `ReadInvStats()` | Read inventory data from invPB.CustomData |
| `ParseCustomGPS()` | Read GPS from button panel CustomData |
| `CheckSatIntercept()` | Process UNITY_SAT_INTERCEPT messages |
| `CheckSatStatus()` | Parse satellite status with grid position |
| `ManageSatNetwork()` | Auto-replacement and grid expansion |
| `AdvanceGridSlot()` | Calculate next grid position (spiral) |

---

## BUILD AND DEPLOY

### Build Commands

```powershell
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build "src/scripts/UnityPad" -c Debug
```

### Deploy Location

Script auto-deploys to:
```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityPad\script.cs
```

### Verify Deployment

```powershell
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityPad\script.cs").Length
```

---

## CHARACTER BUDGET

| Metric | Value |
|--------|-------|
| Raw Lines | ~2,300 |
| Deployed | ~96,265 chars |
| Budget | 100,000 chars |
| Status | **CRITICAL (3.7% margin)** |

*Note: Boot code removed in v01.00. Boot functionality moved to Unity Boot.*
*v01.00+: Added satellite array management, intercept handling, and laser mesh coordination.*

---

## MULTI-PAD SETUP

When running multiple launch pads on the same construct, each pad claims a unique ID. The setup system handles block tagging and naming automatically.

### Setup Commands

| Command | Action |
|---------|--------|
| `SETUPMOD` | Auto-claim next available pad ID, tag all blocks with `[PAD{id}]` |
| `SETUPFORCE` | Force re-setup even if blocks are already tagged |
| `NAMEPAD` | Rename all pad blocks with clean standardized names |
| `NAMEMSL` | Rename all missile blocks with clean standardized names |

Setup commands are forwarded to Boot via `UNITY_SETUP_CMD` IGC channel so Boot can update its records.

### Multi-Pad Discovery

`DiscoverSiblingPads()` uses `IsSameConstructAs(Me)` to find all pads on the construct. Controller mode aggregates status from all discovered pads.

### Controller Mode Commands

| Command | Action |
|---------|--------|
| `SETPADCONTROL` | Toggle controller mode on/off |
| `BUILDALL` | Start build on all empty pads |
| `ARMALL` | Arm all missiles in READY state |
| `LAUNCHALL` | Launch all armed missiles |
| `ABORTALL` | Remote detonate all in-flight missiles |

---

## BUTTON SETUP

| Button | Argument |
|--------|----------|
| 1 | UP |
| 2 | DOWN |
| 3 | APPLY |
| 4 | LAUNCH |

---

*Unity AI Lab - Missile Systems Division*
