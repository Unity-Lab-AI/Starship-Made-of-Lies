<![CDATA[# Unity Pad

![Unity Pad](../Unity%20Pad%202.png)

**Launch Pad Controller for Unity Missile System**

---

## Overview

UnityPad is the launch pad controller handling all pre-launch operations including menus, targeting, printing, fueling, and launch sequencing.

## Key Features

- 5 LCD Displays (1, 2, 3, 7, 8)
- Full state machine: INIT → IDLE → PRINT → BUILD → DOCK → FUEL → READY → ARM → LAUNCH → GONE
- Printer integration for auto-building missiles
- Multi-pad controller mode
- Salvo and carpet bombing
- MinerBeacon fleet tracking
- Auto-setup with SETUPMOD command

## Boot Dependency

UnityPad waits for `boot_complete=true` from Unity Boot before taking LCD control.

## PB Naming

```
[PAD1] Unity Pad
```

## Character Budget

| Deployed | Limit | Status |
|----------|-------|--------|
| 91,863 | 100,000 | OK (8.1% margin) |

---

*Unity AI Lab - Missile Systems Division*
]]>