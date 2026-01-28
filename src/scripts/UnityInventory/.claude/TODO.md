# UnityInventory TODO

**Last Updated:** 2026-01-28
**Priority:** ALL CLEAR - System operational
**Deployed Size:** 99,582 chars (**0.4% margin** - CRITICAL)
**Version:** v01.00
**Location:** `Unity Missile System/src/scripts/UnityInventory/`

**WARNING:** Character budget is basically at the wall. Any new features MUST remove equal or greater code. No room for additions without cuts.

---

## COMPLETED - 2026-01-21

### [x] Ammo Classification Fix
- Fixed pistol ammo appearing twice on LCD 11 (WEAPONS + AMMO columns)
- Added `SPP()` helper to strip position prefix from blueprint names
- Changed queue classification from `Contains()` to exact-match
- `SemiAutoPistolMagazine` no longer incorrectly matches `SemiAutoPistol`

### [x] Personal Ammo Quota Consistency
- Removed all `idx==4` hardcodes that special-cased S-10 pistol ammo
- All personal ammo now uses `paNd` dictionary for targets
- Fixed in: RecycleExcess(), WriteBtnData(), UpdateLCD11()

### [x] ammoDispR Array Fix
- Expanded from 3 entries to 10 entries
- Added bounds checking for `ammoTypeIdx`
- RecycleExcess() no longer crashes when ammoTypeIdx > 2

### [x] Blueprint Component Priority
- Added `bpNd` dictionary for printer component needs
- Reads `[BLUEPRINT]` section from padPB.CustomData
- Components for active prints are queued first

---

## NO PENDING TASKS

System is fully operational. All fixes deployed and verified.

**Critical Note:** At 99,582 chars deployed (0.4% margin), this script is at the absolute limit. Any future work needs to be net-zero or net-negative on characters. We're basically coding with a shoehorn at this point.

---

*Unity AI Lab - Inventory Systems Division*
