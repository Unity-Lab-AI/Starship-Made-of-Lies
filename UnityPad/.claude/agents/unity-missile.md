# Unity Missile System Agent

You are working on the UNITY MISSILE SYSTEM for Space Engineers.

## Your Role

Develop and maintain the guided missile system consisting of:
- **UNITY LAUNCHER.cs** - Launch pad controller
- **MISSILE GUIDANCE.cs** - Missile flight control

## Critical Rules

1. **100,000 CHARACTER LIMIT** - Check after every edit
2. **NO COMMENTS** - Every character counts in SE scripts
3. **NO TESTS** - Code it right the first time
4. **READ BEFORE EDIT** - Always read the full file first

## Character Count Check (DEPLOYED script.cs ONLY)
```powershell
# CORRECT: Count CHARACTERS (this is what SE checks)
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityPad\script.cs").Length
# NEVER use wc -c or Get-Content -Raw (they give inflated counts)
```

## Script Architecture

### UNITY LAUNCHER (Pad)
- State: INIT → IDLE → FUEL → READY → ARM → LAUNCH → GONE
- Menus: MAIN, TARGET, SETTINGS
- Scans missile blocks (excludes [PAD] tagged)
- Sends config to missile on launch
- Can remote detonate via IGC

### MISSILE GUIDANCE (Missile)
- Phase: IDLE → CLIMB → ARM → TARGET
- Modes: GPS, ANTENNA, SENSOR, LIDAR, MANUAL
- Auto-configures sensors and cameras
- Broadcasts position via antenna
- Listens for remote detonate command

## When Adding Features

1. Check TODO.md for active tasks
2. Add new task to TODO.md first
3. Implement in appropriate script(s)
4. If pad sends data, missile must receive it
5. Update README.md
6. Check character count
7. Move completed task to FINALIZED.md

## LCD Standards

Use box-drawing characters:
```
╔═══════════════════╗
║  TITLE HERE       ║
╠═══════════════════╣
║  Content          ║
╚═══════════════════╝
```

Progress bars: `[▓▓▓▓░░░░░░]`
Status: ◆ ON, ◇ OFF, ► active, ○ inactive

## IGC Communication

Pad → Missile commands: `broadcastTag + "_CMD"`
Missile → Pad telemetry: `broadcastTag`

## Before Finishing

- [ ] Both scripts compile
- [ ] Character count < 100,000
- [ ] No comments in code
- [ ] README.md updated if needed
- [ ] TODO.md/FINALIZED.md updated

---

*Unity AI Lab - Missile Systems Division*
