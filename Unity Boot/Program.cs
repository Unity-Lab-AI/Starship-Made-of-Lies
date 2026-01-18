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
    {        int padID=1;int tick=0;
        bool bootDone=false;int bootStep=0;int bootTicks=0;string bootError="";int bootErrTicks=0;string bootStatus="Initializing...";
        int bootSiblings=0;bool bootHasCtrl=false;bool preBootDone=false;bool padReady=false,invReady=false;
        int minerCount=0;string minerNames="";bool beaconOptional=true;
        IMyBroadcastListener beaconL;
        string[] noMinerErrs={"Miners AWOL","No beacons found","Fleet ghosted you"};
        string[] sysChecks={"Initializing Core","Scanning Grid","Button Panel","Detecting LCDs","IGC Channels","Request Pad Status","Await Pad Response","Validate Pad Merge","Validate Pad Power","Validate Pad Fuel","Request Inv Status","Await Inv Response","Validate Inv Cargo","Validate Inv Refinery","Validate Inv Assembler","Validate Inv Gas","Cross-Validate","Module Sync","Write Config","Beacon Detection","System Ready"};
        float lcdW=512,lcdH=512,lcdS=1;
        string padTag="[PAD1";
        IMyButtonPanel btn;
        IMyShipConnector con1,con2;
        IMyTextSurface lcd1,lcd2,lcd3,lcd4,lcd5,lcd6,lcd7,lcd8,lcd9,lcd10;
        IMyBroadcastListener bootRspL;
        Color cPri=new Color(0,180,255);Color cSec=new Color(100,100,100);Color cAcc=new Color(255,200,0);
        Color cOK=new Color(0,255,100);Color cWrn=new Color(255,180,0);Color cErr=new Color(255,60,60);
        Color cBg=new Color(10,10,15);Color cBdr=new Color(40,40,50);Color cTxt=new Color(220,220,220);
        bool padRequested=false,padResponded=false,invRequested=false,invResponded=false;
        string padRspData="",invRspData="";
        int padMergeC=0,padConC=0,padBatC=0,padH2C=0,padO2C=0,padPrtC=0;
        int invCargoC=0,invRefC=0,invAsmC=0,invGenC=0,invH2C=0,invO2C=0;
        int awaitTicks=0;int maxAwait=30;
        
        public Program(){
        Runtime.UpdateFrequency=UpdateFrequency.Update100;
        LoadPadID();
        UpdatePadTag();
        bootRspL=IGC.RegisterBroadcastListener("UNITY_BOOT_RSP");
        beaconL=IGC.RegisterBroadcastListener("MINER_BEACON");
        ScanBlocks();
        WriteReadyFlag("boot_ready");
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
        void WriteReadyFlag(string flag){if(btn==null)return;string cd=btn.CustomData;if(!cd.Contains("[SYSTEM]"))cd="[SYSTEM]\n"+cd;if(cd.Contains(flag+"=false"))cd=cd.Replace(flag+"=false",flag+"=true");else if(!cd.Contains(flag+"="))cd=cd.Replace("[SYSTEM]","[SYSTEM]\n"+flag+"=true");btn.CustomData=cd;}
        void CheckReadyFlags(){
        if(btn==null)return;
        string cd=btn.CustomData;
        padReady=cd.Contains("pad_ready=true");
        invReady=cd.Contains("inv_ready=true");
        beaconOptional=!cd.Contains("beacon_optional=false");
        }
        void ClearBootStatus(){
        if(btn==null)return;
        string cd=btn.CustomData;
        cd=cd.Replace("boot_complete=true","boot_complete=BOOTING").Replace("boot_complete=false","boot_complete=BOOTING");
        cd=cd.Replace("pad_check=request","pad_check=none").Replace("pad_check=done","pad_check=none");
        cd=cd.Replace("inv_check=request","inv_check=none").Replace("inv_check=done","inv_check=none");
        cd=cd.Replace("pad_status=OK","pad_status=waiting").Replace("inv_status=OK","inv_status=waiting");
        cd=cd.Replace("boot_phase=COMPLETE","boot_phase=RUNNING").Replace("boot_phase=WAITING","boot_phase=RUNNING");
        int mc=cd.IndexOf("miner_count=");if(mc>=0){int me=cd.IndexOf("\n",mc);if(me<0)me=cd.Length;cd=cd.Remove(mc,me-mc);cd=cd.Insert(mc,"miner_count=0");}
        int mn=cd.IndexOf("miner_names=");if(mn>=0){int me=cd.IndexOf("\n",mn);if(me<0)me=cd.Length;cd=cd.Remove(mn,me-mn);cd=cd.Insert(mn,"miner_names=");}
        if(!cd.Contains("[SYSTEM]"))cd="[SYSTEM]\nboot_complete=BOOTING\npad_check=none\npad_status=waiting\ninv_check=none\ninv_status=waiting\nminer_count=0\nminer_names=\n"+cd;
        if(!cd.Contains("boot_complete="))cd=cd.Replace("[SYSTEM]","[SYSTEM]\nboot_complete=BOOTING");
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
        lcd1=lcd2=lcd3=lcd4=lcd5=lcd6=lcd7=lcd8=lcd9=lcd10=null;btn=null;con1=con2=null;
        var blks=new List<IMyTerminalBlock>();
        GridTerminalSystem.GetBlocksOfType(blks,b=>b.CustomName.Contains(padTag)||b.CubeGrid==Me.CubeGrid);
        foreach(var b in blks){
        if(b is IMyButtonPanel&&b.CustomName.ToLower().Contains("control")&&btn==null)btn=b as IMyButtonPanel;
        if(b is IMyShipConnector){string nm=b.CustomName;if(nm.Contains("-CON1"))con1=b as IMyShipConnector;else if(nm.Contains("-CON2"))con2=b as IMyShipConnector;}
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
        
        void CheckIGCMessages(){
        while(bootRspL.HasPendingMessage){
        var msg=bootRspL.AcceptMessage();
        string data=msg.Data.ToString();
        if(data.StartsWith("PAD|")){padRspData=data;padResponded=true;ParsePadResponse(data);}
        else if(data.StartsWith("INV|")){invRspData=data;invResponded=true;ParseInvResponse(data);}
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
        
        void WritePadRequest(){
        if(btn==null||padRequested)return;
        string cd=btn.CustomData;
        cd=cd.Replace("pad_check=none","pad_check=request").Replace("pad_check=done","pad_check=request");
        btn.CustomData=cd;
        IGC.SendBroadcastMessage("UNITY_BOOT_REQ","PAD_CHECK");
        padRequested=true;awaitTicks=0;
        }
        
        void WriteInvRequest(){
        if(btn==null||invRequested)return;
        string cd=btn.CustomData;
        cd=cd.Replace("inv_check=none","inv_check=request").Replace("inv_check=done","inv_check=request");
        btn.CustomData=cd;
        IGC.SendBroadcastMessage("UNITY_BOOT_REQ","INV_CHECK");
        invRequested=true;awaitTicks=0;
        }
        
        void CheckCustomDataResponses(){
        if(btn==null)return;
        string cd=btn.CustomData;
        if(!padResponded&&cd.Contains("pad_status=OK:")){int si=cd.IndexOf("pad_status=OK:");if(si>=0){int ei=cd.IndexOf("\n",si);string ln=ei>si?cd.Substring(si,ei-si):cd.Substring(si);padRspData="PAD|OK|"+ln.Substring(14);padResponded=true;ParsePadResponse(padRspData);}}
        if(!invResponded&&cd.Contains("inv_status=OK:")){int si=cd.IndexOf("inv_status=OK:");if(si>=0){int ei=cd.IndexOf("\n",si);string ln=ei>si?cd.Substring(si,ei-si):cd.Substring(si);invRspData="INV|OK|"+ln.Substring(14);invResponded=true;ParseInvResponse(invRspData);}}
        }
        
        void RunBoot(){
        bootTicks++;
        if(btn==null||lcd1==null)ScanBlocks();
        CheckReadyFlags();
        if(!preBootDone){
        if(!padReady||!invReady){
        DrawWaitingScreen();
        Echo("UNITY MISSILE SYSTEM");
        Echo("Waiting for scripts...");
        Echo($"Boot: OK | Pad: {(padReady?"OK":"waiting")} | Inv: {(invReady?"OK":"waiting")}");
        return;
        }
        ClearBootStatus();preBootDone=true;
        }
        CheckIGCMessages();
        CheckCustomDataResponses();
        CheckMinerBeacons();
        if(bootTicks==3){bootSiblings=0;if(con1!=null&&con1.Status==MyShipConnectorStatus.Connected)bootSiblings++;if(con2!=null&&con2.Status==MyShipConnectorStatus.Connected)bootSiblings++;bootHasCtrl=false;}
        int stepDelay=3;int errPause=50;int totalSteps=21;
        if(bootError!=""){bootErrTicks++;if(bootErrTicks>=errPause){bootError="";bootErrTicks=0;}}
        else if(bootTicks>2&&bootStep<totalSteps){
        if((bootStep==6&&!padResponded)||(bootStep==11&&!invResponded)){awaitTicks++;if(awaitTicks<maxAwait){}else{bootError="Timeout waiting for response";}}
        else if(bootTicks%stepDelay==0){string err=RunBootCheck(bootStep);if(err!=""){bootError=err;bootErrTicks=0;}else bootStep++;}}
        if(bootStep>=totalSteps&&bootTicks>stepDelay*(totalSteps+1)){
        Runtime.UpdateFrequency=UpdateFrequency.None;
        WriteBootComplete();
        bootDone=true;
        Echo("UNITY MISSILE SYSTEM");
        Echo("BOOT COMPLETE - Shutting down");
        Echo("LCDs released to operational scripts.");
        Echo("Pad and Inventory taking control.");
        return;
        }
        float pct=(float)bootStep/totalSteps;
        string curCheck=bootStep<21?sysChecks[bootStep]:sysChecks[20];
        if(bootStep==17)curCheck=bootSiblings>0?$"Syncing {bootSiblings} module(s)":"Standalone mode";
        if(bootStep==19)curCheck=minerCount>0?$"Found {minerCount} miner(s)":"Scanning beacons...";
        IMyTextSurface[] padLCDs={lcd1,lcd2,lcd3,lcd7,lcd8};
        IMyTextSurface[] invLCDs={lcd4,lcd5,lcd6,lcd9,lcd10};
        foreach(var lcd in padLCDs){if(lcd!=null)DrawBootScreen(lcd,pct,curCheck,bootStep,totalSteps,true);}
        foreach(var lcd in invLCDs){if(lcd!=null)DrawBootScreen(lcd,pct,curCheck,bootStep,totalSteps,false);}
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
        if(localStep>=21)localStep=20;
        int startIdx=Math.Max(0,localStep-4);
        float ly=180*lcdS;
        for(int i=startIdx;i<=localStep&&i<21;i++){
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
        else if(bootSiblings>0||bootHasCtrl){syncSt=bootStatus!=""?bootStatus:$"PAD {padID} - Module (Synced)";syncC=cOK;}
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
        case 3:int lcdCnt=0;if(lcd1!=null)lcdCnt++;if(lcd2!=null)lcdCnt++;if(lcd3!=null)lcdCnt++;if(lcd4!=null)lcdCnt++;if(lcd5!=null)lcdCnt++;if(lcd6!=null)lcdCnt++;if(lcd7!=null)lcdCnt++;if(lcd8!=null)lcdCnt++;if(lcd9!=null)lcdCnt++;if(lcd10!=null)lcdCnt++;if(lcdCnt<1)return"No LCDs found";bootStatus=$"LCDs: {lcdCnt} found";return"";
        case 4:if(bootRspL==null)return"IGC failed";bootStatus="IGC channels ready";return"";
        case 5:WritePadRequest();bootStatus="Requesting pad status...";return"";
        case 6:if(!padResponded)return"";bootStatus=$"Pad responded OK";return"";
        case 7:bootStatus=$"Pad merge: {padMergeC}";return"";
        case 8:bootStatus=$"Pad power: {padBatC} batteries";return"";
        case 9:bootStatus=$"Pad fuel: {padH2C} H2, {padO2C} O2";return"";
        case 10:WriteInvRequest();bootStatus="Requesting inv status...";return"";
        case 11:if(!invResponded)return"";bootStatus=$"Inv responded OK";return"";
        case 12:bootStatus=$"Inv cargo: {invCargoC}";return"";
        case 13:bootStatus=$"Inv refineries: {invRefC}";return"";
        case 14:bootStatus=$"Inv assemblers: {invAsmC}";return"";
        case 15:bootStatus=$"Inv gas: {invGenC} gens";return"";
        case 16:if(!padResponded||!invResponded)return"Not all systems responded";bootStatus="All systems verified";return"";
        case 17:bootStatus=bootSiblings>0?$"Synced: {bootSiblings} modules":padID==1?"Primary pad":"Standalone";return"";
        case 18:EnsureQuotas();bootStatus="Config written";return"";
        case 19:WriteMinerData();if(minerCount==0&&!beaconOptional)return noMinerErrs[tick%noMinerErrs.Length];bootStatus=minerCount>0?$"Miners: {minerCount}":"No miners (optional)";return"";
        case 20:bootStatus="BOOT COMPLETE";return"";
        default:return"";
        }
        }
        
        void EnsureQuotas(){
        if(btn==null)return;
        string cd=btn.CustomData;
        if(!cd.Contains("[QUOTAS]")){cd+="\n[QUOTAS]\nammo_target=50000\nh2_target=20\no2_target=20\nice_target=1000\nuran_target=50\ntool_target=10\n";}
        if(!cd.Contains("[BLACKBOX]")){cd+="\n[BLACKBOX]\npad_errors=\ninv_errors=\nlast_launch=\n";}
        btn.CustomData=cd;
        }
        
        void WriteBootComplete(){
        if(btn==null)return;
        string cd=btn.CustomData;
        cd=cd.Replace("boot_complete=false","boot_complete=true").Replace("boot_complete=BOOTING","boot_complete=true");
        if(!cd.Contains("boot_complete=true")){
        int si=cd.IndexOf("[SYSTEM]");
        if(si>=0){int ei=cd.IndexOf("\n",si);if(ei<0)ei=si+8;cd=cd.Insert(ei,"\nboot_complete=true");}
        }
        btn.CustomData=cd;
        Echo("Boot complete signal written to CustomData");
        }
        void CheckMinerBeacons(){
        if(beaconL==null)return;
        var miners=new Dictionary<long,string>();
        while(beaconL.HasPendingMessage){var msg=beaconL.AcceptMessage();var parts=msg.Data.ToString().Split('|');if(parts.Length>2&&parts[0]=="MB"){long eid;if(long.TryParse(parts[1],out eid))miners[eid]=parts[2];}}
        minerCount=miners.Count;
        minerNames=string.Join(",",miners.Values);
        }
        void WriteMinerData(){
        if(btn==null)return;
        string cd=btn.CustomData;
        if(!cd.Contains("miner_count="))cd=cd.Replace("[SYSTEM]","[SYSTEM]\nminer_count="+minerCount);else{int mc=cd.IndexOf("miner_count=");if(mc>=0){int me=cd.IndexOf("\n",mc);if(me<0)me=cd.Length;cd=cd.Remove(mc,me-mc);cd=cd.Insert(mc,"miner_count="+minerCount);}}
        if(!cd.Contains("miner_names="))cd=cd.Replace("[SYSTEM]","[SYSTEM]\nminer_names="+minerNames);else{int mn=cd.IndexOf("miner_names=");if(mn>=0){int me=cd.IndexOf("\n",mn);if(me<0)me=cd.Length;cd=cd.Remove(mn,me-mn);cd=cd.Insert(mn,"miner_names="+minerNames);}}
        btn.CustomData=cd;
        }
        void DrawWaitingScreen(){
        IMyTextSurface[] allLCDs={lcd1,lcd2,lcd3,lcd4,lcd5,lcd6,lcd7,lcd8,lcd9,lcd10};
        foreach(var s in allLCDs){
        if(s==null)continue;
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
        f.Add(new MySprite(SpriteType.TEXT,"Compile missing scripts to proceed",new Vector2(cx,lcdH-40*lcdS),null,cTxt,null,TextAlignment.CENTER,0.35f*lcdS));
        f.Dispose();
        }
        }
        
    }
}
