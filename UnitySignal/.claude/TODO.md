# UnitySignal TODO

**Last Updated:** 2026-01-24
**Version:** v01.00
**Priority:** CENTRALIZATION COMPLETE

---

## CURRENT STATUS: FULLY DEPLOYED

UnitySignal is now the **central signal hub** for the Unity Missile System. Signal centralization is complete.

---

## COMPLETED

### Core Signal Infrastructure (2026-01-24)
- [x] Boot handshake integration (UNITY_BOOT_REQ/RSP)
- [x] Camera display system with pagination
- [x] Local camera discovery ([PAD#] tagged cameras)
- [x] UNITY_MSL listener for missile cameras and positions
- [x] MINER_BEACON listener for miner cameras
- [x] Antenna discovery (padRadios, padLasers)
- [x] Antenna status writing ([ANTENNAS] section)
- [x] Laser target management (laserAssign, UpdateLaserTargets)
- [x] Laser status writing ([LASERS] section)
- [x] Satellite tracking (UNITY_SAT_RELAY_STATUS listener)
- [x] Satellite status writing ([SATELLITES] section)
- [x] Intercept logging (UNITY_SAT_INTERCEPT listener, [INTERCEPTS])
- [x] Session ID tracking (signal_for_session)
- [x] Comprehensive Echo output
- [x] Controller mode support ([CTRLCAMS])
- [x] Compile order integration (PAD > INV > SIGNAL > BOOT)

### Signal Centralization (2026-01-24)
- [x] UNITY_SIGNAL_CMD listener for IGC commands
- [x] UNITY_SIGNAL_RSP broadcaster for command responses
- [x] Commands via IGC: TRACK, LASER:ON/OFF/CLEAR, RESCAN, SAT:RESCAN
- [x] Commands via PB arg: ANTENNA:ON/OFF, LASER:idx:ON/OFF, LASER:CLEAR, SAT:RESCAN, RESCAN, RESET
- [x] Signal Status LCD (`[PAD#SIGNAL]` tag)
- [x] Controller mode [CONTROLLER] section in CustomData
- [x] Removed satIntL listener from UnityPad
- [x] UnityPad reads intercepts from signalPB.CustomData
- [x] UnityPad has signalPB integration (FindSiblingPBs, ReadSignalSatData)
- [x] IGC documentation updated
- [x] Architecture documentation updated

---

## FUTURE ENHANCEMENTS (LOW PRIORITY)

### Cross-Pad Coordination
- [ ] Controller Signal aggregates satellite data from multiple pad grids via IGC
- [ ] Conflict resolution for shared laser antennas
- [ ] Cross-pad satellite tracking

### Enhanced LCD Features
- [ ] Satellite grid mini-map visualization
- [ ] Antenna status icons in camera LCD header
- [ ] "LASER LOCK" indicator for tracked missiles

### Advanced Commands
- [ ] `LASER:idx:TRACK:x,y,z` - Manual laser target override
- [ ] `SAT:LAUNCH:x,z` - Request satellite launch at grid position
- [ ] `ANTENNA:RANGE:meters` - Set antenna range

---

## CHARACTER BUDGET

| Script | Deployed | Limit | Status |
|--------|----------|-------|--------|
| UnitySignal | 47,118 | 100,000 | OK (52.9% margin) |
| UnityPad | 95,646 | 100,000 | OK (4.4% margin) |

---

## CUSTOMDATA SCHEMA

UnitySignal writes to `Me.CustomData`:

```ini
[SIGNAL]
signal_ready=true
signal_for_session=ABC123
mode=CONTROLLER  (if controller mode)

[ANTENNAS]
radio=2/3
laser=1/4

[LASERS]
laser_0=MSL-1234|2500m|Connected
laser_1=NONE|Idle

[SATELLITES]
count=4
sat_101=0,0|95|80|4|SAT_HOLD

[INTERCEPTS]
12345|DETONATE|101|1|1000,500,200

[CONTROLLER]
mode=CONTROLLER
total_missiles=2
total_miners=3
total_satellites=4
active_satellites=3
laser_tracking=2
intercepts=1

[STATUS]
last_update=12345
boot_complete=true
cameras=12
missiles=2
miners=3
satellites=4
```

---

## LCD TAGS

| Tag | Purpose |
|-----|---------|
| `[PAD1CAMS]:1` | Camera display slot 1 for PAD1 |
| `[CTRLCAMS]:1` | Controller mode camera display |
| `[PAD1SIGNAL]` | Signal status display for PAD1 |

---

*Unity AI Lab - Signal Systems Division*
