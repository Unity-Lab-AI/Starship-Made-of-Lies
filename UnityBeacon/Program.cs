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
    {        string bcTag="MINER_BEACON";
        string shipName="Miner";
        string blockTag="[BEACON]";
        int padID=1;
        float lcdW=512,lcdH=512,lcdS=1,lcdYS=1,fntS=1;
        Color cPri=new Color(0,180,255);Color cSec=new Color(100,100,100);Color cAcc=new Color(255,200,0);
        Color cOK=new Color(0,255,100);Color cWrn=new Color(255,180,0);Color cErr=new Color(255,60,60);
        Color cBg=new Color(10,10,15);Color cBdr=new Color(40,40,50);Color cTxt=new Color(220,220,220);
        Vector3D homePos=Vector3D.Zero;
        IMyRemoteControl rc;
        IMyShipConnector con;
        IMyRadioAntenna ant;
        IMyTextPanel lcd;
        List<IMyBatteryBlock> bats=new List<IMyBatteryBlock>();
        List<IMyGasTank> h2s=new List<IMyGasTank>();
        List<IMyGasTank> o2s=new List<IMyGasTank>();
        List<IMyReactor> reacts=new List<IMyReactor>();
        List<IMyCargoContainer> crgs=new List<IMyCargoContainer>();
        List<IMyShipDrill> drls=new List<IMyShipDrill>();
        List<IMyShipGrinder> grnds=new List<IMyShipGrinder>();
        List<IMyGasGenerator> gens=new List<IMyGasGenerator>();
        List<IMyCameraBlock> cams=new List<IMyCameraBlock>();
        int tick=0;
        bool setupDone=false;
        string prevStatus="";
        double elapsedSecs=0;
        double departAt=0,jobArriveAt=0,returnStartAt=0;
        double outboundSecs,returnSecs,jobSecs;
        int cycles;
        bool outbound;
        float lastCargo;
        
        public Program(){
        Runtime.UpdateFrequency=UpdateFrequency.Update100;
        ParseConfig();
        Scan();
        NameCameras();
        if(homePos==Vector3D.Zero&&rc!=null)homePos=rc.GetPosition();
        }
        void NameCameras(){
        string camTag=$"[PAD{padID}]";
        foreach(var c in cams){if(!c.CustomName.Contains(camTag))c.CustomName=$"{camTag} {shipName} Cam";}
        }
        
        void ParseConfig(){
        string data=Me.CustomData;
        if(string.IsNullOrEmpty(data)||!data.Contains("[MINER_BEACON]")){
        Me.CustomData=$"[MINER_BEACON]\nShipName=Miner\nChannel=MINER_BEACON\nBlockTag=[BEACON]\nPadID=1\nHomeGPS=0,0,0\n\n=== SETUP ===\nTag these blocks with {blockTag}:\n- 1x Remote Control (required)\n- 1x Connector (for docking)\n- 1x Antenna (for broadcast)\n- 1x LCD (optional status display)\n\nCameras will be auto-named [PAD{padID}] {shipName} Cam\n\nCommands: SETUP, RESCAN, SETHOME, RESET";
        return;}
        var lines=data.Split('\n');
        foreach(var line in lines){
        if(line.StartsWith("==="))break;
        var parts=line.Split('=');
        if(parts.Length<2)continue;
        string key=parts[0].Trim();
        string val=parts[1].Trim();
        if(key=="ShipName")shipName=val;
        else if(key=="Channel")bcTag=val;
        else if(key=="BlockTag")blockTag=val;
        else if(key=="PadID"){int p;if(int.TryParse(val,out p))padID=p;}
        else if(key=="HomeGPS"){
        if(val.Contains(":")){var p=val.Split(':');if(p.Length>=5){double x,y,z;if(double.TryParse(p[2],out x)&&double.TryParse(p[3],out y)&&double.TryParse(p[4],out z))homePos=new Vector3D(x,y,z);}}
        else{var c=val.Split(',');if(c.Length>=3){double x,y,z;if(double.TryParse(c[0],out x)&&double.TryParse(c[1],out y)&&double.TryParse(c[2],out z))homePos=new Vector3D(x,y,z);}}}}}
        
        
        void Scan(){
        bats.Clear();h2s.Clear();o2s.Clear();reacts.Clear();crgs.Clear();drls.Clear();grnds.Clear();gens.Clear();cams.Clear();
        rc=null;con=null;ant=null;lcd=null;
        var tagged=new List<IMyTerminalBlock>();
        GridTerminalSystem.GetBlocksOfType(tagged,b=>b.CubeGrid==Me.CubeGrid&&b.CustomName.Contains(blockTag));
        foreach(var b in tagged){
        if(b is IMyRemoteControl&&rc==null)rc=b as IMyRemoteControl;
        if(b is IMyShipConnector&&con==null)con=b as IMyShipConnector;
        if(b is IMyRadioAntenna&&ant==null)ant=b as IMyRadioAntenna;
        if(b is IMyTextPanel&&lcd==null)lcd=b as IMyTextPanel;}
        var allBlks=new List<IMyTerminalBlock>();
        GridTerminalSystem.GetBlocksOfType(allBlks,b=>b.CubeGrid==Me.CubeGrid);
        foreach(var b in allBlks){
        if(b is IMyBatteryBlock)bats.Add(b as IMyBatteryBlock);
        if(b is IMyGasTank){var t=b as IMyGasTank;if(t.BlockDefinition.SubtypeId.Contains("Hydrogen"))h2s.Add(t);else o2s.Add(t);}
        if(b is IMyReactor)reacts.Add(b as IMyReactor);
        if(b is IMyCargoContainer)crgs.Add(b as IMyCargoContainer);
        if(b is IMyShipDrill)drls.Add(b as IMyShipDrill);
        if(b is IMyShipGrinder)grnds.Add(b as IMyShipGrinder);
        if(b is IMyGasGenerator)gens.Add(b as IMyGasGenerator);
        if(b is IMyCameraBlock)cams.Add(b as IMyCameraBlock);
        if(b is IMyRemoteControl&&rc==null)rc=b as IMyRemoteControl;
        if(b is IMyRadioAntenna&&ant==null)ant=b as IMyRadioAntenna;
        if(b is IMyShipConnector&&con==null)con=b as IMyShipConnector;
        if(b is IMyTextPanel&&lcd==null)lcd=b as IMyTextPanel;}
        setupDone=rc!=null&&ant!=null;
        if(ant!=null){ant.Enabled=true;ant.EnableBroadcasting=true;ant.Radius=50000f;}}
        
        public void Main(string arg,UpdateType ut){
        tick++;
        elapsedSecs+=Runtime.TimeSinceLastRun.TotalSeconds;
        if(!string.IsNullOrEmpty(arg)){
        string a=arg.ToUpper();
        if(a=="SETHOME"&&rc!=null){homePos=rc.GetPosition();SaveConfig();Echo($"Home set: {homePos.X:F0},{homePos.Y:F0},{homePos.Z:F0}");}
        else if(a=="SETUP")AutoName();
        else if(a=="RESCAN")Scan();
        else if(a=="RESET"){Reset();return;}}
        Echo("Unity Missile System");
        Echo($"UnityBeacon [{shipName}]");
        Echo("---");
        if(!setupDone){Echo($"SETUP INCOMPLETE\nRemote Control: {(rc!=null?"Found":"MISSING")}\nAntenna: {(ant!=null?"Found":"MISSING")}\nRun SETUP command");return;}
        Echo($"Status: Broadcasting on {bcTag}");
        Echo($"Remote Control: {(rc!=null?"Connected":"Missing")}");
        Echo($"Antenna: {(ant!=null?"Online":"Missing")}");
        Echo($"Drills: {drls.Count} Grinders: {grnds.Count}");
        Echo($"Batteries: {bats.Count} H2 Tanks: {h2s.Count}");
        Echo($"Cargo: {crgs.Count} Generators: {gens.Count}");
        Echo($"Cameras: {cams.Count} (PAD{padID})");
        if(homePos!=Vector3D.Zero)Echo($"Home: {homePos.X:F0},{homePos.Y:F0},{homePos.Z:F0}");
        else Echo("Home: NOT SET");
        Echo("--- COMMANDS ---");
        Echo("SETHOME - Set current position as home");
        Echo("SETUP - Auto-name required blocks");
        Echo("RESCAN - Refresh all blocks");
        Echo("RESET - Clear config and restart");
        if(tick%2==0)Broadcast();
        if(tick%10==0)Scan();
        UpdateLCD();}
        
        void Reset(){
        Me.CustomData="";
        homePos=Vector3D.Zero;
        shipName="Miner";
        bcTag="MINER_BEACON";
        blockTag="[BEACON]";
        if(lcd!=null){var sf=lcd as IMyTextSurface;if(sf!=null){sf.ContentType=ContentType.SCRIPT;sf.Script="";}}
        ParseConfig();
        Scan();
        Echo("RESET COMPLETE\nConfig cleared\nLCD cleared\nRun SETUP to reconfigure");}
        
        void AutoName(){
        var blks=new List<IMyTerminalBlock>();
        GridTerminalSystem.GetBlocksOfType(blks,b=>b.CubeGrid==Me.CubeGrid);
        int named=0;int camNamed=0;
        string camTag=$"[PAD{padID}]";
        foreach(var b in blks){
        if(b is IMyCameraBlock){if(!b.CustomName.Contains(camTag)){b.CustomName=$"{camTag} {shipName} Cam";camNamed++;}continue;}
        if(b.CustomName.Contains(blockTag))continue;
        if(b is IMyRemoteControl&&rc==null){b.CustomName=$"{blockTag} {b.CustomName}";rc=b as IMyRemoteControl;named++;}
        else if(b is IMyShipConnector&&con==null&&!b.CustomName.ToUpper().Contains("EJECTOR")){b.CustomName=$"{blockTag} {b.CustomName}";con=b as IMyShipConnector;named++;}
        else if(b is IMyRadioAntenna&&ant==null){b.CustomName=$"{blockTag} {b.CustomName}";ant=b as IMyRadioAntenna;named++;}
        else if(b is IMyTextPanel&&lcd==null){b.CustomName=$"{blockTag} {b.CustomName}";lcd=b as IMyTextPanel;named++;}}
        Scan();
        Echo($"Auto-named {named} blocks with {blockTag}");
        if(camNamed>0)Echo($"Tagged {camNamed} cameras with {camTag}");}
        
        void SaveConfig(){
        Me.CustomData=$"[MINER_BEACON]\nShipName={shipName}\nChannel={bcTag}\nBlockTag={blockTag}\nPadID={padID}\nHomeGPS={homePos.X:F0},{homePos.Y:F0},{homePos.Z:F0}\n\n=== SETUP ===\nTag these blocks with {blockTag}:\n- 1x Remote Control (required)\n- 1x Connector (for docking)\n- 1x Antenna (for broadcast)\n- 1x LCD (optional status display)\n\nCameras will be auto-named [PAD{padID}] {shipName} Cam\n\nCommands: SETUP, RESCAN, SETHOME, RESET";}
        
        void Broadcast(){
        if(ant==null||!ant.Enabled)return;
        long eid=Me.CubeGrid.EntityId;
        float batPct=0;
        if(bats.Count>0){float c=0,m=0;foreach(var b in bats){c+=b.CurrentStoredPower;m+=b.MaxStoredPower;}batPct=m>0?(c/m)*100:0;}
        float crgPct=0;
        if(crgs.Count>0){float c=0,m=0;foreach(var g in crgs){var inv=g.GetInventory();if(inv!=null){c+=(float)inv.CurrentVolume;m+=(float)inv.MaxVolume;}}crgPct=m>0?(c/m)*100:0;}
        float h2Pct=0;
        if(h2s.Count>0){float t=0;foreach(var h in h2s)t+=(float)h.FilledRatio;h2Pct=(t/h2s.Count)*100;}
        float o2Pct=0;
        if(o2s.Count>0){float t=0;foreach(var o in o2s)t+=(float)o.FilledRatio;o2Pct=(t/o2s.Count)*100;}
        int ice=0;foreach(var g in gens){var inv=g.GetInventory();if(inv!=null){var L=new List<MyInventoryItem>();inv.GetItems(L);foreach(var it in L)if(it.Type.SubtypeId=="Ice")ice+=(int)it.Amount;}}
        int urn=0;foreach(var r in reacts){var inv=r.GetInventory();if(inv!=null){var L=new List<MyInventoryItem>();inv.GetItems(L);foreach(var it in L)if(it.Type.SubtypeId.Contains("Uranium"))urn+=(int)it.Amount;}}
        Vector3D pos=rc!=null?rc.GetPosition():Me.GetPosition();
        Vector3D vel=Vector3D.Zero;
        double alt=0;
        if(rc!=null){
        vel=rc.GetShipVelocities().LinearVelocity;
        rc.TryGetPlanetElevation(MyPlanetElevation.Surface,out alt);}
        double spd=vel.Length();
        double distHome=homePos!=Vector3D.Zero?Vector3D.Distance(pos,homePos):0;
        bool docked=con!=null&&con.Status==MyShipConnectorStatus.Connected;
        int drlOn=0;foreach(var d in drls)if(d.Enabled)drlOn++;
        int grndOn=0;foreach(var g in grnds)if(g.Enabled)grndOn++;
        string status=InferStatus(docked,drlOn,grndOn,spd,distHome);
        TrackShuttleCycle(status,crgPct);
        double etaSecs=CalcETA(status);
        string cargo=ScanCargo();
        string camIds="";if(cams.Count>0){foreach(var c in cams)camIds+=(camIds.Length>0?",":"")+c.EntityId.ToString();}
        string msg=$"MB|{eid}|{shipName}|{batPct:F0}|{crgPct:F0}|{h2Pct:F0}|{pos.X:F0},{pos.Y:F0},{pos.Z:F0}|{spd:F0}|{alt:F0}|{distHome:F0}|{status}|{drls.Count}|{drlOn}|{grnds.Count}|{grndOn}|{(docked?"1":"0")}|{outboundSecs:F0}|{returnSecs:F0}|{cycles}|{etaSecs:F0}|{(outbound?"1":"0")}|FUEL:{o2Pct:F0},{ice},{urn},{o2s.Count},{gens.Count},{reacts.Count}|CARGO:{cargo}|CAMS:{camIds}";
        IGC.SendBroadcastMessage(bcTag,msg);}
        
        void TrackShuttleCycle(string newSt,float cargo){
        bool wasD=prevStatus=="DOCKED",nowD=newSt=="DOCKED";
        bool wasJ=prevStatus.Contains("DRILL")||prevStatus.Contains("GRIND"),nowJ=newSt.Contains("DRILL")||newSt.Contains("GRIND");
        bool wasT=prevStatus=="TRAVELING"||prevStatus=="DEPARTING",nowT=newSt=="TRAVELING"||newSt=="DEPARTING";
        if(wasD&&!nowD){departAt=elapsedSecs;outbound=true;}
        if(outbound&&wasT&&nowJ){double ob=elapsedSecs-departAt;if(ob>10)outboundSecs=outboundSecs>0?(outboundSecs*2+ob)/3:ob;jobArriveAt=elapsedSecs;outbound=false;}
        if(wasJ&&nowT&&cargo>70&&lastCargo<=70){returnStartAt=elapsedSecs;}
        if(!wasD&&nowD&&returnStartAt>0){double rt=elapsedSecs-returnStartAt;if(rt>10)returnSecs=returnSecs>0?(returnSecs*2+rt)/3:rt;if(jobArriveAt>0){double jt=returnStartAt-jobArriveAt;if(jt>10)jobSecs=jobSecs>0?(jobSecs*2+jt)/3:jt;}cycles++;returnStartAt=0;}
        prevStatus=newSt;lastCargo=cargo;}
        
        double CalcETA(string status){
        bool trav=status=="TRAVELING"||status=="DEPARTING";
        if(outbound&&trav&&outboundSecs>0){double el=elapsedSecs-departAt;return Math.Max(0,outboundSecs-el);}
        if(!outbound&&trav&&returnSecs>0){double el=elapsedSecs-returnStartAt;return Math.Max(0,returnSecs-el);}
        return 0;}
        
        string InferStatus(bool docked,int drlOn,int grndOn,double spd,double dist){
        if(drlOn>0&&spd<2)return"DRILLING";
        if(drlOn>0)return"DRILL_MOVE";
        if(grndOn>0&&spd<2)return"GRINDING";
        if(grndOn>0)return"GRIND_MOVE";
        if(docked)return"DOCKED";
        if(spd>5&&dist<500)return"DEPARTING";
        if(spd>5||(spd>3&&(prevStatus=="TRAVELING"||prevStatus=="DEPARTING")))return"TRAVELING";
        if(spd<2&&dist<100)return"HOME";
        return"IDLE";}
        
        void UpdateLCD(){
        if(lcd==null)return;
        var sf=lcd as IMyTextSurface;if(sf==null)return;
        float batPct=0;if(bats.Count>0){float c=0,m=0;foreach(var b in bats){c+=b.CurrentStoredPower;m+=b.MaxStoredPower;}batPct=m>0?(c/m)*100:0;}
        float crgPct=0;if(crgs.Count>0){float c=0,m=0;foreach(var g in crgs){var inv=g.GetInventory();if(inv!=null){c+=(float)inv.CurrentVolume;m+=(float)inv.MaxVolume;}}crgPct=m>0?(c/m)*100:0;}
        float h2Pct=0;if(h2s.Count>0){float t=0;foreach(var h in h2s)t+=(float)h.FilledRatio;h2Pct=(t/h2s.Count)*100;}
        float o2Pct=0;if(o2s.Count>0){float t=0;foreach(var o in o2s)t+=(float)o.FilledRatio;o2Pct=(t/o2s.Count)*100;}
        int ice=0;foreach(var g in gens){var inv=g.GetInventory();if(inv!=null){var L=new List<MyInventoryItem>();inv.GetItems(L);foreach(var it in L)if(it.Type.SubtypeId=="Ice")ice+=(int)it.Amount;}}
        foreach(var c in crgs){var inv=c.GetInventory();if(inv!=null){var L=new List<MyInventoryItem>();inv.GetItems(L);foreach(var it in L)if(it.Type.SubtypeId=="Ice")ice+=(int)it.Amount;}}
        int urn=0,crgUrn=0;foreach(var r in reacts){var inv=r.GetInventory();if(inv!=null){var L=new List<MyInventoryItem>();inv.GetItems(L);foreach(var it in L)if(it.Type.SubtypeId.Contains("Uranium"))urn+=(int)it.Amount;}}
        foreach(var c in crgs){var inv=c.GetInventory();if(inv!=null){var L=new List<MyInventoryItem>();inv.GetItems(L);foreach(var it in L)if(it.Type.SubtypeId.Contains("Uranium"))crgUrn+=(int)it.Amount;}}
        double spd=0,alt=0,dist=0;bool hasAlt=false;
        bool docked=con!=null&&con.Status==MyShipConnectorStatus.Connected;
        if(rc!=null){spd=rc.GetShipVelocities().LinearVelocity.Length();hasAlt=rc.TryGetPlanetElevation(MyPlanetElevation.Surface,out alt);dist=homePos!=Vector3D.Zero?Vector3D.Distance(rc.GetPosition(),homePos):0;}
        int drlOn=0;foreach(var d in drls)if(d.Enabled)drlOn++;
        int grndOn=0;foreach(var g in grnds)if(g.Enabled)grndOn++;
        string st=InferStatus(docked,drlOn,grndOn,spd,dist);
        Color hc=st=="DOCKED"?cOK:st.Contains("DRILL")?cAcc:st.Contains("GRIND")?cWrn:cPri;
        var f=BL(sf);float y=8;
        SH(f,y,shipName,hc);y+=50;
        ST(f,256,y,st,hc,0.85f,TextAlignment.CENTER);y+=38;
        float bp=batPct/100f,cp=crgPct/100f,hp=h2Pct/100f,op=o2Pct/100f;
        SLB(f,20,y,260,16,"Battery",bp,PctCol(bp),cBdr);y+=50;
        SLB(f,20,y,260,16,"Cargo",cp,PctCol(1-cp),cBdr);y+=50;
        SLB(f,20,y,260,16,"Hydrogen",hp,PctCol(hp),cBdr);y+=50;
        if(o2s.Count>0){SLB(f,20,y,260,16,"Oxygen",op,PctCol(op),cBdr);y+=50;}
        SD(f,y);y+=10;
        ST(f,20,y,$"Generators:{gens.Count}",cTxt,0.45f);ST(f,280,y,$"Ice:{ice}",cTxt,0.45f);y+=26;
        ST(f,20,y,$"Reactors:{reacts.Count}",cTxt,0.45f);ST(f,280,y,$"Uranium:{urn+crgUrn}",cTxt,0.45f);y+=26;
        ST(f,20,y,$"Speed:{spd:F0}m/s",cTxt,0.45f);ST(f,280,y,hasAlt?$"Alt:{alt:F0}m":"Alt:N/A",cTxt,0.45f);y+=26;
        ST(f,20,y,$"Distance:{dist:F0}m",cTxt,0.45f);ST(f,280,y,$"Drills:{drlOn}/{drls.Count}",cTxt,0.45f);y+=26;
        ST(f,20,y,$"Grinders:{grndOn}/{grnds.Count}",cTxt,0.45f);y+=26;
        if(cycles>0||outboundSecs>0||returnSecs>0){
        SD(f,y);y+=8;
        double eta=CalcETA(st);
        ST(f,20,y,$"Cycles:{cycles}  ETA:{(eta>0?FmtSec(eta):"--")}",cAcc,0.5f);y+=26;}
        var cItems=GetCargoItems();
        if(cItems.Count>0&&y<lcdH*0.8f){SD(f,y);y+=8;
        int shown=0;foreach(var kv in cItems){if(shown>=3||y>lcdH-25)break;if(kv.Key.Contains("Ice"))continue;string nm=FmtItem(kv.Key);ST(f,20,y,$"{nm}:{FmtAmt(kv.Value)}",cTxt,0.45f);y+=22;shown++;}}
        f.Dispose();}
        
        Dictionary<string,int> GetCargoItems(){
        var items=new Dictionary<string,int>();
        foreach(var c in crgs){var inv=c.GetInventory();if(inv==null)continue;var list=new List<MyInventoryItem>();inv.GetItems(list);
        foreach(var it in list){string key=$"{GetCat(it.Type.TypeId)}:{it.Type.SubtypeId}";int amt=(int)it.Amount;if(items.ContainsKey(key))items[key]+=amt;else items[key]=amt;}}
        var allInv=new List<IMyTerminalBlock>();GridTerminalSystem.GetBlocksOfType(allInv,b=>b.CubeGrid==Me.CubeGrid&&b.HasInventory&&!(b is IMyCargoContainer));
        foreach(var blk in allInv){for(int i=0;i<blk.InventoryCount;i++){var inv=blk.GetInventory(i);if(inv==null)continue;var list=new List<MyInventoryItem>();inv.GetItems(list);
        foreach(var it in list){string key=$"{GetCat(it.Type.TypeId)}:{it.Type.SubtypeId}";int amt=(int)it.Amount;if(items.ContainsKey(key))items[key]+=amt;else items[key]=amt;}}}
        return items.OrderByDescending(x=>x.Value).ToDictionary(x=>x.Key,x=>x.Value);}
        
        string FmtItem(string key){var p=key.Split(':');if(p.Length<2)return key;return p[1];}
        string FmtAmt(int a){if(a>=1000000)return$"{a/1000000f:F1}M";if(a>=1000)return$"{a/1000f:F1}K";return a.ToString();}
        
        string FmtSec(double s){if(s<60)return$"{s:F0}s";if(s<3600)return$"{(int)(s/60)}:{(int)(s%60):D2}";return$"{(int)(s/3600)}:{(int)((s%3600)/60):D2}:{(int)(s%60):D2}";}
        
        string ScanCargo(){
        var items=new Dictionary<string,int>();
        foreach(var c in crgs){var inv=c.GetInventory();if(inv==null)continue;var list=new List<MyInventoryItem>();inv.GetItems(list);
        foreach(var it in list){string cat=GetCat(it.Type.TypeId);string key=$"{cat}:{it.Type.SubtypeId}";int amt=(int)it.Amount;if(items.ContainsKey(key))items[key]+=amt;else items[key]=amt;}}
        var allInv=new List<IMyTerminalBlock>();GridTerminalSystem.GetBlocksOfType(allInv,b=>b.CubeGrid==Me.CubeGrid&&b.HasInventory&&!(b is IMyCargoContainer));
        foreach(var blk in allInv){for(int i=0;i<blk.InventoryCount;i++){var inv=blk.GetInventory(i);if(inv==null)continue;var list=new List<MyInventoryItem>();inv.GetItems(list);
        foreach(var it in list){string cat=GetCat(it.Type.TypeId);string key=$"{cat}:{it.Type.SubtypeId}";int amt=(int)it.Amount;if(items.ContainsKey(key))items[key]+=amt;else items[key]=amt;}}}
        var sb=new StringBuilder();foreach(var kv in items){if(sb.Length>0)sb.Append(";");sb.Append($"{kv.Key}={kv.Value}");}return sb.ToString();}
        
        string GetCat(string tid){
        if(tid.Contains("Ore"))return"O";
        if(tid.Contains("Ingot"))return"I";
        if(tid.Contains("Component"))return"C";
        if(tid.Contains("PhysicalGunObject"))return"T";
        if(tid.Contains("AmmoMagazine"))return"A";
        if(tid.Contains("GasContainerObject"))return"B";
        if(tid.Contains("OxygenContainerObject"))return"B";
        if(tid.Contains("ConsumableItem"))return"F";
        if(tid.Contains("Datapad"))return"D";
        return"X";}
        
        MySpriteDrawFrame BL(IMyTextSurface s){s.ContentType=ContentType.SCRIPT;s.Script="";lcdW=s.SurfaceSize.X;lcdH=s.SurfaceSize.Y;lcdS=lcdW/512f;lcdYS=lcdH/512f;fntS=Math.Max(1.4f,(lcdS+lcdYS)/2f*1.8f);var f=s.DrawFrame();f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(lcdW/2,lcdH/2),new Vector2(lcdW,lcdH),cBg));return f;}
        void SH(MySpriteDrawFrame f,float y,string t,Color c){float cy=y*lcdYS,cx=lcdW/2;f.Add(new MySprite(SpriteType.TEXT,t,new Vector2(cx,cy),null,c,"White",TextAlignment.CENTER,1.0f*fntS));}
        void SB(MySpriteDrawFrame f,float x,float y,float w,float h,float pct,Color fg,Color bg){x*=lcdS;y*=lcdYS;w*=lcdS;h*=lcdYS;f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+w/2,y+h/2),new Vector2(w,h),bg));float fw=w*Math.Max(0,Math.Min(1,pct));if(fw>0)f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+fw/2,y+h/2),new Vector2(fw,h),fg));}
        void SLB(MySpriteDrawFrame f,float x,float y,float w,float h,string lbl,float pct,Color fg,Color bg){float sx=x*lcdS,sy=y*lcdYS;f.Add(new MySprite(SpriteType.TEXT,lbl,new Vector2(sx,sy),null,cTxt,"Monospace",TextAlignment.LEFT,0.5f*fntS));SB(f,x,y+28,w,h,pct,fg,bg);f.Add(new MySprite(SpriteType.TEXT,$"{pct*100:0}%",new Vector2((x+w+10)*lcdS,(y+26)*lcdYS),null,fg,"Monospace",TextAlignment.LEFT,0.45f*fntS));}
        void ST(MySpriteDrawFrame f,float x,float y,string t,Color c,float sz=0.5f,TextAlignment a=TextAlignment.LEFT){f.Add(new MySprite(SpriteType.TEXT,t,new Vector2(x*lcdS,y*lcdYS),null,c,"Monospace",a,sz*fntS));}
        Color PctCol(float p){return p>.7f?cOK:p>.3f?cWrn:cErr;}
        void SD(MySpriteDrawFrame f,float y){f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(lcdW/2,y*lcdYS),new Vector2(lcdW-32*lcdS,1*lcdYS),cSec));}
        
    }
}
