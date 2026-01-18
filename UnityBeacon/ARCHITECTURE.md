# MinerBeacon - System Architecture

**Version:** v01.00
**Generated:** 2026-01-14
**Location:** Unity Missile System/UnityBeacon/
**Integration:** Unity Missile System (UnityPad.cs)

---

## Overview

MinerBeacon is a lightweight IGC broadcaster for mining ships that integrates with the Unity Missile System. It broadcasts ship status via Inter-Grid Communication, allowing the UnityPad to track mining fleet status whether ships are docked or flying.

---

## Component Diagram

```
+------------------+       IGC        +------------------+
|   MINER SHIP     |  MINER_BEACON   |   UNITY PAD      |
|------------------|   =========>    |------------------|
| MinerBeacon.cs   |                 | UnityPad.cs      |
| - Remote Control |                 | - beaconListener |
| - Antenna        |                 | - trackedMiners  |
| - Connector      |                 | - LCD 9-10       |
+------------------+                 +------------------+
        |                                    |
        | Block Reads                        | Correlation
        v                                    v
   Ship Sensors                        Docked Ships
   - Batteries                         (Connector match)
   - Cargo
   - Drills
   - H2 Tanks
```

---

## Data Flow

```
1. MinerBeacon.cs runs on miner (Update100 ~3 sec)
   |
   v
2. Scan() finds [BEACON] tagged blocks
   |
   v
3. Broadcast() reads ship state:
   - Battery % from all batteries
   - Cargo % from all cargo containers
   - H2 % from hydrogen tanks
   - Drill count and on/off state
   - Speed, altitude, distance from home
   |
   v
4. InferStatus() determines ship state:
   DOCKED | DRILLING | TRAVELING | IDLE | etc.
   |
   v
5. IGC.SendBroadcastMessage("MINER_BEACON", data)
   |
   v
6. UnityPad.CheckBeacons() receives broadcast
   |
   v
7. Parse into MinerData dictionary by EntityId
   |
   v
8. CorrelateDockedMiners() matches docked ships
   |
   v
9. LCD 9-10 display fleet status
```

---

## Broadcast Message Format

```
MB|EntityId|ShipName|Bat%|Cargo%|H2%|X,Y,Z|Speed|Alt|DistHome|Status|DrillCount|DrillsOn|GrinderCount|GrindersOn|Docked

Example:
MB|123456789|Ice Miner|78|42|95|1000,2000,3000|5|150|2500|DRILLING|4|4|0|0|0
```

| Field | Type | Description |
|-------|------|-------------|
| MB | string | Message identifier |
| EntityId | long | Grid EntityId for correlation |
| ShipName | string | User-configured name |
| Bat% | float | Battery percentage |
| Cargo% | float | Cargo fill percentage |
| H2% | float | Hydrogen tank percentage |
| X,Y,Z | double | World position |
| Speed | double | Ship velocity m/s |
| Alt | double | Planet elevation |
| DistHome | double | Distance from home position |
| Status | string | Inferred status |
| DrillCount | int | Total drills |
| DrillsOn | int | Active drills |
| GrinderCount | int | Total grinders |
| GrindersOn | int | Active grinders |
| Docked | 0/1 | Connector locked |

---

## Status Inference Logic

```csharp
string InferStatus(bool docked, int drlOn, int grndOn, double spd, double dist) {
    if (docked) return "DOCKED";
    if (drlOn > 0 && spd < 2) return "DRILLING";
    if (drlOn > 0) return "DRILL_MOVE";
    if (grndOn > 0 && spd < 2) return "GRINDING";
    if (grndOn > 0) return "GRIND_MOVE";
    if (spd > 5 && dist < 500) return "DEPARTING";
    if (spd > 5) return "TRAVELING";
    if (spd < 2 && dist < 100) return "HOME";
    return "IDLE";
}
```

---

## Block Detection

MinerBeacon uses a tag-based system for required blocks:

| Tag | Block Types | Required |
|-----|-------------|----------|
| `[BEACON]` | Remote Control | YES |
| `[BEACON]` | Antenna | YES |
| `[BEACON]` | Connector | Optional |
| `[BEACON]` | LCD Panel | Optional |

**All other blocks** (batteries, cargo, drills, H2 tanks) are detected automatically on the same grid without tags.

---

## Integration with UnityPad

### New Variables Added to UnityPad.cs

```csharp
IMyBroadcastListener beaconListener;
string beaconTag = "MINER_BEACON";
Dictionary<long, MinerData> trackedMiners = new Dictionary<long, MinerData>();

class MinerData {
    public string name;
    public float bat, crg, h2;
    public Vector3D pos;
    public double spd, alt, dist;
    public string status;
    public int drills, drillsOn;
    public bool docked;
    public DateTime lastSeen;
    public int portNum;
}
```

### New Functions in UnityPad.cs

| Function | Purpose |
|----------|---------|
| `CheckBeacons()` | Process incoming beacon broadcasts |
| `CorrelateDockedMiners()` | Match docked ships with beacon data by EntityId |
| `CleanStaleMiners()` | Remove miners with no signal for 120+ seconds |
| `PullOreFromMiners()` | Auto-pull ore from docked miners to pad storage |

### LCD Integration

| LCD | Display |
|-----|---------|
| LCD 9 | Fleet overview - tracked count, status summary |
| LCD 10 | Detailed miner info - bars, stats per ship |

---

## PAM Compatibility

MinerBeacon runs alongside PAM Miner without interference:

1. **Separate PB** - MinerBeacon runs in its own Programmable Block
2. **Dual-tagging** - Blocks can have both `[PAM]` and `[BEACON]` tags
3. **Read-only** - MinerBeacon only READS block states, never controls
4. **No conflicts** - Doesn't touch PAM's Remote Control orientation or autopilot

---

## Configuration

Via PB CustomData:

```ini
[MINER_BEACON]
ShipName=Ice Miner
Channel=MINER_BEACON
BlockTag=[BEACON]
HomeGPS=0,0,0
```

---

## Commands

| Command | Action |
|---------|--------|
| SETUP | Auto-name first available blocks with [BEACON] |
| SETHOME | Save current position as home base |
| RESCAN | Re-scan for tagged blocks |

---

## Character Budget

| File | Size | Limit | Status |
|------|------|-------|--------|
| MinerBeacon.cs | 7,915 | 100,000 | 92,085 remaining |

---

## Dependencies

- Space Engineers Programmable Block API
- IGC (Inter-Grid Communication)
- No external mods required
- Works with PAM Miner (2019 Steam Workshop)

---

*Unity AI Lab - Mining Division*
