public enum S{INIT,IDLE,PRINT,BUILD,DOCK,FUEL,AMMO,READY,ARM,LAUNCH,GONE}
public enum M{MAIN,TGT,SET,ARM,WIZARD,VIEW}
public enum T{GPS,ANTENNA,SENSOR,LIDAR,MANUAL,SATELLITE}
public enum E{UNKNOWN,SPACE,PLANET,MOON}
S cS=S.INIT;M cM=M.MAIN;T tM=T.GPS;E env=E.UNKNOWN;int sel=0;
bool bootDone=false;
float lcdW=512,lcdH=512,lcdS=1,lcdYS=1;
int viewLCD=0;int[] lcdScroll=new int[9];
int graphTimeIdx=0;
string[] graphLabels={"30m","1h","6h","12h","1d","ALL"};
Color cPri=new Color(0,180,255);Color cSec=new Color(100,100,100);Color cAcc=new Color(255,200,0);
Color cOK=new Color(0,255,100);Color cWrn=new Color(255,180,0);Color cErr=new Color(255,60,60);
Color cBg=new Color(10,10,15);Color cBdr=new Color(40,40,50);Color cTxt=new Color(220,220,220);
bool hasGrav=false;float gravStr=0;bool inAtmo=false;bool setupDone=false;bool mergePaused=false;
IMyShipMergeBlock padMerge,mslMerge;
IMyShipConnector padCon,mslConFuel,mslConAmmo,padCon1,padCon2;
IMyTextPanel lcd1,lcd2,lcd3,lcd4,lcd5,lcd6,lcd7,lcd8,lcd9,lcd10;
List<IMyTextPanel> bbLCDs=new List<IMyTextPanel>();
string bbLog="",gpsData="",lastBBPhase="";S lastBBState=S.INIT;
double mslAlt=0,mslSpeed=0,mslFuelPct=0;
string mslGSt="";
IMyButtonPanel btn;
IMyProgrammableBlock mslPB;
List<IMyBatteryBlock> mslBat=new List<IMyBatteryBlock>();
List<IMyGasTank> mslH2=new List<IMyGasTank>(),mslO2=new List<IMyGasTank>();
List<IMyWarhead> mslWar=new List<IMyWarhead>();
List<IMyThrust> mslThr=new List<IMyThrust>();
int thrAtmo=0,thrH2=0,thrIon=0;
List<IMyGasGenerator> mslGen=new List<IMyGasGenerator>();
List<IMyReactor> mslReact=new List<IMyReactor>();
List<IMyGyro> mslGyr=new List<IMyGyro>();
List<IMySensorBlock> mslSen=new List<IMySensorBlock>();
List<IMyCameraBlock> mslCam=new List<IMyCameraBlock>();
List<IMyRadioAntenna> mslAnt=new List<IMyRadioAntenna>();
List<IMyLaserAntenna> mslLsr=new List<IMyLaserAntenna>();
List<IMyCockpit> mslCock=new List<IMyCockpit>();
List<IMyLightingBlock> mslLights=new List<IMyLightingBlock>();
IMyRemoteControl mslRC;
DateTime lMnuT;
float batPct,h2Pct,o2Pct,icePct,ammoPct;
bool warArmed,merged,conLocked,mslFound;
DateTime lnchT;int lnchTk=0;int fuelTicks=0;int dockTicks=0;
Vector3D tgtGPS=new Vector3D(0,0,0);
string tgtAntenna="",tgtName="",bcTag="UNITY_MSL";
bool tgtSet=false,antBC=true,counting=false;
List<MyWaypointInfo> wpts=new List<MyWaypointInfo>(),customWP=new List<MyWaypointInfo>();
List<string> detAnts=new List<string>();
int wpIdx=0,antIdx=0,clbDst=500,detDist=50,cntDn=10,sensorRng=50,lidarRng=500,lidarAng=5,brnT=5,reDst=500,fltMd=2,tgtRel=0;
DateTime armTime;
IMyBroadcastListener mslL,relL;
string mslPhase="",lKPh="",mslOutcome="",finalPhase="";
double mslDTT=0,lKDst=0,mslGrav=0,mslDFP=0,mslVel=0,fnlDTT=0;
Vector3D mslPos,lastMslPos;
DateTime lTlm,lTlmT,abtT,outT;
bool hasTlm=false,mslLnch=false,mslBO=false,abtQ=false,abtS=false,shwOut=false;
int tlmTO=1000,fIdx=0;
float[] fDist=new float[16],fAlt=new float[16],fSpd=new float[16];
const int SET_VISIBLE=7;int setScroll=0;int bldScroll=0;
const string BP="MyObjectBuilder_BlueprintDefinition/";
const string OB="MyObjectBuilder_";
List<IMyPistonBase> prtPist=new List<IMyPistonBase>(),prtPistV=new List<IMyPistonBase>(),prtPistH=new List<IMyPistonBase>();
List<IMyShipWelder> prtWeld=new List<IMyShipWelder>();
IMyProjector prtProj;
int prtState=0,prtST=0,tick=0,bldNum=0,padID=0;
float prtSpeed=0.5f,prtHPos=0,prtHStep=0.2f,prtHMax=7.4f,prtVMax=10f,prtVZero=1f,prtVSpeed=0.5f,prtHSpeed=0.3f,prtLastVPos=0;
bool printing=false,prtStopped=false,bldCmp=false,pNmd=false;
string padTag="[PAD1";
List<IMyBatteryBlock> padBat=new List<IMyBatteryBlock>();
List<IMyGasTank> padH2=new List<IMyGasTank>(),padO2=new List<IMyGasTank>();
List<IMyCargoContainer> padCargo=new List<IMyCargoContainer>(),padCargoL=new List<IMyCargoContainer>(),padCargoM=new List<IMyCargoContainer>(),padCargoS=new List<IMyCargoContainer>();
IMyCargoContainer toolCargo=null,oreCargo=null,ingotCargo=null,compCargo=null,ammoCargo=null,bottleCargo=null;
List<IMyRefinery> padRef=new List<IMyRefinery>();
List<IMyAssembler> padAsm=new List<IMyAssembler>();
List<IMyRadioAntenna> padAnt=new List<IMyRadioAntenna>();
List<IMyLaserAntenna> padLsr=new List<IMyLaserAntenna>();
List<IMyReactor> padReact=new List<IMyReactor>();
List<IMySolarPanel> padSolar=new List<IMySolarPanel>();
List<IMyGyro> padGyr=new List<IMyGyro>();
List<IMyThrust> padThr=new List<IMyThrust>();
List<IMyGasGenerator> padGen=new List<IMyGasGenerator>();
List<IMyCameraBlock> padCam=new List<IMyCameraBlock>();
List<IMySensorBlock> padSen=new List<IMySensorBlock>();
List<IMyPowerProducer> padWind=new List<IMyPowerProducer>();
int padMedCount=0,padSurvCount=0,padCryoCount=0,pIceC=0,pUrnC=0,pH2B=0,pO2B=0,h2Target=20,o2Target=20,iceTarget=1000,uranTarget=50,h2PT=90,o2PT=90,h2Queued=0,o2Queued=0;
float padBatPct,padH2Pct,padO2Pct,padCargoPct,padPowerOut=0,padPowerMax=0;
float invCargoPct=0;int invCargoL=0,invCargoM=0,invCargoS=0,invCargoT=0;
int prtBuildable,prtMissing;
bool isCreative=false;
bool isCtl=false;
int ctrlSel=0;
int ctrlPadSel=0;
List<int> kPads=new List<int>();
Dictionary<int,string> pStat=new Dictionary<int,string>();
Dictionary<int,bool> pArm=new Dictionary<int,bool>();
Dictionary<int,bool> pRdy=new Dictionary<int,bool>();
Dictionary<int,bool> pMslF=new Dictionary<int,bool>();
Dictionary<int,bool> pPrt=new Dictionary<int,bool>();
Dictionary<int,Vector3D> pTgts=new Dictionary<int,Vector3D>();
IMyBroadcastListener pCmdL;
IMyBroadcastListener pStL;
string pCTag="UNITY_PAD_CMD";
string pStTag="UNITY_PAD_STATUS";
int svInt=3;
int salvoIdx=0;
bool svAct=false;
int cSpd=50;
int cPat=0;
bool aAtk=false;
List<Vector3D> dTgt=new List<Vector3D>();
IMyBroadcastListener enmL;
DateTime lastSalvo;
IMyBroadcastListener sStL;
string sStTag="UNITY_SAT_RELAY_STATUS";
Dictionary<int,Vector3D> sPos=new Dictionary<int,Vector3D>();
Dictionary<int,int> sBat=new Dictionary<int,int>();
Dictionary<int,int> satH2=new Dictionary<int,int>();
Dictionary<int,string> satStatus=new Dictionary<int,string>();
Dictionary<int,DateTime> sLSn=new Dictionary<int,DateTime>();
List<int> kSats=new List<int>();
List<int> lostSats=new List<int>();
int tSC=0;
bool aRS=false;
int sTout=60;
int sRQ=0;
DateTime lSatC;
List<IMyShipConnector> oreC=new List<IMyShipConnector>();
IMyBroadcastListener bcnL;
string bcnTag="MINER_BEACON";
Dictionary<long,MinerData> trkM=new Dictionary<long,MinerData>();
class MinerData{public string name;public float bat,crg,h2;public Vector3D pos;public double spd,alt,dist;public string status;public int drills,drillsOn,grinders,grindersOn;public bool docked;public DateTime lastSeen;public int portNum;public double outboundSecs,returnSecs,etaSecs;public int cycles;public bool outbound;}
Dictionary<string,int> oStk=new Dictionary<string,int>();
Dictionary<string,int> cStk=new Dictionary<string,int>();
Dictionary<string,int> iStk=new Dictionary<string,int>();
Dictionary<string,int> cNd=new Dictionary<string,int>();
Dictionary<string,int> cMis=new Dictionary<string,int>();
int ammoStock=0;
int ammoTarget=50000;
int ammoQueued=0;
int mslAmmo=0;
int ammoLoad=10106;
int ammoEject=10106;
int ammoTypeIdx=0;
string[] ammoNames={"5.45x39mm","MR-20 Rifle","MR-50A Rifle","200mm Missile","25x184mm NATO"};
string[] ammoBPNames={"SemiAutoPistolMagazine","AutomaticRifleGun_Mag_20rd","RapidFireAutomaticRifleGun_Mag_50rd","Missile200mm","NATO_25x184mmMagazine"};
string[] ammoITNames={"SemiAutoPistolMagazine","AutomaticRifleGun_Mag_20rd","RapidFireAutomaticRifleGun_Mag_50rd","Missile200mm","NATO_25x184mm"};
MyDefinitionId ammoBP;
MyItemType ammoType;
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
Dictionary<string,int> cQd=new Dictionary<string,int>();
int toolTarget=10;
int pAmmoTarget=50;
string[] tN={"Drill","Welder","Grinder","Rifle","Pistol","Launcher","Flare"};
string[][] tIT={new[]{"HandDrillItem","HandDrill2Item","HandDrill3Item","HandDrill4Item"},new[]{"WelderItem","Welder2Item","Welder3Item","Welder4Item"},new[]{"AngleGrinderItem","AngleGrinder2Item","AngleGrinder3Item","AngleGrinder4Item"},new[]{"AutomaticRifleItem","PreciseAutomaticRifleItem","RapidFireAutomaticRifleItem","UltimateAutomaticRifleItem"},new[]{"SemiAutoPistolItem","FullAutoPistolItem","ElitePistolItem"},new[]{"BasicHandHeldLauncherItem","AdvancedHandHeldLauncherItem"},new[]{"FlareGunItem"}};
Dictionary<string,int> tStk=new Dictionary<string,int>();
Dictionary<string,int> tQ=new Dictionary<string,int>();
Dictionary<string,int> pAmmoStk=new Dictionary<string,int>();
Dictionary<string,int> pAmmoQ=new Dictionary<string,int>();
string[] pAmmoNames={"RifleMag20","RifleMag5","RifleMag50","RifleMag30","PistolSemi","PistolFull","PistolElite","Rocket","Flare"};
string[] pAmmoIT={"AutomaticRifleGun_Mag_20rd","PreciseAutomaticRifleGun_Mag_5rd","RapidFireAutomaticRifleGun_Mag_50rd","UltimateAutomaticRifleGun_Mag_30rd","SemiAutoPistolMagazine","FullAutoPistolMagazine","ElitePistolMagazine","Missile200mm","FlareClip"};

public Program(){
Runtime.UpdateFrequency=UpdateFrequency.Update100;
printing=false;prtState=0;prtStopped=true;
LoadStorage();
UpdatePadTag();
UpdateAmmoType();
DetectEnvironment();
Scan();
foreach(var w in prtWeld)w.Enabled=false;
foreach(var p in prtPist){p.Velocity=-0.5f;}
mslL=IGC.RegisterBroadcastListener(bcTag);
relL=IGC.RegisterBroadcastListener(bcTag+"_RELAY");
pCmdL=IGC.RegisterBroadcastListener(pCTag);
pStL=IGC.RegisterBroadcastListener(pStTag);
sStL=IGC.RegisterBroadcastListener(sStTag);
enmL=IGC.RegisterBroadcastListener("ENEMY_SIGNAL");
bcnL=IGC.RegisterBroadcastListener(bcnTag);
bootReqL=IGC.RegisterBroadcastListener("UNITY_BOOT_REQ");
WriteReadyFlag("pad_ready");
}
IMyBroadcastListener bootReqL;
void WriteReadyFlag(string flag){if(btn==null)return;string cd=btn.CustomData;if(!cd.Contains("[SYSTEM]"))cd="[SYSTEM]\n"+cd;if(cd.Contains(flag+"=false"))cd=cd.Replace(flag+"=false",flag+"=true");else if(!cd.Contains(flag+"="))cd=cd.Replace("[SYSTEM]","[SYSTEM]\n"+flag+"=true");btn.CustomData=cd;}
bool IsBootComplete(){
if(btn==null)return false;
string cd=btn.CustomData;
if(cd.Contains("boot_complete=BOOTING"))return false;
if(cd.Contains("boot_complete=true"))return true;
return false;
}
void CheckBootRequest(){
while(bootReqL!=null&&bootReqL.HasPendingMessage){var msg=bootReqL.AcceptMessage();if(msg.Data.ToString()=="PAD_CHECK")SendBootResponse();}
if(btn!=null&&btn.CustomData.Contains("pad_check=request"))SendBootResponse();
}
void SendBootResponse(){
int mc=padMerge!=null?1:0,cc=padCon!=null?1:0;
int bc=padBat.Count,h2c=padH2.Count,o2c=padO2.Count,pc=prtWeld.Count;
string rsp=$"PAD|OK|merge={mc},con={cc},bat={bc},h2={h2c},o2={o2c},prt={pc}";
IGC.SendBroadcastMessage("UNITY_BOOT_RSP",rsp);
if(btn!=null){string cd=btn.CustomData;cd=cd.Replace("pad_check=request","pad_check=done");cd=cd.Replace("pad_status=waiting",$"pad_status=OK:merge={mc},con={cc},bat={bc},h2={h2c},o2={o2c},prt={pc}");btn.CustomData=cd;}
}
public void Save(){Storage=$"{padID}|{(isCtl?"1":"0")}|{toolTarget}";}
void LoadStorage(){
if(string.IsNullOrEmpty(Storage))return;
var p=Storage.Split('|');
if(p.Length>=1)int.TryParse(p[0],out padID);
if(p.Length>=2)isCtl=p[1]=="1";
if(p.Length>=3)int.TryParse(p[2],out toolTarget);
}
void UpdatePadTag(){
if(padID==0)padID=GetNextPadID();
padTag=$"[PAD{padID}";Me.CustomName=$"[PAD{padID}] Unity Pad";
}
List<int> DiscoverSiblingPads(){
var ids=new List<int>();
var pbs=new List<IMyProgrammableBlock>();
GridTerminalSystem.GetBlocksOfType(pbs,b=>b.CubeGrid==Me.CubeGrid&&b!=Me&&b.CustomName.Contains("[PAD"));
foreach(var pb in pbs){
string n=pb.CustomName;
int idx=n.IndexOf("[PAD");
if(idx>=0){
int end=n.IndexOf("]",idx);
if(end>idx+4){
string num=n.Substring(idx+4,end-idx-4);
int id;if(int.TryParse(num,out id)&&id>0&&!ids.Contains(id))ids.Add(id);
}}}
return ids;
}
int GetNextPadID(){
var taken=DiscoverSiblingPads();
int next=1;
while(taken.Contains(next))next++;
return next;
}
void SetupModule(){SetupModule(false);}
void SetupModule(bool force){if(padID==0){padID=GetNextPadID();UpdatePadTag();}string tg=$"[PAD{padID}]",pt=$"[PAD{padID}-PRINT]";Vector3D mp=Me.GetPosition();var aB=new List<IMyTerminalBlock>();GridTerminalSystem.GetBlocksOfType(aB);var pB=new List<IMyTerminalBlock>();GridTerminalSystem.GetBlocksOfType(pB,b=>b.CubeGrid==Me.CubeGrid);IMyShipMergeBlock pm=null;double pd=999;foreach(var b in pB)if(b is IMyShipMergeBlock){double d=VD(b.GetPosition(),mp);if(d<pd){pm=b as IMyShipMergeBlock;pd=d;}}Vector3D mP=pm!=null?pm.GetPosition():mp;IMyShipMergeBlock om=null;bool iM=pm!=null&&pm.IsConnected;if(iM){var aM=new List<IMyShipMergeBlock>();GridTerminalSystem.GetBlocksOfType(aM,m=>m.IsConnected&&m!=pm);if(aM.Count>0)om=aM[0];}Vector3D mD=Vector3D.Zero;if(iM&&om!=null)mD=VN(om.GetPosition()-mP);var sG=new HashSet<long>();foreach(var b in pB)if(b is IMyPistonBase){var p=b as IMyPistonBase;if(p.Top!=null&&VD(b.GetPosition(),mp)<50)sG.Add(p.Top.CubeGrid.EntityId);}int li=1,vi=1,hi=1,wi=1,ci=1;Action<IMyTerminalBlock>T=b=>b.CustomName=$"{tg} {BT(b)}";Func<string,string>Strip=n=>{int i=n.IndexOf("[PAD");if(i>=0){int e=n.IndexOf("]",i);if(e>i)n=n.Remove(i,e-i+1).Trim();}return n;};foreach(var b in pB){if(b.CustomName.Contains("Missile #")||b.CustomName.Contains("-PRINT")||b==Me)continue;double d=VD(b.GetPosition(),mp);if(d>80)continue;if(iM&&mD!=Vector3D.Zero&&Vector3D.Dot(b.GetPosition()-mP,mD)>1)continue;string nm=b.CustomName;if(force&&nm.Contains("[PAD")&&!nm.Contains($"[PAD{padID}"))nm=Strip(nm);if(nm.Contains("[PRINT]")&&!nm.Contains("-PRINT]")){b.CustomName=nm.Replace("[PRINT]",pt);continue;}if(!force&&(nm.Contains($"[PAD{padID}")||(nm.Contains("[PAD")&&!nm.Contains($"[PAD{padID}"))))continue;if(b is IMyShipMergeBlock&&b==pm)b.CustomName=$"{tg} Merge";else if(b is IMyShipConnector){var cn=b as IMyShipConnector;string u=nm.ToUpper();if(u.Contains("ORE")||u.Contains("EJECTOR"))b.CustomName=$"{tg} {nm}";else if(ci<=2){b.CustomName=$"[PAD{padID}-CON{ci}]";ci++;}else b.CustomName=$"{tg} Con";}else if(b is IMyTextPanel&&li<=8){b.CustomName=$"[PAD{padID}:{li}] LCD";li++;}else if(b is IMyPistonBase){var ps=b as IMyPistonBase;if(Math.Abs(Vector3D.Dot(ps.WorldMatrix.Up,Vector3D.Up))>0.7){b.CustomName=$"{pt} V{vi}";vi++;}else{b.CustomName=$"{pt} H{hi}";hi++;}}else if(b is IMyShipWelder){b.CustomName=$"{pt} W{wi}";wi++;}else if(b is IMyProjector)b.CustomName=$"{pt} Proj";else if(b is IMyButtonPanel)b.CustomName=$"{tg} Btn";else if(b is IMyBatteryBlock||b is IMyGasTank||b is IMyCargoContainer||b is IMyRefinery||b is IMyAssembler||b is IMyRadioAntenna||b is IMyLaserAntenna||b is IMyReactor||b is IMySolarPanel||b is IMyGasGenerator||b is IMyGyro||b is IMyThrust||b is IMySensorBlock||b is IMyCameraBlock||b is IMyRemoteControl||b is IMyCockpit||b is IMyMedicalRoom)T(b);else if(b is IMyDoor)b.CustomName=$"{tg} Dr";else if(b is IMyLightingBlock)b.CustomName=$"{tg} Lt";else if(b is IMyConveyorSorter)b.CustomName=$"{tg} Srt";else if(b is IMyShipDrill)b.CustomName=$"{tg} Drl";else if(b is IMyShipGrinder)b.CustomName=$"{tg} Grd";else if(b is IMyOreDetector)b.CustomName=$"{tg} ODt";else if(b is IMyBeacon)b.CustomName=$"{tg} Bcn";else if(b is IMyTimerBlock)b.CustomName=$"{tg} Tmr";else if(b is IMyAirVent)b.CustomName=$"{tg} Vnt";else if(b is IMyGravityGenerator)b.CustomName=$"{tg} Grv";else if(b is IMyJumpDrive)b.CustomName=$"{tg} Jmp";else{string bt=BT(b);if(!string.IsNullOrEmpty(bt)&&bt.Length<30)b.CustomName=$"{tg} {bt}";}}foreach(var b in aB){if(b.CubeGrid==Me.CubeGrid||!sG.Contains(b.CubeGrid.EntityId)||b.CustomName.Contains("[PAD")||b.CustomName.Contains("Missile #")||b.CustomName.Contains("-PRINT"))continue;if(b is IMyShipWelder){b.CustomName=$"{pt} W{wi}";wi++;}else if(b is IMyProjector&&!b.CustomName.Contains("-PRINT]"))b.CustomName=$"{pt} Proj";else if(b is IMyCockpit)T(b);}bool mDk=pm!=null&&pm.IsConnected;if(mDk){ScanMissile();if(mslFound){bldNum++;NameMissileParts();AutoNameConnectors();pNmd=true;}}setupDone=true;}
void UpdateAmmoType(){
ammoBP=MyDefinitionId.Parse(BP+ammoBPNames[ammoTypeIdx]);
ammoType=MyItemType.Parse(OB+"AmmoMagazine/"+ammoITNames[ammoTypeIdx]);
}

void DetectEnvironment(){
var blocks=new List<IMyShipController>();
GridTerminalSystem.GetBlocksOfType(blocks,b=>b.CubeGrid==Me.CubeGrid);
IMyShipController ctrl=null;
foreach(var b in blocks){ctrl=b;break;}
if(ctrl==null){
var cocks=new List<IMyCockpit>();
GridTerminalSystem.GetBlocksOfType(cocks);
if(cocks.Count>0)ctrl=cocks[0];
}
if(ctrl!=null){
Vector3D grav=ctrl.GetNaturalGravity();
gravStr=(float)grav.Length();
hasGrav=gravStr>0.05;
if(!hasGrav){env=E.SPACE;inAtmo=false;}
else if(gravStr>5){env=E.PLANET;inAtmo=true;}
else{env=E.MOON;inAtmo=gravStr>2;}
}else{env=E.UNKNOWN;hasGrav=false;inAtmo=false;}
}

public void Main(string a,UpdateType u){
tick++;
CheckBootRequest();
if(!bootDone){
if(!IsBootComplete()){Echo("UNITY PAD");Echo("Waiting for boot...");return;}
bootDone=true;Scan();DetectEnvironment();
}
if(a!="")HandleArg(a);
if(tick%2==0)Scan();
if(tick%2==1){UpdateState();CheckStateLog();}
UpdatePrinter();
if(tick%3==0)CheckTelemetry();
if(tick%3==0)CheckPadCommands();
if(tick%3==0)CheckPadStatus();
if(tick%3==0)CheckSatStatus();
if(tick%5==0)ManageSatNetwork();
if(tick%3==0)CheckBeacons();
if(tick%5==0)BroadcastStatus();
if(tick%2==0)UpdateSalvo();
if(tick%5==0)UpdateAutoAttack();
if(tick%2==0)UpdateDisplays();
if(tick%5==0)UpdateBtnConfig();
if(tick%5==0)ReadInvStats();
if(tick%10==0&&cNd.Count>6){bldScroll=(bldScroll+1)%(cNd.Count-5);}
if(mslFound&&cS!=S.GONE)UpdateMissileLights();
}

void CheckTelemetry(){
if(mslL==null)return;
while(mslL.HasPendingMessage){ProcessTelemetry(mslL.AcceptMessage());}
if(relL!=null){while(relL.HasPendingMessage){ProcessTelemetry(relL.AcceptMessage());}}
CheckTelemetryTimeout();
}
void ProcessTelemetry(MyIGCMessage msg){
if(!(msg.Data is string))return;
var parts=((string)msg.Data).Split(',');
if(parts.Length>=5){
double x,y,z,d;
if(double.TryParse(parts[0],out x)&&double.TryParse(parts[1],out y)&&double.TryParse(parts[2],out z)){
Vector3D newPos=new Vector3D(x,y,z);
if(hasTlm&&lastMslPos!=Vector3D.Zero){
double dt=(DT-lTlmT).TotalSeconds;
if(dt>0.1){double dist=VD(newPos,lastMslPos);mslVel=dist/dt;}
}
mslPos=newPos;lastMslPos=newPos;lTlmT=DT;
}
if(double.TryParse(parts[3],out d))mslDTT=d;
mslPhase=parts[4];
if(mslPhase=="ENTERING_BLACKOUT"){mslBO=true;lKPh=mslPhase;lKDst=mslDTT;}
else if(mslPhase=="CONTACT_RESTORED"){mslBO=false;if(abtQ){RemoteDetonate();abtQ=false;mslLnch=false;hasTlm=false;cS=S.IDLE;return;}}
else{lKPh=mslPhase;lKDst=mslDTT;mslBO=false;}
if(parts.Length>=7){
double g,fp;
if(double.TryParse(parts[5],out g))mslGrav=g;
if(double.TryParse(parts[6],out fp))mslDFP=fp;
}
if(parts.Length>=11){
double alt,spd,fuel;
if(double.TryParse(parts[7],out alt))mslAlt=alt;
if(double.TryParse(parts[8],out spd))mslSpeed=spd;
if(double.TryParse(parts[9],out fuel))mslFuelPct=fuel;
mslGSt=parts[10];
}
fDist[fIdx%16]=(float)mslDTT;
fAlt[fIdx%16]=(float)mslAlt;
fSpd[fIdx%16]=(float)mslSpeed;
fIdx=(fIdx+1)%1000000;
lTlm=DT;
hasTlm=true;
if(mslPhase!=lastBBPhase){string ts=DT.ToString("HH:mm:ss");bbLog+=$"{ts}|MSL:{mslPhase}\n";lastBBPhase=mslPhase;if(bbLog.Length>2000){int nl=bbLog.IndexOf('\n',300);if(nl>0)bbLog=bbLog.Substring(nl+1);}WriteCustomData();}
if(padLsr.Count>0){
foreach(var l in padLsr){
l.Enabled=true;
l.SetTargetCoords($"GPS:MSL:{mslPos.X:F0}:{mslPos.Y:F0}:{mslPos.Z:F0}:");
if(l.Status!=MyLaserAntennaStatus.Connected)l.Connect();
}}
}}
void CheckTelemetryTimeout(){
if(cS==S.GONE&&mslLnch&&!shwOut){
bool laserLinked=false;foreach(var l in padLsr)if(l.Status==MyLaserAntennaStatus.Connected)laserLinked=true;
int sinceLastTel=(int)(DT-lTlm).TotalSeconds;
int boT=fltMd==1?30:fltMd==0?15:10,lostT=fltMd==1?120:fltMd==0?60:30;
if(sinceLastTel>boT&&!mslBO&&!laserLinked)mslBO=true;
if(laserLinked)mslBO=false;
if(hasTlm&&sinceLastTel>lostT){
fnlDTT=mslDTT;finalPhase=mslPhase;outT=DT;
if(abtS)mslOutcome="ABORTED";
else if(fnlDTT<detDist*2)mslOutcome="TARGET HIT";
else if(finalPhase=="TARGET"&&fnlDTT<500)mslOutcome="PROBABLE HIT";
else if(finalPhase=="TARGET")mslOutcome="SIGNAL LOST - TARGETING";
else mslOutcome="SIGNAL LOST";
LogState(mslOutcome);
shwOut=true;
}}
}
void AckOutcome(){
shwOut=false;mslOutcome="";mslLnch=false;hasTlm=false;mslBO=false;abtQ=false;abtS=false;cS=S.IDLE;
}
void BroadcastCommand(string cmd,object data){
string msg=$"{padID}|{cmd}|{data}";
IGC.SendBroadcastMessage(pCTag,msg);
}
void BroadcastStatus(){
if(padID==0)return;
string st=$"{padID}|STATUS|{cS}|{(mslFound?"1":"0")}|{(cS==S.ARM?"1":"0")}|{(cS==S.READY?"1":"0")}|{(printing?"1":"0")}|{tgtGPS.X:F0}|{tgtGPS.Y:F0}|{tgtGPS.Z:F0}";
IGC.SendBroadcastMessage(pStTag,st);
}
void CheckPadCommands(){
if(pCmdL==null)return;
while(pCmdL.HasPendingMessage){
var msg=pCmdL.AcceptMessage();
if(msg.Data is string){
var parts=((string)msg.Data).Split('|');
if(parts.Length>=2){
int fromPad;if(!int.TryParse(parts[0],out fromPad))continue;
if(fromPad==padID)continue;
string cmd=parts[1];
if(!isCtl){
if(cmd=="TGT"&&parts.Length>=3){var coords=parts[2].Split(',');if(coords.Length==3){double x,y,z;if(double.TryParse(coords[0],out x)&&double.TryParse(coords[1],out y)&&double.TryParse(coords[2],out z)){tgtGPS=new Vector3D(x,y,z);tgtSet=true;tgtName="CTRL TGT";}}}
else if(cmd=="BUILD"&&!mslFound&&!printing)StartPrint();
else if(cmd=="ARM"&&cS==S.READY&&mslFound)ArmMissile();
else if(cmd=="LAUNCH"){if(cS==S.READY&&mslFound)ArmMissile();else if(cS==S.ARM){int el=(int)(DT-armTime).TotalSeconds;if(cntDn==0||el>=cntDn)StartLaunch();}}
else if(cmd=="ABORT"&&cS==S.GONE){if(mslBO){abtQ=true;}else{RemoteDetonate();abtS=true;abtT=DT;}}
else if(cmd=="SATLAUNCH"){
int targetPad;if(parts.Length>=3&&int.TryParse(parts[2],out targetPad)&&targetPad==padID){
tM=T.SATELLITE;tgtSet=true;tgtName="SATELLITE";
if(cS==S.READY&&mslFound)ArmMissile();
else if(cS==S.ARM){int el=(int)(DT-armTime).TotalSeconds;if(cntDn==0||el>=cntDn)StartLaunch();}
else if(!mslFound&&!printing)StartPrint();
}}
}}}}}
void UpdateSalvo(){
if(!isCtl||!svAct)return;
int elapsed=(int)(DT-lastSalvo).TotalSeconds;
if(elapsed>=svInt&&salvoIdx<kPads.Count){
int targetPad=kPads[salvoIdx];
string msg=$"{padID}|LAUNCH|{targetPad}";
IGC.SendBroadcastMessage(pCTag,msg);
salvoIdx++;lastSalvo=DT;
if(salvoIdx>=kPads.Count)svAct=false;
}}
void StartCarpetBomb(){
var readyPads=new List<int>();
foreach(int pid in kPads){if(pRdy.ContainsKey(pid)&&pRdy[pid])readyPads.Add(pid);}
if(readyPads.Count==0)return;
int n=readyPads.Count;
Vector3D center=tgtGPS;
Vector3D toTgt=VN(tgtGPS-Me.GetPosition());
Vector3D right=Vector3D.Cross(toTgt,Vector3D.Up);
if(right.Length()<0.1)right=Vector3D.Cross(toTgt,Vector3D.Forward);
right=VN(right);
Vector3D fwd=Vector3D.Cross(right,toTgt);
for(int i=0;i<n;i++){
Vector3D offset=Vector3D.Zero;
if(cPat==0){
double spread=(i-(n-1)/2.0)*cSpd;
offset=right*spread;
}else if(cPat==1){
int cols=(int)Math.Ceiling(Math.Sqrt(n));
int row=i/cols;int col=i%cols;
offset=right*(col-(cols-1)/2.0)*cSpd+fwd*(row-(n/cols-1)/2.0)*cSpd;
}else{
double angle=i*2*Math.PI/n;
offset=new Vector3D(Math.Cos(angle),0,Math.Sin(angle))*cSpd;
}
Vector3D tgt=center+offset;
string msg=$"{padID}|TGT|{tgt.X:F0},{tgt.Y:F0},{tgt.Z:F0}|{readyPads[i]}";
IGC.SendBroadcastMessage(pCTag,msg);
}
BroadcastCommand("ARM","");
svAct=true;salvoIdx=0;lastSalvo=DT;
}
void UpdateAutoAttack(){
if(!isCtl||!aAtk)return;
foreach(var s in padSen){
var det=new List<MyDetectedEntityInfo>();
s.DetectedEntities(det);
foreach(var e in det){
if(e.Relationship==MyRelationsBetweenPlayerAndBlock.Enemies||e.Relationship==MyRelationsBetweenPlayerAndBlock.Neutral){
bool exists=false;
foreach(var t in dTgt){if(VD(t,e.Position)<100)exists=true;}
if(!exists&&dTgt.Count<50)dTgt.Add(e.Position);
}}}
while(enmL!=null&&enmL.HasPendingMessage){
var msg=enmL.AcceptMessage();
Vector3D pos=Vector3D.Zero;
if(msg.Data is Vector3D)pos=(Vector3D)msg.Data;
else if(msg.Data is string){var p=((string)msg.Data).Split(',');if(p.Length>=3){double x,y,z;if(double.TryParse(p[0],out x)&&double.TryParse(p[1],out y)&&double.TryParse(p[2],out z))pos=new Vector3D(x,y,z);}}
if(pos!=Vector3D.Zero){bool exists=false;foreach(var t in dTgt){if(VD(t,pos)<100)exists=true;}if(!exists&&dTgt.Count<50)dTgt.Add(pos);}
}
if(dTgt.Count==0){aAtk=false;return;}
var readyPads=new List<int>();
foreach(int pid in kPads){if(pRdy.ContainsKey(pid)&&pRdy[pid])readyPads.Add(pid);}
if(readyPads.Count==0)return;
int assigned=0;
for(int i=0;i<readyPads.Count&&i<dTgt.Count;i++){
Vector3D tgt=dTgt[i];
string msg=$"{padID}|TGT|{tgt.X:F0},{tgt.Y:F0},{tgt.Z:F0}|{readyPads[i]}";
IGC.SendBroadcastMessage(pCTag,msg);
assigned++;
}
for(int i=0;i<assigned;i++)dTgt.RemoveAt(0);
if(assigned>0){BroadcastCommand("ARM","");svAct=true;salvoIdx=0;lastSalvo=DT;}
}
void CheckPadStatus(){
if(!isCtl||pStL==null)return;
while(pStL.HasPendingMessage){
var msg=pStL.AcceptMessage();
if(msg.Data is string){
var parts=((string)msg.Data).Split('|');
if(parts.Length>=7&&parts[1]=="STATUS"){
int pid;if(!int.TryParse(parts[0],out pid))continue;
if(pid==padID)continue;
if(!kPads.Contains(pid)){if(kPads.Count>=20){int old=kPads[0];kPads.RemoveAt(0);pStat.Remove(old);pMslF.Remove(old);pArm.Remove(old);pRdy.Remove(old);pPrt.Remove(old);pTgts.Remove(old);}kPads.Add(pid);}
pStat[pid]=parts[2];
pMslF[pid]=parts[3]=="1";
pArm[pid]=parts[4]=="1";
pRdy[pid]=parts[5]=="1";
pPrt[pid]=parts[6]=="1";
if(parts.Length>=9){double x,y,z;if(double.TryParse(parts[7],out x)&&double.TryParse(parts[8],out y)&&parts.Length>=10&&double.TryParse(parts[9],out z))pTgts[pid]=new Vector3D(x,y,z);}
}}}}
void CheckSatStatus(){
if(sStL==null)return;
while(sStL.HasPendingMessage){
var msg=sStL.AcceptMessage();
if(msg.Data is string){
var parts=((string)msg.Data).Split('|');
if(parts.Length>=6&&parts[0]=="SAT"){
int sid;if(!int.TryParse(parts[1],out sid))continue;
if(!kSats.Contains(sid))kSats.Add(sid);
if(lostSats.Contains(sid))lostSats.Remove(sid);
var coords=parts[2].Split(',');
if(coords.Length==3){double x,y,z;if(double.TryParse(coords[0],out x)&&double.TryParse(coords[1],out y)&&double.TryParse(coords[2],out z))sPos[sid]=new Vector3D(x,y,z);}
int bat,h2;if(int.TryParse(parts[3],out bat))sBat[sid]=bat;
if(int.TryParse(parts[4],out h2))satH2[sid]=h2;
satStatus[sid]=parts[5];
sLSn[sid]=DT;
}}}}
void ManageSatNetwork(){
if(!isCtl)return;
int elapsed=(int)(DT-lSatC).TotalSeconds;
if(elapsed<10)return;
lSatC=DT;
foreach(int sid in kSats.ToArray()){
if(!sLSn.ContainsKey(sid))continue;
int since=(int)(DT-sLSn[sid]).TotalSeconds;
if(since>sTout&&!lostSats.Contains(sid)){
lostSats.Add(sid);kSats.Remove(sid);
sPos.Remove(sid);sBat.Remove(sid);satH2.Remove(sid);satStatus.Remove(sid);
}}
int activeSats=kSats.Count;
int needed=tSC-activeSats-sRQ;
if(aRS&&needed>0){
foreach(int pid in kPads){
if(needed<=0)break;
if(!pStat.ContainsKey(pid))continue;
if(pStat[pid]=="IDLE"||pStat[pid]=="READY"){
BroadcastCommand("SATLAUNCH",$"{pid}");
sRQ++;needed--;
}}}}
void CheckBeacons(){
if(bcnL==null)return;
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
}
CorrelateDockedMiners();
CleanStaleMiners();}
void CorrelateDockedMiners(){foreach(var kv in trkM)kv.Value.docked=false;int pn=0;var aC=new List<IMyShipConnector>();GridTerminalSystem.GetBlocksOfType(aC,b=>b.CubeGrid==Me.CubeGrid&&b.Status==MyShipConnectorStatus.Connected);foreach(var cn in aC){pn++;var ot=cn.OtherConnector;if(ot==null||ot.CubeGrid==Me.CubeGrid)continue;long gid=ot.CubeGrid.EntityId;if(trkM.ContainsKey(gid)){var x=trkM[gid];x.portNum=pn;x.docked=true;x.lastSeen=DT;}else{var m=new MinerData();m.name=$"P{pn}";m.portNum=pn;m.docked=true;m.lastSeen=DT;var bt=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(bt,b=>b.CubeGrid==ot.CubeGrid);if(bt.Count>0){float c=0,mx=0;foreach(var b in bt){c+=b.CurrentStoredPower;mx+=b.MaxStoredPower;}m.bat=mx>0?(c/mx)*100:0;}var cg=new List<IMyCargoContainer>();GridTerminalSystem.GetBlocksOfType(cg,b=>b.CubeGrid==ot.CubeGrid);if(cg.Count>0){float c=0,mx=0;foreach(var g in cg){var iv=g.GetInventory();if(iv!=null){c+=(float)iv.CurrentVolume;mx+=(float)iv.MaxVolume;}}m.crg=mx>0?(c/mx)*100:0;}var hs=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(hs,b=>b.CubeGrid==ot.CubeGrid&&b.BlockDefinition.SubtypeId.Contains("Hydrogen"));if(hs.Count>0){float t=0;foreach(var h in hs)t+=(float)h.FilledRatio;m.h2=(t/hs.Count)*100;}var dl=new List<IMyShipDrill>();GridTerminalSystem.GetBlocksOfType(dl,b=>b.CubeGrid==ot.CubeGrid);m.drills=dl.Count;var gl=new List<IMyShipGrinder>();GridTerminalSystem.GetBlocksOfType(gl,b=>b.CubeGrid==ot.CubeGrid);m.grinders=gl.Count;m.status="DOCKED";trkM[gid]=m;}}}
void CleanStaleMiners(){
var stale=new List<long>();
foreach(var kv in trkM){if((DT-kv.Value.lastSeen).TotalSeconds>120&&!kv.Value.docked)stale.Add(kv.Key);}
foreach(var id in stale)trkM.Remove(id);}

void HandleArg(string a){
lMnuT=DT;
switch(a.ToUpper()){
case"UP":if(viewLCD>0)lcdScroll[viewLCD]=Math.Max(0,lcdScroll[viewLCD]-1);else if(isCtl)ctrlSel=Math.Max(0,ctrlSel-1);else sel=Math.Max(0,sel-1);break;
case"DOWN":
if(viewLCD>0){lcdScroll[viewLCD]++;break;}
if(isCtl){ctrlSel=Math.Min(11,ctrlSel+1);break;}
int maxSel=cM==M.MAIN?5:cM==M.TGT?2:cM==M.SET?30:cM==M.WIZARD?3:cM==M.VIEW?7:0;
sel=Math.Min(maxSel,sel+1);break;
case"APPLY":if(shwOut){AckOutcome();return;}if(viewLCD>0){viewLCD=0;cM=M.VIEW;sel=0;return;}if(isCtl&&cM==M.MAIN){DoControllerApply();return;}DoApply();break;
case"LAUNCH":
if(cS==S.READY){ArmMissile();}
else if(cS==S.ARM){int el=(int)(DT-armTime).TotalSeconds;if(cntDn==0||el>=cntDn)StartLaunch();}
else if(cS==S.GONE)RemoteDetonate();
break;
case"ARM":if(cS==S.READY)ArmMissile();break;
case"DISARM":DisarmMissile();break;
case"REFUEL":if(cS==S.IDLE)cS=S.FUEL;break;
case"MENU":cM=(M)(((int)cM+1)%5);sel=0;break;
case"SETUP":cM=M.WIZARD;sel=0;break;
case"RESCAN":DetectEnvironment();Scan();break;
case"PRINT":StartPrint();break;
case"CREATIVE":isCreative=!isCreative;break;
case"NAMEPAD":NamePadParts();break;
case"NAMEMSL":if(mslFound){NameMissileParts();AutoNameConnectors();}break;
case"SETUPMOD":SetupModule();break;
case"SETUPFORCE":SetupModule(true);break;
case"RESET#":bldNum=0;break;
case"STOP":StopPrint();break;
case"RESET":cS=S.IDLE;mslLnch=false;hasTlm=false;abtQ=false;abtS=false;shwOut=false;mslOutcome="";printing=false;prtState=0;prtStopped=true;bldCmp=true;mergePaused=false;if(padMerge!=null)padMerge.Enabled=true;foreach(var w in prtWeld)w.Enabled=false;break;
case"ACK":case"OK":case"CLEAR":if(shwOut)AckOutcome();break;
case"CLAIM":if(padID==0){padID=GetNextPadID();UpdatePadTag();}break;
case"SETPADCONTROL":isCtl=!isCtl;if(isCtl)ctrlSel=0;break;
case"COPYTGT":if(isCtl)BroadcastCommand("TGT",tgtGPS);break;
case"BUILDALL":if(isCtl)BroadcastCommand("BUILD","");break;
case"ARMALL":if(isCtl)BroadcastCommand("ARM","");break;
case"LAUNCHALL":if(isCtl)BroadcastCommand("LAUNCH","");break;
case"ABORTALL":if(isCtl)BroadcastCommand("ABORT","");break;
case"STARTSALVO":if(isCtl){svAct=true;salvoIdx=0;lastSalvo=DT;}break;
case"STOPSALVO":if(isCtl)svAct=false;break;
case"CARPET":if(isCtl)StartCarpetBomb();break;
case"AUTOATTACK":if(isCtl){aAtk=!aAtk;if(aAtk)dTgt.Clear();}break;
case"KILLALL":if(isCtl){aAtk=true;dTgt.Clear();}break;
case"BBRESET":bbLog="";WriteCustomData();break;
}
if(a.ToUpper().StartsWith("GPS:")){var p=a.Substring(4).Split(',');if(p.Length==3){double x,y,z;if(double.TryParse(p[0],out x)&&double.TryParse(p[1],out y)&&double.TryParse(p[2],out z)){tgtGPS=new Vector3D(x,y,z);tgtSet=true;tgtName="MANUAL GPS";}}}
}

void Scan(){
var blks=new List<IMyTerminalBlock>();
GridTerminalSystem.GetBlocksOfType(blks,b=>b.CustomName.Contains(padTag));
padMerge=null;padCon=null;padCon1=null;padCon2=null;lcd1=null;lcd2=null;lcd3=null;lcd4=null;lcd5=null;lcd6=null;lcd7=null;lcd8=null;lcd9=null;lcd10=null;btn=null;
foreach(var b in blks){
if(b is IMyShipMergeBlock&&padMerge==null)padMerge=b as IMyShipMergeBlock;
}
if(padMerge==null){
var allMerge=new List<IMyShipMergeBlock>();
GridTerminalSystem.GetBlocksOfType(allMerge);
double closest=50;
foreach(var m in allMerge){if(m.CustomName.Contains("[PAD")){double d=VD(m.GetPosition(),Me.GetPosition());if(d<closest){padMerge=m;closest=d;}}}
}
foreach(var b in blks){
if(b is IMyShipConnector){var cn=b as IMyShipConnector;string u=b.CustomName.ToUpper();if(u.Contains("-CON1")&&padCon1==null)padCon1=cn;else if(u.Contains("-CON2")&&padCon2==null)padCon2=cn;else if(padCon==null&&!u.Contains("ORE")&&!u.Contains("-CON"))padCon=cn;}
if(b is IMyTextPanel){
var p=b as IMyTextPanel;string pn=p.CustomName;
if(LCDMatch(pn,10)&&lcd10==null)lcd10=p;
else if(LCDMatch(pn,1)&&lcd1==null)lcd1=p;
else if(LCDMatch(pn,2)&&lcd2==null)lcd2=p;
else if(LCDMatch(pn,3)&&lcd3==null)lcd3=p;
else if(LCDMatch(pn,4)&&lcd4==null)lcd4=p;
else if(LCDMatch(pn,5)&&lcd5==null)lcd5=p;
else if(LCDMatch(pn,6)&&lcd6==null)lcd6=p;
else if(LCDMatch(pn,7)&&lcd7==null)lcd7=p;
else if(LCDMatch(pn,8)&&lcd8==null)lcd8=p;
else if(LCDMatch(pn,9)&&lcd9==null)lcd9=p;
}
if(b is IMyButtonPanel&&b.CustomName.ToLower().Contains("control")&&btn==null)btn=b as IMyButtonPanel;
}
if(btn==null){var allBtn=new List<IMyButtonPanel>();GridTerminalSystem.GetBlocksOfType(allBtn);foreach(var bp in allBtn)if(bp.CustomName.ToLower().Contains("control")&&btn==null)btn=bp;}
bbLCDs.Clear();
var allPanels=new List<IMyTextPanel>();
GridTerminalSystem.GetBlocksOfType(allPanels,p=>p.CustomName.ToUpper().Contains("[BLACKBOX]"));
foreach(var p in allPanels)bbLCDs.Add(p);
ScanPrinter();
ScanPad();
ScanMissile();
ParseCustomGPS();
wpts.Clear();
if(mslRC!=null)mslRC.GetWaypointInfo(wpts);
foreach(var wp in customWP)wpts.Add(wp);
foreach(var l in mslLsr){padLsr.Remove(l);}
foreach(var a in mslAnt){padAnt.Remove(a);}
}

void ScanPad(){
padBat.Clear();padH2.Clear();padO2.Clear();padCargo.Clear();padCargoL.Clear();padCargoM.Clear();padCargoS.Clear();padRef.Clear();padAsm.Clear();padAnt.Clear();padLsr.Clear();padReact.Clear();padSolar.Clear();padGyr.Clear();padThr.Clear();padGen.Clear();padCam.Clear();padSen.Clear();oreC.Clear();padWind.Clear();padMedCount=0;padSurvCount=0;padCryoCount=0;
var blks=new List<IMyTerminalBlock>();
GridTerminalSystem.GetBlocksOfType(blks,b=>b.CubeGrid==Me.CubeGrid);
Vector3D padPos=padMerge!=null?padMerge.GetPosition():Me.GetPosition();
Vector3D mslPos=padPos;
bool isMerged=padMerge!=null&&padMerge.IsConnected;
if(isMerged){var allMrg=new List<IMyShipMergeBlock>();GridTerminalSystem.GetBlocksOfType(allMrg);foreach(var m in allMrg){if(m!=padMerge&&m.IsConnected&&VD(m.GetPosition(),padPos)<3)mslPos=m.GetPosition()+m.WorldMatrix.Forward*5;}}
foreach(var b in blks){
if(isMerged&&b!=padMerge&&b!=padCon&&b!=Me){double dPad=VD(b.GetPosition(),padPos);double dMsl=VD(b.GetPosition(),mslPos);if(dMsl<dPad)continue;}
if(b is IMyBatteryBlock)padBat.Add(b as IMyBatteryBlock);
if(b is IMyGasTank){var t=b as IMyGasTank;if(t.BlockDefinition.SubtypeId.Contains("Hydrogen"))padH2.Add(t);else padO2.Add(t);}
if(b is IMyRefinery)padRef.Add(b as IMyRefinery);
if(b is IMyAssembler)padAsm.Add(b as IMyAssembler);
if(b is IMyRadioAntenna)padAnt.Add(b as IMyRadioAntenna);
if(b is IMyLaserAntenna)padLsr.Add(b as IMyLaserAntenna);
if(b is IMyReactor)padReact.Add(b as IMyReactor);
if(b is IMySolarPanel)padSolar.Add(b as IMySolarPanel);
if(b is IMyGyro)padGyr.Add(b as IMyGyro);
if(b is IMyThrust)padThr.Add(b as IMyThrust);
if(b is IMyGasGenerator)padGen.Add(b as IMyGasGenerator);
if(b is IMyCameraBlock)padCam.Add(b as IMyCameraBlock);
if(b is IMySensorBlock)padSen.Add(b as IMySensorBlock);
if(b is IMyShipConnector&&b.CustomName.ToUpper().Contains("ORE"))oreC.Add(b as IMyShipConnector);
if(b is IMyPowerProducer){var pp=b as IMyPowerProducer;if(pp.BlockDefinition.SubtypeId.Contains("Wind"))padWind.Add(pp);}
if(b is IMyMedicalRoom){string st=b.BlockDefinition.SubtypeId;if(st.Contains("Survival")||st.Contains("Kit"))padSurvCount++;else padMedCount++;}
if(b is IMyCockpit&&b.BlockDefinition.SubtypeId.Contains("Cryo"))padCryoCount++;
}
var allBlk=new List<IMyTerminalBlock>();GridTerminalSystem.GetBlocksOfType(allBlk);
foreach(var x in allBlk){if(IsMslBlock(x))continue;if(x is IMyBatteryBlock){var bb=x as IMyBatteryBlock;if(!padBat.Contains(bb))padBat.Add(bb);}else if(x is IMySolarPanel){var sp=x as IMySolarPanel;if(!padSolar.Contains(sp))padSolar.Add(sp);}else if(x is IMyReactor){var rr=x as IMyReactor;if(!padReact.Contains(rr))padReact.Add(rr);}else if(x is IMyGasGenerator){var gg=x as IMyGasGenerator;if(!padGen.Contains(gg))padGen.Add(gg);}else if(x is IMyGasTank){var tt=x as IMyGasTank;if(tt.BlockDefinition.SubtypeId.Contains("Hydrogen")){if(!padH2.Contains(tt))padH2.Add(tt);}else{if(!padO2.Contains(tt))padO2.Add(tt);}}else if(x is IMyCargoContainer&&x.CubeGrid==Me.CubeGrid){var cc=x as IMyCargoContainer;if(!padCargo.Contains(cc)){padCargo.Add(cc);string st=cc.BlockDefinition.SubtypeId;if(st.Contains("LargeContainer"))padCargoL.Add(cc);else if(st.Contains("MediumContainer"))padCargoM.Add(cc);else padCargoS.Add(cc);}}else if(x is IMyRefinery){var rf=x as IMyRefinery;if(!padRef.Contains(rf))padRef.Add(rf);}else if(x is IMyAssembler){var am=x as IMyAssembler;if(!padAsm.Contains(am))padAsm.Add(am);}else if(x is IMyPowerProducer){var pp=x as IMyPowerProducer;if(pp.BlockDefinition.SubtypeId.Contains("Wind")&&!padWind.Contains(pp))padWind.Add(pp);}}
toolCargo=oreCargo=ingotCargo=compCargo=ammoCargo=bottleCargo=null;string mt=$"[pad{padID}".ToLower();
padCargo.Sort((a,b)=>{string sa=a.BlockDefinition.SubtypeId,sb=b.BlockDefinition.SubtypeId;int la=sa.Contains("Large")?0:sa.Contains("Medium")?1:2,lb=sb.Contains("Large")?0:sb.Contains("Medium")?1:2;return la-lb;});
foreach(var c in padCargo){string n=c.CustomName.ToLower().Replace(" ","");bool my=padID==0||n.Contains(mt),ot=false;for(int p=1;p<=8;p++)if(p!=padID&&n.Contains($"[pad{p}"))ot=true;if(ot)continue;if(n.Contains("-ore")&&my&&oreCargo==null)oreCargo=c;else if(n.Contains("-ingot")&&my&&ingotCargo==null)ingotCargo=c;else if(n.Contains("-comp")&&my&&compCargo==null)compCargo=c;else if(n.Contains("-tools")&&my&&toolCargo==null)toolCargo=c;else if(n.Contains("-ammo")&&my&&ammoCargo==null)ammoCargo=c;else if(n.Contains("-bottle")&&my&&bottleCargo==null)bottleCargo=c;}
if(padBat.Count>0){float c=0,m=0;foreach(var b in padBat){c+=b.CurrentStoredPower;m+=b.MaxStoredPower;}padBatPct=m>0?(c/m)*100:0;}else padBatPct=0;
if(padH2.Count>0){float t=0;foreach(var h in padH2)t+=(float)h.FilledRatio;padH2Pct=(t/padH2.Count)*100;}else padH2Pct=0;
if(padO2.Count>0){float t=0;foreach(var o in padO2)t+=(float)o.FilledRatio;padO2Pct=(t/padO2.Count)*100;}else padO2Pct=0;
if(padCargo.Count>0){float c=0,m=0;foreach(var g in padCargo){var i=g.GetInventory();if(i!=null){c+=(float)i.CurrentVolume;m+=(float)i.MaxVolume;}}padCargoPct=m>0?(c/m)*100:0;}else padCargoPct=0;
padPowerOut=0;padPowerMax=0;
foreach(var s in padSolar){padPowerOut+=GetPwr(s);padPowerMax+=s.MaxOutput;}
foreach(var r in padReact){padPowerOut+=GetPwr(r);padPowerMax+=r.MaxOutput;}
foreach(var w in padWind){padPowerOut+=GetPwr(w);padPowerMax+=w.MaxOutput;}
pUrnC=0;foreach(var r in padReact){var inv=r.GetInventory();if(inv!=null)foreach(var it in GL(inv))if(it.Type.SubtypeId=="Uranium")pUrnC+=(int)it.Amount;}
pIceC=0;if(oStk.ContainsKey("Ice"))pIceC=oStk["Ice"];foreach(var g in padGen){if(g.CubeGrid!=Me.CubeGrid)continue;var inv=g.GetInventory();if(inv!=null)foreach(var it in GL(inv))if(it.Type.SubtypeId=="Ice")pIceC+=(int)it.Amount;}
prtBuildable=prtProj!=null?prtProj.BuildableBlocksCount:0;
prtMissing=prtProj!=null?(prtProj.RemainingBlocks-prtProj.BuildableBlocksCount):0;
cStk.Clear();cNd.Clear();
foreach(var c in padCargo){var inv=c.GetInventory();if(inv==null)continue;foreach(var it in GL(inv)){if(it.Type.TypeId.Contains("Component"))AD(cStk,it.Type.SubtypeId,(int)it.Amount);}}
cNd["SteelPlate"]=6000;cNd["Construction"]=3500;cNd["SmallTube"]=3200;cNd["LargeTube"]=1500;cNd["Motor"]=1200;cNd["Computer"]=1500;cNd["MetalGrid"]=950;cNd["Display"]=600;cNd["BulletproofGlass"]=2050;cNd["PowerCell"]=800;cNd["Thrust"]=1050;cNd["Explosives"]=2600;cNd["Detector"]=1500;cNd["RadioCommunication"]=900;cNd["GravityGenerator"]=600;cNd["InteriorPlate"]=3000;cNd["Girder"]=500;cNd["Medical"]=200;cNd["Reactor"]=300;cNd["SolarCell"]=500;cNd["Superconductor"]=300;
cMis.Clear();
foreach(var kv in cNd){int have=0;if(cStk.ContainsKey(kv.Key))have=cStk[kv.Key];if(have<kv.Value)cMis[kv.Key]=kv.Value-have;}
ammoStock=0;ammoQueued=0;
foreach(var c in padCargo){var inv=c.GetInventory();if(inv!=null)ammoStock+=(int)inv.GetItemAmount(ammoType);}
foreach(var a in padAsm){var inv=a.GetInventory(1);if(inv!=null)ammoStock+=(int)inv.GetItemAmount(ammoType);var q=new List<MyProductionItem>();a.GetQueue(q);foreach(var i in q)if(i.BlueprintId==ammoBP)ammoQueued+=(int)i.Amount;}
cQd.Clear();
foreach(var a in padAsm){var q=new List<MyProductionItem>();a.GetQueue(q);foreach(var i in q){foreach(var bp in compBP){if(i.BlueprintId==bp.Value)AD(cQd,bp.Key,(int)i.Amount);}}}
}
void ScanPrinter(){
prtPist.Clear();prtPistV.Clear();prtPistH.Clear();prtWeld.Clear();prtProj=null;
string prtTag=padID>0?$"[PAD{padID}-PRINT]":"[PRINT]";
var allBlks=new List<IMyTerminalBlock>();
GridTerminalSystem.GetBlocksOfType(allBlks,b=>b.CustomName.Contains(prtTag)||(padID==0&&b.CustomName.Contains("[PRINT]")));
foreach(var b in allBlks){
if(b is IMyPistonBase){var p=b as IMyPistonBase;prtPist.Add(p);string nm=b.CustomName.ToUpper();if(nm.Contains("VERT"))prtPistV.Add(p);else if(nm.Contains("HORIZ"))prtPistH.Add(p);}
if(b is IMyShipWelder)prtWeld.Add(b as IMyShipWelder);
if(b is IMyProjector&&prtProj==null)prtProj=b as IMyProjector;
}
if(!printing){
bool mslDocked=padMerge!=null&&padMerge.IsConnected;
if(mslDocked){foreach(var w in prtWeld)w.Enabled=false;prtStopped=false;return;}
if(prtStopped){
foreach(var w in prtWeld)w.Enabled=false;
bool allRetracted=true;
foreach(var p in prtPist){if(p.CurrentPosition>0.05f)allRetracted=false;}
if(allRetracted){foreach(var p in prtPist)p.Velocity=0;prtStopped=false;}
return;}
bool hasRemaining=prtProj!=null&&prtProj.RemainingBlocks>0;
bool hasVH=prtPistV.Count>0&&prtPistH.Count>0;
if(hasVH){
foreach(var w in prtWeld)w.Enabled=false;
return;}
bool pistonsExtended=false;
foreach(var p in prtPist){if(p.CurrentPosition>0.1f)pistonsExtended=true;}
if(hasRemaining&&pistonsExtended){
printing=true;prtState=2;cS=S.PRINT;
foreach(var w in prtWeld)w.Enabled=true;
foreach(var p in prtPist)p.Velocity=-prtSpeed;
if(prtProj!=null)prtProj.Enabled=true;
if(padMerge!=null)padMerge.Enabled=true;
}else{
foreach(var w in prtWeld)w.Enabled=false;
bool needsReset=false;
foreach(var p in prtPist){if(p.CurrentPosition>0.1f||p.Velocity!=0)needsReset=true;}
if(needsReset){foreach(var p in prtPist){p.Velocity=-1f;}}
else{foreach(var p in prtPist)p.Velocity=0;}
}}
}

void ScanMissile(){
mslMerge=null;mslConFuel=null;mslConAmmo=null;mslRC=null;mslPB=null;
mslBat.Clear();mslH2.Clear();mslO2.Clear();mslWar.Clear();mslThr.Clear();mslGen.Clear();mslReact.Clear();mslGyr.Clear();mslSen.Clear();mslCam.Clear();mslAnt.Clear();mslLsr.Clear();mslCock.Clear();mslLights.Clear();
mslFound=false;batPct=0;h2Pct=0;o2Pct=0;warArmed=false;
merged=padMerge!=null&&padMerge.IsConnected;
conLocked=IsLk(padCon);
if(!merged||padMerge==null){mslFound=false;return;}
var allMerge=new List<IMyShipMergeBlock>();
GridTerminalSystem.GetBlocksOfType(allMerge,b=>b.IsConnected&&b!=padMerge);
if(allMerge.Count==0){mslFound=false;return;}
mslMerge=allMerge[0];
var allBlks=new List<IMyTerminalBlock>();
var mslCons=new List<IMyShipConnector>();
GridTerminalSystem.GetBlocksOfType(allBlks);
Vector3D padPos=padMerge.GetPosition();
Vector3D mslMergePos=mslMerge.GetPosition();
Vector3D mslDir=VN(mslMergePos-padPos);
foreach(var b in allBlks){
string bn=b.CustomName;
if(bn.Contains("-PRINT"))continue;
bool isPadInfra=(bn.Contains(padTag)||bn.Contains("[PAD"))&&!bn.Contains("Missile");
if(isPadInfra)continue;
if(b==padMerge||b==padCon||b==Me)continue;
if(b.CubeGrid==Me.CubeGrid||b.CubeGrid==padMerge.CubeGrid)continue;
Vector3D toBlock=b.GetPosition()-padPos;
double dot=Vector3D.Dot(toBlock,mslDir);
if(dot<0)continue;
mslFound=true;
if(b is IMyShipConnector){var cn=b as IMyShipConnector;if(cn.CustomName.Contains("[DOCK]"))mslConFuel=cn;else if(cn.CustomName.Contains("[AMMO]"))mslConAmmo=cn;else mslCons.Add(cn);}
if(b is IMyRemoteControl&&mslRC==null)mslRC=b as IMyRemoteControl;
if(b is IMyBatteryBlock)mslBat.Add(b as IMyBatteryBlock);
if(b is IMyGasTank){var t=b as IMyGasTank;if(t.BlockDefinition.SubtypeId.Contains("Hydrogen"))mslH2.Add(t);else mslO2.Add(t);}
if(b is IMyWarhead)mslWar.Add(b as IMyWarhead);
if(b is IMyThrust)mslThr.Add(b as IMyThrust);
if(b is IMyGasGenerator)mslGen.Add(b as IMyGasGenerator);
if(b is IMyReactor)mslReact.Add(b as IMyReactor);
if(b is IMyGyro)mslGyr.Add(b as IMyGyro);
if(b is IMySensorBlock)mslSen.Add(b as IMySensorBlock);
if(b is IMyCameraBlock)mslCam.Add(b as IMyCameraBlock);
if(b is IMyRadioAntenna)mslAnt.Add(b as IMyRadioAntenna);
if(b is IMyLaserAntenna)mslLsr.Add(b as IMyLaserAntenna);
if(b is IMyCockpit)mslCock.Add(b as IMyCockpit);
if(b is IMyLightingBlock)mslLights.Add(b as IMyLightingBlock);
if(b is IMyProgrammableBlock&&b!=Me&&mslPB==null){string pbn=b.CustomName;if(!pbn.Contains("[PAD")||pbn.Contains("Missile"))mslPB=b as IMyProgrammableBlock;}
}
if(mslCons.Count>0&&padCon!=null){
Vector3D padConPos=padCon.GetPosition();
IMyShipConnector closest=null;
double minDist=double.MaxValue;
foreach(var c in mslCons){
double d=VD(c.GetPosition(),padConPos);
if(d<minDist){minDist=d;closest=c;}
}
if(closest!=null&&mslConFuel==null)mslConFuel=closest;
foreach(var c in mslCons){if(c!=mslConFuel&&mslConAmmo==null)mslConAmmo=c;}
}
if(mslBat.Count>0){float c=0,m=0;foreach(var b in mslBat){c+=b.CurrentStoredPower;m+=b.MaxStoredPower;}batPct=m>0?(c/m)*100:0;}
if(mslH2.Count>0){float t=0;foreach(var h in mslH2)t+=(float)h.FilledRatio;h2Pct=(t/mslH2.Count)*100;}
o2Pct=0;if(mslO2.Count>0){float t=0;foreach(var o in mslO2)t+=(float)o.FilledRatio;o2Pct=(t/mslO2.Count)*100;}
icePct=0;
if(mslGen.Count>0){float tIce=0,mIce=0;foreach(var g in mslGen){var inv=g.GetInventory();if(inv!=null){tIce+=(float)inv.CurrentVolume;mIce+=(float)inv.MaxVolume;}}icePct=mIce>0?(tIce/mIce)*100:0;}
ammoPct=0;
if(mslConAmmo!=null){var ammoInv=mslConAmmo.GetInventory();if(ammoInv!=null){float cur=(float)ammoInv.CurrentVolume;float max=(float)ammoInv.MaxVolume;ammoPct=max>0?(cur/max)*100:0;}}
if(mslWar.Count>0){warArmed=true;foreach(var w in mslWar)if(!w.IsArmed){warArmed=false;break;}}
thrAtmo=0;thrH2=0;thrIon=0;
foreach(var t in mslThr){string sub=t.BlockDefinition.SubtypeId;if(sub.Contains("Atmospheric"))thrAtmo++;else if(sub.Contains("Hydrogen"))thrH2++;else thrIon++;}
ScanAntennas();
}

void ScanAntennas(){
detAnts.Clear();
var allAnts=new List<IMyRadioAntenna>();
GridTerminalSystem.GetBlocksOfType(allAnts,a=>a.CubeGrid!=Me.CubeGrid&&a.EnableBroadcasting&&a.IsBroadcasting);
foreach(var a in allAnts){
string nm=a.CustomName;
if(nm.Length>15)nm=nm.Substring(0,15);
if(!detAnts.Contains(nm))detAnts.Add(nm);}
}

void ParseCustomGPS(){
customWP.Clear();gpsData="";string d=Me.CustomData;if(string.IsNullOrEmpty(d))return;
var NS=System.Globalization.NumberStyles.Any;var IC=System.Globalization.CultureInfo.InvariantCulture;
foreach(var ln in d.Split('\n')){string l=ln.Trim();if(l.StartsWith("==="))break;if(!l.StartsWith("GPS:"))continue;gpsData+=l+"\n";var p=l.Split(':');if(p.Length>=5){double x,y,z;if(double.TryParse(p[2].Replace(',','.'),NS,IC,out x)&&double.TryParse(p[3].Replace(',','.'),NS,IC,out y)&&double.TryParse(p[4].Replace(',','.'),NS,IC,out z))customWP.Add(new MyWaypointInfo(p[1],new Vector3D(x,y,z)));}}}
void WriteCustomData(){ParseCustomGPS();Me.CustomData="[GPS TARGETS]\n"+gpsData+"===LOG===\n"+bbLog;}
void LogState(string evt){string ts=DT.ToString("HH:mm:ss");bbLog+=$"{ts}|PAD:{evt}\n";if(bbLog.Length>2000){int nl=bbLog.IndexOf('\n',300);if(nl>0)bbLog=bbLog.Substring(nl+1);}WriteCustomData();}
void CheckStateLog(){if(cS!=lastBBState){lastBBState=cS;string sn=cS==S.BUILD?"BUILD":cS==S.DOCK?"DOCKED":cS==S.FUEL?"FUELING":cS==S.READY?"READY":cS==S.ARM?"ARMED":cS==S.LAUNCH?"LAUNCHING":cS==S.GONE?"AWAY":"";if(sn!="")LogState(sn);}}

void UpdateState(){
if(padMerge==null||padCon==null){cS=S.INIT;return;}
if(mergePaused){if(padMerge.IsConnected){mergePaused=false;padMerge.Enabled=true;}else{cS=S.IDLE;return;}}
if(!merged&&cS!=S.GONE&&cS!=S.PRINT){if(cS==S.LAUNCH||cS==S.ARM){cS=S.GONE;sel=0;}else if(!printing)cS=S.IDLE;}
if(cS==S.GONE||cS==S.PRINT)return;
switch(cS){
case S.INIT:case S.IDLE:
if(printing){cS=S.PRINT;return;}
if(!mslFound){if(prtProj!=null)prtProj.Enabled=true;bldCmp=false;return;}
if(prtProj!=null)prtProj.Enabled=false;
if(!bldCmp){cS=S.BUILD;return;}
if(merged){if(!pNmd){bldNum++;NameMissileParts();AutoNameConnectors();pNmd=true;}cS=S.DOCK;hasTlm=false;}
break;
case S.BUILD:
if(prtProj!=null&&prtProj.RemainingBlocks>0){bldCmp=false;return;}
bool allFunctional=true;
foreach(var b in mslBat)if(!b.IsFunctional)allFunctional=false;
foreach(var t in mslThr)if(!t.IsFunctional)allFunctional=false;
foreach(var g in mslGyr)if(!g.IsFunctional)allFunctional=false;
if(allFunctional){
if(!pNmd){bldNum++;NameMissileParts();pNmd=true;}
AutoNameConnectors();
DisableMissileThrusters();
if(prtProj!=null)prtProj.Enabled=false;
bldCmp=true;cS=S.DOCK;
}
break;
case S.DOCK:
if(!mslFound){cS=S.IDLE;dockTicks=0;return;}
dockTicks++;
if(dockTicks>300){cS=S.IDLE;dockTicks=0;break;}
if(!conLocked&&padCon.Status==MyShipConnectorStatus.Connectable)padCon.Connect();
LinkMissileLasers();
if(conLocked){DisableMissileThrusters();fuelTicks=0;dockTicks=0;cS=S.FUEL;}
break;
case S.FUEL:
fuelTicks++;
if(fuelTicks>600){if(IsLk(padCon))padCon.Disconnect();cS=S.READY;break;}
if(conLocked){
Action<IMyCargoContainer>mf=pc=>{if(pc==null)return;var srcInv=pc.GetInventory();if(srcInv==null)return;
for(int i=srcInv.ItemCount-1;i>=0;i--){var item=srcInv.GetItemAt(i);if(!item.HasValue)continue;string subId=item.Value.Type.SubtypeId;
if(subId.Contains("Ice"))foreach(var gen in mslGen){var dstInv=gen.GetInventory();if(dstInv!=null)srcInv.TransferItemTo(dstInv,i,null,true,null);}
if(subId=="Uranium"&&mslReact.Count>0)foreach(var r in mslReact){var rI=r.GetInventory();if(rI!=null){int have=0;var rt=new List<MyInventoryItem>();rI.GetItems(rt);foreach(var x in rt)if(x.Type.SubtypeId=="Uranium")have+=(int)x.Amount;if(have<50)srcInv.TransferItemTo(rI,i,null,true,(MyFixedPoint)Math.Min(50-have,(int)item.Value.Amount));}}}};
mf(oreCargo);mf(ingotCargo);foreach(var pc in padCargo)mf(pc);}
if(mslConAmmo!=null&&ammoLoad>0){var aI=mslConAmmo.GetInventory();if(aI!=null){mslAmmo=(int)aI.GetItemAmount(ammoType);int nd=ammoLoad-mslAmmo;if(nd>0&&ammoStock>0){var pI=padCon.GetInventory();if(pI!=null){Action<IMyCargoContainer>pa=c=>{if(nd<=0||c==null)return;var cI=c.GetInventory();if(cI==null)return;var it=new List<MyInventoryItem>();cI.GetItems(it);for(int i=it.Count-1;i>=0&&nd>0;i--)if(it[i].Type==ammoType){int a=Math.Min((int)it[i].Amount,nd);cI.TransferItemTo(pI,it[i],(MyFixedPoint)a);nd-=a;}};pa(ammoCargo);pa(toolCargo);foreach(var c in padCargo)pa(c);var pt=new List<MyInventoryItem>();pI.GetItems(pt);for(int i=pt.Count-1;i>=0;i--)if(pt[i].Type==ammoType)pI.TransferItemTo(aI,pt[i],null);}}}}
bool batFull=batPct>=99||mslBat.Count==0;
bool h2Full=h2Pct>=99||mslH2.Count==0;
bool iceFull=icePct>=50||mslGen.Count==0;
int mslUran=0;foreach(var r in mslReact){var rI=r.GetInventory();if(rI!=null){var rt=new List<MyInventoryItem>();rI.GetItems(rt);foreach(var x in rt)if(x.Type.SubtypeId=="Uranium")mslUran+=(int)x.Amount;}}
bool uranFull=mslReact.Count==0||mslUran>=50;
mslAmmo=0;
if(mslConAmmo!=null){var aInv=mslConAmmo.GetInventory();if(aInv!=null)mslAmmo=(int)aInv.GetItemAmount(ammoType);}
bool ammoReady=ammoLoad<=0||mslConAmmo==null||mslAmmo>=ammoLoad||(ammoStock<=0&&mslAmmo>0);
LinkMissileLasers();
if(batFull&&h2Full&&iceFull&&uranFull&&ammoReady){
if(IsLk(padCon))padCon.Disconnect();
cS=S.READY;
}
break;
case S.AMMO:
if(!mslFound){cS=S.IDLE;break;}
if(mslConAmmo==null||ammoLoad<=0){cS=S.READY;break;}
mslAmmo=0;
if(mslConAmmo!=null){var aInv=mslConAmmo.GetInventory();if(aInv!=null)mslAmmo=(int)aInv.GetItemAmount(ammoType);}
if(mslAmmo>=ammoLoad||(ammoStock<=0&&mslAmmo>0)){cS=S.READY;}
break;
case S.READY:counting=false;LinkMissileLasers();break;
case S.ARM:
LinkMissileLasers();
if(counting){
int elapsed=(int)(DT-armTime).TotalSeconds;
if(cntDn==0||elapsed>=cntDn){StartLaunch();counting=false;}
}
break;
case S.LAUNCH:
lnchTk++;
if(padCon!=null){padCon.Disconnect();padCon.CollectAll=false;}
if(padMerge!=null&&padMerge.Enabled)padMerge.Enabled=false;
if(mslMerge!=null&&mslMerge.Enabled)mslMerge.Enabled=false;
if(!merged){
if(padLsr.Count>0&&mslMerge!=null){
Vector3D mslPos=mslMerge.GetPosition();
foreach(var l in padLsr){l.Enabled=true;l.SetTargetCoords($"GPS:MSL:{mslPos.X:F0}:{mslPos.Y:F0}:{mslPos.Z:F0}:");l.Connect();}}
cS=S.GONE;sel=0;}
else if(lnchTk>10){cS=S.GONE;sel=0;}
break;
}}

void ArmMissile(){
EnableMissileForLaunch();
if(mslConAmmo!=null){mslConAmmo.ThrowOut=true;mslConAmmo.CollectAll=false;}
armTime=DT;
counting=true;
cS=S.ARM;
}

void DisarmMissile(){
if(mslConAmmo!=null){mslConAmmo.ThrowOut=false;}
if(cS==S.ARM)cS=S.READY;
}

void StartLaunch(){
for(int i=0;i<16;i++){fDist[i]=0;fAlt[i]=0;fSpd[i]=0;}
fIdx=0;mslVel=0;
foreach(var a in padAnt){a.Enabled=true;a.Radius=50000f;a.EnableBroadcasting=true;}
if(padCon!=null){padCon.Disconnect();padCon.CollectAll=false;padCon.ThrowOut=false;}
if(padMerge!=null)padMerge.Enabled=false;
if(mslMerge!=null)mslMerge.Enabled=false;
lnchT=DT;
string padLaserStr="";
if(padLsr.Count>0){var lp=padLsr[0].GetPosition();padLaserStr=$"\nPadLaser={lp.X:F0},{lp.Y:F0},{lp.Z:F0}";}
if(mslPB!=null){
bool inSpace=fltMd==0?!hasGrav:fltMd==2;
string cfg=$"[UNITY_MISSILE]\nMode={tM}\nGPS={tgtGPS.X},{tgtGPS.Y},{tgtGPS.Z}\nAntenna={tgtAntenna}\nBroadcast={bcTag}\nClimb={clbDst}\nDetonate={detDist}\nSensorRange={sensorRng}\nLidarRange={lidarRng}\nLidarAngle={lidarAng}\nAntBroadcast={(antBC?"1":"0")}\nInSpace={(inSpace?"1":"0")}\nGravity={gravStr:F2}\nBurnTime={brnT}\nReentryDist={reDst}\nFlightMode={fltMd}{padLaserStr}\nMslNumber={bldNum}\nPadID={padID}\nTargetRel={tgtRel}";
mslPB.CustomData=cfg;
mslPB.TryRun("LAUNCH");
}
mslLnch=true;lnchTk=0;lastBBPhase="";
LogState($"LAUNCH>{tgtName}");
cS=S.LAUNCH;
}

void RemoteDetonate(){
foreach(var a in padAnt){a.Enabled=true;a.Radius=50000f;a.EnableBroadcasting=true;}
IGC.SendBroadcastMessage(bcTag+"_CMD","DETONATE");
}

void DisableMissileThrusters(){foreach(var t in mslThr){t.Enabled=false;t.ThrustOverridePercentage=0f;}foreach(var g in mslGyr){g.GyroOverride=false;g.Enabled=false;}foreach(var x in mslGen)x.Enabled=false;foreach(var b in mslBat)b.ChargeMode=ChargeMode.Recharge;foreach(var w in mslWar)w.IsArmed=false;foreach(var a in mslAnt)a.Enabled=false;foreach(var s in mslSen)s.Enabled=false;foreach(var c in mslCam)c.Enabled=false;}
void EnableMissileForLaunch(){foreach(var g in mslGyr){g.Enabled=true;g.GyroOverride=true;}foreach(var x in mslGen)x.Enabled=true;foreach(var b in mslBat)b.ChargeMode=ChargeMode.Discharge;foreach(var a in mslAnt){a.Enabled=true;a.Radius=50000f;a.EnableBroadcasting=true;}foreach(var s in mslSen)s.Enabled=true;foreach(var c in mslCam){c.Enabled=true;c.EnableRaycast=true;}}
bool preLaunchLaserLinked=false;
void LinkMissileLasers(){
if(padLsr.Count==0||mslLsr.Count==0){preLaunchLaserLinked=false;return;}
var pL=padLsr[0];var mL=mslLsr[0];
Vector3D pPos=pL.GetPosition();Vector3D mPos=mL.GetPosition();
pL.Enabled=true;mL.Enabled=true;
pL.SetTargetCoords($"GPS:MSL:{mPos.X:F0}:{mPos.Y:F0}:{mPos.Z:F0}:");
mL.SetTargetCoords($"GPS:PAD:{pPos.X:F0}:{pPos.Y:F0}:{pPos.Z:F0}:");
if(pL.Status!=MyLaserAntennaStatus.Connected)pL.Connect();
if(mL.Status!=MyLaserAntennaStatus.Connected)mL.Connect();
preLaunchLaserLinked=pL.Status==MyLaserAntennaStatus.Connected||mL.Status==MyLaserAntennaStatus.Connected;
if(preLaunchLaserLinked){hasTlm=true;lTlm=DT;}
}

void UpdateMissileLights(){
if(mslLights.Count==0)return;
Color c=Color.Black;float intensity=1f,falloff=1f,radius=2f;bool on=true;
double sec=(DT-DateTime.Today).TotalSeconds;
bool lowRes=ammoStock<ammoLoad||padH2Pct<50||pIceC<iceTarget;
bool configActive=(DT-lMnuT).TotalSeconds<5&&cS==S.READY;
if(cS==S.PRINT||cS==S.BUILD){c=new Color(255,165,0);on=((int)sec%2)==0;}
else if(cS==S.FUEL||cS==S.DOCK){c=new Color(0,100,255);float pulse=(float)(Math.Sin(sec*2)+1)/2;intensity=0.5f+pulse*0.5f;falloff=1f+pulse;radius=1f+pulse*2f;}
else if(configActive){c=new Color(255,255,0);float pulse=(float)(Math.Sin(sec*3)+1)/2;intensity=0.3f+pulse*0.7f;}
else if(lowRes&&cS!=S.ARM&&cS!=S.LAUNCH&&cS!=S.GONE){c=new Color(128,0,128);float pulse=(float)(Math.Sin(sec*2)+1)/2;intensity=0.3f+pulse*0.7f;}
else if(cS==S.READY){c=new Color(0,255,0);intensity=1f;}
else if(cS==S.ARM){c=new Color(255,0,0);int rate=counting&&cntDn>0&&(cntDn-(int)(DT-armTime).TotalSeconds)<5?4:2;on=((int)(sec*rate)%2)==0;}
else{c=new Color(50,50,50);intensity=0.3f;}
foreach(var l in mslLights){l.Enabled=on;l.Color=c;l.Intensity=intensity;l.Falloff=falloff;l.Radius=radius;}
}

void AutoNameConnectors(){
if(mslMerge==null||padMerge==null)return;
Vector3D mslMergePos=mslMerge.GetPosition();
Vector3D padMergePos=padMerge.GetPosition();
Vector3D mslDir=VN(mslMergePos-padMergePos);
var allCons=new List<IMyShipConnector>();
GridTerminalSystem.GetBlocksOfType(allCons);
var mslCons=new List<IMyShipConnector>();
foreach(var c in allCons){
if(c==padCon)continue;
string nm=c.CustomName;
if(nm.Contains("[PAD")||nm.ToUpper().Contains("ORE"))continue;
Vector3D toBlock=c.GetPosition()-padMergePos;
double dot=Vector3D.Dot(toBlock,mslDir);
if(dot>0)mslCons.Add(c);
}
if(mslCons.Count==0)return;
IMyShipConnector dockCon=null,ammoCon=null;
double minD=double.MaxValue,maxD=0;
Vector3D refPos=padCon!=null?padCon.GetPosition():padMergePos;
foreach(var c in mslCons){
double d=VD(c.GetPosition(),refPos);
if(d<minD){minD=d;dockCon=c;}
if(d>maxD){maxD=d;ammoCon=c;}
}
if(dockCon!=null)dockCon.CustomName=$"PAD{padID} Missile #{bldNum} Connector [DOCK]";
if(ammoCon!=null&&ammoCon!=dockCon)ammoCon.CustomName=$"PAD{padID} Missile #{bldNum} Connector [AMMO]";
}

void NameMissileParts(){string t=$"PAD{padID} Missile #{bldNum}";Action<IMyTerminalBlock>N=x=>x.CustomName=$"{t} {BT(x)}";foreach(var b in mslBat)N(b);foreach(var h in mslH2)N(h);foreach(var w in mslWar)N(w);foreach(var x in mslThr)N(x);foreach(var g in mslGen)N(g);foreach(var g in mslGyr)N(g);foreach(var s in mslSen)N(s);foreach(var c in mslCam)N(c);foreach(var a in mslAnt)N(a);foreach(var l in mslLsr)N(l);foreach(var c in mslCock)N(c);for(int i=0;i<mslLights.Count;i++)mslLights[i].CustomName=$"{t} Light {i+1}";if(mslRC!=null)N(mslRC);if(mslPB!=null)mslPB.CustomName=$"{t} Program";if(mslMerge!=null)N(mslMerge);}
string BT(IMyTerminalBlock b){string s=b.BlockDefinition.SubtypeId;if(string.IsNullOrEmpty(s)){if(b is IMyGasGenerator)return"O2/H2 Gen";if(b is IMyGasTank)return"Gas Tank";s=b.BlockDefinition.TypeIdString.Replace(OB,"");}return s.Contains("Battery")?"Battery":s.Contains("HydrogenTank")?"H2 Tank":s.Contains("OxygenTank")?"O2 Tank":s.Contains("LargeContainer")?"Large Cargo":s.Contains("MediumContainer")?"Medium Cargo":s.Contains("SmallContainer")?"Small Cargo":s.Contains("Refinery")?"Refinery":s.Contains("Assembler")?"Assembler":s.Contains("RadioAntenna")?"Antenna":s.Contains("LaserAntenna")?"Laser Ant":s.Contains("Gyro")?"Gyroscope":s.Contains("HydrogenThrust")?"H2 Thruster":s.Contains("AtmosphericThrust")?"Atmo Thruster":s.Contains("Thrust")?"Ion Thruster":s.Contains("Programmable")?"Program":s.Contains("Merge")?"Merge Block":s.Contains("Connector")?"Connector":s.Contains("Projector")?"Projector":s.Contains("Piston")?"Piston":s.Contains("Camera")?"Camera":s.Contains("Sensor")?"Sensor":s.Contains("RemoteControl")?"Remote Control":s.Contains("Warhead")?"Warhead":s.Contains("ButtonPanel")?"Button Panel":s.Contains("LCD")?"LCD Panel":s.Contains("Reactor")?"Reactor":s.Contains("Solar")?"Solar Panel":s.Contains("Wind")?"Wind Turbine":s.Contains("Medical")?"Medical Room":s.Contains("Survival")?"Survival Kit":s.Contains("Cryo")?"Cryo Chamber":s.Contains("Cockpit")?"Cockpit":s;}
bool HasSysTag(IMyTerminalBlock b){string n=b.CustomName;return n.Contains("[PAD")||n.Contains("[PRINT]")||n.Contains("[DOCK]")||n.Contains("[AMMO]");}
bool IsMslBlock(IMyTerminalBlock b){return merged&&mslMerge!=null&&b.CubeGrid==mslMerge.CubeGrid;}
string CnS(IMyShipConnector c)=>c==null?"N/A":c.Status==MyShipConnectorStatus.Connected?"LOCK":"OPEN";
void TC(IMyShipConnector c){if(c!=null){if(c.Status==MyShipConnectorStatus.Connected)c.Disconnect();else c.Connect();}}
bool IsLk(IMyShipConnector c)=>c!=null&&c.Status==MyShipConnectorStatus.Connected;
DateTime DT=>DateTime.Now;
double VD(Vector3D a,Vector3D b)=>Vector3D.Distance(a,b);
Vector3D VN(Vector3D v)=>Vector3D.Normalize(v);
void ReadInvStats(){if(btn==null)return;string d=btn.CustomData;if(string.IsNullOrEmpty(d))return;
Action<string,Action<string>>PS=(tag,act)=>{int si=d.IndexOf(tag);if(si<0)return;int ei=d.IndexOf("\n[",si+tag.Length);string sec=ei>0?d.Substring(si,ei-si):d.Substring(si);foreach(var ln in sec.Split('\n')){foreach(var it in ln.Split('|'))act(it);}};
Func<string,int>PV=s=>{int v=0;if(string.IsNullOrEmpty(s))return 0;string f=s.Split('+')[0].Split('/')[0].Split('%')[0].Split(' ').FirstOrDefault(x=>x.Length>0&&char.IsDigit(x[0]))??"";int.TryParse(f,out v);return v;};
PS("[STAT]",it=>{if(!it.Contains("="))return;var kv=it.Split('=');if(kv.Length<2)return;string k=kv[0].Trim().ToLower(),v=kv[1].Trim();if(k=="cargo"){int pi=v.IndexOf('%');if(pi>0)float.TryParse(v.Substring(0,pi),out invCargoPct);}else if(k=="cargol")int.TryParse(v,out invCargoL);else if(k=="cargom")int.TryParse(v,out invCargoM);else if(k=="cargos")int.TryParse(v,out invCargoS);invCargoT=invCargoL+invCargoM+invCargoS;});
PS("[BTL]",it=>{if(!it.Contains("="))return;var kv=it.Split('=');if(kv.Length<2)return;string k=kv[0].Trim().ToLower(),v=kv[1];var vp=v.Split('+');int stk=PV(vp[0]);int q=vp.Length>1?PV(vp[1]):0;if(k.StartsWith("h")){pH2B=stk;h2Queued=q;}else if(k.StartsWith("o")){pO2B=stk;o2Queued=q;}});
tStk.Clear();tQ.Clear();
string[] tlsMap={"Drill","Welder","Grinder","Rifle","Pistol","Launcher","Flare"};
PS("[TLS]",it=>{if(!it.Contains("="))return;var kv=it.Split('=');if(kv.Length<2)return;string tn=kv[0].Trim();int ti=-1;for(int i=0;i<tN.Length;i++)if(tN[i]==tn){ti=i;break;}if(ti<0){for(int i=0;i<tlsMap.Length;i++)if(tlsMap[i]==tn){ti=i;break;}}if(ti<0)return;var vs=kv[1].Split('/');for(int r=0;r<vs.Length&&r<tIT[ti].Length;r++){int v=PV(vs[r]);tStk[tIT[ti][r]]=v;}});
pAmmoStk.Clear();pAmmoQ.Clear();
string[] pANMap={"Rifle20","Rifle5","Rifle50","Rifle30","PistolS","PistolF","PistolE","Rocket","Flare"};
PS("[PAMMO]",it=>{if(!it.Contains("="))return;var kv=it.Split('=');if(kv.Length<2)return;string an=kv[0].Trim();int ai=-1;for(int i=0;i<pAmmoNames.Length;i++)if(pAmmoNames[i]==an){ai=i;break;}if(ai<0){for(int i=0;i<pANMap.Length;i++)if(pANMap[i]==an){ai=i;break;}}if(ai<0)return;var vs=kv[1].Split('+');int stk=PV(vs[0]);int qd=vs.Length>1?PV(vs[1]):0;pAmmoStk[pAmmoIT[ai]]=stk;pAmmoQ[pAmmoIT[ai]]=qd;});
oStk.Clear();iStk.Clear();cStk.Clear();cNd.Clear();
PS("[ORE]",it=>{if(!it.Contains("="))return;var kv=it.Split('=');if(kv.Length>=2){string k=kv[0].Trim();int v=PV(kv[1]);if(k.Length>0&&!k.StartsWith("["))oStk[k]=v;}});
PS("[ING]",it=>{if(!it.Contains("="))return;var kv=it.Split('=');if(kv.Length>=2){string k=kv[0].Trim();int v=PV(kv[1]);if(k.Length>0&&!k.StartsWith("["))iStk[k]=v;}});
PS("[CMP]",it=>{if(!it.Contains("="))return;var kv=it.Split('=');if(kv.Length>=2){string k=kv[0].Trim();if(k.Length>0&&!k.StartsWith("[")&&!k.ToLower().Contains("item")){string vp=kv[1];cStk[k]=PV(vp);int si=vp.IndexOf('/');if(si>=0&&si+1<vp.Length){int tg;if(int.TryParse(vp.Substring(si+1).Split('|')[0].Trim(),out tg))cNd[k]=tg;}}}});}
void NamePadParts(){Action<IMyTerminalBlock>N=x=>{if(!HasSysTag(x)&&!x.CustomName.StartsWith("[PAD]"))x.CustomName=$"[PAD] {BT(x)}";};foreach(var b in padBat)N(b);foreach(var t in padH2)N(t);foreach(var t in padO2)N(t);foreach(var c in padCargo)N(c);foreach(var r in padRef)N(r);foreach(var a in padAsm)N(a);foreach(var a in padAnt)N(a);foreach(var l in padLsr)N(l);foreach(var r in padReact)N(r);foreach(var s in padSolar)N(s);foreach(var g in padGyr)N(g);foreach(var t in padThr)N(t);foreach(var g in padGen)N(g);foreach(var c in padCam)N(c);foreach(var s in padSen)N(s);}

void StartPrint(){ScanPrinter();string pt=padID>0?$"[PAD{padID}-PRINT]":"[PRINT]";if(prtPist.Count==0)return;if(prtWeld.Count==0)return;if(prtProj==null)return;if(padMerge==null)return;if(padMerge.IsConnected)return;if(printing){StopPrint();return;}prtStopped=false;printing=true;prtState=0;cS=S.PRINT;bldCmp=false;pNmd=false;prtLastVPos=0;prtST=0;if(prtPistV.Count>0&&prtPistH.Count>0){prtHPos=prtHMax;foreach(var p in prtPistV){p.MinLimit=0;p.MaxLimit=prtVMax;p.Velocity=-prtVSpeed;}foreach(var p in prtPistH){p.MinLimit=0;p.MaxLimit=prtHMax;p.Velocity=prtHSpeed;}}else{prtHPos=0;foreach(var p in prtPist){p.MinLimit=0f;p.MaxLimit=5.8f;p.Velocity=-0.5f;}}foreach(var w in prtWeld)w.Enabled=false;if(prtProj!=null)prtProj.Enabled=true;if(padMerge!=null)padMerge.Enabled=true;}
void StopPrint(){printing=false;prtState=0;prtStopped=true;bldCmp=true;prtHPos=0;prtLastVPos=0;prtST=0;foreach(var p in prtPistV){p.Velocity=-prtVSpeed;p.MinLimit=0;}foreach(var p in prtPistH){p.Velocity=-prtHSpeed;p.MinLimit=0;}foreach(var p in prtPist){p.Velocity=-0.5f;p.MinLimit=0;}foreach(var w in prtWeld)w.Enabled=false;if(prtProj!=null)prtProj.Enabled=false;cS=S.IDLE;}

void UpdatePrinter(){if(!printing)return;if(prtProj==null||prtProj.RemainingBlocks==0){StopPrint();return;}if(prtPistV.Count==0||prtPistH.Count==0){UpdatePrinterLegacy();return;}Func<float>gV=()=>{float v=0;foreach(var p in prtPistV)v+=p.CurrentPosition;return v/prtPistV.Count;};Action sH=()=>{prtHPos-=prtHStep;if(prtHPos<0)prtHPos=0;if(prtHPos<=0.05f){StopPrint();return;}foreach(var w in prtWeld)w.Enabled=false;foreach(var p in prtPistH){p.MaxLimit=prtHPos;p.Velocity=-prtHSpeed;}prtState=4;};switch(prtState){case 0:bool vZ=true,hR=true;foreach(var p in prtPistV){p.MinLimit=0;p.MaxLimit=prtVMax;float d=p.CurrentPosition-prtVZero;if(d<-0.3f){p.Velocity=0.2f;vZ=false;}else if(d>0.3f){p.Velocity=-0.2f;vZ=false;}else p.Velocity=0;}foreach(var p in prtPistH){p.MinLimit=0;p.MaxLimit=prtHMax;p.Velocity=prtHSpeed;if(p.CurrentPosition<prtHMax-0.1f)hR=false;}if(vZ&&hR){prtHPos=prtHMax;foreach(var p in prtPistV)p.Velocity=-prtVSpeed;foreach(var p in prtPistH)p.Velocity=0;foreach(var w in prtWeld)w.Enabled=true;prtState=1;}break;case 1:float c1=gV();if(Math.Abs(c1-prtLastVPos)<0.01f)prtST++;else prtST=0;prtLastVPos=c1;if(prtST>10){foreach(var p in prtPistV)p.Velocity=0;prtST=0;prtLastVPos=0;sH();break;}bool aB=true;foreach(var p in prtPistV)if(p.CurrentPosition>0.1f)aB=false;if(aB){foreach(var p in prtPistV)p.Velocity=prtVSpeed;prtST=0;prtLastVPos=0;prtState=2;}break;case 2:float c2=gV();if(Math.Abs(c2-prtLastVPos)<0.01f)prtST++;else prtST=0;prtLastVPos=c2;if(prtST>10){foreach(var p in prtPistV)p.Velocity=0;prtST=0;prtLastVPos=0;sH();break;}bool aT=true;foreach(var p in prtPistV)if(p.CurrentPosition<prtVMax-0.1f)aT=false;if(aT){foreach(var p in prtPistV)p.Velocity=-prtVSpeed;prtST=0;prtLastVPos=0;prtState=3;}break;case 3:float c3=gV();if(Math.Abs(c3-prtLastVPos)<0.01f)prtST++;else prtST=0;prtLastVPos=c3;bool aZ=true;foreach(var p in prtPistV)if(Math.Abs(p.CurrentPosition-prtVZero)>0.1f)aZ=false;if(aZ||prtST>10){foreach(var p in prtPistV)p.Velocity=0;prtST=0;prtLastVPos=0;sH();}break;case 4:bool hC=true;foreach(var p in prtPistH)if(p.CurrentPosition>prtHPos+0.05f)hC=false;if(hC){foreach(var p in prtPistH)p.Velocity=0;foreach(var p in prtPistV)p.Velocity=-prtVSpeed;foreach(var w in prtWeld)w.Enabled=true;prtState=1;}break;}}
void UpdatePrinterLegacy(){switch(prtState){case 0:bool iR=true;foreach(var p in prtPist){p.Velocity=-0.5f;if(p.CurrentPosition>0.1f)iR=false;}if(iR){foreach(var p in prtPist)p.Velocity=0.5f;prtState=1;}break;case 1:bool eX=true;foreach(var p in prtPist)if(p.CurrentPosition<p.MaxLimit-0.05f)eX=false;if(eX){foreach(var p in prtPist)p.Velocity=-prtSpeed;foreach(var w in prtWeld)w.Enabled=true;prtState=2;}break;case 2:bool rT=true;foreach(var p in prtPist)if(p.CurrentPosition>p.MinLimit+0.05f)rT=false;if(rT){int bd=prtProj!=null?prtProj.BuildableBlocksCount:0;if(bd>0){foreach(var p in prtPist)p.Velocity=0;}else{foreach(var w in prtWeld)w.Enabled=false;foreach(var p in prtPist)p.Velocity=0.5f;prtState=1;}}break;}}

void DoApply(){
if(cS==S.GONE){
if(abtS){mslLnch=false;hasTlm=false;abtQ=false;abtS=false;cS=S.IDLE;return;}
if(mslBO){abtQ=true;return;}
RemoteDetonate();abtS=true;abtT=DT;return;
}
switch(cM){
case M.MAIN:
if(sel==0&&cS==S.READY&&(tgtSet||tM!=T.GPS)&&setupDone)ArmMissile();
else if(sel==0&&cS==S.ARM&&(tgtSet||tM!=T.GPS)&&setupDone){int el=(int)(DT-armTime).TotalSeconds;if(cntDn==0||el>=cntDn)StartLaunch();}
else if(sel==0&&(cS==S.FUEL||cS==S.DOCK)){if(IsLk(padCon))padCon.Disconnect();cS=S.READY;}
else if(sel==0&&!setupDone){cM=M.WIZARD;sel=0;}
else if(sel==1){cM=M.TGT;sel=0;}
else if(sel==2){cM=M.SET;sel=0;}
else if(sel==3)StartPrint();
else if(sel==4){cM=M.WIZARD;sel=0;}
else if(sel==5){cM=M.VIEW;sel=0;}
break;
case M.VIEW:
if(sel>=0&&sel<=6){viewLCD=sel+2;}
else if(sel==7){cM=M.MAIN;sel=5;}
break;
case M.TGT:
if(sel==0){tM=(T)(((int)tM+1)%6);tgtSet=false;antIdx=0;}
else if(sel==1){
if(tM==T.GPS&&wpts.Count>0){wpIdx=(wpIdx+1)%wpts.Count;tgtGPS=wpts[wpIdx].Coords;tgtName=wpts[wpIdx].Name;tgtSet=true;}
else if(tM==T.ANTENNA&&detAnts.Count>0){antIdx=(antIdx+1)%detAnts.Count;tgtAntenna=detAnts[antIdx];tgtName=detAnts[antIdx];tgtSet=true;}
else if(tM==T.SENSOR){tgtSet=true;tgtName="SENSOR";}
else if(tM==T.LIDAR){tgtSet=true;tgtName="LIDAR";}
else if(tM==T.MANUAL){tgtSet=true;tgtName="MANUAL";}
else if(tM==T.SATELLITE){tgtSet=true;tgtName="SATELLITE";}}
else if(sel==2){cM=M.MAIN;sel=0;}
break;
case M.ARM:
if(sel==0)ArmMissile();
else if(sel==1)DisarmMissile();
else if(sel==2)cM=M.MAIN;
break;
case M.SET:
if(sel==0){clbDst+=50;if(clbDst>500)clbDst=50;}
else if(sel==1){detDist+=10;if(detDist>100)detDist=10;}
else if(sel==2){cntDn+=1;if(cntDn>10)cntDn=0;}
else if(sel==3){sensorRng+=10;if(sensorRng>100)sensorRng=10;}
else if(sel==4){lidarRng+=500;if(lidarRng>5000)lidarRng=500;}
else if(sel==5){fltMd=(fltMd+1)%3;}
else if(sel==6){brnT+=1;if(brnT>15)brnT=1;}
else if(sel==7){reDst+=500;if(reDst>5000)reDst=500;}
else if(sel==8){antBC=!antBC;}
else if(sel==9){ammoTypeIdx=(ammoTypeIdx+1)%ammoNames.Length;UpdateAmmoType();}
else if(sel==10){ammoLoad+=1000;if(ammoLoad>50000)ammoLoad=1000;}
else if(sel==11){ammoEject+=1000;if(ammoEject>50000)ammoEject=1000;}
else if(sel==12){ammoTarget+=10000;if(ammoTarget>100000)ammoTarget=10000;}
else if(sel==13){iceTarget+=500;if(iceTarget>5000)iceTarget=500;}
else if(sel==14){uranTarget+=10;if(uranTarget>200)uranTarget=10;}
else if(sel==15){h2PT+=10;if(h2PT>100)h2PT=50;}
else if(sel==16){o2PT+=10;if(o2PT>100)o2PT=50;}
else if(sel==17){h2Target+=10;if(h2Target>100)h2Target=10;}
else if(sel==18){o2Target+=10;if(o2Target>100)o2Target=10;}
else if(sel==19){toolTarget+=5;if(toolTarget>50)toolTarget=5;}
else if(sel==20){isCreative=!isCreative;}
else if(sel==21){mergePaused=!mergePaused;if(!mergePaused&&padMerge!=null){padMerge.Enabled=true;IGC.SendBroadcastMessage(bcTag+"_CMD","MERGE");}}
else if(sel==22){if(padMerge!=null){padMerge.Enabled=!padMerge.Enabled;if(padMerge.Enabled)IGC.SendBroadcastMessage(bcTag+"_CMD","MERGE");}}
else if(sel==23)TC(padCon);else if(sel==24)TC(padCon1);else if(sel==25)TC(padCon2);
else if(sel==26){tlmTO+=300;if(tlmTO>1800)tlmTO=300;}
else if(sel==27){graphTimeIdx=(graphTimeIdx+1)%graphLabels.Length;}
else if(sel==28){bldNum=0;}
else if(sel==29){clbDst=500;detDist=50;cntDn=10;sensorRng=50;lidarRng=500;brnT=5;reDst=500;antBC=true;fltMd=2;tgtGPS=new Vector3D(0,0,0);tgtName="";tgtSet=false;wpIdx=0;tM=T.GPS;isCreative=false;ammoLoad=10106;ammoEject=10106;ammoTarget=50000;tlmTO=1000;ammoTypeIdx=0;graphTimeIdx=0;iceTarget=1000;uranTarget=50;h2PT=90;o2PT=90;h2Target=20;o2Target=20;bldNum=0;toolTarget=10;mergePaused=false;tgtRel=0;UpdateAmmoType();}
else if(sel==30){tgtRel=(tgtRel+1)%3;}
else if(sel==31){cM=M.MAIN;sel=0;}
break;
case M.WIZARD:
if(sel==0){DetectEnvironment();Scan();}
else if(sel==1){cM=M.TGT;sel=0;}
else if(sel==2){cM=M.SET;sel=0;}
else if(sel==3){setupDone=true;cM=M.MAIN;sel=0;}
break;
}}

void UpdateDisplays(){
if(lcd1!=null)UpdateLCD1();
if(lcd2!=null)UpdateLCD2();
if(lcd3!=null)UpdateLCD3();
if(lcd7!=null)UpdateLCD7();
if(lcd8!=null)UpdateLCD8();
if(bbLCDs.Count>0)UpdateBlackBox();
Echo("Unity Missile System");
Echo($"UnityPad [PAD{padID}]");
Echo("---");
Echo($"State: {cS}");
Echo($"Missile: {(padMerge!=null&&padMerge.IsConnected?"Docked":"Not Docked")}");
Echo($"Target: {(tgtGPS!=Vector3D.Zero?"Set":"Not Set")}");
if(isCtl)Echo($"Controller: {kPads.Count} Pads");
}

void UpdateControllerLCD1(){
if(lcd1==null)return;var sf=lcd1 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);float y=5;
SH(f,y,$"COMMAND {Clk()}",cAcc);y+=32;
ST(f,20,y,$"PAD{padID}   Fleet: {kPads.Count} pads",cTxt,0.5f);y+=20;
if(svAct){SBx(f,15,y,482,22,cErr*0.3f,cErr);ST(f,256,y+2,$"SALVO {salvoIdx}/{kPads.Count}",cErr,0.5f,TextAlignment.CENTER);y+=28;}
else{ST(f,20,y,$"Status: {(cS==S.GONE?"TRACKING":cS.ToString())}",cS==S.GONE?cErr:cPri,0.5f);y+=22;}
string selP=kPads.Count>0?$"PAD{kPads[ctrlPadSel]}":"NONE";string patS=cPat==0?"LINE":cPat==1?"GRID":"CIRCLE";
var it=new List<string>{"Copy Target All","Build All","Arm All","Launch All","Salvo Mode",$"Carpet: {patS}",aAtk?"[*] Kill All":"Kill All","Abort All",aRS?$"[*] Satellites:{tSC}":(tSC>0?$"Satellites:{tSC}":"Satellites: OFF"),$"Select: {selP}","Settings","Exit Control"};
for(int i=0;i<it.Count;i++){SMI(f,y,i,it[i],ctrlSel==i);y+=20;}
f.Dispose();}
void UpdateControllerLCD2(){
if(lcd2==null)return;var sf=lcd2 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);float y=5;
SH(f,y,"PAD STATUS",cAcc);y+=32;
ST(f,20,y,$"Fleet: {kPads.Count} pads online",cTxt,0.5f);y+=22;
int pc=0;foreach(int pid in kPads){if(pc>=10)break;
string st="?";if(pStat.ContainsKey(pid))st=pStat[pid];
bool hM=pMslF.ContainsKey(pid)&&pMslF[pid],hP=pPrt.ContainsKey(pid)&&pPrt[pid];
bool hA=pArm.ContainsKey(pid)&&pArm[pid],hR=pRdy.ContainsKey(pid)&&pRdy[pid];
Color rc=st=="GONE"?cErr:hA?cWrn:hR?cOK:cTxt;
ST(f,20,y,$"PAD{pid}  {(hM?"[M]":"[ ]")}{(hP?"[P]":"[ ]")}{(hA?"[A]":"[ ]")}{(hR?"[R]":"[ ]")}  {st}",rc,0.42f);y+=16;pc++;}
if(kPads.Count==0){ST(f,256,y,"Scanning for pads...",cSec,0.5f,TextAlignment.CENTER);}
f.Dispose();}
void UpdateControllerLCD3(){
if(lcd3==null)return;var sf=lcd3 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);float y=5;
SH(f,y,"MISSILE INVENTORY",cAcc);y+=35;
int total=0,ready=0,armed=0,flying=0;
foreach(int pid in kPads){if(pMslF.ContainsKey(pid)&&pMslF[pid])total++;if(pRdy.ContainsKey(pid)&&pRdy[pid])ready++;if(pArm.ContainsKey(pid)&&pArm[pid])armed++;if(pStat.ContainsKey(pid)&&pStat[pid]=="GONE")flying++;}
SBx(f,15,y,230,90,cBg,cSec);
ST(f,25,y+8,$"Docked: {total}",cTxt,0.55f);
ST(f,25,y+28,$"Ready: {ready}",ready>0?cOK:cSec,0.55f);
ST(f,25,y+48,$"Armed: {armed}",armed>0?cWrn:cSec,0.55f);
ST(f,25,y+68,$"Flying: {flying}",flying>0?cErr:cSec,0.55f);
y+=100;ST(f,20,y,"[M]=Missile [P]=Print [A]=Armed [R]=Ready",cSec,0.4f);
f.Dispose();}
void UpdateControllerLCD7(){
if(lcd7==null)return;var sf=lcd7 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);float y=5;
int inFlight=0;foreach(int pid in kPads){if(pStat.ContainsKey(pid)&&pStat[pid]=="GONE")inFlight++;}
SH(f,y,"FLIGHT STATUS",inFlight>0?cErr:cPri);y+=35;
ST(f,20,y,$"In Flight: {inFlight} missiles",inFlight>0?cErr:cTxt,0.55f);y+=28;
if(hasTlm){SBx(f,15,y,482,80,cBg,cErr);y+=10;ST(f,25,y,"THIS PAD",cErr,0.5f);y+=22;ST(f,25,y,$"Phase: {mslPhase}",cPri,0.5f);y+=20;ST(f,25,y,$"Distance: {mslDTT:F0}m",cTxt,0.5f);y+=20;ST(f,25,y,$"Speed: {mslVel:F0}m/s",cTxt,0.5f);}
else if(cS==S.GONE){ST(f,256,y,mslBO?"BLACKOUT":"NO SIGNAL",cWrn,0.6f,TextAlignment.CENTER);}
else{ST(f,256,y,"No active flight",cSec,0.55f,TextAlignment.CENTER);}
f.Dispose();}
void UpdateControllerLCD8(){
if(lcd8==null)return;var sf=lcd8 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);float y=5;
SH(f,y,"SATELLITE NETWORK",cAcc);y+=35;
ST(f,20,y,$"Satellites: {kSats.Count}   Pads: {kPads.Count}",cTxt,0.5f);y+=28;
if(kSats.Count>0){int sc=0;foreach(int sid in kSats){if(sc>=6)break;
string st="?";if(satStatus.ContainsKey(sid))st=satStatus[sid];
int bat=0,h2=0;if(sBat.ContainsKey(sid))bat=sBat[sid];if(satH2.ContainsKey(sid))h2=satH2[sid];
float bp=bat/100f,hp=h2/100f;
ST(f,20,y,$"SAT{sid}: {st}",cPri,0.45f);y+=16;
SB(f,20,y,100,8,bp,PctCol(bp),cBdr);ST(f,125,y-2,$"{bat}%",cTxt,0.35f);
SB(f,180,y,100,8,hp,PctCol(hp),cBdr);ST(f,285,y-2,$"{h2}%",cTxt,0.35f);y+=18;sc++;}}
else{ST(f,256,y,"No satellites deployed",cSec,0.55f,TextAlignment.CENTER);y+=25;ST(f,256,y,"Use Satellite mode to deploy",cSec,0.45f,TextAlignment.CENTER);}
f.Dispose();}
void DoControllerApply(){
switch(ctrlSel){
case 0:BroadcastCommand("TGT",tgtGPS);break;
case 1:BroadcastCommand("BUILD","");break;
case 2:BroadcastCommand("ARM","");break;
case 3:BroadcastCommand("LAUNCH","");break;
case 4:svAct=!svAct;if(svAct){salvoIdx=0;lastSalvo=DT;}break;
case 5:cPat=(cPat+1)%3;break;
case 6:aAtk=!aAtk;if(aAtk){dTgt.Clear();StartCarpetBomb();}break;
case 7:BroadcastCommand("ABORT","");break;
case 8:if(tSC==0){tSC=1;aRS=true;}else if(aRS){aRS=false;}else{tSC++;if(tSC>10)tSC=0;}break;
case 9:if(kPads.Count>0)ctrlPadSel=(ctrlPadSel+1)%kPads.Count;break;
case 10:cM=M.SET;sel=0;break;
case 11:isCtl=false;break;
}}
void UpdateLCD1(){
if(lcd1==null)return;
if(isCtl){UpdateControllerLCD1();return;}
if(viewLCD>0){ShowView();return;}
var sf=lcd1 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);float y=5;
Color hc=cS==S.ARM?cErr:cS==S.READY?cOK:!setupDone?cWrn:cPri;
if(shwOut){
int ago=(int)(DT-outT).TotalSeconds;Color oc=mslOutcome.Contains("HIT")?cOK:mslOutcome=="ABORTED"?cErr:cWrn;
SH(f,y,"MISSION COMPLETE",oc);y+=40;
ST(f,256,y,mslOutcome,oc,0.9f,TextAlignment.CENTER);y+=50;
ST(f,20,y,$"Phase: {finalPhase}",cTxt);y+=25;
ST(f,20,y,$"Distance: {fnlDTT:F0}m",cTxt);y+=25;
ST(f,20,y,$"+{ago}s since signal",cTxt);y+=40;
SMI(f,y,0,"Acknowledge",sel==0);
f.Dispose();return;}
if(cS==S.GONE){
if(abtS){int sd=(int)(DT-abtT).TotalSeconds;SH(f,y,"DETONATED",cErr);y+=40;ST(f,256,y,"TARGET DESTROYED",cErr,0.8f,TextAlignment.CENTER);y+=40;ST(f,256,y,$"+{sd}s ago",cTxt,0.6f,TextAlignment.CENTER);y+=60;ST(f,256,y,"Press APPLY to reset",cTxt,0.5f,TextAlignment.CENTER);f.Dispose();return;}
int ago=(int)(DT-lnchT).TotalSeconds;int eta1=mslVel>10?(int)(mslDTT/mslVel):0;
SH(f,y,$"FLIGHT {Clk()}",cErr);y+=35;
ST(f,20,y,$"T+{ago}s   {mslVel:F0} m/s",cTxt);y+=25;
if(mslBO){ST(f,256,y,"SIGNAL BLACKOUT",cWrn,0.7f,TextAlignment.CENTER);y+=25;if(abtQ)ST(f,256,y,"ABORT QUEUED",cErr,0.6f,TextAlignment.CENTER);}
else if(hasTlm){ST(f,20,y,$"Phase: {mslPhase}",cPri);y+=22;ST(f,20,y,$"Distance: {mslDTT:F0}m",cTxt);y+=22;ST(f,20,y,eta1>0?$"ETA: {ClkAtSec(eta1)}":"Calculating...",cTxt);y+=25;float fp=(float)mslFuelPct/100f;SLB(f,20,y,300,12,"Fuel",fp,PctCol(fp),cBdr);}
else{ST(f,256,y,"NO SIGNAL",cWrn,0.7f,TextAlignment.CENTER);}
y=235;SMI(f,y,0,"Abort Mission",sel==0);
f.Dispose();return;}
string stStr=cS==S.ARM?"ARMED":cS==S.READY?"READY":cS==S.PRINT?"PRINTING":cS==S.BUILD?"BUILDING":mslFound?"DOCKED":"IDLE";
SH(f,y,$"CONTROL {Clk()}",hc);y+=32;
SBx(f,15,y,482,24,cBg,hc);ST(f,256,y+2,stStr+(setupDone?"":" - SETUP REQUIRED"),hc,0.55f,TextAlignment.CENTER);y+=35;
if(cS==S.ARM&&counting&&cntDn>0){int rem=cntDn-(int)(DT-armTime).TotalSeconds;if(rem<0)rem=0;ST(f,256,y,$"T-{rem}s @ {ClkAtSec(rem)}",cErr,0.7f,TextAlignment.CENTER);y+=30;}
switch(cM){
case M.MAIN:
bool canL=(tgtSet||tM!=T.GPS)&&setupDone;bool canSkip=(cS==S.FUEL||cS==S.DOCK);
string lt=cS==S.ARM&&counting&&cntDn>0?(cntDn-(int)(DT-armTime).TotalSeconds>0?$"T-{cntDn-(int)(DT-armTime).TotalSeconds}":"GO!"):"Launch";
string m0=canSkip?"Skip Load":(canL?lt:setupDone?"No Target":"Setup Required");
y=90;SMI(f,y,0,m0,sel==0);y+=28;SMI(f,y,1,"Target",sel==1);y+=28;SMI(f,y,2,"Config",sel==2);y+=28;
SMI(f,y,3,printing?"Stop Print":"Print",sel==3);y+=28;SMI(f,y,4,"Setup",sel==4);y+=28;SMI(f,y,5,"View",sel==5);
break;
case M.VIEW:
string[] ln={"","Build","Missile","Fuel","Power","Cargo","Telemetry","GPS"};y=80;ST(f,20,y,"Select Display:",cTxt);y+=25;
for(int i=2;i<=8;i++){SMI(f,y,i-2,$"LCD{i}: {ln[i-1]}",sel==i-2);y+=24;}
SMI(f,y,7,"Back",sel==7);break;
case M.TGT:
string md=tM==T.GPS?"GPS":tM==T.ANTENNA?"ANTENNA":tM==T.SENSOR?"SENSOR":tM==T.LIDAR?"LIDAR":tM==T.SATELLITE?"SATELLITE":"MANUAL";
y=80;ST(f,20,y,$"Mode: {md}",cPri,0.6f);y+=30;SMI(f,y,0,"Cycle Mode",sel==0);y+=28;
ST(f,20,y,$"Target: {(tgtSet?tgtName:"none")}",cPri,0.6f);y+=30;SMI(f,y,1,"Select Target",sel==1);y+=28;SMI(f,y,2,"Back",sel==2);break;
case M.SET:
string fmS=fltMd==0?"AUTO":fltMd==1?"ICBM":"DIRECT";string clS=fltMd==1?"N/A":$"{clbDst}m";
var si=new List<string>{$"Climb: {clS}",$"Detonate: {detDist}m",$"T-Minus: {cntDn}s",$"Sensor: {sensorRng}m",$"LIDAR: {lidarRng}m",$"Flight: {fmS}",$"Burn: {brnT}s",$"Reentry: {reDst}m",$"Broadcast: {(antBC?"ON":"OFF")}",$"Payload: {ammoNames[ammoTypeIdx]}",$"Load: {ammoLoad}",$"Eject: {ammoEject}",$"Stock: {ammoTarget/1000}k",$"Ice: {iceTarget}",$"Uranium: {uranTarget}",$"H2 Tank: {h2PT}%",$"O2 Tank: {o2PT}%",$"H2 Bot: {h2Target}",$"O2 Bot: {o2Target}",$"Tools: {toolTarget}",$"Mode: {(isCreative?"CREATIVE":"SURVIVAL")}",$"Auto: {(mergePaused?"PAUSED":"ACTIVE")}",$"Merge: {(padMerge==null?"N/A":padMerge.Enabled?"ON":"OFF")}",$"Dock: {CnS(padCon)}",$"Con1: {CnS(padCon1)}",$"Con2: {CnS(padCon2)}",$"Timeout: {tlmTO}s",$"Graph: {graphLabels[graphTimeIdx]}",$"Missile#: {bldNum}","RESET ALL","BACK"};
if(sel<setScroll)setScroll=sel;if(sel>=setScroll+SET_VISIBLE)setScroll=sel-SET_VISIBLE+1;
y=70;ST(f,20,y,$"SETTINGS [{sel+1}/{si.Count}]",cPri,0.55f);y+=22;
if(setScroll>0){ST(f,256,y,"^ more ^",cSec,0.4f,TextAlignment.CENTER);y+=18;}else y+=18;
for(int i=setScroll;i<Math.Min(setScroll+SET_VISIBLE,si.Count);i++){SMI(f,y,i,si[i],sel==i);y+=22;}
if(setScroll+SET_VISIBLE<si.Count)ST(f,256,y,"v more v",cSec,0.4f,TextAlignment.CENTER);break;
case M.WIZARD:
string ev=env==E.SPACE?"SPACE":env==E.PLANET?"PLANET":env==E.MOON?"MOON":"???";
int lc=(lcd1!=null?1:0)+(lcd2!=null?1:0)+(lcd3!=null?1:0)+(lcd4!=null?1:0)+(lcd5!=null?1:0)+(lcd6!=null?1:0)+(lcd7!=null?1:0)+(lcd8!=null?1:0);
bool w1=padMerge!=null&&padCon!=null,w2=lc>=4,w3=btn!=null,w4=mslFound,w5=tgtSet||tM!=T.GPS;
int wDone=(w1?1:0)+(w2?1:0)+(w3?1:0)+(w4?1:0)+(w5?1:0);float wPct=wDone/5f;
y=80;ST(f,20,y,"INITIAL SETUP",cAcc,0.65f);y+=25;
SB(f,20,y,472,10,wPct,PctCol(wPct),cBdr);y+=18;
ST(f,20,y,$"Environment: {ev}   LCDs: {lc}/8",cTxt,0.5f);y+=22;
ST(f,20,y,$"{(w1?"[X]":"[o]")} Pad   {(w3?"[X]":"[o]")} Button   {(w4?"[X]":"[o]")} Missile",w1&&w3&&w4?cOK:cWrn,0.5f);y+=22;
ST(f,20,y,$"{(w5?"[X]":"[o]")} Target   {(setupDone?"[READY]":"")}",w5?cOK:cWrn,0.5f);y+=28;
SMI(f,y,0,"Rescan",sel==0);y+=26;SMI(f,y,1,"Target",sel==1);y+=26;SMI(f,y,2,"Config",sel==2);y+=26;
if(w1&&w2&&w3&&w4&&w5)setupDone=true;
SMI(f,y,3,setupDone?"Launch!":"Continue",sel==3);break;}
f.Dispose();}

void UpdateLCD2(){
if(lcd2==null)return;
if(isCtl){UpdateControllerLCD2();return;}
var sf=lcd2 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);float y=5;
if(cS==S.GONE){
int ago2=(int)(DT-lnchT).TotalSeconds;int eta2=mslVel>10?(int)(mslDTT/mslVel):0;
SH(f,y,$"FLIGHT {Clk()}",cErr);y+=35;
ST(f,20,y,$"T+{ago2}s",cTxt);y+=22;
if(hasTlm){ST(f,20,y,mslPhase,cPri);y+=20;ST(f,20,y,$"{mslDTT:F0}m  {mslVel:F0}m/s",cTxt);y+=20;ST(f,20,y,eta2>0?$"IMPACT @ {ClkAtSec(eta2)}":"Calculating...",cWrn);}
else if(mslBO){ST(f,256,y,"BLACKOUT",cWrn,0.7f,TextAlignment.CENTER);y+=22;ST(f,20,y,lKPh,cSec);}
else{ST(f,256,y,"NO SIGNAL",cWrn,0.7f,TextAlignment.CENTER);}
y+=25;bool lsr=false;foreach(var l in padLsr)if(l.Status==MyLaserAntennaStatus.Connected)lsr=true;
ST(f,20,y,$"Laser: {(lsr?"LINKED":"OFF")}",lsr?cOK:cSec);
f.Dispose();return;}
SH(f,y,"BUILD STATUS",cPri);y+=32;
if(prtProj==null){ST(f,256,y,"NO PROJECTOR",cWrn,0.6f,TextAlignment.CENTER);f.Dispose();return;}
if(prtProj.RemainingBlocks==0&&prtProj.TotalBlocks>0&&mslFound){
ST(f,256,y,"BUILD COMPLETE",cOK,0.6f,TextAlignment.CENTER);y+=22;
ST(f,256,y,"Update Missile PB",cWrn,0.45f,TextAlignment.CENTER);y+=20;
}else if(prtProj.RemainingBlocks==0){
ST(f,256,y,mslFound?"READY":"NO BLUEPRINT",mslFound?cOK:cSec,0.6f,TextAlignment.CENTER);y+=22;
}else{
int tot=prtProj.TotalBlocks,rem=prtProj.RemainingBlocks;float pct=tot>0?(float)(tot-rem)/tot:0;
ST(f,20,y,isCreative?"CREATIVE":"SURVIVAL",cAcc,0.45f);y+=18;
SLB(f,20,y,350,12,"Progress",pct,PctCol(pct),cBdr);y+=28;
ST(f,20,y,$"Blocks: {tot-rem}/{tot}  Buildable: {prtBuildable}",cTxt,0.4f);y+=18;}
int maxC=(int)(6*lcdS);ST(f,20,y,$"Components [{bldScroll+1}-{Math.Min(bldScroll+maxC,cNd.Count)}/{cNd.Count}]:",cSec,0.4f);y+=14;
int cc=0,ci=0;foreach(var kv in cNd){if(ci++<bldScroll)continue;if(cc>=maxC)break;int hv=cStk.ContainsKey(kv.Key)?cStk[kv.Key]:0;Color nc=hv>=kv.Value?cOK:cErr;ST(f,20,y,$"{kv.Key}: {hv}/{kv.Value}",nc,0.35f);y+=12;cc++;}
if(cMis.Count>0&&cc<maxC){int mc=0;foreach(var kv in cMis){if(cc>=maxC)break;ST(f,25,y,$"-{kv.Key}: {kv.Value}",cErr,0.32f);y+=11;cc++;mc++;}}
y+=5;ST(f,20,y,$"Ammo ({ammoNames[ammoTypeIdx]}): {ammoStock}/{ammoTarget}",ammoStock>=ammoTarget?cOK:cWrn,0.4f);
y+=8;int refW=0,asmW=0;foreach(var r in padRef)if(r.IsProducing)refW++;foreach(var a in padAsm)if(a.IsProducing)asmW++;
ST(f,20,y,$"Refineries: {refW}/{padRef.Count}   Assemblers: {asmW}/{padAsm.Count}",cTxt,0.45f);
f.Dispose();}

void UpdateLCD3(){
if(lcd3==null)return;
if(isCtl){UpdateControllerLCD3();return;}
var sf=lcd3 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);float y=5;
if(cS==S.GONE){
int ago=(int)(DT-lnchT).TotalSeconds;
SH(f,y,"POSITION",cErr);y+=35;
ST(f,20,y,$"Flight: +{ago}s",cTxt);y+=22;
if(hasTlm){ST(f,20,y,$"X: {mslPos.X:F0}",cPri);y+=20;ST(f,20,y,$"Y: {mslPos.Y:F0}",cPri);y+=20;ST(f,20,y,$"Z: {mslPos.Z:F0}",cPri);y+=25;ST(f,20,y,$"Distance: {mslDTT:F0}m",cAcc);}
else{ST(f,256,y,"NO SIGNAL",cWrn,0.7f,TextAlignment.CENTER);}
f.Dispose();return;}
SH(f,y,"MISSILE SYSTEMS",cPri);y+=32;
if(!mslFound){
ST(f,256,y,"NO MISSILE",cWrn,0.6f,TextAlignment.CENTER);y+=35;
SD(f,y);y+=10;
ST(f,20,y,"PRINTER STATUS",cAcc,0.5f);y+=25;
if(prtProj!=null){
int rem=prtProj.RemainingBlocks,tot=prtProj.TotalBlocks,bld=prtProj.BuildableBlocksCount;
float pct=tot>0?(float)(tot-rem)/tot:0;
SLB(f,20,y,350,15,"Build Progress",pct,pct>=1?cOK:pct>0?cWrn:cSec,cBdr);y+=30;
string ps=prtState==1?"EXTENDING":prtState==2?"WELDING":"IDLE";
ST(f,20,y,$"Phase: {ps}   Blocks: {tot-rem}/{tot}",cTxt,0.45f);y+=22;
if(bld>0)ST(f,20,y,$"Ready to weld: {bld}",cOK,0.45f);
else if(rem>0)ST(f,20,y,$"Remaining: {rem}",cWrn,0.45f);
else if(tot>0)ST(f,20,y,"Build complete!",cOK,0.5f);
else ST(f,20,y,"No blueprint loaded",cSec,0.45f);
}else{ST(f,20,y,"No projector found",cSec,0.45f);}
f.Dispose();return;}
string gs=padMerge!=null?(padMerge.CubeGrid.GridSize>1?"LARGE":"SMALL"):"?";
ST(f,20,y,$"Grid: {gs}   Computer: {(mslPB!=null?"OK":"X")}   Remote: {(mslRC!=null?"OK":"X")}",cTxt,0.42f);y+=18;
if(mslPB!=null&&prtProj!=null&&prtProj.RemainingBlocks==0){ST(f,256,y,"Reload PB!",cWrn,0.5f,TextAlignment.CENTER);y+=18;}
ST(f,20,y,$"Thrusters: Atmo:{thrAtmo} H2:{thrH2} Ion:{thrIon}",cTxt,0.42f);y+=16;
ST(f,20,y,$"Thrust: {mslThr.Count}   Gyro: {mslGyr.Count}",mslThr.Count>0&&mslGyr.Count>0?cOK:cErr,0.42f);y+=18;
float bp=batPct/100f;SLB(f,20,y,200,10,"Battery",bp,PctCol(bp),cBdr);y+=28;
float hp=h2Pct/100f;SLB(f,20,y,200,10,"Hydrogen",hp,PctCol(hp),cBdr);y+=28;
ST(f,20,y,$"Generator: {mslGen.Count}   Warhead: {mslWar.Count}",cTxt,0.42f);y+=18;
Color wc=mslWar.Count==0?cSec:warArmed?cErr:cOK;string ws=mslWar.Count==0?"NONE":warArmed?"ARMED":"SAFE";
ST(f,20,y,$"Status: {ws}",wc,0.5f);y+=20;
ST(f,20,y,$"Sensor: {mslSen.Count}   Camera: {mslCam.Count}   Antenna: {mslAnt.Count}",cTxt,0.4f);y+=16;
int lsC=0;foreach(var l in mslLsr)if(l.Status==MyLaserAntennaStatus.Connected)lsC++;
ST(f,20,y,$"Laser: {mslLsr.Count}   Linked: {lsC}",lsC>0?cOK:cSec,0.42f);
f.Dispose();}


void UpdateLCD7(){
if(lcd7==null)return;
if(isCtl){UpdateControllerLCD7();return;}
var sf=lcd7 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);float y=5;
if(cS!=S.GONE){
SH(f,y,"FLIGHT COMMS",cPri);y+=32;
int plLnk=0;foreach(var l in padLsr)if(l.Status==MyLaserAntennaStatus.Connected)plLnk++;
ST(f,20,y,$"Antenna: {padAnt.Count}   Laser: {padLsr.Count}   Linked: {plLnk}",cTxt,0.45f);y+=20;
if(mslFound&&mslLsr.Count>0){ST(f,20,y,$"Pre-Launch: {(preLaunchLaserLinked?"LINKED":"PENDING")}",preLaunchLaserLinked?cOK:cWrn,0.45f);y+=20;}
string md7=tM==T.GPS?"GPS":tM==T.ANTENNA?"ANTENNA":tM==T.SENSOR?"SENSOR":tM==T.LIDAR?"LIDAR":"MANUAL";
ST(f,20,y,$"Mode: {md7}",cAcc,0.5f);y+=20;
ST(f,20,y,$"Target: {(tgtSet?tgtName:"NONE")}",tgtSet?cOK:cSec,0.5f);y+=25;
ST(f,20,y,$"Mode: {(isCreative?"CREATIVE":"SURVIVAL")}",cSec,0.5f);
}else{
Color hc7=mslBO?cWrn:cErr;
int ago7=(int)(DT-lnchT).TotalSeconds;int eta7=mslVel>10?(int)(mslDTT/mslVel):0;
SH(f,y,"TELEMETRY",hc7);y+=32;
ST(f,20,y,$"Flight: +{ago7}s [{Clk()}]",cTxt,0.5f);y+=22;
if(hasTlm){ST(f,20,y,$"Phase: {mslPhase}",cPri,0.55f);y+=22;ST(f,20,y,$"Distance: {mslDTT:F0}m   Speed: {mslVel:F0}m/s",cTxt,0.45f);y+=22;ST(f,20,y,eta7>0?$"ETA: {eta7}s @ {ClkAtSec(eta7)}":"Calculating...",cAcc,0.5f);y+=25;
float dp=1f-(float)(mslDTT/(mslDTT+1000));SB(f,20,y,350,8,dp,cErr,cBdr);y+=15;ST(f,20,y,"Distance",cSec,0.35f);y+=12;float sp=(float)Math.Min(mslVel/500,1);SB(f,20,y,350,8,sp,cPri,cBdr);y+=15;ST(f,20,y,"Speed",cSec,0.35f);}
else if(mslBO){ST(f,256,y,"BLACKOUT",cWrn,0.7f,TextAlignment.CENTER);y+=25;ST(f,20,y,$"Last Phase: {lKPh}",cSec);}
else{ST(f,256,y,"NO SIGNAL",cWrn,0.7f,TextAlignment.CENTER);}
y=230;bool lsr=false;foreach(var l in padLsr)if(l.Status==MyLaserAntennaStatus.Connected)lsr=true;
ST(f,20,y,$"Laser: {(lsr?"LINKED":"OFF")}   [Press for ABORT]",lsr?cOK:cSec,0.45f);}
f.Dispose();}

void UpdateLCD8(){
if(lcd8==null)return;
if(isCtl){UpdateControllerLCD8();return;}
var sf=lcd8 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);float y=5;
if(cS==S.GONE){
int ago=(int)(DT-lnchT).TotalSeconds;
SH(f,y,"TRACKING",cErr);y+=35;
ST(f,20,y,$"T+{ago}s",cTxt);y+=25;
if(hasTlm){ST(f,20,y,"GPS Lock: YES",cOK,0.55f);y+=22;ST(f,20,y,$"X: {mslPos.X:F0}",cPri);y+=18;ST(f,20,y,$"Y: {mslPos.Y:F0}",cPri);y+=18;ST(f,20,y,$"Z: {mslPos.Z:F0}",cPri);}
else if(mslBO){ST(f,256,y,"BLACKOUT",cWrn,0.7f,TextAlignment.CENTER);y+=25;ST(f,20,y,$"Last: {lKDst:F0}m",cSec);}
else{ST(f,256,y,"SIGNAL LOST",cErr,0.7f,TextAlignment.CENTER);}
f.Dispose();return;}
if(cS==S.PRINT||cS==S.BUILD){
SH(f,y,"MISSILE DESIGN",cWrn);y+=35;
string envS=env==E.SPACE?"SPACE":env==E.PLANET?"PLANET":"MOON";
ST(f,20,y,$"Environment: {envS}",cTxt);y+=22;
ST(f,20,y,$"Gravity: {gravStr:F1} m/s²",cTxt);y+=22;
if(prtProj!=null){int rem=prtProj.RemainingBlocks;float pp=rem>0?1f-(float)rem/prtProj.TotalBlocks:1f;ST(f,20,y,$"Remaining: {rem} blocks",rem>0?cWrn:cOK);y+=22;SB(f,20,y,350,10,pp,PctCol(pp),cBdr);}
f.Dispose();return;}
string md=tM==T.GPS?"GPS":tM==T.ANTENNA?"ANTENNA":tM==T.SENSOR?"SENSOR":tM==T.LIDAR?"LIDAR":"MANUAL";
SH(f,y,md+" MODE",cPri);y+=32;
if(tM==T.GPS){
if(tgtSet){ST(f,20,y,$"Target: {tgtName}",cOK,0.5f);y+=20;ST(f,20,y,$"X:{tgtGPS.X:F0}  Y:{tgtGPS.Y:F0}  Z:{tgtGPS.Z:F0}",cTxt,0.4f);y+=22;}
if(mslFound){SBx(f,15,y,482,80,cBg,cSec);y+=8;
float bp=batPct/100f,hp=h2Pct/100f;
ST(f,25,y,$"Battery: {batPct:F0}%",PctCol(bp),0.42f);SB(f,150,y+2,150,8,bp,PctCol(bp),cBdr);y+=16;
ST(f,25,y,$"Hydrogen: {h2Pct:F0}%",PctCol(hp),0.42f);SB(f,150,y+2,150,8,hp,PctCol(hp),cBdr);y+=16;
ST(f,25,y,$"Warhead: {mslWar.Count} [{(warArmed?"ARMED":"SAFE")}]",warArmed?cErr:cOK,0.42f);y+=16;
ST(f,25,y,$"Thrust:{mslThr.Count} Gyro:{mslGyr.Count} RC:{(mslRC!=null?"Y":"N")} PB:{(mslPB!=null?"Y":"N")}",cTxt,0.38f);y+=30;}
else{ST(f,256,y,"NO MISSILE DOCKED",cWrn,0.55f,TextAlignment.CENTER);y+=28;}
if(wpts.Count>0){ST(f,20,y,$"Waypoints [{wpts.Count}]:",cSec,0.45f);y+=18;int wc=0;foreach(var w in wpts){if(wc>=6)break;string nm=w.Name;if(nm.Length>20)nm=nm.Substring(0,20);bool sl=wc==wpIdx&&tgtSet;ST(f,20,y,sl?"> "+nm:"  "+nm,sl?cAcc:cTxt,0.4f);y+=14;wc++;}}
else{ST(f,20,y,"No waypoints",cSec,0.45f);y+=16;ST(f,20,y,"Add GPS to CustomData",cSec,0.4f);}}
else if(tM==T.ANTENNA){
if(detAnts.Count==0){ST(f,256,y,"No antennas in range",cWrn,0.55f,TextAlignment.CENTER);y+=25;ST(f,256,y,"Scanning...",cSec,0.5f,TextAlignment.CENTER);}
else{ST(f,20,y,$"Antennas [{detAnts.Count}]:",cTxt,0.45f);y+=20;int ac=0;foreach(var a in detAnts){if(ac>=8)break;string nm=a;if(nm.Length>22)nm=nm.Substring(0,22);bool sl=ac==antIdx&&tgtSet;ST(f,20,y,sl?"> "+nm:"  "+nm,sl?cAcc:cTxt,0.42f);y+=16;ac++;}}}
else if(tM==T.SENSOR){ST(f,20,y,$"Range: {sensorRng}m",cTxt);y+=22;string tr=tgtRel==0?"ENEMIES":tgtRel==1?"HOSTILE":"ALL";ST(f,20,y,$"Target: {tr}",cTxt);y+=25;ST(f,20,y,"Proximity Lock Mode",cSec);}
else if(tM==T.LIDAR){ST(f,20,y,$"Range: {lidarRng}m",cTxt);y+=22;ST(f,20,y,$"Angle: {lidarAng}°",cTxt);y+=22;string tr2=tgtRel==0?"ENEMIES":tgtRel==1?"HOSTILE":"ALL";ST(f,20,y,$"Target: {tr2}",cTxt);y+=25;ST(f,20,y,"Camera Lock Mode",cSec);}
else{ST(f,256,y,"Remote Control Mode",cSec,0.55f,TextAlignment.CENTER);}
f.Dispose();}

bool LCDMatch(string n,int m){string s=":"+m;int i=n.IndexOf(s);if(i<0)return false;int e=i+s.Length;return e>=n.Length||n[e]==']'||n[e]==' '||n[e]=='-'||!char.IsDigit(n[e]);}
string Clk()=>DT.ToString("HH:mm:ss");
string ClkAtSec(int s)=>DT.AddSeconds(s).ToString("HH:mm:ss");
float ParsePwr(string i){if(string.IsNullOrEmpty(i))return 0;int x=i.IndexOf("Current Output:");if(x<0)x=i.IndexOf("Output:");if(x<0)return 0;string s=i.Substring(x);int n=s.IndexOf('\n');if(n>0)s=s.Substring(0,n);float v=0;bool f=false;string u="";foreach(char c in s){if((c>='0'&&c<='9')||c=='.'){u+=c;f=true;}else if(f)break;}float.TryParse(u,out v);return s.Contains("kW")?v/1000:s.Contains("GW")?v*1000:v;}
float GetPwr(IMyPowerProducer p){float o=p.CurrentOutput;if(o>0.0001f)return o;float m=p.MaxOutput;return m>0.0001f?m:ParsePwr(p.DetailedInfo);}

void ShowView(){
if(lcd1==null)return;var sf=lcd1 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);float y=5;
string[] titles={"","","BUILD","MISSILE","FUEL/TARGET","POWER","CARGO","TELEMETRY","GPS"};
SH(f,y,$"VIEW: {titles[viewLCD]}",cPri);y+=35;
switch(viewLCD){
case 2:
if(prtProj==null){ST(f,256,y,"No Projector",cWrn,0.55f,TextAlignment.CENTER);}
else{int t2=prtProj.TotalBlocks,r2=prtProj.RemainingBlocks;float p2=t2>0?(float)(t2-r2)/t2:0;
ST(f,20,y,isCreative?"CREATIVE":"SURVIVAL",cAcc,0.5f);y+=22;SLB(f,20,y,350,10,"Progress",p2,PctCol(p2),cBdr);y+=30;
ST(f,20,y,$"Blocks: {t2-r2}/{t2}  Buildable: {prtBuildable}",cTxt,0.45f);y+=20;}
ST(f,20,y,$"Ammo: {ammoStock}/{ammoTarget}{(ammoQueued>0?$" +{ammoQueued}":"")}",cTxt,0.45f);break;
case 3:
if(!mslFound){ST(f,256,y,"No Missile",cWrn,0.55f,TextAlignment.CENTER);}
else{ST(f,20,y,$"PB: {(mslPB!=null?"OK":"X")}   RC: {(mslRC!=null?"OK":"X")}",cTxt,0.5f);y+=22;
ST(f,20,y,$"Thrusters: Atmo:{thrAtmo} H2:{thrH2} Ion:{thrIon}",cTxt,0.45f);y+=22;
float bp=batPct/100f,hp=h2Pct/100f;
SLB(f,20,y,180,8,"Battery",bp,PctCol(bp),cBdr);y+=26;SLB(f,20,y,180,8,"Hydrogen",hp,PctCol(hp),cBdr);y+=26;
ST(f,20,y,$"Warheads: {mslWar.Count} [{(warArmed?"ARMED":"SAFE")}]",warArmed?cErr:cOK,0.5f);}break;
case 4:
ST(f,20,y,$"Mode: {tM}   Target: {(tgtSet?tgtName:"NONE")}",tgtSet?cOK:cWrn,0.5f);y+=25;
float bp4=batPct/100f,hp4=h2Pct/100f,ip4=icePct/100f;
SLB(f,20,y,150,8,"Power",bp4,PctCol(bp4),cBdr);y+=24;SLB(f,20,y,150,8,"H2",hp4,PctCol(hp4),cBdr);y+=24;SLB(f,20,y,150,8,"Ice",ip4,PctCol(ip4),cBdr);y+=26;
ST(f,20,y,$"Ammo: {mslAmmo}/{ammoLoad}  Connector: {(conLocked?"LOCKED":"OPEN")}",cTxt,0.45f);break;
case 5:
float bc5=0,bm5=0,bi5=0,bo5=0;foreach(var b in padBat){bc5+=b.CurrentStoredPower;bm5+=b.MaxStoredPower;bi5+=b.CurrentInput;bo5+=b.CurrentOutput;}
float pp5=bm5>0?bc5/bm5:0;SLB(f,20,y,350,12,$"Battery ({padBat.Count})",pp5,PctCol(pp5),cBdr);y+=35;
ST(f,20,y,$"{bc5:F1}/{bm5:F1} MWh   In: {bi5*1000:F0}kW   Out: {bo5*1000:F0}kW",cTxt,0.42f);y+=25;
ST(f,20,y,$"Reactor: {padReact.Count}   Solar: {padSolar.Count}   Wind: {padWind.Count}",cTxt,0.45f);break;
case 6:
int ra6=0,aa6=0;foreach(var r in padRef)if(r.IsProducing)ra6++;foreach(var a in padAsm)if(a.IsProducing)aa6++;
ST(f,20,y,$"Refinery: {ra6}/{padRef.Count}   Assembly: {aa6}/{padAsm.Count}",cTxt,0.5f);y+=25;
float ap6=(float)ammoStock/ammoTarget;SB(f,20,y,200,8,ap6,PctCol(ap6),cBdr);ST(f,225,y-2,$"Ammo: {ammoStock}/{ammoTarget}",cTxt,0.4f);y+=20;
float hp6=padH2Pct/100f,op6=padO2Pct/100f;
SB(f,20,y,100,8,hp6,PctCol(hp6),cBdr);ST(f,125,y-2,$"H2: {padH2Pct:F0}%",cTxt,0.4f);
SB(f,220,y,100,8,op6,PctCol(op6),cBdr);ST(f,325,y-2,$"O2: {padO2Pct:F0}%",cTxt,0.4f);y+=20;
ST(f,20,y,$"Bottles: H2 {pH2B}/{h2Target}   O2 {pO2B}/{o2Target}",cTxt,0.45f);break;
case 7:
if(cS!=S.GONE){ST(f,20,y,$"[{Clk()}] No active flight",cSec,0.5f);y+=25;ST(f,20,y,$"Mode: {tM}   Target: {(tgtSet?tgtName:"NONE")}",cTxt,0.45f);}
else{int agoV7=(int)(DT-lnchT).TotalSeconds;ST(f,20,y,$"T+{agoV7}s   {mslPhase}   {mslDTT:F0}m   {mslVel:F0}m/s",cErr,0.45f);y+=25;
float dp=1f-(float)(mslDTT/(mslDTT+1000)),sp=(float)Math.Min(mslVel/500,1);
SLB(f,20,y,200,8,"Distance",dp,cErr,cBdr);y+=24;SLB(f,20,y,200,8,"Speed",sp,cPri,cBdr);y+=28;
ST(f,20,y,$"Position: {mslPos.X:F0}, {mslPos.Y:F0}, {mslPos.Z:F0}",cTxt,0.42f);}break;
case 8:
ST(f,20,y,$"Mode: {tM}   Waypoints: {wpts.Count}",cTxt,0.5f);y+=25;
for(int i=0;i<Math.Min(6,wpts.Count);i++){var wp=wpts[i];bool ws=i==wpIdx;ST(f,20,y,ws?"> "+wp.Name:"  "+wp.Name,ws?cAcc:cTxt,0.45f);y+=18;}break;}
y=230;ST(f,256,y,"Press OK to Exit",cSec,0.45f,TextAlignment.CENTER);
f.Dispose();}

MySpriteDrawFrame BL(IMyTextSurface s){s.ContentType=ContentType.SCRIPT;s.Script="";lcdW=s.SurfaceSize.X;lcdH=s.SurfaceSize.Y;lcdS=lcdW/512f;lcdYS=lcdH/512f;var f=s.DrawFrame();f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(lcdW/2,lcdH/2),new Vector2(lcdW,lcdH),cBg));return f;}
void SH(MySpriteDrawFrame f,float y,string t,Color c){float cy=y*lcdYS,cx=lcdW/2;f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,cy+12*lcdYS),new Vector2(lcdW-12*lcdS,24*lcdYS),c*0.3f));f.Add(new MySprite(SpriteType.TEXT,t,new Vector2(cx,cy),null,c,"White",TextAlignment.CENTER,0.8f*lcdS));f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,cy+24*lcdYS),new Vector2(lcdW-32*lcdS,2*lcdYS),c));}
void SB(MySpriteDrawFrame f,float x,float y,float w,float h,float pct,Color fg,Color bg){x*=lcdS;y*=lcdYS;w*=lcdS;h*=lcdYS;f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+w/2,y+h/2),new Vector2(w,h),bg));float fw=w*Math.Max(0,Math.Min(1,pct));if(fw>1)f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+fw/2,y+h/2),new Vector2(fw,h),fg));}
void SLB(MySpriteDrawFrame f,float x,float y,float w,float h,string lbl,float pct,Color fg,Color bg){float sx=x*lcdS,sy=y*lcdYS,sw=w*lcdS;f.Add(new MySprite(SpriteType.TEXT,lbl,new Vector2(sx,sy-2*lcdYS),null,cTxt,"Monospace",TextAlignment.LEFT,0.5f*lcdS));SB(f,x,y+12,w,h,pct,fg,bg);f.Add(new MySprite(SpriteType.TEXT,$"{pct*100:0}%",new Vector2(sx+sw+5*lcdS,sy+8*lcdYS),null,fg,"Monospace",TextAlignment.LEFT,0.45f*lcdS));}
void ST(MySpriteDrawFrame f,float x,float y,string t,Color c,float sz=0.5f,TextAlignment a=TextAlignment.LEFT){f.Add(new MySprite(SpriteType.TEXT,t,new Vector2(x*lcdS,y*lcdYS),null,c,"Monospace",a,sz*lcdS));}
void SBx(MySpriteDrawFrame f,float x,float y,float w,float h,Color bg,Color bdr){x*=lcdS;y*=lcdYS;w*=lcdS;h*=lcdYS;f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+w/2,y+h/2),new Vector2(w,h),bdr));f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+w/2,y+h/2),new Vector2(w-2*lcdS,h-2*lcdYS),bg));}
Color PctCol(float p){return p>.7f?cOK:p>.3f?cWrn:cErr;}
void SMI(MySpriteDrawFrame f,float y,int idx,string t,bool s){float sy=y*lcdYS;if(s)f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(lcdW/2,sy+10*lcdYS),new Vector2(lcdW-32*lcdS,22*lcdYS),cAcc*0.4f));f.Add(new MySprite(SpriteType.TEXT,t,new Vector2(20*lcdS,sy),null,s?cAcc:cTxt,"Monospace",TextAlignment.LEFT,0.55f*lcdS));}
void SD(MySpriteDrawFrame f,float y){f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(lcdW/2,y*lcdYS),new Vector2(lcdW-32*lcdS,2*lcdYS),cSec));}

void UpdateBlackBox(){
if(bbLCDs.Count==0)return;
foreach(var bb in bbLCDs){var sf=bb as IMyTextSurface;if(sf==null)continue;var fr=BL(sf);float y=5;
SH(fr,y,"BLACK BOX",cErr);y+=35;
if(hasTlm&&cS==S.GONE){ST(fr,20,y,$"{mslPhase}  G:{mslGSt}",cPri,0.5f);y+=20;ST(fr,20,y,$"Alt:{mslAlt:F0}  Spd:{mslSpeed:F0}  Dst:{mslDTT:F0}",cTxt,0.45f);y+=20;float fp=(float)mslFuelPct/100f;SLB(fr,20,y,200,8,"H2",fp,PctCol(fp),cBdr);ST(fr,230,y,$"g:{mslGrav:F2}",cTxt,0.4f);y+=25;}
else if(shwOut){ST(fr,20,y,$"OUTCOME: {mslOutcome}",cWrn,0.55f);y+=25;}
SD(fr,y);y+=10;ST(fr,20,y,"LOG",cSec,0.45f);y+=18;
if(bbLog.Length>0){var ln=bbLog.Split('\n');int c=0;for(int i=ln.Length-1;i>=0&&c<8;i--)if(ln[i].Length>1){ST(fr,20,y,ln[i],cTxt,0.35f);y+=14;c++;}}
fr.Dispose();}
}
void UpdateBtnConfig(){if(btn==null)return;ParseBtnSettings();string exist=btn.CustomData;int padStart=exist.IndexOf("[PAD_CFG]"),padEnd=-1;if(padStart>=0){padEnd=exist.IndexOf("[",padStart+9);if(padEnd<0)padEnd=exist.Length;}string pre=padStart>0?exist.Substring(0,padStart):"",post=padEnd>0&&padEnd<exist.Length?exist.Substring(padEnd):"";if(padStart<0&&exist.Contains("["))pre=exist;var c=new StringBuilder();if(pre.Length>0&&!pre.EndsWith("\n"))pre+="\n";c.Append(pre);c.AppendLine("[PAD_CFG]");c.AppendLine($"tgt={ammoTarget}|load={ammoLoad}|ice={iceTarget}|uran={uranTarget}");c.AppendLine($"h2={h2Target}|o2={o2Target}|tool={toolTarget}|pAmmo={pAmmoTarget}");c.AppendLine($"state={cS}|phase={mslPhase}");int curAmmo=0;if(mslConAmmo!=null){var ai=mslConAmmo.GetInventory();if(ai!=null)curAmmo=(int)ai.GetItemAmount(ammoType);}int need=ammoLoad-curAmmo;c.AppendLine($"ammoReq={(cS==S.FUEL&&need>0?"1":"0")}|type={ammoTypeIdx}|need={need}|have={curAmmo}");c.AppendLine("[PAD_STATUS]");string md=isCtl?"CONTROLLER":cS==S.GONE?"FLIGHT":(printing||cS==S.PRINT||cS==S.BUILD)?"PRINT":mslFound?"MISSILE":"NORMAL";c.AppendLine($"mode={md}");c.AppendLine($"conLocked={(conLocked?1:0)}|warArmed={(warArmed?1:0)}|warCount={mslWar.Count}");if(mslFound){float mBatC=0,mBatM=0;foreach(var b in mslBat){mBatC+=b.CurrentStoredPower;mBatM+=b.MaxStoredPower;}float mH2F=0,mH2C=0;foreach(var h in mslH2){mH2F+=(float)h.FilledRatio*h.Capacity;mH2C+=h.Capacity;}float mO2F=0,mO2C=0;foreach(var o in mslO2){mO2F+=(float)o.FilledRatio*o.Capacity;mO2C+=o.Capacity;}int mIce=0,mUrn=0;foreach(var g in mslGen){var inv=g.GetInventory();if(inv!=null)foreach(var x in GL(inv))if(x.Type.SubtypeId=="Ice")mIce+=(int)x.Amount;}foreach(var r in mslReact){var inv=r.GetInventory();if(inv!=null)foreach(var x in GL(inv))if(x.Type.SubtypeId=="Uranium")mUrn+=(int)x.Amount;}c.AppendLine($"mslBatPct={(mBatM>0?mBatC/mBatM*100:0):F0}|mslBatC={mBatC:F2}|mslBatM={mBatM:F2}");c.AppendLine($"mslH2Pct={(mH2C>0?mH2F/mH2C*100:0):F0}|mslH2F={mH2F:F0}|mslH2C={mH2C:F0}");c.AppendLine($"mslO2Pct={(mO2C>0?mO2F/mO2C*100:0):F0}|mslO2F={mO2F:F0}|mslO2C={mO2C:F0}");c.AppendLine($"mslIce={mIce}|mslUran={mUrn}|mslAmmo={mslAmmo}|mslAmmoLoad={ammoLoad}");c.AppendLine($"mslGenCnt={mslGen.Count}|mslH2Cnt={mslH2.Count}|mslO2Cnt={mslO2.Count}|mslReactCnt={mslReact.Count}");}if(printing||cS==S.PRINT||cS==S.BUILD){string ps=prtState==1?"EXTENDING":prtState==2?"WELDING":"CHECKING";int rem=prtProj!=null?prtProj.RemainingBlocks:0,tot=prtProj!=null?prtProj.TotalBlocks:0,bld=prtProj!=null?prtProj.BuildableBlocksCount:0;float pist=prtPist.Count>0?prtPist[0].CurrentPosition:0;c.AppendLine($"prtPhase={ps}|prtState={prtState}|printing={(printing?1:0)}");c.AppendLine($"prtRem={rem}|prtTot={tot}|prtBld={bld}|prtPist={pist:F1}");}if(cS==S.GONE||hasTlm){c.AppendLine($"phase={mslPhase}|target={tgtName}");c.AppendLine($"mslDist={mslDTT:F0}|mslSpeed={mslVel:F0}|mslAlt={mslAlt:F0}");c.AppendLine($"mslFuel={mslFuelPct:F0}|mslETA={(mslVel>0?mslDTT/mslVel:0):F0}");c.AppendLine($"mslCount={(cS==S.GONE?1:0)}|mslArmed={(cS==S.ARM||cS==S.GONE?1:0)}|mslReady={(cS==S.READY?1:0)}");}if(isCtl){int ctPads=kPads.Count,ctArm=0,ctRdy=0,ctFly=0;foreach(int pid in kPads){if(pArm.ContainsKey(pid)&&pArm[pid])ctArm++;if(pRdy.ContainsKey(pid)&&pRdy[pid])ctRdy++;if(pStat.ContainsKey(pid)&&pStat[pid]=="GONE")ctFly++;}string ctMd=tM==T.GPS?"GPS":tM==T.ANTENNA?"ANTENNA":tM==T.SENSOR?"SENSOR":tM==T.LIDAR?"LIDAR":tM==T.SATELLITE?"SATELLITE":"MANUAL";c.AppendLine($"ctrlPads={ctPads}|ctrlArmed={ctArm}|ctrlReady={ctRdy}");c.AppendLine($"ctrlMode={ctMd}|ctrlTarget={tgtName}|ctrlStatus={(svAct?"SALVO":"ACTIVE")}");c.AppendLine($"mslCount={ctFly}");}if(post.Length>0&&!post.StartsWith("[PAD_STATUS]"))c.Append(post);btn.CustomData=c.ToString();}
void ParseBtnSettings(){if(btn==null)return;string d=btn.CustomData;if(string.IsNullOrEmpty(d))return;bool inSec=false;var ls=d.Split('\n');foreach(var l in ls){if(l.StartsWith("[SET]")||l.StartsWith("[PAD_CFG]")){inSec=true;continue;}if(l.StartsWith("[")&&inSec){inSec=false;continue;}if(!inSec)continue;var ps=l.Split('|');foreach(var p in ps){var kv=p.Split('=');if(kv.Length!=2)continue;string k=kv[0].Trim(),v=kv[1].Trim();int n;if(!int.TryParse(v,out n))continue;if(k=="tgt")ammoTarget=n;else if(k=="load")ammoLoad=n;else if(k=="ice")iceTarget=n;else if(k=="uran")uranTarget=n;else if(k=="h2")h2Target=n;else if(k=="o2")o2Target=n;else if(k=="tool")toolTarget=n;else if(k=="pAmmo")pAmmoTarget=n;}}}
List<MyInventoryItem>GL(IMyInventory v){var L=new List<MyInventoryItem>();if(v!=null)v.GetItems(L);return L;}
void AD(Dictionary<string,int>d,string k,int v){if(d.ContainsKey(k))d[k]+=v;else d[k]=v;}

