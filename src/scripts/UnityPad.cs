public enum S{INIT,IDLE,PRINT,BUILD,DOCK,FUEL,READY,ARM,LAUNCH,GONE}
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
TextAlignment tAC=TextAlignment.CENTER;SpriteType sTX=SpriteType.TEXTURE;string sQ="SquareSimple";
bool hasGrav=false;float gravStr=0;bool inAtmo=false;bool setupDone=false;bool mergePaused=false;
IMyShipMergeBlock padMerge,mslMerge;
IMyShipConnector padCon,mslConFuel,mslConAmmo,padCon1,padCon2;
IMyTextPanel lcd1,lcd2,lcd3,lcd7,lcd8;
List<IMyTextPanel> bbLCDs=new List<IMyTextPanel>();
List<IMyTextPanel> mmLCDs=new List<IMyTextPanel>();
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
List<IMyLightingBlock> padLts=new List<IMyLightingBlock>();
List<IMyTextPanel> mslLCDs=new List<IMyTextPanel>();
List<IMyFunctionalBlock> mslEmos=new List<IMyFunctionalBlock>();
string mslLcdL1="",mslLcdL2="",mslLcdEmo="neutral";
void ClearMslLcd(){mslLcdL1="";mslLcdL2="";mslLcdEmo="neutral";}
IMyRemoteControl mslRC;
DateTime lMnuT;
float batPct,h2Pct,o2Pct,icePct,ammoPct;
float mslBatCur=0,mslBatMax=0,mslH2Cur=0,mslH2Max=0,mslO2Cur=0,mslO2Max=0,mslIceCur=0,mslIceMax=0;
bool warArmed,merged,conLocked,mslFound,sentAck=false;
DateTime lnchT;int lnchTk=0;int fuelTicks=0;int dockTicks=0;
Vector3D tgtGPS=new Vector3D(0,0,0);
string tgtAntenna="",tgtName="",bcTag="UNITY_MSL";
bool tgtSet=false,antBC=true,counting=false;
List<MyWaypointInfo> wpts=new List<MyWaypointInfo>(),customWP=new List<MyWaypointInfo>();
List<string> detAnts=new List<string>();
int wpIdx=0,antIdx=0,clbDst=500,detDist=50,cntDn=10,sensorRng=50,lidarRng=500,lidarAng=5,reDst=500,fltMd=2,tgtRel=0;
DateTime armTime;
IMyBroadcastListener mslL,relL;
IMyProgrammableBlock bootPB,invPB,signalPB;
string mslPhase="",lKPh="",mslOutcome="",finalPhase="";
double mslDTT=0,lKDst=0,mslGrav=0,mslDFP=0,fnlDTT=0;
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
float prtSpeed=0.5f,prtHPos=0,prtHStep=0.2f,prtHMax=7.2f,prtVMax=10f,prtVZero=1.4f,prtVSpeed=0.5f,prtHSpeed=0.3f,prtLastVPos=0;
bool printing=false,prtStopped=false,bldCmp=false,pNmd=false;
bool asCycle=false,asCooling=false,asLoop=true;
int asIdx=0,asCoolSec=15,asFired=0;
DateTime asCoolT;
string padTag="[PAD1";
string[]sNames={"INIT","IDLE","PRINT","BUILD","DOCK","FUEL","READY","ARM","LAUNCH","GONE"};
string SN(S s){int i=(int)s;return i>=0&&i<sNames.Length?sNames[i]:"?";}
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
Dictionary<int,string> pErr=new Dictionary<int,string>();
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
Dictionary<int,Vector3D> sPos=new Dictionary<int,Vector3D>();
Dictionary<int,int> sBat=new Dictionary<int,int>();
Dictionary<int,int> satH2=new Dictionary<int,int>();
Dictionary<int,string> satStatus=new Dictionary<int,string>();
List<int> kSats=new List<int>();
bool aRS=false;
int sRQ=0;
DateTime lSatC;
int lastIntTick=0;
Dictionary<int,int> satGridX=new Dictionary<int,int>();
Dictionary<int,int> satGridZ=new Dictionary<int,int>();
double satGridSpacing=5000;
Queue<Vector3D> satReplaceQueue=new Queue<Vector3D>();
Queue<int> satReplaceGridX=new Queue<int>();
Queue<int> satReplaceGridZ=new Queue<int>();
int nextGridX=0;
int nextGridZ=0;
int satLaunchGridX=0;
int satLaunchGridZ=0;
Vector3D satLaunchTgt=Vector3D.Zero;
List<IMyShipConnector> oreC=new List<IMyShipConnector>();
IMyBroadcastListener bcnL;
string bcnTag="MINER_BEACON";
Dictionary<long,MinerData> trkM=new Dictionary<long,MinerData>();
class MinerData{public string name;public float bat,crg,h2;public Vector3D pos;public double spd,alt,dist;public string status;public int drills,drillsOn,grinders,grindersOn;public bool docked;public DateTime lastSeen;public int portNum;public double outboundSecs,returnSecs,etaSecs;public int cycles;public bool outbound;public string cargoRaw="";public Dictionary<string,int> cargoItems=new Dictionary<string,int>();}
Dictionary<string,int> oStk=new Dictionary<string,int>();
Dictionary<string,int> cStk=new Dictionary<string,int>();
Dictionary<string,int> cNd=new Dictionary<string,int>();
Dictionary<string,int> cMis=new Dictionary<string,int>();
Dictionary<string,int> bpNd=new Dictionary<string,int>();
Dictionary<string,int> bpMis=new Dictionary<string,int>();
int ammoStock=0;
int ammoTarget=0;
int ammoQueued=0;
int mslAmmo=0;
int ammoLoad=10106;
int ammoEject=10106;
int ammoTypeIdx=0;
string[] ammoNames={"S-10 Pistol","MR-20 Rifle","MR-50A Rifle","200mm Missile","25x184mm NATO","Autocannon","Assault Cannon","Artillery","Small Railgun","Large Railgun"};
string[] ammoBPNames={"Position0010_SemiAutoPistolMagazine","Position0040_AutomaticRifleGun_Mag_20rd","Position0050_RapidFireAutomaticRifleGun_Mag_50rd","Position0100_Missile200mm","Position0080_NATO_25x184mmMagazine","Position0090_AutocannonClip","Position0110_MediumCalibreAmmo","Position0120_LargeCalibreAmmo","Position0130_SmallRailgunAmmo","Position0140_LargeRailgunAmmo"};
string[] ammoITNames={"SemiAutoPistolMagazine","AutomaticRifleGun_Mag_20rd","RapidFireAutomaticRifleGun_Mag_50rd","Missile200mm","NATO_25x184mm","AutocannonClip","MediumCalibreAmmo","LargeCalibreAmmo","SmallRailgunAmmo","LargeRailgunAmmo"};
MyDefinitionId ammoBP;
MyItemType ammoType;
int toolTarget=10;
int pAmmoTarget=100,mslAmmoTarget=50000;

public Program(){
Runtime.UpdateFrequency=UpdateFrequency.Update100;
printing=false;prtState=0;prtStopped=true;
LoadStorage();
UpdatePadTag();
UpdateAmmoType();
DetectEnvironment();
Scan();
if(padCon!=null)padCon.Enabled=true;
WriteCustomData();
ParseSalvoConfig();
foreach(var w in prtWeld)w.Enabled=false;
foreach(var p in prtPist){p.Velocity=-0.5f;}
mslL=IGC.RegisterBroadcastListener(bcTag);
relL=IGC.RegisterBroadcastListener(bcTag+"_RELAY");
pCmdL=IGC.RegisterBroadcastListener(pCTag);
pStL=IGC.RegisterBroadcastListener(pStTag);
enmL=IGC.RegisterBroadcastListener("ENEMY_SIGNAL");
bcnL=IGC.RegisterBroadcastListener(bcnTag);
bootReqL=IGC.RegisterBroadcastListener("UNITY_BOOT_REQ");
ClearForBoot();
ShowCompileNotice();
}
IMyBroadcastListener bootReqL;
void FindSiblingPBs(){
bootPB=invPB=signalPB=null;
var pbs=new List<IMyProgrammableBlock>();
GridTerminalSystem.GetBlocksOfType(pbs,b=>b.CubeGrid==Me.CubeGrid&&b!=Me);
foreach(var pb in pbs){
string nm=pb.CustomName;if(!nm.Contains($"[PAD{padID}]"))continue;string nmU=nm.ToUpper();
if(nmU.Contains("UNITY BOOT"))bootPB=pb;
else if(nmU.Contains("UNITY INVENTORY"))invPB=pb;
else if(nmU.Contains("UNITY SIGNAL"))signalPB=pb;
}
}
string padSession="";
void ClearForBoot(){
padSession=DateTime.Now.Ticks.ToString();
Me.CustomData=$"[SYSTEM]\npad_ready=true\npad_session={padSession}\n[PAD_CFG]\n[PAD_STATUS]\n[PAD_DATA]\n[BLACKBOX]\n";
}
bool IsBootComplete(){
if(bootPB==null)FindSiblingPBs();
if(bootPB==null)return false;
string cd=bootPB.CustomData;
if(cd.Contains("boot_complete=BOOTING")||cd.Contains("boot_complete=false"))return false;
if(!cd.Contains("boot_complete=true")||!cd.Contains("boot_phase=COMPLETE"))return false;
if(padSession=="")return true;
return cd.Contains($"boot_for_session={padSession}");
}
bool IsBootRunning(){
if(bootPB==null)FindSiblingPBs();
if(bootPB==null)return false;
return bootPB.CustomData.Contains("boot_complete=BOOTING");
}
bool IsBootStale(){
if(bootPB==null)FindSiblingPBs();
if(bootPB==null)return true;
return bootPB.CustomData.Contains("boot_complete=STALE")||(!bootPB.CustomData.Contains("boot_complete=true")&&!bootPB.CustomData.Contains("boot_complete=BOOTING"));
}
void SendRunningAck(){
if(sentAck)return;
IGC.SendBroadcastMessage("UNITY_BOOT_ACK","PAD_RUNNING");
sentAck=true;
}
void CheckBootRequest(){
while(bootReqL!=null&&bootReqL.HasPendingMessage){var msg=bootReqL.AcceptMessage();string d=msg.Data.ToString();if(d=="PAD_CHECK"||d==$"PAD_CHECK:{padID}")SendBootResponse();}
}
void SendBootResponse(){
int mc=padMerge!=null?1:0,cc=padCon!=null?1:0;
int bc=padBat.Count,h2c=padH2.Count,o2c=padO2.Count,pc=prtWeld.Count;
string rsp=$"PAD|OK|merge={mc},con={cc},bat={bc},h2={h2c},o2={o2c},prt={pc}";
IGC.SendBroadcastMessage("UNITY_BOOT_RSP",rsp);
string cd=Me.CustomData;
if(!cd.Contains("[PAD_CFG]"))cd="[PAD_CFG]\n"+cd;
string statusLine=$"pad_status=OK:merge={mc},con={cc},bat={bc},h2={h2c},o2={o2c},prt={pc}";
if(cd.Contains("pad_status=")){int si=cd.IndexOf("pad_status=");int ei=cd.IndexOf("\n",si);if(ei<0)ei=cd.Length;cd=cd.Remove(si,ei-si);cd=cd.Insert(si,statusLine);}
else cd=cd.Replace("[PAD_CFG]","[PAD_CFG]\n"+statusLine);
Me.CustomData=cd;
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
string nm=Me.CustomName;int idx=nm.IndexOf("[PAD");
if(idx>=0){int end=nm.IndexOf("]",idx);if(end>idx+4){string num=nm.Substring(idx+4,end-idx-4);int id;if(int.TryParse(num,out id)&&id>0)padID=id;}}
if(padID==0)padID=GetNextPadID();
padTag=$"[PAD{padID}";Me.CustomName=$"[PAD{padID}] UNITY PAD";
}
List<int> DiscoverSiblingPads(){
var ids=new List<int>();
var pbs=new List<IMyProgrammableBlock>();
GridTerminalSystem.GetBlocksOfType(pbs,b=>b.IsSameConstructAs(Me)&&b!=Me&&b.CustomName.ToUpper().Contains("UNITY PAD"));
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
if(a!="")HandleArg(a);
if(!bootDone&&IsBootStale()){if(tick%10==0)ShowCompileNotice();Echo("UNITY PAD");Echo("Awaiting boot compile...");return;}
if(IsBootRunning()){Echo("UNITY PAD");Echo("Boot in progress...");return;}
if(!IsBootComplete()){bootDone=false;if(tick%2==0)ShowCompileNotice();Echo("UNITY PAD");Echo("Waiting for boot...");return;}
SendRunningAck();
if(tick%2==0)UpdateDisplays();
if(!bootDone){bootDone=true;Scan();DetectEnvironment();ResetPrinterPosition();}
if(tick%2==0)Scan();
if(tick%2==1){UpdateState();CheckStateLog();}
if(tick%2==0)WriteMslStatus();
UpdatePrinter();
if(tick%3==0){CheckTelemetry();WriteMslStatus();}
if(tick%3==0)CheckPadCommands();
if(tick%3==0)CheckPadStatus();
if(tick%3==0)ReadSignalSatData();
if(tick%3==0)CheckSatIntercept();
if(tick%5==0)ManageSatNetwork();
if(tick%3==0)CheckBeacons();
if(tick%5==0)BroadcastStatus();
if(tick%2==0)UpdateSalvo();
if(tick%2==0)AutoSalvoTick();
if(tick%5==0)UpdateAutoAttack();
if(tick%5==0)UpdateBtnConfig();
if(tick%5==0)ReadInvStats();
if(tick%10==0&&cNd.Count>6){bldScroll=(bldScroll+1)%(cNd.Count-5);}
if(cS!=S.IDLE&&cS!=S.GONE)UpdateMissileLights();
else ResetPadLights();
if(hasTlm&&!merged)UpdateMslLCDs();
}

void CheckTelemetry(){
if(mslL==null)return;
while(mslL.HasPendingMessage){ProcessTelemetry(mslL.AcceptMessage());}
if(relL!=null){while(relL.HasPendingMessage){ProcessTelemetry(relL.AcceptMessage());}}
CheckTelemetryTimeout();
}
void ProcessTelemetry(MyIGCMessage msg){
if(!(msg.Data is string))return;
string tlmRaw=(string)msg.Data;
int pi=tlmRaw.IndexOf("|PAD:");if(pi>=0){int pe=tlmRaw.IndexOf('|',pi+5);string pv=pe>0?tlmRaw.Substring(pi+5,pe-pi-5):tlmRaw.Substring(pi+5);int tp;if(int.TryParse(pv,out tp)&&tp!=padID)return;}
var parts=tlmRaw.Split(',');
if(parts.Length>=5){
double x,y,z,d;
if(double.TryParse(parts[0],out x)&&double.TryParse(parts[1],out y)&&double.TryParse(parts[2],out z)){
Vector3D newPos=new Vector3D(x,y,z);
mslPos=newPos;lastMslPos=newPos;lTlmT=DT;
}
if(double.TryParse(parts[3],out d))mslDTT=d;
mslPhase=parts[4];
if(mslPhase=="ENTERING_BLACKOUT"){mslBO=true;lKPh=mslPhase;lKDst=mslDTT;}
else if(mslPhase=="CONTACT_RESTORED"){mslBO=false;if(abtQ){RemoteDetonate();abtQ=false;mslLnch=false;hasTlm=false;ClearMslLcd();cS=S.IDLE;return;}}
else if(mslPhase=="BLACKOUT_SAT"){int oi=tlmRaw.IndexOf("ORIGTGT:");
if(oi>=0){int oe=tlmRaw.IndexOf('|',oi);if(oe<0)oe=tlmRaw.Length;string og=tlmRaw.Substring(oi+8,oe-oi-8);
var oc=og.Split(',');if(oc.Length==3){double ox,oy,oz;if(double.TryParse(oc[0],out ox)&&double.TryParse(oc[1],out oy)&&double.TryParse(oc[2],out oz)){
tgtGPS=new Vector3D(ox,oy,oz);tgtSet=true;tgtName="RELAY";}}}
mslLnch=false;hasTlm=false;mslBO=false;shwOut=false;ClearMslLcd();cS=S.IDLE;return;}
else if(mslPhase=="IMPACT"){
fnlDTT=mslDTT;finalPhase=mslPhase;outT=DT;
mslOutcome=fnlDTT<detDist*2?"TARGET HIT":fnlDTT<500?"PROBABLE HIT":"SIGNAL LOST";
LogState(mslOutcome);shwOut=true;lKPh=mslPhase;lKDst=mslDTT;
int li=tlmRaw.IndexOf("|LCD:");if(li>=0){string ld=tlmRaw.Substring(li+5);var lp2=ld.Split('~');if(lp2.Length>=3){mslLcdL1=lp2[0];mslLcdL2=lp2[1];mslLcdEmo=lp2[2];}}
return;}
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
if(mslPhase!=lastBBPhase){string ts=DT.ToString("HH:mm:ss");string detail=mslPhase=="AMMO_EJECT"?$" @{mslDTT:F0}m":mslPhase=="WARHEADS_ARMED"?$" @{mslDTT:F0}m":mslPhase=="IMPACT"?$" DTT:{mslDTT:F0}m":mslPhase=="TARGET"?$" DTT:{mslDTT:F0}m SPD:{mslSpeed:F0}m/s":"";bbLog+=$"{ts}|MSL:{mslPhase}{detail}\n";lastBBPhase=mslPhase;if(bbLog.Length>3000){int nl=bbLog.IndexOf('\n',500);if(nl>0)bbLog=bbLog.Substring(nl+1);}WriteCustomData();}
int lcdIdx=tlmRaw.IndexOf("|LCD:");
if(lcdIdx>=0){string lcdData=tlmRaw.Substring(lcdIdx+5);var lp=lcdData.Split('~');if(lp.Length>=3){mslLcdL1=lp[0];mslLcdL2=lp[1];mslLcdEmo=lp[2];}}
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
if(mslOutcome=="SIGNAL LOST"&&lKPh=="ENTERING_BLACKOUT"){tgtSet=true;tgtName="RELAY";mslLnch=false;cS=S.IDLE;}
}}
}
void AckOutcome(){
shwOut=false;mslOutcome="";mslLnch=false;hasTlm=false;mslBO=false;abtQ=false;abtS=false;ClearMslLcd();cS=S.IDLE;ResetPadLights();
}
void BroadcastCommand(string cmd,object data){
string msg=$"{padID}|{cmd}|{data}";
IGC.SendBroadcastMessage(pCTag,msg);
}
void BroadcastStatus(){
if(padID==0)return;
string err="";
if(padMerge==null)err="NO_MERGE";else if(padCon==null)err="NO_CON";else if(cS==S.READY&&!tgtSet&&tM==T.GPS)err="NO_TGT";else if(mslBO)err="BLACKOUT";
string st=$"{padID}|STATUS|{SN(cS)}|{(mslFound?"1":"0")}|{(cS==S.ARM?"1":"0")}|{(cS==S.READY?"1":"0")}|{(printing?"1":"0")}|{tgtGPS.X:F0}|{tgtGPS.Y:F0}|{tgtGPS.Z:F0}|{err}";
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
if((fromPad==padID)!=isCtl)continue;
string cmd=parts[1];
if(cmd=="TGT"&&parts.Length>=3){int tp=0;if(parts.Length>=4)int.TryParse(parts[3],out tp);if(tp==0||tp==padID){var coords=parts[2].Split(',');if(coords.Length==3){double x,y,z;if(double.TryParse(coords[0],out x)&&double.TryParse(coords[1],out y)&&double.TryParse(coords[2],out z)){tgtGPS=new Vector3D(x,y,z);tgtSet=true;tgtName="CTRL TGT";}}}}
else if(cmd=="BUILD"){if(cS==S.GONE)AckOutcome();if(!mslFound&&!printing)StartPrint();}
else if(cmd=="ARM"&&cS==S.READY&&mslFound)ArmMissile();
else if(cmd=="LAUNCH"){if(cS==S.READY&&mslFound)ArmMissile();else if(cS==S.ARM){int el=(int)(DT-armTime).TotalSeconds;if(cntDn==0||el>=cntDn)StartLaunch();}}
else if(cmd=="ABORT"&&cS==S.GONE){if(mslBO){abtQ=true;}else{RemoteDetonate(true);abtS=true;abtT=DT;}}
else if(cmd=="SATLAUNCH"){
int targetPad;if(parts.Length>=3&&int.TryParse(parts[2],out targetPad)&&targetPad==padID){
tM=T.SATELLITE;tgtSet=true;tgtName="SATELLITE";
satLaunchGridX=0;satLaunchGridZ=0;satLaunchTgt=Vector3D.Zero;
if(parts.Length>=4){
if(parts[3]=="GRID"&&parts.Length>=5){var gp=parts[4].Split(',');int gx,gz;if(gp.Length==2&&int.TryParse(gp[0],out gx)&&int.TryParse(gp[1],out gz)){satLaunchGridX=gx;satLaunchGridZ=gz;}}
else{var coords=parts[3].Split(',');if(coords.Length==3){double x,y,z;if(double.TryParse(coords[0],out x)&&double.TryParse(coords[1],out y)&&double.TryParse(coords[2],out z))satLaunchTgt=new Vector3D(x,y,z);}}}
if(cS==S.GONE)AckOutcome();
if(cS==S.READY&&mslFound)ArmMissile();
else if(cS==S.ARM){int el=(int)(DT-armTime).TotalSeconds;if(cntDn==0||el>=cntDn)StartLaunch();}
else if(!mslFound&&!printing)StartPrint();
}}
}}}}
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
void ToggleAutoSalvo(){
if(asCycle){asCycle=false;asCtrlPh=0;LogState("AUTO_STOP");return;}
asCycle=true;asFired=0;asCooling=false;asCtrlPh=0;
if(tM==T.GPS&&wpts.Count>0){asIdx=wpIdx;tgtGPS=wpts[asIdx].Coords;tgtName=wpts[asIdx].Name;tgtSet=true;}
LogState($"AUTO_START>{tgtName}");
}
void AdvanceAutoTarget(){
if(tM==T.GPS&&wpts.Count>0){
asIdx=(asIdx+1)%wpts.Count;
if(!asLoop&&asIdx==0){asCycle=false;LogState("AUTO_COMPLETE");return;}
tgtGPS=wpts[asIdx].Coords;tgtName=wpts[asIdx].Name;tgtSet=true;
}}
void AutoSalvoTick(){
if(!asCycle)return;
if(isCtl)AutoSalvoCtrl();
if(cS==S.IDLE){
if(asCooling){
int el=(int)(DT-asCoolT).TotalSeconds;
if(el<asCoolSec)return;
asCooling=false;
AdvanceAutoTarget();if(!asCycle)return;
}
if(aRS){tM=T.SATELLITE;tgtSet=true;tgtName="SATELLITE";}
if(!printing&&!mslFound)StartPrint();
}
else if(cS==S.READY)ArmMissile();
else if(cS==S.GONE){
asFired++;
AckOutcome();
AdvanceAutoTarget();
}
}
int asCtrlPh=0;
void AutoSalvoCtrl(){
if(kPads.Count==0)return;
if(aRS){AutoSalvoSat();return;}
if(asCtrlPh==0){
if(tM==T.GPS&&wpts.Count>0){tgtGPS=wpts[asIdx].Coords;tgtName=wpts[asIdx].Name;tgtSet=true;}
BroadcastCommand("TGT",tgtGPS);BroadcastCommand("BUILD","");asCtrlPh=1;
}else if(asCtrlPh==1){
int rdy=0;foreach(int pid in kPads){if(pRdy.ContainsKey(pid)&&pRdy[pid])rdy++;}
if(rdy>0){BroadcastCommand("ARM","");svAct=true;salvoIdx=0;lastSalvo=DT;asCtrlPh=2;asFired+=rdy;}
}else if(asCtrlPh==2){
bool any=false;foreach(int pid in kPads){if(pStat.ContainsKey(pid)){string s=pStat[pid];if(s=="GONE"||s=="ARM"||s=="LAUNCH")any=true;}}
if(!any){asCooling=true;asCoolT=DT;asCtrlPh=3;}
}else if(asCtrlPh==3){
int el=(int)(DT-asCoolT).TotalSeconds;
if(el>=asCoolSec){asCooling=false;asCtrlPh=0;AdvanceAutoTarget();}
}
}
void AutoSalvoSat(){
foreach(int pid in kPads){
if(!pStat.ContainsKey(pid))continue;
string s=pStat[pid];
if(s=="IDLE"){int gx=nextGridX,gz=nextGridZ;AdvanceGridSlot();BroadcastCommand("SATLAUNCH",$"{pid}|GRID|{gx},{gz}");}
else if(s=="READY"){BroadcastCommand("SATLAUNCH",$"{pid}|GRID|0,0");}
}}
void ParseSalvoConfig(){
string cd=Me.CustomData;
int si=cd.IndexOf("[SALVO_CFG]");if(si<0)return;
int ei=cd.IndexOf("[",si+11);string sec=ei>0?cd.Substring(si+11,ei-si-11):cd.Substring(si+11);
foreach(var ln in sec.Split('\n')){string l=ln.Trim();
if(l.StartsWith("cooldown=")){int v;if(int.TryParse(l.Substring(9),out v))asCoolSec=v;}
if(l.StartsWith("loop=")){asLoop=l.Substring(5).Trim()=="true";}
}}
void WriteSalvoConfig(){
string cd=Me.CustomData;
string cfg=$"[SALVO_CFG]\ncooldown={asCoolSec}\nloop={(asLoop?"true":"false")}\n";
int si=cd.IndexOf("[SALVO_CFG]");
if(si>=0){int ei=cd.IndexOf("[",si+11);if(ei<0)ei=cd.Length;cd=cd.Remove(si,ei-si).Insert(si,cfg);}
else{cd+=cfg;}
Me.CustomData=cd;
}
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
if(!kPads.Contains(padID)){kPads.Insert(0,padID);}
pStat[padID]=SN(cS);pMslF[padID]=mslFound;pArm[padID]=cS==S.ARM;pRdy[padID]=cS==S.READY;pPrt[padID]=printing;
while(pStL.HasPendingMessage){
var msg=pStL.AcceptMessage();
if(msg.Data is string){
var parts=((string)msg.Data).Split('|');
if(parts.Length>=7&&parts[1]=="STATUS"){
int pid;if(!int.TryParse(parts[0],out pid))continue;
if(!kPads.Contains(pid)){if(kPads.Count>=20){int old=kPads[0];kPads.RemoveAt(0);pStat.Remove(old);pErr.Remove(old);pMslF.Remove(old);pArm.Remove(old);pRdy.Remove(old);pPrt.Remove(old);pTgts.Remove(old);}kPads.Add(pid);}
pStat[pid]=parts[2];
pMslF[pid]=parts[3]=="1";
pArm[pid]=parts[4]=="1";
pRdy[pid]=parts[5]=="1";
pPrt[pid]=parts[6]=="1";
if(parts.Length>=9){double x,y,z;if(double.TryParse(parts[7],out x)&&double.TryParse(parts[8],out y)&&parts.Length>=10&&double.TryParse(parts[9],out z))pTgts[pid]=new Vector3D(x,y,z);}
if(parts.Length>=11&&!string.IsNullOrEmpty(parts[10]))pErr[pid]=parts[10];else pErr.Remove(pid);
}}}}
void ReadSignalSatData(){
if(signalPB==null){FindSiblingPBs();if(signalPB==null)return;}
string cd=signalPB.CustomData;
int satIdx=cd.IndexOf("[SATELLITES]");
if(satIdx<0)return;
int endIdx=cd.IndexOf("[",satIdx+12);
string satSec=endIdx>0?cd.Substring(satIdx,endIdx-satIdx):cd.Substring(satIdx);
kSats.Clear();sPos.Clear();sBat.Clear();satH2.Clear();satStatus.Clear();satGridX.Clear();satGridZ.Clear();
var lines=satSec.Split('\n');
foreach(var line in lines){
if(!line.StartsWith("sat_"))continue;
int eq=line.IndexOf('=');if(eq<0)continue;
int sid;if(!int.TryParse(line.Substring(4,eq-4),out sid))continue;
var parts=line.Substring(eq+1).Split('|');
if(parts.Length<5)continue;
if(!kSats.Contains(sid))kSats.Add(sid);
var gp=parts[0].Split(',');int gx,gz;
if(gp.Length>=2&&int.TryParse(gp[0],out gx)&&int.TryParse(gp[1],out gz)){satGridX[sid]=gx;satGridZ[sid]=gz;}
int bat,h2;if(int.TryParse(parts[1],out bat))sBat[sid]=bat;
if(int.TryParse(parts[2],out h2))satH2[sid]=h2;
int links;if(int.TryParse(parts[3],out links)){}
satStatus[sid]=parts[4];}}
void CheckSatIntercept(){
if(signalPB==null){FindSiblingPBs();if(signalPB==null)return;}
string cd=signalPB.CustomData;
int intIdx=cd.IndexOf("[INTERCEPTS]");
if(intIdx<0)return;
int nextSec=cd.IndexOf("\n[",intIdx+1);
string intSec=nextSec>0?cd.Substring(intIdx+12,nextSec-intIdx-12):cd.Substring(intIdx+12);
var lines=intSec.Split('\n');
foreach(var line in lines){
if(string.IsNullOrEmpty(line.Trim()))continue;
var tickParts=line.Split(new[]{'|'},2);
if(tickParts.Length<2)continue;
int itk;if(!int.TryParse(tickParts[0],out itk))continue;
if(itk<=lastIntTick)continue;
lastIntTick=itk;
var parts=tickParts[1].Split('|');
if(parts.Length>=4&&parts[0]=="DETONATE"){
int sid;if(!int.TryParse(parts[1],out sid))continue;
int srcPad;if(!int.TryParse(parts[2],out srcPad))continue;
var coords=parts[3].Split(',');
if(coords.Length==3){double x,y,z;if(double.TryParse(coords[0],out x)&&double.TryParse(coords[1],out y)&&double.TryParse(coords[2],out z)){
satReplaceQueue.Enqueue(new Vector3D(x,y,z));
int gx=0,gz=0;if(parts.Length>=5){var gp=parts[4].Split(',');if(gp.Length>=2){int.TryParse(gp[0],out gx);int.TryParse(gp[1],out gz);}}
satReplaceGridX.Enqueue(gx);satReplaceGridZ.Enqueue(gz);
if(kSats.Contains(sid))kSats.Remove(sid);
if(sPos.ContainsKey(sid))sPos.Remove(sid);
if(satGridX.ContainsKey(sid))satGridX.Remove(sid);
if(satGridZ.ContainsKey(sid))satGridZ.Remove(sid);
}}}}}
void ManageSatNetwork(){
if(!isCtl)return;
int elapsed=(int)(DT-lSatC).TotalSeconds;
if(elapsed<10)return;
lSatC=DT;
if(aRS&&satReplaceQueue.Count>0){
foreach(int pid in kPads){
if(satReplaceQueue.Count==0)break;
if(!pStat.ContainsKey(pid))continue;
if(pStat[pid]=="IDLE"||pStat[pid]=="READY"){
var tgt=satReplaceQueue.Dequeue();
int gx=satReplaceGridX.Count>0?satReplaceGridX.Dequeue():0;
int gz=satReplaceGridZ.Count>0?satReplaceGridZ.Dequeue():0;
BroadcastCommand("SATLAUNCH",$"{pid}|GRID|{gx},{gz}");
sRQ++;
}}}
int activeSats=kSats.Count;
int needed=kPads.Count;
if(aRS&&needed>0){
foreach(int pid in kPads){
if(needed<=0)break;
if(!pStat.ContainsKey(pid))continue;
if(pStat[pid]=="IDLE"||pStat[pid]=="READY"){
int gx=nextGridX,gz=nextGridZ;
AdvanceGridSlot();
BroadcastCommand("SATLAUNCH",$"{pid}|GRID|{gx},{gz}");
sRQ++;needed--;
}}}}
void AdvanceGridSlot(){
if(nextGridX==0&&nextGridZ==0){nextGridX=1;return;}
if(nextGridX>0&&nextGridZ>=0&&nextGridZ<nextGridX){nextGridZ++;return;}
if(nextGridZ>0&&nextGridX>-nextGridZ){nextGridX--;return;}
if(nextGridX<0&&nextGridZ>nextGridX){nextGridZ--;return;}
if(nextGridZ<0&&nextGridX<-nextGridZ){nextGridX++;return;}
if(nextGridX>0&&nextGridZ<0){nextGridX++;nextGridZ=0;}
}
void CheckBeacons(){
if(bcnL==null)return;
while(bcnL.HasPendingMessage){
var msg=bcnL.AcceptMessage();
if(!(msg.Data is string))continue;
var p=((string)msg.Data).Split('|');
if(p.Length<17||p[0]!="MB")continue;
int bcnPad;if(!int.TryParse(p[1],out bcnPad))continue;
if(!isCtl&&bcnPad!=padID)continue;
long eid;if(!long.TryParse(p[2],out eid))continue;
MinerData m;
if(!trkM.TryGetValue(eid,out m)){m=new MinerData();trkM[eid]=m;}
m.name=p[3];
float.TryParse(p[4],out m.bat);float.TryParse(p[5],out m.crg);float.TryParse(p[6],out m.h2);
var pos=p[7].Split(',');if(pos.Length>=3){double x,y,z;if(double.TryParse(pos[0],out x)&&double.TryParse(pos[1],out y)&&double.TryParse(pos[2],out z))m.pos=new Vector3D(x,y,z);}
double.TryParse(p[8],out m.spd);double.TryParse(p[9],out m.alt);double.TryParse(p[10],out m.dist);
m.status=p[11];int.TryParse(p[12],out m.drills);int.TryParse(p[13],out m.drillsOn);int.TryParse(p[14],out m.grinders);int.TryParse(p[15],out m.grindersOn);
m.docked=p[16]=="1";m.lastSeen=DT;
if(p.Length>=22){double.TryParse(p[17],out m.outboundSecs);double.TryParse(p[18],out m.returnSecs);int.TryParse(p[19],out m.cycles);double.TryParse(p[20],out m.etaSecs);m.outbound=p[21]=="1";}
if(p.Length>=23&&p[22].StartsWith("CARGO:")){m.cargoRaw=p[22].Substring(6);ParseMinerCargo(m);}
}
CorrelateDockedMiners();
CleanStaleMiners();}
void CorrelateDockedMiners(){foreach(var kv in trkM)kv.Value.docked=false;int pn=0;var aC=new List<IMyShipConnector>();GridTerminalSystem.GetBlocksOfType(aC,b=>b.CubeGrid==Me.CubeGrid&&b.Status==MyShipConnectorStatus.Connected);foreach(var cn in aC){pn++;var ot=cn.OtherConnector;if(ot==null||ot.CubeGrid==Me.CubeGrid)continue;long gid=ot.CubeGrid.EntityId;if(trkM.ContainsKey(gid)){var x=trkM[gid];x.portNum=pn;x.docked=true;x.lastSeen=DT;}else{var m=new MinerData();m.name=$"P{pn}";m.portNum=pn;m.docked=true;m.lastSeen=DT;var bt=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(bt,b=>b.CubeGrid==ot.CubeGrid);if(bt.Count>0){float c=0,mx=0;foreach(var b in bt){c+=b.CurrentStoredPower;mx+=b.MaxStoredPower;}m.bat=mx>0?(c/mx)*100:0;}var cg=new List<IMyCargoContainer>();GridTerminalSystem.GetBlocksOfType(cg,b=>b.CubeGrid==ot.CubeGrid);if(cg.Count>0){float c=0,mx=0;foreach(var g in cg){var iv=g.GetInventory();if(iv!=null){c+=(float)iv.CurrentVolume;mx+=(float)iv.MaxVolume;}}m.crg=mx>0?(c/mx)*100:0;}var hs=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(hs,b=>b.CubeGrid==ot.CubeGrid&&b.BlockDefinition.SubtypeId.Contains("Hydrogen"));if(hs.Count>0){float t=0;foreach(var h in hs)t+=(float)h.FilledRatio;m.h2=(t/hs.Count)*100;}var dl=new List<IMyShipDrill>();GridTerminalSystem.GetBlocksOfType(dl,b=>b.CubeGrid==ot.CubeGrid);m.drills=dl.Count;var gl=new List<IMyShipGrinder>();GridTerminalSystem.GetBlocksOfType(gl,b=>b.CubeGrid==ot.CubeGrid);m.grinders=gl.Count;m.status="DOCKED";trkM[gid]=m;}}}
void CleanStaleMiners(){
var stale=new List<long>();
foreach(var kv in trkM){if((DT-kv.Value.lastSeen).TotalSeconds>120&&!kv.Value.docked)stale.Add(kv.Key);}
foreach(var id in stale)trkM.Remove(id);}
void ParseMinerCargo(MinerData m){m.cargoItems.Clear();if(string.IsNullOrEmpty(m.cargoRaw))return;var items=m.cargoRaw.Split(';');foreach(var it in items){var kv=it.Split('=');if(kv.Length!=2)continue;int amt;if(int.TryParse(kv[1],out amt))m.cargoItems[kv[0]]=amt;}}
string GetCargoCategory(string key){if(key.StartsWith("O:"))return"Ore";if(key.StartsWith("I:"))return"Ingot";if(key.StartsWith("C:"))return"Component";if(key.StartsWith("T:"))return"Tool";if(key.StartsWith("A:"))return"Ammo";if(key.StartsWith("B:"))return"Bottle";if(key.StartsWith("F:"))return"Food";if(key.StartsWith("D:"))return"Data";return"Other";}
string GetCargoName(string key){int idx=key.IndexOf(':');return idx>=0?key.Substring(idx+1):key;}

void HandleArg(string a){
lMnuT=DT;
string au=a.ToUpper();
if(au.StartsWith("SETPAD:")){int np;if(int.TryParse(au.Substring(7),out np)&&np>0){if(bootPB!=null){bootPB.TryRun($"SETPAD:{np}");Echo($"Setup: SETPAD:{np} sent to Boot directly");}else Echo("ERROR: Boot PB not found");}return;}
switch(au){
case"UP":if(viewLCD>0)lcdScroll[viewLCD]=Math.Max(0,lcdScroll[viewLCD]-1);else if(isCtl&&cM==M.MAIN)ctrlSel=Math.Max(0,ctrlSel-1);else sel=Math.Max(0,sel-1);break;
case"DOWN":
if(viewLCD>0){lcdScroll[viewLCD]++;break;}
if(isCtl&&cM==M.MAIN){ctrlSel=Math.Min(12,ctrlSel+1);break;}
int maxSel=cM==M.MAIN?(kPads.Count>0?7:6):cM==M.TGT?2:cM==M.SET?31:cM==M.WIZARD?3:cM==M.VIEW?7:0;
sel=Math.Min(maxSel,sel+1);break;
case"APPLY":if(shwOut){AckOutcome();return;}if(viewLCD>0){viewLCD=0;cM=M.VIEW;sel=0;return;}if(isCtl&&cM==M.MAIN){DoControllerApply();return;}DoApply();break;
case"LAUNCH":
if(cS==S.READY){ArmMissile();}
else if(cS==S.ARM){int el=(int)(DT-armTime).TotalSeconds;if(cntDn==0||el>=cntDn)StartLaunch();}
break;
case"ARM":if(cS==S.READY)ArmMissile();break;
case"DISARM":DisarmMissile();break;
case"REFUEL":if(cS==S.IDLE)cS=S.FUEL;break;
case"MENU":cM=(M)(((int)cM+1)%6);sel=0;break;
case"SETUP":cM=M.WIZARD;sel=0;break;
case"RESCAN":DetectEnvironment();Scan();break;
case"PRINT":StartPrint();break;
case"CREATIVE":isCreative=!isCreative;break;
case"NAMEPAD":IGC.SendBroadcastMessage("UNITY_SETUP_CMD",$"NAMEPAD|{padID}");Echo("Setup: NAMEPAD sent to Boot");break;
case"NAMEMSL":IGC.SendBroadcastMessage("UNITY_SETUP_CMD",$"NAMEMSL|{padID}");Echo("Setup: NAMEMSL sent to Boot");break;
case"SETUPMOD":IGC.SendBroadcastMessage("UNITY_SETUP_CMD",$"SETUPMOD|{padID}");Echo("Setup: SETUPMOD sent to Boot");break;
case"SETUPFORCE":IGC.SendBroadcastMessage("UNITY_SETUP_CMD",$"SETUPFORCE|{padID}");Echo("Setup: SETUPFORCE sent to Boot");break;
case"RESET#":bldNum=0;break;
case"STOP":StopPrint();break;
case"AUTOSALVO":ToggleAutoSalvo();break;
case"RESET":asCycle=false;cS=S.IDLE;mslLnch=false;hasTlm=false;abtQ=false;abtS=false;shwOut=false;mslOutcome="";bldCmp=true;mergePaused=false;ClearMslLcd();if(padMerge!=null)padMerge.Enabled=true;if(padCon!=null)padCon.Enabled=true;ResetPrinterPosition();ResetAttachedMissile();ResetPadLights();break;
case"ACK":case"OK":case"CLEAR":if(shwOut)AckOutcome();break;
case"CLAIM":if(padID==0){padID=GetNextPadID();UpdatePadTag();}break;
case"SETPADCONTROL":isCtl=!isCtl;if(isCtl){ctrlSel=0;viewLCD=0;cM=M.MAIN;}break;
case"COPYTGT":if(isCtl)BroadcastCommand("TGT",tgtGPS);break;
case"BUILDALL":if(isCtl){if(cS==S.GONE)AckOutcome();if(!mslFound&&!printing)StartPrint();BroadcastCommand("BUILD","");}break;
case"ARMALL":if(isCtl){if(cS==S.READY&&mslFound)ArmMissile();BroadcastCommand("ARM","");}break;
case"LAUNCHALL":if(isCtl){if(cS==S.READY&&mslFound)ArmMissile();else if(cS==S.ARM){int el=(int)(DT-armTime).TotalSeconds;if(cntDn==0||el>=cntDn)StartLaunch();}BroadcastCommand("LAUNCH","");}break;
case"ABORT":if(cS==S.GONE){if(abtS)break;if(mslBO){abtQ=true;}else{RemoteDetonate(true);abtS=true;abtT=DT;}}break;
case"ABORTALL":if(isCtl){if(cS==S.GONE&&!abtS){if(mslBO)abtQ=true;else{RemoteDetonate(true);abtS=true;abtT=DT;}}BroadcastCommand("ABORT","");}break;
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
UpdatePadTag();
var blks=new List<IMyTerminalBlock>();
GridTerminalSystem.GetBlocksOfType(blks,b=>b.CustomName.Contains(padTag));
padMerge=null;padCon=null;padCon1=null;padCon2=null;
if(lcd1!=null&&((IMyTerminalBlock)lcd1).Closed)lcd1=null;
if(lcd2!=null&&((IMyTerminalBlock)lcd2).Closed)lcd2=null;
if(lcd3!=null&&((IMyTerminalBlock)lcd3).Closed)lcd3=null;
if(lcd7!=null&&((IMyTerminalBlock)lcd7).Closed)lcd7=null;
if(lcd8!=null&&((IMyTerminalBlock)lcd8).Closed)lcd8=null;
if(btn!=null&&btn.Closed)btn=null;
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
if(b is IMyShipConnector){var cn=b as IMyShipConnector;string u=b.CustomName.ToUpper();bool myGrid=b.CubeGrid==Me.CubeGrid;if(u.Contains("-CON1")&&padCon1==null&&myGrid)padCon1=cn;else if(u.Contains("-CON2")&&padCon2==null&&myGrid)padCon2=cn;else if(padCon==null&&u.Contains("FUEL")&&myGrid)padCon=cn;}
if(b is IMyTextPanel){
var p=b as IMyTextPanel;string pn=p.CustomName;
if(LCDMatch(pn,1)&&lcd1==null)lcd1=p;
else if(LCDMatch(pn,2)&&lcd2==null)lcd2=p;
else if(LCDMatch(pn,3)&&lcd3==null)lcd3=p;
else if(LCDMatch(pn,7)&&lcd7==null)lcd7=p;
else if(LCDMatch(pn,8)&&lcd8==null)lcd8=p;
}
if(b is IMyButtonPanel&&b.CustomName.ToLower().Contains("control")&&btn==null)btn=b as IMyButtonPanel;
}
if(padCon==null&&padMerge!=null){double cd=999;foreach(var b in blks){if(b is IMyShipConnector&&b.CubeGrid==Me.CubeGrid&&b!=padCon1&&b!=padCon2){double d=VD(b.GetPosition(),padMerge.GetPosition());if(d<cd){cd=d;padCon=b as IMyShipConnector;}}}}
if(btn==null){var allBtn=new List<IMyButtonPanel>();GridTerminalSystem.GetBlocksOfType(allBtn,b=>b.CustomName.Contains(padTag)||b.CubeGrid==Me.CubeGrid);foreach(var bp in allBtn)if(bp.CustomName.ToLower().Contains("control")&&btn==null)btn=bp;}
if(btn==null){var allBtn=new List<IMyButtonPanel>();GridTerminalSystem.GetBlocksOfType(allBtn);foreach(var bp in allBtn)if(bp.CustomName.ToLower().Contains("control")&&btn==null)btn=bp;}
bbLCDs.Clear();mmLCDs.Clear();
var allPanels=new List<IMyTextPanel>();
GridTerminalSystem.GetBlocksOfType(allPanels,p=>p.CustomName.ToUpper().Contains("[BLACKBOX]"));
foreach(var p in allPanels)bbLCDs.Add(p);
string mmTag=$"[PAD{padID} MINIMAP]";
GridTerminalSystem.GetBlocksOfType(allPanels,p=>p.CustomName.Contains(mmTag));
foreach(var p in allPanels)mmLCDs.Add(p);
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
padBat.Clear();padH2.Clear();padO2.Clear();padCargo.Clear();padCargoL.Clear();padCargoM.Clear();padCargoS.Clear();padRef.Clear();padAsm.Clear();padAnt.Clear();padLsr.Clear();padReact.Clear();padSolar.Clear();padGyr.Clear();padThr.Clear();padGen.Clear();padCam.Clear();padSen.Clear();oreC.Clear();padWind.Clear();padLts.Clear();mslLCDs.Clear();mslEmos.Clear();padMedCount=0;padSurvCount=0;padCryoCount=0;
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
if(b is IMyLightingBlock&&!b.CustomName.Contains("Missile"))padLts.Add(b as IMyLightingBlock);
if(b is IMyTextPanel&&b.CustomName.Contains($"[PAD{padID}]")&&!b.CustomName.Contains(":")&&b.CustomName.Contains("LCD")&&!b.CustomName.Contains("Missile"))mslLCDs.Add(b as IMyTextPanel);
if(b.BlockDefinition.SubtypeId.Contains("EmotionController")&&b.CustomName.Contains($"[PAD{padID}]")&&!b.CustomName.Contains("Missile"))mslEmos.Add(b as IMyFunctionalBlock);
}
var allBlk=new List<IMyTerminalBlock>();GridTerminalSystem.GetBlocksOfType(allBlk);
foreach(var x in allBlk){if(IsMslBlock(x))continue;if(x is IMyBatteryBlock){var bb=x as IMyBatteryBlock;if(!padBat.Contains(bb))padBat.Add(bb);}else if(x is IMySolarPanel&&x.IsSameConstructAs(Me)){var sp=x as IMySolarPanel;if(!padSolar.Contains(sp))padSolar.Add(sp);}else if(x is IMyReactor){var rr=x as IMyReactor;if(!padReact.Contains(rr))padReact.Add(rr);}else if(x is IMyGasGenerator){var gg=x as IMyGasGenerator;if(!padGen.Contains(gg))padGen.Add(gg);}else if(x is IMyGasTank){var tt=x as IMyGasTank;if(tt.BlockDefinition.SubtypeId.Contains("Hydrogen")){if(!padH2.Contains(tt))padH2.Add(tt);}else{if(!padO2.Contains(tt))padO2.Add(tt);}}else if(x is IMyCargoContainer&&x.IsSameConstructAs(Me)){var cc=x as IMyCargoContainer;if(!padCargo.Contains(cc)){padCargo.Add(cc);string st=cc.BlockDefinition.SubtypeId;if(st.Contains("LargeContainer"))padCargoL.Add(cc);else if(st.Contains("MediumContainer"))padCargoM.Add(cc);else padCargoS.Add(cc);}}else if(x is IMyRefinery){var rf=x as IMyRefinery;if(!padRef.Contains(rf))padRef.Add(rf);}else if(x is IMyAssembler){var am=x as IMyAssembler;if(!padAsm.Contains(am))padAsm.Add(am);}else if(x is IMyPowerProducer){var pp=x as IMyPowerProducer;if(pp.BlockDefinition.SubtypeId.Contains("Wind")&&!padWind.Contains(pp))padWind.Add(pp);}}
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
}
void ScanPrinter(){
prtPist.Clear();prtPistV.Clear();prtPistH.Clear();prtWeld.Clear();prtProj=null;
if(padID==0)padID=1;
string prtTag=$"[PAD{padID}-PRINT]";string prtTag2=$"[PAD{padID}]-PRINT";
var allBlks=new List<IMyTerminalBlock>();
GridTerminalSystem.GetBlocksOfType(allBlks,b=>{string n=b.CustomName;return n.Contains(prtTag)||n.Contains(prtTag2);});
foreach(var b in allBlks){
if(b is IMyPistonBase){var p=b as IMyPistonBase;prtPist.Add(p);string nm=b.CustomName.ToUpper();if(nm.Contains("VERT")||nm.Contains("] V"))prtPistV.Add(p);else if(nm.Contains("HORIZ")||nm.Contains("] H"))prtPistH.Add(p);}
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
if(prtPistV.Count==0||prtPistH.Count==0){
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
merged=padMerge!=null&&padMerge.IsConnected;
conLocked=IsLk(padCon);
if(!merged||padMerge==null){mslFound=false;mslMerge=null;return;}
var allMerge=new List<IMyShipMergeBlock>();
GridTerminalSystem.GetBlocksOfType(allMerge,b=>{if(!b.IsConnected||b==padMerge)return false;double d=VD(b.GetPosition(),padMerge.GetPosition());return d<20;});
if(allMerge.Count==0){mslFound=false;mslMerge=null;return;}
mslMerge=allMerge[0];
mslConFuel=null;mslConAmmo=null;mslRC=null;mslPB=null;
mslBat.Clear();mslH2.Clear();mslO2.Clear();mslWar.Clear();mslThr.Clear();mslGen.Clear();mslReact.Clear();mslGyr.Clear();mslSen.Clear();mslCam.Clear();mslAnt.Clear();mslLsr.Clear();mslCock.Clear();mslLights.Clear();
mslFound=false;batPct=0;h2Pct=0;o2Pct=0;warArmed=false;
var allBlks=new List<IMyTerminalBlock>();
var mslCons=new List<IMyShipConnector>();
GridTerminalSystem.GetBlocksOfType(allBlks);
Vector3D padPos=padMerge.GetPosition();
Vector3D mslMergePos=mslMerge.GetPosition();
Vector3D mslDir=VN(mslMergePos-padPos);
bool sameGrid=mslMerge.CubeGrid==padMerge.CubeGrid;
foreach(var b in allBlks){
string bn=b.CustomName;
if(bn.Contains("-PRINT"))continue;
bool isPadInfra=(bn.Contains(padTag)||bn.Contains("[PAD"))&&!bn.Contains("Missile");
if(isPadInfra)continue;
if(b==padMerge||b==padCon||b==Me)continue;
if(!sameGrid&&b.CubeGrid!=mslMerge.CubeGrid)continue;
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
if(b is IMyLightingBlock&&bn.Contains("Missile"))mslLights.Add(b as IMyLightingBlock);
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
mslBatCur=mslBatMax=0;if(mslBat.Count>0){foreach(var b in mslBat){mslBatCur+=b.CurrentStoredPower;mslBatMax+=b.MaxStoredPower;}batPct=mslBatMax>0?(mslBatCur/mslBatMax)*100:0;}
mslH2Cur=mslH2Max=0;if(mslH2.Count>0){foreach(var h in mslH2){mslH2Max+=h.Capacity;mslH2Cur+=h.Capacity*(float)h.FilledRatio;}h2Pct=mslH2Max>0?(mslH2Cur/mslH2Max)*100:0;}
mslO2Cur=mslO2Max=o2Pct=0;if(mslO2.Count>0){foreach(var o in mslO2){mslO2Max+=o.Capacity;mslO2Cur+=o.Capacity*(float)o.FilledRatio;}o2Pct=mslO2Max>0?(mslO2Cur/mslO2Max)*100:0;}
mslIceCur=mslIceMax=icePct=0;
if(mslGen.Count>0){foreach(var g in mslGen){var inv=g.GetInventory();if(inv!=null){mslIceCur+=(float)inv.CurrentVolume;mslIceMax+=(float)inv.MaxVolume;}}icePct=mslIceMax>0?(mslIceCur/mslIceMax)*100:0;}
ammoPct=0;mslAmmo=0;
if(mslConAmmo!=null){var ammoInv=mslConAmmo.GetInventory();if(ammoInv!=null){float cur=(float)ammoInv.CurrentVolume;float max=(float)ammoInv.MaxVolume;ammoPct=max>0?(cur/max)*100:0;mslAmmo=(int)ammoInv.GetItemAmount(ammoType);}}
if(mslWar.Count>0){warArmed=true;foreach(var w in mslWar)if(!w.IsArmed){warArmed=false;break;}}
if(cS==S.LAUNCH)warArmed=false;
if(warArmed&&cS!=S.GONE&&cS!=S.ARM){foreach(var w in mslWar)w.IsArmed=false;warArmed=false;}
thrAtmo=0;thrH2=0;thrIon=0;
foreach(var t in mslThr){string sub=t.BlockDefinition.SubtypeId;if(sub.Contains("Atmospheric"))thrAtmo++;else if(sub.Contains("Hydrogen"))thrH2++;else thrIon++;}
ScanAntennas();
if(mslFound){if(mslMerge!=null)mslMerge.Enabled=true;if(padMerge!=null)padMerge.Enabled=true;}
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
customWP.Clear();gpsData="";
string d=btn!=null?btn.CustomData:"";if(string.IsNullOrEmpty(d))return;
var NS=System.Globalization.NumberStyles.Any;var IC=System.Globalization.CultureInfo.InvariantCulture;
foreach(var ln in d.Split('\n')){string l=ln.Trim();if(l.StartsWith(";"))continue;if(!l.StartsWith("GPS:"))continue;gpsData+=l+"\n";var p=l.Split(':');if(p.Length>=5){double x,y,z;if(double.TryParse(p[2].Replace(',','.'),NS,IC,out x)&&double.TryParse(p[3].Replace(',','.'),NS,IC,out y)&&double.TryParse(p[4].Replace(',','.'),NS,IC,out z))customWP.Add(new MyWaypointInfo(p[1],new Vector3D(x,y,z)));}}}
void WriteCustomData(){ParseCustomGPS();var d=Me.CustomData;int b=d.IndexOf("[BLACKBOX]");string pre=b>=0?d.Substring(0,b):(d.EndsWith("\n")?d:d+"\n");if(!pre.Contains("[SYSTEM]"))pre=$"[SYSTEM]\npad_ready=true\npad_session={padSession}\n"+pre;Me.CustomData=pre+"[BLACKBOX]\n"+bbLog+"\n[GPS]\n"+gpsData;}
void LogState(string evt){string ts=DT.ToString("HH:mm:ss");bbLog+=$"{ts}|PAD:{evt}\n";if(bbLog.Length>2000){int nl=bbLog.IndexOf('\n',300);if(nl>0)bbLog=bbLog.Substring(nl+1);}WriteCustomData();}
void CheckStateLog(){if(cS!=lastBBState){lastBBState=cS;string sn=cS==S.BUILD?"BUILD":cS==S.DOCK?"DOCKED":cS==S.FUEL?"FUELING":cS==S.READY?"READY":cS==S.ARM?"ARMED":cS==S.LAUNCH?"LAUNCHING":cS==S.GONE?"AWAY":"";if(sn!="")LogState(sn);}}
void WriteMslStatus(){string cd=Me.CustomData;string ph=cS==S.GONE?mslPhase:cS==S.ARM?"ARMED":cS==S.READY?"READY":cS==S.FUEL?"FUELING":cS==S.DOCK?"DOCKING":cS==S.BUILD?"BUILD":cS==S.PRINT?"PRINT":mslFound?"DOCKED":"IDLE";int armCnt=cS==S.ARM||warArmed?1:0,rdyCnt=cS==S.READY?1:0,mCnt=cS==S.GONE?1:0;double dAlt=mslAlt,dDist=mslDTT,dFuel=mslFuelPct,dSpd=mslSpeed;if(cS!=S.GONE&&mslFound){dFuel=h2Pct;dSpd=0;if(mslRC!=null){Vector3D rcPos=mslRC.GetPosition();double seaLvl=0;if(mslRC.TryGetPlanetElevation(MyPlanetElevation.Sealevel,out seaLvl))dAlt=seaLvl;else dAlt=rcPos.Length();}if(tgtSet)dDist=VD(mslRC!=null?mslRC.GetPosition():Me.GetPosition(),tgtGPS);}int ammoNeed=Math.Max(0,ammoLoad-mslAmmo);bool needAmmo=conLocked&&mslConAmmo!=null&&ammoNeed>0&&(cS==S.FUEL||cS==S.DOCK);
string mslLine=$"msl_phase={ph}|target={tgtName}|mslDist={dDist:F0}|mslSpeed={dSpd:F0}|mslAlt={dAlt:F0}|mslFuel={dFuel:F0}|mslBatPct={batPct:F0}|mslH2Pct={h2Pct:F0}|mslO2Pct={o2Pct:F0}|mslCount={mCnt}|mslArmed={armCnt}|mslReady={rdyCnt}|conLocked={(conLocked?1:0)}|warArmed={(warArmed?1:0)}|warCount={mslWar.Count}|mslAmmo={mslAmmo}|mslAmmoLoad={ammoLoad}|mslGenCnt={mslGen.Count}|mslH2Cnt={mslH2.Count}|mslO2Cnt={mslO2.Count}|mslIce={(int)icePct}|mslUran=0|ammoReq={(needAmmo?1:0)}|ammoReqType={ammoTypeIdx}|ammoReqNeed={ammoNeed}";if(!cd.Contains("[PAD_DATA]"))cd+="[PAD_DATA]\n";int pi=cd.IndexOf("msl_phase=");if(pi>=0){int pe=cd.IndexOf("\n",pi);if(pe<0)pe=cd.Length;cd=cd.Remove(pi,pe-pi);cd=cd.Insert(pi,mslLine);}else{int si=cd.IndexOf("[PAD_DATA]")+10;int ni=cd.IndexOf("\n",si);if(ni<0)ni=cd.Length;cd=cd.Insert(ni,"\n"+mslLine);}Me.CustomData=cd;}

void UpdateState(){
if(padMerge==null||padCon==null){cS=S.INIT;return;}
if(mergePaused&&!padMerge.IsConnected){cS=S.IDLE;return;}
if(!merged&&cS!=S.GONE&&cS!=S.PRINT){if(cS==S.LAUNCH||cS==S.ARM){cS=S.GONE;sel=0;}else if(!printing)cS=S.IDLE;}
if(cS==S.GONE||cS==S.PRINT)return;
switch(cS){
case S.INIT:case S.IDLE:
if(printing){cS=S.PRINT;return;}
if(!mslFound){if(prtProj!=null)prtProj.Enabled=true;bldCmp=false;return;}
if(prtProj!=null)prtProj.Enabled=false;
if(!bldCmp){cS=S.BUILD;return;}
if(merged){if(!pNmd){bldNum++;IGC.SendBroadcastMessage("UNITY_NAME_CMD",$"NAMEMSL|{padID}");pNmd=true;}if(padCon!=null)padCon.Enabled=true;WriteMslPrintFlag();cS=S.DOCK;hasTlm=false;}
break;
case S.BUILD:
if(prtProj!=null&&prtProj.RemainingBlocks>0&&!prtStopped){bldCmp=false;return;}
if(!pNmd){bldNum++;IGC.SendBroadcastMessage("UNITY_NAME_CMD",$"NAMEMSL|{padID}");pNmd=true;}
DisableMissileThrusters();
if(mslMerge!=null)mslMerge.Enabled=true;
if(padMerge!=null)padMerge.Enabled=true;
if(padCon!=null)padCon.Enabled=true;
if(prtProj!=null)prtProj.Enabled=false;
bldCmp=true;WriteMslPrintFlag();cS=S.DOCK;
break;
case S.DOCK:
if(!mslFound){cS=S.IDLE;dockTicks=0;return;}
dockTicks++;
if(dockTicks>300){cS=S.IDLE;dockTicks=0;break;}
if(padCon!=null)padCon.Enabled=true;
if(!conLocked&&padCon.Status==MyShipConnectorStatus.Connectable)padCon.Connect();
CheckPreLaunchComms();
if(conLocked){DisableMissileThrusters();fuelTicks=0;dockTicks=0;cS=S.FUEL;}
break;
case S.FUEL:
foreach(var h in mslH2){h.Enabled=true;h.Stockpile=true;}
fuelTicks++;
if(fuelTicks>600){if(IsLk(padCon))padCon.Disconnect();cS=S.READY;break;}
if(conLocked){
Action<IMyCargoContainer>mf=pc=>{if(pc==null)return;var srcInv=pc.GetInventory();if(srcInv==null)return;
for(int i=srcInv.ItemCount-1;i>=0;i--){var item=srcInv.GetItemAt(i);if(!item.HasValue)continue;string subId=item.Value.Type.SubtypeId;
if(subId.Contains("Ice"))foreach(var gen in mslGen){var dstInv=gen.GetInventory();if(dstInv!=null)srcInv.TransferItemTo(dstInv,i,null,true,null);}
if(subId=="Uranium"&&mslReact.Count>0)foreach(var r in mslReact){var rI=r.GetInventory();if(rI!=null){int have=0;var rt=new List<MyInventoryItem>();rI.GetItems(rt);foreach(var x in rt)if(x.Type.SubtypeId=="Uranium")have+=(int)x.Amount;if(have<50)srcInv.TransferItemTo(rI,i,null,true,(MyFixedPoint)Math.Min(50-have,(int)item.Value.Amount));}}}};
mf(oreCargo);mf(ingotCargo);foreach(var pc in padCargo)mf(pc);}
if(mslConAmmo!=null&&ammoLoad>0){var aI=mslConAmmo.GetInventory();if(aI!=null){mslAmmo=(int)aI.GetItemAmount(ammoType);int nd=ammoLoad-mslAmmo;if(nd>0&&ammoStock>0){var pI=padCon.GetInventory();if(pI!=null){Action<IMyCargoContainer>pa=c=>{if(nd<=0||c==null)return;var cI=c.GetInventory();if(cI==null)return;var it=new List<MyInventoryItem>();cI.GetItems(it);for(int i=it.Count-1;i>=0&&nd>0;i--)if(it[i].Type==ammoType){int a=Math.Min((int)it[i].Amount,nd);cI.TransferItemTo(pI,it[i],(MyFixedPoint)a);nd-=a;}};pa(ammoCargo);pa(toolCargo);foreach(var c in padCargo)pa(c);var pt=new List<MyInventoryItem>();pI.GetItems(pt);for(int i=pt.Count-1;i>=0;i--)if(pt[i].Type==ammoType)pI.TransferItemTo(aI,pt[i],null);}}}}
bool batFull=batPct>=100f||mslBat.Count==0;
bool h2Full=h2Pct>=100f||mslH2.Count==0;
bool o2Full=o2Pct>=100f||mslO2.Count==0;
bool iceFull=icePct>=100||mslGen.Count==0;
int mslUran=0;foreach(var r in mslReact){var rI=r.GetInventory();if(rI!=null){var rt=new List<MyInventoryItem>();rI.GetItems(rt);foreach(var x in rt)if(x.Type.SubtypeId=="Uranium")mslUran+=(int)x.Amount;}}
bool uranFull=mslReact.Count==0||mslUran>=50;
mslAmmo=0;
if(mslConAmmo!=null){var aInv=mslConAmmo.GetInventory();if(aInv!=null)mslAmmo=(int)aInv.GetItemAmount(ammoType);}
bool ammoReady=ammoLoad<=0||mslConAmmo==null||mslAmmo>=ammoLoad||(ammoStock<=0&&mslAmmo>0);
CheckPreLaunchComms();
if(batFull&&h2Full&&o2Full&&iceFull&&uranFull&&ammoReady){
if(IsLk(padCon))padCon.Disconnect();
cS=S.READY;
}
break;
case S.READY:counting=false;CheckPreLaunchComms();break;
case S.ARM:
CheckPreLaunchComms();
if(counting){
int elapsed=(int)(DT-armTime).TotalSeconds;
if(cntDn==0||elapsed>=cntDn){StartLaunch();counting=false;}
}
break;
case S.LAUNCH:
lnchTk++;
if(padCon!=null){padCon.Disconnect();padCon.Enabled=false;padCon.CollectAll=false;}
if(padMerge!=null&&padMerge.Enabled)padMerge.Enabled=false;
if(mslMerge!=null&&mslMerge.Enabled)mslMerge.Enabled=false;
if(padMerge==null||!padMerge.IsConnected){
if(padLsr.Count>0&&mslMerge!=null){
Vector3D mslPos=mslMerge.GetPosition();
foreach(var l in padLsr){l.Enabled=true;l.SetTargetCoords($"GPS:MSL:{mslPos.X:F0}:{mslPos.Y:F0}:{mslPos.Z:F0}:");l.Connect();}}
if(padCon!=null)padCon.Enabled=true;
if(padMerge!=null)padMerge.Enabled=true;
cS=S.GONE;sel=0;}
else if(lnchTk>10){if(padCon!=null)padCon.Enabled=true;if(padMerge!=null)padMerge.Enabled=true;cS=S.GONE;sel=0;}
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
fIdx=0;mslSpeed=0;
foreach(var w in mslWar){w.IsArmed=false;}
warArmed=false;
foreach(var a in padAnt){a.Enabled=true;a.Radius=75000f;a.EnableBroadcasting=true;}
lnchT=DT;
string padLaserStr="";
if(padLsr.Count>0){var lp=padLsr[0].GetPosition();padLaserStr=$"\nPadLaser={lp.X:F0},{lp.Y:F0},{lp.Z:F0}";}
if(mslPB!=null){
bool inSpace=fltMd==1?false:!hasGrav;
string satCfg="";
if(tM==T.SATELLITE){if(satLaunchGridX==0&&satLaunchGridZ==0){satLaunchGridX=nextGridX;satLaunchGridZ=nextGridZ;AdvanceGridSlot();}int satId=bldNum*100+padID;satCfg=$"\nSatID={satId}\nSatGridX={satLaunchGridX}\nSatGridZ={satLaunchGridZ}\nGridSpacing={satGridSpacing:F0}\nInterceptDist=10\nSatAlt=62000";if(satLaunchTgt!=Vector3D.Zero)satCfg+=$"\nGPS={satLaunchTgt.X:F0},{satLaunchTgt.Y:F0},{satLaunchTgt.Z:F0}";satLaunchGridX=0;satLaunchGridZ=0;}
string cfg=$"[UNITY_MISSILE]\nMode={tM}\nGPS={tgtGPS.X},{tgtGPS.Y},{tgtGPS.Z}\nAntenna={tgtAntenna}\nBroadcast={bcTag}\nClimb={clbDst}\nDetonate={detDist}\nSensorRange={sensorRng}\nLidarRange={lidarRng}\nLidarAngle={lidarAng}\nAntBroadcast={(antBC?"1":"0")}\nInSpace={(inSpace?"1":"0")}\nGravity={gravStr:F2}\nReentryDist={reDst}\nFlightMode={fltMd}{padLaserStr}\nMslNumber={bldNum}\nPadID={padID}\nTargetRel={tgtRel}{satCfg}";
mslPB.CustomData=cfg;
mslPB.TryRun("LAUNCH");
}
foreach(var t in mslThr){t.Enabled=true;t.ThrustOverridePercentage=1f;}
foreach(var g in mslGyr){g.Enabled=true;g.GyroOverride=true;}
if(mslRC!=null){mslRC.IsMainCockpit=true;mslRC.ControlThrusters=true;mslRC.DampenersOverride=false;}
if(padCon!=null){padCon.Disconnect();padCon.Enabled=false;padCon.CollectAll=false;padCon.ThrowOut=false;}
if(padMerge!=null)padMerge.Enabled=false;
if(mslMerge!=null)mslMerge.Enabled=false;
mslLnch=true;lnchTk=0;lastBBPhase="";
string modeStr=tM==T.GPS?"GPS":tM==T.ANTENNA?"ANT":tM==T.SENSOR?"SNS":tM==T.LIDAR?"LDR":tM==T.SATELLITE?"SAT":"MAN";
LogState($"LAUNCH>{tgtName} M:{modeStr} G:{tgtGPS.X:F0},{tgtGPS.Y:F0},{tgtGPS.Z:F0}");
cS=S.LAUNCH;
}

void WriteMslPrintFlag(){
string cd=Me.CustomData;
if(cd.Contains("print_complete=true"))return;
if(cd.Contains("print_complete=")){int pi=cd.IndexOf("print_complete=");int pe=cd.IndexOf("\n",pi);if(pe<0)pe=cd.Length;cd=cd.Remove(pi,pe-pi).Insert(pi,"print_complete=true");}
else{cd=(cd.Length>0&&!cd.EndsWith("\n")?cd+"\n":cd)+"print_complete=true\n";}
Me.CustomData=cd;
}
void RemoteDetonate(bool force=false){
if(cS!=S.GONE){Echo("DETONATE BLOCKED: Not in flight");return;}
if(!force&&(DT-lnchT).TotalSeconds<10){Echo("DETONATE BLOCKED: 10s grace period");return;}
foreach(var a in padAnt){a.Enabled=true;a.Radius=75000f;a.EnableBroadcasting=true;}
IGC.SendBroadcastMessage(bcTag+"_CMD",$"DETONATE:{padID}");
LogState("ABORT_CMD_SENT");
}

void DisableMissileThrusters(){foreach(var t in mslThr){t.Enabled=false;t.ThrustOverridePercentage=0f;}foreach(var g in mslGyr){g.GyroOverride=false;g.Enabled=false;}foreach(var x in mslGen)x.Enabled=false;foreach(var b in mslBat)b.ChargeMode=ChargeMode.Recharge;foreach(var w in mslWar)w.IsArmed=false;foreach(var a in mslAnt){a.Enabled=true;a.Radius=75000f;a.EnableBroadcasting=true;}foreach(var s in mslSen)s.Enabled=false;foreach(var c in mslCam)c.Enabled=true;foreach(var h in mslH2){h.Enabled=true;h.Stockpile=true;}foreach(var o in mslO2){o.Enabled=true;o.Stockpile=true;}}
void ResetAttachedMissile(){
DisableMissileThrusters();
if(mslMerge!=null)mslMerge.Enabled=true;
if(mslPB!=null)mslPB.TryRun("RESET");
IGC.SendBroadcastMessage(bcTag+"_CMD",$"RESET:{padID}");
LogState("MSL_RESET");
}
void EnableMissileForLaunch(){foreach(var t in mslThr){t.Enabled=true;t.ThrustOverridePercentage=0f;}foreach(var g in mslGyr){g.Enabled=true;g.GyroOverride=false;}foreach(var x in mslGen)x.Enabled=true;foreach(var b in mslBat)b.ChargeMode=ChargeMode.Discharge;foreach(var h in mslH2)h.Stockpile=false;foreach(var o in mslO2)o.Stockpile=false;foreach(var a in mslAnt){a.Enabled=true;a.Radius=75000f;a.EnableBroadcasting=true;}foreach(var s in mslSen)s.Enabled=true;foreach(var c in mslCam){c.Enabled=true;c.EnableRaycast=true;}}
bool preLaunchCommsReady=false;
void CheckPreLaunchComms(){
if(merged){preLaunchCommsReady=mslAnt.Count>0;return;}
if(padLsr.Count==0||mslLsr.Count==0){preLaunchCommsReady=false;return;}
var pL=padLsr[0];var mL=mslLsr[0];
Vector3D pPos=pL.GetPosition();Vector3D mPos=mL.GetPosition();
pL.Enabled=true;mL.Enabled=true;
pL.SetTargetCoords($"GPS:MSL:{mPos.X:F0}:{mPos.Y:F0}:{mPos.Z:F0}:");
mL.SetTargetCoords($"GPS:PAD:{pPos.X:F0}:{pPos.Y:F0}:{pPos.Z:F0}:");
if(pL.Status!=MyLaserAntennaStatus.Connected)pL.Connect();
if(mL.Status!=MyLaserAntennaStatus.Connected)mL.Connect();
preLaunchCommsReady=pL.Status==MyLaserAntennaStatus.Connected||mL.Status==MyLaserAntennaStatus.Connected;
if(preLaunchCommsReady){hasTlm=true;lTlm=DT;}
}

void UpdateMissileLights(){
if(mslLights.Count==0&&padLts.Count==0)return;
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
foreach(var l in padLts){l.Enabled=true;l.Color=c;}
}
void ResetPadLights(){foreach(var l in mslLights)l.Color=Color.White;foreach(var l in padLts)l.Color=Color.White;mslLights.Clear();}
static Dictionary<string,string> mEmoMap=new Dictionary<string,string>{{"angry","Angry"},{"annoyed","Annoyed"},{"confused","Confused"},{"crying","Crying"},{"dead","Dead"},{"evil","Evil"},{"happy","Happy"},{"love","Love"},{"neutral","Neutral"},{"sad","Sad"},{"shocked","Shocked"},{"skeptical","Skeptical"},{"sleepy","Sleepy"},{"suspicious_left","Suspicious_Left"},{"suspicious_right","Suspicious_Right"},{"wink","Wink"}};
Color MslEmoColor(string emo){switch(emo){case "happy":case "wink":return new Color(0,255,100);case "love":return new Color(200,0,255);case "confused":case "sleepy":return new Color(0,180,255);case "annoyed":case "skeptical":return new Color(255,200,0);case "suspicious_left":case "suspicious_right":return new Color(255,160,0);case "sad":case "crying":return new Color(255,140,0);case "angry":return new Color(255,60,60);case "evil":return new Color(200,0,0);case "dead":return new Color(255,0,0);case "shocked":return new Color(255,100,0);default:return new Color(220,220,220);}}
string[] MslWrap(string t,int w){var r=new List<string>();var words=t.Split(' ');string ln="";foreach(var wd in words){if(ln.Length>0&&ln.Length+1+wd.Length>w){r.Add(ln);ln=wd;}else{ln=ln.Length>0?ln+" "+wd:wd;}}if(ln.Length>0)r.Add(ln);return r.ToArray();}
void UpdateMslLCDs(){
if(mslLCDs.Count==0&&mslEmos.Count==0)return;
if(string.IsNullOrEmpty(mslLcdL1)&&string.IsNullOrEmpty(mslLcdL2))return;
Color fc=MslEmoColor(mslLcdEmo);
Color bg=new Color(10,10,15);
foreach(var lcd in mslLCDs){
var sf=lcd as IMyTextSurface;if(sf==null)continue;
sf.ContentType=ContentType.SCRIPT;sf.Script="";
float sw=sf.SurfaceSize.X,sh=sf.SurfaceSize.Y,sx=sw/512f,sy=sh/512f;
var f=sf.DrawFrame();
f.Add(new MySprite(sTX,sQ,new Vector2(sw/2,sh/2),new Vector2(sw,sh),bg));
f.Add(new MySprite(sTX,sQ,new Vector2(sw/2,sh/2),new Vector2(sw-16*sx,sh-16*sy),new Color(20,20,25)));
f.Add(new MySprite(sTX,sQ,new Vector2(sw/2,sh/2),new Vector2(sw-20*sx,sh-20*sy),bg));
string[] w1=MslWrap(mslLcdL1,11);string[] w2=MslWrap(mslLcdL2,11);
float fsz=1.8f,lh=55f,ty=80f;
for(int i=0;i<w1.Length;i++)f.Add(new MySprite(SpriteType.TEXT,w1[i],new Vector2(256*sx,(ty+i*lh)*sy),null,fc,"White",tAC,fsz*sx));
float by=ty+w1.Length*lh+20f;
for(int i=0;i<w2.Length;i++)f.Add(new MySprite(SpriteType.TEXT,w2[i],new Vector2(256*sx,(by+i*lh)*sy),null,fc,"White",tAC,fsz*0.75f*sx));
f.Dispose();}
string eName;if(!mEmoMap.TryGetValue(mslLcdEmo,out eName))eName="Neutral";
string eAct=$"Textures\\Models\\Emotes\\{eName}.dds";
foreach(var ec in mslEmos){try{ec.ApplyAction(eAct);}catch{}}}

string BT(IMyTerminalBlock b){string s=b.BlockDefinition.SubtypeId;if(string.IsNullOrEmpty(s)){if(b is IMyGasGenerator)return"O2/H2 Gen";if(b is IMyGasTank)return"Gas Tank";s=b.BlockDefinition.TypeIdString.Replace(OB,"");}return s.Contains("Battery")?"Battery":s.Contains("HydrogenTank")?"H2 Tank":s.Contains("OxygenTank")?"O2 Tank":s.Contains("LargeContainer")?"Large Cargo":s.Contains("MediumContainer")?"Medium Cargo":s.Contains("SmallContainer")?"Small Cargo":s.Contains("Refinery")?"Refinery":s.Contains("Assembler")?"Assembler":s.Contains("RadioAntenna")?"Antenna":s.Contains("LaserAntenna")?"Laser Ant":s.Contains("Gyro")?"Gyroscope":s.Contains("HydrogenThrust")?"H2 Thruster":s.Contains("AtmosphericThrust")?"Atmo Thruster":s.Contains("Thrust")?"Ion Thruster":s.Contains("Programmable")?"Program":s.Contains("Merge")?"Merge Block":s.Contains("Connector")?"Connector":s.Contains("Projector")?"Projector":s.Contains("Piston")?"Piston":s.Contains("Camera")?"Camera":s.Contains("Sensor")?"Sensor":s.Contains("RemoteControl")?"Remote Control":s.Contains("Warhead")?"Warhead":s.Contains("ButtonPanel")?"Button Panel":s.Contains("LCD")?"LCD Panel":s.Contains("Reactor")?"Reactor":s.Contains("Solar")?"Solar Panel":s.Contains("Wind")?"Wind Turbine":s.Contains("Medical")?"Medical Room":s.Contains("Survival")?"Survival Kit":s.Contains("Cryo")?"Cryo Chamber":s.Contains("Cockpit")?"Cockpit":s;}
bool IsMslBlock(IMyTerminalBlock b){if(!merged||mslMerge==null)return false;bool sameGrid=mslMerge.CubeGrid==Me.CubeGrid;if(sameGrid)return b.CustomName.Contains("Missile #");return b.CubeGrid==mslMerge.CubeGrid;}
string CnS(IMyShipConnector c)=>c==null?"N/A":c.Status==MyShipConnectorStatus.Connected?"LOCK":"OPEN";
void TC(IMyShipConnector c){if(c!=null){if(c.Status==MyShipConnectorStatus.Connected)c.Disconnect();else c.Connect();}}
bool IsLk(IMyShipConnector c)=>c!=null&&c.Status==MyShipConnectorStatus.Connected;
DateTime DT=>DateTime.Now;
double VD(Vector3D a,Vector3D b)=>Vector3D.Distance(a,b);
Vector3D VN(Vector3D v)=>Vector3D.Normalize(v);
void ReadInvStats(){if(invPB==null)FindSiblingPBs();if(invPB==null)return;string d=invPB.CustomData;if(string.IsNullOrEmpty(d))return;
Action<string,Action<string>>PS=(tag,act)=>{int si=d.IndexOf(tag);if(si<0)return;int ei=d.IndexOf("\n[",si+tag.Length);string sec=ei>0?d.Substring(si,ei-si):d.Substring(si);foreach(var ln in sec.Split('\n')){foreach(var it in ln.Split('|'))act(it);}};
Func<string,int>PV=s=>{int v=0;if(string.IsNullOrEmpty(s))return 0;string f=s.Split('+')[0].Split('/')[0].Split('%')[0].Split(' ').FirstOrDefault(x=>x.Length>0&&char.IsDigit(x[0]))??"";int di=f.IndexOf('-');if(di>0)f=f.Substring(0,di);int.TryParse(f.Replace(",",""),out v);return v;};
PS("[QUOTAS]",it=>{if(!it.Contains("="))return;var kv=it.Split('=');if(kv.Length<2)return;string k=kv[0].Trim().ToLower().Replace("_","").Replace(" ","");int v;if(!int.TryParse(kv[1].Trim(),out v))return;if(k=="ammotarget"||k=="tgt")ammoTarget=v;else if(k=="pammotarget")pAmmoTarget=v;else if(k=="mslammotarget"||k=="mslammo"||k=="s10target"||k=="s10")mslAmmoTarget=v;else if(k=="h2target")h2Target=v;else if(k=="o2target")o2Target=v;else if(k=="tooltarget")toolTarget=v;});
PS("[STATUS]",it=>{if(!it.Contains("="))return;var kv=it.Split('=');if(kv.Length<2)return;string k=kv[0].Trim().ToLower().Replace(" ",""),vs=kv[1].Trim();int vi;if(int.TryParse(vs,out vi)){if(k=="ammostock")ammoStock=vi;else if(k=="ammotype"&&vi!=ammoTypeIdx){ammoTypeIdx=vi;UpdateAmmoType();}else if(k=="ammoqueued")ammoQueued=vi;else if(k=="cargol")invCargoL=vi;else if(k=="cargom")invCargoM=vi;else if(k=="cargos")invCargoS=vi;}if(k=="cargo"){int pi=vs.IndexOf('%');if(pi>0)float.TryParse(vs.Substring(0,pi),out invCargoPct);}invCargoT=invCargoL+invCargoM+invCargoS;});
PS("[BOTTLES]",it=>{if(!it.Contains("="))return;var kv=it.Split('=');if(kv.Length<2)return;string k=kv[0].Trim().ToLower(),v=kv[1];var vp=v.Split('+');int stk=PV(vp[0]);int q=vp.Length>1?PV(vp[1]):0;if(k.StartsWith("h")){pH2B=stk;h2Queued=q;}else if(k.StartsWith("o")){pO2B=stk;o2Queued=q;}});
oStk.Clear();cStk.Clear();cNd.Clear();cMis.Clear();
PS("[ORE]",it=>{if(!it.Contains("="))return;var kv=it.Split('=');if(kv.Length>=2){string k=kv[0].Trim();int v=PV(kv[1]);if(k.Length>0&&!k.StartsWith("["))oStk[k]=v;}});
PS("[COMPONENTS]",it=>{if(!it.Contains("="))return;var kv=it.Split('=');if(kv.Length>=2){string k=kv[0].Trim();if(k.Length>0&&!k.StartsWith("[")&&!k.ToLower().Contains("item")&&!k.ToLower().Contains("name")){string vp=kv[1];cStk[k]=PV(vp);int si=vp.IndexOf('/');if(si>=0&&si+1<vp.Length){int tg;if(int.TryParse(vp.Substring(si+1).Split('|')[0].Split(' ')[0].Split('-')[0].Trim(),out tg))cNd[k]=tg;}}}});
foreach(var kv in cNd){int have=0;if(cStk.ContainsKey(kv.Key))have=cStk[kv.Key];if(have<kv.Value)cMis[kv.Key]=kv.Value-have;}
ReadBlueprint();}
void ReadBlueprint(){string d=Me.CustomData;bpNd.Clear();bpMis.Clear();if(string.IsNullOrEmpty(d)||!d.Contains("[BLUEPRINT]"))return;int si=d.IndexOf("[BLUEPRINT]");if(si<0)return;int ei=d.IndexOf("\n[",si+11);string sec=ei>0?d.Substring(si,ei-si):d.Substring(si);foreach(var ln in sec.Split('\n')){if(!ln.Contains("="))continue;var kv=ln.Split('=');if(kv.Length<2)continue;string k=kv[0].Trim();if(k.Length==0||k.StartsWith("["))continue;int v;if(int.TryParse(kv[1].Trim(),out v)&&v>0)bpNd[k]=v;}foreach(var kv in bpNd){int have=cStk.ContainsKey(kv.Key)?cStk[kv.Key]:0;if(have<kv.Value)bpMis[kv.Key]=kv.Value-have;}}
void StartPrint(){ScanPrinter();string pt=padID>0?$"[PAD{padID}-PRINT]":"[PRINT]";if(prtPist.Count==0)return;if(prtWeld.Count==0)return;if(prtProj==null)return;if(padMerge==null)return;if(padMerge.IsConnected)return;if(printing){StopPrint();return;}ClearMslLcd();hasTlm=false;padMerge.Enabled=true;prtStopped=false;printing=true;prtState=0;cS=S.PRINT;bldCmp=false;pNmd=false;prtLastVPos=0;prtST=0;if(prtPistV.Count>0&&prtPistH.Count>0){prtVZero=1.4f;prtVMax=10f;prtHMax=7.2f;foreach(var p in prtPistV){p.MinLimit=0;p.MaxLimit=prtVZero;p.Velocity=prtVSpeed;}foreach(var p in prtPistH){p.MinLimit=0;p.Velocity=prtHSpeed;}prtHPos=prtHMax;}else{prtHPos=0;foreach(var p in prtPist){p.MinLimit=0f;p.Velocity=-0.5f;}}foreach(var w in prtWeld)w.Enabled=false;if(prtProj!=null)prtProj.Enabled=true;if(padMerge!=null)padMerge.Enabled=true;}
void StopPrint(){printing=false;prtState=0;prtStopped=true;bldCmp=true;prtHPos=0;prtLastVPos=0;prtST=0;foreach(var p in prtPistV){p.Velocity=-prtVSpeed;p.MinLimit=0;}foreach(var p in prtPistH){p.Velocity=-prtHSpeed;p.MinLimit=0;}foreach(var p in prtPist){p.Velocity=-0.5f;p.MinLimit=0;}foreach(var w in prtWeld)w.Enabled=false;if(prtProj!=null)prtProj.Enabled=false;cS=S.IDLE;IGC.SendBroadcastMessage("UNITY_PRINTER_ACK",$"{padID}|COMPLETE|{bldNum}");}
void ResetPrinterPosition(){printing=false;prtState=0;prtStopped=true;prtHPos=0;prtLastVPos=0;prtST=0;foreach(var p in prtPistV){p.Velocity=-prtVSpeed;p.MinLimit=0;}foreach(var p in prtPistH){p.Velocity=-prtHSpeed;p.MinLimit=0;}foreach(var p in prtPist){p.Velocity=-0.5f;p.MinLimit=0;}foreach(var w in prtWeld)w.Enabled=false;}

void UpdatePrinter(){if(!printing)return;if(padMerge!=null)padMerge.Enabled=true;var pm=new List<IMyShipMergeBlock>();GridTerminalSystem.GetBlocksOfType(pm);foreach(var m in pm){if(m!=padMerge&&!m.Enabled)m.Enabled=true;}if(prtProj==null||prtProj.RemainingBlocks==0){StopPrint();return;}if(prtPistV.Count==0||prtPistH.Count==0){UpdatePrinterLegacy();return;}Func<float>gV=()=>{float v=0;foreach(var p in prtPistV)v+=p.CurrentPosition;return v/prtPistV.Count;};Action sH=()=>{prtHPos-=prtHStep;if(prtHPos<0)prtHPos=0;if(prtHPos<=0.05f){StopPrint();return;}foreach(var p in prtPistH){p.Velocity=-prtHSpeed;}prtState=4;};switch(prtState){case 0:bool vZ=true,hR=true;foreach(var p in prtPistV){p.MinLimit=0;float d=p.CurrentPosition-prtVZero;if(d<-0.2f){p.Velocity=prtVSpeed;vZ=false;}else if(d>0.2f){p.Velocity=-prtVSpeed;vZ=false;}else p.Velocity=0;}foreach(var p in prtPistH){p.MinLimit=0;p.Velocity=prtHSpeed;if(p.CurrentPosition<prtHMax-0.1f)hR=false;}if(vZ&&hR){prtHPos=prtHMax;foreach(var p in prtPistV){p.MaxLimit=prtVMax;p.Velocity=prtVSpeed;}foreach(var p in prtPistH)p.Velocity=0;foreach(var w in prtWeld)w.Enabled=true;prtState=1;}break;case 1:foreach(var p in prtPistV)p.Velocity=prtVSpeed;float c1=gV();if(Math.Abs(c1-prtLastVPos)<0.01f)prtST++;else prtST=0;prtLastVPos=c1;if(prtST>10){foreach(var p in prtPistV)p.Velocity=0;prtST=0;prtLastVPos=0;sH();break;}bool aT=true;foreach(var p in prtPistV)if(p.CurrentPosition<prtVMax-0.1f)aT=false;if(aT){foreach(var p in prtPistV)p.Velocity=-prtVSpeed;prtST=0;prtLastVPos=0;prtState=2;}break;case 2:foreach(var p in prtPistV)p.Velocity=-prtVSpeed;float c2=gV();if(Math.Abs(c2-prtLastVPos)<0.01f)prtST++;else prtST=0;prtLastVPos=c2;if(prtST>10){foreach(var p in prtPistV)p.Velocity=0;prtST=0;prtLastVPos=0;sH();break;}bool aB=true;foreach(var p in prtPistV)if(p.CurrentPosition>0.1f)aB=false;if(aB){foreach(var p in prtPistV)p.Velocity=prtVSpeed;prtST=0;prtLastVPos=0;prtState=3;}break;case 3:foreach(var p in prtPistV)p.Velocity=prtVSpeed;float c3=gV();if(Math.Abs(c3-prtLastVPos)<0.01f)prtST++;else prtST=0;prtLastVPos=c3;bool vAt=true;foreach(var p in prtPistV)if(p.CurrentPosition<prtVZero-0.2f)vAt=false;if(vAt||prtST>10){foreach(var p in prtPistV)p.Velocity=0;prtST=0;prtLastVPos=0;sH();}break;case 4:bool hC=true;foreach(var p in prtPistH)if(p.CurrentPosition>prtHPos+0.05f)hC=false;if(hC){foreach(var p in prtPistH)p.Velocity=0;foreach(var p in prtPistV)p.Velocity=prtVSpeed;prtState=1;}break;}}
void UpdatePrinterLegacy(){switch(prtState){case 0:bool iR=true;foreach(var p in prtPist){p.Velocity=-0.5f;if(p.CurrentPosition>0.1f)iR=false;}if(iR){foreach(var p in prtPist)p.Velocity=0.5f;prtState=1;}break;case 1:bool eX=true;foreach(var p in prtPist)if(p.CurrentPosition<p.MaxLimit-0.05f)eX=false;if(eX){foreach(var p in prtPist)p.Velocity=-prtSpeed;foreach(var w in prtWeld)w.Enabled=true;prtState=2;}break;case 2:bool rT=true;foreach(var p in prtPist)if(p.CurrentPosition>p.MinLimit+0.05f)rT=false;if(rT){int bd=prtProj!=null?prtProj.BuildableBlocksCount:0;if(bd>0){foreach(var p in prtPist)p.Velocity=0;}else{foreach(var w in prtWeld)w.Enabled=false;foreach(var p in prtPist)p.Velocity=0.5f;prtState=1;}}break;}}

void DoApply(){
if(cS==S.GONE){
if(abtS){mslLnch=false;hasTlm=false;abtQ=false;abtS=false;cS=S.IDLE;return;}
if((DT-lnchT).TotalSeconds<5){Echo("Action blocked: Launch grace period");return;}
if(mslBO){abtQ=true;return;}
if(!abtQ){abtQ=true;Echo("ABORT ARMED - Press again to confirm");return;}
RemoteDetonate();abtS=true;abtT=DT;abtQ=false;return;
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
else if(sel==6)ToggleAutoSalvo();
else if(sel==7&&kPads.Count>0){isCtl=true;cM=M.MAIN;sel=0;ctrlSel=0;}
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
else if(sel==2){cM=M.MAIN;sel=0;}
break;
case M.SET:
if(sel==0){if(clbDst<1000)clbDst+=250;else if(clbDst<3000)clbDst+=500;else if(clbDst<5000)clbDst+=1000;else if(clbDst<10000)clbDst+=2500;else clbDst=500;}
else if(sel==1){detDist+=10;if(detDist>100)detDist=10;}
else if(sel==2){if(cntDn<30)cntDn+=5;else if(cntDn<60)cntDn+=15;else if(cntDn<120)cntDn+=30;else if(cntDn<300)cntDn+=60;else cntDn=10;}
else if(sel==3){sensorRng+=10;if(sensorRng>100)sensorRng=10;}
else if(sel==4){lidarRng+=500;if(lidarRng>5000)lidarRng=500;}
else if(sel==5){fltMd=(fltMd+1)%3;}
else if(sel==6){if(reDst<2000)reDst+=500;else if(reDst<5000)reDst+=1000;else if(reDst<10000)reDst+=2500;else reDst=500;}
else if(sel==7){antBC=!antBC;}
else if(sel==8){ammoTypeIdx=(ammoTypeIdx+1)%ammoNames.Length;UpdateAmmoType();}
else if(sel==9){ammoLoad+=1000;if(ammoLoad>50000)ammoLoad=1000;}
else if(sel==10){ammoEject+=1000;if(ammoEject>50000)ammoEject=1000;}
else if(sel==11){}
else if(sel==12){iceTarget+=500;if(iceTarget>5000)iceTarget=500;}
else if(sel==13){uranTarget+=10;if(uranTarget>200)uranTarget=10;}
else if(sel==14){h2PT+=10;if(h2PT>100)h2PT=50;}
else if(sel==15){o2PT+=10;if(o2PT>100)o2PT=50;}
else if(sel==16){h2Target+=10;if(h2Target>100)h2Target=10;}
else if(sel==17){o2Target+=10;if(o2Target>100)o2Target=10;}
else if(sel==18){toolTarget+=5;if(toolTarget>50)toolTarget=5;}
else if(sel==19){isCreative=!isCreative;}
else if(sel==20){mergePaused=!mergePaused;if(!mergePaused&&padMerge!=null){padMerge.Enabled=true;IGC.SendBroadcastMessage(bcTag+"_CMD","MERGE");}}
else if(sel==21){if(padMerge!=null){padMerge.Enabled=!padMerge.Enabled;if(padMerge.Enabled)IGC.SendBroadcastMessage(bcTag+"_CMD","MERGE");}}
else if(sel==22)TC(padCon);else if(sel==23)TC(padCon1);else if(sel==24)TC(padCon2);
else if(sel==25){tlmTO+=300;if(tlmTO>1800)tlmTO=300;}
else if(sel==26){graphTimeIdx=(graphTimeIdx+1)%graphLabels.Length;}
else if(sel==27){bldNum=0;}
else if(sel==28){clbDst=500;detDist=50;cntDn=10;sensorRng=50;lidarRng=500;reDst=500;antBC=true;fltMd=2;tgtGPS=new Vector3D(0,0,0);tgtName="";tgtSet=false;wpIdx=0;tM=T.GPS;isCreative=false;ammoLoad=10106;ammoEject=10106;tlmTO=1000;ammoTypeIdx=0;graphTimeIdx=0;h2PT=90;o2PT=90;bldNum=0;mergePaused=false;tgtRel=0;asCoolSec=15;asLoop=true;UpdateAmmoType();WriteSalvoConfig();}
else if(sel==29){int[]cv={0,5,10,15,30,60};int ci=0;for(int i=0;i<cv.Length;i++){if(cv[i]==asCoolSec){ci=i;break;}}asCoolSec=cv[(ci+1)%cv.Length];WriteSalvoConfig();}
else if(sel==30){asLoop=!asLoop;WriteSalvoConfig();}
else if(sel==31){cM=M.MAIN;sel=0;}
break;
case M.WIZARD:
if(sel==0){DetectEnvironment();Scan();}
else if(sel==1){cM=M.TGT;sel=0;}
else if(sel==2){cM=M.SET;sel=0;}
else if(sel==3){setupDone=true;cM=M.MAIN;sel=0;}
break;
}}

void ShowCompileNotice(){
if(IsBootRunning()||IsBootComplete())return;
if(padID==0)padID=1;
if(padTag=="")padTag=$"[PAD{padID}";
var allLcds=new List<IMyTextPanel>();
GridTerminalSystem.GetBlocksOfType(allLcds,b=>{if(b.CubeGrid!=Me.CubeGrid)return false;string n=b.CustomName;return n.Contains($"[PAD{padID}]")||n.Contains($"[PAD{padID}:")||n.Contains($"[PAD{padID}-");});
if(allLcds.Count==0)return;
bool mslDocked=padMerge!=null&&padMerge.IsConnected;
bool invReady=false;bool sigReady=false;
if(invPB==null||signalPB==null)FindSiblingPBs();
if(invPB!=null&&padSession!="")invReady=invPB.CustomData.Contains($"inv_for_session={padSession}");
if(signalPB!=null&&padSession!="")sigReady=signalPB.CustomData.Contains($"signal_for_session={padSession}");
int sec=DateTime.Now.Second;
bool showSig=invReady&&sigReady&&(sec/5)%2==1;
bool showInv=invReady&&!sigReady&&(sec/5)%2==1;
foreach(var lcd in allLcds){
var sf=lcd as IMyTextSurface;if(sf==null)continue;
sf.ContentType=ContentType.SCRIPT;sf.Script="";sf.ScriptBackgroundColor=cBg;
var f=sf.DrawFrame();float y=20;
SH(f,y,"UNITY MISSILE SYSTEM",cAcc);y+=40;
string cH=sigReady?"SIGNAL SCRIPT COMPILED":invReady?"INVENTORY SCRIPT COMPILED":"PAD SCRIPT COMPILED";
string cN=sigReady?"Compile BOOT script":invReady?"Compile SIGNAL script":"Compile INVENTORY script";
string cS2=sigReady?(showSig?"PAD [OK] | INV [OK] | SIG [OK] <<<<":"PAD [OK] | INV [OK] | SIG [OK]"):invReady?(showInv?"PAD [OK] | INV [OK] <<<<":"PAD [OK] | INV [OK]"):"PAD [OK]";
ST(f,256,y,cH,cOK,0.7f,tAC);y+=40;
SBx(f,30,y,452,sigReady?80:invReady?80:100,cBg,cSec);y+=15;
ST(f,50,y,"NEXT STEP:",cPri,0.5f);y+=22;
ST(f,50,y,cN,cTxt,0.5f);if(!sigReady&&!invReady){y+=22;ST(f,50,y,"Then SIGNAL, then BOOT",cTxt,0.45f);}y+=40;
SBx(f,30,y,452,sigReady?90:60,cBg,cBdr);y+=12;
ST(f,50,y,"COMPILE ORDER:",cSec,0.45f);y+=20;
ST(f,50,y,"PAD > INV > SIGNAL > BOOT",cAcc,0.4f);y+=20;
ST(f,50,y,cS2,cOK,0.4f);
f.Dispose();
}}

void UpdateDisplays(){
if(lcd1!=null)UpdateLCD1();
if(lcd2!=null)UpdateLCD2();
if(lcd3!=null)UpdateLCD3();
if(lcd7!=null)UpdateLCD7();
if(lcd8!=null)UpdateLCD8();
if(bbLCDs.Count>0)UpdateBlackBox();
if(mmLCDs.Count>0)UpdateMiniMap();
Echo("Unity Missile System");
Echo($"UnityPad [PAD{padID}]");
Echo("+------------------+");
Echo($"| State: {cS,-9} |");
Echo("+------------------+");
bool mDock=padMerge!=null&&padMerge.IsConnected;
Echo($"Merge: {(mDock?"DOCKED":"--")} Con: {(padCon!=null?(padCon.Status==MyShipConnectorStatus.Connected?"LOCK":"RDY"):"--")}");
if(mDock){Echo($"MSL: Gyr:{mslGyr.Count} Thr:{mslThr.Count} WH:{mslWar.Count}");Echo($"     Bat:{mslBat.Count} H2:{mslH2.Count} Sen:{mslSen.Count}");}
else Echo("MSL: Not Docked");
Echo("--- PAD SYSTEMS ---");
Echo($"Bat:{padBat.Count} H2:{padH2.Count} O2:{padO2.Count} Gen:{padGen.Count}");
Echo($"Asm:{padAsm.Count} Ref:{padRef.Count} Cargo:{padCargo.Count}");
Echo($"Ant:{padAnt.Count} Cam:{padCam.Count} Sen:{padSen.Count}");
Echo($"Med:{padMedCount} Surv:{padSurvCount} Cryo:{padCryoCount}");
int lcdCnt=(lcd1!=null?1:0)+(lcd2!=null?1:0)+(lcd3!=null?1:0)+(lcd7!=null?1:0)+(lcd8!=null?1:0);
Echo($"LCDs:{lcdCnt}/5 Printer:{(prtProj!=null?"YES":"NO")}");
Echo($"Target: {(tgtGPS!=Vector3D.Zero?"GPS SET":"---")}");
if(isCtl){Echo("--- CONTROLLER MODE ---");Echo($"Fleet: {kPads.Count} pads online");foreach(int pid in kPads){string st=pStat.ContainsKey(pid)?pStat[pid]:"UNKNOWN";bool hasMissile=pMslF.ContainsKey(pid)&&pMslF[pid];bool isArmed=pArm.ContainsKey(pid)&&pArm[pid];string flags="";if(hasMissile)flags+=" Missile";if(isArmed)flags+=" Armed";Echo($"  PAD{pid}: {st}{flags}");}
Echo("--- COMMANDS ---");Echo("SETPADCONTROL COPYTGT BUILDALL");Echo("ARMALL LAUNCHALL STARTSALVO ABORTALL");}
else{Echo("--- COMMANDS ---");Echo("LAUNCH ARM DISARM PRINT RESCAN");Echo("AUTOSALVO SETPADCONTROL NAMEPAD NAMEMSL");}
}

void UpdateControllerLCD1(){
if(lcd1==null)return;var sf=lcd1 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);float y=5;
SH(f,y,$"COMMAND {Clk()}",cAcc);y+=32;
ST(f,20,y,$"PAD{padID}   Fleet: {kPads.Count} pads",cTxt,0.5f);y+=20;
if(svAct){SBx(f,15,y,482,22,cErr*0.3f,cErr);ST(f,256,y+2,$"SALVO {salvoIdx}/{kPads.Count}",cErr,0.5f,tAC);y+=28;}
else{ST(f,20,y,$"Status: {(cS==S.GONE?"TRACKING":cS.ToString())}",cS==S.GONE?cErr:cPri,0.5f);y+=22;}
string selP=kPads.Count>0?$"PAD{kPads[ctrlPadSel]}":"NONE";string patS=cPat==0?"LINE":cPat==1?"GRID":"CIRCLE";
var it=new List<string>{"Copy Target All","Build All","Arm All","Launch All","Salvo Mode",$"Carpet: {patS}",$"Kill All [{(aAtk?"ON":"OFF")}]","Abort All",$"Satellites [{(aRS?"ON":"OFF")}]",$"Auto Fire [{(asCycle?"ON":"OFF")}]",$"Select: {selP}","Settings","Exit Control"};
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
if(kPads.Count==0){ST(f,256,y,"Scanning for pads...",cSec,0.5f,tAC);}
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
if(hasTlm){bool _sC=mslPhase.StartsWith("SAT");SBx(f,15,y,482,80,cBg,_sC?cPri:cErr);y+=10;ST(f,25,y,"THIS PAD",_sC?cPri:cErr,0.5f);y+=22;ST(f,25,y,$"Phase: {mslPhase}",cPri,0.5f);y+=20;ST(f,25,y,_sC?$"Alt: {mslAlt:F0}m":$"Distance: {mslDTT:F0}m",cTxt,0.5f);y+=20;ST(f,25,y,$"Speed: {mslSpeed:F0}m/s",cTxt,0.5f);}
else if(cS==S.GONE){ST(f,256,y,mslBO?"BLACKOUT":"NO SIGNAL",cWrn,0.6f,tAC);}
else{ST(f,256,y,"No active flight",cSec,0.55f,tAC);}
y+=10;foreach(int pid in kPads){if(!pStat.ContainsKey(pid)||pStat[pid]!="GONE")continue;if(pid==padID&&hasTlm)continue;ST(f,25,y,$"PAD{pid}: IN FLIGHT",cErr,0.45f);y+=16;}
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
else{ST(f,256,y,"No satellites deployed",cSec,0.55f,tAC);y+=25;ST(f,256,y,"Use Satellite mode to deploy",cSec,0.45f,tAC);}
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
case 7:BroadcastCommand("ABORT","");if(cS==S.GONE){if(mslBO){abtQ=true;}else{RemoteDetonate(true);abtS=true;abtT=DT;}}break;
case 8:aRS=!aRS;break;
case 9:ToggleAutoSalvo();break;
case 10:if(kPads.Count>0)ctrlPadSel=(ctrlPadSel+1)%kPads.Count;break;
case 11:cM=M.SET;sel=0;break;
case 12:isCtl=false;cM=M.MAIN;sel=0;break;
}}
void UpdateLCD1(){
if(lcd1==null)return;
if(!IsBootComplete())return;
if(isCtl&&cM==M.MAIN){UpdateControllerLCD1();return;}
if(viewLCD>0){ShowView();return;}
var sf=lcd1 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);float y=5;
Color hc=cS==S.ARM?cErr:cS==S.READY?cOK:!setupDone?cWrn:cPri;
if(shwOut){
int ago=(int)(DT-outT).TotalSeconds;Color oc=mslOutcome.Contains("HIT")?cOK:mslOutcome=="ABORTED"?cErr:cWrn;
SH(f,y,"MISSION COMPLETE",oc);y+=40;
ST(f,256,y,mslOutcome,oc,0.9f,tAC);y+=50;
ST(f,20,y,$"Phase: {finalPhase}",cTxt);y+=25;
ST(f,20,y,$"Distance: {fnlDTT:F0}m",cTxt);y+=25;
ST(f,20,y,$"+{ago}s since signal",cTxt);y+=40;
SMI(f,y,0,"Acknowledge",sel==0);
f.Dispose();return;}
if(cS==S.GONE){
if(abtS){int sd=(int)(DT-abtT).TotalSeconds;SH(f,y,"DETONATED",cErr);y+=40;ST(f,256,y,"TARGET DESTROYED",cErr,0.8f,tAC);y+=40;ST(f,256,y,$"+{sd}s ago",cTxt,0.6f,tAC);y+=60;ST(f,256,y,"Press APPLY to reset",cTxt,0.5f,tAC);f.Dispose();return;}
int ago=(int)(DT-lnchT).TotalSeconds;int eta1=mslSpeed>10?(int)(mslDTT/mslSpeed):0;
SH(f,y,$"FLIGHT {Clk()}",cErr);y+=35;
ST(f,20,y,$"T+{ago}s   {mslSpeed:F0} m/s",cTxt);y+=25;
if(mslBO){ST(f,256,y,"SIGNAL BLACKOUT",cWrn,0.7f,tAC);y+=25;if(abtQ)ST(f,256,y,"ABORT QUEUED",cErr,0.6f,tAC);}
else if(hasTlm){bool isSat=mslPhase.StartsWith("SAT");ST(f,20,y,$"Phase: {mslPhase}",cPri);y+=22;ST(f,20,y,isSat?$"Altitude: {mslAlt:F0}m":$"Distance: {mslDTT:F0}m",cTxt);y+=22;ST(f,20,y,isSat?(mslPhase=="SAT_HOLD"?"ON STATION":"DEPLOYING"):eta1>0?$"ETA: {ClkAtSec(eta1)}":"Calculating...",cTxt);y+=25;float fp=(float)mslFuelPct/100f;SLB(f,20,y,300,12,"Fuel",fp,PctCol(fp),cBdr);}
else{ST(f,256,y,"NO SIGNAL",cWrn,0.7f,tAC);}
y=235;SMI(f,y,0,"Abort Mission",sel==0);
f.Dispose();return;}
string stStr=cS==S.ARM?"ARMED":cS==S.READY?"READY":cS==S.PRINT?"PRINTING":cS==S.BUILD?"BUILDING":mslFound?"DOCKED":"IDLE";
SH(f,y,$"CONTROL {Clk()}",hc);y+=32;
SBx(f,15,y,482,24,cBg,hc);ST(f,256,y+2,stStr+(setupDone?"":" - SETUP REQUIRED"),hc,0.55f,tAC);y+=35;
if(cS==S.ARM&&counting&&cntDn>0){int rem=cntDn-(int)(DT-armTime).TotalSeconds;if(rem<0)rem=0;string rs=rem>=60?$"{rem/60}:{rem%60:D2}":$"{rem}s";ST(f,256,y,$"T-{rs} @ {ClkAtSec(rem)}",cErr,0.7f,tAC);y+=30;}
switch(cM){
case M.MAIN:
bool canL=(tgtSet||tM!=T.GPS)&&setupDone;bool canSkip=(cS==S.FUEL||cS==S.DOCK);
int _cr=cntDn-(int)(DT-armTime).TotalSeconds;string _cs=_cr>=60?$"{_cr/60}:{_cr%60:D2}":$"{_cr}";string lt=cS==S.ARM&&counting&&cntDn>0?(_cr>0?$"T-{_cs}":"GO!"):"Launch";
string m0=canSkip?"Skip Load":(canL?lt:setupDone?"No Target":"Setup Required");
y=90;SMI(f,y,0,m0,sel==0);y+=28;SMI(f,y,1,"Target",sel==1);y+=28;SMI(f,y,2,"Config",sel==2);y+=28;
SMI(f,y,3,printing?"Stop Print":"Print",sel==3);y+=28;SMI(f,y,4,"Setup",sel==4);y+=28;SMI(f,y,5,"View",sel==5);y+=28;
SMI(f,y,6,$"Auto Fire [{(asCycle?"ON":"OFF")}]",sel==6);
if(asCycle){y+=20;string atgt=tM==T.GPS&&wpts.Count>0?$"GPS {asIdx+1}/{wpts.Count}: {tgtName}":tgtName;
ST(f,30,y,$"{atgt}  #{asFired}",cWrn,0.4f);
if(asCooling){int cr=asCoolSec-(int)(DT-asCoolT).TotalSeconds;if(cr<0)cr=0;ST(f,30,y+14,$"Cooldown: {cr}s",cErr,0.4f);}}
if(kPads.Count>0){y+=28;SMI(f,y,7,"Command Menu",sel==7);}
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
string fmS=fltMd==0?"AUTO":fltMd==1?"ICBM":"DIRECT";string clS=fltMd==1?"N/A":(clbDst>=1000?$"{clbDst/1000f:0.#}km":$"{clbDst}m");string tmS=cntDn>=60?$"{cntDn/60}m{cntDn%60}s":$"{cntDn}s";string reS=reDst>=1000?$"{reDst/1000f:0.#}km":$"{reDst}m";
var si=new List<string>{$"Climb: {clS}",$"Detonate: {detDist}m",$"T-Minus: {tmS}",$"Sensor: {sensorRng}m",$"LIDAR: {lidarRng}m",$"Flight: {fmS}",$"Reentry: {reS}",$"Broadcast: {(antBC?"ON":"OFF")}",$"Payload: {ammoNames[ammoTypeIdx]}",$"Load: {ammoLoad}",$"Eject: {ammoEject}",$"Stock: {ammoTarget/1000}k",$"Ice: {iceTarget}",$"Uranium: {uranTarget}",$"H2 Tank: {h2PT}%",$"O2 Tank: {o2PT}%",$"H2 Bot: {h2Target}",$"O2 Bot: {o2Target}",$"Tools: {toolTarget}",$"Mode: {(isCreative?"CREATIVE":"SURVIVAL")}",$"Auto: {(mergePaused?"PAUSED":"ACTIVE")}",$"Merge: {(padMerge==null?"N/A":padMerge.Enabled?"ON":"OFF")}",$"Dock: {CnS(padCon)}",$"Con1: {CnS(padCon1)}",$"Con2: {CnS(padCon2)}",$"Timeout: {tlmTO}s",$"Graph: {graphLabels[graphTimeIdx]}",$"Missile#: {bldNum}","RESET ALL",$"Salvo CD: {asCoolSec}s",$"Salvo Loop: {(asLoop?"YES":"NO")}","BACK"};
if(sel<setScroll)setScroll=sel;if(sel>=setScroll+SET_VISIBLE)setScroll=sel-SET_VISIBLE+1;
y=70;ST(f,20,y,$"SETTINGS [{sel+1}/{si.Count}]",cPri,0.55f);y+=22;
if(setScroll>0){ST(f,256,y,"^ more ^",cSec,0.4f,tAC);y+=18;}else y+=18;
for(int i=setScroll;i<Math.Min(setScroll+SET_VISIBLE,si.Count);i++){SMI(f,y,i,si[i],sel==i);y+=22;}
if(setScroll+SET_VISIBLE<si.Count)ST(f,256,y,"v more v",cSec,0.4f,tAC);break;
case M.WIZARD:
string ev=env==E.SPACE?"SPACE":env==E.PLANET?"PLANET":env==E.MOON?"MOON":"???";
int lc=(lcd1!=null?1:0)+(lcd2!=null?1:0)+(lcd3!=null?1:0)+(lcd7!=null?1:0)+(lcd8!=null?1:0);
bool w1=padMerge!=null&&padCon!=null,w2=lc>=3,w3=btn!=null,w4=mslFound,w5=tgtSet||tM!=T.GPS;
int wDone=(w1?1:0)+(w2?1:0)+(w3?1:0)+(w4?1:0)+(w5?1:0);float wPct=wDone/5f;
y=80;ST(f,20,y,"INITIAL SETUP",cAcc,0.65f);y+=25;
SB(f,20,y,472,10,wPct,PctCol(wPct),cBdr);y+=18;
ST(f,20,y,$"Environment: {ev}   LCDs: {lc}/5",cTxt,0.5f);y+=22;
ST(f,20,y,$"{(w1?"[X]":"[o]")} Pad   {(w3?"[X]":"[o]")} Button   {(w4?"[X]":"[o]")} Missile",w1&&w3&&w4?cOK:cWrn,0.5f);y+=22;
ST(f,20,y,$"{(w5?"[X]":"[o]")} Target   {(setupDone?"[READY]":"")}",w5?cOK:cWrn,0.5f);y+=28;
SMI(f,y,0,"Rescan",sel==0);y+=26;SMI(f,y,1,"Target",sel==1);y+=26;SMI(f,y,2,"Config",sel==2);y+=26;
if(w1&&w2&&w3&&w4&&w5)setupDone=true;
SMI(f,y,3,setupDone?"Launch!":"Continue",sel==3);break;}
f.Dispose();}

void UpdateLCD2(){
if(lcd2==null)return;
if(!IsBootComplete())return;
if(isCtl){UpdateControllerLCD2();return;}
var sf=lcd2 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);float y=5;
if(cS==S.GONE){
int ago2=(int)(DT-lnchT).TotalSeconds;int eta2=mslSpeed>10?(int)(mslDTT/mslSpeed):0;
SH(f,y,$"FLIGHT {Clk()}",cErr);y+=35;
ST(f,20,y,$"T+{ago2}s",cTxt);y+=22;
if(hasTlm){bool _s2=mslPhase.StartsWith("SAT");ST(f,20,y,mslPhase,cPri);y+=20;ST(f,20,y,_s2?$"Alt: {mslAlt:F0}m  {mslSpeed:F0}m/s":$"{mslDTT:F0}m  {mslSpeed:F0}m/s",cTxt);y+=20;ST(f,20,y,_s2?(mslPhase=="SAT_HOLD"?"ON STATION":"DEPLOYING"):eta2>0?$"IMPACT @ {ClkAtSec(eta2)}":"Calculating...",cWrn);}
else if(mslBO){ST(f,256,y,"BLACKOUT",cWrn,0.7f,tAC);y+=22;ST(f,20,y,lKPh,cSec);}
else{ST(f,256,y,"NO SIGNAL",cWrn,0.7f,tAC);}
y+=25;bool lsr=false;foreach(var l in padLsr)if(l.Status==MyLaserAntennaStatus.Connected)lsr=true;
ST(f,20,y,$"Laser: {(lsr?"LINKED":"OFF")}",lsr?cOK:cSec);
f.Dispose();return;}
SH(f,y,"BUILD STATUS",cPri);y+=32;
if(prtProj==null){ST(f,256,y,"NO PROJECTOR",cWrn,0.6f,tAC);f.Dispose();return;}
if(prtProj.RemainingBlocks==0&&prtProj.TotalBlocks>0&&mslFound){
ST(f,256,y,"BUILD COMPLETE",cOK,0.6f,tAC);y+=22;
ST(f,256,y,"Update Missile PB",cWrn,0.45f,tAC);y+=20;
}else if(prtProj.RemainingBlocks==0){
ST(f,256,y,mslFound?"READY":"NO BLUEPRINT",mslFound?cOK:cSec,0.6f,tAC);y+=22;
}else{
int tot=prtProj.TotalBlocks,rem=prtProj.RemainingBlocks;float pct=tot>0?(float)(tot-rem)/tot:0;
ST(f,20,y,isCreative?"CREATIVE":"SURVIVAL",cAcc,0.45f);y+=18;
SLB(f,20,y,350,12,"Progress",pct,PctCol(pct),cBdr);y+=28;
ST(f,20,y,$"Blocks: {tot-rem}/{tot}  Buildable: {prtBuildable}",cTxt,0.4f);y+=18;}
int maxRows=(int)((lcdH-y*lcdYS-60*lcdYS)/(18*lcdYS));int maxC=Math.Max(8,maxRows);
var dispNd=bpNd.Count>0?bpNd:cNd;var dispMis=bpNd.Count>0?bpMis:cMis;
string hdr=bpNd.Count>0?"BLUEPRINT NEEDS":"PRODUCTION QUOTAS";
ST(f,20,y,$"{hdr} [{bldScroll+1}-{Math.Min(bldScroll+maxC,dispNd.Count)}/{dispNd.Count}]:",cSec,0.45f);y+=18;
int cc=0,ci=0;foreach(var kv in dispNd){if(ci++<bldScroll)continue;if(cc>=maxC)break;int hv=cStk.ContainsKey(kv.Key)?cStk[kv.Key]:0;int nd=Math.Max(0,kv.Value-hv);Color nc=hv>=kv.Value?cOK:cErr;ST(f,20,y,$"{kv.Key}: {hv}+{nd}/{kv.Value}",nc,0.42f);y+=16;cc++;}
if(dispMis.Count>0&&cc<maxC){foreach(var kv in dispMis){if(cc>=maxC)break;ST(f,25,y,$"-{kv.Key}: {kv.Value}",cErr,0.38f);y+=14;cc++;}}
y+=8;int ammoNd=Math.Max(0,mslAmmoTarget-ammoStock);ST(f,20,y,$"Ammo ({ammoNames[ammoTypeIdx]}): {ammoStock}+{ammoNd}/{mslAmmoTarget}",ammoStock>=mslAmmoTarget?cOK:cWrn,0.5f);
y+=22;int refW=0,asmW=0;foreach(var r in padRef)if(r.IsProducing)refW++;foreach(var a in padAsm)if(a.IsProducing)asmW++;
ST(f,20,y,$"Refineries: {refW}/{padRef.Count}   Assemblers: {asmW}/{padAsm.Count}",cTxt,0.5f);
f.Dispose();}

void UpdateLCD3(){
if(lcd3==null)return;
if(!IsBootComplete())return;
if(isCtl){UpdateControllerLCD3();return;}
var sf=lcd3 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);
if(cS==S.GONE){
int ago=(int)(DT-lnchT).TotalSeconds;
SH(f,10,"MISSILE POSITION",cErr);
ST(f,20,60,$"Flight Time: +{ago} seconds",cTxt,0.6f);
if(hasTlm){
ST(f,20,110,$"X Position: {mslPos.X:F0}",cPri,0.6f);
ST(f,20,160,$"Y Position: {mslPos.Y:F0}",cPri,0.6f);
ST(f,20,210,$"Z Position: {mslPos.Z:F0}",cPri,0.6f);
SD(f,270);
bool _iS=mslPhase.StartsWith("SAT");
ST(f,20,300,_iS?$"Altitude: {mslAlt:F0}m":$"Distance to Target: {mslDTT:F0} meters",cAcc,0.6f);
ST(f,20,360,_iS?(mslPhase=="SAT_HOLD"?"ON STATION":"DEPLOYING"):$"Current Velocity: {mslSpeed:F0} m/s",cTxt,0.55f);}
else{ST(f,256,160,"NO SIGNAL",cWrn,0.8f,tAC);}
f.Dispose();return;}
SH(f,10,"MISSILE SYSTEMS",cPri);
if(!mslFound){
ST(f,256,60,"NO MISSILE DETECTED",cWrn,0.7f,tAC);
SD(f,110);
ST(f,20,140,"PRINTER STATUS",cAcc,0.6f);
if(prtProj!=null){
int rem=prtProj.RemainingBlocks,tot=prtProj.TotalBlocks,bld=prtProj.BuildableBlocksCount;
float pct=tot>0?(float)(tot-rem)/tot:0;
SLB(f,20,190,380,18,"Build Progress",pct,pct>=1?cOK:pct>0?cWrn:cSec,cBdr);
string ps=prtState==0?"ALIGN":prtState==1?"UP PASS":prtState==2?"DOWN PASS":prtState==3?"REALIGN":prtState==4?"H STEP":"IDLE";
ST(f,20,250,$"State: {ps}",printing?cOK:cSec,0.55f);
ST(f,20,290,$"Blocks: {tot-rem} / {tot}",cTxt,0.55f);
float vPos=0;if(prtPistV.Count>0){foreach(var p in prtPistV)vPos+=p.CurrentPosition;vPos/=prtPistV.Count;}
float hPos=0;if(prtPistH.Count>0){foreach(var p in prtPistH)hPos+=p.CurrentPosition;hPos/=prtPistH.Count;}
ST(f,20,340,$"Vertical: {vPos:F1}m  Zero: {prtVZero:F1}m  Max: {prtVMax:F1}m",cTxt,0.5f);
ST(f,20,380,$"Horizontal: {hPos:F1}m  Target: {prtHPos:F1}m  Max: {prtHMax:F1}m",cTxt,0.5f);
if(bld>0)ST(f,20,430,$"Ready to weld: {bld} blocks",cOK,0.55f);
else if(rem>0)ST(f,20,430,$"Remaining: {rem} blocks",cWrn,0.55f);
else if(tot>0)ST(f,20,430,"Build complete!",cOK,0.6f);
else ST(f,20,430,"No blueprint loaded",cSec,0.55f);
}else{ST(f,20,200,"No projector found",cSec,0.6f);}
f.Dispose();return;}
string gs=padMerge!=null?(padMerge.CubeGrid.GridSize>1?"LARGE":"SMALL"):"?";
ST(f,20,55,$"Grid: {gs}   Computer: {(mslPB!=null?"OK":"MISSING")}   Remote: {(mslRC!=null?"OK":"MISSING")}",cTxt,0.5f);
if(mslPB!=null&&prtProj!=null&&prtProj.RemainingBlocks==0){ST(f,256,85,"Reload Programmable Block!",cWrn,0.55f,tAC);}
ST(f,20,115,$"Thrusters: Atmospheric: {thrAtmo}  Hydrogen: {thrH2}  Ion: {thrIon}",cTxt,0.5f);
ST(f,20,155,$"Total Thrust: {mslThr.Count}   Gyroscopes: {mslGyr.Count}",mslThr.Count>0&&mslGyr.Count>0?cOK:cErr,0.5f);
float bp=batPct/100f;SLB(f,20,200,350,15,"Battery",bp,PctCol(bp),cBdr);
ST(f,390,200,bp>=1f?"FULL":$"{mslBatCur:F2}/{mslBatMax:F2}",bp>=1f?cOK:cWrn,0.45f);
float hp=h2Pct/100f;SLB(f,20,250,350,15,"Hydrogen",hp,PctCol(hp),cBdr);
ST(f,390,250,hp>=1f?"FULL":$"{mslH2Cur:F0}/{mslH2Max:F0}L",hp>=1f?cOK:cWrn,0.45f);
ST(f,20,305,$"Generators: {mslGen.Count}   Warheads: {mslWar.Count}",cTxt,0.55f);
Color wc=mslWar.Count==0?cSec:warArmed?cErr:cOK;string ws=mslWar.Count==0?"NONE":warArmed?"ARMED":"SAFE";
ST(f,20,350,$"Warhead Status: {ws}",wc,0.6f);
ST(f,20,400,$"Sensors: {mslSen.Count}   Cameras: {mslCam.Count}   Antennas: {mslAnt.Count}",cTxt,0.5f);
int lsC=0;foreach(var l in mslLsr)if(l.Status==MyLaserAntennaStatus.Connected)lsC++;
ST(f,20,445,$"Laser Antennas: {mslLsr.Count}   Linked: {lsC}",lsC>0?cOK:cSec,0.55f);
f.Dispose();}


void UpdateLCD7(){
if(lcd7==null)return;
if(!IsBootComplete())return;
if(isCtl){UpdateControllerLCD7();return;}
var sf=lcd7 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);
if(cS!=S.GONE){
SH(f,10,"FLIGHT COMMUNICATIONS",cPri);
int plLnk=0;foreach(var l in padLsr)if(l.Status==MyLaserAntennaStatus.Connected)plLnk++;
ST(f,20,60,$"Pad Antennas: {padAnt.Count}",cTxt,0.55f);
ST(f,20,100,$"Laser Antennas: {padLsr.Count}   Linked: {plLnk}",plLnk>0?cOK:cTxt,0.55f);
if(mslFound&&(mslAnt.Count>0||mslLsr.Count>0)){ST(f,20,150,$"Pre-Launch Comms: {(preLaunchCommsReady?"READY":"PENDING")}",preLaunchCommsReady?cOK:cWrn,0.55f);}
else{ST(f,20,150,"Pre-Launch Comms: N/A",cSec,0.55f);}
string md7=tM==T.GPS?"GPS":tM==T.ANTENNA?"ANTENNA":tM==T.SENSOR?"SENSOR":tM==T.LIDAR?"LIDAR":"MANUAL";
ST(f,20,230,$"Targeting Mode: {md7}",cAcc,0.6f);
ST(f,20,290,$"Target: {(tgtSet?tgtName:"NONE")}",tgtSet?cOK:cSec,0.6f);
ST(f,20,380,$"Game Mode: {(isCreative?"CREATIVE":"SURVIVAL")}",cTxt,0.55f);
ST(f,20,430,$"Environment: {(env==E.SPACE?"SPACE":env==E.PLANET?"PLANET":"MOON")}",cTxt,0.55f);
}else{
Color hc7=mslBO?cWrn:cErr;
int ago7=(int)(DT-lnchT).TotalSeconds;int eta7=mslSpeed>10?(int)(mslDTT/mslSpeed):0;
SH(f,10,"TELEMETRY",hc7);
ST(f,20,60,$"Flight Time: +{ago7} seconds",cTxt,0.6f);
ST(f,20,100,$"Current Time: {Clk()}",cSec,0.5f);
if(hasTlm){
bool _s7=mslPhase.StartsWith("SAT");
ST(f,20,150,$"Phase: {mslPhase}",cPri,0.65f);
ST(f,20,200,_s7?$"Altitude: {mslAlt:F0}m":$"Distance to Target: {mslDTT:F0} meters",cTxt,0.55f);
ST(f,20,250,_s7?$"Speed: {mslSpeed:F0} m/s":$"Velocity: {mslSpeed:F0} m/s",cTxt,0.55f);
ST(f,20,300,_s7?(mslPhase=="SAT_HOLD"?"ON STATION - MONITORING":"DEPLOYING TO GRID POSITION"):eta7>0?$"Impact ETA: {eta7} seconds @ {ClkAtSec(eta7)}":"Calculating arrival...",cAcc,0.55f);
float dp=_s7?(float)Math.Min(mslAlt/20000,1):1f-(float)(mslDTT/(mslDTT+1000));SLB(f,20,360,380,12,_s7?"Altitude":"Distance",dp,_s7?cPri:cErr,cBdr);
float sp=(float)Math.Min(mslSpeed/500,1);SLB(f,20,410,380,12,"Speed",sp,cPri,cBdr);}
else if(mslBO){ST(f,256,160,"COMMUNICATIONS BLACKOUT",cWrn,0.7f,tAC);ST(f,20,230,$"Last Known Phase: {lKPh}",cSec,0.55f);ST(f,20,280,$"Last Known Distance: {lKDst:F0} meters",cSec,0.55f);}
else{ST(f,256,160,"NO SIGNAL",cWrn,0.8f,tAC);}
bool lsr=false;foreach(var l in padLsr)if(l.Status==MyLaserAntennaStatus.Connected)lsr=true;
ST(f,20,460,$"Laser Relay: {(lsr?"LINKED":"OFF")}   [Press for ABORT]",lsr?cOK:cSec,0.5f);}
f.Dispose();}

void UpdateLCD8(){
if(lcd8==null)return;
if(!IsBootComplete())return;
if(isCtl){UpdateControllerLCD8();return;}
var sf=lcd8 as IMyTextSurface;if(sf==null)return;
var f=BL(sf);
if(cS==S.GONE){
int ago=(int)(DT-lnchT).TotalSeconds;
bool _sT=mslPhase.StartsWith("SAT");
SH(f,10,_sT?"SATELLITE TRACKING":"MISSILE TRACKING",_sT?cPri:cErr);
ST(f,20,55,$"Flight Time: +{ago} seconds",cTxt,0.6f);
ST(f,20,95,$"Phase: {mslPhase}",cPri,0.7f);
if(hasTlm){
ST(f,20,145,_sT?$"Altitude: {mslAlt:F0}m":$"Distance to Target: {mslDTT:F0} meters",cPri,0.55f);
ST(f,20,185,$"Velocity: {mslSpeed:F0} m/s",cTxt,0.55f);
ST(f,20,225,$"Position: {mslPos.X:F0}, {mslPos.Y:F0}, {mslPos.Z:F0}",cTxt,0.5f);
float fp=(float)mslFuelPct/100f;SLB(f,20,275,350,15,_sT?"H2 Remaining":"Fuel Remaining",fp,PctCol(fp),cBdr);
int eta=mslSpeed>10?(int)(mslDTT/mslSpeed):0;
ST(f,20,330,_sT?(mslPhase=="SAT_HOLD"?"ON STATION":"DEPLOYING TO GRID POSITION"):eta>0?$"Estimated Impact: {eta} seconds @ {ClkAtSec(eta)}":"Calculating arrival...",cAcc,0.55f);}
else if(mslBO){ST(f,256,140,"COMMUNICATIONS BLACKOUT",cWrn,0.7f,tAC);ST(f,20,200,$"Last Known Distance: {lKDst:F0} meters",cSec,0.55f);}
else{ST(f,256,140,"SIGNAL LOST",cErr,0.8f,tAC);}
f.Dispose();return;}
if(cS==S.PRINT||cS==S.BUILD){
SH(f,10,"PRINTING MISSILE",cWrn);
string envS=env==E.SPACE?"SPACE":env==E.PLANET?"PLANET":"MOON";
ST(f,20,60,$"Environment: {envS}",cTxt,0.6f);
ST(f,20,100,$"Gravity: {gravStr:F2} m/s²",cTxt,0.6f);
if(prtProj!=null){int rem=prtProj.RemainingBlocks,tot=prtProj.TotalBlocks;float pp=tot>0?(float)(tot-rem)/tot:0;
SLB(f,20,160,380,18,"Build Progress",pp,PctCol(pp),cBdr);
ST(f,20,220,$"Blocks Completed: {tot-rem} / {tot}",cTxt,0.55f);
ST(f,20,260,$"Blocks Remaining: {rem}",rem>0?cWrn:cOK,0.55f);}
f.Dispose();return;}
string stNm=cS==S.DOCK?"DOCKING MISSILE":cS==S.FUEL?"LOADING MISSILE":cS==S.READY?"MISSILE READY":cS==S.ARM?"MISSILE ARMED":cS==S.LAUNCH?"LAUNCHING":"MISSILE STATUS";
Color stCol=cS==S.ARM?cErr:cS==S.READY?cOK:cS==S.FUEL?cWrn:cPri;
SH(f,10,stNm,stCol);
bool pmLk=padMerge!=null&&padMerge.IsConnected;
bool mmLk=mslMerge!=null&&mslMerge.IsConnected;
bool cnLk=IsLk(padCon);
ST(f,20,50,$"Pad Merge: {(pmLk?"LOCKED":"OPEN")}",pmLk?cOK:cErr,0.5f);
ST(f,260,50,$"Missile Merge: {(mmLk?"LOCKED":"OPEN")}",mmLk?cOK:cErr,0.5f);
ST(f,20,80,$"Connector: {(cnLk?"DOCKED":"OPEN")}",cnLk?cOK:cWrn,0.5f);
ST(f,260,80,$"Warheads: {mslWar.Count} [{(warArmed?"ARMED":"SAFE")}]",warArmed?cErr:cOK,0.5f);
if(!mslFound){ST(f,256,160,"NO MISSILE DOCKED",cWrn,0.7f,tAC);
ST(f,256,210,"Waiting for missile...",cSec,0.55f,tAC);}else{
float bp=batPct/100f;SLB(f,20,130,340,15,"Battery",bp,PctCol(bp),cBdr);
ST(f,380,130,bp>=1f?"FULL":$"{mslBatCur:F2}/{mslBatMax:F2}",bp>=1f?cOK:cWrn,0.45f);
float hp=h2Pct/100f;SLB(f,20,175,340,15,"Hydrogen",hp,PctCol(hp),cBdr);
ST(f,380,175,hp>=1f?"FULL":$"{mslH2Cur:F0}/{mslH2Max:F0}L",hp>=1f?cOK:cWrn,0.45f);
float ry=220;
if(mslO2.Count>0){float op=o2Pct/100f;SLB(f,20,ry,340,15,"Oxygen",op,PctCol(op),cBdr);ST(f,380,ry,op>=1f?"FULL":$"{mslO2Cur:F0}/{mslO2Max:F0}L",op>=1f?cOK:cWrn,0.45f);}
else{SLB(f,20,ry,340,15,"Oxygen",0,cSec,cBdr);ST(f,380,ry,"N/A",cSec,0.45f);}ry+=45;
if(mslGen.Count>0){float ip=icePct/100f;SLB(f,20,ry,340,15,"Ice Storage",ip,PctCol(ip),cBdr);ST(f,380,ry,ip>=1f?"FULL":$"{mslIceCur:F1}/{mslIceMax:F1}L",ip>=1f?cOK:cWrn,0.45f);}
else{SLB(f,20,ry,340,15,"Ice Storage",0,cSec,cBdr);ST(f,380,ry,"N/A",cSec,0.45f);}ry+=45;
if(mslReact.Count>0){int mslUran=0;foreach(var r in mslReact){var rI=r.GetInventory();if(rI!=null){var rt=new List<MyInventoryItem>();rI.GetItems(rt);foreach(var x in rt)if(x.Type.SubtypeId=="Uranium")mslUran+=(int)x.Amount;}}float up=mslUran/(float)uranTarget;SLB(f,20,ry,340,15,"Uranium",up>1?1:up,PctCol(up),cBdr);ST(f,380,ry,$"{mslUran}/{uranTarget}",mslUran>=uranTarget?cOK:cWrn,0.45f);}
else{SLB(f,20,ry,340,15,"Uranium",0,cSec,cBdr);ST(f,380,ry,"N/A",cSec,0.45f);}ry+=45;
float ap=mslConAmmo!=null?(float)mslAmmo/ammoLoad:0;Color ac=mslConAmmo==null?cErr:PctCol(ap);SLB(f,20,ry,340,15,ammoNames[ammoTypeIdx],ap>1?1:ap,ac,cBdr);
string ast=mslConAmmo==null?"NO CONNECTOR":mslAmmo>=ammoLoad?"READY":$"{mslAmmo}/{ammoLoad}";
ST(f,380,ry,ast,mslConAmmo==null?cErr:mslAmmo>=ammoLoad?cOK:cWrn,0.45f);ry+=45;
ST(f,20,ry+15,$"Thrusters: {mslThr.Count}   Gyroscopes: {mslGyr.Count}   Remote Control: {(mslRC!=null?"OK":"NONE")}",cTxt,0.48f);
ST(f,20,ry+50,$"Computer: {(mslPB!=null?"OK":"NONE")}   Sensors: {mslSen.Count}   Cameras: {mslCam.Count}",cTxt,0.48f);}
string md=tM==T.GPS?"GPS":tM==T.ANTENNA?"ANTENNA":tM==T.SENSOR?"SENSOR":tM==T.LIDAR?"LIDAR":"MANUAL";
ST(f,20,425,$"Targeting Mode: {md}",cAcc,0.55f);
ST(f,20,460,$"Target: {(tgtSet?tgtName:"NONE")}",tgtSet?cOK:cSec,0.55f);
if(tgtSet&&tM==T.GPS){ST(f,260,460,$"GPS: {tgtGPS.X:F0}, {tgtGPS.Y:F0}, {tgtGPS.Z:F0}",cTxt,0.45f);}
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
if(prtProj==null){ST(f,256,y,"No Projector",cWrn,0.55f,tAC);}
else{int t2=prtProj.TotalBlocks,r2=prtProj.RemainingBlocks;float p2=t2>0?(float)(t2-r2)/t2:0;
ST(f,20,y,isCreative?"CREATIVE":"SURVIVAL",cAcc,0.5f);y+=22;SLB(f,20,y,350,10,"Progress",p2,PctCol(p2),cBdr);y+=30;
ST(f,20,y,$"Blocks: {t2-r2}/{t2}  Buildable: {prtBuildable}",cTxt,0.45f);y+=20;}
ST(f,20,y,$"Ammo: {ammoStock}/{mslAmmoTarget}{(ammoQueued>0?$" +{ammoQueued}":"")}",cTxt,0.45f);break;
case 3:
if(!mslFound){ST(f,256,y,"No Missile",cWrn,0.55f,tAC);}
else{ST(f,20,y,$"PB: {(mslPB!=null?"OK":"X")}   RC: {(mslRC!=null?"OK":"X")}",cTxt,0.5f);y+=22;
ST(f,20,y,$"Thrusters: Atmo:{thrAtmo} H2:{thrH2} Ion:{thrIon}",cTxt,0.45f);y+=22;
float bp=batPct/100f,hp=h2Pct/100f;
SLB(f,20,y,150,8,"Battery",bp,PctCol(bp),cBdr);ST(f,175,y-2,$"{mslBatCur:F2}/{mslBatMax:F2}",cTxt,0.35f);y+=24;
SLB(f,20,y,150,8,"Hydrogen",hp,PctCol(hp),cBdr);ST(f,175,y-2,$"{mslH2Cur:F0}/{mslH2Max:F0}L",cTxt,0.35f);y+=24;
ST(f,20,y,$"Warheads: {mslWar.Count} [{(warArmed?"ARMED":"SAFE")}]",warArmed?cErr:cOK,0.5f);}break;
case 4:
ST(f,20,y,$"Mode: {tM}   Target: {(tgtSet?tgtName:"NONE")}",tgtSet?cOK:cWrn,0.5f);y+=25;
float bp4=batPct/100f,hp4=h2Pct/100f,ip4=icePct/100f;
SLB(f,20,y,130,8,"Power",bp4,PctCol(bp4),cBdr);ST(f,155,y-2,$"{mslBatCur:F2}/{mslBatMax:F2}",cTxt,0.32f);y+=22;
SLB(f,20,y,130,8,"H2",hp4,PctCol(hp4),cBdr);ST(f,155,y-2,$"{mslH2Cur:F0}/{mslH2Max:F0}L",cTxt,0.32f);y+=22;
SLB(f,20,y,130,8,"Ice",ip4,PctCol(ip4),cBdr);ST(f,155,y-2,$"{mslIceCur:F1}/{mslIceMax:F1}L",cTxt,0.32f);y+=24;
ST(f,20,y,$"Ammo: {mslAmmo}/{ammoLoad}  Connector: {(conLocked?"LOCKED":"OPEN")}",cTxt,0.45f);break;
case 5:
float bc5=0,bm5=0,bi5=0,bo5=0;foreach(var b in padBat){bc5+=b.CurrentStoredPower;bm5+=b.MaxStoredPower;bi5+=b.CurrentInput;bo5+=b.CurrentOutput;}
float pp5=bm5>0?bc5/bm5:0;SLB(f,20,y,350,12,$"Battery ({padBat.Count})",pp5,PctCol(pp5),cBdr);y+=35;
ST(f,20,y,$"{bc5:F1}/{bm5:F1} MWh   In: {bi5*1000:F0}kW   Out: {bo5*1000:F0}kW",cTxt,0.42f);y+=25;
ST(f,20,y,$"Reactor: {padReact.Count}   Solar: {padSolar.Count}   Wind: {padWind.Count}",cTxt,0.45f);break;
case 6:
int ra6=0,aa6=0;foreach(var r in padRef)if(r.IsProducing)ra6++;foreach(var a in padAsm)if(a.IsProducing)aa6++;
ST(f,20,y,$"Refinery: {ra6}/{padRef.Count}   Assembly: {aa6}/{padAsm.Count}",cTxt,0.5f);y+=25;
float ap6=mslAmmoTarget>0?(float)ammoStock/mslAmmoTarget:0;SB(f,20,y,200,8,ap6,PctCol(ap6),cBdr);ST(f,225,y-2,$"Ammo: {ammoStock}/{mslAmmoTarget}",cTxt,0.4f);y+=20;
float hp6=padH2Pct/100f,op6=padO2Pct/100f;
SB(f,20,y,100,8,hp6,PctCol(hp6),cBdr);ST(f,125,y-2,$"H2: {padH2Pct:F0}%",cTxt,0.4f);
SB(f,220,y,100,8,op6,PctCol(op6),cBdr);ST(f,325,y-2,$"O2: {padO2Pct:F0}%",cTxt,0.4f);y+=20;
ST(f,20,y,$"Bottles: H2 {pH2B}/{h2Target}   O2 {pO2B}/{o2Target}",cTxt,0.45f);y+=22;
if(trkM.Count>0){var itemTot=new Dictionary<string,int>();foreach(var kv in trkM)foreach(var ci in kv.Value.cargoItems)AD(itemTot,ci.Key,ci.Value);if(itemTot.Count>0){ST(f,20,y,$"Miner Cargo ({trkM.Count}):",cAcc,0.45f);y+=16;int mc=0;foreach(var it in itemTot){if(mc++>=4)break;ST(f,30,y,$"{GetCargoCategory(it.Key)}: {GetCargoName(it.Key)} x{it.Value}",cTxt,0.38f);y+=14;}}}break;
case 7:
if(cS!=S.GONE){ST(f,20,y,$"[{Clk()}] No active flight",cSec,0.5f);y+=25;ST(f,20,y,$"Mode: {tM}   Target: {(tgtSet?tgtName:"NONE")}",cTxt,0.45f);}
else{bool _s72=mslPhase.StartsWith("SAT");int agoV7=(int)(DT-lnchT).TotalSeconds;ST(f,20,y,$"T+{agoV7}s   {mslPhase}   {(_s72?$"{mslAlt:F0}m":$"{mslDTT:F0}m")}   {mslSpeed:F0}m/s",cErr,0.45f);y+=25;
float dp=_s72?(float)Math.Min(mslAlt/80000,1):1f-(float)(mslDTT/(mslDTT+1000)),sp=(float)Math.Min(mslSpeed/500,1);
SLB(f,20,y,200,8,_s72?"Altitude":"Distance",dp,_s72?cPri:cErr,cBdr);y+=24;SLB(f,20,y,200,8,"Speed",sp,cPri,cBdr);y+=28;
ST(f,20,y,$"Position: {mslPos.X:F0}, {mslPos.Y:F0}, {mslPos.Z:F0}",cTxt,0.42f);}break;
case 8:
ST(f,20,y,$"Mode: {tM}   Waypoints: {wpts.Count}",cTxt,0.5f);y+=25;
for(int i=0;i<Math.Min(6,wpts.Count);i++){var wp=wpts[i];bool ws=i==wpIdx;ST(f,20,y,ws?"> "+wp.Name:"  "+wp.Name,ws?cAcc:cTxt,0.45f);y+=18;}break;}
y=230;ST(f,256,y,"Press OK to Exit",cSec,0.45f,tAC);
f.Dispose();}

MySpriteDrawFrame BL(IMyTextSurface s){s.ContentType=ContentType.SCRIPT;s.Script="";lcdW=s.SurfaceSize.X;lcdH=s.SurfaceSize.Y;lcdS=lcdW/512f;lcdYS=lcdH/512f;var f=s.DrawFrame();f.Add(new MySprite(sTX,sQ,new Vector2(lcdW/2,lcdH/2),new Vector2(lcdW,lcdH),cBg));return f;}
void SH(MySpriteDrawFrame f,float y,string t,Color c){float cy=y*lcdYS,cx=lcdW/2;f.Add(new MySprite(sTX,sQ,new Vector2(cx,cy+12*lcdYS),new Vector2(lcdW-12*lcdS,24*lcdYS),c*0.3f));f.Add(new MySprite(SpriteType.TEXT,t,new Vector2(cx,cy),null,c,"White",tAC,0.8f*lcdS));f.Add(new MySprite(sTX,sQ,new Vector2(cx,cy+24*lcdYS),new Vector2(lcdW-32*lcdS,2*lcdYS),c));}
void SB(MySpriteDrawFrame f,float x,float y,float w,float h,float pct,Color fg,Color bg){x*=lcdS;y*=lcdYS;w*=lcdS;h*=lcdYS;f.Add(new MySprite(sTX,sQ,new Vector2(x+w/2,y+h/2),new Vector2(w,h),bg));float fw=w*Math.Max(0,Math.Min(1,pct));if(fw>1)f.Add(new MySprite(sTX,sQ,new Vector2(x+fw/2,y+h/2),new Vector2(fw,h),fg));}
void SLB(MySpriteDrawFrame f,float x,float y,float w,float h,string lbl,float pct,Color fg,Color bg){float sx=x*lcdS,sy=y*lcdYS,sw=w*lcdS;f.Add(new MySprite(SpriteType.TEXT,lbl,new Vector2(sx,sy-2*lcdYS),null,cTxt,"Monospace",TextAlignment.LEFT,0.5f*lcdS));SB(f,x,y+12,w,h,pct,fg,bg);f.Add(new MySprite(SpriteType.TEXT,$"{pct*100:0}%",new Vector2(sx+sw+5*lcdS,sy+8*lcdYS),null,fg,"Monospace",TextAlignment.LEFT,0.45f*lcdS));}
void ST(MySpriteDrawFrame f,float x,float y,string t,Color c,float sz=0.5f,TextAlignment a=TextAlignment.LEFT){f.Add(new MySprite(SpriteType.TEXT,t,new Vector2(x*lcdS,y*lcdYS),null,c,"Monospace",a,sz*lcdS));}
void SBx(MySpriteDrawFrame f,float x,float y,float w,float h,Color bg,Color bdr){x*=lcdS;y*=lcdYS;w*=lcdS;h*=lcdYS;f.Add(new MySprite(sTX,sQ,new Vector2(x+w/2,y+h/2),new Vector2(w,h),bdr));f.Add(new MySprite(sTX,sQ,new Vector2(x+w/2,y+h/2),new Vector2(w-2*lcdS,h-2*lcdYS),bg));}
Color PctCol(float p){return p>.7f?cOK:p>.3f?cWrn:cErr;}
void SMI(MySpriteDrawFrame f,float y,int idx,string t,bool s){float sy=y*lcdYS;if(s)f.Add(new MySprite(sTX,sQ,new Vector2(lcdW/2,sy+10*lcdYS),new Vector2(lcdW-32*lcdS,22*lcdYS),cAcc*0.4f));f.Add(new MySprite(SpriteType.TEXT,t,new Vector2(20*lcdS,sy),null,s?cAcc:cTxt,"Monospace",TextAlignment.LEFT,0.55f*lcdS));}
void SD(MySpriteDrawFrame f,float y){f.Add(new MySprite(sTX,sQ,new Vector2(lcdW/2,y*lcdYS),new Vector2(lcdW-32*lcdS,2*lcdYS),cSec));}

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
void UpdateBtnConfig(){ParseBtnSettings();var secs=ParseSecs(Me.CustomData);var c=new StringBuilder();
c.AppendLine("[SYSTEM]");
c.AppendLine($"pad_ready=true");
c.AppendLine($"pad_session={padSession}");
c.AppendLine("[BLACKBOX]");
if(secs.ContainsKey("[BLACKBOX]")){var oldBB=secs["[BLACKBOX]"].Split('\n');foreach(var ln in oldBB){string t=ln.Trim();if(t.Length>0&&!t.StartsWith("[BLACKBOX]")&&!t.StartsWith("; System"))c.AppendLine(t);}}
c.AppendLine("[PAD_CFG]");
c.AppendLine($"load={ammoLoad}");
c.AppendLine($"type={ammoTypeIdx}");
string sNm=cS==S.INIT?"INIT":cS==S.IDLE?"IDLE":cS==S.PRINT?"PRINT":cS==S.BUILD?"BUILD":cS==S.DOCK?"DOCK":cS==S.FUEL?"FUEL":cS==S.READY?"READY":cS==S.ARM?"ARM":cS==S.LAUNCH?"LAUNCH":cS==S.GONE?"GONE":"?";
c.AppendLine($"state={sNm}");
c.AppendLine($"phase={mslPhase}");
int curAmmo=0;if(mslConAmmo!=null){var ai=mslConAmmo.GetInventory();if(ai!=null)curAmmo=(int)ai.GetItemAmount(ammoType);}int need=ammoLoad-curAmmo;
c.AppendLine($"ammoReq={(cS==S.FUEL&&need>0?1:0)}");
c.AppendLine($"ammoReqNeed={need}");
c.AppendLine($"ammoReqType={ammoTypeIdx}");
c.AppendLine($"ammoHave={curAmmo}");
c.AppendLine("[PAD_STATUS]");
string md=isCtl?"CONTROLLER":cS==S.GONE?"FLIGHT":(printing||cS==S.PRINT||cS==S.BUILD)?"PRINT":mslFound?"MISSILE":"NORMAL";
c.AppendLine($"mode={md}");
c.AppendLine($"connector={(conLocked?"LOCKED":"OPEN")}");
c.AppendLine($"warheads={mslWar.Count}[{(warArmed?"ARMED":"SAFE")}]");
float mBatC=0,mBatM=0,mH2F=0,mH2C=0,mO2F=0,mO2C=0;int mIce=0,mUrn=0,lsLnk=0;
if(mslFound){foreach(var b in mslBat){mBatC+=b.CurrentStoredPower;mBatM+=b.MaxStoredPower;}foreach(var h in mslH2){mH2F+=(float)h.FilledRatio*h.Capacity;mH2C+=h.Capacity;}foreach(var o in mslO2){mO2F+=(float)o.FilledRatio*o.Capacity;mO2C+=o.Capacity;}foreach(var g in mslGen){var inv=g.GetInventory();if(inv!=null)foreach(var x in GL(inv))if(x.Type.SubtypeId=="Ice")mIce+=(int)x.Amount;}foreach(var r in mslReact){var inv=r.GetInventory();if(inv!=null)foreach(var x in GL(inv))if(x.Type.SubtypeId=="Uranium")mUrn+=(int)x.Amount;}foreach(var l in mslLsr)if(l.Status==MyLaserAntennaStatus.Connected)lsLnk++;
c.AppendLine($"battery={(mBatM>0?mBatC/mBatM*100:0):F0}%");
c.AppendLine($"hydrogen={(mH2C>0?mH2F/mH2C*100:0):F0}%");
c.AppendLine($"oxygen={(mO2C>0?mO2F/mO2C*100:0):F0}%");
c.AppendLine($"ice={mIce}");
c.AppendLine($"uranium={mUrn}");
c.AppendLine($"ammo={mslAmmo}/{ammoLoad}");
c.AppendLine($"gen={mslGen.Count}|h2t={mslH2.Count}|o2t={mslO2.Count}|react={mslReact.Count}");}
int pRem=prtProj!=null?prtProj.RemainingBlocks:0,pTot=prtProj!=null?prtProj.TotalBlocks:0,pBld=prtProj!=null?prtProj.BuildableBlocksCount:0;float pPist=prtPist.Count>0?prtPist[0].CurrentPosition:0;
if(printing||cS==S.PRINT||cS==S.BUILD){string ps=prtState==1?"EXTEND":prtState==2?"WELD":"CHECK";c.AppendLine($"prt={ps}|on={(printing?1:0)}|rem={pRem}/{pTot}|bld={pBld}|pos={pPist:F1}");}
if(cS==S.GONE||hasTlm){c.AppendLine($"flight={mslPhase}|target={tgtName}|dist={mslDTT:F0}|speed={mslSpeed:F0}|alt={mslAlt:F0}|fuel={mslFuelPct:F0}%|eta={(mslSpeed>0?mslDTT/mslSpeed:0):F0}");}
int ctArm=0,ctRdy=0,ctFly=0;if(isCtl){foreach(int pid in kPads){if(pArm.ContainsKey(pid)&&pArm[pid])ctArm++;if(pRdy.ContainsKey(pid)&&pRdy[pid])ctRdy++;if(pStat.ContainsKey(pid)&&pStat[pid]=="GONE")ctFly++;}string ctMd=tM==T.GPS?"GPS":tM==T.ANTENNA?"ANT":tM==T.SENSOR?"SEN":tM==T.LIDAR?"LDR":tM==T.SATELLITE?"SAT":"MAN";
c.AppendLine($"ctrl={kPads.Count}|arm={ctArm}|rdy={ctRdy}|fly={ctFly}|md={ctMd}|st={(svAct?"SALVO":"OK")}");}
c.AppendLine("[PAD_DATA]");
c.AppendLine($"tgtGPS={tgtGPS.X:F0},{tgtGPS.Y:F0},{tgtGPS.Z:F0}|tgtName={tgtName}|tgtSet={(tgtSet?1:0)}");
if(mslFound){c.AppendLine($"merged={(merged?1:0)}|conLocked={(conLocked?1:0)}|warArmed={(warArmed?1:0)}|warCount={mslWar.Count}");
c.AppendLine($"mslBatPct={(mBatM>0?mBatC/mBatM*100:0):F0}|mslBatC={mBatC:F2}|mslBatM={mBatM:F2}");
c.AppendLine($"mslH2Pct={(mH2C>0?mH2F/mH2C*100:0):F0}|mslH2F={mH2F:F0}|mslH2C={mH2C:F0}");
c.AppendLine($"mslO2Pct={(mO2C>0?mO2F/mO2C*100:0):F0}|mslO2F={mO2F:F0}|mslO2C={mO2C:F0}");
c.AppendLine($"mslIce={mIce}|mslUran={mUrn}|mslAmmo={mslAmmo}|mslAmmoLoad={ammoLoad}");
c.AppendLine($"mslGenCnt={mslGen.Count}|mslH2Cnt={mslH2.Count}|mslO2Cnt={mslO2.Count}|mslReactCnt={mslReact.Count}");
c.AppendLine($"mslCount=1|mslReady={(cS==S.READY||cS==S.ARM?1:0)}|mslArmed={(cS==S.ARM?1:0)}|mslLsrCnt={mslLsr.Count}|mslLsrLnk={lsLnk}|mslAntCnt={mslAnt.Count}");}
if(printing||cS==S.PRINT||cS==S.BUILD){c.AppendLine($"prtState={prtState}|printing={(printing?1:0)}|prtRem={pRem}|prtTot={pTot}|prtBld={pBld}|prtPist={pPist:F1}");}
if(cS==S.GONE||hasTlm){c.AppendLine($"msl_phase={mslPhase}|target={tgtName}|mslDist={mslDTT:F0}|mslSpeed={mslSpeed:F0}|mslAlt={mslAlt:F0}|mslFuel={mslFuelPct:F0}|mslETA={(mslSpeed>0?mslDTT/mslSpeed:0):F0}");}
if(isCtl){string ctMd2=tM==T.GPS?"GPS":tM==T.ANTENNA?"ANTENNA":tM==T.SENSOR?"SENSOR":tM==T.LIDAR?"LIDAR":tM==T.SATELLITE?"SATELLITE":"MANUAL";
c.AppendLine($"ctrlPads={kPads.Count}|ctrlArmed={ctArm}|ctrlReady={ctRdy}|mslCount={ctFly}|ctrlMode={ctMd2}|ctrlTarget={tgtName}|ctrlStatus={(svAct?"SALVO":"ACTIVE")}");}
if(printing||cS==S.PRINT||cS==S.BUILD){
if(pRem>0&&pBld<pRem){int sc=Math.Max(1,pRem/5);c.Append($"[BLUEPRINT]\nSteelPlate={sc*10}\nConstruction={sc*5}\nSmallTube={sc*3}\nLargeTube={sc*2}\nMotor={sc*2}\nComputer={sc*2}\nThrust={sc*3}\nExplosives={sc*4}\nPowerCell={sc}\nDetector={sc}\nRadioComm={sc}\n");}}
Me.CustomData=c.ToString();}
void ParseBtnSettings(){string d=Me.CustomData;if(string.IsNullOrEmpty(d))return;bool inSec=false;var ls=d.Split('\n');foreach(var l in ls){string lt=l.Trim();if(lt.StartsWith("[SET]")||lt.StartsWith("[PAD_CFG]")){inSec=true;continue;}if(lt.StartsWith("[")&&inSec){inSec=false;continue;}if(!inSec||lt.StartsWith(";")||lt.StartsWith("#")||!lt.Contains("="))continue;var ps=lt.Split('|');foreach(var p in ps){string pt=p.Split(';')[0].Trim();var kv=pt.Split('=');if(kv.Length<2)continue;string k=kv[0].Trim(),v=kv[1].Trim();int n;if(!int.TryParse(v.Split(' ')[0],out n))continue;if(k=="tgt")ammoTarget=n;else if(k=="load")ammoLoad=n;else if(k=="ice")iceTarget=n;else if(k=="uran")uranTarget=n;else if(k=="h2")h2Target=n;else if(k=="o2")o2Target=n;else if(k=="tool")toolTarget=n;else if(k=="pAmmo")pAmmoTarget=n;else if(k=="type"&&n>=0&&n<5)ammoTypeIdx=n;}}}
List<MyInventoryItem>GL(IMyInventory v){var L=new List<MyInventoryItem>();if(v!=null)v.GetItems(L);return L;}
void AD(Dictionary<string,int>d,string k,int v){if(d.ContainsKey(k))d[k]+=v;else d[k]=v;}
Dictionary<string,string>ParseSecs(string d){var r=new Dictionary<string,string>();if(string.IsNullOrEmpty(d))return r;string cur="";var sb=new StringBuilder();var lns=d.Split('\n');foreach(var l in lns){if(l.StartsWith("[")){int e=l.IndexOf("]");if(e>0){if(cur!=""&&sb.Length>0)r[cur]=sb.ToString();cur=l.Substring(0,e+1);sb.Clear();sb.Append(l).Append("\n");continue;}}if(cur!=""&&l.Length>0)sb.Append(l).Append("\n");}if(cur!=""&&sb.Length>0)r[cur]=sb.ToString();return r;}
void UpdateMiniMap(){
foreach(var mm in mmLCDs){var sf=mm as IMyTextSurface;if(sf==null)continue;
sf.ContentType=ContentType.SCRIPT;sf.Script="";
float w=sf.SurfaceSize.X,h=sf.SurfaceSize.Y,s=Math.Min(w,h)/512f;
var f=sf.DrawFrame();
f.Add(new MySprite(sTX,sQ,new Vector2(w/2,h/2),new Vector2(w,h),cBg));
f.Add(new MySprite(SpriteType.TEXT,$"SAT GRID - PAD{padID}",new Vector2(w/2,10*s),null,cAcc,"White",tAC,0.6f*s));
int gRange=5;float cX=w/2,cY=h/2+15*s,cellS=Math.Min(w-40*s,h-80*s)/(gRange*2+1);
for(int gx=-gRange;gx<=gRange;gx++){float lx=cX+gx*cellS;f.Add(new MySprite(sTX,sQ,new Vector2(lx,cY),new Vector2(1,cellS*(gRange*2+1)),cBdr));}
for(int gz=-gRange;gz<=gRange;gz++){float ly=cY+gz*cellS;f.Add(new MySprite(sTX,sQ,new Vector2(cX,ly),new Vector2(cellS*(gRange*2+1),1),cBdr));}
f.Add(new MySprite(sTX,"Circle",new Vector2(cX,cY),new Vector2(10*s,10*s),cPri));
foreach(int sid in kSats){
if(!satGridX.ContainsKey(sid)||!satGridZ.ContainsKey(sid))continue;
int gx=satGridX[sid],gz=satGridZ[sid];
if(Math.Abs(gx)>gRange||Math.Abs(gz)>gRange)continue;
float sx=cX+gx*cellS,sy=cY+gz*cellS;
int bat=sBat.ContainsKey(sid)?sBat[sid]:0;
string st=satStatus.ContainsKey(sid)?satStatus[sid]:"?";
Color sc=st=="SAT_INTERCEPT"?cErr:st=="SAT_HOLD"||st=="ACTIVE"?cOK:bat<30?cWrn:cOK;
f.Add(new MySprite(sTX,"Circle",new Vector2(sx,sy),new Vector2(8*s,8*s),sc));
f.Add(new MySprite(SpriteType.TEXT,$"{bat}",new Vector2(sx,sy-4*s),null,cTxt,"Monospace",tAC,0.25f*s));}
float fy=h-25*s;
f.Add(new MySprite(SpriteType.TEXT,$"Satellites: {kSats.Count}   Replace Queue: {satReplaceQueue.Count}",new Vector2(w/2,fy),null,cTxt,"Monospace",tAC,0.4f*s));
f.Dispose();}}

