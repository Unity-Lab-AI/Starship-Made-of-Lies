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
public enum K{A,B,C,D,E,F,G,H,I,J}
    public enum Q{L,M,N,H,O,P}
    public enum X{R,S,T,U,V,W}
    public enum c{Y,Z,a,b}
    K d=K.A;Q e=Q.L;X f=X.R;c g=c.Y;int h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;
    bool r=false,s=false,t,u,v,w,x=false,y=false,z=true,ª=false,µ=false,º=false,À=false,Á=false,Â=false,Ã=false,Ä=false,Å=false,Æ=false,Ç=false,È=false,É=false,Ê=false,Ë=false,Ì=false;
    float Í=512,Î=512,Ï=1,Ð=1,Ñ,Ò,Ó,Ô,Õ,Ö=0,Ø=0,Ù=0,Ú=0,Û=0,Ü=0,Ý=0,Þ=0,ß=0.5f,à=0,á=0.2f,â=7.2f,ã=10f,ä=1.4f,å=0.5f,æ=0.3f,ç=0,è,é,ê,ë,ì=0,í=0,î=0;
    int ï=0,ð=0,ñ=0,ò=0,ó=0,ô=0,õ=0,ö=500,ø=50,ù=10,ú=50,û=500,ü=5,ý=500,þ=2,ÿ=0,Ā=1000,ā=0,Ă=0,ă=0,Ą=0,ą=0,Ć=0,ć=0,Ĉ=0,ĉ=0,Ċ=0,ċ=0,Č=0,č=0,Ď=20,ď=20,Đ=1000,đ=50,Ē=90,ē=90,Ĕ=0,ĕ=0,Ė,ė,Ę=0,ę=0,Ě=3,ě=0,Ĝ=50,ĝ=0,Ğ=0,ğ=0,Ġ=0,ġ=0,Ģ=0,ģ=0,Ĥ=0;int[] ĥ=new int[9];
    string[] Ħ={"30m","1h","6h","12h","1d","ALL"};
    Color ħ=new Color(0,180,255),Ĩ=new Color(0,255,100),ĩ=new Color(10,10,15);Color Ī=new Color(100,100,100),ī=new Color(255,200,0),Ĭ=new Color(255,180,0),ĭ=new Color(255,60,60),Į=new Color(40,40,50),į=new Color(220,220,220);float İ=0;bool ı=false,Ĳ=false,ĳ=false;    IMyShipMergeBlock Ĵ,ĵ;
    IMyShipConnector Ķ,ķ,ĸ,Ĺ,ĺ;
    IMyTextPanel Ļ,ļ,Ľ,ľ,Ŀ;
    List<IMyTextPanel> ŀ=new List<IMyTextPanel>(),Ł=new List<IMyTextPanel>();
    string ł="",Ń="",ń="",Ņ="",ņ="",Ň="",ň="UNITY_MSL",ŉ="",Ŋ="",ŋ="",Ō="",ō="[PAD1",Ŏ="UNITY_PAD_CMD",ŏ="UNITY_PAD_STATUS",Ő="MINER_BEACON";K ő=K.A;
    double Œ=0,œ=0,Ŕ=0,ŕ=0,Ŗ=0,ŗ=0,Ř=0,ř=0,Ś=0,ś=5000;
    IMyButtonPanel Ŝ;
    IMyProgrammableBlock ŝ,Ş,ş,Š;
    List<IMyBatteryBlock> š=new List<IMyBatteryBlock>(),Ţ=new List<IMyBatteryBlock>();
    List<IMyGasTank> ţ=new List<IMyGasTank>(),Ť=new List<IMyGasTank>(),ť=new List<IMyGasTank>(),Ŧ=new List<IMyGasTank>();
    List<IMyWarhead> ŧ=new List<IMyWarhead>();
    List<IMyThrust> Ũ=new List<IMyThrust>(),ũ=new List<IMyThrust>();
    List<IMyGasGenerator> Ū=new List<IMyGasGenerator>(),ū=new List<IMyGasGenerator>();
    List<IMyReactor> Ŭ=new List<IMyReactor>(),ŭ=new List<IMyReactor>();
    List<IMyGyro> Ů=new List<IMyGyro>(),ů=new List<IMyGyro>();
    List<IMySensorBlock> Ű=new List<IMySensorBlock>(),ű=new List<IMySensorBlock>();
    List<IMyCameraBlock> Ų=new List<IMyCameraBlock>(),ų=new List<IMyCameraBlock>();
    List<IMyRadioAntenna> Ŵ=new List<IMyRadioAntenna>(),ŵ=new List<IMyRadioAntenna>();
    List<IMyLaserAntenna> Ŷ=new List<IMyLaserAntenna>(),ŷ=new List<IMyLaserAntenna>();
    List<IMyCockpit> Ÿ=new List<IMyCockpit>();
    List<IMyLightingBlock> Ź=new List<IMyLightingBlock>(),ź=new List<IMyLightingBlock>();
    IMyRemoteControl Ż;
    DateTime ż,Ž,ž,ſ,ƀ,Ɓ,Ƃ,ƃ,Ƅ;
    Vector3D ƅ=new Vector3D(0,0,0),Ɔ,Ƈ,ƈ=Vector3D.Zero;
    List<MyWaypointInfo> Ɖ=new List<MyWaypointInfo>(),Ɗ=new List<MyWaypointInfo>();
    List<string> Ƌ=new List<string>();
    IMyBroadcastListener ƌ,ƍ,Ǝ,Ə,Ɛ,Ƒ;
    float[] ƒ=new float[16],Ɠ=new float[16],Ɣ=new float[16];
    const int ƕ=7;    const string Ɩ="MyObjectBuilder_BlueprintDefinition/",Ɨ="MyObjectBuilder_";
    List<IMyPistonBase> Ƙ=new List<IMyPistonBase>(),ƙ=new List<IMyPistonBase>(),ƚ=new List<IMyPistonBase>();
    List<IMyShipWelder> ƛ=new List<IMyShipWelder>();
    IMyProjector Ɯ;
    List<IMyCargoContainer> Ɲ=new List<IMyCargoContainer>(),ƞ=new List<IMyCargoContainer>(),Ɵ=new List<IMyCargoContainer>(),Ơ=new List<IMyCargoContainer>();
    IMyCargoContainer ơ=null,Ƣ=null,ƣ=null,Ƥ=null,ƥ=null,Ʀ=null;
    List<IMyRefinery> Ƨ=new List<IMyRefinery>();
    List<IMyAssembler> ƨ=new List<IMyAssembler>();
    List<IMySolarPanel> Ʃ=new List<IMySolarPanel>();
    List<IMyPowerProducer> ƪ=new List<IMyPowerProducer>();
    List<int> ƫ=new List<int>(),Ƭ=new List<int>();
    Dictionary<int,string> ƭ=new Dictionary<int,string>(),Ʈ=new Dictionary<int,string>(),Ư=new Dictionary<int,string>();
    Dictionary<int,bool> ư=new Dictionary<int,bool>(),Ʊ=new Dictionary<int,bool>(),Ʋ=new Dictionary<int,bool>(),Ƴ=new Dictionary<int,bool>();
    Dictionary<int,Vector3D> ƴ=new Dictionary<int,Vector3D>(),Ƶ=new Dictionary<int,Vector3D>();
    List<Vector3D> ƶ=new List<Vector3D>();
    Dictionary<int,int> Ʒ=new Dictionary<int,int>(),Ƹ=new Dictionary<int,int>(),ƹ=new Dictionary<int,int>(),ƺ=new Dictionary<int,int>();
    Queue<Vector3D> ƻ=new Queue<Vector3D>();
    Queue<int> Ƽ=new Queue<int>(),ƽ=new Queue<int>();
    List<IMyShipConnector> ƾ=new List<IMyShipConnector>();
    Dictionary<long,ƿ> ǀ=new Dictionary<long,ƿ>();
    class ƿ{public string ǁ,ǂ,ǃ="";public float Ǆ,ǅ,ǆ;public Vector3D Ǉ;public double ǈ,ǉ,Ǌ,ǋ,ǌ,Ǎ;public int ǎ,Ǐ,ǐ,Ǒ,ǒ,Ǔ;public bool ǔ,Ǖ;public DateTime ǖ;public Dictionary<string,int> Ǘ=new Dictionary<string,int>();}
    Dictionary<string,int> ǘ=new Dictionary<string,int>(),Ǚ=new Dictionary<string,int>(),ǚ=new Dictionary<string,int>(),Ǜ=new Dictionary<string,int>(),ǜ=new Dictionary<string,int>(),ǝ=new Dictionary<string,int>();
    int Ǟ=0,ǟ=0,Ǡ=0,ǡ=0,Ǣ=10106,ǣ=10106,Ǥ=0,ǥ=10,Ǧ=100,ǧ=50000;
    string[] Ǩ={"S-10 Pistol","MR-20 Rifle","MR-50A Rifle","200mm Missile","25x184mm NATO","Autocannon","Assault Cannon","Artillery","Small Railgun","Large Railgun"},ǩ={"Position0010_SemiAutoPistolMagazine","Position0040_AutomaticRifleGun_Mag_20rd","Position0050_RapidFireAutomaticRifleGun_Mag_50rd","Position0100_Missile200mm","Position0080_NATO_25x184mmMagazine","Position0090_AutocannonClip","Position0110_MediumCalibreAmmo","Position0120_LargeCalibreAmmo","Position0130_SmallRailgunAmmo","Position0140_LargeRailgunAmmo"},Ǫ={"SemiAutoPistolMagazine","AutomaticRifleGun_Mag_20rd","RapidFireAutomaticRifleGun_Mag_50rd","Missile200mm","NATO_25x184mm","AutocannonClip","MediumCalibreAmmo","LargeCalibreAmmo","SmallRailgunAmmo","LargeRailgunAmmo"};
    MyDefinitionId ǫ;
    MyItemType Ǭ;
        
    public Program(){
    Runtime.UpdateFrequency=UpdateFrequency.Update100;
    Ä=false;Ă=0;Å=true;
    ǭ();
    Ǯ();
    ǯ();
    ǰ();
    Ǳ();
    if(Ķ!=null)Ķ.Enabled=true;
    ǲ();
    foreach(var ǳ in ƛ)ǳ.Enabled=false;
    foreach(var Ǵ in Ƙ){Ǵ.Velocity=-0.5f;}
    ƌ=IGC.RegisterBroadcastListener(ň);
    ƍ=IGC.RegisterBroadcastListener(ň+"_RELAY");
    Ǝ=IGC.RegisterBroadcastListener(Ŏ);
    Ə=IGC.RegisterBroadcastListener(ŏ);
    Ɛ=IGC.RegisterBroadcastListener("ENEMY_SIGNAL");
    Ƒ=IGC.RegisterBroadcastListener(Ő);
    ǵ=IGC.RegisterBroadcastListener("UNITY_BOOT_REQ");
    Ƕ();
    Ƿ();
    }
    IMyBroadcastListener ǵ;
    void ǽ(){
    Ş=ş=Š=null;
    var Ǹ=new List<IMyProgrammableBlock>();
    GridTerminalSystem.GetBlocksOfType(Ǹ,ǹ=>ǹ.CubeGrid==Me.CubeGrid&&ǹ!=Me);
    foreach(var Ǻ in Ǹ){
    string ǻ=Ǻ.CustomName;string Ǽ=ǻ.ToUpper();
    if(ǻ.Contains($"[PAD{Ć}")&&Ǽ.Contains("UNITY BOOT"))Ş=Ǻ;
    else if(ǻ.Contains($"[PAD{Ć}]")&&Ǽ.Contains("UNITY INVENTORY"))ş=Ǻ;
    else if(ǻ.Contains($"[PAD{Ć}]")&&Ǽ.Contains("UNITY SIGNAL"))Š=Ǻ;
    }
    }
    string Ǿ="";
    void Ƕ(){
    Ǿ=DateTime.Now.Ticks.ToString();
    Me.CustomData=$"[SYSTEM]\npad_ready=true\npad_session={Ǿ}\n[PAD_CFG]\n[PAD_STATUS]\n[PAD_DATA]\n[BLACKBOX]\n";
    }
    bool Ȁ(){
    if(Ş==null)ǽ();
    if(Ş==null)return false;
    string ǿ=Ş.CustomData;
    if(ǿ.Contains("boot_complete=BOOTING")||ǿ.Contains("boot_complete=false"))return false;
    if(!ǿ.Contains("boot_complete=true")||!ǿ.Contains("boot_phase=COMPLETE"))return false;
    if(Ǿ=="")return true;
    return ǿ.Contains($"boot_for_session={Ǿ}");
    }
    bool ȁ(){
    if(Ş==null)ǽ();
    if(Ş==null)return false;
    return Ş.CustomData.Contains("boot_complete=BOOTING");
    }
    bool Ȃ(){
    if(Ş==null)ǽ();
    if(Ş==null)return true;
    return Ş.CustomData.Contains("boot_complete=STALE")||(!Ş.CustomData.Contains("boot_complete=true")&&!Ş.CustomData.Contains("boot_complete=BOOTING"));
    }
    void ȃ(){
    if(x)return;
    IGC.SendBroadcastMessage("UNITY_BOOT_ACK","PAD_RUNNING");
    x=true;
    }
    void ȇ(){
    while(ǵ!=null&&ǵ.HasPendingMessage){var Ȅ=ǵ.AcceptMessage();string ȅ=Ȅ.Data.ToString();if(ȅ=="PAD_CHECK"||ȅ==$"PAD_CHECK:{Ć}")Ȇ();}
    }
    void Ȇ(){
    int Ȉ=Ĵ!=null?1:0,ȉ=Ķ!=null?1:0;
    int Ȋ=Ţ.Count,ȋ=ť.Count,Ȍ=Ŧ.Count,ȍ=ƛ.Count;
    string Ȏ=$"PAD|OK|merge={Ȉ},con={ȉ},bat={Ȋ},h2={ȋ},o2={Ȍ},prt={ȍ}";
    IGC.SendBroadcastMessage("UNITY_BOOT_RSP",Ȏ);
    string ǿ=Me.CustomData;
    if(!ǿ.Contains("[PAD_CFG]"))ǿ="[PAD_CFG]\n"+ǿ;
    string ȏ=$"pad_status=OK:merge={Ȉ},con={ȉ},bat={Ȋ},h2={ȋ},o2={Ȍ},prt={ȍ}";
    if(ǿ.Contains("pad_status=")){int Ȑ=ǿ.IndexOf("pad_status=");int ȑ=ǿ.IndexOf("\n",Ȑ);if(ȑ<0)ȑ=ǿ.Length;ǿ=ǿ.Remove(Ȑ,ȑ-Ȑ);ǿ=ǿ.Insert(Ȑ,ȏ);}
    else ǿ=ǿ.Replace("[PAD_CFG]","[PAD_CFG]\n"+ȏ);
    Me.CustomData=ǿ;
    }
    public void Save(){Storage=$"{Ć}|{(É?"1":"0")}|{ǥ}";}
    void ǭ(){
    if(string.IsNullOrEmpty(Storage))return;
    var Ǵ=Storage.Split('|');
    if(Ǵ.Length>=1)int.TryParse(Ǵ[0],out Ć);
    if(Ǵ.Length>=2)É=Ǵ[1]=="1";
    if(Ǵ.Length>=3)int.TryParse(Ǵ[2],out ǥ);
    }
    void Ǯ(){
    string ǻ=Me.CustomName;int Ȓ=ǻ.IndexOf("[PAD");
    if(Ȓ>=0){int ȓ=ǻ.IndexOf("]",Ȓ);if(ȓ>Ȓ+4){string Ȕ=ǻ.Substring(Ȓ+4,ȓ-Ȓ-4);int ȕ;if(int.TryParse(Ȕ,out ȕ)&&ȕ>0)Ć=ȕ;}}
    if(Ć==0)Ć=Ȗ();
    ō=$"[PAD{Ć}";Me.CustomName=$"[PAD{Ć}] UNITY PAD";
    }
    List<int> ș(){
    var ȗ=new List<int>();
    var Ǹ=new List<IMyProgrammableBlock>();
    GridTerminalSystem.GetBlocksOfType(Ǹ,ǹ=>ǹ.IsSameConstructAs(Me)&&ǹ!=Me&&ǹ.CustomName.ToUpper().Contains("UNITY PAD"));
    foreach(var Ǻ in Ǹ){
    string Ș=Ǻ.CustomName;
    int Ȓ=Ș.IndexOf("[PAD");
    if(Ȓ>=0){
    int ȓ=Ș.IndexOf("]",Ȓ);
    if(ȓ>Ȓ+4){
    string Ȕ=Ș.Substring(Ȓ+4,ȓ-Ȓ-4);
    int ȕ;if(int.TryParse(Ȕ,out ȕ)&&ȕ>0&&!ȗ.Contains(ȕ))ȗ.Add(ȕ);
    }}}
    return ȗ;
    }
    int Ȗ(){
    var Ț=ș();
    int ț=1;
    while(Ț.Contains(ț))ț++;
    return ț;
    }
    void ǯ(){
    ǫ=MyDefinitionId.Parse(Ɩ+ǩ[Ǥ]);
    Ǭ=MyItemType.Parse(Ɨ+"AmmoMagazine/"+Ǫ[Ǥ]);
    }
        
    void ǰ(){
    var Ȝ=new List<IMyShipController>();
    GridTerminalSystem.GetBlocksOfType(Ȝ,ǹ=>ǹ.CubeGrid==Me.CubeGrid);
    IMyShipController ȝ=null;
    foreach(var ǹ in Ȝ){ȝ=ǹ;break;}
    if(ȝ==null){
    var Ȟ=new List<IMyCockpit>();
    GridTerminalSystem.GetBlocksOfType(Ȟ);
    if(Ȟ.Count>0)ȝ=Ȟ[0];
    }
    if(ȝ!=null){
    Vector3D ȟ=ȝ.GetNaturalGravity();
    İ=(float)ȟ.Length();
    s=İ>0.05;
    if(!s){g=c.Z;ı=false;}
    else if(İ>5){g=c.a;ı=true;}
    else{g=c.b;ı=İ>2;}
    }else{g=c.Y;s=false;ı=false;}
    }
        
    public void Main(string Ƞ,UpdateType ȡ){
    Ą++;
    ȇ();
    if(Ƞ!="")Ȣ(Ƞ);
    if(!r&&Ȃ()){if(Ą%10==0)Ƿ();Echo("UNITY PAD");Echo("Awaiting boot compile...");return;}
    if(ȁ()){Echo("UNITY PAD");Echo("Boot in progress...");return;}
    if(!Ȁ()){r=false;if(Ą%2==0)Ƿ();Echo("UNITY PAD");Echo("Waiting for boot...");return;}
    ȃ();
    if(Ą%2==0)ȣ();
    if(!r){r=true;Ǳ();ǰ();Ȥ();}
    if(Ą%2==0)Ǳ();
    if(Ą%2==1){ȥ();Ȧ();}
    if(Ą%2==0)ȧ();
    Ȩ();
    if(Ą%3==0){ȩ();ȧ();}
    if(Ą%3==0)Ȫ();
    if(Ą%3==0)ȫ();
    if(Ą%3==0)Ȭ();
    if(Ą%3==0)ȭ();
    if(Ą%5==0)Ȯ();
    if(Ą%3==0)ȯ();
    if(Ą%5==0)Ȱ();
    if(Ą%2==0)ȱ();
    if(Ą%5==0)Ȳ();
    if(Ą%5==0)ȳ();
    if(Ą%5==0)ȴ();
    if(Ą%10==0&&ǚ.Count>6){m=(m+1)%(ǚ.Count-5);}
    if(d!=K.B&&d!=K.J)ȵ();
    else ȶ();
    }
        
    void ȩ(){
    if(ƌ==null)return;
    while(ƌ.HasPendingMessage){ȷ(ƌ.AcceptMessage());}
    if(ƍ!=null){while(ƍ.HasPendingMessage){ȷ(ƍ.AcceptMessage());}}
    ȸ();
    }
    void ȷ(MyIGCMessage Ȅ){
    if(!(Ȅ.Data is string))return;
    string ȹ=(string)Ȅ.Data;
    var Ⱥ=ȹ.Split(',');
    if(Ⱥ.Length>=5){
    double Ȼ,ȼ,Ƚ,ȅ;
    if(double.TryParse(Ⱥ[0],out Ȼ)&&double.TryParse(Ⱥ[1],out ȼ)&&double.TryParse(Ⱥ[2],out Ƚ)){
    Vector3D Ⱦ=new Vector3D(Ȼ,ȼ,Ƚ);
    if(µ&&Ƈ!=Vector3D.Zero){
    double ɀ=(ȿ-ƀ).TotalSeconds;
    if(ɀ>0.1){double Ǌ=Ɂ(Ⱦ,Ƈ);ř=Ǌ/ɀ;}
    }
    Ɔ=Ⱦ;Ƈ=Ⱦ;ƀ=ȿ;
    }
    if(double.TryParse(Ⱥ[3],out ȅ))ŕ=ȅ;
    ŉ=Ⱥ[4];
    if(ŉ=="ENTERING_BLACKOUT"){À=true;Ŋ=ŉ;Ŗ=ŕ;}
    else if(ŉ=="CONTACT_RESTORED"){À=false;if(Á){ɂ();Á=false;º=false;µ=false;d=K.B;return;}}
    else if(ŉ=="BLACKOUT_SAT"){int Ƀ=ȹ.IndexOf("ORIGTGT:");
    if(Ƀ>=0){int Ʉ=ȹ.IndexOf('|',Ƀ);if(Ʉ<0)Ʉ=ȹ.Length;string Ʌ=ȹ.Substring(Ƀ+8,Ʉ-Ƀ-8);
    var Ɇ=Ʌ.Split(',');if(Ɇ.Length==3){double ɇ,Ɉ,ɉ;if(double.TryParse(Ɇ[0],out ɇ)&&double.TryParse(Ɇ[1],out Ɉ)&&double.TryParse(Ɇ[2],out ɉ)){
    ƅ=new Vector3D(ɇ,Ɉ,ɉ);y=true;Ň="RELAY";}}}
    º=false;µ=false;À=false;Ã=false;d=K.B;return;}
    else{Ŋ=ŉ;Ŗ=ŕ;À=false;}
    if(Ⱥ.Length>=7){
    double Ɋ,ɋ;
    if(double.TryParse(Ⱥ[5],out Ɋ))ŗ=Ɋ;
    if(double.TryParse(Ⱥ[6],out ɋ))Ř=ɋ;
    }
    if(Ⱥ.Length>=11){
    double ǉ,ǈ,Ɍ;
    if(double.TryParse(Ⱥ[7],out ǉ))Œ=ǉ;
    if(double.TryParse(Ⱥ[8],out ǈ))œ=ǈ;
    if(double.TryParse(Ⱥ[9],out Ɍ))Ŕ=Ɍ;
    Ņ=Ⱥ[10];
    }
    ƒ[ā%16]=(float)ŕ;
    Ɠ[ā%16]=(float)Œ;
    Ɣ[ā%16]=(float)œ;
    ā=(ā+1)%1000000;
    ſ=ȿ;
    µ=true;
    if(ŉ!=ń){string ɍ=ȿ.ToString("HH:mm:ss");string Ɏ=ŉ=="AMMO_EJECT"?$" @{ŕ:F0}m":ŉ=="WARHEADS_ARMED"?$" @{ŕ:F0}m":ŉ=="IMPACT"?$" DTT:{ŕ:F0}m":ŉ=="TARGET"?$" DTT:{ŕ:F0}m SPD:{œ:F0}m/s":"";ł+=$"{ɍ}|MSL:{ŉ}{Ɏ}\n";ń=ŉ;if(ł.Length>3000){int ɏ=ł.IndexOf('\n',500);if(ɏ>0)ł=ł.Substring(ɏ+1);}ǲ();}
    if(ŷ.Count>0){
    foreach(var ɐ in ŷ){
    ɐ.Enabled=true;
    ɐ.SetTargetCoords($"GPS:MSL:{Ɔ.X:F0}:{Ɔ.Y:F0}:{Ɔ.Z:F0}:");
    if(ɐ.Status!=MyLaserAntennaStatus.Connected)ɐ.Connect();
    }}
    }}
    void ȸ(){
    if(d==K.J&&º&&!Ã){
    bool ɑ=false;foreach(var ɐ in ŷ)if(ɐ.Status==MyLaserAntennaStatus.Connected)ɑ=true;
    int ɒ=(int)(ȿ-ſ).TotalSeconds;
    int ɓ=þ==1?30:þ==0?15:10,ɔ=þ==1?120:þ==0?60:30;
    if(ɒ>ɓ&&!À&&!ɑ)À=true;
    if(ɑ)À=false;
    if(µ&&ɒ>ɔ){
    Ś=ŕ;Ō=ŉ;Ƃ=ȿ;
    if(Â)ŋ="ABORTED";
    else if(Ś<ø*2)ŋ="TARGET HIT";
    else if(Ō=="TARGET"&&Ś<500)ŋ="PROBABLE HIT";
    else if(Ō=="TARGET")ŋ="SIGNAL LOST - TARGETING";
    else ŋ="SIGNAL LOST";
    ɕ(ŋ);
    Ã=true;
    if(ŋ=="SIGNAL LOST"&&Ŋ=="ENTERING_BLACKOUT"){y=true;Ň="RELAY";º=false;d=K.B;}
    }}
    }
    void ɖ(){
    Ã=false;ŋ="";º=false;µ=false;À=false;Á=false;Â=false;d=K.B;ȶ();
    }
    void ə(string ɗ,object ɘ){
    string Ȅ=$"{Ć}|{ɗ}|{ɘ}";
    IGC.SendBroadcastMessage(Ŏ,Ȅ);
    }
    void Ȱ(){
    if(Ć==0)return;
    string ɚ="";
    if(Ĵ==null)ɚ="NO_MERGE";else if(Ķ==null)ɚ="NO_CON";else if(d==K.G&&!y&&f==X.R)ɚ="NO_TGT";else if(À)ɚ="BLACKOUT";
    string ɛ=$"{Ć}|STATUS|{d}|{(w?"1":"0")}|{(d==K.H?"1":"0")}|{(d==K.G?"1":"0")}|{(Ä?"1":"0")}|{ƅ.X:F0}|{ƅ.Y:F0}|{ƅ.Z:F0}|{ɚ}";
    IGC.SendBroadcastMessage(ŏ,ɛ);
    }
    void Ȫ(){
    if(Ǝ==null)return;
    while(Ǝ.HasPendingMessage){
    var Ȅ=Ǝ.AcceptMessage();
    if(Ȅ.Data is string){
    var Ⱥ=((string)Ȅ.Data).Split('|');
    if(Ⱥ.Length>=2){
    int ɜ;if(!int.TryParse(Ⱥ[0],out ɜ))continue;
    if(ɜ==Ć)continue;
    string ɗ=Ⱥ[1];
    if(!É){
    if(ɗ=="TGT"&&Ⱥ.Length>=3){var ɝ=Ⱥ[2].Split(',');if(ɝ.Length==3){double Ȼ,ȼ,Ƚ;if(double.TryParse(ɝ[0],out Ȼ)&&double.TryParse(ɝ[1],out ȼ)&&double.TryParse(ɝ[2],out Ƚ)){ƅ=new Vector3D(Ȼ,ȼ,Ƚ);y=true;Ň="CTRL TGT";}}}
    else if(ɗ=="BUILD"&&!w&&!Ä)ɞ();
    else if(ɗ=="ARM"&&d==K.G&&w)ɟ();
    else if(ɗ=="LAUNCH"){if(d==K.G&&w)ɟ();else if(d==K.H){int ɠ=(int)(ȿ-ž).TotalSeconds;if(ù==0||ɠ>=ù)ɡ();}}
    else if(ɗ=="ABORT"&&d==K.J){if(À){Á=true;}else{ɂ(true);Â=true;Ɓ=ȿ;}}
    else if(ɗ=="SATLAUNCH"){
    int ɢ;if(Ⱥ.Length>=3&&int.TryParse(Ⱥ[2],out ɢ)&&ɢ==Ć){
    f=X.W;y=true;Ň="SATELLITE";
    ģ=0;Ĥ=0;ƈ=Vector3D.Zero;
    if(Ⱥ.Length>=4){
    if(Ⱥ[3]=="GRID"&&Ⱥ.Length>=5){var ɣ=Ⱥ[4].Split(',');int ɤ,ɥ;if(ɣ.Length==2&&int.TryParse(ɣ[0],out ɤ)&&int.TryParse(ɣ[1],out ɥ)){ģ=ɤ;Ĥ=ɥ;}}
    else{var ɝ=Ⱥ[3].Split(',');if(ɝ.Length==3){double Ȼ,ȼ,Ƚ;if(double.TryParse(ɝ[0],out Ȼ)&&double.TryParse(ɝ[1],out ȼ)&&double.TryParse(ɝ[2],out Ƚ))ƈ=new Vector3D(Ȼ,ȼ,Ƚ);}}}
    if(d==K.G&&w)ɟ();
    else if(d==K.H){int ɠ=(int)(ȿ-ž).TotalSeconds;if(ù==0||ɠ>=ù)ɡ();}
    else if(!w&&!Ä)ɞ();
    }}
    }}}}}
    void ȱ(){
    if(!É||!Ê)return;
    int ɦ=(int)(ȿ-ƃ).TotalSeconds;
    if(ɦ>=Ě&&ě<ƫ.Count){
    int ɢ=ƫ[ě];
    string Ȅ=$"{Ć}|LAUNCH|{ɢ}";
    IGC.SendBroadcastMessage(Ŏ,Ȅ);
    ě++;ƃ=ȿ;
    if(ě>=ƫ.Count)Ê=false;
    }}
    void ɶ(){
    var ɧ=new List<int>();
    foreach(int ɨ in ƫ){if(Ʊ.ContainsKey(ɨ)&&Ʊ[ɨ])ɧ.Add(ɨ);}
    if(ɧ.Count==0)return;
    int Ș=ɧ.Count;
    Vector3D ɩ=ƅ;
    Vector3D ɫ=ɪ(ƅ-Me.GetPosition());
    Vector3D ɬ=Vector3D.Cross(ɫ,Vector3D.Up);
    if(ɬ.Length()<0.1)ɬ=Vector3D.Cross(ɫ,Vector3D.Forward);
    ɬ=ɪ(ɬ);
    Vector3D ɭ=Vector3D.Cross(ɬ,ɫ);
    for(int ɮ=0;ɮ<Ș;ɮ++){
    Vector3D ɯ=Vector3D.Zero;
    if(ĝ==0){
    double ɰ=(ɮ-(Ș-1)/2.0)*Ĝ;
    ɯ=ɬ*ɰ;
    }else if(ĝ==1){
    int ɱ=(int)Math.Ceiling(Math.Sqrt(Ș));
    int ɲ=ɮ/ɱ;int ɳ=ɮ%ɱ;
    ɯ=ɬ*(ɳ-(ɱ-1)/2.0)*Ĝ+ɭ*(ɲ-(Ș/ɱ-1)/2.0)*Ĝ;
    }else{
    double ɴ=ɮ*2*Math.PI/Ș;
    ɯ=new Vector3D(Math.Cos(ɴ),0,Math.Sin(ɴ))*Ĝ;
    }
    Vector3D ɵ=ɩ+ɯ;
    string Ȅ=$"{Ć}|TGT|{ɵ.X:F0},{ɵ.Y:F0},{ɵ.Z:F0}|{ɧ[ɮ]}";
    IGC.SendBroadcastMessage(Ŏ,Ȅ);
    }
    ə("ARM","");
    Ê=true;ě=0;ƃ=ȿ;
    }
    void Ȳ(){
    if(!É||!Ë)return;
    foreach(var ɸ in ű){
    var ɷ=new List<MyDetectedEntityInfo>();
    ɸ.DetectedEntities(ɷ);
    foreach(var ɹ in ɷ){
    if(ɹ.Relationship==MyRelationsBetweenPlayerAndBlock.Enemies||ɹ.Relationship==MyRelationsBetweenPlayerAndBlock.Neutral){
    bool ɺ=false;
    foreach(var ɻ in ƶ){if(Ɂ(ɻ,ɹ.Position)<100)ɺ=true;}
    if(!ɺ&&ƶ.Count<50)ƶ.Add(ɹ.Position);
    }}}
    while(Ɛ!=null&&Ɛ.HasPendingMessage){
    var Ȅ=Ɛ.AcceptMessage();
    Vector3D Ǉ=Vector3D.Zero;
    if(Ȅ.Data is Vector3D)Ǉ=(Vector3D)Ȅ.Data;
    else if(Ȅ.Data is string){var Ǵ=((string)Ȅ.Data).Split(',');if(Ǵ.Length>=3){double Ȼ,ȼ,Ƚ;if(double.TryParse(Ǵ[0],out Ȼ)&&double.TryParse(Ǵ[1],out ȼ)&&double.TryParse(Ǵ[2],out Ƚ))Ǉ=new Vector3D(Ȼ,ȼ,Ƚ);}}
    if(Ǉ!=Vector3D.Zero){bool ɺ=false;foreach(var ɻ in ƶ){if(Ɂ(ɻ,Ǉ)<100)ɺ=true;}if(!ɺ&&ƶ.Count<50)ƶ.Add(Ǉ);}
    }
    if(ƶ.Count==0){Ë=false;return;}
    var ɧ=new List<int>();
    foreach(int ɨ in ƫ){if(Ʊ.ContainsKey(ɨ)&&Ʊ[ɨ])ɧ.Add(ɨ);}
    if(ɧ.Count==0)return;
    int ɼ=0;
    for(int ɮ=0;ɮ<ɧ.Count&&ɮ<ƶ.Count;ɮ++){
    Vector3D ɵ=ƶ[ɮ];
    string Ȅ=$"{Ć}|TGT|{ɵ.X:F0},{ɵ.Y:F0},{ɵ.Z:F0}|{ɧ[ɮ]}";
    IGC.SendBroadcastMessage(Ŏ,Ȅ);
    ɼ++;
    }
    for(int ɮ=0;ɮ<ɼ;ɮ++)ƶ.RemoveAt(0);
    if(ɼ>0){ə("ARM","");Ê=true;ě=0;ƃ=ȿ;}
    }
    void ȫ(){
    if(!É||Ə==null)return;
    while(Ə.HasPendingMessage){
    var Ȅ=Ə.AcceptMessage();
    if(Ȅ.Data is string){
    var Ⱥ=((string)Ȅ.Data).Split('|');
    if(Ⱥ.Length>=7&&Ⱥ[1]=="STATUS"){
    int ɨ;if(!int.TryParse(Ⱥ[0],out ɨ))continue;
    if(ɨ==Ć)continue;
    if(!ƫ.Contains(ɨ)){if(ƫ.Count>=20){int ɽ=ƫ[0];ƫ.RemoveAt(0);ƭ.Remove(ɽ);Ʈ.Remove(ɽ);Ʋ.Remove(ɽ);ư.Remove(ɽ);Ʊ.Remove(ɽ);Ƴ.Remove(ɽ);ƴ.Remove(ɽ);}ƫ.Add(ɨ);}
    ƭ[ɨ]=Ⱥ[2];
    Ʋ[ɨ]=Ⱥ[3]=="1";
    ư[ɨ]=Ⱥ[4]=="1";
    Ʊ[ɨ]=Ⱥ[5]=="1";
    Ƴ[ɨ]=Ⱥ[6]=="1";
    if(Ⱥ.Length>=9){double Ȼ,ȼ,Ƚ;if(double.TryParse(Ⱥ[7],out Ȼ)&&double.TryParse(Ⱥ[8],out ȼ)&&Ⱥ.Length>=10&&double.TryParse(Ⱥ[9],out Ƚ))ƴ[ɨ]=new Vector3D(Ȼ,ȼ,Ƚ);}
    if(Ⱥ.Length>=11&&!string.IsNullOrEmpty(Ⱥ[10]))Ʈ[ɨ]=Ⱥ[10];else Ʈ.Remove(ɨ);
    }}}}
    void Ȭ(){
    if(Š==null){ǽ();if(Š==null)return;}
    string ǿ=Š.CustomData;
    int ɾ=ǿ.IndexOf("[SATELLITES]");
    if(ɾ<0)return;
    int ɿ=ǿ.IndexOf("[",ɾ+12);
    string ʀ=ɿ>0?ǿ.Substring(ɾ,ɿ-ɾ):ǿ.Substring(ɾ);
    Ƭ.Clear();Ƶ.Clear();Ʒ.Clear();Ƹ.Clear();Ư.Clear();ƹ.Clear();ƺ.Clear();
    var ʁ=ʀ.Split('\n');
    foreach(var ʂ in ʁ){
    if(!ʂ.StartsWith("sat_"))continue;
    int ʃ=ʂ.IndexOf('=');if(ʃ<0)continue;
    int ʄ;if(!int.TryParse(ʂ.Substring(4,ʃ-4),out ʄ))continue;
    var Ⱥ=ʂ.Substring(ʃ+1).Split('|');
    if(Ⱥ.Length<5)continue;
    if(!Ƭ.Contains(ʄ))Ƭ.Add(ʄ);
    var ɣ=Ⱥ[0].Split(',');int ɤ,ɥ;
    if(ɣ.Length>=2&&int.TryParse(ɣ[0],out ɤ)&&int.TryParse(ɣ[1],out ɥ)){ƹ[ʄ]=ɤ;ƺ[ʄ]=ɥ;}
    int Ǆ,ǆ;if(int.TryParse(Ⱥ[1],out Ǆ))Ʒ[ʄ]=Ǆ;
    if(int.TryParse(Ⱥ[2],out ǆ))Ƹ[ʄ]=ǆ;
    int ʅ;if(int.TryParse(Ⱥ[3],out ʅ)){}
    Ư[ʄ]=Ⱥ[4];}}
    void ȭ(){
    if(Š==null){ǽ();if(Š==null)return;}
    string ǿ=Š.CustomData;
    int ʆ=ǿ.IndexOf("[INTERCEPTS]");
    if(ʆ<0)return;
    int ʇ=ǿ.IndexOf("\n[",ʆ+1);
    string ʈ=ʇ>0?ǿ.Substring(ʆ+12,ʇ-ʆ-12):ǿ.Substring(ʆ+12);
    var ʁ=ʈ.Split('\n');
    foreach(var ʂ in ʁ){
    if(string.IsNullOrEmpty(ʂ.Trim()))continue;
    var ʉ=ʂ.Split(new[]{'|'},2);
    if(ʉ.Length<2)continue;
    int ʊ;if(!int.TryParse(ʉ[0],out ʊ))continue;
    if(ʊ<=Ġ)continue;
    Ġ=ʊ;
    var Ⱥ=ʉ[1].Split('|');
    if(Ⱥ.Length>=4&&Ⱥ[0]=="DETONATE"){
    int ʄ;if(!int.TryParse(Ⱥ[1],out ʄ))continue;
    int ʋ;if(!int.TryParse(Ⱥ[2],out ʋ))continue;
    var ɝ=Ⱥ[3].Split(',');
    if(ɝ.Length==3){double Ȼ,ȼ,Ƚ;if(double.TryParse(ɝ[0],out Ȼ)&&double.TryParse(ɝ[1],out ȼ)&&double.TryParse(ɝ[2],out Ƚ)){
    ƻ.Enqueue(new Vector3D(Ȼ,ȼ,Ƚ));
    int ɤ=0,ɥ=0;if(Ⱥ.Length>=5){var ɣ=Ⱥ[4].Split(',');if(ɣ.Length>=2){int.TryParse(ɣ[0],out ɤ);int.TryParse(ɣ[1],out ɥ);}}
    Ƽ.Enqueue(ɤ);ƽ.Enqueue(ɥ);
    if(Ƭ.Contains(ʄ))Ƭ.Remove(ʄ);
    if(Ƶ.ContainsKey(ʄ))Ƶ.Remove(ʄ);
    if(ƹ.ContainsKey(ʄ))ƹ.Remove(ʄ);
    if(ƺ.ContainsKey(ʄ))ƺ.Remove(ʄ);
    }}}}}
    void Ȯ(){
    if(!É)return;
    int ɦ=(int)(ȿ-Ƅ).TotalSeconds;
    if(ɦ<10)return;
    Ƅ=ȿ;
    if(Ì&&ƻ.Count>0){
    foreach(int ɨ in ƫ){
    if(ƻ.Count==0)break;
    if(!ƭ.ContainsKey(ɨ))continue;
    if(ƭ[ɨ]=="IDLE"||ƭ[ɨ]=="READY"){
    var ɵ=ƻ.Dequeue();
    int ɤ=Ƽ.Count>0?Ƽ.Dequeue():0;
    int ɥ=ƽ.Count>0?ƽ.Dequeue():0;
    ə("SATLAUNCH",$"{ɨ}|GRID|{ɤ},{ɥ}");
    ğ++;
    }}}
    int ʌ=Ƭ.Count;
    int ʍ=Ğ-ʌ-ğ;
    if(Ì&&ʍ>0){
    foreach(int ɨ in ƫ){
    if(ʍ<=0)break;
    if(!ƭ.ContainsKey(ɨ))continue;
    if(ƭ[ɨ]=="IDLE"||ƭ[ɨ]=="READY"){
    int ɤ=ġ,ɥ=Ģ;
    ʎ();
    ə("SATLAUNCH",$"{ɨ}|GRID|{ɤ},{ɥ}");
    ğ++;ʍ--;
    }}}}
    void ʎ(){
    if(ġ==0&&Ģ==0){ġ=1;return;}
    if(ġ>0&&Ģ>=0&&Ģ<ġ){Ģ++;return;}
    if(Ģ>0&&ġ>-Ģ){ġ--;return;}
    if(ġ<0&&Ģ>ġ){Ģ--;return;}
    if(Ģ<0&&ġ<-Ģ){ġ++;return;}
    if(ġ>0&&Ģ<0){ġ++;Ģ=0;}
    }
    void ȯ(){
    if(Ƒ==null)return;
    while(Ƒ.HasPendingMessage){
    var Ȅ=Ƒ.AcceptMessage();
    if(!(Ȅ.Data is string))continue;
    var Ǵ=((string)Ȅ.Data).Split('|');
    if(Ǵ.Length<17||Ǵ[0]!="MB")continue;
    int ʏ;if(!int.TryParse(Ǵ[1],out ʏ))continue;
    if(!É&&ʏ!=Ć)continue;
    long ʐ;if(!long.TryParse(Ǵ[2],out ʐ))continue;
    ƿ ʑ;
    if(!ǀ.TryGetValue(ʐ,out ʑ)){ʑ=new ƿ();ǀ[ʐ]=ʑ;}
    ʑ.ǁ=Ǵ[3];
    float.TryParse(Ǵ[4],out ʑ.Ǆ);float.TryParse(Ǵ[5],out ʑ.ǅ);float.TryParse(Ǵ[6],out ʑ.ǆ);
    var Ǉ=Ǵ[7].Split(',');if(Ǉ.Length>=3){double Ȼ,ȼ,Ƚ;if(double.TryParse(Ǉ[0],out Ȼ)&&double.TryParse(Ǉ[1],out ȼ)&&double.TryParse(Ǉ[2],out Ƚ))ʑ.Ǉ=new Vector3D(Ȼ,ȼ,Ƚ);}
    double.TryParse(Ǵ[8],out ʑ.ǈ);double.TryParse(Ǵ[9],out ʑ.ǉ);double.TryParse(Ǵ[10],out ʑ.Ǌ);
    ʑ.ǂ=Ǵ[11];int.TryParse(Ǵ[12],out ʑ.ǎ);int.TryParse(Ǵ[13],out ʑ.Ǐ);int.TryParse(Ǵ[14],out ʑ.ǐ);int.TryParse(Ǵ[15],out ʑ.Ǒ);
    ʑ.ǔ=Ǵ[16]=="1";ʑ.ǖ=ȿ;
    if(Ǵ.Length>=22){double.TryParse(Ǵ[17],out ʑ.ǋ);double.TryParse(Ǵ[18],out ʑ.ǌ);int.TryParse(Ǵ[19],out ʑ.Ǔ);double.TryParse(Ǵ[20],out ʑ.Ǎ);ʑ.Ǖ=Ǵ[21]=="1";}
    if(Ǵ.Length>=23&&Ǵ[22].StartsWith("CARGO:")){ʑ.ǃ=Ǵ[22].Substring(6);ʒ(ʑ);}
    }
    ʓ();
    ʔ();}
    void ʓ(){foreach(var ʕ in ǀ)ʕ.Value.ǔ=false;int ʖ=0;var ʗ=new List<IMyShipConnector>();GridTerminalSystem.GetBlocksOfType(ʗ,ǹ=>ǹ.CubeGrid==Me.CubeGrid&&ǹ.Status==MyShipConnectorStatus.Connected);foreach(var ʘ in ʗ){ʖ++;var ʙ=ʘ.OtherConnector;if(ʙ==null||ʙ.CubeGrid==Me.CubeGrid)continue;long ʚ=ʙ.CubeGrid.EntityId;if(ǀ.ContainsKey(ʚ)){var Ȼ=ǀ[ʚ];Ȼ.ǒ=ʖ;Ȼ.ǔ=true;Ȼ.ǖ=ȿ;}else{var ʑ=new ƿ();ʑ.ǁ=$"P{ʖ}";ʑ.ǒ=ʖ;ʑ.ǔ=true;ʑ.ǖ=ȿ;var ʛ=new List<IMyBatteryBlock>();GridTerminalSystem.GetBlocksOfType(ʛ,ǹ=>ǹ.CubeGrid==ʙ.CubeGrid);if(ʛ.Count>0){float ʜ=0,ʝ=0;foreach(var ǹ in ʛ){ʜ+=ǹ.CurrentStoredPower;ʝ+=ǹ.MaxStoredPower;}ʑ.Ǆ=ʝ>0?(ʜ/ʝ)*100:0;}var ʞ=new List<IMyCargoContainer>();GridTerminalSystem.GetBlocksOfType(ʞ,ǹ=>ǹ.CubeGrid==ʙ.CubeGrid);if(ʞ.Count>0){float ʜ=0,ʝ=0;foreach(var Ɋ in ʞ){var ʟ=Ɋ.GetInventory();if(ʟ!=null){ʜ+=(float)ʟ.CurrentVolume;ʝ+=(float)ʟ.MaxVolume;}}ʑ.ǅ=ʝ>0?(ʜ/ʝ)*100:0;}var ʠ=new List<IMyGasTank>();GridTerminalSystem.GetBlocksOfType(ʠ,ǹ=>ǹ.CubeGrid==ʙ.CubeGrid&&ǹ.BlockDefinition.SubtypeId.Contains("Hydrogen"));if(ʠ.Count>0){float ɻ=0;foreach(var ʡ in ʠ)ɻ+=(float)ʡ.FilledRatio;ʑ.ǆ=(ɻ/ʠ.Count)*100;}var ʢ=new List<IMyShipDrill>();GridTerminalSystem.GetBlocksOfType(ʢ,ǹ=>ǹ.CubeGrid==ʙ.CubeGrid);ʑ.ǎ=ʢ.Count;var ʣ=new List<IMyShipGrinder>();GridTerminalSystem.GetBlocksOfType(ʣ,ǹ=>ǹ.CubeGrid==ʙ.CubeGrid);ʑ.ǐ=ʣ.Count;ʑ.ǂ="DOCKED";ǀ[ʚ]=ʑ;}}}
    void ʔ(){
    var ʤ=new List<long>();
    foreach(var ʕ in ǀ){if((ȿ-ʕ.Value.ǖ).TotalSeconds>120&&!ʕ.Value.ǔ)ʤ.Add(ʕ.Key);}
    foreach(var ȕ in ʤ)ǀ.Remove(ȕ);}
    void ʒ(ƿ ʑ){ʑ.Ǘ.Clear();if(string.IsNullOrEmpty(ʑ.ǃ))return;var ʥ=ʑ.ǃ.Split(';');foreach(var ʦ in ʥ){var ʕ=ʦ.Split('=');if(ʕ.Length!=2)continue;int ʧ;if(int.TryParse(ʕ[1],out ʧ))ʑ.Ǘ[ʕ[0]]=ʧ;}}
    string ʩ(string ʨ){if(ʨ.StartsWith("O:"))return"Ore";if(ʨ.StartsWith("I:"))return"Ingot";if(ʨ.StartsWith("C:"))return"Component";if(ʨ.StartsWith("T:"))return"Tool";if(ʨ.StartsWith("A:"))return"Ammo";if(ʨ.StartsWith("B:"))return"Bottle";if(ʨ.StartsWith("F:"))return"Food";if(ʨ.StartsWith("D:"))return"Data";return"Other";}
    string ʪ(string ʨ){int Ȓ=ʨ.IndexOf(':');return Ȓ>=0?ʨ.Substring(Ȓ+1):ʨ;}
        
    void Ȣ(string Ƞ){
    ż=ȿ;
    switch(Ƞ.ToUpper()){
    case"UP":if(ï>0)ĥ[ï]=Math.Max(0,ĥ[ï]-1);else if(É)Ę=Math.Max(0,Ę-1);else h=Math.Max(0,h-1);break;
    case"DOWN":
    if(ï>0){ĥ[ï]++;break;}
    if(É){Ę=Math.Min(11,Ę+1);break;}
    int ʫ=e==Q.L?5:e==Q.M?2:e==Q.N?31:e==Q.O?3:e==Q.P?7:0;
    h=Math.Min(ʫ,h+1);break;
    case"APPLY":if(Ã){ɖ();return;}if(ï>0){ï=0;e=Q.P;h=0;return;}if(É&&e==Q.L){ʬ();return;}ʭ();break;
    case"LAUNCH":
    if(d==K.G){ɟ();}
    else if(d==K.H){int ɠ=(int)(ȿ-ž).TotalSeconds;if(ù==0||ɠ>=ù)ɡ();}
    break;
    case"ARM":if(d==K.G)ɟ();break;
    case"DISARM":ʮ();break;
    case"REFUEL":if(d==K.B)d=K.F;break;
    case"MENU":e=(Q)(((int)e+1)%6);h=0;break;
    case"SETUP":e=Q.O;h=0;break;
    case"RESCAN":ǰ();Ǳ();break;
    case"PRINT":ɞ();break;
    case"CREATIVE":È=!È;break;
    case"NAMEPAD":IGC.SendBroadcastMessage("UNITY_SETUP_CMD",$"NAMEPAD|{Ć}");Echo("Setup: NAMEPAD sent to Boot");break;
    case"NAMEMSL":IGC.SendBroadcastMessage("UNITY_SETUP_CMD",$"NAMEMSL|{Ć}");Echo("Setup: NAMEMSL sent to Boot");break;
    case"SETUPMOD":IGC.SendBroadcastMessage("UNITY_SETUP_CMD",$"SETUPMOD|{Ć}");Echo("Setup: SETUPMOD sent to Boot");break;
    case"SETUPFORCE":IGC.SendBroadcastMessage("UNITY_SETUP_CMD",$"SETUPFORCE|{Ć}");Echo("Setup: SETUPFORCE sent to Boot");break;
    case"RESET#":ą=0;break;
    case"STOP":ʯ();break;
    case"RESET":d=K.B;º=false;µ=false;Á=false;Â=false;Ã=false;ŋ="";Æ=true;ĳ=false;if(Ĵ!=null)Ĵ.Enabled=true;if(Ķ!=null)Ķ.Enabled=true;Ȥ();ʰ();ȶ();break;
    case"ACK":case"OK":case"CLEAR":if(Ã)ɖ();break;
    case"CLAIM":if(Ć==0){Ć=Ȗ();Ǯ();}break;
    case"SETPADCONTROL":É=!É;if(É){Ę=0;ï=0;e=Q.L;}break;
    case"COPYTGT":if(É)ə("TGT",ƅ);break;
    case"BUILDALL":if(É)ə("BUILD","");break;
    case"ARMALL":if(É)ə("ARM","");break;
    case"LAUNCHALL":if(É)ə("LAUNCH","");break;
    case"ABORTALL":if(É)ə("ABORT","");break;
    case"STARTSALVO":if(É){Ê=true;ě=0;ƃ=ȿ;}break;
    case"STOPSALVO":if(É)Ê=false;break;
    case"CARPET":if(É)ɶ();break;
    case"AUTOATTACK":if(É){Ë=!Ë;if(Ë)ƶ.Clear();}break;
    case"KILLALL":if(É){Ë=true;ƶ.Clear();}break;
    case"BBRESET":ł="";ǲ();break;
    }
    if(Ƞ.ToUpper().StartsWith("GPS:")){var Ǵ=Ƞ.Substring(4).Split(',');if(Ǵ.Length==3){double Ȼ,ȼ,Ƚ;if(double.TryParse(Ǵ[0],out Ȼ)&&double.TryParse(Ǵ[1],out ȼ)&&double.TryParse(Ǵ[2],out Ƚ)){ƅ=new Vector3D(Ȼ,ȼ,Ƚ);y=true;Ň="MANUAL GPS";}}}
    }
        
    void Ǳ(){
    var ʱ=new List<IMyTerminalBlock>();
    GridTerminalSystem.GetBlocksOfType(ʱ,ǹ=>ǹ.CustomName.Contains(ō));
    Ĵ=null;Ķ=null;Ĺ=null;ĺ=null;
    if(Ļ!=null&&((IMyTerminalBlock)Ļ).Closed)Ļ=null;
    if(ļ!=null&&((IMyTerminalBlock)ļ).Closed)ļ=null;
    if(Ľ!=null&&((IMyTerminalBlock)Ľ).Closed)Ľ=null;
    if(ľ!=null&&((IMyTerminalBlock)ľ).Closed)ľ=null;
    if(Ŀ!=null&&((IMyTerminalBlock)Ŀ).Closed)Ŀ=null;
    if(Ŝ!=null&&Ŝ.Closed)Ŝ=null;
    foreach(var ǹ in ʱ){
    if(ǹ is IMyShipMergeBlock&&Ĵ==null)Ĵ=ǹ as IMyShipMergeBlock;
    }
    if(Ĵ==null){
    var ʲ=new List<IMyShipMergeBlock>();
    GridTerminalSystem.GetBlocksOfType(ʲ);
    double ʳ=50;
    foreach(var ʑ in ʲ){if(ʑ.CustomName.Contains("[PAD")){double ȅ=Ɂ(ʑ.GetPosition(),Me.GetPosition());if(ȅ<ʳ){Ĵ=ʑ;ʳ=ȅ;}}}
    }
    foreach(var ǹ in ʱ){
    if(ǹ is IMyShipConnector){var ʘ=ǹ as IMyShipConnector;string ȡ=ǹ.CustomName.ToUpper();if(ȡ.Contains("-CON1")&&Ĺ==null)Ĺ=ʘ;else if(ȡ.Contains("-CON2")&&ĺ==null)ĺ=ʘ;else if(Ķ==null&&ȡ.Contains("FUEL"))Ķ=ʘ;}
    if(ǹ is IMyTextPanel){
    var Ǵ=ǹ as IMyTextPanel;string ʖ=Ǵ.CustomName;
    if(ʴ(ʖ,1)&&Ļ==null)Ļ=Ǵ;
    else if(ʴ(ʖ,2)&&ļ==null)ļ=Ǵ;
    else if(ʴ(ʖ,3)&&Ľ==null)Ľ=Ǵ;
    else if(ʴ(ʖ,7)&&ľ==null)ľ=Ǵ;
    else if(ʴ(ʖ,8)&&Ŀ==null)Ŀ=Ǵ;
    }
    if(ǹ is IMyButtonPanel&&ǹ.CustomName.ToLower().Contains("control")&&Ŝ==null)Ŝ=ǹ as IMyButtonPanel;
    }
    if(Ŝ==null){var ʵ=new List<IMyButtonPanel>();GridTerminalSystem.GetBlocksOfType(ʵ,ǹ=>ǹ.CustomName.Contains(ō)||ǹ.CubeGrid==Me.CubeGrid);foreach(var ʶ in ʵ)if(ʶ.CustomName.ToLower().Contains("control")&&Ŝ==null)Ŝ=ʶ;}
    if(Ŝ==null){var ʵ=new List<IMyButtonPanel>();GridTerminalSystem.GetBlocksOfType(ʵ);foreach(var ʶ in ʵ)if(ʶ.CustomName.ToLower().Contains("control")&&Ŝ==null)Ŝ=ʶ;}
    ŀ.Clear();Ł.Clear();
    var ʷ=new List<IMyTextPanel>();
    GridTerminalSystem.GetBlocksOfType(ʷ,Ǵ=>Ǵ.CustomName.ToUpper().Contains("[BLACKBOX]"));
    foreach(var Ǵ in ʷ)ŀ.Add(Ǵ);
    string ʸ=$"[PAD{Ć} MINIMAP]";
    GridTerminalSystem.GetBlocksOfType(ʷ,Ǵ=>Ǵ.CustomName.Contains(ʸ));
    foreach(var Ǵ in ʷ)Ł.Add(Ǵ);
    ʹ();
    ʺ();
    ʻ();
    ʼ();
    Ɖ.Clear();
    if(Ż!=null)Ż.GetWaypointInfo(Ɖ);
    foreach(var ʽ in Ɗ)Ɖ.Add(ʽ);
    foreach(var ɐ in Ŷ){ŷ.Remove(ɐ);}
    foreach(var Ƞ in Ŵ){ŵ.Remove(Ƞ);}
    }
        
    void ʺ(){
    Ţ.Clear();ť.Clear();Ŧ.Clear();Ɲ.Clear();ƞ.Clear();Ɵ.Clear();Ơ.Clear();Ƨ.Clear();ƨ.Clear();ŵ.Clear();ŷ.Clear();ŭ.Clear();Ʃ.Clear();ů.Clear();ũ.Clear();ū.Clear();ų.Clear();ű.Clear();ƾ.Clear();ƪ.Clear();ź.Clear();ć=0;Ĉ=0;ĉ=0;
    var ʱ=new List<IMyTerminalBlock>();
    GridTerminalSystem.GetBlocksOfType(ʱ,ǹ=>ǹ.CubeGrid==Me.CubeGrid);
    Vector3D ʾ=Ĵ!=null?Ĵ.GetPosition():Me.GetPosition();
    Vector3D Ɔ=ʾ;
    bool ʿ=Ĵ!=null&&Ĵ.IsConnected;
    if(ʿ){var ˀ=new List<IMyShipMergeBlock>();GridTerminalSystem.GetBlocksOfType(ˀ);foreach(var ʑ in ˀ){if(ʑ!=Ĵ&&ʑ.IsConnected&&Ɂ(ʑ.GetPosition(),ʾ)<3)Ɔ=ʑ.GetPosition()+ʑ.WorldMatrix.Forward*5;}}
    foreach(var ǹ in ʱ){
    if(ʿ&&ǹ!=Ĵ&&ǹ!=Ķ&&ǹ!=Me){double ˁ=Ɂ(ǹ.GetPosition(),ʾ);double ˆ=Ɂ(ǹ.GetPosition(),Ɔ);if(ˆ<ˁ)continue;}
    if(ǹ is IMyBatteryBlock)Ţ.Add(ǹ as IMyBatteryBlock);
    if(ǹ is IMyGasTank){var ɻ=ǹ as IMyGasTank;if(ɻ.BlockDefinition.SubtypeId.Contains("Hydrogen"))ť.Add(ɻ);else Ŧ.Add(ɻ);}
    if(ǹ is IMyRefinery)Ƨ.Add(ǹ as IMyRefinery);
    if(ǹ is IMyAssembler)ƨ.Add(ǹ as IMyAssembler);
    if(ǹ is IMyRadioAntenna)ŵ.Add(ǹ as IMyRadioAntenna);
    if(ǹ is IMyLaserAntenna)ŷ.Add(ǹ as IMyLaserAntenna);
    if(ǹ is IMyReactor)ŭ.Add(ǹ as IMyReactor);
    if(ǹ is IMySolarPanel)Ʃ.Add(ǹ as IMySolarPanel);
    if(ǹ is IMyGyro)ů.Add(ǹ as IMyGyro);
    if(ǹ is IMyThrust)ũ.Add(ǹ as IMyThrust);
    if(ǹ is IMyGasGenerator)ū.Add(ǹ as IMyGasGenerator);
    if(ǹ is IMyCameraBlock)ų.Add(ǹ as IMyCameraBlock);
    if(ǹ is IMySensorBlock)ű.Add(ǹ as IMySensorBlock);
    if(ǹ is IMyShipConnector&&ǹ.CustomName.ToUpper().Contains("ORE"))ƾ.Add(ǹ as IMyShipConnector);
    if(ǹ is IMyPowerProducer){var ˇ=ǹ as IMyPowerProducer;if(ˇ.BlockDefinition.SubtypeId.Contains("Wind"))ƪ.Add(ˇ);}
    if(ǹ is IMyMedicalRoom){string ɛ=ǹ.BlockDefinition.SubtypeId;if(ɛ.Contains("Survival")||ɛ.Contains("Kit"))Ĉ++;else ć++;}
    if(ǹ is IMyCockpit&&ǹ.BlockDefinition.SubtypeId.Contains("Cryo"))ĉ++;
    if(ǹ is IMyLightingBlock&&!ǹ.CustomName.Contains("Missile"))ź.Add(ǹ as IMyLightingBlock);
    }
    var ˈ=new List<IMyTerminalBlock>();GridTerminalSystem.GetBlocksOfType(ˈ);
    foreach(var Ȼ in ˈ){if(ˉ(Ȼ))continue;if(Ȼ is IMyBatteryBlock){var ˊ=Ȼ as IMyBatteryBlock;if(!Ţ.Contains(ˊ))Ţ.Add(ˊ);}else if(Ȼ is IMySolarPanel&&Ȼ.IsSameConstructAs(Me)){var ˋ=Ȼ as IMySolarPanel;if(!Ʃ.Contains(ˋ))Ʃ.Add(ˋ);}else if(Ȼ is IMyReactor){var ˌ=Ȼ as IMyReactor;if(!ŭ.Contains(ˌ))ŭ.Add(ˌ);}else if(Ȼ is IMyGasGenerator){var ˍ=Ȼ as IMyGasGenerator;if(!ū.Contains(ˍ))ū.Add(ˍ);}else if(Ȼ is IMyGasTank){var ˎ=Ȼ as IMyGasTank;if(ˎ.BlockDefinition.SubtypeId.Contains("Hydrogen")){if(!ť.Contains(ˎ))ť.Add(ˎ);}else{if(!Ŧ.Contains(ˎ))Ŧ.Add(ˎ);}}else if(Ȼ is IMyCargoContainer&&Ȼ.IsSameConstructAs(Me)){var ȉ=Ȼ as IMyCargoContainer;if(!Ɲ.Contains(ȉ)){Ɲ.Add(ȉ);string ɛ=ȉ.BlockDefinition.SubtypeId;if(ɛ.Contains("LargeContainer"))ƞ.Add(ȉ);else if(ɛ.Contains("MediumContainer"))Ɵ.Add(ȉ);else Ơ.Add(ȉ);}}else if(Ȼ is IMyRefinery){var ˏ=Ȼ as IMyRefinery;if(!Ƨ.Contains(ˏ))Ƨ.Add(ˏ);}else if(Ȼ is IMyAssembler){var ː=Ȼ as IMyAssembler;if(!ƨ.Contains(ː))ƨ.Add(ː);}else if(Ȼ is IMyPowerProducer){var ˇ=Ȼ as IMyPowerProducer;if(ˇ.BlockDefinition.SubtypeId.Contains("Wind")&&!ƪ.Contains(ˇ))ƪ.Add(ˇ);}}
    ơ=Ƣ=ƣ=Ƥ=ƥ=Ʀ=null;string ˑ=$"[pad{Ć}".ToLower();
    Ɲ.Sort((Ƞ,ǹ)=>{string ˠ=Ƞ.BlockDefinition.SubtypeId,ˡ=ǹ.BlockDefinition.SubtypeId;int ˢ=ˠ.Contains("Large")?0:ˠ.Contains("Medium")?1:2,ˣ=ˡ.Contains("Large")?0:ˡ.Contains("Medium")?1:2;return ˢ-ˣ;});
    foreach(var ʜ in Ɲ){string Ș=ʜ.CustomName.ToLower().Replace(" ","");bool ˤ=Ć==0||Ș.Contains(ˑ),ʙ=false;for(int Ǵ=1;Ǵ<=8;Ǵ++)if(Ǵ!=Ć&&Ș.Contains($"[pad{Ǵ}"))ʙ=true;if(ʙ)continue;if(Ș.Contains("-ore")&&ˤ&&Ƣ==null)Ƣ=ʜ;else if(Ș.Contains("-ingot")&&ˤ&&ƣ==null)ƣ=ʜ;else if(Ș.Contains("-comp")&&ˤ&&Ƥ==null)Ƥ=ʜ;else if(Ș.Contains("-tools")&&ˤ&&ơ==null)ơ=ʜ;else if(Ș.Contains("-ammo")&&ˤ&&ƥ==null)ƥ=ʜ;else if(Ș.Contains("-bottle")&&ˤ&&Ʀ==null)Ʀ=ʜ;}
    if(Ţ.Count>0){float ʜ=0,ʑ=0;foreach(var ǹ in Ţ){ʜ+=ǹ.CurrentStoredPower;ʑ+=ǹ.MaxStoredPower;}è=ʑ>0?(ʜ/ʑ)*100:0;}else è=0;
    if(ť.Count>0){float ɻ=0;foreach(var ʡ in ť)ɻ+=(float)ʡ.FilledRatio;é=(ɻ/ť.Count)*100;}else é=0;
    if(Ŧ.Count>0){float ɻ=0;foreach(var ˬ in Ŧ)ɻ+=(float)ˬ.FilledRatio;ê=(ɻ/Ŧ.Count)*100;}else ê=0;
    if(Ɲ.Count>0){float ʜ=0,ʑ=0;foreach(var Ɋ in Ɲ){var ɮ=Ɋ.GetInventory();if(ɮ!=null){ʜ+=(float)ɮ.CurrentVolume;ʑ+=(float)ɮ.MaxVolume;}}ë=ʑ>0?(ʜ/ʑ)*100:0;}else ë=0;
    ì=0;í=0;
    foreach(var ɸ in Ʃ){ì+=ˮ(ɸ);í+=ɸ.MaxOutput;}
    foreach(var Ͱ in ŭ){ì+=ˮ(Ͱ);í+=Ͱ.MaxOutput;}
    foreach(var ǳ in ƪ){ì+=ˮ(ǳ);í+=ǳ.MaxOutput;}
    ċ=0;foreach(var Ͱ in ŭ){var ͱ=Ͱ.GetInventory();if(ͱ!=null)foreach(var ʦ in Ͳ(ͱ))if(ʦ.Type.SubtypeId=="Uranium")ċ+=(int)ʦ.Amount;}
    Ċ=0;if(ǘ.ContainsKey("Ice"))Ċ=ǘ["Ice"];foreach(var Ɋ in ū){if(Ɋ.CubeGrid!=Me.CubeGrid)continue;var ͱ=Ɋ.GetInventory();if(ͱ!=null)foreach(var ʦ in Ͳ(ͱ))if(ʦ.Type.SubtypeId=="Ice")Ċ+=(int)ʦ.Amount;}
    Ė=Ɯ!=null?Ɯ.BuildableBlocksCount:0;
    ė=Ɯ!=null?(Ɯ.RemainingBlocks-Ɯ.BuildableBlocksCount):0;
    }
    void ʹ(){
    Ƙ.Clear();ƙ.Clear();ƚ.Clear();ƛ.Clear();Ɯ=null;
    if(Ć==0)Ć=1;
    string ͳ=$"[PAD{Ć}-PRINT]";
    var ʹ=new List<IMyTerminalBlock>();
    GridTerminalSystem.GetBlocksOfType(ʹ,ǹ=>ǹ.CustomName.Contains(ͳ));
    foreach(var ǹ in ʹ){
    if(ǹ is IMyPistonBase){var Ǵ=ǹ as IMyPistonBase;Ƙ.Add(Ǵ);string ǻ=ǹ.CustomName.ToUpper();if(ǻ.Contains("VERT")||ǻ.Contains("] V"))ƙ.Add(Ǵ);else if(ǻ.Contains("HORIZ")||ǻ.Contains("] H"))ƚ.Add(Ǵ);}
    if(ǹ is IMyShipWelder)ƛ.Add(ǹ as IMyShipWelder);
    if(ǹ is IMyProjector&&Ɯ==null)Ɯ=ǹ as IMyProjector;
    }
    if(!Ä){
    bool Ͷ=Ĵ!=null&&Ĵ.IsConnected;
    if(Ͷ){foreach(var ǳ in ƛ)ǳ.Enabled=false;Å=false;return;}
    if(Å){
    foreach(var ǳ in ƛ)ǳ.Enabled=false;
    bool ͷ=true;
    foreach(var Ǵ in Ƙ){if(Ǵ.CurrentPosition>0.05f)ͷ=false;}
    if(ͷ){foreach(var Ǵ in Ƙ)Ǵ.Velocity=0;Å=false;}
    return;}
    bool ͺ=Ɯ!=null&&Ɯ.RemainingBlocks>0;
    if(ƙ.Count==0||ƚ.Count==0){
    foreach(var ǳ in ƛ)ǳ.Enabled=false;
    return;}
    bool ͻ=false;
    foreach(var Ǵ in Ƙ){if(Ǵ.CurrentPosition>0.1f)ͻ=true;}
    if(ͺ&&ͻ){
    Ä=true;Ă=2;d=K.C;
    foreach(var ǳ in ƛ)ǳ.Enabled=true;
    foreach(var Ǵ in Ƙ)Ǵ.Velocity=-ß;
    if(Ɯ!=null)Ɯ.Enabled=true;
    if(Ĵ!=null)Ĵ.Enabled=true;
    }else{
    foreach(var ǳ in ƛ)ǳ.Enabled=false;
    bool ͼ=false;
    foreach(var Ǵ in Ƙ){if(Ǵ.CurrentPosition>0.1f||Ǵ.Velocity!=0)ͼ=true;}
    if(ͼ){foreach(var Ǵ in Ƙ){Ǵ.Velocity=-1f;}}
    else{foreach(var Ǵ in Ƙ)Ǵ.Velocity=0;}
    }}
    }
        
    void ʻ(){
    u=Ĵ!=null&&Ĵ.IsConnected;
    v=ͽ(Ķ);
    if(!u||Ĵ==null){w=false;ĵ=null;return;}
    var ʲ=new List<IMyShipMergeBlock>();
    GridTerminalSystem.GetBlocksOfType(ʲ,ǹ=>ǹ.IsConnected&&ǹ!=Ĵ);
    if(ʲ.Count==0){w=false;ĵ=null;return;}
    ĵ=ʲ[0];
    ķ=null;ĸ=null;Ż=null;ŝ=null;
    š.Clear();ţ.Clear();Ť.Clear();ŧ.Clear();Ũ.Clear();Ū.Clear();Ŭ.Clear();Ů.Clear();Ű.Clear();Ų.Clear();Ŵ.Clear();Ŷ.Clear();Ÿ.Clear();Ź.Clear();
    w=false;Ñ=0;Ò=0;Ó=0;t=false;
    var ʹ=new List<IMyTerminalBlock>();
    var Ά=new List<IMyShipConnector>();
    GridTerminalSystem.GetBlocksOfType(ʹ);
    Vector3D ʾ=Ĵ.GetPosition();
    Vector3D Έ=ĵ.GetPosition();
    Vector3D Ή=ɪ(Έ-ʾ);
    bool Ί=ĵ.CubeGrid==Ĵ.CubeGrid;
    foreach(var ǹ in ʹ){
    string Ό=ǹ.CustomName;
    if(Ό.Contains("-PRINT"))continue;
    bool Ύ=(Ό.Contains(ō)||Ό.Contains("[PAD"))&&!Ό.Contains("Missile");
    if(Ύ)continue;
    if(ǹ==Ĵ||ǹ==Ķ||ǹ==Me)continue;
    if(!Ί&&ǹ.CubeGrid!=ĵ.CubeGrid)continue;
    Vector3D Ώ=ǹ.GetPosition()-ʾ;
    double ΐ=Vector3D.Dot(Ώ,Ή);
    if(ΐ<0)continue;
    w=true;
    if(ǹ is IMyShipConnector){var ʘ=ǹ as IMyShipConnector;if(ʘ.CustomName.Contains("[DOCK]"))ķ=ʘ;else if(ʘ.CustomName.Contains("[AMMO]"))ĸ=ʘ;else Ά.Add(ʘ);}
    if(ǹ is IMyRemoteControl&&Ż==null)Ż=ǹ as IMyRemoteControl;
    if(ǹ is IMyBatteryBlock)š.Add(ǹ as IMyBatteryBlock);
    if(ǹ is IMyGasTank){var ɻ=ǹ as IMyGasTank;if(ɻ.BlockDefinition.SubtypeId.Contains("Hydrogen"))ţ.Add(ɻ);else Ť.Add(ɻ);}
    if(ǹ is IMyWarhead)ŧ.Add(ǹ as IMyWarhead);
    if(ǹ is IMyThrust)Ũ.Add(ǹ as IMyThrust);
    if(ǹ is IMyGasGenerator)Ū.Add(ǹ as IMyGasGenerator);
    if(ǹ is IMyReactor)Ŭ.Add(ǹ as IMyReactor);
    if(ǹ is IMyGyro)Ů.Add(ǹ as IMyGyro);
    if(ǹ is IMySensorBlock)Ű.Add(ǹ as IMySensorBlock);
    if(ǹ is IMyCameraBlock)Ų.Add(ǹ as IMyCameraBlock);
    if(ǹ is IMyRadioAntenna)Ŵ.Add(ǹ as IMyRadioAntenna);
    if(ǹ is IMyLaserAntenna)Ŷ.Add(ǹ as IMyLaserAntenna);
    if(ǹ is IMyCockpit)Ÿ.Add(ǹ as IMyCockpit);
    if(ǹ is IMyLightingBlock&&Ό.Contains("Missile"))Ź.Add(ǹ as IMyLightingBlock);
    if(ǹ is IMyProgrammableBlock&&ǹ!=Me&&ŝ==null){string Α=ǹ.CustomName;if(!Α.Contains("[PAD")||Α.Contains("Missile"))ŝ=ǹ as IMyProgrammableBlock;}
    }
    if(Ά.Count>0&&Ķ!=null){
    Vector3D Β=Ķ.GetPosition();
    IMyShipConnector ʳ=null;
    double Γ=double.MaxValue;
    foreach(var ʜ in Ά){
    double ȅ=Ɂ(ʜ.GetPosition(),Β);
    if(ȅ<Γ){Γ=ȅ;ʳ=ʜ;}
    }
    if(ʳ!=null&&ķ==null)ķ=ʳ;
    foreach(var ʜ in Ά){if(ʜ!=ķ&&ĸ==null)ĸ=ʜ;}
    }
    Ö=Ø=0;if(š.Count>0){foreach(var ǹ in š){Ö+=ǹ.CurrentStoredPower;Ø+=ǹ.MaxStoredPower;}Ñ=Ø>0?(Ö/Ø)*100:0;}
    Ù=Ú=0;if(ţ.Count>0){foreach(var ʡ in ţ){Ú+=ʡ.Capacity;Ù+=ʡ.Capacity*(float)ʡ.FilledRatio;}Ò=Ú>0?(Ù/Ú)*100:0;}
    Û=Ü=Ó=0;if(Ť.Count>0){foreach(var ˬ in Ť){Ü+=ˬ.Capacity;Û+=ˬ.Capacity*(float)ˬ.FilledRatio;}Ó=Ü>0?(Û/Ü)*100:0;}
    Ý=Þ=Ô=0;
    if(Ū.Count>0){foreach(var Ɋ in Ū){var ͱ=Ɋ.GetInventory();if(ͱ!=null){Ý+=(float)ͱ.CurrentVolume;Þ+=(float)ͱ.MaxVolume;}}Ô=Þ>0?(Ý/Þ)*100:0;}
    Õ=0;ǡ=0;
    if(ĸ!=null){var Δ=ĸ.GetInventory();if(Δ!=null){float Ε=(float)Δ.CurrentVolume;float Ζ=(float)Δ.MaxVolume;Õ=Ζ>0?(Ε/Ζ)*100:0;ǡ=(int)Δ.GetItemAmount(Ǭ);}}
    if(ŧ.Count>0){t=true;foreach(var ǳ in ŧ)if(!ǳ.IsArmed){t=false;break;}}
    if(d==K.I)t=false;
    if(t&&d!=K.J&&d!=K.H){foreach(var ǳ in ŧ)ǳ.IsArmed=false;t=false;}
    ñ=0;ò=0;ó=0;
    foreach(var ɻ in Ũ){string Η=ɻ.BlockDefinition.SubtypeId;if(Η.Contains("Atmospheric"))ñ++;else if(Η.Contains("Hydrogen"))ò++;else ó++;}
    Θ();
    if(w){if(ĵ!=null)ĵ.Enabled=true;if(Ĵ!=null)Ĵ.Enabled=true;}
    }
        
    void Θ(){
    Ƌ.Clear();
    var Ι=new List<IMyRadioAntenna>();
    GridTerminalSystem.GetBlocksOfType(Ι,Ƞ=>Ƞ.CubeGrid!=Me.CubeGrid&&Ƞ.EnableBroadcasting&&Ƞ.IsBroadcasting);
    foreach(var Ƞ in Ι){
    string ǻ=Ƞ.CustomName;
    if(ǻ.Length>15)ǻ=ǻ.Substring(0,15);
    if(!Ƌ.Contains(ǻ))Ƌ.Add(ǻ);}
    }
        
    void ʼ(){
    Ɗ.Clear();Ń="";
    string ȅ=Ŝ!=null?Ŝ.CustomData:"";if(string.IsNullOrEmpty(ȅ))return;
    var Κ=System.Globalization.NumberStyles.Any;var Λ=System.Globalization.CultureInfo.InvariantCulture;
    foreach(var Μ in ȅ.Split('\n')){string ɐ=Μ.Trim();if(ɐ.StartsWith(";"))continue;if(!ɐ.StartsWith("GPS:"))continue;Ń+=ɐ+"\n";var Ǵ=ɐ.Split(':');if(Ǵ.Length>=5){double Ȼ,ȼ,Ƚ;if(double.TryParse(Ǵ[2].Replace(',','.'),Κ,Λ,out Ȼ)&&double.TryParse(Ǵ[3].Replace(',','.'),Κ,Λ,out ȼ)&&double.TryParse(Ǵ[4].Replace(',','.'),Κ,Λ,out Ƚ))Ɗ.Add(new MyWaypointInfo(Ǵ[1],new Vector3D(Ȼ,ȼ,Ƚ)));}}}
    void ǲ(){ʼ();var ȅ=Me.CustomData;int ǹ=ȅ.IndexOf("[BLACKBOX]");string Ν=ǹ>=0?ȅ.Substring(0,ǹ):(ȅ.EndsWith("\n")?ȅ:ȅ+"\n");if(!Ν.Contains("[SYSTEM]"))Ν=$"[SYSTEM]\npad_ready=true\npad_session={Ǿ}\n"+Ν;Me.CustomData=Ν+"[BLACKBOX]\n"+ł+"\n[GPS]\n"+Ń;}
    void ɕ(string Ξ){string ɍ=ȿ.ToString("HH:mm:ss");ł+=$"{ɍ}|PAD:{Ξ}\n";if(ł.Length>2000){int ɏ=ł.IndexOf('\n',300);if(ɏ>0)ł=ł.Substring(ɏ+1);}ǲ();}
    void Ȧ(){if(d!=ő){ő=d;string Ο=d==K.D?"BUILD":d==K.E?"DOCKED":d==K.F?"FUELING":d==K.G?"READY":d==K.H?"ARMED":d==K.I?"LAUNCHING":d==K.J?"AWAY":"";if(Ο!="")ɕ(Ο);}}
    void ȧ(){string ǿ=Me.CustomData;string Π=d==K.J?ŉ:d==K.H?"ARMED":d==K.G?"READY":d==K.F?"FUELING":d==K.E?"DOCKING":d==K.D?"BUILD":d==K.C?"PRINT":w?"DOCKED":"IDLE";int Ρ=d==K.H||t?1:0,Σ=d==K.G?1:0,Τ=d==K.J?1:0;double Υ=Œ,Φ=ŕ,Χ=Ŕ,Ψ=ř;if(d!=K.J&&w){Χ=Ò;Ψ=0;if(Ż!=null){Vector3D Ω=Ż.GetPosition();double Ϊ=0;if(Ż.TryGetPlanetElevation(MyPlanetElevation.Sealevel,out Ϊ))Υ=Ϊ;else Υ=Ω.Length();}if(y)Φ=Ɂ(Ż!=null?Ż.GetPosition():Me.GetPosition(),ƅ);}int Ϋ=Math.Max(0,Ǣ-ǡ);bool ά=v&&ĸ!=null&&Ϋ>0&&(d==K.F||d==K.E);
    string έ=$"msl_phase={Π}|target={Ň}|mslDist={Φ:F0}|mslSpeed={Ψ:F0}|mslAlt={Υ:F0}|mslFuel={Χ:F0}|mslBatPct={Ñ:F0}|mslH2Pct={Ò:F0}|mslO2Pct={Ó:F0}|mslCount={Τ}|mslArmed={Ρ}|mslReady={Σ}|conLocked={(v?1:0)}|warArmed={(t?1:0)}|warCount={ŧ.Count}|mslAmmo={ǡ}|mslAmmoLoad={Ǣ}|mslGenCnt={Ū.Count}|mslH2Cnt={ţ.Count}|mslO2Cnt={Ť.Count}|mslIce={(int)Ô}|mslUran=0|ammoReq={(ά?1:0)}|ammoReqType={Ǥ}|ammoReqNeed={Ϋ}";if(!ǿ.Contains("[PAD_DATA]"))ǿ+="[PAD_DATA]\n";int ή=ǿ.IndexOf("msl_phase=");if(ή>=0){int ί=ǿ.IndexOf("\n",ή);if(ί<0)ί=ǿ.Length;ǿ=ǿ.Remove(ή,ί-ή);ǿ=ǿ.Insert(ή,έ);}else{int Ȑ=ǿ.IndexOf("[PAD_DATA]")+10;int ΰ=ǿ.IndexOf("\n",Ȑ);if(ΰ<0)ΰ=ǿ.Length;ǿ=ǿ.Insert(ΰ,"\n"+έ);}Me.CustomData=ǿ;}
        
    void ȥ(){
    if(Ĵ==null||Ķ==null){d=K.A;return;}
    if(ĳ&&!Ĵ.IsConnected){d=K.B;return;}
    if(!u&&d!=K.J&&d!=K.C){if(d==K.I||d==K.H){d=K.J;h=0;}else if(!Ä)d=K.B;}
    if(d==K.J||d==K.C)return;
    switch(d){
    case K.A:case K.B:
    if(Ä){d=K.C;return;}
    if(!w){if(Ɯ!=null)Ɯ.Enabled=true;Æ=false;return;}
    if(Ɯ!=null)Ɯ.Enabled=false;
    if(!Æ){d=K.D;return;}
    if(u){if(!Ç){ą++;α();β();Ç=true;}if(Ķ!=null)Ķ.Enabled=true;d=K.E;µ=false;}
    break;
    case K.D:
    if(Ɯ!=null&&Ɯ.RemainingBlocks>0&&!Å){Æ=false;return;}
    if(!Ç){ą++;α();Ç=true;}
    β();
    γ();
    if(ĵ!=null)ĵ.Enabled=true;
    if(Ĵ!=null)Ĵ.Enabled=true;
    if(Ķ!=null)Ķ.Enabled=true;
    if(Ɯ!=null)Ɯ.Enabled=false;
    Æ=true;d=K.E;
    break;
    case K.E:
    if(!w){d=K.B;k=0;return;}
    k++;
    if(k>300){d=K.B;k=0;break;}
    if(Ķ!=null)Ķ.Enabled=true;
    if(!v&&Ķ.Status==MyShipConnectorStatus.Connectable)Ķ.Connect();
    δ();
    if(v){γ();j=0;k=0;d=K.F;}
    break;
    case K.F:
    foreach(var ʡ in ţ){ʡ.Enabled=true;ʡ.Stockpile=true;}
    j++;
    if(j>600){if(ͽ(Ķ))Ķ.Disconnect();d=K.G;break;}
    if(v){
    Action<IMyCargoContainer>ν=ȍ=>{if(ȍ==null)return;var ε=ȍ.GetInventory();if(ε==null)return;
    for(int ɮ=ε.ItemCount-1;ɮ>=0;ɮ--){var ζ=ε.GetItemAt(ɮ);if(!ζ.HasValue)continue;string η=ζ.Value.Type.SubtypeId;
    if(η.Contains("Ice"))foreach(var θ in Ū){var ι=θ.GetInventory();if(ι!=null)ε.TransferItemTo(ι,ɮ,null,true,null);}
    if(η=="Uranium"&&Ŭ.Count>0)foreach(var Ͱ in Ŭ){var κ=Ͱ.GetInventory();if(κ!=null){int λ=0;var μ=new List<MyInventoryItem>();κ.GetItems(μ);foreach(var Ȼ in μ)if(Ȼ.Type.SubtypeId=="Uranium")λ+=(int)Ȼ.Amount;if(λ<50)ε.TransferItemTo(κ,ɮ,null,true,(MyFixedPoint)Math.Min(50-λ,(int)ζ.Value.Amount));}}}};
    ν(Ƣ);ν(ƣ);foreach(var ȍ in Ɲ)ν(ȍ);}
    if(ĸ!=null&&Ǣ>0){var ξ=ĸ.GetInventory();if(ξ!=null){ǡ=(int)ξ.GetItemAmount(Ǭ);int ο=Ǣ-ǡ;if(ο>0&&Ǟ>0){var π=Ķ.GetInventory();if(π!=null){Action<IMyCargoContainer>ς=ʜ=>{if(ο<=0||ʜ==null)return;var ρ=ʜ.GetInventory();if(ρ==null)return;var ʦ=new List<MyInventoryItem>();ρ.GetItems(ʦ);for(int ɮ=ʦ.Count-1;ɮ>=0&&ο>0;ɮ--)if(ʦ[ɮ].Type==Ǭ){int Ƞ=Math.Min((int)ʦ[ɮ].Amount,ο);ρ.TransferItemTo(π,ʦ[ɮ],(MyFixedPoint)Ƞ);ο-=Ƞ;}};ς(ƥ);ς(ơ);foreach(var ʜ in Ɲ)ς(ʜ);var σ=new List<MyInventoryItem>();π.GetItems(σ);for(int ɮ=σ.Count-1;ɮ>=0;ɮ--)if(σ[ɮ].Type==Ǭ)π.TransferItemTo(ξ,σ[ɮ],null);}}}}
    bool τ=Ñ>=100f||š.Count==0;
    bool υ=Ò>=100f||ţ.Count==0;
    bool φ=Ó>=100f||Ť.Count==0;
    bool χ=Ô>=100||Ū.Count==0;
    int ψ=0;foreach(var Ͱ in Ŭ){var κ=Ͱ.GetInventory();if(κ!=null){var μ=new List<MyInventoryItem>();κ.GetItems(μ);foreach(var Ȼ in μ)if(Ȼ.Type.SubtypeId=="Uranium")ψ+=(int)Ȼ.Amount;}}
    bool ω=Ŭ.Count==0||ψ>=50;
    ǡ=0;
    if(ĸ!=null){var ϊ=ĸ.GetInventory();if(ϊ!=null)ǡ=(int)ϊ.GetItemAmount(Ǭ);}
    bool ϋ=Ǣ<=0||ĸ==null||ǡ>=Ǣ||(Ǟ<=0&&ǡ>0);
    δ();
    if(τ&&υ&&φ&&χ&&ω&&ϋ){
    if(ͽ(Ķ))Ķ.Disconnect();
    d=K.G;
    }
    break;
    case K.G:ª=false;δ();break;
    case K.H:
    δ();
    if(ª){
    int ɦ=(int)(ȿ-ž).TotalSeconds;
    if(ù==0||ɦ>=ù){ɡ();ª=false;}
    }
    break;
    case K.I:
    i++;
    if(Ķ!=null){Ķ.Disconnect();Ķ.Enabled=false;Ķ.CollectAll=false;}
    if(Ĵ!=null&&Ĵ.Enabled)Ĵ.Enabled=false;
    if(ĵ!=null&&ĵ.Enabled)ĵ.Enabled=false;
    if(Ĵ==null||!Ĵ.IsConnected){
    if(ŷ.Count>0&&ĵ!=null){
    Vector3D Ɔ=ĵ.GetPosition();
    foreach(var ɐ in ŷ){ɐ.Enabled=true;ɐ.SetTargetCoords($"GPS:MSL:{Ɔ.X:F0}:{Ɔ.Y:F0}:{Ɔ.Z:F0}:");ɐ.Connect();}}
    if(Ķ!=null)Ķ.Enabled=true;
    if(Ĵ!=null)Ĵ.Enabled=true;
    d=K.J;h=0;}
    else if(i>10){if(Ķ!=null)Ķ.Enabled=true;if(Ĵ!=null)Ĵ.Enabled=true;d=K.J;h=0;}
    break;
    }}
        
    void ɟ(){
    ό();
    if(ĸ!=null){ĸ.ThrowOut=true;ĸ.CollectAll=false;}
    ž=ȿ;
    ª=true;
    d=K.H;
    }
        
    void ʮ(){
    if(ĸ!=null){ĸ.ThrowOut=false;}
    if(d==K.H)d=K.G;
    }
        
    void ɡ(){
    for(int ɮ=0;ɮ<16;ɮ++){ƒ[ɮ]=0;Ɠ[ɮ]=0;Ɣ[ɮ]=0;}
    ā=0;ř=0;
    foreach(var ǳ in ŧ){ǳ.IsArmed=false;}
    t=false;
    foreach(var Ƞ in ŵ){Ƞ.Enabled=true;Ƞ.Radius=75000f;Ƞ.EnableBroadcasting=true;}
    Ž=ȿ;
    string ύ="";
    if(ŷ.Count>0){var ώ=ŷ[0].GetPosition();ύ=$"\nPadLaser={ώ.X:F0},{ώ.Y:F0},{ώ.Z:F0}";}
    if(ŝ!=null){
    bool Ϗ=þ==1?false:!s;
    string ϐ="";
    if(f==X.W){if(ģ==0&&Ĥ==0){ģ=ġ;Ĥ=Ģ;ʎ();}int ϑ=ą*100+Ć;ϐ=$"\nSatID={ϑ}\nSatGridX={ģ}\nSatGridZ={Ĥ}\nGridSpacing={ś:F0}\nInterceptDist=10\nSatAlt=62000";if(ƈ!=Vector3D.Zero)ϐ+=$"\nGPS={ƈ.X:F0},{ƈ.Y:F0},{ƈ.Z:F0}";ģ=0;Ĥ=0;}
    string ϒ=$"[UNITY_MISSILE]\nMode={f}\nGPS={ƅ.X},{ƅ.Y},{ƅ.Z}\nAntenna={ņ}\nBroadcast={ň}\nClimb={ö}\nDetonate={ø}\nSensorRange={ú}\nLidarRange={û}\nLidarAngle={ü}\nAntBroadcast={(z?"1":"0")}\nInSpace={(Ϗ?"1":"0")}\nGravity={İ:F2}\nReentryDist={ý}\nFlightMode={þ}{ύ}\nMslNumber={ą}\nPadID={Ć}\nTargetRel={ÿ}{ϐ}";
    ŝ.CustomData=ϒ;
    ŝ.TryRun("LAUNCH");
    }
    foreach(var ɻ in Ũ){ɻ.Enabled=true;ɻ.ThrustOverridePercentage=1f;}
    foreach(var Ɋ in Ů){Ɋ.Enabled=true;Ɋ.GyroOverride=true;}
    if(Ż!=null){Ż.IsMainCockpit=true;Ż.ControlThrusters=true;Ż.DampenersOverride=false;}
    if(Ķ!=null){Ķ.Disconnect();Ķ.Enabled=false;Ķ.CollectAll=false;Ķ.ThrowOut=false;}
    if(Ĵ!=null)Ĵ.Enabled=false;
    if(ĵ!=null)ĵ.Enabled=false;
    º=true;i=0;ń="";
    string ϓ=f==X.R?"GPS":f==X.S?"ANT":f==X.T?"SNS":f==X.U?"LDR":f==X.W?"SAT":"MAN";
    ɕ($"LAUNCH>{Ň} M:{ϓ} G:{ƅ.X:F0},{ƅ.Y:F0},{ƅ.Z:F0}");
    d=K.I;
    }
        
    void ɂ(bool ϔ=false){
    if(d!=K.J){Echo("DETONATE BLOCKED: Not in flight");return;}
    if(!ϔ&&(ȿ-Ž).TotalSeconds<10){Echo("DETONATE BLOCKED: 10s grace period");return;}
    foreach(var Ƞ in ŵ){Ƞ.Enabled=true;Ƞ.Radius=75000f;Ƞ.EnableBroadcasting=true;}
    IGC.SendBroadcastMessage(ň+"_CMD",$"DETONATE:{Ć}");
    ɕ("ABORT_CMD_SENT");
    }
        
    void γ(){foreach(var ɻ in Ũ){ɻ.Enabled=false;ɻ.ThrustOverridePercentage=0f;}foreach(var Ɋ in Ů){Ɋ.GyroOverride=false;Ɋ.Enabled=false;}foreach(var Ȼ in Ū)Ȼ.Enabled=false;foreach(var ǹ in š)ǹ.ChargeMode=ChargeMode.Recharge;foreach(var ǳ in ŧ)ǳ.IsArmed=false;foreach(var Ƞ in Ŵ){Ƞ.Enabled=true;Ƞ.Radius=75000f;Ƞ.EnableBroadcasting=true;}foreach(var ɸ in Ű)ɸ.Enabled=false;foreach(var ʜ in Ų)ʜ.Enabled=true;foreach(var ʡ in ţ){ʡ.Enabled=true;ʡ.Stockpile=true;}foreach(var ˬ in Ť){ˬ.Enabled=true;ˬ.Stockpile=true;}}
    void ʰ(){
    γ();
    if(ĵ!=null)ĵ.Enabled=true;
    if(ŝ!=null)ŝ.TryRun("RESET");
    IGC.SendBroadcastMessage(ň+"_CMD",$"RESET:{Ć}");
    ɕ("MSL_RESET");
    }
    void ό(){foreach(var ɻ in Ũ){ɻ.Enabled=true;ɻ.ThrustOverridePercentage=0f;}foreach(var Ɋ in Ů){Ɋ.Enabled=true;Ɋ.GyroOverride=false;}foreach(var Ȼ in Ū)Ȼ.Enabled=true;foreach(var ǹ in š)ǹ.ChargeMode=ChargeMode.Discharge;foreach(var ʡ in ţ)ʡ.Stockpile=false;foreach(var ˬ in Ť)ˬ.Stockpile=false;foreach(var Ƞ in Ŵ){Ƞ.Enabled=true;Ƞ.Radius=75000f;Ƞ.EnableBroadcasting=true;}foreach(var ɸ in Ű)ɸ.Enabled=true;foreach(var ʜ in Ų){ʜ.Enabled=true;ʜ.EnableRaycast=true;}}
    bool ϕ=false;
    void δ(){
    if(u){ϕ=Ŵ.Count>0;return;}
    if(ŷ.Count==0||Ŷ.Count==0){ϕ=false;return;}
    var ϖ=ŷ[0];var ϗ=Ŷ[0];
    Vector3D Ϙ=ϖ.GetPosition();Vector3D ϙ=ϗ.GetPosition();
    ϖ.Enabled=true;ϗ.Enabled=true;
    ϖ.SetTargetCoords($"GPS:MSL:{ϙ.X:F0}:{ϙ.Y:F0}:{ϙ.Z:F0}:");
    ϗ.SetTargetCoords($"GPS:PAD:{Ϙ.X:F0}:{Ϙ.Y:F0}:{Ϙ.Z:F0}:");
    if(ϖ.Status!=MyLaserAntennaStatus.Connected)ϖ.Connect();
    if(ϗ.Status!=MyLaserAntennaStatus.Connected)ϗ.Connect();
    ϕ=ϖ.Status==MyLaserAntennaStatus.Connected||ϗ.Status==MyLaserAntennaStatus.Connected;
    if(ϕ){µ=true;ſ=ȿ;}
    }
        
    void ȵ(){
    if(Ź.Count==0&&ź.Count==0)return;
    Color ʜ=Color.Black;float Ϛ=1f,ϛ=1f,Ϝ=2f;bool ϝ=true;
    double Ϟ=(ȿ-DateTime.Today).TotalSeconds;
    bool ϟ=Ǟ<Ǣ||é<50||Ċ<Đ;
    bool Ϡ=(ȿ-ż).TotalSeconds<5&&d==K.G;
    if(d==K.C||d==K.D){ʜ=new Color(255,165,0);ϝ=((int)Ϟ%2)==0;}
    else if(d==K.F||d==K.E){ʜ=new Color(0,100,255);float ϡ=(float)(Math.Sin(Ϟ*2)+1)/2;Ϛ=0.5f+ϡ*0.5f;ϛ=1f+ϡ;Ϝ=1f+ϡ*2f;}
    else if(Ϡ){ʜ=new Color(255,255,0);float ϡ=(float)(Math.Sin(Ϟ*3)+1)/2;Ϛ=0.3f+ϡ*0.7f;}
    else if(ϟ&&d!=K.H&&d!=K.I&&d!=K.J){ʜ=new Color(128,0,128);float ϡ=(float)(Math.Sin(Ϟ*2)+1)/2;Ϛ=0.3f+ϡ*0.7f;}
    else if(d==K.G){ʜ=new Color(0,255,0);Ϛ=1f;}
    else if(d==K.H){ʜ=new Color(255,0,0);int Ϣ=ª&&ù>0&&(ù-(int)(ȿ-ž).TotalSeconds)<5?4:2;ϝ=((int)(Ϟ*Ϣ)%2)==0;}
    else{ʜ=new Color(50,50,50);Ϛ=0.3f;}
    foreach(var ɐ in Ź){ɐ.Enabled=ϝ;ɐ.Color=ʜ;ɐ.Intensity=Ϛ;ɐ.Falloff=ϛ;ɐ.Radius=Ϝ;}
    foreach(var ɐ in ź){ɐ.Enabled=true;ɐ.Color=ʜ;}
    }
    void ȶ(){foreach(var ɐ in Ź)ɐ.Color=Color.White;foreach(var ɐ in ź)ɐ.Color=Color.White;Ź.Clear();}
        
    void β(){
    if(ĵ==null||Ĵ==null)return;
    Vector3D Έ=ĵ.GetPosition();
    Vector3D ϣ=Ĵ.GetPosition();
    Vector3D Ή=ɪ(Έ-ϣ);
    var Ϥ=new List<IMyShipConnector>();
    GridTerminalSystem.GetBlocksOfType(Ϥ);
    var Ά=new List<IMyShipConnector>();
    foreach(var ʜ in Ϥ){
    if(ʜ==Ķ)continue;
    string ǻ=ʜ.CustomName;
    if(ǻ.Contains("[PAD")||ǻ.ToUpper().Contains("ORE"))continue;
    Vector3D Ώ=ʜ.GetPosition()-ϣ;
    double ΐ=Vector3D.Dot(Ώ,Ή);
    if(ΐ>0)Ά.Add(ʜ);
    }
    if(Ά.Count==0)return;
    IMyShipConnector ϥ=null,Ϧ=null;
    double ϧ=double.MaxValue,Ϩ=0;
    Vector3D ϩ=Ķ!=null?Ķ.GetPosition():ϣ;
    foreach(var ʜ in Ά){
    double ȅ=Ɂ(ʜ.GetPosition(),ϩ);
    if(ȅ<ϧ){ϧ=ȅ;ϥ=ʜ;}
    if(ȅ>Ϩ){Ϩ=ȅ;Ϧ=ʜ;}
    }
    if(ϥ!=null)ϥ.CustomName=$"[PAD{Ć}] Missile #{ą} Connector [DOCK]";
    if(Ϧ!=null&&Ϧ!=ϥ)Ϧ.CustomName=$"[PAD{Ć}] Missile #{ą} Connector [AMMO]";
    }
        
    void α(){string ɻ=$"[PAD{Ć}] Missile #{ą}";Action<IMyTerminalBlock>ϫ=Ȼ=>Ȼ.CustomName=$"{ɻ} {Ϫ(Ȼ)}";foreach(var ǹ in š)ϫ(ǹ);foreach(var ʡ in ţ)ϫ(ʡ);foreach(var ǳ in ŧ)ϫ(ǳ);foreach(var Ȼ in Ũ)ϫ(Ȼ);foreach(var Ɋ in Ū)ϫ(Ɋ);foreach(var Ɋ in Ů)ϫ(Ɋ);foreach(var ɸ in Ű)ϫ(ɸ);foreach(var ʜ in Ų)ϫ(ʜ);foreach(var Ƞ in Ŵ)ϫ(Ƞ);foreach(var ɐ in Ŷ)ϫ(ɐ);foreach(var ʜ in Ÿ)ϫ(ʜ);for(int ɮ=0;ɮ<Ź.Count;ɮ++)Ź[ɮ].CustomName=$"{ɻ} Light {ɮ+1}";if(Ż!=null)ϫ(Ż);if(ŝ!=null)ŝ.CustomName=$"{ɻ} Program";if(ĵ!=null)ϫ(ĵ);}
    string Ϫ(IMyTerminalBlock ǹ){string ɸ=ǹ.BlockDefinition.SubtypeId;if(string.IsNullOrEmpty(ɸ)){if(ǹ is IMyGasGenerator)return"O2/H2 Gen";if(ǹ is IMyGasTank)return"Gas Tank";ɸ=ǹ.BlockDefinition.TypeIdString.Replace(Ɨ,"");}return ɸ.Contains("Battery")?"Battery":ɸ.Contains("HydrogenTank")?"H2 Tank":ɸ.Contains("OxygenTank")?"O2 Tank":ɸ.Contains("LargeContainer")?"Large Cargo":ɸ.Contains("MediumContainer")?"Medium Cargo":ɸ.Contains("SmallContainer")?"Small Cargo":ɸ.Contains("Refinery")?"Refinery":ɸ.Contains("Assembler")?"Assembler":ɸ.Contains("RadioAntenna")?"Antenna":ɸ.Contains("LaserAntenna")?"Laser Ant":ɸ.Contains("Gyro")?"Gyroscope":ɸ.Contains("HydrogenThrust")?"H2 Thruster":ɸ.Contains("AtmosphericThrust")?"Atmo Thruster":ɸ.Contains("Thrust")?"Ion Thruster":ɸ.Contains("Programmable")?"Program":ɸ.Contains("Merge")?"Merge Block":ɸ.Contains("Connector")?"Connector":ɸ.Contains("Projector")?"Projector":ɸ.Contains("Piston")?"Piston":ɸ.Contains("Camera")?"Camera":ɸ.Contains("Sensor")?"Sensor":ɸ.Contains("RemoteControl")?"Remote Control":ɸ.Contains("Warhead")?"Warhead":ɸ.Contains("ButtonPanel")?"Button Panel":ɸ.Contains("LCD")?"LCD Panel":ɸ.Contains("Reactor")?"Reactor":ɸ.Contains("Solar")?"Solar Panel":ɸ.Contains("Wind")?"Wind Turbine":ɸ.Contains("Medical")?"Medical Room":ɸ.Contains("Survival")?"Survival Kit":ɸ.Contains("Cryo")?"Cryo Chamber":ɸ.Contains("Cockpit")?"Cockpit":ɸ;}
    bool ˉ(IMyTerminalBlock ǹ){if(!u||ĵ==null)return false;bool Ί=ĵ.CubeGrid==Me.CubeGrid;if(Ί)return ǹ.CustomName.Contains("Missile #");return ǹ.CubeGrid==ĵ.CubeGrid;}
    string Ϭ(IMyShipConnector ʜ)=>ʜ==null?"N/A":ʜ.Status==MyShipConnectorStatus.Connected?"LOCK":"OPEN";
    void ϭ(IMyShipConnector ʜ){if(ʜ!=null){if(ʜ.Status==MyShipConnectorStatus.Connected)ʜ.Disconnect();else ʜ.Connect();}}
    bool ͽ(IMyShipConnector ʜ)=>ʜ!=null&&ʜ.Status==MyShipConnectorStatus.Connected;
    DateTime ȿ=>DateTime.Now;
    double Ɂ(Vector3D Ƞ,Vector3D ǹ)=>Vector3D.Distance(Ƞ,ǹ);
    Vector3D ɪ(Vector3D Ϯ)=>Vector3D.Normalize(Ϯ);
    void ȴ(){if(ş==null)ǽ();if(ş==null)return;string ȅ=ş.CustomData;if(string.IsNullOrEmpty(ȅ))return;
    Action<string,Action<string>>ϱ=(ϯ,ϰ)=>{int Ȑ=ȅ.IndexOf(ϯ);if(Ȑ<0)return;int ȑ=ȅ.IndexOf("\n[",Ȑ+ϯ.Length);string Ϟ=ȑ>0?ȅ.Substring(Ȑ,ȑ-Ȑ):ȅ.Substring(Ȑ);foreach(var Μ in Ϟ.Split('\n')){foreach(var ʦ in Μ.Split('|'))ϰ(ʦ);}};
    Func<string,int>ϳ=ɸ=>{int Ϯ=0;if(string.IsNullOrEmpty(ɸ))return 0;string ϲ=ɸ.Split('+')[0].Split('/')[0].Split('%')[0].Split(' ').FirstOrDefault(Ȼ=>Ȼ.Length>0&&char.IsDigit(Ȼ[0]))??"";int.TryParse(ϲ,out Ϯ);return Ϯ;};
    ϱ("[QUOTAS]",ʦ=>{if(!ʦ.Contains("="))return;var ʕ=ʦ.Split('=');if(ʕ.Length<2)return;string ϴ=ʕ[0].Trim().ToLower().Replace("_","").Replace(" ","");int Ϯ;if(!int.TryParse(ʕ[1].Trim(),out Ϯ))return;if(ϴ=="ammotarget"||ϴ=="tgt")ǟ=Ϯ;else if(ϴ=="pammotarget")Ǧ=Ϯ;else if(ϴ=="mslammotarget"||ϴ=="mslammo"||ϴ=="s10target"||ϴ=="s10")ǧ=Ϯ;else if(ϴ=="h2target")Ď=Ϯ;else if(ϴ=="o2target")ď=Ϯ;else if(ϴ=="tooltarget")ǥ=Ϯ;});
    ϱ("[STATUS]",ʦ=>{if(!ʦ.Contains("="))return;var ʕ=ʦ.Split('=');if(ʕ.Length<2)return;string ϴ=ʕ[0].Trim().ToLower().Replace(" ",""),ϵ=ʕ[1].Trim();int Ϸ;if(int.TryParse(ϵ,out Ϸ)){if(ϴ=="ammostock")Ǟ=Ϸ;else if(ϴ=="ammotype"&&Ϸ!=Ǥ){Ǥ=Ϸ;ǯ();}else if(ϴ=="ammoqueued")Ǡ=Ϸ;else if(ϴ=="cargol")n=Ϸ;else if(ϴ=="cargom")o=Ϸ;else if(ϴ=="cargos")p=Ϸ;}if(ϴ=="cargo"){int ή=ϵ.IndexOf('%');if(ή>0)float.TryParse(ϵ.Substring(0,ή),out î);}q=n+o+p;});
    ϱ("[BOTTLES]",ʦ=>{if(!ʦ.Contains("="))return;var ʕ=ʦ.Split('=');if(ʕ.Length<2)return;string ϴ=ʕ[0].Trim().ToLower(),Ϯ=ʕ[1];var ϸ=Ϯ.Split('+');int Ϲ=ϳ(ϸ[0]);int Ϻ=ϸ.Length>1?ϳ(ϸ[1]):0;if(ϴ.StartsWith("h")){Č=Ϲ;Ĕ=Ϻ;}else if(ϴ.StartsWith("o")){č=Ϲ;ĕ=Ϻ;}});
    ǘ.Clear();Ǚ.Clear();ǚ.Clear();Ǜ.Clear();
    ϱ("[ORE]",ʦ=>{if(!ʦ.Contains("="))return;var ʕ=ʦ.Split('=');if(ʕ.Length>=2){string ϴ=ʕ[0].Trim();int Ϯ=ϳ(ʕ[1]);if(ϴ.Length>0&&!ϴ.StartsWith("["))ǘ[ϴ]=Ϯ;}});
    ϱ("[COMPONENTS]",ʦ=>{if(!ʦ.Contains("="))return;var ʕ=ʦ.Split('=');if(ʕ.Length>=2){string ϴ=ʕ[0].Trim();if(ϴ.Length>0&&!ϴ.StartsWith("[")&&!ϴ.ToLower().Contains("item")&&!ϴ.ToLower().Contains("name")){string ϸ=ʕ[1];Ǚ[ϴ]=ϳ(ϸ);int Ȑ=ϸ.IndexOf('/');if(Ȑ>=0&&Ȑ+1<ϸ.Length){int ϻ;if(int.TryParse(ϸ.Substring(Ȑ+1).Split('|')[0].Split(' ')[0].Split('-')[0].Trim(),out ϻ))ǚ[ϴ]=ϻ;}}}});
    foreach(var ʕ in ǚ){int λ=0;if(Ǚ.ContainsKey(ʕ.Key))λ=Ǚ[ʕ.Key];if(λ<ʕ.Value)Ǜ[ʕ.Key]=ʕ.Value-λ;}
    ϼ();}
    void ϼ(){string ȅ=Me.CustomData;ǜ.Clear();ǝ.Clear();if(string.IsNullOrEmpty(ȅ)||!ȅ.Contains("[BLUEPRINT]"))return;int Ȑ=ȅ.IndexOf("[BLUEPRINT]");if(Ȑ<0)return;int ȑ=ȅ.IndexOf("\n[",Ȑ+11);string Ϟ=ȑ>0?ȅ.Substring(Ȑ,ȑ-Ȑ):ȅ.Substring(Ȑ);foreach(var Μ in Ϟ.Split('\n')){if(!Μ.Contains("="))continue;var ʕ=Μ.Split('=');if(ʕ.Length<2)continue;string ϴ=ʕ[0].Trim();if(ϴ.Length==0||ϴ.StartsWith("["))continue;int Ϯ;if(int.TryParse(ʕ[1].Trim(),out Ϯ)&&Ϯ>0)ǜ[ϴ]=Ϯ;}foreach(var ʕ in ǜ){int λ=Ǚ.ContainsKey(ʕ.Key)?Ǚ[ʕ.Key]:0;if(λ<ʕ.Value)ǝ[ʕ.Key]=ʕ.Value-λ;}}
    void ɞ(){ʹ();string σ=Ć>0?$"[PAD{Ć}-PRINT]":"[PRINT]";if(Ƙ.Count==0)return;if(ƛ.Count==0)return;if(Ɯ==null)return;if(Ĵ==null)return;if(Ĵ.IsConnected)return;if(Ä){ʯ();return;}Ĵ.Enabled=true;Å=false;Ä=true;Ă=0;d=K.C;Æ=false;Ç=false;ç=0;ă=0;if(ƙ.Count>0&&ƚ.Count>0){ä=1.4f;ã=10f;â=7.2f;foreach(var Ǵ in ƙ){Ǵ.MinLimit=0;Ǵ.MaxLimit=ä;Ǵ.Velocity=å;}foreach(var Ǵ in ƚ){Ǵ.MinLimit=0;Ǵ.Velocity=æ;}à=â;}else{à=0;foreach(var Ǵ in Ƙ){Ǵ.MinLimit=0f;Ǵ.Velocity=-0.5f;}}foreach(var ǳ in ƛ)ǳ.Enabled=false;if(Ɯ!=null)Ɯ.Enabled=true;if(Ĵ!=null)Ĵ.Enabled=true;}
    void ʯ(){Ä=false;Ă=0;Å=true;Æ=true;à=0;ç=0;ă=0;foreach(var Ǵ in ƙ){Ǵ.Velocity=-å;Ǵ.MinLimit=0;}foreach(var Ǵ in ƚ){Ǵ.Velocity=-æ;Ǵ.MinLimit=0;}foreach(var Ǵ in Ƙ){Ǵ.Velocity=-0.5f;Ǵ.MinLimit=0;}foreach(var ǳ in ƛ)ǳ.Enabled=false;if(Ɯ!=null)Ɯ.Enabled=false;d=K.B;IGC.SendBroadcastMessage("UNITY_PRINTER_ACK",$"{Ć}|COMPLETE|{ą}");}
    void Ȥ(){Ä=false;Ă=0;Å=true;à=0;ç=0;ă=0;foreach(var Ǵ in ƙ){Ǵ.Velocity=-å;Ǵ.MinLimit=0;}foreach(var Ǵ in ƚ){Ǵ.Velocity=-æ;Ǵ.MinLimit=0;}foreach(var Ǵ in Ƙ){Ǵ.Velocity=-0.5f;Ǵ.MinLimit=0;}foreach(var ǳ in ƛ)ǳ.Enabled=false;}
        
    void Ȩ(){if(!Ä)return;if(Ĵ!=null)Ĵ.Enabled=true;var Ͻ=new List<IMyShipMergeBlock>();GridTerminalSystem.GetBlocksOfType(Ͻ);foreach(var ʑ in Ͻ){if(ʑ!=Ĵ&&!ʑ.Enabled)ʑ.Enabled=true;}if(Ɯ==null||Ɯ.RemainingBlocks==0){ʯ();return;}if(ƙ.Count==0||ƚ.Count==0){Ͼ();return;}Func<float>Ͽ=()=>{float Ϯ=0;foreach(var Ǵ in ƙ)Ϯ+=Ǵ.CurrentPosition;return Ϯ/ƙ.Count;};Action Ѐ=()=>{à-=á;if(à<0)à=0;if(à<=0.05f){ʯ();return;}foreach(var Ǵ in ƚ){Ǵ.Velocity=-æ;}Ă=4;};switch(Ă){case 0:bool Ё=true,Ђ=true;foreach(var Ǵ in ƙ){Ǵ.MinLimit=0;float ȅ=Ǵ.CurrentPosition-ä;if(ȅ<-0.2f){Ǵ.Velocity=å;Ё=false;}else if(ȅ>0.2f){Ǵ.Velocity=-å;Ё=false;}else Ǵ.Velocity=0;}foreach(var Ǵ in ƚ){Ǵ.MinLimit=0;Ǵ.Velocity=æ;if(Ǵ.CurrentPosition<â-0.1f)Ђ=false;}if(Ё&&Ђ){à=â;foreach(var Ǵ in ƙ){Ǵ.MaxLimit=ã;Ǵ.Velocity=å;}foreach(var Ǵ in ƚ)Ǵ.Velocity=0;foreach(var ǳ in ƛ)ǳ.Enabled=true;Ă=1;}break;case 1:foreach(var Ǵ in ƙ)Ǵ.Velocity=å;float Ѓ=Ͽ();if(Math.Abs(Ѓ-ç)<0.01f)ă++;else ă=0;ç=Ѓ;if(ă>10){foreach(var Ǵ in ƙ)Ǵ.Velocity=0;ă=0;ç=0;Ѐ();break;}bool Є=true;foreach(var Ǵ in ƙ)if(Ǵ.CurrentPosition<ã-0.1f)Є=false;if(Є){foreach(var Ǵ in ƙ)Ǵ.Velocity=-å;ă=0;ç=0;Ă=2;}break;case 2:foreach(var Ǵ in ƙ)Ǵ.Velocity=-å;float Ѕ=Ͽ();if(Math.Abs(Ѕ-ç)<0.01f)ă++;else ă=0;ç=Ѕ;if(ă>10){foreach(var Ǵ in ƙ)Ǵ.Velocity=0;ă=0;ç=0;Ѐ();break;}bool І=true;foreach(var Ǵ in ƙ)if(Ǵ.CurrentPosition>0.1f)І=false;if(І){foreach(var Ǵ in ƙ)Ǵ.Velocity=å;ă=0;ç=0;Ă=3;}break;case 3:foreach(var Ǵ in ƙ)Ǵ.Velocity=å;float Ї=Ͽ();if(Math.Abs(Ї-ç)<0.01f)ă++;else ă=0;ç=Ї;bool Ј=true;foreach(var Ǵ in ƙ)if(Ǵ.CurrentPosition<ä-0.2f)Ј=false;if(Ј||ă>10){foreach(var Ǵ in ƙ)Ǵ.Velocity=0;ă=0;ç=0;Ѐ();}break;case 4:bool Љ=true;foreach(var Ǵ in ƚ)if(Ǵ.CurrentPosition>à+0.05f)Љ=false;if(Љ){foreach(var Ǵ in ƚ)Ǵ.Velocity=0;foreach(var Ǵ in ƙ)Ǵ.Velocity=å;Ă=1;}break;}}
    void Ͼ(){switch(Ă){case 0:bool Њ=true;foreach(var Ǵ in Ƙ){Ǵ.Velocity=-0.5f;if(Ǵ.CurrentPosition>0.1f)Њ=false;}if(Њ){foreach(var Ǵ in Ƙ)Ǵ.Velocity=0.5f;Ă=1;}break;case 1:bool Ћ=true;foreach(var Ǵ in Ƙ)if(Ǵ.CurrentPosition<Ǵ.MaxLimit-0.05f)Ћ=false;if(Ћ){foreach(var Ǵ in Ƙ)Ǵ.Velocity=-ß;foreach(var ǳ in ƛ)ǳ.Enabled=true;Ă=2;}break;case 2:bool Ќ=true;foreach(var Ǵ in Ƙ)if(Ǵ.CurrentPosition>Ǵ.MinLimit+0.05f)Ќ=false;if(Ќ){int Ѝ=Ɯ!=null?Ɯ.BuildableBlocksCount:0;if(Ѝ>0){foreach(var Ǵ in Ƙ)Ǵ.Velocity=0;}else{foreach(var ǳ in ƛ)ǳ.Enabled=false;foreach(var Ǵ in Ƙ)Ǵ.Velocity=0.5f;Ă=1;}}break;}}
        
    void ʭ(){
    if(d==K.J){
    if(Â){º=false;µ=false;Á=false;Â=false;d=K.B;return;}
    if((ȿ-Ž).TotalSeconds<5){Echo("Action blocked: Launch grace period");return;}
    if(À){Á=true;return;}
    if(!Á){Á=true;Echo("ABORT ARMED - Press again to confirm");return;}
    ɂ();Â=true;Ɓ=ȿ;Á=false;return;
    }
    switch(e){
    case Q.L:
    if(h==0&&d==K.G&&(y||f!=X.R)&&Ĳ)ɟ();
    else if(h==0&&d==K.H&&(y||f!=X.R)&&Ĳ){int ɠ=(int)(ȿ-ž).TotalSeconds;if(ù==0||ɠ>=ù)ɡ();}
    else if(h==0&&(d==K.F||d==K.E)){if(ͽ(Ķ))Ķ.Disconnect();d=K.G;}
    else if(h==0&&!Ĳ){e=Q.O;h=0;}
    else if(h==1){e=Q.M;h=0;}
    else if(h==2){e=Q.N;h=0;}
    else if(h==3)ɞ();
    else if(h==4){e=Q.O;h=0;}
    else if(h==5){e=Q.P;h=0;}
    break;
    case Q.P:
    if(h>=0&&h<=6){ï=h+2;}
    else if(h==7){e=Q.L;h=5;}
    break;
    case Q.M:
    if(h==0){f=(X)(((int)f+1)%6);y=false;õ=0;}
    else if(h==1){
    if(f==X.R&&Ɖ.Count>0){ô=(ô+1)%Ɖ.Count;ƅ=Ɖ[ô].Coords;Ň=Ɖ[ô].Name;y=true;}
    else if(f==X.S&&Ƌ.Count>0){õ=(õ+1)%Ƌ.Count;ņ=Ƌ[õ];Ň=Ƌ[õ];y=true;}
    else if(f==X.T){y=true;Ň="SENSOR";}
    else if(f==X.U){y=true;Ň="LIDAR";}
    else if(f==X.V){y=true;Ň="MANUAL";}
    else if(f==X.W){y=true;Ň="SATELLITE";}}
    else if(h==2){e=Q.L;h=0;}
    break;
    case Q.H:
    if(h==0)ɟ();
    else if(h==1)ʮ();
    else if(h==2){e=Q.L;h=0;}
    break;
    case Q.N:
    if(h==0){if(ö<1000)ö+=250;else if(ö<3000)ö+=500;else if(ö<5000)ö+=1000;else if(ö<10000)ö+=2500;else ö=500;}
    else if(h==1){ø+=10;if(ø>100)ø=10;}
    else if(h==2){if(ù<30)ù+=5;else if(ù<60)ù+=15;else if(ù<120)ù+=30;else if(ù<300)ù+=60;else ù=10;}
    else if(h==3){ú+=10;if(ú>100)ú=10;}
    else if(h==4){û+=500;if(û>5000)û=500;}
    else if(h==5){þ=(þ+1)%3;}
    else if(h==6){if(ý<2000)ý+=500;else if(ý<5000)ý+=1000;else if(ý<10000)ý+=2500;else ý=500;}
    else if(h==7){z=!z;}
    else if(h==8){Ǥ=(Ǥ+1)%Ǩ.Length;ǯ();}
    else if(h==9){Ǣ+=1000;if(Ǣ>50000)Ǣ=1000;}
    else if(h==10){ǣ+=1000;if(ǣ>50000)ǣ=1000;}
    else if(h==11){}
    else if(h==12){Đ+=500;if(Đ>5000)Đ=500;}
    else if(h==13){đ+=10;if(đ>200)đ=10;}
    else if(h==14){Ē+=10;if(Ē>100)Ē=50;}
    else if(h==15){ē+=10;if(ē>100)ē=50;}
    else if(h==16){Ď+=10;if(Ď>100)Ď=10;}
    else if(h==17){ď+=10;if(ď>100)ď=10;}
    else if(h==18){ǥ+=5;if(ǥ>50)ǥ=5;}
    else if(h==19){È=!È;}
    else if(h==20){ĳ=!ĳ;if(!ĳ&&Ĵ!=null){Ĵ.Enabled=true;IGC.SendBroadcastMessage(ň+"_CMD","MERGE");}}
    else if(h==21){if(Ĵ!=null){Ĵ.Enabled=!Ĵ.Enabled;if(Ĵ.Enabled)IGC.SendBroadcastMessage(ň+"_CMD","MERGE");}}
    else if(h==22)ϭ(Ķ);else if(h==23)ϭ(Ĺ);else if(h==24)ϭ(ĺ);
    else if(h==25){Ā+=300;if(Ā>1800)Ā=300;}
    else if(h==26){ð=(ð+1)%Ħ.Length;}
    else if(h==27){ą=0;}
    else if(h==28){ö=500;ø=50;ù=10;ú=50;û=500;ý=500;z=true;þ=2;ƅ=new Vector3D(0,0,0);Ň="";y=false;ô=0;f=X.R;È=false;Ǣ=10106;ǣ=10106;Ā=1000;Ǥ=0;ð=0;Ē=90;ē=90;ą=0;ĳ=false;ÿ=0;ǯ();}
    else if(h==29){e=Q.L;h=0;}
    break;
    case Q.O:
    if(h==0){ǰ();Ǳ();}
    else if(h==1){e=Q.M;h=0;}
    else if(h==2){e=Q.N;h=0;}
    else if(h==3){Ĳ=true;e=Q.L;h=0;}
    break;
    }}
        
    void Ƿ(){
    if(ȁ()||Ȁ())return;
    if(Ć==0)Ć=1;
    if(ō=="")ō=$"[PAD{Ć}";
    var Ў=new List<IMyTextPanel>();
    GridTerminalSystem.GetBlocksOfType(Ў,ǹ=>ǹ.CubeGrid==Me.CubeGrid&&ǹ.CustomName.Contains("[PAD"));
    if(Ў.Count==0)return;
    bool Ͷ=Ĵ!=null&&Ĵ.IsConnected;
    bool Џ=false;bool А=false;
    if(ş==null||Š==null)ǽ();
    if(ş!=null&&Ǿ!="")Џ=ş.CustomData.Contains($"inv_for_session={Ǿ}");
    if(Š!=null&&Ǿ!="")А=Š.CustomData.Contains($"signal_for_session={Ǿ}");
    int Ϟ=DateTime.Now.Second;
    bool Б=Џ&&А&&(Ϟ/5)%2==1;
    bool В=Џ&&!А&&(Ϟ/5)%2==1;
    foreach(var Г in Ў){
    var Д=Г as IMyTextSurface;if(Д==null)continue;
    Д.ContentType=ContentType.SCRIPT;Д.Script="";Д.ScriptBackgroundColor=ĩ;
    var ϲ=Д.DrawFrame();float ȼ=20;
    Е(ϲ,ȼ,"UNITY MISSILE SYSTEM",ī);ȼ+=40;
    if(Б){
    Ж(ϲ,256,ȼ,"SIGNAL SCRIPT COMPILED",Ĩ,0.7f,TextAlignment.CENTER);ȼ+=40;
    З(ϲ,30,ȼ,452,80,ĩ,Ī);ȼ+=15;
    Ж(ϲ,50,ȼ,"NEXT STEP:",ħ,0.5f);ȼ+=22;
    Ж(ϲ,50,ȼ,"Compile BOOT script",į,0.5f);ȼ+=40;
    З(ϲ,30,ȼ,452,90,ĩ,Į);ȼ+=12;
    Ж(ϲ,50,ȼ,"COMPILE ORDER:",Ī,0.45f);ȼ+=20;
    Ж(ϲ,50,ȼ,"PAD > INV > SIGNAL > BOOT",ī,0.4f);ȼ+=20;
    Ж(ϲ,50,ȼ,"PAD [OK] | INV [OK] | SIG [OK] <<<< COMPILED",Ĩ,0.4f);
    }else if(Џ&&А){
    Ж(ϲ,256,ȼ,"SIGNAL SCRIPT COMPILED",Ĩ,0.7f,TextAlignment.CENTER);ȼ+=40;
    З(ϲ,30,ȼ,452,80,ĩ,Ī);ȼ+=15;
    Ж(ϲ,50,ȼ,"NEXT STEP:",ħ,0.5f);ȼ+=22;
    Ж(ϲ,50,ȼ,"Compile BOOT script",į,0.5f);ȼ+=40;
    З(ϲ,30,ȼ,452,90,ĩ,Į);ȼ+=12;
    Ж(ϲ,50,ȼ,"COMPILE ORDER:",Ī,0.45f);ȼ+=20;
    Ж(ϲ,50,ȼ,"PAD > INV > SIGNAL > BOOT",ī,0.4f);ȼ+=20;
    Ж(ϲ,50,ȼ,"PAD [OK] | INV [OK] | SIG [OK]",Ĩ,0.4f);
    }else if(В){
    Ж(ϲ,256,ȼ,"INVENTORY SCRIPT COMPILED",Ĩ,0.7f,TextAlignment.CENTER);ȼ+=40;
    З(ϲ,30,ȼ,452,80,ĩ,Ī);ȼ+=15;
    Ж(ϲ,50,ȼ,"NEXT STEP:",ħ,0.5f);ȼ+=22;
    Ж(ϲ,50,ȼ,"Compile SIGNAL script",į,0.5f);ȼ+=40;
    З(ϲ,30,ȼ,452,90,ĩ,Į);ȼ+=12;
    Ж(ϲ,50,ȼ,"COMPILE ORDER:",Ī,0.45f);ȼ+=20;
    Ж(ϲ,50,ȼ,"PAD > INV > SIGNAL > BOOT",ī,0.4f);ȼ+=20;
    Ж(ϲ,50,ȼ,"PAD [OK] | INV [OK] <<<< COMPILED",Ĩ,0.4f);
    }else if(Џ){
    Ж(ϲ,256,ȼ,"INVENTORY SCRIPT COMPILED",Ĩ,0.7f,TextAlignment.CENTER);ȼ+=40;
    З(ϲ,30,ȼ,452,80,ĩ,Ī);ȼ+=15;
    Ж(ϲ,50,ȼ,"NEXT STEP:",ħ,0.5f);ȼ+=22;
    Ж(ϲ,50,ȼ,"Compile SIGNAL script",į,0.5f);ȼ+=40;
    З(ϲ,30,ȼ,452,140,ĩ,Į);ȼ+=12;
    Ж(ϲ,50,ȼ,"SIGNAL DEBUG:",ĭ,0.45f);ȼ+=18;
    string И=Ǿ.Length>8?Ǿ.Substring(Ǿ.Length-8):Ǿ;
    Ж(ϲ,50,ȼ,$"signalPB found: {(Š!=null?"YES":"NO")}",Š!=null?Ĩ:ĭ,0.4f);ȼ+=16;
    string Й="NOT FOUND";
    if(Š!=null){int К=Š.CustomData.IndexOf("signal_for_session=");if(К>=0){int Л=Š.CustomData.IndexOf('\n',К);if(Л<0)Л=Š.CustomData.Length;Й=Š.CustomData.Substring(К+19,Л-К-19).Trim();if(Й.Length>8)Й=Й.Substring(Й.Length-8);}}
    Ж(ϲ,50,ȼ,$"SIG session: {Й}",Й==И?Ĩ:ĭ,0.4f);ȼ+=16;
    Ж(ϲ,50,ȼ,$"PAD session: {(Ǿ==""?"EMPTY":И)}",Ĭ,0.4f);ȼ+=16;
    Ж(ϲ,50,ȼ,$"Match: {(Й==И&&Ǿ!=""?"YES":"NO")}",Й==И&&Ǿ!=""?Ĩ:ĭ,0.4f);
    }else{
    Ж(ϲ,256,ȼ,"PAD SCRIPT COMPILED",Ĩ,0.7f,TextAlignment.CENTER);ȼ+=40;
    З(ϲ,30,ȼ,452,100,ĩ,Ī);ȼ+=15;
    Ж(ϲ,50,ȼ,"NEXT STEP:",ħ,0.5f);ȼ+=22;
    Ж(ϲ,50,ȼ,"Compile INVENTORY script",į,0.5f);ȼ+=22;
    Ж(ϲ,50,ȼ,"Then SIGNAL, then BOOT",į,0.45f);ȼ+=40;
    З(ϲ,30,ȼ,452,140,ĩ,Į);ȼ+=12;
    Ж(ϲ,50,ȼ,"SESSION DEBUG:",ĭ,0.45f);ȼ+=18;
    string М=Ǿ.Length>8?Ǿ.Substring(Ǿ.Length-8):Ǿ;
    Ж(ϲ,50,ȼ,$"PAD session: {(Ǿ==""?"EMPTY":М)}",Ĭ,0.4f);ȼ+=16;
    Ж(ϲ,50,ȼ,$"invPB found: {(ş!=null?"YES":"NO")}",ş!=null?Ĩ:ĭ,0.4f);ȼ+=16;
    string Н="NOT FOUND";
    if(ş!=null){int О=ş.CustomData.IndexOf("inv_for_session=");if(О>=0){int Л=ş.CustomData.IndexOf('\n',О);if(Л<0)Л=ş.CustomData.Length;Н=ş.CustomData.Substring(О+16,Л-О-16).Trim();if(Н.Length>8)Н=Н.Substring(Н.Length-8);}}
    Ж(ϲ,50,ȼ,$"INV session: {Н}",Н==М?Ĩ:ĭ,0.4f);ȼ+=16;
    Ж(ϲ,50,ȼ,$"Match: {(Н==М&&Ǿ!=""?"YES":"NO")}",Н==М&&Ǿ!=""?Ĩ:ĭ,0.4f);
    }
    ϲ.Dispose();
    }}
        
    void ȣ(){
    if(Ļ!=null)П();
    if(ļ!=null)Р();
    if(Ľ!=null)С();
    if(ľ!=null)Т();
    if(Ŀ!=null)У();
    if(ŀ.Count>0)Ф();
    if(Ł.Count>0)Х();
    Echo("Unity Missile System");
    Echo($"UnityPad [PAD{Ć}]");
    Echo("+------------------+");
    Echo($"| State: {d,-9} |");
    Echo("+------------------+");
    bool Ц=Ĵ!=null&&Ĵ.IsConnected;
    Echo($"Merge: {(Ц?"DOCKED":"--")} Con: {(Ķ!=null?(Ķ.Status==MyShipConnectorStatus.Connected?"LOCK":"RDY"):"--")}");
    if(Ц){Echo($"MSL: Gyr:{Ů.Count} Thr:{Ũ.Count} WH:{ŧ.Count}");Echo($"     Bat:{š.Count} H2:{ţ.Count} Sen:{Ű.Count}");}
    else Echo("MSL: Not Docked");
    Echo("--- PAD SYSTEMS ---");
    Echo($"Bat:{Ţ.Count} H2:{ť.Count} O2:{Ŧ.Count} Gen:{ū.Count}");
    Echo($"Asm:{ƨ.Count} Ref:{Ƨ.Count} Cargo:{Ɲ.Count}");
    Echo($"Ant:{ŵ.Count} Cam:{ų.Count} Sen:{ű.Count}");
    Echo($"Med:{ć} Surv:{Ĉ} Cryo:{ĉ}");
    int Ч=(Ļ!=null?1:0)+(ļ!=null?1:0)+(Ľ!=null?1:0)+(ľ!=null?1:0)+(Ŀ!=null?1:0);
    Echo($"LCDs:{Ч}/5 Printer:{(Ɯ!=null?"YES":"NO")}");
    Echo($"Target: {(ƅ!=Vector3D.Zero?"GPS SET":"---")}");
    if(É){Echo("--- CONTROLLER MODE ---");Echo($"Fleet: {ƫ.Count} pads online");foreach(int ɨ in ƫ){string ɛ=ƭ.ContainsKey(ɨ)?ƭ[ɨ]:"UNKNOWN";bool Ш=Ʋ.ContainsKey(ɨ)&&Ʋ[ɨ];bool Щ=ư.ContainsKey(ɨ)&&ư[ɨ];string Ъ="";if(Ш)Ъ+=" Missile";if(Щ)Ъ+=" Armed";Echo($"  PAD{ɨ}: {ɛ}{Ъ}");}
    Echo("--- COMMANDS ---");Echo("SETPADCONTROL COPYTGT BUILDALL");Echo("ARMALL LAUNCHALL STARTSALVO ABORTALL");}
    else{Echo("--- COMMANDS ---");Echo("LAUNCH ARM DISARM PRINT RESCAN");Echo("SETPADCONTROL NAMEPAD NAMEMSL");}
    }
        
    void а(){
    if(Ļ==null)return;var Д=Ļ as IMyTextSurface;if(Д==null)return;
    var ϲ=Ы(Д);float ȼ=5;
    Е(ϲ,ȼ,$"COMMAND {Ь()}",ī);ȼ+=32;
    Ж(ϲ,20,ȼ,$"PAD{Ć}   Fleet: {ƫ.Count} pads",į,0.5f);ȼ+=20;
    if(Ê){З(ϲ,15,ȼ,482,22,ĭ*0.3f,ĭ);Ж(ϲ,256,ȼ+2,$"SALVO {ě}/{ƫ.Count}",ĭ,0.5f,TextAlignment.CENTER);ȼ+=28;}
    else{Ж(ϲ,20,ȼ,$"Status: {(d==K.J?"TRACKING":d.ToString())}",d==K.J?ĭ:ħ,0.5f);ȼ+=22;}
    string Э=ƫ.Count>0?$"PAD{ƫ[ę]}":"NONE";string Ю=ĝ==0?"LINE":ĝ==1?"GRID":"CIRCLE";
    var ʦ=new List<string>{"Copy Target All","Build All","Arm All","Launch All","Salvo Mode",$"Carpet: {Ю}",Ë?"[*] Kill All":"Kill All","Abort All",Ì?$"[*] Satellites:{Ğ}":(Ğ>0?$"Satellites:{Ğ}":"Satellites: OFF"),$"Select: {Э}","Settings","Exit Control"};
    for(int ɮ=0;ɮ<ʦ.Count;ɮ++){Я(ϲ,ȼ,ɮ,ʦ[ɮ],Ę==ɮ);ȼ+=20;}
    ϲ.Dispose();}
    void е(){
    if(ļ==null)return;var Д=ļ as IMyTextSurface;if(Д==null)return;
    var ϲ=Ы(Д);float ȼ=5;
    Е(ϲ,ȼ,"PAD STATUS",ī);ȼ+=32;
    Ж(ϲ,20,ȼ,$"Fleet: {ƫ.Count} pads online",į,0.5f);ȼ+=22;
    int ȍ=0;foreach(int ɨ in ƫ){if(ȍ>=10)break;
    string ɛ="?";if(ƭ.ContainsKey(ɨ))ɛ=ƭ[ɨ];
    bool б=Ʋ.ContainsKey(ɨ)&&Ʋ[ɨ],в=Ƴ.ContainsKey(ɨ)&&Ƴ[ɨ];
    bool г=ư.ContainsKey(ɨ)&&ư[ɨ],Ђ=Ʊ.ContainsKey(ɨ)&&Ʊ[ɨ];
    Color д=ɛ=="GONE"?ĭ:г?Ĭ:Ђ?Ĩ:į;
    Ж(ϲ,20,ȼ,$"PAD{ɨ}  {(б?"[M]":"[ ]")}{(в?"[P]":"[ ]")}{(г?"[A]":"[ ]")}{(Ђ?"[R]":"[ ]")}  {ɛ}",д,0.42f);ȼ+=16;ȍ++;}
    if(ƫ.Count==0){Ж(ϲ,256,ȼ,"Scanning for pads...",Ī,0.5f,TextAlignment.CENTER);}
    ϲ.Dispose();}
    void к(){
    if(Ľ==null)return;var Д=Ľ as IMyTextSurface;if(Д==null)return;
    var ϲ=Ы(Д);float ȼ=5;
    Е(ϲ,ȼ,"MISSILE INVENTORY",ī);ȼ+=35;
    int ж=0,з=0,и=0,й=0;
    foreach(int ɨ in ƫ){if(Ʋ.ContainsKey(ɨ)&&Ʋ[ɨ])ж++;if(Ʊ.ContainsKey(ɨ)&&Ʊ[ɨ])з++;if(ư.ContainsKey(ɨ)&&ư[ɨ])и++;if(ƭ.ContainsKey(ɨ)&&ƭ[ɨ]=="GONE")й++;}
    З(ϲ,15,ȼ,230,90,ĩ,Ī);
    Ж(ϲ,25,ȼ+8,$"Docked: {ж}",į,0.55f);
    Ж(ϲ,25,ȼ+28,$"Ready: {з}",з>0?Ĩ:Ī,0.55f);
    Ж(ϲ,25,ȼ+48,$"Armed: {и}",и>0?Ĭ:Ī,0.55f);
    Ж(ϲ,25,ȼ+68,$"Flying: {й}",й>0?ĭ:Ī,0.55f);
    ȼ+=100;Ж(ϲ,20,ȼ,"[M]=Missile [P]=Print [A]=Armed [R]=Ready",Ī,0.4f);
    ϲ.Dispose();}
    void м(){
    if(ľ==null)return;var Д=ľ as IMyTextSurface;if(Д==null)return;
    var ϲ=Ы(Д);float ȼ=5;
    int л=0;foreach(int ɨ in ƫ){if(ƭ.ContainsKey(ɨ)&&ƭ[ɨ]=="GONE")л++;}
    Е(ϲ,ȼ,"FLIGHT STATUS",л>0?ĭ:ħ);ȼ+=35;
    Ж(ϲ,20,ȼ,$"In Flight: {л} missiles",л>0?ĭ:į,0.55f);ȼ+=28;
    if(µ){З(ϲ,15,ȼ,482,80,ĩ,ĭ);ȼ+=10;Ж(ϲ,25,ȼ,"THIS PAD",ĭ,0.5f);ȼ+=22;Ж(ϲ,25,ȼ,$"Phase: {ŉ}",ħ,0.5f);ȼ+=20;Ж(ϲ,25,ȼ,$"Distance: {ŕ:F0}m",į,0.5f);ȼ+=20;Ж(ϲ,25,ȼ,$"Speed: {ř:F0}m/s",į,0.5f);}
    else if(d==K.J){Ж(ϲ,256,ȼ,À?"BLACKOUT":"NO SIGNAL",Ĭ,0.6f,TextAlignment.CENTER);}
    else{Ж(ϲ,256,ȼ,"No active flight",Ī,0.55f,TextAlignment.CENTER);}
    ϲ.Dispose();}
    void с(){
    if(Ŀ==null)return;var Д=Ŀ as IMyTextSurface;if(Д==null)return;
    var ϲ=Ы(Д);float ȼ=5;
    Е(ϲ,ȼ,"SATELLITE NETWORK",ī);ȼ+=35;
    Ж(ϲ,20,ȼ,$"Satellites: {Ƭ.Count}   Pads: {ƫ.Count}",į,0.5f);ȼ+=28;
    if(Ƭ.Count>0){int н=0;foreach(int ʄ in Ƭ){if(н>=6)break;
    string ɛ="?";if(Ư.ContainsKey(ʄ))ɛ=Ư[ʄ];
    int Ǆ=0,ǆ=0;if(Ʒ.ContainsKey(ʄ))Ǆ=Ʒ[ʄ];if(Ƹ.ContainsKey(ʄ))ǆ=Ƹ[ʄ];
    float ʶ=Ǆ/100f,о=ǆ/100f;
    Ж(ϲ,20,ȼ,$"SAT{ʄ}: {ɛ}",ħ,0.45f);ȼ+=16;
    п(ϲ,20,ȼ,100,8,ʶ,р(ʶ),Į);Ж(ϲ,125,ȼ-2,$"{Ǆ}%",į,0.35f);
    п(ϲ,180,ȼ,100,8,о,р(о),Į);Ж(ϲ,285,ȼ-2,$"{ǆ}%",į,0.35f);ȼ+=18;н++;}}
    else{Ж(ϲ,256,ȼ,"No satellites deployed",Ī,0.55f,TextAlignment.CENTER);ȼ+=25;Ж(ϲ,256,ȼ,"Use Satellite mode to deploy",Ī,0.45f,TextAlignment.CENTER);}
    ϲ.Dispose();}
    void ʬ(){
    switch(Ę){
    case 0:ə("TGT",ƅ);break;
    case 1:ə("BUILD","");break;
    case 2:ə("ARM","");break;
    case 3:ə("LAUNCH","");break;
    case 4:Ê=!Ê;if(Ê){ě=0;ƃ=ȿ;}break;
    case 5:ĝ=(ĝ+1)%3;break;
    case 6:Ë=!Ë;if(Ë){ƶ.Clear();ɶ();}break;
    case 7:ə("ABORT","");break;
    case 8:if(Ğ==0){Ğ=1;Ì=true;}else if(Ì){Ì=false;}else{Ğ++;if(Ğ>10)Ğ=0;}break;
    case 9:if(ƫ.Count>0)ę=(ę+1)%ƫ.Count;break;
    case 10:e=Q.N;h=0;break;
    case 11:É=false;break;
    }}
    void П(){
    if(Ļ==null)return;
    if(!Ȁ())return;
    if(É){а();return;}
    if(ï>0){т();return;}
    var Д=Ļ as IMyTextSurface;if(Д==null)return;
    var ϲ=Ы(Д);float ȼ=5;
    Color у=d==K.H?ĭ:d==K.G?Ĩ:!Ĳ?Ĭ:ħ;
    if(Ã){
    int ф=(int)(ȿ-Ƃ).TotalSeconds;Color Ɇ=ŋ.Contains("HIT")?Ĩ:ŋ=="ABORTED"?ĭ:Ĭ;
    Е(ϲ,ȼ,"MISSION COMPLETE",Ɇ);ȼ+=40;
    Ж(ϲ,256,ȼ,ŋ,Ɇ,0.9f,TextAlignment.CENTER);ȼ+=50;
    Ж(ϲ,20,ȼ,$"Phase: {Ō}",į);ȼ+=25;
    Ж(ϲ,20,ȼ,$"Distance: {Ś:F0}m",į);ȼ+=25;
    Ж(ϲ,20,ȼ,$"+{ф}s since signal",į);ȼ+=40;
    Я(ϲ,ȼ,0,"Acknowledge",h==0);
    ϲ.Dispose();return;}
    if(d==K.J){
    if(Â){int х=(int)(ȿ-Ɓ).TotalSeconds;Е(ϲ,ȼ,"DETONATED",ĭ);ȼ+=40;Ж(ϲ,256,ȼ,"TARGET DESTROYED",ĭ,0.8f,TextAlignment.CENTER);ȼ+=40;Ж(ϲ,256,ȼ,$"+{х}s ago",į,0.6f,TextAlignment.CENTER);ȼ+=60;Ж(ϲ,256,ȼ,"Press APPLY to reset",į,0.5f,TextAlignment.CENTER);ϲ.Dispose();return;}
    int ф=(int)(ȿ-Ž).TotalSeconds;int ц=ř>10?(int)(ŕ/ř):0;
    Е(ϲ,ȼ,$"FLIGHT {Ь()}",ĭ);ȼ+=35;
    Ж(ϲ,20,ȼ,$"T+{ф}s   {ř:F0} m/s",į);ȼ+=25;
    if(À){Ж(ϲ,256,ȼ,"SIGNAL BLACKOUT",Ĭ,0.7f,TextAlignment.CENTER);ȼ+=25;if(Á)Ж(ϲ,256,ȼ,"ABORT QUEUED",ĭ,0.6f,TextAlignment.CENTER);}
    else if(µ){Ж(ϲ,20,ȼ,$"Phase: {ŉ}",ħ);ȼ+=22;Ж(ϲ,20,ȼ,$"Distance: {ŕ:F0}m",į);ȼ+=22;Ж(ϲ,20,ȼ,ц>0?$"ETA: {ч(ц)}":"Calculating...",į);ȼ+=25;float ɋ=(float)Ŕ/100f;ш(ϲ,20,ȼ,300,12,"Fuel",ɋ,р(ɋ),Į);}
    else{Ж(ϲ,256,ȼ,"NO SIGNAL",Ĭ,0.7f,TextAlignment.CENTER);}
    ȼ=235;Я(ϲ,ȼ,0,"Abort Mission",h==0);
    ϲ.Dispose();return;}
    string щ=d==K.H?"ARMED":d==K.G?"READY":d==K.C?"PRINTING":d==K.D?"BUILDING":w?"DOCKED":"IDLE";
    Е(ϲ,ȼ,$"CONTROL {Ь()}",у);ȼ+=32;
    З(ϲ,15,ȼ,482,24,ĩ,у);Ж(ϲ,256,ȼ+2,щ+(Ĳ?"":" - SETUP REQUIRED"),у,0.55f,TextAlignment.CENTER);ȼ+=35;
    if(d==K.H&&ª&&ù>0){int ъ=ù-(int)(ȿ-ž).TotalSeconds;if(ъ<0)ъ=0;string ы=ъ>=60?$"{ъ/60}:{ъ%60:D2}":$"{ъ}s";Ж(ϲ,256,ȼ,$"T-{ы} @ {ч(ъ)}",ĭ,0.7f,TextAlignment.CENTER);ȼ+=30;}
    switch(e){
    case Q.L:
    bool ь=(y||f!=X.R)&&Ĳ;bool э=(d==K.F||d==K.E);
    int ю=ù-(int)(ȿ-ž).TotalSeconds;string я=ю>=60?$"{ю/60}:{ю%60:D2}":$"{ю}";string ѐ=d==K.H&&ª&&ù>0?(ю>0?$"T-{я}":"GO!"):"Launch";
    string ё=э?"Skip Load":(ь?ѐ:Ĳ?"No Target":"Setup Required");
    ȼ=90;Я(ϲ,ȼ,0,ё,h==0);ȼ+=28;Я(ϲ,ȼ,1,"Target",h==1);ȼ+=28;Я(ϲ,ȼ,2,"Config",h==2);ȼ+=28;
    Я(ϲ,ȼ,3,Ä?"Stop Print":"Print",h==3);ȼ+=28;Я(ϲ,ȼ,4,"Setup",h==4);ȼ+=28;Я(ϲ,ȼ,5,"View",h==5);
    break;
    case Q.P:
    string[] Μ={"","Build","Missile","Fuel","Power","Cargo","Telemetry","GPS"};ȼ=80;Ж(ϲ,20,ȼ,"Select Display:",į);ȼ+=25;
    for(int ɮ=2;ɮ<=8;ɮ++){Я(ϲ,ȼ,ɮ-2,$"LCD{ɮ}: {Μ[ɮ-1]}",h==ɮ-2);ȼ+=24;}
    Я(ϲ,ȼ,7,"Back",h==7);break;
    case Q.M:
    string ђ=f==X.R?"GPS":f==X.S?"ANTENNA":f==X.T?"SENSOR":f==X.U?"LIDAR":f==X.W?"SATELLITE":"MANUAL";
    ȼ=80;Ж(ϲ,20,ȼ,$"Mode: {ђ}",ħ,0.6f);ȼ+=30;Я(ϲ,ȼ,0,"Cycle Mode",h==0);ȼ+=28;
    Ж(ϲ,20,ȼ,$"Target: {(y?Ň:"none")}",ħ,0.6f);ȼ+=30;Я(ϲ,ȼ,1,"Select Target",h==1);ȼ+=28;Я(ϲ,ȼ,2,"Back",h==2);break;
    case Q.N:
    string ѓ=þ==0?"AUTO":þ==1?"ICBM":"DIRECT";string є=þ==1?"N/A":(ö>=1000?$"{ö/1000f:0.#}km":$"{ö}m");string ѕ=ù>=60?$"{ù/60}m{ù%60}s":$"{ù}s";string і=ý>=1000?$"{ý/1000f:0.#}km":$"{ý}m";
    var Ȑ=new List<string>{$"Climb: {є}",$"Detonate: {ø}m",$"T-Minus: {ѕ}",$"Sensor: {ú}m",$"LIDAR: {û}m",$"Flight: {ѓ}",$"Reentry: {і}",$"Broadcast: {(z?"ON":"OFF")}",$"Payload: {Ǩ[Ǥ]}",$"Load: {Ǣ}",$"Eject: {ǣ}",$"Stock: {ǟ/1000}k",$"Ice: {Đ}",$"Uranium: {đ}",$"H2 Tank: {Ē}%",$"O2 Tank: {ē}%",$"H2 Bot: {Ď}",$"O2 Bot: {ď}",$"Tools: {ǥ}",$"Mode: {(È?"CREATIVE":"SURVIVAL")}",$"Auto: {(ĳ?"PAUSED":"ACTIVE")}",$"Merge: {(Ĵ==null?"N/A":Ĵ.Enabled?"ON":"OFF")}",$"Dock: {Ϭ(Ķ)}",$"Con1: {Ϭ(Ĺ)}",$"Con2: {Ϭ(ĺ)}",$"Timeout: {Ā}s",$"Graph: {Ħ[ð]}",$"Missile#: {ą}","RESET ALL","BACK"};
    if(h<l)l=h;if(h>=l+ƕ)l=h-ƕ+1;
    ȼ=70;Ж(ϲ,20,ȼ,$"SETTINGS [{h+1}/{Ȑ.Count}]",ħ,0.55f);ȼ+=22;
    if(l>0){Ж(ϲ,256,ȼ,"^ more ^",Ī,0.4f,TextAlignment.CENTER);ȼ+=18;}else ȼ+=18;
    for(int ɮ=l;ɮ<Math.Min(l+ƕ,Ȑ.Count);ɮ++){Я(ϲ,ȼ,ɮ,Ȑ[ɮ],h==ɮ);ȼ+=22;}
    if(l+ƕ<Ȑ.Count)Ж(ϲ,256,ȼ,"v more v",Ī,0.4f,TextAlignment.CENTER);break;
    case Q.O:
    string ї=g==c.Z?"SPACE":g==c.a?"PLANET":g==c.b?"MOON":"???";
    int ј=(Ļ!=null?1:0)+(ļ!=null?1:0)+(Ľ!=null?1:0)+(ľ!=null?1:0)+(Ŀ!=null?1:0);
    bool љ=Ĵ!=null&&Ķ!=null,њ=ј>=3,ћ=Ŝ!=null,ќ=w,ѝ=y||f!=X.R;
    int ў=(љ?1:0)+(њ?1:0)+(ћ?1:0)+(ќ?1:0)+(ѝ?1:0);float џ=ў/5f;
    ȼ=80;Ж(ϲ,20,ȼ,"INITIAL SETUP",ī,0.65f);ȼ+=25;
    п(ϲ,20,ȼ,472,10,џ,р(џ),Į);ȼ+=18;
    Ж(ϲ,20,ȼ,$"Environment: {ї}   LCDs: {ј}/5",į,0.5f);ȼ+=22;
    Ж(ϲ,20,ȼ,$"{(љ?"[X]":"[o]")} Pad   {(ћ?"[X]":"[o]")} Button   {(ќ?"[X]":"[o]")} Missile",љ&&ћ&&ќ?Ĩ:Ĭ,0.5f);ȼ+=22;
    Ж(ϲ,20,ȼ,$"{(ѝ?"[X]":"[o]")} Target   {(Ĳ?"[READY]":"")}",ѝ?Ĩ:Ĭ,0.5f);ȼ+=28;
    Я(ϲ,ȼ,0,"Rescan",h==0);ȼ+=26;Я(ϲ,ȼ,1,"Target",h==1);ȼ+=26;Я(ϲ,ȼ,2,"Config",h==2);ȼ+=26;
    if(љ&&њ&&ћ&&ќ&&ѝ)Ĳ=true;
    Я(ϲ,ȼ,3,Ĳ?"Launch!":"Continue",h==3);break;}
    ϲ.Dispose();}
        
    void Р(){
    if(ļ==null)return;
    if(!Ȁ())return;
    if(É){е();return;}
    var Д=ļ as IMyTextSurface;if(Д==null)return;
    var ϲ=Ы(Д);float ȼ=5;
    if(d==K.J){
    int Ѡ=(int)(ȿ-Ž).TotalSeconds;int ѡ=ř>10?(int)(ŕ/ř):0;
    Е(ϲ,ȼ,$"FLIGHT {Ь()}",ĭ);ȼ+=35;
    Ж(ϲ,20,ȼ,$"T+{Ѡ}s",į);ȼ+=22;
    if(µ){Ж(ϲ,20,ȼ,ŉ,ħ);ȼ+=20;Ж(ϲ,20,ȼ,$"{ŕ:F0}m  {ř:F0}m/s",į);ȼ+=20;Ж(ϲ,20,ȼ,ѡ>0?$"IMPACT @ {ч(ѡ)}":"Calculating...",Ĭ);}
    else if(À){Ж(ϲ,256,ȼ,"BLACKOUT",Ĭ,0.7f,TextAlignment.CENTER);ȼ+=22;Ж(ϲ,20,ȼ,Ŋ,Ī);}
    else{Ж(ϲ,256,ȼ,"NO SIGNAL",Ĭ,0.7f,TextAlignment.CENTER);}
    ȼ+=25;bool Ѣ=false;foreach(var ɐ in ŷ)if(ɐ.Status==MyLaserAntennaStatus.Connected)Ѣ=true;
    Ж(ϲ,20,ȼ,$"Laser: {(Ѣ?"LINKED":"OFF")}",Ѣ?Ĩ:Ī);
    ϲ.Dispose();return;}
    Е(ϲ,ȼ,"BUILD STATUS",ħ);ȼ+=32;
    if(Ɯ==null){Ж(ϲ,256,ȼ,"NO PROJECTOR",Ĭ,0.6f,TextAlignment.CENTER);ϲ.Dispose();return;}
    if(Ɯ.RemainingBlocks==0&&Ɯ.TotalBlocks>0&&w){
    Ж(ϲ,256,ȼ,"BUILD COMPLETE",Ĩ,0.6f,TextAlignment.CENTER);ȼ+=22;
    Ж(ϲ,256,ȼ,"Update Missile PB",Ĭ,0.45f,TextAlignment.CENTER);ȼ+=20;
    }else if(Ɯ.RemainingBlocks==0){
    Ж(ϲ,256,ȼ,w?"READY":"NO BLUEPRINT",w?Ĩ:Ī,0.6f,TextAlignment.CENTER);ȼ+=22;
    }else{
    int ѣ=Ɯ.TotalBlocks,ъ=Ɯ.RemainingBlocks;float Ѥ=ѣ>0?(float)(ѣ-ъ)/ѣ:0;
    Ж(ϲ,20,ȼ,È?"CREATIVE":"SURVIVAL",ī,0.45f);ȼ+=18;
    ш(ϲ,20,ȼ,350,12,"Progress",Ѥ,р(Ѥ),Į);ȼ+=28;
    Ж(ϲ,20,ȼ,$"Blocks: {ѣ-ъ}/{ѣ}  Buildable: {Ė}",į,0.4f);ȼ+=18;}
    int ѥ=(int)((Î-ȼ*Ð-60*Ð)/(18*Ð));int Ѧ=Math.Max(8,ѥ);
    var ѧ=ǜ.Count>0?ǜ:ǚ;var Ѩ=ǜ.Count>0?ǝ:Ǜ;
    string ѩ=ǜ.Count>0?"BLUEPRINT NEEDS":"PRODUCTION QUOTAS";
    Ж(ϲ,20,ȼ,$"{ѩ} [{m+1}-{Math.Min(m+Ѧ,ѧ.Count)}/{ѧ.Count}]:",Ī,0.45f);ȼ+=18;
    int ȉ=0,Ѫ=0;foreach(var ʕ in ѧ){if(Ѫ++<m)continue;if(ȉ>=Ѧ)break;int ѫ=Ǚ.ContainsKey(ʕ.Key)?Ǚ[ʕ.Key]:0;int ο=Math.Max(0,ʕ.Value-ѫ);Color Ѭ=ѫ>=ʕ.Value?Ĩ:ĭ;Ж(ϲ,20,ȼ,$"{ʕ.Key}: {ѫ}+{ο}/{ʕ.Value}",Ѭ,0.42f);ȼ+=16;ȉ++;}
    if(Ѩ.Count>0&&ȉ<Ѧ){foreach(var ʕ in Ѩ){if(ȉ>=Ѧ)break;Ж(ϲ,25,ȼ,$"-{ʕ.Key}: {ʕ.Value}",ĭ,0.38f);ȼ+=14;ȉ++;}}
    ȼ+=8;int ѭ=Math.Max(0,ǧ-Ǟ);Ж(ϲ,20,ȼ,$"Ammo ({Ǩ[Ǥ]}): {Ǟ}+{ѭ}/{ǧ}",Ǟ>=ǧ?Ĩ:Ĭ,0.5f);
    ȼ+=22;int Ѯ=0,ѯ=0;foreach(var Ͱ in Ƨ)if(Ͱ.IsProducing)Ѯ++;foreach(var Ƞ in ƨ)if(Ƞ.IsProducing)ѯ++;
    Ж(ϲ,20,ȼ,$"Refineries: {Ѯ}/{Ƨ.Count}   Assemblers: {ѯ}/{ƨ.Count}",į,0.5f);
    ϲ.Dispose();}
        
    void С(){
    if(Ľ==null)return;
    if(!Ȁ())return;
    if(É){к();return;}
    var Д=Ľ as IMyTextSurface;if(Д==null)return;
    var ϲ=Ы(Д);
    if(d==K.J){
    int ф=(int)(ȿ-Ž).TotalSeconds;
    Е(ϲ,10,"MISSILE POSITION",ĭ);
    Ж(ϲ,20,60,$"Flight Time: +{ф} seconds",į,0.6f);
    if(µ){
    Ж(ϲ,20,110,$"X Position: {Ɔ.X:F0}",ħ,0.6f);
    Ж(ϲ,20,160,$"Y Position: {Ɔ.Y:F0}",ħ,0.6f);
    Ж(ϲ,20,210,$"Z Position: {Ɔ.Z:F0}",ħ,0.6f);
    Ѱ(ϲ,270);
    Ж(ϲ,20,300,$"Distance to Target: {ŕ:F0} meters",ī,0.6f);
    Ж(ϲ,20,360,$"Current Velocity: {ř:F0} m/s",į,0.55f);}
    else{Ж(ϲ,256,160,"NO SIGNAL",Ĭ,0.8f,TextAlignment.CENTER);}
    ϲ.Dispose();return;}
    Е(ϲ,10,"MISSILE SYSTEMS",ħ);
    if(!w){
    Ж(ϲ,256,60,"NO MISSILE DETECTED",Ĭ,0.7f,TextAlignment.CENTER);
    Ѱ(ϲ,110);
    Ж(ϲ,20,140,"PRINTER STATUS",ī,0.6f);
    if(Ɯ!=null){
    int ъ=Ɯ.RemainingBlocks,ѣ=Ɯ.TotalBlocks,ѱ=Ɯ.BuildableBlocksCount;
    float Ѥ=ѣ>0?(float)(ѣ-ъ)/ѣ:0;
    ш(ϲ,20,190,380,18,"Build Progress",Ѥ,Ѥ>=1?Ĩ:Ѥ>0?Ĭ:Ī,Į);
    string Ѳ=Ă==0?"ALIGN":Ă==1?"UP PASS":Ă==2?"DOWN PASS":Ă==3?"REALIGN":Ă==4?"H STEP":"IDLE";
    Ж(ϲ,20,250,$"State: {Ѳ}",Ä?Ĩ:Ī,0.55f);
    Ж(ϲ,20,290,$"Blocks: {ѣ-ъ} / {ѣ}",į,0.55f);
    float ѳ=0;if(ƙ.Count>0){foreach(var Ǵ in ƙ)ѳ+=Ǵ.CurrentPosition;ѳ/=ƙ.Count;}
    float Ѵ=0;if(ƚ.Count>0){foreach(var Ǵ in ƚ)Ѵ+=Ǵ.CurrentPosition;Ѵ/=ƚ.Count;}
    Ж(ϲ,20,340,$"Vertical: {ѳ:F1}m  Zero: {ä:F1}m  Max: {ã:F1}m",į,0.5f);
    Ж(ϲ,20,380,$"Horizontal: {Ѵ:F1}m  Target: {à:F1}m  Max: {â:F1}m",į,0.5f);
    if(ѱ>0)Ж(ϲ,20,430,$"Ready to weld: {ѱ} blocks",Ĩ,0.55f);
    else if(ъ>0)Ж(ϲ,20,430,$"Remaining: {ъ} blocks",Ĭ,0.55f);
    else if(ѣ>0)Ж(ϲ,20,430,"Build complete!",Ĩ,0.6f);
    else Ж(ϲ,20,430,"No blueprint loaded",Ī,0.55f);
    }else{Ж(ϲ,20,200,"No projector found",Ī,0.6f);}
    ϲ.Dispose();return;}
    string ѵ=Ĵ!=null?(Ĵ.CubeGrid.GridSize>1?"LARGE":"SMALL"):"?";
    Ж(ϲ,20,55,$"Grid: {ѵ}   Computer: {(ŝ!=null?"OK":"MISSING")}   Remote: {(Ż!=null?"OK":"MISSING")}",į,0.5f);
    if(ŝ!=null&&Ɯ!=null&&Ɯ.RemainingBlocks==0){Ж(ϲ,256,85,"Reload Programmable Block!",Ĭ,0.55f,TextAlignment.CENTER);}
    Ж(ϲ,20,115,$"Thrusters: Atmospheric: {ñ}  Hydrogen: {ò}  Ion: {ó}",į,0.5f);
    Ж(ϲ,20,155,$"Total Thrust: {Ũ.Count}   Gyroscopes: {Ů.Count}",Ũ.Count>0&&Ů.Count>0?Ĩ:ĭ,0.5f);
    float ʶ=Ñ/100f;ш(ϲ,20,200,350,15,"Battery",ʶ,р(ʶ),Į);
    Ж(ϲ,390,200,ʶ>=1f?"FULL":$"{Ö:F2}/{Ø:F2}",ʶ>=1f?Ĩ:Ĭ,0.45f);
    float о=Ò/100f;ш(ϲ,20,250,350,15,"Hydrogen",о,р(о),Į);
    Ж(ϲ,390,250,о>=1f?"FULL":$"{Ù:F0}/{Ú:F0}L",о>=1f?Ĩ:Ĭ,0.45f);
    Ж(ϲ,20,305,$"Generators: {Ū.Count}   Warheads: {ŧ.Count}",į,0.55f);
    Color Ѷ=ŧ.Count==0?Ī:t?ĭ:Ĩ;string ѷ=ŧ.Count==0?"NONE":t?"ARMED":"SAFE";
    Ж(ϲ,20,350,$"Warhead Status: {ѷ}",Ѷ,0.6f);
    Ж(ϲ,20,400,$"Sensors: {Ű.Count}   Cameras: {Ų.Count}   Antennas: {Ŵ.Count}",į,0.5f);
    int Ѹ=0;foreach(var ɐ in Ŷ)if(ɐ.Status==MyLaserAntennaStatus.Connected)Ѹ++;
    Ж(ϲ,20,445,$"Laser Antennas: {Ŷ.Count}   Linked: {Ѹ}",Ѹ>0?Ĩ:Ī,0.55f);
    ϲ.Dispose();}
        
        
    void Т(){
    if(ľ==null)return;
    if(!Ȁ())return;
    if(É){м();return;}
    var Д=ľ as IMyTextSurface;if(Д==null)return;
    var ϲ=Ы(Д);
    if(d!=K.J){
    Е(ϲ,10,"FLIGHT COMMUNICATIONS",ħ);
    int ѹ=0;foreach(var ɐ in ŷ)if(ɐ.Status==MyLaserAntennaStatus.Connected)ѹ++;
    Ж(ϲ,20,60,$"Pad Antennas: {ŵ.Count}",į,0.55f);
    Ж(ϲ,20,100,$"Laser Antennas: {ŷ.Count}   Linked: {ѹ}",ѹ>0?Ĩ:į,0.55f);
    if(w&&(Ŵ.Count>0||Ŷ.Count>0)){Ж(ϲ,20,150,$"Pre-Launch Comms: {(ϕ?"READY":"PENDING")}",ϕ?Ĩ:Ĭ,0.55f);}
    else{Ж(ϲ,20,150,"Pre-Launch Comms: N/A",Ī,0.55f);}
    string Ѻ=f==X.R?"GPS":f==X.S?"ANTENNA":f==X.T?"SENSOR":f==X.U?"LIDAR":"MANUAL";
    Ж(ϲ,20,230,$"Targeting Mode: {Ѻ}",ī,0.6f);
    Ж(ϲ,20,290,$"Target: {(y?Ň:"NONE")}",y?Ĩ:Ī,0.6f);
    Ж(ϲ,20,380,$"Game Mode: {(È?"CREATIVE":"SURVIVAL")}",į,0.55f);
    Ж(ϲ,20,430,$"Environment: {(g==c.Z?"SPACE":g==c.a?"PLANET":"MOON")}",į,0.55f);
    }else{
    Color ѻ=À?Ĭ:ĭ;
    int Ѽ=(int)(ȿ-Ž).TotalSeconds;int ѽ=ř>10?(int)(ŕ/ř):0;
    Е(ϲ,10,"TELEMETRY",ѻ);
    Ж(ϲ,20,60,$"Flight Time: +{Ѽ} seconds",į,0.6f);
    Ж(ϲ,20,100,$"Current Time: {Ь()}",Ī,0.5f);
    if(µ){
    Ж(ϲ,20,150,$"Phase: {ŉ}",ħ,0.65f);
    Ж(ϲ,20,200,$"Distance to Target: {ŕ:F0} meters",į,0.55f);
    Ж(ϲ,20,250,$"Velocity: {ř:F0} m/s",į,0.55f);
    Ж(ϲ,20,300,ѽ>0?$"Impact ETA: {ѽ} seconds @ {ч(ѽ)}":"Calculating arrival...",ī,0.55f);
    float Ѿ=1f-(float)(ŕ/(ŕ+1000));ш(ϲ,20,360,380,12,"Distance",Ѿ,ĭ,Į);
    float ˋ=(float)Math.Min(ř/500,1);ш(ϲ,20,410,380,12,"Speed",ˋ,ħ,Į);}
    else if(À){Ж(ϲ,256,160,"COMMUNICATIONS BLACKOUT",Ĭ,0.7f,TextAlignment.CENTER);Ж(ϲ,20,230,$"Last Known Phase: {Ŋ}",Ī,0.55f);Ж(ϲ,20,280,$"Last Known Distance: {Ŗ:F0} meters",Ī,0.55f);}
    else{Ж(ϲ,256,160,"NO SIGNAL",Ĭ,0.8f,TextAlignment.CENTER);}
    bool Ѣ=false;foreach(var ɐ in ŷ)if(ɐ.Status==MyLaserAntennaStatus.Connected)Ѣ=true;
    Ж(ϲ,20,460,$"Laser Relay: {(Ѣ?"LINKED":"OFF")}   [Press for ABORT]",Ѣ?Ĩ:Ī,0.5f);}
    ϲ.Dispose();}
        
    void У(){
    if(Ŀ==null)return;
    if(!Ȁ())return;
    if(É){с();return;}
    var Д=Ŀ as IMyTextSurface;if(Д==null)return;
    var ϲ=Ы(Д);
    if(d==K.J){
    int ф=(int)(ȿ-Ž).TotalSeconds;
    Е(ϲ,10,"MISSILE TRACKING",ĭ);
    Ж(ϲ,20,55,$"Flight Time: +{ф} seconds",į,0.6f);
    Ж(ϲ,20,95,$"Phase: {ŉ}",ħ,0.7f);
    if(µ){
    Ж(ϲ,20,145,$"Distance to Target: {ŕ:F0} meters",ħ,0.55f);
    Ж(ϲ,20,185,$"Velocity: {ř:F0} m/s",į,0.55f);
    Ж(ϲ,20,225,$"Position: {Ɔ.X:F0}, {Ɔ.Y:F0}, {Ɔ.Z:F0}",į,0.5f);
    float ɋ=(float)Ŕ/100f;ш(ϲ,20,275,350,15,"Fuel Remaining",ɋ,р(ɋ),Į);
    int ѿ=ř>10?(int)(ŕ/ř):0;
    Ж(ϲ,20,330,ѿ>0?$"Estimated Impact: {ѿ} seconds @ {ч(ѿ)}":"Calculating arrival...",ī,0.55f);}
    else if(À){Ж(ϲ,256,140,"COMMUNICATIONS BLACKOUT",Ĭ,0.7f,TextAlignment.CENTER);Ж(ϲ,20,200,$"Last Known Distance: {Ŗ:F0} meters",Ī,0.55f);}
    else{Ж(ϲ,256,140,"SIGNAL LOST",ĭ,0.8f,TextAlignment.CENTER);}
    ϲ.Dispose();return;}
    if(d==K.C||d==K.D){
    Е(ϲ,10,"PRINTING MISSILE",Ĭ);
    string Ҁ=g==c.Z?"SPACE":g==c.a?"PLANET":"MOON";
    Ж(ϲ,20,60,$"Environment: {Ҁ}",į,0.6f);
    Ж(ϲ,20,100,$"Gravity: {İ:F2} m/sÂ²",į,0.6f);
    if(Ɯ!=null){int ъ=Ɯ.RemainingBlocks,ѣ=Ɯ.TotalBlocks;float ˇ=ѣ>0?(float)(ѣ-ъ)/ѣ:0;
    ш(ϲ,20,160,380,18,"Build Progress",ˇ,р(ˇ),Į);
    Ж(ϲ,20,220,$"Blocks Completed: {ѣ-ъ} / {ѣ}",į,0.55f);
    Ж(ϲ,20,260,$"Blocks Remaining: {ъ}",ъ>0?Ĭ:Ĩ,0.55f);}
    ϲ.Dispose();return;}
    string ҁ=d==K.E?"DOCKING MISSILE":d==K.F?"LOADING MISSILE":d==K.G?"MISSILE READY":d==K.H?"MISSILE ARMED":d==K.I?"LAUNCHING":"MISSILE STATUS";
    Color Ҋ=d==K.H?ĭ:d==K.G?Ĩ:d==K.F?Ĭ:ħ;
    Е(ϲ,10,ҁ,Ҋ);
    bool ҋ=Ĵ!=null&&Ĵ.IsConnected;
    bool Ҍ=ĵ!=null&&ĵ.IsConnected;
    bool ҍ=ͽ(Ķ);
    Ж(ϲ,20,50,$"Pad Merge: {(ҋ?"LOCKED":"OPEN")}",ҋ?Ĩ:ĭ,0.5f);
    Ж(ϲ,260,50,$"Missile Merge: {(Ҍ?"LOCKED":"OPEN")}",Ҍ?Ĩ:ĭ,0.5f);
    Ж(ϲ,20,80,$"Connector: {(ҍ?"DOCKED":"OPEN")}",ҍ?Ĩ:Ĭ,0.5f);
    Ж(ϲ,260,80,$"Warheads: {ŧ.Count} [{(t?"ARMED":"SAFE")}]",t?ĭ:Ĩ,0.5f);
    if(!w){Ж(ϲ,256,160,"NO MISSILE DOCKED",Ĭ,0.7f,TextAlignment.CENTER);
    Ж(ϲ,256,210,"Waiting for missile...",Ī,0.55f,TextAlignment.CENTER);}else{
    float ʶ=Ñ/100f;ш(ϲ,20,130,340,15,"Battery",ʶ,р(ʶ),Į);
    Ж(ϲ,380,130,ʶ>=1f?"FULL":$"{Ö:F2}/{Ø:F2}",ʶ>=1f?Ĩ:Ĭ,0.45f);
    float о=Ò/100f;ш(ϲ,20,175,340,15,"Hydrogen",о,р(о),Į);
    Ж(ϲ,380,175,о>=1f?"FULL":$"{Ù:F0}/{Ú:F0}L",о>=1f?Ĩ:Ĭ,0.45f);
    float Ҏ=220;
    if(Ť.Count>0){float ҏ=Ó/100f;ш(ϲ,20,Ҏ,340,15,"Oxygen",ҏ,р(ҏ),Į);Ж(ϲ,380,Ҏ,ҏ>=1f?"FULL":$"{Û:F0}/{Ü:F0}L",ҏ>=1f?Ĩ:Ĭ,0.45f);}
    else{ш(ϲ,20,Ҏ,340,15,"Oxygen",0,Ī,Į);Ж(ϲ,380,Ҏ,"N/A",Ī,0.45f);}Ҏ+=45;
    if(Ū.Count>0){float Ґ=Ô/100f;ш(ϲ,20,Ҏ,340,15,"Ice Storage",Ґ,р(Ґ),Į);Ж(ϲ,380,Ҏ,Ґ>=1f?"FULL":$"{Ý:F1}/{Þ:F1}L",Ґ>=1f?Ĩ:Ĭ,0.45f);}
    else{ш(ϲ,20,Ҏ,340,15,"Ice Storage",0,Ī,Į);Ж(ϲ,380,Ҏ,"N/A",Ī,0.45f);}Ҏ+=45;
    if(Ŭ.Count>0){int ψ=0;foreach(var Ͱ in Ŭ){var κ=Ͱ.GetInventory();if(κ!=null){var μ=new List<MyInventoryItem>();κ.GetItems(μ);foreach(var Ȼ in μ)if(Ȼ.Type.SubtypeId=="Uranium")ψ+=(int)Ȼ.Amount;}}float ґ=ψ/(float)đ;ш(ϲ,20,Ҏ,340,15,"Uranium",ґ>1?1:ґ,р(ґ),Į);Ж(ϲ,380,Ҏ,$"{ψ}/{đ}",ψ>=đ?Ĩ:Ĭ,0.45f);}
    else{ш(ϲ,20,Ҏ,340,15,"Uranium",0,Ī,Į);Ж(ϲ,380,Ҏ,"N/A",Ī,0.45f);}Ҏ+=45;
    float Ғ=ĸ!=null?(float)ǡ/Ǣ:0;Color ғ=ĸ==null?ĭ:р(Ғ);ш(ϲ,20,Ҏ,340,15,Ǩ[Ǥ],Ғ>1?1:Ғ,ғ,Į);
    string Ҕ=ĸ==null?"NO CONNECTOR":ǡ>=Ǣ?"READY":$"{ǡ}/{Ǣ}";
    Ж(ϲ,380,Ҏ,Ҕ,ĸ==null?ĭ:ǡ>=Ǣ?Ĩ:Ĭ,0.45f);Ҏ+=45;
    Ж(ϲ,20,Ҏ+15,$"Thrusters: {Ũ.Count}   Gyroscopes: {Ů.Count}   Remote Control: {(Ż!=null?"OK":"NONE")}",į,0.48f);
    Ж(ϲ,20,Ҏ+50,$"Computer: {(ŝ!=null?"OK":"NONE")}   Sensors: {Ű.Count}   Cameras: {Ų.Count}",į,0.48f);}
    string ђ=f==X.R?"GPS":f==X.S?"ANTENNA":f==X.T?"SENSOR":f==X.U?"LIDAR":"MANUAL";
    Ж(ϲ,20,425,$"Targeting Mode: {ђ}",ī,0.55f);
    Ж(ϲ,20,460,$"Target: {(y?Ň:"NONE")}",y?Ĩ:Ī,0.55f);
    if(y&&f==X.R){Ж(ϲ,260,460,$"GPS: {ƅ.X:F0}, {ƅ.Y:F0}, {ƅ.Z:F0}",į,0.45f);}
    ϲ.Dispose();}
        
    bool ʴ(string Ș,int ʑ){string ɸ=":"+ʑ;int ɮ=Ș.IndexOf(ɸ);if(ɮ<0)return false;int ɹ=ɮ+ɸ.Length;return ɹ>=Ș.Length||Ș[ɹ]==']'||Ș[ɹ]==' '||Ș[ɹ]=='-'||!char.IsDigit(Ș[ɹ]);}
    string Ь()=>ȿ.ToString("HH:mm:ss");
    string ч(int ɸ)=>ȿ.AddSeconds(ɸ).ToString("HH:mm:ss");
    float ҕ(string ɮ){if(string.IsNullOrEmpty(ɮ))return 0;int Ȼ=ɮ.IndexOf("Current Output:");if(Ȼ<0)Ȼ=ɮ.IndexOf("Output:");if(Ȼ<0)return 0;string ɸ=ɮ.Substring(Ȼ);int Ș=ɸ.IndexOf('\n');if(Ș>0)ɸ=ɸ.Substring(0,Ș);float Ϯ=0;bool ϲ=false;string ȡ="";foreach(char ʜ in ɸ){if((ʜ>='0'&&ʜ<='9')||ʜ=='.'){ȡ+=ʜ;ϲ=true;}else if(ϲ)break;}float.TryParse(ȡ,out Ϯ);return ɸ.Contains("kW")?Ϯ/1000:ɸ.Contains("GW")?Ϯ*1000:Ϯ;}
    float ˮ(IMyPowerProducer Ǵ){float ˬ=Ǵ.CurrentOutput;if(ˬ>0.0001f)return ˬ;float ʑ=Ǵ.MaxOutput;return ʑ>0.0001f?ʑ:ҕ(Ǵ.DetailedInfo);}
        
    void т(){
    if(Ļ==null)return;var Д=Ļ as IMyTextSurface;if(Д==null)return;
    var ϲ=Ы(Д);float ȼ=5;
    string[] Җ={"","","BUILD","MISSILE","FUEL/TARGET","POWER","CARGO","TELEMETRY","GPS"};
    Е(ϲ,ȼ,$"VIEW: {Җ[ï]}",ħ);ȼ+=35;
    switch(ï){
    case 2:
    if(Ɯ==null){Ж(ϲ,256,ȼ,"No Projector",Ĭ,0.55f,TextAlignment.CENTER);}
    else{int җ=Ɯ.TotalBlocks,Ҙ=Ɯ.RemainingBlocks;float ҙ=җ>0?(float)(җ-Ҙ)/җ:0;
    Ж(ϲ,20,ȼ,È?"CREATIVE":"SURVIVAL",ī,0.5f);ȼ+=22;ш(ϲ,20,ȼ,350,10,"Progress",ҙ,р(ҙ),Į);ȼ+=30;
    Ж(ϲ,20,ȼ,$"Blocks: {җ-Ҙ}/{җ}  Buildable: {Ė}",į,0.45f);ȼ+=20;}
    Ж(ϲ,20,ȼ,$"Ammo: {Ǟ}/{ǧ}{(Ǡ>0?$" +{Ǡ}":"")}",į,0.45f);break;
    case 3:
    if(!w){Ж(ϲ,256,ȼ,"No Missile",Ĭ,0.55f,TextAlignment.CENTER);}
    else{Ж(ϲ,20,ȼ,$"PB: {(ŝ!=null?"OK":"X")}   RC: {(Ż!=null?"OK":"X")}",į,0.5f);ȼ+=22;
    Ж(ϲ,20,ȼ,$"Thrusters: Atmo:{ñ} H2:{ò} Ion:{ó}",į,0.45f);ȼ+=22;
    float ʶ=Ñ/100f,о=Ò/100f;
    ш(ϲ,20,ȼ,150,8,"Battery",ʶ,р(ʶ),Į);Ж(ϲ,175,ȼ-2,$"{Ö:F2}/{Ø:F2}",į,0.35f);ȼ+=24;
    ш(ϲ,20,ȼ,150,8,"Hydrogen",о,р(о),Į);Ж(ϲ,175,ȼ-2,$"{Ù:F0}/{Ú:F0}L",į,0.35f);ȼ+=24;
    Ж(ϲ,20,ȼ,$"Warheads: {ŧ.Count} [{(t?"ARMED":"SAFE")}]",t?ĭ:Ĩ,0.5f);}break;
    case 4:
    Ж(ϲ,20,ȼ,$"Mode: {f}   Target: {(y?Ň:"NONE")}",y?Ĩ:Ĭ,0.5f);ȼ+=25;
    float Қ=Ñ/100f,қ=Ò/100f,Ҝ=Ô/100f;
    ш(ϲ,20,ȼ,130,8,"Power",Қ,р(Қ),Į);Ж(ϲ,155,ȼ-2,$"{Ö:F2}/{Ø:F2}",į,0.32f);ȼ+=22;
    ш(ϲ,20,ȼ,130,8,"H2",қ,р(қ),Į);Ж(ϲ,155,ȼ-2,$"{Ù:F0}/{Ú:F0}L",į,0.32f);ȼ+=22;
    ш(ϲ,20,ȼ,130,8,"Ice",Ҝ,р(Ҝ),Į);Ж(ϲ,155,ȼ-2,$"{Ý:F1}/{Þ:F1}L",į,0.32f);ȼ+=24;
    Ж(ϲ,20,ȼ,$"Ammo: {ǡ}/{Ǣ}  Connector: {(v?"LOCKED":"OPEN")}",į,0.45f);break;
    case 5:
    float ҝ=0,Ҟ=0,ҟ=0,Ҡ=0;foreach(var ǹ in Ţ){ҝ+=ǹ.CurrentStoredPower;Ҟ+=ǹ.MaxStoredPower;ҟ+=ǹ.CurrentInput;Ҡ+=ǹ.CurrentOutput;}
    float ҡ=Ҟ>0?ҝ/Ҟ:0;ш(ϲ,20,ȼ,350,12,$"Battery ({Ţ.Count})",ҡ,р(ҡ),Į);ȼ+=35;
    Ж(ϲ,20,ȼ,$"{ҝ:F1}/{Ҟ:F1} MWh   In: {ҟ*1000:F0}kW   Out: {Ҡ*1000:F0}kW",į,0.42f);ȼ+=25;
    Ж(ϲ,20,ȼ,$"Reactor: {ŭ.Count}   Solar: {Ʃ.Count}   Wind: {ƪ.Count}",į,0.45f);break;
    case 6:
    int Ң=0,ң=0;foreach(var Ͱ in Ƨ)if(Ͱ.IsProducing)Ң++;foreach(var Ƞ in ƨ)if(Ƞ.IsProducing)ң++;
    Ж(ϲ,20,ȼ,$"Refinery: {Ң}/{Ƨ.Count}   Assembly: {ң}/{ƨ.Count}",į,0.5f);ȼ+=25;
    float Ҥ=ǧ>0?(float)Ǟ/ǧ:0;п(ϲ,20,ȼ,200,8,Ҥ,р(Ҥ),Į);Ж(ϲ,225,ȼ-2,$"Ammo: {Ǟ}/{ǧ}",į,0.4f);ȼ+=20;
    float ҥ=é/100f,Ҧ=ê/100f;
    п(ϲ,20,ȼ,100,8,ҥ,р(ҥ),Į);Ж(ϲ,125,ȼ-2,$"H2: {é:F0}%",į,0.4f);
    п(ϲ,220,ȼ,100,8,Ҧ,р(Ҧ),Į);Ж(ϲ,325,ȼ-2,$"O2: {ê:F0}%",į,0.4f);ȼ+=20;
    Ж(ϲ,20,ȼ,$"Bottles: H2 {Č}/{Ď}   O2 {č}/{ď}",į,0.45f);ȼ+=22;
    if(ǀ.Count>0){var ҧ=new Dictionary<string,int>();foreach(var ʕ in ǀ)foreach(var Ѫ in ʕ.Value.Ǘ)Ҩ(ҧ,Ѫ.Key,Ѫ.Value);if(ҧ.Count>0){Ж(ϲ,20,ȼ,$"Miner Cargo ({ǀ.Count}):",ī,0.45f);ȼ+=16;int Ȉ=0;foreach(var ʦ in ҧ){if(Ȉ++>=4)break;Ж(ϲ,30,ȼ,$"{ʩ(ʦ.Key)}: {ʪ(ʦ.Key)} x{ʦ.Value}",į,0.38f);ȼ+=14;}}}break;
    case 7:
    if(d!=K.J){Ж(ϲ,20,ȼ,$"[{Ь()}] No active flight",Ī,0.5f);ȼ+=25;Ж(ϲ,20,ȼ,$"Mode: {f}   Target: {(y?Ň:"NONE")}",į,0.45f);}
    else{int ҩ=(int)(ȿ-Ž).TotalSeconds;Ж(ϲ,20,ȼ,$"T+{ҩ}s   {ŉ}   {ŕ:F0}m   {ř:F0}m/s",ĭ,0.45f);ȼ+=25;
    float Ѿ=1f-(float)(ŕ/(ŕ+1000)),ˋ=(float)Math.Min(ř/500,1);
    ш(ϲ,20,ȼ,200,8,"Distance",Ѿ,ĭ,Į);ȼ+=24;ш(ϲ,20,ȼ,200,8,"Speed",ˋ,ħ,Į);ȼ+=28;
    Ж(ϲ,20,ȼ,$"Position: {Ɔ.X:F0}, {Ɔ.Y:F0}, {Ɔ.Z:F0}",į,0.42f);}break;
    case 8:
    Ж(ϲ,20,ȼ,$"Mode: {f}   Waypoints: {Ɖ.Count}",į,0.5f);ȼ+=25;
    for(int ɮ=0;ɮ<Math.Min(6,Ɖ.Count);ɮ++){var ʽ=Ɖ[ɮ];bool ѷ=ɮ==ô;Ж(ϲ,20,ȼ,ѷ?"> "+ʽ.Name:"  "+ʽ.Name,ѷ?ī:į,0.45f);ȼ+=18;}break;}
    ȼ=230;Ж(ϲ,256,ȼ,"Press OK to Exit",Ī,0.45f,TextAlignment.CENTER);
    ϲ.Dispose();}
        
    MySpriteDrawFrame Ы(IMyTextSurface ɸ){ɸ.ContentType=ContentType.SCRIPT;ɸ.Script="";Í=ɸ.SurfaceSize.X;Î=ɸ.SurfaceSize.Y;Ï=Í/512f;Ð=Î/512f;var ϲ=ɸ.DrawFrame();ϲ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(Í/2,Î/2),new Vector2(Í,Î),ĩ));return ϲ;}
    void Е(MySpriteDrawFrame ϲ,float ȼ,string ɻ,Color ʜ){float Ҫ=ȼ*Ð,ҫ=Í/2;ϲ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(ҫ,Ҫ+12*Ð),new Vector2(Í-12*Ï,24*Ð),ʜ*0.3f));ϲ.Add(new MySprite(SpriteType.TEXT,ɻ,new Vector2(ҫ,Ҫ),null,ʜ,"White",TextAlignment.CENTER,0.8f*Ï));ϲ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(ҫ,Ҫ+24*Ð),new Vector2(Í-32*Ï,2*Ð),ʜ));}
    void п(MySpriteDrawFrame ϲ,float Ȼ,float ȼ,float ǳ,float ʡ,float Ѥ,Color Ҭ,Color ҭ){Ȼ*=Ï;ȼ*=Ð;ǳ*=Ï;ʡ*=Ð;ϲ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(Ȼ+ǳ/2,ȼ+ʡ/2),new Vector2(ǳ,ʡ),ҭ));float Ү=ǳ*Math.Max(0,Math.Min(1,Ѥ));if(Ү>1)ϲ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(Ȼ+Ү/2,ȼ+ʡ/2),new Vector2(Ү,ʡ),Ҭ));}
    void ш(MySpriteDrawFrame ϲ,float Ȼ,float ȼ,float ǳ,float ʡ,string ү,float Ѥ,Color Ҭ,Color ҭ){float К=Ȼ*Ï,Ұ=ȼ*Ð,ұ=ǳ*Ï;ϲ.Add(new MySprite(SpriteType.TEXT,ү,new Vector2(К,Ұ-2*Ð),null,į,"Monospace",TextAlignment.LEFT,0.5f*Ï));п(ϲ,Ȼ,ȼ+12,ǳ,ʡ,Ѥ,Ҭ,ҭ);ϲ.Add(new MySprite(SpriteType.TEXT,$"{Ѥ*100:0}%",new Vector2(К+ұ+5*Ï,Ұ+8*Ð),null,Ҭ,"Monospace",TextAlignment.LEFT,0.45f*Ï));}
    void Ж(MySpriteDrawFrame ϲ,float Ȼ,float ȼ,string ɻ,Color ʜ,float Ҳ=0.5f,TextAlignment Ƞ=TextAlignment.LEFT){ϲ.Add(new MySprite(SpriteType.TEXT,ɻ,new Vector2(Ȼ*Ï,ȼ*Ð),null,ʜ,"Monospace",Ƞ,Ҳ*Ï));}
    void З(MySpriteDrawFrame ϲ,float Ȼ,float ȼ,float ǳ,float ʡ,Color ҭ,Color ҳ){Ȼ*=Ï;ȼ*=Ð;ǳ*=Ï;ʡ*=Ð;ϲ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(Ȼ+ǳ/2,ȼ+ʡ/2),new Vector2(ǳ,ʡ),ҳ));ϲ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(Ȼ+ǳ/2,ȼ+ʡ/2),new Vector2(ǳ-2*Ï,ʡ-2*Ð),ҭ));}
    Color р(float Ǵ){return Ǵ>.7f?Ĩ:Ǵ>.3f?Ĭ:ĭ;}
    void Я(MySpriteDrawFrame ϲ,float ȼ,int Ȓ,string ɻ,bool ɸ){float Ұ=ȼ*Ð;if(ɸ)ϲ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(Í/2,Ұ+10*Ð),new Vector2(Í-32*Ï,22*Ð),ī*0.4f));ϲ.Add(new MySprite(SpriteType.TEXT,ɻ,new Vector2(20*Ï,Ұ),null,ɸ?ī:į,"Monospace",TextAlignment.LEFT,0.55f*Ï));}
    void Ѱ(MySpriteDrawFrame ϲ,float ȼ){ϲ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(Í/2,ȼ*Ð),new Vector2(Í-32*Ï,2*Ð),Ī));}
        
    void Ф(){
    if(ŀ.Count==0)return;
    foreach(var ˊ in ŀ){var Д=ˊ as IMyTextSurface;if(Д==null)continue;var Ҵ=Ы(Д);float ȼ=5;
    Е(Ҵ,ȼ,"BLACK BOX",ĭ);ȼ+=35;
    if(µ&&d==K.J){Ж(Ҵ,20,ȼ,$"{ŉ}  G:{Ņ}",ħ,0.5f);ȼ+=20;Ж(Ҵ,20,ȼ,$"Alt:{Œ:F0}  Spd:{œ:F0}  Dst:{ŕ:F0}",į,0.45f);ȼ+=20;float ɋ=(float)Ŕ/100f;ш(Ҵ,20,ȼ,200,8,"H2",ɋ,р(ɋ),Į);Ж(Ҵ,230,ȼ,$"g:{ŗ:F2}",į,0.4f);ȼ+=25;}
    else if(Ã){Ж(Ҵ,20,ȼ,$"OUTCOME: {ŋ}",Ĭ,0.55f);ȼ+=25;}
    Ѱ(Ҵ,ȼ);ȼ+=10;Ж(Ҵ,20,ȼ,"LOG",Ī,0.45f);ȼ+=18;
    if(ł.Length>0){var Μ=ł.Split('\n');int ʜ=0;for(int ɮ=Μ.Length-1;ɮ>=0&&ʜ<8;ɮ--)if(Μ[ɮ].Length>1){Ж(Ҵ,20,ȼ,Μ[ɮ],į,0.35f);ȼ+=14;ʜ++;}}
    Ҵ.Dispose();}
    }
    void ȳ(){ҵ();var ҷ=Ҷ(Me.CustomData);var ʜ=new StringBuilder();
    ʜ.AppendLine("[SYSTEM]");
    ʜ.AppendLine($"pad_ready=true");
    ʜ.AppendLine($"pad_session={Ǿ}");
    ʜ.AppendLine("[BLACKBOX]");
    if(ҷ.ContainsKey("[BLACKBOX]")){var Ҹ=ҷ["[BLACKBOX]"].Split('\n');foreach(var Μ in Ҹ){string ɻ=Μ.Trim();if(ɻ.Length>0&&!ɻ.StartsWith("[BLACKBOX]")&&!ɻ.StartsWith("; System"))ʜ.AppendLine(ɻ);}}
    ʜ.AppendLine("[PAD_CFG]");
    ʜ.AppendLine($"load={Ǣ}");
    ʜ.AppendLine($"type={Ǥ}");
    string ҹ=d==K.A?"INIT":d==K.B?"IDLE":d==K.C?"PRINT":d==K.D?"BUILD":d==K.E?"DOCK":d==K.F?"FUEL":d==K.G?"READY":d==K.H?"ARM":d==K.I?"LAUNCH":d==K.J?"GONE":"?";
    ʜ.AppendLine($"state={ҹ}");
    ʜ.AppendLine($"phase={ŉ}");
    int Һ=0;if(ĸ!=null){var һ=ĸ.GetInventory();if(һ!=null)Һ=(int)һ.GetItemAmount(Ǭ);}int Ҽ=Ǣ-Һ;
    ʜ.AppendLine($"ammoReq={(d==K.F&&Ҽ>0?1:0)}");
    ʜ.AppendLine($"ammoReqNeed={Ҽ}");
    ʜ.AppendLine($"ammoReqType={Ǥ}");
    ʜ.AppendLine($"ammoHave={Һ}");
    ʜ.AppendLine("[PAD_STATUS]");
    string ђ=É?"CONTROLLER":d==K.J?"FLIGHT":(Ä||d==K.C||d==K.D)?"PRINT":w?"MISSILE":"NORMAL";
    ʜ.AppendLine($"mode={ђ}");
    ʜ.AppendLine($"connector={(v?"LOCKED":"OPEN")}");
    ʜ.AppendLine($"warheads={ŧ.Count}[{(t?"ARMED":"SAFE")}]");
    float ҽ=0,Ҿ=0,ҿ=0,Ӏ=0,Ӂ=0,ӂ=0;int Ӄ=0,ӄ=0,Ӆ=0;
    if(w){foreach(var ǹ in š){ҽ+=ǹ.CurrentStoredPower;Ҿ+=ǹ.MaxStoredPower;}foreach(var ʡ in ţ){ҿ+=(float)ʡ.FilledRatio*ʡ.Capacity;Ӏ+=ʡ.Capacity;}foreach(var ˬ in Ť){Ӂ+=(float)ˬ.FilledRatio*ˬ.Capacity;ӂ+=ˬ.Capacity;}foreach(var Ɋ in Ū){var ͱ=Ɋ.GetInventory();if(ͱ!=null)foreach(var Ȼ in Ͳ(ͱ))if(Ȼ.Type.SubtypeId=="Ice")Ӄ+=(int)Ȼ.Amount;}foreach(var Ͱ in Ŭ){var ͱ=Ͱ.GetInventory();if(ͱ!=null)foreach(var Ȼ in Ͳ(ͱ))if(Ȼ.Type.SubtypeId=="Uranium")ӄ+=(int)Ȼ.Amount;}foreach(var ɐ in Ŷ)if(ɐ.Status==MyLaserAntennaStatus.Connected)Ӆ++;
    ʜ.AppendLine($"battery={(Ҿ>0?ҽ/Ҿ*100:0):F0}%");
    ʜ.AppendLine($"hydrogen={(Ӏ>0?ҿ/Ӏ*100:0):F0}%");
    ʜ.AppendLine($"oxygen={(ӂ>0?Ӂ/ӂ*100:0):F0}%");
    ʜ.AppendLine($"ice={Ӄ}");
    ʜ.AppendLine($"uranium={ӄ}");
    ʜ.AppendLine($"ammo={ǡ}/{Ǣ}");
    ʜ.AppendLine($"gen={Ū.Count}|h2t={ţ.Count}|o2t={Ť.Count}|react={Ŭ.Count}");}
    int ӆ=Ɯ!=null?Ɯ.RemainingBlocks:0,Ӈ=Ɯ!=null?Ɯ.TotalBlocks:0,ӈ=Ɯ!=null?Ɯ.BuildableBlocksCount:0;float Ӊ=Ƙ.Count>0?Ƙ[0].CurrentPosition:0;
    if(Ä||d==K.C||d==K.D){string Ѳ=Ă==1?"EXTEND":Ă==2?"WELD":"CHECK";ʜ.AppendLine($"prt={Ѳ}|on={(Ä?1:0)}|rem={ӆ}/{Ӈ}|bld={ӈ}|pos={Ӊ:F1}");}
    if(d==K.J||µ){ʜ.AppendLine($"flight={ŉ}|target={Ň}|dist={ŕ:F0}|speed={ř:F0}|alt={Œ:F0}|fuel={Ŕ:F0}%|eta={(ř>0?ŕ/ř:0):F0}");}
    if(É){int ӊ=ƫ.Count,Ӌ=0,ӌ=0,Ӎ=0;foreach(int ɨ in ƫ){if(ư.ContainsKey(ɨ)&&ư[ɨ])Ӌ++;if(Ʊ.ContainsKey(ɨ)&&Ʊ[ɨ])ӌ++;if(ƭ.ContainsKey(ɨ)&&ƭ[ɨ]=="GONE")Ӎ++;}string ӎ=f==X.R?"GPS":f==X.S?"ANT":f==X.T?"SEN":f==X.U?"LDR":f==X.W?"SAT":"MAN";
    ʜ.AppendLine($"ctrl={ӊ}|arm={Ӌ}|rdy={ӌ}|fly={Ӎ}|md={ӎ}|st={(Ê?"SALVO":"OK")}");}
    ʜ.AppendLine("[PAD_DATA]");
    ʜ.AppendLine($"tgtGPS={ƅ.X:F0},{ƅ.Y:F0},{ƅ.Z:F0}|tgtName={Ň}|tgtSet={(y?1:0)}");
    if(w){ʜ.AppendLine($"merged={(u?1:0)}|conLocked={(v?1:0)}|warArmed={(t?1:0)}|warCount={ŧ.Count}");
    ʜ.AppendLine($"mslBatPct={(Ҿ>0?ҽ/Ҿ*100:0):F0}|mslBatC={ҽ:F2}|mslBatM={Ҿ:F2}");
    ʜ.AppendLine($"mslH2Pct={(Ӏ>0?ҿ/Ӏ*100:0):F0}|mslH2F={ҿ:F0}|mslH2C={Ӏ:F0}");
    ʜ.AppendLine($"mslO2Pct={(ӂ>0?Ӂ/ӂ*100:0):F0}|mslO2F={Ӂ:F0}|mslO2C={ӂ:F0}");
    ʜ.AppendLine($"mslIce={Ӄ}|mslUran={ӄ}|mslAmmo={ǡ}|mslAmmoLoad={Ǣ}");
    ʜ.AppendLine($"mslGenCnt={Ū.Count}|mslH2Cnt={ţ.Count}|mslO2Cnt={Ť.Count}|mslReactCnt={Ŭ.Count}");
    ʜ.AppendLine($"mslCount=1|mslReady={(d==K.G||d==K.H?1:0)}|mslArmed={(d==K.H?1:0)}|mslLsrCnt={Ŷ.Count}|mslLsrLnk={Ӆ}|mslAntCnt={Ŵ.Count}");}
    if(Ä||d==K.C||d==K.D){ʜ.AppendLine($"prtState={Ă}|printing={(Ä?1:0)}|prtRem={ӆ}|prtTot={Ӈ}|prtBld={ӈ}|prtPist={Ӊ:F1}");}
    if(d==K.J||µ){ʜ.AppendLine($"msl_phase={ŉ}|target={Ň}|mslDist={ŕ:F0}|mslSpeed={ř:F0}|mslAlt={Œ:F0}|mslFuel={Ŕ:F0}|mslETA={(ř>0?ŕ/ř:0):F0}");}
    if(É){int ӏ=ƫ.Count,Ӑ=0,ӑ=0,Ӓ=0;foreach(int ɨ in ƫ){if(ư.ContainsKey(ɨ)&&ư[ɨ])Ӑ++;if(Ʊ.ContainsKey(ɨ)&&Ʊ[ɨ])ӑ++;if(ƭ.ContainsKey(ɨ)&&ƭ[ɨ]=="GONE")Ӓ++;}string ӓ=f==X.R?"GPS":f==X.S?"ANTENNA":f==X.T?"SENSOR":f==X.U?"LIDAR":f==X.W?"SATELLITE":"MANUAL";
    ʜ.AppendLine($"ctrlPads={ӏ}|ctrlArmed={Ӑ}|ctrlReady={ӑ}|mslCount={Ӓ}|ctrlMode={ӓ}|ctrlTarget={Ň}|ctrlStatus={(Ê?"SALVO":"ACTIVE")}");}
    if(Ä||d==K.C||d==K.D){
    if(ӆ>0&&ӈ<ӆ){int н=Math.Max(1,ӆ/5);ʜ.Append($"[BLUEPRINT]\nSteelPlate={н*10}\nConstruction={н*5}\nSmallTube={н*3}\nLargeTube={н*2}\nMotor={н*2}\nComputer={н*2}\nThrust={н*3}\nExplosives={н*4}\nPowerCell={н}\nDetector={н}\nRadioComm={н}\n");}}
    Me.CustomData=ʜ.ToString();}
    void ҵ(){string ȅ=Me.CustomData;if(string.IsNullOrEmpty(ȅ))return;bool Ӕ=false;var ӕ=ȅ.Split('\n');foreach(var ɐ in ӕ){string ѐ=ɐ.Trim();if(ѐ.StartsWith("[SET]")||ѐ.StartsWith("[PAD_CFG]")){Ӕ=true;continue;}if(ѐ.StartsWith("[")&&Ӕ){Ӕ=false;continue;}if(!Ӕ||ѐ.StartsWith(";")||ѐ.StartsWith("#")||!ѐ.Contains("="))continue;var Ѳ=ѐ.Split('|');foreach(var Ǵ in Ѳ){string σ=Ǵ.Split(';')[0].Trim();var ʕ=σ.Split('=');if(ʕ.Length<2)continue;string ϴ=ʕ[0].Trim(),Ϯ=ʕ[1].Trim();int Ș;if(!int.TryParse(Ϯ.Split(' ')[0],out Ș))continue;if(ϴ=="tgt")ǟ=Ș;else if(ϴ=="load")Ǣ=Ș;else if(ϴ=="ice")Đ=Ș;else if(ϴ=="uran")đ=Ș;else if(ϴ=="h2")Ď=Ș;else if(ϴ=="o2")ď=Ș;else if(ϴ=="tool")ǥ=Ș;else if(ϴ=="pAmmo")Ǧ=Ș;else if(ϴ=="type"&&Ș>=0&&Ș<5)Ǥ=Ș;}}}
    List<MyInventoryItem>Ͳ(IMyInventory Ϯ){var Ӗ=new List<MyInventoryItem>();if(Ϯ!=null)Ϯ.GetItems(Ӗ);return Ӗ;}
    void Ҩ(Dictionary<string,int>ȅ,string ϴ,int Ϯ){if(ȅ.ContainsKey(ϴ))ȅ[ϴ]+=Ϯ;else ȅ[ϴ]=Ϯ;}
    Dictionary<string,string>Ҷ(string ȅ){var Ͱ=new Dictionary<string,string>();if(string.IsNullOrEmpty(ȅ))return Ͱ;string Ε="";var ˡ=new StringBuilder();var ӗ=ȅ.Split('\n');foreach(var ɐ in ӗ){if(ɐ.StartsWith("[")){int ɹ=ɐ.IndexOf("]");if(ɹ>0){if(Ε!=""&&ˡ.Length>0)Ͱ[Ε]=ˡ.ToString();Ε=ɐ.Substring(0,ɹ+1);ˡ.Clear();ˡ.Append(ɐ).Append("\n");continue;}}if(Ε!=""&&ɐ.Length>0)ˡ.Append(ɐ).Append("\n");}if(Ε!=""&&ˡ.Length>0)Ͱ[Ε]=ˡ.ToString();return Ͱ;}
    void Х(){
    foreach(var Ә in Ł){var Д=Ә as IMyTextSurface;if(Д==null)continue;
    Д.ContentType=ContentType.SCRIPT;Д.Script="";
    float ǳ=Д.SurfaceSize.X,ʡ=Д.SurfaceSize.Y,ɸ=Math.Min(ǳ,ʡ)/512f;
    var ϲ=Д.DrawFrame();
    ϲ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(ǳ/2,ʡ/2),new Vector2(ǳ,ʡ),ĩ));
    ϲ.Add(new MySprite(SpriteType.TEXT,$"SAT GRID - PAD{Ć}",new Vector2(ǳ/2,10*ɸ),null,ī,"White",TextAlignment.CENTER,0.6f*ɸ));
    int ә=5;float Ӛ=ǳ/2,ӛ=ʡ/2+15*ɸ,Ӝ=Math.Min(ǳ-40*ɸ,ʡ-80*ɸ)/(ә*2+1);
    for(int ɤ=-ә;ɤ<=ә;ɤ++){float ӝ=Ӛ+ɤ*Ӝ;ϲ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(ӝ,ӛ),new Vector2(1,Ӝ*(ә*2+1)),Į));}
    for(int ɥ=-ә;ɥ<=ә;ɥ++){float Ӟ=ӛ+ɥ*Ӝ;ϲ.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(Ӛ,Ӟ),new Vector2(Ӝ*(ә*2+1),1),Į));}
    ϲ.Add(new MySprite(SpriteType.TEXTURE,"Circle",new Vector2(Ӛ,ӛ),new Vector2(10*ɸ,10*ɸ),ħ));
    foreach(int ʄ in Ƭ){
    if(!ƹ.ContainsKey(ʄ)||!ƺ.ContainsKey(ʄ))continue;
    int ɤ=ƹ[ʄ],ɥ=ƺ[ʄ];
    if(Math.Abs(ɤ)>ә||Math.Abs(ɥ)>ә)continue;
    float К=Ӛ+ɤ*Ӝ,Ұ=ӛ+ɥ*Ӝ;
    int Ǆ=Ʒ.ContainsKey(ʄ)?Ʒ[ʄ]:0;
    string ɛ=Ư.ContainsKey(ʄ)?Ư[ʄ]:"?";
    Color н=ɛ=="SAT_INTERCEPT"?ĭ:ɛ=="SAT_HOLD"||ɛ=="ACTIVE"?Ĩ:Ǆ<30?Ĭ:Ĩ;
    ϲ.Add(new MySprite(SpriteType.TEXTURE,"Circle",new Vector2(К,Ұ),new Vector2(8*ɸ,8*ɸ),н));
    ϲ.Add(new MySprite(SpriteType.TEXT,$"{Ǆ}",new Vector2(К,Ұ-4*ɸ),null,į,"Monospace",TextAlignment.CENTER,0.25f*ɸ));}
    float ӟ=ʡ-25*ɸ;
    ϲ.Add(new MySprite(SpriteType.TEXT,$"Satellites: {Ƭ.Count}   Replace Queue: {ƻ.Count}",new Vector2(ǳ/2,ӟ),null,į,"Monospace",TextAlignment.CENTER,0.4f*ɸ));
    ϲ.Dispose();}}
}
