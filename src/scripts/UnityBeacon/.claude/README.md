# Unity Beacon

![Unity Beacon](../Unity%20Beacon%202.png)

**Fleet Status Broadcaster for Unity Missile System**

---

## Overview

UnityBeacon runs on mining ships and broadcasts status updates to UnityPad/UnityInventory for fleet tracking on LCDs 9 and 10.

## Key Features

- Broadcasts every 3 seconds on `MINER_BEACON` channel
- Sprite-based LCD display on ship
- Auto-status inference (DOCKED, DRILLING, TRAVELING, etc.)
- Home position tracking
- PAM miner compatibility

## Broadcast Data

- Ship name and entity ID
- Battery, cargo, H2 percentages
- Position, speed, altitude
- Distance from home
- Drill/grinder counts and states
- Current status

## Status Types

| Status | Condition |
|--------|-----------|
| DOCKED | Connector locked |
| DRILLING | Drills on, speed < 2 m/s |
| DRILL_MOVE | Drills on, moving |
| GRINDING | Grinders on, speed < 2 m/s |
| TRAVELING | Speed > 5 m/s |
| HOME | At home position |
| IDLE | Default |

## PB Naming

```
[BEACON] Unity Beacon
```

## Character Budget

| Deployed | Limit | Status |
|----------|-------|--------|
| 16,600 | 100,000 | OK (83% margin) |

---

*Unity AI Lab - Mining Division*
