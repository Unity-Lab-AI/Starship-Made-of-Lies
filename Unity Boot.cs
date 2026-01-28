int padID=1;int tick=0;
bool bootDone=false;int bootStep=0;int bootTicks=0;string bootError="";int bootErrTicks=0;string bootStatus="Initializing...";
int bootSiblings=0;bool preBootDone=false;bool padReady=false,invReady=false,signalReady=false;int bootCompleteTicks=0;
bool waitingForAck=false;bool padAck=false,invAck=false;int ackWaitTicks=0;
IMyBroadcastListener ackL;
IMyBroadcastListener setupL;
int minerCount=0;string minerNames="";bool beaconOptional=true;
IMyBroadcastListener beaconL;
Dictionary<long,string> bootMiners=new Dictionary<long,string>();
string[] noMinerErrs={"Miners AWOL","No beacons found","Fleet ghosted you"};
string[] sysChecks={"Initializing Core","Scanning Grid","Button Panel","Detecting LCDs","IGC Channels","Request Pad Status","Await Pad Response","Missile Merge Block","Validate Pad Power","Validate Pad Fuel","Request Inv Status","Await Inv Response","Validate Inv Cargo","Validate Inv Refinery","Validate Inv Assembler","Validate Inv Gas","Request Signal Status","Await Signal Response","Validate Signal","Scan Door Systems","Verify Pressurization","Cross-Validate","Module Sync","Write Config","Beacon Detection","Controller Modules","System Ready","All Systems Operational"};
float lcdW=512,lcdH=512,lcdS=1;
string padTag="[PAD1";
IMyButtonPanel btn;
IMyProgrammableBlock padPB,invPB,signalPB;
IMyShipConnector con1,con2;
List<IMyRadioAntenna> bootAnt=new List<IMyRadioAntenna>();
IMyTextSurface lcd1,lcd2,lcd3,lcd4,lcd5,lcd6,lcd7,lcd8,lcd9,lcd10,lcd11;
List<IMyTextSurface> camLCDs=new List<IMyTextSurface>();
List<IMyTextSurface> signalLCDs=new List<IMyTextSurface>();
IMyBroadcastListener bootRspL;
Color cPri=new Color(0,180,255);Color cSec=new Color(100,100,100);Color cAcc=new Color(255,200,0);
Color cOK=new Color(0,255,100);Color cWrn=new Color(255,180,0);Color cErr=new Color(255,60,60);
Color cBg=new Color(10,10,15);Color cBdr=new Color(40,40,50);Color cTxt=new Color(220,220,220);
bool padRequested=false,padResponded=false,invRequested=false,invResponded=false,signalRequested=false,signalResponded=false;
bool padTimedOut=false,invTimedOut=false,signalTimedOut=false;
string padRspData="",invRspData="",signalRspData="";
int signalCamC=0,signalLcdC=0;
int doorSetCount=0;bool doorsLocked=false;float overallPressure=0;int extDoorsOpen=0;
List<IMyAirVent> airVents=new List<IMyAirVent>();int ventCount=0;
int padMergeC=0,padConC=0,padBatC=0,padH2C=0,padO2C=0,padPrtC=0;
int invCargoC=0,invRefC=0,invAsmC=0,invGenC=0,invH2C=0,invO2C=0;
int awaitTicks=0;int maxAwait=18;

public Program(){
Runtime.UpdateFrequency=UpdateFrequency.Update10;
LoadPadID();
UpdatePadTag();
bootRspL=IGC.RegisterBroadcastListener("UNITY_BOOT_RSP");
beaconL=IGC.RegisterBroadcastListener("MINER_BEACON");
ackL=IGC.RegisterBroadcastListener("UNITY_BOOT_ACK");
setupL=IGC.RegisterBroadcastListener("UNITY_SETUP_CMD");
ScanBlocks();
FindSiblingPBs();
InitBootCustomData();
}
void InitBootCustomData(){
Me.CustomData="[SYSTEM]\nboot_ready=true\nboot_complete=false\nboot_phase=INIT\nminer_count=0\nminer_names=\nbeacon_optional=true\n";
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
Me.CustomName=$"[PAD{padID}] UNITY BOOT";
}
void CheckReadyFlags(){
if(padPB==null||invPB==null||signalPB==null)FindSiblingPBs();
padReady=padPB!=null&&padPB.CustomData.Contains("pad_ready=true");
invReady=false;
if(invPB!=null&&invPB.CustomData.Contains("inv_ready=true")&&padPB!=null){
string pcd=padPB.CustomData;int idx=pcd.IndexOf("pad_session=");
if(idx>=0){int end=pcd.IndexOf('\n',idx);if(end<0)end=pcd.Length;string ps=pcd.Substring(idx+12,end-idx-12).Trim();invReady=invPB.CustomData.Contains($"inv_for_session={ps}");}}
signalReady=signalPB==null;
if(signalPB!=null&&signalPB.CustomData.Contains("signal_ready=true")&&padPB!=null){
string pcd=padPB.CustomData;int idx=pcd.IndexOf("pad_session=");
if(idx>=0){int end=pcd.IndexOf('\n',idx);if(end<0)end=pcd.Length;string ps=pcd.Substring(idx+12,end-idx-12).Trim();signalReady=signalPB.CustomData.Contains($"signal_for_session={ps}");}}
string myCD=Me.CustomData;
beaconOptional=!myCD.Contains("beacon_optional=false");
}
void ClearBootStatus(){
bootMiners.Clear();
string cd=Me.CustomData;
if(cd.Contains("boot_complete=true"))return;
cd=cd.Replace("boot_complete=false","boot_complete=BOOTING");
Me.CustomData=cd;
}

public void Main(string a,UpdateType u){
tick++;
if(CheckSetupCommands())return;
if(bootDone){
Runtime.UpdateFrequency=UpdateFrequency.None;
Echo("UNITY BOOT COMPLETE");
Echo("Boot controller shutting down.");
Echo("LCDs released to operational scripts.");
return;
}
if(waitingForAck){
CheckAcks();
ackWaitTicks++;
if(padAck&&invAck){
ReleaseLCDs();
bootDone=true;
Echo("UNITY BOOT");
Echo("Both scripts acknowledged.");
Echo("Boot complete - shutting down.");
return;
}
if(ackWaitTicks>300){
ReleaseLCDs();
bootDone=true;
Echo("UNITY BOOT");
Echo("ACK timeout - scripts running.");
return;
}
Echo("UNITY BOOT");
Echo($"Waiting for scripts... ({ackWaitTicks})");
Echo($"PAD: {(padAck?"OK":"wait")} | INV: {(invAck?"OK":"wait")}");
return;
}
RunBoot();
}

void ScanBlocks(){
lcd1=lcd2=lcd3=lcd4=lcd5=lcd6=lcd7=lcd8=lcd9=lcd10=lcd11=null;btn=null;con1=con2=null;bootAnt.Clear();camLCDs.Clear();signalLCDs.Clear();airVents.Clear();
var blks=new List<IMyTerminalBlock>();
GridTerminalSystem.GetBlocksOfType(blks,b=>b.CustomName.Contains(padTag)||b.CubeGrid==Me.CubeGrid);
string sigTag=$"[PAD{padID}SIGNAL]",defTag=$"[PAD{padID}DEFENSE]",satTag=$"[PAD{padID}SATS]",prsTag=$"[PAD{padID}PRESSURE]";
foreach(var b in blks){
if(b is IMyButtonPanel&&b.CustomName.ToLower().Contains("control")&&btn==null)btn=b as IMyButtonPanel;
if(b is IMyShipConnector){string nm=b.CustomName;if(nm.Contains("-CON1"))con1=b as IMyShipConnector;else if(nm.Contains("-CON2"))con2=b as IMyShipConnector;}
if(b is IMyRadioAntenna)bootAnt.Add(b as IMyRadioAntenna);
if(b is IMyAirVent)airVents.Add(b as IMyAirVent);
if(b is IMyTextSurface||b is IMyTextPanel){string nm=b.CustomName;if(!nm.Contains(padTag)&&!nm.Contains($"[PAD{padID}"))continue;
IMyTextSurface ts=b is IMyTextSurface?(IMyTextSurface)b:((IMyTextPanel)b);
if(nm.ToUpper().Contains("CAMS")){if(!camLCDs.Contains(ts))camLCDs.Add(ts);continue;}
if(nm.Contains(sigTag)||nm.Contains(defTag)||nm.Contains(satTag)||nm.Contains(prsTag)){if(!signalLCDs.Contains(ts))signalLCDs.Add(ts);continue;}
if(nm.Contains(":11")&&lcd11==null)lcd11=ts;
else if(nm.Contains(":10")&&lcd10==null)lcd10=ts;
else if(nm.Contains(":1")&&!nm.Contains(":10")&&!nm.Contains(":11")&&lcd1==null)lcd1=ts;
else if(nm.Contains(":2")&&lcd2==null)lcd2=ts;
else if(nm.Contains(":3")&&lcd3==null)lcd3=ts;
else if(nm.Contains(":4")&&lcd4==null)lcd4=ts;
else if(nm.Contains(":5")&&lcd5==null)lcd5=ts;
else if(nm.Contains(":6")&&lcd6==null)lcd6=ts;
else if(nm.Contains(":7")&&lcd7==null)lcd7=ts;
else if(nm.Contains(":8")&&lcd8==null)lcd8=ts;
else if(nm.Contains(":9")&&lcd9==null)lcd9=ts;
}}
if(btn==null){var allBtn=new List<IMyButtonPanel>();GridTerminalSystem.GetBlocksOfType(allBtn,b=>b.CubeGrid==Me.CubeGrid);foreach(var bp in allBtn)if(bp.CustomName.ToLower().Contains("control")&&btn==null)btn=bp;}
if(btn==null){var allBtn=new List<IMyButtonPanel>();GridTerminalSystem.GetBlocksOfType(allBtn);foreach(var bp in allBtn)if(bp.CustomName.ToLower().Contains("control")&&btn==null)btn=bp;}
foreach(var a in bootAnt){a.Enabled=true;a.EnableBroadcasting=true;}
}

void FindSiblingPBs(){
padPB=invPB=signalPB=null;
var pbs=new List<IMyProgrammableBlock>();
GridTerminalSystem.GetBlocksOfType(pbs,b=>b.CubeGrid==Me.CubeGrid&&b!=Me);
foreach(var pb in pbs){
string nm=pb.CustomName;
if(nm.Contains($"[PAD{padID}]")&&nm.ToUpper().Contains("UNITY INVENTORY"))invPB=pb;
else if(nm.Contains($"[PAD{padID}]")&&nm.ToUpper().Contains("UNITY PAD"))padPB=pb;
else if(nm.Contains($"[PAD{padID}]")&&nm.ToUpper().Contains("UNITY SIGNAL"))signalPB=pb;
}
}

void CheckIGCMessages(){
while(bootRspL.HasPendingMessage){
var msg=bootRspL.AcceptMessage();
string data=msg.Data.ToString();
if(data.StartsWith("PAD|")){padRspData=data;padResponded=true;ParsePadResponse(data);}
else if(data.StartsWith("INV|")){invRspData=data;invResponded=true;ParseInvResponse(data);}
else if(data.StartsWith("SIGNAL|")){signalRspData=data;signalResponded=true;ParseSignalResponse(data);}
}}

void ParsePadResponse(string data){
var parts=data.Split('|');
if(parts.Length<3)return;
if(parts[1]!="OK"){bootError=$"Pad: {parts[2]}";return;}
var vals=parts[2].Split(',');
foreach(var v in vals){var kv=v.Split('=');if(kv.Length!=2)continue;int n;int.TryParse(kv[1],out n);
if(kv[0]=="merge")padMergeC=n;else if(kv[0]=="con")padConC=n;else if(kv[0]=="bat")padBatC=n;
else if(kv[0]=="h2")padH2C=n;else if(kv[0]=="o2")padO2C=n;else if(kv[0]=="prt")padPrtC=n;}}

void ParseInvResponse(string data){
var parts=data.Split('|');
if(parts.Length<3)return;
if(parts[1]!="OK"){bootError=$"Inv: {parts[2]}";return;}
var vals=parts[2].Split(',');
foreach(var v in vals){var kv=v.Split('=');if(kv.Length!=2)continue;int n;int.TryParse(kv[1],out n);
if(kv[0]=="cargo")invCargoC=n;else if(kv[0]=="ref")invRefC=n;else if(kv[0]=="asm")invAsmC=n;
else if(kv[0]=="gen")invGenC=n;else if(kv[0]=="h2")invH2C=n;else if(kv[0]=="o2")invO2C=n;}}

void ParseSignalResponse(string data){
var parts=data.Split('|');
if(parts.Length<3)return;
if(parts[1]!="OK"){bootError=$"Signal: {parts[2]}";return;}
var vals=parts[2].Split(',');
foreach(var v in vals){var kv=v.Split('=');if(kv.Length!=2)continue;int n;int.TryParse(kv[1],out n);
if(kv[0]=="cams")signalCamC=n;else if(kv[0]=="lcds")signalLcdC=n;}}
void ParseDoorData(){
doorSetCount=0;doorsLocked=false;overallPressure=0;extDoorsOpen=0;
if(signalPB==null)return;
string cd=signalPB.CustomData;
int di=cd.IndexOf("[DOORS]");if(di<0)return;
int de=cd.IndexOf("[",di+7);if(de<0)de=cd.Length;
string ds=cd.Substring(di,de-di);
var lines=ds.Split('\n');
foreach(var ln in lines){
if(ln.StartsWith("count=")){int.TryParse(ln.Substring(6),out doorSetCount);}
else if(ln.StartsWith("locked=")){doorsLocked=ln.Contains("True");}
else if(ln.StartsWith("overall_pressure=")){float.TryParse(ln.Substring(17),out overallPressure);}
else if(ln.StartsWith("door_")){var pts=ln.Split('=');if(pts.Length>=2){var vals=pts[1].Split('|');if(vals.Length>=1&&vals[0]=="OPEN")extDoorsOpen++;}}}}

void ScanPressure(){
if(airVents.Count==0){overallPressure=0;return;}
float total=0;
foreach(var v in airVents){total+=v.GetOxygenLevel();}
overallPressure=(total/airVents.Count)*100f;
}

void WritePadRequest(){
if(padRequested)return;
IGC.SendBroadcastMessage("UNITY_BOOT_REQ",$"PAD_CHECK:{padID}");
padRequested=true;awaitTicks=0;
}

void WriteInvRequest(){
if(invRequested)return;
IGC.SendBroadcastMessage("UNITY_BOOT_REQ",$"INV_CHECK:{padID}");
invRequested=true;awaitTicks=0;
}

void WriteSignalRequest(){
if(signalRequested)return;
IGC.SendBroadcastMessage("UNITY_BOOT_REQ",$"SIGNAL_CHECK:{padID}");
signalRequested=true;awaitTicks=0;
}

void CheckCustomDataResponses(){
if(padPB==null||invPB==null)FindSiblingPBs();
if(!padResponded&&padPB!=null){string cd=padPB.CustomData;if(cd.Contains("pad_status=OK:")){int si=cd.IndexOf("pad_status=OK:");if(si>=0){int ei=cd.IndexOf("\n",si);string ln=ei>si?cd.Substring(si,ei-si):cd.Substring(si);padRspData="PAD|OK|"+ln.Substring(14);padResponded=true;ParsePadResponse(padRspData);}}}
if(!invResponded&&invPB!=null){string cd=invPB.CustomData;if(cd.Contains("inv_status=OK:")){int si=cd.IndexOf("inv_status=OK:");if(si>=0){int ei=cd.IndexOf("\n",si);string ln=ei>si?cd.Substring(si,ei-si):cd.Substring(si);invRspData="INV|OK|"+ln.Substring(14);invResponded=true;ParseInvResponse(invRspData);}}}
}

void RunBoot(){
bootTicks++;
if(btn==null||lcd1==null)ScanBlocks();
CheckReadyFlags();
if(!preBootDone){
if(!padReady||!invReady||!signalReady){
DrawWaitingScreen();
Echo("UNITY MISSILE SYSTEM");
Echo("Waiting for scripts...");
Echo($"Boot: OK | Pad: {(padReady?"OK":"wait")} | Inv: {(invReady?"OK":"wait")} | Sig: {(signalReady?"OK":"wait")}");
return;
}
ClearBootStatus();preBootDone=true;
}
CheckIGCMessages();
CheckCustomDataResponses();
CheckMinerBeacons();
if(bootTicks==3){bootSiblings=0;if(con1!=null&&con1.Status==MyShipConnectorStatus.Connected)bootSiblings++;if(con2!=null&&con2.Status==MyShipConnectorStatus.Connected)bootSiblings++;}
int stepDelay=12;int errPause=12;int totalSteps=28;
if(bootError!=""){bootErrTicks++;if(bootErrTicks>=errPause){bootError="";bootErrTicks=0;awaitTicks=0;}}
else if(bootTicks>2&&bootStep<totalSteps){
bool waiting=(bootStep==6&&!padResponded)||(bootStep==11&&!invResponded)||(bootStep==17&&!signalResponded);
if(waiting){awaitTicks++;if(awaitTicks>=maxAwait){if(bootStep==6){padResponded=true;padTimedOut=true;bootStatus="[WARN] Pad timeout";}else if(bootStep==11){invResponded=true;invTimedOut=true;bootStatus="[WARN] Inv timeout";}else{signalResponded=true;signalTimedOut=true;bootStatus="[WARN] Signal timeout";}bootStep++;awaitTicks=0;}}
else if(awaitTicks>0){bootStep++;awaitTicks=0;}
else if(bootTicks%stepDelay==0){string err=RunBootCheck(bootStep);if(err!=""){bootError=err;bootErrTicks=0;}else bootStep++;}}
if(bootStep>=totalSteps){
bootCompleteTicks++;
if(bootCompleteTicks<3){
IMyTextSurface[] pL={lcd1,lcd2,lcd3,lcd7,lcd8};
IMyTextSurface[] iL={lcd4,lcd5,lcd6,lcd9,lcd10,lcd11};
foreach(var lcd in pL){if(lcd!=null)DrawBootScreen(lcd,1f,"All Systems Operational",totalSteps-1,totalSteps,true);}
foreach(var lcd in iL){if(lcd!=null)DrawBootScreen(lcd,1f,"All Systems Operational",totalSteps-1,totalSteps,false);}
foreach(var lcd in camLCDs){if(lcd!=null)DrawBootScreen(lcd,1f,"All Systems Operational",totalSteps-1,totalSteps,true);}
foreach(var lcd in signalLCDs){if(lcd!=null)DrawBootScreen(lcd,1f,"All Systems Operational",totalSteps-1,totalSteps,true);}
Echo("UNITY MISSILE SYSTEM");
Echo("ALL SYSTEMS OPERATIONAL");
Echo($"[{totalSteps}/{totalSteps}] Success!");
return;
}
WriteBootComplete();
waitingForAck=true;
ackWaitTicks=0;
Echo("UNITY MISSILE SYSTEM");
Echo("BOOT COMPLETE - Awaiting ACKs");
Echo("Waiting for PAD and INVENTORY...");
return;
}
float pct=(float)bootStep/totalSteps;
string curCheck=bootStep<28?sysChecks[bootStep]:sysChecks[27];
if(bootStep==19)curCheck=doorSetCount>0?$"Door sets: {doorSetCount}":"No airlocks found";
if(bootStep==20)curCheck=extDoorsOpen==0?$"Pressurized: {overallPressure:F0}%":$"Breach: {extDoorsOpen} ext doors open";
if(bootStep==22)curCheck=bootSiblings>0?$"Syncing {bootSiblings} module(s)":"Standalone mode";
if(bootStep==24)curCheck=minerCount>0?$"Found {minerCount} miner(s)":"Scanning beacons...";
if(bootStep==25)curCheck=bootSiblings>0?$"Found {bootSiblings} pad(s)":"No extra pads";
IMyTextSurface[] padLCDs={lcd1,lcd2,lcd3,lcd7,lcd8};
IMyTextSurface[] invLCDs={lcd4,lcd5,lcd6,lcd9,lcd10,lcd11};
foreach(var lcd in padLCDs){if(lcd!=null)DrawBootScreen(lcd,pct,curCheck,bootStep,totalSteps,true);}
foreach(var lcd in invLCDs){if(lcd!=null)DrawBootScreen(lcd,pct,curCheck,bootStep,totalSteps,false);}
foreach(var lcd in camLCDs){if(lcd!=null)DrawBootScreen(lcd,pct,curCheck,bootStep,totalSteps,true);}
foreach(var lcd in signalLCDs){if(lcd!=null)DrawBootScreen(lcd,pct,curCheck,bootStep,totalSteps,true);}
Echo("UNITY MISSILE SYSTEM");
Echo("Boot Controller Active");
Echo($"[{Math.Min(bootStep+1,totalSteps)}/{totalSteps}] {curCheck}");
if(bootError!="")Echo($"ERROR: {bootError}");
else Echo($"Status: {bootStatus}");
Echo($"Pad: {(padResponded?"OK":"waiting")} | Inv: {(invResponded?"OK":"waiting")}");
}

void DrawBootScreen(IMyTextSurface s,float pct,string check,int step,int total,bool isPad){
s.ContentType=ContentType.SCRIPT;s.Script="";s.ScriptBackgroundColor=cBg;
var f=s.DrawFrame();
Vector2 sz=s.SurfaceSize;lcdW=sz.X;lcdH=sz.Y;lcdS=Math.Min(lcdW/512f,lcdH/512f);
float cx=lcdW/2,cy=lcdH/2;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,cy),sz,cBg));
f.Add(new MySprite(SpriteType.TEXT,"UNITY MISSILE SYSTEM",new Vector2(cx,40*lcdS),null,cPri,null,TextAlignment.CENTER,1.2f*lcdS));
f.Add(new MySprite(SpriteType.TEXT,"v01.00",new Vector2(cx,75*lcdS),null,cSec,null,TextAlignment.CENTER,0.5f*lcdS));
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,100*lcdS),new Vector2(lcdW-60*lcdS,2*lcdS),cSec));
string mod=isPad?"PAD CONTROLLER":"INVENTORY MODULE";
f.Add(new MySprite(SpriteType.TEXT,mod,new Vector2(cx,120*lcdS),null,cAcc,null,TextAlignment.CENTER,0.6f*lcdS));
f.Add(new MySprite(SpriteType.TEXT,"System Initialization",new Vector2(cx,150*lcdS),null,cTxt,null,TextAlignment.CENTER,0.55f*lcdS));
float bx=40*lcdS,by=lcdH-120*lcdS,bw=lcdW-80*lcdS,bh=20*lcdS;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,by+bh/2),new Vector2(bw,bh),cBdr));
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(bx+bw*pct/2,by+bh/2),new Vector2(bw*pct,bh-4*lcdS),cPri));
f.Add(new MySprite(SpriteType.TEXT,$"{(int)(pct*100)}%",new Vector2(cx,by+bh+5*lcdS),null,cTxt,null,TextAlignment.CENTER,0.45f*lcdS));
Color chkC=bootError!=""?cErr:cOK;
f.Add(new MySprite(SpriteType.TEXT,$"[{step+1}/{total}] {check}",new Vector2(cx,by-25*lcdS),null,chkC,null,TextAlignment.CENTER,0.4f*lcdS));
int localStep=step;
if(localStep<0)localStep=0;
if(localStep>=28)localStep=27;
int startIdx=Math.Max(0,localStep-4);
float ly=180*lcdS;
for(int i=startIdx;i<=localStep&&i<28;i++){
bool isErr=i==localStep&&bootError!="";
Color lc=isErr?cErr:i<localStep?cOK:i==localStep?cPri:cSec;
string prefix=isErr?"[!!]":i<localStep?"[OK]":i==localStep?"[>>]":"[..]";
f.Add(new MySprite(SpriteType.TEXT,$"{prefix} {sysChecks[i]}",new Vector2(30*lcdS,ly),null,lc,null,TextAlignment.LEFT,0.35f*lcdS));
ly+=18*lcdS;if(ly>by-50*lcdS)break;}
string syncSt;Color syncC;
if(bootError!=""){syncSt=$"ERROR: {bootError}";syncC=cErr;}
else if(isPad){
if(padID==1&&bootSiblings==0){syncSt=bootStatus!=""?bootStatus:$"PAD {padID} - Primary Launch Controller";syncC=cOK;}
else if(padID==1&&bootSiblings>0){syncSt=bootStatus!=""?bootStatus:$"PAD {padID} - Controller ({bootSiblings} modules)";syncC=cOK;}
else if(bootSiblings>0){syncSt=bootStatus!=""?bootStatus:$"PAD {padID} - Module (Synced)";syncC=cOK;}
else{syncSt=bootStatus!=""?bootStatus:$"PAD {padID} - Module (Standalone)";syncC=cWrn;}
}else{syncSt=bootStatus!=""?bootStatus:"INVENTORY MODULE";syncC=cOK;}
f.Add(new MySprite(SpriteType.TEXT,syncSt,new Vector2(cx,lcdH-30*lcdS),null,syncC,null,TextAlignment.CENTER,0.4f*lcdS));
f.Dispose();
}

string RunBootCheck(int step){
var blks=new List<IMyTerminalBlock>();
switch(step){
case 0:GridTerminalSystem.GetBlocksOfType(blks);if(blks.Count<5)return"Grid has fewer than 5 blocks";bootStatus=$"Core: {blks.Count} blocks";return"";
case 1:GridTerminalSystem.GetBlocksOfType(blks,b=>b.CubeGrid==Me.CubeGrid);bootStatus=$"Grid: {blks.Count} blocks";return"";
case 2:if(btn==null)return"No control panel";bootStatus="Button panel found";return"";
case 3:int lcdCnt=0;if(lcd1!=null)lcdCnt++;if(lcd2!=null)lcdCnt++;if(lcd3!=null)lcdCnt++;if(lcd4!=null)lcdCnt++;if(lcd5!=null)lcdCnt++;if(lcd6!=null)lcdCnt++;if(lcd7!=null)lcdCnt++;if(lcd8!=null)lcdCnt++;if(lcd9!=null)lcdCnt++;if(lcd10!=null)lcdCnt++;if(lcd11!=null)lcdCnt++;if(lcdCnt<1)return"No LCDs found";bootStatus=$"LCDs: {lcdCnt} found";return"";
case 4:if(bootRspL==null)return"IGC failed";bootStatus="IGC channels ready";return"";
case 5:WritePadRequest();bootStatus="Requesting pad status...";return"";
case 6:if(!padResponded)return"";bootStatus=padTimedOut?"[WARN] Pad no response":"Pad responded OK";return"";
case 7:bootStatus=padTimedOut?"[WARN] Merge unknown":padMergeC>0?$"Missile merge block: {padMergeC}":"No missile merge block";return"";
case 8:bootStatus=padTimedOut?"[WARN] Power unknown":$"Pad power: {padBatC} batteries";return"";
case 9:bootStatus=padTimedOut?"[WARN] Fuel unknown":$"Pad fuel: {padH2C} H2, {padO2C} O2";return"";
case 10:WriteInvRequest();bootStatus="Requesting inv status...";return"";
case 11:if(!invResponded)return"";bootStatus=invTimedOut?"[WARN] Inv no response":"Inv responded OK";return"";
case 12:bootStatus=invTimedOut?"[WARN] Cargo unknown":$"Inv cargo: {invCargoC}";return"";
case 13:bootStatus=invTimedOut?"[WARN] Refinery unknown":$"Inv refineries: {invRefC}";return"";
case 14:bootStatus=invTimedOut?"[WARN] Assembler unknown":$"Inv assemblers: {invAsmC}";return"";
case 15:bootStatus=invTimedOut?"[WARN] Gas unknown":$"Inv gas: {invGenC} gens";return"";
case 16:if(signalPB==null){signalResponded=true;bootStatus="Signal: optional";return"";}WriteSignalRequest();bootStatus="Requesting signal status...";return"";
case 17:if(!signalResponded)return"";bootStatus=signalTimedOut?"[WARN] Signal no response":signalPB==null?"Signal: optional":"Signal responded OK";return"";
case 18:bootStatus=signalTimedOut?"[WARN] Signal unknown":signalPB==null?"Signal: not installed":$"Signal: {signalCamC} cams, {signalLcdC} LCDs";return"";
case 19:ParseDoorData();ventCount=airVents.Count;bootStatus=doorSetCount>0?$"Doors: {doorSetCount} sets{(doorsLocked?" LOCKED":"")}":ventCount>0?$"Air vents: {ventCount}":"No airlocks (optional)";return"";
case 20:ScanPressure();bootStatus=ventCount==0?"No vents (skipped)":extDoorsOpen>0?$"[WARN] {extDoorsOpen} ext doors open":$"Pressurized: {overallPressure:F0}% ({ventCount} vents)";return"";
case 21:if(!padResponded||!invResponded||(signalPB!=null&&!signalResponded))return"Not all systems responded";bootStatus=(padTimedOut||invTimedOut||signalTimedOut)?"[WARN] Partial verification":"All systems verified";return"";
case 22:bootStatus=bootSiblings>0?$"Synced: {bootSiblings} modules":padID==1?"Primary pad":"Standalone";return"";
case 23:EnsureQuotas();SetupBtnGPS();bootStatus="Config written";return"";
case 24:WriteMinerData();if(minerCount==0&&!beaconOptional)return noMinerErrs[tick%noMinerErrs.Length];bootStatus=minerCount>0?$"Miners: {minerCount}":"No miners (optional)";return"";
case 25:if(bootSiblings>0){bootStatus=$"Connected pads: {bootSiblings}";}else{bootStatus="No extra pads (run CMDPAD SETUP to add)";}return"";
case 26:bootStatus="BOOT COMPLETE";return"";
case 27:bootStatus="ALL SYSTEMS OPERATIONAL";return"";
default:return"";
}
}

void EnsureQuotas(){
string cd=Me.CustomData;
if(!cd.Contains("boot_phase="))cd=cd.Replace("[SYSTEM]","[SYSTEM]\nboot_phase=CONFIG");
else cd=cd.Replace("boot_phase=RUNNING","boot_phase=CONFIG").Replace("boot_phase=WAITING","boot_phase=CONFIG");
Me.CustomData=cd;
}

void WriteBootComplete(){
string cd=Me.CustomData;
cd=cd.Replace("boot_complete=false","boot_complete=true").Replace("boot_complete=BOOTING","boot_complete=true");
cd=cd.Replace("boot_phase=INIT","boot_phase=COMPLETE").Replace("boot_phase=CONFIG","boot_phase=COMPLETE").Replace("boot_phase=RUNNING","boot_phase=COMPLETE");
if(!cd.Contains("boot_complete=true")){
int si=cd.IndexOf("[SYSTEM]");
if(si>=0){int ei=cd.IndexOf("\n",si);if(ei<0)ei=si+8;cd=cd.Insert(ei,"\nboot_complete=true");}
}
string padSess="";
if(padPB!=null){string pcd=padPB.CustomData;int idx=pcd.IndexOf("pad_session=");if(idx>=0){int end=pcd.IndexOf('\n',idx);if(end<0)end=pcd.Length;padSess=pcd.Substring(idx+12,end-idx-12).Trim();}}
if(padSess!=""&&!cd.Contains($"boot_for_session={padSess}")){int si=cd.IndexOf("[SYSTEM]");if(si>=0){int ei=cd.IndexOf("\n",si);if(ei<0)ei=si+8;cd=cd.Insert(ei,$"\nboot_for_session={padSess}");}}
Me.CustomData=cd;
Echo("Boot complete signal written to Me.CustomData");
}
void ReleaseLCDs(){
IMyTextSurface[] all={lcd1,lcd2,lcd3,lcd4,lcd5,lcd6,lcd7,lcd8,lcd9,lcd10,lcd11};
foreach(var lcd in all){if(lcd==null)continue;lcd.ContentType=ContentType.TEXT_AND_IMAGE;lcd.Script="";lcd.WriteText("");}
foreach(var lcd in camLCDs){if(lcd==null)continue;lcd.ContentType=ContentType.TEXT_AND_IMAGE;lcd.Script="";lcd.WriteText("");}
foreach(var lcd in signalLCDs){if(lcd==null)continue;lcd.ContentType=ContentType.TEXT_AND_IMAGE;lcd.Script="";lcd.WriteText("");}
}
void CheckAcks(){
if(ackL==null)return;
while(ackL.HasPendingMessage){
var msg=ackL.AcceptMessage();
string data=msg.Data.ToString();
if(data=="PAD_RUNNING")padAck=true;
if(data=="INV_RUNNING")invAck=true;
}
}
void CheckMinerBeacons(){
if(beaconL==null)return;
while(beaconL.HasPendingMessage){var msg=beaconL.AcceptMessage();var parts=msg.Data.ToString().Split('|');if(parts.Length>2&&parts[0]=="MB"){long eid;if(long.TryParse(parts[1],out eid))bootMiners[eid]=parts[2];}}
minerCount=bootMiners.Count;
minerNames=string.Join(",",bootMiners.Values);
}
void WriteMinerData(){
string cd=Me.CustomData;
if(!cd.Contains("miner_count="))cd=cd.Replace("[SYSTEM]","[SYSTEM]\nminer_count="+minerCount);else{int mc=cd.IndexOf("miner_count=");if(mc>=0){int me=cd.IndexOf("\n",mc);if(me<0)me=cd.Length;cd=cd.Remove(mc,me-mc);cd=cd.Insert(mc,"miner_count="+minerCount);}}
if(!cd.Contains("miner_names="))cd=cd.Replace("[SYSTEM]","[SYSTEM]\nminer_names="+minerNames);else{int mn=cd.IndexOf("miner_names=");if(mn>=0){int me=cd.IndexOf("\n",mn);if(me<0)me=cd.Length;cd=cd.Remove(mn,me-mn);cd=cd.Insert(mn,"miner_names="+minerNames);}}
Me.CustomData=cd;
}
void SetupBtnGPS(){
if(btn==null)return;
string cd=btn.CustomData;
if(string.IsNullOrEmpty(cd)||!cd.Contains("GPS:")){
btn.CustomData=@"=== UNITY MISSILE TARGETING ===
; Paste GPS coordinates here for missile targeting
; Copy from GPS menu (K) or antenna broadcasts
;
; FORMAT: GPS:Name:X:Y:Z:#AARRGGBB:
; Example: GPS:Enemy Base:50000:12000:8500:#FFFF0000:
;
; HOW TO ADD TARGETS:
; 1. Open GPS menu (K key)
; 2. Right-click a waypoint -> Copy to Clipboard
; 3. Paste here (Ctrl+V in CustomData)
; 4. Multiple targets OK - one per line
;
; QUICK ENTRY (via PB argument):
; Run: GPS:1000,500,200
;
; Lines starting with ; are ignored
; =============================

";
}
}
void DrawWaitingScreen(){
IMyTextSurface[] allLCDs={lcd1,lcd2,lcd3,lcd4,lcd5,lcd6,lcd7,lcd8,lcd9,lcd10,lcd11};
foreach(var s in allLCDs){DrawWaitScreen(s);}
foreach(var s in camLCDs){DrawWaitScreen(s);}
foreach(var s in signalLCDs){DrawWaitScreen(s);}
}
void DrawWaitScreen(IMyTextSurface s){
if(s==null)return;
s.ContentType=ContentType.SCRIPT;s.Script="";s.ScriptBackgroundColor=cBg;
var f=s.DrawFrame();
Vector2 sz=s.SurfaceSize;lcdW=sz.X;lcdH=sz.Y;lcdS=Math.Min(lcdW/512f,lcdH/512f);
float cx=lcdW/2;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,lcdH/2),sz,cBg));
f.Add(new MySprite(SpriteType.TEXT,"UNITY MISSILE SYSTEM",new Vector2(cx,40*lcdS),null,cPri,null,TextAlignment.CENTER,1.2f*lcdS));
f.Add(new MySprite(SpriteType.TEXT,"WAITING FOR SCRIPTS",new Vector2(cx,120*lcdS),null,cWrn,null,TextAlignment.CENTER,0.7f*lcdS));
float ly=180*lcdS;
f.Add(new MySprite(SpriteType.TEXT,$"[OK] Boot Controller",new Vector2(30*lcdS,ly),null,cOK,null,TextAlignment.LEFT,0.4f*lcdS));ly+=22*lcdS;
f.Add(new MySprite(SpriteType.TEXT,$"[{(padReady?"OK":"..")}] Pad Controller",new Vector2(30*lcdS,ly),null,padReady?cOK:cSec,null,TextAlignment.LEFT,0.4f*lcdS));ly+=22*lcdS;
f.Add(new MySprite(SpriteType.TEXT,$"[{(invReady?"OK":"..")}] Inventory Module",new Vector2(30*lcdS,ly),null,invReady?cOK:cSec,null,TextAlignment.LEFT,0.4f*lcdS));ly+=22*lcdS;
f.Add(new MySprite(SpriteType.TEXT,$"[{(signalReady?"OK":"..")}] Signal Display",new Vector2(30*lcdS,ly),null,signalReady?cOK:cSec,null,TextAlignment.LEFT,0.4f*lcdS));ly+=22*lcdS;
f.Add(new MySprite(SpriteType.TEXT,"Compile missing scripts to proceed",new Vector2(cx,lcdH-40*lcdS),null,cTxt,null,TextAlignment.CENTER,0.35f*lcdS));
f.Dispose();
}
double VD(Vector3D a,Vector3D b)=>Vector3D.Distance(a,b);
Vector3D VN(Vector3D v)=>Vector3D.Normalize(v);
bool CheckSetupCommands(){
if(setupL==null)return false;
bool handled=false;
while(setupL.HasPendingMessage){
var msg=setupL.AcceptMessage();
string data=msg.Data.ToString();
if(data==$"SETUPMOD|{padID}"){SetupModule(false);WriteSetupStatus("SETUPMOD");handled=true;}
else if(data==$"SETUPFORCE|{padID}"){SetupModule(true);WriteSetupStatus("SETUPFORCE");handled=true;}
else if(data==$"NAMEPAD|{padID}"){NamePadParts();WriteSetupStatus("NAMEPAD");handled=true;}
else if(data==$"NAMEMSL|{padID}"){IncrementBldNum();NameMissileParts();AutoNameConnectors();WriteSetupStatus("NAMEMSL");handled=true;}}
if(handled){Echo("UNITY BOOT - Setup Complete");Echo("Blocks renamed. Please recompile all scripts.");}
return handled;
}
void WriteSetupStatus(string cmd){
string cd=Me.CustomData;
string ts=DateTime.Now.ToString("HH:mm:ss");
if(!cd.Contains("setup_status="))cd=cd.Replace("[SYSTEM]",$"[SYSTEM]\nsetup_status={cmd}@{ts}");
else{int si=cd.IndexOf("setup_status=");int ei=cd.IndexOf("\n",si);if(ei<0)ei=cd.Length;cd=cd.Remove(si,ei-si);cd=cd.Insert(si,$"setup_status={cmd}@{ts}");}
Me.CustomData=cd;
}
void IncrementBldNum(){
if(padPB==null)FindSiblingPBs();
if(padPB==null)return;
string cd=padPB.CustomData;
int bldNum=GetMslBuildNum()+1;
if(!cd.Contains("bldNum="))cd+=$"\nbldNum={bldNum}";
else{int si=cd.IndexOf("bldNum=");int ei=cd.IndexOf("\n",si);if(ei<0)ei=cd.Length;cd=cd.Remove(si,ei-si);cd=cd.Insert(si,$"bldNum={bldNum}");}
padPB.CustomData=cd;
}
List<int> DiscoverSiblingPads(){
var ids=new List<int>();
var pbs=new List<IMyProgrammableBlock>();
GridTerminalSystem.GetBlocksOfType(pbs,b=>b.IsSameConstructAs(Me)&&b!=Me&&(b.CustomName.ToUpper().Contains("UNITY PAD")||b.CustomName.ToUpper().Contains("UNITY BOOT")));
foreach(var pb in pbs){
string n=pb.CustomName;
int idx=n.IndexOf("[PAD");
if(idx>=0){
int end=n.IndexOf("]",idx);
if(end>idx+4){
string num=n.Substring(idx+4,end-idx-4);
int id;if(int.TryParse(num,out id)&&id>0&&!ids.Contains(id))ids.Add(id);}}}
return ids;
}
int GetNextPadID(){
var taken=DiscoverSiblingPads();
int next=1;
while(taken.Contains(next))next++;
return next;
}
void SetupModule(bool force){
if(padID==0){padID=GetNextPadID();UpdatePadTag();}
string tg=$"[PAD{padID}]",pt=$"[PAD{padID}-PRINT]";
Vector3D mp=Me.GetPosition();
var aB=new List<IMyTerminalBlock>();GridTerminalSystem.GetBlocksOfType(aB);
var pB=new List<IMyTerminalBlock>();GridTerminalSystem.GetBlocksOfType(pB,b=>b.CubeGrid==Me.CubeGrid);
IMyShipMergeBlock pm=null;double pd=999;
foreach(var b in pB)if(b is IMyShipMergeBlock){double d=VD(b.GetPosition(),mp);if(d<pd){pm=b as IMyShipMergeBlock;pd=d;}}
Vector3D mP=pm!=null?pm.GetPosition():mp;
IMyShipMergeBlock om=null;bool iM=pm!=null&&pm.IsConnected;
if(iM){var aM=new List<IMyShipMergeBlock>();GridTerminalSystem.GetBlocksOfType(aM,m=>m.IsConnected&&m!=pm);if(aM.Count>0)om=aM[0];}
Vector3D mD=Vector3D.Zero;if(iM&&om!=null)mD=VN(om.GetPosition()-mP);
var sG=new HashSet<long>();
foreach(var b in pB)if(b is IMyPistonBase){var p=b as IMyPistonBase;if(p.Top!=null&&VD(b.GetPosition(),mp)<50)sG.Add(p.Top.CubeGrid.EntityId);}
int li=1,vi=1,hi=1,wi=1,ci=1;
Action<IMyTerminalBlock>T=b=>b.CustomName=$"{tg} {BT(b)}";
Func<string,string>Strip=n=>{int i=n.IndexOf("[PAD");if(i>=0){int e=n.IndexOf("]",i);if(e>i)n=n.Remove(i,e-i+1).Trim();}return n;};
foreach(var b in pB){
if(b.CustomName.Contains("Missile #")||b.CustomName.Contains("-PRINT")||b==Me)continue;
double d=VD(b.GetPosition(),mp);if(d>80)continue;
if(iM&&mD!=Vector3D.Zero&&Vector3D.Dot(b.GetPosition()-mP,mD)>1)continue;
string nm=b.CustomName;
if(force&&nm.Contains("[PAD")&&!nm.Contains($"[PAD{padID}"))nm=Strip(nm);
if(nm.Contains("[PRINT]")&&!nm.Contains("-PRINT]")){b.CustomName=nm.Replace("[PRINT]",pt);continue;}
if(!force&&nm.Contains($"[PAD{padID}]"))continue;
if(nm.Contains("[PAD")&&!nm.Contains($"[PAD{padID}"))nm=Strip(nm);
if(b is IMyShipMergeBlock&&b==pm)b.CustomName=$"{tg} Merge";
else if(b is IMyShipConnector){var cn=b as IMyShipConnector;string u=nm.ToUpper();if(u.Contains("ORE")||u.Contains("EJECTOR"))b.CustomName=$"{tg} {nm}";else if(ci<=2){b.CustomName=$"[PAD{padID}-CON{ci}]";ci++;}else b.CustomName=$"{tg} Con";}
else if(b is IMyTextPanel&&li<=8){b.CustomName=$"[PAD{padID}:{li}] LCD";li++;}
else if(b is IMyPistonBase){var ps=b as IMyPistonBase;if(Math.Abs(Vector3D.Dot(ps.WorldMatrix.Up,Vector3D.Up))>0.7){b.CustomName=$"{pt} V{vi}";vi++;}else{b.CustomName=$"{pt} H{hi}";hi++;}}
else if(b is IMyShipWelder){b.CustomName=$"{pt} W{wi}";wi++;}
else if(b is IMyProjector)b.CustomName=$"{pt} Proj";
else if(b is IMyButtonPanel)b.CustomName=$"{tg} Btn";
else if(b is IMyBatteryBlock||b is IMyGasTank||b is IMyCargoContainer||b is IMyRefinery||b is IMyAssembler||b is IMyRadioAntenna||b is IMyLaserAntenna||b is IMyReactor||b is IMySolarPanel||b is IMyGasGenerator||b is IMyGyro||b is IMyThrust||b is IMySensorBlock||b is IMyCameraBlock||b is IMyRemoteControl||b is IMyCockpit||b is IMyMedicalRoom)T(b);
else if(b is IMyDoor)b.CustomName=$"{tg} Dr";
else if(b is IMyLightingBlock)b.CustomName=$"{tg} Lt";
else if(b is IMyConveyorSorter)b.CustomName=$"{tg} Srt";
else if(b is IMyShipDrill)b.CustomName=$"{tg} Drl";
else if(b is IMyShipGrinder)b.CustomName=$"{tg} Grd";
else if(b is IMyOreDetector)b.CustomName=$"{tg} ODt";
else if(b is IMyBeacon)b.CustomName=$"{tg} Bcn";
else if(b is IMyTimerBlock)b.CustomName=$"{tg} Tmr";
else if(b is IMyAirVent)b.CustomName=$"{tg} Vnt";
else if(b is IMyGravityGenerator)b.CustomName=$"{tg} Grv";
else if(b is IMyJumpDrive)b.CustomName=$"{tg} Jmp";
else{string bt=BT(b);if(!string.IsNullOrEmpty(bt)&&bt.Length<30)b.CustomName=$"{tg} {bt}";}}
foreach(var b in aB){
if(b.CubeGrid==Me.CubeGrid||!sG.Contains(b.CubeGrid.EntityId)||b.CustomName.Contains("[PAD")||b.CustomName.Contains("Missile #")||b.CustomName.Contains("-PRINT"))continue;
if(b is IMyShipWelder){b.CustomName=$"{pt} W{wi}";wi++;}
else if(b is IMyProjector&&!b.CustomName.Contains("-PRINT]"))b.CustomName=$"{pt} Proj";
else if(b is IMyCockpit)T(b);}
RenameSiblingPBs();
}
void RenameSiblingPBs(){
string tg=$"[PAD{padID}]";
var pbs=new List<IMyProgrammableBlock>();
GridTerminalSystem.GetBlocksOfType(pbs,b=>b.CubeGrid==Me.CubeGrid);
foreach(var pb in pbs){
string nm=pb.CustomName.ToUpper();
if(nm.Contains("UNITY PAD"))pb.CustomName=$"{tg} Unity Pad";
else if(nm.Contains("UNITY INVENTORY"))pb.CustomName=$"{tg} Unity Inventory";
else if(nm.Contains("UNITY SIGNAL"))pb.CustomName=$"{tg} UNITY SIGNAL";
else if(nm.Contains("UNITY BOOT"))pb.CustomName=$"{tg} UNITY BOOT";}}
void NamePadParts(){
string tg=$"[PAD{padID}]";
var pB=new List<IMyTerminalBlock>();
GridTerminalSystem.GetBlocksOfType(pB,b=>b.CubeGrid==Me.CubeGrid);
Action<IMyTerminalBlock>N=x=>{if(!HasSysTag(x)&&!x.CustomName.StartsWith("[PAD]"))x.CustomName=$"[PAD] {BT(x)}";};
foreach(var b in pB){
if(b is IMyBatteryBlock||b is IMyGasTank||b is IMyCargoContainer||b is IMyRefinery||b is IMyAssembler||b is IMyRadioAntenna||b is IMyLaserAntenna||b is IMyReactor||b is IMySolarPanel||b is IMyGasGenerator||b is IMyGyro||b is IMyThrust||b is IMySensorBlock||b is IMyCameraBlock)N(b);}}
void NameMissileParts(){
var mslBlocks=new List<IMyTerminalBlock>();
IMyShipMergeBlock padMerge=null;
var merges=new List<IMyShipMergeBlock>();
GridTerminalSystem.GetBlocksOfType(merges,m=>m.CubeGrid==Me.CubeGrid&&m.CustomName.Contains($"[PAD{padID}]"));
if(merges.Count>0)padMerge=merges[0];
if(padMerge==null||!padMerge.IsConnected)return;
long mslGrid=0;
var allMerges=new List<IMyShipMergeBlock>();
GridTerminalSystem.GetBlocksOfType(allMerges,m=>m.IsConnected&&m!=padMerge);
foreach(var m in allMerges){if(VD(m.GetPosition(),padMerge.GetPosition())<3){mslGrid=m.CubeGrid.EntityId;break;}}
if(mslGrid==0)return;
int bldNum=GetMslBuildNum();
string t=$"[PAD{padID}] Missile #{bldNum}";
GridTerminalSystem.GetBlocksOfType(mslBlocks,b=>b.CubeGrid.EntityId==mslGrid);
foreach(var b in mslBlocks){
if(b is IMyProgrammableBlock)b.CustomName=$"{t} Program";
else b.CustomName=$"{t} {BT(b)}";}}
int GetMslBuildNum(){
if(padPB==null)FindSiblingPBs();
if(padPB==null)return 1;
string cd=padPB.CustomData;
int idx=cd.IndexOf("bldNum=");
if(idx<0)return 1;
int end=cd.IndexOf('\n',idx);if(end<0)end=cd.Length;
string v=cd.Substring(idx+7,end-idx-7).Trim();
int n;if(int.TryParse(v,out n))return n;
return 1;
}
void AutoNameConnectors(){
IMyShipMergeBlock padMerge=null,mslMerge=null;
IMyShipConnector padCon=null;
var merges=new List<IMyShipMergeBlock>();
GridTerminalSystem.GetBlocksOfType(merges,m=>m.CubeGrid==Me.CubeGrid&&m.CustomName.Contains($"[PAD{padID}]"));
if(merges.Count>0)padMerge=merges[0];
if(padMerge==null||!padMerge.IsConnected)return;
var allMerges=new List<IMyShipMergeBlock>();
GridTerminalSystem.GetBlocksOfType(allMerges,m=>m.IsConnected&&m!=padMerge);
foreach(var m in allMerges){if(VD(m.GetPosition(),padMerge.GetPosition())<3){mslMerge=m;break;}}
if(mslMerge==null)return;
var cons=new List<IMyShipConnector>();
GridTerminalSystem.GetBlocksOfType(cons,c=>c.CubeGrid==Me.CubeGrid&&c.CustomName.Contains($"[PAD{padID}-CON"));
if(cons.Count>0)padCon=cons[0];
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
if(dot>0)mslCons.Add(c);}
if(mslCons.Count==0)return;
IMyShipConnector dockCon=null,ammoCon=null;
double minD=double.MaxValue,maxD=0;
Vector3D refPos=padCon!=null?padCon.GetPosition():padMergePos;
int bldNum=GetMslBuildNum();
foreach(var c in mslCons){
double d=VD(c.GetPosition(),refPos);
if(d<minD){minD=d;dockCon=c;}
if(d>maxD){maxD=d;ammoCon=c;}}
if(dockCon!=null)dockCon.CustomName=$"[PAD{padID}] Missile #{bldNum} Connector [DOCK]";
if(ammoCon!=null&&ammoCon!=dockCon)ammoCon.CustomName=$"[PAD{padID}] Missile #{bldNum} Connector [AMMO]";
}
bool HasSysTag(IMyTerminalBlock b){string n=b.CustomName;return n.Contains("[PAD")||n.Contains("[PRINT]")||n.Contains("[DOCK]")||n.Contains("[AMMO]");}
string BT(IMyTerminalBlock b){string s=b.BlockDefinition.SubtypeId;if(string.IsNullOrEmpty(s)){if(b is IMyGasGenerator)return"O2/H2 Gen";if(b is IMyGasTank)return"Gas Tank";s=b.BlockDefinition.TypeIdString.Replace("MyObjectBuilder_","");}return s.Contains("Battery")?"Battery":s.Contains("HydrogenTank")?"H2 Tank":s.Contains("OxygenTank")?"O2 Tank":s.Contains("LargeContainer")?"Large Cargo":s.Contains("MediumContainer")?"Medium Cargo":s.Contains("SmallContainer")?"Small Cargo":s.Contains("Refinery")?"Refinery":s.Contains("Assembler")?"Assembler":s.Contains("RadioAntenna")?"Antenna":s.Contains("LaserAntenna")?"Laser Ant":s.Contains("Gyro")?"Gyroscope":s.Contains("HydrogenThrust")?"H2 Thruster":s.Contains("AtmosphericThrust")?"Atmo Thruster":s.Contains("Thrust")?"Ion Thruster":s.Contains("Programmable")?"Program":s.Contains("Merge")?"Merge Block":s.Contains("Connector")?"Connector":s.Contains("Projector")?"Projector":s.Contains("Piston")?"Piston":s.Contains("Camera")?"Camera":s.Contains("Sensor")?"Sensor":s.Contains("RemoteControl")?"Remote Control":s.Contains("Warhead")?"Warhead":s.Contains("ButtonPanel")?"Button Panel":s.Contains("LCD")?"LCD Panel":s.Contains("Reactor")?"Reactor":s.Contains("Solar")?"Solar Panel":s.Contains("Wind")?"Wind Turbine":s.Contains("Medical")?"Medical Room":s.Contains("Survival")?"Survival Kit":s.Contains("Cryo")?"Cryo Chamber":s.Contains("Cockpit")?"Cockpit":s;}
