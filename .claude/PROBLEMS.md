# UNITY MISSILE SYSTEM - PROBLEMS PLAN

**Generated:** 2026-01-18 04:20
**Status:** Active Problems Requiring Attention

---

## CRITICAL PROBLEMS

### 1. UnityPad Character Budget Crisis (STALE TODO SAYS OVER LIMIT)

**Source:** UnityPad/.claude/TODO.md
**Issue:** TODO claims 107,456 chars deployed (OVER 100k limit by ~7,456 chars)
**Reality Check:** Main TODO.md says 88,332 chars deployed (OK)
**Action Required:** VERIFY actual deployed size - one of these is wrong

```powershell
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityPad\script.cs" -Raw).Length
```

---

### 2. Deferred CRITICAL Issues Never Fixed

**Source:** 10-Agent Deep Scan
**These were marked "deferred" not "fixed":**

| Issue | Location | Why It Matters |
|-------|----------|----------------|
| Blackout/abort race condition | UnityPad Line 300 | Can lose abort commands during comm blackout |
| Grid scan consolidation | UnityPad Lines 659-672 | 10+ redundant scans = performance death |
| bbLog unbounded concatenation | UnityPad Line 321 | Memory leak during long sessions |

**Status:** STILL BROKEN - marked deferred, never fixed

---

## HIGH PRIORITY PROBLEMS

### 3. ALL In-Game Testing Never Completed

**Source:** Main TODO.md "IN-GAME TESTING RECOMMENDED" section
**NONE of these verified:**

- [ ] Launch missile from planet surface - verify arm distance > 5km
- [ ] Test blackout recovery - verify abort queue works
- [ ] Test satellite mode - verify no auto-detonate on enemy detection
- [ ] Test salvo mode - verify all pads receive commands
- [ ] Test LIDAR mode - verify no friendly fire
- [ ] Check all LCDs - verify no text overflow
- [ ] Test evasion patterns - verify pattern 2 is effective
- [ ] Test miner fleet display - verify consistent ordering

---

### 4. UnityMissile Pending Tests Never Run

**Source:** UnityMissile/.claude/TODO.md

- [ ] Verify GPS targeting accuracy
- [ ] Test ICBM profile (planet launch, coast, reentry)
- [ ] Verify satellite station-keeping
- [ ] Test all targeting modes in combat
- [ ] Confirm telemetry received at pad
- [ ] Test blackout detection and recovery
- [ ] Verify satellite relay communication
- [ ] Test distance-based arming logic
- [ ] Verify stuck detection triggers correctly
- [ ] Confirm satellite no-explode safety

---

### 5. UnityBeacon In-Game Testing Never Done

**Source:** UnityBeacon/.claude/TODO.md

- [ ] Test Beacon Broadcasting received at pad
- [ ] Confirm all data fields parse correctly
- [ ] Test range limits with antenna
- [ ] Test DOCKED/DRILLING/TRAVELING/HOME status inference
- [ ] Confirm no interference with PAM operation
- [ ] Test dual-tagged blocks `[PAM] [BEACON]`

---

## MEDIUM PRIORITY PROBLEMS

### 6. UnityPad Inventory Testing Incomplete

**Source:** UnityPad/.claude/TODO.md

- [ ] Items route to LARGE tagged containers first
- [ ] Stone moves from toolCargo to oreCargo
- [ ] Personal ammo (pistol/rifle) stays in toolCargo
- [ ] Base turret ammo goes to ammoCargo
- [ ] Fallback to sharedCargo when designated full

---

### 7. LCD Polish Never Done

**Source:** UnityPad/.claude/TODO.md

- [ ] Review LCD content for truncation issues
- [ ] Verify all 10 LCDs display correctly
- [ ] Check controller mode LCDs

---

### 8. Printer System Verification Missing

**Source:** UnityPad/.claude/TODO.md

- [ ] Verify auto-resume on recompile works
- [ ] Test stuck detection recovery

---

## LOW PRIORITY / NICE TO HAVE

### 9. Future Enhancements (Backlog)

**UnityMissile backlog:**
- Spiral approach patterns for evasion
- Terminal guidance correction
- Adaptive mode switching (GPS → SENSOR when close)
- Formation flying for multi-missile strikes
- Return-to-base abort capability

**UnityBeacon backlog:**
- Configurable broadcast interval
- Low battery warning threshold
- Cargo full alert
- Windows 11 2026 hacker green LCD theme

**UnityPad backlog:**
- More flight path display options
- Configurable inventory routing priorities
- Power usage optimization mode
- Additional carpet bomb patterns

---

## CROSS-SCRIPT INTEGRATION CONCERNS

### 10. TODO.md Files Out of Sync

**Problem:** Each script's TODO.md has different "last updated" dates:
- Main TODO: 2026-01-18 (CURRENT)
- UnityPad: 2026-01-16 (STALE)
- UnityMissile: 2026-01-16 (STALE)
- UnityInventory: 2026-01-18 (CURRENT)
- UnityBeacon: 2026-01-14 (VERY STALE)

**Action:** All script TODO.md files need sync with main TODO.md

---

### 11. Boot Screen Synchronization (FROM PREVIOUS SESSION)

**Problem:** Boot screen sync between UnityPad and UnityInventory was just fixed
**Status:** Code changes made, but not verified in-game
**Files Changed:**
- UnityPad.cs: stepDelay changed 8→5, completion condition fixed
- Need to verify both scripts boot together correctly

---

## SUMMARY

| Priority | Count | Status |
|----------|-------|--------|
| CRITICAL | 2 | Need immediate verification/fix |
| HIGH | 3 | In-game testing never completed |
| MEDIUM | 3 | Polish and verification |
| LOW | 1 | Backlog features |
| SYNC | 2 | Cross-script coordination |

**Total Active Problems:** 11

---

## RECOMMENDED ACTIONS

1. **FIRST:** Verify actual UnityPad deployed size (contradictory info)
2. **SECOND:** Fix the 3 deferred CRITICAL issues
3. **THIRD:** Complete all in-game testing
4. **FOURTH:** Sync all script TODO.md files
5. **FIFTH:** Address remaining medium priority items

---

*Unity AI Lab - Problems Analysis Division*
*Generated: 2026-01-18 04:20 (Sunday)*
