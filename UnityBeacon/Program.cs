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
        float lcdW=512,lcdH=512,lcdS=1,lcdYS=1;
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
        List<IMyCargoContainer> crgs=new List<IMyCargoContainer>();
        List<IMyShipDrill> drls=new List<IMyShipDrill>();
        List<IMyShipGrinder> grnds=new List<IMyShipGrinder>();
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
        if(homePos==Vector3D.Zero&&rc!=null)homePos=rc.GetPosition();
        }
        
        void ParseConfig(){
        string data=Me.CustomData;
        if(string.IsNullOrEmpty(data)||!data.Contains("[MINER_BEACON]")){
        Me.CustomData=$"[MINER_BEACON]\nShipName=Miner\nChannel=MINER_BEACON\nBlockTag=[BEACON]\nHomeGPS=0,0,0\n\n=== SETUP ===\nTag these blocks with {blockTag}:\n- 1x Remote Control (required)\n- 1x Connector (for docking)\n- 1x Antenna (for broadcast)\n- 1x LCD (optional status display)\n\nCommands: SETUP, RESCAN, SETHOME, RESET";
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
        else if(key=="HomeGPS"){
        if(val.Contains(":")){var p=val.Split(':');if(p.Length>=5){double x,y,z;if(double.TryParse(p[2],out x)&&double.TryParse(p[3],out y)&&double.TryParse(p[4],out z))homePos=new Vector3D(x,y,z);}}
        else{var c=val.Split(',');if(c.Length>=3){double x,y,z;if(double.TryParse(c[0],out x)&&double.TryParse(c[1],out y)&&double.TryParse(c[2],out z))homePos=new Vector3D(x,y,z);}}}}}
        
        
        void Scan(){
        bats.Clear();h2s.Clear();crgs.Clear();drls.Clear();grnds.Clear();
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
        if(b is IMyGasTank){var t=b as IMyGasTank;if(t.BlockDefinition.SubtypeId.Contains("Hydrogen"))h2s.Add(t);}
        if(b is IMyCargoContainer)crgs.Add(b as IMyCargoContainer);
        if(b is IMyShipDrill)drls.Add(b as IMyShipDrill);
        if(b is IMyShipGrinder)grnds.Add(b as IMyShipGrinder);
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
        if(tick%3==0)Broadcast();
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
        int named=0;
        foreach(var b in blks){
        if(b.CustomName.Contains(blockTag))continue;
        if(b is IMyRemoteControl&&rc==null){b.CustomName=$"{blockTag} {b.CustomName}";rc=b as IMyRemoteControl;named++;}
        else if(b is IMyShipConnector&&con==null&&!b.CustomName.ToUpper().Contains("EJECTOR")){b.CustomName=$"{blockTag} {b.CustomName}";con=b as IMyShipConnector;named++;}
        else if(b is IMyRadioAntenna&&ant==null){b.CustomName=$"{blockTag} {b.CustomName}";ant=b as IMyRadioAntenna;named++;}
        else if(b is IMyTextPanel&&lcd==null){b.CustomName=$"{blockTag} {b.CustomName}";lcd=b as IMyTextPanel;named++;}}
        Scan();
        Echo($"Auto-named {named} blocks with {blockTag}");}
        
        void SaveConfig(){
        Me.CustomData=$"[MINER_BEACON]\nShipName={shipName}\nChannel={bcTag}\nBlockTag={blockTag}\nHomeGPS={homePos.X:F0},{homePos.Y:F0},{homePos.Z:F0}\n\n=== SETUP ===\nTag these blocks with {blockTag}:\n- 1x Remote Control (required)\n- 1x Connector (for docking)\n- 1x Antenna (for broadcast)\n- 1x LCD (optional status display)\n\nCommands: SETUP, RESCAN, SETHOME, RESET";}
        
        void Broadcast(){
        if(ant==null||!ant.Enabled)return;
        long eid=Me.CubeGrid.EntityId;
        float batPct=0;
        if(bats.Count>0){float c=0,m=0;foreach(var b in bats){c+=b.CurrentStoredPower;m+=b.MaxStoredPower;}batPct=m>0?(c/m)*100:0;}
        float crgPct=0;
        if(crgs.Count>0){float c=0,m=0;foreach(var g in crgs){var inv=g.GetInventory();if(inv!=null){c+=(float)inv.CurrentVolume;m+=(float)inv.MaxVolume;}}crgPct=m>0?(c/m)*100:0;}
        float h2Pct=0;
        if(h2s.Count>0){float t=0;foreach(var h in h2s)t+=(float)h.FilledRatio;h2Pct=(t/h2s.Count)*100;}
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
        string msg=$"MB|{eid}|{shipName}|{batPct:F0}|{crgPct:F0}|{h2Pct:F0}|{pos.X:F0},{pos.Y:F0},{pos.Z:F0}|{spd:F0}|{alt:F0}|{distHome:F0}|{status}|{drls.Count}|{drlOn}|{grnds.Count}|{grndOn}|{(docked?"1":"0")}|{outboundSecs:F0}|{returnSecs:F0}|{cycles}|{etaSecs:F0}|{(outbound?"1":"0")}";
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
        if(docked)return"DOCKED";
        if(drlOn>0&&spd<2)return"DRILLING";
        if(drlOn>0)return"DRILL_MOVE";
        if(grndOn>0&&spd<2)return"GRINDING";
        if(grndOn>0)return"GRIND_MOVE";
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
        double spd=0,alt=0,dist=0;
        bool docked=con!=null&&con.Status==MyShipConnectorStatus.Connected;
        if(rc!=null){spd=rc.GetShipVelocities().LinearVelocity.Length();rc.TryGetPlanetElevation(MyPlanetElevation.Surface,out alt);dist=homePos!=Vector3D.Zero?Vector3D.Distance(rc.GetPosition(),homePos):0;}
        int drlOn=0;foreach(var d in drls)if(d.Enabled)drlOn++;
        int grndOn=0;foreach(var g in grnds)if(g.Enabled)grndOn++;
        string st=InferStatus(docked,drlOn,grndOn,spd,dist);
        Color hc=st=="DOCKED"?cOK:st.Contains("DRILL")?cAcc:st.Contains("GRIND")?cWrn:cPri;
        var f=BL(sf);float y=5;
        SH(f,y,shipName,hc);y+=35;
        ST(f,256,y,st,hc,0.7f,TextAlignment.CENTER);y+=30;
        float bp=batPct/100f,cp=crgPct/100f,hp=h2Pct/100f;
        SLB(f,20,y,280,10,"Battery",bp,PctCol(bp),cBdr);y+=22;
        SLB(f,20,y,280,10,"Cargo",cp,PctCol(cp),cBdr);y+=22;
        SLB(f,20,y,280,10,"Hydrogen",hp,PctCol(hp),cBdr);y+=22;
        SD(f,y);y+=8;
        ST(f,20,y,$"Speed: {spd:F0} m/s",cTxt,0.45f);y+=18;
        ST(f,20,y,$"Altitude: {alt:F0} m",cTxt,0.45f);y+=18;
        ST(f,20,y,$"Distance: {dist:F0} m",cTxt,0.45f);y+=18;
        ST(f,20,y,$"Drills: {drlOn}/{drls.Count}   Grinders: {grndOn}/{grnds.Count}",cTxt,0.45f);y+=18;
        if(cycles>0||outboundSecs>0||returnSecs>0){
        SD(f,y);y+=8;
        ST(f,20,y,$"Cycles: {cycles}",cAcc,0.45f);y+=18;
        if(outboundSecs>0){ST(f,20,y,$"To Job: {FmtSec(outboundSecs)}",cTxt,0.45f);y+=18;}
        if(returnSecs>0){ST(f,20,y,$"Return: {FmtSec(returnSecs)}",cTxt,0.45f);y+=18;}
        double eta=CalcETA(st);
        if(eta>0)ST(f,20,y,$"ETA: {FmtSec(eta)}",cOK,0.45f);}
        f.Dispose();}
        
        string FmtSec(double s){if(s<60)return$"{s:F0}s";if(s<3600)return$"{(int)(s/60)}:{(int)(s%60):D2}";return$"{(int)(s/3600)}:{(int)((s%3600)/60):D2}:{(int)(s%60):D2}";}
        
        MySpriteDrawFrame BL(IMyTextSurface s){s.ContentType=ContentType.SCRIPT;s.Script="";lcdW=s.SurfaceSize.X;lcdH=s.SurfaceSize.Y;lcdS=lcdW/512f;lcdYS=lcdH/512f;var f=s.DrawFrame();f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(lcdW/2,lcdH/2),new Vector2(lcdW,lcdH),cBg));return f;}
        void SH(MySpriteDrawFrame f,float y,string t,Color c){float cy=y*lcdYS,cx=lcdW/2;f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,cy+12*lcdYS),new Vector2(lcdW-12*lcdS,24*lcdYS),c*0.3f));f.Add(new MySprite(SpriteType.TEXT,t,new Vector2(cx,cy),null,c,"White",TextAlignment.CENTER,0.8f*lcdS));f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(cx,cy+24*lcdYS),new Vector2(lcdW-32*lcdS,2*lcdYS),c));}
        void SB(MySpriteDrawFrame f,float x,float y,float w,float h,float pct,Color fg,Color bg){x*=lcdS;y*=lcdYS;w*=lcdS;h*=lcdYS;f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+w/2,y+h/2),new Vector2(w,h),bg));float fw=w*Math.Max(0,Math.Min(1,pct));if(fw>1)f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(x+fw/2,y+h/2),new Vector2(fw,h),fg));}
        void SLB(MySpriteDrawFrame f,float x,float y,float w,float h,string lbl,float pct,Color fg,Color bg){float sx=x*lcdS,sy=y*lcdYS,sw=w*lcdS;f.Add(new MySprite(SpriteType.TEXT,lbl,new Vector2(sx,sy-2*lcdYS),null,cTxt,"Monospace",TextAlignment.LEFT,0.45f*lcdS));SB(f,x+80,y,w,h,pct,fg,bg);f.Add(new MySprite(SpriteType.TEXT,$"{pct*100:0}%",new Vector2(sx+sw+90*lcdS,sy-2*lcdYS),null,fg,"Monospace",TextAlignment.LEFT,0.45f*lcdS));}
        void ST(MySpriteDrawFrame f,float x,float y,string t,Color c,float sz=0.5f,TextAlignment a=TextAlignment.LEFT){f.Add(new MySprite(SpriteType.TEXT,t,new Vector2(x*lcdS,y*lcdYS),null,c,"Monospace",a,sz*lcdS));}
        Color PctCol(float p){return p>.7f?cOK:p>.3f?cWrn:cErr;}
        void SD(MySpriteDrawFrame f,float y){f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(lcdW/2,y*lcdYS),new Vector2(lcdW-32*lcdS,1*lcdYS),cSec));}
        
    }
}
