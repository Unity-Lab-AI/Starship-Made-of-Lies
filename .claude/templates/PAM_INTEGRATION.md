# PAM MINER INTEGRATION

**Last Updated:** 2026-01-24
**Purpose:** Integration guide for [PAM] Path Auto Miner with UnityBeacon

---

## ABOUT PAM

**[PAM] Path Auto Miner** is a fantastic autonomous mining script by **Keks** that handles pathfinding, mining operations, and automated transportation.

**Steam Workshop:** https://steamcommunity.com/sharedfiles/filedetails/?id=1507646929

All credit for PAM goes to **Keks** - we just built the beacon system to track PAM-controlled ships!

---

## WHY USE BOTH?

| Script | Handles | Purpose |
|--------|---------|---------|
| **PAM** | Mining operations | Autopilot, pathfinding, drilling, cargo runs |
| **UnityBeacon** | Status reporting | Broadcasts position, battery, cargo to your base |

**Together:** PAM does the mining, UnityBeacon keeps your command center informed.

---

## SETUP GUIDE

### 1. Install PAM (On Miner)

1. Add Programmable Block for PAM
2. Load PAM script
3. Configure PAM per its documentation
4. Tag blocks with `[PAM]` as needed

### 2. Install UnityBeacon (On Same Miner)

1. Add SECOND Programmable Block for UnityBeacon
2. Load UnityBeacon script
3. Run `SETUP` command to auto-tag required blocks

### 3. Dual-Tag Shared Blocks

For blocks used by both scripts, use dual-tagging:

```
[PAM] [BEACON] Remote Control
[PAM] [BEACON] Connector
```

**Both scripts can read from dual-tagged blocks.**

### 4. Set Home Base

Fly to your base, dock, then run:

```
Arguments: SETHOME
```

This saves the position for distance calculations.

---

## BLOCK REQUIREMENTS

### PAM Blocks (Per PAM Documentation)

| Block | PAM Tag |
|-------|---------|
| Remote Control | `[PAM]` |
| Connector | `[PAM]` |
| Drills | `[PAM]` |
| Cargo | (auto-detected) |

### UnityBeacon Blocks

| Block | Tag | Notes |
|-------|-----|-------|
| Remote Control | `[BEACON]` | Can dual-tag `[PAM] [BEACON]` |
| Antenna | `[BEACON]` | Required for IGC broadcast |
| Connector | `[BEACON]` | Optional - for dock detection |
| LCD | `[BEACON]` | Optional - local status display |

### Dual-Tag Examples

```
[PAM] [BEACON] Remote Control
[PAM] [BEACON] Connector Main
[BEACON] Status LCD
```

---

## HOW IT WORKS

### No Interference

- UnityBeacon only **reads** block states
- Never controls autopilot or mining
- Runs on separate PB from PAM
- Broadcasts independently

### Status Flow

```
+------------------+                    +------------------+
|   YOUR MINER     |     IGC Radio     |   UNITY PAD      |
|------------------|    ==========>    |------------------|
| [PAM] Autopilot  |   MINER_BEACON    | LCD 9: Fleet     |
| [BEACON] Status  |   (every 3 sec)   | LCD 10: Details  |
+------------------+                    +------------------+
```

### Inferred Status

UnityBeacon determines status from block readings:

| Status | Condition | PAM State |
|--------|-----------|-----------|
| DOCKED | Connector locked | At base |
| DRILLING | Drills on, speed < 2 m/s | Mining |
| DRILL_MOVE | Drills on, moving | Repositioning |
| TRAVELING | Speed > 5 m/s | In transit |
| IDLE | Default | Waiting |

---

## LCD DISPLAY AT BASE

### LCD 9: Miner Fleet

```
+--------------------+
| == MINER FLEET ==  |
| Tracked: 3         |
| Docked: 1          |
| Flying: 2          |
|--------------------|
| [Ice Miner] DOCKED |
|  Bat:95% Crg:42%   |
| [Miner 2] DRILLING |
|  Bat:78% @2500m    |
+--------------------+
```

### LCD 10: Miner Details

```
+--------------------+
| == MINER DETAIL == |
| = Ice Miner =      |
| Status: DOCKED     |
| Bat: [=========]95%|
| Crg: [====     ]42%|
| H2:  [=======  ]68%|
| Docked @Port1      |
+--------------------+
```

---

## TROUBLESHOOTING

### Miner Not Showing on LCD

1. Check antenna is tagged `[BEACON]`
2. Check antenna range (50km default)
3. Verify UnityBeacon script is running
4. Check pad has LCD 9 and 10 tagged

### PAM Stops Working

1. Check PAM PB is separate from UnityBeacon PB
2. UnityBeacon never modifies PAM blocks
3. Verify PAM tags are correct per PAM docs

### Status Shows IDLE When Mining

1. Check drills are tagged for PAM correctly
2. UnityBeacon reads drill state from grid
3. Verify drills are actually enabled

---

## BOOT DETECTION

Unity Boot can detect miners during startup (Check #19):

- Listens for `MINER_BEACON` broadcasts
- Counts detected miners
- Stores miner names
- Optional check - boot succeeds without miners

---

## COMMANDS

### UnityBeacon Commands (Run on Miner PB)

| Command | Action |
|---------|--------|
| `SETUP` | Auto-tag first RC, Antenna, Connector, LCD |
| `SETHOME` | Save current position as home base |
| `RESCAN` | Re-scan for tagged blocks |
| `RESET` | Clear all config |

### From Base (Pad Commands)

No direct commands - UnityBeacon is read-only. Monitor fleet on LCD 9/10.

---

## CUSTOMDATA (On Miner PB)

```ini
[MINER_BEACON]
ShipName=Ice Miner
Channel=MINER_BEACON
BlockTag=[BEACON]
PadID=1
HomeGPS=1000,500,200
```

| Field | Description |
|-------|-------------|
| ShipName | Display name on pad LCDs |
| Channel | IGC channel (default: MINER_BEACON) |
| BlockTag | Tag to search for (default: [BEACON]) |
| PadID | Pad to associate with (optional) |
| HomeGPS | Home position for distance calc |

---

## CREDITS

**[PAM] Path Auto Miner** by **Keks**
- Steam Workshop: https://steamcommunity.com/sharedfiles/filedetails/?id=1507646929
- Handles autopilot, pathfinding, mining, cargo runs
- All credit for PAM goes to Keks

**UnityBeacon** by Unity AI Lab
- Status broadcasting to command center
- Fleet tracking on launch pad displays
- Designed to complement PAM, not replace it

---

*Unity AI Lab - Mining Division*
*"PAM does the work, Beacon tells you about it."*
