# UNITY MISSILE SYSTEM - Roadmap

*Last Updated: 2026-01-24*
*Unity AI Lab - Missile Systems Division*

---

## Project Vision

A complete guided missile system for Space Engineers with:
- Automated missile construction and launch
- Multiple targeting modes for any combat scenario
- Multi-pad coordination for mass strikes
- Satellite relay network for extended range
- Fleet tracking and base management integration
- Centralized boot system with real PB handshaking
- Unified inventory and production management

---

## Current Status

| Metric | Value |
|--------|-------|
| **Phase** | OPERATIONAL |
| **Core Features** | 100% Complete |
| **Scripts** | 6 (Unity Boot, UnityPad, UnityInventory, UnitySignal, UnityMissile, UnityBeacon) |
| **Character Usage** | All scripts under 100k limit |

---

## Phase 1: Foundation (COMPLETE)

> Core missile system functionality

### Milestone 1.1: Basic Missile System
**Status:** COMPLETE

| Feature | Status |
|---------|--------|
| Pad state machine | DONE |
| Missile state machine | DONE |
| GPS targeting | DONE |
| Basic telemetry | DONE |
| LCD display | DONE |
| Launch sequence | DONE |

### Milestone 1.2: Multi-Mode Targeting
**Status:** COMPLETE

| Feature | Status |
|---------|--------|
| Antenna tracking | DONE |
| Sensor hunting | DONE |
| LIDAR raycast | DONE |
| Manual mode | DONE |
| Mode switching | DONE |

---

## Phase 2: Enhancement (COMPLETE)

> Advanced features and automation

### Milestone 2.1: Auto-Construction
**Status:** COMPLETE

| Feature | Status |
|---------|--------|
| Piston printer | DONE |
| Projector integration | DONE |
| Build progress tracking | DONE |
| Auto-resume on recompile | DONE |
| BOM calculation | DONE |
| Component auto-queue | DONE |

### Milestone 2.2: ICBM Profile
**Status:** COMPLETE

| Feature | Status |
|---------|--------|
| Atmospheric climb | DONE |
| Zero-G coast phase | DONE |
| Reentry detection | DONE |
| Terminal guidance | DONE |
| Space launch support | DONE |

### Milestone 2.3: Multi-Pad Controller
**Status:** COMPLETE

| Feature | Status |
|---------|--------|
| Pad discovery | DONE |
| IGC coordination | DONE |
| Mass commands | DONE |
| Salvo mode | DONE |
| Carpet bombing | DONE |
| Auto-attack mode | DONE |

### Milestone 2.4: Satellite Network
**Status:** COMPLETE

| Feature | Status |
|---------|--------|
| Satellite flight mode | DONE |
| Station-keeping | DONE |
| Communication relay | DONE |
| Network management | DONE |

---

## Phase 3: Integration (COMPLETE)

> Base management and fleet ops

### Milestone 3.1: Inventory Management
**Status:** COMPLETE (with recent fixes)

| Feature | Status |
|---------|--------|
| Tagged container routing | DONE |
| Size priority (L>M>S) | DONE (Fixed 2026-01-16) |
| Ammo type splitting | DONE (Fixed 2026-01-16) |
| Fallback routing | DONE (Fixed 2026-01-16) |
| Refinery/Assembler feeding | DONE |
| H2/O2 bottle auto-craft | DONE |

### Milestone 3.2: Miner Fleet Tracking
**Status:** COMPLETE

| Feature | Status |
|---------|--------|
| UnityBeacon script | DONE |
| IGC status broadcast | DONE |
| Pad fleet display (LCD 9-10) | DONE |
| Docked miner detection | DONE |
| Ore auto-pull | DONE |

---

## Phase 4: System Expansion (COMPLETE)

> Boot system and script separation

### Milestone 4.1: Boot System
**Status:** COMPLETE

| Task | Status |
|------|--------|
| Unity Boot controller | DONE |
| 26 unified boot checks | DONE |
| Real IGC handshaking | DONE |
| Per-PB CustomData architecture | DONE |

### Milestone 4.2: Script Separation
**Status:** COMPLETE

| Task | Status |
|------|--------|
| UnityInventory extraction | DONE |
| UnitySignal extraction | DONE |
| All scripts under 100k | DONE |
| Session ID synchronization | DONE |

**Character Counts (2026-01-24):**
| Script | Deployed | Budget | Status |
|--------|----------|--------|--------|
| Unity Boot | 15,050 | 100,000 | OK (85% margin) |
| UnityPad | 95,427 | 100,000 | OK (4.6% margin) |
| UnityInventory | 90,247 | 100,000 | OK (9.8% margin) |
| UnitySignal | 11,998 | 100,000 | OK (88% margin) |
| UnityMissile | 31,055 | 100,000 | OK (69% margin) |
| UnityBeacon | 14,658 | 100,000 | OK (85% margin) |

### Milestone 4.3: Documentation Unification
**Status:** COMPLETE

| Task | Status |
|------|--------|
| Unified TOC format | DONE |
| All 6 scripts documented | DONE |
| ARCHITECTURE.md consolidated | DONE |
| All READMEs updated | DONE |

---

## Phase 5: Future (PLANNED)

> Potential future enhancements

### Milestone 5.1: Advanced Guidance (NOT STARTED)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Spiral approach patterns | P3 | High |
| Evasive maneuvers | P3 | High |
| Multi-target sequencing | P2 | Medium |
| Adaptive mode switching | P3 | High |

### Milestone 5.2: Enhanced Payloads (NOT STARTED)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Decoy/chaff deployment | P3 | Medium |
| EMP mode (disable only) | P3 | High |
| Cluster warhead | P3 | High |
| Kinetic impactor | P3 | Medium |

### Milestone 5.3: Fleet Operations (NOT STARTED)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Formation flying | P3 | Expert |
| Coordinated strikes | P2 | High |
| Return-to-base abort | P2 | Medium |
| Damage assessment | P3 | Medium |

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Character limit exceeded | HIGH | HAPPENED | Minification |
| SE API changes | Medium | Low | Monitor updates |
| IGC range limits | Medium | Known | Satellite relay |
| Complex printer jams | Low | Rare | Stuck detection |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-09 | Use IGC for comms | No antenna pairing needed |
| 2026-01-10 | Add satellite mode | Extend beyond 50km limit |
| 2026-01-10 | 10-LCD system | More info display |
| 2026-01-14 | Add MinerBeacon | Fleet management |
| 2026-01-16 | Fix inventory routing | Stone stuck in toolCargo |
| 2026-01-16 | Add ammo splitting | Personal vs turret ammo |

---

## Timeline

```
2026-01-09  ████████████████████  Core System Complete
2026-01-10  ██████████████████████████████  Multi-Pad & ICBM
2026-01-14  ████████████████████████████████████  MinerBeacon Added
2026-01-16  ████████████████████████████████████████  Inventory Fixes
            │
            ▼
         NOW: Minification & Documentation
```

---

## Next Actions

### Short Term
1. Test satellite constellation in-game
2. Verify boot sequence on fresh compile
3. Test all targeting modes post-separation

### Long Term
1. Consider advanced guidance features
2. Monitor for SE updates affecting API
3. Gather user feedback for improvements
4. Expand satellite network capabilities

---

## Quick Commands

```powershell
# Build all scripts
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build "Unity Boot" -c Debug
dotnet build UnityPad -c Debug
dotnet build UnityInventory -c Debug
dotnet build UnitySignal -c Debug
dotnet build UnityMissile -c Debug
dotnet build UnityBeacon -c Debug

# Check deployed sizes
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\Unity Boot\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityPad\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnitySignal\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs").Length
```

---

*Unity AI Lab - Missile Systems Division*
*"We don't plan features, we plan explosions"*
