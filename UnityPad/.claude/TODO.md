# UnityPad - Active Tasks

*Unity AI Lab - Missile Systems Division*
*Last Updated: 2026-01-16*

---

## CRITICAL: Character Budget Crisis

**Current:** ~107,456 chars deployed
**Limit:** 100,000 chars
**Over by:** ~7,456 chars

### [ ] Minification Required

Priority minification targets (see `.claude/ARCHITECTURE.md` for full reference):

1. **Remove duplicate ammoItemNames array** (~178 chars)
   - Lines 227-228: `ammoItemNames` is identical to `ammoBPNames`
   - Delete `ammoItemNames`, use `ammoBPNames` everywhere

2. **Consolidate scroll variables** (~200 chars)
   - Lines 91-108: 6 separate scroll/scrollDir/scrollDelay sets
   - Replace with: `int[] scr=new int[10];int[] scrD={1,1,1,1,1,1,1,1,1,1};int[] scrDl=new int[10];`

3. **IGC drain loop helper** (~100 chars)
   - 6+ identical while loops for IGC messages
   - Create helper: `void Dr(IMyBroadcastListener l,Action<string> h)`

4. **Percentage calculation helper** (~200 chars)
   - 8+ identical battery/tank percentage calculations
   - Create helper function

**Total potential savings:** ~1,686 chars (need ~7,500)

**Additional minification needed:**
- [ ] Review string literals for shortening
- [ ] Check for unused variables
- [ ] Identify redundant code paths

---

## In Progress

### [~] Inventory System Fixes (2026-01-16)

Fixes deployed, awaiting in-game testing:

- [x] Container size priority (L > M > S) - `padCargo.Sort()` at line 682
- [x] RouteItem fallback when designated full - fallback to padCargoL/M
- [x] Stone escape from toolCargo - only skip personal ammo
- [x] Ammo split (personal vs base turret)

**Testing checklist:**
- [ ] Items route to LARGE tagged containers first
- [ ] Stone moves from toolCargo to oreCargo
- [ ] Personal ammo (pistol/rifle) stays in toolCargo
- [ ] Base turret ammo goes to ammoCargo
- [ ] Fallback to sharedCargo when designated full

---

## Pending

### [ ] LCD Polish

- [ ] Review LCD content for truncation issues
- [ ] Verify all 10 LCDs display correctly
- [ ] Check controller mode LCDs

### [ ] Printer System

- [ ] Verify auto-resume on recompile works
- [ ] Test stuck detection recovery

---

## Backlog / Ideas

- [ ] Add more flight path display options
- [ ] Configurable inventory routing priorities
- [ ] Power usage optimization mode
- [ ] Additional carpet bomb patterns

---

## Notes

- Main project TODO at `../.claude/TODO.md` has system-wide tasks
- Move completed tasks to FINALIZED.md
- Character budget is CRITICAL - every edit must be justified

---

*Keep this file in sync with actual work progress*
