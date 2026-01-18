# UNITY PAD - Minification Architecture Reference

**File:** `UnityPad.cs`
**Lines:** ~2,010
**Raw Size:** ~149,000 chars
**Deployed Size:** 99,882 chars (118 char margin!)

---

## IGC CHANNEL ABBREVIATIONS

| Original | Abbreviation | Savings |
|----------|--------------|---------|
| `"UNITY_MSL"` | `"UM"` | 7 chars |
| `"UNITY_MSL_CMD"` | `"UMC"` | 11 chars |
| `"UNITY_MSL_RELAY"` | `"UMR"` | 13 chars |
| `"UNITY_PAD_CMD"` | `"UPC"` | 11 chars |
| `"UNITY_PAD_STATUS"` | `"UPS"` | 14 chars |
| `"UNITY_SAT_RELAY"` | `"USR"` | 13 chars |
| `"UNITY_SAT_RELAY_STATUS"` | `"USRS"` | 19 chars |
| `"ENEMY_SIGNAL"` | `"ES"` | 10 chars |
| `"MINER_BEACON"` | `"MB"` | 10 chars |

**TOTAL CHANNEL SAVINGS:** ~108 chars

---

## VARIABLE NAME ABBREVIATIONS

### Listener Variables
| Original | Abbreviation | Type | Line |
|----------|--------------|------|------|
| `mslListener` | `mL` | IMyBroadcastListener | 62 |
| `relayListener` | `rL` | IMyBroadcastListener | 63 |
| `padCmdListener` | `pcL` | IMyBroadcastListener | 182 |
| `padStatusListener` | `psL` | IMyBroadcastListener | 183 |
| `satStatusListener` | `ssL` | IMyBroadcastListener | 195 |
| `enemyListener` | `eL` | IMyBroadcastListener | 193 |
| `beaconListener` | `bL` | IMyBroadcastListener | 210 |

### Tag/Channel Variables
| Original | Abbreviation | Type | Line |
|----------|--------------|------|------|
| `broadcastTag` | `bcT` | string | 56 |
| `padCmdTag` | `pcT` | string | 184 |
| `padStatusTag` | `psT` | string | 185 |
| `satStatusTag` | `ssT` | string | 196 |
| `beaconTag` | `bT` | string | 211 |

### Missile Block Lists
| Original | Abbreviation | Type | Line |
|----------|--------------|------|------|
| `mslBat` | `mB` | List<IMyBatteryBlock> | 21 |
| `mslH2` | `mH` | List<IMyGasTank> | 22 |
| `mslWar` | `mW` | List<IMyWarhead> | 23 |
| `mslThr` | `mT` | List<IMyThrust> | 24 |
| `mslGen` | `mG` | List<IMyGasGenerator> | 26 |
| `mslGyr` | `mY` | List<IMyGyro> | 27 |
| `mslSen` | `mSn` | List<IMySensorBlock> | 28 |
| `mslCam` | `mCm` | List<IMyCameraBlock> | 29 |
| `mslAnt` | `mA` | List<IMyRadioAntenna> | 30 |
| `mslLsr` | `mLs` | List<IMyLaserAntenna> | 31 |
| `mslCock` | `mCk` | List<IMyCockpit> | 32 |
| `mslLights` | `mLt` | List<IMyLightingBlock> | 33 |
| `mslMerge` | `mMg` | IMyShipMergeBlock | 10 |
| `mslConFuel` | `mCF` | IMyShipConnector | 11 |
| `mslConAmmo` | `mCA` | IMyShipConnector | 11 |
| `mslRC` | `mRC` | IMyRemoteControl | 34 |
| `mslPB` | `mPB` | IMyProgrammableBlock | 20 |

### Pad Block Lists
| Original | Abbreviation | Type | Line |
|----------|--------------|------|------|
| `padBat` | `pB` | List<IMyBatteryBlock> | 137 |
| `padH2` | `pH` | List<IMyGasTank> | 138 |
| `padO2` | `pO` | List<IMyGasTank> | 139 |
| `padCargo` | `pC` | List<IMyCargoContainer> | 140 |
| `padCargoL` | `pCL` | List<IMyCargoContainer> | 141 |
| `padCargoM` | `pCM` | List<IMyCargoContainer> | 142 |
| `padCargoS` | `pCS` | List<IMyCargoContainer> | 143 |
| `padRef` | `pR` | List<IMyRefinery> | 145 |
| `padAsm` | `pA` | List<IMyAssembler> | 146 |
| `padAnt` | `pAn` | List<IMyRadioAntenna> | 147 |
| `padLsr` | `pLs` | List<IMyLaserAntenna> | 148 |
| `padReact` | `pRc` | List<IMyReactor> | 149 |
| `padSolar` | `pSl` | List<IMySolarPanel> | 150 |
| `padGyr` | `pGy` | List<IMyGyro> | 151 |
| `padThr` | `pTr` | List<IMyThrust> | 152 |
| `padGen` | `pGn` | List<IMyGasGenerator> | 153 |
| `padCam` | `pCa` | List<IMyCameraBlock> | 154 |
| `padSen` | `pSn` | List<IMySensorBlock> | 155 |
| `padMerge` | `pMg` | IMyShipMergeBlock | 10 |
| `padCon` | `pCn` | IMyShipConnector | 11 |

### Printer Variables
| Original | Abbreviation | Type | Line |
|----------|--------------|------|------|
| `prtPist` | `pp` | List<IMyPistonBase> | 113 |
| `prtPistV` | `ppV` | List<IMyPistonBase> | 114 |
| `prtPistH` | `ppH` | List<IMyPistonBase> | 115 |
| `prtWeld` | `pW` | List<IMyShipWelder> | 116 |
| `prtProj` | `pPj` | IMyProjector | 117 |
| `prtState` | `pSt` | int | 118 |
| `prtSpeed` | `pSp` | float | 119 |
| `prtHPos` | `pHP` | float | 120 |
| `prtHStep` | `pHS` | float | 121 |
| `prtHMax` | `pHM` | float | 122 |
| `prtVMax` | `pVM` | float | 123 |
| `prtVZero` | `pVZ` | float | 124 |
| `prtVSpeed` | `pVS` | float | 125 |
| `prtHSpeed` | `pHSp` | float | 126 |
| `prtStopped` | `pStp` | bool | 128 |
| `prtLastVPos` | `pLVP` | float | 129 |
| `prtStuckTicks` | `pSTk` | int | 130 |
| `prtBuildable` | `pBld` | int | 170 |
| `prtMissing` | `pMis` | int | 170 |

### Telemetry Variables
| Original | Abbreviation | Type | Line |
|----------|--------------|------|------|
| `mslAltitude` | `mAlt` | double | 15 |
| `mslSpeed` | `mSpd` | double | 16 |
| `mslFuelPct` | `mFPct` | double | 17 |
| `mslGyroStatus` | `mGSt` | string | 18 |
| `mslPhase` | `mPh` | string | 64 |
| `mslDistToTgt` | `mDTT` | double | 65 |
| `mslPos` | `mPs` | Vector3D | 66 |
| `lastTelemetry` | `lTlm` | DateTime | 67 |
| `hasTelemetry` | `hTlm` | bool | 68 |
| `mslLaunched` | `mLch` | bool | 69 |
| `telemetryTimeout` | `tlmTO` | int | 70 |
| `mslInBlackout` | `mBO` | bool | 71 |
| `lastKnownPhase` | `lkPh` | string | 72 |
| `lastKnownDist` | `lkDst` | double | 73 |
| `mslGrav` | `mGrv` | double | 74 |
| `mslDistFromPad` | `mDFP` | double | 75 |
| `lastMslPos` | `lmPs` | Vector3D | 76 |
| `lastTelTime` | `lTT` | DateTime | 77 |
| `mslVelocity` | `mVel` | double | 78 |

### Scroll Variables (CONSOLIDATION CANDIDATE)
| Original | Abbreviation | Combined | Line |
|----------|--------------|----------|------|
| `scroll2`, `scroll3`, `scroll4`, `scroll6`, `scroll8`, `scroll9` | `scr[6]` | int[] | 91-108 |
| `scrollDir2`, `scrollDir3`, etc. | `scrD[6]` | int[] | 92-107 |
| `scrollDelay2`, `scrollDelay3`, etc. | `scrDl[6]` | int[] | 93-108 |

**SAVINGS FROM CONSOLIDATION:** ~200 chars

### Flight Tracking Variables
| Original | Abbreviation | Type | Line |
|----------|--------------|------|------|
| `flightDist` | `fDst` | float[16] | 79 |
| `flightAlt` | `fAlt` | float[16] | 80 |
| `flightSpd` | `fSpd` | float[16] | 81 |
| `flightIdx` | `fIdx` | int | 82 |
| `flightMode` | `fMd` | int | 61 |

### Target Variables
| Original | Abbreviation | Type | Line |
|----------|--------------|------|------|
| `tgtGPS` | `tG` | Vector3D | 40 |
| `tgtAntenna` | `tAn` | string | 41 |
| `tgtName` | `tNm` | string | 42 |
| `tgtSet` | `tS` | bool | 43 |
| `waypoints` | `wps` | List<MyWaypointInfo> | 44 |
| `customWP` | `cWP` | List<MyWaypointInfo> | 45 |
| `detectedAnts` | `dAnts` | List<string> | 47 |
| `detectedTargets` | `dTgts` | List<Vector3D> | 192 |

### Controller Variables
| Original | Abbreviation | Type | Line |
|----------|--------------|------|------|
| `isController` | `isCtrl` | bool | 172 |
| `ctrlSel` | `cSel` | int | 173 |
| `ctrlPadSel` | `cPSel` | int | 174 |
| `knownPads` | `kPads` | List<int> | 175 |
| `knownSats` | `kSats` | List<int> | 202 |
| `lostSats` | `lSats` | List<int> | 203 |
| `trackedMiners` | `tMiners` | Dictionary<long,MinerData> | 212 |

### Pad Status Dictionaries
| Original | Abbreviation | Type | Line |
|----------|--------------|------|------|
| `padStatus` | `pStat` | Dictionary<int,string> | 176 |
| `padArmed` | `pArm` | Dictionary<int,bool> | 177 |
| `padReady` | `pRdy` | Dictionary<int,bool> | 178 |
| `padMslFound` | `pMF` | Dictionary<int,bool> | 179 |
| `padPrinting` | `pPrt` | Dictionary<int,bool> | 180 |
| `padTargets` | `pTgt` | Dictionary<int,Vector3D> | 181 |

### Satellite Dictionaries
| Original | Abbreviation | Type | Line |
|----------|--------------|------|------|
| `satPositions` | `sPos` | Dictionary<int,Vector3D> | 197 |
| `satBattery` | `sBat` | Dictionary<int,int> | 198 |
| `satH2` | `sH2` | Dictionary<int,int> | 199 |
| `satStatus` | `sStat` | Dictionary<int,string> | 200 |
| `satLastSeen` | `sLS` | Dictionary<int,DateTime> | 201 |

### Stock/Inventory Dictionaries
| Original | Abbreviation | Type | Line |
|----------|--------------|------|------|
| `oreStock` | `orS` | Dictionary<string,int> | 214 |
| `compStock` | `cpS` | Dictionary<string,int> | 215 |
| `ingotStock` | `igS` | Dictionary<string,int> | 216 |
| `compNeeded` | `cpN` | Dictionary<string,int> | 217 |
| `compMissing` | `cpM` | Dictionary<string,int> | 218 |
| `compQueued` | `cpQ` | Dictionary<string,int> | 247 |
| `oreNeeded` | `orN` | Dictionary<string,int> | 248 |
| `ammoIngotNeed` | `amIN` | Dictionary<string,int> | 249 |

---

## FUNCTION NAME ABBREVIATIONS

### LCD Update Functions
| Original | Abbreviation | Lines |
|----------|--------------|-------|
| `UpdateDisplays` | `UD` | 1571-1582 |
| `UpdateLCD1` | `UL1` | 1756-1878 |
| `UpdateLCD2` | `UL2` | 1880-1944 |
| `UpdateLCD3` | `UL3` | 1946-1993 |
| `UpdateLCD4` | `UL4` | 1996-2073 |
| `UpdateLCD5` | `UL5` | 2075-2131 |
| `UpdateLCD6` | `UL6` | 2133-2168 |
| `UpdateLCD7` | `UL7` | 2170-2208 |
| `UpdateLCD8` | `UL8` | 2210-2280 |
| `UpdateLCD9` | `UL9` | 2282-2301 |
| `UpdateLCD10` | `UL10` | 2304-2325 |
| `UpdateControllerLCD1` | `UCL1` | 1602-1617 |
| `UpdateControllerLCD2` | `UCL2` | 1618-1633 |
| `UpdateControllerLCD3` | `UCL3` | 1654-1673 |
| `UpdateControllerLCD4` | `UCL4` | 1674-1686 |
| `UpdateControllerLCD5` | `UCL5` | 1634-1653 |
| `UpdateControllerLCD6` | `UCL6` | 1687-1704 |
| `UpdateControllerLCD7` | `UCL7` | 1705-1725 |
| `UpdateControllerLCD8` | `UCL8` | 1726-1740 |
| `UpdateBlackBox` | `UBB` | 2511-2523 |

### Core Functions
| Original | Abbreviation | Lines |
|----------|--------------|-------|
| `CheckTelemetry` | `ChkTlm` | 447-452 |
| `ProcessTelemetry` | `PrcTlm` | 453-499 |
| `CheckTelemetryTimeout` | `ChkTlmTO` | 500-515 |
| `BroadcastCommand` | `BcCmd` | 519-522 |
| `BroadcastStatus` | `BcSt` | 523-527 |
| `CheckPadCommands` | `ChkPdCmd` | 528-559 |
| `CheckPadStatus` | `ChkPdSt` | 633-649 |
| `CheckSatStatus` | `ChkSatSt` | 650-666 |
| `ManageSatNetwork` | `MgSatNet` | 667-688 |
| `CheckBeacons` | `ChkBcn` | 689-707 |
| `CorrelateDockedMiners` | `CorDocM` | 708-725 |
| `CleanStaleMiners` | `ClnStaleM` | 726-729 |
| `PullOreFromMiners` | `PullOreM` | 730-750 |

### Scan Functions
| Original | Abbreviation | Lines |
|----------|--------------|-------|
| `ScanPad` | `ScnPd` | 847-909 |
| `ScanMissile` | `ScnMsl` | 1011-1075 |
| `ScanPrinter` | `ScnPrt` | 970-1008 |
| `ScanAntennas` | `ScnAnt` | 1077-1085 |

### Missile Control Functions
| Original | Abbreviation | Lines |
|----------|--------------|-------|
| `ArmMissile` | `ArmMsl` | 1176-1182 |
| `DisarmMissile` | `DisarmMsl` | 1184-1187 |
| `StartLaunch` | `StartL` | 1189-1207 |
| `RemoteDetonate` | `RemDet` | 1209-1212 |
| `DisableMissileThrusters` | `DisMslThr` | 1214-1223 |
| `EnableMissileForLaunch` | `EnMslL` | 1225-1232 |
| `LinkMissileLasers` | `LnkMslLsr` | 1234-1245 |
| `UpdateMissileLights` | `UMslLt` | 1247-1261 |

### Printer Functions
| Original | Abbreviation | Lines |
|----------|--------------|-------|
| `StartPrint` | `StartP` | 1375-1399 |
| `StopPrint` | `StopP` | 1401-1408 |
| `UpdatePrinter` | `UPrt` | 1410-1475 |
| `UpdatePrinterLegacy` | `UPrtLeg` | 1476-1496 |

### Helper Functions
| Original | Abbreviation | Lines |
|----------|--------------|-------|
| `OrganizeStorage` | `OrgStor` | 2525-2542 |
| `FeedRefineries` | `FeedRef` | 940-950 |
| `FeedAssemblers` | `FeedAsm` | 951-968 |
| `CalcAmmoIngotNeeds` | `CalcAmIN` | 910-939 |
| `ParseCustomGPS` | `PrsCstGPS` | 1087-1105 |
| `DetectEnvironment` | `DetEnv` | 407-425 |

### Compression Helper Functions (2026-01-16)
| Abbreviation | Purpose | Signature |
|--------------|---------|-----------|
| `GL` | Get inventory items as List | `List<MyInventoryItem> GL(IMyInventory v)` |
| `AD` | Add/increment to Dictionary | `void AD(Dictionary<string,int> d, string k, int v)` |
| `HS` | Has space in inventory | `bool HS(IMyInventory i, float t)` |
| `HT` | Has item type in inventory | `bool HT(IMyInventory i, MyItemType t)` |
| `GD` | Get destination cargo by type | `IMyCargoContainer GD(MyItemType t)` |
| `PO` | Process output inventory | `Action<IMyInventory> PO` (local in ManageInventory) |
| `OG` | On Grid predicate | `Func<IMyTerminalBlock,bool> OG` (local in ore connector) |

**These helpers replaced 40+ repeated patterns, saving ~400 chars**

---

## STRING LITERAL ABBREVIATIONS

### Blueprint Definition Strings
| Original | Abbreviation | Used In |
|----------|--------------|---------|
| `"MyObjectBuilder_BlueprintDefinition/"` | `"MOBBD/"` | 166-246 |
| `"MyObjectBuilder_GasContainerObject/"` | `"MOBGCO/"` | 168-169 |
| `"MyObjectBuilder_AmmoMagazine/"` | `"MOBAM/"` | 404 |
| `"MyObjectBuilder_Component/"` | `"MOBC/"` | Multiple |

### Block Subtype Strings
| Original | Abbreviation | Occurrences |
|----------|--------------|-------------|
| `"Hydrogen"` | `"H2"` | 25+ |
| `"Oxygen"` | `"O2"` | 10+ |
| `"LargeContainer"` | `"LgC"` | 5 |
| `"MediumContainer"` | `"MdC"` | 5 |
| `"SmallContainer"` | `"SmC"` | 5 |
| `"BatteryBlock"` | `"Bat"` | 3 |
| `"HydrogenTank"` | `"H2T"` | 3 |
| `"OxygenTank"` | `"O2T"` | 3 |
| `"RadioAntenna"` | `"RdAnt"` | 3 |
| `"LaserAntenna"` | `"LsAnt"` | 3 |
| `"Atmospheric"` | `"Atmo"` | 5 |
| `"RemoteControl"` | `"RC"` | 3 |

### Display Text Strings
| Original | Abbreviation | Occurrences |
|----------|--------------|-------------|
| `"=== "` + `" ==="` | `"= "` + `" ="` | 40+ headers |
| `"NO SIGNAL"` | `"NOSIG"` | 8 |
| `"BLACKOUT"` | `"BLKOUT"` | 6 |
| `"CALCULATING..."` | `"CALC..."` | 3 |
| `"BROADCASTING"` | `"BCAST"` | 3 |

---

## DUPLICATE CODE PATTERNS

### Pattern 1: ammoItemNames = ammoBPNames (IDENTICAL)
**Lines:** 227-228
```csharp
// BEFORE (Lines 227-228):
string[] ammoBPNames={"SemiAutoPistolMagazine","AutomaticRifleGun_Mag_20rd","RapidFireAutomaticRifleGun_Mag_50rd","Missile200mm","NATO_5p56x45mm"};
string[] ammoItemNames={"SemiAutoPistolMagazine","AutomaticRifleGun_Mag_20rd","RapidFireAutomaticRifleGun_Mag_50rd","Missile200mm","NATO_5p56x45mm"};

// AFTER:
string[] ammoBPNames={"SemiAutoPistolMagazine","AutomaticRifleGun_Mag_20rd","RapidFireAutomaticRifleGun_Mag_50rd","Missile200mm","NATO_5p56x45mm"};
// DELETE ammoItemNames, use ammoBPNames everywhere
```
**SAVINGS:** ~178 chars

### Pattern 2: Scroll Variable Sets (6 identical patterns)
**Lines:** 91-108
```csharp
// BEFORE:
int scroll3=0;int scrollDir3=1;int scrollDelay3=0;
int scroll2=0;int scrollDir2=1;int scrollDelay2=0;
int scroll6=0;int scrollDir6=1;int scrollDelay6=0;
int scroll4=0;int scrollDir4=1;int scrollDelay4=0;
int scroll8=0;int scrollDir8=1;int scrollDelay8=0;
int scroll9=0;int scrollDir9=1;int scrollDelay9=0;

// AFTER:
int[] scr=new int[10];int[] scrD={1,1,1,1,1,1,1,1,1,1};int[] scrDl=new int[10];
```
**SAVINGS:** ~200 chars

### Pattern 3: IGC Message Drain Loop (6+ identical)
**Lines:** 449, 530, 612, 635, 652, 691
```csharp
// BEFORE (repeated 6+ times):
while(listener.HasPendingMessage){
    var msg=listener.AcceptMessage();
    if(msg.Data is string){
        // process
    }
}

// AFTER (helper function):
void Dr(IMyBroadcastListener l,Action<string> h){while(l.HasPendingMessage){var m=l.AcceptMessage();if(m.Data is string)h((string)m.Data);}}
```
**SAVINGS:** ~100 chars

### Pattern 4: Battery/Tank Percentage Calculation (8+ identical)
**Lines:** 876, 877, 878, 1065, 1066, etc.
```csharp
// BEFORE (repeated 8+ times):
if(list.Count>0){float c=0,m=0;foreach(var b in list){c+=b.CurrentStoredPower;m+=b.MaxStoredPower;}pct=m>0?(c/m)*100:0;}

// AFTER (helper):
float Pct<T>(List<T> l,Func<T,float> c,Func<T,float> m){float tc=0,tm=0;foreach(var x in l){tc+=c(x);tm+=m(x);}return tm>0?(tc/tm)*100:0;}
```
**SAVINGS:** ~200 chars

---

## ENUM VALUE ABBREVIATIONS

### State Enum (S)
Already abbreviated:
- `S.INIT`, `S.IDLE`, `S.PRINT`, `S.BUILD`, `S.DOCK`, `S.FUEL`, `S.AMMO`, `S.READY`, `S.ARM`, `S.LAUNCH`, `S.GONE`

### Menu Enum (M)
Already abbreviated:
- `M.MAIN`, `M.TGT`, `M.SET`, `M.ARM`, `M.WIZARD`, `M.VIEW`

### Target Mode Enum (T)
Already abbreviated:
- `T.GPS`, `T.ANTENNA`, `T.SENSOR`, `T.LIDAR`, `T.MANUAL`, `T.SATELLITE`

### Environment Enum (E)
Already abbreviated:
- `E.UNKNOWN`, `E.SPACE`, `E.PLANET`, `E.MOON`

---

## LCD DISPLAY CODE DEDUPLICATION

### Common Pattern in UpdateLCD1-10
Each LCD function follows:
1. `sb.Clear()`
2. Check for controller mode
3. Check for GONE state (flight mode)
4. Build content
5. Handle scrolling
6. Call `SetLCD()`

**Potential Helper:**
```csharp
void LCD(IMyTextPanel p,bool ctrl,Func<bool> goneChk,Func<string> ctrlFn,Func<string> goneFn,Func<string> normFn,int clr=0){
    sb.Clear();
    if(ctrl){SetLCD(p,ctrlFn(),clr);return;}
    if(goneChk()){SetLCD(p,goneFn(),1);return;}
    SetLCD(p,normFn(),clr);
}
```

---

## MINIFICATION SUMMARY

| Category | Potential Savings |
|----------|-------------------|
| IGC Channel Names | ~108 chars |
| Duplicate ammoItemNames | ~178 chars |
| Scroll Variable Consolidation | ~200 chars |
| IGC Loop Pattern | ~100 chars |
| Percentage Calc Pattern | ~200 chars |
| Variable Name Abbreviation | ~400 chars |
| Function Name Abbreviation | ~300 chars |
| String Literal Abbreviation | ~200 chars |
| **TOTAL POTENTIAL** | **~1,686 chars** |

**Current Margin:** 118 chars (as of 2026-01-16)
**Deployed Size:** 99,882 chars

---

## CRITICAL NOTES

1. **MDK Minifier Already Active** - `mdk.ini` has `minify=full` which strips whitespace, shortens local variables, and removes comments. Our focus is on:
   - Removing truly duplicate code (ammoItemNames)
   - Consolidating redundant patterns (scroll vars)
   - Shortening string literals that MDK can't touch

2. **Don't Break IGC Compatibility** - Channel names must match across UnityPad, UnityMissile, and MinerBeacon. Abbreviating requires updating ALL scripts.

3. **Enum Names Preserved** - MDK preserve regions protect enums from minification.

4. **Test After Each Change** - Build and verify deployed size after each modification.

---

## IMPLEMENTATION ORDER

1. **Safe First:** Remove duplicate `ammoItemNames` array (~178 chars)
2. **Safe Second:** Consolidate scroll variables (~200 chars)
3. **Test Build:** Verify no regressions
4. **Medium Risk:** IGC loop helper function (~100 chars)
5. **Higher Risk:** IGC channel abbreviation (requires multi-file update)

---

*Unity AI Lab - Missile Systems Division*
*Minification Architecture Document - 2026-01-16*
