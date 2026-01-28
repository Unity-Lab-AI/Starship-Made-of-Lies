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
int A=0,B=0,C=0,D=0,E=0,F=0;bool G=false,H=true;    bool I=false,J=false;
    float K=512,L=512,M=1,N=1;
    string O="[PAD1";
    IMyButtonPanel P;
    IMyTextSurface Q,R,S,T,U,V;
    int W=0;
    IMyBroadcastListener X;
    Dictionary<long,Y> Z=new Dictionary<long,Y>();
    class Y{public string a,b,c="";public float d,e,f,g;public Vector3D h;public double i,j,k,l,m,n;public int o,p,q,r,s,t,u,v,w,x,y;public bool z,ª;public DateTime µ;public Dictionary<string,int> º=new Dictionary<string,int>();}
    Color À=new Color(0,180,255),Á=new Color(100,100,100),Â=new Color(255,200,0),Ã=new Color(0,255,100),Ä=new Color(255,180,0),Å=new Color(255,60,60),Æ=new Color(10,10,15),Ç=new Color(40,40,50),È=new Color(220,220,220);
    List<float> É=new List<float>(),Ê=new List<float>(),Ë=new List<float>(),Ì=new List<float>(),Í=new List<float>(),Î=new List<float>(),Ï=new List<float>(),Ð=new List<float>(),Ñ=new List<float>(),Ò=new List<float>(),Ó=new List<float>(),Ô=new List<float>(),Õ=new List<float>();
    const int Ö=60;
    IMyCargoContainer Ø=null,Ù=null,Ú=null,Û=null,Ü=null,Ý=null,Þ=null,ß=null,à=null,á=null;
    List<IMyCargoContainer> â=new List<IMyCargoContainer>(),ã=new List<IMyCargoContainer>(),ä=new List<IMyCargoContainer>(),å=new List<IMyCargoContainer>(),æ=new List<IMyCargoContainer>(),ç=new List<IMyCargoContainer>();
    List<IMyRefinery> è=new List<IMyRefinery>();
    List<IMyAssembler> é=new List<IMyAssembler>();
    List<IMyReactor> ê=new List<IMyReactor>();
    List<IMyGasGenerator> ë=new List<IMyGasGenerator>();
    List<IMyShipConnector> ì=new List<IMyShipConnector>();
    HashSet<long> í=new HashSet<long>();
    Dictionary<string,int> î=new Dictionary<string,int>(),ï=new Dictionary<string,int>(),ð=new Dictionary<string,int>(),ñ=new Dictionary<string,int>(),ò=new Dictionary<string,int>(),ó=new Dictionary<string,int>(),ô=new Dictionary<string,int>(),õ=new Dictionary<string,int>(),ö=new Dictionary<string,int>(),ø=new Dictionary<string,int>(),ù=new Dictionary<string,int>(),ú=new Dictionary<string,int>(),û=new Dictionary<string,int>(),ü=new Dictionary<string,int>(),ý=new Dictionary<string,int>(),þ=new Dictionary<string,int>(),ÿ=new Dictionary<string,int>(),Ā=new Dictionary<string,int>(),ā=new Dictionary<string,int>(),Ă=new Dictionary<string,int>(),ă=new Dictionary<string,int>(),Ą=new Dictionary<string,int>(),ą=new Dictionary<string,int>(),Ć=new Dictionary<string,int>(),ć=new Dictionary<string,int>(),Ĉ=new Dictionary<string,int>(),ĉ=new Dictionary<string,int>(),Ċ=new Dictionary<string,int>();
    Dictionary<string,MyDefinitionId> ċ=new Dictionary<string,MyDefinitionId>(),Č=new Dictionary<string,MyDefinitionId>(),č=new Dictionary<string,MyDefinitionId>(),Ď=new Dictionary<string,MyDefinitionId>(),Đ=new Dictionary<string,MyDefinitionId>{
    {"SteelPlate",MyDefinitionId.Parse(ď+"SteelPlate")},
    {"Construction",MyDefinitionId.Parse(ď+"ConstructionComponent")},
    {"SmallTube",MyDefinitionId.Parse(ď+"SmallTube")},
    {"LargeTube",MyDefinitionId.Parse(ď+"LargeTube")},
    {"Motor",MyDefinitionId.Parse(ď+"MotorComponent")},
    {"Computer",MyDefinitionId.Parse(ď+"ComputerComponent")},
    {"MetalGrid",MyDefinitionId.Parse(ď+"MetalGrid")},
    {"Display",MyDefinitionId.Parse(ď+"Display")},
    {"BulletproofGlass",MyDefinitionId.Parse(ď+"BulletproofGlass")},
    {"PowerCell",MyDefinitionId.Parse(ď+"PowerCell")},
    {"Thrust",MyDefinitionId.Parse(ď+"ThrustComponent")},
    {"Explosives",MyDefinitionId.Parse(ď+"ExplosivesComponent")},
    {"Detector",MyDefinitionId.Parse(ď+"DetectorComponent")},
    {"RadioCommunication",MyDefinitionId.Parse(ď+"RadioCommunicationComponent")},
    {"GravityGenerator",MyDefinitionId.Parse(ď+"GravityGeneratorComponent")},
    {"InteriorPlate",MyDefinitionId.Parse(ď+"InteriorPlate")},
    {"Girder",MyDefinitionId.Parse(ď+"GirderComponent")},
    {"Medical",MyDefinitionId.Parse(ď+"MedicalComponent")},
    {"Reactor",MyDefinitionId.Parse(ď+"ReactorComponent")},
    {"SolarCell",MyDefinitionId.Parse(ď+"SolarCell")},
    {"Superconductor",MyDefinitionId.Parse(ď+"Superconductor")},
    {"Canvas",MyDefinitionId.Parse(ď+"Position0030_Canvas")},
    {"ZoneChip",MyDefinitionId.Parse(ď+"ZoneChip")},
    {"PrototechCapacitor",MyDefinitionId.Parse(ď+"PrototechCapacitor")},
    {"PrototechCircuitry",MyDefinitionId.Parse(ď+"PrototechCircuitry")},
    {"PrototechCoolingUnit",MyDefinitionId.Parse(ď+"PrototechCoolingUnit")},
    {"PrototechFrame",MyDefinitionId.Parse(ď+"PrototechFrame")},
    {"PrototechMachinery",MyDefinitionId.Parse(ď+"PrototechMachinery")},
    {"PrototechPanel",MyDefinitionId.Parse(ď+"PrototechPanel")},
    {"PrototechPropulsionUnit",MyDefinitionId.Parse(ď+"PrototechPropulsionUnit")}};
    int đ=500,Ē=0,ē=500,Ĕ=0,ĕ=10106,Ė=0,ė=0,Ę=0,ę=20,Ě=20,ě=0,Ĝ=0,ĝ=0,Ğ=0,ğ=0,Ġ=0,ġ=0,Ģ=0,ģ=20,Ĥ=50000,ĥ=0,Ħ=0,ħ=0,Ĩ=0,ĩ=0,Ī=0,ī=0,Ĭ=0,ĭ=0,Į=0,į=0,İ=0,ı=0,Ĳ=0,ĳ=0,Ĵ=0,ĵ=0,Ķ=0;
    bool ķ=false,ĸ=false,Ĺ=false,ĺ=false;int Ļ=0,ļ=0,Ľ=0,ľ=0,Ŀ=0,ŀ=0,Ł=0,ł=0,Ń=0,ń=0,Ņ=0;
    IMyShipConnector ņ=null;
    HashSet<string> Ň=new HashSet<string>();
    float ň=0,ŉ=0,Ŋ=0,ŋ=0,Ō=0,ō=0,Ŏ=0,ŏ=0,Ő=0,ő=0,Œ=0,œ=0,Ŕ=0;
    string ŕ="NORMAL",Ŗ="IDLE",ŗ="---",Ř="CHECKING";
float ř=0,Ś=0,ś=0,Ŝ=0,ŝ=0,Ş=0;string ş="GPS",Š="---",š="IDLE";
bool Ţ=false;
    const string ď="MyObjectBuilder_BlueprintDefinition/",ţ="MyObjectBuilder_";
    string[] Ť={"S-10 Pistol","MR-20 Rifle","MR-50A Rifle","200mm Missile","25x184mm NATO","Autocannon","Assault Cannon","Artillery","Small Railgun","Large Railgun"},ť={"Position0010_SemiAutoPistolMagazine","Position0040_AutomaticRifleGun_Mag_20rd","Position0050_RapidFireAutomaticRifleGun_Mag_50rd","Position0100_Missile200mm","Position0080_NATO_25x184mmMagazine","Position0090_AutocannonClip","Position0110_MediumCalibreAmmo","Position0120_LargeCalibreAmmo","Position0130_SmallRailgunAmmo","Position0140_LargeRailgunAmmo"},Ŧ={"SemiAutoPistolMagazine","AutomaticRifleGun_Mag_20rd","RapidFireAutomaticRifleGun_Mag_50rd","Missile200mm","NATO_25x184mm","AutocannonClip","MediumCalibreAmmo","LargeCalibreAmmo","SmallRailgunAmmo","LargeRailgunAmmo"},ŧ={"Drill","Welder","Grinder","Rifle","Pistol","Launcher","Flare"},Ũ={"AutomaticRifleGun_Mag_20rd","PreciseAutomaticRifleGun_Mag_5rd","RapidFireAutomaticRifleGun_Mag_50rd","UltimateAutomaticRifleGun_Mag_30rd","SemiAutoPistolMagazine","FullAutoPistolMagazine","ElitePistolMagazine","Missile200mm","FlareClip"},ũ={"AutomaticRifleGun_Mag_20rd","PreciseAutomaticRifleGun_Mag_5rd","RapidFireAutomaticRifleGun_Mag_50rd","UltimateAutomaticRifleGun_Mag_30rd","SemiAutoPistolMagazine","FullAutoPistolMagazine","ElitePistolMagazine","Missile200mm","FlareClip"};
    MyDefinitionId Ū;
    MyItemType ū,Ŭ=MyItemType.Parse(ţ+"GasContainerObject/HydrogenBottle"),ŭ=MyItemType.Parse(ţ+"OxygenContainerObject/OxygenBottle");
    string[][] Ů={new[]{"handdrill","handdrill2","handdrill3","handdrill4"},new[]{"welder","welder2","welder3","welder4"},new[]{"anglegrinder","anglegrinder2","anglegrinder3","anglegrinder4"},new[]{"automaticrifle","preciseautomaticrifle","rapidfireautomaticrifle","ultimateautomaticrifle"},new[]{"semiautopistol","fullautopistol","elitepistol"},new[]{"basichandheldlauncher","advancedhandheldlauncher"},new[]{"flaregun"}};
        
    public Program(){
    Runtime.UpdateFrequency=UpdateFrequency.Update100;
    if(ŧ.Length==0||Ů.Length==0||Ũ.Length==0||ũ.Length==0)return;
    ů();
    if(Ĥ<1000)Ĥ=50000;
    Ű();
    ű();
    X=IGC.RegisterBroadcastListener("MINER_BEACON");
    Ų=IGC.RegisterBroadcastListener("UNITY_BOOT_REQ");
    ų();
    Ŵ();
    ŵ();
    Ŷ();
    }
    void Ŷ(){
    int ŷ=ã.Count,Ÿ=è.Count,Ź=é.Count,ź=ë.Count;
    var Ż=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(Ż,ż=>ż.CubeGrid==Me.CubeGrid);
    int Ž=0,ž=0;foreach(var ż in Ż){if(ż.BlockDefinition.SubtypeId.Contains("Hydrogen"))Ž++;else ž++;}
    ſ();
    string ƀ="";string Ɓ="NOT_FOUND";
    if(Ƃ!=null){Ɓ=Ƃ.CustomName;string ƃ=Ƃ.CustomData;int Ƅ=ƃ.IndexOf("pad_session=");if(Ƅ>=0){int ƅ=ƃ.IndexOf('\n',Ƅ);if(ƅ<0)ƅ=ƃ.Length;ƀ=ƃ.Substring(Ƅ+12,ƅ-Ƅ-12).Trim();}}
    Me.CustomData=$"[SYSTEM]\ninv_ready=true\ninv_for_session={ƀ}\ninv_padPB={Ɓ}\ninv_myID={A}\ninv_status=OK:cargo={ŷ},ref={Ÿ},asm={Ź},gen={ź},h2={Ž},o2={ž}\n[QUOTAS]\n[MISSILE]\n[CONFIG]\n[WAYPOINTS]\n[STATUS]\n[ORE]\n[INGOTS]\n[COMPONENTS]\n[TURRET_AMMO]\n[BOTTLES]\n[TOOLS_WEAPONS]\n[PERSONAL_AMMO]\n";
    }
    void ų(){
    ċ["handdrill"]=MyDefinitionId.Parse(ď+"Position0050_HandDrill");ċ["handdrill2"]=MyDefinitionId.Parse(ď+"Position0060_HandDrill2");ċ["handdrill3"]=MyDefinitionId.Parse(ď+"Position0070_HandDrill3");ċ["handdrill4"]=MyDefinitionId.Parse(ď+"Position0080_HandDrill4");
    ċ["welder"]=MyDefinitionId.Parse(ď+"Position0090_Welder");ċ["welder2"]=MyDefinitionId.Parse(ď+"Position0100_Welder2");ċ["welder3"]=MyDefinitionId.Parse(ď+"Position0110_Welder3");ċ["welder4"]=MyDefinitionId.Parse(ď+"Position0120_Welder4");
    ċ["anglegrinder"]=MyDefinitionId.Parse(ď+"Position0010_AngleGrinder");ċ["anglegrinder2"]=MyDefinitionId.Parse(ď+"Position0020_AngleGrinder2");ċ["anglegrinder3"]=MyDefinitionId.Parse(ď+"Position0030_AngleGrinder3");ċ["anglegrinder4"]=MyDefinitionId.Parse(ď+"Position0040_AngleGrinder4");
    ċ["automaticrifle"]=MyDefinitionId.Parse(ď+"Position0040_AutomaticRifle");ċ["preciseautomaticrifle"]=MyDefinitionId.Parse(ď+"Position0060_PreciseAutomaticRifle");ċ["rapidfireautomaticrifle"]=MyDefinitionId.Parse(ď+"Position0050_RapidFireAutomaticRifle");ċ["ultimateautomaticrifle"]=MyDefinitionId.Parse(ď+"Position0070_UltimateAutomaticRifle");
    ċ["semiautopistol"]=MyDefinitionId.Parse(ď+"Position0010_SemiAutoPistol");ċ["fullautopistol"]=MyDefinitionId.Parse(ď+"Position0020_FullAutoPistol");ċ["elitepistol"]=MyDefinitionId.Parse(ď+"Position0030_EliteAutoPistol");
    ċ["basichandheldlauncher"]=MyDefinitionId.Parse(ď+"Position0080_BasicHandHeldLauncher");ċ["advancedhandheldlauncher"]=MyDefinitionId.Parse(ď+"Position0090_AdvancedHandHeldLauncher");
    ċ["flaregun"]=MyDefinitionId.Parse(ď+"Position0050_FlareGun");
    Č["AutomaticRifleGun_Mag_20rd"]=MyDefinitionId.Parse(ď+"Position0040_AutomaticRifleGun_Mag_20rd");Č["PreciseAutomaticRifleGun_Mag_5rd"]=MyDefinitionId.Parse(ď+"Position0060_PreciseAutomaticRifleGun_Mag_5rd");Č["RapidFireAutomaticRifleGun_Mag_50rd"]=MyDefinitionId.Parse(ď+"Position0050_RapidFireAutomaticRifleGun_Mag_50rd");Č["UltimateAutomaticRifleGun_Mag_30rd"]=MyDefinitionId.Parse(ď+"Position0070_UltimateAutomaticRifleGun_Mag_30rd");
    Č["SemiAutoPistolMagazine"]=MyDefinitionId.Parse(ď+"Position0010_SemiAutoPistolMagazine");Č["FullAutoPistolMagazine"]=MyDefinitionId.Parse(ď+"Position0020_FullAutoPistolMagazine");Č["ElitePistolMagazine"]=MyDefinitionId.Parse(ď+"Position0030_ElitePistolMagazine");
    Č["Missile200mm"]=MyDefinitionId.Parse(ď+"Position0100_Missile200mm");Č["FlareClip"]=MyDefinitionId.Parse(ď+"Position0051_FlareGunMagazine");
    č["HydrogenBottle"]=MyDefinitionId.Parse(ď+"Position0020_HydrogenBottle");č["OxygenBottle"]=MyDefinitionId.Parse(ď+"Position0010_OxygenBottle");
    č["Medkit"]=MyDefinitionId.Parse(ď+"Position0021_Medkit");č["Powerkit"]=MyDefinitionId.Parse(ď+"Position0022_Powerkit");
    Ď["NATO_25x184mm"]=MyDefinitionId.Parse(ď+"Position0080_NATO_25x184mmMagazine");Ď["AutocannonClip"]=MyDefinitionId.Parse(ď+"Position0090_AutocannonClip");Ď["MediumCalibreAmmo"]=MyDefinitionId.Parse(ď+"Position0110_MediumCalibreAmmo");Ď["LargeCalibreAmmo"]=MyDefinitionId.Parse(ď+"Position0120_LargeCalibreAmmo");Ď["SmallRailgunAmmo"]=MyDefinitionId.Parse(ď+"Position0130_SmallRailgunAmmo");Ď["LargeRailgunAmmo"]=MyDefinitionId.Parse(ď+"Position0140_LargeRailgunAmmo");Ď["Missile200mm"]=MyDefinitionId.Parse(ď+"Position0100_Missile200mm");
    }
    bool Ɖ(){if(Ɔ==null)ſ();if(Ɔ==null)return false;string Ƈ=Ɔ.CustomData;if(!Ƈ.Contains("boot_complete=true")||!Ƈ.Contains("boot_phase=COMPLETE"))return false;if(Ƃ==null)return true;string ƃ=Ƃ.CustomData;int Ƅ=ƃ.IndexOf("pad_session=");if(Ƅ<0)return true;int ƅ=ƃ.IndexOf('\n',Ƅ);if(ƅ<0)ƅ=ƃ.Length;string ƈ=ƃ.Substring(Ƅ+12,ƅ-Ƅ-12).Trim();return Ƈ.Contains($"boot_for_session={ƈ}");}
    bool Ɗ(){if(Ɔ==null)ſ();if(Ɔ==null)return false;return Ɔ.CustomData.Contains("boot_complete=BOOTING");}
    bool Ƌ(){if(Ɔ==null)ſ();if(Ɔ==null)return true;return Ɔ.CustomData.Contains("boot_complete=STALE")||(!Ɔ.CustomData.Contains("boot_complete=true")&&!Ɔ.CustomData.Contains("boot_complete=BOOTING"));}
    void ƌ(){if(J)return;IGC.SendBroadcastMessage("UNITY_BOOT_ACK","INV_RUNNING");J=true;}
    IMyBroadcastListener Ų;
    IMyProgrammableBlock Ɔ,Ƃ;
    void ſ(){Ɔ=Ƃ=null;var ƍ=new List<IMyProgrammableBlock>();GridTerminalSystem.GetBlocksOfType(ƍ,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid&&Ǝ!=Me);foreach(var Ə in ƍ){string Ɛ=Ə.CustomName;string Ƒ=Ɛ.ToUpper();if(Ɛ.Contains($"[PAD{A}")&&Ƒ.Contains("UNITY BOOT"))Ɔ=Ə;else if(Ɛ.Contains($"[PAD{A}]")&&Ƒ.Contains("UNITY PAD"))Ƃ=Ə;else if(Ƒ.Contains("UNITY PAD")&&Ƃ==null)Ƃ=Ə;}}
    void ƕ(){while(Ų!=null&&Ų.HasPendingMessage){var ƒ=Ų.AcceptMessage();string Ɠ=ƒ.Data.ToString();if(Ɠ=="INV_CHECK"||Ɠ==$"INV_CHECK:{A}")Ɣ();}}
    void Ɣ(){int ŷ=ã.Count,Ÿ=è.Count,Ź=é.Count,ź=ë.Count;int Ž=0,ž=0;var Ż=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(Ż,ż=>ż.CubeGrid==Me.CubeGrid);foreach(var ż in Ż){if(ż.BlockDefinition.SubtypeId.Contains("Hydrogen"))Ž++;else ž++;}string Ɩ=$"INV|OK|cargo={ŷ},ref={Ÿ},asm={Ź},gen={ź},h2={Ž},o2={ž}";IGC.SendBroadcastMessage("UNITY_BOOT_RSP",Ɩ);string Ƈ=Me.CustomData;Ƈ=Ƈ.Replace("inv_check=request","inv_check=done");Ƈ=Ƈ.Replace("inv_status=waiting",$"inv_status=OK:cargo={ŷ},ref={Ÿ},asm={Ź},gen={ź},h2={Ž},o2={ž}");Me.CustomData=Ƈ;}
    public void Save(){Storage=$"{A}|{ē}|{ģ}|{(H?"1":"0")}|{ę}|{Ě}|{ġ}|{Ģ}|{Ĥ}";}
    void ů(){if(string.IsNullOrEmpty(Storage))return;var Ɨ=Storage.Split('|');int Ƙ=Ɨ.Length;if(Ƙ>=1)int.TryParse(Ɨ[0],out A);if(Ƙ>=2)int.TryParse(Ɨ[1],out ē);if(Ƙ>=3)int.TryParse(Ɨ[2],out ģ);if(Ƙ>=4)H=Ɨ[3]=="1";if(Ƙ>=5)int.TryParse(Ɨ[4],out ę);if(Ƙ>=6)int.TryParse(Ɨ[5],out Ě);if(Ƙ>=7)int.TryParse(Ɨ[6],out ġ);if(Ƙ>=8)int.TryParse(Ɨ[7],out Ģ);if(Ƙ>=9)int.TryParse(Ɨ[8],out Ĥ);}
    void Ű(){if(A==0)A=1;O=$"[PAD{A}";Me.CustomName=$"[PAD{A}] UNITY INVENTORY";}
    void ű(){Ū=MyDefinitionId.Parse(ď+ť[Ė]);ū=MyItemType.Parse(ţ+"AmmoMagazine/"+Ŧ[Ė]);}
        
    public void Main(string ƙ,UpdateType ƚ){
    B++;
    if(Ƃ==null)ſ();
    if(P==null){var ƛ=new List<IMyButtonPanel>();GridTerminalSystem.GetBlocksOfType(ƛ,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid&&Ǝ.CustomName.ToLower().Contains("control"));if(ƛ.Count>0)P=ƛ[0];}
    ƕ();
    if(!I&&Ƌ()){Echo("UNITY INVENTORY");Echo("Awaiting boot compile...");return;}
    if(Ɗ()){Echo("UNITY INVENTORY");Echo("Boot in progress...");return;}
    if(!Ɖ()){I=false;Echo("UNITY INVENTORY");Echo("Waiting for boot...");return;}
    ƌ();
    if(!I){I=true;Ɯ();ŵ();}
    int Ɲ=î.Count+ð.Count+ï.Count+û.Count+ù.Count+(ė>0?1:0)+(Ę>0?1:0)+(Ē>0?1:0);
    if(C==4||C==5){if(B%2==0)E++;F++;if(F>30){F=0;E=0;C=(C+1)%7;}}
    else{F++;if(F>30){F=0;E=0;C=(C+1)%7;}}
    if(B%30==0)D=(D+1)%12;
    if(ƙ!="")ƞ(ƙ);
    if(B%2==0)ŵ();
    if(B%2==0)Ɵ();
    Ơ();
    if(B%5==0)ơ();
    if(B%3==0)Ƣ();
    if(B%5==0)ƣ();
    Ƥ();
    ƥ();
    if(B%2==0)Ʀ();
    Echo("Unity Missile System");
    Echo($"UnityInventory [PAD{A}]");
    Echo("---");
    string Ƨ=P!=null?"Connected":"MISSING";
    string ƨ=é.Count>0?$"{é.Count} Online":"NONE";
    string Ʃ=è.Count>0?$"{è.Count} Online":"NONE";
    bool ƪ=ô.Count>0||Ĕ>0||ě>0||Ĝ>0;
    string ƫ=ƪ?"Queuing Production":"Idle";
    string Ƭ=H?"Auto-Sorting Active":"Manual Sort Only";
    Echo($"Button Panel: {Ƨ}");
    Echo($"Assemblers: {ƨ}");
    Echo($"Refineries: {Ʃ}");
    Echo($"Production: {ƫ}");
    Echo($"Inventory: {Ƭ}");
    Echo($"Item Types: {Ɲ} tracked");
    Echo($"Miners: {Z.Count} tracked");
    if(é.Count==0)Echo("WARNING: No assemblers found");
    if(P==null)Echo("WARNING: No button panel found");
    Echo("--- COMMANDS ---");
    Echo("SORT - Force inventory sort");
    Echo("RESCAN - Refresh all blocks");
    Echo("AUTOORG - Toggle auto-sorting");
    }
        
    void ƞ(string ƙ){switch(ƙ.ToUpper()){case"SORT":ƭ();break;case"RESCAN":ŵ();break;case"AUTOORG":H=!H;break;}}
        
    void ŵ(){
    ã.Clear();ä.Clear();å.Clear();æ.Clear();è.Clear();é.Clear();ê.Clear();ë.Clear();ì.Clear();if(P!=null&&P.Closed)P=null;ņ=null;
    Ø=Ù=Ú=Û=Ü=Ý=Þ=ß=à=á=null;ç.Clear();â.Clear();
    if(Q!=null&&((IMyTerminalBlock)Q).Closed)Q=null;
    if(R!=null&&((IMyTerminalBlock)R).Closed)R=null;
    if(S!=null&&((IMyTerminalBlock)S).Closed)S=null;
    if(T!=null&&((IMyTerminalBlock)T).Closed)T=null;
    if(U!=null&&((IMyTerminalBlock)U).Closed)U=null;
    if(V!=null&&((IMyTerminalBlock)V).Closed)V=null;
    ĥ=0;Ħ=0;ħ=0;
    var Ʈ=new List<IMyTerminalBlock>();
    GridTerminalSystem.GetBlocksOfType(Ʈ,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid);
    foreach(var Ǝ in Ʈ){
    if(Ǝ is IMyButtonPanel&&Ǝ.CustomName.ToLower().Contains("control")&&P==null)P=Ǝ as IMyButtonPanel;
    if(Ǝ is IMyRefinery)è.Add(Ǝ as IMyRefinery);
    if(Ǝ is IMyAssembler){string Ư=Ǝ.BlockDefinition.SubtypeId;if(!Ư.Contains("Survival")&&!Ư.Contains("Kit"))é.Add(Ǝ as IMyAssembler);}
    if(Ǝ is IMyReactor)ê.Add(Ǝ as IMyReactor);
    if(Ǝ is IMyGasGenerator)ë.Add(Ǝ as IMyGasGenerator);
    if(Ǝ is IMyShipConnector){var ư=Ǝ as IMyShipConnector;string ƚ=Ǝ.CustomName.ToUpper();if(ƚ.Contains("ORE"))ì.Add(ư);else if(ņ==null&&ƚ.Contains("FUEL"))ņ=ư;}
    if(Ǝ is IMyMedicalRoom){string Ʊ=Ǝ.BlockDefinition.SubtypeId;if(Ʊ.Contains("Survival")||Ʊ.Contains("Kit"))Ħ++;else ĥ++;}
    if(Ǝ is IMyCockpit&&Ǝ.BlockDefinition.SubtypeId.Contains("Cryo"))ħ++;
    if(Ǝ is IMyTextSurface||Ǝ is IMyTextPanel){string Ɛ=Ǝ.CustomName;if(!Ɛ.Contains(O))continue;IMyTextSurface Ʋ=Ǝ is IMyTextSurface?(IMyTextSurface)Ǝ:((IMyTextPanel)Ǝ);if(Ɛ.Contains(":11")&&V==null)V=Ʋ;else if(Ɛ.Contains(":10")&&U==null)U=Ʋ;else if(Ɛ.Contains(":4")&&Q==null)Q=Ʋ;else if(Ɛ.Contains(":5")&&R==null)R=Ʋ;else if(Ɛ.Contains(":6")&&S==null)S=Ʋ;else if(Ɛ.Contains(":9")&&T==null)T=Ʋ;}
    }
    if(P==null){var Ƴ=new List<IMyButtonPanel>();GridTerminalSystem.GetBlocksOfType(Ƴ,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid);foreach(var ƛ in Ƴ)if(ƛ.CustomName.ToLower().Contains("control")&&P==null)P=ƛ;}
    if(P==null){var Ƴ=new List<IMyButtonPanel>();GridTerminalSystem.GetBlocksOfType(Ƴ);foreach(var ƛ in Ƴ)if(ƛ.CustomName.ToLower().Contains("control")&&P==null)P=ƛ;}
    var ƴ=new List<IMyTerminalBlock>();GridTerminalSystem.GetBlocksOfType(ƴ,Ǝ=>Ǝ.IsSameConstructAs(Me)&&Ǝ.CubeGrid!=Me.CubeGrid);
    foreach(var Ǝ in ƴ){if(Ǝ is IMyRefinery&&!è.Contains(Ǝ as IMyRefinery))è.Add(Ǝ as IMyRefinery);if(Ǝ is IMyAssembler){var Ƶ=Ǝ as IMyAssembler;string Ư=Ǝ.BlockDefinition.SubtypeId;if(!Ư.Contains("Survival")&&!Ư.Contains("Kit")&&!é.Contains(Ƶ))é.Add(Ƶ);}if(Ǝ is IMyReactor&&!ê.Contains(Ǝ as IMyReactor))ê.Add(Ǝ as IMyReactor);if(Ǝ is IMyGasGenerator&&!ë.Contains(Ǝ as IMyGasGenerator))ë.Add(Ǝ as IMyGasGenerator);}
    var ƶ=new List<IMyCargoContainer>();
    GridTerminalSystem.GetBlocksOfType(ƶ);
    string Ʒ=$"[pad{A}".ToLower();
    foreach(var Ƹ in ƶ){
    string ƹ=Ƹ.CustomName.ToLower().Replace(" ","");
    bool ƺ=ƹ.Contains(Ʒ),ƻ=false,Ƽ=!ƹ.Contains("[pad"),ƽ=ƹ.Contains("-ore")||ƹ.Contains("-ingot");
    for(int Ɨ=1;Ɨ<=8;Ɨ++)if(Ɨ!=A&&ƹ.Contains($"[pad{Ɨ}"))ƻ=true;
    bool ƾ=Ƹ.IsSameConstructAs(Me);
    bool ƿ=Ƹ.CubeGrid==Me.CubeGrid;
    bool ǀ=ƾ&&!ƿ;
    if(!ƾ&&!ƺ)continue;
    if(ƻ&&!ƽ)continue;
    ã.Add(Ƹ);
    if(ǀ)â.Add(Ƹ);
    string Ʊ=Ƹ.BlockDefinition.SubtypeId;
    if(Ʊ.Contains("LargeContainer"))ä.Add(Ƹ);
    else if(Ʊ.Contains("MediumContainer"))å.Add(Ƹ);
    else æ.Add(Ƹ);
    }
    ã.Sort((ƙ,Ǝ)=>{string ǁ=ƙ.BlockDefinition.SubtypeId,ǂ=Ǝ.BlockDefinition.SubtypeId;int ǃ=ǁ.Contains("Large")?0:ǁ.Contains("Medium")?1:2,Ǆ=ǂ.Contains("Large")?0:ǂ.Contains("Medium")?1:2;return ǃ-Ǆ;});
    foreach(var ǅ in ã){
    string ƹ=ǅ.CustomName.ToLower().Replace(" ","");
    bool ǆ=A==0||ƹ.Contains(Ʒ),ƽ=ƹ.Contains("-ore")||ƹ.Contains("-ingot");
    if(ƹ.Contains("-ore")&&(ǆ||ƽ)&&Ù==null)Ù=ǅ;
    else if(ƹ.Contains("-ingot")&&(ǆ||ƽ)&&Ú==null)Ú=ǅ;
    else if(ƹ.Contains("-comp")&&ǆ&&Û==null)Û=ǅ;
    else if(ƹ.Contains("-tools")&&ǆ&&Ø==null)Ø=ǅ;
    else if(ƹ.Contains("-pammo")&&ǆ&&Þ==null)Þ=ǅ;
    else if(ƹ.Contains("-ammo")&&ǆ&&Ü==null)Ü=ǅ;
    else if(ƹ.Contains("-bottle")&&ǆ&&Ý==null)Ý=ǅ;
    else if(ƹ.Contains("-food")&&ǆ&&ß==null)ß=ǅ;
    else if(ƹ.Contains("-data")&&ǆ&&à==null)à=ǅ;
    else if(ƹ.Contains("-misc")&&ǆ&&á==null)á=ǅ;
    else if(!ƹ.Contains("[pad"))ç.Add(ǅ);
    }
    Ǉ();
    G=P!=null&&ã.Count>0;
    }
        
    void Ǉ(){í.Clear();foreach(var ư in ì){if(ư.Status!=MyShipConnectorStatus.Connected)continue;var ǈ=ư.OtherConnector;if(ǈ==null||ǈ.CubeGrid==Me.CubeGrid)continue;í.Add(ǈ.CubeGrid.EntityId);}if(ņ!=null&&ņ.Status==MyShipConnectorStatus.Connected){var ǈ=ņ.OtherConnector;if(ǈ!=null&&ǈ.CubeGrid!=Me.CubeGrid)í.Add(ǈ.CubeGrid.EntityId);}}
        
    void Ƣ(){
    î.Clear();ð.Clear();ï.Clear();û.Clear();Ă.Clear();ć.Clear();ą.Clear();Ć.Clear();ù.Clear();ė=0;Ę=0;
    Action<IMyInventory>ǐ=ǉ=>{if(ǉ==null)return;foreach(var ǋ in Ǌ(ǉ)){string ǌ=ǋ.Type.TypeId.ToLower(),Ǎ=ǋ.Type.SubtypeId;int ƙ=(int)ǋ.Amount;if(ǌ.Contains("ore")&&!ǌ.Contains("oxygencontainer"))ǎ(î,Ǎ,ƙ);else if(ǌ.Contains("ingot"))ǎ(ð,Ǎ,ƙ);else if(ǌ.Contains("component"))ǎ(ï,Ǎ,ƙ);else if(ǌ.Contains("gascontainerobject"))ǎ(Ă,Ǎ,ƙ);else if(ǌ.Contains("oxygencontainerobject"))ǎ(Ă,Ǎ,ƙ);else if(ǌ.Contains("physicalgunobject"))ǎ(û,Ǐ(Ǎ),ƙ);else if(ǌ.Contains("consumableitem"))ǎ(ą,Ǎ,ƙ);else if(ǌ.Contains("datapad"))ǎ(Ć,"Datapad",ƙ);else if(ǌ.Contains("physicalobject"))ǎ(Ć,Ǎ,ƙ);else ǎ(Ć,Ǎ,ƙ);}};
    Action<IMyInventory>ǒ=ǉ=>{if(ǉ==null)return;ė+=(int)ǉ.GetItemAmount(Ŭ);Ę+=(int)ǉ.GetItemAmount(ŭ);for(int Ǒ=0;Ǒ<ũ.Length;Ǒ++){int ƙ=(int)ǉ.GetItemAmount(MyItemType.Parse(ţ+"AmmoMagazine/"+ũ[Ǒ]));if(ƙ>0)ǎ(ù,ũ[Ǒ],ƙ);}};
    foreach(var ǅ in ã){ǐ(ǅ.GetInventory());ǒ(ǅ.GetInventory());}
    if(Ø!=null&&!ã.Contains(Ø))ǐ(Ø.GetInventory());
    if(Þ!=null&&!ã.Contains(Þ))ǐ(Þ.GetInventory());
    if(Ü!=null&&!ã.Contains(Ü)){ǐ(Ü.GetInventory());ǒ(Ü.GetInventory());}
    if(Ý!=null&&!ã.Contains(Ý)){ǐ(Ý.GetInventory());ǒ(Ý.GetInventory());}
    foreach(var ǅ in ç)if(!ã.Contains(ǅ))ǐ(ǅ.GetInventory());
    foreach(var ƙ in é){var Ǔ=ƙ.GetInventory(1);if(Ǔ!=null){ǒ(Ǔ);foreach(var ǋ in Ǌ(Ǔ)){string ǌ=ǋ.Type.TypeId.ToLower(),Ǎ=ǋ.Type.SubtypeId;int ǔ=(int)ǋ.Amount;if(ǌ.Contains("gascontainerobject"))ǎ(Ă,Ǎ,ǔ);else if(ǌ.Contains("oxygencontainerobject"))ǎ(Ă,Ǎ,ǔ);else if(ǌ.Contains("physicalgunobject"))ǎ(û,Ǐ(Ǎ),ǔ);else if(ǌ.Contains("component"))ǎ(ï,Ǎ,ǔ);}}}
    Ǖ("SteelPlate",6000);Ǖ("Construction",3500);Ǖ("SmallTube",3200);Ǖ("LargeTube",1500);Ǖ("Motor",1200);Ǖ("Computer",1500);Ǖ("MetalGrid",950);Ǖ("Display",600);Ǖ("BulletproofGlass",2050);Ǖ("PowerCell",800);Ǖ("Thrust",1050);Ǖ("Explosives",2600);Ǖ("Detector",1500);Ǖ("RadioCommunication",900);Ǖ("GravityGenerator",600);Ǖ("InteriorPlate",3000);Ǖ("Girder",500);Ǖ("Medical",200);Ǖ("Reactor",300);Ǖ("SolarCell",500);Ǖ("Superconductor",300);
    ǖ("Iron",100000);ǖ("Nickel",50000);ǖ("Silicon",50000);ǖ("Cobalt",30000);ǖ("Silver",20000);ǖ("Gold",10000);ǖ("Magnesium",10000);ǖ("Uranium",10000);ǖ("Platinum",5000);ǖ("Stone",50000);
    ó.Clear();
    foreach(var ǘ in ò){int Ǘ=0;if(ï.ContainsKey(ǘ.Key))Ǘ=ï[ǘ.Key];if(Ǘ<ǘ.Value)ó[ǘ.Key]=ǘ.Value-Ǘ;}
    Ǚ();
    Ē=0;Ĕ=0;
    foreach(var ǅ in ã){var ǚ=ǅ.GetInventory();if(ǚ!=null)Ē+=(int)ǚ.GetItemAmount(ū);}
    if(Ü!=null&&!ã.Contains(Ü)){var ǚ=Ü.GetInventory();if(ǚ!=null)Ē+=(int)ǚ.GetItemAmount(ū);}
    foreach(var ƙ in é){var ǚ=ƙ.GetInventory(1);if(ǚ!=null)Ē+=(int)ǚ.GetItemAmount(ū);if(ƙ.Mode!=MyAssemblerMode.Assembly)continue;var Ǜ=new List<MyProductionItem>();ƙ.GetQueue(Ǜ);foreach(var Ǒ in Ǜ)if(Ǒ.BlueprintId.SubtypeName==ť[Ė])Ĕ+=(int)Ǒ.Amount;}
    ě=0;Ĝ=0;ă.Clear();ü.Clear();ú.Clear();Ċ.Clear();
    foreach(var ƙ in é){if(ƙ.Mode!=MyAssemblerMode.Assembly)continue;var Ǜ=new List<MyProductionItem>();ƙ.GetQueue(Ǜ);foreach(var Ǒ in Ǜ){string ǜ=Ǒ.BlueprintId.SubtypeName;int ǔ=(int)Ǒ.Amount;string Ǟ=ǝ(ǜ);
    if(Ǟ=="HydrogenBottle"){ě+=ǔ;ǎ(ă,"HydrogenBottle",ǔ);}
    if(Ǟ=="OxygenBottle"){Ĝ+=ǔ;ǎ(ă,"OxygenBottle",ǔ);}
    string ǟ=Ǐ(Ǟ);if(ċ.ContainsKey(ǟ))ǎ(ü,ǟ,ǔ);
    if(Č.ContainsKey(Ǟ))ǎ(ú,Ǟ,ǔ);
    if(Ď.ContainsKey(Ǟ))ǎ(Ċ,Ǟ,ǔ);}}
    foreach(var ǅ in ã){var Ǡ=ǅ.GetInventory();if(Ǡ==null)continue;foreach(var ǡ in Ď.Keys){int ƙ=(int)Ǡ.GetItemAmount(MyItemType.Parse(ţ+"AmmoMagazine/"+ǡ));if(ƙ>0)ǎ(ć,ǡ,ƙ);}}
    if(Ü!=null&&!ã.Contains(Ü)){var Ǣ=Ü.GetInventory();if(Ǣ!=null)foreach(var ǡ in Ď.Keys){int ƙ=(int)Ǣ.GetItemAmount(MyItemType.Parse(ţ+"AmmoMagazine/"+ǡ));if(ƙ>0)ǎ(ć,ǡ,ƙ);}}
    if(Ù!=null&&!ã.Contains(Ù)){var ǣ=Ù.GetInventory();if(ǣ!=null)foreach(var ǡ in Ď.Keys){int ƙ=(int)ǣ.GetItemAmount(MyItemType.Parse(ţ+"AmmoMagazine/"+ǡ));if(ƙ>0)ǎ(ć,ǡ,ƙ);}}
    foreach(var ǅ in ç){var Ǡ=ǅ.GetInventory();if(Ǡ==null)continue;foreach(var ǡ in Ď.Keys){int ƙ=(int)Ǡ.GetItemAmount(MyItemType.Parse(ţ+"AmmoMagazine/"+ǡ));if(ƙ>0)ǎ(ć,ǡ,ƙ);}}
    foreach(var ǅ in â){var Ǡ=ǅ.GetInventory();if(Ǡ==null)continue;foreach(var ǡ in Ď.Keys){int ƙ=(int)Ǡ.GetItemAmount(MyItemType.Parse(ţ+"AmmoMagazine/"+ǡ));if(ƙ>0)ǎ(ć,ǡ,ƙ);}}
    ğ=ð.ContainsKey("Uranium")?ð["Uranium"]:0;Ġ=0;foreach(var Ǥ in ê){var ǚ=Ǥ.GetInventory();if(ǚ!=null)foreach(var ǋ in Ǌ(ǚ))if(ǋ.Type.SubtypeId=="Uranium")Ġ+=(int)ǋ.Amount;}
    ĝ=î.ContainsKey("Ice")?î["Ice"]:0;Ğ=0;foreach(var ǥ in ë){var ǚ=ǥ.GetInventory();if(ǚ!=null)foreach(var ǋ in Ǌ(ǚ))if(ǋ.Type.SubtypeId=="Ice")Ğ+=(int)ǋ.Amount;}
    if(ã.Count>0){float ǅ=0,Ǧ=0;foreach(var ǥ in ã){var Ǒ=ǥ.GetInventory();if(Ǒ!=null){ǅ+=(float)Ǒ.CurrentVolume;Ǧ+=(float)Ǒ.MaxVolume;}}ň=Ǧ>0?(ǅ/Ǧ)*100:0;}else ň=0;
    var ǧ=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(ǧ,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid);
    float Ǩ=0,ǩ=0;foreach(var Ǝ in ǧ){Ǩ+=Ǝ.CurrentStoredPower;ǩ+=Ǝ.MaxStoredPower;}ŉ=ǩ>0?(Ǩ/ǩ)*100:0;
    var Ż=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(Ż,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid);
    float Ž=0,Ǫ=0,ž=0,ǫ=0;foreach(var ż in Ż){string ƹ=ż.BlockDefinition.SubtypeId.ToLower();if(ƹ.Contains("hydrogen")){Ž+=(float)ż.FilledRatio*ż.Capacity;Ǫ+=ż.Capacity;}else{ž+=(float)ż.FilledRatio*ż.Capacity;ǫ+=ż.Capacity;}}
    Ŋ=Ǫ>0?(Ž/Ǫ)*100:0;ŋ=ǫ>0?(ž/ǫ)*100:0;
    Ǭ();
    }
        
    void Ǭ(){if(é.Count==0){Echo("NO ASSEMBLERS!");return;}var ǭ=é[é.Count-1];for(int Ǒ=0;Ǒ<é.Count-1;Ǒ++)é[Ǒ].Mode=MyAssemblerMode.Assembly;int Ǯ=Ė==0?Ĥ:ē;if(Ē+Ĕ<Ǯ){int ǯ=Ǯ-(Ē+Ĕ);int ǰ=é.Count-1;if(ǰ<1)ǰ=1;int Ǳ=Math.Max(1,ǯ/ǰ);for(int Ǒ=0;Ǒ<ǰ&&ǯ>0;Ǒ++)if(é[Ǒ].Mode==MyAssemblerMode.Assembly){é[Ǒ].AddQueueItem(Ū,(MyFixedPoint)Ǳ);Ĕ+=Ǳ;ǯ-=Ǳ;}}ô.Clear();foreach(var ƙ in é){var Ǜ=new List<MyProductionItem>();ƙ.GetQueue(Ǜ);foreach(var Ǒ in Ǜ){foreach(var ƛ in Đ){if(Ǒ.BlueprintId==ƛ.Value)ǎ(ô,ƛ.Key,(int)Ǒ.Amount);}}}if(õ.Count>0){int ǰ=é.Count-1;if(ǰ<1)ǰ=1;foreach(var ǘ in õ){int Ǘ=ï.ContainsKey(ǘ.Key)?ï[ǘ.Key]:0;int ǲ=ô.ContainsKey(ǘ.Key)?ô[ǘ.Key]:0;int ǳ=ǘ.Value-(Ǘ+ǲ);if(ǳ<=0||!Đ.ContainsKey(ǘ.Key))continue;var ƛ=Đ[ǘ.Key];int Ǳ=Math.Max(1,ǳ/ǰ);for(int Ǒ=0;Ǒ<ǰ&&ǳ>0;Ǒ++)if(é[Ǒ].Mode==MyAssemblerMode.Assembly){é[Ǒ].AddQueueItem(ƛ,(MyFixedPoint)Ǳ);ǎ(ô,ǘ.Key,Ǳ);ǳ-=Ǳ;}}}if(ó.Count>0){int ǰ=é.Count-1;if(ǰ<1)ǰ=1;foreach(var ǘ in ó){int ǲ=0;if(ô.ContainsKey(ǘ.Key))ǲ=ô[ǘ.Key];int ǳ=ǘ.Value-ǲ;if(ǳ<=0||!Đ.ContainsKey(ǘ.Key))continue;var ƛ=Đ[ǘ.Key];int Ǳ=Math.Max(1,ǳ/ǰ);for(int Ǒ=0;Ǒ<ǰ&&ǳ>0;Ǒ++)if(é[Ǒ].Mode==MyAssemblerMode.Assembly){é[Ǒ].AddQueueItem(ƛ,(MyFixedPoint)Ǳ);ǎ(ô,ǘ.Key,Ǳ);ǳ-=Ǳ;}}}Ǵ(þ,ü,ċ,û,ý);Ǵ(Ā,ú,Č,ù,ÿ);Ǵ(Ą,ă,č,Ă,ā);Ǵ(ĉ,Ċ,Ď,ć,Ĉ);ǵ();Ƕ();Ƿ();Ǹ();}
        
    void Ǹ(){
    if(é.Count<2)return;
    var ǹ=new Dictionary<string,MyDefinitionId>();
    ǹ["NATO_25x184mm"]=MyDefinitionId.Parse(ď+"Position0080_NATO_25x184mmMagazine");
    ǹ["AutocannonClip"]=MyDefinitionId.Parse(ď+"Position0090_AutocannonClip");
    ǹ["MediumCalibreAmmo"]=MyDefinitionId.Parse(ď+"Position0110_MediumCalibreAmmo");
    ǹ["LargeCalibreAmmo"]=MyDefinitionId.Parse(ď+"Position0120_LargeCalibreAmmo");
    ǹ["SmallRailgunAmmo"]=MyDefinitionId.Parse(ď+"Position0130_SmallRailgunAmmo");
    ǹ["LargeRailgunAmmo"]=MyDefinitionId.Parse(ď+"Position0140_LargeRailgunAmmo");
    ǹ["Missile200mm"]=MyDefinitionId.Parse(ď+"Position0100_Missile200mm");
    var Ǻ=new Dictionary<string,int>();
    foreach(var ǅ in ã){var Ǡ=ǅ.GetInventory();if(Ǡ==null)continue;foreach(var ǡ in ǹ.Keys){int ƙ=(int)Ǡ.GetItemAmount(MyItemType.Parse(ţ+"AmmoMagazine/"+ǡ));if(ƙ>0)ǎ(Ǻ,ǡ,ƙ);}}
    foreach(var ǅ in ç){var Ǡ=ǅ.GetInventory();if(Ǡ==null)continue;foreach(var ǡ in ǹ.Keys){int ƙ=(int)Ǡ.GetItemAmount(MyItemType.Parse(ţ+"AmmoMagazine/"+ǡ));if(ƙ>0)ǎ(Ǻ,ǡ,ƙ);}}
    var ǻ=new Dictionary<string,int>();foreach(var ǘ in Ǻ){int Ǽ=Ĉ.ContainsKey(ǘ.Key)?Ĉ[ǘ.Key]:đ;if(ǘ.Value>Ǽ)ǻ[ǘ.Key]=ǘ.Value-Ǽ;}
    var ǽ=new Dictionary<string,int>();foreach(var ǘ in ï){int Ǽ=ò.ContainsKey(ǘ.Key)?ò[ǘ.Key]:0;if(ǘ.Value>Ǽ)ǽ[ǘ.Key]=ǘ.Value-Ǽ;}
    var Ǿ=new Dictionary<string,int>();foreach(var ǘ in û){int Ǽ=ý.ContainsKey(ǘ.Key)?ý[ǘ.Key]:ģ;if(ǘ.Value>Ǽ)Ǿ[ǘ.Key]=ǘ.Value-Ǽ;}
    var ǿ=new Dictionary<string,int>();for(int Ǒ=0;Ǒ<ũ.Length;Ǒ++){string Ȁ=ũ[Ǒ];if(Ď.ContainsKey(Ȁ))continue;int Ǘ=ù.ContainsKey(Ȁ)?ù[Ȁ]:0;int Ǽ=ÿ.ContainsKey(Ȁ)?ÿ[Ȁ]:500;if(Ǘ>Ǽ)ǿ[Ȁ]=Ǘ-Ǽ;}
    int ȁ=ė>ę?ė-ę:0;
    int Ȃ=Ę>Ě?Ę-Ě:0;
    int ȃ=Ē>Ĥ?Ē-Ĥ:0;
    int Ȅ=0;foreach(var ǘ in ǽ)Ȅ+=ǘ.Value;foreach(var ǘ in Ǿ)Ȅ+=ǘ.Value;foreach(var ǘ in ǿ)Ȅ+=ǘ.Value;foreach(var ǘ in ǻ)Ȅ+=ǘ.Value;Ȅ+=ȁ+Ȃ+ȃ;
    if(Ȅ==0){foreach(var ƙ in é)if(ƙ.Mode==MyAssemblerMode.Disassembly&&ƙ.IsQueueEmpty){var ȅ=ƙ.GetInventory(1);if(ȅ!=null&&ȅ.ItemCount>0)continue;ƙ.Mode=MyAssemblerMode.Assembly;ƙ.UseConveyorSystem=true;}return;}
    int Ȇ=Math.Min(2,Math.Max(1,Ȅ/1000+1));
    var ȇ=new List<IMyAssembler>();
    for(int Ǒ=é.Count-1;Ǒ>=0&&ȇ.Count<Ȇ;Ǒ--){
    var ƙ=é[Ǒ];
    if(ƙ.Mode==MyAssemblerMode.Assembly&&!ƙ.IsQueueEmpty)continue;
    ƙ.UseConveyorSystem=false;
    if(ƙ.Mode!=MyAssemblerMode.Disassembly){ƙ.Mode=MyAssemblerMode.Disassembly;var Ǜ=new List<MyProductionItem>();ƙ.GetQueue(Ǜ);for(int Ȉ=Ǜ.Count-1;Ȉ>=0;Ȉ--)ƙ.RemoveQueueItem(Ȉ,Ǜ[Ȉ].Amount);}
    ȇ.Add(ƙ);}
    foreach(var ƙ in é){if(ƙ.Mode!=MyAssemblerMode.Disassembly)continue;var Ǔ=ƙ.GetInventory(1);if(Ǔ==null||Ǔ.ItemCount==0)continue;var ȉ=new Dictionary<MyDefinitionId,int>();var Ǜ=new List<MyProductionItem>();ƙ.GetQueue(Ǜ);foreach(var Ȉ in Ǜ)Ȋ(ȉ,Ȉ.BlueprintId,(int)Ȉ.Amount);var Ƙ=Ǌ(Ǔ);foreach(var ǋ in Ƙ){string ǌ=ǋ.Type.TypeId.ToLower(),Ǟ=ǋ.Type.SubtypeId;int ǔ=(int)ǋ.Amount;MyDefinitionId ƛ=default(MyDefinitionId);
    if(ǌ.Contains("component")&&Đ.ContainsKey(Ǟ)){ƛ=Đ[Ǟ];if(ǽ.ContainsKey(Ǟ))ǽ[Ǟ]=Math.Max(0,ǽ[Ǟ]-ǔ);}
    else if(ǌ.Contains("physicalgunobject")){string ȋ=Ǐ(Ǟ);if(ċ.ContainsKey(ȋ)){ƛ=ċ[ȋ];if(Ǿ.ContainsKey(ȋ))Ǿ[ȋ]=Math.Max(0,Ǿ[ȋ]-ǔ);}}
    else if(ǌ.Contains("ammomagazine")&&Č.ContainsKey(Ǟ)){ƛ=Č[Ǟ];if(ǿ.ContainsKey(Ǟ))ǿ[Ǟ]=Math.Max(0,ǿ[Ǟ]-ǔ);}
    else if(ǌ.Contains("ammomagazine")&&ǹ.ContainsKey(Ǟ)){ƛ=ǹ[Ǟ];if(ǻ.ContainsKey(Ǟ))ǻ[Ǟ]=Math.Max(0,ǻ[Ǟ]-ǔ);}
    else if(ǌ.Contains("gascontainer")&&Ǟ.Contains("Hydrogen")&&č.ContainsKey("HydrogenBottle")){ƛ=č["HydrogenBottle"];ȁ=Math.Max(0,ȁ-ǔ);}
    else if(ǌ.Contains("oxygencontainer")&&Ǟ.Contains("Oxygen")&&č.ContainsKey("OxygenBottle")){ƛ=č["OxygenBottle"];Ȃ=Math.Max(0,Ȃ-ǔ);}
    else if(ǋ.Type==ū){ƛ=Ū;ȃ=Math.Max(0,ȃ-ǔ);}
    if(ƛ!=default(MyDefinitionId)){int Ȍ=ȉ.ContainsKey(ƛ)?ȉ[ƛ]:0;if(Ȍ<ǔ)ƙ.AddQueueItem(ƛ,(MyFixedPoint)(ǔ-Ȍ));}}}
    Func<IMyInventory,int,MyItemType,int,MyDefinitionId,int>Ȓ=(ȍ,Ȏ,ȏ,ǔ,ƛ)=>{
    foreach(var Ǥ in ȇ){
    var Ȑ=Ǥ.GetInventory(1);if(Ȑ==null||!ȑ(Ȑ,.9f))continue;
    ȍ.TransferItemTo(Ȑ,Ȏ,null,true,(MyFixedPoint)ǔ);
    Ǥ.AddQueueItem(ƛ,(MyFixedPoint)ǔ);
    return ǔ;}
    return 0;};
    foreach(var ǅ in ã){var Ǡ=ǅ.GetInventory();if(Ǡ==null)continue;var Ƙ=Ǌ(Ǡ);for(int Ǒ=Ƙ.Count-1;Ǒ>=0;Ǒ--){var ǋ=Ƙ[Ǒ];string ǌ=ǋ.Type.TypeId.ToLower(),Ǟ=ǋ.Type.SubtypeId;int ǔ=(int)ǋ.Amount;
    if(ǌ.Contains("component")&&ǽ.ContainsKey(Ǟ)&&ǽ[Ǟ]>0&&Đ.ContainsKey(Ǟ)){int ȓ=Math.Min(ǔ,ǽ[Ǟ]);ǽ[Ǟ]-=Ȓ(Ǡ,Ǒ,ǋ.Type,ȓ,Đ[Ǟ]);}
    else if(ǌ.Contains("physicalgunobject")){string ȋ=Ǐ(Ǟ);if(Ǿ.ContainsKey(ȋ)&&Ǿ[ȋ]>0&&ċ.ContainsKey(ȋ)){int ȓ=Math.Min(ǔ,Ǿ[ȋ]);Ǿ[ȋ]-=Ȓ(Ǡ,Ǒ,ǋ.Type,ȓ,ċ[ȋ]);}}
    else if(ǌ.Contains("ammomagazine")&&ǿ.ContainsKey(Ǟ)&&ǿ[Ǟ]>0&&Č.ContainsKey(Ǟ)){int ȓ=Math.Min(ǔ,ǿ[Ǟ]);ǿ[Ǟ]-=Ȓ(Ǡ,Ǒ,ǋ.Type,ȓ,Č[Ǟ]);}
    else if(ǌ.Contains("ammomagazine")&&ǹ.ContainsKey(Ǟ)){int Ǽ=Ĉ.ContainsKey(Ǟ)?Ĉ[Ǟ]:đ;int Ȕ=ć.ContainsKey(Ǟ)?ć[Ǟ]:0;if(Ȕ<=Ǽ)continue;if(ǻ.ContainsKey(Ǟ)&&ǻ[Ǟ]>0){int ȓ=Math.Min(ǔ,ǻ[Ǟ]);ǻ[Ǟ]-=Ȓ(Ǡ,Ǒ,ǋ.Type,ȓ,ǹ[Ǟ]);}}
    else if(ǌ.Contains("gascontainer")&&Ǟ.Contains("Hydrogen")&&ȁ>0&&č.ContainsKey("HydrogenBottle")){int ȓ=Math.Min(ǔ,ȁ);ȁ-=Ȓ(Ǡ,Ǒ,ǋ.Type,ȓ,č["HydrogenBottle"]);}
    else if(ǌ.Contains("oxygencontainer")&&Ǟ.Contains("Oxygen")&&Ȃ>0&&č.ContainsKey("OxygenBottle")){int ȓ=Math.Min(ǔ,Ȃ);Ȃ-=Ȓ(Ǡ,Ǒ,ǋ.Type,ȓ,č["OxygenBottle"]);}
    else if(ǋ.Type==ū&&ȃ>0){string ȕ=Ŧ[Ė];if(Ď.ContainsKey(ȕ)){int Ǽ=Ĉ.ContainsKey(ȕ)?Ĉ[ȕ]:đ;if(Ē<=Ǽ)continue;}int ȓ=Math.Min(ǔ,ȃ);ȃ-=Ȓ(Ǡ,Ǒ,ǋ.Type,ȓ,Ū);}}}
    if(Ü!=null&&ȃ>0&&!ã.Contains(Ü)){string ȕ=Ŧ[Ė];bool Ȗ=Ď.ContainsKey(ȕ);int ȗ=Ȗ?(Ĉ.ContainsKey(ȕ)?Ĉ[ȕ]:đ):0;if(!Ȗ||Ē>ȗ){var Ǣ=Ü.GetInventory();if(Ǣ!=null){var Ƙ=Ǌ(Ǣ);for(int Ǒ=Ƙ.Count-1;Ǒ>=0&&ȃ>0;Ǒ--){var ǋ=Ƙ[Ǒ];if(ǋ.Type==ū){int ȓ=Math.Min((int)ǋ.Amount,ȃ);ȃ-=Ȓ(Ǣ,Ǒ,ǋ.Type,ȓ,Ū);}}}}}
    if(Þ!=null&&!ã.Contains(Þ)){var Ș=Þ.GetInventory();if(Ș!=null){var Ƙ=Ǌ(Ș);for(int Ǒ=Ƙ.Count-1;Ǒ>=0;Ǒ--){var ǋ=Ƙ[Ǒ];string Ǟ=ǋ.Type.SubtypeId;if(ǿ.ContainsKey(Ǟ)&&ǿ[Ǟ]>0&&Č.ContainsKey(Ǟ)){int ȓ=Math.Min((int)ǋ.Amount,ǿ[Ǟ]);ǿ[Ǟ]-=Ȓ(Ș,Ǒ,ǋ.Type,ȓ,Č[Ǟ]);}}}}
    if(Ø!=null&&!ã.Contains(Ø)){var ș=Ø.GetInventory();if(ș!=null){var Ƙ=Ǌ(ș);for(int Ǒ=Ƙ.Count-1;Ǒ>=0;Ǒ--){var ǋ=Ƙ[Ǒ];string ȋ=Ǐ(ǋ.Type.SubtypeId);if(Ǿ.ContainsKey(ȋ)&&Ǿ[ȋ]>0&&ċ.ContainsKey(ȋ)){int ȓ=Math.Min((int)ǋ.Amount,Ǿ[ȋ]);Ǿ[ȋ]-=Ȓ(ș,Ǒ,ǋ.Type,ȓ,ċ[ȋ]);}}}}
    if(Ý!=null&&!ã.Contains(Ý)){var Ț=Ý.GetInventory();if(Ț!=null){var Ƙ=Ǌ(Ț);for(int Ǒ=Ƙ.Count-1;Ǒ>=0;Ǒ--){var ǋ=Ƙ[Ǒ];string ǌ=ǋ.Type.TypeId.ToLower(),Ǟ=ǋ.Type.SubtypeId;int ǔ=(int)ǋ.Amount;if(ǌ.Contains("gascontainer")&&Ǟ.Contains("Hydrogen")&&ȁ>0&&č.ContainsKey("HydrogenBottle")){int ȓ=Math.Min(ǔ,ȁ);ȁ-=Ȓ(Ț,Ǒ,ǋ.Type,ȓ,č["HydrogenBottle"]);}else if(ǌ.Contains("oxygencontainer")&&Ǟ.Contains("Oxygen")&&Ȃ>0&&č.ContainsKey("OxygenBottle")){int ȓ=Math.Min(ǔ,Ȃ);Ȃ-=Ȓ(Ț,Ǒ,ǋ.Type,ȓ,č["OxygenBottle"]);}}}}
    foreach(var ǅ in ç){if(ã.Contains(ǅ))continue;var Ǡ=ǅ.GetInventory();if(Ǡ==null)continue;var Ƙ=Ǌ(Ǡ);for(int Ǒ=Ƙ.Count-1;Ǒ>=0;Ǒ--){var ǋ=Ƙ[Ǒ];string ǌ=ǋ.Type.TypeId.ToLower(),Ǟ=ǋ.Type.SubtypeId;int ǔ=(int)ǋ.Amount;
    if(ǌ.Contains("component")&&ǽ.ContainsKey(Ǟ)&&ǽ[Ǟ]>0&&Đ.ContainsKey(Ǟ)){int ȓ=Math.Min(ǔ,ǽ[Ǟ]);ǽ[Ǟ]-=Ȓ(Ǡ,Ǒ,ǋ.Type,ȓ,Đ[Ǟ]);}
    else if(ǌ.Contains("physicalgunobject")){string ȋ=Ǐ(Ǟ);if(Ǿ.ContainsKey(ȋ)&&Ǿ[ȋ]>0&&ċ.ContainsKey(ȋ)){int ȓ=Math.Min(ǔ,Ǿ[ȋ]);Ǿ[ȋ]-=Ȓ(Ǡ,Ǒ,ǋ.Type,ȓ,ċ[ȋ]);}}
    else if(ǌ.Contains("ammomagazine")&&ǿ.ContainsKey(Ǟ)&&ǿ[Ǟ]>0&&Č.ContainsKey(Ǟ)){int ȓ=Math.Min(ǔ,ǿ[Ǟ]);ǿ[Ǟ]-=Ȓ(Ǡ,Ǒ,ǋ.Type,ȓ,Č[Ǟ]);}
    else if(ǌ.Contains("ammomagazine")&&ǹ.ContainsKey(Ǟ)){int Ǽ=Ĉ.ContainsKey(Ǟ)?Ĉ[Ǟ]:đ;int Ȕ=ć.ContainsKey(Ǟ)?ć[Ǟ]:0;if(Ȕ<=Ǽ)continue;if(ǻ.ContainsKey(Ǟ)&&ǻ[Ǟ]>0){int ȓ=Math.Min(ǔ,ǻ[Ǟ]);ǻ[Ǟ]-=Ȓ(Ǡ,Ǒ,ǋ.Type,ȓ,ǹ[Ǟ]);}}
    else if(ǌ.Contains("gascontainer")&&Ǟ.Contains("Hydrogen")&&ȁ>0&&č.ContainsKey("HydrogenBottle")){int ȓ=Math.Min(ǔ,ȁ);ȁ-=Ȓ(Ǡ,Ǒ,ǋ.Type,ȓ,č["HydrogenBottle"]);}
    else if(ǌ.Contains("oxygencontainer")&&Ǟ.Contains("Oxygen")&&Ȃ>0&&č.ContainsKey("OxygenBottle")){int ȓ=Math.Min(ǔ,Ȃ);Ȃ-=Ȓ(Ǡ,Ǒ,ǋ.Type,ȓ,č["OxygenBottle"]);}
    else if(ǋ.Type==ū&&ȃ>0){string ȕ=Ŧ[Ė];if(Ď.ContainsKey(ȕ)){int Ǽ=Ĉ.ContainsKey(ȕ)?Ĉ[ȕ]:đ;if(Ē<=Ǽ)continue;}int ȓ=Math.Min(ǔ,ȃ);ȃ-=Ȓ(Ǡ,Ǒ,ǋ.Type,ȓ,Ū);}}}
    foreach(var ƙ in é){if(ƙ.Mode==MyAssemblerMode.Disassembly)continue;var Ǔ=ƙ.GetInventory(1);if(Ǔ==null)continue;var Ƙ=Ǌ(Ǔ);for(int Ǒ=Ƙ.Count-1;Ǒ>=0;Ǒ--){var ǋ=Ƙ[Ǒ];string ǌ=ǋ.Type.TypeId.ToLower(),Ǟ=ǋ.Type.SubtypeId;int ǔ=(int)ǋ.Amount;
    if(ǌ.Contains("component")&&ǽ.ContainsKey(Ǟ)&&ǽ[Ǟ]>0&&Đ.ContainsKey(Ǟ)){int ȓ=Math.Min(ǔ,ǽ[Ǟ]);ǽ[Ǟ]-=Ȓ(Ǔ,Ǒ,ǋ.Type,ȓ,Đ[Ǟ]);}
    else if(ǌ.Contains("physicalgunobject")){string ȋ=Ǐ(Ǟ);if(Ǿ.ContainsKey(ȋ)&&Ǿ[ȋ]>0&&ċ.ContainsKey(ȋ)){int ȓ=Math.Min(ǔ,Ǿ[ȋ]);Ǿ[ȋ]-=Ȓ(Ǔ,Ǒ,ǋ.Type,ȓ,ċ[ȋ]);}}}}}
        
    void Ǖ(string ƹ,int ǅ){if(!ò.ContainsKey(ƹ))ò[ƹ]=ǅ;}
    void ǖ(string ƹ,int ǅ){if(!ñ.ContainsKey(ƹ))ñ[ƹ]=ǅ;}
    void ț(string ƹ,int ǅ){ý[ƹ]=ǅ;}
    void Ȝ(string ƹ,int ǅ){ÿ[ƹ]=ǅ;}
    void ȝ(string ƹ,int ǅ){ā[ƹ]=ǅ;}
    void Ȟ(int ż){if(ż<20)ż=20;ģ=ż;foreach(var ǡ in ċ.Keys)ț(ǡ,ż);}
    void Ƞ(){string ȟ=Ŧ[Ė];foreach(var ǡ in Č.Keys){if(!ÿ.ContainsKey(ǡ))Ȝ(ǡ,500);}Ȝ(ȟ,Ĥ);}
    void ȡ(){ę=Math.Max(20,ę);Ě=Math.Max(20,Ě);ȝ("HydrogenBottle",ę);ȝ("OxygenBottle",Ě);}
    void Ȣ(){if(Ď.Count==0)ų();foreach(var ǡ in Ď.Keys)if(!Ĉ.ContainsKey(ǡ))Ĉ[ǡ]=đ;}
    void ȣ(string ƹ,int ǅ){Ĉ[ƹ]=ǅ;}
    void Ŵ(){Ȟ(Math.Max(20,ģ));Ƞ();ȡ();Ȣ();Ȥ();}
    void Ȥ(){foreach(var ǡ in Đ.Keys)Ň.Add(ǡ);foreach(var ǡ in ċ.Keys)Ň.Add(ǡ);foreach(var ǡ in Ď.Keys)Ň.Add(ǡ);foreach(var ǡ in new[]{"NATO_5p56_Mag","MR-20_Mag","MR-50A_Mag","MR-30E_Mag","S-10_Mag","S-20A_Mag","Elite_Mag","RocketMag","FlareMag","HydrogenBottle","OxygenBottle"})Ň.Add(ǡ);}
    void Ǚ(){if(ċ.Count==0||Č.Count==0||č.Count==0||Ď.Count==0)ų();if(ý.Count==0)Ȟ(ģ);if(ÿ.Count==0)Ƞ();if(ā.Count==0)ȡ();if(Ĉ.Count==0)Ȣ();þ.Clear();int ȥ=û.ContainsKey("semiautopistol")?û["semiautopistol"]:0;int Ȧ=ý.ContainsKey("semiautopistol")?ý["semiautopistol"]:ģ;foreach(var ǘ in ý){int Ǘ=û.ContainsKey(ǘ.Key)?û[ǘ.Key]:0;if(Ǘ<ǘ.Value){if(ǘ.Key=="elitepistol"&&ȥ<Ȧ)continue;þ[ǘ.Key]=ǘ.Value-Ǘ;}}Ā.Clear();foreach(var ǘ in ÿ){int Ǘ=ù.ContainsKey(ǘ.Key)?ù[ǘ.Key]:0;if(Ǘ<ǘ.Value)Ā[ǘ.Key]=ǘ.Value-Ǘ;}Ą.Clear();foreach(var ǘ in ā){int Ǘ=Ă.ContainsKey(ǘ.Key)?Ă[ǘ.Key]:0;if(Ǘ<ǘ.Value)Ą[ǘ.Key]=ǘ.Value-Ǘ;}ĉ.Clear();foreach(var ǘ in Ĉ){int Ǘ=ć.ContainsKey(ǘ.Key)?ć[ǘ.Key]:0;if(Ǘ<ǘ.Value)ĉ[ǘ.Key]=ǘ.Value-Ǘ;}}
    void Ǵ(Dictionary<string,int>ȧ,Dictionary<string,int>Ȩ,Dictionary<string,MyDefinitionId>ƛ,Dictionary<string,int>Ȕ,Dictionary<string,int>Ǽ){if(ċ.Count==0||Č.Count==0||č.Count==0||Ď.Count==0)ų();if(é.Count<2)return;int ǰ=é.Count-1;foreach(var ǘ in ƛ){int ȩ=Ȕ.ContainsKey(ǘ.Key)?Ȕ[ǘ.Key]:0;int Ȫ=Ǽ.ContainsKey(ǘ.Key)?Ǽ[ǘ.Key]:0;var ȫ=ǘ.Value;int ǲ=Ȭ(ȫ);int ȭ=ȩ+ǲ;if(ȭ>Ȫ&&ǲ>0){int Ȯ=ȭ-Ȫ;foreach(var ƙ in é){if(Ȯ<=0)break;var Ǜ=new List<MyProductionItem>();ƙ.GetQueue(Ǜ);for(int Ǒ=Ǜ.Count-1;Ǒ>=0&&Ȯ>0;Ǒ--){if(Ǜ[Ǒ].BlueprintId==ȫ){int ȯ=Math.Min((int)Ǜ[Ǒ].Amount,Ȯ);ƙ.RemoveQueueItem(Ǒ,(MyFixedPoint)ȯ);Ȯ-=ȯ;}}}}else if(ȭ<Ȫ){int ǯ=Ȫ-ȭ;int Ǳ=Math.Max(1,ǯ/ǰ);for(int Ǒ=0;Ǒ<ǰ&&ǯ>0;Ǒ++)if(é[Ǒ].Mode==MyAssemblerMode.Assembly){é[Ǒ].AddQueueItem(ȫ,(MyFixedPoint)Ǳ);ǯ-=Ǳ;}}}}
        
    void ǵ(){ø.Clear();int ƹ=ĕ;Action<string,double>Ȱ=(ǡ,Ǧ)=>ø[ǡ]=(int)(ƹ*Ǧ);if(Ė==0){Ȱ("Iron",0.04);Ȱ("Nickel",0.01);}else if(Ė==1){Ȱ("Iron",0.18);Ȱ("Nickel",0.02);}else if(Ė==2){Ȱ("Iron",15);Ȱ("Nickel",1.2);Ȱ("Silicon",0.36);Ȱ("Magnesium",0.6);Ȱ("Platinum",0.12);Ȱ("Uranium",0.24);}ö.Clear();foreach(var ǘ in ø){int ȱ=ð.ContainsKey(ǘ.Key)?ð[ǘ.Key]:0;if(ȱ<ǘ.Value){double Ǥ=ǘ.Key=="Iron"?0.7:ǘ.Key=="Nickel"?0.4:ǘ.Key=="Cobalt"?0.3:ǘ.Key=="Magnesium"?0.007:ǘ.Key=="Silicon"?0.7:ǘ.Key=="Platinum"?0.005:ǘ.Key=="Uranium"?0.01:0.1;ö[ǘ.Key]=(int)((ǘ.Value-ȱ)/Ǥ);}}int Ȳ=10;ȳ("Iron",1000*Ȳ,0.7);ȳ("Nickel",200*Ȳ,0.4);ȳ("Cobalt",100*Ȳ,0.3);ȳ("Silicon",100*Ȳ,0.7);ȳ("Magnesium",50*Ȳ,0.007);ȳ("Silver",20*Ȳ,0.1);ȳ("Gold",10*Ȳ,0.01);ȳ("Platinum",5*Ȳ,0.005);ȳ("Uranium",5*Ȳ,0.01);}
    void ȳ(string ƹ,int ȴ,double Ǥ){int ȱ=ð.ContainsKey(ƹ)?ð[ƹ]:0;if(ȱ<ȴ)ö[ƹ]=(int)((ȴ-ȱ)/Ǥ);}
        
    void Ƕ(){if(è.Count==0)return;var ȶ=ȵ();if(ȶ.Count==0)return;string[] ȷ={"Iron","Nickel","Cobalt","Silicon","Magnesium","Silver","Gold","Platinum","Uranium","Stone","Scrap"};foreach(var Ǥ in è){Ǥ.UseConveyorSystem=false;var ȸ=Ǥ.GetInventory(1);if(ȸ!=null&&(float)ȸ.CurrentVolume>(float)ȸ.MaxVolume*.7f)continue;var ȹ=Ǥ.GetInventory(0);if(ȹ==null)continue;int Ⱥ=0;foreach(var Ƹ in Ǌ(ȹ))if(Ƹ.Type.TypeId.EndsWith("Ore"))Ⱥ+=(int)Ƹ.Amount;if(Ⱥ>=5000)continue;foreach(string ȼ in ȷ){int Ȼ=0;foreach(var Ƹ in Ǌ(ȹ))if(Ƹ.Type.SubtypeId==ȼ)Ȼ+=(int)Ƹ.Amount;if(Ȼ>=1000)continue;int ǯ=1000-Ȼ;foreach(var ǅ in ȶ){if(ǯ<=0)break;var Ǡ=ǅ.GetInventory();if(Ǡ==null)continue;var Ƚ=Ǌ(Ǡ);for(int Ǒ=Ƚ.Count-1;Ǒ>=0&&ǯ>0;Ǒ--){var ż=Ƚ[Ǒ];if(!ż.Type.TypeId.EndsWith("Ore")||ż.Type.SubtypeId!=ȼ)continue;int Ⱦ=Math.Min((int)ż.Amount,ǯ);Ǡ.TransferItemTo(ȹ,Ǒ,null,true,(MyFixedPoint)Ⱦ);ǯ-=Ⱦ;}}}}}
        
    void Ƿ(){if(é.Count==0)return;var ȶ=ȵ();int ȿ=1000;int ɀ=5000;string[] Ɂ={"Iron","Nickel","Silicon","Cobalt"};foreach(var ƙ in é){if(ƙ.Mode==MyAssemblerMode.Assembly&&!ƙ.UseConveyorSystem)ƙ.UseConveyorSystem=true;var Ǔ=ƙ.GetInventory(1);if(Ǔ!=null&&(float)Ǔ.CurrentVolume>(float)Ǔ.MaxVolume*.5f)continue;var Ǣ=ƙ.GetInventory(0);if(Ǣ==null)continue;var ɂ=new Dictionary<string,int>();var Ƙ=Ǌ(Ǣ);foreach(var Ƹ in Ƙ)if(Ƹ.Type.TypeId.EndsWith("Ingot"))ǎ(ɂ,Ƹ.Type.SubtypeId,(int)Ƹ.Amount);foreach(string Ƀ in Ɂ){int Ǘ=ɂ.ContainsKey(Ƀ)?ɂ[Ƀ]:0;if(Ǘ>=ȿ)continue;int ǯ=ȿ-Ǘ;foreach(var Ǥ in è){if(ǯ<=0)break;var ȸ=Ǥ.GetInventory(1);if(ȸ==null)continue;var Ʉ=Ǌ(ȸ);for(int Ǒ=Ʉ.Count-1;Ǒ>=0&&ǯ>0;Ǒ--)if(Ʉ[Ǒ].Type.SubtypeId==Ƀ){int ȓ=Math.Min((int)Ʉ[Ǒ].Amount,ǯ);ȸ.TransferItemTo(Ǣ,Ǒ,null,true,(MyFixedPoint)ȓ);ǯ-=ȓ;}}foreach(var ǅ in ȶ){if(ǯ<=0)break;var Ǡ=ǅ.GetInventory();if(Ǡ==null)continue;var Ƚ=Ǌ(Ǡ);for(int Ǒ=Ƚ.Count-1;Ǒ>=0&&ǯ>0;Ǒ--)if(Ƚ[Ǒ].Type.SubtypeId==Ƀ){int ȓ=Math.Min((int)Ƚ[Ǒ].Amount,ǯ);Ǡ.TransferItemTo(Ǣ,Ǒ,null,true,(MyFixedPoint)ȓ);ǯ-=ȓ;}}}if((float)Ǣ.CurrentVolume>(float)Ǣ.MaxVolume*.85f){var Ʌ=Ú??(ä.Count>0?ä[0]:(ã.Count>0?ã[0]:null));if(Ʌ!=null){var Ɇ=Ʌ.GetInventory();if(Ɇ!=null&&ȑ(Ɇ,.9f)){var ɇ=Ǌ(Ǣ);foreach(var Ƹ in ɇ){string Ǎ=Ƹ.Type.SubtypeId;if(!Ƹ.Type.TypeId.EndsWith("Ingot"))continue;int Ǘ=ɂ.ContainsKey(Ǎ)?ɂ[Ǎ]:0;if(Ǘ>ɀ){int Ɉ=Ǘ-ɀ;for(int Ǒ=ɇ.Count-1;Ǒ>=0&&Ɉ>0;Ǒ--)if(ɇ[Ǒ].Type.SubtypeId==Ǎ){int ȓ=Math.Min((int)ɇ[Ǒ].Amount,Ɉ);Ǣ.TransferItemTo(Ɇ,Ǒ,null,true,(MyFixedPoint)ȓ);Ɉ-=ȓ;}}}}}}}}
        
    List<IMyCargoContainer> ȵ(){var Ǥ=new List<IMyCargoContainer>(ã);foreach(var ǅ in ç)if(!Ǥ.Contains(ǅ))Ǥ.Add(ǅ);return Ǥ;}
        
    void Ɵ(){
    if(ã.Count==0)return;
    Action<IMyInventory>ɋ=ɉ=>{if(ɉ==null||ɉ.ItemCount==0)return;for(int Ǒ=ɉ.ItemCount-1;Ǒ>=0;Ǒ--){var ǋ=ɉ.GetItemAt(Ǒ);if(!ǋ.HasValue)continue;var Ɠ=Ɋ(ǋ.Value.Type,null);if(Ɠ!=null)ɉ.TransferItemTo(Ɠ,Ǒ,null,true,null);}};
    foreach(var ƙ in é){if(ƙ.Mode!=MyAssemblerMode.Disassembly)ɋ(ƙ.GetInventory(1));else ɋ(ƙ.GetInventory(0));}
    foreach(var Ǥ in è)ɋ(Ǥ.GetInventory(1));
    foreach(var ǥ in ë){var Ɍ=ǥ.GetInventory();if(Ɍ==null)continue;for(int Ǒ=Ɍ.ItemCount-1;Ǒ>=0;Ǒ--){var ǋ=Ɍ.GetItemAt(Ǒ);if(!ǋ.HasValue)continue;var ǌ=ǋ.Value.Type;if(ǌ.SubtypeId=="Ice")continue;string ɍ=ǌ.TypeId.ToLower();if(ɍ.Contains("gascontainer")||ɍ.Contains("oxygencontainer"))continue;var Ɠ=Ɋ(ǌ,null);if(Ɠ!=null)Ɍ.TransferItemTo(Ɠ,Ǒ,null,true,null);}}
    var Ɏ=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(Ɏ,ż=>ż.IsSameConstructAs(Me));foreach(var ɏ in Ɏ){var ș=ɏ.GetInventory();if(ș==null||ș.ItemCount==0)continue;for(int Ǒ=ș.ItemCount-1;Ǒ>=0;Ǒ--){var ǋ=ș.GetItemAt(Ǒ);if(!ǋ.HasValue)continue;var ǌ=ǋ.Value.Type;string ɍ=ǌ.TypeId.ToLower();if(ɍ.Contains("gascontainer")||ɍ.Contains("oxygencontainer"))continue;var Ɠ=Ɋ(ǌ,null);if(Ɠ!=null)ș.TransferItemTo(Ɠ,Ǒ,null,true,null);}}
    foreach(var ɐ in â){var ɑ=ɐ.GetInventory();if(ɑ!=null)ɋ(ɑ);}
    foreach(var ư in ì){
    if(ư.Status!=MyShipConnectorStatus.Connected)continue;
    var ǈ=ư.OtherConnector;if(ǈ==null)continue;
    var ɒ=ǈ.CubeGrid;
    Func<IMyTerminalBlock,bool>ɓ=Ǝ=>Ǝ.CubeGrid==ɒ;
    var ɔ=new List<IMyCargoContainer>();GridTerminalSystem.GetBlocksOfType(ɔ,ɓ);
    var ɕ=new List<IMyShipDrill>();GridTerminalSystem.GetBlocksOfType(ɕ,ɓ);
    var ɖ=new List<IMyShipGrinder>();GridTerminalSystem.GetBlocksOfType(ɖ,ɓ);
    Action<IMyInventory>ȓ=ɗ=>{if(ɗ==null||ɗ.ItemCount==0)return;for(int Ǒ=ɗ.ItemCount-1;Ǒ>=0;Ǒ--){var ǋ=ɗ.GetItemAt(Ǒ);if(!ǋ.HasValue)continue;var Ɠ=Ɋ(ǋ.Value.Type,null);if(Ɠ!=null)ɗ.TransferItemTo(Ɠ,Ǒ,null,true,null);}};
    foreach(var ǅ in ɔ)ȓ(ǅ.GetInventory());
    foreach(var ɘ in ɕ)ȓ(ɘ.GetInventory());
    foreach(var ə in ɖ)ȓ(ə.GetInventory());
    var ɚ=new List<IMyGasGenerator>();GridTerminalSystem.GetBlocksOfType(ɚ,ɓ);
    var ɛ=new List<IMyReactor>();GridTerminalSystem.GetBlocksOfType(ɛ,ɓ);
    Echo($"Miner: Gen={ɚ.Count} React={ɛ.Count} Cargo={ɔ.Count}");
    if(ɚ.Count>0){IMyInventory ɜ=ɚ[0].GetInventory();if(ɜ!=null&&ȑ(ɜ,.8f)){
    Action<IMyCargoContainer>ɟ=ɝ=>{if(ɝ==null)return;var ɗ=ɝ.GetInventory();if(ɗ==null)return;var ɞ=Ǌ(ɗ);for(int Ǒ=ɞ.Count-1;Ǒ>=0;Ǒ--)if(ɞ[Ǒ].Type.SubtypeId=="Ice"&&ɗ.CanTransferItemTo(ɜ,ɞ[Ǒ].Type)){ɗ.TransferItemTo(ɜ,Ǒ,null,true,(MyFixedPoint)Math.Min(500,(int)ɞ[Ǒ].Amount));break;}};
    ɟ(Ù);foreach(var ǅ in ã)ɟ(ǅ);}}
    else{Action<IMyInventory>ɢ=ǚ=>{if(ǚ==null)return;var Ƙ=Ǌ(ǚ);for(int Ǒ=Ƙ.Count-1;Ǒ>=0;Ǒ--)if(Ƙ[Ǒ].Type.SubtypeId=="Ice"){var ɠ=Ù!=null?Ù.GetInventory():null;if(ɠ==null)foreach(var ɡ in ã){ɠ=ɡ.GetInventory();if(ɠ!=null&&ȑ(ɠ,.9f))break;}if(ɠ!=null&&ǚ.CanTransferItemTo(ɠ,Ƙ[Ǒ].Type))ǚ.TransferItemTo(ɠ,Ǒ,null,true,null);}};foreach(var ɣ in ɔ)ɢ(ɣ.GetInventory());foreach(var ɘ in ɕ)ɢ(ɘ.GetInventory());}
    if(ɛ.Count>0){foreach(var ɤ in ɛ){var ɥ=ɤ.GetInventory();if(ɥ==null||!ȑ(ɥ,.8f))continue;int ɦ=0;foreach(var Ƹ in Ǌ(ɥ))if(Ƹ.Type.SubtypeId=="Uranium")ɦ+=(int)Ƹ.Amount;if(ɦ>=10)continue;int ȴ=10-ɦ;Action<IMyCargoContainer>ɩ=ǅ=>{if(ȴ<=0||ǅ==null)return;var Ǡ=ǅ.GetInventory();if(Ǡ==null)return;var Ƚ=Ǌ(Ǡ);for(int ɧ=Ƚ.Count-1;ɧ>=0&&ȴ>0;ɧ--)if(Ƚ[ɧ].Type.SubtypeId=="Uranium"){int ɨ=Math.Min((int)Ƚ[ɧ].Amount,ȴ);if(Ǡ.CanTransferItemTo(ɥ,Ƚ[ɧ].Type)){Ǡ.TransferItemTo(ɥ,ɧ,null,true,(MyFixedPoint)ɨ);ȴ-=ɨ;}}};ɩ(Ú);foreach(var ǅ in ã)ɩ(ǅ);}}
    else{foreach(var ɣ in ɔ){var ɪ=ɣ.GetInventory();if(ɪ==null)continue;var ɫ=Ǌ(ɪ);for(int Ǒ=ɫ.Count-1;Ǒ>=0;Ǒ--)if(ɫ[Ǒ].Type.SubtypeId=="Uranium"){var ɠ=Ú!=null?Ú.GetInventory():null;if(ɠ==null)foreach(var ɡ in ã){ɠ=ɡ.GetInventory();if(ɠ!=null&&ȑ(ɠ,.9f))break;}if(ɠ!=null&&ɪ.CanTransferItemTo(ɠ,ɫ[Ǒ].Type))ɪ.TransferItemTo(ɠ,Ǒ,null,true,null);}}}}
    if(H)foreach(var Ǎ in ã){var ɗ=Ǎ.GetInventory();if(ɗ==null||ɗ.ItemCount==0)continue;var Ƙ=Ǌ(ɗ);for(int Ǒ=Ƙ.Count-1;Ǒ>=0;Ǒ--){var Ɠ=Ɋ(Ƙ[Ǒ].Type,Ǎ);if(Ɠ!=null)ɗ.TransferItemTo(Ɠ,Ǒ,null,true,null);}}
    if(Ø!=null){var ș=Ø.GetInventory();if(ș!=null){var Ƙ=Ǌ(ș);for(int Ǒ=Ƙ.Count-1;Ǒ>=0;Ǒ--){var ż=Ƙ[Ǒ].Type;if(ż.TypeId.ToLower().Contains("physicalgunobject"))continue;var Ɠ=Ɋ(ż,Ø);if(Ɠ!=null)ș.TransferItemTo(Ɠ,Ǒ,null,true,null);}}}
    foreach(var Ÿ in ê){var ȹ=Ÿ.GetInventory();if(ȹ==null)continue;int ȱ=0;foreach(var Ƹ in Ǌ(ȹ))if(Ƹ.Type.SubtypeId=="Uranium")ȱ+=(int)Ƹ.Amount;if(ȱ>=50)continue;int ƹ=50-ȱ;foreach(var Ǥ in è){var ɬ=Ǥ.GetInventory(1);if(ɬ==null)continue;var Ʉ=Ǌ(ɬ);for(int Ǒ=Ʉ.Count-1;Ǒ>=0&&ƹ>0;Ǒ--)if(Ʉ[Ǒ].Type.SubtypeId=="Uranium"){int ȓ=Math.Min((int)Ʉ[Ǒ].Amount,ƹ);ɬ.TransferItemTo(ȹ,Ǒ,null,true,(MyFixedPoint)ȓ);ƹ-=ȓ;}}Action<IMyCargoContainer>ɮ=ǅ=>{if(ƹ<=0||ǅ==null)return;var ɭ=ǅ.GetInventory();if(ɭ==null)return;var Ƚ=Ǌ(ɭ);for(int Ǒ=Ƚ.Count-1;Ǒ>=0&&ƹ>0;Ǒ--)if(Ƚ[Ǒ].Type.SubtypeId=="Uranium"){int ȓ=Math.Min((int)Ƚ[Ǒ].Amount,ƹ);ɭ.TransferItemTo(ȹ,Ǒ,null,true,(MyFixedPoint)ȓ);ƹ-=ȓ;}};ɮ(Ú);foreach(var ǅ in ã)ɮ(ǅ);}
    Action<IMyCargoContainer>ɯ=ǅ=>{if(ǅ==null)return;var ɭ=ǅ.GetInventory();if(ɭ==null)return;for(int Ǒ=ɭ.ItemCount-1;Ǒ>=0;Ǒ--){var Ƹ=ɭ.GetItemAt(Ǒ);if(Ƹ.HasValue&&Ƹ.Value.Type.SubtypeId=="Ice")foreach(var ǥ in ë){var Ɍ=ǥ.GetInventory();if(Ɍ!=null&&ȑ(Ɍ,.9f)){ɭ.TransferItemTo(Ɍ,Ǒ,null,true,null);break;}}}};
    ɯ(Ù);foreach(var ǅ in ã)ɯ(ǅ);
    if(Ý!=null&&Ğ>0){var Ț=Ý.GetInventory();if(Ț!=null)for(int Ǒ=Ț.ItemCount-1;Ǒ>=0;Ǒ--){var ǋ=Ț.GetItemAt(Ǒ);if(!ǋ.HasValue)continue;string ɍ=ǋ.Value.Type.TypeId.ToLower();if(!ɍ.Contains("gascontainer")&&!ɍ.Contains("oxygencontainer"))continue;foreach(var ǥ in ë)if(ǥ.Enabled){var Ɍ=ǥ.GetInventory();if(Ɍ==null)continue;int ɰ=0;foreach(var Ƹ in Ǌ(Ɍ)){string ɱ=Ƹ.Type.TypeId.ToLower();if(ɱ.Contains("gascontainer")||ɱ.Contains("oxygencontainer"))ɰ++;}if(ɰ==0&&ȑ(Ɍ,.8f)){Ț.TransferItemTo(Ɍ,Ǒ,null,true,(MyFixedPoint)1);break;}}}}
    foreach(var ǥ in ë){var Ɍ=ǥ.GetInventory();if(Ɍ==null)continue;var ɲ=Ǌ(Ɍ);int ɳ=0;bool ɴ=false;foreach(var Ƹ in ɲ){string ɍ=Ƹ.Type.TypeId.ToLower();if(ɍ.Contains("gascontainer")||ɍ.Contains("oxygencontainer"))ɳ++;if(Ƹ.Type.SubtypeId=="Ice")ɴ=true;}if(!ɴ||ɳ>1){int ɵ=0,ɶ=ɴ?ɳ-1:ɳ;for(int Ǒ=ɲ.Count-1;Ǒ>=0&&ɵ<ɶ;Ǒ--){string ɍ=ɲ[Ǒ].Type.TypeId.ToLower();if(!ɍ.Contains("gascontainer")&&!ɍ.Contains("oxygencontainer"))continue;IMyInventory Ʌ=null;if(Ý!=null){var Ț=Ý.GetInventory();if(Ț!=null&&ȑ(Ț,.95f))Ʌ=Ț;}if(Ʌ==null){foreach(var ǅ in ã){var Ǡ=ǅ.GetInventory();if(Ǡ!=null&&ȑ(Ǡ,.9f)){Ʌ=Ǡ;break;}}}if(Ʌ!=null){Ɍ.TransferItemTo(Ʌ,Ǒ);ɵ++;}}}}
    Action<IMyCargoContainer>ɹ=ǅ=>{if(ǅ==null||ǅ==Ý)return;var ɭ=ǅ.GetInventory();if(ɭ==null)return;for(int Ǒ=ɭ.ItemCount-1;Ǒ>=0;Ǒ--){var Ƹ=ɭ.GetItemAt(Ǒ);if(!Ƹ.HasValue)continue;string ɍ=Ƹ.Value.Type.TypeId.ToLower();if(!ɍ.Contains("gascontainer")&&!ɍ.Contains("oxygencontainer"))continue;if(Ý!=null){var Ț=Ý.GetInventory();if(Ț!=null&&ȑ(Ț,.95f)){ɭ.TransferItemTo(Ț,Ǒ);continue;}}foreach(var ǥ in ë){var Ɍ=ǥ.GetInventory();if(Ɍ==null||!ȑ(Ɍ,.8f))continue;int ɰ=0;foreach(var ɷ in Ǌ(Ɍ)){string ɸ=ɷ.Type.TypeId.ToLower();if(ɸ.Contains("gascontainer")||ɸ.Contains("oxygencontainer"))ɰ++;}if(ɰ==0){ɭ.TransferItemTo(Ɍ,Ǒ);break;}}}};
    foreach(var ǅ in ã)ɹ(ǅ);
    if(Þ!=null){var Ș=Þ.GetInventory();if(Ș!=null){var Ƙ=Ǌ(Ș);for(int Ǒ=Ƙ.Count-1;Ǒ>=0;Ǒ--){var ż=Ƙ[Ǒ].Type;if(ż.SubtypeId=="SemiAutoPistolMagazine"){var ɻ=ɺ();if(ɻ!=null){var Ɍ=ɻ.GetInventory();if(Ɍ!=null&&ȑ(Ɍ,.9f))Ș.TransferItemTo(Ɍ,Ǒ,null,true,null);}}}}}
    }
        
    IMyCargoContainer ɼ(MyItemType ż){string Ɨ=ż.TypeId.ToLower(),Ǎ=ż.SubtypeId;var ɹ=á??ɺ();return Ɨ.Contains("ore")&&!Ɨ.Contains("oxygencontainer")?Ù:Ɨ.Contains("ingot")?Ú:Ɨ.Contains("component")?Û:Ɨ.Contains("physicalgunobject")?Ø:Ɨ.Contains("ammomagazine")?(Ǎ=="SemiAutoPistolMagazine"?(Ü??ɹ):(Ǎ.Contains("Pistol")||Ǎ.Contains("RifleGun")||Ǎ.Contains("Flare")?(Þ??Ø):(Ü??Ø))):(Ɨ.Contains("gascontainerobject")||Ɨ.Contains("oxygencontainerobject"))?Ý:Ɨ.Contains("consumableitem")?(ß??ɹ):Ɨ.Contains("datapad")?(à??ɹ):ɹ;}
    IMyCargoContainer ɺ(){foreach(var ǅ in ä){if(ǅ.CubeGrid!=Me.CubeGrid)continue;var ƹ=ǅ.CustomName.ToLower();if(!ƹ.Contains("-ore")&&!ƹ.Contains("-ingot")&&!ƹ.Contains("-comp")&&!ƹ.Contains("-tools")&&!ƹ.Contains("-ammo")&&!ƹ.Contains("-pammo")&&!ƹ.Contains("-bottle")&&!ƹ.Contains("-food")&&!ƹ.Contains("-data")&&!ƹ.Contains("-misc"))return ǅ;}foreach(var ǅ in ã){if(ǅ.CubeGrid!=Me.CubeGrid)continue;var ƹ=ǅ.CustomName.ToLower();if(!ƹ.Contains("-ore")&&!ƹ.Contains("-ingot")&&!ƹ.Contains("-comp")&&!ƹ.Contains("-tools")&&!ƹ.Contains("-ammo")&&!ƹ.Contains("-pammo")&&!ƹ.Contains("-bottle")&&!ƹ.Contains("-food")&&!ƹ.Contains("-data")&&!ƹ.Contains("-misc"))return ǅ;}foreach(var ǅ in ä)if(ǅ.CubeGrid==Me.CubeGrid)return ǅ;foreach(var ǅ in ã)if(ǅ.CubeGrid==Me.CubeGrid)return ǅ;return null;}
    bool ȑ(IMyInventory Ǒ,float ż)=>Ǒ!=null&&(float)Ǒ.CurrentVolume<(float)Ǒ.MaxVolume*ż;
    List<MyInventoryItem>Ǌ(IMyInventory ǉ){var Ƙ=new List<MyInventoryItem>();if(ǉ!=null)ǉ.GetItems(Ƙ);return Ƙ;}
    void ǎ(Dictionary<string,int>Ɠ,string ǡ,int ǉ){if(Ɠ.ContainsKey(ǡ))Ɠ[ǡ]+=ǉ;else Ɠ[ǡ]=ǉ;}
    void Ȋ(Dictionary<MyDefinitionId,int>Ɠ,MyDefinitionId ǡ,int ǉ){if(Ɠ.ContainsKey(ǡ))Ɠ[ǡ]+=ǉ;else Ɠ[ǡ]=ǉ;}
    string Ǐ(string Ǎ){string Ǥ=Ǎ.ToLower();if(Ǥ.EndsWith("item"))Ǥ=Ǥ.Substring(0,Ǥ.Length-4);if(Ǥ=="eliteautopistol")Ǥ="elitepistol";return Ǥ;}
    string ǝ(string ƛ){int ɽ=ƛ.IndexOf('_');return ɽ>=0?ƛ.Substring(ɽ+1):ƛ;}
    Dictionary<string,string>ʂ(string Ɠ){var Ǥ=new Dictionary<string,string>();if(string.IsNullOrEmpty(Ɠ))return Ǥ;string ɾ="";var ǂ=new StringBuilder();var ɿ=Ɠ.Split('\n');foreach(var ʀ in ɿ){if(ʀ.StartsWith("[")){int ʁ=ʀ.IndexOf("]");if(ʁ>0){if(ɾ!=""&&ǂ.Length>0)Ǥ[ɾ]=ǂ.ToString();ɾ=ʀ.Substring(0,ʁ+1);ǂ.Clear();ǂ.Append(ʀ).Append("\n");continue;}}if(ɾ!=""&&ʀ.Length>0)ǂ.Append(ʀ).Append("\n");}if(ɾ!=""&&ǂ.Length>0)Ǥ[ɾ]=ǂ.ToString();return Ǥ;}
    bool ʃ(IMyInventory Ǒ,MyItemType ż){if(Ǒ==null)return false;foreach(var Ƹ in Ǌ(Ǒ))if(Ƹ.Type.TypeId==ż.TypeId&&Ƹ.Type.SubtypeId==ż.SubtypeId)return true;return false;}
    bool ʄ(IMyCargoContainer ǅ)=>ǅ==Ù||ǅ==Ú||ǅ==Û||ǅ==Ø||ǅ==Ü||ǅ==Ý||ǅ==Þ||ǅ==ß||ǅ==à||ǅ==á;
    bool ʅ(IMyCargoContainer ǅ){var ƹ=ǅ.CustomName.ToLower();return ƹ.Contains("-ore")||ƹ.Contains("-ingot")||ƹ.Contains("-comp")||ƹ.Contains("-tools")||ƹ.Contains("-ammo")||ƹ.Contains("-pammo")||ƹ.Contains("-bottle")||ƹ.Contains("-food")||ƹ.Contains("-data")||ƹ.Contains("-misc");}
    string ʆ(IMyCargoContainer ǅ){if(ǅ==null)return null;var ƹ=ǅ.CustomName.ToLower();if(ƹ.Contains("-ore"))return"-ore";if(ƹ.Contains("-ingot"))return"-ingot";if(ƹ.Contains("-comp"))return"-comp";if(ƹ.Contains("-tools"))return"-tools";if(ƹ.Contains("-pammo"))return"-pammo";if(ƹ.Contains("-ammo"))return"-ammo";if(ƹ.Contains("-bottle"))return"-bottle";if(ƹ.Contains("-food"))return"-food";if(ƹ.Contains("-data"))return"-data";if(ƹ.Contains("-misc"))return"-misc";return null;}
    IMyInventory ʉ(IMyCargoContainer ʇ){if(ʇ==null)return null;string ʈ=ʆ(ʇ);if(ʈ==null)return null;foreach(var ǅ in ã){if(ǅ==ʇ)continue;if(!ǅ.CustomName.ToLower().Contains(ʈ))continue;var ǚ=ǅ.GetInventory();if(ǚ!=null&&ȑ(ǚ,.9f))return ǚ;}return null;}
    bool ʋ(IMyInventory ǚ){var ʊ=ǚ.Owner as IMyTerminalBlock;return ʊ!=null&&í.Contains(ʊ.CubeGrid.EntityId);}
    int Ȭ(MyDefinitionId ƛ){int ż=0;foreach(var ƙ in é){var Ǜ=new List<MyProductionItem>();ƙ.GetQueue(Ǜ);foreach(var Ǒ in Ǜ)if(Ǒ.BlueprintId==ƛ)ż+=(int)Ǒ.Amount;}return ż;}
        
    void Ɯ(){IMyTextSurface[] ʌ={Q,R,S,T,U,V};foreach(var Ǎ in ʌ){if(Ǎ==null)continue;Ǎ.ContentType=ContentType.TEXT_AND_IMAGE;Ǎ.Script="";Ǎ.WriteText("");}}
    MySpriteDrawFrame ʎ(IMyTextSurface Ǎ){Ǎ.ContentType=ContentType.SCRIPT;Ǎ.Script="";K=Ǎ.SurfaceSize.X;L=Ǎ.SurfaceSize.Y;M=K/512f;N=L/512f;var ʍ=Ǎ.DrawFrame();ʍ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(K/2,L/2),new Vector2(K,L),Æ));return ʍ;}
    void ʒ(MySpriteDrawFrame ʍ,float ʏ,string ż,Color ǅ){float ʐ=ʏ*N,ʑ=K/2;ʍ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(ʑ,ʐ+12*N),new Vector2(K-12*M,24*N),ǅ*0.3f));ʍ.Add(new MySprite(SpriteType.TEXT,ż,new Vector2(ʑ,ʐ),null,ǅ,"White",TextAlignment.CENTER,0.8f*M));ʍ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(ʑ,ʐ+24*N),new Vector2(K-32*M,2*N),ǅ));}
    void ʘ(MySpriteDrawFrame ʍ,float Ƹ,float ʏ,float ʓ,float ȱ,float ʔ,Color ʕ,Color ʖ){Ƹ*=M;ʏ*=N;ʓ*=M;ȱ*=N;ʍ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(Ƹ+ʓ/2,ʏ+ȱ/2),new Vector2(ʓ,ȱ),ʖ));float ʗ=ʓ*Math.Max(0,Math.Min(1,ʔ));if(ʗ>1)ʍ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(Ƹ+ʗ/2,ʏ+ȱ/2),new Vector2(ʗ,ȱ),ʕ));}
    void ʝ(MySpriteDrawFrame ʍ,float Ƹ,float ʏ,float ʓ,float ȱ,string ʙ,float ʔ,Color ʕ,Color ʖ){float ʚ=Ƹ*M,ʛ=ʏ*N,ʜ=ʓ*M;ʍ.Add(new MySprite(SpriteType.TEXT,ʙ,new Vector2(ʚ,ʛ-2*N),null,È,"Monospace",TextAlignment.LEFT,0.5f*M));ʘ(ʍ,Ƹ,ʏ+12,ʓ,ȱ,ʔ,ʕ,ʖ);ʍ.Add(new MySprite(SpriteType.TEXT,$"{ʔ*100:0}%",new Vector2(ʚ+ʜ+5*M,ʛ+8*N),null,ʕ,"Monospace",TextAlignment.LEFT,0.45f*M));}
    void ʟ(MySpriteDrawFrame ʍ,float Ƹ,float ʏ,string ż,Color ǅ,float ʞ=0.5f,TextAlignment ƙ=TextAlignment.LEFT){ʍ.Add(new MySprite(SpriteType.TEXT,ż,new Vector2(Ƹ*M,ʏ*N),null,ǅ,"Monospace",ƙ,ʞ*M));}
    void ʡ(MySpriteDrawFrame ʍ,float Ƹ,float ʏ,float ʓ,float ȱ,Color ʖ,Color ʠ){Ƹ*=M;ʏ*=N;ʓ*=M;ȱ*=N;ʍ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(Ƹ+ʓ/2,ʏ+ȱ/2),new Vector2(ʓ,ȱ),ʠ));ʍ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(Ƹ+ʓ/2,ʏ+ȱ/2),new Vector2(ʓ-2*M,ȱ-2*N),ʖ));}
    void ʢ(MySpriteDrawFrame ʍ,float ʏ){ʍ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(K/2,ʏ*N),new Vector2(K-40*M,1*N),Ç));}
    Color ʣ(float Ɨ){return Ɨ>.7f?Ã:Ɨ>.3f?Ä:Å;}
    void ʻ(MySpriteDrawFrame ʍ,float Ƹ,float ʏ,float ʓ,float ȱ,List<float>ʤ,Color ʥ,Color ź,float ʦ=0,string ʧ=""){
    float ɷ=(Ƹ+35)*M,ʨ=ʏ*N,ʩ=(ʓ-40)*M,ʪ=(ȱ-25)*N;
    ʡ(ʍ,Ƹ+35,ʏ,ʓ-40,ȱ-25,Æ,Ç);
    float ʫ=ʦ;
    if(ʫ<=0&&ʤ.Count>0){foreach(var ǉ in ʤ)if(ǉ>ʫ)ʫ=ǉ;if(ʫ<=0)ʫ=1;ʫ=ʫ*1.1f;}
    if(ʫ<=0)ʫ=1;
    float ʬ=ʫ/10f;if(ʬ<1)ʬ=1;else if(ʬ<10)ʬ=(float)Math.Ceiling(ʬ);else ʬ=(float)(Math.Ceiling(ʬ/10)*10);
    float ʭ=ʬ*10;
    for(int Ǒ=1;Ǒ<10;Ǒ++)ʍ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(ɷ+ʩ/2,ʨ+ʪ-ʪ*Ǒ/10),new Vector2(ʩ-4*M,1*N),ź));
    for(int Ǒ=0;Ǒ<=10;Ǒ+=2){float ʮ=ʏ+ȱ-25-((ȱ-25)*Ǒ/10)-6;float ʯ=ʬ*Ǒ;string ʰ=ʯ>=1000?$"{ʯ/1000:F0}k":ʯ>=1?$"{ʯ:F0}":$"{ʯ:F1}";ʟ(ʍ,Ƹ,ʮ,ʰ+ʧ,Á,0.22f);}
    for(int Ǒ=0;Ǒ<=5;Ǒ++){float ʱ=Ƹ+35+(ʓ-40)*Ǒ/5;string ʲ=Ǒ==5?"Now":$"{10-Ǒ*2}m";ʟ(ʍ,ʱ,ʏ+ȱ-25+2,ʲ,Á,0.28f);}
    if(ʤ.Count<2)return;float ʳ=(ʩ-4*M)/(Ö-1);
    for(int Ǒ=1;Ǒ<ʤ.Count;Ǒ++){float ʴ=Math.Min(1,ʤ[Ǒ-1]/ʭ),ʵ=Math.Min(1,ʤ[Ǒ]/ʭ);float ʶ=ɷ+2*M+(Ǒ-1)*ʳ,ʷ=ʨ+ʪ-2*N-ʴ*(ʪ-4*N),ʸ=ɷ+2*M+Ǒ*ʳ,ʹ=ʨ+ʪ-2*N-ʵ*(ʪ-4*N);ʍ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2((ʶ+ʸ)/2,(ʷ+ʹ)/2),new Vector2((float)Math.Sqrt((ʸ-ʶ)*(ʸ-ʶ)+(ʹ-ʷ)*(ʹ-ʷ)),2*N),ʥ));}
    if(ʤ.Count>0){float ʺ=Math.Min(1,ʤ[ʤ.Count-1]/ʭ);float ʑ=ɷ+ʩ-5*M,ʐ=ʨ+ʪ-2*N-ʺ*(ʪ-4*N);ʍ.Add(new MySprite(SpriteType.TEXTURE,"Circle",new Vector2(ʑ,ʐ),new Vector2(8*M,8*N),ʥ));}}
        
    void ƭ(){int ɵ=0;foreach(var Ǎ in ã){if(ʄ(Ǎ))continue;var ɗ=Ǎ.GetInventory();if(ɗ==null||ɗ.ItemCount==0)continue;var Ƙ=Ǌ(ɗ);for(int Ǒ=Ƙ.Count-1;Ǒ>=0;Ǒ--){var ż=Ƙ[Ǒ].Type;var Ɠ=ɼ(ż);if(Ɠ==null||Ɠ==Ǎ)continue;var Ɇ=Ɠ.GetInventory();if(Ɇ==null||!ȑ(Ɇ,.98f))continue;ɗ.TransferItemTo(Ɇ,Ǒ,null,true,null);ɵ++;}}Echo($"SORT: Moved {ɵ} stacks");}
        
    IMyInventory Ɋ(MyItemType ż,IMyCargoContainer ʼ){var Ɠ=ɼ(ż);if(Ɠ==ʼ)return null;if(Ɠ!=null){var ʽ=Ɠ.GetInventory();if(ȑ(ʽ,.95f))return ʽ;var j=ʉ(Ɠ);if(j!=null)return j;if(ʼ!=null&&!ʄ(ʼ))return null;}IMyInventory ʾ=null,ʿ=null,ˀ=null;if(ʼ==null||Ɠ==null){foreach(var ǅ in ä){if(ʄ(ǅ)||ʅ(ǅ)||ǅ==ʼ)continue;var Ǒ=ǅ.GetInventory();if(Ǒ==null||ʋ(Ǒ)||!ȑ(Ǒ,.9f))continue;if(ʾ==null)ʾ=Ǒ;if(ʃ(Ǒ,ż))return Ǒ;}foreach(var ǅ in å){if(ʄ(ǅ)||ʅ(ǅ)||ǅ==ʼ)continue;var Ǒ=ǅ.GetInventory();if(Ǒ==null||ʋ(Ǒ)||!ȑ(Ǒ,.9f))continue;if(ʿ==null)ʿ=Ǒ;if(ʃ(Ǒ,ż))return Ǒ;}foreach(var ǅ in æ){if(ʄ(ǅ)||ʅ(ǅ)||ǅ==ʼ)continue;var Ǒ=ǅ.GetInventory();if(Ǒ==null||ʋ(Ǒ)||!ȑ(Ǒ,.9f))continue;if(ˀ==null)ˀ=Ǒ;if(ʃ(Ǒ,ż))return Ǒ;}}return ʾ??ʿ??ˀ;}
        
    void ƣ(){
    var ˁ=ʂ(Me.CustomData);
    var ˆ=new List<string>();
    if(ˁ.ContainsKey("[WAYPOINTS]"))foreach(var ˇ in ˁ["[WAYPOINTS]"].Split('\n')){var ż=ˇ.Trim();if(ż.StartsWith("GPS:"))ˆ.Add(ż);}
    var ˈ=new Dictionary<string,string>();
    var ˉ=new StringBuilder("[QUOTAS]\n");
    ˉ.AppendLine($"ammo_target  = {ē}");ˉ.AppendLine($"ta_target    = {đ}");ˉ.AppendLine($"ice_target   = {ġ}");ˉ.AppendLine($"uran_target  = {Ģ}");ˉ.AppendLine($"h2_target    = {ę}");ˉ.AppendLine($"o2_target    = {Ě}");ˉ.AppendLine($"tool_target  = {ģ}");ˉ.AppendLine($"msl_ammo_target = {Ĥ}");
    ˈ["[QUOTAS]"]=ˉ.ToString();
    var ˊ=new StringBuilder("[MISSILE]\n");
    ˊ.AppendLine($"status   = {Ŗ}");ˊ.AppendLine($"target   = {ŗ}");ˊ.AppendLine($"distance = {ř:F0}");ˊ.AppendLine($"speed    = {Ś:F0}");ˊ.AppendLine($"altitude = {ś:F0}");ˊ.AppendLine($"fuel     = {Ŝ:F0}%");ˊ.AppendLine($"battery  = {Ō:F0}%");ˊ.AppendLine($"armed    = {ŀ}");ˊ.AppendLine($"ready    = {Ł}");ˊ.AppendLine($"count    = {Ŀ}");
    ˈ["[MISSILE]"]=ˊ.ToString();
    var ˋ=new StringBuilder("[CONFIG]\n");
    ˋ.AppendLine($"ammo     = {ē,-8} ; Turret ammo target");ˋ.AppendLine($"load     = {ĕ,-8} ; Ammo per missile");ˋ.AppendLine($"ice      = {ġ,-8} ; Ice target (kg)");ˋ.AppendLine($"uran     = {Ģ,-8} ; Uranium target (kg)");ˋ.AppendLine($"h2       = {ę,-8} ; H2 bottles target");ˋ.AppendLine($"o2       = {Ě,-8} ; O2 bottles target");ˋ.AppendLine($"tool     = {ģ,-8} ; Tool sets target");ˋ.AppendLine($"mslAmmo  = {Ĥ,-8} ; Missile ammo target");ˋ.AppendLine($"type     = {Ė,-8} ; 0=Pistol,1=MR20,2=MR50A,3=Missile,4=25mm");ˋ.AppendLine("; Add -R after any item to recycle excess");
    ˈ["[CONFIG]"]=ˋ.ToString();
    var ˌ=new StringBuilder("[WAYPOINTS]\n");ˌ.AppendLine("; GPS:TargetName:X:Y:Z:#FF75C9F1:");foreach(var ʓ in ˆ)if(ʓ.StartsWith("GPS:"))ˌ.AppendLine(ʓ);
    ˈ["[WAYPOINTS]"]=ˌ.ToString();
    int ˍ=0,ˎ=0;foreach(var Ǥ in è)if(Ǥ.IsProducing)ˍ++;foreach(var ƙ in é)if(ƙ.IsProducing)ˎ++;
    var Ʊ=new StringBuilder("[STATUS]\n");Ʊ.AppendLine($"refineries = {ˍ}/{è.Count} working");Ʊ.AppendLine($"assemblers = {ˎ}/{é.Count} working");Ʊ.AppendLine($"cargo      = {ň:F0}%");Ʊ.AppendLine($"autoOrg    = {(H?"ON":"OFF")}");Ʊ.AppendLine($"ammoStock  = {Ē}");Ʊ.AppendLine($"ammoType   = {Ė}");Ʊ.AppendLine($"ammoQueued = {Ĕ}");Ʊ.AppendLine($"ammoReq    = {(ķ?1:0)}|need={ļ}|type={Ļ}|con={Ľ}|push={ľ}");
    ˈ["[STATUS]"]=Ʊ.ToString();
    var ˏ=new StringBuilder("[ORE]\n");string[] ː={"Iron","Nickel","Silicon","Cobalt","Silver","Gold","Magnesium","Uranium","Platinum","Stone","Ice"};foreach(var ɉ in ː){int ǉ=î.ContainsKey(ɉ)?î[ɉ]:0;if(ǉ>0)ˏ.AppendLine($"{ɉ,-12} = {ǉ:N0}");}
    ˈ["[ORE]"]=ˏ.ToString();
    var Ƀ=new StringBuilder("[INGOTS]\n");string[] ˑ={"Iron","Nickel","Silicon","Cobalt","Silver","Gold","Magnesium","Uranium","Platinum","Gravel"};foreach(var Ǒ in ˑ){string ǡ=Ǒ=="Gravel"?"Stone":Ǒ;int ǉ=ð.ContainsKey(ǡ)?ð[ǡ]:0;int ʈ=ñ.ContainsKey(ǡ)?ñ[ǡ]:0;Ƀ.AppendLine($"{Ǒ,-12} = {ǉ:N0}/{ʈ:N0}");}
    ˈ["[INGOTS]"]=Ƀ.ToString();
    var ˠ=new StringBuilder("[COMPONENTS]\n");string[] ˡ={"SteelPlate","Construction","InteriorPlate","SmallTube","LargeTube","Motor","Computer","MetalGrid","Display","BulletproofGlass","PowerCell","Thrust","Explosives","Detector","RadioCommunication","GravityGenerator","Girder","Medical","Reactor","SolarCell","Superconductor"};foreach(var ư in ˡ){int Ȕ=ï.ContainsKey(ư)?ï[ư]:0;int ʈ=ò.ContainsKey(ư)?ò[ư]:0;int ˢ=ʈ-Ȕ;string ˣ=ˢ>=0?"+":"-";string ˤ=Ň.Contains(ư)?" -R":"";ˠ.AppendLine($"{ư,-20} = {Ȕ}{ˣ}{Math.Abs(ˢ)}/{ʈ}{ˤ}");}
    ˈ["[COMPONENTS]"]=ˠ.ToString();
    var ˬ=new StringBuilder("[TURRET_AMMO]\n");string[] ˮ={"NATO_25x184mm","AutocannonClip","MediumCalibreAmmo","LargeCalibreAmmo","SmallRailgunAmmo","LargeRailgunAmmo","Missile200mm"};foreach(var ǡ in ˮ){int Ȕ=ć.ContainsKey(ǡ)?ć[ǡ]:0;int Ǽ=Ĉ.ContainsKey(ǡ)?Ĉ[ǡ]:đ;int ˢ=Ǽ-Ȕ;string ˣ=ˢ>=0?"+":"-";string ˤ=Ň.Contains(ǡ)?" -R":"";ˬ.AppendLine($"{ǡ,-20} = {Ȕ}{ˣ}{Math.Abs(ˢ)}/{Ǽ}{ˤ}");}
    ˈ["[TURRET_AMMO]"]=ˬ.ToString();
    var Ͱ=new StringBuilder("[BOTTLES]\n");int ͱ=ę-ė;int Ͳ=Ě-Ę;string ͳ=Ň.Contains("HydrogenBottle")?" -R":"";string ʹ=Ň.Contains("OxygenBottle")?" -R":"";string Ͷ=ͱ>=0?"+":"-";string ͷ=Ͳ>=0?"+":"-";Ͱ.AppendLine($"{"HydrogenBottle",-20} = {ė}{Ͷ}{Math.Abs(ͱ)}/{ę}{ͳ}");Ͱ.AppendLine($"{"OxygenBottle",-20} = {Ę}{ͷ}{Math.Abs(Ͳ)}/{Ě}{ʹ}");
    ˈ["[BOTTLES]"]=Ͱ.ToString();
    var ͺ=new StringBuilder("[TOOLS_WEAPONS]\n");for(int Ǒ=0;Ǒ<Ů.Length;Ǒ++)for(int ɧ=0;ɧ<Ů[Ǒ].Length;ɧ++){string ͻ=Ů[Ǒ][ɧ];int Ȕ=û.ContainsKey(ͻ)?û[ͻ]:0;int ˢ=ģ-Ȕ;string ˣ=ˢ>=0?"+":"-";string ˤ=Ň.Contains(ͻ)?" -R":"";ͺ.AppendLine($"{ͻ,-24} = {Ȕ}{ˣ}{Math.Abs(ˢ)}/{ģ}{ˤ}");}
    ˈ["[TOOLS_WEAPONS]"]=ͺ.ToString();
    var ͼ=new StringBuilder("[PERSONAL_AMMO]\n");string[] ͽ={"NATO_5p56_Mag","MR-20_Mag","MR-50A_Mag","MR-30E_Mag","S-10_Mag","S-20A_Mag","Elite_Mag","RocketMag","FlareMag"};for(int Ǒ=0;Ǒ<Ũ.Length;Ǒ++){int Ǽ=ÿ.ContainsKey(ũ[Ǒ])?ÿ[ũ[Ǒ]]:500;int Ȕ=ù.ContainsKey(ũ[Ǒ])?ù[ũ[Ǒ]]:0;int ˢ=Ǽ-Ȕ;string ˣ=ˢ>=0?"+":"-";string ˤ=Ň.Contains(ͽ[Ǒ])?" -R":"";ͼ.AppendLine($"{ͽ[Ǒ],-20} = {Ȕ}{ˣ}{Math.Abs(ˢ)}/{Ǽ}{ˤ}");}
    ˈ["[PERSONAL_AMMO]"]=ͼ.ToString();
    foreach(var ǘ in ˈ)ˁ[ǘ.Key]=ǘ.Value;
    var Ά=new StringBuilder();foreach(var ǘ in ˁ){string ǉ=ǘ.Value;if(!ǉ.EndsWith("\n"))ǉ+="\n";Ά.Append(ǉ);}Me.CustomData=Ά.ToString();
    }
        
    void ơ(){
    Έ();
    Ƥ();
    }
    void Έ(){
    string Ɠ=Me.CustomData;
    if(string.IsNullOrEmpty(Ɠ))return;
    bool Ή=false,Ί=false;
    var Ό=Ɠ.Split('\n');
    foreach(var ʀ in Ό){
    string ʰ=ʀ.Trim();
    if(ʰ.StartsWith("[CONFIG]")||ʰ.StartsWith("[TARGETS]")){Ή=true;Ί=false;continue;}
    if(ʰ.StartsWith("[COMPONENTS]")||ʰ.StartsWith("[TURRET_AMMO]")||ʰ.StartsWith("[BOTTLES]")||ʰ.StartsWith("[TOOLS")||ʰ.StartsWith("[PERSONAL_AMMO]")){Ί=true;Ή=false;continue;}
    if(ʰ.StartsWith("[")){Ή=false;Ί=false;continue;}
    if(ʰ.StartsWith("====")||ʰ.StartsWith("----")||ʰ.StartsWith("#")||ʰ.StartsWith(";")||!ʰ.Contains("="))continue;
    if(Ί&&ʰ.Contains("=")){string ͻ=ʰ.Split('=')[0].Trim();if(ʰ.Contains("-R"))Ň.Add(ͻ);else if(ʰ.Contains("-X"))Ň.Remove(ͻ);continue;}
    if(!Ή)continue;
    var ƈ=ʰ.Split('|');
    foreach(var Ɨ in ƈ){
    string Ύ=Ɨ.Split(';')[0].Trim();
    var ǘ=Ύ.Split('=');
    if(ǘ.Length<2)continue;
    string ǡ=ǘ[0].Trim();
    string ǉ=ǘ[1].Split(' ')[0].Split('(')[0].Trim();
    int ƹ;
    if(!int.TryParse(ǉ,out ƹ))continue;
    if(ǡ=="ammo"||ǡ=="tgt")ē=ƹ;
    else if(ǡ=="load")ĕ=ƹ;
    else if(ǡ=="ice")ġ=ƹ;
    else if(ǡ=="uran")Ģ=ƹ;
    else if(ǡ=="h2"){ę=Math.Max(20,ƹ);ȡ();}
    else if(ǡ=="o2"){Ě=Math.Max(20,ƹ);ȡ();}
    else if(ǡ=="tool"){ģ=Math.Max(20,ƹ);Ȟ(ģ);}
    else if(ǡ=="mslammo"||ǡ=="mslammotarget"||ǡ=="s10"){Ĥ=Math.Max(1000,ƹ);}
    else if(ǡ=="ta"||ǡ=="turret"){đ=Math.Max(0,ƹ);Ȣ();}
    else if(ǡ=="nato25")ȣ("NATO_25x184mm",ƹ);
    else if(ǡ=="autocannon")ȣ("AutocannonClip",ƹ);
    else if(ǡ=="assault")ȣ("MediumCalibreAmmo",ƹ);
    else if(ǡ=="artillery")ȣ("LargeCalibreAmmo",ƹ);
    else if(ǡ=="srail")ȣ("SmallRailgunAmmo",ƹ);
    else if(ǡ=="lrail")ȣ("LargeRailgunAmmo",ƹ);
    else if(ǡ=="missile"||ǡ=="rocket")ȣ("Missile200mm",ƹ);
    else if(ǡ=="type"){if(ƹ!=Ė&&ƹ>=0&&ƹ<10){string Ώ=Ŧ[Ė];Ȝ(Ώ,500);Ė=ƹ;Ū=MyDefinitionId.Parse(ď+ť[Ė]);ū=MyItemType.Parse(ţ+"AmmoMagazine/"+Ŧ[Ė]);string ΐ=Ŧ[Ė];Ȝ(ΐ,Ĥ);}}
    }}}
    void Ƥ(){
    if(Ƃ==null)ſ();
    if(Ƃ==null)return;
    string Ɠ=Ƃ.CustomData;
    if(string.IsNullOrEmpty(Ɠ))return;
    bool Α=false,Β=false;
    var Ό=Ɠ.Split('\n');
    foreach(var ʀ in Ό){
    string ʰ=ʀ.Trim();
    if(ʰ.StartsWith("[MISSILE]")){Α=true;Β=false;continue;}
    if(ʰ.StartsWith("[PAD_CFG]")||ʰ.StartsWith("[PAD_STATUS]")||ʰ.StartsWith("[PAD_DATA]")){Β=true;Α=false;continue;}
    if(ʰ.StartsWith("[")){Α=false;Β=false;continue;}
    if(ʰ.StartsWith("====")||ʰ.StartsWith("----")||ʰ.StartsWith("#")||ʰ.StartsWith(";")||!ʰ.Contains("="))continue;
    if(!Α&&!Β)continue;
    var ƈ=ʰ.Split('|');
    foreach(var Ɨ in ƈ){
    string Ύ=Ɨ.Split(';')[0].Trim();
    var ǘ=Ύ.Split('=');
    if(ǘ.Length<2)continue;
    string ǡ=ǘ[0].Trim();
    string ǉ=ǘ[1].Split(' ')[0].Split('(')[0].Trim();
    if(ǡ=="mode"){ŕ=ǉ;continue;}
    if(ǡ=="phase"){Ŗ=ǉ;continue;}
    if(ǡ=="target"){ŗ=ǉ;continue;}
    if(ǡ=="ctrlMode"){ş=ǉ;continue;}
    if(ǡ=="ctrlTarget"){Š=ǉ;continue;}
    if(ǡ=="ctrlStatus"){š=ǉ;continue;}
    if(ǡ=="prtPhase"){Ř=ǉ;continue;}
    int ƹ;float ʍ;
    if(ǡ=="mslDist"&&float.TryParse(ǉ,out ʍ)){ř=ʍ;continue;}
    if(ǡ=="mslSpeed"&&float.TryParse(ǉ,out ʍ)){Ś=ʍ;continue;}
    if(ǡ=="mslAlt"&&float.TryParse(ǉ,out ʍ)){ś=ʍ;continue;}
    if(ǡ=="mslFuel"&&float.TryParse(ǉ,out ʍ)){Ŝ=ʍ;continue;}
    if(ǡ=="mslETA"&&float.TryParse(ǉ,out ʍ)){ŝ=ʍ;continue;}
    if(ǡ=="mslBatPct"&&float.TryParse(ǉ,out ʍ)){Ō=ʍ;continue;}
    if(ǡ=="mslH2Pct"&&float.TryParse(ǉ,out ʍ)){ō=ʍ;continue;}
    if(ǡ=="mslO2Pct"&&float.TryParse(ǉ,out ʍ)){Ŏ=ʍ;continue;}
    if(ǡ=="mslH2F"&&float.TryParse(ǉ,out ʍ)){ŏ=ʍ;continue;}
    if(ǡ=="mslH2C"&&float.TryParse(ǉ,out ʍ)){Ő=ʍ;continue;}
    if(ǡ=="mslO2F"&&float.TryParse(ǉ,out ʍ)){ő=ʍ;continue;}
    if(ǡ=="mslO2C"&&float.TryParse(ǉ,out ʍ)){Œ=ʍ;continue;}
    if(ǡ=="mslBatC"&&float.TryParse(ǉ,out ʍ)){œ=ʍ;continue;}
    if(ǡ=="mslBatM"&&float.TryParse(ǉ,out ʍ)){Ŕ=ʍ;continue;}
    if(ǡ=="prtPist"&&float.TryParse(ǉ,out ʍ)){Ş=ʍ;continue;}
    if(!int.TryParse(ǉ,out ƹ))continue;
    if(ǡ=="ammoReq")ķ=ƹ==1;
    else if(ǡ=="ammoReqNeed")ļ=ƹ;
    else if(ǡ=="ammoReqType")Ļ=ƹ;
    else if(ǡ=="mslCount")Ŀ=ƹ;
    else if(ǡ=="mslArmed")ŀ=ƹ;
    else if(ǡ=="mslReady")Ł=ƹ;
    else if(ǡ=="ctrlPads")Ĩ=ƹ;
    else if(ǡ=="ctrlArmed")ĩ=ƹ;
    else if(ǡ=="ctrlReady")Ī=ƹ;
    else if(ǡ=="merged")ĺ=ƹ==1;
    else if(ǡ=="conLocked")Ĺ=ƹ==1;
    else if(ǡ=="warArmed")ĸ=ƹ==1;
    else if(ǡ=="warCount")į=ƹ;
    else if(ǡ=="mslIce")ī=ƹ;
    else if(ǡ=="mslUran")Ĭ=ƹ;
    else if(ǡ=="mslAmmo")ĭ=ƹ;
    else if(ǡ=="mslAmmoLoad")Į=ƹ;
    else if(ǡ=="mslGenCnt")İ=ƹ;
    else if(ǡ=="mslH2Cnt")ı=ƹ;
    else if(ǡ=="mslO2Cnt")Ĳ=ƹ;
    else if(ǡ=="mslReactCnt")ĳ=ƹ;
    else if(ǡ=="mslLsrCnt")Ĵ=ƹ;
    else if(ǡ=="mslLsrLnk")ĵ=ƹ;
    else if(ǡ=="mslAntCnt")Ķ=ƹ;
    else if(ǡ=="type"&&ƹ>=0&&ƹ<10){if(ƹ!=Ė){string Ώ=Ŧ[Ė];Ȝ(Ώ,500);Ė=ƹ;ű();string ΐ=Ŧ[Ė];Ȝ(ΐ,Ĥ);}}
    else if(ǡ=="prtState")ł=ƹ;
    else if(ǡ=="prtRem")Ń=ƹ;
    else if(ǡ=="prtTot")ń=ƹ;
    else if(ǡ=="prtBld")Ņ=ƹ;
    else if(ǡ=="printing")Ţ=ƹ==1;
    }}
    õ.Clear();
    if(Ɠ.Contains("[BLUEPRINT]")){int Γ=Ɠ.IndexOf("[BLUEPRINT]");if(Γ>=0){int Δ=Ɠ.IndexOf("\n[",Γ+11);string Ε=Δ>0?Ɠ.Substring(Γ,Δ-Γ):Ɠ.Substring(Γ);foreach(var Ζ in Ε.Split('\n')){if(!Ζ.Contains("="))continue;var Η=Ζ.Split('=');if(Η.Length<2)continue;string Θ=Η[0].Trim();if(Θ.Length==0||Θ.StartsWith("["))continue;int Ι;if(int.TryParse(Η[1].Trim(),out Ι)&&Ι>0)õ[Θ]=Ι;}}}}
        
    void ƥ(){
    Ľ=0;ľ=0;
    var Κ=new List<IMyShipConnector>();
    GridTerminalSystem.GetBlocksOfType(Κ,ǅ=>{string ƹ=ǅ.CustomName.ToUpper();return ƹ.Contains("[AMMO]")&&(ƹ.Contains("MISSILE")||ƹ.Contains($"PAD{A}"));});
    if(Κ.Count==0){GridTerminalSystem.GetBlocksOfType(Κ,ǅ=>{string ƹ=ǅ.CustomName.ToUpper();return ƹ.Contains("AMMO")&&ǅ.IsSameConstructAs(Me);});}
    Ľ=Κ.Count;
    if(Κ.Count==0)return;
    var Λ=Κ[0].GetInventory();if(Λ==null)return;
    var Μ=MyItemType.Parse(ţ+"AmmoMagazine/"+Ŧ[Ļ]);
    int Ν=(int)Λ.GetItemAmount(Μ);
    if(Ν>Į&&Ü!=null){
    int Ȯ=Ν-Į;var Ɇ=Ü.GetInventory();if(Ɇ!=null){var Ƙ=Ǌ(Λ);for(int Ǒ=Ƙ.Count-1;Ǒ>=0&&Ȯ>0;Ǒ--){if(Ƙ[Ǒ].Type!=Μ)continue;int ǔ=Math.Min((int)Ƙ[Ǒ].Amount,Ȯ);Λ.TransferItemTo(Ɇ,Ǒ,null,true,(MyFixedPoint)ǔ);Ȯ-=ǔ;}}}
    if(!ķ||ļ<=0)return;
    int Ξ=0;
    Action<IMyInventory>Ο=ɗ=>{if(Ξ>=ļ||ɗ==null)return;var Ƙ=Ǌ(ɗ);for(int Ǒ=Ƙ.Count-1;Ǒ>=0&&Ξ<ļ;Ǒ--){if(Ƙ[Ǒ].Type!=Μ)continue;int ǔ=Math.Min((int)Ƙ[Ǒ].Amount,ļ-Ξ);ɗ.TransferItemTo(Λ,Ǒ,null,true,(MyFixedPoint)ǔ);Ξ+=ǔ;}};
    Action<IMyCargoContainer>Π=ȍ=>{if(ȍ!=null)Ο(ȍ.GetInventory());};
    Π(Ü);Π(Þ);Π(Ø);
    foreach(var ǅ in ã){if(Ξ>=ļ)break;Π(ǅ);}
    foreach(var ǅ in ç){if(Ξ>=ļ)break;Π(ǅ);}
    foreach(var ǅ in â){if(Ξ>=ļ)break;Π(ǅ);}
    foreach(var ƙ in é){if(Ξ>=ļ)break;Ο(ƙ.GetInventory(1));}
    ľ=Ξ;
    }
        
    void Ʀ(){
    Ρ();
    if(ŕ=="FLIGHT"){
    if(Q!=null)Σ();
    if(R!=null)Τ();
    if(S!=null)Υ();
    }else if(ŕ=="CONTROLLER"){
    if(Q!=null)Φ();
    if(R!=null)Τ();
    if(S!=null)Χ();
    }else if(ŕ=="MISSILE"){
    if(Q!=null)Ψ();
    if(R!=null)Τ();
    if(S!=null)Ω();
    }else if(ŕ=="PRINT"){
    if(Q!=null)Ϊ();
    if(R!=null)Τ();
    if(S!=null)Ϋ();
    }else{
    if(Q!=null)Ψ();
    if(R!=null)Τ();
    if(S!=null)Ω();
    }
    if(T!=null)ά();
    if(U!=null)έ();
    if(V!=null)ή();
    }
        
    void Ρ(){
    if(B%10!=0)return;
    var ǧ=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(ǧ,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid);
    float Ǩ=0,ǩ=0,ί=0,ΰ=0;foreach(var Ǝ in ǧ){Ǩ+=Ǝ.CurrentStoredPower;ǩ+=Ǝ.MaxStoredPower;ί+=Ǝ.CurrentInput;ΰ+=Ǝ.CurrentOutput;}
    var Ż=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(Ż,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid);
    float Ž=0,Ǫ=0,ž=0,ǫ=0;
    foreach(var ż in Ż){string ƹ=ż.BlockDefinition.SubtypeId.ToLower();if(ƹ.Contains("hydrogen")){Ž+=(float)ż.FilledRatio*ż.Capacity;Ǫ+=ż.Capacity;}else{ž+=(float)ż.FilledRatio*ż.Capacity;ǫ+=ż.Capacity;}}
    float α=0,β=0;foreach(var ǅ in ã){var ǚ=ǅ.GetInventory();if(ǚ!=null){α+=(float)ǚ.CurrentVolume*1000;β+=(float)ǚ.MaxVolume*1000;}}
    float γ=0,δ=0,ε=0,ζ=0;
    foreach(var Ǥ in è){var η=Ǥ.GetInventory(0);if(η!=null){γ+=(float)η.CurrentVolume*1000;δ+=(float)η.MaxVolume*1000;}}
    foreach(var ƙ in é){var θ=ƙ.GetInventory(0);if(θ!=null){ε+=(float)θ.CurrentVolume*1000;ζ+=(float)θ.MaxVolume*1000;}}
    var ι=new List<IMySolarPanel>();GridTerminalSystem.GetBlocksOfType(ι,Ǝ=>Ǝ.IsSameConstructAs(Me)&&(Ǝ.CustomName.Contains(O)||Ǝ.CubeGrid==Me.CubeGrid));
    float κ=0;foreach(var Ǎ in ι)κ+=Ǎ.CurrentOutput;
    var λ=new List<IMyPowerProducer>();GridTerminalSystem.GetBlocksOfType(λ,Ǝ=>Ǝ.IsSameConstructAs(Me)&&(Ǝ.CustomName.Contains(O)||Ǝ.CubeGrid==Me.CubeGrid)&&Ǝ.BlockDefinition.SubtypeId.Contains("Wind"));
    float ˌ=0;foreach(var ʓ in λ)ˌ+=ʓ.CurrentOutput;
    float μ=0;foreach(var Ǥ in ê)μ+=Ǥ.CurrentOutput;
    float ν=0;foreach(var ǥ in ë){var ξ=ǥ as IMyPowerProducer;if(ξ!=null)ν+=ξ.CurrentOutput;}
    int ο=Ĕ+ě+Ĝ;foreach(var ǘ in ô)ο+=ǘ.Value;
    É.Add(Ǩ);Ê.Add(Ž/1000);Ë.Add(ž/1000);Ì.Add(α);Í.Add(γ);Î.Add(ε);Ï.Add((float)ο);
    Ð.Add(ί);Ñ.Add(ΰ);Ò.Add(κ);Ó.Add(ˌ);Ô.Add(μ);Õ.Add(ν);
    while(É.Count>Ö)É.RemoveAt(0);while(Ê.Count>Ö)Ê.RemoveAt(0);while(Ë.Count>Ö)Ë.RemoveAt(0);while(Ì.Count>Ö)Ì.RemoveAt(0);while(Í.Count>Ö)Í.RemoveAt(0);while(Î.Count>Ö)Î.RemoveAt(0);while(Ï.Count>Ö)Ï.RemoveAt(0);while(Ð.Count>Ö)Ð.RemoveAt(0);while(Ñ.Count>Ö)Ñ.RemoveAt(0);while(Ò.Count>Ö)Ò.RemoveAt(0);while(Ó.Count>Ö)Ó.RemoveAt(0);while(Ô.Count>Ö)Ô.RemoveAt(0);while(Õ.Count>Ö)Õ.RemoveAt(0);
    }
        
    void Ψ(){
    var ʍ=ʎ(Q);
    string[] π={"BUILD STATUS","MISSILE STATUS","FUEL/TARGET","POWER","CARGO","PRODUCTION","COMMS"};
    ʒ(ʍ,10,$"{π[C]} [{C+1}/7]",À);
    float ʏ=50;
    if(C==0){
    string[] ρ={"SteelPlate","Construction","InteriorPlate","SmallTube","LargeTube","Motor","Computer","MetalGrid","Display","BulletproofGlass","PowerCell","Thrust","Explosives","Detector","RadioCommunication","GravityGenerator","Girder","Medical","Reactor","SolarCell","Superconductor"};
    int ς=(int)((L-70*N)/(22*N));int σ=Math.Max(5,(ς-6)/2);
    ʟ(ʍ,20,ʏ,"COMPONENTS",À,0.55f);ʏ+=28;
    int τ=0;float υ=ʏ;
    foreach(string ǡ in ρ){if(τ>=σ*2)break;int φ=ï.ContainsKey(ǡ)?ï[ǡ]:0;int ȴ=ò.ContainsKey(ǡ)?ò[ǡ]:0;int ǯ=Math.Max(0,ȴ-φ);Color ǅ=φ>=ȴ?Ã:Å;float χ=τ<σ?15:260;float ψ=υ+(τ%σ)*22;string Ɛ=ǡ.Length>12?ǡ.Substring(0,10)+"..":ǡ;ʟ(ʍ,χ,ψ,$"{Ɛ}:{φ}+{ǯ}/{ȴ}",ǅ,0.42f);τ++;}
    ʏ=υ+σ*22+8;ʢ(ʍ,ʏ);ʏ+=12;
    ʟ(ʍ,20,ʏ,"FUEL & AMMO",Â,0.55f);ʏ+=26;
    int ω=Ė==0?Ĥ:ē;ʟ(ʍ,15,ʏ,$"Ammo({Ť[Ė]}):{Ē}+{Ĕ}/{ω}",Ē>=ω?Ã:Ä,0.42f);ʏ+=22;
    int ϊ=Math.Max(0,ę-ė);ʟ(ʍ,15,ʏ,$"H2Bot:{ė}+{ϊ}/{ę}",ė>=ę?Ã:Ä,0.42f);
    int ϋ=Math.Max(0,Ě-Ę);ʟ(ʍ,260,ʏ,$"O2Bot:{Ę}+{ϋ}/{Ě}",Ę>=Ě?Ã:Ä,0.42f);ʏ+=22;
    int u=î.ContainsKey("Ice")?î["Ice"]:0;int ό=ð.ContainsKey("Uranium")?ð["Uranium"]:0;
    ʟ(ʍ,15,ʏ,$"Ice:{u} Uranium:{ό}",u>100&&ό>5?Ã:Ä,0.42f);ʏ+=28;
    ʢ(ʍ,ʏ);ʏ+=12;ʟ(ʍ,20,ʏ,"MISSING",Å,0.55f);ʏ+=26;
    int ύ=Math.Max(3,(ς-σ*2-8)/2);τ=0;υ=ʏ;
    foreach(var ǘ in ó){if(τ>=ύ*2)break;float χ=τ<ύ?15:260;float ψ=υ+(τ%ύ)*22;string Ɛ=ǘ.Key.Length>10?ǘ.Key.Substring(0,8)+"..":ǘ.Key;ʟ(ʍ,χ,ψ,$"{Ɛ}:-{ǘ.Value}",Å,0.42f);τ++;}
    if(ó.Count==0)ʟ(ʍ,15,ʏ,"All stocked!",Ã,0.5f);
    }else if(C==1){
    if(Ł>0||ŀ>0||Ŀ>0||Ţ){
    ʟ(ʍ,20,ʏ,$"Missiles Ready: {Ł}",Ł>0?Ã:Á,0.6f);ʏ+=35;
    ʟ(ʍ,20,ʏ,$"Missiles Armed: {ŀ}",ŀ>0?Ä:Á,0.6f);ʏ+=35;
    ʟ(ʍ,20,ʏ,$"Total Count: {Ŀ}",È,0.6f);ʏ+=35;
    ʟ(ʍ,20,ʏ,$"Phase: {Ŗ}",Â,0.6f);ʏ+=40;
    ʢ(ʍ,ʏ);ʏ+=15;
    ʟ(ʍ,20,ʏ,"COMMUNICATIONS",Á,0.5f);ʏ+=28;
    ʟ(ʍ,20,ʏ,$"Laser Antennas: {Ĵ}  Linked: {ĵ}",ĵ>0?Ã:Ĵ>0?Ä:Á,0.55f);ʏ+=30;
    ʟ(ʍ,20,ʏ,$"Radio Antennas: {Ķ}",Ķ>0?Ã:Á,0.55f);ʏ+=35;
    if(Ţ){float ʔ=ń>0?(float)(ń-Ń)/ń:0;ʝ(ʍ,20,ʏ,350,18,"Printing",ʔ,ʔ>=1?Ã:Ä,Ç);ʏ+=30;ʟ(ʍ,20,ʏ,$"{ʔ*100:F0}% ({ń-Ń}/{ń})",ʔ>=1?Ã:Ä,0.5f);}
    }else{
    ʟ(ʍ,20,ʏ,"No Missile",Ä,0.8f);ʏ+=50;
    ʟ(ʍ,20,ʏ,"Build steps:",Á,0.6f);ʏ+=35;
    ʟ(ʍ,30,ʏ,"1.PRINT 2.Blueprint 3.Weld 4.DOCK",È,0.55f);ʏ+=45;
    ʟ(ʍ,20,ʏ,"Missing:",Á,0.6f);ʏ+=32;
    int τ=0;foreach(var ǘ in ó){if(τ>=4)break;ʟ(ʍ,30,ʏ,$"{ǘ.Key}: -{ǘ.Value}",Ä,0.55f);ʏ+=28;τ++;}
    if(ó.Count==0)ʟ(ʍ,30,ʏ,"All components stocked!",Ã,0.6f);
    }
    }else if(C==2){
    float ώ=Ŋ/100f,Ϗ=ŋ/100f;
    ʝ(ʍ,20,ʏ,350,16,"Hydrogen",ώ,ʣ(ώ),Ç);ʏ+=40;
    ʝ(ʍ,20,ʏ,350,16,"Oxygen",Ϗ,ʣ(Ϗ),Ç);ʏ+=40;
    ʝ(ʍ,20,ʏ,350,16,"Battery",ŉ/100f,ʣ(ŉ/100f),Ç);ʏ+=40;
    int ϐ=Ė==0?Ĥ:ē;ʟ(ʍ,20,ʏ,$"Ammo: {Ē}+{Ĕ}/{ϐ}",Ē>=ϐ?Ã:Ä,0.5f);ʏ+=30;
    ʟ(ʍ,20,ʏ,$"H2 Bottles: {ė}+{ě}/{ę}",ė>=ę?Ã:Ä,0.5f);ʏ+=30;
    ʟ(ʍ,20,ʏ,$"O2 Bottles: {Ę}+{Ĝ}/{Ě}",Ę>=Ě?Ã:Ä,0.5f);
    }else if(C==3){
    var ǧ=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(ǧ,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid);
    float Ǩ=0,ǩ=0,ί=0,ΰ=0;foreach(var Ǝ in ǧ){Ǩ+=Ǝ.CurrentStoredPower;ǩ+=Ǝ.MaxStoredPower;ί+=Ǝ.CurrentInput;ΰ+=Ǝ.CurrentOutput;}
    float ϑ=ǩ>0?Ǩ/ǩ:0;float ϒ=ί-ΰ;
    ʝ(ʍ,20,ʏ,350,20,"Battery Charge",ϑ,ʣ(ϑ),Ç);ʏ+=45;
    ʟ(ʍ,20,ʏ,$"Stored: {Ǩ:F1}/{ǩ:F1} MWh",È,0.5f);ʏ+=30;
    ʟ(ʍ,20,ʏ,$"Input: {ί:F2} MW  Output: {ΰ:F2} MW",È,0.5f);ʏ+=30;
    ʟ(ʍ,20,ʏ,$"Net: {(ϒ>=0?"+":"")}{ϒ:F2} MW",ϒ>=0?Ã:Ä,0.5f);ʏ+=35;
    int ϓ=ğ+Ġ;
    ʟ(ʍ,20,ʏ,"URANIUM",Á,0.4f);ʏ+=20;
    ʟ(ʍ,30,ʏ,$"Total: {ϓ}",ϓ>10?Ã:Å,0.55f);ʏ+=25;
    ʟ(ʍ,30,ʏ,$"Storage: {ğ}   Reactors: {Ġ}",È,0.45f);
    }else if(C==4){
    var ϔ=new List<KeyValuePair<string,string>>();
    foreach(var ǘ in î)ϔ.Add(new KeyValuePair<string,string>("Ore",ǘ.Key+": "+ǘ.Value));
    foreach(var ǘ in ð){string ϕ=ǘ.Key=="Stone"?"Gravel":ǘ.Key;ϔ.Add(new KeyValuePair<string,string>("Ingot",ϕ+": "+ǘ.Value));}
    foreach(var ǘ in ï)ϔ.Add(new KeyValuePair<string,string>("Comp",ǘ.Key+": "+ǘ.Value));
    foreach(var ǘ in û)ϔ.Add(new KeyValuePair<string,string>("Tool",ǘ.Key+": "+ǘ.Value));
    foreach(var ǘ in ù)ϔ.Add(new KeyValuePair<string,string>("PAmmo",ǘ.Key+": "+ǘ.Value));
    if(Ē>0)ϔ.Add(new KeyValuePair<string,string>("Ammo",Ť[Ė]+": "+Ē));
    if(ė>0)ϔ.Add(new KeyValuePair<string,string>("Bottle","H2 Bottles: "+ė));
    if(Ę>0)ϔ.Add(new KeyValuePair<string,string>("Bottle","O2 Bottles: "+Ę));
    foreach(var ǘ in ą)ϔ.Add(new KeyValuePair<string,string>("Food",ǘ.Key+": "+ǘ.Value));
    foreach(var ǘ in Ć)ϔ.Add(new KeyValuePair<string,string>("Misc",ǘ.Key+": "+ǘ.Value));
    int ϖ=ϔ.Count;int ϗ=Math.Min(E+16,ϖ);
    ʝ(ʍ,20,ʏ,460,18,"Cargo Fill",ň/100f,ʣ(1-ň/100f),Ç);ʏ+=26;
    ʟ(ʍ,20,ʏ,$"STORAGE ({ϗ}/{ϖ})",Á,0.45f);ʏ+=22;
    int Ϙ=E,τ=0;string ϙ="";
    foreach(var ǘ in ϔ){if(Ϙ>0){Ϙ--;continue;}if(τ>=16)break;
    string[]κ=ǘ.Value.Split(':');string Ɛ=κ[0].Trim();string Ϛ=κ.Length>1?κ[1].Trim():"";
    if(ǘ.Key!=ϙ){Color ŷ=ǘ.Key=="Ore"?Ä:ǘ.Key=="Ingot"?Â:ǘ.Key=="Comp"?Ã:ǘ.Key=="Tool"?À:ǘ.Key=="Food"?new Color(200,255,100):ǘ.Key=="Misc"?new Color(180,150,200):Á;ʟ(ʍ,20,ʏ,ǘ.Key.ToUpper(),ŷ,0.4f);ʏ+=18;ϙ=ǘ.Key;}
    ʟ(ʍ,25,ʏ,Ɛ,È,0.45f);ʟ(ʍ,280,ʏ,Ϛ,È,0.45f);ʏ+=20;τ++;}
    }else if(C==5){
    int ˍ=0,ˎ=0;foreach(var Ǥ in è)if(Ǥ.IsProducing)ˍ++;foreach(var ƙ in é)if(ƙ.IsProducing)ˎ++;
    ʟ(ʍ,20,ʏ,$"Refineries: {ˍ}/{è.Count}  Assemblers: {ˎ}/{é.Count}",ˍ>0||ˎ>0?Ã:Á,0.45f);ʏ+=28;
    int ϛ=ô.Count+(Ĕ>0?1:0)+(ě>0||Ĝ>0?1:0);
    int Ϝ=Math.Max(1,(ô.Count+5)/6);int ϝ=Math.Min(E/20,Ϝ-1)+1;
    ʟ(ʍ,20,ʏ,$"Queue ({ϛ} types) ({ϝ}/{Ϝ}):",È,0.45f);ʏ+=22;
    int τ=0,Ϙ=(ϝ-1)*6;
    foreach(var ǘ in ô){if(Ϙ>0){Ϙ--;continue;}if(τ>=6)break;ʟ(ʍ,20,ʏ,$"{ǘ.Key}: {ǘ.Value}",Â,0.4f);ʏ+=18;τ++;}
    if(τ<6&&Ĕ>0){ʟ(ʍ,20,ʏ,$"{Ť[Ė]}: {Ĕ}",Â,0.4f);ʏ+=18;τ++;}
    if(τ<6&&(ě>0||Ĝ>0)){ʟ(ʍ,20,ʏ,$"Bottles H2:{ě} O2:{Ĝ}",Â,0.4f);}
    }else{
    ʟ(ʍ,20,ʏ,"PAD FACILITIES",Á,0.45f);ʏ+=20;
    ʟ(ʍ,20,ʏ,$"Medical Bays: {ĥ}",È,0.45f);ʏ+=18;
    ʟ(ʍ,20,ʏ,$"Survival Kits: {Ħ}",È,0.45f);ʏ+=18;
    ʟ(ʍ,20,ʏ,$"Cryo Chambers: {ħ}",È,0.45f);ʏ+=20;
    ʟ(ʍ,20,ʏ,$"Miners Tracked: {Z.Count}",È,0.5f);ʏ+=25;
    int z=0,Ϟ=0;foreach(var Ǧ in Z.Values){if(Ǧ.b=="DOCKED")z++;else if(Ǧ.b.Contains("DRILL")||Ǧ.b.Contains("GRIND"))Ϟ++;}
    ʟ(ʍ,20,ʏ,$"Docked: {z}  Working: {Ϟ}",Ã,0.5f);ʏ+=25;
    ʟ(ʍ,20,ʏ,$"IGC: MINER_BEACON",Á,0.4f);
    }
    ʍ.Dispose();
    }
        
    void Τ(){
    var ʍ=ʎ(R);
    ʒ(ʍ,10,"POWER OVERVIEW",À);
    var ǧ=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(ǧ,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid);
    float Ǩ=0,ǩ=0,ί=0,ΰ=0;foreach(var Ǝ in ǧ){Ǩ+=Ǝ.CurrentStoredPower;ǩ+=Ǝ.MaxStoredPower;ί+=Ǝ.CurrentInput;ΰ+=Ǝ.CurrentOutput;}
    float ϑ=ǩ>0?Ǩ/ǩ:0;float ϒ=ί-ΰ;
    ʝ(ʍ,20,50,350,20,"Battery Storage",ϑ,ʣ(ϑ),Ç);
    ʟ(ʍ,20,90,$"Stored: {Ǩ:F1} / {ǩ:F1} MWh",È,0.5f);
    string ϟ=ϒ>=0?$"Charging: +{ϒ:F2} MW":$"Discharging: {ϒ:F2} MW";
    ʟ(ʍ,20,120,ϟ,ϒ>=0?Ã:Ä,0.5f);
    ʢ(ʍ,160);
    var Ϡ=new List<IMySolarPanel>();GridTerminalSystem.GetBlocksOfType(Ϡ,Ǝ=>Ǝ.IsSameConstructAs(Me)&&(Ǝ.CustomName.Contains(O)||Ǝ.CubeGrid==Me.CubeGrid));
    float κ=0;foreach(var Ǎ in Ϡ)κ+=Ǎ.CurrentOutput;
    ʟ(ʍ,20,170,$"Solar: {Ϡ.Count} panels = {κ:F2} MW",κ>0?Ã:Á,0.5f);
    var ϡ=new List<IMyPowerProducer>();GridTerminalSystem.GetBlocksOfType(ϡ,Ǝ=>Ǝ.IsSameConstructAs(Me)&&(Ǝ.CustomName.Contains(O)||Ǝ.CubeGrid==Me.CubeGrid)&&Ǝ.BlockDefinition.SubtypeId.Contains("Wind"));
    float ˌ=0;foreach(var ʓ in ϡ)ˌ+=ʓ.CurrentOutput;
    ʟ(ʍ,20,200,$"Wind: {ϡ.Count} turbines = {ˌ:F2} MW",ˌ>0?Ã:Á,0.5f);
    float μ=0;foreach(var Ǥ in ê)μ+=Ǥ.CurrentOutput;
    ʟ(ʍ,20,230,$"Reactors: {ê.Count} units = {μ:F2} MW",μ>0?Ã:Á,0.5f);
    float ν=0;foreach(var ǥ in ë)if(ǥ.Enabled)ν+=0.5f;
    ʟ(ʍ,20,260,$"Generators: {ë.Count} units = {ν:F1} MW (est)",ν>0?Ã:Á,0.5f);
    ʢ(ʍ,300);
    var Ż=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(Ż,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid);
    float Ž=0,Ǫ=0;foreach(var ż in Ż){string ƹ=ż.BlockDefinition.SubtypeId.ToLower();if(ƹ.Contains("hydrogen")){Ž+=(float)ż.FilledRatio*ż.Capacity;Ǫ+=ż.Capacity;}}
    float ώ=Ǫ>0?Ž/Ǫ:0;
    ʝ(ʍ,20,320,350,16,"Hydrogen Tanks",ώ,ʣ(ώ),Ç);
    ʟ(ʍ,20,360,$"Stored: {Ž/1000:F1}k / {Ǫ/1000:F1}k L",È,0.45f);
    ʢ(ʍ,390);
    int ˍ=0,ˎ=0;var Ϣ=new Dictionary<string,int>();var ϣ=new Dictionary<string,int>();
    foreach(var Ǥ in è){if(Ǥ.IsProducing){ˍ++;var ȹ=Ǥ.GetInventory(0);if(ȹ!=null){foreach(var ǋ in Ǌ(ȹ))ǎ(Ϣ,ǋ.Type.SubtypeId,(int)ǋ.Amount);}}}
    foreach(var ƙ in é){if(ƙ.IsProducing){ˎ++;var Ǜ=new List<MyProductionItem>();ƙ.GetQueue(Ǜ);if(Ǜ.Count>0)ǎ(ϣ,Ǜ[0].BlueprintId.SubtypeName,(int)Ǜ[0].Amount);}}
    ʟ(ʍ,20,400,"PRODUCTION",À,0.5f);
    ʟ(ʍ,20,425,$"Refineries: {ˍ}/{è.Count}",ˍ>0?Ã:Á,0.45f);
    string Ϥ="";if(Ϣ.Count>0){int ǅ=0;foreach(var ǘ in Ϣ){if(ǅ>0)Ϥ+=", ";Ϥ+=$"{ǘ.Key}";ǅ++;if(ǅ>=3)break;}}else Ϥ="Idle";
    ʟ(ʍ,150,425,Ϥ,Â,0.4f);
    ʟ(ʍ,20,455,$"Assemblers: {ˎ}/{é.Count}",ˎ>0?Ã:Á,0.45f);
    string ϥ="";if(ϣ.Count>0){int ǅ=0;foreach(var ǘ in ϣ){if(ǅ>0)ϥ+=", ";ϥ+=$"{ǘ.Key}x{ǘ.Value}";ǅ++;if(ǅ>=2)break;}}else ϥ="Idle";
    ʟ(ʍ,150,455,ϥ,Â,0.4f);
    ʍ.Dispose();
    }
        
    void Ω(){
    var ʍ=ʎ(S);
    string[] Ϧ={"Battery Power","Hydrogen Tanks","Oxygen Tanks","Cargo Capacity","Refinery Input","Assembler Input","Production Queue","Power Input","Power Output","Solar Output","Wind Output","Reactor Output"};
    string[] ϧ={"MWh","kL","kL","L","L","L","","MW","MW","MW","MW","MW"};
    List<float>[] Ϩ={É,Ê,Ë,Ì,Í,Î,Ï,Ð,Ñ,Ò,Ó,Ô};
    Color[] ϩ={Â,À,Ã,Ä,new Color(200,100,50),new Color(100,200,100),new Color(200,150,255),new Color(255,255,100),new Color(255,150,100),new Color(255,220,50),new Color(150,200,255),new Color(50,255,150)};
    int Ϫ=12;int ϫ=D%Ϫ;
    ʒ(ʍ,10,$"{Ϧ[ϫ]} [{ϫ+1}/{Ϫ}]",ϩ[ϫ]);
    ʻ(ʍ,20,50,472,280,Ϩ[ϫ],ϩ[ϫ],Ç,0,ϧ[ϫ]);
    float ɾ=Ϩ[ϫ].Count>0?Ϩ[ϫ][Ϩ[ϫ].Count-1]:0;
    string Ϭ="";
    if(ϫ==0){var ǧ=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(ǧ,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid);float Ǩ=0,ǩ=0;foreach(var Ǝ in ǧ){Ǩ+=Ǝ.CurrentStoredPower;ǩ+=Ǝ.MaxStoredPower;}float ʔ=ǩ>0?Ǩ/ǩ*100:0;Ϭ=$"Current: {ɾ:F1} MWh ({ʔ:F0}% of {ǩ:F1} MWh)";}
    else if(ϫ==1){var Ż=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(Ż,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid&&Ǝ.BlockDefinition.SubtypeId.ToLower().Contains("hydrogen"));float Ž=0,Ǫ=0;foreach(var ż in Ż){Ž+=(float)ż.FilledRatio*ż.Capacity;Ǫ+=ż.Capacity;}float ʔ=Ǫ>0?Ž/Ǫ*100:0;Ϭ=$"Current: {ɾ:F0}kL ({ʔ:F0}% of {Ǫ/1000:F0}kL)";}
    else if(ϫ==2){var Ż=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(Ż,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid&&!Ǝ.BlockDefinition.SubtypeId.ToLower().Contains("hydrogen"));float ž=0,ǫ=0;foreach(var ż in Ż){ž+=(float)ż.FilledRatio*ż.Capacity;ǫ+=ż.Capacity;}float ʔ=ǫ>0?ž/ǫ*100:0;Ϭ=$"Current: {ɾ:F0}kL ({ʔ:F0}% of {ǫ/1000:F0}kL)";}
    else if(ϫ==3){float α=0,β=0;foreach(var ǅ in ã){var ǚ=ǅ.GetInventory();if(ǚ!=null){α+=(float)ǚ.CurrentVolume*1000;β+=(float)ǚ.MaxVolume*1000;}}float ʔ=β>0?α/β*100:0;Ϭ=$"Current: {ɾ:F0}L ({ʔ:F0}% of {β:F0}L)";}
    else if(ϫ==4){int ˍ=0;foreach(var Ǥ in è)if(Ǥ.IsProducing)ˍ++;Ϭ=$"Current: {ɾ:F0}L | {ˍ}/{è.Count} refineries active";}
    else if(ϫ==5){int ˎ=0;foreach(var ƙ in é)if(ƙ.IsProducing)ˎ++;Ϭ=$"Current: {ɾ:F0}L | {ˎ}/{é.Count} assemblers active";}
    else if(ϫ==6){int ˎ=0;foreach(var ƙ in é)if(ƙ.IsProducing)ˎ++;Ϭ=$"Production: {ˎ}/{é.Count} assemblers active";}
    else if(ϫ==7){var ǧ=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(ǧ,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid);float ί=0;foreach(var Ǝ in ǧ)ί+=Ǝ.CurrentInput;Ϭ=$"Current: {ɾ:F2} MW charging ({ǧ.Count} batteries)";}
    else if(ϫ==8){var ǧ=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(ǧ,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid);float ΰ=0;foreach(var Ǝ in ǧ)ΰ+=Ǝ.CurrentOutput;Ϭ=$"Current: {ɾ:F2} MW discharging ({ǧ.Count} batteries)";}
    else if(ϫ==9){var ι=new List<IMySolarPanel>();GridTerminalSystem.GetBlocksOfType(ι,Ǝ=>Ǝ.IsSameConstructAs(Me)&&(Ǝ.CustomName.Contains(O)||Ǝ.CubeGrid==Me.CubeGrid));float κ=0,ϭ=0;foreach(var Ǎ in ι){κ+=Ǎ.CurrentOutput;ϭ+=Ǎ.MaxOutput;}Ϭ=$"Current: {ɾ:F2} MW ({ι.Count} panels, max {ϭ:F1} MW)";}
    else if(ϫ==10){var λ=new List<IMyPowerProducer>();GridTerminalSystem.GetBlocksOfType(λ,Ǝ=>Ǝ.IsSameConstructAs(Me)&&(Ǝ.CustomName.Contains(O)||Ǝ.CubeGrid==Me.CubeGrid)&&Ǝ.BlockDefinition.SubtypeId.Contains("Wind"));float ˌ=0,Ϯ=0;foreach(var ʓ in λ){ˌ+=ʓ.CurrentOutput;Ϯ+=ʓ.MaxOutput;}Ϭ=$"Current: {ɾ:F2} MW ({λ.Count} turbines, max {Ϯ:F1} MW)";}
    else if(ϫ==11){float μ=0,ϯ=0;foreach(var Ǥ in ê){μ+=Ǥ.CurrentOutput;ϯ+=Ǥ.MaxOutput;}Ϭ=$"Current: {ɾ:F2} MW ({ê.Count} reactors, max {ϯ:F1} MW)";}
    ʟ(ʍ,20,340,Ϭ,ϩ[ϫ],0.45f);
    ʢ(ʍ,380);
    var ϰ=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(ϰ,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid);
    float ϱ=0,ϲ=0;foreach(var Ǝ in ϰ){ϱ+=Ǝ.CurrentStoredPower;ϲ+=Ǝ.MaxStoredPower;}
    var ϳ=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(ϳ,Ǝ=>Ǝ.CubeGrid==Me.CubeGrid);
    float ϴ=0,ϵ=0;foreach(var ż in ϳ){string ƹ=ż.BlockDefinition.SubtypeId.ToLower();if(ƹ.Contains("hydrogen"))ϴ+=(float)ż.FilledRatio;else ϵ+=(float)ż.FilledRatio;}
    int Ϸ=0,ϸ=0;foreach(var ż in ϳ){string ƹ=ż.BlockDefinition.SubtypeId.ToLower();if(ƹ.Contains("hydrogen"))Ϸ++;else ϸ++;}
    float Ϲ=ϲ>0?ϱ/ϲ:0,Ϻ=Ϸ>0?ϴ/Ϸ:0,ϻ=ϸ>0?ϵ/ϸ:0,ϼ=ň/100f;
    int Ͻ=0,Ͼ=0;foreach(var Ǥ in è)if(Ǥ.IsProducing)Ͻ++;foreach(var ƙ in é)if(ƙ.IsProducing)Ͼ++;
    ʘ(ʍ,20,395,80,10,Ϲ,ʣ(Ϲ),Ç);ʟ(ʍ,105,393,$"Battery {Ϲ*100:F0}%",È,0.35f);
    ʘ(ʍ,20,410,80,10,Ϻ,ʣ(Ϻ),Ç);ʟ(ʍ,105,408,$"H2 {Ϻ*100:F0}%",È,0.35f);
    ʘ(ʍ,20,425,80,10,ϻ,ʣ(ϻ),Ç);ʟ(ʍ,105,423,$"O2 {ϻ*100:F0}%",È,0.35f);
    ʘ(ʍ,20,440,80,10,ϼ,ʣ(1-ϼ),Ç);ʟ(ʍ,105,438,$"Cargo {ϼ*100:F0}%",È,0.35f);
    ʟ(ʍ,250,395,$"Ref: {Ͻ}/{è.Count}",Ͻ>0?Ã:Á,0.4f);
    ʟ(ʍ,250,415,$"Asm: {Ͼ}/{é.Count}",Ͼ>0?Ã:Á,0.4f);
    ʟ(ʍ,20,470,$"Graph [{ϫ+1}/{Ϫ}]",Á,0.35f);
    ʍ.Dispose();
    }
        
    void ά(){
    var ʍ=ʎ(T);
    if(Z.Count==0){
    if(Ŀ>0){ʒ(ʍ,10,"ACTIVE MISSILES",Â);
    ʡ(ʍ,15,45,480,80,Æ,Ç);ʟ(ʍ,20,50,"PRIMARY MISSILE",Á,0.4f);
    Color ɡ=Ŗ=="TARGET"?Å:Ŗ=="REENTRY"?Ä:Ã;
    ʟ(ʍ,20,70,Ŗ,ɡ,0.7f);ʟ(ʍ,250,50,$"Distance: {ř:F0}m",È,0.45f);
    ʟ(ʍ,250,75,$"Speed: {Ś:F0}m/s",È,0.45f);ʟ(ʍ,250,100,$"ETA: {ŝ:F0}s",Â,0.45f);
    ʢ(ʍ,145);ʟ(ʍ,20,155,"FLEET STATUS",È,0.5f);
    ʟ(ʍ,20,185,$"Active: {Ŀ}",À,0.5f);ʟ(ʍ,150,185,$"Armed: {ŀ}",ŀ>0?Ä:Á,0.5f);
    ʟ(ʍ,280,185,$"Ready: {Ł}",Ł>0?Ã:Á,0.5f);
    ʝ(ʍ,20,235,350,16,"Fuel",Ŝ/100f,ʣ(Ŝ/100f),Ç);
    }else if(Ţ){ʒ(ʍ,10,"WELDING PROGRESS",À);float ʔ=ń>0?(float)(ń-Ń)/ń:0;
    ʡ(ʍ,15,45,470,100,Æ,Ç);ʟ(ʍ,20,50,"OVERALL PROGRESS",Á,0.5f);
    ʘ(ʍ,20,85,350,25,ʔ,ʣ(ʔ),Ç);ʟ(ʍ,380,85,$"{ʔ*100:F0}%",È,0.6f);
    ʟ(ʍ,20,120,$"Building: {ń-Ń} of {ń} blocks",È,0.5f);
    ʟ(ʍ,20,145,$"Blocks ready to weld: {Ņ}",Ņ>0?Ã:Á,0.45f);
    ʢ(ʍ,185);ʟ(ʍ,20,195,"CURRENT OPERATION",Á,0.5f);
    ʡ(ʍ,15,220,470,60,Æ,Ç);ʟ(ʍ,20,230,"Phase",Á,0.45f);ʟ(ʍ,20,260,Ř,Â,0.5f);
    ʟ(ʍ,250,230,"Piston",Á,0.45f);ʟ(ʍ,250,260,$"{Ş:F1}m",È,0.5f);
    }else if(Ĺ){ʒ(ʍ,10,"AMMUNITION LOADING",À);float Ͽ=Į>0?(float)ĭ/Į:0;
    ʡ(ʍ,15,45,470,80,Æ,Ç);ʟ(ʍ,20,50,"CURRENT LOAD",Á,0.5f);
    ʘ(ʍ,20,80,350,20,Ͽ,ʣ(Ͽ),Ç);ʟ(ʍ,380,80,$"{Ͽ*100:F0}%",È,0.5f);
    ʟ(ʍ,20,110,$"{ĭ} / {Į} rounds loaded",È,0.45f);
    ʢ(ʍ,145);ʟ(ʍ,20,155,"AMMUNITION TYPE",Á,0.5f);
    ʡ(ʍ,15,180,470,50,Æ,Ç);ʟ(ʍ,20,190,$"{Ť[Ļ]}",Â,0.6f);
    ʢ(ʍ,250);bool Ѐ=ĭ<Į;
    ʟ(ʍ,20,260,Ѐ?"Transferring to missile...":"Load complete",Ѐ?Ä:Ã,0.5f);
    }else{ʒ(ʍ,10,"PAD STATUS",À);
    ʝ(ʍ,20,50,350,16,"Battery",ŉ/100f,ʣ(ŉ/100f),Ç);
    ʝ(ʍ,20,90,350,16,"Hydrogen",Ŋ/100f,ʣ(Ŋ/100f),Ç);
    ʝ(ʍ,20,130,350,16,"Cargo",ň/100f,ʣ(1-ň/100f),Ç);
    ʟ(ʍ,20,180,"No miners tracked",Á,0.5f);ʟ(ʍ,20,210,"Ready for operations",Á,0.4f);}
    }else{ʒ(ʍ,10,"MINER FLEET",À);
    int Ё=0,Ђ=0;foreach(var ǘ in Z){if(ǘ.Value.z)Ё++;else Ђ++;}
    ʟ(ʍ,20,45,$"Total: {Z.Count}  Docked: {Ё}  Flying: {Ђ}",È,0.5f);
    float ʏ=70;int τ=0;
    var Ѓ=Z.Values.ToList();Ѓ.Sort((ƙ,Ǝ)=>{if(ƙ.z!=Ǝ.z)return ƙ.z?-1:1;return ƙ.a.CompareTo(Ǝ.a);});
    foreach(var Ǧ in Ѓ){
    if(τ>=5)break;
    string Є=Ǧ.z?"Docked":$"{Ǧ.k:F0}m";
    string Ѕ=Ǧ.b=="DOCKED"?"=":Ǧ.b.Contains("DRILL")?"*":Ǧ.b.Contains("GRIND")?"#":">";
    Color ɝ=Ǧ.b=="DOCKED"?Ã:Ǧ.b.Contains("DRILL")?Â:Ǧ.b.Contains("GRIND")?Ä:À;
    ʡ(ʍ,15,ʏ-2,480,55,Æ,Ç);
    ʟ(ʍ,20,ʏ,$"[{Ѕ}] {Ǧ.a}",ɝ,0.5f);
    ʟ(ʍ,300,ʏ,Є,È,0.45f);
    ʘ(ʍ,20,ʏ+22,140,10,Ǧ.d/100f,ʣ(Ǧ.d/100f),Ç);ʟ(ʍ,165,ʏ+18,$"Battery {Ǧ.d:F0}%",È,0.35f);
    ʘ(ʍ,250,ʏ+22,140,10,Ǧ.e/100f,ʣ(1-Ǧ.e/100f),Ç);ʟ(ʍ,395,ʏ+18,$"Cargo {Ǧ.e:F0}%",È,0.35f);
    string І="";int ŷ=0;foreach(var ǘ in Ǧ.º.OrderByDescending(Ƹ=>Ƹ.Value)){if(ŷ>=3)break;string Ɛ=Ї(ǘ.Key);if(ŷ>0)І+=", ";І+=$"{Ɛ}:{Ј(ǘ.Value)}";ŷ++;}
    if(string.IsNullOrEmpty(І))І=Ǧ.b;
    string Љ="";if(Ǧ.y>0&&Ǧ.v<5)Љ+=" U!";if(Ǧ.x>0&&Ǧ.u<100)Љ+=" Ice!";if(Ǧ.w>0&&Ǧ.g<30)Љ+=" O2!";if(Ǧ.f<30)Љ+=" H2!";
    ʟ(ʍ,20,ʏ+38,І,Á,0.35f);if(!string.IsNullOrEmpty(Љ))ʟ(ʍ,380,ʏ+38,Љ,Å,0.35f);
    ʏ+=60;τ++;}}
    ʍ.Dispose();
    }
        
    void έ(){
    var ʍ=ʎ(U);
    if(Z.Count==0){
    if(Ŀ>0){ʒ(ʍ,10,"TARGET INFO",Â);
    ʡ(ʍ,15,45,480,80,Æ,Ç);ʟ(ʍ,20,50,"TARGET DESIGNATION",Á,0.4f);
    ʟ(ʍ,20,75,ŗ,Â,0.6f);ʟ(ʍ,20,105,$"Tracking Mode: {ş}",È,0.45f);
    ʢ(ʍ,145);ʟ(ʍ,20,155,"APPROACH VECTOR",È,0.5f);
    float Њ=(float)(Math.Atan2(ř,ś)*180/Math.PI);
    ʟ(ʍ,20,185,$"Bearing: {Њ:F1} deg",È,0.5f);
    ʟ(ʍ,20,215,$"Glide Slope: {(ś>0?ř/ś:0):F1}",È,0.5f);
    ʢ(ʍ,255);ʟ(ʍ,20,265,"IMPACT PREDICTION",È,0.5f);
    int Ћ=(int)(ŝ/60);int n=(int)(ŝ%60);
    ʟ(ʍ,20,295,$"Time to Impact: {Ћ:D2}:{n:D2}",ŝ<30?Å:ŝ<60?Ä:Ã,0.55f);
    }else if(Ţ){ʒ(ʍ,10,"MISSILE PRODUCTION",À);float ʔ=ń>0?(float)(ń-Ń)/ń:0;bool Ќ=ʔ>=1;
    ʡ(ʍ,15,45,470,70,Ќ?Ã:Ä,Ç);ʟ(ʍ,20,55,"BUILD COMPLETION",Æ,0.5f);
    ʟ(ʍ,20,80,Ќ?"MISSILE READY":"CONSTRUCTION IN PROGRESS",Æ,0.55f);
    ʢ(ʍ,135);ʟ(ʍ,20,145,"PRODUCTION CHECKLIST",Á,0.5f);
    ʟ(ʍ,20,175,$"[{(ń>0?"X":" ")}] Projection loaded",ń>0?Ã:Á,0.45f);
    ʟ(ʍ,20,205,$"[{(Ţ?"X":" ")}] Printer active",Ţ?Ã:Á,0.45f);
    ʟ(ʍ,20,235,$"[{(Ń==0&&ń>0?"X":" ")}] All blocks complete",Ń==0&&ń>0?Ã:Ä,0.45f);
    ʟ(ʍ,20,265,$"[{(Ќ?"X":" ")}] Ready for dock",Ќ?Ã:Á,0.45f);
    }else if(Ĺ){ʒ(ʍ,10,"MISSILE READINESS",À);
    bool Ѝ=Ō>=99;bool Ў=ō>=99||ı==0;bool Џ=Ŏ>=99||Ĳ==0;
    bool А=ĭ>=Į;bool Б=Ѝ&&Ў&&Џ&&А;
    ʡ(ʍ,15,45,470,70,Б?Ã:Ä,Ç);ʟ(ʍ,20,55,"LAUNCH READINESS",Æ,0.5f);
    ʟ(ʍ,20,80,Б?"ALL SYSTEMS GO":"LOADING IN PROGRESS",Æ,0.55f);
    ʢ(ʍ,135);ʟ(ʍ,20,145,"CHECKLIST",Á,0.5f);
    ʟ(ʍ,20,175,$"[{(Ѝ?"X":" ")}] Battery 100%",Ѝ?Ã:Ä,0.45f);
    ʟ(ʍ,20,205,$"[{(Ў?"X":" ")}] Hydrogen full",Ў?Ã:Ä,0.45f);
    ʟ(ʍ,20,235,$"[{(А?"X":" ")}] Ammo loaded",А?Ã:Ä,0.45f);
    ʟ(ʍ,20,265,$"[{(Ĺ?"X":" ")}] Connector locked",Ĺ?Ã:Ä,0.45f);
    }else{ʒ(ʍ,10,"STORAGE OVERVIEW",À);
    ʟ(ʍ,20,50,$"Large: {ä.Count}  Medium: {å.Count}  Small: {æ.Count}",È,0.45f);
    ʝ(ʍ,20,90,350,16,"Cargo Fill",ň/100f,ʣ(1-ň/100f),Ç);
    int В=0;foreach(var ǘ in î)В+=ǘ.Value;int Г=0;foreach(var ǘ in ð)Г+=ǘ.Value;int Д=0;foreach(var ǘ in ï)Д+=ǘ.Value;
    ʟ(ʍ,20,140,$"Ore: {В/1000}k  Ingots: {Г/1000}k  Components: {Д}",È,0.4f);
    ʟ(ʍ,20,180,"No miners tracked",Á,0.5f);ʟ(ʍ,20,210,"Ready for operations",Á,0.4f);}
    }else{ʒ(ʍ,10,"MINER DETAILS",À);
    float ʏ=45;int τ=0;
    var Е=Z.Values.ToList();Е.Sort((ƙ,Ǝ)=>{if(ƙ.z!=Ǝ.z)return ƙ.z?-1:1;return ƙ.a.CompareTo(Ǝ.a);});
    foreach(var Ǧ in Е){
    if(τ>=3)break;
    string Ѕ=Ǧ.b=="DOCKED"?"=":Ǧ.b.Contains("DRILL")?"*":">";
    Color ɝ=Ǧ.b=="DOCKED"?Ã:Ǧ.b.Contains("DRILL")?Â:À;
    ʡ(ʍ,15,ʏ-2,480,130,Æ,Ç);
    ʟ(ʍ,20,ʏ,$"[{Ѕ}] {Ǧ.a}",ɝ,0.55f);
    ʟ(ʍ,20,ʏ+22,$"Status: {Ǧ.b}",È,0.45f);
    ʝ(ʍ,20,ʏ+45,200,12,"Battery",Ǧ.d/100f,ʣ(Ǧ.d/100f),Ç);
    ʝ(ʍ,250,ʏ+45,200,12,"Cargo",Ǧ.e/100f,ʣ(1-Ǧ.e/100f),Ç);
    ʝ(ʍ,20,ʏ+75,200,12,"Hydrogen",Ǧ.f/100f,ʣ(Ǧ.f/100f),Ç);
    if(Ǧ.w>0){ʝ(ʍ,250,ʏ+75,200,12,"Oxygen",Ǧ.g/100f,ʣ(Ǧ.g/100f),Ç);}
    else if(!Ǧ.z){ʟ(ʍ,250,ʏ+75,$"Spd:{Ǧ.i:F0} Dist:{Ǧ.k:F0}m",È,0.4f);}
    else{ʟ(ʍ,250,ʏ+75,"Docked",Ã,0.4f);}
    string Ж="";if(Ǧ.y>0)Ж+=$"U:{Ǧ.v} ";if(Ǧ.x>0)Ж+=$"Ice:{Ǧ.u} ";
    if(!string.IsNullOrEmpty(Ж)){ʟ(ʍ,20,ʏ+95,Ж,Ǧ.v<5||Ǧ.u<100?Å:È,0.4f);}
    if(Ǧ.º.Count>0){string З="";int И=0;foreach(var ǘ in Ǧ.º.OrderByDescending(Ƹ=>Ƹ.Value)){if(И>=4)break;if(И>0)З+=" ";З+=$"{Ї(ǘ.Key)}:{Ј(ǘ.Value)}";И++;}
    ʟ(ʍ,20,ʏ+110,З,Â,0.35f);}else{ʟ(ʍ,20,ʏ+110,$"Drills: {Ǧ.p}/{Ǧ.o}  Grinders: {Ǧ.r}/{Ǧ.q}",Á,0.4f);}
    ʏ+=135;τ++;}}
    ʍ.Dispose();
    }
        
    string Й(string Ǎ){switch(Ǎ){case"handdrill":return"Drill 1";case"handdrill2":return"Drill 2";case"handdrill3":return"Drill 3";case"handdrill4":return"Drill 4";case"welder":return"Welder 1";case"welder2":return"Welder 2";case"welder3":return"Welder 3";case"welder4":return"Welder 4";case"anglegrinder":return"Grinder 1";case"anglegrinder2":return"Grinder 2";case"anglegrinder3":return"Grinder 3";case"anglegrinder4":return"Grinder 4";case"automaticrifle":return"Rifle";case"preciseautomaticrifle":return"Rifle Prec";case"rapidfireautomaticrifle":return"Rifle Rapid";case"ultimateautomaticrifle":return"Rifle Elite";case"semiautopistol":return"Pistol";case"fullautopistol":return"Pistol Auto";case"elitepistol":return"Pistol Elite";case"basichandheldlauncher":return"Launcher";case"advancedhandheldlauncher":return"Launcher Adv";case"flaregun":return"Flare Gun";default:return Ǎ;}}
    void ή(){
    var ʍ=ʎ(V);
    ʟ(ʍ,256,8,"PERSONAL EQUIPMENT",Â,0.5f,TextAlignment.CENTER);
    float К=5,Л=135,М=270,Н=405;
    float ʏ=38;
    ʟ(ʍ,К,ʏ,"TOOLS",À,0.35f);ʟ(ʍ,Л,ʏ,"WEAPONS",À,0.35f);ʟ(ʍ,М,ʏ,"AMMO",À,0.35f);ʟ(ʍ,Н,ʏ,"BOTTLES",À,0.35f);
    ʏ+=18;
    string[] ͽ={"5.56mm","MR-20","MR-50A","MR-30E","S-10","S-20A","Elite","Rocket","Flare"};
    int О=0,П=0;
    for(int Ǒ=0;Ǒ<3;Ǒ++)О+=Ů[Ǒ].Length;
    for(int Ǒ=3;Ǒ<Ů.Length;Ǒ++)П+=Ů[Ǒ].Length;
    int Р=Math.Max(Math.Max(О,П),Math.Max(ũ.Length,2));
    int ς=(int)((L/N-60)/14);
    int С=Math.Min(ς,Р-W);
    if(С<1)С=1;
    float υ=ʏ;
    for(int Т=0;Т<С;Т++){
    int Ƅ=Т+W;
    float У=υ+Т*14;
    int Ф=Ƅ;
    for(int ǥ=0;ǥ<3&&Ф>=0;ǥ++){if(Ф<Ů[ǥ].Length){string ͻ=Ů[ǥ][Ф];int φ=û.ContainsKey(ͻ)?û[ͻ]:0;int Ǽ=ý.ContainsKey(ͻ)?ý[ͻ]:ģ;int ǯ=Math.Max(0,Ǽ-φ);Color Х=φ>=Ǽ?Ã:Å;ʟ(ʍ,К,У,$"{Й(ͻ)} {φ}+{ǯ}/{Ǽ}",Х,0.28f);break;}Ф-=Ů[ǥ].Length;}
    int Ц=Ƅ;
    for(int ǥ=3;ǥ<Ů.Length&&Ц>=0;ǥ++){if(Ц<Ů[ǥ].Length){string ͻ=Ů[ǥ][Ц];int φ=û.ContainsKey(ͻ)?û[ͻ]:0;int Ǽ=ý.ContainsKey(ͻ)?ý[ͻ]:ģ;int ǯ=Math.Max(0,Ǽ-φ);Color Ч=φ>=Ǽ?Ã:Å;ʟ(ʍ,Л,У,$"{Й(ͻ)} {φ}+{ǯ}/{Ǽ}",Ч,0.28f);break;}Ц-=Ů[ǥ].Length;}
    if(Ƅ<ũ.Length){int φ=ù.ContainsKey(ũ[Ƅ])?ù[ũ[Ƅ]]:0;int Ǽ=ÿ.ContainsKey(ũ[Ƅ])?ÿ[ũ[Ƅ]]:500;int ǯ=Math.Max(0,Ǽ-φ);Color Ź=φ>=Ǽ?Ã:Å;ʟ(ʍ,М,У,$"{ͽ[Ƅ]} {φ}+{ǯ}/{Ǽ}",Ź,0.28f);}
    if(Ƅ==0){int φ=ė;int ǯ=Math.Max(0,ę-φ);Color Ǩ=φ>=ę?Ã:Å;ʟ(ʍ,Н,У,$"H2 {φ}+{ǯ}/{ę}",Ǩ,0.28f);}
    if(Ƅ==1){int φ=Ę;int ǯ=Math.Max(0,Ě-φ);Color Ǩ=φ>=Ě?Ã:Å;ʟ(ʍ,Н,У,$"O2 {φ}+{ǯ}/{Ě}",Ǩ,0.28f);}}
    if(Р>ς)ʟ(ʍ,430,υ+ς*14,$"[{W+1}-{W+С}/{Р}]",Á,0.25f);
    ʍ.Dispose();
    }
        
    void Ơ(){
    if(X==null)return;
    DateTime Ш=DateTime.Now;
    while(X.HasPendingMessage){
    var ƒ=X.AcceptMessage();
    if(!(ƒ.Data is string))continue;
    var Ɨ=((string)ƒ.Data).Split('|');
    if(Ɨ.Length<16||Ɨ[0]!="MB")continue;
    long Щ;if(!long.TryParse(Ɨ[1],out Щ))continue;
    Y Ǧ;
    if(!Z.TryGetValue(Щ,out Ǧ)){Ǧ=new Y();Z[Щ]=Ǧ;}
    Ǧ.a=Ɨ[2];
    float.TryParse(Ɨ[3],out Ǧ.d);float.TryParse(Ɨ[4],out Ǧ.e);float.TryParse(Ɨ[5],out Ǧ.f);
    var h=Ɨ[6].Split(',');if(h.Length>=3){double Ƹ,ʏ,Ъ;if(double.TryParse(h[0],out Ƹ)&&double.TryParse(h[1],out ʏ)&&double.TryParse(h[2],out Ъ))Ǧ.h=new Vector3D(Ƹ,ʏ,Ъ);}
    double.TryParse(Ɨ[7],out Ǧ.i);double.TryParse(Ɨ[8],out Ǧ.j);double.TryParse(Ɨ[9],out Ǧ.k);
    Ǧ.b=Ɨ[10];int.TryParse(Ɨ[11],out Ǧ.o);int.TryParse(Ɨ[12],out Ǧ.p);int.TryParse(Ɨ[13],out Ǧ.q);int.TryParse(Ɨ[14],out Ǧ.r);
    Ǧ.z=Ɨ[15]=="1";Ǧ.µ=Ш;
    if(Ɨ.Length>=21){double.TryParse(Ɨ[16],out Ǧ.l);double.TryParse(Ɨ[17],out Ǧ.m);int.TryParse(Ɨ[18],out Ǧ.t);double.TryParse(Ɨ[19],out Ǧ.n);Ǧ.ª=Ɨ[20]=="1";}
    if(Ɨ.Length>=22&&Ɨ[21].StartsWith("FUEL:")){var Ы=Ɨ[21].Substring(5).Split(',');if(Ы.Length>=6){float.TryParse(Ы[0],out Ǧ.g);int.TryParse(Ы[1],out Ǧ.u);int.TryParse(Ы[2],out Ǧ.v);int.TryParse(Ы[3],out Ǧ.w);int.TryParse(Ы[4],out Ǧ.x);int.TryParse(Ы[5],out Ǧ.y);}}
    if(Ɨ.Length>=23&&Ɨ[22].StartsWith("CARGO:")){Ǧ.c=Ɨ[22].Substring(6);Ь(Ǧ);}}
    Э();
    Ю();
    }
        
    void Э(){
    DateTime Ш=DateTime.Now;
    int Я=0;
    foreach(var ư in ì){if(ư.Status!=MyShipConnectorStatus.Connected)continue;Я++;var ǈ=ư.OtherConnector;if(ǈ==null||ǈ.CubeGrid==Me.CubeGrid)continue;
    long а=ǈ.CubeGrid.EntityId;string б=ǈ.CubeGrid.CustomName;
    if(Z.ContainsKey(а)){var Ƹ=Z[а];Ƹ.s=Я;Ƹ.z=true;Ƹ.µ=Ш;if(!string.IsNullOrEmpty(б))Ƹ.a=б;}
    else{var Ǧ=new Y();Ǧ.a=string.IsNullOrEmpty(б)?$"Port{Я}":б;Ǧ.s=Я;Ǧ.z=true;Ǧ.µ=Ш;Ǧ.b="DOCKED";
    var в=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(в,Ǝ=>Ǝ.CubeGrid==ǈ.CubeGrid);
    if(в.Count>0){float ǅ=0,ɶ=0;foreach(var Ǝ in в){ǅ+=Ǝ.CurrentStoredPower;ɶ+=Ǝ.MaxStoredPower;}Ǧ.d=ɶ>0?(ǅ/ɶ)*100:0;}
    var г=new List<IMyCargoContainer>();GridTerminalSystem.GetBlocksOfType(г,Ǝ=>Ǝ.CubeGrid==ǈ.CubeGrid);
    if(г.Count>0){float ǅ=0,ɶ=0;foreach(var ǥ in г){var д=ǥ.GetInventory();if(д!=null){ǅ+=(float)д.CurrentVolume;ɶ+=(float)д.MaxVolume;}}Ǧ.e=ɶ>0?(ǅ/ɶ)*100:0;}
    var е=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(е,Ǝ=>Ǝ.CubeGrid==ǈ.CubeGrid&&Ǝ.BlockDefinition.SubtypeId.Contains("Hydrogen"));
    if(е.Count>0){float ż=0;foreach(var ȱ in е)ż+=(float)ȱ.FilledRatio;Ǧ.f=(ż/е.Count)*100;}
    var ж=new List<IMyShipDrill>();GridTerminalSystem.GetBlocksOfType(ж,Ǝ=>Ǝ.CubeGrid==ǈ.CubeGrid);Ǧ.o=ж.Count;
    var з=new List<IMyShipGrinder>();GridTerminalSystem.GetBlocksOfType(з,Ǝ=>Ǝ.CubeGrid==ǈ.CubeGrid);Ǧ.q=з.Count;
    var и=new List<IMyGasGenerator>();GridTerminalSystem.GetBlocksOfType(и,Ǝ=>Ǝ.CubeGrid==ǈ.CubeGrid);Ǧ.x=и.Count;
    foreach(var ǥ in и){var й=ǥ.GetInventory();if(й!=null){var ɲ=new List<MyInventoryItem>();й.GetItems(ɲ);foreach(var ǋ in ɲ)if(ǋ.Type.SubtypeId=="Ice")Ǧ.u+=(int)ǋ.Amount;}}
    var Ÿ=new List<IMyReactor>();GridTerminalSystem.GetBlocksOfType(Ÿ,Ǝ=>Ǝ.CubeGrid==ǈ.CubeGrid);Ǧ.y=Ÿ.Count;
    foreach(var Ǥ in Ÿ){var η=Ǥ.GetInventory();if(η!=null){var Ʉ=new List<MyInventoryItem>();η.GetItems(Ʉ);foreach(var ǋ in Ʉ)if(ǋ.Type.SubtypeId.Contains("Uranium"))Ǧ.v+=(int)ǋ.Amount;}}
    var g=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(g,Ǝ=>Ǝ.CubeGrid==ǈ.CubeGrid&&!Ǝ.BlockDefinition.SubtypeId.Contains("Hydrogen"));Ǧ.w=g.Count;
    if(g.Count>0){float ż=0;foreach(var ɉ in g)ż+=(float)ɉ.FilledRatio;Ǧ.g=(ż/g.Count)*100;}
    Z[а]=Ǧ;}}}
        
    void Ю(){DateTime Ш=DateTime.Now;var к=new List<long>();foreach(var ǘ in Z){if((Ш-ǘ.Value.µ).TotalSeconds>120&&!ǘ.Value.z)к.Add(ǘ.Key);}foreach(var л in к)Z.Remove(л);}
    void Ь(Y Ǧ){Ǧ.º.Clear();if(string.IsNullOrEmpty(Ǧ.c))return;var м=Ǧ.c.Split(';');foreach(var ǋ in м){var ǘ=ǋ.Split('=');if(ǘ.Length!=2)continue;int ǔ;if(int.TryParse(ǘ[1],out ǔ))Ǧ.º[ǘ[0]]=ǔ;}}
    string Ї(string Ȁ){int Ƅ=Ȁ.IndexOf(':');return Ƅ>=0?Ȁ.Substring(Ƅ+1):Ȁ;}
    string Ј(int ƙ){if(ƙ>=1000000)return$"{ƙ/1000000f:F1}M";if(ƙ>=1000)return$"{ƙ/1000f:F1}K";return ƙ.ToString();}
        
    void Σ(){
    var ʍ=ʎ(Q);
    ʒ(ʍ,10,"MISSILE TELEMETRY",Â);
    Color ɡ=Ŗ=="TARGET"||Ŗ=="DETONATE"?Å:Ŗ=="REENTRY"?Ä:Ŗ=="COAST"||Ŗ=="ARM"?Ã:À;
    ʟ(ʍ,20,50,$"Phase: {Ŗ}",ɡ,0.7f);
    ʟ(ʍ,20,90,$"Target: {ŗ}",È,0.55f);
    ʢ(ʍ,130);
    ʝ(ʍ,20,145,350,16,"Distance",Math.Min(1f,ř/10000f),À,Ç);
    ʟ(ʍ,400,143,$"{ř:F0}m",È,0.45f);
    ʝ(ʍ,20,185,350,16,"Velocity",Math.Min(1f,Ś/500f),Â,Ç);
    ʟ(ʍ,400,183,$"{Ś:F0}m/s",È,0.45f);
    ʝ(ʍ,20,225,350,16,"Altitude",Math.Min(1f,ś/5000f),À,Ç);
    ʟ(ʍ,400,223,$"{ś:F0}m",È,0.45f);
    ʝ(ʍ,20,265,350,16,"Fuel",Ŝ/100f,ʣ(Ŝ/100f),Ç);
    ʟ(ʍ,400,263,$"{Ŝ:F0}%",È,0.45f);
    ʢ(ʍ,310);
    ʟ(ʍ,20,320,"Estimated Time to Target",È,0.5f);
    int н=(int)(ŝ/60);int ˁ=(int)(ŝ%60);
    ʟ(ʍ,20,350,$"{н:D2}:{ˁ:D2}",Â,1.2f);
    ʢ(ʍ,410);
    ʟ(ʍ,20,420,$"Active Missiles: {Ŀ}  Armed: {ŀ}",ŀ>0?Ä:È,0.5f);
    ʍ.Dispose();
    }
        
    void Υ(){
    var ʍ=ʎ(S);
    ʒ(ʍ,10,"TRAJECTORY",Â);
    ʡ(ʍ,20,50,472,250,Æ,Ç);
    float ʑ=256,ʐ=175;
    ʍ.Add(new MySprite(SpriteType.TEXTURE,"Circle",new Vector2(ʑ,ʐ),new Vector2(10,10),Ã));
    ʟ(ʍ,ʑ+15,ʐ-8,"PAD",Ã,0.35f);
    float о=(float)Math.Atan2(ř,ś);
    float ʱ=ʑ+(float)Math.Cos(о)*180;
    float п=ʐ-(float)Math.Sin(о)*180;
    ʍ.Add(new MySprite(SpriteType.TEXTURE,"Circle",new Vector2(ʱ,п),new Vector2(12,12),Å));
    ʟ(ʍ,ʱ+15,п-8,"TARGET",Å,0.35f);
    float ɶ=ʑ+(ř/10000f)*180;
    float ǆ=ʐ-(ś/5000f)*100;
    ʍ.Add(new MySprite(SpriteType.TEXTURE,"Triangle",new Vector2(ɶ,ǆ),new Vector2(16,16),Â));
    for(int Ǒ=1;Ǒ<5;Ǒ++)ʍ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(ʑ+Ǒ*90,ʐ),new Vector2(1,200),Ç*0.5f));
    for(int Ǒ=1;Ǒ<4;Ǒ++)ʍ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(ʑ,ʐ-Ǒ*50),new Vector2(400,1),Ç*0.5f));
    ʢ(ʍ,320);
    ʟ(ʍ,20,330,"Ground Distance",Á,0.4f);
    ʘ(ʍ,20,350,200,12,Math.Min(1f,ř/10000f),À,Ç);
    ʟ(ʍ,230,348,$"{ř:F0}m",È,0.4f);
    ʟ(ʍ,20,380,"Altitude",Á,0.4f);
    ʘ(ʍ,20,400,200,12,Math.Min(1f,ś/5000f),Â,Ç);
    ʟ(ʍ,230,398,$"{ś:F0}m",È,0.4f);
    ʍ.Dispose();
    }
        
    void Φ(){
    var ʍ=ʎ(Q);
    ʒ(ʍ,10,"COMMAND CENTER",À);
    ʟ(ʍ,20,50,$"Controller Status: {š}",š=="ACTIVE"?Ã:È,0.55f);
    ʢ(ʍ,90);
    ʡ(ʍ,15,100,235,70,Æ,Ç);
    ʟ(ʍ,20,105,"CONNECTED PADS",Á,0.4f);
    ʟ(ʍ,20,130,$"{Ĩ}",À,0.9f);
    ʡ(ʍ,260,100,235,70,Æ,Ç);
    ʟ(ʍ,265,105,"MISSILES READY",Á,0.4f);
    ʟ(ʍ,265,130,$"{Ī}",Ã,0.9f);
    ʢ(ʍ,185);
    ʟ(ʍ,20,195,"ATTACK MODE",È,0.5f);
    ʟ(ʍ,20,225,ş,Â,0.7f);
    ʢ(ʍ,270);
    ʟ(ʍ,20,280,"CURRENT TARGET",È,0.5f);
    ʟ(ʍ,20,310,Š,Â,0.55f);
    ʢ(ʍ,360);
    ʟ(ʍ,20,370,"ARMED",È,0.5f);
    ʟ(ʍ,20,400,$"{ĩ}",ĩ>0?Ä:Á,0.7f);
    ʟ(ʍ,150,370,"IN FLIGHT",È,0.5f);
    ʟ(ʍ,150,400,$"{Ŀ}",Ŀ>0?Â:Á,0.7f);
    ʍ.Dispose();
    }
        
    void Χ(){
    var ʍ=ʎ(S);
    ʒ(ʍ,10,"ATTACK MODES",À);
    string[] р={"GPS","ANTENNA","SENSOR","LIDAR","MANUAL","SATELLITE"};
    float ʏ=55;
    for(int Ǒ=0;Ǒ<р.Length;Ǒ++){
    bool с=р[Ǒ]==ş;
    ʡ(ʍ,15,ʏ-2,480,35,с?À*0.2f:Æ,с?À:Ç);
    ʟ(ʍ,25,ʏ,р[Ǒ],с?À:È,0.55f);
    string Ϭ=р[Ǒ]=="GPS"?"Fixed coordinates":р[Ǒ]=="ANTENNA"?"Track antenna signal":р[Ǒ]=="SENSOR"?"Proximity detection":р[Ǒ]=="LIDAR"?"Camera raycast lock":р[Ǒ]=="MANUAL"?"Remote guided":р[Ǒ]=="SATELLITE"?"Orbital deployment":"";
    ʟ(ʍ,200,ʏ+3,Ϭ,Á,0.4f);
    ʏ+=40;}
    ʢ(ʍ,310);
    ʟ(ʍ,20,320,"SELECTED MODE",È,0.5f);
    ʟ(ʍ,20,350,ş,Â,0.7f);
    ʢ(ʍ,400);
    ʟ(ʍ,20,410,$"Target: {Š}",È,0.5f);
    ʍ.Dispose();
    }
        
    void Ϊ(){
    var ʍ=ʎ(Q);
    ʒ(ʍ,10,"PRINTING STATUS",À);
    float ʔ=ń>0?(float)(ń-Ń)/ń:0;
    ʡ(ʍ,15,45,470,100,Æ,Ç);
    ʟ(ʍ,20,50,"PROGRESS",Á,0.5f);
    ʘ(ʍ,20,80,350,20,ʔ,ʣ(ʔ),Ç);
    ʟ(ʍ,380,80,$"{ʔ*100:F0}%",È,0.5f);
    ʟ(ʍ,20,110,$"{ń-Ń} / {ń} blocks complete",È,0.45f);
    ʢ(ʍ,165);
    ʟ(ʍ,20,175,"CURRENT PHASE",Á,0.5f);
    ʡ(ʍ,15,200,470,60,Æ,Ç);
    ʟ(ʍ,20,210,Ř,Â,0.7f);
    ʟ(ʍ,20,240,$"State: {(ł==1?"EXTENDING":ł==2?"WELDING":"CHECKING")}",È,0.45f);
    ʢ(ʍ,280);
    ʟ(ʍ,20,290,"PRINTER POSITION",Á,0.5f);
    ʡ(ʍ,15,315,470,60,Æ,Ç);
    ʟ(ʍ,20,325,$"Piston Extension: {Ş:F1} meters",È,0.5f);
    ʟ(ʍ,20,355,$"Buildable blocks: {Ņ}",È,0.45f);
    ʍ.Dispose();
    }
        
    void Ϋ(){
    var ʍ=ʎ(S);
    ʒ(ʍ,10,"PRINTER OVERVIEW",À);
    float ʔ=ń>0?(float)(ń-Ń)/ń:0;
    ʡ(ʍ,15,45,470,80,ʔ>=1?Ã:Ä,Ç);
    ʟ(ʍ,20,55,"BUILD STATUS",Æ,0.5f);
    ʟ(ʍ,20,85,Ţ?(ʔ>=1?"BUILD COMPLETE":"BUILDING IN PROGRESS"):"PRINTER IDLE",Æ,0.6f);
    ʢ(ʍ,145);
    ʟ(ʍ,20,155,"BLOCK STATISTICS",Á,0.5f);
    ʡ(ʍ,15,180,150,60,Æ,Ç);ʟ(ʍ,20,185,"Complete",Á,0.4f);ʟ(ʍ,20,210,$"{ń-Ń}",Ã,0.6f);
    ʡ(ʍ,175,180,150,60,Æ,Ç);ʟ(ʍ,180,185,"Remaining",Á,0.4f);ʟ(ʍ,180,210,$"{Ń}",Ń>0?Ä:Ã,0.6f);
    ʡ(ʍ,335,180,150,60,Æ,Ç);ʟ(ʍ,340,185,"Buildable",Á,0.4f);ʟ(ʍ,340,210,$"{Ņ}",Ņ>0?Ã:Á,0.6f);
    ʢ(ʍ,260);
    ʟ(ʍ,20,270,"PISTON STATUS",Á,0.5f);
    ʡ(ʍ,15,295,470,60,Æ,Ç);
    float т=Ş/10f;
    ʘ(ʍ,20,305,350,15,т,Â,Ç);
    ʟ(ʍ,380,305,$"{Ş:F1}m",È,0.45f);
    ʟ(ʍ,20,330,$"Extension: {Ş:F1} / 10.0 meters",È,0.4f);
    ʍ.Dispose();
    }
}
