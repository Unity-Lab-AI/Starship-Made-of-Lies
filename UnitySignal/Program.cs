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
    {        string blockTag="[PAD1]";
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
        class MslData{public string status;public int camCount;public List<string> camNames=new List<string>();public int lastSeen;public Vector3D pos;public float dist;}
        class MinerData{public string shipName;public string status;public List<long> camIds=new List<long>();public int lastSeen;}
        Dictionary<long,int> laserAssign=new Dictionary<long,int>();
        class SatData{public int gridX,gridZ,bat,h2,links;public string status;public int lastSeen;}
        Dictionary<int,SatData> satellites=new Dictionary<int,SatData>();
        IMyBroadcastListener satStL,satIntL;
        List<string> intercepts=new List<string>();
        const int MAX_INTERCEPTS=10;
        List<string> conflicts=new List<string>();
        const int MAX_CONFLICTS=5;
        class DoorSet{public IMyDoor ext,intD;public IMyAirVent vent;public IMySensorBlock senExt,senInt;public int state;public int lastChange;public int retries;public bool failed;public int holdUntil;public bool cycleToInt;}
        Dictionary<char,DoorSet> doorSets=new Dictionary<char,DoorSet>();
        bool doorsLocked=false;
        bool doorEmergency=false;
        int emergencyCount=0;
        string lastDoorError="";
        const int DOOR_DEBOUNCE=30;
        const int DOOR_TIMEOUT=60;
        const int DOOR_MAX_RETRY=3;
        const int DOOR_HOLD=1;
        List<IMyAirVent> padVents=new List<IMyAirVent>();
        float overallPressure=0;
        
        class WeaponData{public IMyUserControllableGun gun;public string type;public string name;public float ammo;public bool active;public bool firing;}
        List<WeaponData> weapons=new List<WeaponData>();
        List<IMyCargoContainer> ammoContainers=new List<IMyCargoContainer>();
        List<IMyTextSurface> defenseLCDs=new List<IMyTextSurface>();
        List<IMyTextSurface> satLCDs=new List<IMyTextSurface>();
        List<IMyTextSurface> pressureLCDs=new List<IMyTextSurface>();
        int satPage=0;
        bool defenseArmed=true;
        int weaponFiring=0;
        Dictionary<string,int> ammoReserves=new Dictionary<string,int>();
        
        IMyBroadcastListener bootReqL,signalCmdL,signalStatusL;
        public Program(){
        Runtime.UpdateFrequency=UpdateFrequency.Update100;
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
        string failedSets="";foreach(var kv in doorSets)if(kv.Value.failed)failedSets+=kv.Key;
        string doorData=$"count={doorSets.Count}\nlocked={doorsLocked}\nemergency={doorEmergency}\nemergency_count={emergencyCount}\noverall_pressure={overallPressure:F0}\npad_vents={padVents.Count}\nlast_error={lastDoorError}\nfailed_sets={failedSets}\n";
        foreach(var kv in doorSets){var ds=kv.Value;
        string eS=ds.ext!=null?(ds.ext.Status==DoorStatus.Open?"OPEN":ds.ext.Status==DoorStatus.Closed?"CLOSED":"MOVING"):"NONE";
        string iS=ds.intD!=null?(ds.intD.Status==DoorStatus.Open?"OPEN":ds.intD.Status==DoorStatus.Closed?"CLOSED":"MOVING"):"NONE";
        float prs=ds.vent!=null?ds.vent.GetOxygenLevel()*100:0;
        string fS=ds.failed?"FAILED":"OK";
        string sE=ds.senExt!=null?(ds.senExt.IsActive?"TRIG":"RDY"):"NONE";
        string sI=ds.senInt!=null?(ds.senInt.IsActive?"TRIG":"RDY"):"NONE";
        doorData+=$"door_{kv.Key}={eS}|{iS}|{prs:F0}|{ds.state}|{fS}|{sE}|{sI}\n";}
        string ctlData="";
        if(isCtl){
        int satActive=0;foreach(var s in satellites.Values)if(s.status=="SAT_HOLD"||s.status=="ACTIVE")satActive++;
        ctlData=$"\n[CONTROLLER]\nmode=CONTROLLER\ntotal_missiles={missiles.Count}\ntotal_miners={miners.Count}\ntotal_satellites={satellites.Count}\nactive_satellites={satActive}\nlaser_tracking={laserAssign.Count}\nintercepts={intercepts.Count}\nconflicts={conflicts.Count}\n";}
        Dictionary<string,int> wpnByType=new Dictionary<string,int>();
        foreach(var wd in weapons){if(!wpnByType.ContainsKey(wd.type))wpnByType[wd.type]=0;wpnByType[wd.type]++;}
        string defData=$"weapons={weapons.Count}\narmed={defenseArmed}\nfiring={weaponFiring}\nammo_containers={ammoContainers.Count}\n";
        foreach(var kv in wpnByType)defData+=$"{kv.Key.ToLower()}={kv.Value}\n";
        string ammoData="";foreach(var kv in ammoReserves)ammoData+=$"ammo_{kv.Key}={kv.Value}\n";
        Me.CustomData=$"[SIGNAL]\nsignal_ready=true\n{(sess!=""?$"signal_for_session={sess}\n":"")}{(isCtl?"mode=CONTROLLER\n":"")}\n[ANTENNAS]\nradio={radioEnabled}/{padRadios.Count}\nlaser={laserConnected}/{padLasers.Count}\n\n[LASERS]\n{lsrData}\n[SATELLITES]\n{satData}\n[INTERCEPTS]\n{intData}\n[CONFLICTS]\n{cflData}\n[DOORS]\n{doorData}\n[DEFENSE]\n{defData}{ammoData}{ctlData}\n[STATUS]\nlast_update={tick}\nboot_complete={bootComplete}\ncameras={allCams.Count}\nmissiles={missiles.Count}\nminers={miners.Count}\nsatellites={satellites.Count}\ndoor_sets={doorSets.Count}\nweapons={weapons.Count}";}
        
        void FindPadPB(){
        if(padPB!=null)return;
        var pbs=new List<IMyProgrammableBlock>();
        GridTerminalSystem.GetBlocksOfType(pbs,b=>b.CubeGrid==Me.CubeGrid&&b!=Me);
        foreach(var pb in pbs){
        if(pb.CustomName.Contains("[PAD")&&pb.CustomName.ToUpper().Contains("UNITY PAD")){padPB=pb;return;}}}
        
        void CheckBootRequest(){
        while(bootReqL.HasPendingMessage){
        var msg=bootReqL.AcceptMessage();
        if(msg.Data is string){
        string req=(string)msg.Data;
        if(req.StartsWith("SIGNAL_CHECK")){
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
        if(a=="RESCAN"){ScanBlocks();return;}
        if(a=="RESET"){bootComplete=false;allCams.Clear();missiles.Clear();miners.Clear();satellites.Clear();lcdsBySlot.Clear();signalLCDs.Clear();defenseLCDs.Clear();satLCDs.Clear();weapons.Clear();return;}
        if(a=="ANTENNA:ON"){foreach(var r in padRadios){r.Enabled=true;r.EnableBroadcasting=true;}return;}
        if(a=="ANTENNA:OFF"){foreach(var r in padRadios){r.Enabled=false;}return;}
        if(a.StartsWith("ANTENNA:RANGE:")){var pts=a.Split(':');if(pts.Length>=3){float rng;if(float.TryParse(pts[2],out rng)&&rng>=0)foreach(var r in padRadios)r.Radius=rng;}return;}
        if(a=="LASER:CLEAR"){laserAssign.Clear();return;}
        if(a=="SAT:RESCAN"){satellites.Clear();return;}
        if(a=="DOOR:LOCK"){doorsLocked=true;return;}
        if(a=="DOOR:UNLOCK"){ResetDoorEmergency();return;}
        if(a.StartsWith("DOOR:")&&a.Contains(":OPEN:")){var pts=a.Split(':');if(pts.Length>=4){char ltr=char.ToUpper(pts[1][0]);int num;if(int.TryParse(pts[3],out num))TryOpenDoor(ltr,num);}return;}
        if(a.StartsWith("DOOR:")&&a.Contains(":CLOSE:")){var pts=a.Split(':');if(pts.Length>=4){char ltr=char.ToUpper(pts[1][0]);int num;if(int.TryParse(pts[3],out num))TryCloseDoor(ltr,num);}return;}
        if(a=="DEFENSE:ARM"){SetDefenseArmed(true);return;}
        if(a=="DEFENSE:DISARM"){SetDefenseArmed(false);return;}
        if(a=="DEFENSE:RESCAN"){ScanDefense();return;}
        if(a.StartsWith("LASER:")){
        var pts=a.Split(':');
        if(pts.Length>=3){int idx;if(int.TryParse(pts[1],out idx)&&idx>=0&&idx<padLasers.Count){
        if(pts[2]=="ON")padLasers[idx].Enabled=true;
        else if(pts[2]=="OFF"){padLasers[idx].Enabled=false;var rem=new List<long>();foreach(var kv in laserAssign)if(kv.Value==idx)rem.Add(kv.Key);foreach(var k in rem)laserAssign.Remove(k);}}}
        return;}}
        if(!CheckSessionValid()){
        return;}
        if(!bootComplete){
        CheckBoot();
        return;}
        ProcessMessages();
        UpdateDoors();
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
        if(bootPB==null){
        ShowBootWait("Searching for Unity Boot...");
        return;}
        if(!bootPB.CustomData.Contains("boot_complete=true")){
        ShowBootWait("Waiting for boot_complete...");
        return;}
        bootComplete=true;
        CheckControllerMode();
        ScanBlocks();
        }
        
        bool CheckSessionValid(){
        if(padSession=="")return false;
        if(padPB==null)FindPadPB();
        if(padPB==null)return false;
        string pcd=padPB.CustomData;
        int idx=pcd.IndexOf("pad_session=");
        if(idx<0)return false;
        int end=pcd.IndexOf('\n',idx);if(end<0)end=pcd.Length;
        string curSess=pcd.Substring(idx+12,end-idx-12).Trim();
        return curSess==padSession;
        }
        
        void FindBootPB(){
        var pbs=new List<IMyProgrammableBlock>();
        GridTerminalSystem.GetBlocksOfType(pbs,b=>b.CubeGrid==Me.CubeGrid&&b!=Me);
        foreach(var pb in pbs){
        if(pb.CustomName.Contains("[PAD")&&pb.CustomName.ToUpper().Contains("UNITY BOOT")){bootPB=pb;return;}}}
        
        void CheckControllerMode(){
        var lcds=new List<IMyTextPanel>();
        GridTerminalSystem.GetBlocksOfType(lcds,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains("[CTRLCAMS]"));
        isCtl=lcds.Count>0;}
        
        void ShowBootWait(string msg){
        var lcds=new List<IMyTextPanel>();
        GridTerminalSystem.GetBlocksOfType(lcds,b=>b.CubeGrid==Me.CubeGrid&&(b.CustomName.Contains("CAMS")||b.CustomName.Contains($"[PAD{padID}SIGNAL]")||b.CustomName.Contains($"[PAD{padID}DEFENSE]")||b.CustomName.Contains($"[PAD{padID}SATS]")||b.CustomName.Contains($"[PAD{padID}PRESSURE]")));
        foreach(var lcd in lcds){
        var sf=lcd as IMyTextSurface;if(sf==null)continue;
        sf.ContentType=ContentType.SCRIPT;sf.Script="";
        float w=sf.SurfaceSize.X,h=sf.SurfaceSize.Y;
        float s=Math.Min(w,h)/512f;
        var f=sf.DrawFrame();
        f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(w/2,h/2),new Vector2(w,h),cBg));
        f.Add(new MySprite(SpriteType.TEXT,"UNITY SIGNAL",new Vector2(w/2,h/2-60*s),null,cPri,"White",TextAlignment.CENTER,0.8f*s));
        f.Add(new MySprite(SpriteType.TEXT,msg,new Vector2(w/2,h/2-20*s),null,cWrn,"White",TextAlignment.CENTER,0.6f*s));
        f.Add(new MySprite(SpriteType.TEXT,"Compile order: PAD > INV > SIGNAL > BOOT",new Vector2(w/2,h/2+30*s),null,cSec,"Monospace",TextAlignment.CENTER,0.4f*s));
        f.Dispose();}}
        
        void ScanBlocks(){
        localCams.Clear();
        lcdsBySlot.Clear();
        signalLCDs.Clear();
        defenseLCDs.Clear();
        satLCDs.Clear();
        pressureLCDs.Clear();
        padRadios.Clear();
        padLasers.Clear();
        CheckControllerMode();
        var cams=new List<IMyCameraBlock>();
        if(isCtl)GridTerminalSystem.GetBlocksOfType(cams,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains("[PAD"));
        else GridTerminalSystem.GetBlocksOfType(cams,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains(blockTag));
        localCams.AddRange(cams);
        GridTerminalSystem.GetBlocksOfType(padRadios,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains(blockTag));
        GridTerminalSystem.GetBlocksOfType(padLasers,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains(blockTag));
        radioEnabled=0;laserConnected=0;
        foreach(var r in padRadios)if(r.Enabled&&r.EnableBroadcasting)radioEnabled++;
        foreach(var l in padLasers)if(l.Status==MyLaserAntennaStatus.Connected)laserConnected++;
        var lcds=new List<IMyTextPanel>();
        GridTerminalSystem.GetBlocksOfType(lcds,b=>b.CubeGrid==Me.CubeGrid);
        string camsTag=isCtl?"[CTRLCAMS]":$"[PAD{padID}CAMS]";
        string altTag=$"[PAD{padID}CAMS]";
        foreach(var lcd in lcds){
        bool hasTag=lcd.CustomName.Contains(camsTag);
        bool hasAlt=!isCtl?false:lcd.CustomName.Contains(altTag);
        if(!hasTag&&!hasAlt)continue;
        string useTag=hasTag?camsTag:altTag;
        int idx=lcd.CustomName.IndexOf(useTag);
        int colonIdx=lcd.CustomName.IndexOf(':',idx);
        if(colonIdx<0)continue;
        string slotStr="";
        for(int i=colonIdx+1;i<lcd.CustomName.Length;i++){
        char c=lcd.CustomName[i];
        if(char.IsDigit(c))slotStr+=c;
        else break;}
        if(string.IsNullOrEmpty(slotStr))continue;
        var sf=lcd as IMyTextSurface;if(sf==null)continue;
        if(!lcdsBySlot.ContainsKey(slotStr))lcdsBySlot[slotStr]=new List<IMyTextSurface>();
        lcdsBySlot[slotStr].Add(sf);}
        string sigTag=$"[PAD{padID}SIGNAL]";
        string defTag=$"[PAD{padID}DEFENSE]";
        string satTag=$"[PAD{padID}SATS]";
        string prsTag=$"[PAD{padID}PRESSURE]";
        foreach(var lcd in lcds){
        if(lcd.CustomName.Contains(sigTag)){var sf=lcd as IMyTextSurface;if(sf!=null)signalLCDs.Add(sf);}
        if(lcd.CustomName.Contains(defTag)){var sf=lcd as IMyTextSurface;if(sf!=null)defenseLCDs.Add(sf);}
        if(lcd.CustomName.Contains(satTag)){var sf=lcd as IMyTextSurface;if(sf!=null)satLCDs.Add(sf);}
        if(lcd.CustomName.Contains(prsTag)){var sf=lcd as IMyTextSurface;if(sf!=null)pressureLCDs.Add(sf);}}
        ScanDoors();ScanDefense();}
        
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
        if(!doorSets.ContainsKey(ltr))doorSets[ltr]=new DoorSet{state=0,lastChange=tick};
        if(num=='1')doorSets[ltr].ext=d;
        else doorSets[ltr].intD=d;}
        var sensors=new List<IMySensorBlock>();
        GridTerminalSystem.GetBlocksOfType(sensors,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains(blockTag));
        foreach(var s in sensors){
        int ci=s.CustomName.IndexOf(':');
        if(ci<0||ci+2>=s.CustomName.Length)continue;
        char ltr=char.ToUpper(s.CustomName[ci+1]);
        char num=s.CustomName[ci+2];
        if(!char.IsLetter(ltr)||(num!='1'&&num!='2'))continue;
        if(!doorSets.ContainsKey(ltr))continue;
        if(num=='1')doorSets[ltr].senExt=s;
        else doorSets[ltr].senInt=s;
        s.DetectPlayers=true;s.DetectOwner=true;s.DetectFriendly=true;s.DetectNeutral=false;s.DetectEnemy=false;}
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
        
        void UpdateDoors(){
        foreach(var kv in doorSets){
        var ds=kv.Value;
        if(ds.ext==null||ds.intD==null)continue;
        bool eC=ds.ext.Status==DoorStatus.Closed;
        bool iC=ds.intD.Status==DoorStatus.Closed;
        if(!eC){ds.intD.Enabled=false;ds.intD.CloseDoor();}
        else{ds.intD.Enabled=!doorsLocked&&!doorEmergency&&!ds.failed;}
        if(!iC){ds.ext.Enabled=false;ds.ext.CloseDoor();}
        else{ds.ext.Enabled=!doorsLocked&&!doorEmergency&&!ds.failed;}
        if(ds.failed)continue;
        bool eO=ds.ext.Status==DoorStatus.Open;
        bool iO=ds.intD.Status==DoorStatus.Open;
        if(eO&&iO){
        doorEmergency=true;doorsLocked=true;emergencyCount++;
        lastDoorError=$"{kv.Key}:DUAL_BREACH|{tick}";
        IGC.SendBroadcastMessage("UNITY_DOOR_EMERGENCY",$"PAD{padID}|DUAL_BREACH|{kv.Key}");
        ds.ext.CloseDoor();ds.intD.CloseDoor();return;}}
        if(doorsLocked||doorEmergency){foreach(var kv in doorSets){var ds=kv.Value;if(ds.ext!=null){ds.ext.Enabled=false;ds.ext.CloseDoor();}if(ds.intD!=null){ds.intD.Enabled=false;ds.intD.CloseDoor();}}return;}
        foreach(var kv in doorSets){
        var ds=kv.Value;
        if(ds.ext==null||ds.intD==null||ds.failed)continue;
        bool eO=ds.ext.Status==DoorStatus.Open,eC=ds.ext.Status==DoorStatus.Closed;
        bool iO=ds.intD.Status==DoorStatus.Open,iC=ds.intD.Status==DoorStatus.Closed;
        int elapsed=tick-ds.lastChange;
        if(ds.state==1||ds.state==3||ds.state==4||ds.state==6){
        if(elapsed>DOOR_TIMEOUT){ds.retries++;
        if(ds.retries>=DOOR_MAX_RETRY){ds.failed=true;ds.state=0;lastDoorError=$"{kv.Key}:TIMEOUT|{tick}";
        ds.ext.CloseDoor();ds.intD.CloseDoor();continue;}
        ds.lastChange=tick;
        if(ds.state==1)ds.ext.OpenDoor();else if(ds.state==3)ds.ext.CloseDoor();
        else if(ds.state==4)ds.intD.OpenDoor();else if(ds.state==6)ds.intD.CloseDoor();}}
        switch(ds.state){
        case 0:break;
        case 1:if(eO){ds.state=2;ds.holdUntil=tick+DOOR_HOLD;ds.lastChange=tick;ds.retries=0;}break;
        case 2:break;
        case 3:if(eC){ds.state=ds.cycleToInt?4:0;ds.lastChange=tick;ds.retries=0;if(ds.cycleToInt){ds.intD.Enabled=true;ds.intD.OpenDoor();}}break;
        case 4:if(iO){ds.state=5;ds.holdUntil=tick+DOOR_HOLD;ds.lastChange=tick;ds.retries=0;}break;
        case 5:break;
        case 6:if(iC){ds.state=0;ds.cycleToInt=false;ds.lastChange=tick;ds.retries=0;}break;}
        bool senE=ds.senExt!=null&&ds.senExt.IsActive;
        bool senI=ds.senInt!=null&&ds.senInt.IsActive;
        if(ds.state==0&&senE&&iC){ds.cycleToInt=true;ds.ext.Enabled=true;ds.ext.OpenDoor();ds.state=1;ds.lastChange=tick;ds.retries=0;}
        if(ds.state==0&&senI&&eC){ds.intD.Enabled=true;ds.intD.OpenDoor();ds.state=4;ds.lastChange=tick;ds.retries=0;}
        if(ds.state==2&&tick>=ds.holdUntil&&!senE){ds.ext.CloseDoor();ds.state=3;ds.lastChange=tick;}
        if(ds.state==5&&tick>=ds.holdUntil&&!senI){ds.intD.CloseDoor();ds.state=6;ds.lastChange=tick;}}}
        
        bool TryOpenDoor(char ltr,int doorNum){
        if(!doorSets.ContainsKey(ltr))return false;
        var ds=doorSets[ltr];
        if(ds.ext==null||ds.intD==null||ds.failed)return false;
        if(doorsLocked||doorEmergency)return false;
        if(tick-ds.lastChange<DOOR_DEBOUNCE)return false;
        bool eC=ds.ext.Status==DoorStatus.Closed,iC=ds.intD.Status==DoorStatus.Closed;
        if(doorNum==1){if(!iC)return false;ds.ext.Enabled=true;ds.ext.OpenDoor();ds.state=1;ds.lastChange=tick;ds.retries=0;return true;}
        if(doorNum==2){if(!eC)return false;ds.intD.Enabled=true;ds.intD.OpenDoor();ds.state=4;ds.lastChange=tick;ds.retries=0;return true;}
        return false;}
        
        bool TryCloseDoor(char ltr,int doorNum){
        if(!doorSets.ContainsKey(ltr))return false;
        var ds=doorSets[ltr];
        if(ds.failed)return false;
        if(tick-ds.lastChange<DOOR_DEBOUNCE)return false;
        if(doorNum==1&&ds.ext!=null){ds.ext.CloseDoor();ds.state=3;ds.lastChange=tick;ds.retries=0;return true;}
        if(doorNum==2&&ds.intD!=null){ds.intD.CloseDoor();ds.state=6;ds.lastChange=tick;ds.retries=0;return true;}
        return false;}
        
        void ResetDoorEmergency(){
        doorEmergency=false;doorsLocked=false;
        foreach(var kv in doorSets){kv.Value.failed=false;kv.Value.retries=0;kv.Value.state=0;}}
        
        void ScanDefense(){
        weapons.Clear();ammoContainers.Clear();ammoReserves.Clear();
        var guns=new List<IMyUserControllableGun>();
        GridTerminalSystem.GetBlocksOfType(guns,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains(blockTag));
        foreach(var g in guns){
        string tp="OTHER";var nm=g.CustomName.ToUpper();
        if(nm.Contains("GATLING"))tp="GATLING";else if(nm.Contains("MISSILE")||nm.Contains("ROCKET"))tp="MISSILE";
        else if(nm.Contains("INTERIOR"))tp="INTERIOR";else if(nm.Contains("ASSAULT"))tp="ASSAULT";
        else if(nm.Contains("ARTILLERY"))tp="ARTILLERY";else if(nm.Contains("RAILGUN"))tp="RAILGUN";
        weapons.Add(new WeaponData{gun=g,type=tp,name=g.CustomName,ammo=0,active=g.Enabled,firing=false});}
        var cargo=new List<IMyCargoContainer>();
        GridTerminalSystem.GetBlocksOfType(cargo,b=>b.CubeGrid==Me.CubeGrid&&(b.CustomName.Contains("-AMMO")||b.CustomName.Contains(blockTag+"AMMO")));
        ammoContainers.AddRange(cargo);
        foreach(var c in ammoContainers){
        var inv=c.GetInventory();if(inv==null)continue;
        var items=new List<MyInventoryItem>();inv.GetItems(items);
        foreach(var itm in items){string nm=itm.Type.SubtypeId;
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
        foreach(var kv in missiles)if(tick-kv.Value.lastSeen>600)oldMsl.Add(kv.Key);
        foreach(var k in oldMsl){missiles.Remove(k);laserAssign.Remove(k);}
        var oldMnr=new List<long>();
        foreach(var kv in miners)if(tick-kv.Value.lastSeen>600)oldMnr.Add(kv.Key);
        foreach(var k in oldMnr)miners.Remove(k);
        var oldSat=new List<int>();
        foreach(var kv in satellites)if(tick-kv.Value.lastSeen>600)oldSat.Add(kv.Key);
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
        foreach(var ln in lines){
        if(!ln.StartsWith("S:"))continue;
        var pts=ln.Substring(2).Split('|');
        if(pts.Length<6)continue;
        int sid;if(!int.TryParse(pts[0],out sid))continue;
        if(!satellites.ContainsKey(sid))satellites[sid]=new SatData();
        var sat=satellites[sid];sat.lastSeen=tick;
        int.TryParse(pts[1],out sat.gridX);int.TryParse(pts[2],out sat.gridZ);
        int.TryParse(pts[3],out sat.bat);int.TryParse(pts[4],out sat.h2);
        sat.status=pts[5];if(pts.Length>=7)int.TryParse(pts[6],out sat.links);}}
        void BroadcastSatStatus(){
        if(satellites.Count==0)return;
        string msg=$"PAD:{padID}\n";
        foreach(var kv in satellites){var s=kv.Value;msg+=$"S:{kv.Key}|{s.gridX}|{s.gridZ}|{s.bat}|{s.h2}|{s.status}|{s.links}\n";}
        IGC.SendBroadcastMessage("UNITY_SIGNAL_STATUS",msg);}
        int GetMslPriority(MslData m){
        string s=m.status?.ToUpper()??"";
        if(s=="TARGET"||s=="REENTRY"||s=="SAT_INTERCEPT")return 3;
        if(s=="ARM"||s=="COAST")return 2;
        return 1;}
        void UpdateLaserTargets(){
        var claims=new Dictionary<int,List<long>>();
        for(int i=0;i<padLasers.Count;i++)claims[i]=new List<long>();
        foreach(var kv in laserAssign){if(kv.Value<padLasers.Count)claims[kv.Value].Add(kv.Key);}
        foreach(var kv in missiles){
        long mid=kv.Key;var msl=kv.Value;
        if(msl.pos==Vector3D.Zero)continue;
        if(!laserAssign.ContainsKey(mid)){
        int best=-1;
        for(int i=0;i<padLasers.Count;i++){if(claims[i].Count==0){best=i;break;}}
        if(best<0){
        for(int i=0;i<padLasers.Count;i++){
        if(claims[i].Count==0)continue;
        long rival=claims[i][0];
        if(missiles.ContainsKey(rival)){var rm=missiles[rival];
        if(GetMslPriority(msl)>GetMslPriority(rm)){best=i;break;}}}}
        if(best>=0){
        if(claims[best].Count>0){long old=claims[best][0];laserAssign.Remove(old);
        conflicts.Insert(0,$"{tick}|L{best}:MSL-{old%10000}->MSL-{mid%10000}");
        while(conflicts.Count>MAX_CONFLICTS)conflicts.RemoveAt(conflicts.Count-1);}
        laserAssign[mid]=best;claims[best].Clear();claims[best].Add(mid);}}}
        foreach(var kv in laserAssign){
        if(!missiles.ContainsKey(kv.Key))continue;
        var msl=missiles[kv.Key];int idx=kv.Value;
        if(idx<padLasers.Count){var lsr=padLasers[idx];
        lsr.SetTargetCoords($"{msl.pos.X:F0},{msl.pos.Y:F0},{msl.pos.Z:F0}");}}}
        
        void ParseMslBroadcast(string data,MslData msl){
        msl.camNames.Clear();
        var parts=data.Split(',');
        if(parts.Length>=4){
        double x,y,z;
        if(double.TryParse(parts[0],out x)&&double.TryParse(parts[1],out y)&&double.TryParse(parts[2],out z))msl.pos=new Vector3D(x,y,z);
        float d;if(float.TryParse(parts[3],out d))msl.dist=d;}
        if(parts.Length>=5)msl.status=parts[4];else msl.status="UNKNOWN";
        int camsIdx=data.IndexOf("|CAMS:");
        if(camsIdx<0){msl.camCount=0;return;}
        string camPart=data.Substring(camsIdx+6);
        var camParts=camPart.Split('|');
        if(camParts.Length<1){msl.camCount=0;return;}
        int cnt;if(!int.TryParse(camParts[0],out cnt))cnt=0;
        msl.camCount=cnt;
        if(camParts.Length>=2&&cnt>0){
        var names=camParts[1].Split(',');
        foreach(var n in names)if(!string.IsNullOrEmpty(n))msl.camNames.Add(n);}}
        
        void ParseMinerBroadcast(string data,MinerData mnr){
        mnr.camIds.Clear();
        var parts=data.Split('|');
        if(parts.Length<3)return;
        mnr.shipName=parts[2];
        if(parts.Length>=11)mnr.status=parts[10];
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
        if(msl.camCount>0){
        foreach(var cn in msl.camNames){
        allCams.Add(new CamEntry{name=cn,type="MISSILE",status=msl.status,entityId=kv.Key,slot=0,dist=d});}
        if(msl.camNames.Count<msl.camCount){
        for(int i=msl.camNames.Count;i<msl.camCount;i++){
        allCams.Add(new CamEntry{name="Cam "+(i+1),type="MISSILE",status=msl.status,entityId=kv.Key,slot=0,dist=d});}}}}
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
        try{DrawPressureLCD(sf);}catch{}}}
        
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
        int extO=0,intO=0;foreach(var kv in doorSets){var ds=kv.Value;if(ds.ext!=null&&ds.ext.Status==DoorStatus.Open)extO++;if(ds.intD!=null&&ds.intD.Status==DoorStatus.Open)intO++;}
        Color dCol=doorEmergency?cErr:extO==0?cOK:cErr;
        string dStat=doorEmergency?"[EMERGENCY]":doorsLocked?"[LOCKED]":"";
        f.Add(new MySprite(SpriteType.TEXT,$"Doors: {doorSets.Count} sets | Ext:{extO} Int:{intO} {dStat}",new Vector2(30*s,y),null,dCol,"Monospace",TextAlignment.LEFT,0.35f*fs));
        y+=18*ys;
        foreach(var kv in doorSets){
        var ds=kv.Value;
        string eS=ds.ext!=null?(ds.ext.Status==DoorStatus.Open?"O":"â– "):"?";
        string iS=ds.intD!=null?(ds.intD.Status==DoorStatus.Open?"O":"â– "):"?";
        float vPrs=ds.vent!=null?ds.vent.GetOxygenLevel()*100:0;
        string fS=ds.failed?"!":"";
        Color dc=ds.failed?cErr:eS=="O"||iS=="O"?cWrn:cOK;
        f.Add(new MySprite(SpriteType.TEXT,$"{kv.Key}:[{eS}{iS}]{fS} {vPrs:F0}%",new Vector2(30*s+(doorSets.Count>4?(kv.Key-'A')%4*60*s:0),y),null,dc,"Monospace",TextAlignment.LEFT,0.3f*fs));
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
        foreach(var kv in ammoReserves){if(shown>=4)break;
        f.Add(new MySprite(SpriteType.TEXT,$"{kv.Key}: {kv.Value:N0}",new Vector2(30*s,y),null,cTxt,"Monospace",TextAlignment.LEFT,0.3f*fs));
        y+=16*ys;shown++;}
        if(ammoReserves.Count==0)f.Add(new MySprite(SpriteType.TEXT,"No -AMMO containers",new Vector2(30*s,y),null,cSec,"Monospace",TextAlignment.LEFT,0.3f*fs));
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
        int extO=0,intO=0;foreach(var kv in doorSets){var ds=kv.Value;if(ds.ext!=null&&ds.ext.Status==DoorStatus.Open)extO++;if(ds.intD!=null&&ds.intD.Status==DoorStatus.Open)intO++;}
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
        bool eO=ds.ext!=null&&ds.ext.Status==DoorStatus.Open;
        bool eC=ds.ext!=null&&ds.ext.Status==DoorStatus.Closed;
        bool iO=ds.intD!=null&&ds.intD.Status==DoorStatus.Open;
        bool iC=ds.intD!=null&&ds.intD.Status==DoorStatus.Closed;
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
        
        void UpdateEcho(){
        Echo("=== UNITY SIGNAL v01.00 ===");
        Echo($"Mode: {(isCtl?"CONTROLLER":"PAD "+padID)}");
        Echo($"Boot: {(bootComplete?"OK":"WAIT")} | Sess: {(padSession!=""?padSession.Substring(0,Math.Min(6,padSession.Length)):"---")}");
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
        Echo("--- PRESSURIZATION ---");
        Echo($"Overall: {overallPressure:F0}% | Doors: {doorSets.Count}");
        Echo($"Locked: {doorsLocked} | Emrg: {doorEmergency}");
        if(doorEmergency)Echo($"!! DUAL BREACH DETECTED !!");
        Echo("");
        Echo("--- DEFENSE ---");
        Echo($"Weapons: {weapons.Count} | Armed: {defenseArmed}");
        Echo($"Firing: {weaponFiring} | Ammo: {ammoContainers.Count}");
        Echo($"Tick:{tick} | RESCAN | RESET");
        }
        
    }
}
