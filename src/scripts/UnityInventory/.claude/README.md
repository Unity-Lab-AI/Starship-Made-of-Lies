# Unity Inventory

![Unity Inventory](../Unity%20Inventory%202.png)

**Inventory Management System for Unity Missile System**

---

## Overview

UnityInventory handles all inventory management, auto-production, container sorting, and miner fleet tracking on a separate PB from UnityPad.

## Key Features

- 6 LCD Displays (4, 5, 6, 9, 10, 11)
- LCD 11: Wide screen personal items (tools, weapons, ammo, bottles)
- Auto-cycling views on LCD4 (7 views)
- Auto-cycling graphs on LCD6 (7 graphs)
- Container organization with tagged routing
- Production management (components, tools, ammo, bottles)
- Refinery and assembler feeding
- MinerBeacon fleet tracking
- Docked miner ore/ingot transfers
- Friendly item names on LCD 11 (FN function)

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
| 99,582 | 100,000 | CRITICAL (0.4% margin) |

---

*Unity AI Lab - Inventory Systems Division*
