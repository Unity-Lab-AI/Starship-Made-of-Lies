# UNITY MISSILE SYSTEM - Full Bug Audit Plan

**Date:** 2026-01-19 01:15
**Session:** Full 10-Agent System Scan
**Issues Reported:** LCD1 not showing boot screen, Printer not working

---

## USER-REPORTED ISSUES

### Issue 1: LCD1 Not Showing Boot Screen
**Status:** ROOT CAUSE FOUND
**Location:** Unity Boot.cs lines 191, 306
**Fix:** Add lcd1 to boot screen arrays

### Issue 2: Printer Not Turning On / Wrong LCD Info
**Status:** MULTIPLE BUGS FOUND
**Location:** UnityPad.cs lines 753, 1077, 1081
**Fix:** Multiple fixes required (see below)

---

## FULL SYSTEM BUG AUDIT RESULTS

### Unity Boot.cs - 18 BUGS FOUND

| # | Line | Severity | Issue |
|---|------|----------|-------|
| 1 | 191, 306 | **CRITICAL** | LCD1 excluded from boot screen arrays |
| 2 | 61-62 | CRITICAL | CustomData corruption in ClearBootStatus |
| 3 | 174-176 | CRITICAL | Error recovery race condition |
| 4 | 26-27, 134, 143 | **CRITICAL** | IGC channel mismatch - boot handshake fails |
| 5 | 114, 123, 253, 258 | CRITICAL | Error responses ignored, boot succeeds anyway |
| 6 | 291-303 | CRITICAL | Miner data not written conditionally |
| 7 | 175 | HIGH | maxAwait timeout logic broken (shows 30, waits 90) |
| 8 | 150-151 | HIGH | Missing EOF newline check - IndexOutOfRange |
| 9 | 91 | HIGH | LCD1 naming check might fail |
| 10 | 50 | MEDIUM | Beacon optional default logic backwards |
| 11 | 116 | MEDIUM | No validation of int.TryParse success |
| 12 | 132, 141 | MEDIUM | Replace without validation |
| 13 | 294 | MEDIUM | No bounds check on parts[] |
| 14 | 161-199 | MEDIUM | Echo message ordering issue |
| 15 | 188 | LOW | Array index boundary if bootStep>21 |
| 16 | 84 | LOW | Missing null on blks loop |
| 17 | 205 | LOW | Defense in depth for null |
| 18 | 44 | MEDIUM | WriteReadyFlag with empty CustomData |

### UnityPad.cs - 20 BUGS FOUND

| # | Line | Severity | Issue |
|---|------|----------|-------|
| 1 | 753-756 | **CRITICAL** | Vertical/Horizontal piston check INVERTED - printer hangs |
| 2 | 1077 | **CRITICAL** | `if(padMerge.IsConnected)return;` BACKWARDS - blocks print |
| 3 | 1081-1083 | **CRITICAL** | State machine jumps states, welders turn off |
| 4 | 926 | CRITICAL | Ammo check backwards - premature READY state |
| 5 | 865 | CRITICAL | State machine race condition on unmerge |
| 6 | 945-946 | CRITICAL | Launch completion detection unreliable |
| 7 | 1323-1358 | HIGH | LCD2 shows BUILD not MISSILE status (swapped) |
| 8 | 1360-1407 | HIGH | LCD3 shows PRINTER when no missile (inverted) |
| 9 | 735-741 | HIGH | Fragile tag detection logic for pistons |
| 10 | 743-756 | HIGH | Early return when missile docked - scan incomplete |
| 11 | 289 | HIGH | ResetPrinterPosition called once, never updates |
| 12 | 331 | HIGH | RemoteDetonate() called multiple times |
| 13 | 213-214 | MEDIUM | Boot request handling fragile |
| 14 | 203 | MEDIUM | ClearForBoot() doesn't ensure [SYSTEM] section |
| 15 | 780 | MEDIUM | ScanMissile() circular dependency with state |
| 16 | 779 | MEDIUM | conLocked never reset when connector changes |
| 17 | 869 | MEDIUM | S.PRINT returns early without merge check |
| 18 | 917-918 | MEDIUM | FUEL state disconnect missing battery/H2 check |
| 19 | 1015-1016 | LOW | Countdown flash logic uses wrong variable |
| 20 | 351-356 | LOW | Laser antenna always enabled even when docked |

### UnityMissile.cs - 31 BUGS FOUND

| # | Line | Severity | Issue |
|---|------|----------|-------|
| 1 | 743 | **CRITICAL** | UnlockGyros() sets override=true (WRONG) |
| 2 | 300 | **CRITICAL** | Altitude hold logic INVERTED - dives instead of climbs |
| 3 | 239-266 | CRITICAL | DoCoast() never arms warheads |
| 4 | 291 | CRITICAL | Warhead arming skipped for satellites |
| 5 | 268-277 | HIGH | DoReentry() is a no-op, transitions immediately |
| 6 | 656 | HIGH | GetAntennaTarget() silently falls back to GPS |
| 7 | 633-642 | HIGH | Missing SATELLITE mode in GetTarget() switch |
| 8 | 310-314 | HIGH | Gravity drop uses wrong time estimate |
| 9 | 149-151 | HIGH | Satellite can't arm if launched in space |
| 10 | 347, 365 | HIGH | Station keeping uses stale satVelocity |
| 11 | 370 | HIGH | Satellite gravity fallback condition wrong |
| 12 | 317-318 | HIGH | Multiple detonate() calls possible |
| 13 | 145-147 | MEDIUM | Multiple IGC listeners accumulate (memory leak) |
| 14 | 403-416 | MEDIUM | Relay creates infinite loop risk |
| 15 | 396-400 | MEDIUM | Satellite command parsing no validation |
| 16 | 295 | MEDIUM | ammoConnector.ThrowOut never unset |
| 17 | 383 | MEDIUM | Satellite power check ignores generator status |
| 18 | 202-220 | MEDIUM | flightMode distinction doesn't affect gravity |
| 19 | 786-793 | MEDIUM | UpdateTargetVelocity() never resets |
| 20 | 683-692 | MEDIUM | LIDAR infinite loop risk |
| 21 | 794-799 | MEDIUM | Terminal guidance divide by zero risk |
| 22 | 774-785 | MEDIUM | Spiral calculation frame-based not time-based |
| 23 | 228-237 | LOW | DoArm() no yield cycle |
| 24 | 128-132 | LOW | launchUp calculated but not always used |
| 25 | 318 | LOW | Stuck detection threshold too high (3 seconds) |
| 26 | 698-702 | LOW | isValidTgt() mode 2 undocumented |

### UnityInventory.cs - 10 BUGS FOUND

| # | Line | Severity | Issue |
|---|------|----------|-------|
| 1 | 1115, 1117 | **CRITICAL** | Ice/uranium infinite growth (never reset) |
| 2 | 1031, 1069 | HIGH | Missing LINQ using directive |
| 3 | 1085-1104 | HIGH | Duplicate miner tracking (EntityId mismatch) |
| 4 | 410 | MEDIUM | QueueMissing over-queues if asmCount > 1 |
| 5 | 1125 | MEDIUM | Docked miners never cleaned from trkM |
| 6 | 883-892 | MEDIUM | Random item order each frame (dictionary) |
| 7 | 368-374 | MEDIUM | Ammo/component tracking desync |
| 8 | 1020, 1053 | LOW | Inconsistent variable names |
| 9 | 344, 404 | LOW | Redundant ContainsKey checks |
| 10 | 831 | LOW | Possible text overflow |

### UnityBeacon.cs - 12 BUGS FOUND

| # | Line | Severity | Issue |
|---|------|----------|-------|
| 1 | 213 | **CRITICAL** | Cargo color INVERTED (PctCol(1-cp) should be PctCol(cp)) |
| 2 | 163-171 | CRITICAL | Cargo tracking unreliable when >70% |
| 3 | 169 | HIGH | Return time calc edge case |
| 4 | 170/144 | HIGH | Uranium counted differently in broadcast vs LCD |
| 5 | 168 | MEDIUM | Outbound time averaging vulnerable to glitches |
| 6 | 245/231 | MEDIUM | Duplicate cargo scan code |
| 7 | 159 | MEDIUM | Cargo string bloats broadcast |
| 8 | 160 | MEDIUM | Broadcast format lacks version field |
| 9 | 175-176 | LOW | ETA returns 0 instead of "no data" |
| 10 | 154-155 | LOW | Tool counting duplicated |
| 11 | 207 | LOW | Status color mapping inconsistent |
| 12 | 187 | LOW | Home distance hardcoded 100m |

---

## PRIORITY FIX ORDER

### P1 - IMMEDIATE (User-Reported Issues)

1. **Unity Boot.cs line 191** - Add lcd1 to padLCDs array
2. **Unity Boot.cs line 306** - Add lcd1 to allLCDs array in DrawWaitingScreen
3. **UnityPad.cs line 753** - Fix inverted piston check (change && to ||)
4. **UnityPad.cs line 1077** - Fix inverted merge check (remove the check or flip it)

### P2 - CRITICAL (System Breaking)

5. Unity Boot.cs lines 26-27, 134, 143 - Fix IGC channel mismatch
6. UnityMissile.cs line 743 - Fix UnlockGyros() to actually unlock
7. UnityMissile.cs line 300 - Fix inverted altitude hold
8. UnityInventory.cs lines 1115, 1117 - Fix infinite accumulation

### P3 - HIGH (Functionality Issues)

9. UnityPad.cs lines 1323-1407 - Fix LCD2/LCD3 content swap
10. UnityMissile.cs line 239-266 - Add warhead arming to COAST phase
11. Unity Boot.cs lines 114, 123 - Handle error responses properly

---

## FILES TO MODIFY

| File | Lines to Change | Changes |
|------|-----------------|---------|
| Unity Boot.cs | 191, 306 | Add lcd1 to arrays |
| UnityPad.cs | 753, 1077, 1081 | Fix printer logic |
| UnityMissile.cs | 743, 300 | Fix gyro unlock, altitude hold |
| UnityInventory.cs | 1115, 1117 | Reset values before accumulating |
| UnityBeacon.cs | 213 | Fix cargo color |

---

## BUILD COMMANDS AFTER FIX

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build "Unity Boot" -c Debug
dotnet build UnityPad -c Debug
dotnet build UnityMissile -c Debug
dotnet build UnityInventory -c Debug
dotnet build UnityBeacon -c Debug
```

---

*Unity AI Lab - Missile Systems Division*
*Full System Audit - 2026-01-19*
