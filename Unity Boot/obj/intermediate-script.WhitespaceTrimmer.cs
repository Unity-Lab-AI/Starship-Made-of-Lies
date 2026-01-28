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
int A=1,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=18;bool K=false,L=false,M=false,N=false,O=false,P=false,Q=false,R=false,S=
false,T=false,U=false;string V="",W="Initializing...",X="";int Y=0,Z=0,a=0,b=0,c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=
0,o=0,p=0;bool q=false,r=false,s=false,t=false,u=false,v=false,w=true,x=false;IMyBroadcastListener y,z,ª,µ;Dictionary<
long,string>º=new Dictionary<long,string>();string[]À={"Miners AWOL","No beacons found","Fleet ghosted you"},Á={
"Initializing Core","Scanning Grid","Button Panel","Detecting LCDs","IGC Channels","Request Pad Status","Await Pad Response",
"Missile Merge Block","Validate Pad Power","Validate Pad Fuel","Request Inv Status","Await Inv Response","Validate Inv Cargo",
"Validate Inv Refinery","Validate Inv Assembler","Validate Inv Gas","Request Signal Status","Await Signal Response","Validate Signal",
"Scan Door Systems","Verify Pressurization","Cross-Validate","Module Sync","Write Config","Beacon Detection","Controller Modules",
"System Ready","All Systems Operational"};float Â=512,Ã=512,Ä=1;string Å="[PAD1",Æ="",Ç="",È="";IMyButtonPanel É;IMyProgrammableBlock
Ê,Ë,Ì;IMyShipConnector Í,Î;List<IMyRadioAntenna>Ï=new List<IMyRadioAntenna>();IMyTextSurface Ð,Ñ,Ò,Ó,Ô,Õ,Ö,Ø,Ù,Ú,Û;List<
IMyTextSurface>Ü=new List<IMyTextSurface>(),Ý=new List<IMyTextSurface>();Color Þ=new Color(0,180,255),ß=new Color(0,255,100),à=new
Color(10,10,15);Color á=new Color(100,100,100),â=new Color(255,200,0),ã=new Color(255,180,0),ä=new Color(255,60,60),å=new
Color(40,40,50),æ=new Color(220,220,220);float ç=0;List<IMyAirVent>è=new List<IMyAirVent>();public
 Program
(){Runtime.UpdateFrequency=UpdateFrequency.Update10;é();ê();µ=IGC.RegisterBroadcastListener("UNITY_BOOT_RSP");ª=IGC.
RegisterBroadcastListener("MINER_BEACON");y=IGC.RegisterBroadcastListener("UNITY_BOOT_ACK");z=IGC.RegisterBroadcastListener("UNITY_SETUP_CMD");ë(
);ì();í();}void í(){Me.CustomData=
"[SYSTEM]\nboot_ready=true\nboot_complete=false\nboot_phase=INIT\nminer_count=0\nminer_names=\nbeacon_optional=true\n";}void é(){if(string.IsNullOrEmpty(Storage))return;var î=Storage.Split('|');if(î.Length>=1)int.TryParse(î[0],out A);}
public void
 Save
(){Storage=$"{A}";}void ê(){if(A==0)A=1;Å=$"[PAD{A}";Me.CustomName=$"[PAD{A}] UNITY BOOT";}void ô(){if(Ê==null||Ë==null||
Ì==null)ì();r=Ê!=null&&Ê.CustomData.Contains("pad_ready=true");s=false;if(Ë!=null&&Ë.CustomData.Contains("inv_ready=true"
)&&Ê!=null){string ï=Ê.CustomData;int ð=ï.IndexOf("pad_session=");if(ð>=0){int ñ=ï.IndexOf('\n',ð);if(ñ<0)ñ=ï.Length;
string ò=ï.Substring(ð+12,ñ-ð-12).Trim();s=Ë.CustomData.Contains($"inv_for_session={ò}");}}t=Ì==null;if(Ì!=null&&Ì.CustomData.
Contains("signal_ready=true")&&Ê!=null){string ï=Ê.CustomData;int ð=ï.IndexOf("pad_session=");if(ð>=0){int ñ=ï.IndexOf('\n',ð);
if(ñ<0)ñ=ï.Length;string ò=ï.Substring(ð+12,ñ-ð-12).Trim();t=Ì.CustomData.Contains($"signal_for_session={ò}");}}string ó=
Me.CustomData;w=!ó.Contains("beacon_optional=false");}void ö(){º.Clear();string õ=Me.CustomData;if(õ.Contains(
"boot_complete=true"))return;õ=õ.Replace("boot_complete=false","boot_complete=BOOTING");Me.CustomData=õ;}public void
 Main
(string ø,UpdateType ù){B++;if(ú())return;if(K){Runtime.UpdateFrequency=UpdateFrequency.None;Echo("UNITY BOOT COMPLETE");
Echo("Boot controller shutting down.");Echo("LCDs released to operational scripts.");return;}if(L){û();G++;if(u&&v){ü();K=
true;Echo("UNITY BOOT");Echo("Both scripts acknowledged.");Echo("Boot complete - shutting down.");return;}if(G>300){ü();K=
true;Echo("UNITY BOOT");Echo("ACK timeout - scripts running.");return;}Echo("UNITY BOOT");Echo(
$"Waiting for scripts... ({G})");Echo($"PAD: {(u?"OK":"wait")} | INV: {(v?"OK":"wait")}");return;}ý();}void ë(){Ð=Ñ=Ò=Ó=Ô=Õ=Ö=Ø=Ù=Ú=Û=null;É=null;Í=Î=
null;Ï.Clear();Ü.Clear();Ý.Clear();è.Clear();var þ=new List<IMyTerminalBlock>();GridTerminalSystem.GetBlocksOfType(þ,ÿ=>ÿ.
CustomName.Contains(Å)||ÿ.CubeGrid==Me.CubeGrid);string Ā=$"[PAD{A}SIGNAL]",ā=$"[PAD{A}DEFENSE]",Ă=$"[PAD{A}SATS]",ă=
$"[PAD{A}PRESSURE]";foreach(var ÿ in þ){if(ÿ is IMyButtonPanel&&ÿ.CustomName.ToLower().Contains("control")&&É==null)É=ÿ as IMyButtonPanel;
if(ÿ is IMyShipConnector){string Ą=ÿ.CustomName;if(Ą.Contains("-CON1"))Í=ÿ as IMyShipConnector;else if(Ą.Contains("-CON2")
)Î=ÿ as IMyShipConnector;}if(ÿ is IMyRadioAntenna)Ï.Add(ÿ as IMyRadioAntenna);if(ÿ is IMyAirVent)è.Add(ÿ as IMyAirVent);
if(ÿ is IMyTextSurface||ÿ is IMyTextPanel){string Ą=ÿ.CustomName;if(!Ą.Contains(Å)&&!Ą.Contains($"[PAD{A}"))continue;
IMyTextSurface ą=ÿ is IMyTextSurface?(IMyTextSurface)ÿ:((IMyTextPanel)ÿ);if(Ą.ToUpper().Contains("CAMS")){if(!Ü.Contains(ą))Ü.Add(ą);
continue;}if(Ą.Contains(Ā)||Ą.Contains(ā)||Ą.Contains(Ă)||Ą.Contains(ă)){if(!Ý.Contains(ą))Ý.Add(ą);continue;}if(Ą.Contains(
":11")&&Û==null)Û=ą;else if(Ą.Contains(":10")&&Ú==null)Ú=ą;else if(Ą.Contains(":1")&&!Ą.Contains(":10")&&!Ą.Contains(":11")&&
Ð==null)Ð=ą;else if(Ą.Contains(":2")&&Ñ==null)Ñ=ą;else if(Ą.Contains(":3")&&Ò==null)Ò=ą;else if(Ą.Contains(":4")&&Ó==null
)Ó=ą;else if(Ą.Contains(":5")&&Ô==null)Ô=ą;else if(Ą.Contains(":6")&&Õ==null)Õ=ą;else if(Ą.Contains(":7")&&Ö==null)Ö=ą;
else if(Ą.Contains(":8")&&Ø==null)Ø=ą;else if(Ą.Contains(":9")&&Ù==null)Ù=ą;}}if(É==null){var Ć=new List<IMyButtonPanel>();
GridTerminalSystem.GetBlocksOfType(Ć,ÿ=>ÿ.CubeGrid==Me.CubeGrid);foreach(var ć in Ć)if(ć.CustomName.ToLower().Contains("control")&&É==null
)É=ć;}if(É==null){var Ć=new List<IMyButtonPanel>();GridTerminalSystem.GetBlocksOfType(Ć);foreach(var ć in Ć)if(ć.
CustomName.ToLower().Contains("control")&&É==null)É=ć;}foreach(var ø in Ï){ø.Enabled=true;ø.EnableBroadcasting=true;}}void ì(){Ê=Ë
=Ì=null;var Ĉ=new List<IMyProgrammableBlock>();GridTerminalSystem.GetBlocksOfType(Ĉ,ÿ=>ÿ.CubeGrid==Me.CubeGrid&&ÿ!=Me);
foreach(var ĉ in Ĉ){string Ą=ĉ.CustomName;if(Ą.Contains($"[PAD{A}]")&&Ą.ToUpper().Contains("UNITY INVENTORY"))Ë=ĉ;else if(Ą.
Contains($"[PAD{A}]")&&Ą.ToUpper().Contains("UNITY PAD"))Ê=ĉ;else if(Ą.Contains($"[PAD{A}]")&&Ą.ToUpper().Contains(
"UNITY SIGNAL"))Ì=ĉ;}}void ď(){while(µ.HasPendingMessage){var Ċ=µ.AcceptMessage();string ċ=Ċ.Data.ToString();if(ċ.StartsWith("PAD|")){
Æ=ċ;N=true;Č(ċ);}else if(ċ.StartsWith("INV|")){Ç=ċ;P=true;č(ċ);}else if(ċ.StartsWith("SIGNAL|")){È=ċ;R=true;Ď(ċ);}}}void
Č(string ċ){var Đ=ċ.Split('|');if(Đ.Length<3)return;if(Đ[1]!="OK"){V=$"Pad: {Đ[2]}";return;}var đ=Đ[2].Split(',');foreach
(var Ē in đ){var ē=Ē.Split('=');if(ē.Length!=2)continue;int Ĕ;int.TryParse(ē[1],out Ĕ);if(ē[0]=="merge")d=Ĕ;else if(ē[0]
=="con")e=Ĕ;else if(ē[0]=="bat")f=Ĕ;else if(ē[0]=="h2")g=Ĕ;else if(ē[0]=="o2")h=Ĕ;else if(ē[0]=="prt")i=Ĕ;}}void č(string
ċ){var Đ=ċ.Split('|');if(Đ.Length<3)return;if(Đ[1]!="OK"){V=$"Inv: {Đ[2]}";return;}var đ=Đ[2].Split(',');foreach(var Ē in
đ){var ē=Ē.Split('=');if(ē.Length!=2)continue;int Ĕ;int.TryParse(ē[1],out Ĕ);if(ē[0]=="cargo")j=Ĕ;else if(ē[0]=="ref")k=Ĕ
;else if(ē[0]=="asm")l=Ĕ;else if(ē[0]=="gen")m=Ĕ;else if(ē[0]=="h2")n=Ĕ;else if(ē[0]=="o2")o=Ĕ;}}void Ď(string ċ){var Đ=ċ
.Split('|');if(Đ.Length<3)return;if(Đ[1]!="OK"){V=$"Signal: {Đ[2]}";return;}var đ=Đ[2].Split(',');foreach(var Ē in đ){var
ē=Ē.Split('=');if(ē.Length!=2)continue;int Ĕ;int.TryParse(ē[1],out Ĕ);if(ē[0]=="cams")a=Ĕ;else if(ē[0]=="lcds")b=Ĕ;}}void
ě(){c=0;x=false;ç=0;H=0;if(Ì==null)return;string õ=Ì.CustomData;int ĕ=õ.IndexOf("[DOORS]");if(ĕ<0)return;int Ė=õ.IndexOf(
"[",ĕ+7);if(Ė<0)Ė=õ.Length;string ė=õ.Substring(ĕ,Ė-ĕ);var Ę=ė.Split('\n');foreach(var ę in Ę){if(ę.StartsWith("count=")){
int.TryParse(ę.Substring(6),out c);}else if(ę.StartsWith("locked=")){x=ę.Contains("True");}else if(ę.StartsWith(
"overall_pressure=")){float.TryParse(ę.Substring(17),out ç);}else if(ę.StartsWith("door_")){var Ě=ę.Split('=');if(Ě.Length>=2){var đ=Ě[1].
Split('|');if(đ.Length>=1&&đ[0]=="OPEN")H++;}}}}void ĝ(){if(è.Count==0){ç=0;return;}float Ĝ=0;foreach(var Ē in è){Ĝ+=Ē.
GetOxygenLevel();}ç=(Ĝ/è.Count)*100f;}void Ğ(){if(M)return;IGC.SendBroadcastMessage("UNITY_BOOT_REQ",$"PAD_CHECK:{A}");M=true;p=0;}
void ğ(){if(O)return;IGC.SendBroadcastMessage("UNITY_BOOT_REQ",$"INV_CHECK:{A}");O=true;p=0;}void Ġ(){if(Q)return;IGC.
SendBroadcastMessage("UNITY_BOOT_REQ",$"SIGNAL_CHECK:{A}");Q=true;p=0;}void ģ(){if(Ê==null||Ë==null)ì();if(!N&&Ê!=null){string õ=Ê.
CustomData;if(õ.Contains("pad_status=OK:")){int ġ=õ.IndexOf("pad_status=OK:");if(ġ>=0){int Ģ=õ.IndexOf("\n",ġ);string ę=Ģ>ġ?õ.
Substring(ġ,Ģ-ġ):õ.Substring(ġ);Æ="PAD|OK|"+ę.Substring(14);N=true;Č(Æ);}}}if(!P&&Ë!=null){string õ=Ë.CustomData;if(õ.Contains(
"inv_status=OK:")){int ġ=õ.IndexOf("inv_status=OK:");if(ġ>=0){int Ģ=õ.IndexOf("\n",ġ);string ę=Ģ>ġ?õ.Substring(ġ,Ģ-ġ):õ.Substring(ġ);Ç=
"INV|OK|"+ę.Substring(14);P=true;č(Ç);}}}}void ý(){D++;if(É==null||Ð==null)ë();ô();if(!q){if(!r||!s||!t){Ĥ();Echo(
"UNITY MISSILE SYSTEM");Echo("Waiting for scripts...");Echo(
$"Boot: OK | Pad: {(r?"OK":"wait")} | Inv: {(s?"OK":"wait")} | Sig: {(t?"OK":"wait")}");return;}ö();q=true;}ď();ģ();ĥ();if(D==3){Y=0;if(Í!=null&&Í.Status==MyShipConnectorStatus.Connected)Y++;if(Î!=null&&Î.
Status==MyShipConnectorStatus.Connected)Y++;}int Ħ=12;int ħ=12;int Ĩ=28;if(V!=""){E++;if(E>=ħ){V="";E=0;p=0;}}else if(D>2&&C<Ĩ
){bool ĩ=(C==6&&!N)||(C==11&&!P)||(C==17&&!R);if(ĩ){p++;if(p>=J){if(C==6){N=true;S=true;W="[WARN] Pad timeout";}else if(C
==11){P=true;T=true;W="[WARN] Inv timeout";}else{R=true;U=true;W="[WARN] Signal timeout";}C++;p=0;}}else if(p>0){C++;p=0;}
else if(D%Ħ==0){string ī=Ī(C);if(ī!=""){V=ī;E=0;}else C++;}}if(C>=Ĩ){F++;if(F<3){IMyTextSurface[]Ĭ={Ð,Ñ,Ò,Ö,Ø};
IMyTextSurface[]ĭ={Ó,Ô,Õ,Ù,Ú,Û};foreach(var Į in Ĭ){if(Į!=null)į(Į,1f,"All Systems Operational",Ĩ-1,Ĩ,true);}foreach(var Į in ĭ){if(Į
!=null)į(Į,1f,"All Systems Operational",Ĩ-1,Ĩ,false);}foreach(var Į in Ü){if(Į!=null)į(Į,1f,"All Systems Operational",Ĩ-1,
Ĩ,true);}foreach(var Į in Ý){if(Į!=null)į(Į,1f,"All Systems Operational",Ĩ-1,Ĩ,true);}Echo("UNITY MISSILE SYSTEM");Echo(
"ALL SYSTEMS OPERATIONAL");Echo($"[{Ĩ}/{Ĩ}] Success!");return;}İ();L=true;G=0;Echo("UNITY MISSILE SYSTEM");Echo("BOOT COMPLETE - Awaiting ACKs");
Echo("Waiting for PAD and INVENTORY...");return;}float ı=(float)C/Ĩ;string Ĳ=C<28?Á[C]:Á[27];if(C==19)Ĳ=c>0?
$"Door sets: {c}":"No airlocks found";if(C==20)Ĳ=H==0?$"Pressurized: {ç:F0}%":$"Breach: {H} ext doors open";if(C==22)Ĳ=Y>0?
$"Syncing {Y} module(s)":"Standalone mode";if(C==24)Ĳ=Z>0?$"Found {Z} miner(s)":"Scanning beacons...";if(C==25)Ĳ=Y>0?$"Found {Y} pad(s)":
"No extra pads";IMyTextSurface[]ĳ={Ð,Ñ,Ò,Ö,Ø};IMyTextSurface[]Ĵ={Ó,Ô,Õ,Ù,Ú,Û};foreach(var Į in ĳ){if(Į!=null)į(Į,ı,Ĳ,C,Ĩ,true);}foreach
(var Į in Ĵ){if(Į!=null)į(Į,ı,Ĳ,C,Ĩ,false);}foreach(var Į in Ü){if(Į!=null)į(Į,ı,Ĳ,C,Ĩ,true);}foreach(var Į in Ý){if(Į!=
null)į(Į,ı,Ĳ,C,Ĩ,true);}Echo("UNITY MISSILE SYSTEM");Echo("Boot Controller Active");Echo($"[{Math.Min(C+1,Ĩ)}/{Ĩ}] {Ĳ}");if(
V!="")Echo($"ERROR: {V}");else Echo($"Status: {W}");Echo($"Pad: {(N?"OK":"waiting")} | Inv: {(P?"OK":"waiting")}");}void
į(IMyTextSurface ĵ,float ı,string Ķ,int ķ,int Ĝ,bool ĸ){ĵ.ContentType=ContentType.SCRIPT;ĵ.Script="";ĵ.
ScriptBackgroundColor=à;var Ĺ=ĵ.DrawFrame();Vector2 ĺ=ĵ.SurfaceSize;Â=ĺ.X;Ã=ĺ.Y;Ä=Math.Min(Â/512f,Ã/512f);float Ļ=Â/2,ļ=Ã/2;Ĺ.Add(new
MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(Ļ,ļ),ĺ,à));Ĺ.Add(new MySprite(SpriteType.TEXT,"UNITY MISSILE SYSTEM",new
Vector2(Ļ,40*Ä),null,Þ,null,TextAlignment.CENTER,1.2f*Ä));Ĺ.Add(new MySprite(SpriteType.TEXT,"v01.00",new Vector2(Ļ,75*Ä),null,
á,null,TextAlignment.CENTER,0.5f*Ä));Ĺ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(Ļ,100*Ä),new
Vector2(Â-60*Ä,2*Ä),á));string Ľ=ĸ?"PAD CONTROLLER":"INVENTORY MODULE";Ĺ.Add(new MySprite(SpriteType.TEXT,Ľ,new Vector2(Ļ,120*Ä
),null,â,null,TextAlignment.CENTER,0.6f*Ä));Ĺ.Add(new MySprite(SpriteType.TEXT,"System Initialization",new Vector2(Ļ,150*
Ä),null,æ,null,TextAlignment.CENTER,0.55f*Ä));float ľ=40*Ä,Ŀ=Ã-120*Ä,ŀ=Â-80*Ä,Ł=20*Ä;Ĺ.Add(new MySprite(SpriteType.
TEXTURE,"SquareSimple",new Vector2(Ļ,Ŀ+Ł/2),new Vector2(ŀ,Ł),å));Ĺ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new
Vector2(ľ+ŀ*ı/2,Ŀ+Ł/2),new Vector2(ŀ*ı,Ł-4*Ä),Þ));Ĺ.Add(new MySprite(SpriteType.TEXT,$"{(int)(ı*100)}%",new Vector2(Ļ,Ŀ+Ł+5*Ä),
null,æ,null,TextAlignment.CENTER,0.45f*Ä));Color ł=V!=""?ä:ß;Ĺ.Add(new MySprite(SpriteType.TEXT,$"[{ķ+1}/{Ĝ}] {Ķ}",new
Vector2(Ļ,Ŀ-25*Ä),null,ł,null,TextAlignment.CENTER,0.4f*Ä));int Ń=ķ;if(Ń<0)Ń=0;if(Ń>=28)Ń=27;int ń=Math.Max(0,Ń-4);float Ņ=180*
Ä;for(int ņ=ń;ņ<=Ń&&ņ<28;ņ++){bool Ň=ņ==Ń&&V!="";Color ň=Ň?ä:ņ<Ń?ß:ņ==Ń?Þ:á;string ŉ=Ň?"[!!]":ņ<Ń?"[OK]":ņ==Ń?"[>>]":
"[..]";Ĺ.Add(new MySprite(SpriteType.TEXT,$"{ŉ} {Á[ņ]}",new Vector2(30*Ä,Ņ),null,ň,null,TextAlignment.LEFT,0.35f*Ä));Ņ+=18*Ä;
if(Ņ>Ŀ-50*Ä)break;}string Ŋ;Color ŋ;if(V!=""){Ŋ=$"ERROR: {V}";ŋ=ä;}else if(ĸ){if(A==1&&Y==0){Ŋ=W!=""?W:
$"PAD {A} - Primary Launch Controller";ŋ=ß;}else if(A==1&&Y>0){Ŋ=W!=""?W:$"PAD {A} - Controller ({Y} modules)";ŋ=ß;}else if(Y>0){Ŋ=W!=""?W:
$"PAD {A} - Module (Synced)";ŋ=ß;}else{Ŋ=W!=""?W:$"PAD {A} - Module (Standalone)";ŋ=ã;}}else{Ŋ=W!=""?W:"INVENTORY MODULE";ŋ=ß;}Ĺ.Add(new MySprite(
SpriteType.TEXT,Ŋ,new Vector2(Ļ,Ã-30*Ä),null,ŋ,null,TextAlignment.CENTER,0.4f*Ä));Ĺ.Dispose();}string Ī(int ķ){var þ=new List<
IMyTerminalBlock>();switch(ķ){case 0:GridTerminalSystem.GetBlocksOfType(þ);if(þ.Count<5)return"Grid has fewer than 5 blocks";W=
$"Core: {þ.Count} blocks";return"";case 1:GridTerminalSystem.GetBlocksOfType(þ,ÿ=>ÿ.CubeGrid==Me.CubeGrid);W=$"Grid: {þ.Count} blocks";return"";
case 2:if(É==null)return"No control panel";W="Button panel found";return"";case 3:int Ō=0;if(Ð!=null)Ō++;if(Ñ!=null)Ō++;if(Ò
!=null)Ō++;if(Ó!=null)Ō++;if(Ô!=null)Ō++;if(Õ!=null)Ō++;if(Ö!=null)Ō++;if(Ø!=null)Ō++;if(Ù!=null)Ō++;if(Ú!=null)Ō++;if(Û!=
null)Ō++;if(Ō<1)return"No LCDs found";W=$"LCDs: {Ō} found";return"";case 4:if(µ==null)return"IGC failed";W=
"IGC channels ready";return"";case 5:Ğ();W="Requesting pad status...";return"";case 6:if(!N)return"";W=S?"[WARN] Pad no response":
"Pad responded OK";return"";case 7:W=S?"[WARN] Merge unknown":d>0?$"Missile merge block: {d}":"No missile merge block";return"";case 8:W=S
?"[WARN] Power unknown":$"Pad power: {f} batteries";return"";case 9:W=S?"[WARN] Fuel unknown":$"Pad fuel: {g} H2, {h} O2"
;return"";case 10:ğ();W="Requesting inv status...";return"";case 11:if(!P)return"";W=T?"[WARN] Inv no response":
"Inv responded OK";return"";case 12:W=T?"[WARN] Cargo unknown":$"Inv cargo: {j}";return"";case 13:W=T?"[WARN] Refinery unknown":
$"Inv refineries: {k}";return"";case 14:W=T?"[WARN] Assembler unknown":$"Inv assemblers: {l}";return"";case 15:W=T?"[WARN] Gas unknown":
$"Inv gas: {m} gens";return"";case 16:if(Ì==null){R=true;W="Signal: optional";return"";}Ġ();W="Requesting signal status...";return"";case 17
:if(!R)return"";W=U?"[WARN] Signal no response":Ì==null?"Signal: optional":"Signal responded OK";return"";case 18:W=U?
"[WARN] Signal unknown":Ì==null?"Signal: not installed":$"Signal: {a} cams, {b} LCDs";return"";case 19:ě();I=è.Count;W=c>0?
$"Doors: {c} sets{(x?" LOCKED":"")}":I>0?$"Air vents: {I}":"No airlocks (optional)";return"";case 20:ĝ();W=I==0?"No vents (skipped)":H>0?
$"[WARN] {H} ext doors open":$"Pressurized: {ç:F0}% ({I} vents)";return"";case 21:if(!N||!P||(Ì!=null&&!R))return"Not all systems responded";W=(S||T
||U)?"[WARN] Partial verification":"All systems verified";return"";case 22:W=Y>0?$"Synced: {Y} modules":A==1?"Primary pad"
:"Standalone";return"";case 23:ō();Ŏ();W="Config written";return"";case 24:ŏ();if(Z==0&&!w)return À[B%À.Length];W=Z>0?
$"Miners: {Z}":"No miners (optional)";return"";case 25:if(Y>0){W=$"Connected pads: {Y}";}else{W=
"No extra pads (run CMDPAD SETUP to add)";}return"";case 26:W="BOOT COMPLETE";return"";case 27:W="ALL SYSTEMS OPERATIONAL";return"";default:return"";}}void ō(){
string õ=Me.CustomData;if(!õ.Contains("boot_phase="))õ=õ.Replace("[SYSTEM]","[SYSTEM]\nboot_phase=CONFIG");else õ=õ.Replace(
"boot_phase=RUNNING","boot_phase=CONFIG").Replace("boot_phase=WAITING","boot_phase=CONFIG");Me.CustomData=õ;}void İ(){string õ=Me.CustomData
;õ=õ.Replace("boot_complete=false","boot_complete=true").Replace("boot_complete=BOOTING","boot_complete=true");õ=õ.
Replace("boot_phase=INIT","boot_phase=COMPLETE").Replace("boot_phase=CONFIG","boot_phase=COMPLETE").Replace(
"boot_phase=RUNNING","boot_phase=COMPLETE");if(!õ.Contains("boot_complete=true")){int ġ=õ.IndexOf("[SYSTEM]");if(ġ>=0){int Ģ=õ.IndexOf("\n",
ġ);if(Ģ<0)Ģ=ġ+8;õ=õ.Insert(Ģ,"\nboot_complete=true");}}string Ő="";if(Ê!=null){string ï=Ê.CustomData;int ð=ï.IndexOf(
"pad_session=");if(ð>=0){int ñ=ï.IndexOf('\n',ð);if(ñ<0)ñ=ï.Length;Ő=ï.Substring(ð+12,ñ-ð-12).Trim();}}if(Ő!=""&&!õ.Contains(
$"boot_for_session={Ő}")){int ġ=õ.IndexOf("[SYSTEM]");if(ġ>=0){int Ģ=õ.IndexOf("\n",ġ);if(Ģ<0)Ģ=ġ+8;õ=õ.Insert(Ģ,$"\nboot_for_session={Ő}");}}
Me.CustomData=õ;Echo("Boot complete signal written to Me.CustomData");}void ü(){IMyTextSurface[]ő={Ð,Ñ,Ò,Ó,Ô,Õ,Ö,Ø,Ù,Ú,Û};
foreach(var Į in ő){if(Į==null)continue;Į.ContentType=ContentType.TEXT_AND_IMAGE;Į.Script="";Į.WriteText("");}foreach(var Į in
Ü){if(Į==null)continue;Į.ContentType=ContentType.TEXT_AND_IMAGE;Į.Script="";Į.WriteText("");}foreach(var Į in Ý){if(Į==
null)continue;Į.ContentType=ContentType.TEXT_AND_IMAGE;Į.Script="";Į.WriteText("");}}void û(){if(y==null)return;while(y.
HasPendingMessage){var Ċ=y.AcceptMessage();string ċ=Ċ.Data.ToString();if(ċ=="PAD_RUNNING")u=true;if(ċ=="INV_RUNNING")v=true;}}void ĥ(){if
(ª==null)return;while(ª.HasPendingMessage){var Ċ=ª.AcceptMessage();var Đ=Ċ.Data.ToString().Split('|');if(Đ.Length>2&&Đ[0]
=="MB"){long Œ;if(long.TryParse(Đ[1],out Œ))º[Œ]=Đ[2];}}Z=º.Count;X=string.Join(",",º.Values);}void ŏ(){string õ=Me.
CustomData;if(!õ.Contains("miner_count="))õ=õ.Replace("[SYSTEM]","[SYSTEM]\nminer_count="+Z);else{int œ=õ.IndexOf("miner_count=");
if(œ>=0){int Ŕ=õ.IndexOf("\n",œ);if(Ŕ<0)Ŕ=õ.Length;õ=õ.Remove(œ,Ŕ-œ);õ=õ.Insert(œ,"miner_count="+Z);}}if(!õ.Contains(
"miner_names="))õ=õ.Replace("[SYSTEM]","[SYSTEM]\nminer_names="+X);else{int ŕ=õ.IndexOf("miner_names=");if(ŕ>=0){int Ŕ=õ.IndexOf("\n",
ŕ);if(Ŕ<0)Ŕ=õ.Length;õ=õ.Remove(ŕ,Ŕ-ŕ);õ=õ.Insert(ŕ,"miner_names="+X);}}Me.CustomData=õ;}void Ŏ(){if(É==null)return;
string õ=É.CustomData;if(string.IsNullOrEmpty(õ)||!õ.Contains("GPS:")){É.CustomData="=== UNITY MISSILE TARGETING ===\r\n    ; Paste GPS coordinates here for missile targeting\r\n    ; Copy from GPS menu (K) or antenna broadcasts\r\n    ;\r\n    ; FORMAT: GPS:Name:X:Y:Z:#AARRGGBB:\r\n    ; Example: GPS:Enemy Base:50000:12000:8500:#FFFF0000:\r\n    ;\r\n    ; HOW TO ADD TARGETS:\r\n    ; 1. Open GPS menu (K key)\r\n    ; 2. Right-click a waypoint -> Copy to Clipboard\r\n    ; 3. Paste here (Ctrl+V in CustomData)\r\n    ; 4. Multiple targets OK - one per line\r\n    ;\r\n    ; QUICK ENTRY (via PB argument):\r\n    ; Run: GPS:1000,500,200\r\n    ;\r\n    ; Lines starting with ; are ignored\r\n    ; =============================\r\n        \r\n    "
;}}void Ĥ(){IMyTextSurface[]Ŗ={Ð,Ñ,Ò,Ó,Ô,Õ,Ö,Ø,Ù,Ú,Û};foreach(var ĵ in Ŗ){ŗ(ĵ);}foreach(var ĵ in Ü){ŗ(ĵ);}foreach(var ĵ
in Ý){ŗ(ĵ);}}void ŗ(IMyTextSurface ĵ){if(ĵ==null)return;ĵ.ContentType=ContentType.SCRIPT;ĵ.Script="";ĵ.
ScriptBackgroundColor=à;var Ĺ=ĵ.DrawFrame();Vector2 ĺ=ĵ.SurfaceSize;Â=ĺ.X;Ã=ĺ.Y;Ä=Math.Min(Â/512f,Ã/512f);float Ļ=Â/2;Ĺ.Add(new MySprite(
SpriteType.TEXTURE,"SquareSimple",new Vector2(Ļ,Ã/2),ĺ,à));Ĺ.Add(new MySprite(SpriteType.TEXT,"UNITY MISSILE SYSTEM",new Vector2(Ļ
,40*Ä),null,Þ,null,TextAlignment.CENTER,1.2f*Ä));Ĺ.Add(new MySprite(SpriteType.TEXT,"WAITING FOR SCRIPTS",new Vector2(Ļ,
120*Ä),null,ã,null,TextAlignment.CENTER,0.7f*Ä));float Ņ=180*Ä;Ĺ.Add(new MySprite(SpriteType.TEXT,$"[OK] Boot Controller",
new Vector2(30*Ä,Ņ),null,ß,null,TextAlignment.LEFT,0.4f*Ä));Ņ+=22*Ä;Ĺ.Add(new MySprite(SpriteType.TEXT,
$"[{(r?"OK":"..")}] Pad Controller",new Vector2(30*Ä,Ņ),null,r?ß:á,null,TextAlignment.LEFT,0.4f*Ä));Ņ+=22*Ä;Ĺ.Add(new MySprite(SpriteType.TEXT,
$"[{(s?"OK":"..")}] Inventory Module",new Vector2(30*Ä,Ņ),null,s?ß:á,null,TextAlignment.LEFT,0.4f*Ä));Ņ+=22*Ä;Ĺ.Add(new MySprite(SpriteType.TEXT,
$"[{(t?"OK":"..")}] Signal Display",new Vector2(30*Ä,Ņ),null,t?ß:á,null,TextAlignment.LEFT,0.4f*Ä));Ņ+=22*Ä;Ĺ.Add(new MySprite(SpriteType.TEXT,
"Compile missing scripts to proceed",new Vector2(Ļ,Ã-40*Ä),null,æ,null,TextAlignment.CENTER,0.35f*Ä));Ĺ.Dispose();}double Ř(Vector3D ø,Vector3D ÿ)=>Vector3D
.Distance(ø,ÿ);Vector3D ř(Vector3D Ē)=>Vector3D.Normalize(Ē);bool ú(){if(z==null)return false;bool Ś=false;while(z.
HasPendingMessage){var Ċ=z.AcceptMessage();string ċ=Ċ.Data.ToString();if(ċ==$"SETUPMOD|{A}"){ś(false);Ŝ("SETUPMOD");Ś=true;}else if(ċ==
$"SETUPFORCE|{A}"){ś(true);Ŝ("SETUPFORCE");Ś=true;}else if(ċ==$"NAMEPAD|{A}"){ŝ();Ŝ("NAMEPAD");Ś=true;}else if(ċ==$"NAMEMSL|{A}"){Ş();ş()
;Š();Ŝ("NAMEMSL");Ś=true;}}if(Ś){Echo("UNITY BOOT - Setup Complete");Echo("Blocks renamed. Please recompile all scripts."
);}return Ś;}void Ŝ(string š){string õ=Me.CustomData;string ą=DateTime.Now.ToString("HH:mm:ss");if(!õ.Contains(
"setup_status="))õ=õ.Replace("[SYSTEM]",$"[SYSTEM]\nsetup_status={š}@{ą}");else{int ġ=õ.IndexOf("setup_status=");int Ģ=õ.IndexOf("\n",ġ
);if(Ģ<0)Ģ=õ.Length;õ=õ.Remove(ġ,Ģ-ġ);õ=õ.Insert(ġ,$"setup_status={š}@{ą}");}Me.CustomData=õ;}void Ş(){if(Ê==null)ì();if(
Ê==null)return;string õ=Ê.CustomData;int ţ=Ţ()+1;if(!õ.Contains("bldNum="))õ+=$"\nbldNum={ţ}";else{int ġ=õ.IndexOf(
"bldNum=");int Ģ=õ.IndexOf("\n",ġ);if(Ģ<0)Ģ=õ.Length;õ=õ.Remove(ġ,Ģ-ġ);õ=õ.Insert(ġ,$"bldNum={ţ}");}Ê.CustomData=õ;}List<int>ŧ(){
var Ť=new List<int>();var Ĉ=new List<IMyProgrammableBlock>();GridTerminalSystem.GetBlocksOfType(Ĉ,ÿ=>ÿ.IsSameConstructAs(Me
)&&ÿ!=Me&&(ÿ.CustomName.ToUpper().Contains("UNITY PAD")||ÿ.CustomName.ToUpper().Contains("UNITY BOOT")));foreach(var ĉ in
Ĉ){string Ĕ=ĉ.CustomName;int ð=Ĕ.IndexOf("[PAD");if(ð>=0){int ñ=Ĕ.IndexOf("]",ð);if(ñ>ð+4){string ť=Ĕ.Substring(ð+4,ñ-ð-4
);int Ŧ;if(int.TryParse(ť,out Ŧ)&&Ŧ>0&&!Ť.Contains(Ŧ))Ť.Add(Ŧ);}}}return Ť;}int Ū(){var Ũ=ŧ();int ũ=1;while(Ũ.Contains(ũ)
)ũ++;return ũ;}void ś(bool ū){if(A==0){A=Ū();ê();}string Ŭ=$"[PAD{A}]",ŭ=$"[PAD{A}-PRINT]";Vector3D Ů=Me.GetPosition();
var ů=new List<IMyTerminalBlock>();GridTerminalSystem.GetBlocksOfType(ů);var Ű=new List<IMyTerminalBlock>();
GridTerminalSystem.GetBlocksOfType(Ű,ÿ=>ÿ.CubeGrid==Me.CubeGrid);IMyShipMergeBlock ű=null;double Ų=999;foreach(var ÿ in Ű)if(ÿ is
IMyShipMergeBlock){double ų=Ř(ÿ.GetPosition(),Ů);if(ų<Ų){ű=ÿ as IMyShipMergeBlock;Ų=ų;}}Vector3D Ŵ=ű!=null?ű.GetPosition():Ů;
IMyShipMergeBlock ŵ=null;bool Ŷ=ű!=null&&ű.IsConnected;if(Ŷ){var ŷ=new List<IMyShipMergeBlock>();GridTerminalSystem.GetBlocksOfType(ŷ,Ÿ=>
Ÿ.IsConnected&&Ÿ!=ű);if(ŷ.Count>0)ŵ=ŷ[0];}Vector3D Ź=Vector3D.Zero;if(Ŷ&&ŵ!=null)Ź=ř(ŵ.GetPosition()-Ŵ);var ź=new HashSet
<long>();foreach(var ÿ in Ű)if(ÿ is IMyPistonBase){var î=ÿ as IMyPistonBase;if(î.Top!=null&&Ř(ÿ.GetPosition(),Ů)<50)ź.Add
(î.Top.CubeGrid.EntityId);}int Ż=1,ż=1,Ž=1,ž=1,ſ=1;Action<IMyTerminalBlock>Ɓ=ÿ=>ÿ.CustomName=$"{Ŭ} {ƀ(ÿ)}";Func<string,
string>ƃ=Ĕ=>{int ņ=Ĕ.IndexOf("[PAD");if(ņ>=0){int Ƃ=Ĕ.IndexOf("]",ņ);if(Ƃ>ņ)Ĕ=Ĕ.Remove(ņ,Ƃ-ņ+1).Trim();}return Ĕ;};foreach(var
ÿ in Ű){if(ÿ.CustomName.Contains("Missile #")||ÿ.CustomName.Contains("-PRINT")||ÿ==Me)continue;double ų=Ř(ÿ.GetPosition()
,Ů);if(ų>80)continue;if(Ŷ&&Ź!=Vector3D.Zero&&Vector3D.Dot(ÿ.GetPosition()-Ŵ,Ź)>1)continue;string Ą=ÿ.CustomName;if(ū&&Ą.
Contains("[PAD")&&!Ą.Contains($"[PAD{A}"))Ą=ƃ(Ą);if(Ą.Contains("[PRINT]")&&!Ą.Contains("-PRINT]")){ÿ.CustomName=Ą.Replace(
"[PRINT]",ŭ);continue;}if(!ū&&Ą.Contains($"[PAD{A}]"))continue;if(Ą.Contains("[PAD")&&!Ą.Contains($"[PAD{A}"))Ą=ƃ(Ą);if(ÿ is
IMyShipMergeBlock&&ÿ==ű)ÿ.CustomName=$"{Ŭ} Merge";else if(ÿ is IMyShipConnector){var Ƅ=ÿ as IMyShipConnector;string ù=Ą.ToUpper();if(ù.
Contains("ORE")||ù.Contains("EJECTOR"))ÿ.CustomName=$"{Ŭ} {Ą}";else if(ſ<=2){ÿ.CustomName=$"[PAD{A}-CON{ſ}]";ſ++;}else ÿ.
CustomName=$"{Ŭ} Con";}else if(ÿ is IMyTextPanel&&Ż<=8){ÿ.CustomName=$"[PAD{A}:{Ż}] LCD";Ż++;}else if(ÿ is IMyPistonBase){var ò=ÿ
as IMyPistonBase;if(Math.Abs(Vector3D.Dot(ò.WorldMatrix.Up,Vector3D.Up))>0.7){ÿ.CustomName=$"{ŭ} V{ż}";ż++;}else{ÿ.
CustomName=$"{ŭ} H{Ž}";Ž++;}}else if(ÿ is IMyShipWelder){ÿ.CustomName=$"{ŭ} W{ž}";ž++;}else if(ÿ is IMyProjector)ÿ.CustomName=
$"{ŭ} Proj";else if(ÿ is IMyButtonPanel)ÿ.CustomName=$"{Ŭ} Btn";else if(ÿ is IMyBatteryBlock||ÿ is IMyGasTank||ÿ is
IMyCargoContainer||ÿ is IMyRefinery||ÿ is IMyAssembler||ÿ is IMyRadioAntenna||ÿ is IMyLaserAntenna||ÿ is IMyReactor||ÿ is IMySolarPanel||
ÿ is IMyGasGenerator||ÿ is IMyGyro||ÿ is IMyThrust||ÿ is IMySensorBlock||ÿ is IMyCameraBlock||ÿ is IMyRemoteControl||ÿ is
IMyCockpit||ÿ is IMyMedicalRoom)Ɓ(ÿ);else if(ÿ is IMyDoor)ÿ.CustomName=$"{Ŭ} Dr";else if(ÿ is IMyLightingBlock)ÿ.CustomName=
$"{Ŭ} Lt";else if(ÿ is IMyConveyorSorter)ÿ.CustomName=$"{Ŭ} Srt";else if(ÿ is IMyShipDrill)ÿ.CustomName=$"{Ŭ} Drl";else if(ÿ is
IMyShipGrinder)ÿ.CustomName=$"{Ŭ} Grd";else if(ÿ is IMyOreDetector)ÿ.CustomName=$"{Ŭ} ODt";else if(ÿ is IMyBeacon)ÿ.CustomName=
$"{Ŭ} Bcn";else if(ÿ is IMyTimerBlock)ÿ.CustomName=$"{Ŭ} Tmr";else if(ÿ is IMyAirVent)ÿ.CustomName=$"{Ŭ} Vnt";else if(ÿ is
IMyGravityGenerator)ÿ.CustomName=$"{Ŭ} Grv";else if(ÿ is IMyJumpDrive)ÿ.CustomName=$"{Ŭ} Jmp";else{string ƅ=ƀ(ÿ);if(!string.IsNullOrEmpty(ƅ
)&&ƅ.Length<30)ÿ.CustomName=$"{Ŭ} {ƅ}";}}foreach(var ÿ in ů){if(ÿ.CubeGrid==Me.CubeGrid||!ź.Contains(ÿ.CubeGrid.EntityId)
||ÿ.CustomName.Contains("[PAD")||ÿ.CustomName.Contains("Missile #")||ÿ.CustomName.Contains("-PRINT"))continue;if(ÿ is
IMyShipWelder){ÿ.CustomName=$"{ŭ} W{ž}";ž++;}else if(ÿ is IMyProjector&&!ÿ.CustomName.Contains("-PRINT]"))ÿ.CustomName=$"{ŭ} Proj";
else if(ÿ is IMyCockpit)Ɓ(ÿ);}Ɔ();}void Ɔ(){string Ŭ=$"[PAD{A}]";var Ĉ=new List<IMyProgrammableBlock>();GridTerminalSystem.
GetBlocksOfType(Ĉ,ÿ=>ÿ.CubeGrid==Me.CubeGrid);foreach(var ĉ in Ĉ){string Ą=ĉ.CustomName.ToUpper();if(Ą.Contains("UNITY PAD"))ĉ.
CustomName=$"{Ŭ} Unity Pad";else if(Ą.Contains("UNITY INVENTORY"))ĉ.CustomName=$"{Ŭ} Unity Inventory";else if(Ą.Contains(
"UNITY SIGNAL"))ĉ.CustomName=$"{Ŭ} UNITY SIGNAL";else if(Ą.Contains("UNITY BOOT"))ĉ.CustomName=$"{Ŭ} UNITY BOOT";}}void ŝ(){string Ŭ=
$"[PAD{A}]";var Ű=new List<IMyTerminalBlock>();GridTerminalSystem.GetBlocksOfType(Ű,ÿ=>ÿ.CubeGrid==Me.CubeGrid);Action<
IMyTerminalBlock>Ɖ=Ƈ=>{if(!ƈ(Ƈ)&&!Ƈ.CustomName.StartsWith("[PAD]"))Ƈ.CustomName=$"[PAD] {ƀ(Ƈ)}";};foreach(var ÿ in Ű){if(ÿ is
IMyBatteryBlock||ÿ is IMyGasTank||ÿ is IMyCargoContainer||ÿ is IMyRefinery||ÿ is IMyAssembler||ÿ is IMyRadioAntenna||ÿ is
IMyLaserAntenna||ÿ is IMyReactor||ÿ is IMySolarPanel||ÿ is IMyGasGenerator||ÿ is IMyGyro||ÿ is IMyThrust||ÿ is IMySensorBlock||ÿ is
IMyCameraBlock)Ɖ(ÿ);}}void ş(){var Ɗ=new List<IMyTerminalBlock>();IMyShipMergeBlock Ƌ=null;var ƌ=new List<IMyShipMergeBlock>();
GridTerminalSystem.GetBlocksOfType(ƌ,Ÿ=>Ÿ.CubeGrid==Me.CubeGrid&&Ÿ.CustomName.Contains($"[PAD{A}]"));if(ƌ.Count>0)Ƌ=ƌ[0];if(Ƌ==null||!Ƌ.
IsConnected)return;long ƍ=0;var Ǝ=new List<IMyShipMergeBlock>();GridTerminalSystem.GetBlocksOfType(Ǝ,Ÿ=>Ÿ.IsConnected&&Ÿ!=Ƌ);
foreach(var Ÿ in Ǝ){if(Ř(Ÿ.GetPosition(),Ƌ.GetPosition())<3){ƍ=Ÿ.CubeGrid.EntityId;break;}}if(ƍ==0)return;int ţ=Ţ();string Ə=
$"[PAD{A}] Missile #{ţ}";GridTerminalSystem.GetBlocksOfType(Ɗ,ÿ=>ÿ.CubeGrid.EntityId==ƍ);foreach(var ÿ in Ɗ){if(ÿ is IMyProgrammableBlock)ÿ.
CustomName=$"{Ə} Program";else ÿ.CustomName=$"{Ə} {ƀ(ÿ)}";}}int Ţ(){if(Ê==null)ì();if(Ê==null)return 1;string õ=Ê.CustomData;int ð
=õ.IndexOf("bldNum=");if(ð<0)return 1;int ñ=õ.IndexOf('\n',ð);if(ñ<0)ñ=õ.Length;string Ē=õ.Substring(ð+7,ñ-ð-7).Trim();
int Ĕ;if(int.TryParse(Ē,out Ĕ))return Ĕ;return 1;}void Š(){IMyShipMergeBlock Ƌ=null,Ɛ=null;IMyShipConnector Ƒ=null;var ƌ=
new List<IMyShipMergeBlock>();GridTerminalSystem.GetBlocksOfType(ƌ,Ÿ=>Ÿ.CubeGrid==Me.CubeGrid&&Ÿ.CustomName.Contains(
$"[PAD{A}]"));if(ƌ.Count>0)Ƌ=ƌ[0];if(Ƌ==null||!Ƌ.IsConnected)return;var Ǝ=new List<IMyShipMergeBlock>();GridTerminalSystem.
GetBlocksOfType(Ǝ,Ÿ=>Ÿ.IsConnected&&Ÿ!=Ƌ);foreach(var Ÿ in Ǝ){if(Ř(Ÿ.GetPosition(),Ƌ.GetPosition())<3){Ɛ=Ÿ;break;}}if(Ɛ==null)return;
var ƒ=new List<IMyShipConnector>();GridTerminalSystem.GetBlocksOfType(ƒ,Ɠ=>Ɠ.CubeGrid==Me.CubeGrid&&Ɠ.CustomName.Contains(
$"[PAD{A}-CON"));if(ƒ.Count>0)Ƒ=ƒ[0];Vector3D Ɣ=Ɛ.GetPosition();Vector3D ƕ=Ƌ.GetPosition();Vector3D Ɩ=ř(Ɣ-ƕ);var Ɨ=new List<
IMyShipConnector>();GridTerminalSystem.GetBlocksOfType(Ɨ);var Ƙ=new List<IMyShipConnector>();foreach(var Ɠ in Ɨ){if(Ɠ==Ƒ)continue;string
Ą=Ɠ.CustomName;if(Ą.Contains("[PAD")||Ą.ToUpper().Contains("ORE"))continue;Vector3D ƙ=Ɠ.GetPosition()-ƕ;double ƚ=Vector3D
.Dot(ƙ,Ɩ);if(ƚ>0)Ƙ.Add(Ɠ);}if(Ƙ.Count==0)return;IMyShipConnector ƛ=null,Ɯ=null;double Ɲ=double.MaxValue,ƞ=0;Vector3D Ɵ=Ƒ
!=null?Ƒ.GetPosition():ƕ;int ţ=Ţ();foreach(var Ɠ in Ƙ){double ų=Ř(Ɠ.GetPosition(),Ɵ);if(ų<Ɲ){Ɲ=ų;ƛ=Ɠ;}if(ų>ƞ){ƞ=ų;Ɯ=Ɠ;}}if
(ƛ!=null)ƛ.CustomName=$"[PAD{A}] Missile #{ţ} Connector [DOCK]";if(Ɯ!=null&&Ɯ!=ƛ)Ɯ.CustomName=
$"[PAD{A}] Missile #{ţ} Connector [AMMO]";}bool ƈ(IMyTerminalBlock ÿ){string Ĕ=ÿ.CustomName;return Ĕ.Contains("[PAD")||Ĕ.Contains("[PRINT]")||Ĕ.Contains("[DOCK]"
)||Ĕ.Contains("[AMMO]");}string ƀ(IMyTerminalBlock ÿ){string ĵ=ÿ.BlockDefinition.SubtypeId;if(string.IsNullOrEmpty(ĵ)){if
(ÿ is IMyGasGenerator)return"O2/H2 Gen";if(ÿ is IMyGasTank)return"Gas Tank";ĵ=ÿ.BlockDefinition.TypeIdString.Replace(
"MyObjectBuilder_","");}return ĵ.Contains("Battery")?"Battery":ĵ.Contains("HydrogenTank")?"H2 Tank":ĵ.Contains("OxygenTank")?"O2 Tank":ĵ.
Contains("LargeContainer")?"Large Cargo":ĵ.Contains("MediumContainer")?"Medium Cargo":ĵ.Contains("SmallContainer")?"Small Cargo"
:ĵ.Contains("Refinery")?"Refinery":ĵ.Contains("Assembler")?"Assembler":ĵ.Contains("RadioAntenna")?"Antenna":ĵ.Contains(
"LaserAntenna")?"Laser Ant":ĵ.Contains("Gyro")?"Gyroscope":ĵ.Contains("HydrogenThrust")?"H2 Thruster":ĵ.Contains("AtmosphericThrust")?
"Atmo Thruster":ĵ.Contains("Thrust")?"Ion Thruster":ĵ.Contains("Programmable")?"Program":ĵ.Contains("Merge")?"Merge Block":ĵ.Contains(
"Connector")?"Connector":ĵ.Contains("Projector")?"Projector":ĵ.Contains("Piston")?"Piston":ĵ.Contains("Camera")?"Camera":ĵ.Contains
("Sensor")?"Sensor":ĵ.Contains("RemoteControl")?"Remote Control":ĵ.Contains("Warhead")?"Warhead":ĵ.Contains("ButtonPanel"
)?"Button Panel":ĵ.Contains("LCD")?"LCD Panel":ĵ.Contains("Reactor")?"Reactor":ĵ.Contains("Solar")?"Solar Panel":ĵ.
Contains("Wind")?"Wind Turbine":ĵ.Contains("Medical")?"Medical Room":ĵ.Contains("Survival")?"Survival Kit":ĵ.Contains("Cryo")?
"Cryo Chamber":ĵ.Contains("Cockpit")?"Cockpit":ĵ;}}
