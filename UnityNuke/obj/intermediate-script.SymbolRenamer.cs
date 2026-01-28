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
public class Program : MyGridProgram
{
enum G{A,B,C,D,E,F}
    List<IMyWarhead>H=new List<IMyWarhead>();
    List<IMyTimerBlock>I=new List<IMyTimerBlock>();
    List<IMyShipConnector>J=new List<IMyShipConnector>();
    List<IMyCargoContainer>K=new List<IMyCargoContainer>();
    List<IMyBatteryBlock>L=new List<IMyBatteryBlock>();
    List<IMyTextPanel>M=new List<IMyTextPanel>();
    List<IMyConveyorSorter>N=new List<IMyConveyorSorter>();
    List<IMyLightingBlock>O=new List<IMyLightingBlock>();
    List<IMyButtonPanel>P=new List<IMyButtonPanel>();
    List<IMyShipMergeBlock>Q=new List<IMyShipMergeBlock>();
    IMyShipConnector R,S;
    IMyShipMergeBlock T;
    G U=G.A;
    int V=30,W=0,X=0,Y=0,Z=0,a=0;
    float b=0f,c=0f;
    bool d=false;
    string e="";
    string[]f=new string[]{
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
"THIS IS THE WAY"    },g=new string[]{
" â–ˆâ–ˆâ–ˆ \nâ–ˆ   â–ˆ\nâ–ˆ   â–ˆ\nâ–ˆ   â–ˆ\n â–ˆâ–ˆâ–ˆ ",
"  â–ˆ  \n â–ˆâ–ˆ  \n  â–ˆ  \n  â–ˆ  \nâ–ˆâ–ˆâ–ˆ  ",
"â–ˆâ–ˆâ–ˆâ–ˆ \n    â–ˆ\n â–ˆâ–ˆâ–ˆ \nâ–ˆ    \nâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ",
"â–ˆâ–ˆâ–ˆâ–ˆ \n    â–ˆ\n â–ˆâ–ˆâ–ˆ \n    â–ˆ\nâ–ˆâ–ˆâ–ˆâ–ˆ ",
"â–ˆ   â–ˆ\nâ–ˆ   â–ˆ\nâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ\n    â–ˆ\n    â–ˆ",
"â–ˆâ–ˆâ–ˆâ–ˆâ–ˆ\nâ–ˆ    \nâ–ˆâ–ˆâ–ˆâ–ˆ \n    â–ˆ\nâ–ˆâ–ˆâ–ˆâ–ˆ ",
" â–ˆâ–ˆâ–ˆ \nâ–ˆ    \nâ–ˆâ–ˆâ–ˆâ–ˆ \nâ–ˆ   â–ˆ\n â–ˆâ–ˆâ–ˆ ",
"â–ˆâ–ˆâ–ˆâ–ˆâ–ˆ\n    â–ˆ\n   â–ˆ \n  â–ˆ  \n â–ˆ   ",
" â–ˆâ–ˆâ–ˆ \nâ–ˆ   â–ˆ\n â–ˆâ–ˆâ–ˆ \nâ–ˆ   â–ˆ\n â–ˆâ–ˆâ–ˆ ",
" â–ˆâ–ˆâ–ˆ \nâ–ˆ   â–ˆ\n â–ˆâ–ˆâ–ˆâ–ˆ\n    â–ˆ\n â–ˆâ–ˆâ–ˆ "    };
    Random h=new Random();
    StringBuilder i=new StringBuilder();
    public Program(){
    Runtime.UpdateFrequency=UpdateFrequency.Update10;
    j();
    if(H.Count>0&&J.Count>0)d=true;
    e=f[h.Next(f.Length)];
    }
    public void Save(){}
    public void Main(string k,UpdateType l){
    if(!string.IsNullOrEmpty(k)){
    string m=k.ToUpper().Trim();
    if(m=="SETUP")n();
    else if(m=="ARM"||m=="START"){if(d)o();else Echo("Run SETUP first");}
    else if(m=="ABORT"||m=="STOP")p();
    else if(m=="STATUS")q();
    else if(m=="RESET")r();
    else if(m=="TEST")s();
    }
    if((l&UpdateType.Update10)!=0){
    W++;
    if(U==G.B||U==G.C)t();
    if(W%6==0){u();q();}
    }
    }
    void j(){
    H.Clear();I.Clear();J.Clear();K.Clear();L.Clear();M.Clear();N.Clear();O.Clear();P.Clear();Q.Clear();
    R=null;S=null;T=null;
    GridTerminalSystem.GetBlocksOfType(H,v=>v.IsSameConstructAs(Me));
    GridTerminalSystem.GetBlocksOfType(I,v=>v.IsSameConstructAs(Me));
    GridTerminalSystem.GetBlocksOfType(J,v=>v.IsSameConstructAs(Me));
    GridTerminalSystem.GetBlocksOfType(K,v=>v.IsSameConstructAs(Me));
    GridTerminalSystem.GetBlocksOfType(L,v=>v.IsSameConstructAs(Me));
    GridTerminalSystem.GetBlocksOfType(M,v=>v.IsSameConstructAs(Me));
    GridTerminalSystem.GetBlocksOfType(N,v=>v.IsSameConstructAs(Me));
    GridTerminalSystem.GetBlocksOfType(O,v=>v.IsSameConstructAs(Me));
    GridTerminalSystem.GetBlocksOfType(P,v=>v.IsSameConstructAs(Me));
    GridTerminalSystem.GetBlocksOfType(Q,v=>v.IsSameConstructAs(Me));
    foreach(var w in J){string x=w.CustomName.ToUpper();if(x.Contains("[DOCK]"))R=w;else if(x.Contains("[AMMO]"))S=w;}
    if(Q.Count>0)T=Q[0];
    Y=H.Count;
    }
    void n(){
    j();
    Me.CustomName="[NUKE] Program";
    int y=1;foreach(var z in H){z.CustomName="[NUKE] Warhead "+y;y++;}
    int ª=1;foreach(var µ in I){µ.CustomName="[NUKE] Timer "+ª;ª++;}
    for(int º=0;º<J.Count;º++){
    if(º==0){J[º].CustomName="[NUKE] [DOCK] Connector";R=J[º];}
    else{J[º].CustomName="[NUKE] [AMMO] Connector";if(S==null)S=J[º];}
    }
    int À=1;foreach(var Á in K){Á.CustomName="[NUKE] Cargo "+À;À++;}
    int Â=1;foreach(var v in L){v.CustomName="[NUKE] Battery "+Â;Â++;}
    int Ã=1;foreach(var Ä in N){Ä.CustomName="[NUKE] Sorter "+Ã;Ã++;}
    int Å=1;foreach(var Æ in O){Æ.CustomName="[NUKE] Light "+Å;Å++;}
    int Ç=1;foreach(var È in P){È.CustomName="[NUKE] Button "+Ç;Ç++;}
    foreach(var É in Q){É.CustomName="[NUKE] Merge Block";T=É;}
    if(I.Count>0){var Ê=I[0];Ê.TriggerDelay=0.1f;Ê.Silent=true;}
    string[]Ë=new string[]{"LCD 1","LCD 2","LCD 3","LCD 4"};
    for(int Ì=0;Ì<M.Count;Ì++){
    M[Ì].CustomName="[NUKE] "+(Ì<Ë.Length?Ë[Ì]:"LCD "+(Ì+1));
    M[Ì].ContentType=ContentType.TEXT_AND_IMAGE;
    M[Ì].FontSize=1.0f;
    M[Ì].Font="Monospace";
    }
    d=true;
    U=G.A;
    e="SETUP COMPLETE - "+Y+" WARHEADS";
    q();
    }
    void o(){
    if(H.Count==0){U=G.F;e="NO WARHEADS FOUND!";return;}
    if(J.Count==0){U=G.F;e="NO CONNECTOR FOUND!";return;}
    U=G.B;
    V=30;
    b=0;
    X=0;
    e=f[h.Next(f.Length)];
    a=h.Next(f.Length);
    foreach(var w in J){w.ThrowOut=true;}
    foreach(var Ä in N){Ä.Enabled=true;Ä.DrainAll=true;}
    foreach(var z in H){z.IsArmed=false;}
    q();
    }
    void t(){
    if(V<=0){
    foreach(var z in H)z.Detonate();
    U=G.D;
    Z++;
    Me.CustomData="DETONATIONS:"+Z;
    return;
    }
    if(V<=5){
    X=0;
    foreach(var z in H){
    z.IsArmed=true;
    if(z.IsArmed)X++;
    }
    if(X>0)U=G.C;
    }
    float Í=0,Î=0;
    foreach(var w in K){
    var Ï=w.GetInventory();
    Í+=(float)Ï.CurrentVolume;
    Î+=(float)Ï.MaxVolume;
    }
    b=Î>0?(1f-Í/Î)*100f:100f;
    foreach(var w in J){w.ThrowOut=true;}
    foreach(var Ä in N){Ä.DrainAll=true;}
    if(V<=10&&V>5){
    foreach(var Æ in O){Æ.Color=new Color(255,255,0);Æ.BlinkIntervalSeconds=0.5f;}
    }else if(V<=5){
    foreach(var Æ in O){Æ.Color=new Color(255,0,0);Æ.BlinkIntervalSeconds=0.1f;}
    }
    if(W%6==0){V--;if(V%5==0&&V>0)e=f[(a+V/5)%f.Length];}
    }
    void p(){
    U=G.E;
    V=0;
    X=0;
    foreach(var z in H)z.IsArmed=false;
    foreach(var w in J)w.ThrowOut=false;
    foreach(var Ä in N)Ä.DrainAll=false;
    foreach(var Æ in O){Æ.Color=Color.White;Æ.BlinkIntervalSeconds=0;}
    e="SEQUENCE ABORTED - DISARMED";
    }
    void r(){
    U=G.A;
    V=30;
    b=0;
    X=0;
    foreach(var z in H)z.IsArmed=false;
    foreach(var w in J)w.ThrowOut=false;
    foreach(var Ä in N)Ä.DrainAll=false;
    foreach(var Æ in O){Æ.Color=Color.White;Æ.BlinkIntervalSeconds=0;}
    e="SYSTEM RESET - READY";
    Z=0;
    Me.CustomData="";
    }
    void s(){
    e="TEST MODE - NO BOOM";
    V=5;
    b=75f;
    X=0;
    U=G.A;
    q();
    }
    void u(){
    float Ð=0,Ñ=0;
    foreach(var v in L){Ð+=v.CurrentStoredPower;Ñ+=v.MaxStoredPower;}
    c=Ñ>0?(Ð/Ñ)*100f:0f;
    }
    void q(){
    Ò();Ó();Ô();Õ();
    string Ö=U==G.A?"IDLE":U==G.B?"COUNTDOWN":U==G.C?"ARMED":U==G.E?"ABORTED":"STANDBY";
    string Ø=R!=null?(R.Status==MyShipConnectorStatus.Connected?"DOCKED":"READY"):"NONE";
    string Ù=T!=null?(T.IsConnected?"MERGED":"READY"):"NONE";
    Echo("â•”â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•—");
    Echo("â•‘    UNITY NUKE v1.0    â•‘");
    Echo("â• â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•£");
    Echo("â•‘ Status: "+Ö.PadRight(13)+"â•‘");
    Echo("â•‘ Warheads: "+Y.ToString().PadLeft(2)+"/"+X.ToString().PadLeft(2)+" armed   â•‘");
    Echo("â•‘ Battery: "+c.ToString("F0").PadLeft(3)+"%          â•‘");
    Echo("â• â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•£");
    Echo("â•‘ [DOCK]: "+Ø.PadRight(13)+"â•‘");
    Echo("â•‘ [AMMO]: "+(S!=null?"YES":"NO").PadRight(13)+"â•‘");
    Echo("â•‘ Merge:  "+Ù.PadRight(13)+"â•‘");
    Echo("â• â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•£");
    Echo("â•‘ LCDs:"+M.Count.ToString().PadLeft(2)+" Bat:"+L.Count.ToString().PadLeft(2)+" Lgt:"+O.Count.ToString().PadLeft(2)+"  â•‘");
    Echo("â•‘ Cargo:"+K.Count.ToString().PadLeft(2)+" Sort:"+N.Count.ToString().PadLeft(2)+"       â•‘");
    Echo("â• â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•£");
    if(U==G.B||U==G.C){
    Echo("â•‘ COUNTDOWN: "+V.ToString().PadLeft(2)+"s        â•‘");
    Echo("â•‘ Eject: "+b.ToString("F0").PadLeft(3)+"%           â•‘");
    }else{
    Echo("â•‘ Commands: SETUP, ARM  â•‘");
    Echo("â•‘ ABORT, RESET, STATUS  â•‘");
    }
    Echo("â•šâ•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u009d");
    }
    void Ò(){
    if(M.Count<1)return;
    var Ú=M[0];
    i.Clear();
    if(U==G.C){
    i.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
    i.AppendLine("â–ˆâ–ˆ  â˜¢â˜¢â˜¢ ARMED â˜¢â˜¢â˜¢  â–ˆâ–ˆ");
    i.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
    i.AppendLine("");
    int µ=Math.Max(0,V);
    int Û=µ/10;int Ü=µ%10;
    string[]Ý=g[Û].Split('\n');
    string[]Þ=g[Ü].Split('\n');
    for(int Ì=0;Ì<5;Ì++){i.AppendLine("    "+Ý[Ì]+"  "+Þ[Ì]);}
    i.AppendLine("");
    i.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
    i.AppendLine("â–ˆâ–ˆ POINT OF NO RETURN â–ˆâ–ˆ");
    i.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
    Ú.BackgroundColor=W%2==0?new Color(100,0,0):new Color(50,0,0);
    Ú.FontColor=new Color(255,0,0);
    }else if(U==G.B){
    i.AppendLine("=============================");
    i.AppendLine("     UNITY NUKE SYSTEM");
    i.AppendLine("=============================");
    i.AppendLine("");
    int µ=Math.Max(0,V);
    int Û=µ/10;int Ü=µ%10;
    string[]Ý=g[Û].Split('\n');
    string[]Þ=g[Ü].Split('\n');
    for(int Ì=0;Ì<5;Ì++){i.AppendLine("    "+Ý[Ì]+"  "+Þ[Ì]);}
    i.AppendLine("");
    i.AppendLine("  TIME REMAINING: "+µ+" SECONDS");
    i.AppendLine("");
    i.AppendLine("=============================");
    string à=ß((30-µ)/30f*100f,20);
    i.AppendLine(" "+à);
    i.AppendLine("=============================");
    Ú.BackgroundColor=new Color(40,40,0);
    Ú.FontColor=new Color(255,255,0);
    }else if(U==G.E){
    i.AppendLine("");
    i.AppendLine("   â–ˆâ–ˆâ–ˆâ–ˆâ–ˆ  â–ˆâ–ˆâ–ˆâ–ˆ  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
    i.AppendLine("   â–ˆ   â–ˆ  â–ˆ   â–ˆ   â–ˆ  ");
    i.AppendLine("   â–ˆâ–ˆâ–ˆâ–ˆâ–ˆ  â–ˆâ–ˆâ–ˆâ–ˆ    â–ˆ  ");
    i.AppendLine("   â–ˆ   â–ˆ  â–ˆ   â–ˆ   â–ˆ  ");
    i.AppendLine("   â–ˆ   â–ˆ  â–ˆâ–ˆâ–ˆâ–ˆ    â–ˆ  ");
    i.AppendLine("");
    i.AppendLine("   SEQUENCE ABORTED");
    }else if(U==G.D){
    i.AppendLine("");
    i.AppendLine("       â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ       ");
    i.AppendLine("     â–ˆâ–ˆ  BOOM  â–ˆâ–ˆ     ");
    i.AppendLine("    â–ˆâ–ˆ  â˜¢â˜¢â˜¢â˜¢  â–ˆâ–ˆ    ");
    i.AppendLine("     â–ˆâ–ˆ  BOOM  â–ˆâ–ˆ     ");
    i.AppendLine("       â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ       ");
    i.AppendLine("");
    i.AppendLine("   DETONATION COMPLETE");
    }else{
    i.AppendLine("");
    i.AppendLine("        â•”â•\u0090â•\u0090â•\u0090â•—");
    i.AppendLine("       â•”â•\u009d   â•šâ•—");
    i.AppendLine("      â•”â•\u009d  â˜¢  â•šâ•—");
    i.AppendLine("     â•”â•\u009d       â•šâ•—");
    i.AppendLine("     â•šâ•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u009d");
    i.AppendLine("");
    i.AppendLine("   STATUS: STANDING BY");
    i.AppendLine("   WARHEADS: "+Y+" LOADED");
    Ú.BackgroundColor=new Color(0,0,0);
    Ú.FontColor=new Color(0,255,0);
    }
    Ú.WriteText(i.ToString());
    }
    void Ó(){
    if(M.Count<2)return;
    var Ú=M[1];
    i.Clear();
    i.AppendLine("=============================");
    i.AppendLine("      POWER STATUS");
    i.AppendLine("=============================");
    i.AppendLine("");
    i.AppendLine("  BATTERY CHARGE");
    i.AppendLine("");
    string à=ß(c,23);
    i.AppendLine("  "+à);
    i.AppendLine("        "+c.ToString("F1")+"%");
    i.AppendLine("");
    i.AppendLine("=============================");
    i.AppendLine("  BATTERIES: "+L.Count+" FOUND");
    i.AppendLine("");
    float á=0,â=0;
    foreach(var v in L){á+=v.CurrentInput;â+=v.CurrentOutput;}
    i.AppendLine("  INPUT:  "+á.ToString("F2")+" MW");
    i.AppendLine("  OUTPUT: "+â.ToString("F2")+" MW");
    i.AppendLine("  NET:    "+(á-â).ToString("F2")+" MW");
    i.AppendLine("");
    i.AppendLine("=============================");
    if(c>50)Ú.FontColor=new Color(0,255,0);
    else if(c>20)Ú.FontColor=new Color(255,255,0);
    else Ú.FontColor=new Color(255,0,0);
    Ú.WriteText(i.ToString());
    }
    void Ô(){
    if(M.Count<3)return;
    var Ú=M[2];
    i.Clear();
    if(U==G.C||(U==G.B&&V<=5)){
    i.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
    i.AppendLine("â–ˆâ–ˆ â˜ â˜ â˜  WARHEADS â˜ â˜ â˜  â–ˆâ–ˆ");
    i.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
    i.AppendLine("");
    i.AppendLine("  â–ˆâ–ˆâ–ˆ  â–ˆâ–ˆâ–ˆâ–ˆ  â–ˆ   â–ˆ â–ˆâ–ˆâ–ˆâ–ˆâ–ˆ â–ˆâ–ˆâ–ˆâ–ˆ");
    i.AppendLine("  â–ˆ  â–ˆ â–ˆ   â–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆ     â–ˆ   â–ˆ");
    i.AppendLine("  â–ˆâ–ˆâ–ˆ  â–ˆâ–ˆâ–ˆâ–ˆ  â–ˆ â–ˆ â–ˆ â–ˆâ–ˆâ–ˆâ–ˆ  â–ˆ   â–ˆ");
    i.AppendLine("  â–ˆ  â–ˆ â–ˆ   â–ˆ â–ˆ   â–ˆ â–ˆ     â–ˆ   â–ˆ");
    i.AppendLine("  â–ˆ  â–ˆ â–ˆ   â–ˆ â–ˆ   â–ˆ â–ˆâ–ˆâ–ˆâ–ˆâ–ˆ â–ˆâ–ˆâ–ˆâ–ˆ");
    i.AppendLine("");
    i.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
    i.AppendLine("â–ˆâ–ˆ    "+X+"/"+Y+" WARHEADS HOT    â–ˆâ–ˆ");
    i.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
    i.AppendLine("");
    i.AppendLine("  EJECT: "+b.ToString("F0")+"%  DET: "+Z);
    Ú.BackgroundColor=W%2==0?new Color(120,0,0):new Color(40,0,0);
    Ú.FontColor=new Color(255,0,0);
    }else if(U==G.B){
    i.AppendLine("=============================");
    i.AppendLine("     WARHEAD STATUS");
    i.AppendLine("=============================");
    i.AppendLine("");
    i.AppendLine("   â•”â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•—");
    i.AppendLine("   â•‘   ARMING SOON    â•‘");
    i.AppendLine("   â•šâ•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u009d");
    i.AppendLine("");
    i.AppendLine("  WARHEADS: "+Y+" LOADED");
    i.AppendLine("  ARM IN: "+Math.Max(0,V-5)+" SEC");
    i.AppendLine("");
    i.AppendLine("  EJECTION: "+ß(b,17));
    Ú.BackgroundColor=new Color(60,60,0);
    Ú.FontColor=new Color(255,255,0);
    }else{
    i.AppendLine("=============================");
    i.AppendLine("     WARHEAD STATUS");
    i.AppendLine("=============================");
    i.AppendLine("");
    i.AppendLine("   â•”â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•—");
    i.AppendLine("   â•‘      SAFE        â•‘");
    i.AppendLine("   â•šâ•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u009d");
    i.AppendLine("");
    i.AppendLine("  WARHEADS: "+Y+" LOADED");
    i.AppendLine("  DETONATIONS: "+Z);
    Ú.BackgroundColor=new Color(0,0,0);
    Ú.FontColor=new Color(0,255,0);
    }
    Ú.WriteText(i.ToString());
    }
    void Õ(){
    if(M.Count<4)return;
    var Ú=M[3];
    i.Clear();
    if(U==G.C){
    i.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
    i.AppendLine("â–ˆâ–ˆ â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢â˜¢ â–ˆâ–ˆ");
    i.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
    i.AppendLine("");
    int ã=(27-e.Length)/2;
    if(ã<0)ã=0;
    i.AppendLine(new string(' ',ã)+e);
    i.AppendLine("");
    i.AppendLine("      â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
    i.AppendLine("    â–ˆâ–ˆ   GOODBYE   â–ˆâ–ˆ");
    i.AppendLine("   â–ˆâ–ˆ  CRUEL WORLD  â–ˆâ–ˆ");
    i.AppendLine("    â–ˆâ–ˆ             â–ˆâ–ˆ");
    i.AppendLine("      â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
    i.AppendLine("");
    i.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
    i.AppendLine("â–ˆâ–ˆ  NO TURNING BACK NOW  â–ˆâ–ˆ");
    i.AppendLine("â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ");
    Ú.BackgroundColor=W%2==0?new Color(100,0,0):new Color(30,0,0);
    Ú.FontColor=new Color(255,50,50);
    }else if(U==G.B){
    i.AppendLine("=============================");
    i.AppendLine("     DEATH APPROACHES");
    i.AppendLine("=============================");
    i.AppendLine("");
    int ã=(27-e.Length)/2;
    if(ã<0)ã=0;
    i.AppendLine(new string(' ',ã)+e);
    i.AppendLine("");
    i.AppendLine("          â•”â•\u0090â•\u0090â•\u0090â•—");
    i.AppendLine("         â•”â•\u009d   â•šâ•—");
    i.AppendLine("        â•”â•\u009d  â˜¢  â•šâ•—");
    i.AppendLine("       â•”â•\u009d       â•šâ•—");
    i.AppendLine("       â•šâ•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u009d");
    i.AppendLine("");
    i.AppendLine("   COUNTDOWN: "+V+" SECONDS");
    Ú.BackgroundColor=new Color(40,40,0);
    Ú.FontColor=new Color(255,200,0);
    }else{
    i.AppendLine("");
    i.AppendLine("=============================");
    i.AppendLine("");
    int ã=(27-e.Length)/2;
    if(ã<0)ã=0;
    i.AppendLine(new string(' ',ã)+e);
    i.AppendLine("");
    i.AppendLine("=============================");
    i.AppendLine("");
    i.AppendLine("          â•”â•\u0090â•\u0090â•\u0090â•—");
    i.AppendLine("         â•”â•\u009d   â•šâ•—");
    i.AppendLine("        â•”â•\u009d  â˜¢  â•šâ•—");
    i.AppendLine("       â•”â•\u009d       â•šâ•—");
    i.AppendLine("       â•šâ•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u0090â•\u009d");
    i.AppendLine("");
    i.AppendLine("     AWAITING ORDERS");
    Ú.BackgroundColor=new Color(0,0,0);
    Ú.FontColor=new Color(200,200,200);
    }
    Ú.WriteText(i.ToString());
    }
    string ß(float ä,int å){
    ä=Math.Max(0,Math.Min(100,ä));
    int æ=(int)(ä/100f*å);
    int ç=å-æ;
    return"["+new string('#',æ)+new string('-',ç)+"]";
    }
}
