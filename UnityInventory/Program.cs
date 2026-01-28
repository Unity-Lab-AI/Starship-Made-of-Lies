using Sandbox.Game.EntityComponents;
using Sandbox.ModAPI.Ingame;
using Sandbox.ModAPI.Interfaces;
using SpaceEngineers.Game.ModAPI.Ingame;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text;
using VRage;
using VRage.Collections;
using VRage.Game;
using VRage.Game.Components;
using VRage.Game.GUI.TextPanel;
using VRage.Game.ModAPI.Ingame;
using VRage.Game.ModAPI.Ingame.Utilities;
using VRage.Game.ObjectBuilders.Definitions;
using VRageMath;

namespace IngameScript
{
    public partial class Program : MyGridProgram
    {        int padID=0;int tick=0;bool setupDone=false;bool autoOrg=true;int viewIdx=0,graphIdx=0,scrollOff=0,viewPause=0;
        bool bootDone=false,sentAck=false;
        float lcdW=512,lcdH=512,lcdS=1,lcdYS=1;
        string padTag="[PAD1";
        IMyButtonPanel btn;
        IMyTextSurface lcd4,lcd5,lcd6,lcd9,lcd10,lcd11;
        int lcd11Scroll=0;
        IMyBroadcastListener bcnL;
        Dictionary<long,MinerData> trkM=new Dictionary<long,MinerData>();
        class MinerData{public string name;public float bat,crg,h2,o2;public Vector3D pos;public double spd,alt,dist;public string status;public int drills,drillsOn,grinders,grindersOn;public bool docked;public DateTime lastSeen;public int portNum;public double outboundSecs,returnSecs,etaSecs;public int cycles;public bool outbound;public int ice,uranium,o2Tanks,genCount,reactCount;public string cargoRaw="";public Dictionary<string,int> cargoItems=new Dictionary<string,int>();}
        Color cPri=new Color(0,180,255);
        Color cSec=new Color(100,100,100);
        Color cAcc=new Color(255,200,0);
        Color cOK=new Color(0,255,100);
        Color cWrn=new Color(255,180,0);
        Color cErr=new Color(255,60,60);
        Color cBg=new Color(10,10,15);
        Color cBdr=new Color(40,40,50);
        Color cTxt=new Color(220,220,220);
        List<float> pwrHist=new List<float>();
        List<float> h2Hist=new List<float>();
        List<float> o2Hist=new List<float>();
        List<float> cargoHist=new List<float>();
        List<float> refHist=new List<float>();
        List<float> asmHist=new List<float>();
        List<float> prodHist=new List<float>();
        List<float> pwrInHist=new List<float>();
        List<float> pwrOutHist=new List<float>();
        List<float> solarHist=new List<float>();
        List<float> windHist=new List<float>();
        List<float> reactHist=new List<float>();
        List<float> genHist=new List<float>();
        const int HIST_MAX=60;
        IMyCargoContainer toolCargo=null,oreCargo=null,ingotCargo=null,compCargo=null,ammoCargo=null,bottleCargo=null,pAmmoCargo=null,foodCargo=null,dataCargo=null,miscCargo=null;
        List<IMyCargoContainer> subgridCargo=new List<IMyCargoContainer>();
        List<IMyCargoContainer> padCargo=new List<IMyCargoContainer>(),padCargoL=new List<IMyCargoContainer>(),padCargoM=new List<IMyCargoContainer>(),padCargoS=new List<IMyCargoContainer>();
        List<IMyCargoContainer> sharedCargo=new List<IMyCargoContainer>();
        List<IMyRefinery> padRef=new List<IMyRefinery>();
        List<IMyAssembler> padAsm=new List<IMyAssembler>();
        List<IMyReactor> padReact=new List<IMyReactor>();
        List<IMyGasGenerator> padGen=new List<IMyGasGenerator>();
        List<IMyShipConnector> oreC=new List<IMyShipConnector>();
        HashSet<long> minerGrids=new HashSet<long>();
        Dictionary<string,int> oStk=new Dictionary<string,int>();
        Dictionary<string,int> cStk=new Dictionary<string,int>();
        Dictionary<string,int> iStk=new Dictionary<string,int>();
        Dictionary<string,int> iNd=new Dictionary<string,int>();
        Dictionary<string,int> cNd=new Dictionary<string,int>();
        Dictionary<string,int> cMis=new Dictionary<string,int>();
        Dictionary<string,int> cQd=new Dictionary<string,int>();
        Dictionary<string,int> bpNd=new Dictionary<string,int>();
        Dictionary<string,int> oNd=new Dictionary<string,int>();
        Dictionary<string,int> aIN=new Dictionary<string,int>();
        Dictionary<string,int> pAmmoStk=new Dictionary<string,int>();
        Dictionary<string,int> pAmmoQ=new Dictionary<string,int>();
        Dictionary<string,int> tStk=new Dictionary<string,int>();
        Dictionary<string,int> tQ=new Dictionary<string,int>();
        Dictionary<string,int> tNd=new Dictionary<string,int>();
        Dictionary<string,int> tMis=new Dictionary<string,int>();
        Dictionary<string,int> paNd=new Dictionary<string,int>();
        Dictionary<string,int> paMis=new Dictionary<string,int>();
        Dictionary<string,int> bNd=new Dictionary<string,int>();
        Dictionary<string,int> bStk=new Dictionary<string,int>();
        Dictionary<string,int> bQd=new Dictionary<string,int>();
        Dictionary<string,int> bMis=new Dictionary<string,int>();
        Dictionary<string,int> foodStk=new Dictionary<string,int>();
        Dictionary<string,int> miscStk=new Dictionary<string,int>();
        Dictionary<string,MyDefinitionId> tBPx=new Dictionary<string,MyDefinitionId>();
        Dictionary<string,MyDefinitionId> paBPx=new Dictionary<string,MyDefinitionId>();
        Dictionary<string,MyDefinitionId> bBPx=new Dictionary<string,MyDefinitionId>();
        Dictionary<string,MyDefinitionId> taBPx=new Dictionary<string,MyDefinitionId>();
        Dictionary<string,int> taStk=new Dictionary<string,int>();
        Dictionary<string,int> taNd=new Dictionary<string,int>();
        Dictionary<string,int> taMis=new Dictionary<string,int>();
        Dictionary<string,int> taQ=new Dictionary<string,int>();
        int taTarget=500;
        int ammoStock=0,ammoTarget=500,ammoQueued=0,ammoLoad=10106,ammoTypeIdx=0;
        bool ammoReq=false;int ammoReqType=0,ammoReqNeed=0,mslConCnt=0,ammoPushed=0;
        IMyShipConnector padCon=null;
        int pH2B=0,pO2B=0,h2Target=20,o2Target=20,h2Queued=0,o2Queued=0;
        int pIceStg=0,pIceGen=0,pUrnStg=0,pUrnReact=0,iceTarget=0,uranTarget=0;
        int toolTarget=20,mslAmmoTarget=50000;
        HashSet<string> itemRecycle=new HashSet<string>();
        float padCargoPct=0,padBatPct=0,padH2Pct=0,padO2Pct=0;
        int padMedCount=0,padSurvCount=0,padCryoCount=0;
        string padMode="NORMAL";
        string mslPhase="IDLE",mslTarget="---";float mslDist=0,mslSpeed=0,mslAlt=0,mslFuel=0,mslETA=0;int mslCount=0,mslArmed=0,mslReady=0;
        int ctrlPads=0,ctrlArmed=0,ctrlReady=0;string ctrlMode="GPS",ctrlTarget="---",ctrlStatus="IDLE";
        float mslBatPct=0,mslH2Pct=0,mslO2Pct=0,mslH2Fill=0,mslH2Cap=0,mslO2Fill=0,mslO2Cap=0,mslBatC=0,mslBatM=0;
        int mslIce=0,mslUran=0,mslAmmo=0,mslAmmoLoad=0,warCount=0,mslGenCnt=0,mslH2Cnt=0,mslO2Cnt=0,mslReactCnt=0,mslLsrCnt=0,mslLsrLnk=0,mslAntCnt=0;
        bool warArmed=false,conLocked=false,mergeConn=false;
        string prtPhase="CHECKING";int prtState=0,prtRem=0,prtTot=0,prtBld=0;float prtPist=0;bool printing=false;
        const string BP="MyObjectBuilder_BlueprintDefinition/";
        const string OB="MyObjectBuilder_";
        string[] ammoNames={"S-10 Pistol","MR-20 Rifle","MR-50A Rifle","200mm Missile","25x184mm NATO","Autocannon","Assault Cannon","Artillery","Small Railgun","Large Railgun"};
        string[] ammoBPNames={"Position0010_SemiAutoPistolMagazine","Position0040_AutomaticRifleGun_Mag_20rd","Position0050_RapidFireAutomaticRifleGun_Mag_50rd","Position0100_Missile200mm","Position0080_NATO_25x184mmMagazine","Position0090_AutocannonClip","Position0110_MediumCalibreAmmo","Position0120_LargeCalibreAmmo","Position0130_SmallRailgunAmmo","Position0140_LargeRailgunAmmo"};
        string[] ammoITNames={"SemiAutoPistolMagazine","AutomaticRifleGun_Mag_20rd","RapidFireAutomaticRifleGun_Mag_50rd","Missile200mm","NATO_25x184mm","AutocannonClip","MediumCalibreAmmo","LargeCalibreAmmo","SmallRailgunAmmo","LargeRailgunAmmo"};
        MyDefinitionId ammoBP;
        MyItemType ammoType;
        MyItemType h2BottleType=MyItemType.Parse(OB+"GasContainerObject/HydrogenBottle");
        MyItemType o2BottleType=MyItemType.Parse(OB+"OxygenContainerObject/OxygenBottle");
        Dictionary<string,MyDefinitionId> compBP=new Dictionary<string,MyDefinitionId>{
        {"SteelPlate",MyDefinitionId.Parse(BP+"SteelPlate")},
        {"Construction",MyDefinitionId.Parse(BP+"ConstructionComponent")},
        {"SmallTube",MyDefinitionId.Parse(BP+"SmallTube")},
        {"LargeTube",MyDefinitionId.Parse(BP+"LargeTube")},
        {"Motor",MyDefinitionId.Parse(BP+"MotorComponent")},
        {"Computer",MyDefinitionId.Parse(BP+"ComputerComponent")},
        {"MetalGrid",MyDefinitionId.Parse(BP+"MetalGrid")},
        {"Display",MyDefinitionId.Parse(BP+"Display")},
        {"BulletproofGlass",MyDefinitionId.Parse(BP+"BulletproofGlass")},
        {"PowerCell",MyDefinitionId.Parse(BP+"PowerCell")},
        {"Thrust",MyDefinitionId.Parse(BP+"ThrustComponent")},
        {"Explosives",MyDefinitionId.Parse(BP+"ExplosivesComponent")},
        {"Detector",MyDefinitionId.Parse(BP+"DetectorComponent")},
        {"RadioCommunication",MyDefinitionId.Parse(BP+"RadioCommunicationComponent")},
        {"GravityGenerator",MyDefinitionId.Parse(BP+"GravityGeneratorComponent")},
        {"InteriorPlate",MyDefinitionId.Parse(BP+"InteriorPlate")},
        {"Girder",MyDefinitionId.Parse(BP+"GirderComponent")},
        {"Medical",MyDefinitionId.Parse(BP+"MedicalComponent")},
        {"Reactor",MyDefinitionId.Parse(BP+"ReactorComponent")},
        {"SolarCell",MyDefinitionId.Parse(BP+"SolarCell")},
        {"Superconductor",MyDefinitionId.Parse(BP+"Superconductor")},
        {"Canvas",MyDefinitionId.Parse(BP+"Position0030_Canvas")},
        {"ZoneChip",MyDefinitionId.Parse(BP+"ZoneChip")},
        {"PrototechCapacitor",MyDefinitionId.Parse(BP+"PrototechCapacitor")},
        {"PrototechCircuitry",MyDefinitionId.Parse(BP+"PrototechCircuitry")},
        {"PrototechCoolingUnit",MyDefinitionId.Parse(BP+"PrototechCoolingUnit")},
        {"PrototechFrame",MyDefinitionId.Parse(BP+"PrototechFrame")},
        {"PrototechMachinery",MyDefinitionId.Parse(BP+"PrototechMachinery")},
        {"PrototechPanel",MyDefinitionId.Parse(BP+"PrototechPanel")},
        {"PrototechPropulsionUnit",MyDefinitionId.Parse(BP+"PrototechPropulsionUnit")}};
        string[] tlsNames={"Drill","Welder","Grinder","Rifle","Pistol","Launcher","Flare"};
        string[][] tIT={new[]{"handdrill","handdrill2","handdrill3","handdrill4"},new[]{"welder","welder2","welder3","welder4"},new[]{"anglegrinder","anglegrinder2","anglegrinder3","anglegrinder4"},new[]{"automaticrifle","preciseautomaticrifle","rapidfireautomaticrifle","ultimateautomaticrifle"},new[]{"semiautopistol","fullautopistol","elitepistol"},new[]{"basichandheldlauncher","advancedhandheldlauncher"},new[]{"flaregun"}};
        string[] pAmmoBP={"AutomaticRifleGun_Mag_20rd","PreciseAutomaticRifleGun_Mag_5rd","RapidFireAutomaticRifleGun_Mag_50rd","UltimateAutomaticRifleGun_Mag_30rd","SemiAutoPistolMagazine","FullAutoPistolMagazine","ElitePistolMagazine","Missile200mm","FlareClip"};
        string[] pAmmoIT={"AutomaticRifleGun_Mag_20rd","PreciseAutomaticRifleGun_Mag_5rd","RapidFireAutomaticRifleGun_Mag_50rd","UltimateAutomaticRifleGun_Mag_30rd","SemiAutoPistolMagazine","FullAutoPistolMagazine","ElitePistolMagazine","Missile200mm","FlareClip"};
        
        public Program(){
        Runtime.UpdateFrequency=UpdateFrequency.Update100;
        if(tlsNames.Length==0||tIT.Length==0||pAmmoBP.Length==0||pAmmoIT.Length==0)return;
        LoadStorage();
        if(mslAmmoTarget<1000)mslAmmoTarget=50000;
        UpdatePadTag();
        UpdateAmmoType();
        bcnL=IGC.RegisterBroadcastListener("MINER_BEACON");
        bootReqL=IGC.RegisterBroadcastListener("UNITY_BOOT_REQ");
        InitBlueprints();
        SetDefaultQuotas();
        Scan();
        ClearForBoot();
        }
        void ClearForBoot(){
        int cc=padCargo.Count,rc=padRef.Count,ac=padAsm.Count,gc=padGen.Count;
        var tanks=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(tanks,t=>t.CubeGrid==Me.CubeGrid);
        int h2c=0,o2c=0;foreach(var t in tanks){if(t.BlockDefinition.SubtypeId.Contains("Hydrogen"))h2c++;else o2c++;}
        FindSiblingPBs();
        string padSess="";string padNm="NOT_FOUND";
        if(padPB!=null){padNm=padPB.CustomName;string pcd=padPB.CustomData;int idx=pcd.IndexOf("pad_session=");if(idx>=0){int end=pcd.IndexOf('\n',idx);if(end<0)end=pcd.Length;padSess=pcd.Substring(idx+12,end-idx-12).Trim();}}
        Me.CustomData=$"[SYSTEM]\ninv_ready=true\ninv_for_session={padSess}\ninv_padPB={padNm}\ninv_myID={padID}\ninv_status=OK:cargo={cc},ref={rc},asm={ac},gen={gc},h2={h2c},o2={o2c}\n[QUOTAS]\n[MISSILE]\n[CONFIG]\n[WAYPOINTS]\n[STATUS]\n[ORE]\n[INGOTS]\n[COMPONENTS]\n[TURRET_AMMO]\n[BOTTLES]\n[TOOLS_WEAPONS]\n[PERSONAL_AMMO]\n";
        }
        void InitBlueprints(){
        tBPx["handdrill"]=MyDefinitionId.Parse(BP+"Position0050_HandDrill");tBPx["handdrill2"]=MyDefinitionId.Parse(BP+"Position0060_HandDrill2");tBPx["handdrill3"]=MyDefinitionId.Parse(BP+"Position0070_HandDrill3");tBPx["handdrill4"]=MyDefinitionId.Parse(BP+"Position0080_HandDrill4");
        tBPx["welder"]=MyDefinitionId.Parse(BP+"Position0090_Welder");tBPx["welder2"]=MyDefinitionId.Parse(BP+"Position0100_Welder2");tBPx["welder3"]=MyDefinitionId.Parse(BP+"Position0110_Welder3");tBPx["welder4"]=MyDefinitionId.Parse(BP+"Position0120_Welder4");
        tBPx["anglegrinder"]=MyDefinitionId.Parse(BP+"Position0010_AngleGrinder");tBPx["anglegrinder2"]=MyDefinitionId.Parse(BP+"Position0020_AngleGrinder2");tBPx["anglegrinder3"]=MyDefinitionId.Parse(BP+"Position0030_AngleGrinder3");tBPx["anglegrinder4"]=MyDefinitionId.Parse(BP+"Position0040_AngleGrinder4");
        tBPx["automaticrifle"]=MyDefinitionId.Parse(BP+"Position0040_AutomaticRifle");tBPx["preciseautomaticrifle"]=MyDefinitionId.Parse(BP+"Position0060_PreciseAutomaticRifle");tBPx["rapidfireautomaticrifle"]=MyDefinitionId.Parse(BP+"Position0050_RapidFireAutomaticRifle");tBPx["ultimateautomaticrifle"]=MyDefinitionId.Parse(BP+"Position0070_UltimateAutomaticRifle");
        tBPx["semiautopistol"]=MyDefinitionId.Parse(BP+"Position0010_SemiAutoPistol");tBPx["fullautopistol"]=MyDefinitionId.Parse(BP+"Position0020_FullAutoPistol");tBPx["elitepistol"]=MyDefinitionId.Parse(BP+"Position0030_EliteAutoPistol");
        tBPx["basichandheldlauncher"]=MyDefinitionId.Parse(BP+"Position0080_BasicHandHeldLauncher");tBPx["advancedhandheldlauncher"]=MyDefinitionId.Parse(BP+"Position0090_AdvancedHandHeldLauncher");
        tBPx["flaregun"]=MyDefinitionId.Parse(BP+"Position0050_FlareGun");
        paBPx["AutomaticRifleGun_Mag_20rd"]=MyDefinitionId.Parse(BP+"Position0040_AutomaticRifleGun_Mag_20rd");paBPx["PreciseAutomaticRifleGun_Mag_5rd"]=MyDefinitionId.Parse(BP+"Position0060_PreciseAutomaticRifleGun_Mag_5rd");paBPx["RapidFireAutomaticRifleGun_Mag_50rd"]=MyDefinitionId.Parse(BP+"Position0050_RapidFireAutomaticRifleGun_Mag_50rd");paBPx["UltimateAutomaticRifleGun_Mag_30rd"]=MyDefinitionId.Parse(BP+"Position0070_UltimateAutomaticRifleGun_Mag_30rd");
        paBPx["SemiAutoPistolMagazine"]=MyDefinitionId.Parse(BP+"Position0010_SemiAutoPistolMagazine");paBPx["FullAutoPistolMagazine"]=MyDefinitionId.Parse(BP+"Position0020_FullAutoPistolMagazine");paBPx["ElitePistolMagazine"]=MyDefinitionId.Parse(BP+"Position0030_ElitePistolMagazine");
        paBPx["Missile200mm"]=MyDefinitionId.Parse(BP+"Position0100_Missile200mm");paBPx["FlareClip"]=MyDefinitionId.Parse(BP+"Position0051_FlareGunMagazine");
        bBPx["HydrogenBottle"]=MyDefinitionId.Parse(BP+"Position0020_HydrogenBottle");bBPx["OxygenBottle"]=MyDefinitionId.Parse(BP+"Position0010_OxygenBottle");
        bBPx["Medkit"]=MyDefinitionId.Parse(BP+"Position0021_Medkit");bBPx["Powerkit"]=MyDefinitionId.Parse(BP+"Position0022_Powerkit");
        taBPx["NATO_25x184mm"]=MyDefinitionId.Parse(BP+"Position0080_NATO_25x184mmMagazine");taBPx["AutocannonClip"]=MyDefinitionId.Parse(BP+"Position0090_AutocannonClip");taBPx["MediumCalibreAmmo"]=MyDefinitionId.Parse(BP+"Position0110_MediumCalibreAmmo");taBPx["LargeCalibreAmmo"]=MyDefinitionId.Parse(BP+"Position0120_LargeCalibreAmmo");taBPx["SmallRailgunAmmo"]=MyDefinitionId.Parse(BP+"Position0130_SmallRailgunAmmo");taBPx["LargeRailgunAmmo"]=MyDefinitionId.Parse(BP+"Position0140_LargeRailgunAmmo");taBPx["Missile200mm"]=MyDefinitionId.Parse(BP+"Position0100_Missile200mm");
        }
        bool IsBootComplete(){if(bootPB==null)FindSiblingPBs();if(bootPB==null)return false;string cd=bootPB.CustomData;if(!cd.Contains("boot_complete=true")||!cd.Contains("boot_phase=COMPLETE"))return false;if(padPB==null)return true;string pcd=padPB.CustomData;int idx=pcd.IndexOf("pad_session=");if(idx<0)return true;int end=pcd.IndexOf('\n',idx);if(end<0)end=pcd.Length;string ps=pcd.Substring(idx+12,end-idx-12).Trim();return cd.Contains($"boot_for_session={ps}");}
        bool IsBootRunning(){if(bootPB==null)FindSiblingPBs();if(bootPB==null)return false;return bootPB.CustomData.Contains("boot_complete=BOOTING");}
        bool IsBootStale(){if(bootPB==null)FindSiblingPBs();if(bootPB==null)return true;return bootPB.CustomData.Contains("boot_complete=STALE")||(!bootPB.CustomData.Contains("boot_complete=true")&&!bootPB.CustomData.Contains("boot_complete=BOOTING"));}
        void SendRunningAck(){if(sentAck)return;IGC.SendBroadcastMessage("UNITY_BOOT_ACK","INV_RUNNING");sentAck=true;}
        IMyBroadcastListener bootReqL;
        IMyProgrammableBlock bootPB,padPB;
        void FindSiblingPBs(){bootPB=padPB=null;var pbs=new List<IMyProgrammableBlock>();GridTerminalSystem.GetBlocksOfType(pbs,b=>b.CubeGrid==Me.CubeGrid&&b!=Me);foreach(var pb in pbs){string nm=pb.CustomName;string nmU=nm.ToUpper();if(nm.Contains($"[PAD{padID}")&&nmU.Contains("UNITY BOOT"))bootPB=pb;else if(nm.Contains($"[PAD{padID}]")&&nmU.Contains("UNITY PAD"))padPB=pb;else if(nmU.Contains("UNITY PAD")&&padPB==null)padPB=pb;}}
        void CheckBootRequest(){while(bootReqL!=null&&bootReqL.HasPendingMessage){var msg=bootReqL.AcceptMessage();string d=msg.Data.ToString();if(d=="INV_CHECK"||d==$"INV_CHECK:{padID}")SendBootResponse();}}
        void SendBootResponse(){int cc=padCargo.Count,rc=padRef.Count,ac=padAsm.Count,gc=padGen.Count;int h2c=0,o2c=0;var tanks=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(tanks,t=>t.CubeGrid==Me.CubeGrid);foreach(var t in tanks){if(t.BlockDefinition.SubtypeId.Contains("Hydrogen"))h2c++;else o2c++;}string rsp=$"INV|OK|cargo={cc},ref={rc},asm={ac},gen={gc},h2={h2c},o2={o2c}";IGC.SendBroadcastMessage("UNITY_BOOT_RSP",rsp);string cd=Me.CustomData;cd=cd.Replace("inv_check=request","inv_check=done");cd=cd.Replace("inv_status=waiting",$"inv_status=OK:cargo={cc},ref={rc},asm={ac},gen={gc},h2={h2c},o2={o2c}");Me.CustomData=cd;}
        public void Save(){Storage=$"{padID}|{ammoTarget}|{toolTarget}|{(autoOrg?"1":"0")}|{h2Target}|{o2Target}|{iceTarget}|{uranTarget}|{mslAmmoTarget}";}
        void LoadStorage(){if(string.IsNullOrEmpty(Storage))return;var p=Storage.Split('|');int L=p.Length;if(L>=1)int.TryParse(p[0],out padID);if(L>=2)int.TryParse(p[1],out ammoTarget);if(L>=3)int.TryParse(p[2],out toolTarget);if(L>=4)autoOrg=p[3]=="1";if(L>=5)int.TryParse(p[4],out h2Target);if(L>=6)int.TryParse(p[5],out o2Target);if(L>=7)int.TryParse(p[6],out iceTarget);if(L>=8)int.TryParse(p[7],out uranTarget);if(L>=9)int.TryParse(p[8],out mslAmmoTarget);}
        void UpdatePadTag(){if(padID==0)padID=1;padTag=$"[PAD{padID}";Me.CustomName=$"[PAD{padID}] UNITY INVENTORY";}
        void UpdateAmmoType(){ammoBP=MyDefinitionId.Parse(BP+ammoBPNames[ammoTypeIdx]);ammoType=MyItemType.Parse(OB+"AmmoMagazine/"+ammoITNames[ammoTypeIdx]);}
        
        public void Main(string a,UpdateType u){
        tick++;
        if(padPB==null)FindSiblingPBs();
        if(btn==null){var bp=new List<IMyButtonPanel>();GridTerminalSystem.GetBlocksOfType(bp,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.ToLower().Contains("control"));if(bp.Count>0)btn=bp[0];}
        CheckBootRequest();
        if(!bootDone&&IsBootStale()){Echo("UNITY INVENTORY");Echo("Awaiting boot compile...");return;}
        if(IsBootRunning()){Echo("UNITY INVENTORY");Echo("Boot in progress...");return;}
        if(!IsBootComplete()){bootDone=false;Echo("UNITY INVENTORY");Echo("Waiting for boot...");return;}
        SendRunningAck();
        if(!bootDone){bootDone=true;EnsureLCDs();Scan();}
        int totItems=oStk.Count+iStk.Count+cStk.Count+tStk.Count+pAmmoStk.Count+(pH2B>0?1:0)+(pO2B>0?1:0)+(ammoStock>0?1:0);
        if(viewIdx==4||viewIdx==5){if(tick%2==0)scrollOff++;viewPause++;if(viewPause>30){viewPause=0;scrollOff=0;viewIdx=(viewIdx+1)%7;}}
        else{viewPause++;if(viewPause>30){viewPause=0;scrollOff=0;viewIdx=(viewIdx+1)%7;}}
        if(tick%30==0)graphIdx=(graphIdx+1)%12;
        if(a!="")HandleArg(a);
        if(tick%2==0)Scan();
        if(tick%2==0)ManageInventory();
        CheckBeacons();
        if(tick%5==0)ReadBtnSettings();
        if(tick%3==0)CountStocks();
        if(tick%5==0)WriteBtnData();
        ReadPadSettings();
        LoadMissileAmmo();
        if(tick%2==0)UpdateLCDs();
        Echo("Unity Missile System");
        Echo($"UnityInventory [PAD{padID}]");
        Echo("---");
        string btnSt=btn!=null?"Connected":"MISSING";
        string asmSt=padAsm.Count>0?$"{padAsm.Count} Online":"NONE";
        string refSt=padRef.Count>0?$"{padRef.Count} Online":"NONE";
        bool hasQ=cQd.Count>0||ammoQueued>0||h2Queued>0||o2Queued>0;
        string prodSt=hasQ?"Queuing Production":"Idle";
        string sortSt=autoOrg?"Auto-Sorting Active":"Manual Sort Only";
        Echo($"Button Panel: {btnSt}");
        Echo($"Assemblers: {asmSt}");
        Echo($"Refineries: {refSt}");
        Echo($"Production: {prodSt}");
        Echo($"Inventory: {sortSt}");
        Echo($"Item Types: {totItems} tracked");
        Echo($"Miners: {trkM.Count} tracked");
        if(padAsm.Count==0)Echo("WARNING: No assemblers found");
        if(btn==null)Echo("WARNING: No button panel found");
        Echo("--- COMMANDS ---");
        Echo("SORT - Force inventory sort");
        Echo("RESCAN - Refresh all blocks");
        Echo("AUTOORG - Toggle auto-sorting");
        }
        
        void HandleArg(string a){switch(a.ToUpper()){case"SORT":HardSort();break;case"RESCAN":Scan();break;case"AUTOORG":autoOrg=!autoOrg;break;}}
        
        void Scan(){
        padCargo.Clear();padCargoL.Clear();padCargoM.Clear();padCargoS.Clear();padRef.Clear();padAsm.Clear();padReact.Clear();padGen.Clear();oreC.Clear();if(btn!=null&&btn.Closed)btn=null;padCon=null;
        toolCargo=oreCargo=ingotCargo=compCargo=ammoCargo=bottleCargo=pAmmoCargo=foodCargo=dataCargo=miscCargo=null;sharedCargo.Clear();subgridCargo.Clear();
        if(lcd4!=null&&((IMyTerminalBlock)lcd4).Closed)lcd4=null;
        if(lcd5!=null&&((IMyTerminalBlock)lcd5).Closed)lcd5=null;
        if(lcd6!=null&&((IMyTerminalBlock)lcd6).Closed)lcd6=null;
        if(lcd9!=null&&((IMyTerminalBlock)lcd9).Closed)lcd9=null;
        if(lcd10!=null&&((IMyTerminalBlock)lcd10).Closed)lcd10=null;
        if(lcd11!=null&&((IMyTerminalBlock)lcd11).Closed)lcd11=null;
        padMedCount=0;padSurvCount=0;padCryoCount=0;
        var blks=new List<IMyTerminalBlock>();
        GridTerminalSystem.GetBlocksOfType(blks,b=>b.CubeGrid==Me.CubeGrid);
        foreach(var b in blks){
        if(b is IMyButtonPanel&&b.CustomName.ToLower().Contains("control")&&btn==null)btn=b as IMyButtonPanel;
        if(b is IMyRefinery)padRef.Add(b as IMyRefinery);
        if(b is IMyAssembler){string ast=b.BlockDefinition.SubtypeId;if(!ast.Contains("Survival")&&!ast.Contains("Kit"))padAsm.Add(b as IMyAssembler);}
        if(b is IMyReactor)padReact.Add(b as IMyReactor);
        if(b is IMyGasGenerator)padGen.Add(b as IMyGasGenerator);
        if(b is IMyShipConnector){var cn=b as IMyShipConnector;string u=b.CustomName.ToUpper();if(u.Contains("ORE"))oreC.Add(cn);else if(padCon==null&&u.Contains("FUEL"))padCon=cn;}
        if(b is IMyMedicalRoom){string st=b.BlockDefinition.SubtypeId;if(st.Contains("Survival")||st.Contains("Kit"))padSurvCount++;else padMedCount++;}
        if(b is IMyCockpit&&b.BlockDefinition.SubtypeId.Contains("Cryo"))padCryoCount++;
        if(b is IMyTextSurface||b is IMyTextPanel){string nm=b.CustomName;if(!nm.Contains(padTag))continue;IMyTextSurface ts=b is IMyTextSurface?(IMyTextSurface)b:((IMyTextPanel)b);if(nm.Contains(":11")&&lcd11==null)lcd11=ts;else if(nm.Contains(":10")&&lcd10==null)lcd10=ts;else if(nm.Contains(":4")&&lcd4==null)lcd4=ts;else if(nm.Contains(":5")&&lcd5==null)lcd5=ts;else if(nm.Contains(":6")&&lcd6==null)lcd6=ts;else if(nm.Contains(":9")&&lcd9==null)lcd9=ts;}
        }
        if(btn==null){var allBtn=new List<IMyButtonPanel>();GridTerminalSystem.GetBlocksOfType(allBtn,b=>b.CubeGrid==Me.CubeGrid);foreach(var bp in allBtn)if(bp.CustomName.ToLower().Contains("control")&&btn==null)btn=bp;}
        if(btn==null){var allBtn=new List<IMyButtonPanel>();GridTerminalSystem.GetBlocksOfType(allBtn);foreach(var bp in allBtn)if(bp.CustomName.ToLower().Contains("control")&&btn==null)btn=bp;}
        var sgBlks=new List<IMyTerminalBlock>();GridTerminalSystem.GetBlocksOfType(sgBlks,b=>b.IsSameConstructAs(Me)&&b.CubeGrid!=Me.CubeGrid);
        foreach(var b in sgBlks){if(b is IMyRefinery&&!padRef.Contains(b as IMyRefinery))padRef.Add(b as IMyRefinery);if(b is IMyAssembler){var asm=b as IMyAssembler;string ast=b.BlockDefinition.SubtypeId;if(!ast.Contains("Survival")&&!ast.Contains("Kit")&&!padAsm.Contains(asm))padAsm.Add(asm);}if(b is IMyReactor&&!padReact.Contains(b as IMyReactor))padReact.Add(b as IMyReactor);if(b is IMyGasGenerator&&!padGen.Contains(b as IMyGasGenerator))padGen.Add(b as IMyGasGenerator);}
        var allCrg=new List<IMyCargoContainer>();
        GridTerminalSystem.GetBlocksOfType(allCrg);
        string mt=$"[pad{padID}".ToLower();
        foreach(var x in allCrg){
        string n=x.CustomName.ToLower().Replace(" ","");
        bool isMyPad=n.Contains(mt),isOtherPad=false,isShared=!n.Contains("[pad"),isOreIng=n.Contains("-ore")||n.Contains("-ingot");
        for(int p=1;p<=8;p++)if(p!=padID&&n.Contains($"[pad{p}"))isOtherPad=true;
        bool sameConstruct=x.IsSameConstructAs(Me);
        bool sameGrid=x.CubeGrid==Me.CubeGrid;
        bool isSubgrid=sameConstruct&&!sameGrid;
        if(!sameConstruct&&!isMyPad)continue;
        if(isOtherPad&&!isOreIng)continue;
        padCargo.Add(x);
        if(isSubgrid)subgridCargo.Add(x);
        string st=x.BlockDefinition.SubtypeId;
        if(st.Contains("LargeContainer"))padCargoL.Add(x);
        else if(st.Contains("MediumContainer"))padCargoM.Add(x);
        else padCargoS.Add(x);
        }
        padCargo.Sort((a,b)=>{string sa=a.BlockDefinition.SubtypeId,sb=b.BlockDefinition.SubtypeId;int la=sa.Contains("Large")?0:sa.Contains("Medium")?1:2,lb=sb.Contains("Large")?0:sb.Contains("Medium")?1:2;return la-lb;});
        foreach(var c in padCargo){
        string n=c.CustomName.ToLower().Replace(" ","");
        bool my=padID==0||n.Contains(mt),isOreIng=n.Contains("-ore")||n.Contains("-ingot");
        if(n.Contains("-ore")&&(my||isOreIng)&&oreCargo==null)oreCargo=c;
        else if(n.Contains("-ingot")&&(my||isOreIng)&&ingotCargo==null)ingotCargo=c;
        else if(n.Contains("-comp")&&my&&compCargo==null)compCargo=c;
        else if(n.Contains("-tools")&&my&&toolCargo==null)toolCargo=c;
        else if(n.Contains("-pammo")&&my&&pAmmoCargo==null)pAmmoCargo=c;
        else if(n.Contains("-ammo")&&my&&ammoCargo==null)ammoCargo=c;
        else if(n.Contains("-bottle")&&my&&bottleCargo==null)bottleCargo=c;
        else if(n.Contains("-food")&&my&&foodCargo==null)foodCargo=c;
        else if(n.Contains("-data")&&my&&dataCargo==null)dataCargo=c;
        else if(n.Contains("-misc")&&my&&miscCargo==null)miscCargo=c;
        else if(!n.Contains("[pad"))sharedCargo.Add(c);
        }
        ScanMinerGrids();
        setupDone=btn!=null&&padCargo.Count>0;
        }
        
        void ScanMinerGrids(){minerGrids.Clear();foreach(var cn in oreC){if(cn.Status!=MyShipConnectorStatus.Connected)continue;var ot=cn.OtherConnector;if(ot==null||ot.CubeGrid==Me.CubeGrid)continue;minerGrids.Add(ot.CubeGrid.EntityId);}if(padCon!=null&&padCon.Status==MyShipConnectorStatus.Connected){var ot=padCon.OtherConnector;if(ot!=null&&ot.CubeGrid!=Me.CubeGrid)minerGrids.Add(ot.CubeGrid.EntityId);}}
        
        void CountStocks(){
        oStk.Clear();iStk.Clear();cStk.Clear();tStk.Clear();bStk.Clear();taStk.Clear();foodStk.Clear();miscStk.Clear();pAmmoStk.Clear();pH2B=0;pO2B=0;
        Action<IMyInventory>cIt=v=>{if(v==null)return;foreach(var it in GL(v)){string tp=it.Type.TypeId.ToLower(),s=it.Type.SubtypeId;int a=(int)it.Amount;if(tp.Contains("ore")&&!tp.Contains("oxygencontainer"))AD(oStk,s,a);else if(tp.Contains("ingot"))AD(iStk,s,a);else if(tp.Contains("component"))AD(cStk,s,a);else if(tp.Contains("gascontainerobject"))AD(bStk,s,a);else if(tp.Contains("oxygencontainerobject"))AD(bStk,s,a);else if(tp.Contains("physicalgunobject"))AD(tStk,NT(s),a);else if(tp.Contains("consumableitem"))AD(foodStk,s,a);else if(tp.Contains("datapad"))AD(miscStk,"Datapad",a);else if(tp.Contains("physicalobject"))AD(miscStk,s,a);else AD(miscStk,s,a);}};
        Action<IMyInventory>cBA=v=>{if(v==null)return;pH2B+=(int)v.GetItemAmount(h2BottleType);pO2B+=(int)v.GetItemAmount(o2BottleType);for(int i=0;i<pAmmoIT.Length;i++){int a=(int)v.GetItemAmount(MyItemType.Parse(OB+"AmmoMagazine/"+pAmmoIT[i]));if(a>0)AD(pAmmoStk,pAmmoIT[i],a);}};
        foreach(var c in padCargo){cIt(c.GetInventory());cBA(c.GetInventory());}
        if(toolCargo!=null&&!padCargo.Contains(toolCargo))cIt(toolCargo.GetInventory());
        if(pAmmoCargo!=null&&!padCargo.Contains(pAmmoCargo))cIt(pAmmoCargo.GetInventory());
        if(ammoCargo!=null&&!padCargo.Contains(ammoCargo)){cIt(ammoCargo.GetInventory());cBA(ammoCargo.GetInventory());}
        if(bottleCargo!=null&&!padCargo.Contains(bottleCargo)){cIt(bottleCargo.GetInventory());cBA(bottleCargo.GetInventory());}
        foreach(var c in sharedCargo)if(!padCargo.Contains(c))cIt(c.GetInventory());
        foreach(var a in padAsm){var aO=a.GetInventory(1);if(aO!=null){cBA(aO);foreach(var it in GL(aO)){string tp=it.Type.TypeId.ToLower(),s=it.Type.SubtypeId;int amt=(int)it.Amount;if(tp.Contains("gascontainerobject"))AD(bStk,s,amt);else if(tp.Contains("oxygencontainerobject"))AD(bStk,s,amt);else if(tp.Contains("physicalgunobject"))AD(tStk,NT(s),amt);else if(tp.Contains("component"))AD(cStk,s,amt);}}}
        Cn("SteelPlate",6000);Cn("Construction",3500);Cn("SmallTube",3200);Cn("LargeTube",1500);Cn("Motor",1200);Cn("Computer",1500);Cn("MetalGrid",950);Cn("Display",600);Cn("BulletproofGlass",2050);Cn("PowerCell",800);Cn("Thrust",1050);Cn("Explosives",2600);Cn("Detector",1500);Cn("RadioCommunication",900);Cn("GravityGenerator",600);Cn("InteriorPlate",3000);Cn("Girder",500);Cn("Medical",200);Cn("Reactor",300);Cn("SolarCell",500);Cn("Superconductor",300);
        In("Iron",100000);In("Nickel",50000);In("Silicon",50000);In("Cobalt",30000);In("Silver",20000);In("Gold",10000);In("Magnesium",10000);In("Uranium",10000);In("Platinum",5000);In("Stone",50000);
        cMis.Clear();
        foreach(var kv in cNd){int have=0;if(cStk.ContainsKey(kv.Key))have=cStk[kv.Key];if(have<kv.Value)cMis[kv.Key]=kv.Value-have;}
        CalcMissing();
        ammoStock=0;ammoQueued=0;
        foreach(var c in padCargo){var inv=c.GetInventory();if(inv!=null)ammoStock+=(int)inv.GetItemAmount(ammoType);}
        if(ammoCargo!=null&&!padCargo.Contains(ammoCargo)){var inv=ammoCargo.GetInventory();if(inv!=null)ammoStock+=(int)inv.GetItemAmount(ammoType);}
        foreach(var a in padAsm){var inv=a.GetInventory(1);if(inv!=null)ammoStock+=(int)inv.GetItemAmount(ammoType);if(a.Mode!=MyAssemblerMode.Assembly)continue;var q=new List<MyProductionItem>();a.GetQueue(q);foreach(var i in q)if(i.BlueprintId.SubtypeName==ammoBPNames[ammoTypeIdx])ammoQueued+=(int)i.Amount;}
        h2Queued=0;o2Queued=0;bQd.Clear();tQ.Clear();pAmmoQ.Clear();taQ.Clear();
        foreach(var a in padAsm){if(a.Mode!=MyAssemblerMode.Assembly)continue;var q=new List<MyProductionItem>();a.GetQueue(q);foreach(var i in q){string bn=i.BlueprintId.SubtypeName;int amt=(int)i.Amount;string sub=SPP(bn);
        if(sub=="HydrogenBottle"){h2Queued+=amt;AD(bQd,"HydrogenBottle",amt);}
        if(sub=="OxygenBottle"){o2Queued+=amt;AD(bQd,"OxygenBottle",amt);}
        string tKey=NT(sub);if(tBPx.ContainsKey(tKey))AD(tQ,tKey,amt);
        if(paBPx.ContainsKey(sub))AD(pAmmoQ,sub,amt);
        if(taBPx.ContainsKey(sub))AD(taQ,sub,amt);}}
        foreach(var c in padCargo){var cI=c.GetInventory();if(cI==null)continue;foreach(var k in taBPx.Keys){int a=(int)cI.GetItemAmount(MyItemType.Parse(OB+"AmmoMagazine/"+k));if(a>0)AD(taStk,k,a);}}
        if(ammoCargo!=null&&!padCargo.Contains(ammoCargo)){var aI=ammoCargo.GetInventory();if(aI!=null)foreach(var k in taBPx.Keys){int a=(int)aI.GetItemAmount(MyItemType.Parse(OB+"AmmoMagazine/"+k));if(a>0)AD(taStk,k,a);}}
        if(oreCargo!=null&&!padCargo.Contains(oreCargo)){var oI=oreCargo.GetInventory();if(oI!=null)foreach(var k in taBPx.Keys){int a=(int)oI.GetItemAmount(MyItemType.Parse(OB+"AmmoMagazine/"+k));if(a>0)AD(taStk,k,a);}}
        foreach(var c in sharedCargo){var cI=c.GetInventory();if(cI==null)continue;foreach(var k in taBPx.Keys){int a=(int)cI.GetItemAmount(MyItemType.Parse(OB+"AmmoMagazine/"+k));if(a>0)AD(taStk,k,a);}}
        foreach(var c in subgridCargo){var cI=c.GetInventory();if(cI==null)continue;foreach(var k in taBPx.Keys){int a=(int)cI.GetItemAmount(MyItemType.Parse(OB+"AmmoMagazine/"+k));if(a>0)AD(taStk,k,a);}}
        pUrnStg=iStk.ContainsKey("Uranium")?iStk["Uranium"]:0;pUrnReact=0;foreach(var r in padReact){var inv=r.GetInventory();if(inv!=null)foreach(var it in GL(inv))if(it.Type.SubtypeId=="Uranium")pUrnReact+=(int)it.Amount;}
        pIceStg=oStk.ContainsKey("Ice")?oStk["Ice"]:0;pIceGen=0;foreach(var g in padGen){var inv=g.GetInventory();if(inv!=null)foreach(var it in GL(inv))if(it.Type.SubtypeId=="Ice")pIceGen+=(int)it.Amount;}
        if(padCargo.Count>0){float c=0,m=0;foreach(var g in padCargo){var i=g.GetInventory();if(i!=null){c+=(float)i.CurrentVolume;m+=(float)i.MaxVolume;}}padCargoPct=m>0?(c/m)*100:0;}else padCargoPct=0;
        var bats=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(bats,b=>b.CubeGrid==Me.CubeGrid);
        float bc=0,bm=0;foreach(var b in bats){bc+=b.CurrentStoredPower;bm+=b.MaxStoredPower;}padBatPct=bm>0?(bc/bm)*100:0;
        var tanks=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(tanks,b=>b.CubeGrid==Me.CubeGrid);
        float h2c=0,h2m=0,o2c=0,o2m=0;foreach(var t in tanks){string n=t.BlockDefinition.SubtypeId.ToLower();if(n.Contains("hydrogen")){h2c+=(float)t.FilledRatio*t.Capacity;h2m+=t.Capacity;}else{o2c+=(float)t.FilledRatio*t.Capacity;o2m+=t.Capacity;}}
        padH2Pct=h2m>0?(h2c/h2m)*100:0;padO2Pct=o2m>0?(o2c/o2m)*100:0;
        QueueProduction();
        }
        
        void QueueProduction(){if(padAsm.Count==0){Echo("NO ASSEMBLERS!");return;}var recycler=padAsm[padAsm.Count-1];for(int i=0;i<padAsm.Count-1;i++)padAsm[i].Mode=MyAssemblerMode.Assembly;int prodTgt=ammoTypeIdx==0?mslAmmoTarget:ammoTarget;if(ammoStock+ammoQueued<prodTgt){int need=prodTgt-(ammoStock+ammoQueued);int asmCnt=padAsm.Count-1;if(asmCnt<1)asmCnt=1;int perAsm=Math.Max(1,need/asmCnt);for(int i=0;i<asmCnt&&need>0;i++)if(padAsm[i].Mode==MyAssemblerMode.Assembly){padAsm[i].AddQueueItem(ammoBP,(MyFixedPoint)perAsm);ammoQueued+=perAsm;need-=perAsm;}}cQd.Clear();foreach(var a in padAsm){var q=new List<MyProductionItem>();a.GetQueue(q);foreach(var i in q){foreach(var bp in compBP){if(i.BlueprintId==bp.Value)AD(cQd,bp.Key,(int)i.Amount);}}}if(bpNd.Count>0){int asmCnt=padAsm.Count-1;if(asmCnt<1)asmCnt=1;foreach(var kv in bpNd){int have=cStk.ContainsKey(kv.Key)?cStk[kv.Key]:0;int queued=cQd.ContainsKey(kv.Key)?cQd[kv.Key]:0;int stillNeed=kv.Value-(have+queued);if(stillNeed<=0||!compBP.ContainsKey(kv.Key))continue;var bp=compBP[kv.Key];int perAsm=Math.Max(1,stillNeed/asmCnt);for(int i=0;i<asmCnt&&stillNeed>0;i++)if(padAsm[i].Mode==MyAssemblerMode.Assembly){padAsm[i].AddQueueItem(bp,(MyFixedPoint)perAsm);AD(cQd,kv.Key,perAsm);stillNeed-=perAsm;}}}if(cMis.Count>0){int asmCnt=padAsm.Count-1;if(asmCnt<1)asmCnt=1;foreach(var kv in cMis){int queued=0;if(cQd.ContainsKey(kv.Key))queued=cQd[kv.Key];int stillNeed=kv.Value-queued;if(stillNeed<=0||!compBP.ContainsKey(kv.Key))continue;var bp=compBP[kv.Key];int perAsm=Math.Max(1,stillNeed/asmCnt);for(int i=0;i<asmCnt&&stillNeed>0;i++)if(padAsm[i].Mode==MyAssemblerMode.Assembly){padAsm[i].AddQueueItem(bp,(MyFixedPoint)perAsm);AD(cQd,kv.Key,perAsm);stillNeed-=perAsm;}}}QueueMissing(tMis,tQ,tBPx,tStk,tNd);QueueMissing(paMis,pAmmoQ,paBPx,pAmmoStk,paNd);QueueMissing(bMis,bQd,bBPx,bStk,bNd);QueueMissing(taMis,taQ,taBPx,taStk,taNd);CalcAmmoIngotNeeds();FeedRefineries();FeedAssemblers();RecycleExcess();}
        
        void RecycleExcess(){
        if(padAsm.Count<2)return;
        var turBP=new Dictionary<string,MyDefinitionId>();
        turBP["NATO_25x184mm"]=MyDefinitionId.Parse(BP+"Position0080_NATO_25x184mmMagazine");
        turBP["AutocannonClip"]=MyDefinitionId.Parse(BP+"Position0090_AutocannonClip");
        turBP["MediumCalibreAmmo"]=MyDefinitionId.Parse(BP+"Position0110_MediumCalibreAmmo");
        turBP["LargeCalibreAmmo"]=MyDefinitionId.Parse(BP+"Position0120_LargeCalibreAmmo");
        turBP["SmallRailgunAmmo"]=MyDefinitionId.Parse(BP+"Position0130_SmallRailgunAmmo");
        turBP["LargeRailgunAmmo"]=MyDefinitionId.Parse(BP+"Position0140_LargeRailgunAmmo");
        turBP["Missile200mm"]=MyDefinitionId.Parse(BP+"Position0100_Missile200mm");
        var turStk=new Dictionary<string,int>();
        foreach(var c in padCargo){var cI=c.GetInventory();if(cI==null)continue;foreach(var k in turBP.Keys){int a=(int)cI.GetItemAmount(MyItemType.Parse(OB+"AmmoMagazine/"+k));if(a>0)AD(turStk,k,a);}}
        foreach(var c in sharedCargo){var cI=c.GetInventory();if(cI==null)continue;foreach(var k in turBP.Keys){int a=(int)cI.GetItemAmount(MyItemType.Parse(OB+"AmmoMagazine/"+k));if(a>0)AD(turStk,k,a);}}
        var turEx=new Dictionary<string,int>();foreach(var kv in turStk){int tgt=taNd.ContainsKey(kv.Key)?taNd[kv.Key]:taTarget;if(kv.Value>tgt)turEx[kv.Key]=kv.Value-tgt;}
        var cEx=new Dictionary<string,int>();foreach(var kv in cStk){int tgt=cNd.ContainsKey(kv.Key)?cNd[kv.Key]:0;if(kv.Value>tgt)cEx[kv.Key]=kv.Value-tgt;}
        var tEx=new Dictionary<string,int>();foreach(var kv in tStk){int tgt=tNd.ContainsKey(kv.Key)?tNd[kv.Key]:toolTarget;if(kv.Value>tgt)tEx[kv.Key]=kv.Value-tgt;}
        var paEx=new Dictionary<string,int>();for(int i=0;i<pAmmoIT.Length;i++){string key=pAmmoIT[i];if(taBPx.ContainsKey(key))continue;int have=pAmmoStk.ContainsKey(key)?pAmmoStk[key]:0;int tgt=paNd.ContainsKey(key)?paNd[key]:500;if(have>tgt)paEx[key]=have-tgt;}
        int h2Ex=pH2B>h2Target?pH2B-h2Target:0;
        int o2Ex=pO2B>o2Target?pO2B-o2Target:0;
        int tAmmoEx=ammoStock>mslAmmoTarget?ammoStock-mslAmmoTarget:0;
        int totEx=0;foreach(var kv in cEx)totEx+=kv.Value;foreach(var kv in tEx)totEx+=kv.Value;foreach(var kv in paEx)totEx+=kv.Value;foreach(var kv in turEx)totEx+=kv.Value;totEx+=h2Ex+o2Ex+tAmmoEx;
        if(totEx==0){foreach(var a in padAsm)if(a.Mode==MyAssemblerMode.Disassembly&&a.IsQueueEmpty){var aIn=a.GetInventory(1);if(aIn!=null&&aIn.ItemCount>0)continue;a.Mode=MyAssemblerMode.Assembly;a.UseConveyorSystem=true;}return;}
        int recyclerCnt=Math.Min(2,Math.Max(1,totEx/1000+1));
        var recyclers=new List<IMyAssembler>();
        for(int i=padAsm.Count-1;i>=0&&recyclers.Count<recyclerCnt;i--){
        var a=padAsm[i];
        if(a.Mode==MyAssemblerMode.Assembly&&!a.IsQueueEmpty)continue;
        a.UseConveyorSystem=false;
        if(a.Mode!=MyAssemblerMode.Disassembly){a.Mode=MyAssemblerMode.Disassembly;var q=new List<MyProductionItem>();a.GetQueue(q);for(int qi=q.Count-1;qi>=0;qi--)a.RemoveQueueItem(qi,q[qi].Amount);}
        recyclers.Add(a);}
        foreach(var a in padAsm){if(a.Mode!=MyAssemblerMode.Disassembly)continue;var aO=a.GetInventory(1);if(aO==null||aO.ItemCount==0)continue;var qB=new Dictionary<MyDefinitionId,int>();var q=new List<MyProductionItem>();a.GetQueue(q);foreach(var qi in q)AD2(qB,qi.BlueprintId,(int)qi.Amount);var L=GL(aO);foreach(var it in L){string tp=it.Type.TypeId.ToLower(),sub=it.Type.SubtypeId;int amt=(int)it.Amount;MyDefinitionId bp=default(MyDefinitionId);
        if(tp.Contains("component")&&compBP.ContainsKey(sub)){bp=compBP[sub];if(cEx.ContainsKey(sub))cEx[sub]=Math.Max(0,cEx[sub]-amt);}
        else if(tp.Contains("physicalgunobject")){string ns=NT(sub);if(tBPx.ContainsKey(ns)){bp=tBPx[ns];if(tEx.ContainsKey(ns))tEx[ns]=Math.Max(0,tEx[ns]-amt);}}
        else if(tp.Contains("ammomagazine")&&paBPx.ContainsKey(sub)){bp=paBPx[sub];if(paEx.ContainsKey(sub))paEx[sub]=Math.Max(0,paEx[sub]-amt);}
        else if(tp.Contains("ammomagazine")&&turBP.ContainsKey(sub)){bp=turBP[sub];if(turEx.ContainsKey(sub))turEx[sub]=Math.Max(0,turEx[sub]-amt);}
        else if(tp.Contains("gascontainer")&&sub.Contains("Hydrogen")&&bBPx.ContainsKey("HydrogenBottle")){bp=bBPx["HydrogenBottle"];h2Ex=Math.Max(0,h2Ex-amt);}
        else if(tp.Contains("oxygencontainer")&&sub.Contains("Oxygen")&&bBPx.ContainsKey("OxygenBottle")){bp=bBPx["OxygenBottle"];o2Ex=Math.Max(0,o2Ex-amt);}
        else if(it.Type==ammoType){bp=ammoBP;tAmmoEx=Math.Max(0,tAmmoEx-amt);}
        if(bp!=default(MyDefinitionId)){int alreadyQ=qB.ContainsKey(bp)?qB[bp]:0;if(alreadyQ<amt)a.AddQueueItem(bp,(MyFixedPoint)(amt-alreadyQ));}}}
        Func<IMyInventory,int,MyItemType,int,MyDefinitionId,int>XferAndQueue=(src,slot,itype,amt,bp)=>{
        foreach(var r in recyclers){
        var rIn=r.GetInventory(1);if(rIn==null||!HS(rIn,.9f))continue;
        src.TransferItemTo(rIn,slot,null,true,(MyFixedPoint)amt);
        r.AddQueueItem(bp,(MyFixedPoint)amt);
        return amt;}
        return 0;};
        foreach(var c in padCargo){var cI=c.GetInventory();if(cI==null)continue;var L=GL(cI);for(int i=L.Count-1;i>=0;i--){var it=L[i];string tp=it.Type.TypeId.ToLower(),sub=it.Type.SubtypeId;int amt=(int)it.Amount;
        if(tp.Contains("component")&&cEx.ContainsKey(sub)&&cEx[sub]>0&&compBP.ContainsKey(sub)){int xf=Math.Min(amt,cEx[sub]);cEx[sub]-=XferAndQueue(cI,i,it.Type,xf,compBP[sub]);}
        else if(tp.Contains("physicalgunobject")){string ns=NT(sub);if(tEx.ContainsKey(ns)&&tEx[ns]>0&&tBPx.ContainsKey(ns)){int xf=Math.Min(amt,tEx[ns]);tEx[ns]-=XferAndQueue(cI,i,it.Type,xf,tBPx[ns]);}}
        else if(tp.Contains("ammomagazine")&&paEx.ContainsKey(sub)&&paEx[sub]>0&&paBPx.ContainsKey(sub)){int xf=Math.Min(amt,paEx[sub]);paEx[sub]-=XferAndQueue(cI,i,it.Type,xf,paBPx[sub]);}
        else if(tp.Contains("ammomagazine")&&turBP.ContainsKey(sub)){int tgt=taNd.ContainsKey(sub)?taNd[sub]:taTarget;int stk=taStk.ContainsKey(sub)?taStk[sub]:0;if(stk<=tgt)continue;if(turEx.ContainsKey(sub)&&turEx[sub]>0){int xf=Math.Min(amt,turEx[sub]);turEx[sub]-=XferAndQueue(cI,i,it.Type,xf,turBP[sub]);}}
        else if(tp.Contains("gascontainer")&&sub.Contains("Hydrogen")&&h2Ex>0&&bBPx.ContainsKey("HydrogenBottle")){int xf=Math.Min(amt,h2Ex);h2Ex-=XferAndQueue(cI,i,it.Type,xf,bBPx["HydrogenBottle"]);}
        else if(tp.Contains("oxygencontainer")&&sub.Contains("Oxygen")&&o2Ex>0&&bBPx.ContainsKey("OxygenBottle")){int xf=Math.Min(amt,o2Ex);o2Ex-=XferAndQueue(cI,i,it.Type,xf,bBPx["OxygenBottle"]);}
        else if(it.Type==ammoType&&tAmmoEx>0){string asub=ammoITNames[ammoTypeIdx];if(taBPx.ContainsKey(asub)){int tgt=taNd.ContainsKey(asub)?taNd[asub]:taTarget;if(ammoStock<=tgt)continue;}int xf=Math.Min(amt,tAmmoEx);tAmmoEx-=XferAndQueue(cI,i,it.Type,xf,ammoBP);}}}
        if(ammoCargo!=null&&tAmmoEx>0&&!padCargo.Contains(ammoCargo)){string asub=ammoITNames[ammoTypeIdx];bool isTurret=taBPx.ContainsKey(asub);int tTgt=isTurret?(taNd.ContainsKey(asub)?taNd[asub]:taTarget):0;if(!isTurret||ammoStock>tTgt){var aI=ammoCargo.GetInventory();if(aI!=null){var L=GL(aI);for(int i=L.Count-1;i>=0&&tAmmoEx>0;i--){var it=L[i];if(it.Type==ammoType){int xf=Math.Min((int)it.Amount,tAmmoEx);tAmmoEx-=XferAndQueue(aI,i,it.Type,xf,ammoBP);}}}}}
        if(pAmmoCargo!=null&&!padCargo.Contains(pAmmoCargo)){var pI=pAmmoCargo.GetInventory();if(pI!=null){var L=GL(pI);for(int i=L.Count-1;i>=0;i--){var it=L[i];string sub=it.Type.SubtypeId;if(paEx.ContainsKey(sub)&&paEx[sub]>0&&paBPx.ContainsKey(sub)){int xf=Math.Min((int)it.Amount,paEx[sub]);paEx[sub]-=XferAndQueue(pI,i,it.Type,xf,paBPx[sub]);}}}}
        if(toolCargo!=null&&!padCargo.Contains(toolCargo)){var tI=toolCargo.GetInventory();if(tI!=null){var L=GL(tI);for(int i=L.Count-1;i>=0;i--){var it=L[i];string ns=NT(it.Type.SubtypeId);if(tEx.ContainsKey(ns)&&tEx[ns]>0&&tBPx.ContainsKey(ns)){int xf=Math.Min((int)it.Amount,tEx[ns]);tEx[ns]-=XferAndQueue(tI,i,it.Type,xf,tBPx[ns]);}}}}
        if(bottleCargo!=null&&!padCargo.Contains(bottleCargo)){var bI=bottleCargo.GetInventory();if(bI!=null){var L=GL(bI);for(int i=L.Count-1;i>=0;i--){var it=L[i];string tp=it.Type.TypeId.ToLower(),sub=it.Type.SubtypeId;int amt=(int)it.Amount;if(tp.Contains("gascontainer")&&sub.Contains("Hydrogen")&&h2Ex>0&&bBPx.ContainsKey("HydrogenBottle")){int xf=Math.Min(amt,h2Ex);h2Ex-=XferAndQueue(bI,i,it.Type,xf,bBPx["HydrogenBottle"]);}else if(tp.Contains("oxygencontainer")&&sub.Contains("Oxygen")&&o2Ex>0&&bBPx.ContainsKey("OxygenBottle")){int xf=Math.Min(amt,o2Ex);o2Ex-=XferAndQueue(bI,i,it.Type,xf,bBPx["OxygenBottle"]);}}}}
        foreach(var c in sharedCargo){if(padCargo.Contains(c))continue;var cI=c.GetInventory();if(cI==null)continue;var L=GL(cI);for(int i=L.Count-1;i>=0;i--){var it=L[i];string tp=it.Type.TypeId.ToLower(),sub=it.Type.SubtypeId;int amt=(int)it.Amount;
        if(tp.Contains("component")&&cEx.ContainsKey(sub)&&cEx[sub]>0&&compBP.ContainsKey(sub)){int xf=Math.Min(amt,cEx[sub]);cEx[sub]-=XferAndQueue(cI,i,it.Type,xf,compBP[sub]);}
        else if(tp.Contains("physicalgunobject")){string ns=NT(sub);if(tEx.ContainsKey(ns)&&tEx[ns]>0&&tBPx.ContainsKey(ns)){int xf=Math.Min(amt,tEx[ns]);tEx[ns]-=XferAndQueue(cI,i,it.Type,xf,tBPx[ns]);}}
        else if(tp.Contains("ammomagazine")&&paEx.ContainsKey(sub)&&paEx[sub]>0&&paBPx.ContainsKey(sub)){int xf=Math.Min(amt,paEx[sub]);paEx[sub]-=XferAndQueue(cI,i,it.Type,xf,paBPx[sub]);}
        else if(tp.Contains("ammomagazine")&&turBP.ContainsKey(sub)){int tgt=taNd.ContainsKey(sub)?taNd[sub]:taTarget;int stk=taStk.ContainsKey(sub)?taStk[sub]:0;if(stk<=tgt)continue;if(turEx.ContainsKey(sub)&&turEx[sub]>0){int xf=Math.Min(amt,turEx[sub]);turEx[sub]-=XferAndQueue(cI,i,it.Type,xf,turBP[sub]);}}
        else if(tp.Contains("gascontainer")&&sub.Contains("Hydrogen")&&h2Ex>0&&bBPx.ContainsKey("HydrogenBottle")){int xf=Math.Min(amt,h2Ex);h2Ex-=XferAndQueue(cI,i,it.Type,xf,bBPx["HydrogenBottle"]);}
        else if(tp.Contains("oxygencontainer")&&sub.Contains("Oxygen")&&o2Ex>0&&bBPx.ContainsKey("OxygenBottle")){int xf=Math.Min(amt,o2Ex);o2Ex-=XferAndQueue(cI,i,it.Type,xf,bBPx["OxygenBottle"]);}
        else if(it.Type==ammoType&&tAmmoEx>0){string asub=ammoITNames[ammoTypeIdx];if(taBPx.ContainsKey(asub)){int tgt=taNd.ContainsKey(asub)?taNd[asub]:taTarget;if(ammoStock<=tgt)continue;}int xf=Math.Min(amt,tAmmoEx);tAmmoEx-=XferAndQueue(cI,i,it.Type,xf,ammoBP);}}}
        foreach(var a in padAsm){if(a.Mode==MyAssemblerMode.Disassembly)continue;var aO=a.GetInventory(1);if(aO==null)continue;var L=GL(aO);for(int i=L.Count-1;i>=0;i--){var it=L[i];string tp=it.Type.TypeId.ToLower(),sub=it.Type.SubtypeId;int amt=(int)it.Amount;
        if(tp.Contains("component")&&cEx.ContainsKey(sub)&&cEx[sub]>0&&compBP.ContainsKey(sub)){int xf=Math.Min(amt,cEx[sub]);cEx[sub]-=XferAndQueue(aO,i,it.Type,xf,compBP[sub]);}
        else if(tp.Contains("physicalgunobject")){string ns=NT(sub);if(tEx.ContainsKey(ns)&&tEx[ns]>0&&tBPx.ContainsKey(ns)){int xf=Math.Min(amt,tEx[ns]);tEx[ns]-=XferAndQueue(aO,i,it.Type,xf,tBPx[ns]);}}}}}
        
        void Cn(string n,int c){if(!cNd.ContainsKey(n))cNd[n]=c;}
        void In(string n,int c){if(!iNd.ContainsKey(n))iNd[n]=c;}
        void Tn(string n,int c){tNd[n]=c;}
        void PAn(string n,int c){paNd[n]=c;}
        void Bn(string n,int c){bNd[n]=c;}
        void SetToolQuotas(int t){if(t<20)t=20;toolTarget=t;foreach(var k in tBPx.Keys)Tn(k,t);}
        void SetPAmmoQuotas(){string mslA=ammoITNames[ammoTypeIdx];foreach(var k in paBPx.Keys){if(!paNd.ContainsKey(k))PAn(k,500);}PAn(mslA,mslAmmoTarget);}
        void SetBottleQuotas(){h2Target=Math.Max(20,h2Target);o2Target=Math.Max(20,o2Target);Bn("HydrogenBottle",h2Target);Bn("OxygenBottle",o2Target);}
        void SetTurretAmmoQuotas(){if(taBPx.Count==0)InitBlueprints();foreach(var k in taBPx.Keys)if(!taNd.ContainsKey(k))taNd[k]=taTarget;}
        void TAn(string n,int c){taNd[n]=c;}
        void SetDefaultQuotas(){SetToolQuotas(Math.Max(20,toolTarget));SetPAmmoQuotas();SetBottleQuotas();SetTurretAmmoQuotas();InitRecycleList();}
        void InitRecycleList(){foreach(var k in compBP.Keys)itemRecycle.Add(k);foreach(var k in tBPx.Keys)itemRecycle.Add(k);foreach(var k in taBPx.Keys)itemRecycle.Add(k);foreach(var k in new[]{"NATO_5p56_Mag","MR-20_Mag","MR-50A_Mag","MR-30E_Mag","S-10_Mag","S-20A_Mag","Elite_Mag","RocketMag","FlareMag","HydrogenBottle","OxygenBottle"})itemRecycle.Add(k);}
        void CalcMissing(){if(tBPx.Count==0||paBPx.Count==0||bBPx.Count==0||taBPx.Count==0)InitBlueprints();if(tNd.Count==0)SetToolQuotas(toolTarget);if(paNd.Count==0)SetPAmmoQuotas();if(bNd.Count==0)SetBottleQuotas();if(taNd.Count==0)SetTurretAmmoQuotas();tMis.Clear();int s10Stk=tStk.ContainsKey("semiautopistol")?tStk["semiautopistol"]:0;int s10Tgt=tNd.ContainsKey("semiautopistol")?tNd["semiautopistol"]:toolTarget;foreach(var kv in tNd){int have=tStk.ContainsKey(kv.Key)?tStk[kv.Key]:0;if(have<kv.Value){if(kv.Key=="elitepistol"&&s10Stk<s10Tgt)continue;tMis[kv.Key]=kv.Value-have;}}paMis.Clear();foreach(var kv in paNd){int have=pAmmoStk.ContainsKey(kv.Key)?pAmmoStk[kv.Key]:0;if(have<kv.Value)paMis[kv.Key]=kv.Value-have;}bMis.Clear();foreach(var kv in bNd){int have=bStk.ContainsKey(kv.Key)?bStk[kv.Key]:0;if(have<kv.Value)bMis[kv.Key]=kv.Value-have;}taMis.Clear();foreach(var kv in taNd){int have=taStk.ContainsKey(kv.Key)?taStk[kv.Key]:0;if(have<kv.Value)taMis[kv.Key]=kv.Value-have;}}
        void QueueMissing(Dictionary<string,int>mis,Dictionary<string,int>qd,Dictionary<string,MyDefinitionId>bp,Dictionary<string,int>stk,Dictionary<string,int>tgt){if(tBPx.Count==0||paBPx.Count==0||bBPx.Count==0||taBPx.Count==0)InitBlueprints();if(padAsm.Count<2)return;int asmCnt=padAsm.Count-1;foreach(var kv in bp){int stock=stk.ContainsKey(kv.Key)?stk[kv.Key]:0;int target=tgt.ContainsKey(kv.Key)?tgt[kv.Key]:0;var bpId=kv.Value;int queued=GetQueued(bpId);int total=stock+queued;if(total>target&&queued>0){int excess=total-target;foreach(var a in padAsm){if(excess<=0)break;var q=new List<MyProductionItem>();a.GetQueue(q);for(int i=q.Count-1;i>=0&&excess>0;i--){if(q[i].BlueprintId==bpId){int rem=Math.Min((int)q[i].Amount,excess);a.RemoveQueueItem(i,(MyFixedPoint)rem);excess-=rem;}}}}else if(total<target){int need=target-total;int perAsm=Math.Max(1,need/asmCnt);for(int i=0;i<asmCnt&&need>0;i++)if(padAsm[i].Mode==MyAssemblerMode.Assembly){padAsm[i].AddQueueItem(bpId,(MyFixedPoint)perAsm);need-=perAsm;}}}}
        
        void CalcAmmoIngotNeeds(){aIN.Clear();int n=ammoLoad;Action<string,double>A=(k,m)=>aIN[k]=(int)(n*m);if(ammoTypeIdx==0){A("Iron",0.04);A("Nickel",0.01);}else if(ammoTypeIdx==1){A("Iron",0.18);A("Nickel",0.02);}else if(ammoTypeIdx==2){A("Iron",15);A("Nickel",1.2);A("Silicon",0.36);A("Magnesium",0.6);A("Platinum",0.12);A("Uranium",0.24);}oNd.Clear();foreach(var kv in aIN){int h=iStk.ContainsKey(kv.Key)?iStk[kv.Key]:0;if(h<kv.Value){double r=kv.Key=="Iron"?0.7:kv.Key=="Nickel"?0.4:kv.Key=="Cobalt"?0.3:kv.Key=="Magnesium"?0.007:kv.Key=="Silicon"?0.7:kv.Key=="Platinum"?0.005:kv.Key=="Uranium"?0.01:0.1;oNd[kv.Key]=(int)((kv.Value-h)/r);}}int iM=10;ChkI("Iron",1000*iM,0.7);ChkI("Nickel",200*iM,0.4);ChkI("Cobalt",100*iM,0.3);ChkI("Silicon",100*iM,0.7);ChkI("Magnesium",50*iM,0.007);ChkI("Silver",20*iM,0.1);ChkI("Gold",10*iM,0.01);ChkI("Platinum",5*iM,0.005);ChkI("Uranium",5*iM,0.01);}
        void ChkI(string n,int nd,double r){int h=iStk.ContainsKey(n)?iStk[n]:0;if(h<nd)oNd[n]=(int)((nd-h)/r);}
        
        void FeedRefineries(){if(padRef.Count==0)return;var pull=GetPullable();if(pull.Count==0)return;string[] oreTypes={"Iron","Nickel","Cobalt","Silicon","Magnesium","Silver","Gold","Platinum","Uranium","Stone","Scrap"};foreach(var r in padRef){r.UseConveyorSystem=false;var rO=r.GetInventory(1);if(rO!=null&&(float)rO.CurrentVolume>(float)rO.MaxVolume*.7f)continue;var rI=r.GetInventory(0);if(rI==null)continue;int totOre=0;foreach(var x in GL(rI))if(x.Type.TypeId.EndsWith("Ore"))totOre+=(int)x.Amount;if(totOre>=5000)continue;foreach(string oreN in oreTypes){int haveInRef=0;foreach(var x in GL(rI))if(x.Type.SubtypeId==oreN)haveInRef+=(int)x.Amount;if(haveInRef>=1000)continue;int need=1000-haveInRef;foreach(var c in pull){if(need<=0)break;var cI=c.GetInventory();if(cI==null)continue;var cL=GL(cI);for(int i=cL.Count-1;i>=0&&need>0;i--){var t=cL[i];if(!t.Type.TypeId.EndsWith("Ore")||t.Type.SubtypeId!=oreN)continue;int ad=Math.Min((int)t.Amount,need);cI.TransferItemTo(rI,i,null,true,(MyFixedPoint)ad);need-=ad;}}}}}
        
        void FeedAssemblers(){if(padAsm.Count==0)return;var pull=GetPullable();int minIngot=1000;int maxIngot=5000;string[] mainIngots={"Iron","Nickel","Silicon","Cobalt"};foreach(var a in padAsm){if(a.Mode==MyAssemblerMode.Assembly&&!a.UseConveyorSystem)a.UseConveyorSystem=true;var aO=a.GetInventory(1);if(aO!=null&&(float)aO.CurrentVolume>(float)aO.MaxVolume*.5f)continue;var aI=a.GetInventory(0);if(aI==null)continue;var ingInAsm=new Dictionary<string,int>();var L=GL(aI);foreach(var x in L)if(x.Type.TypeId.EndsWith("Ingot"))AD(ingInAsm,x.Type.SubtypeId,(int)x.Amount);foreach(string ing in mainIngots){int have=ingInAsm.ContainsKey(ing)?ingInAsm[ing]:0;if(have>=minIngot)continue;int need=minIngot-have;foreach(var r in padRef){if(need<=0)break;var rO=r.GetInventory(1);if(rO==null)continue;var rL=GL(rO);for(int i=rL.Count-1;i>=0&&need>0;i--)if(rL[i].Type.SubtypeId==ing){int xf=Math.Min((int)rL[i].Amount,need);rO.TransferItemTo(aI,i,null,true,(MyFixedPoint)xf);need-=xf;}}foreach(var c in pull){if(need<=0)break;var cI=c.GetInventory();if(cI==null)continue;var cL=GL(cI);for(int i=cL.Count-1;i>=0&&need>0;i--)if(cL[i].Type.SubtypeId==ing){int xf=Math.Min((int)cL[i].Amount,need);cI.TransferItemTo(aI,i,null,true,(MyFixedPoint)xf);need-=xf;}}}if((float)aI.CurrentVolume>(float)aI.MaxVolume*.85f){var dst=ingotCargo??(padCargoL.Count>0?padCargoL[0]:(padCargo.Count>0?padCargo[0]:null));if(dst!=null){var dI=dst.GetInventory();if(dI!=null&&HS(dI,.9f)){var aL=GL(aI);foreach(var x in aL){string s=x.Type.SubtypeId;if(!x.Type.TypeId.EndsWith("Ingot"))continue;int have=ingInAsm.ContainsKey(s)?ingInAsm[s]:0;if(have>maxIngot){int ex=have-maxIngot;for(int i=aL.Count-1;i>=0&&ex>0;i--)if(aL[i].Type.SubtypeId==s){int xf=Math.Min((int)aL[i].Amount,ex);aI.TransferItemTo(dI,i,null,true,(MyFixedPoint)xf);ex-=xf;}}}}}}}}
        
        List<IMyCargoContainer> GetPullable(){var r=new List<IMyCargoContainer>(padCargo);foreach(var c in sharedCargo)if(!r.Contains(c))r.Add(c);return r;}
        
        void ManageInventory(){
        if(padCargo.Count==0)return;
        Action<IMyInventory>PO=o=>{if(o==null||o.ItemCount==0)return;for(int i=o.ItemCount-1;i>=0;i--){var it=o.GetItemAt(i);if(!it.HasValue)continue;var d=RouteItem(it.Value.Type,null);if(d!=null)o.TransferItemTo(d,i,null,true,null);}};
        foreach(var a in padAsm){if(a.Mode!=MyAssemblerMode.Disassembly)PO(a.GetInventory(1));else PO(a.GetInventory(0));}
        foreach(var r in padRef)PO(r.GetInventory(1));
        foreach(var g in padGen){var gI=g.GetInventory();if(gI==null)continue;for(int i=gI.ItemCount-1;i>=0;i--){var it=gI.GetItemAt(i);if(!it.HasValue)continue;var tp=it.Value.Type;if(tp.SubtypeId=="Ice")continue;string tid=tp.TypeId.ToLower();if(tid.Contains("gascontainer")||tid.Contains("oxygencontainer"))continue;var d=RouteItem(tp,null);if(d!=null)gI.TransferItemTo(d,i,null,true,null);}}
        var allTanks=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(allTanks,t=>t.IsSameConstructAs(Me));foreach(var tk in allTanks){var tI=tk.GetInventory();if(tI==null||tI.ItemCount==0)continue;for(int i=tI.ItemCount-1;i>=0;i--){var it=tI.GetItemAt(i);if(!it.HasValue)continue;var tp=it.Value.Type;string tid=tp.TypeId.ToLower();if(tid.Contains("gascontainer")||tid.Contains("oxygencontainer"))continue;var d=RouteItem(tp,null);if(d!=null)tI.TransferItemTo(d,i,null,true,null);}}
        foreach(var sg in subgridCargo){var sgI=sg.GetInventory();if(sgI!=null)PO(sgI);}
        foreach(var cn in oreC){
        if(cn.Status!=MyShipConnectorStatus.Connected)continue;
        var ot=cn.OtherConnector;if(ot==null)continue;
        var G=ot.CubeGrid;
        Func<IMyTerminalBlock,bool>OG=b=>b.CubeGrid==G;
        var mC=new List<IMyCargoContainer>();GridTerminalSystem.GetBlocksOfType(mC,OG);
        var mD=new List<IMyShipDrill>();GridTerminalSystem.GetBlocksOfType(mD,OG);
        var mG=new List<IMyShipGrinder>();GridTerminalSystem.GetBlocksOfType(mG,OG);
        Action<IMyInventory>xf=sI=>{if(sI==null||sI.ItemCount==0)return;for(int i=sI.ItemCount-1;i>=0;i--){var it=sI.GetItemAt(i);if(!it.HasValue)continue;var d=RouteItem(it.Value.Type,null);if(d!=null)sI.TransferItemTo(d,i,null,true,null);}};
        foreach(var c in mC)xf(c.GetInventory());
        foreach(var dr in mD)xf(dr.GetInventory());
        foreach(var gr in mG)xf(gr.GetInventory());
        var mGen=new List<IMyGasGenerator>();GridTerminalSystem.GetBlocksOfType(mGen,OG);
        var mReact=new List<IMyReactor>();GridTerminalSystem.GetBlocksOfType(mReact,OG);
        Echo($"Miner: Gen={mGen.Count} React={mReact.Count} Cargo={mC.Count}");
        if(mGen.Count>0){IMyInventory iceD=mGen[0].GetInventory();if(iceD!=null&&HS(iceD,.8f)){
        Action<IMyCargoContainer>si=sc=>{if(sc==null)return;var sI=sc.GetInventory();if(sI==null)return;var sL=GL(sI);for(int i=sL.Count-1;i>=0;i--)if(sL[i].Type.SubtypeId=="Ice"&&sI.CanTransferItemTo(iceD,sL[i].Type)){sI.TransferItemTo(iceD,i,null,true,(MyFixedPoint)Math.Min(500,(int)sL[i].Amount));break;}};
        si(oreCargo);foreach(var c in padCargo)si(c);}}
        else{Action<IMyInventory>pullIce=inv=>{if(inv==null)return;var L=GL(inv);for(int i=L.Count-1;i>=0;i--)if(L[i].Type.SubtypeId=="Ice"){var pD=oreCargo!=null?oreCargo.GetInventory():null;if(pD==null)foreach(var pc in padCargo){pD=pc.GetInventory();if(pD!=null&&HS(pD,.9f))break;}if(pD!=null&&inv.CanTransferItemTo(pD,L[i].Type))inv.TransferItemTo(pD,i,null,true,null);}};foreach(var mc in mC)pullIce(mc.GetInventory());foreach(var dr in mD)pullIce(dr.GetInventory());}
        if(mReact.Count>0){foreach(var mr in mReact){var mRI=mr.GetInventory();if(mRI==null||!HS(mRI,.8f))continue;int mU=0;foreach(var x in GL(mRI))if(x.Type.SubtypeId=="Uranium")mU+=(int)x.Amount;if(mU>=10)continue;int nd=10-mU;Action<IMyCargoContainer>mu=c=>{if(nd<=0||c==null)return;var cI=c.GetInventory();if(cI==null)return;var cL=GL(cI);for(int j=cL.Count-1;j>=0&&nd>0;j--)if(cL[j].Type.SubtypeId=="Uranium"){int tf=Math.Min((int)cL[j].Amount,nd);if(cI.CanTransferItemTo(mRI,cL[j].Type)){cI.TransferItemTo(mRI,j,null,true,(MyFixedPoint)tf);nd-=tf;}}};mu(ingotCargo);foreach(var c in padCargo)mu(c);}}
        else{foreach(var mc in mC){var mcI=mc.GetInventory();if(mcI==null)continue;var mcL=GL(mcI);for(int i=mcL.Count-1;i>=0;i--)if(mcL[i].Type.SubtypeId=="Uranium"){var pD=ingotCargo!=null?ingotCargo.GetInventory():null;if(pD==null)foreach(var pc in padCargo){pD=pc.GetInventory();if(pD!=null&&HS(pD,.9f))break;}if(pD!=null&&mcI.CanTransferItemTo(pD,mcL[i].Type))mcI.TransferItemTo(pD,i,null,true,null);}}}}
        if(autoOrg)foreach(var s in padCargo){var sI=s.GetInventory();if(sI==null||sI.ItemCount==0)continue;var L=GL(sI);for(int i=L.Count-1;i>=0;i--){var d=RouteItem(L[i].Type,s);if(d!=null)sI.TransferItemTo(d,i,null,true,null);}}
        if(toolCargo!=null){var tI=toolCargo.GetInventory();if(tI!=null){var L=GL(tI);for(int i=L.Count-1;i>=0;i--){var t=L[i].Type;if(t.TypeId.ToLower().Contains("physicalgunobject"))continue;var d=RouteItem(t,toolCargo);if(d!=null)tI.TransferItemTo(d,i,null,true,null);}}}
        foreach(var rc in padReact){var rI=rc.GetInventory();if(rI==null)continue;int h=0;foreach(var x in GL(rI))if(x.Type.SubtypeId=="Uranium")h+=(int)x.Amount;if(h>=50)continue;int n=50-h;foreach(var r in padRef){var O=r.GetInventory(1);if(O==null)continue;var rL=GL(O);for(int i=rL.Count-1;i>=0&&n>0;i--)if(rL[i].Type.SubtypeId=="Uranium"){int xf=Math.Min((int)rL[i].Amount,n);O.TransferItemTo(rI,i,null,true,(MyFixedPoint)xf);n-=xf;}}Action<IMyCargoContainer>pu=c=>{if(n<=0||c==null)return;var I=c.GetInventory();if(I==null)return;var cL=GL(I);for(int i=cL.Count-1;i>=0&&n>0;i--)if(cL[i].Type.SubtypeId=="Uranium"){int xf=Math.Min((int)cL[i].Amount,n);I.TransferItemTo(rI,i,null,true,(MyFixedPoint)xf);n-=xf;}};pu(ingotCargo);foreach(var c in padCargo)pu(c);}
        Action<IMyCargoContainer>fi=c=>{if(c==null)return;var I=c.GetInventory();if(I==null)return;for(int i=I.ItemCount-1;i>=0;i--){var x=I.GetItemAt(i);if(x.HasValue&&x.Value.Type.SubtypeId=="Ice")foreach(var g in padGen){var gI=g.GetInventory();if(gI!=null&&HS(gI,.9f)){I.TransferItemTo(gI,i,null,true,null);break;}}}};
        fi(oreCargo);foreach(var c in padCargo)fi(c);
        if(bottleCargo!=null&&pIceGen>0){var bI=bottleCargo.GetInventory();if(bI!=null)for(int i=bI.ItemCount-1;i>=0;i--){var it=bI.GetItemAt(i);if(!it.HasValue)continue;string tid=it.Value.Type.TypeId.ToLower();if(!tid.Contains("gascontainer")&&!tid.Contains("oxygencontainer"))continue;foreach(var g in padGen)if(g.Enabled){var gI=g.GetInventory();if(gI==null)continue;int gBtl=0;foreach(var x in GL(gI)){string xt=x.Type.TypeId.ToLower();if(xt.Contains("gascontainer")||xt.Contains("oxygencontainer"))gBtl++;}if(gBtl==0&&HS(gI,.8f)){bI.TransferItemTo(gI,i,null,true,(MyFixedPoint)1);break;}}}}
        foreach(var g in padGen){var gI=g.GetInventory();if(gI==null)continue;var gL=GL(gI);int btlCnt=0;bool hasIce=false;foreach(var x in gL){string tid=x.Type.TypeId.ToLower();if(tid.Contains("gascontainer")||tid.Contains("oxygencontainer"))btlCnt++;if(x.Type.SubtypeId=="Ice")hasIce=true;}if(!hasIce||btlCnt>1){int mv=0,mx=hasIce?btlCnt-1:btlCnt;for(int i=gL.Count-1;i>=0&&mv<mx;i--){string tid=gL[i].Type.TypeId.ToLower();if(!tid.Contains("gascontainer")&&!tid.Contains("oxygencontainer"))continue;IMyInventory dst=null;if(bottleCargo!=null){var bI=bottleCargo.GetInventory();if(bI!=null&&HS(bI,.95f))dst=bI;}if(dst==null){foreach(var c in padCargo){var cI=c.GetInventory();if(cI!=null&&HS(cI,.9f)){dst=cI;break;}}}if(dst!=null){gI.TransferItemTo(dst,i);mv++;}}}}
        Action<IMyCargoContainer>fb=c=>{if(c==null||c==bottleCargo)return;var I=c.GetInventory();if(I==null)return;for(int i=I.ItemCount-1;i>=0;i--){var x=I.GetItemAt(i);if(!x.HasValue)continue;string tid=x.Value.Type.TypeId.ToLower();if(!tid.Contains("gascontainer")&&!tid.Contains("oxygencontainer"))continue;if(bottleCargo!=null){var bI=bottleCargo.GetInventory();if(bI!=null&&HS(bI,.95f)){I.TransferItemTo(bI,i);continue;}}foreach(var g in padGen){var gI=g.GetInventory();if(gI==null||!HS(gI,.8f))continue;int gBtl=0;foreach(var gx in GL(gI)){string gt=gx.Type.TypeId.ToLower();if(gt.Contains("gascontainer")||gt.Contains("oxygencontainer"))gBtl++;}if(gBtl==0){I.TransferItemTo(gI,i);break;}}}};
        foreach(var c in padCargo)fb(c);
        if(pAmmoCargo!=null){var pI=pAmmoCargo.GetInventory();if(pI!=null){var L=GL(pI);for(int i=L.Count-1;i>=0;i--){var t=L[i].Type;if(t.SubtypeId=="SemiAutoPistolMagazine"){var gC=DL();if(gC!=null){var gI=gC.GetInventory();if(gI!=null&&HS(gI,.9f))pI.TransferItemTo(gI,i,null,true,null);}}}}}
        }
        
        IMyCargoContainer GD(MyItemType t){string p=t.TypeId.ToLower(),s=t.SubtypeId;var fb=miscCargo??DL();return p.Contains("ore")&&!p.Contains("oxygencontainer")?oreCargo:p.Contains("ingot")?ingotCargo:p.Contains("component")?compCargo:p.Contains("physicalgunobject")?toolCargo:p.Contains("ammomagazine")?(s=="SemiAutoPistolMagazine"?(ammoCargo??fb):(s.Contains("Pistol")||s.Contains("RifleGun")||s.Contains("Flare")?(pAmmoCargo??toolCargo):(ammoCargo??toolCargo))):(p.Contains("gascontainerobject")||p.Contains("oxygencontainerobject"))?bottleCargo:p.Contains("consumableitem")?(foodCargo??fb):p.Contains("datapad")?(dataCargo??fb):fb;}
        IMyCargoContainer DL(){foreach(var c in padCargoL){if(c.CubeGrid!=Me.CubeGrid)continue;var n=c.CustomName.ToLower();if(!n.Contains("-ore")&&!n.Contains("-ingot")&&!n.Contains("-comp")&&!n.Contains("-tools")&&!n.Contains("-ammo")&&!n.Contains("-pammo")&&!n.Contains("-bottle")&&!n.Contains("-food")&&!n.Contains("-data")&&!n.Contains("-misc"))return c;}foreach(var c in padCargo){if(c.CubeGrid!=Me.CubeGrid)continue;var n=c.CustomName.ToLower();if(!n.Contains("-ore")&&!n.Contains("-ingot")&&!n.Contains("-comp")&&!n.Contains("-tools")&&!n.Contains("-ammo")&&!n.Contains("-pammo")&&!n.Contains("-bottle")&&!n.Contains("-food")&&!n.Contains("-data")&&!n.Contains("-misc"))return c;}foreach(var c in padCargoL)if(c.CubeGrid==Me.CubeGrid)return c;foreach(var c in padCargo)if(c.CubeGrid==Me.CubeGrid)return c;return null;}
        bool HS(IMyInventory i,float t)=>i!=null&&(float)i.CurrentVolume<(float)i.MaxVolume*t;
        List<MyInventoryItem>GL(IMyInventory v){var L=new List<MyInventoryItem>();if(v!=null)v.GetItems(L);return L;}
        void AD(Dictionary<string,int>d,string k,int v){if(d.ContainsKey(k))d[k]+=v;else d[k]=v;}
        void AD2(Dictionary<MyDefinitionId,int>d,MyDefinitionId k,int v){if(d.ContainsKey(k))d[k]+=v;else d[k]=v;}
        string NT(string s){string r=s.ToLower();if(r.EndsWith("item"))r=r.Substring(0,r.Length-4);if(r=="eliteautopistol")r="elitepistol";return r;}
        string SPP(string bp){int us=bp.IndexOf('_');return us>=0?bp.Substring(us+1):bp;}
        Dictionary<string,string>ParseSecs(string d){var r=new Dictionary<string,string>();if(string.IsNullOrEmpty(d))return r;string cur="";var sb=new StringBuilder();var lns=d.Split('\n');foreach(var l in lns){if(l.StartsWith("[")){int e=l.IndexOf("]");if(e>0){if(cur!=""&&sb.Length>0)r[cur]=sb.ToString();cur=l.Substring(0,e+1);sb.Clear();sb.Append(l).Append("\n");continue;}}if(cur!=""&&l.Length>0)sb.Append(l).Append("\n");}if(cur!=""&&sb.Length>0)r[cur]=sb.ToString();return r;}
        bool HT(IMyInventory i,MyItemType t){if(i==null)return false;foreach(var x in GL(i))if(x.Type.TypeId==t.TypeId&&x.Type.SubtypeId==t.SubtypeId)return true;return false;}
        bool ID(IMyCargoContainer c)=>c==oreCargo||c==ingotCargo||c==compCargo||c==toolCargo||c==ammoCargo||c==bottleCargo||c==pAmmoCargo||c==foodCargo||c==dataCargo||c==miscCargo;
        bool IT(IMyCargoContainer c){var n=c.CustomName.ToLower();return n.Contains("-ore")||n.Contains("-ingot")||n.Contains("-comp")||n.Contains("-tools")||n.Contains("-ammo")||n.Contains("-pammo")||n.Contains("-bottle")||n.Contains("-food")||n.Contains("-data")||n.Contains("-misc");}
        string GT(IMyCargoContainer c){if(c==null)return null;var n=c.CustomName.ToLower();if(n.Contains("-ore"))return"-ore";if(n.Contains("-ingot"))return"-ingot";if(n.Contains("-comp"))return"-comp";if(n.Contains("-tools"))return"-tools";if(n.Contains("-pammo"))return"-pammo";if(n.Contains("-ammo"))return"-ammo";if(n.Contains("-bottle"))return"-bottle";if(n.Contains("-food"))return"-food";if(n.Contains("-data"))return"-data";if(n.Contains("-misc"))return"-misc";return null;}
        IMyInventory FST(IMyCargoContainer pri){if(pri==null)return null;string tg=GT(pri);if(tg==null)return null;foreach(var c in padCargo){if(c==pri)continue;if(!c.CustomName.ToLower().Contains(tg))continue;var inv=c.GetInventory();if(inv!=null&&HS(inv,.9f))return inv;}return null;}
        bool IsMiner(IMyInventory inv){var owner=inv.Owner as IMyTerminalBlock;return owner!=null&&minerGrids.Contains(owner.CubeGrid.EntityId);}
        int GetQueued(MyDefinitionId bp){int t=0;foreach(var a in padAsm){var q=new List<MyProductionItem>();a.GetQueue(q);foreach(var i in q)if(i.BlueprintId==bp)t+=(int)i.Amount;}return t;}
        
        void EnsureLCDs(){IMyTextSurface[] all={lcd4,lcd5,lcd6,lcd9,lcd10,lcd11};foreach(var s in all){if(s==null)continue;s.ContentType=ContentType.TEXT_AND_IMAGE;s.Script="";s.WriteText("");}}
        MySpriteDrawFrame BL(IMyTextSurface s){s.ContentType=ContentType.SCRIPT;s.Script="";lcdW=s.SurfaceSize.X;lcdH=s.SurfaceSize.Y;lcdS=lcdW/512f;lcdYS=lcdH/512f;var f=s.DrawFrame();f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(lcdW/2,lcdH/2),new Vector2(lcdW,lcdH),cBg));return f;}
        void SH(MySpriteDrawFrame f,float y,string t,Color c){float cy=y*lcdYS,cx=lcdW/2;f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,cy+12*lcdYS),new Vector2(lcdW-12*lcdS,24*lcdYS),c*0.3f));f.Add(new MySprite(SpriteType.TEXT,t,new Vector2(cx,cy),null,c,"White",TextAlignment.CENTER,0.8f*lcdS));f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,cy+24*lcdYS),new Vector2(lcdW-32*lcdS,2*lcdYS),c));}
        void SB(MySpriteDrawFrame f,float x,float y,float w,float h,float pct,Color fg,Color bg){x*=lcdS;y*=lcdYS;w*=lcdS;h*=lcdYS;f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+w/2,y+h/2),new Vector2(w,h),bg));float fw=w*Math.Max(0,Math.Min(1,pct));if(fw>1)f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+fw/2,y+h/2),new Vector2(fw,h),fg));}
        void SLB(MySpriteDrawFrame f,float x,float y,float w,float h,string lbl,float pct,Color fg,Color bg){float sx=x*lcdS,sy=y*lcdYS,sw=w*lcdS;f.Add(new MySprite(SpriteType.TEXT,lbl,new Vector2(sx,sy-2*lcdYS),null,cTxt,"Monospace",TextAlignment.LEFT,0.5f*lcdS));SB(f,x,y+12,w,h,pct,fg,bg);f.Add(new MySprite(SpriteType.TEXT,$"{pct*100:0}%",new Vector2(sx+sw+5*lcdS,sy+8*lcdYS),null,fg,"Monospace",TextAlignment.LEFT,0.45f*lcdS));}
        void ST(MySpriteDrawFrame f,float x,float y,string t,Color c,float sz=0.5f,TextAlignment a=TextAlignment.LEFT){f.Add(new MySprite(SpriteType.TEXT,t,new Vector2(x*lcdS,y*lcdYS),null,c,"Monospace",a,sz*lcdS));}
        void SBx(MySpriteDrawFrame f,float x,float y,float w,float h,Color bg,Color bdr){x*=lcdS;y*=lcdYS;w*=lcdS;h*=lcdYS;f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+w/2,y+h/2),new Vector2(w,h),bdr));f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+w/2,y+h/2),new Vector2(w-2*lcdS,h-2*lcdYS),bg));}
        void SD(MySpriteDrawFrame f,float y){f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(lcdW/2,y*lcdYS),new Vector2(lcdW-40*lcdS,1*lcdYS),cBdr));}
        Color PctCol(float p){return p>.7f?cOK:p>.3f?cWrn:cErr;}
        void SGraph(MySpriteDrawFrame f,float x,float y,float w,float h,List<float>data,Color lc,Color gc,float maxVal=0,string unit=""){
        float gx=(x+35)*lcdS,gy=y*lcdYS,gw=(w-40)*lcdS,gh=(h-25)*lcdYS;
        SBx(f,x+35,y,w-40,h-25,cBg,cBdr);
        float autoMax=maxVal;
        if(autoMax<=0&&data.Count>0){foreach(var v in data)if(v>autoMax)autoMax=v;if(autoMax<=0)autoMax=1;autoMax=autoMax*1.1f;}
        if(autoMax<=0)autoMax=1;
        float step=autoMax/10f;if(step<1)step=1;else if(step<10)step=(float)Math.Ceiling(step);else step=(float)(Math.Ceiling(step/10)*10);
        float yMax=step*10;
        for(int i=1;i<10;i++)f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(gx+gw/2,gy+gh-gh*i/10),new Vector2(gw-4*lcdS,1*lcdYS),gc));
        for(int i=0;i<=10;i+=2){float ly=y+h-25-((h-25)*i/10)-6;float lv=step*i;string lt=lv>=1000?$"{lv/1000:F0}k":lv>=1?$"{lv:F0}":$"{lv:F1}";ST(f,x,ly,lt+unit,cSec,0.22f);}
        for(int i=0;i<=5;i++){float tx=x+35+(w-40)*i/5;string tl=i==5?"Now":$"{10-i*2}m";ST(f,tx,y+h-25+2,tl,cSec,0.28f);}
        if(data.Count<2)return;float dx=(gw-4*lcdS)/(HIST_MAX-1);
        for(int i=1;i<data.Count;i++){float v1=Math.Min(1,data[i-1]/yMax),v2=Math.Min(1,data[i]/yMax);float x1=gx+2*lcdS+(i-1)*dx,y1=gy+gh-2*lcdYS-v1*(gh-4*lcdYS),x2=gx+2*lcdS+i*dx,y2=gy+gh-2*lcdYS-v2*(gh-4*lcdYS);f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2((x1+x2)/2,(y1+y2)/2),new Vector2((float)Math.Sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)),2*lcdYS),lc));}
        if(data.Count>0){float cv=Math.Min(1,data[data.Count-1]/yMax);float cx=gx+gw-5*lcdS,cy=gy+gh-2*lcdYS-cv*(gh-4*lcdYS);f.Add(new MySprite(SpriteType.TEXTURE,"Circle",new Vector2(cx,cy),new Vector2(8*lcdS,8*lcdYS),lc));}}
        
        void HardSort(){int mv=0;foreach(var s in padCargo){if(ID(s))continue;var sI=s.GetInventory();if(sI==null||sI.ItemCount==0)continue;var L=GL(sI);for(int i=L.Count-1;i>=0;i--){var t=L[i].Type;var d=GD(t);if(d==null||d==s)continue;var dI=d.GetInventory();if(dI==null||!HS(dI,.98f))continue;sI.TransferItemTo(dI,i,null,true,null);mv++;}}Echo($"SORT: Moved {mv} stacks");}
        
        IMyInventory RouteItem(MyItemType t,IMyCargoContainer sk){var d=GD(t);if(d==sk)return null;if(d!=null){var di=d.GetInventory();if(HS(di,.95f))return di;var alt=FST(d);if(alt!=null)return alt;if(sk!=null&&!ID(sk))return null;}IMyInventory bL=null,bM=null,bS=null;if(sk==null||d==null){foreach(var c in padCargoL){if(ID(c)||IT(c)||c==sk)continue;var i=c.GetInventory();if(i==null||IsMiner(i)||!HS(i,.9f))continue;if(bL==null)bL=i;if(HT(i,t))return i;}foreach(var c in padCargoM){if(ID(c)||IT(c)||c==sk)continue;var i=c.GetInventory();if(i==null||IsMiner(i)||!HS(i,.9f))continue;if(bM==null)bM=i;if(HT(i,t))return i;}foreach(var c in padCargoS){if(ID(c)||IT(c)||c==sk)continue;var i=c.GetInventory();if(i==null||IsMiner(i)||!HS(i,.9f))continue;if(bS==null)bS=i;if(HT(i,t))return i;}}return bL??bM??bS;}
        
        void WriteBtnData(){
        var secs=ParseSecs(Me.CustomData);
        var wpLines=new List<string>();
        if(secs.ContainsKey("[WAYPOINTS]"))foreach(var ln in secs["[WAYPOINTS]"].Split('\n')){var t=ln.Trim();if(t.StartsWith("GPS:"))wpLines.Add(t);}
        var built=new Dictionary<string,string>();
        var qt=new StringBuilder("[QUOTAS]\n");
        qt.AppendLine($"ammo_target  = {ammoTarget}");qt.AppendLine($"ta_target    = {taTarget}");qt.AppendLine($"ice_target   = {iceTarget}");qt.AppendLine($"uran_target  = {uranTarget}");qt.AppendLine($"h2_target    = {h2Target}");qt.AppendLine($"o2_target    = {o2Target}");qt.AppendLine($"tool_target  = {toolTarget}");qt.AppendLine($"msl_ammo_target = {mslAmmoTarget}");
        built["[QUOTAS]"]=qt.ToString();
        var ms=new StringBuilder("[MISSILE]\n");
        ms.AppendLine($"status   = {mslPhase}");ms.AppendLine($"target   = {mslTarget}");ms.AppendLine($"distance = {mslDist:F0}");ms.AppendLine($"speed    = {mslSpeed:F0}");ms.AppendLine($"altitude = {mslAlt:F0}");ms.AppendLine($"fuel     = {mslFuel:F0}%");ms.AppendLine($"battery  = {mslBatPct:F0}%");ms.AppendLine($"armed    = {mslArmed}");ms.AppendLine($"ready    = {mslReady}");ms.AppendLine($"count    = {mslCount}");
        built["[MISSILE]"]=ms.ToString();
        var cf=new StringBuilder("[CONFIG]\n");
        cf.AppendLine($"ammo     = {ammoTarget,-8} ; Turret ammo target");cf.AppendLine($"load     = {ammoLoad,-8} ; Ammo per missile");cf.AppendLine($"ice      = {iceTarget,-8} ; Ice target (kg)");cf.AppendLine($"uran     = {uranTarget,-8} ; Uranium target (kg)");cf.AppendLine($"h2       = {h2Target,-8} ; H2 bottles target");cf.AppendLine($"o2       = {o2Target,-8} ; O2 bottles target");cf.AppendLine($"tool     = {toolTarget,-8} ; Tool sets target");cf.AppendLine($"mslAmmo  = {mslAmmoTarget,-8} ; Missile ammo target");cf.AppendLine($"type     = {ammoTypeIdx,-8} ; 0=Pistol,1=MR20,2=MR50A,3=Missile,4=25mm");cf.AppendLine("; Add -R after any item to recycle excess");
        built["[CONFIG]"]=cf.ToString();
        var wp=new StringBuilder("[WAYPOINTS]\n");wp.AppendLine("; GPS:TargetName:X:Y:Z:#FF75C9F1:");foreach(var w in wpLines)if(w.StartsWith("GPS:"))wp.AppendLine(w);
        built["[WAYPOINTS]"]=wp.ToString();
        int refW=0,asmW=0;foreach(var r in padRef)if(r.IsProducing)refW++;foreach(var a in padAsm)if(a.IsProducing)asmW++;
        var st=new StringBuilder("[STATUS]\n");st.AppendLine($"refineries = {refW}/{padRef.Count} working");st.AppendLine($"assemblers = {asmW}/{padAsm.Count} working");st.AppendLine($"cargo      = {padCargoPct:F0}%");st.AppendLine($"autoOrg    = {(autoOrg?"ON":"OFF")}");st.AppendLine($"ammoStock  = {ammoStock}");st.AppendLine($"ammoType   = {ammoTypeIdx}");st.AppendLine($"ammoQueued = {ammoQueued}");st.AppendLine($"ammoReq    = {(ammoReq?1:0)}|need={ammoReqNeed}|type={ammoReqType}|con={mslConCnt}|push={ammoPushed}");
        built["[STATUS]"]=st.ToString();
        var ore=new StringBuilder("[ORE]\n");string[] oreOrd={"Iron","Nickel","Silicon","Cobalt","Silver","Gold","Magnesium","Uranium","Platinum","Stone","Ice"};foreach(var o in oreOrd){int v=oStk.ContainsKey(o)?oStk[o]:0;if(v>0)ore.AppendLine($"{o,-12} = {v:N0}");}
        built["[ORE]"]=ore.ToString();
        var ing=new StringBuilder("[INGOTS]\n");string[] ingOrd={"Iron","Nickel","Silicon","Cobalt","Silver","Gold","Magnesium","Uranium","Platinum","Gravel"};foreach(var i in ingOrd){string k=i=="Gravel"?"Stone":i;int v=iStk.ContainsKey(k)?iStk[k]:0;int tg=iNd.ContainsKey(k)?iNd[k]:0;ing.AppendLine($"{i,-12} = {v:N0}/{tg:N0}");}
        built["[INGOTS]"]=ing.ToString();
        var cmp=new StringBuilder("[COMPONENTS]\n");string[] cmpOrd={"SteelPlate","Construction","InteriorPlate","SmallTube","LargeTube","Motor","Computer","MetalGrid","Display","BulletproofGlass","PowerCell","Thrust","Explosives","Detector","RadioCommunication","GravityGenerator","Girder","Medical","Reactor","SolarCell","Superconductor"};foreach(var cn in cmpOrd){int stk=cStk.ContainsKey(cn)?cStk[cn]:0;int tg=cNd.ContainsKey(cn)?cNd[cn]:0;int diff=tg-stk;string sign=diff>=0?"+":"-";string rf=itemRecycle.Contains(cn)?" -R":"";cmp.AppendLine($"{cn,-20} = {stk}{sign}{Math.Abs(diff)}/{tg}{rf}");}
        built["[COMPONENTS]"]=cmp.ToString();
        var tam=new StringBuilder("[TURRET_AMMO]\n");string[] taDisp={"NATO_25x184mm","AutocannonClip","MediumCalibreAmmo","LargeCalibreAmmo","SmallRailgunAmmo","LargeRailgunAmmo","Missile200mm"};foreach(var k in taDisp){int stk=taStk.ContainsKey(k)?taStk[k]:0;int tgt=taNd.ContainsKey(k)?taNd[k]:taTarget;int diff=tgt-stk;string sign=diff>=0?"+":"-";string rf=itemRecycle.Contains(k)?" -R":"";tam.AppendLine($"{k,-20} = {stk}{sign}{Math.Abs(diff)}/{tgt}{rf}");}
        built["[TURRET_AMMO]"]=tam.ToString();
        var bot=new StringBuilder("[BOTTLES]\n");int h2Diff=h2Target-pH2B;int o2Diff=o2Target-pO2B;string h2rf=itemRecycle.Contains("HydrogenBottle")?" -R":"";string o2rf=itemRecycle.Contains("OxygenBottle")?" -R":"";string h2Sign=h2Diff>=0?"+":"-";string o2Sign=o2Diff>=0?"+":"-";bot.AppendLine($"{"HydrogenBottle",-20} = {pH2B}{h2Sign}{Math.Abs(h2Diff)}/{h2Target}{h2rf}");bot.AppendLine($"{"OxygenBottle",-20} = {pO2B}{o2Sign}{Math.Abs(o2Diff)}/{o2Target}{o2rf}");
        built["[BOTTLES]"]=bot.ToString();
        var tls=new StringBuilder("[TOOLS_WEAPONS]\n");for(int i=0;i<tIT.Length;i++)for(int j=0;j<tIT[i].Length;j++){string itm=tIT[i][j];int stk=tStk.ContainsKey(itm)?tStk[itm]:0;int diff=toolTarget-stk;string sign=diff>=0?"+":"-";string rf=itemRecycle.Contains(itm)?" -R":"";tls.AppendLine($"{itm,-24} = {stk}{sign}{Math.Abs(diff)}/{toolTarget}{rf}");}
        built["[TOOLS_WEAPONS]"]=tls.ToString();
        var pam=new StringBuilder("[PERSONAL_AMMO]\n");string[] pAN={"NATO_5p56_Mag","MR-20_Mag","MR-50A_Mag","MR-30E_Mag","S-10_Mag","S-20A_Mag","Elite_Mag","RocketMag","FlareMag"};for(int i=0;i<pAmmoBP.Length;i++){int tgt=paNd.ContainsKey(pAmmoIT[i])?paNd[pAmmoIT[i]]:500;int stk=pAmmoStk.ContainsKey(pAmmoIT[i])?pAmmoStk[pAmmoIT[i]]:0;int diff=tgt-stk;string sign=diff>=0?"+":"-";string rf=itemRecycle.Contains(pAN[i])?" -R":"";pam.AppendLine($"{pAN[i],-20} = {stk}{sign}{Math.Abs(diff)}/{tgt}{rf}");}
        built["[PERSONAL_AMMO]"]=pam.ToString();
        foreach(var kv in built)secs[kv.Key]=kv.Value;
        var cdsb=new StringBuilder();foreach(var kv in secs){string v=kv.Value;if(!v.EndsWith("\n"))v+="\n";cdsb.Append(v);}Me.CustomData=cdsb.ToString();
        }
        
        void ReadBtnSettings(){
        ReadOwnSettings();
        ReadPadSettings();
        }
        void ReadOwnSettings(){
        string d=Me.CustomData;
        if(string.IsNullOrEmpty(d))return;
        bool inCfg=false,inInv=false;
        var ls=d.Split('\n');
        foreach(var l in ls){
        string lt=l.Trim();
        if(lt.StartsWith("[CONFIG]")||lt.StartsWith("[TARGETS]")){inCfg=true;inInv=false;continue;}
        if(lt.StartsWith("[COMPONENTS]")||lt.StartsWith("[TURRET_AMMO]")||lt.StartsWith("[BOTTLES]")||lt.StartsWith("[TOOLS")||lt.StartsWith("[PERSONAL_AMMO]")){inInv=true;inCfg=false;continue;}
        if(lt.StartsWith("[")){inCfg=false;inInv=false;continue;}
        if(lt.StartsWith("====")||lt.StartsWith("----")||lt.StartsWith("#")||lt.StartsWith(";")||!lt.Contains("="))continue;
        if(inInv&&lt.Contains("=")){string itm=lt.Split('=')[0].Trim();if(lt.Contains("-R"))itemRecycle.Add(itm);else if(lt.Contains("-X"))itemRecycle.Remove(itm);continue;}
        if(!inCfg)continue;
        var ps=lt.Split('|');
        foreach(var p in ps){
        string pt=p.Split(';')[0].Trim();
        var kv=pt.Split('=');
        if(kv.Length<2)continue;
        string k=kv[0].Trim();
        string v=kv[1].Split(' ')[0].Split('(')[0].Trim();
        int n;
        if(!int.TryParse(v,out n))continue;
        if(k=="ammo"||k=="tgt")ammoTarget=n;
        else if(k=="load")ammoLoad=n;
        else if(k=="ice")iceTarget=n;
        else if(k=="uran")uranTarget=n;
        else if(k=="h2"){h2Target=Math.Max(20,n);SetBottleQuotas();}
        else if(k=="o2"){o2Target=Math.Max(20,n);SetBottleQuotas();}
        else if(k=="tool"){toolTarget=Math.Max(20,n);SetToolQuotas(toolTarget);}
        else if(k=="mslammo"||k=="mslammotarget"||k=="s10"){mslAmmoTarget=Math.Max(1000,n);}
        else if(k=="ta"||k=="turret"){taTarget=Math.Max(0,n);SetTurretAmmoQuotas();}
        else if(k=="nato25")TAn("NATO_25x184mm",n);
        else if(k=="autocannon")TAn("AutocannonClip",n);
        else if(k=="assault")TAn("MediumCalibreAmmo",n);
        else if(k=="artillery")TAn("LargeCalibreAmmo",n);
        else if(k=="srail")TAn("SmallRailgunAmmo",n);
        else if(k=="lrail")TAn("LargeRailgunAmmo",n);
        else if(k=="missile"||k=="rocket")TAn("Missile200mm",n);
        else if(k=="type"){if(n!=ammoTypeIdx&&n>=0&&n<10){string oldA=ammoITNames[ammoTypeIdx];PAn(oldA,500);ammoTypeIdx=n;ammoBP=MyDefinitionId.Parse(BP+ammoBPNames[ammoTypeIdx]);ammoType=MyItemType.Parse(OB+"AmmoMagazine/"+ammoITNames[ammoTypeIdx]);string newA=ammoITNames[ammoTypeIdx];PAn(newA,mslAmmoTarget);}}
        }}}
        void ReadPadSettings(){
        if(padPB==null)FindSiblingPBs();
        if(padPB==null)return;
        string d=padPB.CustomData;
        if(string.IsNullOrEmpty(d))return;
        bool inMsl=false,inPad=false;
        var ls=d.Split('\n');
        foreach(var l in ls){
        string lt=l.Trim();
        if(lt.StartsWith("[MISSILE]")){inMsl=true;inPad=false;continue;}
        if(lt.StartsWith("[PAD_CFG]")||lt.StartsWith("[PAD_STATUS]")||lt.StartsWith("[PAD_DATA]")){inPad=true;inMsl=false;continue;}
        if(lt.StartsWith("[")){inMsl=false;inPad=false;continue;}
        if(lt.StartsWith("====")||lt.StartsWith("----")||lt.StartsWith("#")||lt.StartsWith(";")||!lt.Contains("="))continue;
        if(!inMsl&&!inPad)continue;
        var ps=lt.Split('|');
        foreach(var p in ps){
        string pt=p.Split(';')[0].Trim();
        var kv=pt.Split('=');
        if(kv.Length<2)continue;
        string k=kv[0].Trim();
        string v=kv[1].Split(' ')[0].Split('(')[0].Trim();
        if(k=="mode"){padMode=v;continue;}
        if(k=="phase"){mslPhase=v;continue;}
        if(k=="target"){mslTarget=v;continue;}
        if(k=="ctrlMode"){ctrlMode=v;continue;}
        if(k=="ctrlTarget"){ctrlTarget=v;continue;}
        if(k=="ctrlStatus"){ctrlStatus=v;continue;}
        if(k=="prtPhase"){prtPhase=v;continue;}
        int n;float f;
        if(k=="mslDist"&&float.TryParse(v,out f)){mslDist=f;continue;}
        if(k=="mslSpeed"&&float.TryParse(v,out f)){mslSpeed=f;continue;}
        if(k=="mslAlt"&&float.TryParse(v,out f)){mslAlt=f;continue;}
        if(k=="mslFuel"&&float.TryParse(v,out f)){mslFuel=f;continue;}
        if(k=="mslETA"&&float.TryParse(v,out f)){mslETA=f;continue;}
        if(k=="mslBatPct"&&float.TryParse(v,out f)){mslBatPct=f;continue;}
        if(k=="mslH2Pct"&&float.TryParse(v,out f)){mslH2Pct=f;continue;}
        if(k=="mslO2Pct"&&float.TryParse(v,out f)){mslO2Pct=f;continue;}
        if(k=="mslH2F"&&float.TryParse(v,out f)){mslH2Fill=f;continue;}
        if(k=="mslH2C"&&float.TryParse(v,out f)){mslH2Cap=f;continue;}
        if(k=="mslO2F"&&float.TryParse(v,out f)){mslO2Fill=f;continue;}
        if(k=="mslO2C"&&float.TryParse(v,out f)){mslO2Cap=f;continue;}
        if(k=="mslBatC"&&float.TryParse(v,out f)){mslBatC=f;continue;}
        if(k=="mslBatM"&&float.TryParse(v,out f)){mslBatM=f;continue;}
        if(k=="prtPist"&&float.TryParse(v,out f)){prtPist=f;continue;}
        if(!int.TryParse(v,out n))continue;
        if(k=="ammoReq")ammoReq=n==1;
        else if(k=="ammoReqNeed")ammoReqNeed=n;
        else if(k=="ammoReqType")ammoReqType=n;
        else if(k=="mslCount")mslCount=n;
        else if(k=="mslArmed")mslArmed=n;
        else if(k=="mslReady")mslReady=n;
        else if(k=="ctrlPads")ctrlPads=n;
        else if(k=="ctrlArmed")ctrlArmed=n;
        else if(k=="ctrlReady")ctrlReady=n;
        else if(k=="merged")mergeConn=n==1;
        else if(k=="conLocked")conLocked=n==1;
        else if(k=="warArmed")warArmed=n==1;
        else if(k=="warCount")warCount=n;
        else if(k=="mslIce")mslIce=n;
        else if(k=="mslUran")mslUran=n;
        else if(k=="mslAmmo")mslAmmo=n;
        else if(k=="mslAmmoLoad")mslAmmoLoad=n;
        else if(k=="mslGenCnt")mslGenCnt=n;
        else if(k=="mslH2Cnt")mslH2Cnt=n;
        else if(k=="mslO2Cnt")mslO2Cnt=n;
        else if(k=="mslReactCnt")mslReactCnt=n;
        else if(k=="mslLsrCnt")mslLsrCnt=n;
        else if(k=="mslLsrLnk")mslLsrLnk=n;
        else if(k=="mslAntCnt")mslAntCnt=n;
        else if(k=="type"&&n>=0&&n<10){if(n!=ammoTypeIdx){string oldA=ammoITNames[ammoTypeIdx];PAn(oldA,500);ammoTypeIdx=n;UpdateAmmoType();string newA=ammoITNames[ammoTypeIdx];PAn(newA,mslAmmoTarget);}}
        else if(k=="prtState")prtState=n;
        else if(k=="prtRem")prtRem=n;
        else if(k=="prtTot")prtTot=n;
        else if(k=="prtBld")prtBld=n;
        else if(k=="printing")printing=n==1;
        }}
        bpNd.Clear();
        if(d.Contains("[BLUEPRINT]")){int bsi=d.IndexOf("[BLUEPRINT]");if(bsi>=0){int bei=d.IndexOf("\n[",bsi+11);string bsec=bei>0?d.Substring(bsi,bei-bsi):d.Substring(bsi);foreach(var bl in bsec.Split('\n')){if(!bl.Contains("="))continue;var bkv=bl.Split('=');if(bkv.Length<2)continue;string bk=bkv[0].Trim();if(bk.Length==0||bk.StartsWith("["))continue;int bv;if(int.TryParse(bkv[1].Trim(),out bv)&&bv>0)bpNd[bk]=bv;}}}}
        
        void LoadMissileAmmo(){
        mslConCnt=0;ammoPushed=0;
        var mCon=new List<IMyShipConnector>();
        GridTerminalSystem.GetBlocksOfType(mCon,c=>{string n=c.CustomName.ToUpper();return n.Contains("[AMMO]")&&(n.Contains("MISSILE")||n.Contains($"PAD{padID}"));});
        if(mCon.Count==0){GridTerminalSystem.GetBlocksOfType(mCon,c=>{string n=c.CustomName.ToUpper();return n.Contains("AMMO")&&c.IsSameConstructAs(Me);});}
        mslConCnt=mCon.Count;
        if(mCon.Count==0)return;
        var mAmmo=mCon[0].GetInventory();if(mAmmo==null)return;
        var at=MyItemType.Parse(OB+"AmmoMagazine/"+ammoITNames[ammoReqType]);
        int curAmmo=(int)mAmmo.GetItemAmount(at);
        if(curAmmo>mslAmmoLoad&&ammoCargo!=null){
        int excess=curAmmo-mslAmmoLoad;var dI=ammoCargo.GetInventory();if(dI!=null){var L=GL(mAmmo);for(int i=L.Count-1;i>=0&&excess>0;i--){if(L[i].Type!=at)continue;int amt=Math.Min((int)L[i].Amount,excess);mAmmo.TransferItemTo(dI,i,null,true,(MyFixedPoint)amt);excess-=amt;}}}
        if(!ammoReq||ammoReqNeed<=0)return;
        int pushed=0;
        Action<IMyInventory>pushInv=sI=>{if(pushed>=ammoReqNeed||sI==null)return;var L=GL(sI);for(int i=L.Count-1;i>=0&&pushed<ammoReqNeed;i--){if(L[i].Type!=at)continue;int amt=Math.Min((int)L[i].Amount,ammoReqNeed-pushed);sI.TransferItemTo(mAmmo,i,null,true,(MyFixedPoint)amt);pushed+=amt;}};
        Action<IMyCargoContainer>push=src=>{if(src!=null)pushInv(src.GetInventory());};
        push(ammoCargo);push(pAmmoCargo);push(toolCargo);
        foreach(var c in padCargo){if(pushed>=ammoReqNeed)break;push(c);}
        foreach(var c in sharedCargo){if(pushed>=ammoReqNeed)break;push(c);}
        foreach(var c in subgridCargo){if(pushed>=ammoReqNeed)break;push(c);}
        foreach(var a in padAsm){if(pushed>=ammoReqNeed)break;pushInv(a.GetInventory(1));}
        ammoPushed=pushed;
        }
        
        void UpdateLCDs(){
        UpdateHistory();
        if(padMode=="FLIGHT"){
        if(lcd4!=null)UpdateLCD4Flight();
        if(lcd5!=null)UpdateLCD5();
        if(lcd6!=null)UpdateLCD6Flight();
        }else if(padMode=="CONTROLLER"){
        if(lcd4!=null)UpdateLCD4Ctrl();
        if(lcd5!=null)UpdateLCD5();
        if(lcd6!=null)UpdateLCD6Ctrl();
        }else if(padMode=="MISSILE"){
        if(lcd4!=null)UpdateLCD4();
        if(lcd5!=null)UpdateLCD5();
        if(lcd6!=null)UpdateLCD6();
        }else if(padMode=="PRINT"){
        if(lcd4!=null)UpdateLCD4Print();
        if(lcd5!=null)UpdateLCD5();
        if(lcd6!=null)UpdateLCD6Print();
        }else{
        if(lcd4!=null)UpdateLCD4();
        if(lcd5!=null)UpdateLCD5();
        if(lcd6!=null)UpdateLCD6();
        }
        if(lcd9!=null)UpdateLCD9();
        if(lcd10!=null)UpdateLCD10();
        if(lcd11!=null)UpdateLCD11();
        }
        
        void UpdateHistory(){
        if(tick%10!=0)return;
        var bats=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(bats,b=>b.CubeGrid==Me.CubeGrid);
        float bc=0,bm=0,bi=0,bo=0;foreach(var b in bats){bc+=b.CurrentStoredPower;bm+=b.MaxStoredPower;bi+=b.CurrentInput;bo+=b.CurrentOutput;}
        var tanks=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(tanks,b=>b.CubeGrid==Me.CubeGrid);
        float h2c=0,h2m=0,o2c=0,o2m=0;
        foreach(var t in tanks){string n=t.BlockDefinition.SubtypeId.ToLower();if(n.Contains("hydrogen")){h2c+=(float)t.FilledRatio*t.Capacity;h2m+=t.Capacity;}else{o2c+=(float)t.FilledRatio*t.Capacity;o2m+=t.Capacity;}}
        float vc=0,vm=0;foreach(var c in padCargo){var inv=c.GetInventory();if(inv!=null){vc+=(float)inv.CurrentVolume*1000;vm+=(float)inv.MaxVolume*1000;}}
        float refInp=0,refCap=0,asmInp=0,asmCap=0;
        foreach(var r in padRef){var ri=r.GetInventory(0);if(ri!=null){refInp+=(float)ri.CurrentVolume*1000;refCap+=(float)ri.MaxVolume*1000;}}
        foreach(var a in padAsm){var ai=a.GetInventory(0);if(ai!=null){asmInp+=(float)ai.CurrentVolume*1000;asmCap+=(float)ai.MaxVolume*1000;}}
        var solars=new List<IMySolarPanel>();GridTerminalSystem.GetBlocksOfType(solars,b=>b.IsSameConstructAs(Me)&&(b.CustomName.Contains(padTag)||b.CubeGrid==Me.CubeGrid));
        float sp=0;foreach(var s in solars)sp+=s.CurrentOutput;
        var winds=new List<IMyPowerProducer>();GridTerminalSystem.GetBlocksOfType(winds,b=>b.IsSameConstructAs(Me)&&(b.CustomName.Contains(padTag)||b.CubeGrid==Me.CubeGrid)&&b.BlockDefinition.SubtypeId.Contains("Wind"));
        float wp=0;foreach(var w in winds)wp+=w.CurrentOutput;
        float rp=0;foreach(var r in padReact)rp+=r.CurrentOutput;
        float gp=0;foreach(var g in padGen){var pg=g as IMyPowerProducer;if(pg!=null)gp+=pg.CurrentOutput;}
        int qTotal=ammoQueued+h2Queued+o2Queued;foreach(var kv in cQd)qTotal+=kv.Value;
        pwrHist.Add(bc);h2Hist.Add(h2c/1000);o2Hist.Add(o2c/1000);cargoHist.Add(vc);refHist.Add(refInp);asmHist.Add(asmInp);prodHist.Add((float)qTotal);
        pwrInHist.Add(bi);pwrOutHist.Add(bo);solarHist.Add(sp);windHist.Add(wp);reactHist.Add(rp);genHist.Add(gp);
        while(pwrHist.Count>HIST_MAX)pwrHist.RemoveAt(0);while(h2Hist.Count>HIST_MAX)h2Hist.RemoveAt(0);while(o2Hist.Count>HIST_MAX)o2Hist.RemoveAt(0);while(cargoHist.Count>HIST_MAX)cargoHist.RemoveAt(0);while(refHist.Count>HIST_MAX)refHist.RemoveAt(0);while(asmHist.Count>HIST_MAX)asmHist.RemoveAt(0);while(prodHist.Count>HIST_MAX)prodHist.RemoveAt(0);while(pwrInHist.Count>HIST_MAX)pwrInHist.RemoveAt(0);while(pwrOutHist.Count>HIST_MAX)pwrOutHist.RemoveAt(0);while(solarHist.Count>HIST_MAX)solarHist.RemoveAt(0);while(windHist.Count>HIST_MAX)windHist.RemoveAt(0);while(reactHist.Count>HIST_MAX)reactHist.RemoveAt(0);while(genHist.Count>HIST_MAX)genHist.RemoveAt(0);
        }
        
        void UpdateLCD4(){
        var f=BL(lcd4);
        string[] viewNames={"BUILD STATUS","MISSILE STATUS","FUEL/TARGET","POWER","CARGO","PRODUCTION","COMMS"};
        SH(f,10,$"{viewNames[viewIdx]} [{viewIdx+1}/7]",cPri);
        float y=50;
        if(viewIdx==0){
        string[] allComp={"SteelPlate","Construction","InteriorPlate","SmallTube","LargeTube","Motor","Computer","MetalGrid","Display","BulletproofGlass","PowerCell","Thrust","Explosives","Detector","RadioCommunication","GravityGenerator","Girder","Medical","Reactor","SolarCell","Superconductor"};
        int maxRows=(int)((lcdH-70*lcdYS)/(22*lcdYS));int compPerCol=Math.Max(5,(maxRows-6)/2);
        ST(f,20,y,"COMPONENTS",cPri,0.55f);y+=28;
        int cnt=0;float startY=y;
        foreach(string k in allComp){if(cnt>=compPerCol*2)break;int hv=cStk.ContainsKey(k)?cStk[k]:0;int nd=cNd.ContainsKey(k)?cNd[k]:0;int need=Math.Max(0,nd-hv);Color c=hv>=nd?cOK:cErr;float xp=cnt<compPerCol?15:260;float yp=startY+(cnt%compPerCol)*22;string nm=k.Length>12?k.Substring(0,10)+"..":k;ST(f,xp,yp,$"{nm}:{hv}+{need}/{nd}",c,0.42f);cnt++;}
        y=startY+compPerCol*22+8;SD(f,y);y+=12;
        ST(f,20,y,"FUEL & AMMO",cAcc,0.55f);y+=26;
        int aT=ammoTypeIdx==0?mslAmmoTarget:ammoTarget;ST(f,15,y,$"Ammo({ammoNames[ammoTypeIdx]}):{ammoStock}+{ammoQueued}/{aT}",ammoStock>=aT?cOK:cWrn,0.42f);y+=22;
        int h2Nd=Math.Max(0,h2Target-pH2B);ST(f,15,y,$"H2Bot:{pH2B}+{h2Nd}/{h2Target}",pH2B>=h2Target?cOK:cWrn,0.42f);
        int o2Nd=Math.Max(0,o2Target-pO2B);ST(f,260,y,$"O2Bot:{pO2B}+{o2Nd}/{o2Target}",pO2B>=o2Target?cOK:cWrn,0.42f);y+=22;
        int ice=oStk.ContainsKey("Ice")?oStk["Ice"]:0;int urn=iStk.ContainsKey("Uranium")?iStk["Uranium"]:0;
        ST(f,15,y,$"Ice:{ice} Uranium:{urn}",ice>100&&urn>5?cOK:cWrn,0.42f);y+=28;
        SD(f,y);y+=12;ST(f,20,y,"MISSING",cErr,0.55f);y+=26;
        int misMax=Math.Max(3,(maxRows-compPerCol*2-8)/2);cnt=0;startY=y;
        foreach(var kv in cMis){if(cnt>=misMax*2)break;float xp=cnt<misMax?15:260;float yp=startY+(cnt%misMax)*22;string nm=kv.Key.Length>10?kv.Key.Substring(0,8)+"..":kv.Key;ST(f,xp,yp,$"{nm}:-{kv.Value}",cErr,0.42f);cnt++;}
        if(cMis.Count==0)ST(f,15,y,"All stocked!",cOK,0.5f);
        }else if(viewIdx==1){
        if(mslReady>0||mslArmed>0||mslCount>0||printing){
        ST(f,20,y,$"Missiles Ready: {mslReady}",mslReady>0?cOK:cSec,0.6f);y+=35;
        ST(f,20,y,$"Missiles Armed: {mslArmed}",mslArmed>0?cWrn:cSec,0.6f);y+=35;
        ST(f,20,y,$"Total Count: {mslCount}",cTxt,0.6f);y+=35;
        ST(f,20,y,$"Phase: {mslPhase}",cAcc,0.6f);y+=40;
        SD(f,y);y+=15;
        ST(f,20,y,"COMMUNICATIONS",cSec,0.5f);y+=28;
        ST(f,20,y,$"Laser Antennas: {mslLsrCnt}  Linked: {mslLsrLnk}",mslLsrLnk>0?cOK:mslLsrCnt>0?cWrn:cSec,0.55f);y+=30;
        ST(f,20,y,$"Radio Antennas: {mslAntCnt}",mslAntCnt>0?cOK:cSec,0.55f);y+=35;
        if(printing){float pct=prtTot>0?(float)(prtTot-prtRem)/prtTot:0;SLB(f,20,y,350,18,"Printing",pct,pct>=1?cOK:cWrn,cBdr);y+=30;ST(f,20,y,$"{pct*100:F0}% ({prtTot-prtRem}/{prtTot})",pct>=1?cOK:cWrn,0.5f);}
        }else{
        ST(f,20,y,"No Missile",cWrn,0.8f);y+=50;
        ST(f,20,y,"Build steps:",cSec,0.6f);y+=35;
        ST(f,30,y,"1.PRINT 2.Blueprint 3.Weld 4.DOCK",cTxt,0.55f);y+=45;
        ST(f,20,y,"Missing:",cSec,0.6f);y+=32;
        int cnt=0;foreach(var kv in cMis){if(cnt>=4)break;ST(f,30,y,$"{kv.Key}: -{kv.Value}",cWrn,0.55f);y+=28;cnt++;}
        if(cMis.Count==0)ST(f,30,y,"All components stocked!",cOK,0.6f);
        }
        }else if(viewIdx==2){
        float h2p=padH2Pct/100f,o2p=padO2Pct/100f;
        SLB(f,20,y,350,16,"Hydrogen",h2p,PctCol(h2p),cBdr);y+=40;
        SLB(f,20,y,350,16,"Oxygen",o2p,PctCol(o2p),cBdr);y+=40;
        SLB(f,20,y,350,16,"Battery",padBatPct/100f,PctCol(padBatPct/100f),cBdr);y+=40;
        int aT2=ammoTypeIdx==0?mslAmmoTarget:ammoTarget;ST(f,20,y,$"Ammo: {ammoStock}+{ammoQueued}/{aT2}",ammoStock>=aT2?cOK:cWrn,0.5f);y+=30;
        ST(f,20,y,$"H2 Bottles: {pH2B}+{h2Queued}/{h2Target}",pH2B>=h2Target?cOK:cWrn,0.5f);y+=30;
        ST(f,20,y,$"O2 Bottles: {pO2B}+{o2Queued}/{o2Target}",pO2B>=o2Target?cOK:cWrn,0.5f);
        }else if(viewIdx==3){
        var bats=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(bats,b=>b.CubeGrid==Me.CubeGrid);
        float bc=0,bm=0,bi=0,bo=0;foreach(var b in bats){bc+=b.CurrentStoredPower;bm+=b.MaxStoredPower;bi+=b.CurrentInput;bo+=b.CurrentOutput;}
        float batP=bm>0?bc/bm:0;float netFlow=bi-bo;
        SLB(f,20,y,350,20,"Battery Charge",batP,PctCol(batP),cBdr);y+=45;
        ST(f,20,y,$"Stored: {bc:F1}/{bm:F1} MWh",cTxt,0.5f);y+=30;
        ST(f,20,y,$"Input: {bi:F2} MW  Output: {bo:F2} MW",cTxt,0.5f);y+=30;
        ST(f,20,y,$"Net: {(netFlow>=0?"+":"")}{netFlow:F2} MW",netFlow>=0?cOK:cWrn,0.5f);y+=35;
        int uTot=pUrnStg+pUrnReact;
        ST(f,20,y,"URANIUM",cSec,0.4f);y+=20;
        ST(f,30,y,$"Total: {uTot}",uTot>10?cOK:cErr,0.55f);y+=25;
        ST(f,30,y,$"Storage: {pUrnStg}   Reactors: {pUrnReact}",cTxt,0.45f);
        }else if(viewIdx==4){
        var allItems=new List<KeyValuePair<string,string>>();
        foreach(var kv in oStk)allItems.Add(new KeyValuePair<string,string>("Ore",kv.Key+": "+kv.Value));
        foreach(var kv in iStk){string dn=kv.Key=="Stone"?"Gravel":kv.Key;allItems.Add(new KeyValuePair<string,string>("Ingot",dn+": "+kv.Value));}
        foreach(var kv in cStk)allItems.Add(new KeyValuePair<string,string>("Comp",kv.Key+": "+kv.Value));
        foreach(var kv in tStk)allItems.Add(new KeyValuePair<string,string>("Tool",kv.Key+": "+kv.Value));
        foreach(var kv in pAmmoStk)allItems.Add(new KeyValuePair<string,string>("PAmmo",kv.Key+": "+kv.Value));
        if(ammoStock>0)allItems.Add(new KeyValuePair<string,string>("Ammo",ammoNames[ammoTypeIdx]+": "+ammoStock));
        if(pH2B>0)allItems.Add(new KeyValuePair<string,string>("Bottle","H2 Bottles: "+pH2B));
        if(pO2B>0)allItems.Add(new KeyValuePair<string,string>("Bottle","O2 Bottles: "+pO2B));
        foreach(var kv in foodStk)allItems.Add(new KeyValuePair<string,string>("Food",kv.Key+": "+kv.Value));
        foreach(var kv in miscStk)allItems.Add(new KeyValuePair<string,string>("Misc",kv.Key+": "+kv.Value));
        int totI=allItems.Count;int endPos=Math.Min(scrollOff+16,totI);
        SLB(f,20,y,460,18,"Cargo Fill",padCargoPct/100f,PctCol(1-padCargoPct/100f),cBdr);y+=26;
        ST(f,20,y,$"STORAGE ({endPos}/{totI})",cSec,0.45f);y+=22;
        int skip=scrollOff,cnt=0;string lastCat="";
        foreach(var kv in allItems){if(skip>0){skip--;continue;}if(cnt>=16)break;
        string[]sp=kv.Value.Split(':');string nm=sp[0].Trim();string vl=sp.Length>1?sp[1].Trim():"";
        if(kv.Key!=lastCat){Color cc=kv.Key=="Ore"?cWrn:kv.Key=="Ingot"?cAcc:kv.Key=="Comp"?cOK:kv.Key=="Tool"?cPri:kv.Key=="Food"?new Color(200,255,100):kv.Key=="Misc"?new Color(180,150,200):cSec;ST(f,20,y,kv.Key.ToUpper(),cc,0.4f);y+=18;lastCat=kv.Key;}
        ST(f,25,y,nm,cTxt,0.45f);ST(f,280,y,vl,cTxt,0.45f);y+=20;cnt++;}
        }else if(viewIdx==5){
        int refW=0,asmW=0;foreach(var r in padRef)if(r.IsProducing)refW++;foreach(var a in padAsm)if(a.IsProducing)asmW++;
        ST(f,20,y,$"Refineries: {refW}/{padRef.Count}  Assemblers: {asmW}/{padAsm.Count}",refW>0||asmW>0?cOK:cSec,0.45f);y+=28;
        int totQ=cQd.Count+(ammoQueued>0?1:0)+(h2Queued>0||o2Queued>0?1:0);
        int totPg5=Math.Max(1,(cQd.Count+5)/6);int curPg5=Math.Min(scrollOff/20,totPg5-1)+1;
        ST(f,20,y,$"Queue ({totQ} types) ({curPg5}/{totPg5}):",cTxt,0.45f);y+=22;
        int cnt=0,skip=(curPg5-1)*6;
        foreach(var kv in cQd){if(skip>0){skip--;continue;}if(cnt>=6)break;ST(f,20,y,$"{kv.Key}: {kv.Value}",cAcc,0.4f);y+=18;cnt++;}
        if(cnt<6&&ammoQueued>0){ST(f,20,y,$"{ammoNames[ammoTypeIdx]}: {ammoQueued}",cAcc,0.4f);y+=18;cnt++;}
        if(cnt<6&&(h2Queued>0||o2Queued>0)){ST(f,20,y,$"Bottles H2:{h2Queued} O2:{o2Queued}",cAcc,0.4f);}
        }else{
        ST(f,20,y,"PAD FACILITIES",cSec,0.45f);y+=20;
        ST(f,20,y,$"Medical Bays: {padMedCount}",cTxt,0.45f);y+=18;
        ST(f,20,y,$"Survival Kits: {padSurvCount}",cTxt,0.45f);y+=18;
        ST(f,20,y,$"Cryo Chambers: {padCryoCount}",cTxt,0.45f);y+=20;
        ST(f,20,y,$"Miners Tracked: {trkM.Count}",cTxt,0.5f);y+=25;
        int docked=0,working=0;foreach(var m in trkM.Values){if(m.status=="DOCKED")docked++;else if(m.status.Contains("DRILL")||m.status.Contains("GRIND"))working++;}
        ST(f,20,y,$"Docked: {docked}  Working: {working}",cOK,0.5f);y+=25;
        ST(f,20,y,$"IGC: MINER_BEACON",cSec,0.4f);
        }
        f.Dispose();
        }
        
        void UpdateLCD5(){
        var f=BL(lcd5);
        SH(f,10,"POWER OVERVIEW",cPri);
        var bats=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(bats,b=>b.CubeGrid==Me.CubeGrid);
        float bc=0,bm=0,bi=0,bo=0;foreach(var b in bats){bc+=b.CurrentStoredPower;bm+=b.MaxStoredPower;bi+=b.CurrentInput;bo+=b.CurrentOutput;}
        float batP=bm>0?bc/bm:0;float netFlow=bi-bo;
        SLB(f,20,50,350,20,"Battery Storage",batP,PctCol(batP),cBdr);
        ST(f,20,90,$"Stored: {bc:F1} / {bm:F1} MWh",cTxt,0.5f);
        string flowTxt=netFlow>=0?$"Charging: +{netFlow:F2} MW":$"Discharging: {netFlow:F2} MW";
        ST(f,20,120,flowTxt,netFlow>=0?cOK:cWrn,0.5f);
        SD(f,160);
        var solar=new List<IMySolarPanel>();GridTerminalSystem.GetBlocksOfType(solar,b=>b.IsSameConstructAs(Me)&&(b.CustomName.Contains(padTag)||b.CubeGrid==Me.CubeGrid));
        float sp=0;foreach(var s in solar)sp+=s.CurrentOutput;
        ST(f,20,170,$"Solar: {solar.Count} panels = {sp:F2} MW",sp>0?cOK:cSec,0.5f);
        var wind=new List<IMyPowerProducer>();GridTerminalSystem.GetBlocksOfType(wind,b=>b.IsSameConstructAs(Me)&&(b.CustomName.Contains(padTag)||b.CubeGrid==Me.CubeGrid)&&b.BlockDefinition.SubtypeId.Contains("Wind"));
        float wp=0;foreach(var w in wind)wp+=w.CurrentOutput;
        ST(f,20,200,$"Wind: {wind.Count} turbines = {wp:F2} MW",wp>0?cOK:cSec,0.5f);
        float rp=0;foreach(var r in padReact)rp+=r.CurrentOutput;
        ST(f,20,230,$"Reactors: {padReact.Count} units = {rp:F2} MW",rp>0?cOK:cSec,0.5f);
        float gp=0;foreach(var g in padGen)if(g.Enabled)gp+=0.5f;
        ST(f,20,260,$"Generators: {padGen.Count} units = {gp:F1} MW (est)",gp>0?cOK:cSec,0.5f);
        SD(f,300);
        var tanks=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(tanks,b=>b.CubeGrid==Me.CubeGrid);
        float h2c=0,h2m=0;foreach(var t in tanks){string n=t.BlockDefinition.SubtypeId.ToLower();if(n.Contains("hydrogen")){h2c+=(float)t.FilledRatio*t.Capacity;h2m+=t.Capacity;}}
        float h2p=h2m>0?h2c/h2m:0;
        SLB(f,20,320,350,16,"Hydrogen Tanks",h2p,PctCol(h2p),cBdr);
        ST(f,20,360,$"Stored: {h2c/1000:F1}k / {h2m/1000:F1}k L",cTxt,0.45f);
        SD(f,390);
        int refW=0,asmW=0;var refOres=new Dictionary<string,int>();var asmItems=new Dictionary<string,int>();
        foreach(var r in padRef){if(r.IsProducing){refW++;var rI=r.GetInventory(0);if(rI!=null){foreach(var it in GL(rI))AD(refOres,it.Type.SubtypeId,(int)it.Amount);}}}
        foreach(var a in padAsm){if(a.IsProducing){asmW++;var q=new List<MyProductionItem>();a.GetQueue(q);if(q.Count>0)AD(asmItems,q[0].BlueprintId.SubtypeName,(int)q[0].Amount);}}
        ST(f,20,400,"PRODUCTION",cPri,0.5f);
        ST(f,20,425,$"Refineries: {refW}/{padRef.Count}",refW>0?cOK:cSec,0.45f);
        string refTxt="";if(refOres.Count>0){int c=0;foreach(var kv in refOres){if(c>0)refTxt+=", ";refTxt+=$"{kv.Key}";c++;if(c>=3)break;}}else refTxt="Idle";
        ST(f,150,425,refTxt,cAcc,0.4f);
        ST(f,20,455,$"Assemblers: {asmW}/{padAsm.Count}",asmW>0?cOK:cSec,0.45f);
        string asmTxt="";if(asmItems.Count>0){int c=0;foreach(var kv in asmItems){if(c>0)asmTxt+=", ";asmTxt+=$"{kv.Key}x{kv.Value}";c++;if(c>=2)break;}}else asmTxt="Idle";
        ST(f,150,455,asmTxt,cAcc,0.4f);
        f.Dispose();
        }
        
        void UpdateLCD6(){
        var f=BL(lcd6);
        string[] titles={"Battery Power","Hydrogen Tanks","Oxygen Tanks","Cargo Capacity","Refinery Input","Assembler Input","Production Queue","Power Input","Power Output","Solar Output","Wind Output","Reactor Output"};
        string[] units={"MWh","kL","kL","L","L","L","","MW","MW","MW","MW","MW"};
        List<float>[] datas={pwrHist,h2Hist,o2Hist,cargoHist,refHist,asmHist,prodHist,pwrInHist,pwrOutHist,solarHist,windHist,reactHist};
        Color[] cols={cAcc,cPri,cOK,cWrn,new Color(200,100,50),new Color(100,200,100),new Color(200,150,255),new Color(255,255,100),new Color(255,150,100),new Color(255,220,50),new Color(150,200,255),new Color(50,255,150)};
        int gMax=12;int gIdx=graphIdx%gMax;
        SH(f,10,$"{titles[gIdx]} [{gIdx+1}/{gMax}]",cols[gIdx]);
        SGraph(f,20,50,472,280,datas[gIdx],cols[gIdx],cBdr,0,units[gIdx]);
        float cur=datas[gIdx].Count>0?datas[gIdx][datas[gIdx].Count-1]:0;
        string desc="";
        if(gIdx==0){var bats=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(bats,b=>b.CubeGrid==Me.CubeGrid);float bc=0,bm=0;foreach(var b in bats){bc+=b.CurrentStoredPower;bm+=b.MaxStoredPower;}float pct=bm>0?bc/bm*100:0;desc=$"Current: {cur:F1} MWh ({pct:F0}% of {bm:F1} MWh)";}
        else if(gIdx==1){var tanks=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(tanks,b=>b.CubeGrid==Me.CubeGrid&&b.BlockDefinition.SubtypeId.ToLower().Contains("hydrogen"));float h2c=0,h2m=0;foreach(var t in tanks){h2c+=(float)t.FilledRatio*t.Capacity;h2m+=t.Capacity;}float pct=h2m>0?h2c/h2m*100:0;desc=$"Current: {cur:F0}kL ({pct:F0}% of {h2m/1000:F0}kL)";}
        else if(gIdx==2){var tanks=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(tanks,b=>b.CubeGrid==Me.CubeGrid&&!b.BlockDefinition.SubtypeId.ToLower().Contains("hydrogen"));float o2c=0,o2m=0;foreach(var t in tanks){o2c+=(float)t.FilledRatio*t.Capacity;o2m+=t.Capacity;}float pct=o2m>0?o2c/o2m*100:0;desc=$"Current: {cur:F0}kL ({pct:F0}% of {o2m/1000:F0}kL)";}
        else if(gIdx==3){float vc=0,vm=0;foreach(var c in padCargo){var inv=c.GetInventory();if(inv!=null){vc+=(float)inv.CurrentVolume*1000;vm+=(float)inv.MaxVolume*1000;}}float pct=vm>0?vc/vm*100:0;desc=$"Current: {cur:F0}L ({pct:F0}% of {vm:F0}L)";}
        else if(gIdx==4){int refW=0;foreach(var r in padRef)if(r.IsProducing)refW++;desc=$"Current: {cur:F0}L | {refW}/{padRef.Count} refineries active";}
        else if(gIdx==5){int asmW=0;foreach(var a in padAsm)if(a.IsProducing)asmW++;desc=$"Current: {cur:F0}L | {asmW}/{padAsm.Count} assemblers active";}
        else if(gIdx==6){int asmW=0;foreach(var a in padAsm)if(a.IsProducing)asmW++;desc=$"Production: {asmW}/{padAsm.Count} assemblers active";}
        else if(gIdx==7){var bats=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(bats,b=>b.CubeGrid==Me.CubeGrid);float bi=0;foreach(var b in bats)bi+=b.CurrentInput;desc=$"Current: {cur:F2} MW charging ({bats.Count} batteries)";}
        else if(gIdx==8){var bats=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(bats,b=>b.CubeGrid==Me.CubeGrid);float bo=0;foreach(var b in bats)bo+=b.CurrentOutput;desc=$"Current: {cur:F2} MW discharging ({bats.Count} batteries)";}
        else if(gIdx==9){var solars=new List<IMySolarPanel>();GridTerminalSystem.GetBlocksOfType(solars,b=>b.IsSameConstructAs(Me)&&(b.CustomName.Contains(padTag)||b.CubeGrid==Me.CubeGrid));float sp=0,spm=0;foreach(var s in solars){sp+=s.CurrentOutput;spm+=s.MaxOutput;}desc=$"Current: {cur:F2} MW ({solars.Count} panels, max {spm:F1} MW)";}
        else if(gIdx==10){var winds=new List<IMyPowerProducer>();GridTerminalSystem.GetBlocksOfType(winds,b=>b.IsSameConstructAs(Me)&&(b.CustomName.Contains(padTag)||b.CubeGrid==Me.CubeGrid)&&b.BlockDefinition.SubtypeId.Contains("Wind"));float wp=0,wpm=0;foreach(var w in winds){wp+=w.CurrentOutput;wpm+=w.MaxOutput;}desc=$"Current: {cur:F2} MW ({winds.Count} turbines, max {wpm:F1} MW)";}
        else if(gIdx==11){float rp=0,rpm=0;foreach(var r in padReact){rp+=r.CurrentOutput;rpm+=r.MaxOutput;}desc=$"Current: {cur:F2} MW ({padReact.Count} reactors, max {rpm:F1} MW)";}
        ST(f,20,340,desc,cols[gIdx],0.45f);
        SD(f,380);
        var bats2=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(bats2,b=>b.CubeGrid==Me.CubeGrid);
        float bc2=0,bm2=0;foreach(var b in bats2){bc2+=b.CurrentStoredPower;bm2+=b.MaxStoredPower;}
        var tnks2=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(tnks2,b=>b.CubeGrid==Me.CubeGrid);
        float h2r=0,o2r=0;foreach(var t in tnks2){string n=t.BlockDefinition.SubtypeId.ToLower();if(n.Contains("hydrogen"))h2r+=(float)t.FilledRatio;else o2r+=(float)t.FilledRatio;}
        int hc=0,oc=0;foreach(var t in tnks2){string n=t.BlockDefinition.SubtypeId.ToLower();if(n.Contains("hydrogen"))hc++;else oc++;}
        float p1=bm2>0?bc2/bm2:0,p2=hc>0?h2r/hc:0,p3=oc>0?o2r/oc:0,p4=padCargoPct/100f;
        int rW2=0,aW2=0;foreach(var r in padRef)if(r.IsProducing)rW2++;foreach(var a in padAsm)if(a.IsProducing)aW2++;
        SB(f,20,395,80,10,p1,PctCol(p1),cBdr);ST(f,105,393,$"Battery {p1*100:F0}%",cTxt,0.35f);
        SB(f,20,410,80,10,p2,PctCol(p2),cBdr);ST(f,105,408,$"H2 {p2*100:F0}%",cTxt,0.35f);
        SB(f,20,425,80,10,p3,PctCol(p3),cBdr);ST(f,105,423,$"O2 {p3*100:F0}%",cTxt,0.35f);
        SB(f,20,440,80,10,p4,PctCol(1-p4),cBdr);ST(f,105,438,$"Cargo {p4*100:F0}%",cTxt,0.35f);
        ST(f,250,395,$"Ref: {rW2}/{padRef.Count}",rW2>0?cOK:cSec,0.4f);
        ST(f,250,415,$"Asm: {aW2}/{padAsm.Count}",aW2>0?cOK:cSec,0.4f);
        ST(f,20,470,$"Graph [{gIdx+1}/{gMax}]",cSec,0.35f);
        f.Dispose();
        }
        
        void UpdateLCD9(){
        var f=BL(lcd9);
        if(trkM.Count==0){
        if(mslCount>0){SH(f,10,"ACTIVE MISSILES",cAcc);
        SBx(f,15,45,480,80,cBg,cBdr);ST(f,20,50,"PRIMARY MISSILE",cSec,0.4f);
        Color pc=mslPhase=="TARGET"?cErr:mslPhase=="REENTRY"?cWrn:cOK;
        ST(f,20,70,mslPhase,pc,0.7f);ST(f,250,50,$"Distance: {mslDist:F0}m",cTxt,0.45f);
        ST(f,250,75,$"Speed: {mslSpeed:F0}m/s",cTxt,0.45f);ST(f,250,100,$"ETA: {mslETA:F0}s",cAcc,0.45f);
        SD(f,145);ST(f,20,155,"FLEET STATUS",cTxt,0.5f);
        ST(f,20,185,$"Active: {mslCount}",cPri,0.5f);ST(f,150,185,$"Armed: {mslArmed}",mslArmed>0?cWrn:cSec,0.5f);
        ST(f,280,185,$"Ready: {mslReady}",mslReady>0?cOK:cSec,0.5f);
        SLB(f,20,235,350,16,"Fuel",mslFuel/100f,PctCol(mslFuel/100f),cBdr);
        }else if(printing){SH(f,10,"WELDING PROGRESS",cPri);float pct=prtTot>0?(float)(prtTot-prtRem)/prtTot:0;
        SBx(f,15,45,470,100,cBg,cBdr);ST(f,20,50,"OVERALL PROGRESS",cSec,0.5f);
        SB(f,20,85,350,25,pct,PctCol(pct),cBdr);ST(f,380,85,$"{pct*100:F0}%",cTxt,0.6f);
        ST(f,20,120,$"Building: {prtTot-prtRem} of {prtTot} blocks",cTxt,0.5f);
        ST(f,20,145,$"Blocks ready to weld: {prtBld}",prtBld>0?cOK:cSec,0.45f);
        SD(f,185);ST(f,20,195,"CURRENT OPERATION",cSec,0.5f);
        SBx(f,15,220,470,60,cBg,cBdr);ST(f,20,230,"Phase",cSec,0.45f);ST(f,20,260,prtPhase,cAcc,0.5f);
        ST(f,250,230,"Piston",cSec,0.45f);ST(f,250,260,$"{prtPist:F1}m",cTxt,0.5f);
        }else if(conLocked){SH(f,10,"AMMUNITION LOADING",cPri);float ammoPct=mslAmmoLoad>0?(float)mslAmmo/mslAmmoLoad:0;
        SBx(f,15,45,470,80,cBg,cBdr);ST(f,20,50,"CURRENT LOAD",cSec,0.5f);
        SB(f,20,80,350,20,ammoPct,PctCol(ammoPct),cBdr);ST(f,380,80,$"{ammoPct*100:F0}%",cTxt,0.5f);
        ST(f,20,110,$"{mslAmmo} / {mslAmmoLoad} rounds loaded",cTxt,0.45f);
        SD(f,145);ST(f,20,155,"AMMUNITION TYPE",cSec,0.5f);
        SBx(f,15,180,470,50,cBg,cBdr);ST(f,20,190,$"{ammoNames[ammoReqType]}",cAcc,0.6f);
        SD(f,250);bool loading=mslAmmo<mslAmmoLoad;
        ST(f,20,260,loading?"Transferring to missile...":"Load complete",loading?cWrn:cOK,0.5f);
        }else{SH(f,10,"PAD STATUS",cPri);
        SLB(f,20,50,350,16,"Battery",padBatPct/100f,PctCol(padBatPct/100f),cBdr);
        SLB(f,20,90,350,16,"Hydrogen",padH2Pct/100f,PctCol(padH2Pct/100f),cBdr);
        SLB(f,20,130,350,16,"Cargo",padCargoPct/100f,PctCol(1-padCargoPct/100f),cBdr);
        ST(f,20,180,"No miners tracked",cSec,0.5f);ST(f,20,210,"Ready for operations",cSec,0.4f);}
        }else{SH(f,10,"MINER FLEET",cPri);
        int dkd=0,fly=0;foreach(var kv in trkM){if(kv.Value.docked)dkd++;else fly++;}
        ST(f,20,45,$"Total: {trkM.Count}  Docked: {dkd}  Flying: {fly}",cTxt,0.5f);
        float y=70;int cnt=0;
        var sortedM=trkM.Values.ToList();sortedM.Sort((a,b)=>{if(a.docked!=b.docked)return a.docked?-1:1;return a.name.CompareTo(b.name);});
        foreach(var m in sortedM){
        if(cnt>=5)break;
        string loc=m.docked?"Docked":$"{m.dist:F0}m";
        string ico=m.status=="DOCKED"?"=":m.status.Contains("DRILL")?"*":m.status.Contains("GRIND")?"#":">";
        Color sc=m.status=="DOCKED"?cOK:m.status.Contains("DRILL")?cAcc:m.status.Contains("GRIND")?cWrn:cPri;
        SBx(f,15,y-2,480,55,cBg,cBdr);
        ST(f,20,y,$"[{ico}] {m.name}",sc,0.5f);
        ST(f,300,y,loc,cTxt,0.45f);
        SB(f,20,y+22,140,10,m.bat/100f,PctCol(m.bat/100f),cBdr);ST(f,165,y+18,$"Battery {m.bat:F0}%",cTxt,0.35f);
        SB(f,250,y+22,140,10,m.crg/100f,PctCol(1-m.crg/100f),cBdr);ST(f,395,y+18,$"Cargo {m.crg:F0}%",cTxt,0.35f);
        string cargoSum="";int cc=0;foreach(var kv in m.cargoItems.OrderByDescending(x=>x.Value)){if(cc>=3)break;string nm=GetCargoName(kv.Key);if(cc>0)cargoSum+=", ";cargoSum+=$"{nm}:{FmtCargoAmt(kv.Value)}";cc++;}
        if(string.IsNullOrEmpty(cargoSum))cargoSum=m.status;
        string fuelNeed="";if(m.reactCount>0&&m.uranium<5)fuelNeed+=" U!";if(m.genCount>0&&m.ice<100)fuelNeed+=" Ice!";if(m.o2Tanks>0&&m.o2<30)fuelNeed+=" O2!";if(m.h2<30)fuelNeed+=" H2!";
        ST(f,20,y+38,cargoSum,cSec,0.35f);if(!string.IsNullOrEmpty(fuelNeed))ST(f,380,y+38,fuelNeed,cErr,0.35f);
        y+=60;cnt++;}}
        f.Dispose();
        }
        
        void UpdateLCD10(){
        var f=BL(lcd10);
        if(trkM.Count==0){
        if(mslCount>0){SH(f,10,"TARGET INFO",cAcc);
        SBx(f,15,45,480,80,cBg,cBdr);ST(f,20,50,"TARGET DESIGNATION",cSec,0.4f);
        ST(f,20,75,mslTarget,cAcc,0.6f);ST(f,20,105,$"Tracking Mode: {ctrlMode}",cTxt,0.45f);
        SD(f,145);ST(f,20,155,"APPROACH VECTOR",cTxt,0.5f);
        float bearing=(float)(Math.Atan2(mslDist,mslAlt)*180/Math.PI);
        ST(f,20,185,$"Bearing: {bearing:F1} deg",cTxt,0.5f);
        ST(f,20,215,$"Glide Slope: {(mslAlt>0?mslDist/mslAlt:0):F1}",cTxt,0.5f);
        SD(f,255);ST(f,20,265,"IMPACT PREDICTION",cTxt,0.5f);
        int etaMins=(int)(mslETA/60);int etaSecs=(int)(mslETA%60);
        ST(f,20,295,$"Time to Impact: {etaMins:D2}:{etaSecs:D2}",mslETA<30?cErr:mslETA<60?cWrn:cOK,0.55f);
        }else if(printing){SH(f,10,"MISSILE PRODUCTION",cPri);float pct=prtTot>0?(float)(prtTot-prtRem)/prtTot:0;bool done=pct>=1;
        SBx(f,15,45,470,70,done?cOK:cWrn,cBdr);ST(f,20,55,"BUILD COMPLETION",cBg,0.5f);
        ST(f,20,80,done?"MISSILE READY":"CONSTRUCTION IN PROGRESS",cBg,0.55f);
        SD(f,135);ST(f,20,145,"PRODUCTION CHECKLIST",cSec,0.5f);
        ST(f,20,175,$"[{(prtTot>0?"X":" ")}] Projection loaded",prtTot>0?cOK:cSec,0.45f);
        ST(f,20,205,$"[{(printing?"X":" ")}] Printer active",printing?cOK:cSec,0.45f);
        ST(f,20,235,$"[{(prtRem==0&&prtTot>0?"X":" ")}] All blocks complete",prtRem==0&&prtTot>0?cOK:cWrn,0.45f);
        ST(f,20,265,$"[{(done?"X":" ")}] Ready for dock",done?cOK:cSec,0.45f);
        }else if(conLocked){SH(f,10,"MISSILE READINESS",cPri);
        bool batOK=mslBatPct>=99;bool h2OK=mslH2Pct>=99||mslH2Cnt==0;bool o2OK=mslO2Pct>=99||mslO2Cnt==0;
        bool ammoOK=mslAmmo>=mslAmmoLoad;bool allOK=batOK&&h2OK&&o2OK&&ammoOK;
        SBx(f,15,45,470,70,allOK?cOK:cWrn,cBdr);ST(f,20,55,"LAUNCH READINESS",cBg,0.5f);
        ST(f,20,80,allOK?"ALL SYSTEMS GO":"LOADING IN PROGRESS",cBg,0.55f);
        SD(f,135);ST(f,20,145,"CHECKLIST",cSec,0.5f);
        ST(f,20,175,$"[{(batOK?"X":" ")}] Battery 100%",batOK?cOK:cWrn,0.45f);
        ST(f,20,205,$"[{(h2OK?"X":" ")}] Hydrogen full",h2OK?cOK:cWrn,0.45f);
        ST(f,20,235,$"[{(ammoOK?"X":" ")}] Ammo loaded",ammoOK?cOK:cWrn,0.45f);
        ST(f,20,265,$"[{(conLocked?"X":" ")}] Connector locked",conLocked?cOK:cWrn,0.45f);
        }else{SH(f,10,"STORAGE OVERVIEW",cPri);
        ST(f,20,50,$"Large: {padCargoL.Count}  Medium: {padCargoM.Count}  Small: {padCargoS.Count}",cTxt,0.45f);
        SLB(f,20,90,350,16,"Cargo Fill",padCargoPct/100f,PctCol(1-padCargoPct/100f),cBdr);
        int oreT=0;foreach(var kv in oStk)oreT+=kv.Value;int ingT=0;foreach(var kv in iStk)ingT+=kv.Value;int cmpT=0;foreach(var kv in cStk)cmpT+=kv.Value;
        ST(f,20,140,$"Ore: {oreT/1000}k  Ingots: {ingT/1000}k  Components: {cmpT}",cTxt,0.4f);
        ST(f,20,180,"No miners tracked",cSec,0.5f);ST(f,20,210,"Ready for operations",cSec,0.4f);}
        }else{SH(f,10,"MINER DETAILS",cPri);
        float y=45;int cnt=0;
        var sortedM2=trkM.Values.ToList();sortedM2.Sort((a,b)=>{if(a.docked!=b.docked)return a.docked?-1:1;return a.name.CompareTo(b.name);});
        foreach(var m in sortedM2){
        if(cnt>=3)break;
        string ico=m.status=="DOCKED"?"=":m.status.Contains("DRILL")?"*":">";
        Color sc=m.status=="DOCKED"?cOK:m.status.Contains("DRILL")?cAcc:cPri;
        SBx(f,15,y-2,480,130,cBg,cBdr);
        ST(f,20,y,$"[{ico}] {m.name}",sc,0.55f);
        ST(f,20,y+22,$"Status: {m.status}",cTxt,0.45f);
        SLB(f,20,y+45,200,12,"Battery",m.bat/100f,PctCol(m.bat/100f),cBdr);
        SLB(f,250,y+45,200,12,"Cargo",m.crg/100f,PctCol(1-m.crg/100f),cBdr);
        SLB(f,20,y+75,200,12,"Hydrogen",m.h2/100f,PctCol(m.h2/100f),cBdr);
        if(m.o2Tanks>0){SLB(f,250,y+75,200,12,"Oxygen",m.o2/100f,PctCol(m.o2/100f),cBdr);}
        else if(!m.docked){ST(f,250,y+75,$"Spd:{m.spd:F0} Dist:{m.dist:F0}m",cTxt,0.4f);}
        else{ST(f,250,y+75,"Docked",cOK,0.4f);}
        string fuelLine="";if(m.reactCount>0)fuelLine+=$"U:{m.uranium} ";if(m.genCount>0)fuelLine+=$"Ice:{m.ice} ";
        if(!string.IsNullOrEmpty(fuelLine)){ST(f,20,y+95,fuelLine,m.uranium<5||m.ice<100?cErr:cTxt,0.4f);}
        if(m.cargoItems.Count>0){string cgLine="";int cIdx=0;foreach(var kv in m.cargoItems.OrderByDescending(x=>x.Value)){if(cIdx>=4)break;if(cIdx>0)cgLine+=" ";cgLine+=$"{GetCargoName(kv.Key)}:{FmtCargoAmt(kv.Value)}";cIdx++;}
        ST(f,20,y+110,cgLine,cAcc,0.35f);}else{ST(f,20,y+110,$"Drills: {m.drillsOn}/{m.drills}  Grinders: {m.grindersOn}/{m.grinders}",cSec,0.4f);}
        y+=135;cnt++;}}
        f.Dispose();
        }
        
        string FN(string s){switch(s){case"handdrill":return"Drill 1";case"handdrill2":return"Drill 2";case"handdrill3":return"Drill 3";case"handdrill4":return"Drill 4";case"welder":return"Welder 1";case"welder2":return"Welder 2";case"welder3":return"Welder 3";case"welder4":return"Welder 4";case"anglegrinder":return"Grinder 1";case"anglegrinder2":return"Grinder 2";case"anglegrinder3":return"Grinder 3";case"anglegrinder4":return"Grinder 4";case"automaticrifle":return"Rifle";case"preciseautomaticrifle":return"Rifle Prec";case"rapidfireautomaticrifle":return"Rifle Rapid";case"ultimateautomaticrifle":return"Rifle Elite";case"semiautopistol":return"Pistol";case"fullautopistol":return"Pistol Auto";case"elitepistol":return"Pistol Elite";case"basichandheldlauncher":return"Launcher";case"advancedhandheldlauncher":return"Launcher Adv";case"flaregun":return"Flare Gun";default:return s;}}
        void UpdateLCD11(){
        var f=BL(lcd11);
        ST(f,256,8,"PERSONAL EQUIPMENT",cAcc,0.5f,TextAlignment.CENTER);
        float c1=5,c2=135,c3=270,c4=405;
        float y=38;
        ST(f,c1,y,"TOOLS",cPri,0.35f);ST(f,c2,y,"WEAPONS",cPri,0.35f);ST(f,c3,y,"AMMO",cPri,0.35f);ST(f,c4,y,"BOTTLES",cPri,0.35f);
        y+=18;
        string[] pAN={"5.56mm","MR-20","MR-50A","MR-30E","S-10","S-20A","Elite","Rocket","Flare"};
        int toolCnt=0,wpnCnt=0;
        for(int i=0;i<3;i++)toolCnt+=tIT[i].Length;
        for(int i=3;i<tIT.Length;i++)wpnCnt+=tIT[i].Length;
        int totalRows=Math.Max(Math.Max(toolCnt,wpnCnt),Math.Max(pAmmoIT.Length,2));
        int maxRows=(int)((lcdH/lcdYS-60)/14);
        int dispRows=Math.Min(maxRows,totalRows-lcd11Scroll);
        if(dispRows<1)dispRows=1;
        float startY=y;
        for(int row=0;row<dispRows;row++){
        int idx=row+lcd11Scroll;
        float ry=startY+row*14;
        int tIdx=idx;
        for(int g=0;g<3&&tIdx>=0;g++){if(tIdx<tIT[g].Length){string itm=tIT[g][tIdx];int hv=tStk.ContainsKey(itm)?tStk[itm]:0;int tgt=tNd.ContainsKey(itm)?tNd[itm]:toolTarget;int need=Math.Max(0,tgt-hv);Color tc=hv>=tgt?cOK:cErr;ST(f,c1,ry,$"{FN(itm)} {hv}+{need}/{tgt}",tc,0.28f);break;}tIdx-=tIT[g].Length;}
        int wIdx=idx;
        for(int g=3;g<tIT.Length&&wIdx>=0;g++){if(wIdx<tIT[g].Length){string itm=tIT[g][wIdx];int hv=tStk.ContainsKey(itm)?tStk[itm]:0;int tgt=tNd.ContainsKey(itm)?tNd[itm]:toolTarget;int need=Math.Max(0,tgt-hv);Color wc=hv>=tgt?cOK:cErr;ST(f,c2,ry,$"{FN(itm)} {hv}+{need}/{tgt}",wc,0.28f);break;}wIdx-=tIT[g].Length;}
        if(idx<pAmmoIT.Length){int hv=pAmmoStk.ContainsKey(pAmmoIT[idx])?pAmmoStk[pAmmoIT[idx]]:0;int tgt=paNd.ContainsKey(pAmmoIT[idx])?paNd[pAmmoIT[idx]]:500;int need=Math.Max(0,tgt-hv);Color ac=hv>=tgt?cOK:cErr;ST(f,c3,ry,$"{pAN[idx]} {hv}+{need}/{tgt}",ac,0.28f);}
        if(idx==0){int hv=pH2B;int need=Math.Max(0,h2Target-hv);Color bc=hv>=h2Target?cOK:cErr;ST(f,c4,ry,$"H2 {hv}+{need}/{h2Target}",bc,0.28f);}
        if(idx==1){int hv=pO2B;int need=Math.Max(0,o2Target-hv);Color bc=hv>=o2Target?cOK:cErr;ST(f,c4,ry,$"O2 {hv}+{need}/{o2Target}",bc,0.28f);}}
        if(totalRows>maxRows)ST(f,430,startY+maxRows*14,$"[{lcd11Scroll+1}-{lcd11Scroll+dispRows}/{totalRows}]",cSec,0.25f);
        f.Dispose();
        }
        
        void CheckBeacons(){
        if(bcnL==null)return;
        DateTime DT=DateTime.Now;
        while(bcnL.HasPendingMessage){
        var msg=bcnL.AcceptMessage();
        if(!(msg.Data is string))continue;
        var p=((string)msg.Data).Split('|');
        if(p.Length<16||p[0]!="MB")continue;
        long eid;if(!long.TryParse(p[1],out eid))continue;
        MinerData m;
        if(!trkM.TryGetValue(eid,out m)){m=new MinerData();trkM[eid]=m;}
        m.name=p[2];
        float.TryParse(p[3],out m.bat);float.TryParse(p[4],out m.crg);float.TryParse(p[5],out m.h2);
        var pos=p[6].Split(',');if(pos.Length>=3){double x,y,z;if(double.TryParse(pos[0],out x)&&double.TryParse(pos[1],out y)&&double.TryParse(pos[2],out z))m.pos=new Vector3D(x,y,z);}
        double.TryParse(p[7],out m.spd);double.TryParse(p[8],out m.alt);double.TryParse(p[9],out m.dist);
        m.status=p[10];int.TryParse(p[11],out m.drills);int.TryParse(p[12],out m.drillsOn);int.TryParse(p[13],out m.grinders);int.TryParse(p[14],out m.grindersOn);
        m.docked=p[15]=="1";m.lastSeen=DT;
        if(p.Length>=21){double.TryParse(p[16],out m.outboundSecs);double.TryParse(p[17],out m.returnSecs);int.TryParse(p[18],out m.cycles);double.TryParse(p[19],out m.etaSecs);m.outbound=p[20]=="1";}
        if(p.Length>=22&&p[21].StartsWith("FUEL:")){var fl=p[21].Substring(5).Split(',');if(fl.Length>=6){float.TryParse(fl[0],out m.o2);int.TryParse(fl[1],out m.ice);int.TryParse(fl[2],out m.uranium);int.TryParse(fl[3],out m.o2Tanks);int.TryParse(fl[4],out m.genCount);int.TryParse(fl[5],out m.reactCount);}}
        if(p.Length>=23&&p[22].StartsWith("CARGO:")){m.cargoRaw=p[22].Substring(6);ParseMinerCargo(m);}}
        CorrelateDockedMiners();
        CleanStaleMiners();
        }
        
        void CorrelateDockedMiners(){
        DateTime DT=DateTime.Now;
        int pn=0;
        foreach(var cn in oreC){if(cn.Status!=MyShipConnectorStatus.Connected)continue;pn++;var ot=cn.OtherConnector;if(ot==null||ot.CubeGrid==Me.CubeGrid)continue;
        long gid=ot.CubeGrid.EntityId;string gNm=ot.CubeGrid.CustomName;
        if(trkM.ContainsKey(gid)){var x=trkM[gid];x.portNum=pn;x.docked=true;x.lastSeen=DT;if(!string.IsNullOrEmpty(gNm))x.name=gNm;}
        else{var m=new MinerData();m.name=string.IsNullOrEmpty(gNm)?$"Port{pn}":gNm;m.portNum=pn;m.docked=true;m.lastSeen=DT;m.status="DOCKED";
        var bt=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(bt,b=>b.CubeGrid==ot.CubeGrid);
        if(bt.Count>0){float c=0,mx=0;foreach(var b in bt){c+=b.CurrentStoredPower;mx+=b.MaxStoredPower;}m.bat=mx>0?(c/mx)*100:0;}
        var cg=new List<IMyCargoContainer>();GridTerminalSystem.GetBlocksOfType(cg,b=>b.CubeGrid==ot.CubeGrid);
        if(cg.Count>0){float c=0,mx=0;foreach(var g in cg){var iv=g.GetInventory();if(iv!=null){c+=(float)iv.CurrentVolume;mx+=(float)iv.MaxVolume;}}m.crg=mx>0?(c/mx)*100:0;}
        var hs=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(hs,b=>b.CubeGrid==ot.CubeGrid&&b.BlockDefinition.SubtypeId.Contains("Hydrogen"));
        if(hs.Count>0){float t=0;foreach(var h in hs)t+=(float)h.FilledRatio;m.h2=(t/hs.Count)*100;}
        var dl=new List<IMyShipDrill>();GridTerminalSystem.GetBlocksOfType(dl,b=>b.CubeGrid==ot.CubeGrid);m.drills=dl.Count;
        var gl=new List<IMyShipGrinder>();GridTerminalSystem.GetBlocksOfType(gl,b=>b.CubeGrid==ot.CubeGrid);m.grinders=gl.Count;
        var gn=new List<IMyGasGenerator>();GridTerminalSystem.GetBlocksOfType(gn,b=>b.CubeGrid==ot.CubeGrid);m.genCount=gn.Count;
        foreach(var g in gn){var gi=g.GetInventory();if(gi!=null){var gL=new List<MyInventoryItem>();gi.GetItems(gL);foreach(var it in gL)if(it.Type.SubtypeId=="Ice")m.ice+=(int)it.Amount;}}
        var rc=new List<IMyReactor>();GridTerminalSystem.GetBlocksOfType(rc,b=>b.CubeGrid==ot.CubeGrid);m.reactCount=rc.Count;
        foreach(var r in rc){var ri=r.GetInventory();if(ri!=null){var rL=new List<MyInventoryItem>();ri.GetItems(rL);foreach(var it in rL)if(it.Type.SubtypeId.Contains("Uranium"))m.uranium+=(int)it.Amount;}}
        var o2=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(o2,b=>b.CubeGrid==ot.CubeGrid&&!b.BlockDefinition.SubtypeId.Contains("Hydrogen"));m.o2Tanks=o2.Count;
        if(o2.Count>0){float t=0;foreach(var o in o2)t+=(float)o.FilledRatio;m.o2=(t/o2.Count)*100;}
        trkM[gid]=m;}}}
        
        void CleanStaleMiners(){DateTime DT=DateTime.Now;var stale=new List<long>();foreach(var kv in trkM){if((DT-kv.Value.lastSeen).TotalSeconds>120&&!kv.Value.docked)stale.Add(kv.Key);}foreach(var id in stale)trkM.Remove(id);}
        void ParseMinerCargo(MinerData m){m.cargoItems.Clear();if(string.IsNullOrEmpty(m.cargoRaw))return;var items=m.cargoRaw.Split(';');foreach(var it in items){var kv=it.Split('=');if(kv.Length!=2)continue;int amt;if(int.TryParse(kv[1],out amt))m.cargoItems[kv[0]]=amt;}}
        string GetCargoName(string key){int idx=key.IndexOf(':');return idx>=0?key.Substring(idx+1):key;}
        string FmtCargoAmt(int a){if(a>=1000000)return$"{a/1000000f:F1}M";if(a>=1000)return$"{a/1000f:F1}K";return a.ToString();}
        
        void UpdateLCD4Flight(){
        var f=BL(lcd4);
        SH(f,10,"MISSILE TELEMETRY",cAcc);
        Color pc=mslPhase=="TARGET"||mslPhase=="DETONATE"?cErr:mslPhase=="REENTRY"?cWrn:mslPhase=="COAST"||mslPhase=="ARM"?cOK:cPri;
        ST(f,20,50,$"Phase: {mslPhase}",pc,0.7f);
        ST(f,20,90,$"Target: {mslTarget}",cTxt,0.55f);
        SD(f,130);
        SLB(f,20,145,350,16,"Distance",Math.Min(1f,mslDist/10000f),cPri,cBdr);
        ST(f,400,143,$"{mslDist:F0}m",cTxt,0.45f);
        SLB(f,20,185,350,16,"Velocity",Math.Min(1f,mslSpeed/500f),cAcc,cBdr);
        ST(f,400,183,$"{mslSpeed:F0}m/s",cTxt,0.45f);
        SLB(f,20,225,350,16,"Altitude",Math.Min(1f,mslAlt/5000f),cPri,cBdr);
        ST(f,400,223,$"{mslAlt:F0}m",cTxt,0.45f);
        SLB(f,20,265,350,16,"Fuel",mslFuel/100f,PctCol(mslFuel/100f),cBdr);
        ST(f,400,263,$"{mslFuel:F0}%",cTxt,0.45f);
        SD(f,310);
        ST(f,20,320,"Estimated Time to Target",cTxt,0.5f);
        int mins=(int)(mslETA/60);int secs=(int)(mslETA%60);
        ST(f,20,350,$"{mins:D2}:{secs:D2}",cAcc,1.2f);
        SD(f,410);
        ST(f,20,420,$"Active Missiles: {mslCount}  Armed: {mslArmed}",mslArmed>0?cWrn:cTxt,0.5f);
        f.Dispose();
        }
        
        void UpdateLCD5Flight(){
        var f=BL(lcd5);
        SH(f,10,"MISSILE STATUS",cAcc);
        SBx(f,15,45,480,70,cBg,cBdr);
        ST(f,20,50,"FLIGHT PHASE",cSec,0.4f);
        Color pc=mslPhase=="TARGET"||mslPhase=="DETONATE"?cErr:mslPhase=="REENTRY"?cWrn:cOK;
        ST(f,20,70,mslPhase,pc,0.9f);
        SBx(f,15,120,235,60,cBg,cBdr);
        ST(f,20,125,"DISTANCE",cSec,0.4f);
        ST(f,20,145,$"{mslDist:F0}m",cPri,0.6f);
        SBx(f,260,120,235,60,cBg,cBdr);
        ST(f,265,125,"VELOCITY",cSec,0.4f);
        ST(f,265,145,$"{mslSpeed:F0}m/s",cAcc,0.6f);
        SBx(f,15,185,235,60,cBg,cBdr);
        ST(f,20,190,"ALTITUDE",cSec,0.4f);
        ST(f,20,210,$"{mslAlt:F0}m",cPri,0.6f);
        SBx(f,260,185,235,60,cBg,cBdr);
        ST(f,265,190,"FUEL",cSec,0.4f);
        ST(f,265,210,$"{mslFuel:F0}%",PctCol(mslFuel/100f),0.6f);
        SD(f,260);
        ST(f,20,270,"TARGET",cTxt,0.5f);
        ST(f,20,295,mslTarget,cAcc,0.5f);
        SD(f,340);
        ST(f,20,350,"WARHEAD STATUS",cTxt,0.5f);
        ST(f,20,380,mslArmed>0?"ARMED - LIVE WEAPON":"SAFE",mslArmed>0?cErr:cOK,0.6f);
        SD(f,420);
        ST(f,20,430,$"Missiles in Flight: {mslCount}",cTxt,0.5f);
        f.Dispose();
        }
        
        void UpdateLCD6Flight(){
        var f=BL(lcd6);
        SH(f,10,"TRAJECTORY",cAcc);
        SBx(f,20,50,472,250,cBg,cBdr);
        float cx=256,cy=175;
        f.Add(new MySprite(SpriteType.TEXTURE,"Circle",new Vector2(cx,cy),new Vector2(10,10),cOK));
        ST(f,cx+15,cy-8,"PAD",cOK,0.35f);
        float angle=(float)Math.Atan2(mslDist,mslAlt);
        float tx=cx+(float)Math.Cos(angle)*180;
        float ty=cy-(float)Math.Sin(angle)*180;
        f.Add(new MySprite(SpriteType.TEXTURE,"Circle",new Vector2(tx,ty),new Vector2(12,12),cErr));
        ST(f,tx+15,ty-8,"TARGET",cErr,0.35f);
        float mx=cx+(mslDist/10000f)*180;
        float my=cy-(mslAlt/5000f)*100;
        f.Add(new MySprite(SpriteType.TEXTURE,"Triangle",new Vector2(mx,my),new Vector2(16,16),cAcc));
        for(int i=1;i<5;i++)f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx+i*90,cy),new Vector2(1,200),cBdr*0.5f));
        for(int i=1;i<4;i++)f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,cy-i*50),new Vector2(400,1),cBdr*0.5f));
        SD(f,320);
        ST(f,20,330,"Ground Distance",cSec,0.4f);
        SB(f,20,350,200,12,Math.Min(1f,mslDist/10000f),cPri,cBdr);
        ST(f,230,348,$"{mslDist:F0}m",cTxt,0.4f);
        ST(f,20,380,"Altitude",cSec,0.4f);
        SB(f,20,400,200,12,Math.Min(1f,mslAlt/5000f),cAcc,cBdr);
        ST(f,230,398,$"{mslAlt:F0}m",cTxt,0.4f);
        f.Dispose();
        }
        
        void UpdateLCD4Ctrl(){
        var f=BL(lcd4);
        SH(f,10,"COMMAND CENTER",cPri);
        ST(f,20,50,$"Controller Status: {ctrlStatus}",ctrlStatus=="ACTIVE"?cOK:cTxt,0.55f);
        SD(f,90);
        SBx(f,15,100,235,70,cBg,cBdr);
        ST(f,20,105,"CONNECTED PADS",cSec,0.4f);
        ST(f,20,130,$"{ctrlPads}",cPri,0.9f);
        SBx(f,260,100,235,70,cBg,cBdr);
        ST(f,265,105,"MISSILES READY",cSec,0.4f);
        ST(f,265,130,$"{ctrlReady}",cOK,0.9f);
        SD(f,185);
        ST(f,20,195,"ATTACK MODE",cTxt,0.5f);
        ST(f,20,225,ctrlMode,cAcc,0.7f);
        SD(f,270);
        ST(f,20,280,"CURRENT TARGET",cTxt,0.5f);
        ST(f,20,310,ctrlTarget,cAcc,0.55f);
        SD(f,360);
        ST(f,20,370,"ARMED",cTxt,0.5f);
        ST(f,20,400,$"{ctrlArmed}",ctrlArmed>0?cWrn:cSec,0.7f);
        ST(f,150,370,"IN FLIGHT",cTxt,0.5f);
        ST(f,150,400,$"{mslCount}",mslCount>0?cAcc:cSec,0.7f);
        f.Dispose();
        }
        
        void UpdateLCD5Ctrl(){
        var f=BL(lcd5);
        SH(f,10,"PAD STATUS",cPri);
        ST(f,20,50,$"Pad Count: {ctrlPads}",cTxt,0.55f);
        SD(f,90);
        ST(f,20,100,"FLEET READINESS",cTxt,0.5f);
        SLB(f,20,130,350,16,"Ready",ctrlPads>0?(float)ctrlReady/ctrlPads:0,cOK,cBdr);
        ST(f,400,128,$"{ctrlReady}/{ctrlPads}",cTxt,0.45f);
        SLB(f,20,170,350,16,"Armed",ctrlPads>0?(float)ctrlArmed/ctrlPads:0,cWrn,cBdr);
        ST(f,400,168,$"{ctrlArmed}/{ctrlPads}",cTxt,0.45f);
        SD(f,220);
        ST(f,20,230,"PRODUCTION STATUS",cTxt,0.5f);
        int refW=0,asmW=0;foreach(var r in padRef)if(r.IsProducing)refW++;foreach(var a in padAsm)if(a.IsProducing)asmW++;
        ST(f,20,260,$"Refineries: {refW}/{padRef.Count} active",refW>0?cOK:cSec,0.5f);
        ST(f,20,290,$"Assemblers: {asmW}/{padAsm.Count} active",asmW>0?cOK:cSec,0.5f);
        SD(f,330);
        ST(f,20,340,"STORAGE",cTxt,0.5f);
        SLB(f,20,370,350,16,"Cargo",padCargoPct/100f,PctCol(1-padCargoPct/100f),cBdr);
        f.Dispose();
        }
        
        void UpdateLCD6Ctrl(){
        var f=BL(lcd6);
        SH(f,10,"ATTACK MODES",cPri);
        string[] modes={"GPS","ANTENNA","SENSOR","LIDAR","MANUAL","SATELLITE"};
        float y=55;
        for(int i=0;i<modes.Length;i++){
        bool sel=modes[i]==ctrlMode;
        SBx(f,15,y-2,480,35,sel?cPri*0.2f:cBg,sel?cPri:cBdr);
        ST(f,25,y,modes[i],sel?cPri:cTxt,0.55f);
        string desc=modes[i]=="GPS"?"Fixed coordinates":modes[i]=="ANTENNA"?"Track antenna signal":modes[i]=="SENSOR"?"Proximity detection":modes[i]=="LIDAR"?"Camera raycast lock":modes[i]=="MANUAL"?"Remote guided":modes[i]=="SATELLITE"?"Orbital deployment":"";
        ST(f,200,y+3,desc,cSec,0.4f);
        y+=40;}
        SD(f,310);
        ST(f,20,320,"SELECTED MODE",cTxt,0.5f);
        ST(f,20,350,ctrlMode,cAcc,0.7f);
        SD(f,400);
        ST(f,20,410,$"Target: {ctrlTarget}",cTxt,0.5f);
        f.Dispose();
        }
        
        void UpdateLCD5Missile(){
        var f=BL(lcd5);
        if(mslCount==0&&!conLocked){
        SH(f,10,"NO MISSILE",cWrn);
        ST(f,20,55,"PRINTER STATUS",cAcc,0.55f);
        float pct=prtTot>0?(float)(prtTot-prtRem)/prtTot:0;
        SLB(f,20,85,450,20,"Build Progress",pct,pct>=1?cOK:pct>0?cWrn:cSec,cBdr);
        ST(f,20,125,$"Phase: {prtPhase}",cAcc,0.5f);
        ST(f,250,125,$"Blocks: {prtTot-prtRem}/{prtTot}",cTxt,0.5f);
        if(prtPist>0)ST(f,20,155,$"Piston: {prtPist:F1}m extended",cTxt,0.45f);
        SD(f,185);
        ST(f,20,200,"COMPONENTS NEEDED",cSec,0.5f);
        int cnt=0;float y=230;foreach(var kv in cMis){if(cnt>=5)break;int hv=cStk.ContainsKey(kv.Key)?cStk[kv.Key]:0;Color cc=hv>=kv.Value?cOK:cErr;ST(f,20,y,$"{kv.Key}: {hv}/{kv.Value}",cc,0.4f);y+=22;cnt++;}
        if(cMis.Count==0)ST(f,20,y,"All components ready!",cOK,0.5f);
        }else{
        SH(f,10,"MISSILE SYSTEMS",cPri);
        SBx(f,15,45,152,70,cBg,cBdr);
        ST(f,20,50,"WARHEADS",cSec,0.4f);
        ST(f,20,70,$"{warCount}",warCount>0?cOK:cErr,0.65f);
        ST(f,70,72,warArmed?"ARM":"SAFE",warArmed?cErr:cOK,0.4f);
        SBx(f,172,45,152,70,cBg,cBdr);
        ST(f,177,50,"CONNECTOR",cSec,0.4f);
        ST(f,177,70,conLocked?"LOCKED":"OPEN",conLocked?cOK:cWrn,0.5f);
        SBx(f,329,45,152,70,cBg,cBdr);
        ST(f,334,50,"MERGE",cSec,0.4f);
        ST(f,334,70,mergeConn?"DOCKED":"UNDOCK",mergeConn?cOK:cWrn,0.5f);
        SD(f,135);
        ST(f,20,155,"AMMUNITION",cSec,0.5f);
        SBx(f,15,180,470,70,cBg,cBdr);
        float ammoPct=mslAmmoLoad>0?(float)mslAmmo/mslAmmoLoad:0;
        SB(f,20,190,350,16,ammoPct,PctCol(ammoPct),cBdr);
        ST(f,380,190,$"{mslAmmo}/{mslAmmoLoad}",cTxt,0.45f);
        ST(f,20,220,$"Type: {ammoNames[ammoReqType]}",cTxt,0.45f);
        SD(f,270);
        ST(f,20,280,"READINESS",cSec,0.5f);
        bool batOK=mslBatPct>=99;bool h2OK=mslH2Pct>=99||mslH2Cnt==0;bool ammoOK=mslAmmo>=mslAmmoLoad;
        ST(f,20,310,$"Battery: {(batOK?"FULL":"CHARGING")}",batOK?cOK:cWrn,0.45f);
        ST(f,20,340,$"Hydrogen: {(h2OK?"FULL":"FILLING")}",h2OK?cOK:cWrn,0.45f);
        ST(f,250,310,$"Ammunition: {(ammoOK?"LOADED":"LOADING")}",ammoOK?cOK:cWrn,0.45f);
        }
        f.Dispose();
        }
        
        void UpdateLCD4Print(){
        var f=BL(lcd4);
        SH(f,10,"PRINTING STATUS",cPri);
        float pct=prtTot>0?(float)(prtTot-prtRem)/prtTot:0;
        SBx(f,15,45,470,100,cBg,cBdr);
        ST(f,20,50,"PROGRESS",cSec,0.5f);
        SB(f,20,80,350,20,pct,PctCol(pct),cBdr);
        ST(f,380,80,$"{pct*100:F0}%",cTxt,0.5f);
        ST(f,20,110,$"{prtTot-prtRem} / {prtTot} blocks complete",cTxt,0.45f);
        SD(f,165);
        ST(f,20,175,"CURRENT PHASE",cSec,0.5f);
        SBx(f,15,200,470,60,cBg,cBdr);
        ST(f,20,210,prtPhase,cAcc,0.7f);
        ST(f,20,240,$"State: {(prtState==1?"EXTENDING":prtState==2?"WELDING":"CHECKING")}",cTxt,0.45f);
        SD(f,280);
        ST(f,20,290,"PRINTER POSITION",cSec,0.5f);
        SBx(f,15,315,470,60,cBg,cBdr);
        ST(f,20,325,$"Piston Extension: {prtPist:F1} meters",cTxt,0.5f);
        ST(f,20,355,$"Buildable blocks: {prtBld}",cTxt,0.45f);
        f.Dispose();
        }
        
        void UpdateLCD5Print(){
        var f=BL(lcd5);
        SH(f,10,"BUILD DETAILS",cPri);
        SBx(f,15,45,230,80,cBg,cBdr);
        ST(f,20,50,"REMAINING",cSec,0.45f);
        ST(f,20,80,$"{prtRem}",prtRem>0?cWrn:cOK,0.8f);
        SBx(f,255,45,230,80,cBg,cBdr);
        ST(f,260,50,"TOTAL",cSec,0.45f);
        ST(f,260,80,$"{prtTot}",cAcc,0.8f);
        SD(f,145);
        float pct=prtTot>0?(float)(prtTot-prtRem)/prtTot:0;
        ST(f,20,155,"COMPLETION",cSec,0.5f);
        SB(f,20,185,460,25,pct,PctCol(pct),cBdr);
        ST(f,20,220,$"{pct*100:F1}% complete",cTxt,0.5f);
        SD(f,260);
        ST(f,20,270,"BUILD STATE",cSec,0.5f);
        SBx(f,15,295,150,60,prtState==0?cAcc:cSec,cBdr);ST(f,20,305,"CHECKING",cBg,0.45f);
        SBx(f,175,295,150,60,prtState==1?cAcc:cSec,cBdr);ST(f,180,305,"EXTENDING",cBg,0.45f);
        SBx(f,335,295,150,60,prtState==2?cAcc:cSec,cBdr);ST(f,340,305,"WELDING",cBg,0.45f);
        f.Dispose();
        }
        
        void UpdateLCD6Print(){
        var f=BL(lcd6);
        SH(f,10,"PRINTER OVERVIEW",cPri);
        float pct=prtTot>0?(float)(prtTot-prtRem)/prtTot:0;
        SBx(f,15,45,470,80,pct>=1?cOK:cWrn,cBdr);
        ST(f,20,55,"BUILD STATUS",cBg,0.5f);
        ST(f,20,85,printing?(pct>=1?"BUILD COMPLETE":"BUILDING IN PROGRESS"):"PRINTER IDLE",cBg,0.6f);
        SD(f,145);
        ST(f,20,155,"BLOCK STATISTICS",cSec,0.5f);
        SBx(f,15,180,150,60,cBg,cBdr);ST(f,20,185,"Complete",cSec,0.4f);ST(f,20,210,$"{prtTot-prtRem}",cOK,0.6f);
        SBx(f,175,180,150,60,cBg,cBdr);ST(f,180,185,"Remaining",cSec,0.4f);ST(f,180,210,$"{prtRem}",prtRem>0?cWrn:cOK,0.6f);
        SBx(f,335,180,150,60,cBg,cBdr);ST(f,340,185,"Buildable",cSec,0.4f);ST(f,340,210,$"{prtBld}",prtBld>0?cOK:cSec,0.6f);
        SD(f,260);
        ST(f,20,270,"PISTON STATUS",cSec,0.5f);
        SBx(f,15,295,470,60,cBg,cBdr);
        float pistPct=prtPist/10f;
        SB(f,20,305,350,15,pistPct,cAcc,cBdr);
        ST(f,380,305,$"{prtPist:F1}m",cTxt,0.45f);
        ST(f,20,330,$"Extension: {prtPist:F1} / 10.0 meters",cTxt,0.4f);
        f.Dispose();
        }
        
        
    }
}
