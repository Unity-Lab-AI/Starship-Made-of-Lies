<![CDATA[# Unity Boot

![Unity Boot](../Unity%20Boot%202.png)

**Centralized Boot Controller for Unity Missile System**

---

## Overview

Unity Boot is the dedicated boot controller that initializes all 11 LCD displays and runs 23 system checks with real PB-to-PB IGC handshaking before handing off control to UnityPad and UnityInventory.

## Key Features

- Controls ALL 11 LCDs during startup
- Runs 23 unified system checks with IGC handshaking
- Pre-boot ready sync (waits for pad_ready and inv_ready flags)
- Miner fleet detection via MINER_BEACON broadcasts
- Sprite-based animated boot screen
- Error handling with 5-second pause and retry
- Self-disables after boot completion
- Handshake via `boot_complete=true` in CustomData

## PB Naming

```
[PAD1] UNITY BOOT
```

## Boot Flow

1. Scripts compile in any order (CustomData preserved)
2. Unity Boot waits for pad_ready and inv_ready flags
3. Takes control of all 11 LCDs
4. Runs 23 checks with IGC handshaking
5. Detects miner fleet via MINER_BEACON
6. On success: sets `boot_complete=true`
7. Self-disables (UpdateFrequency.None)
8. UnityPad takes LCDs 1,2,3,7,8
9. UnityInventory takes LCDs 4,5,6,9,10,11

## Character Budget

| Deployed | Limit | Status |
|----------|-------|--------|
| 15,050 | 100,000 | OK (85% margin) |

---

*Unity AI Lab - Boot Systems Division*
]]>