# UnitySignal - Finalized Tasks

Archive of completed features and tasks.

---

## v01.00 - Initial Release (2026-01-24)

### Core Features
- Central signal hub for pad grid (antennas, lasers, satellites, cameras)
- Sprite-based LCD rendering with MySpriteDrawFrame
- Boot sequence integration (waits for boot_complete=true)
- Dynamic block scanning every 50 ticks

### Camera Sources
- Local camera discovery (cameras tagged [PAD#])
- UNITY_MSL listener for missile cameras
- MINER_BEACON listener for miner cameras
- 60-tick timeout cleanup for stale entries

### Display Features
- Paginated camera list with slot numbers
- Type indicators (LOCAL/MISSILE/MINER)
- Status color coding (ON/OFF/TARGET/etc.)
- 5-second page cycling (300 ticks)
- Widescreen 2-column layout for wide LCDs

### Controller Mode
- Auto-detection via [CTRLCAMS] LCD presence
- Shows cameras from ALL pads in controller mode
- Supports both [CTRLCAMS]:# and [PAD#CAMS]:# tags

### Integration
- Updated UnityMissile.cs to broadcast camera info in UNITY_MSL
- Format: `|CAMS:count|name1,name2,...`
- Updated UnityPad.cs compile order notice to include SIGNAL

---

## 2026-01-28 - BOOT_REQ PadID Filtering & Pressure LCD

### BOOT_REQ PadID Filtering
- [x] CheckBootRequest() accepts both `SIGNAL_CHECK` and `SIGNAL_CHECK:{padID}` (backward compatible)
- [x] Multi-pad safe: only responds to its own pad's boot requests
- [x] Deployed: 47,118 chars (52.9% margin)

### Pressure & Defense LCDs
- [x] `[PAD#PRESSURE]` LCD for airlock/vent status
- [x] `[PAD#DEFENSE]` LCD for weapons status
- [x] `[PAD#SATS]` LCD for satellite constellation display

---

*Unity AI Lab - Camera Systems Division*
