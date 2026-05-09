string blockTag="[PAD1]";
int padID=1;
bool bootComplete=false;
bool isCtl=false;
int tick=0;
int pageTick=0;
int currentPage=0;
int itemsPerPage=10;
int pageInterval=300;
float lcdW=512,lcdH=512,lcdS=1,lcdYS=1,fntS=1;
Color cPri=new Color(0,180,255);Color cSec=new Color(100,100,100);Color cAcc=new Color(255,200,0);
Color cOK=new Color(0,255,100);Color cWrn=new Color(255,180,0);Color cErr=new Color(255,60,60);
Color cBg=new Color(10,10,15);Color cBdr=new Color(40,40,50);Color cTxt=new Color(220,220,220);
IMyProgrammableBlock bootPB,padPB;
string padSession="";
List<IMyCameraBlock> localCams=new List<IMyCameraBlock>();
List<CamEntry> allCams=new List<CamEntry>();
Dictionary<string,List<IMyTextSurface>> lcdsBySlot=new Dictionary<string,List<IMyTextSurface>>();
List<IMyTextSurface> signalLCDs=new List<IMyTextSurface>();
IMyBroadcastListener mslListener;
IMyBroadcastListener minerListener;
Dictionary<long,MslData> missiles=new Dictionary<long,MslData>();
Dictionary<long,MinerData> miners=new Dictionary<long,MinerData>();
int lastScan=0;
List<IMyRadioAntenna> padRadios=new List<IMyRadioAntenna>();
List<IMyLaserAntenna> padLasers=new List<IMyLaserAntenna>();
int radioEnabled=0,laserConnected=0;

class CamEntry{public string name;public string type;public string status;public long entityId;public int slot;public float dist;}
class MslData{public string status;public string lastPhase;public List<long> camIds=new List<long>();public List<string> camNames=new List<string>();public int lastSeen;public Vector3D pos;public float dist;public float alt;public float spd;public float fuel;public string gyro="";public int padId;public string outcome;}
class MinerData{public string shipName;public string status;public List<long> camIds=new List<long>();public int lastSeen;}
Dictionary<long,int> laserAssign=new Dictionary<long,int>();
class SatData{public int gridX,gridZ,bat,h2,links;public string status;public int lastSeen;}
Dictionary<int,SatData> satellites=new Dictionary<int,SatData>();
IMyBroadcastListener satStL,satIntL;
List<string> intercepts=new List<string>();
const int MAX_INTERCEPTS=10;
List<string> conflicts=new List<string>();
const int MAX_CONFLICTS=5;
List<string> flightLog=new List<string>();
const int MAX_FLIGHT_LOG=30;
List<string> mslOutcomes=new List<string>();
const int MAX_OUTCOMES=20;
class DoorSet{public Dictionary<string,List<IMyDoor>> extDoors=new Dictionary<string,List<IMyDoor>>();public Dictionary<string,List<IMyDoor>> intDoors=new Dictionary<string,List<IMyDoor>>();public Dictionary<string,List<IMySensorBlock>> senExt=new Dictionary<string,List<IMySensorBlock>>();public Dictionary<string,List<IMySensorBlock>> senInt=new Dictionary<string,List<IMySensorBlock>>();public IMyAirVent vent;public int state;public int lastChange;public bool failed;}
Dictionary<char,DoorSet> doorSets=new Dictionary<char,DoorSet>();
class RemoteDoorData{public int padId;public int doorCount;public bool locked;public bool emergency;public float pressure;public int extOpen;public int intOpen;public int lastSeen;}
Dictionary<int,RemoteDoorData> remoteDoors=new Dictionary<int,RemoteDoorData>();
bool doorsLocked=false;
bool doorEmergency=false;
int emergencyCount=0;
string lastDoorError="";
const int DOOR_DEBOUNCE=30;
List<IMyAirVent> padVents=new List<IMyAirVent>();
float overallPressure=0;

class WeaponData{public IMyUserControllableGun gun;public string type;public string name;public float ammo;public bool active;public bool firing;}
List<WeaponData> weapons=new List<WeaponData>();
List<IMyCargoContainer> ammoContainers=new List<IMyCargoContainer>();
List<IMyTextSurface> defenseLCDs=new List<IMyTextSurface>();
List<IMyTextSurface> satLCDs=new List<IMyTextSurface>();
List<IMyTextSurface> pressureLCDs=new List<IMyTextSurface>();
List<IMyTextSurface> flightLCDs=new List<IMyTextSurface>();
int satPage=0;
bool defenseArmed=true;
int weaponFiring=0;
Dictionary<string,int> ammoReserves=new Dictionary<string,int>();

IMyBroadcastListener bootReqL,signalCmdL,signalStatusL;
public Program(){
Runtime.UpdateFrequency=UpdateFrequency.Update10;
Storage="";
UpdatePadFromName();
WriteSignalReady();
mslListener=IGC.RegisterBroadcastListener("UNITY_MSL");
minerListener=IGC.RegisterBroadcastListener("MINER_BEACON");
bootReqL=IGC.RegisterBroadcastListener("UNITY_BOOT_REQ");
satStL=IGC.RegisterBroadcastListener("UNITY_SAT_RELAY_STATUS");
satIntL=IGC.RegisterBroadcastListener("UNITY_SAT_INTERCEPT");
signalCmdL=IGC.RegisterBroadcastListener("UNITY_SIGNAL_CMD");
signalStatusL=IGC.RegisterBroadcastListener("UNITY_SIGNAL_STATUS");
LoadSatellites();
}
void UpdatePadFromName(){
string nm=Me.CustomName;
int idx=nm.IndexOf("[PAD");
if(idx>=0){
int numStart=idx+4;
string numStr="";
for(int i=numStart;i<nm.Length&&char.IsDigit(nm[i]);i++)numStr+=nm[i];
if(numStr.Length>0){int p;if(int.TryParse(numStr,out p)){padID=p;blockTag=$"[PAD{p}]";}}}}

void WriteSignalReady(){
FindPadPB();
string sess="";
if(padPB!=null){
string pcd=padPB.CustomData;
int idx=pcd.IndexOf("pad_session=");
if(idx>=0){int end=pcd.IndexOf('\n',idx);if(end<0)end=pcd.Length;sess=pcd.Substring(idx+12,end-idx-12).Trim();}}
padSession=sess;
WriteCustomData(sess);}
void WriteCustomData(string sess){
string lsrData="";
for(int i=0;i<padLasers.Count;i++){
var lsr=padLasers[i];
string tgt="NONE";long mslId=0;
foreach(var kv in laserAssign)if(kv.Value==i){mslId=kv.Key;break;}
if(mslId!=0&&missiles.ContainsKey(mslId)){var m=missiles[mslId];tgt=$"MSL-{mslId%10000}|{m.dist:F0}m";}
lsrData+=$"laser_{i}={tgt}|{lsr.Status}\n";}
string satData=$"count={satellites.Count}\n";
foreach(var kv in satellites){var s=kv.Value;satData+=$"sat_{kv.Key}={s.gridX},{s.gridZ}|{s.bat}|{s.h2}|{s.links}|{s.status}\n";}
string intData="";foreach(var i in intercepts)intData+=i+"\n";
string cflData="";foreach(var c in conflicts)cflData+=c+"\n";
string fltData="";foreach(var f in flightLog)fltData+=f+"\n";
string outData="";foreach(var o in mslOutcomes)outData+=o+"\n";
string failedSets="";foreach(var kv in doorSets)if(kv.Value.failed)failedSets+=kv.Key;
string doorData=$"count={doorSets.Count}\nlocked={doorsLocked}\nemergency={doorEmergency}\nemergency_count={emergencyCount}\noverall_pressure={overallPressure:F0}\npad_vents={padVents.Count}\nlast_error={lastDoorError}\nfailed_sets={failedSets}\n";
foreach(var kv in doorSets){var ds=kv.Value;
int eO=0,eC=0,iO=0,iC=0,eCnt=0,iCnt=0;
foreach(var dl in ds.extDoors.Values)foreach(var d in dl){eCnt++;if(d.Status==DoorStatus.Open)eO++;else if(d.Status==DoorStatus.Closed)eC++;}
foreach(var dl in ds.intDoors.Values)foreach(var d in dl){iCnt++;if(d.Status==DoorStatus.Open)iO++;else if(d.Status==DoorStatus.Closed)iC++;}
string eS=eCnt==0?"NONE":eO>0?"OPEN":eC==eCnt?"CLOSED":"MOVING";
string iS=iCnt==0?"NONE":iO>0?"OPEN":iC==iCnt?"CLOSED":"MOVING";
float prs=ds.vent!=null?ds.vent.GetOxygenLevel()*100:0;
string fS=ds.failed?"FAILED":"OK";
bool seAny=false;foreach(var sl in ds.senExt.Values)foreach(var s in sl)if(s.Enabled&&s.IsActive){seAny=true;break;}
bool siAny=false;foreach(var sl in ds.senInt.Values)foreach(var s in sl)if(s.Enabled&&s.IsActive){siAny=true;break;}
string sE=ds.senExt.Count>0?(seAny?"TRIG":"RDY"):"NONE";
string sI=ds.senInt.Count>0?(siAny?"TRIG":"RDY"):"NONE";
doorData+=$"door_{kv.Key}={eS}|{iS}|{prs:F0}|{ds.state}|{fS}|{sE}|{sI}|{eCnt}x{iCnt}\n";}
string ctlData="";
if(isCtl){
int satActive=0;foreach(var s in satellites.Values)if(s.status=="SAT_HOLD"||s.status=="ACTIVE")satActive++;
int rdEmg=0,rdLck=0,rdExtO=0,rdIntO=0,rdTotal=0;float rdPrs=0;
foreach(var rd in remoteDoors.Values){rdTotal+=rd.doorCount;if(rd.emergency)rdEmg++;if(rd.locked)rdLck++;rdExtO+=rd.extOpen;rdIntO+=rd.intOpen;rdPrs+=rd.pressure;}
if(remoteDoors.Count>0)rdPrs/=remoteDoors.Count;
ctlData=$"\n[CONTROLLER]\nmode=CONTROLLER\ntotal_missiles={missiles.Count}\ntotal_miners={miners.Count}\ntotal_satellites={satellites.Count}\nactive_satellites={satActive}\nlaser_tracking={laserAssign.Count}\nintercepts={intercepts.Count}\nconflicts={conflicts.Count}\nremote_pads={remoteDoors.Count}\nremote_doors={rdTotal}\nremote_emergency={rdEmg}\nremote_locked={rdLck}\nremote_ext_open={rdExtO}\nremote_int_open={rdIntO}\nremote_pressure={rdPrs:F0}\n";}
Dictionary<string,int> wpnByType=new Dictionary<string,int>();
foreach(var wd in weapons){if(!wpnByType.ContainsKey(wd.type))wpnByType[wd.type]=0;wpnByType[wd.type]++;}
string defData=$"weapons={weapons.Count}\narmed={defenseArmed}\nfiring={weaponFiring}\nammo_containers={ammoContainers.Count}\n";
foreach(var kv in wpnByType)defData+=$"{kv.Key.ToLower()}={kv.Value}\n";
string ammoData="";foreach(var kv in ammoReserves)ammoData+=$"ammo_{kv.Key}={kv.Value}\n";
Me.CustomData=$"[SIGNAL]\nsignal_ready=true\n{(sess!=""?$"signal_for_session={sess}\n":"")}{(isCtl?"mode=CONTROLLER\n":"")}\n[ANTENNAS]\nradio={radioEnabled}/{padRadios.Count}\nlaser={laserConnected}/{padLasers.Count}\n\n[LASERS]\n{lsrData}\n[SATELLITES]\n{satData}\n[INTERCEPTS]\n{intData}\n[CONFLICTS]\n{cflData}\n[FLIGHT_LOG]\n{fltData}\n[OUTCOMES]\n{outData}\n[DOORS]\n{doorData}\n[DEFENSE]\n{defData}{ammoData}{ctlData}\n[STATUS]\nlast_update={tick}\nboot_complete={bootComplete}\ncameras={allCams.Count}\nmissiles={missiles.Count}\nminers={miners.Count}\nsatellites={satellites.Count}\ndoor_sets={doorSets.Count}\nweapons={weapons.Count}";}

void LoadSatellites(){
string cd=Me.CustomData;int si=cd.IndexOf("[SATELLITES]");if(si<0)return;
int ei=cd.IndexOf("\n[",si+12);string sec=ei>0?cd.Substring(si+12,ei-si-12):cd.Substring(si+12);
foreach(var ln in sec.Split('\n')){if(!ln.StartsWith("sat_"))continue;int eq=ln.IndexOf('=');if(eq<0)continue;
int sid;if(!int.TryParse(ln.Substring(4,eq-4),out sid))continue;
var pts=ln.Substring(eq+1).Split('|');if(pts.Length<2)continue;
var gp=pts[0].Split(',');if(gp.Length<2)continue;
var sat=new SatData();int.TryParse(gp[0],out sat.gridX);int.TryParse(gp[1],out sat.gridZ);
if(pts.Length>=2)int.TryParse(pts[1],out sat.bat);if(pts.Length>=3)int.TryParse(pts[2],out sat.h2);
if(pts.Length>=4)int.TryParse(pts[3],out sat.links);if(pts.Length>=5)sat.status=pts[4];
sat.lastSeen=-1;satellites[sid]=sat;}}
void FindPadPB(){
if(padPB!=null)return;
var pbs=new List<IMyProgrammableBlock>();
GridTerminalSystem.GetBlocksOfType(pbs,b=>b.CubeGrid==Me.CubeGrid&&b!=Me);
foreach(var pb in pbs){
if(pb.CustomName.Contains($"[PAD{padID}]")&&pb.CustomName.ToUpper().Contains("UNITY PAD")){padPB=pb;return;}}}

void CheckBootRequest(){
while(bootReqL.HasPendingMessage){
var msg=bootReqL.AcceptMessage();
if(msg.Data is string){
string req=(string)msg.Data;
if(req=="SIGNAL_CHECK"||req==$"SIGNAL_CHECK:{padID}"){
int camCount=0;
var cams=new List<IMyCameraBlock>();
GridTerminalSystem.GetBlocksOfType(cams,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains("[PAD"));
camCount=cams.Count;
int lcdCount=0;
var lcds=new List<IMyTextPanel>();
GridTerminalSystem.GetBlocksOfType(lcds,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains("CAMS"));
lcdCount=lcds.Count;
string rsp=$"SIGNAL|OK|cams={camCount},lcds={lcdCount}";
IGC.SendBroadcastMessage("UNITY_BOOT_RSP",rsp);}}}}

void CheckSignalCommands(){
while(signalCmdL!=null&&signalCmdL.HasPendingMessage){
var msg=signalCmdL.AcceptMessage();
if(!(msg.Data is string))continue;
string cmd=(string)msg.Data;
string[] parts=cmd.Split(':');
if(parts.Length<1)continue;
string op=parts[0].ToUpper();
string rsp="";
if(op=="TRACK"&&parts.Length>=5){
long eid;double x,y,z;
if(long.TryParse(parts[1],out eid)&&double.TryParse(parts[2],out x)&&double.TryParse(parts[3],out y)&&double.TryParse(parts[4],out z)){
if(!missiles.ContainsKey(eid))missiles[eid]=new MslData();
missiles[eid].pos=new Vector3D(x,y,z);
missiles[eid].lastSeen=tick;
rsp=$"SIGNAL|OK|TRACK:{eid}";}}
else if(op=="LASER"&&parts.Length>=3){
int idx;if(int.TryParse(parts[1],out idx)&&idx>=0&&idx<padLasers.Count){
string act=parts[2].ToUpper();
if(act=="ON")padLasers[idx].Enabled=true;
else if(act=="OFF"){padLasers[idx].Enabled=false;var rem=new List<long>();foreach(var kv in laserAssign)if(kv.Value==idx)rem.Add(kv.Key);foreach(var k in rem)laserAssign.Remove(k);}
else if(act=="CLEAR"){var rem=new List<long>();foreach(var kv in laserAssign)if(kv.Value==idx)rem.Add(kv.Key);foreach(var k in rem)laserAssign.Remove(k);}
rsp=$"SIGNAL|OK|LASER:{idx}:{act}";}}
else if(op=="RESCAN"){ScanBlocks();rsp="SIGNAL|OK|RESCAN";}
else if(op=="SAT"&&parts.Length>=2&&parts[1].ToUpper()=="RESCAN"){satellites.Clear();rsp="SIGNAL|OK|SAT:RESCAN";}
else if(op=="ANTENNA"&&parts.Length>=3&&parts[1].ToUpper()=="RANGE"){
float rng;if(float.TryParse(parts[2],out rng)&&rng>=0){foreach(var r in padRadios)r.Radius=rng;rsp=$"SIGNAL|OK|ANTENNA:RANGE:{rng}";}
else rsp="SIGNAL|ERR|INVALID_RANGE";}
else if(op=="DOOR"){
if(parts.Length>=2){
string act=parts[1].ToUpper();
if(act=="LOCK"){doorsLocked=true;rsp="SIGNAL|OK|DOOR:LOCK";}
else if(act=="UNLOCK"){ResetDoorEmergency();rsp="SIGNAL|OK|DOOR:UNLOCK";}
else if(parts.Length>=4){
char ltr=char.ToUpper(act[0]);int num;
if(act.Length==1&&char.IsLetter(ltr)&&int.TryParse(parts[3],out num)&&(num==1||num==2)){
string dop=parts[2].ToUpper();
if(dop=="OPEN"){bool ok=TryOpenDoor(ltr,num);rsp=ok?$"SIGNAL|OK|DOOR:{ltr}:OPEN:{num}":$"SIGNAL|ERR|DOOR:{ltr}:BLOCKED";}
else if(dop=="CLOSE"){bool ok=TryCloseDoor(ltr,num);rsp=ok?$"SIGNAL|OK|DOOR:{ltr}:CLOSE:{num}":$"SIGNAL|ERR|DOOR:{ltr}:NOT_FOUND";}}}}}
else if(op=="DEFENSE"){
if(parts.Length>=2){string act=parts[1].ToUpper();
if(act=="ARM"){SetDefenseArmed(true);rsp="SIGNAL|OK|DEFENSE:ARM";}
else if(act=="DISARM"){SetDefenseArmed(false);rsp="SIGNAL|OK|DEFENSE:DISARM";}
else if(act=="RESCAN"){ScanDefense();rsp="SIGNAL|OK|DEFENSE:RESCAN";}
else if(act=="STATUS"){rsp=$"SIGNAL|OK|DEFENSE:STATUS|weapons={weapons.Count},armed={defenseArmed},firing={weaponFiring}";}}}
else{rsp=$"SIGNAL|ERR|UNKNOWN:{cmd}";}
if(rsp!="")IGC.SendBroadcastMessage("UNITY_SIGNAL_RSP",rsp);}}

public void Main(string arg,UpdateType ut){
tick++;
CheckBootRequest();
CheckSignalCommands();
if(!string.IsNullOrEmpty(arg)){
string a=arg.ToUpper();
if(a=="RESCAN"){ScanBlocks();UpdateEcho();return;}
if(a=="RESET"){bootComplete=false;allCams.Clear();missiles.Clear();miners.Clear();satellites.Clear();lcdsBySlot.Clear();signalLCDs.Clear();defenseLCDs.Clear();satLCDs.Clear();weapons.Clear();UpdateEcho();return;}
if(a=="ANTENNA:ON"){foreach(var r in padRadios){r.Enabled=true;r.EnableBroadcasting=true;}UpdateEcho();return;}
if(a=="ANTENNA:OFF"){foreach(var r in padRadios){r.Enabled=false;}UpdateEcho();return;}
if(a.StartsWith("ANTENNA:RANGE:")){var pts=a.Split(':');if(pts.Length>=3){float rng;if(float.TryParse(pts[2],out rng)&&rng>=0)foreach(var r in padRadios)r.Radius=rng;}UpdateEcho();return;}
if(a=="LASER:CLEAR"){laserAssign.Clear();UpdateEcho();return;}
if(a=="SAT:RESCAN"){satellites.Clear();UpdateEcho();return;}
if(a=="DOOR:LOCK"){doorsLocked=true;UpdateEcho();return;}
if(a=="DOOR:UNLOCK"){ResetDoorEmergency();UpdateEcho();return;}
if(a=="DOOR:FORCE"){ResetDoorEmergency();foreach(var kv in doorSets){CloseDoorsDict(kv.Value.extDoors);OpenDoorsDict(kv.Value.intDoors);kv.Value.state=4;kv.Value.lastChange=tick;}UpdateEcho();return;}
if(a.StartsWith("DOOR:")&&a.Contains(":OPEN:")){var pts=a.Split(':');if(pts.Length>=4){char ltr=char.ToUpper(pts[1][0]);int num;if(int.TryParse(pts[3],out num))TryOpenDoor(ltr,num);}UpdateEcho();return;}
if(a.StartsWith("DOOR:")&&a.Contains(":CLOSE:")){var pts=a.Split(':');if(pts.Length>=4){char ltr=char.ToUpper(pts[1][0]);int num;if(int.TryParse(pts[3],out num))TryCloseDoor(ltr,num);}UpdateEcho();return;}
if(a=="DEFENSE:ARM"){SetDefenseArmed(true);UpdateEcho();return;}
if(a=="DEFENSE:DISARM"){SetDefenseArmed(false);UpdateEcho();return;}
if(a=="DEFENSE:RESCAN"){ScanDefense();UpdateEcho();return;}
if(a.StartsWith("LASER:")){
var pts=a.Split(':');
if(pts.Length>=3){int idx;if(int.TryParse(pts[1],out idx)&&idx>=0&&idx<padLasers.Count){
if(pts[2]=="ON")padLasers[idx].Enabled=true;
else if(pts[2]=="OFF"){padLasers[idx].Enabled=false;var rem=new List<long>();foreach(var kv in laserAssign)if(kv.Value==idx)rem.Add(kv.Key);foreach(var k in rem)laserAssign.Remove(k);}}}
UpdateEcho();return;}}
if(tick%10==0)ScanDoors();
UpdateDoors();
if(!CheckSessionValid()){UpdateEcho();return;}
if(!bootComplete){CheckBoot();UpdateEcho();return;}
ProcessMessages();
UpdateDefense();
if(tick-lastScan>50){ScanBlocks();WriteCustomData(padSession);if(!isCtl)BroadcastSatStatus();lastScan=tick;}
pageTick++;
if(pageTick>=pageInterval){pageTick=0;currentPage++;}
BuildCameraList();
UpdateAllLCDs();
UpdateEcho();
}

void CheckBoot(){
if(bootPB==null)FindBootPB();
if(bootPB==null)return;
string bcd=bootPB.CustomData;
if(!bcd.Contains("boot_complete=true"))return;
int bi=bcd.IndexOf("boot_for_session=");
if(bi<0)return;
int be=bcd.IndexOf('\n',bi);if(be<0)be=bcd.Length;
string bootSess=bcd.Substring(bi+17,be-bi-17).Trim();
if(bootSess!=padSession)return;
bootComplete=true;
CheckControllerMode();
ScanBlocks();
}

bool CheckSessionValid(){
if(padPB==null)FindPadPB();
if(padPB==null)return true;
string pcd=padPB.CustomData;
string curSess="";
int idx=pcd.IndexOf("pad_session=");
if(idx>=0){int end=pcd.IndexOf('\n',idx);if(end<0)end=pcd.Length;curSess=pcd.Substring(idx+12,end-idx-12).Trim();}
if(curSess==""||curSess=="INIT")return false;
if(padSession!=""&&curSess!=padSession){bootComplete=false;padSession=curSess;return false;}
if(padSession=="")padSession=curSess;
return true;
}

void FindBootPB(){
var pbs=new List<IMyProgrammableBlock>();
GridTerminalSystem.GetBlocksOfType(pbs,b=>b.CubeGrid==Me.CubeGrid&&b!=Me);
foreach(var pb in pbs){
if(pb.CustomName.Contains($"[PAD{padID}]")&&pb.CustomName.ToUpper().Contains("UNITY BOOT")){bootPB=pb;return;}}}

void CheckControllerMode(){
var lcds=new List<IMyTextPanel>();
GridTerminalSystem.GetBlocksOfType(lcds,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains("[CTRLCAMS]"));
isCtl=lcds.Count>0;}


void ScanBlocks(){
UpdatePadFromName();
localCams.Clear();
lcdsBySlot.Clear();
signalLCDs.Clear();
defenseLCDs.Clear();
satLCDs.Clear();
pressureLCDs.Clear();
flightLCDs.Clear();
padRadios.Clear();
padLasers.Clear();
CheckControllerMode();
var cams=new List<IMyCameraBlock>();
if(isCtl)GridTerminalSystem.GetBlocksOfType(cams,b=>b.IsSameConstructAs(Me)&&b.CustomName.Contains("[PAD"));
else GridTerminalSystem.GetBlocksOfType(cams,b=>b.IsSameConstructAs(Me)&&b.CustomName.Contains(blockTag));
localCams.AddRange(cams);
GridTerminalSystem.GetBlocksOfType(padRadios,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains(blockTag));
GridTerminalSystem.GetBlocksOfType(padLasers,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains(blockTag));
radioEnabled=0;laserConnected=0;
foreach(var r in padRadios)if(r.Enabled&&r.EnableBroadcasting)radioEnabled++;
foreach(var l in padLasers)if(l.Status==MyLaserAntennaStatus.Connected)laserConnected++;
var lcds=new List<IMyTextPanel>();
GridTerminalSystem.GetBlocksOfType(lcds,b=>b.CubeGrid==Me.CubeGrid);
string camsTag=isCtl?"[CTRLCAMS]":$"[PAD{padID}]CAMS";
string camsTag2=$"[PAD{padID}] CAMS";
string altTag=$"[PAD{padID}]CAMS";
foreach(var lcd in lcds){
bool m1=lcd.CustomName.Contains(camsTag);
bool m2=lcd.CustomName.Contains(camsTag2);
bool hasAlt=!isCtl?false:lcd.CustomName.Contains(altTag);
if(!m1&&!m2&&!hasAlt)continue;
string useTag=m1?camsTag:m2?camsTag2:altTag;
int idx=lcd.CustomName.IndexOf(useTag);
int colonIdx=lcd.CustomName.IndexOf(':',idx);
string slotStr="0";
if(colonIdx>=0){slotStr="";for(int i=colonIdx+1;i<lcd.CustomName.Length;i++){char c=lcd.CustomName[i];if(char.IsDigit(c))slotStr+=c;else break;}
if(string.IsNullOrEmpty(slotStr))slotStr="0";}
var sf=lcd as IMyTextSurface;if(sf==null)continue;
if(!lcdsBySlot.ContainsKey(slotStr))lcdsBySlot[slotStr]=new List<IMyTextSurface>();
lcdsBySlot[slotStr].Add(sf);}
string sigTag=$"[PAD{padID}] SIGNAL";
string defTag=$"[PAD{padID}] DEFENSE";
string satTag=$"[PAD{padID}] SATS";
string prsTag=$"[PAD{padID}] PRESSURE";
string fltTag=$"[PAD{padID}] FLIGHT";
foreach(var lcd in lcds){
if(lcd.CustomName.Contains(sigTag)){var sf=lcd as IMyTextSurface;if(sf!=null)signalLCDs.Add(sf);}
if(lcd.CustomName.Contains(defTag)){var sf=lcd as IMyTextSurface;if(sf!=null)defenseLCDs.Add(sf);}
if(lcd.CustomName.Contains(satTag)){var sf=lcd as IMyTextSurface;if(sf!=null)satLCDs.Add(sf);}
if(lcd.CustomName.Contains(prsTag)){var sf=lcd as IMyTextSurface;if(sf!=null)pressureLCDs.Add(sf);}
if(lcd.CustomName.Contains(fltTag)){var sf=lcd as IMyTextSurface;if(sf!=null)flightLCDs.Add(sf);}}
ScanDoors();ScanDefense();}

string GetSuffix(string nm,int ci){
string sfx="";for(int i=ci+3;i<nm.Length;i++){char c=nm[i];if(c==' '||c==']')break;sfx+=c;}return sfx;}
void ScanDoors(){
doorSets.Clear();padVents.Clear();
var doors=new List<IMyDoor>();
GridTerminalSystem.GetBlocksOfType(doors,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains(blockTag));
foreach(var d in doors){
int ci=d.CustomName.IndexOf(':');
if(ci<0||ci+2>=d.CustomName.Length)continue;
char ltr=char.ToUpper(d.CustomName[ci+1]);
char num=d.CustomName[ci+2];
if(!char.IsLetter(ltr)||(num!='1'&&num!='2'))continue;
string sfx=GetSuffix(d.CustomName,ci);
if(!doorSets.ContainsKey(ltr))doorSets[ltr]=new DoorSet{state=0,lastChange=tick};
var ds=doorSets[ltr];
if(num=='1'){if(!ds.extDoors.ContainsKey(sfx))ds.extDoors[sfx]=new List<IMyDoor>();if(!ds.extDoors[sfx].Contains(d))ds.extDoors[sfx].Add(d);}
else{if(!ds.intDoors.ContainsKey(sfx))ds.intDoors[sfx]=new List<IMyDoor>();if(!ds.intDoors[sfx].Contains(d))ds.intDoors[sfx].Add(d);}}
var sensors=new List<IMySensorBlock>();
GridTerminalSystem.GetBlocksOfType(sensors,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains(blockTag));
foreach(var s in sensors){
int ci=s.CustomName.IndexOf(':');
if(ci<0||ci+2>=s.CustomName.Length)continue;
char ltr=char.ToUpper(s.CustomName[ci+1]);
char num=s.CustomName[ci+2];
if(!char.IsLetter(ltr)||(num!='1'&&num!='2'))continue;
string sfx=GetSuffix(s.CustomName,ci);
if(!doorSets.ContainsKey(ltr))continue;
var ds=doorSets[ltr];
if(num=='1'){if(!ds.senExt.ContainsKey(sfx))ds.senExt[sfx]=new List<IMySensorBlock>();if(!ds.senExt[sfx].Contains(s))ds.senExt[sfx].Add(s);}
else{if(!ds.senInt.ContainsKey(sfx))ds.senInt[sfx]=new List<IMySensorBlock>();if(!ds.senInt[sfx].Contains(s))ds.senInt[sfx].Add(s);}}
var vents=new List<IMyAirVent>();
GridTerminalSystem.GetBlocksOfType(vents,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains(blockTag));
foreach(var v in vents){
int ci=v.CustomName.IndexOf(':');
if(ci>=0&&ci+1<v.CustomName.Length){
char ltr=char.ToUpper(v.CustomName[ci+1]);
if(char.IsLetter(ltr)&&doorSets.ContainsKey(ltr)&&v.CustomName.ToUpper().Contains("VENT")){
doorSets[ltr].vent=v;continue;}}
padVents.Add(v);}
overallPressure=0;
if(padVents.Count>0){foreach(var v in padVents)overallPressure+=v.GetOxygenLevel();overallPressure=overallPressure/padVents.Count*100;}}

bool AllClosed(List<IMyDoor> drs){foreach(var d in drs)if(d.Status!=DoorStatus.Closed)return false;return drs.Count>0;}
bool AnyOpen(List<IMyDoor> drs){foreach(var d in drs)if(d.Status==DoorStatus.Open)return true;return false;}
bool AllClosedDict(Dictionary<string,List<IMyDoor>> dd){foreach(var dl in dd.Values)foreach(var d in dl)if(d.Status!=DoorStatus.Closed)return false;return dd.Count>0;}
bool AnyOpenDict(Dictionary<string,List<IMyDoor>> dd){foreach(var dl in dd.Values)foreach(var d in dl)if(d.Status==DoorStatus.Open)return true;return false;}
void SetDoorsEnabled(List<IMyDoor> drs,bool en){foreach(var d in drs)d.Enabled=en;}
void SetDoorsEnabledDict(Dictionary<string,List<IMyDoor>> dd,bool en){foreach(var dl in dd.Values)foreach(var d in dl)d.Enabled=en;}
void OpenDoors(List<IMyDoor> drs){foreach(var d in drs){d.Enabled=true;d.OpenDoor();}}
void CloseDoors(List<IMyDoor> drs){foreach(var d in drs)d.CloseDoor();}
void CloseDoorsDict(Dictionary<string,List<IMyDoor>> dd){foreach(var dl in dd.Values)foreach(var d in dl)d.CloseDoor();}
bool SensorActive(List<IMySensorBlock> sensors){foreach(var s in sensors)if(s!=null&&s.Enabled&&s.IsActive)return true;return false;}
void UpdateDoors(){
foreach(var kv in doorSets){
var ds=kv.Value;
if(ds.extDoors.Count==0||ds.intDoors.Count==0)continue;
bool anyExtOpen=AnyOpenDict(ds.extDoors);
bool anyIntOpen=AnyOpenDict(ds.intDoors);
bool allExtClosed=AllClosedDict(ds.extDoors);
bool allIntClosed=AllClosedDict(ds.intDoors);
if(anyExtOpen&&anyIntOpen){CloseDoorsDict(ds.extDoors);CloseDoorsDict(ds.intDoors);SetDoorsEnabledDict(ds.extDoors,true);SetDoorsEnabledDict(ds.intDoors,true);emergencyCount++;continue;}
if(anyExtOpen){SetDoorsEnabledDict(ds.intDoors,false);
foreach(var sfx in ds.extDoors.Keys){if(!AnyOpen(ds.extDoors[sfx]))continue;bool sen=ds.senExt.ContainsKey(sfx)&&SensorActive(ds.senExt[sfx]);if(!sen)CloseDoors(ds.extDoors[sfx]);}continue;}
if(anyIntOpen){SetDoorsEnabledDict(ds.extDoors,false);
foreach(var sfx in ds.intDoors.Keys){if(!AnyOpen(ds.intDoors[sfx]))continue;bool sen=ds.senInt.ContainsKey(sfx)&&SensorActive(ds.senInt[sfx]);if(!sen)CloseDoors(ds.intDoors[sfx]);}continue;}
SetDoorsEnabledDict(ds.extDoors,true);SetDoorsEnabledDict(ds.intDoors,true);
foreach(var sfx in ds.senExt.Keys){if(SensorActive(ds.senExt[sfx])&&allIntClosed&&ds.extDoors.ContainsKey(sfx)&&AllClosed(ds.extDoors[sfx])){OpenDoors(ds.extDoors[sfx]);}}
foreach(var sfx in ds.senInt.Keys){if(SensorActive(ds.senInt[sfx])&&allExtClosed&&ds.intDoors.ContainsKey(sfx)&&AllClosed(ds.intDoors[sfx])){OpenDoors(ds.intDoors[sfx]);}}}}

void OpenDoorsDict(Dictionary<string,List<IMyDoor>> dd){foreach(var dl in dd.Values)foreach(var d in dl){d.Enabled=true;d.OpenDoor();}}
bool TryOpenDoor(char ltr,int doorNum){
if(!doorSets.ContainsKey(ltr))return false;
var ds=doorSets[ltr];
if(ds.extDoors.Count==0||ds.intDoors.Count==0||ds.failed)return false;
if(doorsLocked||doorEmergency)return false;
if(tick-ds.lastChange<DOOR_DEBOUNCE)return false;
bool eC=AllClosedDict(ds.extDoors),iC=AllClosedDict(ds.intDoors);
if(doorNum==1){if(!iC)return false;OpenDoorsDict(ds.extDoors);ds.state=1;ds.lastChange=tick;return true;}
if(doorNum==2){if(!eC)return false;OpenDoorsDict(ds.intDoors);ds.state=4;ds.lastChange=tick;return true;}
return false;}

bool TryCloseDoor(char ltr,int doorNum){
if(!doorSets.ContainsKey(ltr))return false;
var ds=doorSets[ltr];
if(ds.failed)return false;
if(tick-ds.lastChange<DOOR_DEBOUNCE)return false;
if(doorNum==1&&ds.extDoors.Count>0){CloseDoorsDict(ds.extDoors);ds.state=3;ds.lastChange=tick;return true;}
if(doorNum==2&&ds.intDoors.Count>0){CloseDoorsDict(ds.intDoors);ds.state=6;ds.lastChange=tick;return true;}
return false;}

void ResetDoorEmergency(){
doorEmergency=false;doorsLocked=false;
foreach(var kv in doorSets){kv.Value.failed=false;kv.Value.state=0;}}

void ScanDefense(){
weapons.Clear();ammoContainers.Clear();ammoReserves.Clear();
var guns=new List<IMyUserControllableGun>();
GridTerminalSystem.GetBlocksOfType(guns,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains(blockTag));
foreach(var g in guns){
string tp="OTHER";string si=g.BlockDefinition.SubtypeId.ToUpper();string nm=g.CustomName.ToUpper();
if(si.Contains("GATLING")||nm.Contains("GATLING"))tp="GATLING";
else if(si.Contains("MISSILE")||si.Contains("ROCKET")||nm.Contains("MISSILE")||nm.Contains("ROCKET"))tp="MISSILE";
else if(si.Contains("INTERIOR")||nm.Contains("INTERIOR"))tp="INTERIOR";
else if(si.Contains("ASSAULT")||nm.Contains("ASSAULT"))tp="ASSAULT";
else if(si.Contains("AUTOCANNON")||nm.Contains("AUTOCANNON"))tp="AUTOCANNON";
else if(si.Contains("ARTILLERY")||nm.Contains("ARTILLERY"))tp="ARTILLERY";
else if(si.Contains("RAILGUN")||nm.Contains("RAILGUN"))tp="RAILGUN";
weapons.Add(new WeaponData{gun=g,type=tp,name=g.CustomName,ammo=0,active=g.Enabled,firing=false});}
var cargo=new List<IMyCargoContainer>();
GridTerminalSystem.GetBlocksOfType(cargo,b=>{if(!b.CustomName.Contains(blockTag))return false;string up=b.CustomName.ToUpper();return !up.Contains("PAMMO");});
ammoContainers.AddRange(cargo);
foreach(var c in ammoContainers){
var inv=c.GetInventory();if(inv==null)continue;
var items=new List<MyInventoryItem>();inv.GetItems(items);
foreach(var itm in items){if(!itm.Type.TypeId.EndsWith("AmmoMagazine"))continue;string nm=itm.Type.SubtypeId;
if(!ammoReserves.ContainsKey(nm))ammoReserves[nm]=0;ammoReserves[nm]+=(int)itm.Amount;}}}

void UpdateDefense(){
weaponFiring=0;
foreach(var wd in weapons){
var g=wd.gun;if(g==null)continue;
wd.active=g.Enabled;wd.firing=g.IsShooting;if(wd.firing)weaponFiring++;
var inv=g.GetInventory();if(inv==null){wd.ammo=0;continue;}
float max=(float)inv.MaxVolume;float cur=(float)inv.CurrentVolume;
wd.ammo=max>0?cur/max*100:0;
if(wd.ammo<50&&ammoContainers.Count>0){
foreach(var c in ammoContainers){
var cInv=c.GetInventory();if(cInv==null||cInv.ItemCount==0)continue;
var items=new List<MyInventoryItem>();cInv.GetItems(items);
foreach(var itm in items){if(inv.CanItemsBeAdded(1,itm.Type)){cInv.TransferItemTo(inv,itm,null);break;}}
break;}}}}

void SetDefenseArmed(bool armed){
defenseArmed=armed;
foreach(var wd in weapons){if(wd.gun!=null)wd.gun.Enabled=armed;}}

void ProcessMessages(){
while(mslListener.HasPendingMessage){
var msg=mslListener.AcceptMessage();
if(msg.Data is string){
string data=(string)msg.Data;
long src=msg.Source;
if(!missiles.ContainsKey(src))missiles[src]=new MslData();
var msl=missiles[src];
msl.lastSeen=tick;
ParseMslBroadcast(data,msl);}}
while(minerListener.HasPendingMessage){
var msg=minerListener.AcceptMessage();
if(msg.Data is string){
string data=(string)msg.Data;
var parts=data.Split('|');
if(parts.Length<4||parts[0]!="MB")continue;
int bcnPad;if(!int.TryParse(parts[1],out bcnPad))continue;
if(!isCtl&&bcnPad!=padID)continue;
long src=msg.Source;
if(!miners.ContainsKey(src))miners[src]=new MinerData();
var mnr=miners[src];
mnr.lastSeen=tick;
ParseMinerBroadcast(data,mnr);}}
while(satStL!=null&&satStL.HasPendingMessage){
var msg=satStL.AcceptMessage();
if(msg.Data is string)ParseSatBroadcast((string)msg.Data);}
while(satIntL!=null&&satIntL.HasPendingMessage){
var msg=satIntL.AcceptMessage();
if(msg.Data is string){
string intMsg=(string)msg.Data;
intercepts.Insert(0,$"{tick}|{intMsg}");
while(intercepts.Count>MAX_INTERCEPTS)intercepts.RemoveAt(intercepts.Count-1);}}
if(isCtl){while(signalStatusL!=null&&signalStatusL.HasPendingMessage){
var msg=signalStatusL.AcceptMessage();
if(msg.Data is string){ParseRemoteSatData((string)msg.Data);}}}
var oldMsl=new List<long>();
foreach(var kv in missiles){var ms=kv.Value;if(tick-ms.lastSeen>600){string st=ms.status??"";if(st!="SAT_HOLD"&&st!="SAT_BRAKE"&&st!="SAT_CLIMB"&&st!="BLACKOUT_SAT")oldMsl.Add(kv.Key);}}
foreach(var k in oldMsl){missiles.Remove(k);laserAssign.Remove(k);}
var oldMnr=new List<long>();
foreach(var kv in miners)if(tick-kv.Value.lastSeen>600)oldMnr.Add(kv.Key);
foreach(var k in oldMnr)miners.Remove(k);
var oldSat=new List<int>();
foreach(var kv in satellites){if(kv.Value.lastSeen>=0&&tick-kv.Value.lastSeen>600){kv.Value.lastSeen=-1;kv.Value.status="OFFLINE";}}
foreach(var k in oldSat)satellites.Remove(k);
UpdateLaserTargets();
}
void ParseSatBroadcast(string data){
var parts=data.Split('|');
if(parts.Length<6)return;
int sid;if(!int.TryParse(parts[1],out sid))return;
if(!satellites.ContainsKey(sid))satellites[sid]=new SatData();
var sat=satellites[sid];
sat.lastSeen=tick;
int.TryParse(parts[3],out sat.bat);
int.TryParse(parts[4],out sat.h2);
sat.status=parts[5];
if(parts.Length>=7){var gp=parts[6].Split(',');int.TryParse(gp[0],out sat.gridX);if(gp.Length>1)int.TryParse(gp[1],out sat.gridZ);}
if(parts.Length>=8)int.TryParse(parts[7],out sat.links);}
void ParseRemoteSatData(string data){
var lines=data.Split('\n');
int srcPad=0;
foreach(var ln in lines){
if(ln.StartsWith("PAD:")){int.TryParse(ln.Substring(4),out srcPad);continue;}
if(ln.StartsWith("D:")&&srcPad>0&&srcPad!=padID){
var pts=ln.Substring(2).Split('|');
if(pts.Length>=6){
if(!remoteDoors.ContainsKey(srcPad))remoteDoors[srcPad]=new RemoteDoorData{padId=srcPad};
var rd=remoteDoors[srcPad];rd.lastSeen=tick;
int.TryParse(pts[0],out rd.doorCount);rd.locked=pts[1]=="1";rd.emergency=pts[2]=="1";
float.TryParse(pts[3],out rd.pressure);int.TryParse(pts[4],out rd.extOpen);int.TryParse(pts[5],out rd.intOpen);}
continue;}
if(!ln.StartsWith("S:"))continue;
var spts=ln.Substring(2).Split('|');
if(spts.Length<6)continue;
int sid;if(!int.TryParse(spts[0],out sid))continue;
if(!satellites.ContainsKey(sid))satellites[sid]=new SatData();
var sat=satellites[sid];sat.lastSeen=tick;
int.TryParse(spts[1],out sat.gridX);int.TryParse(spts[2],out sat.gridZ);
int.TryParse(spts[3],out sat.bat);int.TryParse(spts[4],out sat.h2);
sat.status=spts[5];if(spts.Length>=7)int.TryParse(spts[6],out sat.links);}
var oldRd=new List<int>();foreach(var kv in remoteDoors)if(tick-kv.Value.lastSeen>600)oldRd.Add(kv.Key);foreach(var k in oldRd)remoteDoors.Remove(k);}
void BroadcastSatStatus(){
int extO=0,intO=0;foreach(var kv in doorSets){var ds=kv.Value;foreach(var dl in ds.extDoors.Values)foreach(var d in dl)if(d.Status==DoorStatus.Open)extO++;foreach(var dl in ds.intDoors.Values)foreach(var d in dl)if(d.Status==DoorStatus.Open)intO++;}
string msg=$"PAD:{padID}\nD:{doorSets.Count}|{(doorsLocked?1:0)}|{(doorEmergency?1:0)}|{overallPressure:F0}|{extO}|{intO}\n";
foreach(var kv in satellites){var s=kv.Value;msg+=$"S:{kv.Key}|{s.gridX}|{s.gridZ}|{s.bat}|{s.h2}|{s.status}|{s.links}\n";}
IGC.SendBroadcastMessage("UNITY_SIGNAL_STATUS",msg);}
int GetMslPriority(MslData m){
string s=m.status?.ToUpper()??"";
if(s=="TARGET"||s=="REENTRY"||s=="SAT_INTERCEPT")return 3;
if(s=="ARM"||s=="COAST")return 2;
return 1;}
void AssignLaser(long mid,int best,Dictionary<int,List<long>> claims){
if(claims[best].Count>0){long old=claims[best][0];laserAssign.Remove(old);
conflicts.Insert(0,$"{tick}|L{best}:MSL-{old%10000}->MSL-{mid%10000}");
while(conflicts.Count>MAX_CONFLICTS)conflicts.RemoveAt(conflicts.Count-1);}
laserAssign[mid]=best;claims[best].Clear();claims[best].Add(mid);}
int FindFreeLaser(Dictionary<int,List<long>> claims){
for(int i=0;i<padLasers.Count;i++)if(claims[i].Count==0)return i;return-1;}
int FindStealLaser(MslData msl,Dictionary<int,List<long>> claims){
for(int i=0;i<padLasers.Count;i++){if(claims[i].Count==0)continue;long rival=claims[i][0];
if(missiles.ContainsKey(rival)&&GetMslPriority(msl)>GetMslPriority(missiles[rival]))return i;}return-1;}
void UpdateLaserTargets(){
var claims=new Dictionary<int,List<long>>();
for(int i=0;i<padLasers.Count;i++)claims[i]=new List<long>();
foreach(var kv in laserAssign){if(kv.Value<padLasers.Count)claims[kv.Value].Add(kv.Key);}
foreach(var kv in missiles){
long mid=kv.Key;var msl=kv.Value;
if(msl.pos==Vector3D.Zero||msl.padId!=padID)continue;
if(!laserAssign.ContainsKey(mid)){
int best=FindFreeLaser(claims);
if(best<0)best=FindStealLaser(msl,claims);
if(best>=0)AssignLaser(mid,best,claims);}}
foreach(var kv in missiles){
long mid=kv.Key;var msl=kv.Value;
if(msl.pos==Vector3D.Zero||msl.padId==padID)continue;
if(!laserAssign.ContainsKey(mid)){
int best=FindFreeLaser(claims);
if(best>=0)AssignLaser(mid,best,claims);}}
foreach(var kv in laserAssign){
if(!missiles.ContainsKey(kv.Key))continue;
var msl=missiles[kv.Key];int idx=kv.Value;
if(idx<padLasers.Count){var lsr=padLasers[idx];
lsr.SetTargetCoords($"GPS:MSL-{kv.Key%10000}:{msl.pos.X:F0}:{msl.pos.Y:F0}:{msl.pos.Z:F0}:");
if(lsr.Status!=MyLaserAntennaStatus.Connected)lsr.Connect();}}}

void ParseMslBroadcast(string data,MslData msl){
msl.camNames.Clear();msl.camIds.Clear();
var parts=data.Split(',');
if(parts.Length>=4){
double x,y,z;
if(double.TryParse(parts[0],out x)&&double.TryParse(parts[1],out y)&&double.TryParse(parts[2],out z))msl.pos=new Vector3D(x,y,z);
float d;if(float.TryParse(parts[3],out d))msl.dist=d;}
if(parts.Length>=8){float a;if(float.TryParse(parts[7],out a))msl.alt=a;}
if(parts.Length>=9){float s;if(float.TryParse(parts[8],out s))msl.spd=s;}
if(parts.Length>=10){float f;if(float.TryParse(parts[9],out f))msl.fuel=f;}
if(parts.Length>=11)msl.gyro=parts[10];
int pi=data.IndexOf("|PAD:");if(pi>=0){int pe=data.IndexOf('|',pi+5);string pv=pe>0?data.Substring(pi+5,pe-pi-5):data.Substring(pi+5);int tp;if(int.TryParse(pv,out tp))msl.padId=tp;}
string newPhase=parts.Length>=5?parts[4]:"UNKNOWN";
if(msl.lastPhase!=null&&msl.lastPhase!=newPhase){
long mslId=0;foreach(var kv in missiles)if(kv.Value==msl){mslId=kv.Key;break;}
string logEntry=$"T{tick}|MSL-{mslId%10000}|{msl.lastPhase}>{newPhase}";
flightLog.Insert(0,logEntry);
while(flightLog.Count>MAX_FLIGHT_LOG)flightLog.RemoveAt(flightLog.Count-1);}
msl.lastPhase=newPhase;msl.status=newPhase;
if(msl.gyro=="FINAL"&&msl.outcome==null){
long oid=0;foreach(var kv in missiles)if(kv.Value==msl){oid=kv.Key;break;}
string oc=newPhase;if(oc=="IMPACT")oc="TARGET HIT";else if(oc=="BLACKOUT_SAT")oc="SAT DEPLOY";else if(oc=="SAFE_RESET")oc="RESET";
msl.outcome=oc;
mslOutcomes.Insert(0,$"T{tick}|MSL-{oid%10000}|P{msl.padId}|{oc}|{msl.dist:F0}m");
while(mslOutcomes.Count>MAX_OUTCOMES)mslOutcomes.RemoveAt(mslOutcomes.Count-1);}
if(newPhase=="SAT_HOLD"&&msl.outcome==null){
long oid=0;foreach(var kv in missiles)if(kv.Value==msl){oid=kv.Key;break;}
msl.outcome="DEPLOYED";
mslOutcomes.Insert(0,$"T{tick}|MSL-{oid%10000}|P{msl.padId}|DEPLOYED|orbit");
while(mslOutcomes.Count>MAX_OUTCOMES)mslOutcomes.RemoveAt(mslOutcomes.Count-1);}
int camsIdx=data.IndexOf("|CAMS:");
if(camsIdx<0)return;
string camPart=data.Substring(camsIdx+6);
int pipeIdx=camPart.IndexOf('|');if(pipeIdx>=0)camPart=camPart.Substring(0,pipeIdx);
if(string.IsNullOrEmpty(camPart))return;
var cams=camPart.Split(',');
foreach(var cam in cams){
int colonIdx=cam.IndexOf(':');
if(colonIdx>0){long eid;if(long.TryParse(cam.Substring(0,colonIdx),out eid)){msl.camIds.Add(eid);msl.camNames.Add(cam.Substring(colonIdx+1));}}
else{long eid;if(long.TryParse(cam,out eid))msl.camIds.Add(eid);}}}

void ParseMinerBroadcast(string data,MinerData mnr){
mnr.camIds.Clear();
var parts=data.Split('|');
if(parts.Length<4)return;
mnr.shipName=parts[3];
if(parts.Length>=12)mnr.status=parts[11];
else mnr.status="UNKNOWN";
foreach(var p in parts){
if(p.StartsWith("CAMS:")){
string camStr=p.Substring(5);
if(string.IsNullOrEmpty(camStr))break;
var ids=camStr.Split(',');
foreach(var id in ids){long eid;if(long.TryParse(id,out eid))mnr.camIds.Add(eid);}
break;}}}

void BuildCameraList(){
allCams.Clear();
Vector3D padPos=Me.GetPosition();
foreach(var c in localCams){
allCams.Add(new CamEntry{name=c.CustomName,type="LOCAL",status=c.Enabled?"ON":"OFF",entityId=c.EntityId,slot=0,dist=0});}
foreach(var kv in missiles){
var msl=kv.Value;
float d=msl.pos!=Vector3D.Zero?(float)Vector3D.Distance(padPos,msl.pos):msl.dist;
if(msl.camIds.Count>0){
for(int i=0;i<msl.camIds.Count;i++){
string nm=i<msl.camNames.Count?msl.camNames[i]:$"MSL-{kv.Key%10000} Cam";
allCams.Add(new CamEntry{name=nm,type="MISSILE",status=msl.status,entityId=msl.camIds[i],slot=0,dist=d});}}}
foreach(var kv in miners){
var mnr=kv.Value;
float d=mnr.camIds.Count>0&&padPB!=null?10000:0;
if(mnr.camIds.Count>0){
for(int i=0;i<mnr.camIds.Count;i++){
allCams.Add(new CamEntry{name=mnr.shipName+" Cam",type="MINER",status=mnr.status,entityId=mnr.camIds[i],slot=0,dist=d});}}}
allCams.Sort((a,b)=>a.dist.CompareTo(b.dist));
for(int i=0;i<allCams.Count;i++)allCams[i].slot=i+1;
}

void UpdateAllLCDs(){
foreach(var kv in lcdsBySlot){
foreach(var sf in kv.Value){
if(sf==null)continue;
try{DrawCameraLCD(sf);}catch{}}}
foreach(var sf in signalLCDs){
if(sf==null)continue;
try{DrawSignalStatusLCD(sf);}catch{}}
foreach(var sf in defenseLCDs){
if(sf==null)continue;
try{DrawDefenseLCD(sf);}catch{}}
foreach(var sf in satLCDs){
if(sf==null)continue;
try{DrawSatelliteLCD(sf);}catch{}}
foreach(var sf in pressureLCDs){
if(sf==null)continue;
try{DrawPressureLCD(sf);}catch{}}
foreach(var sf in flightLCDs){
if(sf==null)continue;
try{DrawFlightLCD(sf);}catch{}}}

void DrawCameraLCD(IMyTextSurface sf){
sf.ContentType=ContentType.SCRIPT;sf.Script="";
lcdW=sf.SurfaceSize.X;lcdH=sf.SurfaceSize.Y;
lcdS=lcdW/512f;lcdYS=lcdH/512f;
fntS=Math.Max(0.8f,(lcdS+lcdYS)/2f*1.2f);
bool wide=lcdW>lcdH*1.5f;
int cols=wide?2:1;
float colW=wide?(lcdW-40)/2f:lcdW-40;
float rowH=28*lcdYS;
int rowsPerCol=(int)((lcdH-120*lcdYS)/rowH);
if(rowsPerCol<1)rowsPerCol=1;
itemsPerPage=rowsPerCol*cols;
int totalPages=Math.Max(1,(int)Math.Ceiling((double)allCams.Count/itemsPerPage));
if(currentPage>=totalPages)currentPage=0;
var f=sf.DrawFrame();
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(lcdW/2,lcdH/2),new Vector2(lcdW,lcdH),cBg));
float y=15*lcdYS;
string hdr=isCtl?"CONTROLLER CAMERAS":$"PAD {padID} CAMERAS";
f.Add(new MySprite(SpriteType.TEXT,hdr,new Vector2(lcdW/2,y),null,cPri,"White",TextAlignment.CENTER,1.0f*fntS));
Color rIco=radioEnabled>0?cOK:cErr;Color lIco=laserConnected>0?cOK:cErr;
f.Add(new MySprite(SpriteType.TEXTURE,"Circle",new Vector2(lcdW-55*lcdS,y+8*lcdYS),new Vector2(10*lcdS,10*lcdYS),rIco));
f.Add(new MySprite(SpriteType.TEXT,"R",new Vector2(lcdW-55*lcdS,y+2*lcdYS),null,cBg,"Monospace",TextAlignment.CENTER,0.3f*fntS));
f.Add(new MySprite(SpriteType.TEXTURE,"Circle",new Vector2(lcdW-30*lcdS,y+8*lcdYS),new Vector2(10*lcdS,10*lcdYS),lIco));
f.Add(new MySprite(SpriteType.TEXT,"L",new Vector2(lcdW-30*lcdS,y+2*lcdYS),null,cBg,"Monospace",TextAlignment.CENTER,0.3f*fntS));
y+=35*lcdYS;
string subHdr=$"TOTAL: {allCams.Count}  |  PAGE {currentPage+1}/{totalPages}";
f.Add(new MySprite(SpriteType.TEXT,subHdr,new Vector2(lcdW/2,y),null,cSec,"Monospace",TextAlignment.CENTER,0.5f*fntS));
y+=30*lcdYS;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(lcdW/2,y),new Vector2(lcdW-20*lcdS,2),cSec));
y+=15*lcdYS;
int startIdx=currentPage*itemsPerPage;
int endIdx=Math.Min(startIdx+itemsPerPage,allCams.Count);
for(int i=startIdx;i<endIdx;i++){
var cam=allCams[i];
int localIdx=i-startIdx;
int col=localIdx/rowsPerCol;
int row=localIdx%rowsPerCol;
float cx=20*lcdS+col*(colW+20*lcdS);
float cy=y+row*rowH;
Color dotCol=cam.status=="ON"||cam.status=="TARGET"||cam.status=="DRILLING"?cOK:cam.status=="OFF"||cam.status=="IDLE"?cSec:cWrn;
f.Add(new MySprite(SpriteType.TEXTURE,"Circle",new Vector2(cx+8*lcdS,cy+10*lcdYS),new Vector2(12*lcdS,12*lcdYS),dotCol));
string slotTxt=cam.slot.ToString("D2");
f.Add(new MySprite(SpriteType.TEXT,slotTxt,new Vector2(cx+22*lcdS,cy),null,cTxt,"Monospace",TextAlignment.LEFT,0.4f*fntS));
string nm=cam.name;
if(nm.Length>20)nm=nm.Substring(0,17)+"...";
f.Add(new MySprite(SpriteType.TEXT,nm,new Vector2(cx+55*lcdS,cy),null,cTxt,"Monospace",TextAlignment.LEFT,0.4f*fntS));
Color typeCol=cam.type=="LOCAL"?cPri:cam.type=="MISSILE"?cErr:cAcc;
f.Add(new MySprite(SpriteType.TEXT,cam.type,new Vector2(cx+colW-5*lcdS,cy),null,typeCol,"Monospace",TextAlignment.RIGHT,0.35f*fntS));
}
if(allCams.Count==0){
f.Add(new MySprite(SpriteType.TEXT,"No cameras detected",new Vector2(lcdW/2,lcdH/2),null,cSec,"Monospace",TextAlignment.CENTER,0.6f*fntS));}
float footerY=lcdH-25*lcdYS;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(lcdW/2,footerY-10*lcdYS),new Vector2(lcdW-20*lcdS,2),cSec));
int lckCnt=laserAssign.Count;
if(lckCnt>0){
f.Add(new MySprite(SpriteType.TEXTURE,"Circle",new Vector2(20*lcdS,footerY+5*lcdYS),new Vector2(8*lcdS,8*lcdYS),cErr));
f.Add(new MySprite(SpriteType.TEXT,$"LOCK:{lckCnt}",new Vector2(32*lcdS,footerY),null,cErr,"Monospace",TextAlignment.LEFT,0.4f*fntS));}
f.Add(new MySprite(SpriteType.TEXT,"Auto-cycle 5s",new Vector2(lcdW-15*lcdS,footerY),null,cSec,"Monospace",TextAlignment.RIGHT,0.35f*fntS));
f.Dispose();
}

void DrawSignalStatusLCD(IMyTextSurface sf){
sf.ContentType=ContentType.SCRIPT;sf.Script="";
float w=sf.SurfaceSize.X,h=sf.SurfaceSize.Y;
float s=w/512f,ys=h/512f,fs=Math.Max(0.6f,(s+ys)/2f);
var f=sf.DrawFrame();
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,h/2),new Vector2(w,h),cBg));
float y=10*ys;
f.Add(new MySprite(SpriteType.TEXT,$"SIGNAL STATUS - PAD {padID}",new Vector2(w/2,y),null,cPri,"White",TextAlignment.CENTER,0.8f*fs));
y+=30*ys;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));
y+=15*ys;
f.Add(new MySprite(SpriteType.TEXT,"ANTENNAS",new Vector2(20*s,y),null,cAcc,"Monospace",TextAlignment.LEFT,0.5f*fs));
y+=22*ys;
Color rCol=radioEnabled>0?cOK:cErr;Color lCol=laserConnected>0?cOK:cErr;
f.Add(new MySprite(SpriteType.TEXT,$"Radio: {radioEnabled}/{padRadios.Count}",new Vector2(30*s,y),null,rCol,"Monospace",TextAlignment.LEFT,0.4f*fs));
f.Add(new MySprite(SpriteType.TEXT,$"Laser: {laserConnected}/{padLasers.Count}",new Vector2(w/2,y),null,lCol,"Monospace",TextAlignment.LEFT,0.4f*fs));
y+=25*ys;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));
y+=15*ys;
f.Add(new MySprite(SpriteType.TEXT,"LASER TARGETS",new Vector2(20*s,y),null,cAcc,"Monospace",TextAlignment.LEFT,0.5f*fs));
y+=22*ys;
for(int i=0;i<Math.Min(4,padLasers.Count);i++){
string tgt="---";long mid=0;
foreach(var kv in laserAssign)if(kv.Value==i){mid=kv.Key;break;}
if(mid!=0)tgt=$"MSL-{mid%10000}";
Color tc=mid!=0?cOK:cSec;
f.Add(new MySprite(SpriteType.TEXT,$"L{i}: {tgt}",new Vector2(30*s+(i%2)*(w/2-40*s),y+(i/2)*20*ys),null,tc,"Monospace",TextAlignment.LEFT,0.35f*fs));}
y+=50*ys;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));
y+=15*ys;
int flAct=0,flDep=0;foreach(var mv in missiles.Values){string ms=mv.status??"";if(ms=="SAT_HOLD"||ms=="SAT_BRAKE")flDep++;else if(ms!="IDLE"&&ms!="UNKNOWN"&&(tick-mv.lastSeen)<50)flAct++;}
f.Add(new MySprite(SpriteType.TEXT,"FLIGHTS",new Vector2(20*s,y),null,cAcc,"Monospace",TextAlignment.LEFT,0.5f*fs));
y+=20*ys;
Color flCol=flAct>0?cWrn:flDep>0?cOK:cSec;
f.Add(new MySprite(SpriteType.TEXT,$"Active:{flAct} Deployed:{flDep} Outcomes:{mslOutcomes.Count}",new Vector2(30*s,y),null,flCol,"Monospace",TextAlignment.LEFT,0.35f*fs));
y+=25*ys;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));
y+=15*ys;
int satActive=0,satInt=0;foreach(var sv in satellites.Values){if(sv.status=="SAT_HOLD"||sv.status=="ACTIVE")satActive++;if(sv.status=="SAT_INTERCEPT")satInt++;}
f.Add(new MySprite(SpriteType.TEXT,"SATELLITES",new Vector2(20*s,y),null,cAcc,"Monospace",TextAlignment.LEFT,0.5f*fs));
f.Add(new MySprite(SpriteType.TEXT,$"{satellites.Count} total",new Vector2(w-30*s,y),null,cTxt,"Monospace",TextAlignment.RIGHT,0.4f*fs));
y+=20*ys;
Color satSumCol=satInt>0?cErr:satActive>0?cOK:cWrn;
f.Add(new MySprite(SpriteType.TEXT,$"Active:{satActive} | Intercept:{satInt}",new Vector2(30*s,y),null,satSumCol,"Monospace",TextAlignment.LEFT,0.35f*fs));
y+=18*ys;
int cols=(int)(w/140);if(cols<1)cols=1;int col=0;float startY=y;
foreach(var kv in satellites){var sat=kv.Value;
Color sc=sat.status=="SAT_HOLD"||sat.status=="ACTIVE"?cOK:sat.status=="SAT_INTERCEPT"?cErr:cWrn;
float cx=30*s+col*(w/cols);
f.Add(new MySprite(SpriteType.TEXT,$"#{kv.Key}({sat.gridX},{sat.gridZ}){sat.bat}%",new Vector2(cx,y),null,sc,"Monospace",TextAlignment.LEFT,0.28f*fs));
col++;if(col>=cols){col=0;y+=14*ys;}
if(y>startY+56*ys)break;}
if(col>0)y+=14*ys;
y+=10*ys;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));
y+=15*ys;
f.Add(new MySprite(SpriteType.TEXT,"INTERCEPTS",new Vector2(20*s,y),null,cAcc,"Monospace",TextAlignment.LEFT,0.5f*fs));
y+=22*ys;
int intShow=0;
foreach(var intc in intercepts){if(intShow>=3)break;
string txt=intc.Length>40?intc.Substring(0,37)+"...":intc;
f.Add(new MySprite(SpriteType.TEXT,txt,new Vector2(30*s,y),null,cErr,"Monospace",TextAlignment.LEFT,0.3f*fs));
y+=16*ys;intShow++;}
if(intercepts.Count==0)f.Add(new MySprite(SpriteType.TEXT,"No intercepts",new Vector2(30*s,y),null,cSec,"Monospace",TextAlignment.LEFT,0.3f*fs));
y+=20*ys;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));
y+=15*ys;
f.Add(new MySprite(SpriteType.TEXT,"PRESSURIZATION",new Vector2(20*s,y),null,cAcc,"Monospace",TextAlignment.LEFT,0.5f*fs));
y+=22*ys;
Color prsCol=overallPressure>90?cOK:overallPressure>50?cWrn:cErr;
string prsLbl=overallPressure>90?"SEALED":overallPressure>50?"LOW":"BREACH";
f.Add(new MySprite(SpriteType.TEXT,$"Pressure: {overallPressure:F0}% [{prsLbl}]",new Vector2(30*s,y),null,prsCol,"Monospace",TextAlignment.LEFT,0.4f*fs));
y+=20*ys;
int extO=0,intO=0;foreach(var kv in doorSets){var ds=kv.Value;foreach(var dl in ds.extDoors.Values)foreach(var d in dl)if(d.Status==DoorStatus.Open)extO++;foreach(var dl in ds.intDoors.Values)foreach(var d in dl)if(d.Status==DoorStatus.Open)intO++;}
Color dCol=doorEmergency?cErr:extO==0?cOK:cErr;
string dStat=doorEmergency?"[EMERGENCY]":doorsLocked?"[LOCKED]":"";
f.Add(new MySprite(SpriteType.TEXT,$"Doors: {doorSets.Count} sets | Ext:{extO} Int:{intO} {dStat}",new Vector2(30*s,y),null,dCol,"Monospace",TextAlignment.LEFT,0.35f*fs));
y+=18*ys;
foreach(var kv in doorSets){
var ds=kv.Value;
int eCnt=0,iCnt=0;foreach(var dl in ds.extDoors.Values)eCnt+=dl.Count;foreach(var dl in ds.intDoors.Values)iCnt+=dl.Count;
bool anyEO=AnyOpenDict(ds.extDoors),anyIO=AnyOpenDict(ds.intDoors);
string eS=eCnt==0?"?":anyEO?"O":"■";
string iS=iCnt==0?"?":anyIO?"O":"■";
string cnt=eCnt>1||iCnt>1?$"{eCnt}x{iCnt}":"";
float vPrs=ds.vent!=null?ds.vent.GetOxygenLevel()*100:0;
string fS=ds.failed?"!":"";
Color dc=ds.failed?cErr:anyEO||anyIO?cWrn:cOK;
f.Add(new MySprite(SpriteType.TEXT,$"{kv.Key}:[{eS}{iS}]{fS}{cnt} {vPrs:F0}%",new Vector2(30*s+(doorSets.Count>4?(kv.Key-'A')%4*60*s:0),y),null,dc,"Monospace",TextAlignment.LEFT,0.3f*fs));
if(doorSets.Count<=4||((kv.Key-'A')%4==3))y+=16*ys;}
float footY=h-20*ys;
f.Add(new MySprite(SpriteType.TEXT,$"Tick:{tick}",new Vector2(w/2,footY),null,cSec,"Monospace",TextAlignment.CENTER,0.35f*fs));
f.Dispose();}

void DrawDefenseLCD(IMyTextSurface sf){
sf.ContentType=ContentType.SCRIPT;sf.Script="";
float w=sf.SurfaceSize.X,h=sf.SurfaceSize.Y;
float s=w/512f,ys=h/512f,fs=Math.Max(0.6f,(s+ys)/2f);
var f=sf.DrawFrame();
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,h/2),new Vector2(w,h),cBg));
float y=10*ys;
Color hdrCol=defenseArmed?cOK:cErr;
string hdr=defenseArmed?"DEFENSE SYSTEMS - ARMED":"DEFENSE SYSTEMS - DISARMED";
f.Add(new MySprite(SpriteType.TEXT,hdr,new Vector2(w/2,y),null,hdrCol,"White",TextAlignment.CENTER,0.7f*fs));
y+=28*ys;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));
y+=15*ys;
Dictionary<string,List<WeaponData>> byType=new Dictionary<string,List<WeaponData>>();
foreach(var wd in weapons){if(!byType.ContainsKey(wd.type))byType[wd.type]=new List<WeaponData>();byType[wd.type].Add(wd);}
foreach(var kv in byType){
f.Add(new MySprite(SpriteType.TEXT,$"{kv.Key} ({kv.Value.Count})",new Vector2(20*s,y),null,cAcc,"Monospace",TextAlignment.LEFT,0.45f*fs));
y+=20*ys;
foreach(var wd in kv.Value){
string nm=wd.name;if(nm.Length>18)nm=nm.Substring(0,15)+"...";
Color ac=wd.firing?cErr:wd.active?cOK:cSec;
float barW=(w-180*s)*wd.ammo/100f;
Color bc=wd.ammo>70?cOK:wd.ammo>30?cWrn:cErr;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(30*s+barW/2,y+8*ys),new Vector2(barW,12*ys),bc));
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(30*s+(w-180*s)/2,y+8*ys),new Vector2(w-180*s,12*ys),cBdr));
f.Add(new MySprite(SpriteType.TEXT,nm,new Vector2(35*s,y),null,ac,"Monospace",TextAlignment.LEFT,0.3f*fs));
f.Add(new MySprite(SpriteType.TEXT,$"{wd.ammo:F0}%",new Vector2(w-40*s,y),null,bc,"Monospace",TextAlignment.RIGHT,0.3f*fs));
y+=16*ys;
if(y>h-80*ys)break;}
if(y>h-80*ys)break;}
y+=10*ys;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));
y+=15*ys;
f.Add(new MySprite(SpriteType.TEXT,"AMMO RESERVES",new Vector2(20*s,y),null,cAcc,"Monospace",TextAlignment.LEFT,0.45f*fs));
y+=20*ys;
int shown=0;
foreach(var kv in ammoReserves){if(shown>=7)break;
f.Add(new MySprite(SpriteType.TEXT,$"{kv.Key}: {kv.Value:N0}",new Vector2(30*s,y),null,cTxt,"Monospace",TextAlignment.LEFT,0.3f*fs));
y+=16*ys;shown++;}
if(ammoReserves.Count==0)f.Add(new MySprite(SpriteType.TEXT,"No ammo in containers",new Vector2(30*s,y),null,cSec,"Monospace",TextAlignment.LEFT,0.3f*fs));
float footY=h-20*ys;
string statTxt=weaponFiring>0?$"FIRING: {weaponFiring}":"STANDBY";
Color statCol=weaponFiring>0?cErr:cOK;
f.Add(new MySprite(SpriteType.TEXT,$"Status: {statTxt} | Wpns: {weapons.Count}",new Vector2(w/2,footY),null,statCol,"Monospace",TextAlignment.CENTER,0.35f*fs));
f.Dispose();}

void DrawSatelliteLCD(IMyTextSurface sf){
sf.ContentType=ContentType.SCRIPT;sf.Script="";
float w=sf.SurfaceSize.X,h=sf.SurfaceSize.Y;
float s=w/512f,ys=h/512f,fs=Math.Max(0.6f,(s+ys)/2f);
var f=sf.DrawFrame();
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,h/2),new Vector2(w,h),cBg));
float y=10*ys;
int satActive=0,satInt=0;foreach(var sv in satellites.Values){if(sv.status=="SAT_HOLD"||sv.status=="ACTIVE")satActive++;if(sv.status=="SAT_INTERCEPT")satInt++;}
Color hdrCol=satInt>0?cErr:satActive>0?cOK:cPri;
f.Add(new MySprite(SpriteType.TEXT,$"SATELLITE CONSTELLATION - {satellites.Count}",new Vector2(w/2,y),null,hdrCol,"White",TextAlignment.CENTER,0.7f*fs));
y+=28*ys;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));
y+=12*ys;
f.Add(new MySprite(SpriteType.TEXT,$"ACTIVE: {satActive}  |  INTERCEPT: {satInt}  |  TOTAL: {satellites.Count}",new Vector2(w/2,y),null,cTxt,"Monospace",TextAlignment.CENTER,0.4f*fs));
y+=25*ys;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));
y+=15*ys;
int cols=Math.Max(1,(int)(w/180));
float rowH=22*ys;
int rowsAvail=(int)((h-y-40*ys)/rowH);
if(rowsAvail<1)rowsAvail=1;
int satsPerPage=cols*rowsAvail;
int totalPages=Math.Max(1,(int)Math.Ceiling((double)satellites.Count/satsPerPage));
if(satPage>=totalPages)satPage=0;
int startIdx=satPage*satsPerPage;
var satList=new List<KeyValuePair<int,SatData>>(satellites);
int col=0,shown=0;
for(int i=startIdx;i<satList.Count&&shown<satsPerPage;i++){
var kv=satList[i];var sat=kv.Value;
Color sc=sat.status=="SAT_HOLD"||sat.status=="ACTIVE"?cOK:sat.status=="SAT_INTERCEPT"?cErr:cWrn;
float cx=20*s+col*(w/cols);
string lnk=sat.links>0?$"L{sat.links}":"";
f.Add(new MySprite(SpriteType.TEXT,$"#{kv.Key} ({sat.gridX},{sat.gridZ})",new Vector2(cx,y),null,sc,"Monospace",TextAlignment.LEFT,0.32f*fs));
f.Add(new MySprite(SpriteType.TEXT,$"B:{sat.bat}% H:{sat.h2}% {lnk}",new Vector2(cx,y+12*ys),null,cTxt,"Monospace",TextAlignment.LEFT,0.28f*fs));
col++;if(col>=cols){col=0;y+=rowH;}
shown++;}
if(intercepts.Count>0&&y<h*0.75f){
y+=5*ys;f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));y+=10*ys;
f.Add(new MySprite(SpriteType.TEXT,"INTERCEPTS",new Vector2(20*s,y),null,cErr,"Monospace",TextAlignment.LEFT,0.4f*fs));y+=18*ys;
for(int ii=0;ii<Math.Min(3,intercepts.Count);ii++){
string it=intercepts[ii];if(it.Length>45)it=it.Substring(0,42)+"...";
f.Add(new MySprite(SpriteType.TEXT,it,new Vector2(20*s,y),null,cWrn,"Monospace",TextAlignment.LEFT,0.26f*fs));y+=14*ys;}}
float footY=h-22*ys;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,footY-8*ys),new Vector2(w-20*s,2),cSec));
f.Add(new MySprite(SpriteType.TEXT,$"Page {satPage+1}/{totalPages} | Auto-cycle",new Vector2(w/2,footY),null,cSec,"Monospace",TextAlignment.CENTER,0.35f*fs));
f.Dispose();
if(tick%100==0)satPage=(satPage+1)%totalPages;}

void DrawPressureLCD(IMyTextSurface sf){
sf.ContentType=ContentType.SCRIPT;sf.Script="";
float w=sf.SurfaceSize.X,h=sf.SurfaceSize.Y;
float s=w/512f,ys=h/512f,fs=Math.Max(0.6f,(s+ys)/2f);
var f=sf.DrawFrame();
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,h/2),new Vector2(w,h),cBg));
float y=10*ys;
Color prsCol=overallPressure>90?cOK:overallPressure>50?cWrn:cErr;
string prsStat=overallPressure>90?"SEALED":overallPressure>50?"LOW":"BREACH";
Color hdrCol=doorEmergency?cErr:prsCol;
f.Add(new MySprite(SpriteType.TEXT,$"PRESSURIZATION - PAD {padID}",new Vector2(w/2,y),null,cPri,"White",TextAlignment.CENTER,0.7f*fs));
y+=24*ys;
f.Add(new MySprite(SpriteType.TEXT,$"{overallPressure:F0}%",new Vector2(20*s,y),null,prsCol,"Monospace",TextAlignment.LEFT,0.5f*fs));
f.Add(new MySprite(SpriteType.TEXT,prsStat,new Vector2(w-20*s,y),null,prsCol,"Monospace",TextAlignment.RIGHT,0.45f*fs));
y+=20*ys;
float barW=w-40*s,barH=16*ys;
float fillW=barW*Math.Min(1,overallPressure/100f);
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(20*s+barW/2,y+barH/2),new Vector2(barW,barH),cBdr));
if(fillW>0)f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(20*s+fillW/2,y+barH/2),new Vector2(fillW,barH-4),prsCol));
y+=barH+12*ys;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));
y+=12*ys;
int extO=0,intO=0;foreach(var kv in doorSets){var ds=kv.Value;foreach(var dl in ds.extDoors.Values)foreach(var d in dl)if(d.Status==DoorStatus.Open)extO++;foreach(var dl in ds.intDoors.Values)foreach(var d in dl)if(d.Status==DoorStatus.Open)intO++;}
f.Add(new MySprite(SpriteType.TEXT,"AIRLOCKS",new Vector2(20*s,y),null,cAcc,"Monospace",TextAlignment.LEFT,0.5f*fs));
string doorSum=extO==0&&intO==0?"All Closed":$"{extO} outer, {intO} inner open";
Color sumCol=doorEmergency?cErr:extO==0&&intO==0?cOK:cWrn;
f.Add(new MySprite(SpriteType.TEXT,doorSum,new Vector2(w-20*s,y),null,sumCol,"Monospace",TextAlignment.RIGHT,0.35f*fs));
y+=22*ys;
if(doorSets.Count==0){f.Add(new MySprite(SpriteType.TEXT,"No airlocks detected",new Vector2(w/2,y+20*ys),null,cSec,"Monospace",TextAlignment.CENTER,0.45f*fs));}
else{
int cols=doorSets.Count>4?2:1;
float colW=(w-40*s)/cols;
int col=0;float startY=y;
foreach(var kv in doorSets){
var ds=kv.Value;
float cx=20*s+col*colW;
bool eO=AnyOpenDict(ds.extDoors),eC=AllClosedDict(ds.extDoors),iO=AnyOpenDict(ds.intDoors),iC=AllClosedDict(ds.intDoors);
if(ds.extDoors.Count==0)eC=false;if(ds.intDoors.Count==0)iC=false;
float vPrs=ds.vent!=null?ds.vent.GetOxygenLevel()*100:0;
Color lblCol=ds.failed?cErr:(eO&&iO)?cErr:eO||iO?cWrn:cOK;
f.Add(new MySprite(SpriteType.TEXT,$"[{kv.Key}]",new Vector2(cx,y),null,lblCol,"Monospace",TextAlignment.LEFT,0.5f*fs));
float doorX=cx+35*s;
Color extCol=eO?cErr:eC?cOK:cWrn;
Color intCol=iO?cWrn:iC?cOK:cWrn;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(doorX,y+10*ys),new Vector2(18*s,14*ys),extCol));
f.Add(new MySprite(SpriteType.TEXT,"E",new Vector2(doorX,y+3*ys),null,cBg,"Monospace",TextAlignment.CENTER,0.3f*fs));
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(doorX+22*s,y+10*ys),new Vector2(18*s,14*ys),intCol));
f.Add(new MySprite(SpriteType.TEXT,"I",new Vector2(doorX+22*s,y+3*ys),null,cBg,"Monospace",TextAlignment.CENTER,0.3f*fs));
Color aPrsCol=vPrs>80?cOK:vPrs>30?cWrn:cErr;
f.Add(new MySprite(SpriteType.TEXT,$"{vPrs:F0}%",new Vector2(doorX+50*s,y),null,aPrsCol,"Monospace",TextAlignment.LEFT,0.4f*fs));
if(ds.failed)f.Add(new MySprite(SpriteType.TEXT,"FAIL",new Vector2(doorX+90*s,y),null,cErr,"Monospace",TextAlignment.LEFT,0.35f*fs));
col++;if(col>=cols){col=0;y+=26*ys;}
}
if(col>0)y+=26*ys;}
y+=10*ys;
if(isCtl&&remoteDoors.Count>0){
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));
y+=12*ys;
int rdEmg=0,rdLck=0,rdExtO=0,rdIntO=0;float rdPrsSum=0;
foreach(var rd in remoteDoors.Values){if(rd.emergency)rdEmg++;if(rd.locked)rdLck++;rdExtO+=rd.extOpen;rdIntO+=rd.intOpen;rdPrsSum+=rd.pressure;}
float rdAvgPrs=remoteDoors.Count>0?rdPrsSum/remoteDoors.Count:0;
Color rdHdrCol=rdEmg>0?cErr:rdExtO>0?cWrn:cOK;
f.Add(new MySprite(SpriteType.TEXT,$"REMOTE PADS ({remoteDoors.Count})",new Vector2(20*s,y),null,rdHdrCol,"Monospace",TextAlignment.LEFT,0.5f*fs));
f.Add(new MySprite(SpriteType.TEXT,$"Avg:{rdAvgPrs:F0}%",new Vector2(w-20*s,y),null,rdAvgPrs>80?cOK:rdAvgPrs>40?cWrn:cErr,"Monospace",TextAlignment.RIGHT,0.4f*fs));
y+=22*ys;
int rdCols=remoteDoors.Count>4?2:1;
float rdColW=(w-40*s)/rdCols;
int rdCol=0;
foreach(var rdKv in remoteDoors){
var rd=rdKv.Value;
float rx=20*s+rdCol*rdColW;
Color rdPadCol=rd.emergency?cErr:rd.extOpen>0?cWrn:cOK;
string rdStat=rd.emergency?"EMRG":rd.locked?"LOCK":"OK";
f.Add(new MySprite(SpriteType.TEXT,$"PAD{rd.padId}",new Vector2(rx,y),null,rdPadCol,"Monospace",TextAlignment.LEFT,0.4f*fs));
f.Add(new MySprite(SpriteType.TEXT,$"D:{rd.doorCount} E:{rd.extOpen} I:{rd.intOpen}",new Vector2(rx+60*s,y),null,cTxt,"Monospace",TextAlignment.LEFT,0.3f*fs));
Color rdPCol=rd.pressure>80?cOK:rd.pressure>40?cWrn:cErr;
f.Add(new MySprite(SpriteType.TEXT,$"{rd.pressure:F0}%",new Vector2(rx+rdColW-40*s,y),null,rdPCol,"Monospace",TextAlignment.LEFT,0.35f*fs));
f.Add(new MySprite(SpriteType.TEXT,rdStat,new Vector2(rx+rdColW-5*s,y),null,rdPadCol,"Monospace",TextAlignment.RIGHT,0.3f*fs));
rdCol++;if(rdCol>=rdCols){rdCol=0;y+=22*ys;}}
if(rdCol>0)y+=22*ys;
y+=5*ys;}
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));
y+=12*ys;
f.Add(new MySprite(SpriteType.TEXT,"PAD VENTS",new Vector2(20*s,y),null,cAcc,"Monospace",TextAlignment.LEFT,0.5f*fs));
f.Add(new MySprite(SpriteType.TEXT,$"({padVents.Count})",new Vector2(w-20*s,y),null,cTxt,"Monospace",TextAlignment.RIGHT,0.4f*fs));
y+=20*ys;
if(padVents.Count==0){f.Add(new MySprite(SpriteType.TEXT,"No pad vents detected",new Vector2(w/2,y),null,cSec,"Monospace",TextAlignment.CENTER,0.4f*fs));}
else{
int maxShow=Math.Min(8,padVents.Count);
int ventCols=maxShow>4?2:1;
float ventColW=(w-40*s)/ventCols;
int vc=0;
for(int i=0;i<maxShow;i++){
var v=padVents[i];
float vx=20*s+vc*ventColW;
float prs=v.GetOxygenLevel()*100;
Color vCol=prs>80?cOK:prs>30?cWrn:cErr;
string nm=v.CustomName;int ti=nm.IndexOf(blockTag);if(ti>=0)nm=nm.Substring(ti+blockTag.Length).Trim();
if(nm.Length>12)nm=nm.Substring(0,10)+"..";
f.Add(new MySprite(SpriteType.TEXT,nm,new Vector2(vx,y),null,cTxt,"Monospace",TextAlignment.LEFT,0.32f*fs));
float vBarW=50*s,vBarH=10*ys;
float vFillW=vBarW*prs/100f;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(vx+80*s+vBarW/2,y+6*ys),new Vector2(vBarW,vBarH),cBdr));
if(vFillW>0)f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(vx+80*s+vFillW/2,y+6*ys),new Vector2(vFillW,vBarH-2),vCol));
f.Add(new MySprite(SpriteType.TEXT,$"{prs:F0}%",new Vector2(vx+135*s,y),null,vCol,"Monospace",TextAlignment.LEFT,0.3f*fs));
vc++;if(vc>=ventCols){vc=0;y+=18*ys;}}
if(vc>0)y+=18*ys;
if(padVents.Count>maxShow)f.Add(new MySprite(SpriteType.TEXT,$"+{padVents.Count-maxShow} more vents",new Vector2(w/2,y),null,cSec,"Monospace",TextAlignment.CENTER,0.3f*fs));}
float footY=h-22*ys;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,footY-8*ys),new Vector2(w-20*s,2),cSec));
string footStat=doorEmergency?$"DUAL BREACH x{emergencyCount}":doorsLocked?"DOORS LOCKED":"INTERLOCK OK";
string footTip=doorEmergency?"Run DOOR:UNLOCK to reset":"";
Color footCol=doorEmergency?cErr:doorsLocked?cWrn:cOK;
f.Add(new MySprite(SpriteType.TEXT,footStat,new Vector2(20*s,footY),null,footCol,"Monospace",TextAlignment.LEFT,0.4f*fs));
if(doorEmergency)f.Add(new MySprite(SpriteType.TEXT,footTip,new Vector2(w-20*s,footY),null,cWrn,"Monospace",TextAlignment.RIGHT,0.3f*fs));
f.Dispose();}

void DrawFlightLCD(IMyTextSurface sf){
sf.ContentType=ContentType.SCRIPT;sf.Script="";
float w=sf.SurfaceSize.X,h=sf.SurfaceSize.Y;
float s=w/512f,ys=h/512f,fs=Math.Max(0.6f,(s+ys)/2f);
var f=sf.DrawFrame();
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,h/2),new Vector2(w,h),cBg));
float y=10*ys;
int mslActive=0,mslDeployed=0;var actMsl=new List<KeyValuePair<long,MslData>>();
foreach(var kv in missiles){var ms=kv.Value;string st=ms.status??"";bool alive=st!="IDLE"&&st!="UNKNOWN"&&(tick-ms.lastSeen)<50;bool isSat=st=="SAT_HOLD"||st=="SAT_BRAKE"||st=="SAT_CLIMB"||st=="SAT_INTERCEPT";if(alive||isSat){actMsl.Add(kv);if(isSat)mslDeployed++;else if(alive)mslActive++;}}
Color hCol=mslActive>0?cWrn:mslDeployed>0?cOK:cPri;
f.Add(new MySprite(SpriteType.TEXT,$"FLIGHT COMMAND - PAD {padID}",new Vector2(w/2,y),null,hCol,"White",TextAlignment.CENTER,0.7f*fs));
y+=26*ys;
f.Add(new MySprite(SpriteType.TEXT,$"FLY:{mslActive} SAT:{mslDeployed} LOG:{flightLog.Count} OUT:{mslOutcomes.Count}",new Vector2(w/2,y),null,cTxt,"Monospace",TextAlignment.CENTER,0.32f*fs));
y+=18*ys;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));y+=8*ys;
if(actMsl.Count>0){
int shown=0;foreach(var kv in actMsl){
var m=kv.Value;long mid=kv.Key;string st=m.status??"";
bool isSat=st=="SAT_HOLD"||st=="SAT_BRAKE"||st=="SAT_CLIMB"||st=="SAT_INTERCEPT";
Color sc=isSat?(st=="SAT_INTERCEPT"?cErr:cOK):st=="TARGET"||st=="REENTRY"?cWrn:st=="DETONATE"?cErr:st=="CLIMB"||st=="ARM"?cOK:cPri;
string pid=m.padId>0?$"P{m.padId} ":"";
string label=isSat?$"{pid}SAT-{mid%10000} {st}":$"{pid}MSL-{mid%10000} {st}";
f.Add(new MySprite(SpriteType.TEXT,label,new Vector2(20*s,y),null,sc,"Monospace",TextAlignment.LEFT,0.3f*fs));
string info=isSat?$"G:({m.alt:F0}) B:{m.fuel:F0}%":$"D:{m.dist:F0} A:{m.alt:F0} S:{m.spd:F0} F:{m.fuel:F0}%";
f.Add(new MySprite(SpriteType.TEXT,info,new Vector2(20*s,y+13*ys),null,cTxt,"Monospace",TextAlignment.LEFT,0.25f*fs));
y+=28*ys;shown++;if(shown>=6||y>h*0.45f)break;}
if(actMsl.Count>shown)f.Add(new MySprite(SpriteType.TEXT,$"+{actMsl.Count-shown} more",new Vector2(20*s,y),null,cSec,"Monospace",TextAlignment.LEFT,0.25f*fs));
y+=6*ys;}
if(mslOutcomes.Count>0){
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));y+=8*ys;
f.Add(new MySprite(SpriteType.TEXT,"OUTCOMES",new Vector2(20*s,y),null,cAcc,"Monospace",TextAlignment.LEFT,0.3f*fs));y+=14*ys;
for(int i=0;i<Math.Min(4,mslOutcomes.Count);i++){
var op=mslOutcomes[i].Split('|');string oTxt=mslOutcomes[i];
Color oc=cTxt;if(oTxt.Contains("TARGET HIT"))oc=cOK;else if(oTxt.Contains("DEPLOYED"))oc=cPri;else if(oTxt.Contains("SAT DEPLOY"))oc=cOK;else if(oTxt.Contains("RESET"))oc=cWrn;else oc=cErr;
f.Add(new MySprite(SpriteType.TEXT,oTxt.Length>50?oTxt.Substring(0,47)+"...":oTxt,new Vector2(20*s,y),null,oc,"Monospace",TextAlignment.LEFT,0.24f*fs));
y+=14*ys;}}
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,y),new Vector2(w-20*s,2),cSec));y+=8*ys;
f.Add(new MySprite(SpriteType.TEXT,"EVENT LOG",new Vector2(20*s,y),null,cAcc,"Monospace",TextAlignment.LEFT,0.3f*fs));y+=14*ys;
float rowH=14*ys;int maxRows=(int)((h-y-30*ys)/rowH);if(maxRows<1)maxRows=1;
for(int i=0;i<Math.Min(maxRows,flightLog.Count);i++){
string log=flightLog[i];var pts=log.Split('|');
string tStr=pts.Length>0?pts[0]:"";string mslStr=pts.Length>1?pts[1]:"";string phStr=pts.Length>2?pts[2]:"";
Color phCol=cTxt;
if(phStr.Contains("DETONATE")||phStr.Contains("INTERCEPT"))phCol=cErr;
else if(phStr.Contains("TARGET")||phStr.Contains("REENTRY"))phCol=cWrn;
else if(phStr.Contains("ARM")||phStr.Contains("COAST"))phCol=cAcc;
else if(phStr.Contains("CLIMB")||phStr.Contains("SAT_"))phCol=cOK;
f.Add(new MySprite(SpriteType.TEXT,$"{tStr} {mslStr} {phStr}",new Vector2(20*s,y),null,phCol,"Monospace",TextAlignment.LEFT,0.24f*fs));
y+=rowH;}
if(flightLog.Count==0&&actMsl.Count==0&&mslOutcomes.Count==0)
f.Add(new MySprite(SpriteType.TEXT,"No flight activity",new Vector2(w/2,h/2),null,cSec,"Monospace",TextAlignment.CENTER,0.45f*fs));
float footY=h-22*ys;
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,footY-8*ys),new Vector2(w-20*s,2),cSec));
f.Add(new MySprite(SpriteType.TEXT,$"T:{tick} Sats:{satellites.Count} Lasers:{laserAssign.Count}",new Vector2(w/2,footY),null,cSec,"Monospace",TextAlignment.CENTER,0.3f*fs));
f.Dispose();}

void UpdateEcho(){
Echo("=== UNITY SIGNAL v01.00 ===");
Echo($"Mode: {(isCtl?"CONTROLLER":"PAD "+padID)}");
string bootSt=bootComplete?"OK":(padSession==""?"NO SESSION":"BOOTING");
Echo($"Boot: {bootSt} | Tick: {tick}");
if(padSession!="")Echo($"Session: {padSession.Substring(0,Math.Min(8,padSession.Length))}");
else Echo("Waiting for pad session...");
if(!bootComplete){Echo("");Echo("--- WAITING FOR BOOT ---");Echo("Pad must compile first, then Boot.");Echo($"PadPB: {(padPB!=null?"Found":"---")}");Echo($"BootPB: {(bootPB!=null?"Found":"---")}");Echo($"Doors: {doorSets.Count} sets scanned");Echo($"Pressure: {overallPressure:F0}%");return;}
Echo("");
Echo("--- ANTENNAS ---");
Echo($"Radio: {radioEnabled}/{padRadios.Count} | Laser: {laserConnected}/{padLasers.Count}");
Echo($"Tracking: {laserAssign.Count} missiles");
Echo("");
Echo("--- SATELLITES ---");
int satActive=0;foreach(var s in satellites.Values)if(s.status=="ACTIVE"||s.status=="SAT_HOLD")satActive++;
Echo($"Total: {satellites.Count} | Active: {satActive}");
Echo("");
Echo("--- CAMERAS ---");
Echo($"Local:{localCams.Count} MSL:{missiles.Count} MNR:{miners.Count}");
Echo($"Total: {allCams.Count} on {lcdsBySlot.Count} LCDs");
Echo("");
Echo("--- DOORS ---");
Echo($"Sets: {doorSets.Count} | Lock: {(doorsLocked?"YES":"NO")} | Emrg: {emergencyCount}");
foreach(var kv in doorSets){var ds=kv.Value;
bool sE=false,sI=false;foreach(var sl in ds.senExt.Values)if(SensorActive(sl)){sE=true;break;}foreach(var sl in ds.senInt.Values)if(SensorActive(sl)){sI=true;break;}
string eS=ds.extDoors.Count>0?(AnyOpenDict(ds.extDoors)?"OPEN":"SHUT"):"--";
string iS=ds.intDoors.Count>0?(AnyOpenDict(ds.intDoors)?"OPEN":"SHUT"):"--";
string snE=ds.senExt.Count>0?(sE?"*":"."):"X";
string snI=ds.senInt.Count>0?(sI?"*":"."):"X";
float prs=ds.vent!=null?ds.vent.GetOxygenLevel()*100:0;
Echo($" [{kv.Key}] D:{eS}/{iS} S:{snE}/{snI} {prs:F0}%");}
Echo($"Pressure: {overallPressure:F0}%");
Echo("");
Echo("--- DEFENSE ---");
Echo($"Weapons: {weapons.Count} | Armed: {(defenseArmed?"YES":"NO")}");
Echo($"Firing: {weaponFiring} | AmmoCargo: {ammoContainers.Count}");
Echo("");
Echo("--- FLIGHT LOG ---");
Echo($"Entries: {flightLog.Count}/{MAX_FLIGHT_LOG}");
if(flightLog.Count>0)Echo($"Last: {flightLog[0]}");
}
