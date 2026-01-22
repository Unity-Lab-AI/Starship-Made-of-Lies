# UNITY MISSILE SYSTEM - CURRENT PLAN

**Generated:** 2026-01-19 01:25
**Session:** Full 10-Agent Bug Audit
**Issues:** LCD1 boot screen, Printer not working
**Total Bugs Found:** 91 across 5 scripts

---

## EXECUTIVE SUMMARY

Full system audit completed. Found 91 bugs across all 5 scripts:
- Unity Boot.cs: 18 bugs
- UnityPad.cs: 20 bugs
- UnityMissile.cs: 31 bugs
- UnityInventory.cs: 10 bugs
- UnityBeacon.cs: 12 bugs

**User-Reported Issues:**
1. LCD1 not showing boot screen during boot load
2. Printer never turns on, wrong info on print LCD

Both issues have root causes identified and fixes ready.

---

## IMMEDIATE FIXES (P1)

### Fix 1: LCD1 Boot Screen - Unity Boot.cs

**Problem:** LCD1 excluded from boot screen arrays

**File:** Unity Boot.cs
**Lines:** 191, 306

**Current Code (Line 191):**
```csharp
IMyTextSurface[] padLCDs={lcd2,lcd3,lcd7,lcd8};
```

**Fixed Code:**
```csharp
IMyTextSurface[] padLCDs={lcd1,lcd2,lcd3,lcd7,lcd8};
```

**Current Code (Line 306):**
```csharp
IMyTextSurface[] allLCDs={lcd2,lcd3,lcd4,lcd5,lcd6,lcd7,lcd8,lcd9,lcd10};
```

**Fixed Code:**
```csharp
IMyTextSurface[] allLCDs={lcd1,lcd2,lcd3,lcd4,lcd5,lcd6,lcd7,lcd8,lcd9,lcd10};
```

---

### Fix 2: Printer Not Turning On - UnityPad.cs

**Problem 1:** Line 753 - Piston check is INVERTED

**File:** UnityPad.cs
**Line:** 753-756

**Current Code (BROKEN):**
```csharp
bool hasVH=prtPistV.Count>0&&prtPistH.Count>0;
if(hasVH){foreach(var w in prtWeld)w.Enabled=false;return;}
```

This says "if has BOTH V and H pistons, disable welders and return" - WRONG!

**Fixed Code:**
```csharp
// Remove these lines entirely OR flip the logic:
if(prtPistV.Count==0||prtPistH.Count==0){
    foreach(var w in prtWeld)w.Enabled=false;
    return;
}
```

---

**Problem 2:** Line 1077 - Merge check is BACKWARDS

**File:** UnityPad.cs
**Line:** 1077 (inside StartPrint())

**Current Code (BROKEN):**
```csharp
if(padMerge.IsConnected)return;
```

This says "if merge IS connected, don't print" - prevents print when missile docked!

**Fixed Code:**
```csharp
// Remove this line entirely
// OR change to only block if missile is fully docked AND detected:
if(padMerge.IsConnected&&mslFound)return;
```

---

## ALL CRITICAL BUGS BY SCRIPT

### Unity Boot.cs (18 bugs)

| Priority | Line | Bug |
|----------|------|-----|
| P1 | 191, 306 | LCD1 excluded from boot arrays |
| P1 | 26-27, 134, 143 | IGC channel mismatch - handshake broken |
| P1 | 61-62 | CustomData corruption in ClearBootStatus |
| P1 | 114, 123, 253, 258 | Error responses ignored |
| P1 | 174-176 | Error recovery race condition |
| P1 | 291-303 | Miner data not written conditionally |
| P2 | 175 | maxAwait timeout logic broken |
| P2 | 150-151 | Missing EOF newline check |
| P2 | 91 | LCD1 naming check might fail |
| P3 | 50 | Beacon optional default logic |
| P3 | 116 | No validation of int.TryParse |
| P3 | 132, 141 | Replace without validation |
| P3 | 294 | No bounds check on parts[] |
| P3 | 188 | Array index boundary |
| P3 | 44 | WriteReadyFlag empty CustomData |

### UnityPad.cs (20 bugs)

| Priority | Line | Bug |
|----------|------|-----|
| P1 | 753-756 | Piston check INVERTED - printer hangs |
| P1 | 1077 | Merge check BACKWARDS - blocks print |
| P1 | 1081-1083 | State machine jumps, welders turn off |
| P1 | 926 | Ammo check backwards - premature READY |
| P1 | 865 | State machine race on unmerge |
| P1 | 945-946 | Launch detection unreliable |
| P2 | 1323-1358 | LCD2 shows BUILD not MISSILE |
| P2 | 1360-1407 | LCD3 shows PRINTER when no missile |
| P2 | 735-741 | Fragile tag detection |
| P2 | 743-756 | Early return when missile docked |
| P2 | 289 | ResetPrinterPosition called once |
| P2 | 331 | RemoteDetonate() multiple calls |
| P3 | 213-214 | Boot request handling fragile |
| P3 | 203 | ClearForBoot() missing [SYSTEM] |
| P3 | 780 | ScanMissile() circular dependency |
| P3 | 779 | conLocked never reset |
| P3 | 869 | S.PRINT returns early |
| P3 | 917-918 | FUEL disconnect missing checks |

### UnityMissile.cs (31 bugs)

| Priority | Line | Bug |
|----------|------|-----|
| P1 | 743 | UnlockGyros() sets override=true (WRONG!) |
| P1 | 300 | Altitude hold INVERTED - dives not climbs |
| P1 | 239-266 | DoCoast() never arms warheads |
| P1 | 291 | Warhead arming skipped for satellites |
| P2 | 268-277 | DoReentry() is a no-op |
| P2 | 656 | GetAntennaTarget() falls back to GPS |
| P2 | 633-642 | Missing SATELLITE mode in GetTarget() |
| P2 | 310-314 | Gravity drop wrong time estimate |
| P2 | 149-151 | Satellite can't arm in space |
| P2 | 347, 365 | Station keeping uses stale velocity |
| P2 | 370 | Satellite gravity fallback wrong |
| P2 | 317-318 | Multiple detonate() calls |
| (plus 19 more P3 bugs) |

### UnityInventory.cs (10 bugs)

| Priority | Line | Bug |
|----------|------|-----|
| P1 | 1115, 1117 | Ice/uranium infinite growth |
| P2 | 1031, 1069 | Missing LINQ using directive |
| P2 | 1085-1104 | Duplicate miner tracking |
| P2 | 410 | QueueMissing over-queues |
| P2 | 1125 | Docked miners never cleaned |
| P2 | 883-892 | Random item order each frame |
| P2 | 368-374 | Ammo/component tracking desync |

### UnityBeacon.cs (12 bugs)

| Priority | Line | Bug |
|----------|------|-----|
| P1 | 213 | Cargo color INVERTED |
| P1 | 163-171 | Cargo tracking unreliable >70% |
| P2 | 169 | Return time calc edge case |
| P2 | 170/144 | Uranium counted differently |
| P2 | 168 | Outbound time averaging glitch |

---

## IMPLEMENTATION ORDER

1. **Fix LCD1 boot screen** (Unity Boot.cs lines 191, 306)
2. **Fix printer piston check** (UnityPad.cs line 753)
3. **Fix printer merge check** (UnityPad.cs line 1077)
4. Build and test
5. If time permits, fix other P1 bugs

---

## BUILD COMMANDS

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build "Unity Boot" -c Debug
dotnet build UnityPad -c Debug
```

---

## VERIFICATION

After fixes:
1. Recompile Unity Boot in-game FIRST
2. Recompile UnityPad in-game SECOND
3. Verify LCD1 shows boot screen
4. Verify printer starts when commanded
5. Verify correct info on print LCD

---

*Unity AI Lab - Missile Systems Division*
*Bug Audit Plan - 2026-01-19*
