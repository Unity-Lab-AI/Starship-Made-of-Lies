<![CDATA[# Unity Missile

![Unity Missile](../Unity%20Missile%202.png)

**Guided Missile Flight Controller for Unity Missile System**

---

## Overview

UnityMissile handles all in-flight guidance, targeting, and detonation. Supports multiple flight profiles and targeting modes.

## Key Features

- Multiple flight phases: IDLE → CLIMB → ARM → COAST → REENTRY → TARGET → DETONATE
- Satellite deployment mode: SAT_CLIMB → SAT_BRAKE → SAT_HOLD
- 6 targeting modes: GPS, ANTENNA, SENSOR, LIDAR, MANUAL, SATELLITE
- ICBM ballistic profile support
- Real-time telemetry broadcast
- Remote detonation capability
- Blackout zone handling

## Targeting Modes

| Mode | Description |
|------|-------------|
| GPS | Navigate to fixed coordinates |
| ANTENNA | Track broadcasting antenna |
| SENSOR | Proximity detection |
| LIDAR | Camera raycast lock |
| MANUAL | Remote guided |
| SATELLITE | Orbital platform |

## PB Naming

```
PAD1 Missile #1 Program
```

## Character Budget

| Deployed | Limit | Status |
|----------|-------|--------|
| 24,321 | 100,000 | OK (76% margin) |

---

*Unity AI Lab - Missile Systems Division*
]]>