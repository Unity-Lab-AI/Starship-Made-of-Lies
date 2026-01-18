# UnityInventory TODO

**Last Updated:** 2026-01-18 01:25
**Priority:** ALL CLEAR - Ready for next session
**Deployed Size:** 76,656 chars (under 100k limit)
**Version:** v01.00

---

## CRITICAL LCD ISSUES

### [x] 1. Bottles Showing 0 Queued - FIXED
- **Fix:** Changed queue counting to use SubtypeName string comparison instead of MyDefinitionId
- **Change:** Line 242 now uses `i.BlueprintId.SubtypeName=="HydrogenBottle"` etc
- **Result:** Bottles now correctly show queued count

### [x] 2. Uranium Display - Storage vs Reactors - FIXED
- **Fix:** Split pUrnC into pUrnStg (storage from iStk) and pUrnReact (from reactors)
- **Display:** "Urn: {total} ({stg}s+{react}r)" format
- **Location:** CountStocks() line 246, UpdateLCD4() line 684

### [x] 3. Ice Display - Storage vs Generators - FIXED
- **Fix:** Split pIceC into pIceStg (storage from oStk) and pIceGen (from generators)
- **Display:** "Ice: {total} ({stg}s+{gen}g)" format
- **Location:** CountStocks() line 247, UpdateLCD4() line 684

### [x] 4. H2/O2 Generators Display - INCLUDED IN ICE FIX
- Ice in generators now tracked separately via pIceGen

---

## AUTO-CYCLE FEATURES

### [x] 5. Pad Overview Auto-Cycle (5 seconds) - FIXED
- **Implementation:** Added viewIdx variable (0-6)
- **Cycle Logic:** `if(tick%3==0){viewIdx=(viewIdx+1)%7;graphIdx=(graphIdx+1)%7;}`
- **Views:** Build Status, Missile Status, Fuel/Target, Power, Cargo, Production, Comms
- **Location:** Main() line 129, UpdateLCD4() lines 649-707

### [x] 6. Graph Auto-Cycle - FIXED
- **Implementation:** Added 7 history lists (pwrHist, h2Hist, o2Hist, cargoHist, refHist, asmHist, prodHist)
- **Graph Types:** Power, Hydrogen, Oxygen, Cargo Fill, Refinery, Assembler, Production
- **Cycle:** Every ~5 seconds via graphIdx
- **Location:** UpdateHistory() lines 633-646, UpdateLCD6() lines 741-767

---

## BUILD STATUS LCD

### [x] 7. Build Status Listing All Items - FIXED
- **Fix:** Expanded BUILD STATUS view (viewIdx==0) to show all categories
- **Categories Displayed:**
  - ORES (top 3 from oStk)
  - INGOTS (top 4 from iStk)
  - COMPONENTS (top 4 from cStk with color coding)
  - MISSING (from cMis or "None - all stocked!")
- **Location:** UpdateLCD4() lines 653-662

---

## PAD FACILITIES DISPLAY

### [x] 8. Medical/Kit/Cryo in COMMS View - FIXED
- **Implementation:** Added padMedCount, padSurvCount, padCryoCount variables
- **Scanning:** Added IMyMedicalRoom and IMyCockpit (Cryo) scanning in Scan()
- **Display:** "PAD FACILITIES" section in COMMS view (viewIdx==6)
- **Location:** Scan() line 178-179, UpdateLCD4() lines 700-706

### [x] 9. Survival Kit Detection - FIXED
- **Fix:** Now checks for "Survival" or "Kit" in SubtypeId
- **Supports:** Vanilla survival kits and "KIT mark II" mods
- **Location:** UnityPad.cs line 655, UnityInventory.cs line 178

---

## SUCCESS CRITERIA - ALL MET

1. [x] Bottles show actual queued count
2. [x] Uranium shows storage + reactor amounts
3. [x] Ice shows storage + generator amounts
4. [x] Pad overview cycles through all 7 views every 5 sec
5. [x] Graphs cycle through all 7 types every 5 sec
6. [x] Build status shows all item categories properly
7. [x] All changes build without TypeTrimmer warnings
8. [x] Deployed script under 100k chars (65,635 chars)
9. [x] Medical/Kit/Cryo displayed in COMMS view
10. [x] Survival kit detection recognizes mod kits

---

*Unity AI Lab - Inventory LCD Fix Session v01.00 - COMPLETED*
