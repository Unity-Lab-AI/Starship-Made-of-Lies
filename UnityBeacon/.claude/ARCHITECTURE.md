# UnityBeacon - Architecture Reference

*Last Updated: 2026-01-20*
*Unity AI Lab - Mining Division*

---

## Overview

Fleet status broadcaster for mining ships. Broadcasts ship status to UnityPad/UnityInventory for fleet tracking. Designed to work alongside [PAM] Path Auto Miner by Keks.

**Character Budget:** 15,488 deployed / 100,000 limit (85% margin)

---

## Broadcast System

### IGC Channel

`MINER_BEACON` - Broadcasts every 3 seconds (100 ticks)

### Broadcast Format

```
MB|EntityId|ShipName|Bat%|Cargo%|H2%|X,Y,Z|Speed|Alt|DistHome|Status|DrillCount|DrillsOn|GrinderCount|GrindersOn|Docked
```

**Example:**
```
MB|123456789|Miner1|85|42|68|1000,500,200|5|150|2500|DRILLING|4|4|0|0|0
```

### Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| MB | string | Message type identifier |
| EntityId | long | Ship's unique entity ID |
| ShipName | string | Ship display name |
| Bat% | int | Battery percentage (0-100) |
| Cargo% | int | Cargo fill percentage |
| H2% | int | Hydrogen tank percentage |
| X,Y,Z | double | World position |
| Speed | double | Velocity in m/s |
| Alt | double | Altitude above terrain |
| DistHome | double | Distance from home position |
| Status | string | Inferred ship status |
| DrillCount | int | Total drills on ship |
| DrillsOn | int | Active drills |
| GrinderCount | int | Total grinders on ship |
| GrindersOn | int | Active grinders |
| Docked | int | 1 if connector locked, 0 otherwise |

---

## Status Inference

| Status | Condition |
|--------|-----------|
| DOCKED | Connector locked |
| DRILLING | Drills on, speed < 2 m/s |
| DRILL_MOVE | Drills on, speed >= 2 m/s |
| GRINDING | Grinders on, speed < 2 m/s |
| GRIND_MOVE | Grinders on, speed >= 2 m/s |
| DEPARTING | Speed > 5 m/s, near home (<500m) |
| TRAVELING | Speed > 5 m/s |
| HOME | At home position (<100m), idle |
| IDLE | Default state |

---

## Block Detection

### Block Tags

| Tag | Purpose |
|-----|---------|
| `[BEACON]` | Marks blocks for UnityBeacon |

### Detected Blocks

| Block Type | Variable | Purpose |
|------------|----------|---------|
| Remote Control | `rc` | Position, speed, altitude |
| Batteries | `bats` | Power percentage |
| Cargo Containers | `cargos` | Cargo fill level |
| H2 Tanks | `h2Tanks` | Hydrogen percentage |
| Connectors | `cons` | Docked status |
| Drills | `drills` | Drill count/state |
| Grinders | `grinders` | Grinder count/state |
| Text Panel | `lcd` | Local status display |
| Antenna | `ant` | Broadcast range |

---

## Commands

| Command | Action |
|---------|--------|
| `SETUP` | Auto-tag first RC, Antenna, Connector, LCD with [BEACON] |
| `SETHOME` | Save current position as home base |
| `RESCAN` | Re-scan for tagged blocks |
| `RESET` | Clear all config, reset to defaults |

---

## CustomData (Local PB Only)

UnityBeacon uses its OWN PB's CustomData on the miner ship.

```ini
[BEACON]
ShipName=Miner1
HomeX=1000
HomeY=500
HomeZ=200
```

---

## LCD Display

### Local Ship LCD

Shows ship status locally with sprite-based rendering:
- Ship name header
- Battery, Cargo, H2 progress bars
- Position and distance info
- Current status

### Sprite Functions

| Function | Purpose |
|----------|---------|
| `BL(surface)` | Begin LCD frame with dark background |
| `SH(f,y,text,c)` | Draw header with underline |
| `ST(f,x,y,t,c,sz,align)` | Draw text |
| `SB(f,x,y,w,h,pct,fg,bg)` | Draw progress bar |
| `SLB(f,x,y,w,h,lbl,pct,fg,bg)` | Draw labeled bar |
| `SD(f,y)` | Draw horizontal divider |
| `PctCol(pct)` | Get color from percentage |

---

## Color Palette

```csharp
cPri = Blue (0,180,255)      // Primary
cSec = Gray (100,100,100)    // Secondary
cAcc = Gold (255,200,0)      // Accent/Ship name
cOK  = Green (0,255,100)     // Good (>70%)
cWrn = Orange (255,180,0)    // Warning (30-70%)
cErr = Red (255,60,60)       // Critical (<30%)
cBg  = Dark (10,10,15)       // Background
cBdr = Border (40,40,50)     // Border
cTxt = Light (220,220,220)   // Text
```

---

## PAM Compatibility

UnityBeacon is designed to work seamlessly with [PAM] Path Auto Miner by Keks:

**Steam Workshop:** https://steamcommunity.com/sharedfiles/filedetails/?id=1507646929

### Dual-Tagging

Blocks can have both tags: `[PAM] [BEACON] Block Name`

- PAM handles autopilot and mining operations
- UnityBeacon handles status reporting
- No interference between the two systems

---

## Key Functions

| Function | Purpose |
|----------|---------|
| `Main()` | Main tick, broadcast and LCD update |
| `Scan()` | Find blocks tagged with [BEACON] |
| `Broadcast()` | Send IGC message with ship status |
| `InferStatus()` | Determine ship state from block readings |
| `UpdateLCD()` | Display sprite-based status on ship LCD |
| `AutoName()` | SETUP command implementation |
| `ParseConfig()` | Read settings from CustomData |
| `SaveConfig()` | Save settings to CustomData |
| `Reset()` | Clear config, reset defaults |

---

*Unity AI Lab - Mining Division*
