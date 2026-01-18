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
    {        int padID=0;int tick=0;bool setupDone=false;bool autoOrg=true;int viewIdx=0,graphIdx=0,scrollOff=0;
        float lcdW=512,lcdH=512,lcdS=1;
        string padTag="[PAD1";
        IMyButtonPanel btn;
        IMyTextSurface lcd4,lcd5,lcd6,lcd9,lcd10;
        IMyBroadcastListener bcnL;
        Dictionary<long,MinerData> trkM=new Dictionary<long,MinerData>();
        class MinerData{public string name;public float bat,crg,h2;public Vector3D pos;public double spd,alt,dist;public string status;public int drills,drillsOn,grinders,grindersOn;public bool docked;public DateTime lastSeen;public int portNum;public double outboundSecs,returnSecs,etaSecs;public int cycles;public bool outbound;}
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
        IMyCargoContainer toolCargo=null,oreCargo=null,ingotCargo=null,compCargo=null,ammoCargo=null,bottleCargo=null,pAmmoCargo=null;
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
        Dictionary<string,int> cNd=new Dictionary<string,int>();
        Dictionary<string,int> cMis=new Dictionary<string,int>();
        Dictionary<string,int> cQd=new Dictionary<string,int>();
        Dictionary<string,int> oNd=new Dictionary<string,int>();
        Dictionary<string,int> aIN=new Dictionary<string,int>();
        Dictionary<string,int> pAmmoStk=new Dictionary<string,int>();
        Dictionary<string,int> pAmmoQ=new Dictionary<string,int>();
        Dictionary<string,int> tStk=new Dictionary<string,int>();
        Dictionary<string,int> tQ=new Dictionary<string,int>();
        int ammoStock=0,ammoTarget=50000,ammoQueued=0,ammoLoad=10106,ammoTypeIdx=0;
        bool ammoReq=false;int ammoReqType=0,ammoReqNeed=0,ammoReqHave=0;
        IMyShipConnector padCon=null;
        int pH2B=0,pO2B=0,h2Target=20,o2Target=20,h2Queued=0,o2Queued=0;
        int pIceStg=0,pIceGen=0,pUrnStg=0,pUrnReact=0,iceTarget=0,uranTarget=0;
        int toolTarget=20,pAmmoTarget=100;
        float padCargoPct=0,padBatPct=0,padH2Pct=0,padO2Pct=0;
        int padMedCount=0,padSurvCount=0,padCryoCount=0;
        string padMode="NORMAL";
        string mslPhase="IDLE",mslTarget="---";float mslDist=0,mslSpeed=0,mslAlt=0,mslFuel=0,mslETA=0;int mslCount=0,mslArmed=0,mslReady=0;
        int ctrlPads=0,ctrlArmed=0,ctrlReady=0;string ctrlMode="GPS",ctrlTarget="---",ctrlStatus="IDLE";
        float mslBatPct=0,mslH2Pct=0,mslO2Pct=0,mslH2Fill=0,mslH2Cap=0,mslO2Fill=0,mslO2Cap=0,mslBatC=0,mslBatM=0;
        int mslIce=0,mslUran=0,mslAmmo=0,mslAmmoLoad=0,warCount=0,mslGenCnt=0,mslH2Cnt=0,mslO2Cnt=0,mslReactCnt=0;
        bool warArmed=false,conLocked=false;
        string prtPhase="CHECKING";int prtState=0,prtRem=0,prtTot=0,prtBld=0;float prtPist=0;bool printing=false;
        const string BP="MyObjectBuilder_BlueprintDefinition/";
        const string OB="MyObjectBuilder_";
        string[] ammoNames={"Pistol","Rifle","Rapid","Rocket","Gatling"};
        string[] ammoBPNames={"SemiAutoPistolMagazine","AutomaticRifleGun_Mag_20rd","RapidFireAutomaticRifleGun_Mag_50rd","Missile200mm","NATO_25x184mmMagazine"};
        string[] ammoITNames={"SemiAutoPistolMagazine","AutomaticRifleGun_Mag_20rd","RapidFireAutomaticRifleGun_Mag_50rd","Missile200mm","NATO_25x184mm"};
        MyDefinitionId ammoBP;
        MyItemType ammoType;
        MyDefinitionId h2BottleBP=MyDefinitionId.Parse(BP+"HydrogenBottle");
        MyDefinitionId o2BottleBP=MyDefinitionId.Parse(BP+"OxygenBottle");
        MyItemType h2BottleType=MyItemType.Parse(OB+"GasContainerObject/HydrogenBottle");
        MyItemType o2BottleType=MyItemType.Parse(OB+"GasContainerObject/OxygenBottle");
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
        {"Superconductor",MyDefinitionId.Parse(BP+"Superconductor")}};
        string[] tlsNames={"Drill","Welder","Grinder","Rifle","Pistol","Launcher","Flare"};
        string[][] tBP={new[]{"HandDrill","HandDrill2","HandDrill3","HandDrill4"},new[]{"Welder","Welder2","Welder3","Welder4"},new[]{"AngleGrinder","AngleGrinder2","AngleGrinder3","AngleGrinder4"},new[]{"AutomaticRifle","PreciseAutomaticRifle","RapidFireAutomaticRifle","UltimateAutomaticRifle"},new[]{"SemiAutoPistol","FullAutoPistol","ElitePistol"},new[]{"BasicHandHeldLauncher","AdvancedHandHeldLauncher"},new[]{"FlareGun"}};
        string[][] tIT={new[]{"HandDrillItem","HandDrill2Item","HandDrill3Item","HandDrill4Item"},new[]{"WelderItem","Welder2Item","Welder3Item","Welder4Item"},new[]{"AngleGrinderItem","AngleGrinder2Item","AngleGrinder3Item","AngleGrinder4Item"},new[]{"AutomaticRifleItem","PreciseAutomaticRifleItem","RapidFireAutomaticRifleItem","UltimateAutomaticRifleItem"},new[]{"SemiAutoPistolItem","FullAutoPistolItem","ElitePistolItem"},new[]{"BasicHandHeldLauncherItem","AdvancedHandHeldLauncherItem"},new[]{"FlareGunItem"}};
        string[] pAmmoBP={"AutomaticRifleGun_Mag_20rd","PreciseAutomaticRifleGun_Mag_5rd","RapidFireAutomaticRifleGun_Mag_50rd","UltimateAutomaticRifleGun_Mag_30rd","SemiAutoPistolMagazine","FullAutoPistolMagazine","ElitePistolMagazine","Missile200mm","FlareClip"};
        string[] pAmmoIT={"AutomaticRifleGun_Mag_20rd","PreciseAutomaticRifleGun_Mag_5rd","RapidFireAutomaticRifleGun_Mag_50rd","UltimateAutomaticRifleGun_Mag_30rd","SemiAutoPistolMagazine","FullAutoPistolMagazine","ElitePistolMagazine","Missile200mm","FlareClip"};
        
        public Program(){
        Runtime.UpdateFrequency=UpdateFrequency.Update100;
        LoadStorage();
        UpdatePadTag();
        UpdateAmmoType();
        bcnL=IGC.RegisterBroadcastListener("MINER_BEACON");
        Scan();
        }
        public void Save(){Storage=$"{padID}|{ammoTarget}|{toolTarget}|{(autoOrg?"1":"0")}";}
        void LoadStorage(){
        if(string.IsNullOrEmpty(Storage))return;
        var p=Storage.Split('|');
        if(p.Length>=1)int.TryParse(p[0],out padID);
        if(p.Length>=2)int.TryParse(p[1],out ammoTarget);
        if(p.Length>=3)int.TryParse(p[2],out toolTarget);
        if(p.Length>=4)autoOrg=p[3]=="1";
        }
        void UpdatePadTag(){
        if(padID==0)padID=1;
        padTag=$"[PAD{padID}";Me.CustomName=$"[PAD{padID}] Unity Inventory";
        }
        void UpdateAmmoType(){
        ammoBP=MyDefinitionId.Parse(BP+ammoBPNames[ammoTypeIdx]);
        ammoType=MyItemType.Parse(OB+"AmmoMagazine/"+ammoITNames[ammoTypeIdx]);
        }
        
        public void Main(string a,UpdateType u){
        tick++;
        if(tick%3==0){
        int totItems=oStk.Count+iStk.Count+cStk.Count+tStk.Count+pAmmoStk.Count+(pH2B>0?1:0)+(pO2B>0?1:0)+(ammoStock>0?1:0);
        int maxScroll=viewIdx==4?Math.Max(0,(totItems-16)/8):viewIdx==5?Math.Max(0,(cQd.Count-4)/2):0;
        int viewPause=viewIdx==4?40:10;
        if(scrollOff<maxScroll+viewPause)scrollOff++;
        else{scrollOff=0;viewIdx=(viewIdx+1)%7;}
        graphIdx=(graphIdx+1)%12;}
        if(a!="")HandleArg(a);
        if(tick%2==0)Scan();
        if(tick%2==0)ManageInventory();
        CheckBeacons();
        if(tick%5==0)ReadBtnSettings();
        if(tick%3==0)CountStocks();
        if(tick%5==0)WriteBtnData();
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
        Echo($"Miners: {trkM.Count} tracked");
        if(padAsm.Count==0)Echo("WARNING: No assemblers found");
        if(btn==null)Echo("WARNING: No button panel found");
        }
        
        void HandleArg(string a){
        switch(a.ToUpper()){
        case"SORT":HardSort();break;
        case"RESCAN":Scan();break;
        case"AUTOORG":autoOrg=!autoOrg;break;
        }}
        
        void Scan(){
        padCargo.Clear();padCargoL.Clear();padCargoM.Clear();padCargoS.Clear();padRef.Clear();padAsm.Clear();padReact.Clear();padGen.Clear();oreC.Clear();btn=null;padCon=null;
        toolCargo=oreCargo=ingotCargo=compCargo=ammoCargo=bottleCargo=pAmmoCargo=null;sharedCargo.Clear();subgridCargo.Clear();
        lcd4=lcd5=lcd6=lcd9=lcd10=null;padMedCount=0;padSurvCount=0;padCryoCount=0;
        var blks=new List<IMyTerminalBlock>();
        GridTerminalSystem.GetBlocksOfType(blks,b=>b.CubeGrid==Me.CubeGrid);
        foreach(var b in blks){
        if(b is IMyButtonPanel&&b.CustomName.Contains(padTag)&&btn==null)btn=b as IMyButtonPanel;
        if(b is IMyRefinery)padRef.Add(b as IMyRefinery);
        if(b is IMyAssembler)padAsm.Add(b as IMyAssembler);
        if(b is IMyReactor)padReact.Add(b as IMyReactor);
        if(b is IMyGasGenerator)padGen.Add(b as IMyGasGenerator);
        if(b is IMyShipConnector){var cn=b as IMyShipConnector;string u=b.CustomName.ToUpper();if(u.Contains("ORE"))oreC.Add(cn);else if(padCon==null&&!u.Contains("-CON"))padCon=cn;}
        if(b is IMyMedicalRoom){string st=b.BlockDefinition.SubtypeId;if(st.Contains("Survival")||st.Contains("Kit"))padSurvCount++;else padMedCount++;}
        if(b is IMyCockpit&&b.BlockDefinition.SubtypeId.Contains("Cryo"))padCryoCount++;
        if(b is IMyTextSurface||b is IMyTextPanel){string nm=b.CustomName;if(!nm.Contains(padTag))continue;IMyTextSurface ts=b is IMyTextSurface?(IMyTextSurface)b:((IMyTextPanel)b);if(nm.Contains(":4")&&lcd4==null)lcd4=ts;else if(nm.Contains(":5")&&lcd5==null)lcd5=ts;else if(nm.Contains(":6")&&lcd6==null)lcd6=ts;else if(nm.Contains(":9")&&lcd9==null)lcd9=ts;else if(nm.Contains(":10")&&lcd10==null)lcd10=ts;}
        }
        var allCrg=new List<IMyCargoContainer>();
        GridTerminalSystem.GetBlocksOfType(allCrg);
        foreach(var x in allCrg){
        if(x.CubeGrid!=Me.CubeGrid)continue;
        padCargo.Add(x);
        string st=x.BlockDefinition.SubtypeId;
        if(st.Contains("LargeContainer"))padCargoL.Add(x);
        else if(st.Contains("MediumContainer"))padCargoM.Add(x);
        else padCargoS.Add(x);
        }
        string mt=$"[pad{padID}".ToLower();
        padCargo.Sort((a,b)=>{string sa=a.BlockDefinition.SubtypeId,sb=b.BlockDefinition.SubtypeId;int la=sa.Contains("Large")?0:sa.Contains("Medium")?1:2,lb=sb.Contains("Large")?0:sb.Contains("Medium")?1:2;return la-lb;});
        foreach(var c in padCargo){
        string n=c.CustomName.ToLower().Replace(" ","");
        bool my=padID==0||n.Contains(mt),ot=false;
        for(int p=1;p<=8;p++)if(p!=padID&&n.Contains($"[pad{p}"))ot=true;
        if(ot)continue;
        if(n.Contains("-ore")&&my&&oreCargo==null)oreCargo=c;
        else if(n.Contains("-ingot")&&my&&ingotCargo==null)ingotCargo=c;
        else if(n.Contains("-comp")&&my&&compCargo==null)compCargo=c;
        else if(n.Contains("-tools")&&my&&toolCargo==null)toolCargo=c;
        else if(n.Contains("-pammo")&&my&&pAmmoCargo==null)pAmmoCargo=c;
        else if(n.Contains("-ammo")&&my&&ammoCargo==null)ammoCargo=c;
        else if(n.Contains("-bottle")&&my&&bottleCargo==null)bottleCargo=c;
        else if(!n.Contains("[pad"))sharedCargo.Add(c);
        }
        var allCrg2=new List<IMyCargoContainer>();
        GridTerminalSystem.GetBlocksOfType(allCrg2,x=>x.CubeGrid!=Me.CubeGrid&&x.CustomName.ToLower().Replace(" ","").Contains($"[pad{padID}"));
        foreach(var sg in allCrg2)if(!padCargo.Contains(sg)&&!subgridCargo.Contains(sg))subgridCargo.Add(sg);
        ScanMinerGrids();
        setupDone=btn!=null&&padCargo.Count>0;
        }
        
        void ScanMinerGrids(){
        minerGrids.Clear();
        foreach(var cn in oreC){
        if(cn.Status!=MyShipConnectorStatus.Connected)continue;
        var ot=cn.OtherConnector;
        if(ot==null||ot.CubeGrid==Me.CubeGrid)continue;
        minerGrids.Add(ot.CubeGrid.EntityId);
        }
        if(padCon!=null&&padCon.Status==MyShipConnectorStatus.Connected){
        var ot=padCon.OtherConnector;
        if(ot!=null&&ot.CubeGrid!=Me.CubeGrid)minerGrids.Add(ot.CubeGrid.EntityId);
        }
        }
        
        void CountStocks(){
        oStk.Clear();iStk.Clear();cStk.Clear();tStk.Clear();pH2B=0;pO2B=0;
        foreach(var c in padCargo){
        var inv=c.GetInventory();if(inv==null)continue;
        foreach(var it in GL(inv)){
        string tp=it.Type.TypeId,sub=it.Type.SubtypeId;int amt=(int)it.Amount;
        if(tp.Contains("Ore"))AD(oStk,sub,amt);
        else if(tp.Contains("Ingot"))AD(iStk,sub,amt);
        else if(tp.Contains("Component"))AD(cStk,sub,amt);
        else if(tp.Contains("GasContainerObject")){if(sub.Contains("Hydrogen"))pH2B+=amt;else if(sub.Contains("Oxygen"))pO2B+=amt;}
        else if(tp.Contains("PhysicalGunObject"))AD(tStk,sub,amt);
        }}
        Cn("SteelPlate",6000);Cn("Construction",3500);Cn("SmallTube",3200);Cn("LargeTube",1500);Cn("Motor",1200);Cn("Computer",1500);Cn("MetalGrid",950);Cn("Display",600);Cn("BulletproofGlass",2050);Cn("PowerCell",800);Cn("Thrust",1050);Cn("Explosives",2600);Cn("Detector",1500);Cn("RadioCommunication",900);Cn("GravityGenerator",600);Cn("InteriorPlate",3000);Cn("Girder",500);Cn("Medical",200);Cn("Reactor",300);Cn("SolarCell",500);Cn("Superconductor",300);
        cMis.Clear();
        foreach(var kv in cNd){int have=0;if(cStk.ContainsKey(kv.Key))have=cStk[kv.Key];if(have<kv.Value)cMis[kv.Key]=kv.Value-have;}
        ammoStock=0;ammoQueued=0;
        foreach(var c in padCargo){var inv=c.GetInventory();if(inv!=null)ammoStock+=(int)inv.GetItemAmount(ammoType);}
        foreach(var a in padAsm){var inv=a.GetInventory(1);if(inv!=null)ammoStock+=(int)inv.GetItemAmount(ammoType);var q=new List<MyProductionItem>();a.GetQueue(q);foreach(var i in q)if(i.BlueprintId.SubtypeName==ammoBPNames[ammoTypeIdx])ammoQueued+=(int)i.Amount;}
        h2Queued=0;o2Queued=0;
        foreach(var a in padAsm){var inv=a.GetInventory(1);if(inv!=null){pH2B+=(int)inv.GetItemAmount(h2BottleType);pO2B+=(int)inv.GetItemAmount(o2BottleType);}var q=new List<MyProductionItem>();a.GetQueue(q);foreach(var i in q){string bn=i.BlueprintId.SubtypeName;if(bn=="HydrogenBottle")h2Queued+=(int)i.Amount;if(bn=="OxygenBottle")o2Queued+=(int)i.Amount;}}
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
        
        void QueueProduction(){
        if(padAsm.Count==0){Echo("NO ASSEMBLERS!");return;}
        CraftTools();
        if(ammoStock+ammoQueued<ammoTarget){int need=ammoTarget-(ammoStock+ammoQueued);foreach(var a in padAsm){if(need<=0)break;if(a.CanUseBlueprint(ammoBP)){a.AddQueueItem(ammoBP,(MyFixedPoint)need);ammoQueued+=need;need=0;}}}
        if(pH2B+h2Queued<h2Target){int need=h2Target-(pH2B+h2Queued);foreach(var a in padAsm){if(need<=0)break;if(a.CanUseBlueprint(h2BottleBP)){a.AddQueueItem(h2BottleBP,(MyFixedPoint)need);h2Queued+=need;need=0;}}}
        if(pO2B+o2Queued<o2Target){int need=o2Target-(pO2B+o2Queued);foreach(var a in padAsm){if(need<=0)break;if(a.CanUseBlueprint(o2BottleBP)){a.AddQueueItem(o2BottleBP,(MyFixedPoint)need);o2Queued+=need;need=0;}}}
        cQd.Clear();
        foreach(var a in padAsm){var q=new List<MyProductionItem>();a.GetQueue(q);foreach(var i in q){foreach(var bp in compBP){if(i.BlueprintId==bp.Value)AD(cQd,bp.Key,(int)i.Amount);}}}
        if(cMis.Count>0){foreach(var kv in cMis){int queued=0;if(cQd.ContainsKey(kv.Key))queued=cQd[kv.Key];int stillNeed=kv.Value-queued;if(stillNeed>0&&compBP.ContainsKey(kv.Key)){var bp=compBP[kv.Key];int perAsm=stillNeed/padAsm.Count;if(perAsm<10)perAsm=10;foreach(var a in padAsm){if(a.CanUseBlueprint(bp))a.AddQueueItem(bp,(MyFixedPoint)perAsm);}}}}
        CalcAmmoIngotNeeds();
        FeedRefineries();
        FeedAssemblers();
        }
        
        void Cn(string n,int c){cNd[n]=c;}
        
        void CalcAmmoIngotNeeds(){
        aIN.Clear();int n=ammoLoad;Action<string,double>A=(k,m)=>aIN[k]=(int)(n*m);
        if(ammoTypeIdx==0||ammoTypeIdx==4){A("Iron",0.04);A("Nickel",0.01);if(ammoTypeIdx==4)A("Magnesium",0.001);}
        else if(ammoTypeIdx==1){A("Iron",0.18);A("Nickel",0.02);}
        else if(ammoTypeIdx==2){A("Iron",0.45);A("Nickel",0.05);}
        else if(ammoTypeIdx==3){A("Iron",15);A("Nickel",1.2);A("Silicon",0.36);A("Magnesium",0.6);A("Platinum",0.12);A("Uranium",0.24);}
        oNd.Clear();
        foreach(var kv in aIN){int h=iStk.ContainsKey(kv.Key)?iStk[kv.Key]:0;if(h<kv.Value){double r=kv.Key=="Iron"?0.7:kv.Key=="Nickel"?0.4:kv.Key=="Cobalt"?0.3:kv.Key=="Magnesium"?0.007:kv.Key=="Silicon"?0.7:kv.Key=="Platinum"?0.005:kv.Key=="Uranium"?0.01:0.1;oNd[kv.Key]=(int)((kv.Value-h)/r);}}
        int iM=10;
        ChkI("Iron",1000*iM,0.7);ChkI("Nickel",200*iM,0.4);ChkI("Cobalt",100*iM,0.3);ChkI("Silicon",100*iM,0.7);ChkI("Magnesium",50*iM,0.007);ChkI("Silver",20*iM,0.1);ChkI("Gold",10*iM,0.01);ChkI("Platinum",5*iM,0.005);ChkI("Uranium",5*iM,0.01);
        }
        void ChkI(string n,int nd,double r){int h=iStk.ContainsKey(n)?iStk[n]:0;if(h<nd)oNd[n]=(int)((nd-h)/r);}
        
        void FeedRefineries(){
        if(padRef.Count==0)return;
        var pull=GetPullable();
        if(pull.Count==0)return;
        string[] oreTypes={"Iron","Nickel","Cobalt","Silicon","Magnesium","Silver","Gold","Platinum","Uranium","Stone"};
        foreach(var r in padRef){
        r.UseConveyorSystem=false;
        var rO=r.GetInventory(1);
        if(rO!=null&&(float)rO.CurrentVolume>(float)rO.MaxVolume*.7f)continue;
        var rI=r.GetInventory(0);
        if(rI==null)continue;
        int totOre=0;foreach(var x in GL(rI))if(x.Type.TypeId.EndsWith("Ore"))totOre+=(int)x.Amount;
        if(totOre>=5000)continue;
        foreach(string oreN in oreTypes){
        int haveInRef=0;foreach(var x in GL(rI))if(x.Type.SubtypeId==oreN)haveInRef+=(int)x.Amount;
        if(haveInRef>=1000)continue;
        int need=1000-haveInRef;
        foreach(var c in pull){
        if(need<=0)break;
        var cI=c.GetInventory();if(cI==null)continue;
        var cL=GL(cI);
        for(int i=cL.Count-1;i>=0&&need>0;i--){
        var t=cL[i];
        if(!t.Type.TypeId.EndsWith("Ore")||t.Type.SubtypeId!=oreN)continue;
        int ad=Math.Min((int)t.Amount,need);
        cI.TransferItemTo(rI,i,null,true,(MyFixedPoint)ad);
        need-=ad;
        }}}}}
        
        void FeedAssemblers(){
        if(padAsm.Count==0)return;
        var pull=GetPullable();
        int minIngot=1000;int maxIngot=5000;
        string[] mainIngots={"Iron","Nickel","Silicon","Cobalt"};
        foreach(var a in padAsm){
        var aO=a.GetInventory(1);
        if(aO!=null&&(float)aO.CurrentVolume>(float)aO.MaxVolume*.5f)continue;
        var aI=a.GetInventory(0);if(aI==null)continue;
        var ingInAsm=new Dictionary<string,int>();
        var L=GL(aI);
        foreach(var x in L)if(x.Type.TypeId.EndsWith("Ingot"))AD(ingInAsm,x.Type.SubtypeId,(int)x.Amount);
        foreach(string ing in mainIngots){
        int have=ingInAsm.ContainsKey(ing)?ingInAsm[ing]:0;
        if(have>=minIngot)continue;
        int need=minIngot-have;
        foreach(var r in padRef){
        if(need<=0)break;
        var rO=r.GetInventory(1);if(rO==null)continue;
        var rL=GL(rO);
        for(int i=rL.Count-1;i>=0&&need>0;i--)if(rL[i].Type.SubtypeId==ing){int xf=Math.Min((int)rL[i].Amount,need);rO.TransferItemTo(aI,i,null,true,(MyFixedPoint)xf);need-=xf;}}
        foreach(var c in pull){
        if(need<=0)break;
        var cI=c.GetInventory();if(cI==null)continue;
        var cL=GL(cI);
        for(int i=cL.Count-1;i>=0&&need>0;i--)if(cL[i].Type.SubtypeId==ing){int xf=Math.Min((int)cL[i].Amount,need);cI.TransferItemTo(aI,i,null,true,(MyFixedPoint)xf);need-=xf;}}}
        if((float)aI.CurrentVolume>(float)aI.MaxVolume*.85f){
        var dst=ingotCargo??(padCargoL.Count>0?padCargoL[0]:(padCargo.Count>0?padCargo[0]:null));
        if(dst!=null){var dI=dst.GetInventory();if(dI!=null&&HS(dI,.9f)){var aL=GL(aI);foreach(var x in aL){string s=x.Type.SubtypeId;if(!x.Type.TypeId.EndsWith("Ingot"))continue;int have=ingInAsm.ContainsKey(s)?ingInAsm[s]:0;if(have>maxIngot){int ex=have-maxIngot;for(int i=aL.Count-1;i>=0&&ex>0;i--)if(aL[i].Type.SubtypeId==s){int xf=Math.Min((int)aL[i].Amount,ex);aI.TransferItemTo(dI,i,null,true,(MyFixedPoint)xf);ex-=xf;}}}}}}}}
        
        void CraftTools(){
        if(padAsm.Count==0)return;
        tStk.Clear();tQ.Clear();pAmmoStk.Clear();pAmmoQ.Clear();
        foreach(var a in padAsm){
        var o=a.GetInventory(1);if(o==null)continue;
        var L=GL(o);foreach(var x in L){string s=x.Type.SubtypeId;if(x.Type.TypeId.Contains("PhysicalGunObject"))AD(tStk,s,(int)x.Amount);else if(x.Type.TypeId.Contains("AmmoMagazine"))AD(pAmmoStk,s,(int)x.Amount);}
        for(int i=o.ItemCount-1;i>=0;i--){var it=o.GetItemAt(i);if(!it.HasValue)continue;string tid=it.Value.Type.TypeId;
        if(tid.Contains("PhysicalGunObject")&&toolCargo!=null){var tI=toolCargo.GetInventory();if(tI!=null)o.TransferItemTo(tI,i);}
        else if(tid.Contains("AmmoMagazine")){var dest=pAmmoCargo??toolCargo;if(dest!=null){var dI=dest.GetInventory();if(dI!=null)o.TransferItemTo(dI,i);}}
        else if(tid.Contains("GasContainerObject")&&bottleCargo!=null){var bI=bottleCargo.GetInventory();if(bI!=null)o.TransferItemTo(bI,i);}}
        var q=new List<MyProductionItem>();a.GetQueue(q);foreach(var i in q){string bn=i.BlueprintId.SubtypeName;AD(tQ,bn,(int)i.Amount);AD(pAmmoQ,bn,(int)i.Amount);}}
        if(pAmmoCargo!=null){var paI=pAmmoCargo.GetInventory();if(paI!=null)foreach(var x in GL(paI)){string s=x.Type.SubtypeId;if(x.Type.TypeId.Contains("AmmoMagazine"))AD(pAmmoStk,s,(int)x.Amount);}}
        else if(toolCargo!=null){var tI=toolCargo.GetInventory();if(tI!=null)foreach(var x in GL(tI)){string s=x.Type.SubtypeId;if(x.Type.TypeId.Contains("AmmoMagazine"))AD(pAmmoStk,s,(int)x.Amount);}}
        if(toolCargo!=null){var tcI=toolCargo.GetInventory();if(tcI!=null)foreach(var x in GL(tcI)){string s=x.Type.SubtypeId;if(x.Type.TypeId.Contains("PhysicalGunObject"))AD(tStk,s,(int)x.Amount);}}
        foreach(var c in padCargo){if(c==toolCargo||c==pAmmoCargo)continue;var cI=c.GetInventory();if(cI!=null)foreach(var x in GL(cI)){string s=x.Type.SubtypeId;if(x.Type.TypeId.Contains("PhysicalGunObject"))AD(tStk,s,(int)x.Amount);else if(x.Type.TypeId.Contains("AmmoMagazine"))AD(pAmmoStk,s,(int)x.Amount);}}
        for(int t=0;t<tBP.Length;t++){var bps=tBP[t];var itms=tIT[t];for(int r=0;r<bps.Length;r++){int hv=tStk.ContainsKey(itms[r])?tStk[itms[r]]:0,qd=tQ.ContainsKey(bps[r])?tQ[bps[r]]:0;if(hv+qd>=toolTarget)continue;int nd=toolTarget-hv-qd;int ph=0;if(r>0){ph=tStk.ContainsKey(itms[r-1])?tStk[itms[r-1]]:0;if(ph<1)continue;nd=Math.Min(nd,ph);}var bpId=MyDefinitionId.Parse(BP+bps[r]);foreach(var a in padAsm){if(nd<=0)break;int mk=nd;if(r>0){var pt=MyItemType.Parse(OB+"PhysicalGunObject/"+itms[r-1]);var aI=a.GetInventory(0);if(aI==null)continue;int ia=(int)aI.GetItemAmount(pt);if(ia<1){foreach(var src in padCargo){var cI=src.GetInventory();if(cI==null)continue;int ch=(int)cI.GetItemAmount(pt);if(ch>0){var cL=GL(cI);for(int ci=cL.Count-1;ci>=0&&ia<mk;ci--)if(cL[ci].Type==pt){int xf=Math.Min((int)cL[ci].Amount,mk-ia);cI.TransferItemTo(aI,ci,null,true,(MyFixedPoint)xf);ia+=xf;}break;}}}if(ia<1)continue;mk=Math.Min(mk,ia);}a.AddQueueItem(bpId,(MyFixedPoint)mk);AD(tQ,bps[r],mk);nd-=mk;}}}
        for(int i=0;i<pAmmoBP.Length;i++){string bp=pAmmoBP[i];string it=pAmmoIT[i];int hv=pAmmoStk.ContainsKey(it)?pAmmoStk[it]:0;int qd=pAmmoQ.ContainsKey(bp)?pAmmoQ[bp]:0;if(hv+qd>=pAmmoTarget)continue;int nd=pAmmoTarget-hv-qd;var bpId=MyDefinitionId.Parse(BP+bp);foreach(var a in padAsm){if(nd<=0)break;if(a.CanUseBlueprint(bpId)){a.AddQueueItem(bpId,(MyFixedPoint)nd);nd=0;}}}
        }
        
        List<IMyCargoContainer> GetPullable(){var r=new List<IMyCargoContainer>(padCargo);foreach(var c in sharedCargo)if(!r.Contains(c))r.Add(c);return r;}
        
        void ManageInventory(){
        if(padCargo.Count==0)return;
        Action<IMyInventory>PO=o=>{if(o==null||o.ItemCount==0)return;for(int i=o.ItemCount-1;i>=0;i--){var it=o.GetItemAt(i);if(!it.HasValue)continue;var d=RouteItem(it.Value.Type,null);if(d!=null&&o.CanTransferItemTo(d,it.Value.Type))o.TransferItemTo(d,i,null,true,null);}};
        foreach(var a in padAsm)PO(a.GetInventory(1));
        foreach(var r in padRef)PO(r.GetInventory(1));
        foreach(var sg in subgridCargo){var sgI=sg.GetInventory();if(sgI!=null)PO(sgI);}
        foreach(var cn in oreC){
        if(cn.Status!=MyShipConnectorStatus.Connected)continue;
        var ot=cn.OtherConnector;if(ot==null)continue;
        var G=ot.CubeGrid;
        Func<IMyTerminalBlock,bool>OG=b=>b.CubeGrid==G;
        var mC=new List<IMyCargoContainer>();GridTerminalSystem.GetBlocksOfType(mC,OG);
        var mD=new List<IMyShipDrill>();GridTerminalSystem.GetBlocksOfType(mD,OG);
        var mG=new List<IMyShipGrinder>();GridTerminalSystem.GetBlocksOfType(mG,OG);
        Action<IMyInventory>xf=sI=>{if(sI==null||sI.ItemCount==0)return;for(int i=sI.ItemCount-1;i>=0;i--){var it=sI.GetItemAt(i);if(!it.HasValue)continue;var d=RouteItem(it.Value.Type,null);if(d!=null&&sI.CanTransferItemTo(d,it.Value.Type))sI.TransferItemTo(d,i,null,true,null);}};
        foreach(var c in mC)xf(c.GetInventory());
        foreach(var dr in mD)xf(dr.GetInventory());
        foreach(var gr in mG)xf(gr.GetInventory());
        var mGen=new List<IMyGasGenerator>();GridTerminalSystem.GetBlocksOfType(mGen,OG);
        IMyInventory iceD=null;
        if(mGen.Count>0)iceD=mGen[0].GetInventory();
        else if(mC.Count>0)iceD=mC[0].GetInventory();
        if(iceD!=null&&HS(iceD,.8f)){
        Action<IMyCargoContainer>si=sc=>{if(sc==null)return;var sI=sc.GetInventory();if(sI==null)return;var sL=GL(sI);for(int i=sL.Count-1;i>=0;i--)if(sL[i].Type.SubtypeId=="Ice"&&sI.CanTransferItemTo(iceD,sL[i].Type)){sI.TransferItemTo(iceD,i,null,true,(MyFixedPoint)Math.Min(500,(int)sL[i].Amount));break;}};
        si(oreCargo);foreach(var c in padCargo)si(c);}
        var mReact=new List<IMyReactor>();GridTerminalSystem.GetBlocksOfType(mReact,OG);
        foreach(var mr in mReact){var mRI=mr.GetInventory();if(mRI==null||!HS(mRI,.8f))continue;int mU=0;foreach(var x in GL(mRI))if(x.Type.SubtypeId=="Uranium")mU+=(int)x.Amount;if(mU>=10)continue;int nd=10-mU;Action<IMyCargoContainer>mu=c=>{if(nd<=0||c==null)return;var cI=c.GetInventory();if(cI==null)return;var cL=GL(cI);for(int j=cL.Count-1;j>=0&&nd>0;j--)if(cL[j].Type.SubtypeId=="Uranium"){int tf=Math.Min((int)cL[j].Amount,nd);if(cI.CanTransferItemTo(mRI,cL[j].Type)){cI.TransferItemTo(mRI,j,null,true,(MyFixedPoint)tf);nd-=tf;}}};mu(ingotCargo);foreach(var c in padCargo)mu(c);}}
        if(autoOrg)foreach(var s in padCargo){var sI=s.GetInventory();if(sI==null||sI.ItemCount==0)continue;var L=GL(sI);for(int i=L.Count-1;i>=0;i--){var d=RouteItem(L[i].Type,s);if(d!=null&&sI.CanTransferItemTo(d,L[i].Type))sI.TransferItemTo(d,i,null,true,null);}}
        if(toolCargo!=null){var tI=toolCargo.GetInventory();if(tI!=null){var L=GL(tI);for(int i=L.Count-1;i>=0;i--){var t=L[i].Type;if(t.TypeId.Contains("PhysicalGunObject"))continue;var d=RouteItem(t,toolCargo);if(d!=null&&tI.CanTransferItemTo(d,t))tI.TransferItemTo(d,i,null,true,null);}}}
        foreach(var rc in padReact){var rI=rc.GetInventory();if(rI==null)continue;int h=0;foreach(var x in GL(rI))if(x.Type.SubtypeId=="Uranium")h+=(int)x.Amount;if(h>=50)continue;int n=50-h;foreach(var r in padRef){var O=r.GetInventory(1);if(O==null)continue;var rL=GL(O);for(int i=rL.Count-1;i>=0&&n>0;i--)if(rL[i].Type.SubtypeId=="Uranium"){int xf=Math.Min((int)rL[i].Amount,n);O.TransferItemTo(rI,i,null,true,(MyFixedPoint)xf);n-=xf;}}Action<IMyCargoContainer>pu=c=>{if(n<=0||c==null)return;var I=c.GetInventory();if(I==null)return;var cL=GL(I);for(int i=cL.Count-1;i>=0&&n>0;i--)if(cL[i].Type.SubtypeId=="Uranium"){int xf=Math.Min((int)cL[i].Amount,n);I.TransferItemTo(rI,i,null,true,(MyFixedPoint)xf);n-=xf;}};pu(ingotCargo);foreach(var c in padCargo)pu(c);}
        Action<IMyCargoContainer>fi=c=>{if(c==null)return;var I=c.GetInventory();if(I==null)return;for(int i=I.ItemCount-1;i>=0;i--){var x=I.GetItemAt(i);if(x.HasValue&&x.Value.Type.SubtypeId=="Ice")foreach(var g in padGen){var gI=g.GetInventory();if(gI!=null&&HS(gI,.9f)){I.TransferItemTo(gI,i,null,true,null);break;}}}};
        fi(oreCargo);foreach(var c in padCargo)fi(c);
        foreach(var g in padGen){var gI=g.GetInventory();if(gI==null)continue;for(int i=gI.ItemCount-1;i>=0;i--){var it=gI.GetItemAt(i);if(!it.HasValue)continue;if(!it.Value.Type.TypeId.Contains("GasContainerObject"))continue;if(bottleCargo!=null){var bI=bottleCargo.GetInventory();if(bI!=null&&HS(bI,.95f))gI.TransferItemTo(bI,i);}}}
        Action<IMyCargoContainer>fb=c=>{if(c==null||c==bottleCargo)return;var I=c.GetInventory();if(I==null)return;for(int i=I.ItemCount-1;i>=0;i--){var x=I.GetItemAt(i);if(!x.HasValue||!x.Value.Type.TypeId.Contains("GasContainerObject"))continue;if(bottleCargo!=null){var bI=bottleCargo.GetInventory();if(bI!=null&&HS(bI,.95f)&&I.CanTransferItemTo(bI,x.Value.Type)){I.TransferItemTo(bI,i);continue;}}foreach(var g in padGen){var gI=g.GetInventory();if(gI!=null&&HS(gI,.8f)&&I.CanTransferItemTo(gI,x.Value.Type)){I.TransferItemTo(gI,i);break;}}}};
        foreach(var c in padCargo)fb(c);
        }
        
        IMyCargoContainer GD(MyItemType t){string p=t.TypeId,s=t.SubtypeId;return p.Contains("Ore")?oreCargo:p.Contains("Ingot")?ingotCargo:p.Contains("Component")?compCargo:p.Contains("PhysicalGunObject")?toolCargo:p.Contains("AmmoMagazine")?(s.Contains("Pistol")||s.Contains("RifleGun")||s.Contains("Flare")?(pAmmoCargo??toolCargo):(ammoCargo??toolCargo)):p.Contains("GasContainerObject")?bottleCargo:null;}
        bool HS(IMyInventory i,float t)=>i!=null&&(float)i.CurrentVolume<(float)i.MaxVolume*t;
        List<MyInventoryItem>GL(IMyInventory v){var L=new List<MyInventoryItem>();if(v!=null)v.GetItems(L);return L;}
        void AD(Dictionary<string,int>d,string k,int v){if(d.ContainsKey(k))d[k]+=v;else d[k]=v;}
        bool HT(IMyInventory i,MyItemType t){if(i==null)return false;foreach(var x in GL(i))if(x.Type.TypeId==t.TypeId&&x.Type.SubtypeId==t.SubtypeId)return true;return false;}
        bool ID(IMyCargoContainer c)=>c==oreCargo||c==ingotCargo||c==compCargo||c==toolCargo||c==ammoCargo||c==bottleCargo||c==pAmmoCargo;
        bool IsMiner(IMyInventory inv){var owner=inv.Owner as IMyTerminalBlock;return owner!=null&&minerGrids.Contains(owner.CubeGrid.EntityId);}
        
        MySpriteDrawFrame BL(IMyTextSurface s){s.ContentType=ContentType.SCRIPT;s.Script="";lcdW=s.SurfaceSize.X;lcdH=s.SurfaceSize.Y;lcdS=lcdW/512f;var f=s.DrawFrame();f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(lcdW/2,lcdH/2),new Vector2(lcdW,lcdH),cBg));return f;}
        void SH(MySpriteDrawFrame f,float y,string t,Color c){float cy=y*lcdS,cx=lcdW/2;f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,cy+12*lcdS),new Vector2(lcdW-12*lcdS,24*lcdS),c*0.3f));f.Add(new MySprite(SpriteType.TEXT,t,new Vector2(cx,cy),null,c,"White",TextAlignment.CENTER,0.8f*lcdS));f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,cy+24*lcdS),new Vector2(lcdW-32*lcdS,2*lcdS),c));}
        void SB(MySpriteDrawFrame f,float x,float y,float w,float h,float pct,Color fg,Color bg){x*=lcdS;y*=lcdS;w*=lcdS;h*=lcdS;f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+w/2,y+h/2),new Vector2(w,h),bg));float fw=w*Math.Max(0,Math.Min(1,pct));if(fw>1)f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+fw/2,y+h/2),new Vector2(fw,h),fg));}
        void SLB(MySpriteDrawFrame f,float x,float y,float w,float h,string lbl,float pct,Color fg,Color bg){float sx=x*lcdS,sy=y*lcdS,sw=w*lcdS;f.Add(new MySprite(SpriteType.TEXT,lbl,new Vector2(sx,sy-2*lcdS),null,cTxt,"Monospace",TextAlignment.LEFT,0.5f*lcdS));SB(f,x,y+12,w,h,pct,fg,bg);f.Add(new MySprite(SpriteType.TEXT,$"{pct*100:0}%",new Vector2(sx+sw+5*lcdS,sy+8*lcdS),null,fg,"Monospace",TextAlignment.LEFT,0.45f*lcdS));}
        void ST(MySpriteDrawFrame f,float x,float y,string t,Color c,float sz=0.5f,TextAlignment a=TextAlignment.LEFT){f.Add(new MySprite(SpriteType.TEXT,t,new Vector2(x*lcdS,y*lcdS),null,c,"Monospace",a,sz*lcdS));}
        void SBx(MySpriteDrawFrame f,float x,float y,float w,float h,Color bg,Color bdr){x*=lcdS;y*=lcdS;w*=lcdS;h*=lcdS;f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+w/2,y+h/2),new Vector2(w,h),bdr));f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+w/2,y+h/2),new Vector2(w-2*lcdS,h-2*lcdS),bg));}
        void SD(MySpriteDrawFrame f,float y){f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(lcdW/2,y*lcdS),new Vector2(lcdW-40*lcdS,1*lcdS),cBdr));}
        Color PctCol(float p){return p>.7f?cOK:p>.3f?cWrn:cErr;}
        void SGraph(MySpriteDrawFrame f,float x,float y,float w,float h,List<float>data,Color lc,Color gc,float maxVal=0,string unit=""){
        float gx=(x+35)*lcdS,gy=y*lcdS,gw=(w-40)*lcdS,gh=(h-25)*lcdS;
        SBx(f,x+35,y,w-40,h-25,cBg,cBdr);
        float autoMax=maxVal;
        if(autoMax<=0&&data.Count>0){foreach(var v in data)if(v>autoMax)autoMax=v;if(autoMax<=0)autoMax=1;autoMax=autoMax*1.1f;}
        if(autoMax<=0)autoMax=1;
        float step=autoMax/10f;if(step<1)step=1;else if(step<10)step=(float)Math.Ceiling(step);else step=(float)(Math.Ceiling(step/10)*10);
        float yMax=step*10;
        for(int i=1;i<10;i++)f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(gx+gw/2,gy+gh-gh*i/10),new Vector2(gw-4*lcdS,1*lcdS),gc));
        for(int i=0;i<=10;i+=2){float ly=y+h-25-((h-25)*i/10)-6;float lv=step*i;string lt=lv>=1000?$"{lv/1000:F0}k":lv>=1?$"{lv:F0}":$"{lv:F1}";ST(f,x,ly,lt+unit,cSec,0.22f);}
        for(int i=0;i<=5;i++){float tx=x+35+(w-40)*i/5;string tl=i==5?"Now":$"{10-i*2}m";ST(f,tx,y+h-25+2,tl,cSec,0.28f);}
        if(data.Count<2)return;float dx=(gw-4*lcdS)/(HIST_MAX-1);
        for(int i=1;i<data.Count;i++){float v1=Math.Min(1,data[i-1]/yMax),v2=Math.Min(1,data[i]/yMax);float x1=gx+2*lcdS+(i-1)*dx,y1=gy+gh-2*lcdS-v1*(gh-4*lcdS),x2=gx+2*lcdS+i*dx,y2=gy+gh-2*lcdS-v2*(gh-4*lcdS);f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2((x1+x2)/2,(y1+y2)/2),new Vector2((float)Math.Sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)),2*lcdS),lc));}
        if(data.Count>0){float cv=Math.Min(1,data[data.Count-1]/yMax);float cx=gx+gw-5*lcdS,cy=gy+gh-2*lcdS-cv*(gh-4*lcdS);f.Add(new MySprite(SpriteType.TEXTURE,"Circle",new Vector2(cx,cy),new Vector2(8*lcdS,8*lcdS),lc));}}
        
        void HardSort(){
        int mv=0;
        foreach(var s in padCargo){
        if(ID(s))continue;
        var sI=s.GetInventory();if(sI==null||sI.ItemCount==0)continue;
        var L=GL(sI);
        for(int i=L.Count-1;i>=0;i--){
        var t=L[i].Type;
        var d=GD(t);
        if(d==null||d==s)continue;
        var dI=d.GetInventory();
        if(dI==null||!HS(dI,.98f))continue;
        if(sI.CanTransferItemTo(dI,t)){sI.TransferItemTo(dI,i,null,true,null);mv++;}}}
        Echo($"SORT: Moved {mv} stacks");
        }
        
        IMyInventory RouteItem(MyItemType t,IMyCargoContainer sk){
        var d=GD(t);
        if(d==sk)return null;
        if(d!=null){var di=d.GetInventory();if(HS(di,.95f))return di;if(sk!=null&&!ID(sk))return null;}
        IMyInventory bL=null,bM=null,bS=null;
        if(sk==null||d==null){
        foreach(var c in padCargoL){if(ID(c)||c==sk)continue;var i=c.GetInventory();if(i==null||IsMiner(i)||!HS(i,.9f))continue;if(bL==null)bL=i;if(HT(i,t))return i;}
        foreach(var c in padCargoM){if(ID(c)||c==sk)continue;var i=c.GetInventory();if(i==null||IsMiner(i)||!HS(i,.9f))continue;if(bM==null)bM=i;if(HT(i,t))return i;}
        foreach(var c in padCargoS){if(ID(c)||c==sk)continue;var i=c.GetInventory();if(i==null||IsMiner(i)||!HS(i,.9f))continue;if(bS==null)bS=i;if(HT(i,t))return i;}}
        return bL??bM??bS;
        }
        
        void WriteBtnData(){
        if(btn==null)return;
        string exist=btn.CustomData;string padCfg="";
        int ps=exist.IndexOf("[PAD_CFG]");
        if(ps>=0){int pe=exist.IndexOf("[",ps+1);padCfg=pe>0?exist.Substring(ps,pe-ps):exist.Substring(ps);}
        var c=new StringBuilder();
        c.AppendLine($"[PAD{padID} INV] @{DateTime.Now:HH:mm}");
        c.AppendLine("=====================================");
        c.AppendLine("[TARGETS] Edit values below:");
        c.AppendLine($"ammo     = {ammoTarget}");
        c.AppendLine($"load     = {ammoLoad}");
        c.AppendLine($"ice      = {iceTarget}");
        c.AppendLine($"uran     = {uranTarget}");
        c.AppendLine($"h2       = {h2Target}");
        c.AppendLine($"o2       = {o2Target}");
        c.AppendLine($"tool     = {toolTarget}");
        c.AppendLine($"pAmmo    = {pAmmoTarget}");
        if(padCfg.Length>0){if(!padCfg.EndsWith("\n"))padCfg+="\n";c.Append(padCfg);}
        c.AppendLine("=====================================");
        c.AppendLine("[CMP] Item = Stock + Queued / Target");
        string[] cmpOrder={"SteelPlate","Construction","InteriorPlate","SmallTube","LargeTube","Motor","Computer","MetalGrid","Display","BulletproofGlass","PowerCell","Thrust","Explosives","Detector","RadioCommunication","GravityGenerator","Girder","Medical","Reactor","SolarCell","Superconductor"};
        foreach(var cn in cmpOrder){int stk=cStk.ContainsKey(cn)?cStk[cn]:0;int qd=cQd.ContainsKey(cn)?cQd[cn]:0;int tg=cNd.ContainsKey(cn)?cNd[cn]:0;c.AppendLine($"{cn,-20}= {stk,5} + {qd,4} / {tg,5}");}
        c.AppendLine("-------------------------------------");
        c.AppendLine("[AMO]");
        c.AppendLine($"{ammoNames[ammoTypeIdx],-20}= {ammoStock,5} + {ammoQueued,4} / {ammoTarget,5}");
        c.AppendLine("-------------------------------------");
        c.AppendLine("[BTL]");
        c.AppendLine($"{"Hydrogen",-20}= {pH2B,5} + {h2Queued,4} / {h2Target,5}");
        c.AppendLine($"{"Oxygen",-20}= {pO2B,5} + {o2Queued,4} / {o2Target,5}");
        c.AppendLine("-------------------------------------");
        c.AppendLine("[TLS] Tool = T1/T2/T3/T4 | Target");
        for(int i=0;i<tlsNames.Length;i++){var s="";for(int j=0;j<tIT[i].Length;j++)s+=$"{(tStk.ContainsKey(tIT[i][j])?tStk[tIT[i][j]]:0)}/";c.AppendLine($"{tlsNames[i],-12}= {s.TrimEnd('/'),-12}| {toolTarget}");}
        c.AppendLine("-------------------------------------");
        c.AppendLine("[PAMMO] Personal Ammo = Stock + Queued / Target");
        string[] pAmmoNames={"RifleMag20","RifleMag5","RifleMag50","RifleMag30","PistolSemi","PistolFull","PistolElite","Rocket","Flare"};
        for(int i=0;i<pAmmoBP.Length;i++){int stk=pAmmoStk.ContainsKey(pAmmoIT[i])?pAmmoStk[pAmmoIT[i]]:0;int qd=pAmmoQ.ContainsKey(pAmmoBP[i])?pAmmoQ[pAmmoBP[i]]:0;c.AppendLine($"{pAmmoNames[i],-12}= {stk,5} + {qd,4} / {pAmmoTarget,5}");}
        c.AppendLine("=====================================");
        c.AppendLine("[ORE]");
        foreach(var k in oStk)if(k.Value>0)c.AppendLine($"{k.Key,-12}= {k.Value}");
        c.AppendLine("[ING]");
        foreach(var k in iStk)if(k.Value>0){string dn=k.Key=="Stone"?"Gravel":k.Key;c.AppendLine($"{dn,-12}= {k.Value}");}
        c.AppendLine("=====================================");
        c.AppendLine("[STAT]");
        int refW=0,asmW=0;foreach(var r in padRef)if(r.IsProducing)refW++;foreach(var a in padAsm)if(a.IsProducing)asmW++;
        c.AppendLine($"Refineries  = {refW}/{padRef.Count} working");
        c.AppendLine($"Assemblers  = {asmW}/{padAsm.Count} working");
        c.AppendLine($"Cargo       = {padCargoPct:F0}% (L:{padCargoL.Count} M:{padCargoM.Count} S:{padCargoS.Count})");
        c.AppendLine($"AutoOrg     = {(autoOrg?"ON":"OFF")}");
        btn.CustomData=c.ToString();
        }
        
        void ReadBtnSettings(){
        if(btn==null)return;
        string d=btn.CustomData;
        if(string.IsNullOrEmpty(d))return;
        bool inTgt=false,inCfg=false,inStat=false;var ls=d.Split('\n');
        foreach(var l in ls){
        string lt=l.Trim();
        if(lt.StartsWith("[TARGETS]")||lt.StartsWith("[SET]")){inTgt=true;inCfg=false;inStat=false;continue;}
        if(lt.StartsWith("[PAD_CFG]")){inCfg=true;inTgt=false;inStat=false;continue;}
        if(lt.StartsWith("[PAD_STATUS]")){inStat=true;inTgt=false;inCfg=false;continue;}
        if(lt.StartsWith("[")&&!lt.StartsWith("[TARGETS]")&&!lt.StartsWith("[SET]")&&!lt.StartsWith("[PAD_CFG]")&&!lt.StartsWith("[PAD_STATUS]")){inTgt=false;inCfg=false;inStat=false;continue;}
        if(lt.StartsWith("====")||lt.StartsWith("----")||!lt.Contains("="))continue;
        if(!inTgt&&!inCfg&&!inStat)continue;
        var ps=lt.Split('|');
        foreach(var p in ps){
        var kv=p.Split('=');
        if(kv.Length!=2)continue;
        string k=kv[0].Trim(),v=kv[1].Trim();
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
        if(k=="ammo"||k=="tgt")ammoTarget=n;
        else if(k=="load")ammoLoad=n;
        else if(k=="ice")iceTarget=n;
        else if(k=="uran")uranTarget=n;
        else if(k=="h2")h2Target=n;
        else if(k=="o2")o2Target=n;
        else if(k=="tool")toolTarget=n;
        else if(k=="pAmmo")pAmmoTarget=n;
        else if(k=="ammoReq")ammoReq=n==1;
        else if(k=="type")ammoReqType=Math.Max(0,Math.Min(4,n));
        else if(k=="need")ammoReqNeed=n;
        else if(k=="have")ammoReqHave=n;
        else if(k=="mslCount")mslCount=n;
        else if(k=="mslArmed")mslArmed=n;
        else if(k=="mslReady")mslReady=n;
        else if(k=="ctrlPads")ctrlPads=n;
        else if(k=="ctrlArmed")ctrlArmed=n;
        else if(k=="ctrlReady")ctrlReady=n;
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
        else if(k=="prtState")prtState=n;
        else if(k=="prtRem")prtRem=n;
        else if(k=="prtTot")prtTot=n;
        else if(k=="prtBld")prtBld=n;
        else if(k=="printing")printing=n==1;
        }}}
        
        void LoadMissileAmmo(){
        if(!ammoReq||ammoReqNeed<=0)return;
        var mCon=new List<IMyShipConnector>();
        string mtag=$"PAD{padID}".ToUpper();
        GridTerminalSystem.GetBlocksOfType(mCon,c=>{string n=c.CustomName.ToUpper();return n.Contains(mtag)&&n.Contains("MISSILE")&&n.Contains("AMMO");});
        if(mCon.Count==0)return;
        var mAmmo=mCon[0].GetInventory();if(mAmmo==null)return;
        var at=MyItemType.Parse(OB+"AmmoMagazine/"+ammoBPNames[ammoReqType]);
        int pushed=0;
        Action<IMyCargoContainer>push=src=>{if(pushed>=ammoReqNeed||src==null)return;var sI=src.GetInventory();if(sI==null)return;var L=GL(sI);for(int i=L.Count-1;i>=0&&pushed<ammoReqNeed;i--){if(L[i].Type!=at)continue;int amt=Math.Min((int)L[i].Amount,ammoReqNeed-pushed);if(sI.CanTransferItemTo(mAmmo,at)){sI.TransferItemTo(mAmmo,i,null,true,(MyFixedPoint)amt);pushed+=amt;}}};
        push(ammoCargo);
        push(pAmmoCargo);
        push(toolCargo);
        foreach(var c in padCargo){if(pushed>=ammoReqNeed)break;push(c);}
        }
        
        void UpdateLCDs(){
        UpdateHistory();
        if(padMode=="FLIGHT"){
        if(lcd4!=null)UpdateLCD4Flight();
        if(lcd5!=null)UpdateLCD5Flight();
        if(lcd6!=null)UpdateLCD6Flight();
        if(lcd9!=null)UpdateLCD9Flight();
        if(lcd10!=null)UpdateLCD10Flight();
        }else if(padMode=="CONTROLLER"){
        if(lcd4!=null)UpdateLCD4Ctrl();
        if(lcd5!=null)UpdateLCD5Ctrl();
        if(lcd6!=null)UpdateLCD6Ctrl();
        if(lcd9!=null)UpdateLCD9Ctrl();
        if(lcd10!=null)UpdateLCD10Ctrl();
        }else if(padMode=="MISSILE"){
        if(lcd4!=null)UpdateLCD4Missile();
        if(lcd5!=null)UpdateLCD5Missile();
        if(lcd6!=null)UpdateLCD6Missile();
        if(lcd9!=null)UpdateLCD9Missile();
        if(lcd10!=null)UpdateLCD10Missile();
        }else if(padMode=="PRINT"){
        if(lcd4!=null)UpdateLCD4Print();
        if(lcd5!=null)UpdateLCD5Print();
        if(lcd6!=null)UpdateLCD6Print();
        if(lcd9!=null)UpdateLCD9Print();
        if(lcd10!=null)UpdateLCD10Print();
        }else{
        if(lcd4!=null)UpdateLCD4();
        if(lcd5!=null)UpdateLCD5();
        if(lcd6!=null)UpdateLCD6();
        if(lcd9!=null)UpdateLCD9();
        if(lcd10!=null)UpdateLCD10();
        }}
        
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
        var solars=new List<IMySolarPanel>();GridTerminalSystem.GetBlocksOfType(solars,b=>b.CubeGrid==Me.CubeGrid);
        float sp=0;foreach(var s in solars)sp+=s.CurrentOutput;
        var winds=new List<IMyPowerProducer>();GridTerminalSystem.GetBlocksOfType(winds,b=>b.CubeGrid==Me.CubeGrid&&b.BlockDefinition.SubtypeId.Contains("Wind"));
        float wp=0;foreach(var w in winds)wp+=w.CurrentOutput;
        float rp=0;foreach(var r in padReact)rp+=r.CurrentOutput;
        float gp=0;foreach(var g in padGen){var pg=g as IMyPowerProducer;if(pg!=null)gp+=pg.CurrentOutput;}
        int qTotal=ammoQueued+h2Queued+o2Queued;foreach(var kv in cQd)qTotal+=kv.Value;
        pwrHist.Add(bc);h2Hist.Add(h2c/1000);o2Hist.Add(o2c/1000);cargoHist.Add(vc);refHist.Add(refInp);asmHist.Add(asmInp);prodHist.Add((float)qTotal);
        pwrInHist.Add(bi);pwrOutHist.Add(bo);solarHist.Add(sp);windHist.Add(wp);reactHist.Add(rp);genHist.Add(gp);
        while(pwrHist.Count>HIST_MAX)pwrHist.RemoveAt(0);while(h2Hist.Count>HIST_MAX)h2Hist.RemoveAt(0);while(o2Hist.Count>HIST_MAX)o2Hist.RemoveAt(0);
        while(cargoHist.Count>HIST_MAX)cargoHist.RemoveAt(0);while(refHist.Count>HIST_MAX)refHist.RemoveAt(0);while(asmHist.Count>HIST_MAX)asmHist.RemoveAt(0);
        while(prodHist.Count>HIST_MAX)prodHist.RemoveAt(0);while(pwrInHist.Count>HIST_MAX)pwrInHist.RemoveAt(0);while(pwrOutHist.Count>HIST_MAX)pwrOutHist.RemoveAt(0);
        while(solarHist.Count>HIST_MAX)solarHist.RemoveAt(0);while(windHist.Count>HIST_MAX)windHist.RemoveAt(0);while(reactHist.Count>HIST_MAX)reactHist.RemoveAt(0);while(genHist.Count>HIST_MAX)genHist.RemoveAt(0);
        }
        
        void UpdateLCD4(){
        var f=BL(lcd4);
        string[] viewNames={"BUILD STATUS","MISSILE STATUS","FUEL/TARGET","POWER","CARGO","PRODUCTION","COMMS"};
        SH(f,10,$"{viewNames[viewIdx]} [{viewIdx+1}/7]",cPri);
        float y=50;
        if(viewIdx==0){
        ST(f,20,y,"MISSILE BUILD REQUIREMENTS",cPri,0.45f);y+=18;
        string[] keyComp={"SteelPlate","Construction","SmallTube","Motor","Computer","Thrust","Explosives"};
        int cnt=0;foreach(string k in keyComp){if(cnt>=6)break;int hv=cStk.ContainsKey(k)?cStk[k]:0;int nd=cNd.ContainsKey(k)?cNd[k]:0;int qd=cQd.ContainsKey(k)?cQd[k]:0;Color c=hv>=nd?cOK:hv+qd>=nd?cWrn:cErr;ST(f,20,y,$"{k}: {hv}+{qd}/{nd}",c,0.33f);y+=15;cnt++;}
        y+=5;ST(f,20,y,"FUEL & AMMO REQUIREMENTS",cAcc,0.4f);y+=16;
        ST(f,20,y,$"Ammo ({ammoNames[ammoTypeIdx]}): {ammoStock}+{ammoQueued}/{ammoTarget}",ammoStock>=ammoTarget?cOK:cWrn,0.33f);y+=15;
        ST(f,20,y,$"H2 Bottles: {pH2B}+{h2Queued}/{h2Target}",pH2B>=h2Target?cOK:cWrn,0.33f);y+=15;
        ST(f,20,y,$"O2 Bottles: {pO2B}+{o2Queued}/{o2Target}",pO2B>=o2Target?cOK:cWrn,0.33f);y+=15;
        int ice=oStk.ContainsKey("Ice")?oStk["Ice"]:0;int urn=iStk.ContainsKey("Uranium")?iStk["Uranium"]:0;
        ST(f,20,y,$"Ice: {ice}  Uranium: {urn}",ice>100&&urn>5?cOK:cWrn,0.33f);y+=18;
        ST(f,20,y,"MISSING",cErr,0.38f);y+=14;
        cnt=0;foreach(var kv in cMis){if(cnt>=3)break;ST(f,20,y,$"{kv.Key}: -{kv.Value}",cErr,0.32f);y+=13;cnt++;}
        if(cMis.Count==0)ST(f,20,y,"All stocked!",cOK,0.35f);
        }else if(viewIdx==1){
        if(mslReady>0||mslArmed>0||mslCount>0||printing){
        ST(f,20,y,$"Missiles Ready: {mslReady}",mslReady>0?cOK:cSec,0.5f);y+=30;
        ST(f,20,y,$"Missiles Armed: {mslArmed}",mslArmed>0?cWrn:cSec,0.5f);y+=30;
        ST(f,20,y,$"Total Count: {mslCount}",cTxt,0.5f);y+=30;
        ST(f,20,y,$"Phase: {mslPhase}",cAcc,0.5f);y+=30;
        if(printing){float pct=prtTot>0?(float)(prtTot-prtRem)/prtTot:0;ST(f,20,y,$"Printing: {pct*100:F0}% ({prtTot-prtRem}/{prtTot})",pct>=1?cOK:cWrn,0.45f);}
        }else{
        ST(f,20,y,"No Missile Docked",cWrn,0.6f);y+=35;
        ST(f,20,y,"To build a missile:",cSec,0.45f);y+=22;
        ST(f,25,y,"1. Use PRINT mode on UnityPad",cTxt,0.4f);y+=20;
        ST(f,25,y,"2. Load projector blueprint",cTxt,0.4f);y+=20;
        ST(f,25,y,"3. Printer will weld missile",cTxt,0.4f);y+=20;
        ST(f,25,y,"4. DOCK to connect missile",cTxt,0.4f);y+=30;
        ST(f,20,y,"Components needed for build:",cSec,0.45f);y+=20;
        int cnt=0;foreach(var kv in cMis){if(cnt>=3)break;ST(f,25,y,$"{kv.Key}: -{kv.Value}",cErr,0.38f);y+=16;cnt++;}
        if(cMis.Count==0)ST(f,25,y,"All stocked - ready to print!",cOK,0.4f);
        }
        }else if(viewIdx==2){
        float h2p=padH2Pct/100f,o2p=padO2Pct/100f;
        SLB(f,20,y,350,16,"Hydrogen",h2p,PctCol(h2p),cBdr);y+=40;
        SLB(f,20,y,350,16,"Oxygen",o2p,PctCol(o2p),cBdr);y+=40;
        SLB(f,20,y,350,16,"Battery",padBatPct/100f,PctCol(padBatPct/100f),cBdr);y+=40;
        ST(f,20,y,$"Ammo: {ammoStock}+{ammoQueued}/{ammoTarget}",ammoStock>=ammoTarget?cOK:cWrn,0.5f);y+=30;
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
        int totPg=(allItems.Count+15)/16;int curPg=Math.Min(scrollOff,totPg-1)+1;
        SLB(f,20,y,460,18,"Cargo Fill",padCargoPct/100f,PctCol(1-padCargoPct/100f),cBdr);y+=26;
        ST(f,20,y,$"STORAGE ({curPg}/{totPg})",cSec,0.45f);y+=22;
        int skip=scrollOff*8,cnt=0;string lastCat="";
        foreach(var kv in allItems){if(skip>0){skip--;continue;}if(cnt>=16)break;if(kv.Key!=lastCat){Color cc=kv.Key=="Ore"?cWrn:kv.Key=="Ingot"?cAcc:kv.Key=="Comp"?cOK:kv.Key=="Tool"?cPri:cSec;ST(f,20,y,kv.Key.ToUpper(),cc,0.4f);y+=18;lastCat=kv.Key;}ST(f,25,y,kv.Value,cTxt,0.45f);y+=22;cnt++;}
        }else if(viewIdx==5){
        int refW=0,asmW=0;foreach(var r in padRef)if(r.IsProducing)refW++;foreach(var a in padAsm)if(a.IsProducing)asmW++;
        ST(f,20,y,$"Refineries: {refW}/{padRef.Count}  Assemblers: {asmW}/{padAsm.Count}",refW>0||asmW>0?cOK:cSec,0.45f);y+=28;
        int totQ=cQd.Count+(ammoQueued>0?1:0)+(h2Queued>0||o2Queued>0?1:0);
        ST(f,20,y,$"Queue ({totQ} types, scroll {scrollOff+1}/{Math.Max(1,(cQd.Count-4)/2+1)}):",cTxt,0.45f);y+=22;
        int cnt=0,skip=scrollOff*2;
        foreach(var kv in cQd){if(skip>0){skip--;continue;}if(cnt>=6)break;ST(f,20,y,$"{kv.Key}: {kv.Value}",cAcc,0.4f);y+=18;cnt++;}
        if(cnt<6&&ammoQueued>0){ST(f,20,y,$"{ammoNames[ammoTypeIdx]}: {ammoQueued}",cAcc,0.4f);y+=18;cnt++;}
        if(cnt<6&&(h2Queued>0||o2Queued>0)){ST(f,20,y,$"Bottles H2:{h2Queued} O2:{o2Queued}",cAcc,0.4f);}
        }else{
        ST(f,20,y,"PAD FACILITIES",cSec,0.45f);y+=20;
        ST(f,20,y,$"Medical: {padMedCount}  Kit: {padSurvCount}  Cryo: {padCryoCount}",cTxt,0.5f);y+=30;
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
        var solar=new List<IMySolarPanel>();GridTerminalSystem.GetBlocksOfType(solar,b=>b.CubeGrid==Me.CubeGrid);
        float sp=0;foreach(var s in solar)sp+=s.CurrentOutput;
        ST(f,20,170,$"Solar: {solar.Count} panels = {sp:F2} MW",sp>0?cOK:cSec,0.5f);
        var wind=new List<IMyPowerProducer>();GridTerminalSystem.GetBlocksOfType(wind,b=>b.CubeGrid==Me.CubeGrid&&b.BlockDefinition.SubtypeId.Contains("Wind"));
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
        else if(gIdx==6){int qTot=ammoQueued+h2Queued+o2Queued;foreach(var kv in cQd)qTot+=kv.Value;desc=$"Current: {qTot} items queued across assemblers";}
        else if(gIdx==7){var bats=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(bats,b=>b.CubeGrid==Me.CubeGrid);float bi=0;foreach(var b in bats)bi+=b.CurrentInput;desc=$"Current: {cur:F2} MW charging ({bats.Count} batteries)";}
        else if(gIdx==8){var bats=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(bats,b=>b.CubeGrid==Me.CubeGrid);float bo=0;foreach(var b in bats)bo+=b.CurrentOutput;desc=$"Current: {cur:F2} MW discharging ({bats.Count} batteries)";}
        else if(gIdx==9){var solars=new List<IMySolarPanel>();GridTerminalSystem.GetBlocksOfType(solars,b=>b.CubeGrid==Me.CubeGrid);float sp=0,spm=0;foreach(var s in solars){sp+=s.CurrentOutput;spm+=s.MaxOutput;}desc=$"Current: {cur:F2} MW ({solars.Count} panels, max {spm:F1} MW)";}
        else if(gIdx==10){var winds=new List<IMyPowerProducer>();GridTerminalSystem.GetBlocksOfType(winds,b=>b.CubeGrid==Me.CubeGrid&&b.BlockDefinition.SubtypeId.Contains("Wind"));float wp=0,wpm=0;foreach(var w in winds){wp+=w.CurrentOutput;wpm+=w.MaxOutput;}desc=$"Current: {cur:F2} MW ({winds.Count} turbines, max {wpm:F1} MW)";}
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
        int qT2=ammoQueued+h2Queued+o2Queued;foreach(var kv in cQd)qT2+=kv.Value;
        SB(f,20,395,80,10,p1,PctCol(p1),cBdr);ST(f,105,393,$"Battery {p1*100:F0}%",cTxt,0.35f);
        SB(f,20,410,80,10,p2,PctCol(p2),cBdr);ST(f,105,408,$"H2 {p2*100:F0}%",cTxt,0.35f);
        SB(f,20,425,80,10,p3,PctCol(p3),cBdr);ST(f,105,423,$"O2 {p3*100:F0}%",cTxt,0.35f);
        SB(f,20,440,80,10,p4,PctCol(1-p4),cBdr);ST(f,105,438,$"Cargo {p4*100:F0}%",cTxt,0.35f);
        ST(f,250,395,$"Ref: {rW2}/{padRef.Count}",rW2>0?cOK:cSec,0.4f);
        ST(f,250,415,$"Asm: {aW2}/{padAsm.Count}",aW2>0?cOK:cSec,0.4f);
        ST(f,250,435,$"Queue: {qT2}",qT2>0?cAcc:cSec,0.4f);
        ST(f,20,470,$"Graph [{gIdx+1}/{gMax}]",cSec,0.35f);
        f.Dispose();
        }
        
        void UpdateLCD9(){
        var f=BL(lcd9);
        SH(f,10,"MINER FLEET",cPri);
        if(trkM.Count==0){
        SLB(f,20,50,350,16,"Battery",padBatPct/100f,PctCol(padBatPct/100f),cBdr);
        SLB(f,20,90,350,16,"Hydrogen",padH2Pct/100f,PctCol(padH2Pct/100f),cBdr);
        SLB(f,20,130,350,16,"Cargo",padCargoPct/100f,PctCol(1-padCargoPct/100f),cBdr);
        ST(f,20,180,"No miners tracked",cSec,0.5f);
        ST(f,20,210,"Connect miners to ore connectors",cSec,0.4f);
        }else{
        int dkd=0,fly=0;foreach(var kv in trkM){if(kv.Value.docked)dkd++;else fly++;}
        ST(f,20,45,$"Total: {trkM.Count}  Docked: {dkd}  Flying: {fly}",cTxt,0.5f);
        float y=70;int cnt=0;
        var sortedM=trkM.Values.ToList();sortedM.Sort((a,b)=>{if(a.docked!=b.docked)return a.docked?-1:1;return a.name.CompareTo(b.name);});
        foreach(var m in sortedM){
        if(cnt>=5)break;
        string loc=m.docked?$"Port {m.portNum}":$"{m.dist:F0}m";
        string ico=m.status=="DOCKED"?"=":m.status.Contains("DRILL")?"*":m.status.Contains("GRIND")?"#":">";
        Color sc=m.status=="DOCKED"?cOK:m.status.Contains("DRILL")?cAcc:m.status.Contains("GRIND")?cWrn:cPri;
        SBx(f,15,y-2,480,55,cBg,cBdr);
        ST(f,20,y,$"[{ico}] {m.name}",sc,0.5f);
        ST(f,300,y,loc,cTxt,0.45f);
        SB(f,20,y+22,140,10,m.bat/100f,PctCol(m.bat/100f),cBdr);ST(f,165,y+18,$"Battery {m.bat:F0}%",cTxt,0.35f);
        SB(f,250,y+22,140,10,m.crg/100f,PctCol(1-m.crg/100f),cBdr);ST(f,395,y+18,$"Cargo {m.crg:F0}%",cTxt,0.35f);
        ST(f,20,y+38,$"{m.status}",cSec,0.4f);
        y+=60;cnt++;}}
        f.Dispose();
        }
        
        void UpdateLCD10(){
        var f=BL(lcd10);
        SH(f,10,"MINER DETAILS",cPri);
        if(trkM.Count==0){
        ST(f,20,50,"No miners connected",cSec,0.5f);
        ST(f,20,90,"Storage Overview:",cTxt,0.5f);
        ST(f,20,120,$"Large: {padCargoL.Count}  Medium: {padCargoM.Count}  Small: {padCargoS.Count}",cTxt,0.45f);
        SLB(f,20,160,350,16,"Cargo Fill",padCargoPct/100f,PctCol(1-padCargoPct/100f),cBdr);
        int oreT=0;foreach(var kv in oStk)oreT+=kv.Value;
        int ingT=0;foreach(var kv in iStk)ingT+=kv.Value;
        int cmpT=0;foreach(var kv in cStk)cmpT+=kv.Value;
        ST(f,20,210,$"Ore: {oreT/1000}k  Ingots: {ingT/1000}k  Components: {cmpT}",cTxt,0.4f);
        }else{
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
        if(!m.docked){ST(f,250,y+75,$"Speed: {m.spd:F0} m/s  Dist: {m.dist:F0}m",cTxt,0.4f);}
        else{ST(f,250,y+75,$"Docked at Port {m.portNum}",cOK,0.4f);}
        ST(f,20,y+100,$"Drills: {m.drillsOn}/{m.drills}  Grinders: {m.grindersOn}/{m.grinders}",cSec,0.4f);
        y+=135;cnt++;}}
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
        if(p.Length>=21){double.TryParse(p[16],out m.outboundSecs);double.TryParse(p[17],out m.returnSecs);int.TryParse(p[18],out m.cycles);double.TryParse(p[19],out m.etaSecs);m.outbound=p[20]=="1";}}
        CorrelateDockedMiners();
        CleanStaleMiners();
        }
        
        void CorrelateDockedMiners(){
        DateTime DT=DateTime.Now;
        int pn=0;var aC=new List<IMyShipConnector>();GridTerminalSystem.GetBlocksOfType(aC,b=>b.CubeGrid==Me.CubeGrid&&b.Status==MyShipConnectorStatus.Connected);
        foreach(var cn in aC){pn++;var ot=cn.OtherConnector;if(ot==null||ot.CubeGrid==Me.CubeGrid)continue;
        long gid=ot.CubeGrid.EntityId;
        if(trkM.ContainsKey(gid)){var x=trkM[gid];x.portNum=pn;x.docked=true;x.lastSeen=DT;}
        else{var m=new MinerData();m.name=$"Port{pn}";m.portNum=pn;m.docked=true;m.lastSeen=DT;m.status="DOCKED";
        var bt=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(bt,b=>b.CubeGrid==ot.CubeGrid);
        if(bt.Count>0){float c=0,mx=0;foreach(var b in bt){c+=b.CurrentStoredPower;mx+=b.MaxStoredPower;}m.bat=mx>0?(c/mx)*100:0;}
        var cg=new List<IMyCargoContainer>();GridTerminalSystem.GetBlocksOfType(cg,b=>b.CubeGrid==ot.CubeGrid);
        if(cg.Count>0){float c=0,mx=0;foreach(var g in cg){var iv=g.GetInventory();if(iv!=null){c+=(float)iv.CurrentVolume;mx+=(float)iv.MaxVolume;}}m.crg=mx>0?(c/mx)*100:0;}
        var hs=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(hs,b=>b.CubeGrid==ot.CubeGrid&&b.BlockDefinition.SubtypeId.Contains("Hydrogen"));
        if(hs.Count>0){float t=0;foreach(var h in hs)t+=(float)h.FilledRatio;m.h2=(t/hs.Count)*100;}
        var dl=new List<IMyShipDrill>();GridTerminalSystem.GetBlocksOfType(dl,b=>b.CubeGrid==ot.CubeGrid);m.drills=dl.Count;
        var gl=new List<IMyShipGrinder>();GridTerminalSystem.GetBlocksOfType(gl,b=>b.CubeGrid==ot.CubeGrid);m.grinders=gl.Count;
        trkM[gid]=m;}}}
        
        void CleanStaleMiners(){
        DateTime DT=DateTime.Now;
        var stale=new List<long>();
        foreach(var kv in trkM){if((DT-kv.Value.lastSeen).TotalSeconds>120&&!kv.Value.docked)stale.Add(kv.Key);}
        foreach(var id in stale)trkM.Remove(id);
        }
        
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
        
        void UpdateLCD9Flight(){
        var f=BL(lcd9);
        SH(f,10,"ACTIVE MISSILES",cAcc);
        if(mslCount==0){
        ST(f,20,60,"No missiles in flight",cSec,0.6f);
        ST(f,20,100,"Launch a missile to track",cSec,0.45f);
        }else{
        SBx(f,15,45,480,80,cBg,cBdr);
        ST(f,20,50,"PRIMARY MISSILE",cSec,0.4f);
        Color pc=mslPhase=="TARGET"?cErr:mslPhase=="REENTRY"?cWrn:cOK;
        ST(f,20,70,mslPhase,pc,0.7f);
        ST(f,250,50,$"Distance: {mslDist:F0}m",cTxt,0.45f);
        ST(f,250,75,$"Speed: {mslSpeed:F0}m/s",cTxt,0.45f);
        ST(f,250,100,$"ETA: {mslETA:F0}s",cAcc,0.45f);
        SD(f,145);
        ST(f,20,155,"FLEET STATUS",cTxt,0.5f);
        ST(f,20,185,$"Active: {mslCount}",cPri,0.5f);
        ST(f,150,185,$"Armed: {mslArmed}",mslArmed>0?cWrn:cSec,0.5f);
        ST(f,280,185,$"Ready: {mslReady}",mslReady>0?cOK:cSec,0.5f);
        SD(f,220);
        SLB(f,20,235,350,16,"Fuel Remaining",mslFuel/100f,PctCol(mslFuel/100f),cBdr);
        SLB(f,20,275,350,16,"Distance Progress",1f-Math.Min(1f,mslDist/10000f),cPri,cBdr);}
        f.Dispose();
        }
        
        void UpdateLCD10Flight(){
        var f=BL(lcd10);
        SH(f,10,"TARGET INFO",cAcc);
        SBx(f,15,45,480,90,cBg,cBdr);
        ST(f,20,50,"TARGET DESIGNATION",cSec,0.4f);
        ST(f,20,75,mslTarget,cAcc,0.6f);
        ST(f,20,105,$"Tracking Mode: {ctrlMode}",cTxt,0.45f);
        SD(f,155);
        ST(f,20,165,"APPROACH VECTOR",cTxt,0.5f);
        float bearing=(float)(Math.Atan2(mslDist,mslAlt)*180/Math.PI);
        ST(f,20,195,$"Bearing: {bearing:F1} deg",cTxt,0.5f);
        ST(f,20,225,$"Glide Slope: {(mslAlt>0?mslDist/mslAlt:0):F1}",cTxt,0.5f);
        SD(f,270);
        ST(f,20,280,"IMPACT PREDICTION",cTxt,0.5f);
        int etaMins=(int)(mslETA/60);int etaSecs=(int)(mslETA%60);
        ST(f,20,310,$"Time to Impact: {etaMins:D2}:{etaSecs:D2}",mslETA<30?cErr:mslETA<60?cWrn:cOK,0.55f);
        string impactSt=mslPhase=="TARGET"?"TERMINAL":mslPhase=="REENTRY"?"APPROACHING":"EN ROUTE";
        ST(f,20,345,$"Status: {impactSt}",mslPhase=="TARGET"?cErr:cTxt,0.5f);
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
        
        void UpdateLCD9Ctrl(){
        var f=BL(lcd9);
        SH(f,10,"MULTI-PAD CONTROL",cPri);
        if(ctrlPads==0){
        ST(f,20,60,"No pads connected",cSec,0.6f);
        ST(f,20,100,"Enable controller mode",cSec,0.45f);
        }else{
        ST(f,20,50,$"Controller managing {ctrlPads} launch pad(s)",cTxt,0.5f);
        SD(f,90);
        SBx(f,15,100,155,80,cBg,cBdr);
        ST(f,20,105,"READY",cSec,0.4f);
        ST(f,20,130,$"{ctrlReady}",cOK,0.9f);
        SBx(f,175,100,155,80,cBg,cBdr);
        ST(f,180,105,"ARMED",cSec,0.4f);
        ST(f,180,130,$"{ctrlArmed}",ctrlArmed>0?cWrn:cSec,0.9f);
        SBx(f,335,100,155,80,cBg,cBdr);
        ST(f,340,105,"IN FLIGHT",cSec,0.4f);
        ST(f,340,130,$"{mslCount}",mslCount>0?cAcc:cSec,0.9f);
        SD(f,200);
        ST(f,20,210,"SALVO OPTIONS",cTxt,0.5f);
        ST(f,20,240,"Single Launch | Ripple Fire | Carpet Bomb",cSec,0.45f);
        SD(f,280);
        ST(f,20,290,"ATTACK MODE",cTxt,0.5f);
        ST(f,20,320,ctrlMode,cAcc,0.6f);}
        f.Dispose();
        }
        
        void UpdateLCD10Ctrl(){
        var f=BL(lcd10);
        SH(f,10,"TARGET SELECTION",cPri);
        SBx(f,15,45,480,80,cBg,cBdr);
        ST(f,20,50,"CURRENT TARGET",cSec,0.4f);
        ST(f,20,75,ctrlTarget,cAcc,0.6f);
        ST(f,20,100,$"Mode: {ctrlMode}",cTxt,0.45f);
        SD(f,145);
        ST(f,20,155,"TARGET DATABASE",cTxt,0.5f);
        ST(f,20,185,"Use PAD menu to select targets",cSec,0.45f);
        ST(f,20,215,"GPS coordinates stored in memory",cSec,0.45f);
        SD(f,260);
        ST(f,20,270,"QUICK ACTIONS",cTxt,0.5f);
        SBx(f,15,300,235,50,cBg,cBdr);
        ST(f,20,310,"ARM ALL",cWrn,0.5f);
        SBx(f,260,300,235,50,cBg,cBdr);
        ST(f,265,310,"LAUNCH",ctrlReady>0?cOK:cSec,0.5f);
        SD(f,370);
        ST(f,20,380,$"Ready to fire: {ctrlReady} missile(s)",ctrlReady>0?cOK:cSec,0.5f);
        f.Dispose();
        }
        
        void UpdateLCD4Missile(){
        var f=BL(lcd4);
        SH(f,10,"MISSILE FUEL STATUS",cPri);
        SLB(f,20,50,350,16,"Battery",mslBatPct/100f,PctCol(mslBatPct/100f),cBdr);
        ST(f,380,50,$"{mslBatC:F1}/{mslBatM:F1} MWh",cTxt,0.4f);
        SLB(f,20,90,350,16,"Hydrogen",mslH2Pct/100f,PctCol(mslH2Pct/100f),cBdr);
        ST(f,380,90,$"{mslH2Fill:F0}/{mslH2Cap:F0} L",cTxt,0.4f);
        SLB(f,20,130,350,16,"Oxygen",mslO2Pct/100f,PctCol(mslO2Pct/100f),cBdr);
        ST(f,380,130,$"{mslO2Fill:F0}/{mslO2Cap:F0} L",cTxt,0.4f);
        SD(f,170);
        ST(f,20,185,"GENERATOR FUEL",cSec,0.5f);
        SBx(f,15,210,235,60,cBg,cBdr);
        ST(f,20,215,"Ice",cTxt,0.45f);
        ST(f,20,240,$"{mslIce} units",mslIce>0?cOK:cWrn,0.5f);
        SBx(f,260,210,235,60,cBg,cBdr);
        ST(f,265,215,"Uranium",cTxt,0.45f);
        ST(f,265,240,$"{mslUran} kg",mslUran>0?cOK:cSec,0.5f);
        SD(f,290);
        ST(f,20,300,"BLOCK COUNTS",cSec,0.5f);
        ST(f,20,330,$"H2 Generators: {mslGenCnt}",cTxt,0.45f);
        ST(f,20,360,$"H2 Tanks: {mslH2Cnt}",cTxt,0.45f);
        ST(f,250,330,$"Reactors: {mslReactCnt}",cTxt,0.45f);
        ST(f,250,360,$"O2 Tanks: {mslO2Cnt}",cTxt,0.45f);
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
        SBx(f,15,45,230,80,cBg,cBdr);
        ST(f,20,50,"WARHEADS",cSec,0.45f);
        ST(f,20,75,$"{warCount}",warCount>0?cOK:cErr,0.8f);
        ST(f,90,80,warArmed?"ARMED":"SAFE",warArmed?cErr:cOK,0.5f);
        SBx(f,255,45,230,80,cBg,cBdr);
        ST(f,260,50,"CONNECTOR",cSec,0.45f);
        ST(f,260,75,conLocked?"LOCKED":"UNLOCKED",conLocked?cOK:cWrn,0.6f);
        SD(f,145);
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
        
        void UpdateLCD6Missile(){
        var f=BL(lcd6);
        if(mslCount==0&&!conLocked){
        SH(f,10,"AWAITING MISSILE",cWrn);
        ST(f,20,55,"TO BUILD A MISSILE:",cSec,0.5f);
        ST(f,30,85,"1. Switch pad to PRINT mode",cTxt,0.45f);
        ST(f,30,115,"2. Projector will show blueprint",cTxt,0.45f);
        ST(f,30,145,"3. Welder builds the missile",cTxt,0.45f);
        ST(f,30,175,"4. When done, switch to DOCK mode",cTxt,0.45f);
        SD(f,210);
        ST(f,20,225,"FUEL TARGETS",cSec,0.5f);
        ST(f,20,255,$"H2 Bottles: {pH2B}/{h2Target}",pH2B>=h2Target?cOK:cWrn,0.45f);
        ST(f,250,255,$"O2 Bottles: {pO2B}/{o2Target}",pO2B>=o2Target?cOK:cWrn,0.45f);
        ST(f,20,285,$"Ammo ({ammoNames[ammoTypeIdx]}): {ammoStock}/{ammoTarget}",ammoStock>=ammoTarget?cOK:cWrn,0.45f);
        SD(f,310);
        ST(f,20,325,"CURRENT PRINTER PHASE",cSec,0.5f);
        ST(f,20,355,$"{prtPhase}",cAcc,0.6f);
        }else{
        SH(f,10,"MISSILE STATUS",cPri);
        bool batOK=mslBatPct>=99;bool h2OK=mslH2Pct>=99||mslH2Cnt==0;bool o2OK=mslO2Pct>=99||mslO2Cnt==0;
        bool ammoOK=mslAmmo>=mslAmmoLoad;bool allOK=batOK&&h2OK&&o2OK&&ammoOK;
        SBx(f,15,45,470,100,cBg,cBdr);
        ST(f,20,55,"OVERALL STATUS",cSec,0.5f);
        ST(f,20,85,allOK?"READY FOR LAUNCH":"LOADING IN PROGRESS",allOK?cOK:cWrn,0.6f);
        ST(f,20,115,$"Connector: {(conLocked?"LOCKED":"UNLOCKED")}  Warheads: {warCount} [{(warArmed?"ARMED":"SAFE")}]",cTxt,0.4f);
        SD(f,165);
        ST(f,20,175,"FUEL LEVELS",cSec,0.5f);
        SBx(f,15,200,150,50,batOK?cOK:cWrn,cBdr);ST(f,20,205,"Battery",cBg,0.4f);ST(f,20,225,$"{mslBatPct:F0}%",cBg,0.5f);
        SBx(f,175,200,150,50,h2OK?cOK:cWrn,cBdr);ST(f,180,205,"Hydrogen",cBg,0.4f);ST(f,180,225,$"{mslH2Pct:F0}%",cBg,0.5f);
        SBx(f,335,200,150,50,o2OK?cOK:cSec,cBdr);ST(f,340,205,"Oxygen",cBg,0.4f);ST(f,340,225,$"{mslO2Pct:F0}%",cBg,0.5f);
        SD(f,270);
        ST(f,20,280,"SUPPLIES",cSec,0.5f);
        SBx(f,15,305,150,50,mslIce>0?cOK:cWrn,cBdr);ST(f,20,310,"Ice",cBg,0.4f);ST(f,20,330,$"{mslIce}",cBg,0.5f);
        SBx(f,175,305,150,50,cSec,cBdr);ST(f,180,310,"Uranium",cBg,0.4f);ST(f,180,330,$"{mslUran}",cBg,0.5f);
        SBx(f,335,305,150,50,ammoOK?cOK:cWrn,cBdr);ST(f,340,310,"Ammo",cBg,0.4f);ST(f,340,330,$"{mslAmmo}/{mslAmmoLoad}",cBg,0.5f);
        }
        f.Dispose();
        }
        
        void UpdateLCD9Missile(){
        var f=BL(lcd9);
        SH(f,10,"AMMUNITION LOADING",cPri);
        float ammoPct=mslAmmoLoad>0?(float)mslAmmo/mslAmmoLoad:0;
        SBx(f,15,45,470,90,cBg,cBdr);
        ST(f,20,50,"CURRENT LOAD",cSec,0.5f);
        SB(f,20,80,350,20,ammoPct,PctCol(ammoPct),cBdr);
        ST(f,380,80,$"{ammoPct*100:F0}%",cTxt,0.5f);
        ST(f,20,110,$"{mslAmmo} / {mslAmmoLoad} rounds loaded",cTxt,0.45f);
        SD(f,155);
        ST(f,20,165,"AMMUNITION TYPE",cSec,0.5f);
        SBx(f,15,190,470,60,cBg,cBdr);
        ST(f,20,200,$"{ammoNames[ammoReqType]}",cAcc,0.6f);
        ST(f,20,230,$"Blueprint: {ammoBPNames[ammoReqType]}",cTxt,0.4f);
        SD(f,270);
        ST(f,20,280,"LOADING STATUS",cSec,0.5f);
        bool loading=mslAmmo<mslAmmoLoad;
        ST(f,20,310,loading?"Transferring ammunition to missile...":"Ammunition load complete",loading?cWrn:cOK,0.5f);
        ST(f,20,350,$"Source containers: {(ammoCargo!=null?"Available":"Not Found")}",cTxt,0.45f);
        f.Dispose();
        }
        
        void UpdateLCD10Missile(){
        var f=BL(lcd10);
        SH(f,10,"MISSILE READINESS",cPri);
        bool batOK=mslBatPct>=99;bool h2OK=mslH2Pct>=99||mslH2Cnt==0;bool o2OK=mslO2Pct>=99||mslO2Cnt==0;
        bool ammoOK=mslAmmo>=mslAmmoLoad;bool allOK=batOK&&h2OK&&o2OK&&ammoOK;
        SBx(f,15,45,470,80,allOK?cOK:cWrn,cBdr);
        ST(f,20,55,"LAUNCH READINESS",cBg,0.5f);
        ST(f,20,85,allOK?"ALL SYSTEMS GO":"LOADING IN PROGRESS",cBg,0.7f);
        SD(f,145);
        ST(f,20,155,"CHECKLIST",cSec,0.5f);
        ST(f,20,185,$"[{(batOK?"X":" ")}] Battery charged to 100%",batOK?cOK:cWrn,0.45f);
        ST(f,20,215,$"[{(h2OK?"X":" ")}] Hydrogen tanks full",h2OK?cOK:cWrn,0.45f);
        ST(f,20,245,$"[{(o2OK?"X":" ")}] Oxygen tanks full",o2OK?cOK:cSec,0.45f);
        ST(f,20,275,$"[{(ammoOK?"X":" ")}] Ammunition loaded",ammoOK?cOK:cWrn,0.45f);
        ST(f,20,305,$"[{(conLocked?"X":" ")}] Connector locked",conLocked?cOK:cWrn,0.45f);
        SD(f,350);
        ST(f,20,360,"When ready, use PAD menu to ARM and LAUNCH",cTxt,0.45f);
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
        
        void UpdateLCD9Print(){
        var f=BL(lcd9);
        SH(f,10,"WELDING PROGRESS",cPri);
        float pct=prtTot>0?(float)(prtTot-prtRem)/prtTot:0;
        SBx(f,15,45,470,120,cBg,cBdr);
        ST(f,20,50,"OVERALL PROGRESS",cSec,0.5f);
        SB(f,20,85,350,25,pct,PctCol(pct),cBdr);
        ST(f,380,85,$"{pct*100:F0}%",cTxt,0.6f);
        ST(f,20,120,$"Building: {prtTot-prtRem} of {prtTot} blocks",cTxt,0.5f);
        ST(f,20,145,$"Blocks ready to weld: {prtBld}",prtBld>0?cOK:cSec,0.45f);
        SD(f,185);
        ST(f,20,195,"CURRENT OPERATION",cSec,0.5f);
        SBx(f,15,220,470,80,cBg,cBdr);
        ST(f,20,230,"Phase",cSec,0.45f);
        ST(f,20,260,prtPhase,cAcc,0.6f);
        ST(f,250,230,"Piston",cSec,0.45f);
        ST(f,250,260,$"{prtPist:F1} meters",cTxt,0.5f);
        SD(f,320);
        ST(f,20,330,"STATUS",cSec,0.5f);
        ST(f,20,360,printing?"Printer is active":"Printer is idle",printing?cOK:cSec,0.5f);
        f.Dispose();
        }
        
        void UpdateLCD10Print(){
        var f=BL(lcd10);
        SH(f,10,"MISSILE PRODUCTION",cPri);
        float pct=prtTot>0?(float)(prtTot-prtRem)/prtTot:0;
        bool done=pct>=1;
        SBx(f,15,45,470,80,done?cOK:cWrn,cBdr);
        ST(f,20,55,"BUILD COMPLETION",cBg,0.5f);
        ST(f,20,85,done?"MISSILE READY FOR DOCKING":"CONSTRUCTION IN PROGRESS",cBg,0.6f);
        SD(f,145);
        ST(f,20,155,"PRODUCTION CHECKLIST",cSec,0.5f);
        ST(f,20,185,$"[{(prtTot>0?"X":" ")}] Projection loaded",prtTot>0?cOK:cSec,0.45f);
        ST(f,20,215,$"[{(printing?"X":" ")}] Printer active",printing?cOK:cSec,0.45f);
        ST(f,20,245,$"[{(prtRem==0&&prtTot>0?"X":" ")}] All blocks complete",prtRem==0&&prtTot>0?cOK:cWrn,0.45f);
        ST(f,20,275,$"[{(done?"X":" ")}] Ready for dock sequence",done?cOK:cSec,0.45f);
        SD(f,320);
        ST(f,20,330,"NEXT STEPS",cSec,0.5f);
        ST(f,20,360,done?"Retract printer, then DOCK missile":"Wait for construction to complete",cTxt,0.45f);
        f.Dispose();
        }
        
    }
}
