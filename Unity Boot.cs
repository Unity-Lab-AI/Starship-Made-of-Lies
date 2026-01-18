int padID=1;int tick=0;
bool bootDone=false;int bootStep=0;int bootTicks=0;string bootError="";int bootErrTicks=0;string bootStatus="Initializing...";
int bootSiblings=0;bool bootHasCtrl=false;
string[] padChecks={"Initializing Core Systems","Scanning Grid Topology","Detecting Merge Blocks","Loading Pad Configuration","Scanning Connectors","Detecting LCD Panels","Initializing Button Interface","Scanning Printers","Loading Projector Data","Scanning Power Systems","Scanning Fuel Systems","Scanning Missile Components","Loading Targeting Data","Initializing IGC Channels","Registering Broadcast Listeners","Loading Waypoint Data","Calibrating Launch Systems","Validating Pad Status","Finalizing Module Sync","Pad Boot Complete"};
string[] invChecks={"Initializing Core Systems","Scanning Grid Topology","Detecting Block Types","Loading Pad Configuration","Scanning Cargo Containers","Scanning Refineries","Scanning Assemblers","Loading Inventory Data","Scanning Power Systems","Scanning Gas Systems","Initializing IGC Channels","Syncing Miner Beacons","Analyzing Stock Levels","Calibrating Ore Routing","Configuring Component Queue","Loading Tool Manifests","Initializing Auto-Sort","Validating Connections","Finalizing Module Sync","Inventory Boot Complete"};
float lcdW=512,lcdH=512,lcdS=1;
string padTag="[PAD1";
IMyButtonPanel btn;
IMyTextSurface lcd1,lcd2,lcd3,lcd4,lcd5,lcd6,lcd7,lcd8,lcd9,lcd10;
IMyBroadcastListener bcnL;
Color cPri=new Color(0,180,255);Color cSec=new Color(100,100,100);Color cAcc=new Color(255,200,0);
Color cOK=new Color(0,255,100);Color cWrn=new Color(255,180,0);Color cErr=new Color(255,60,60);
Color cBg=new Color(10,10,15);Color cBdr=new Color(40,40,50);Color cTxt=new Color(220,220,220);
List<IMyShipMergeBlock> padMerge=new List<IMyShipMergeBlock>();
List<IMyShipConnector> padCon=new List<IMyShipConnector>();
List<IMyPistonBase> prtPist=new List<IMyPistonBase>();
List<IMyShipWelder> prtWeld=new List<IMyShipWelder>();
IMyProjector prtProj;
List<IMyBatteryBlock> padBat=new List<IMyBatteryBlock>();
List<IMyGasTank> padH2=new List<IMyGasTank>();
List<IMyGasTank> padO2=new List<IMyGasTank>();
List<IMyCargoContainer> padCargo=new List<IMyCargoContainer>();
List<IMyRefinery> padRef=new List<IMyRefinery>();
List<IMyAssembler> padAsm=new List<IMyAssembler>();
List<IMyGasGenerator> padGen=new List<IMyGasGenerator>();
IMyRemoteControl mslRC;
List<MyWaypointInfo> wpts=new List<MyWaypointInfo>();
Dictionary<long,bool> trkM=new Dictionary<long,bool>();

public Program(){
Runtime.UpdateFrequency=UpdateFrequency.Update100;
LoadPadID();
UpdatePadTag();
bcnL=IGC.RegisterBroadcastListener("MINER_BEACON");
ScanBlocks();
ClearBootStatus();
}
void LoadPadID(){
if(string.IsNullOrEmpty(Storage))return;
var p=Storage.Split('|');
if(p.Length>=1)int.TryParse(p[0],out padID);
}
public void Save(){Storage=$"{padID}";}
void UpdatePadTag(){
if(padID==0)padID=1;
padTag=$"[PAD{padID}";
Me.CustomName=$"[PAD{padID}-BOOT] UNITY BOOT";
}
void ClearBootStatus(){
if(btn==null)return;
string cd=btn.CustomData;
cd=cd.Replace("boot_complete=true","boot_complete=false").Replace("boot_complete=1","boot_complete=false");
if(!cd.Contains("[SYSTEM]"))cd="[SYSTEM]\nboot_complete=false\n"+cd;
else if(!cd.Contains("boot_complete")){int si=cd.IndexOf("[SYSTEM]");if(si>=0){int ei=cd.IndexOf("\n",si);if(ei<0)ei=si+8;cd=cd.Insert(ei,"\nboot_complete=false");}}
btn.CustomData=cd;
}

public void Main(string a,UpdateType u){
tick++;
if(bootDone){
Runtime.UpdateFrequency=UpdateFrequency.None;
Echo("UNITY BOOT COMPLETE");
Echo("Boot controller shutting down.");
Echo("LCDs released to operational scripts.");
return;
}
RunBoot();
}

void ScanBlocks(){
padMerge.Clear();padCon.Clear();prtPist.Clear();prtWeld.Clear();prtProj=null;
padBat.Clear();padH2.Clear();padO2.Clear();padCargo.Clear();padRef.Clear();padAsm.Clear();padGen.Clear();
lcd1=lcd2=lcd3=lcd4=lcd5=lcd6=lcd7=lcd8=lcd9=lcd10=null;btn=null;mslRC=null;
var blks=new List<IMyTerminalBlock>();
GridTerminalSystem.GetBlocksOfType(blks,b=>b.CustomName.Contains(padTag)||b.CubeGrid==Me.CubeGrid);
foreach(var b in blks){
if(b is IMyButtonPanel&&b.CustomName.ToLower().Contains("control")&&btn==null)btn=b as IMyButtonPanel;
if(b is IMyShipMergeBlock)padMerge.Add(b as IMyShipMergeBlock);
if(b is IMyShipConnector)padCon.Add(b as IMyShipConnector);
if(b is IMyPistonBase&&b.CustomName.Contains("-PRINT"))prtPist.Add(b as IMyPistonBase);
if(b is IMyShipWelder&&b.CustomName.Contains("-PRINT"))prtWeld.Add(b as IMyShipWelder);
if(b is IMyProjector&&b.CustomName.Contains("-PRINT"))prtProj=b as IMyProjector;
if(b is IMyBatteryBlock)padBat.Add(b as IMyBatteryBlock);
if(b is IMyGasTank){var t=b as IMyGasTank;if(t.BlockDefinition.SubtypeId.Contains("Hydrogen"))padH2.Add(t);else padO2.Add(t);}
if(b is IMyCargoContainer)padCargo.Add(b as IMyCargoContainer);
if(b is IMyRefinery)padRef.Add(b as IMyRefinery);
if(b is IMyAssembler)padAsm.Add(b as IMyAssembler);
if(b is IMyGasGenerator)padGen.Add(b as IMyGasGenerator);
if(b is IMyRemoteControl&&mslRC==null)mslRC=b as IMyRemoteControl;
if(b is IMyTextSurface||b is IMyTextPanel){string nm=b.CustomName;if(!nm.Contains(padTag))continue;
IMyTextSurface ts=b is IMyTextSurface?(IMyTextSurface)b:((IMyTextPanel)b);
if(nm.Contains(":10")&&lcd10==null)lcd10=ts;
else if(nm.Contains(":1")&&!nm.Contains(":10")&&lcd1==null)lcd1=ts;
else if(nm.Contains(":2")&&lcd2==null)lcd2=ts;
else if(nm.Contains(":3")&&lcd3==null)lcd3=ts;
else if(nm.Contains(":4")&&lcd4==null)lcd4=ts;
else if(nm.Contains(":5")&&lcd5==null)lcd5=ts;
else if(nm.Contains(":6")&&lcd6==null)lcd6=ts;
else if(nm.Contains(":7")&&lcd7==null)lcd7=ts;
else if(nm.Contains(":8")&&lcd8==null)lcd8=ts;
else if(nm.Contains(":9")&&lcd9==null)lcd9=ts;
}}
if(btn==null){var allBtn=new List<IMyButtonPanel>();GridTerminalSystem.GetBlocksOfType(allBtn);foreach(var bp in allBtn)if(bp.CustomName.ToLower().Contains("control")&&btn==null)btn=bp;}
}

void RunBoot(){
bootTicks++;
if(btn==null||lcd1==null)ScanBlocks();
if(bootTicks==3){var pbs=new List<IMyProgrammableBlock>();GridTerminalSystem.GetBlocksOfType(pbs,b=>b.CubeGrid==Me.CubeGrid&&b!=Me&&b.CustomName.Contains("[PAD"));bootSiblings=pbs.Count;bootHasCtrl=false;foreach(var pb in pbs)if(pb.CustomData.Contains("isCtl=1"))bootHasCtrl=true;}
int stepDelay=5;int errPause=50;int totalSteps=40;
if(bootError!=""){bootErrTicks++;if(bootErrTicks>=errPause){bootError="";bootErrTicks=0;}}
else if(bootTicks>2&&bootStep<totalSteps&&bootTicks%stepDelay==0){
string err=RunBootCheck(bootStep);
if(err!=""){bootError=err;bootErrTicks=0;}
else bootStep++;}
float pct=(float)bootStep/totalSteps;
string curCheck=bootStep<20?padChecks[bootStep]:invChecks[bootStep-20];
if(bootStep==18)curCheck=padID==1&&bootSiblings==0?"Initializing Primary Pad":bootSiblings>0?$"Syncing with {bootSiblings} module(s)":"Registering as Module";
if(bootStep==38)curCheck=bootSiblings>0?"Module sync complete":"Standalone mode";
IMyTextSurface[] padLCDs={lcd1,lcd2,lcd3,lcd7,lcd8};
IMyTextSurface[] invLCDs={lcd4,lcd5,lcd6,lcd9,lcd10};
foreach(var lcd in padLCDs){if(lcd!=null)DrawBootScreen(lcd,pct,curCheck,bootStep,totalSteps,true);}
foreach(var lcd in invLCDs){if(lcd!=null)DrawBootScreen(lcd,pct,curCheck,bootStep,totalSteps,false);}
Echo("UNITY MISSILE SYSTEM");
Echo("Boot Controller Active");
Echo($"[{bootStep+1}/{totalSteps}] {curCheck}");
if(bootError!="")Echo($"ERROR: {bootError}");
else Echo($"Status: {bootStatus}");
Echo($"Progress: {(int)(pct*100)}%");
if(bootStep>=totalSteps&&bootTicks>stepDelay*(totalSteps+2)){
WriteBootComplete();
bootDone=true;
}
}

void DrawBootScreen(IMyTextSurface s,float pct,string check,int step,int total,bool isPad){
s.ContentType=ContentType.SCRIPT;s.Script="";s.ScriptBackgroundColor=cBg;
var f=s.DrawFrame();
Vector2 sz=s.SurfaceSize;float cx=sz.X/2,cy=sz.Y/2;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,cy),sz,cBg));
f.Add(new MySprite(SpriteType.TEXT,"UNITY MISSILE SYSTEM",new Vector2(cx,40),null,cPri,null,TextAlignment.CENTER,1.2f));
f.Add(new MySprite(SpriteType.TEXT,"v01.00",new Vector2(cx,75),null,cSec,null,TextAlignment.CENTER,0.5f));
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,100),new Vector2(sz.X-60,2),cSec));
string mod=isPad?"PAD CONTROLLER":"INVENTORY MODULE";
f.Add(new MySprite(SpriteType.TEXT,mod,new Vector2(cx,120),null,cAcc,null,TextAlignment.CENTER,0.6f));
f.Add(new MySprite(SpriteType.TEXT,"System Initialization",new Vector2(cx,150),null,cTxt,null,TextAlignment.CENTER,0.55f));
float bx=40,by=sz.Y-120,bw=sz.X-80,bh=20;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,by+bh/2),new Vector2(bw,bh),cBdr));
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(bx+bw*pct/2,by+bh/2),new Vector2(bw*pct,bh-4),cPri));
f.Add(new MySprite(SpriteType.TEXT,$"{(int)(pct*100)}%",new Vector2(cx,by+bh+5),null,cTxt,null,TextAlignment.CENTER,0.45f));
Color chkC=bootError!=""?cErr:cOK;
f.Add(new MySprite(SpriteType.TEXT,$"[{step+1}/{total}] {check}",new Vector2(cx,by-25),null,chkC,null,TextAlignment.CENTER,0.4f));
string[] checks=isPad?padChecks:invChecks;
int offset=isPad?0:20;
int localStep=step-offset;
if(localStep<0)localStep=0;
if(localStep>=20)localStep=19;
int startIdx=Math.Max(0,localStep-4);
float ly=180;
for(int i=startIdx;i<=localStep&&i<20;i++){
bool isErr=i==localStep&&bootError!=""&&step>=offset&&step<offset+20;
Color lc=isErr?cErr:i<localStep?cOK:i==localStep?cPri:cSec;
string prefix=isErr?"[!!]":i<localStep?"[OK]":i==localStep?"[>>]":"[..]";
f.Add(new MySprite(SpriteType.TEXT,$"{prefix} {checks[i]}",new Vector2(30,ly),null,lc,null,TextAlignment.LEFT,0.35f));
ly+=18;if(ly>by-50)break;}
string syncSt;Color syncC;
if(bootError!=""){syncSt=$"ERROR: {bootError}";syncC=cErr;}
else if(isPad){
if(padID==1&&bootSiblings==0){syncSt=bootStatus!=""?bootStatus:$"PAD {padID} - Primary Launch Controller";syncC=cOK;}
else if(padID==1&&bootSiblings>0){syncSt=bootStatus!=""?bootStatus:$"PAD {padID} - Controller ({bootSiblings} modules)";syncC=cOK;}
else if(bootSiblings>0||bootHasCtrl){syncSt=bootStatus!=""?bootStatus:$"PAD {padID} - Module (Synced)";syncC=cOK;}
else{syncSt=bootStatus!=""?bootStatus:$"PAD {padID} - Module (Standalone)";syncC=cWrn;}
}else{syncSt=bootStatus!=""?bootStatus:"INVENTORY MODULE";syncC=cOK;}
f.Add(new MySprite(SpriteType.TEXT,syncSt,new Vector2(cx,sz.Y-30),null,syncC,null,TextAlignment.CENTER,0.4f));
f.Dispose();
}

string RunBootCheck(int step){
var blks=new List<IMyTerminalBlock>();
if(step<20){
switch(step){
case 0:GridTerminalSystem.GetBlocksOfType(blks);if(blks.Count<5)return"Grid has fewer than 5 blocks";bootStatus="Core initialized";return"";
case 1:GridTerminalSystem.GetBlocksOfType(blks,b=>b.CubeGrid==Me.CubeGrid);if(blks.Count<10)return"Main grid has too few blocks";bootStatus=$"Grid: {blks.Count} blocks found";return"";
case 2:if(padMerge.Count<1)return"No merge block found for pad";bootStatus=$"Merge blocks: {padMerge.Count} found";return"";
case 3:if(btn==null)return"No control panel found for pad";bootStatus="Pad config loaded OK";return"";
case 4:if(padCon.Count<1)return"No connectors on grid";bootStatus=$"Connectors: {padCon.Count} found";return"";
case 5:int lcdCnt=0;if(lcd1!=null)lcdCnt++;if(lcd2!=null)lcdCnt++;if(lcd3!=null)lcdCnt++;if(lcd7!=null)lcdCnt++;if(lcd8!=null)lcdCnt++;if(lcdCnt<1)return$"No LCDs tagged {padTag} found";bootStatus=$"Pad LCDs: {lcdCnt} found";return"";
case 6:if(btn==null)return"Button interface not found";bootStatus="Button interface ready";return"";
case 7:if(prtPist.Count<1&&prtWeld.Count<1){bootStatus="No printer detected";return"";}bootStatus=$"Printer: {prtPist.Count}P {prtWeld.Count}W";return"";
case 8:if(prtProj==null){bootStatus="No projector found";return"";}bootStatus="Projector online";return"";
case 9:if(padBat.Count<1)return"WARNING: No batteries found";float bc=0,bm=0;foreach(var b in padBat){bc+=b.CurrentStoredPower;bm+=b.MaxStoredPower;}bootStatus=$"Power: {(int)(bc/bm*100)}% charged";return"";
case 10:bootStatus=$"Fuel tanks: {padH2.Count+padO2.Count} found";return"";
case 11:bool mslDocked=false;foreach(var m in padMerge)if(m.IsConnected)mslDocked=true;bootStatus=mslDocked?"Missile detected":"No missile docked";return"";
case 12:bootStatus="Targeting data ready";return"";
case 13:bootStatus="IGC channels active";return"";
case 14:bootStatus="Broadcast listeners ready";return"";
case 15:wpts.Clear();if(mslRC!=null)mslRC.GetWaypointInfo(wpts);bootStatus=$"Waypoints: {wpts.Count} loaded";return"";
case 16:bootStatus="Launch systems calibrated";return"";
case 17:bootStatus=padMerge.Count>0?"Pad status: Valid":"WARNING: No merge block";return"";
case 18:bootStatus=bootSiblings>0?$"Synced with {bootSiblings} module(s)":padID==1?"Primary controller":"Standalone module";return"";
case 19:bootStatus="PAD BOOT COMPLETE";return"";
default:return"";
}}
else{
int invStep=step-20;
switch(invStep){
case 0:GridTerminalSystem.GetBlocksOfType(blks);if(blks.Count<5)return"Grid has fewer than 5 blocks";bootStatus="Inv core initialized";return"";
case 1:GridTerminalSystem.GetBlocksOfType(blks,b=>b.CubeGrid==Me.CubeGrid);if(blks.Count<10)return"Main grid has too few blocks";bootStatus=$"Inv grid: {blks.Count} blocks";return"";
case 2:int invLcdCnt=0;if(lcd4!=null)invLcdCnt++;if(lcd5!=null)invLcdCnt++;if(lcd6!=null)invLcdCnt++;if(lcd9!=null)invLcdCnt++;if(lcd10!=null)invLcdCnt++;if(invLcdCnt<1)return"No inventory LCDs found";bootStatus=$"Inv LCDs: {invLcdCnt} found";return"";
case 3:if(btn==null)return"Control panel not found";bootStatus="Inv config loaded OK";return"";
case 4:if(padCargo.Count<1)return"No cargo containers on grid";bootStatus=$"Found {padCargo.Count} containers";return"";
case 5:if(padRef.Count<1)return"WARNING: No refineries found";bootStatus=$"Refineries: {padRef.Count} online";return"";
case 6:if(padAsm.Count<1)return"CRITICAL: No assemblers found";bootStatus=$"Assemblers: {padAsm.Count} online";return"";
case 7:float vol=0,cap=0;foreach(var c in padCargo){var i=c.GetInventory();if(i!=null){vol+=(float)i.CurrentVolume;cap+=(float)i.MaxVolume;}}bootStatus=cap>0?$"Cargo: {(int)(vol/cap*100)}% full":"Inventory loaded";return"";
case 8:if(padBat.Count<1)return"WARNING: No batteries found";float bc2=0,bm2=0;foreach(var b in padBat){bc2+=b.CurrentStoredPower;bm2+=b.MaxStoredPower;}bootStatus=$"Inv power: {(int)(bc2/bm2*100)}%";return"";
case 9:bootStatus=$"Gas: {padGen.Count} gens, {padH2.Count+padO2.Count} tanks";return"";
case 10:if(bcnL==null)return"IGC beacon listener failed";bootStatus="Inv IGC active";return"";
case 11:bootStatus=$"Tracking {trkM.Count} miners";return"";
case 12:bootStatus="Stock analysis ready";return"";
case 13:bootStatus="Ore routing configured";return"";
case 14:bootStatus="Component queue ready";return"";
case 15:bootStatus="Tool manifests loaded";return"";
case 16:bootStatus="Auto-sort enabled";return"";
case 17:if(btn==null)return"Button panel not connected";bootStatus="All connections valid";return"";
case 18:bootStatus="Inv module sync complete";return"";
case 19:bootStatus="INVENTORY BOOT COMPLETE";return"";
default:return"";
}}
}

void WriteBootComplete(){
if(btn==null)return;
string cd=btn.CustomData;
cd=cd.Replace("boot_complete=false","boot_complete=true");
if(!cd.Contains("boot_complete=true")){
int si=cd.IndexOf("[SYSTEM]");
if(si>=0){int ei=cd.IndexOf("\n",si);if(ei<0)ei=si+8;cd=cd.Insert(ei,"\nboot_complete=true");}
}
btn.CustomData=cd;
Echo("Boot complete signal written to CustomData");
}
