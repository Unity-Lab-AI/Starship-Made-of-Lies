# UnitySignal Centralization - Execution Plan

**Created:** 2026-01-24
**Status:** READY FOR EXECUTION
**Total Phases:** 10 (reordered by priority)

---

## EXECUTION ORDER (Optimized)

The TODO.md has 10 phases. Here's the optimized execution order based on dependencies and impact:

```
PHASE 1 → PHASE 6 → PHASE 2 → PHASE 3 → PHASE 4 → PHASE 5 → PHASE 8 → PHASE 7 → PHASE 9 → PHASE 10
  Echo     Stale    Antenna    Laser      Sat       IGC       Pad       LCD       Docs     Verify
  Done     Data     Registry   Track      Track    Consol    Refactor   Integ    Update
```

---

## PHASE 1: Echo & Status Display ✓ ALREADY DONE

**Status:** COMPLETE

Tasks completed:
- [x] Echo header with version and mode
- [x] Echo camera count by type (local, missile, miner)
- [x] Echo CustomData sync status
- [x] Clear Storage on compile
- [x] Session ID tracking

**Verified:** UnitySignal deployed at 10,351 chars with comprehensive Echo.

---

## PHASE 6: Stale Data Prevention (NEXT)

**Files:** `UnitySignal.cs`, `UnityInventory.cs`, `Unity Boot.cs`
**Depends on:** Nothing
**Unlocks:** All other phases

### Action Items:

1. **UnitySignal.cs** - Already has `Storage=""` in Program()
   - Verify Me.CustomData wipe is complete
   - Add session validation before reading other PBs

2. **UnityInventory.cs** - Add session ID
   ```csharp
   // In Program():
   Storage = "";
   // Write inv_for_session matching pad_session
   ```

3. **All scripts** - Session validation pattern:
   ```csharp
   bool IsSessionValid(IMyProgrammableBlock pb, string expectedSession){
       if(pb == null) return false;
       return pb.CustomData.Contains($"xxx_for_session={expectedSession}");
   }
   ```

### Deliverables:
- UnitySignal clears all state on compile
- UnityInventory clears all state on compile
- Session ID flows from Pad to all scripts
- Stale data detection via session mismatch

---

## PHASE 2: Antenna Registry & Configuration

**Files:** `UnitySignal.cs`
**Depends on:** Phase 6 (session ID)
**Unlocks:** Phase 3, Phase 5

### Action Items:

1. **Add antenna fields:**
   ```csharp
   List<IMyRadioAntenna> padRadios = new List<IMyRadioAntenna>();
   List<IMyLaserAntenna> padLasers = new List<IMyLaserAntenna>();
   ```

2. **Add ScanAntennas() function:**
   - Find all antennas on pad grid (Me.CubeGrid)
   - Filter by tag `[PAD#]` or grid membership
   - Store to lists

3. **Add ConfigureAntennas() function:**
   - Enable/disable all radios
   - Set broadcast radius
   - Enable IGC

4. **Add GetAntennaStatus() function:**
   - Return radio count, enabled count
   - Return laser count, connected count

5. **Update CustomData [ANTENNAS] section:**
   ```ini
   [ANTENNAS]
   radio_count=2
   radio_enabled=2
   laser_count=4
   laser_connected=3
   ```

6. **Update Echo with antenna status**

### Deliverables:
- Signal owns all antenna discovery on pad grid
- Antenna status in CustomData for other scripts to read
- Echo shows antenna counts

---

## PHASE 3: Laser Antenna Missile Tracking

**Files:** `UnitySignal.cs`
**Depends on:** Phase 2 (antenna registry)
**Unlocks:** Phase 8 (Pad refactor)

### Action Items:

1. **Track missiles from UNITY_MSL:**
   - Already listening to UNITY_MSL
   - Extract EntityId, position from broadcasts
   - Store in dictionary: `Dictionary<long, MissileData>`

2. **Add MissileData struct:**
   ```csharp
   struct MissileData {
       public long entityId;
       public Vector3D pos;
       public string status;
       public int tick;
   }
   ```

3. **Add AssignLaserToMissile() function:**
   - Find nearest unassigned laser
   - Set laser.SetTargetCoords(pos)
   - Track assignment in dictionary

4. **Add UpdateLaserTargets() function:**
   - Called each tick
   - Update laser positions for tracked missiles
   - Detect connection status changes

5. **Update CustomData [LASERS] section:**
   ```ini
   [LASERS]
   laser_1=MSL-12345|CONNECTED|1000,500,200
   laser_2=SAT-0-0|CONNECTING|5000,10000,5000
   ```

6. **Update Echo with laser targeting status**

### Deliverables:
- Signal tracks active missiles
- Signal assigns lasers to missiles
- Laser status in CustomData
- Echo shows laser connections

---

## PHASE 4: Satellite Constellation Tracking

**Files:** `UnitySignal.cs`
**Depends on:** Phase 2 (antenna registry)
**Unlocks:** Phase 8 (Pad refactor)

### Action Items:

1. **Add satellite listener:**
   ```csharp
   IMyBroadcastListener satListener;
   // Register UNITY_SAT_RELAY_STATUS
   ```

2. **Add SatelliteData struct:**
   ```csharp
   struct SatelliteData {
       public long entityId;
       public int gridX, gridZ;
       public int battery, h2;
       public int laserLinks;
       public string status;
       public int tick;
   }
   ```

3. **Add satellite dictionary:**
   ```csharp
   Dictionary<string, SatelliteData> satellites; // key = "gridX_gridZ"
   ```

4. **Add ProcessSatelliteMsg() function:**
   - Parse UNITY_SAT_RELAY_STATUS format
   - Update satellite dictionary
   - Timeout stale entries (no update in 60 ticks)

5. **Add satellite intercept listener:**
   - Register UNITY_SAT_INTERCEPT
   - Log intercepts to CustomData
   - Forward to Pad via separate section

6. **Update CustomData [SATELLITES] section:**
   ```ini
   [SATELLITES]
   count=4
   grid_0_0=12345|100|85|4|ACTIVE
   grid_0_1=12346|95|80|3|ACTIVE
   ```

7. **Update Echo with satellite status**

### Deliverables:
- Signal tracks all satellites
- Constellation status in CustomData
- Intercept messages logged
- Echo shows satellite count and status

---

## PHASE 5: IGC Channel Consolidation

**Files:** `UnitySignal.cs`, `UnityPad.cs`
**Depends on:** Phase 3, Phase 4 (data aggregation)
**Unlocks:** Phase 8 (Pad refactor)

### Action Items:

1. **Move channel listeners TO Signal:**
   - UNITY_MSL (already there)
   - UNITY_MSL_RELAY
   - UNITY_SAT_RELAY_STATUS
   - UNITY_SAT_INTERCEPT

2. **Remove channel listeners FROM Pad:**
   - Pad will read from signalPB.CustomData instead
   - Keep UNITY_PAD_CMD, UNITY_PAD_STATUS (controller mode)

3. **Add UNITY_SIGNAL_CMD channel:**
   - Commands: TRACK:entityId:x,y,z, ANTENNA:ON, ANTENNA:OFF, RESCAN
   - Signal responds via UNITY_SIGNAL_RSP

4. **Add command processing:**
   ```csharp
   void ProcessSignalCmd(string cmd){
       if(cmd.StartsWith("TRACK:")) { ... }
       else if(cmd == "ANTENNA:ON") { ... }
       else if(cmd == "RESCAN") { ... }
   }
   ```

5. **Update MINER_BEACON handling:**
   - Keep in Signal (already there)
   - Keep in Pad (for fleet display)
   - Keep in Inventory (for cargo stats)
   - Keep in Boot (for miner count)

### Deliverables:
- Signal is central IGC hub for pad grid
- Other scripts read from Signal CustomData
- Command channel for script-to-signal control
- Reduced IGC traffic

---

## PHASE 8: UnityPad Refactor

**Files:** `UnityPad.cs`
**Depends on:** Phase 3, Phase 4, Phase 5 (Signal has the data)
**Unlocks:** Phase 7 (LCD integration)

### Action Items:

1. **Add signalPB reference:**
   ```csharp
   IMyProgrammableBlock signalPB;
   // Find in FindSiblingPBs()
   ```

2. **Add ReadSignalStatus() function:**
   - Read antenna status from signalPB.CustomData [ANTENNAS]
   - Read laser targets from signalPB.CustomData [LASERS]
   - Read satellites from signalPB.CustomData [SATELLITES]
   - Read missiles from signalPB.CustomData [MISSILES]

3. **Remove from UnityPad:**
   - Direct UNITY_MSL listener (use Signal CustomData)
   - Direct UNITY_SAT_RELAY_STATUS listener
   - Direct satellite tracking dictionary
   - Laser targeting code (keep laser references for status display)

4. **Add fallback mode:**
   ```csharp
   bool signalAvailable = signalPB != null && signalPB.CustomData.Contains("signal_ready=true");
   if(!signalAvailable) {
       // Maintain current direct-read behavior
   }
   ```

5. **Character budget check:**
   - Current UnityPad: 95,615 chars
   - After removing ~5,000 chars of signal code
   - Target: ~90,000 chars (5% margin improvement)

### Deliverables:
- UnityPad reads from Signal instead of direct IGC
- Graceful fallback if Signal offline
- Reduced UnityPad size
- Cleaner separation of concerns

---

## PHASE 7: LCD Integration

**Files:** `UnitySignal.cs`
**Depends on:** Phase 8 (Pad refactor complete)
**Unlocks:** Phase 9 (documentation)

### Action Items:

1. **Add optional signal status LCD:**
   - Tag: `[PAD#]:SIGNAL` or `[PAD#SIGNAL]`
   - Display: antenna status, laser targets, satellite grid

2. **Add satellite mini-map:**
   - 5x5 grid representation
   - Show satellite positions with status colors
   - Mark missing grid positions

3. **Enhance CAMS LCD header:**
   - Add antenna icon (📡 using sprites)
   - Show "LASER LOCK" indicator for tracked missiles
   - Show satellite camera count

### Deliverables:
- Signal status LCD option
- Satellite constellation visual
- Enhanced camera display

---

## PHASE 9: Documentation Updates

**Files:** `.claude/CLAUDE.md`, `UnitySignal/.claude/CLAUDE.md`, `README.md`
**Depends on:** Phase 7 (features complete)
**Unlocks:** Phase 10 (verification)

### Action Items:

1. **Update root .claude/CLAUDE.md:**
   - Add Signal as central signal controller
   - Update IGC channel table with new ownership
   - Update CustomData section ownership
   - Add Signal CustomData schema reference

2. **Update UnitySignal/.claude/CLAUDE.md:**
   - Document antenna management functions
   - Document laser tracking functions
   - Document satellite tracking functions
   - Document new CustomData sections ([ANTENNAS], [LASERS], [SATELLITES])

3. **Update README.md:**
   - Add Signal role description
   - Update system architecture
   - Update setup instructions

### Deliverables:
- Complete documentation
- Updated architecture diagrams
- Setup instructions current

---

## PHASE 10: Testing & Validation

**Files:** None (manual testing)
**Depends on:** All phases complete
**Unlocks:** DONE

### Action Items:

1. **Compile order verification:**
   ```
   PAD → INVENTORY → SIGNAL → BOOT
   ```
   - Verify session ID flows correctly
   - Verify ready flags are checked
   - Verify boot completes with 26 checks

2. **Antenna control tests:**
   - Signal discovers all antennas
   - Antenna enable/disable works
   - Laser targeting assigns correctly

3. **Satellite tracking tests:**
   - UNITY_SAT_RELAY_STATUS received
   - Constellation status displays
   - Intercept messages logged

4. **Integration tests:**
   - Full system boot
   - Missile launch with Signal tracking
   - Controller mode with Signal

### Deliverables:
- All tests pass
- System operational
- No regressions

---

## CHARACTER BUDGET PROJECTION

| Script | Current | After All Phases | Limit | Status |
|--------|---------|------------------|-------|--------|
| UnitySignal | 10,351 | ~35,000 | 100,000 | OK (65% margin) |
| UnityPad | 95,615 | ~88,000 | 100,000 | OK (12% margin) |
| UnityInventory | 90,247 | ~91,000 | 100,000 | OK (9% margin) |
| Unity Boot | 17,149 | ~17,500 | 100,000 | OK (82% margin) |
| UnityBeacon | 14,658 | 14,658 | 100,000 | NO CHANGE |
| UnityMissile | 31,055 | 31,055 | 100,000 | NO CHANGE |

**Strategy:** Code moves FROM UnityPad TO UnitySignal. Net effect is better distribution.

---

## RISK MITIGATION

| Risk | Mitigation |
|------|------------|
| UnityPad over limit | Move code TO Signal, don't copy |
| Session sync fails | Add fallback to direct reads |
| Signal crash breaks system | Graceful degradation in Pad |
| IGC message loss | Use CustomData as backup |
| Laser targeting bugs | Keep manual override in Pad |

---

## NEXT ACTION

**Start Phase 6: Stale Data Prevention**

1. Read UnitySignal.cs - verify Storage clearing
2. Read UnityInventory.cs - add Storage clearing and session ID
3. Add session validation helper to all scripts
4. Build and verify

---

*Unity AI Lab - Signal Centralization Initiative*
