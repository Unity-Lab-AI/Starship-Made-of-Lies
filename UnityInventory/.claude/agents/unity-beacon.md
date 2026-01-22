# UnityBeacon - Fleet Tracker

Reference documentation for UnityBeacon when working on other Unity Missile System scripts.

---

## OVERVIEW

**Script:** `UnityBeacon.cs`
**PB Name:** `[BEACON] Unity Beacon`
**Deployed:** `%APPDATA%\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs`
**Characters:** 14,658 (85% margin)

IGC beacon for mining ships. Broadcasts status to UnityPad/UnityInventory for fleet tracking.

**PAM Compatible:** Works alongside [PAM] Path Auto Miner by Keks

---

## CUSTOMDATA (Me.CustomData)

UnityBeacon runs on MINER ships, separate from pad PBs:

```ini
[BEACON]
ShipName=Miner1
HomeX=1000
HomeY=500
HomeZ=200
```

---

## IGC CHANNELS

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `MINER_BEACON` | OUT | Broadcasts status every 3 seconds |

### Broadcast Format
```
MB|EntityId|ShipName|Bat%|Cargo%|H2%|X,Y,Z|Speed|Alt|DistHome|Status|DrillCount|DrillsOn|GrinderCount|GrindersOn|Docked
```

---

## STATUS INFERENCE

| Status | Condition |
|--------|-----------|
| DOCKED | Connector locked |
| DRILLING | Drills on, speed < 2 m/s |
| DRILL_MOVE | Drills on, moving |
| GRINDING | Grinders on |
| TRAVELING | Speed > 5 m/s |
| HOME | At home position |
| IDLE | Default |

---

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `Scan()` | Find blocks tagged [BEACON] |
| `Broadcast()` | Send IGC status |
| `InferStatus()` | Determine ship state |
| `UpdateLCD()` | Sprite-based display |
| `AutoName()` | SETUP - auto-tag blocks |

---

## COMMANDS

| Command | Action |
|---------|--------|
| `SETUP` | Auto-tag RC, Antenna, Connector, LCD |
| `SETHOME` | Save current position as home |
| `RESCAN` | Re-scan for tagged blocks |
| `RESET` | Clear all config |

---

## BLOCK TAGS

| Tag | Purpose |
|-----|---------|
| `[BEACON]` | Blocks used by UnityBeacon |

---

## RECEIVERS

UnityBeacon broadcasts are received by:
- **Unity Boot** - Check 19 (Beacon Detection)
- **UnityPad** - Miner fleet tracking
- **UnityInventory** - LCDs 9, 10 (Miner Fleet display)

---

## CHARACTER COUNT

```powershell
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs").Length
```

---

*Unity AI Lab - Mining Division*
