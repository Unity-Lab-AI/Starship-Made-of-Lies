# MinerBeacon - Active Tasks

**Session:** 2026-01-14
**Version:** v01.00
**Project:** MinerBeacon - Miner Status Broadcaster
**Location:** Unity Missile System/UnityBeacon/

---

## CHARACTER BUDGET

| Script | Current | Budget | Status |
|--------|---------|--------|--------|
| MinerBeacon.cs | 7,915 | 100,000 | Good |

---

## PRIORITY 1: In-Game Testing

### [ ] Test Beacon Broadcasting
- [ ] Verify beacon broadcasts received at pad
- [ ] Confirm all data fields parse correctly
- [ ] Test range limits with antenna

### [ ] Test Status Inference
- [ ] DOCKED status when connector locked
- [ ] DRILLING status when drills active
- [ ] TRAVELING status when moving fast
- [ ] HOME status when idle at base

### [ ] Test PAM Compatibility
- [ ] Confirm no interference with PAM operation
- [ ] Test dual-tagged blocks `[PAM] [BEACON]`
- [ ] Verify alongside active PAM mining

---

## PRIORITY 2: LCD Modernization

### [ ] Modern LCD Theme Design
- [ ] Design Windows 11 2026 hacker green theme
- [ ] Replace old progress bar style
- [ ] Add box drawing characters
- [ ] Modernize all pad LCDs (1-10)

---

## PRIORITY 3: Potential Enhancements

### [ ] Optional Features
- [ ] Configurable broadcast interval
- [ ] Low battery warning threshold
- [ ] Cargo full alert

---

## IGC Channel Map

| Channel | Sender | Receiver | Purpose |
|---------|--------|----------|---------|
| `MINER_BEACON` | MinerBeacon | UnityPad | Miner status |

---

*Unity AI Lab - Mining Division*
*Session: 2026-01-14*
