# STARSHIP MADE OF LIES - Skill Tree

*Last Updated: 2026-01-29*
*Unity AI Lab - Missile Systems Division*

---

## Overview

Complete capability map for the Starship Made of Lies (6 scripts). Organized by domain, complexity, and priority to help understand what the system can do and what's still on the roadmap.

**Scripts:** Unity Boot, UnityPad, UnityInventory, UnitySignal, UnityMissile, UnityBeacon

---

## By Domain

### Boot & System Initialization

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| Per-PB CustomData Architecture | Unity Boot | COMPLETE | Advanced |
| 26 Unified Boot Checks | Unity Boot | COMPLETE | Expert |
| Real IGC Handshaking | Unity Boot | COMPLETE | Advanced |
| PB Discovery Pattern | Unity Boot | COMPLETE | Intermediate |
| Ready Flag Synchronization | Unity Boot | COMPLETE | Intermediate |
| LCD Boot Screen Display | Unity Boot | COMPLETE | Basic |
| Session ID Tracking | Unity Boot | COMPLETE | Intermediate |
| Self-Disable After Boot | Unity Boot | COMPLETE | Basic |

### Guidance & Navigation

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| GPS Coordinate Targeting | UnityMissile | COMPLETE | Basic |
| Antenna Signal Tracking | UnityMissile | COMPLETE | Intermediate |
| Sensor Proximity Hunting | UnityMissile | COMPLETE | Intermediate |
| LIDAR Camera Raycast | UnityMissile | COMPLETE | Advanced |
| Manual Remote Control | UnityMissile | COMPLETE | Basic |
| Satellite Deployment | UnityMissile | COMPLETE | Expert |
| ICBM Ballistic Profile | UnityMissile | COMPLETE | Advanced |
| Zero-G Space Flight | UnityMissile | COMPLETE | Intermediate |
| Gravity Detection | UnityMissile | COMPLETE | Basic |
| Reentry Phase Handling | UnityMissile | COMPLETE | Advanced |

### Communication & Telemetry

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| IGC Missile Telemetry | Both | COMPLETE | Intermediate |
| Remote Detonation Command | Both | COMPLETE | Basic |
| Position Broadcasting | UnityMissile | COMPLETE | Basic |
| Satellite Relay Network | Both | COMPLETE | Expert |
| Multi-Pad IGC Coordination | UnityPad | COMPLETE | Advanced |
| Blackout Detection | UnityPad | COMPLETE | Intermediate |
| Miner Fleet Tracking | UnityPad | COMPLETE | Advanced |
| Beacon Status Broadcast | UnityBeacon | COMPLETE | Basic |

### Display & UI

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| 10-Panel LCD System | UnityPad | COMPLETE | Advanced |
| Controller LCD Mode (8 panels) | UnityPad | COMPLETE | Advanced |
| Menu Navigation | UnityPad | COMPLETE | Basic |
| Setup Wizard | UnityPad | COMPLETE | Intermediate |
| Flight Telemetry Display | UnityPad | COMPLETE | Intermediate |
| Power Graphs | UnityPad | COMPLETE | Advanced |
| Miner Fleet Display | UnityPad | COMPLETE | Intermediate |
| Progress Bars | UnityPad | COMPLETE | Basic |
| Status Indicators | UnityPad | COMPLETE | Basic |
| Ship Status LCD | UnityBeacon | COMPLETE | Basic |

### Block Detection & Management

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| Pad Block Scanning | UnityPad | COMPLETE | Intermediate |
| Missile Block Scanning | UnityPad | COMPLETE | Intermediate |
| Tag-Based Block Discovery | UnityPad | COMPLETE | Basic |
| Multi-Pad Discovery | UnityPad | COMPLETE | Advanced |
| Auto Block Naming | UnityPad | COMPLETE | Intermediate |
| Grid Size Detection | UnityPad | COMPLETE | Basic |
| Thruster Type Detection | UnityPad | COMPLETE | Intermediate |

### Signal & Communications Controller

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| Antenna Management | UnitySignal | COMPLETE | Basic |
| Laser Antenna Control | UnitySignal | COMPLETE | Intermediate |
| Satellite Constellation Tracking | UnitySignal | COMPLETE | Advanced |
| Camera Array Management | UnitySignal | COMPLETE | Intermediate |
| Session ID Broadcasting | UnitySignal | COMPLETE | Intermediate |
| CAMS LCD Display | UnitySignal | COMPLETE | Basic |
| SAT_RELAY_STATUS Processing | UnitySignal | COMPLETE | Advanced |

### Inventory & Resources

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| Container Tag Routing | UnityInventory | COMPLETE | Intermediate |
| Size-Priority Sorting (L>M>S) | UnityInventory | COMPLETE | Intermediate |
| Ammo Type Splitting | UnityInventory | COMPLETE | Intermediate |
| Refinery Auto-Feed | UnityInventory | COMPLETE | Basic |
| Assembler Auto-Feed | UnityInventory | COMPLETE | Basic |
| Component Auto-Queue | UnityInventory | COMPLETE | Advanced |
| Ore Requirement Calc | UnityInventory | COMPLETE | Advanced |
| H2/O2 Bottle Auto-Craft | UnityInventory | COMPLETE | Advanced |
| Miner Ore Pull | UnityInventory | COMPLETE | Intermediate |
| RouteItem Fallback | UnityInventory | COMPLETE | Intermediate |
| Multi-Assembler Recycling | UnityInventory | COMPLETE | Expert |
| S-10 Ammo Special Routing | UnityInventory | COMPLETE | Advanced |
| Production Quota Management | UnityInventory | COMPLETE | Advanced |
| Recycling Excess Guards | UnityInventory | COMPLETE | Advanced |
| FeedAssemblers Mode Check | UnityInventory | COMPLETE | Intermediate |
| Ammo LCD Sign Display | UnityInventory | COMPLETE | Intermediate |

### Missile Construction

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| Piston-Based Printer | UnityPad | COMPLETE | Advanced |
| Projector Integration | UnityPad | COMPLETE | Intermediate |
| Print State Machine | UnityPad | COMPLETE | Advanced |
| Build Progress Tracking | UnityPad | COMPLETE | Intermediate |
| Stuck Detection | UnityPad | COMPLETE | Advanced |
| Auto-Resume on Recompile | UnityPad | COMPLETE | Expert |
| Bill of Materials Display | UnityPad | COMPLETE | Intermediate |
| Missing Components Calc | UnityPad | COMPLETE | Advanced |

### Launch Operations

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| State Machine (11 states) | UnityPad | COMPLETE | Advanced |
| T-Minus Countdown | UnityPad | COMPLETE | Basic |
| Merge Block Docking | UnityPad | COMPLETE | Basic |
| Fuel Transfer | UnityPad | COMPLETE | Intermediate |
| Ammo Loading | UnityPad | COMPLETE | Intermediate |
| Missile Systems Enable | UnityPad | COMPLETE | Intermediate |
| Missile Systems Disable | UnityPad | COMPLETE | Intermediate |
| Warhead Arming Sequence | UnityPad | COMPLETE | Intermediate |
| Launch Separation | UnityPad | COMPLETE | Basic |

### Mass Operations (Controller)

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| Multi-Pad Controller Mode | UnityPad | COMPLETE | Expert |
| Copy Target to All | UnityPad | COMPLETE | Intermediate |
| Build All Command | UnityPad | COMPLETE | Intermediate |
| Arm All Command | UnityPad | COMPLETE | Intermediate |
| Launch All Command | UnityPad | COMPLETE | Intermediate |
| Salvo Mode (Staggered) | UnityPad | COMPLETE | Advanced |
| Carpet Bomb Patterns | UnityPad | COMPLETE | Expert |
| Kill All Auto-Attack | UnityPad | COMPLETE | Expert |
| Abort All Command | UnityPad | COMPLETE | Intermediate |

### Safety Systems

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| Warheads Safe During Climb | UnityMissile | COMPLETE | Basic |
| Distance-Based Arming | UnityMissile | COMPLETE | Intermediate |
| Stuck Detection Detonation | UnityMissile | COMPLETE | Intermediate |
| Proximity Detonation | UnityMissile | COMPLETE | Basic |
| Satellite No-Explode | UnityMissile | COMPLETE | Basic |
| Countdown Safety | UnityPad | COMPLETE | Basic |
| PB ABORT Command | UnityPad | COMPLETE | Intermediate |
| Boot Session Verification | UnityMissile | COMPLETE | Advanced |
| Auto Fire Mode | UnityPad | COMPLETE | Intermediate |

---

## By Complexity

### Basic (Learn First)

Foundational features - must work for system to function.

- GPS Targeting
- Manual Flight Mode
- Remote Detonation
- Position Broadcasting
- Menu Navigation
- Tag-Based Discovery
- Merge Block Docking
- T-Minus Countdown
- Progress Bars
- Proximity Detonation

### Intermediate (Core Features)

Standard operational capabilities.

- Antenna Signal Tracking
- Sensor Proximity Mode
- Zero-G Space Flight
- IGC Telemetry
- Blackout Detection
- Setup Wizard
- Pad/Missile Block Scanning
- Container Routing
- Fuel/Ammo Transfer
- Build Progress Display
- Beacon Broadcasting

### Advanced (Power User)

Complex features for advanced operations.

- LIDAR Camera Raycast
- ICBM Ballistic Profile
- Reentry Phase Handling
- Multi-Pad Coordination
- 10-Panel LCD System
- Power History Graphs
- Piston Printer System
- Component Auto-Queue
- Ore Requirement Calc
- Salvo Launch Mode
- Miner Fleet Tracking

### Expert (Full Mastery)

System integration and automation.

- Satellite Relay Network
- Multi-Pad Controller Mode
- Carpet Bomb Patterns
- Kill All Auto-Attack
- Print Auto-Resume
- Full Inventory Automation

---

## By Priority

### Critical (System Won't Work Without)

| Skill | Why Critical |
|-------|--------------|
| GPS Targeting | Primary targeting mode |
| State Machine | Controls all pad operations |
| Block Scanning | Detects missile/pad components |
| Fuel Transfer | Missiles need fuel |
| Launch Separation | Obviously |
| Warhead Safety | Don't blow up on pad |

### Important (Core Experience)

| Skill | Why Important |
|-------|---------------|
| All Targeting Modes | Flexibility in combat |
| IGC Telemetry | Know where missiles are |
| LCD Display System | User feedback |
| Printer Integration | Auto-build missiles |
| Container Routing | Keep inventory organized |
| Multi-Pad Support | Scale operations |

### Nice-to-Have (Quality of Life)

| Skill | Benefit |
|-------|---------|
| Power Graphs | Visual monitoring |
| Carpet Bomb Patterns | Tactical options |
| Satellite Relay | Extended range |
| Miner Fleet Tracking | Base management |
| Auto-Attack Mode | Hands-free defense |
| H2/O2 Auto-Craft | Survival convenience |

---

## Dependency Graph

```
                    ┌─────────────────┐
                    │  Block Scanning │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼──────┐
    │ Pad Blocks  │  │ Missile Blocks│  │ Printer     │
    └──────┬──────┘  └───────┬───────┘  └──────┬──────┘
           │                 │                 │
    ┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼──────┐
    │ State       │  │ Fuel Transfer │  │ Auto-Build  │
    │ Machine     │  │ Ammo Load     │  │ System      │
    └──────┬──────┘  └───────┬───────┘  └─────────────┘
           │                 │
           └────────┬────────┘
                    │
             ┌──────▼──────┐
             │   LAUNCH    │
             └──────┬──────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
 ┌──────▼──────┐ ┌──▼──┐ ┌──────▼──────┐
 │ GPS Target  │ │CLIMB│ │ Telemetry   │
 │ Antenna     │ └──┬──┘ │ Broadcast   │
 │ Sensor      │    │    └─────────────┘
 │ LIDAR       │ ┌──▼──┐
 └─────────────┘ │ ARM │
                 └──┬──┘
                    │
              ┌─────▼─────┐
              │  TARGET   │
              │ (Guidance)│
              └─────┬─────┘
                    │
              ┌─────▼─────┐
              │ DETONATE  │
              └───────────┘
```

---

## Feature Status Summary

| Category | Total | Complete | Pending |
|----------|-------|----------|---------|
| Boot & System Init | 8 | 8 | 0 |
| Guidance & Navigation | 10 | 10 | 0 |
| Communication | 8 | 8 | 0 |
| Display & UI | 10 | 10 | 0 |
| Block Detection | 7 | 7 | 0 |
| Signal Controller | 7 | 7 | 0 |
| Inventory | 16 | 16 | 0 |
| Construction | 8 | 8 | 0 |
| Launch Operations | 9 | 9 | 0 |
| Mass Operations | 9 | 9 | 0 |
| Safety Systems | 9 | 9 | 0 |
| **TOTAL** | **101** | **101** | **0** |

---

## Future Possibilities

Things not implemented but could be:

- Spiral approach patterns for evasion
- Terminal guidance correction
- Multi-target sequencing
- Decoy deployment
- EMP payload mode
- Formation flying
- Return-to-base abort
- Damage assessment telemetry
- Fuel efficiency optimization
- Adaptive guidance switching

---

*Unity AI Lab - Missile Systems Division*
*"Every feature is a new way to make things explode"*
