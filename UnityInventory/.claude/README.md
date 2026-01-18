<![CDATA[# Unity Inventory

![Unity Inventory](../Unity%20Inventory%202.png)

**Inventory Management System for Unity Missile System**

---

## Overview

UnityInventory handles all inventory management, auto-production, container sorting, and miner fleet tracking on a separate PB from UnityPad.

## Key Features

- 5 LCD Displays (4, 5, 6, 9, 10)
- Auto-cycling views on LCD4 (7 views)
- Auto-cycling graphs on LCD6 (7 graphs)
- Container organization with tagged routing
- Production management (components, tools, ammo, bottles)
- Refinery and assembler feeding
- MinerBeacon fleet tracking
- Docked miner ore/ingot transfers

## Boot Dependency

UnityInventory waits for `boot_complete=true` from Unity Boot before taking LCD control.

## Container Tags

| Tag | Purpose |
|-----|---------|
| `-ore` | Ore storage |
| `-ingot` | Ingot storage |
| `-comp` | Component storage |
| `-ammo` | Ammo storage |
| `-tools` | Tool storage |
| `-bottle` | Bottle storage |

## PB Naming

```
[PAD1] Unity Inventory
```

## Character Budget

| Deployed | Limit | Status |
|----------|-------|--------|
| 78,680 | 100,000 | OK (21% margin) |

---

*Unity AI Lab - Inventory Systems Division*
]]>