# UNITY MISSILE SYSTEM - EXECUTION PLAN

**Generated:** 2026-01-18 04:30
**Status:** ACTIVE - WORK IN PROGRESS
**Goal:** Fix ALL deferred issues and complete ALL pending work

---

## PHASE 1: CRITICAL FIXES (DO FIRST)

### 1.1 Verify Character Budgets
- [ ] Check actual deployed sizes for all 4 scripts
- [ ] Update stale TODO.md files with correct counts

### 1.2 Fix Deferred CRITICAL: lastMslPos Initialization
- **File:** UnityPad.cs ~Line 294
- **Issue:** First velocity calculation wrong when lastMslPos uninitialized
- **Fix:** Initialize check already added per TODO, VERIFY it works

### 1.3 Fix Deferred CRITICAL: Blackout/Abort Race Condition
- **File:** UnityPad.cs ~Line 300
- **Issue:** RemoteDetonate can be lost during blackout
- **Fix:** Add mutex/queue for abort commands during blackout
- **Implementation:** Store abort request, retry on contact restore

### 1.4 Fix Deferred CRITICAL: Grid Scan Consolidation
- **File:** UnityPad.cs Lines 659-672
- **Issue:** 10+ redundant GridTerminalSystem scans in ScanPad
- **Fix:** Single-pass scan with type filtering
- **Implementation:** One GetBlocksOfType call, sort by type after

### 1.5 Fix Deferred CRITICAL: bbLog Unbounded Concatenation
- **File:** UnityPad.cs Line 321
- **Issue:** String grows forever, memory leak
- **Fix:** Ring buffer or max length truncation
- **Implementation:** `if(bbLog.Length>2000)bbLog=bbLog.Substring(bbLog.Length-1500);`

### 1.6 Fix S.AMMO State Handler
- **File:** UnityPad.cs
- **Issue:** S.AMMO state was unreachable (no case handler)
- **Status:** TODO says fixed, VERIFY in code

---

## PHASE 2: HIGH PRIORITY FIXES

### 2.1 UnityMissile Safety Verification
- [ ] Verify stuck detection logic is correct (dist >= lastDist)
- [ ] Verify satellite fallrate sign is correct
- [ ] Verify safetyDist is 5km minimum
- [ ] Verify satellite doesn't auto-detonate
- [ ] Verify DETONATE requires authentication

### 2.2 UnityInventory Bounds Check
- [ ] Verify ammoReqType bounds check exists

### 2.3 UnityBeacon Timing Init
- [ ] Verify departAt/jobArriveAt/returnStartAt initialized to 0

### 2.4 Cross-Script Telemetry
- [ ] Verify telemetry format matches between Missile and Pad
- [ ] Verify SendFinalStatus includes actual fuel%

---

## PHASE 3: SYNC ALL TODO.MD FILES

### 3.1 Update UnityPad/.claude/TODO.md
- Remove stale character budget crisis (if resolved)
- Sync with main TODO completion status

### 3.2 Update UnityMissile/.claude/TODO.md
- Mark completed items from 10-agent fixes

### 3.3 Update UnityBeacon/.claude/TODO.md
- Update last modified date
- Sync completion status

### 3.4 Update UnityInventory/.claude/TODO.md
- Already current, verify accuracy

---

## PHASE 4: BUILD AND VERIFY

### 4.1 Wrap and Build All Scripts
```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityPad -c Debug
dotnet build UnityMissile -c Debug
dotnet build UnityInventory -c Debug
dotnet build UnityBeacon -c Debug
```

### 4.2 Verify Deployed Sizes
```powershell
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityPad\script.cs" -Raw).Length
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs" -Raw).Length
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs" -Raw).Length
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs" -Raw).Length
```

---

## EXECUTION ORDER

1. Read UnityPad.cs (find deferred issues)
2. Fix bbLog truncation
3. Fix grid scan consolidation
4. Fix blackout/abort race condition
5. Verify other CRITICAL fixes exist
6. Read UnityMissile.cs (verify safety fixes)
7. Read UnityInventory.cs (verify bounds check)
8. Read UnityBeacon.cs (verify timing init)
9. Wrap and build all
10. Update all TODO.md files
11. Update FINALIZED.md

---

## SUCCESS CRITERIA

- [ ] All 4 scripts build with 0 errors
- [ ] All deployed sizes under 100k
- [ ] No deferred CRITICAL issues remain
- [ ] All TODO.md files synced and current
- [ ] FINALIZED.md updated with today's work

---

*Unity AI Lab - Execution Plan*
*LET'S FUCKING GO*
