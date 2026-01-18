<![CDATA[# Unity Boot

![Unity Boot](../Unity%20Boot%202.png)

**Centralized Boot Controller for Unity Missile System**

---

## Overview

Unity Boot is the dedicated boot controller that initializes all 10 LCD displays and runs 40 system checks before handing off control to UnityPad and UnityInventory.

## Key Features

- Controls ALL 10 LCDs during startup
- Runs 40 system checks (20 Pad + 20 Inventory)
- Sprite-based animated boot screen
- Error handling with 5-second pause and retry
- Self-disables after boot completion
- Handshake via `boot_complete=true` in CustomData

## PB Naming

```
[PAD1-BOOT] UNITY BOOT
```

## Boot Flow

1. Unity Boot starts and clears boot_complete
2. Takes control of all 10 LCDs
3. Runs 40 checks sequentially
4. On success: sets `boot_complete=true`
5. Self-disables (UpdateFrequency.None)
6. UnityPad takes LCDs 1,2,3,7,8
7. UnityInventory takes LCDs 4,5,6,9,10

## Character Budget

| Deployed | Limit | Status |
|----------|-------|--------|
| 12,697 | 100,000 | OK (87% margin) |

---

*Unity AI Lab - Boot Systems Division*
]]>