# UnityInventory - Completed Tasks Archive

**DO NOT DELETE THIS FILE - Permanent record of all completed work**
**Location:** `Unity Missile System/src/scripts/UnityInventory/`

---

## 2026-01-17 - Initial UnityInventory Creation

### Script Extraction
- [x] Extracted inventory management from UnityPad.cs
- [x] Created UnityInventory.cs as standalone script
- [x] Created MDK project structure
- [x] Implemented button panel CustomData communication

### LCD Display System
- [x] Sprite-based rendering for LCDs 4, 5, 6, 9, 10
- [x] Auto-cycling views (7 views, 5 sec each)
- [x] Graph system with 7 graph types
- [x] Color-coded progress bars

### Inventory Features
- [x] Container routing by tag (-ore, -ingot, -comp, etc.)
- [x] Refinery/assembler feeding
- [x] Component auto-production
- [x] Tool/weapon/ammo crafting
- [x] Bottle production and sorting

---

## 2026-01-18 - Graph Fixes & Production Debug

### Graph System Overhaul
- [x] Graphs now track ACTUAL VALUES instead of percentages
- [x] Y-axis auto-scales to data range (MWh, kg, liters)
- [x] Auto-scaling algorithm with clean number rounding
- [x] Graph height increased to 280px (reduced dead space)
- [x] All 12 graph types updated

### Tool/Weapon/Ammo Production Fix
- [x] **Root Cause:** tStk wasn't counting from cargo containers
- [x] Added counting from toolCargo AND all padCargo
- [x] Same fix for pAmmoStk (personal ammo)
- [x] Production now correctly tracks and queues

### Bottle Sorting Fix
- [x] Bottles now transfer from assembler outputs to bottleCargo
- [x] Added GasContainerObject detection
- [x] Bottles route from any cargo to bottleCargo
- [x] If bottleCargo full, sends to generators for filling
- [x] Fixed syntax error (extra closing brace)

### Production LCD Info
- [x] Added current refinery ore processing display
- [x] Added current assembler production items

### Echo Cleanup
- [x] Removed NoBP debug Echo statements
- [x] Removed H2:NoBP!, O2:NoBP! messages

### Build Status
- [x] Deployed: 76,656 chars (23% margin under 100k)

---

## 2026-01-21 - Ammo Classification & Quota Consistency Fix

### Queue Classification Fix (Pistol Ammo Double-Listing)
- [x] Added `SPP()` helper - strips position prefix from blueprint names
- [x] Changed queue classification from `Contains()` to exact-match
- [x] `SemiAutoPistolMagazine` no longer incorrectly matches `SemiAutoPistol` weapon
- [x] LCD 11 WEAPONS column now shows only actual weapon counts

### Personal Ammo Quota Consistency
- [x] Removed 4x hardcoded `idx==4` special cases
- [x] All personal ammo now uses `paNd` dictionary consistently for targets
- [x] Fixed in: RecycleExcess() (2 places), WriteBtnData(), UpdateLCD11()
- [x] S-10 pistol ammo no longer has inconsistent 50k hardcoded target

### ammoDispR Array Fix (Crash Prevention)
- [x] Expanded `ammoDispR` from 3 entries to 10 entries
- [x] Added bounds checking for `ammoTypeIdx`
- [x] RecycleExcess() no longer crashes when ammoTypeIdx > 2

### Blueprint Component Priority
- [x] Added `bpNd` dictionary for blueprint needs from UnityPad
- [x] Components for active prints are queued first in QueueProduction()
- [x] Reads `[BLUEPRINT]` section from padPB.CustomData

### Build Status
- [x] Deployed: 89,503 chars (10.5% margin under 100k)

---

## 2026-01-26 - Production & Counting System Fixes

### Bottle Counting Overhaul
- [x] **Root Cause:** String matching on `TypeId.ToLower()` was unreliable
- [x] Added explicit bottle counting using `GetItemAmount(h2BottleType/o2BottleType)`
- [x] Pre-defined `MyItemType` objects at lines 100-101
- [x] Counts from: padCargo, bottleCargo, assembler outputs
- [x] Replaced unreliable `tp.Contains("gascontainerobject")` pattern

### mslAmmoTarget Minimum Enforcement
- [x] Added `if(mslAmmoTarget < 1000) mslAmmoTarget = 50000;` after LoadStorage()
- [x] Prevents corrupted Storage data from breaking production
- [x] Default 50,000 = ~5 missiles worth of S-10 ammo

### Ammo Type Synchronization
- [x] ReadPadSettings() now reads `type` key from padPB.CustomData
- [x] Calls UpdateAmmoType() when ammoTypeIdx changes
- [x] Ensures LCD 2 shows correct ammo type that UnityPad selected

### Production Target Logic Fix
- [x] Fixed `prodTgt = ammoTypeIdx==0 ? mslAmmoTarget : ammoTarget`
- [x] S-10 (idx 0) uses mslAmmoTarget (50k default)
- [x] Other ammo types (idx 1-9) use ammoTarget (500 default)

### CanTransferItemTo Removal
- [x] Removed conveyor check bottleneck from multiple transfer locations
- [x] Subgrid transfers now work without false failures
- [x] Uses TransferItemTo() directly for same-construct transfers

### Build Status
- [x] Deployed: 95,641 chars (**4.4% margin** - TIGHT)

---

## 2026-01-28 - BOOT_REQ PadID Filtering & Code Compression

### BOOT_REQ PadID Filtering
- [x] CheckBootRequest() now accepts both `INV_CHECK` and `INV_CHECK:{padID}` (backward compatible)
- [x] Multi-pad safe: only responds to its own pad's boot requests
- [x] Legacy format still works for older Unity Boot versions

### Personal Ammo Counting & FUEL Connector
- [x] Personal ammo counting via GetItemAmount() for all ammo types
- [x] FUEL connector detection: padCon only assigned if name contains "FUEL"
- [x] Code compression to stay under character limit

### Build Status
- [x] Deployed: 99,582 chars (**0.4% margin** - CRITICAL, basically zero room)

---

*Unity AI Lab - Inventory Systems Division*
