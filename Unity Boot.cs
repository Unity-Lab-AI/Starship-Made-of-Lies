int padID=1;int tick=0;
bool bootDone=false;int bootStep=0;int bootTicks=0;string bootError="";int bootErrTicks=0;string bootStatus="Initializing...";
int bootSiblings=0;bool preBootDone=false;bool padReady=false,invReady=false,signalReady=false;int bootCompleteTicks=0;
bool waitingForAck=false;bool padAck=false,invAck=false;int ackWaitTicks=0;
IMyBroadcastListener ackL;
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
IMyBroadcastListener bootRspL;
Color cPri=new Color(0,180,255);Color cSec=new Color(100,100,100);Color cAcc=new Color(255,200,0);
Color cOK=new Color(0,255,100);Color cWrn=new Color(255,180,0);Color cErr=new Color(255,60,60);
Color cBg=new Color(10,10,15);Color cBdr=new Color(40,40,50);Color cTxt=new Color(220,220,220);
bool padRequested=false,padResponded=false,invRequested=false,invResponded=false,signalRequested=false,signalResponded=false;
string padRspData="",invRspData="",signalRspData="";
int signalCamC=0,signalLcdC=0;
int doorSetCount=0;bool doorsLocked=false;float overallPressure=0;int extDoorsOpen=0;
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
lcd1=lcd2=lcd3=lcd4=lcd5=lcd6=lcd7=lcd8=lcd9=lcd10=lcd11=null;btn=null;con1=con2=null;bootAnt.Clear();camLCDs.Clear();
var blks=new List<IMyTerminalBlock>();
GridTerminalSystem.GetBlocksOfType(blks,b=>b.CustomName.Contains(padTag)||b.CubeGrid==Me.CubeGrid);
foreach(var b in blks){
if(b is IMyButtonPanel&&b.CustomName.ToLower().Contains("control")&&btn==null)btn=b as IMyButtonPanel;
if(b is IMyShipConnector){string nm=b.CustomName;if(nm.Contains("-CON1"))con1=b as IMyShipConnector;else if(nm.Contains("-CON2"))con2=b as IMyShipConnector;}
if(b is IMyRadioAntenna)bootAnt.Add(b as IMyRadioAntenna);
if(b is IMyTextSurface||b is IMyTextPanel){string nm=b.CustomName;if(!nm.Contains(padTag))continue;
IMyTextSurface ts=b is IMyTextSurface?(IMyTextSurface)b:((IMyTextPanel)b);
if(nm.ToUpper().Contains("CAMS")){if(!camLCDs.Contains(ts))camLCDs.Add(ts);continue;}
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

void WritePadRequest(){
if(padRequested)return;
IGC.SendBroadcastMessage("UNITY_BOOT_REQ","PAD_CHECK");
padRequested=true;awaitTicks=0;
}

void WriteInvRequest(){
if(invRequested)return;
IGC.SendBroadcastMessage("UNITY_BOOT_REQ","INV_CHECK");
invRequested=true;awaitTicks=0;
}

void WriteSignalRequest(){
if(signalRequested)return;
IGC.SendBroadcastMessage("UNITY_BOOT_REQ","SIGNAL_CHECK");
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
if(waiting){awaitTicks++;if(awaitTicks>=maxAwait){if(bootStep==6){padResponded=true;bootStatus="[WARN] Pad timeout";}else if(bootStep==11){invResponded=true;bootStatus="[WARN] Inv timeout";}else{signalResponded=true;bootStatus="[WARN] Signal timeout";}bootStep++;awaitTicks=0;}}
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
case 6:if(!padResponded)return"";bootStatus=$"Pad responded OK";return"";
case 7:bootStatus=padMergeC>0?$"Missile merge block: {padMergeC}":"No missile merge block";return"";
case 8:bootStatus=$"Pad power: {padBatC} batteries";return"";
case 9:bootStatus=$"Pad fuel: {padH2C} H2, {padO2C} O2";return"";
case 10:WriteInvRequest();bootStatus="Requesting inv status...";return"";
case 11:if(!invResponded)return"";bootStatus=$"Inv responded OK";return"";
case 12:bootStatus=$"Inv cargo: {invCargoC}";return"";
case 13:bootStatus=$"Inv refineries: {invRefC}";return"";
case 14:bootStatus=$"Inv assemblers: {invAsmC}";return"";
case 15:bootStatus=$"Inv gas: {invGenC} gens";return"";
case 16:if(signalPB==null){signalResponded=true;bootStatus="Signal: optional";return"";}WriteSignalRequest();bootStatus="Requesting signal status...";return"";
case 17:if(!signalResponded)return"";bootStatus=signalPB==null?"Signal: optional":"Signal responded OK";return"";
case 18:bootStatus=signalPB==null?"Signal: not installed":$"Signal: {signalCamC} cams, {signalLcdC} LCDs";return"";
case 19:ParseDoorData();bootStatus=doorSetCount>0?$"Doors: {doorSetCount} sets{(doorsLocked?" LOCKED":"")}":"No airlocks (optional)";return"";
case 20:bootStatus=extDoorsOpen==0?$"Pressurized: {overallPressure:F0}%":(extDoorsOpen>0?$"[WARN] {extDoorsOpen} ext doors open":"Sealed");return"";
case 21:if(!padResponded||!invResponded||(signalPB!=null&&!signalResponded))return"Not all systems responded";bootStatus="All systems verified";return"";
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
