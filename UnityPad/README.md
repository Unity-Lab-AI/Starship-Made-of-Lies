# UNITY PAD v01.00

**Modular Launch Pad Controller | Sprite-Based LCD System | MinerBeacon Integration | Storage Management | Full Automation**

---

## FEATURES

- **10 LCD Display System** - Full status on all systems
- **Modular Multi-Pad** - PAD1, PAD2, PAD3... on same grid
- **Auto-Setup (SETUPMOD)** - One command configures everything
- **Printer System** - Auto-build missiles with pistons/welders
- **Controller Mode** - Command all pads from one location
- **Carpet Bomb** - Spread targets across multiple missiles
- **KILL ALL** - Auto-attack until all enemies destroyed
- **Satellite Relay** - Deploy communication satellites
- **MinerBeacon Integration** - Monitor mining ships on LCD9/LCD10
- **Storage Management** - Auto-organize items from small to large containers

---

## QUICK START

1. Build launch pad with merge block, connector, 10 LCDs, button panel
2. Add Programmable Block with UnityPad.cs script
3. Run command: `SETUPMOD`
4. All blocks auto-tagged: `[PAD1]`, `[PAD1:1-10]`, `[PAD1-PRINT]`
5. Done!

---

## SETUPMOD - Auto Configuration

Run `SETUPMOD` to automatically:

| Action | Result |
|--------|--------|
| Claim pad ID | PAD1, PAD2, PAD3... |
| Tag merge block | `[PAD1] Merge Block` |
| Tag connector | `[PAD1] Connector` |
| Tag 10 LCDs | `[PAD1:1]` through `[PAD1:10]` |
| Tag button panel | `[PAD1] Button Panel` |
| Tag batteries | `[PAD1] Battery` |
| Tag tanks | `[PAD1] H2 Tank`, `[PAD1] O2 Tank` |
| Tag cargo | `[PAD1] Large Cargo` |
| Tag assemblers | `[PAD1] Assembler` |
| Tag refineries | `[PAD1] Refinery` |
| Tag antennas | `[PAD1] Antenna` |
| Tag pistons | `[PAD1-PRINT] Piston 1`, `Piston 2`... |
| Tag welders | `[PAD1-PRINT] Welder 1`, `Welder 2`... |
| Tag projector | `[PAD1-PRINT] Projector` |
| Name docked missile | `Missile #1 [BlockType]` |
| Tag missile connectors | `[DOCK]` and `[AMMO]` |

**Subgrid Support:** SETUPMOD finds blocks on piston heads and other subgrids within 50m.

**ORE Connectors:** Connectors with "ORE" in the name are excluded from fuel connector selection.

---

## STATE MACHINE

```
INIT → IDLE → PRINT → BUILD → DOCK → FUEL → READY → ARM → LAUNCH → GONE
                ^                                                    |
                |____________________________________________________| (auto-reset)
```

| State | Description |
|-------|-------------|
| INIT | Scanning, detecting environment |
| IDLE | Waiting for missile or print command |
| PRINT | Running print cycle (pistons/welders) |
| BUILD | Monitoring build progress |
| DOCK | Missile detected, configuring |
| FUEL | Filling H2, charging batteries, loading ice |
| READY | Fully fueled, awaiting ARM command |
| ARM | Armed with countdown, awaiting LAUNCH |
| LAUNCH | Disconnecting, firing missile |
| GONE | Tracking in-flight missile |

---

## STORAGE MANAGEMENT SYSTEM

Automatic item organization from small containers to large containers.

### Container Classification
- **Large**: SubtypeId contains "Large" → `padCargoL`
- **Medium**: SubtypeId contains "Medium" → `padCargoM`
- **Small**: All others → `padCargoS`

### Auto-Organization
- Enabled by default (`autoOrg=true`)
- Runs every 6 ticks
- Moves items from smallest to largest available container
- Only transfers if destination is <95% full

### Storage Commands

| Command | Action |
|---------|--------|
| `ORGANIZE` | Force immediate organization pass |
| `AUTOORG` | Toggle auto-organization on/off |

### LCD Display
- **LCD4** (no missile): Shows `Cargo: L:X M:X S:X` with fill bar
- **LCD10** (no miners): Shows inventory totals (ore/ingot/component)

---

## PRINTER SYSTEM

### Auto-Named Blocks
- `[PAD1-PRINT] Piston 1`, `Piston 2`, `Piston 3`...
- `[PAD1-PRINT] Welder 1`, `Welder 2`, `Welder 3`...
- `[PAD1-PRINT] Projector`

### Print Cycle
```
START → RETRACT → EXTEND → WELD (slow retract) → CHECK → REPEAT/DONE
```

| State | Action |
|-------|--------|
| 0 | Fast retract (-2 m/s) to start position |
| 1 | Extend pistons (0.5 m/s) |
| 2 | Welders ON, slow retract (-0.04 m/s) |
| Check | If blocks remain, back to state 1 |
| Done | Projector empty, stop |

---

## 10 LCD DISPLAYS

| LCD | Name | Content |
|-----|------|---------|
| 1 | CONTROL | Main menu, settings, navigation |
| 2 | BUILD | Projector progress, components, production status |
| 3 | MISSILE | Systems, thrusters, batteries, warheads |
| 4 | FUEL/RESOURCES | Power/H2/Ice bars, ammo, container breakdown |
| 5 | POWER | Battery stats, graphs, time estimates |
| 6 | PAD INFO | Cycling line graphs (Power%, H2%, O2%, In, Out) |
| 7 | TELEMETRY | Flight tracking, position, velocity |
| 8 | GPS/SAT | Targeting mode, waypoints, satellite network |
| 9 | MINER FLEET | Overview of all MinerBeacon-tracked ships |
| 10 | MINER DETAIL / STORAGE | Miner details OR storage inventory |

---

## COMMANDS

| Command | Action |
|---------|--------|
| `UP` | Menu up |
| `DOWN` | Menu down |
| `APPLY` | Select/confirm |
| `LAUNCH` | Launch / Remote detonate |
| `PRINT` | Start/stop printer |
| `SETUPMOD` | Auto-configure pad module |
| `NAMEMSL` | Rename missile blocks |
| `NAMEPAD` | Rename pad blocks |
| `SETPADCONTROL` | Toggle controller mode |
| `CARPET` | Start carpet bomb |
| `KILLALL` | Toggle auto-attack |
| `ORGANIZE` | Force storage organization |
| `AUTOORG` | Toggle auto-organization |
| `GPS:X,Y,Z` | Set target coordinates |

---

## CONTROLLER MODE

Make one pad the command center:

```
SETPADCONTROL
```

Controller can:
- See all pad statuses
- Issue mass commands (BUILD ALL, ARM ALL, LAUNCH ALL)
- Coordinate salvo attacks
- Execute carpet bomb patterns
- Run KILL ALL auto-attack

---

## IGC CHANNELS

| Channel | Purpose |
|---------|---------|
| `UNITY_MSL` | Missile telemetry |
| `UNITY_MSL_CMD` | Missile commands |
| `UNITY_PAD_CMD` | Pad-to-pad commands |
| `UNITY_PAD_STATUS` | Pad status broadcast |
| `UNITY_SAT_RELAY` | Satellite relay network |
| `ENEMY_SIGNAL` | Enemy detection (auto-attack) |
| `MINER_BEACON` | MinerBeacon ship status |

---

## MINERBEACON INTEGRATION

The pad monitors mining ships via MinerBeacon broadcasts on LCD9/LCD10.

### Setup
1. Build ORE connectors on pad (name contains "ORE")
2. Install MinerBeacon script on each miner (separate project)
3. Tag miner blocks with `[BEACON]`
4. Add LCD9 `[PAD1:9]` and LCD10 `[PAD1:10]` to pad
5. Miners auto-appear when broadcasting

### LCD9 - Miner Fleet
- Miner name, status, battery %, cargo %
- Distance from pad

### LCD10 - Miner Detail
- Full progress bars (Battery, Cargo, H2)
- Speed, altitude, distance
- Drill count and status

---

## BUTTON SETUP

| Button | Argument |
|--------|----------|
| 1 | UP |
| 2 | DOWN |
| 3 | APPLY |
| 4 | LAUNCH |

---

## CHARACTER BUDGET

| Metric | Value |
|--------|-------|
| Raw Source | ~121,000 chars |
| Deployed | 88,003 chars |
| Budget | 100,000 chars |
| Status | OK (12% margin) |

---

## BUILD COMMAND

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityPad -c Debug
```

Deploys to: `%APPDATA%\SpaceEngineers\IngameScripts\local\UnityPad\script.cs`

---

## SPRITE-BASED LCD SYSTEM

All LCDs use modern sprite rendering via `MySpriteDrawFrame`:

### Sprite Functions
- `BL(surface)` - Begin LCD frame with background
- `SH(f,y,text,c)` - Draw header with underline
- `ST(f,x,y,t,c)` - Draw text
- `SB(f,x,y,w,h,pct,fg,bg)` - Draw progress bar
- `SLB(f,x,y,w,h,lbl,pct,fg,bg)` - Draw labeled bar
- `SMI(f,y,idx,text,sel)` - Draw menu item
- `SBx(f,x,y,w,h,bg,bdr)` - Draw box
- `PctCol(pct)` - Get color from percentage

### Color Palette
- Primary (Blue), Secondary (Gray), Accent (Gold)
- OK (Green), Warning (Orange), Error (Red)
- Background (Dark), Border, Text (Light)

---

*Unity AI Lab - Missile Systems Division*
*Version v01.00 | 2026-01-17*
