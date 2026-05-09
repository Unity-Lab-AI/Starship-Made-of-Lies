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
    {        enum NS{IDL,CDN,ARM,DET,ABT,ERR}
        List<IMyWarhead>whs=new List<IMyWarhead>();
        List<IMyTimerBlock>tmrs=new List<IMyTimerBlock>();
        List<IMyShipConnector>cons=new List<IMyShipConnector>();
        List<IMyCargoContainer>crgo=new List<IMyCargoContainer>();
        List<IMyBatteryBlock>bats=new List<IMyBatteryBlock>();
        List<IMyTextPanel>lcds=new List<IMyTextPanel>();
        List<IMyConveyorSorter>srts=new List<IMyConveyorSorter>();
        List<IMyLightingBlock>lgts=new List<IMyLightingBlock>();
        List<IMyButtonPanel>btns=new List<IMyButtonPanel>();
        List<IMyShipMergeBlock>mrgs=new List<IMyShipMergeBlock>();
        IMyShipConnector dockCon;
        IMyShipConnector ammoCon;
        IMyShipMergeBlock merge;
        NS cSt=NS.IDL;
        int cdSec=30;
        int tCnt=0;
        float ejPrg=0f;
        float batPct=0f;
        int whArm=0;
        int whTot=0;
        int detCnt=0;
        bool isSetup=false;
        string cMsg="";
        int msgIdx=0;
        string[]dMsgs=new string[]{
        "KISS YOUR ASS GOODBYE!",
        "SAY HELLO TO MY LITTLE FRIEND",
        "YOU HAVE 30 SECONDS TO COMPLY",
        "NUKE 'EM FROM ORBIT",
        "NOW I AM BECOME DEATH",
        "FIRE IN THE HOLE!",
        "WITNESS ME!",
        "AND BOOM GOES THE DYNAMITE",
        "TIME TO MAKE A CRATER",
        "NUCLEAR WINTER IS COMING",
        "HASTA LA VISTA, BABY",
        "GAME OVER MAN, GAME OVER!",
        "I LOVE THE SMELL OF NAPALM",
        "KABOOM INCOMING",
        "THIS IS THE WAY"
        };
        string[]bigN=new string[]{
        " â–ˆâ–ˆâ–ˆ \nâ–ˆ   â–ˆ\nâ–ˆ   â–ˆ\nâ–ˆ   â–ˆ\n â–ˆâ–ˆâ–ˆ ",
        "  â–ˆ  \n â–ˆâ–ˆ  \n  â–ˆ  \n  â–ˆ  \nâ–ˆâ–ˆâ–ˆ  ",
        "â–ˆâ–ˆâ–ˆâ–ˆ \n    â–ˆ\n â–ˆâ–ˆâ–ˆ \nâ–ˆ    \nâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ",
        "â–ˆâ–ˆâ–ˆâ–ˆ \n    â–ˆ\n â–ˆâ–ˆâ–ˆ \n    â–ˆ\nâ–ˆâ–ˆâ–ˆâ–ˆ ",
        "â–ˆ   â–ˆ\nâ–ˆ   â–ˆ\nâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ\n    â–ˆ\n    â–ˆ",
        "â–ˆâ–ˆâ–ˆâ–ˆâ–ˆ\nâ–ˆ    \nâ–ˆâ–ˆâ–ˆâ–ˆ \n    â–ˆ\nâ–ˆâ–ˆâ–ˆâ–ˆ ",
        " â–ˆâ–ˆâ–ˆ \nâ–ˆ    \nâ–ˆâ–ˆâ–ˆâ–ˆ \nâ–ˆ   â–ˆ\n â–ˆâ–ˆâ–ˆ ",
        "â–ˆâ–ˆâ–ˆâ–ˆâ–ˆ\n    â–ˆ\n   â–ˆ \n  â–ˆ  \n â–ˆ   ",
        " â–ˆâ–ˆâ–ˆ \nâ–ˆ   â–ˆ\n â–ˆâ–ˆâ–ˆ \nâ–ˆ   â–ˆ\n â–ˆâ–ˆâ–ˆ ",
        " â–ˆâ–ˆâ–ˆ \nâ–ˆ   â–ˆ\n â–ˆâ–ˆâ–ˆâ–ˆ\n    â–ˆ\n â–ˆâ–ˆâ–ˆ "
        };
        Random rnd=new Random();
        StringBuilder sb=new StringBuilder();
        public Program(){
        Runtime.UpdateFrequency=UpdateFrequency.Update10;
        DiscBlocks();
        if(whs.Count>0&&cons.Count>0)isSetup=true;
        cMsg=dMsgs[rnd.Next(dMsgs.Length)];
        }
        public void Save(){}
        public void Main(string arg,UpdateType uT){
        if(!string.IsNullOrEmpty(arg)){
        string a=arg.ToUpper().Trim();
        if(a=="SETUP")DoSetup();
        else if(a=="ARM"||a=="START"){if(isSetup)StartCD();else Echo("Run SETUP first");}
        else if(a=="ABORT"||a=="STOP")DoAbort();
        else if(a=="STATUS")UpdAll();
        else if(a=="RESET")DoReset();
        else if(a=="TEST")DoTest();
        }
        if((uT&UpdateType.Update10)!=0){
        tCnt++;
        if(cSt==NS.CDN||cSt==NS.ARM)ProcCD();
        if(tCnt%6==0){UpdBat();UpdAll();}
        }
        }
        void DiscBlocks(){
        whs.Clear();tmrs.Clear();cons.Clear();crgo.Clear();bats.Clear();lcds.Clear();srts.Clear();lgts.Clear();btns.Clear();mrgs.Clear();
        dockCon=null;ammoCon=null;merge=null;
        GridTerminalSystem.GetBlocksOfType(whs,b=>b.IsSameConstructAs(Me));
        GridTerminalSystem.GetBlocksOfType(tmrs,b=>b.IsSameConstructAs(Me));
        GridTerminalSystem.GetBlocksOfType(cons,b=>b.IsSameConstructAs(Me));
        GridTerminalSystem.GetBlocksOfType(crgo,b=>b.IsSameConstructAs(Me));
        GridTerminalSystem.GetBlocksOfType(bats,b=>b.IsSameConstructAs(Me));
        GridTerminalSystem.GetBlocksOfType(lcds,b=>b.IsSameConstructAs(Me));
        GridTerminalSystem.GetBlocksOfType(srts,b=>b.IsSameConstructAs(Me));
        GridTerminalSystem.GetBlocksOfType(lgts,b=>b.IsSameConstructAs(Me));
        GridTerminalSystem.GetBlocksOfType(btns,b=>b.IsSameConstructAs(Me));
        GridTerminalSystem.GetBlocksOfType(mrgs,b=>b.IsSameConstructAs(Me));
        foreach(var c in cons){string n=c.CustomName.ToUpper();if(n.Contains("[DOCK]"))dockCon=c;else if(n.Contains("[AMMO]"))ammoCon=c;}
        if(mrgs.Count>0)merge=mrgs[0];
        whTot=whs.Count;
        }
        void DoSetup(){
        DiscBlocks();
        Me.CustomName="[NUKE] Program";
        int wi=1;foreach(var w in whs){w.CustomName="[NUKE] Warhead "+wi;wi++;}
        int ti=1;foreach(var t in tmrs){t.CustomName="[NUKE] Timer "+ti;ti++;}
        for(int ci=0;ci<cons.Count;ci++){
        if(ci==0){cons[ci].CustomName="[NUKE] [DOCK] Connector";dockCon=cons[ci];}
        else{cons[ci].CustomName="[NUKE] [AMMO] Connector";if(ammoCon==null)ammoCon=cons[ci];}
        }
        int gi=1;foreach(var g in crgo){g.CustomName="[NUKE] Cargo "+gi;gi++;}
        int bi=1;foreach(var b in bats){b.CustomName="[NUKE] Battery "+bi;bi++;}
        int si=1;foreach(var s in srts){s.CustomName="[NUKE] Sorter "+si;si++;}
        int li=1;foreach(var l in lgts){l.CustomName="[NUKE] Light "+li;li++;}
        int pi=1;foreach(var p in btns){p.CustomName="[NUKE] Button "+pi;pi++;}
        foreach(var m in mrgs){m.CustomName="[NUKE] Merge Block";merge=m;}
        if(tmrs.Count>0){var tm=tmrs[0];tm.TriggerDelay=0.1f;tm.Silent=true;}
        string[]lcdN=new string[]{"LCD 1","LCD 2","LCD 3","LCD 4"};
        for(int i=0;i<lcds.Count;i++){
        lcds[i].CustomName="[NUKE] "+(i<lcdN.Length?lcdN[i]:"LCD "+(i+1));
        lcds[i].ContentType=ContentType.TEXT_AND_IMAGE;
        lcds[i].FontSize=1.0f;
        lcds[i].Font="Monospace";
        }
        isSetup=true;
        cSt=NS.IDL;
        cMsg="SETUP COMPLETE - "+whTot+" WARHEADS";
        UpdAll();
        }
        void StartCD(){
        if(whs.Count==0){cSt=NS.ERR;cMsg="NO WARHEADS FOUND!";return;}
        if(cons.Count==0){cSt=NS.ERR;cMsg="NO CONNECTOR FOUND!";return;}
        cSt=NS.CDN;
        cdSec=30;
        ejPrg=0;
        whArm=0;
        cMsg=dMsgs[rnd.Next(dMsgs.Length)];
        msgIdx=rnd.Next(dMsgs.Length);
        foreach(var c in cons){c.ThrowOut=true;}
        foreach(var s in srts){s.Enabled=true;s.DrainAll=true;}
        foreach(var w in whs){w.IsArmed=false;}
        UpdAll();
        }
        void ProcCD(){
        if(cdSec<=0){
        foreach(var w in whs)w.Detonate();
        cSt=NS.DET;
        detCnt++;
        Me.CustomData="DETONATIONS:"+detCnt;
        return;
        }
        if(cdSec<=5){
        whArm=0;
        foreach(var w in whs){
        w.IsArmed=true;
        if(w.IsArmed)whArm++;
        }
        if(whArm>0)cSt=NS.ARM;
        }
        float tCV=0,tMV=0;
        foreach(var c in crgo){
        var inv=c.GetInventory();
        tCV+=(float)inv.CurrentVolume;
        tMV+=(float)inv.MaxVolume;
        }
        ejPrg=tMV>0?(1f-tCV/tMV)*100f:100f;
        foreach(var c in cons){c.ThrowOut=true;}
        foreach(var s in srts){s.DrainAll=true;}
        if(cdSec<=10&&cdSec>5){
        foreach(var l in lgts){l.Color=new Color(255,255,0);l.BlinkIntervalSeconds=0.5f;}
        }else if(cdSec<=5){
        foreach(var l in lgts){l.Color=new Color(255,0,0);l.BlinkIntervalSeconds=0.1f;}
        }
        if(tCnt%6==0){cdSec--;if(cdSec%5==0&&cdSec>0)cMsg=dMsgs[(msgIdx+cdSec/5)%dMsgs.Length];}
        }
        void DoAbort(){
        cSt=NS.ABT;
        cdSec=0;
        whArm=0;
        foreach(var w in whs)w.IsArmed=false;
        foreach(var c in cons)c.ThrowOut=false;
        foreach(var s in srts)s.DrainAll=false;
        foreach(var l in lgts){l.Color=Color.White;l.BlinkIntervalSeconds=0;}
        cMsg="SEQUENCE ABORTED - DISARMED";
        }
        void DoReset(){
        cSt=NS.IDL;
        cdSec=30;
        ejPrg=0;
        whArm=0;
        foreach(var w in whs)w.IsArmed=false;
        foreach(var c in cons)c.ThrowOut=false;
        foreach(var s in srts)s.DrainAll=false;
        foreach(var l in lgts){l.Color=Color.White;l.BlinkIntervalSeconds=0;}
        cMsg="SYSTEM RESET - READY";
        detCnt=0;
        Me.CustomData="";
        }
        void DoTest(){
        cMsg="TEST MODE - NO BOOM";
        cdSec=5;
        ejPrg=75f;
        whArm=0;
        cSt=NS.IDL;
        UpdAll();
        }
        void UpdBat(){
        float cE=0,mE=0;
        foreach(var b in bats){cE+=b.CurrentStoredPower;mE+=b.MaxStoredPower;}
        batPct=mE>0?(cE/mE)*100f:0f;
        }
        void UpdAll(){
        UpdLCD1();UpdLCD2();UpdLCD3();UpdLCD4();
        string st=cSt==NS.IDL?"IDLE":cSt==NS.CDN?"COUNTDOWN":cSt==NS.ARM?"ARMED":cSt==NS.ABT?"ABORTED":"STANDBY";
        string dkSt=dockCon!=null?(dockCon.Status==MyShipConnectorStatus.Connected?"DOCKED":"READY"):"NONE";
        string mrSt=merge!=null?(merge.IsConnected?"MERGED":"READY"):"NONE";
        Echo("â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—");
        Echo("â•‘    UNITY NUKE v1.0    â•‘");
        Echo("â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£");
        Echo("â•‘ Status: "+st.PadRight(13)+"â•‘");
        Echo("â•‘ Warheads: "+whTot.ToString().PadLeft(2)+"/"+whArm.ToString().PadLeft(2)+" armed   â•‘");
        Echo("â•‘ Battery: "+batPct.ToString("F0").PadLeft(3)+"%          â•‘");
        Echo("â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£");
        Echo("â•‘ [DOCK]: "+dkSt.PadRight(13)+"â•‘");
        Echo("â•‘ [AMMO]: "+(ammoCon!=null?"YES":"NO").PadRight(13)+"â•‘");
        Echo("â•‘ Merge:  "+mrSt.PadRight(13)+"â•‘");
        Echo("â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£");
        Echo("â•‘ LCDs:"+lcds.Count.ToString().PadLeft(2)+" Bat:"+bats.Count.ToString().PadLeft(2)+" Lgt:"+lgts.Count.ToString().PadLeft(2)+"  â•‘");
        Echo("â•‘ Cargo:"+crgo.Count.ToString().PadLeft(2)+" Sort:"+srts.Count.ToString().PadLeft(2)+"       â•‘");
        Echo("â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£");
        if(cSt==NS.CDN||cSt==NS.ARM){
        Echo("â•‘ COUNTDOWN: "+cdSec.ToString().PadLeft(2)+"s        â•‘");
        Echo("â•‘ Eject: "+ejPrg.ToString("F0").PadLeft(3)+"%           â•‘");
        }else{
        Echo("â•‘ Commands: SETUP, ARM  â•‘");
        Echo("â•‘ ABORT, RESET, STATUS  â•‘");
        }
        Echo("â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•");
        }
        void UpdLCD1(){
        if(lcds.Count<1)return;
        var lcd=lcds[0];
        sb.Clear();
        if(cSt==NS.ARM){
        sb.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
        sb.AppendLine("â–ˆâ–ˆ  â˜¢â˜¢â˜¢ ARMED â˜¢â˜¢â˜¢  â–ˆâ–ˆ");
        sb.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
        sb.AppendLine("");
        int t=Math.Max(0,cdSec);
        int d1=t/10;int d2=t%10;
        string[]n1=bigN[d1].Split('\n');
        string[]n2=bigN[d2].Split('\n');
        for(int i=0;i<5;i++){sb.AppendLine("    "+n1[i]+"  "+n2[i]);}
        sb.AppendLine("");
        sb.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
        sb.AppendLine("â–ˆâ–ˆ POINT OF NO RETURN â–ˆâ–ˆ");
        sb.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
        lcd.BackgroundColor=tCnt%2==0?new Color(100,0,0):new Color(50,0,0);
        lcd.FontColor=new Color(255,0,0);
        }else if(cSt==NS.CDN){
        sb.AppendLine("=============================");
        sb.AppendLine("     UNITY NUKE SYSTEM");
        sb.AppendLine("=============================");
        sb.AppendLine("");
        int t=Math.Max(0,cdSec);
        int d1=t/10;int d2=t%10;
        string[]n1=bigN[d1].Split('\n');
        string[]n2=bigN[d2].Split('\n');
        for(int i=0;i<5;i++){sb.AppendLine("    "+n1[i]+"  "+n2[i]);}
        sb.AppendLine("");
        sb.AppendLine("  TIME REMAINING: "+t+" SECONDS");
        sb.AppendLine("");
        sb.AppendLine("=============================");
        string pb=DrawBar((30-t)/30f*100f,20);
        sb.AppendLine(" "+pb);
        sb.AppendLine("=============================");
        lcd.BackgroundColor=new Color(40,40,0);
        lcd.FontColor=new Color(255,255,0);
        }else if(cSt==NS.ABT){
        sb.AppendLine("");
        sb.AppendLine("   â–ˆâ–ˆâ–ˆâ–ˆâ–ˆ  â–ˆâ–ˆâ–ˆâ–ˆ  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
        sb.AppendLine("   â–ˆ   â–ˆ  â–ˆ   â–ˆ   â–ˆ  ");
        sb.AppendLine("   â–ˆâ–ˆâ–ˆâ–ˆâ–ˆ  â–ˆâ–ˆâ–ˆâ–ˆ    â–ˆ  ");
        sb.AppendLine("   â–ˆ   â–ˆ  â–ˆ   â–ˆ   â–ˆ  ");
        sb.AppendLine("   â–ˆ   â–ˆ  â–ˆâ–ˆâ–ˆâ–ˆ    â–ˆ  ");
        sb.AppendLine("");
        sb.AppendLine("   SEQUENCE ABORTED");
        }else if(cSt==NS.DET){
        sb.AppendLine("");
        sb.AppendLine("       â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ       ");
        sb.AppendLine("     â–ˆâ–ˆ  BOOM  â–ˆâ–ˆ     ");
        sb.AppendLine("    â–ˆâ–ˆ  â˜¢â˜¢â˜¢â˜¢  â–ˆâ–ˆ    ");
        sb.AppendLine("     â–ˆâ–ˆ  BOOM  â–ˆâ–ˆ     ");
        sb.AppendLine("       â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ       ");
        sb.AppendLine("");
        sb.AppendLine("   DETONATION COMPLETE");
        }else{
        sb.AppendLine("");
        sb.AppendLine("        â•”â•â•â•â•—");
        sb.AppendLine("       â•”â•   â•šâ•—");
        sb.AppendLine("      â•”â•  â˜¢  â•šâ•—");
        sb.AppendLine("     â•”â•       â•šâ•—");
        sb.AppendLine("     â•šâ•â•â•â•â•â•â•â•â•â•");
        sb.AppendLine("");
        sb.AppendLine("   STATUS: STANDING BY");
        sb.AppendLine("   WARHEADS: "+whTot+" LOADED");
        lcd.BackgroundColor=new Color(0,0,0);
        lcd.FontColor=new Color(0,255,0);
        }
        lcd.WriteText(sb.ToString());
        }
        void UpdLCD2(){
        if(lcds.Count<2)return;
        var lcd=lcds[1];
        sb.Clear();
        sb.AppendLine("=============================");
        sb.AppendLine("      POWER STATUS");
        sb.AppendLine("=============================");
        sb.AppendLine("");
        sb.AppendLine("  BATTERY CHARGE");
        sb.AppendLine("");
        string pb=DrawBar(batPct,23);
        sb.AppendLine("  "+pb);
        sb.AppendLine("        "+batPct.ToString("F1")+"%");
        sb.AppendLine("");
        sb.AppendLine("=============================");
        sb.AppendLine("  BATTERIES: "+bats.Count+" FOUND");
        sb.AppendLine("");
        float tIn=0,tOut=0;
        foreach(var b in bats){tIn+=b.CurrentInput;tOut+=b.CurrentOutput;}
        sb.AppendLine("  INPUT:  "+tIn.ToString("F2")+" MW");
        sb.AppendLine("  OUTPUT: "+tOut.ToString("F2")+" MW");
        sb.AppendLine("  NET:    "+(tIn-tOut).ToString("F2")+" MW");
        sb.AppendLine("");
        sb.AppendLine("=============================");
        if(batPct>50)lcd.FontColor=new Color(0,255,0);
        else if(batPct>20)lcd.FontColor=new Color(255,255,0);
        else lcd.FontColor=new Color(255,0,0);
        lcd.WriteText(sb.ToString());
        }
        void UpdLCD3(){
        if(lcds.Count<3)return;
        var lcd=lcds[2];
        sb.Clear();
        if(cSt==NS.ARM||(cSt==NS.CDN&&cdSec<=5)){
        sb.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
        sb.AppendLine("â–ˆâ–ˆ â˜ â˜ â˜  WARHEADS â˜ â˜ â˜  â–ˆâ–ˆ");
        sb.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
        sb.AppendLine("");
        sb.AppendLine("  â–ˆâ–ˆâ–ˆ  â–ˆâ–ˆâ–ˆâ–ˆ  â–ˆ   â–ˆ â–ˆâ–ˆâ–ˆâ–ˆâ–ˆ â–ˆâ–ˆâ–ˆâ–ˆ");
        sb.AppendLine("  â–ˆ  â–ˆ â–ˆ   â–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆ     â–ˆ   â–ˆ");
        sb.AppendLine("  â–ˆâ–ˆâ–ˆ  â–ˆâ–ˆâ–ˆâ–ˆ  â–ˆ â–ˆ â–ˆ â–ˆâ–ˆâ–ˆâ–ˆ  â–ˆ   â–ˆ");
        sb.AppendLine("  â–ˆ  â–ˆ â–ˆ   â–ˆ â–ˆ   â–ˆ â–ˆ     â–ˆ   â–ˆ");
        sb.AppendLine("  â–ˆ  â–ˆ â–ˆ   â–ˆ â–ˆ   â–ˆ â–ˆâ–ˆâ–ˆâ–ˆâ–ˆ â–ˆâ–ˆâ–ˆâ–ˆ");
        sb.AppendLine("");
        sb.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
        sb.AppendLine("â–ˆâ–ˆ    "+whArm+"/"+whTot+" WARHEADS HOT    â–ˆâ–ˆ");
        sb.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
        sb.AppendLine("");
        sb.AppendLine("  EJECT: "+ejPrg.ToString("F0")+"%  DET: "+detCnt);
        lcd.BackgroundColor=tCnt%2==0?new Color(120,0,0):new Color(40,0,0);
        lcd.FontColor=new Color(255,0,0);
        }else if(cSt==NS.CDN){
        sb.AppendLine("=============================");
        sb.AppendLine("     WARHEAD STATUS");
        sb.AppendLine("=============================");
        sb.AppendLine("");
        sb.AppendLine("   â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—");
        sb.AppendLine("   â•‘   ARMING SOON    â•‘");
        sb.AppendLine("   â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•");
        sb.AppendLine("");
        sb.AppendLine("  WARHEADS: "+whTot+" LOADED");
        sb.AppendLine("  ARM IN: "+Math.Max(0,cdSec-5)+" SEC");
        sb.AppendLine("");
        sb.AppendLine("  EJECTION: "+DrawBar(ejPrg,17));
        lcd.BackgroundColor=new Color(60,60,0);
        lcd.FontColor=new Color(255,255,0);
        }else{
        sb.AppendLine("=============================");
        sb.AppendLine("     WARHEAD STATUS");
        sb.AppendLine("=============================");
        sb.AppendLine("");
        sb.AppendLine("   â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—");
        sb.AppendLine("   â•‘      SAFE        â•‘");
        sb.AppendLine("   â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•");
        sb.AppendLine("");
        sb.AppendLine("  WARHEADS: "+whTot+" LOADED");
        sb.AppendLine("  DETONATIONS: "+detCnt);
        lcd.BackgroundColor=new Color(0,0,0);
        lcd.FontColor=new Color(0,255,0);
        }
        lcd.WriteText(sb.ToString());
        }
        void UpdLCD4(){
        if(lcds.Count<4)return;
        var lcd=lcds[3];
        sb.Clear();
        if(cSt==NS.ARM){
        sb.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
        sb.AppendLine("â–ˆâ–ˆ â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢ â–ˆâ–ˆ");
        sb.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
        sb.AppendLine("");
        int pad=(27-cMsg.Length)/2;
        if(pad<0)pad=0;
        sb.AppendLine(new string(' ',pad)+cMsg);
        sb.AppendLine("");
        sb.AppendLine("      â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
        sb.AppendLine("    â–ˆâ–ˆ   GOODBYE   â–ˆâ–ˆ");
        sb.AppendLine("   â–ˆâ–ˆ  CRUEL WORLD  â–ˆâ–ˆ");
        sb.AppendLine("    â–ˆâ–ˆ             â–ˆâ–ˆ");
        sb.AppendLine("      â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
        sb.AppendLine("");
        sb.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
        sb.AppendLine("â–ˆâ–ˆ  NO TURNING BACK NOW  â–ˆâ–ˆ");
        sb.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
        lcd.BackgroundColor=tCnt%2==0?new Color(100,0,0):new Color(30,0,0);
        lcd.FontColor=new Color(255,50,50);
        }else if(cSt==NS.CDN){
        sb.AppendLine("=============================");
        sb.AppendLine("     DEATH APPROACHES");
        sb.AppendLine("=============================");
        sb.AppendLine("");
        int pad=(27-cMsg.Length)/2;
        if(pad<0)pad=0;
        sb.AppendLine(new string(' ',pad)+cMsg);
        sb.AppendLine("");
        sb.AppendLine("          â•”â•â•â•â•—");
        sb.AppendLine("         â•”â•   â•šâ•—");
        sb.AppendLine("        â•”â•  â˜¢  â•šâ•—");
        sb.AppendLine("       â•”â•       â•šâ•—");
        sb.AppendLine("       â•šâ•â•â•â•â•â•â•â•â•â•");
        sb.AppendLine("");
        sb.AppendLine("   COUNTDOWN: "+cdSec+" SECONDS");
        lcd.BackgroundColor=new Color(40,40,0);
        lcd.FontColor=new Color(255,200,0);
        }else{
        sb.AppendLine("");
        sb.AppendLine("=============================");
        sb.AppendLine("");
        int pad=(27-cMsg.Length)/2;
        if(pad<0)pad=0;
        sb.AppendLine(new string(' ',pad)+cMsg);
        sb.AppendLine("");
        sb.AppendLine("=============================");
        sb.AppendLine("");
        sb.AppendLine("          â•”â•â•â•â•—");
        sb.AppendLine("         â•”â•   â•šâ•—");
        sb.AppendLine("        â•”â•  â˜¢  â•šâ•—");
        sb.AppendLine("       â•”â•       â•šâ•—");
        sb.AppendLine("       â•šâ•â•â•â•â•â•â•â•â•â•");
        sb.AppendLine("");
        sb.AppendLine("     AWAITING ORDERS");
        lcd.BackgroundColor=new Color(0,0,0);
        lcd.FontColor=new Color(200,200,200);
        }
        lcd.WriteText(sb.ToString());
        }
        string DrawBar(float pct,int len){
        pct=Math.Max(0,Math.Min(100,pct));
        int filled=(int)(pct/100f*len);
        int empty=len-filled;
        return"["+new string('#',filled)+new string('-',empty)+"]";
        }
        
    }
}
