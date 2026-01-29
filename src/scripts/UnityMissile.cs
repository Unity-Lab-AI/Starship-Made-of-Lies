public enum T{GPS,ANTENNA,SENSOR,LIDAR,MANUAL,SATELLITE}
public enum F{IDLE,CLIMB,ARM,COAST,REENTRY,TARGET,SAT_CLIMB,SAT_BRAKE,SAT_HOLD,SAT_INTERCEPT}
T mode=T.GPS;
F phase=F.IDLE;
Vector3D tgtGPS;
Vector3D launchPos;
Vector3D launchDir;
string tgtAntenna="";
string broadcastTag="UNITY_MSL";
double climbDist=500;
double detDist=50;
double sensorRange=50;
double lidarRange=500;
double lidarAng=5;
bool antBroadcast=true;
bool inSpace=false;
bool launchedFromGrav=false;
double padGravity=0;
IMyRemoteControl rc;
List<IMyGyro> gyros=new List<IMyGyro>();
List<IMyThrust> thrusters=new List<IMyThrust>();
List<IMyWarhead> warheads=new List<IMyWarhead>();
List<IMySensorBlock> sensors=new List<IMySensorBlock>();
List<IMyCameraBlock> cameras=new List<IMyCameraBlock>();
List<IMyRadioAntenna> antennas=new List<IMyRadioAntenna>();
List<IMyLaserAntenna> lasers=new List<IMyLaserAntenna>();
IMyBroadcastListener listener;
IMyBroadcastListener cmdListener;
Random rnd=new Random();
double lastDist=double.MaxValue;
double distToTgt=0;
double distFromPad=0;
int stuckCount=0;
bool warheadsArmed=false;
double armDist=0;
Vector3D? lidarTgt=null;
MyDetectedEntityInfo lidarHit;
bool lidarLock=false;
bool coasting=false;
int reentryTicks=0;
double lastCoastSpeed=0;
double reentryDist=500;
int flightMode=2;
double spaceClimbDist=1000;
Vector3D zeroGPos;
bool reachedZeroG=false;
double currentGrav=0;
double lastGrav=0;
bool inBlackout=false;
bool wasInBlackout=false;
double antennaRange=50000;
int blackoutTicks=0;
bool blackoutConverted=false;
Vector3D padLaserPos;
bool useLaser=false;
int mslNumber=0;
int padID=1;
int tgtRel=0;
List<IMyBatteryBlock> batteries=new List<IMyBatteryBlock>();
List<IMyGasTank> h2tanks=new List<IMyGasTank>();
List<IMyGasGenerator> generators=new List<IMyGasGenerator>();
List<IMyLightingBlock> lights=new List<IMyLightingBlock>();
List<IMyTextPanel> lcds=new List<IMyTextPanel>();
List<IMyFunctionalBlock> emotionCtrls=new List<IMyFunctionalBlock>();
Color cBg=new Color(10,10,15);Color cTxt=new Color(220,220,220);
List<string[]> msgQ=new List<string[]>();
string[] curMsg=null;
string msgEmotion="neutral";
int msgTicks=0;
const int MSG_MIN_TICKS=2;
double lastH2=-1,lastBat=-1;
F lastPhase=F.IDLE;
bool lastArmed=false;
int idleCycle=0;
int idleTicks=0;
Vector3D lastGPS=Vector3D.Zero;
bool gpsAnnounced=false;
int startupCheck=0;
bool startupDone=false;
bool bootComplete=false;
int bootWaitTicks=0;
string lastPadSession="";
IMyShipMergeBlock merge;
IMyShipConnector ammoConnector;
bool ammoEjecting=false;
bool isSatellite=false;
Vector3D satPosition;
Vector3D satVelocity;
bool satStationKeeping=false;
int satHoldTicks=0;
int satFallTicks=0;
int interceptLostTicks=0;
string satRelayTag="UNITY_SAT_RELAY";
IMyBroadcastListener satRelayListener;
IMyBroadcastListener satInterceptListener;
double satTargetAlt=62000;
int satID=0;
int satGridX=0;
int satGridZ=0;
double satGridSpacing=5000;
Vector3D satGridOrigin=Vector3D.Zero;
IMyLaserAntenna laserPad;
IMyLaserAntenna laserNorth;
IMyLaserAntenna laserSouth;
IMyLaserAntenna laserEast;
IMyLaserAntenna laserWest;
bool meshPadLinked=false;
int meshBlackoutTicks=0;
int meshPingTicks=0;
int meshLastPadResponse=0;
const int MESH_TIMEOUT=300;
const int MESH_PING_INTERVAL=60;
IMyBroadcastListener meshListener;
Dictionary<int,Vector3D> meshAnchors=new Dictionary<int,Vector3D>();
Dictionary<int,int> meshAnchorAge=new Dictionary<int,int>();
Vector3D interceptTarget=Vector3D.Zero;
double interceptDetonateDist=10;
double evadeAmplitude=0;
double evadeFrequency=2;
int evadePattern=1;
bool evadeEnabled=false;
DateTime evadeStartTime;
double evadePhaseOffset=0;
int evadeToggleTicks=0;
double spiralRadius=0;
double spiralSpeed=0.5;
double spiralStartDist=500;
int spiralPhase=0;
double terminalGuidanceDist=0;
Vector3D lastTargetPos;
Vector3D lastTargetVel=Vector3D.Zero;
int targetVelSamples=0;
bool terminalGuidanceActive=false;
double terminalGyroMult=2;
bool gyrosLocked=true;
int climbTicks=0;
int climbLockTicks=30;
int flightTicks=0;
double minAltitude=500;
double altitudeApproachDist=550;
double currentAltitude=0;
Vector3D launchUp=Vector3D.Zero;

public Program(){
Runtime.UpdateFrequency=UpdateFrequency.Update100;
ParseConfig();
FindBlocks();
ConfigSensors();
ConfigCameras();
NameParts();
LoadState();
if(phase==F.IDLE){tgtGPS=Vector3D.Zero;mode=T.GPS;bootComplete=false;startupDone=false;startupCheck=0;gpsAnnounced=false;}
}
public void Save(){Storage=$"{(int)phase}|{(int)mode}|{tgtGPS.X},{tgtGPS.Y},{tgtGPS.Z}|{(warheadsArmed?"1":"0")}|{launchPos.X},{launchPos.Y},{launchPos.Z}|{(blackoutConverted?"1":"0")}";}
void LoadState(){
if(string.IsNullOrEmpty(Storage))return;
var p=Storage.Split('|');
if(p.Length>=5){
int ph,md;
if(int.TryParse(p[0],out ph))phase=(F)ph;
if(int.TryParse(p[1],out md))mode=(T)md;
var g=p[2].Split(',');if(g.Length==3){double x,y,z;if(double.TryParse(g[0],out x)&&double.TryParse(g[1],out y)&&double.TryParse(g[2],out z))tgtGPS=new Vector3D(x,y,z);}
warheadsArmed=p[3]=="1";
var l=p[4].Split(',');if(l.Length==3){double x,y,z;if(double.TryParse(l[0],out x)&&double.TryParse(l[1],out y)&&double.TryParse(l[2],out z))launchPos=new Vector3D(x,y,z);}
if(p.Length>=6)blackoutConverted=p[5]=="1";
if(phase!=F.IDLE)Runtime.UpdateFrequency=UpdateFrequency.Update10;
}}

public void Main(string a,UpdateType u){
if(a=="NAME"){FindBlocks();NameParts();return;}
if(a=="RESET"){FindBlocks();SafeReset();return;}
if(a=="LAUNCH"){
ParseConfig();
var allMerges=new List<IMyShipMergeBlock>();
GridTerminalSystem.GetBlocksOfType(allMerges,m=>m.CubeGrid==Me.CubeGrid);
foreach(var m in allMerges)m.Enabled=false;
FindBlocks();
if(rc==null||thrusters.Count==0){Echo("Missing RC or thrusters - check blocks");return;}
lastDist=double.MaxValue;
stuckCount=0;
flightTicks=0;
if(merge!=null)merge.Enabled=false;
NameParts();
ConfigSensors();
ConfigCameras();
ConfigAntennas();
launchPos=Me.GetPosition();
warheadsArmed=false;
foreach(var w in warheads){w.IsArmed=false;}
if(rc!=null){launchDir=rc.WorldMatrix.Forward;launchUp=rc.WorldMatrix.Up;}
else{launchDir=Me.WorldMatrix.Forward;launchUp=Me.WorldMatrix.Up;}
Vector3D grav=rc!=null?rc.GetNaturalGravity():Vector3D.Zero;
launchedFromGrav=grav.Length()>0.05;
if(launchedFromGrav)launchUp=Vector3D.Normalize(-grav);
inSpace=!launchedFromGrav;
gyrosLocked=false;
climbTicks=0;
Runtime.UpdateFrequency=UpdateFrequency.Update10;
EnableThrustUp(launchUp);
foreach(var b in batteries)b.ChargeMode=ChargeMode.Discharge;
foreach(var g in generators)g.Enabled=true;
evadeStartTime=DateTime.Now;
evadePhaseOffset=(double)(mslNumber%10)*0.1;
spiralPhase=0;
targetVelSamples=0;
lastTargetVel=Vector3D.Zero;
if(mode==T.ANTENNA&&!string.IsNullOrEmpty(tgtAntenna)){
listener=IGC.RegisterBroadcastListener(tgtAntenna);
}
cmdListener=IGC.RegisterBroadcastListener(broadcastTag+"_CMD");
if(mode==T.SATELLITE){
isSatellite=true;
satRelayListener=IGC.RegisterBroadcastListener(satRelayTag);
satInterceptListener=IGC.RegisterBroadcastListener("UNITY_SAT_INTERCEPT");
meshListener=IGC.RegisterBroadcastListener("UNITY_SAT_MESH");
meshPadLinked=true;
meshBlackoutTicks=0;
meshLastPadResponse=0;
phase=F.SAT_CLIMB;
QR(new[]{"TO SPACE!","Damn right!","DEPLOYING!","Orbit bitch","SPACE BOUND","Hell yeah!","LAUNCHING!","Suck it!"},"wink");
}else if(flightMode==2){
phase=launchedFromGrav?F.CLIMB:F.TARGET;
QR(new[]{"YEEHAW!","Kill time!","LET'S GO!","Die bitches","LAUNCHING!","Eat this!","FIRED UP!","Hell yeah!","SEND IT!","Suck it!"},"wink");
}else{
phase=F.CLIMB;
QR(new[]{"FULL SEND!","ICBM bitch","GOING UP!","Eat my ass!","ICBM MODE!","Sky's mine!","LAUNCHING!","Die already"},"wink");
}
return;
}
if(phase!=F.IDLE){
flightTicks++;
UpdateDistances();
CheckRemoteCmd();
switch(phase){
case F.CLIMB:DoClimb();break;
case F.ARM:DoArm();break;
case F.COAST:DoCoast();break;
case F.REENTRY:DoReentry();break;
case F.TARGET:DoTarget();break;
case F.SAT_CLIMB:DoSatClimb();break;
case F.SAT_BRAKE:DoSatBrake();break;
case F.SAT_HOLD:DoSatHold();break;
case F.SAT_INTERCEPT:DoSatIntercept();break;
}
UpdateDistances();
if(antBroadcast)BroadcastPos();
}
UpdateEcho();
UpdateFlightLights();
UpdateLCD();
}

void DoClimb(){
if(rc==null){EnableThrust(true);return;}
climbTicks++;
double dist=Vector3D.Distance(Me.GetPosition(),launchPos);
Vector3D grav=rc.GetNaturalGravity();
lastGrav=currentGrav;
currentGrav=grav.Length();
bool nowInSpace=currentGrav<0.05;
if(launchedFromGrav&&currentGrav>0.05){
double alt;
if(rc.TryGetPlanetElevation(MyPlanetElevation.Surface,out alt))currentAltitude=alt;
else currentAltitude=dist;
}else{currentAltitude=dist;}
if(flightMode==1&&launchedFromGrav){
if(currentGrav>0.05){
Vector3D up=Vector3D.Normalize(-grav);
AimAtUp(up);
reachedZeroG=false;
}else{
if(!reachedZeroG){reachedZeroG=true;zeroGPos=Me.GetPosition();}
double pastZeroG=Vector3D.Distance(Me.GetPosition(),zeroGPos);
if(pastZeroG>=spaceClimbDist){inSpace=true;EnableThrust(true);phase=F.ARM;return;}
Vector3D toTgt=Vector3D.Normalize(tgtGPS-Me.GetPosition());
Vector3D upish=Vector3D.Normalize(zeroGPos-launchPos);
Vector3D blendDir=Vector3D.Normalize(upish+toTgt*0.3);
AimAt(Me.GetPosition()+blendDir*1000);
EnableThrust(true);
}
return;
}
if(launchedFromGrav){
if(nowInSpace){inSpace=true;phase=flightMode==2?F.TARGET:F.ARM;return;}
Vector3D up=Vector3D.Normalize(-grav);
AimAtUp(up);
if(dist>=climbDist&&currentAltitude>=minAltitude){phase=flightMode==2?F.TARGET:F.ARM;}
}else{
AimAt(Me.GetPosition()+launchDir*1000);
if(dist>=climbDist){phase=flightMode==2?F.TARGET:F.ARM;}
}
}

void DoArm(){
if(rc==null){EnableThrust(true);return;}
if(!ammoEjecting&&ammoConnector!=null){ammoConnector.ThrowOut=true;ammoEjecting=true;SendFinalStatus("AMMO_EJECT");QR(new[]{"Dump this!","Lighter now","Ejecting!","Screw ammo!","Tossing it!","Ammo out!"},"skeptical");}
Vector3D grav=rc.GetNaturalGravity();
if(grav.Length()<0.05){
lastCoastSpeed=0;
coasting=false;
phase=F.COAST;
}else{
phase=F.TARGET;
}
}

void DoCoast(){
if(rc==null){EnableThrust(true);return;}
Vector3D grav=rc.GetNaturalGravity();
currentGrav=grav.Length();
Vector3D? target=GetTarget();
if(!target.HasValue){phase=F.TARGET;return;}
double dist=Vector3D.Distance(Me.GetPosition(),target.Value);
distToTgt=dist;
if(currentGrav>0.1){
phase=F.REENTRY;
reentryTicks=0;
EnableThrust(true);
return;
}
if(dist<reentryDist){
EnableThrust(true);
phase=F.TARGET;
return;
}
AimAt(target.Value);
Vector3D vel=rc.GetShipVelocities().LinearVelocity;
double speed=vel.Length();
Vector3D toTarget=Vector3D.Normalize(target.Value-Me.GetPosition());
double alignment=speed>1?Vector3D.Dot(Vector3D.Normalize(vel),toTarget):0;
bool onCourse=alignment>0.98;
double speedDelta=speed-lastCoastSpeed;
lastCoastSpeed=speed;
bool atMaxSpeed=speedDelta<0.5&&speed>50;
if(onCourse&&atMaxSpeed){
EnableThrust(false);
coasting=true;
}else{
EnableThrust(true);
coasting=false;
}
}

void DoReentry(){
if(rc==null){EnableThrust(true);return;}
EnableThrust(true);
reentryTicks++;
Vector3D? target=GetTarget();
if(target.HasValue){
AimAt(target.Value);
distToTgt=Vector3D.Distance(Me.GetPosition(),target.Value);
if(distToTgt<reentryDist/2&&reentryTicks>30)phase=F.TARGET;
}
}

void DoTarget(){
if(rc!=null){Vector3D g=rc.GetNaturalGravity();currentGrav=g.Length();}
if(mode==T.MANUAL){EnableThrust(true);double mh=0;foreach(var t in h2tanks)mh+=t.FilledRatio;if(h2tanks.Count>0)mh/=h2tanks.Count;double mb=0;foreach(var b in batteries)mb+=b.CurrentStoredPower/b.MaxStoredPower;if(batteries.Count>0)mb/=batteries.Count;if((mh<0.05&&h2tanks.Count>0)||(mb<0.05&&batteries.Count>0)){warheadsArmed=true;foreach(var w in warheads)w.IsArmed=true;Detonate();}return;}
Vector3D? target=GetTarget();
if(target.HasValue){
double dist=Vector3D.Distance(Me.GetPosition(),target.Value);
distToTgt=dist;
double missileSpeed=rc!=null?rc.GetShipVelocities().LinearVelocity.Length():0;
if(currentGrav>0.1){UpdateAltitude();}
terminalGuidanceActive=dist<terminalGuidanceDist;
double actualArmDist=armDist>0?armDist:detDist*4;
double safetyDist=Math.Max(climbDist*5,500);
if(!warheadsArmed&&!isSatellite&&phase==F.TARGET&&flightTicks>100&&distFromPad>safetyDist&&dist<actualArmDist&&dist>detDist*2){
foreach(var w in warheads){w.IsArmed=true;}
warheadsArmed=true;
SendFinalStatus("WARHEADS_ARMED");
QR(new[]{"I'M HOT!","Damn right!","ARMED!","Die bastards","WEAPONS HOT","Primed!","LOCKED IN!","Ur screwed!"},"evil");
}
if(terminalGuidanceActive)UpdateTargetVelocity(target.Value);
Vector3D aimPoint=target.Value;
if(terminalGuidanceActive&&lastTargetVel.Length()>1)aimPoint=PredictTargetPosition(target.Value,dist);
bool holdAltitude=currentGrav>0.1&&dist>altitudeApproachDist&&currentAltitude<minAltitude;
if(holdAltitude&&rc!=null){
Vector3D gravVec=rc.GetNaturalGravity();
Vector3D upDir=Vector3D.Normalize(-gravVec);
Vector3D toTarget=Vector3D.Normalize(target.Value-Me.GetPosition());
double altDef=minAltitude-currentAltitude;
double upComp=Math.Min(altDef/100,1.0);
Vector3D blendDir=Vector3D.Normalize(toTarget+upDir*upComp);
aimPoint=Me.GetPosition()+blendDir*dist;
}else if(currentGrav>0.1&&rc!=null){
if(missileSpeed<10)missileSpeed=100;
double timeToTgt=dist/missileSpeed;
Vector3D gravVec=rc.GetNaturalGravity();
Vector3D gravDrop=0.5*gravVec*timeToTgt*timeToTgt;
aimPoint=aimPoint-gravDrop;
}
if(spiralRadius>0&&dist<spiralStartDist&&dist>detDist*2){spiralPhase++;aimPoint=ComputeSpiralTarget(aimPoint,Me.GetPosition());}
if(dist<detDist){Detonate();return;}
if(dist<detDist*4&&dist>=lastDist){stuckCount++;if(stuckCount>30){Detonate();return;}}
else stuckCount=0;
lastDist=dist;
if(evadeEnabled&&dist<detDist*4)AimAtWithEvasion(aimPoint,Me.GetPosition());
else if(terminalGuidanceActive)AimAtTerminal(aimPoint);
else AimAt(aimPoint);
bool fuelSave=missileSpeed>85&&dist>altitudeApproachDist*2;
if(fuelSave){foreach(var t in thrusters)t.ThrustOverridePercentage=0.7f;}
else{EnableThrust(true);}
}}

void DoSatClimb(){
if(rc==null)return;
Vector3D grav=rc.GetNaturalGravity();
currentGrav=grav.Length();
double alt=0;
rc.TryGetPlanetElevation(MyPlanetElevation.Sealevel,out alt);
if(alt>=satTargetAlt||currentGrav<0.05){
satPosition=Me.GetPosition();
satVelocity=rc.GetShipVelocities().LinearVelocity;
phase=F.SAT_BRAKE;
return;
}
Vector3D up=Vector3D.Normalize(-grav);
AimAtUp(up);
EnableThrust(true);
}

void DoSatBrake(){
if(rc==null)return;
satVelocity=rc.GetShipVelocities().LinearVelocity;
double speed=satVelocity.Length();
if(speed<0.5){
satPosition=Me.GetPosition();
satStationKeeping=true;
satHoldTicks=0;
satFallTicks=0;
phase=F.SAT_HOLD;
Runtime.UpdateFrequency=UpdateFrequency.Update100;
return;
}
Vector3D brakeDir=Vector3D.Normalize(-satVelocity);
AimAt(Me.GetPosition()+brakeDir*1000);
EnableThrust(true);
}

void DoSatHold(){
if(rc==null)return;
rc.DampenersOverride=true;
satHoldTicks++;
satVelocity=rc.GetShipVelocities().LinearVelocity;
double speed=satVelocity.Length();
double drift=Vector3D.Distance(Me.GetPosition(),satPosition);
Vector3D grav=rc.GetNaturalGravity();
double gravMag=grav.Length();
if(gravMag>0.5){double fallRate=Vector3D.Dot(satVelocity,Vector3D.Normalize(grav));if(fallRate>5){satFallTicks++;if(satFallTicks>60){warheadsArmed=false;isSatellite=false;phase=F.TARGET;Runtime.UpdateFrequency=UpdateFrequency.Update10;EnableThrust(true);return;}}}else{satFallTicks=0;}
if(drift>10||speed>1){
Vector3D correction=Vector3D.Normalize(satPosition-Me.GetPosition()-satVelocity*0.5);
AimAt(Me.GetPosition()+correction*100);
EnableThrust(speed>0.5||drift>5);
}else{
EnableThrust(false);
float scanYaw=0.1f;
foreach(var g in gyros){g.GyroOverride=true;g.Yaw=scanYaw;g.Pitch=0;g.Roll=0;}
}
double bat=0;foreach(var b in batteries)bat+=b.CurrentStoredPower/b.MaxStoredPower;
if(batteries.Count>0)bat/=batteries.Count;
double h2=0;foreach(var t in h2tanks)h2+=t.FilledRatio;
if(h2tanks.Count>0)h2/=h2tanks.Count;
if(bat<0.1||h2<0.1){IGC.SendBroadcastMessage("UNITY_SAT_INTERCEPT",$"LOW_POWER|{satID}|{padID}|0,0,0|{satGridX},{satGridZ}");foreach(var w in warheads){w.IsArmed=true;w.Detonate();}return;}
foreach(var s in sensors){var det=new List<MyDetectedEntityInfo>();s.DetectedEntities(det);foreach(var e in det){if(IsValidTgt(e.Relationship)){
interceptTarget=e.Position;
Runtime.UpdateFrequency=UpdateFrequency.Update10;
phase=F.SAT_INTERCEPT;
foreach(var w in warheads)w.IsArmed=true;
warheadsArmed=true;
return;
}}}
CheckSatCommands();
RelayMissileTraffic();
UpdateLaserMesh();
ManageMeshConnectivity();
BroadcastSatStatus();
}

void DoSatIntercept(){
if(rc==null)return;
bool found=false;
foreach(var s in sensors){var det=new List<MyDetectedEntityInfo>();s.DetectedEntities(det);foreach(var e in det){if(IsValidTgt(e.Relationship)){interceptTarget=e.Position;found=true;}}}
if(found)interceptLostTicks=0;else interceptLostTicks++;
if(interceptLostTicks>300){IGC.SendBroadcastMessage("UNITY_SAT_INTERCEPT",$"LOST|{satID}|{padID}|0,0,0|{satGridX},{satGridZ}");foreach(var w in warheads){w.IsArmed=true;w.Detonate();}return;}
Vector3D toTarget=interceptTarget-Me.GetPosition();
double dist=toTarget.Length();
distToTgt=dist;
EnableThrust(true);
AimAt(interceptTarget);
if(flightTicks%30==0){
IGC.SendBroadcastMessage("UNITY_SAT_INTERCEPT",$"CHASE|{satID}|{padID}|{interceptTarget.X:F0},{interceptTarget.Y:F0},{interceptTarget.Z:F0}|{dist:F0}");
}
if(dist<interceptDetonateDist){
IGC.SendBroadcastMessage("UNITY_SAT_INTERCEPT",$"DETONATE|{satID}|{padID}|{interceptTarget.X:F0},{interceptTarget.Y:F0},{interceptTarget.Z:F0}|{satGridX},{satGridZ}");
foreach(var w in warheads)w.Detonate();
phase=F.IDLE;
Runtime.UpdateFrequency=UpdateFrequency.None;
}
}

void UpdateLaserMesh(){
if(!isSatellite||lasers.Count==0)return;
foreach(var l in lasers){
if(l==null||!l.IsFunctional)continue;
if(l.Status!=MyLaserAntennaStatus.Connected)l.Connect();
}
}

void ManageMeshConnectivity(){
if(!isSatellite)return;
meshPingTicks++;
bool padLaserOK=laserPad!=null&&laserPad.Status==MyLaserAntennaStatus.Connected;
if(padLaserOK){
meshPadLinked=true;
meshBlackoutTicks=0;
meshLastPadResponse=meshPingTicks;
}else{
meshBlackoutTicks++;
if(meshBlackoutTicks>MESH_TIMEOUT&&meshPadLinked){
meshPadLinked=false;
}
}
ReceiveMeshBroadcasts();
if(!meshPadLinked){
AttemptMeshRelink();
}
if(meshPingTicks%MESH_PING_INTERVAL==0){
BroadcastMeshStatus();
}
AgeOutAnchors();
}

void ReceiveMeshBroadcasts(){
if(meshListener==null)return;
while(meshListener.HasPendingMessage){
var msg=meshListener.AcceptMessage();
if(msg.Data is string){
string data=(string)msg.Data;
var p=data.Split('|');
if(p.Length>=4&&p[0]=="ANCHOR"){
int srcId;
if(int.TryParse(p[1],out srcId)&&srcId!=satID){
var coords=p[2].Split(',');
if(coords.Length==3){
double x,y,z;
if(double.TryParse(coords[0],out x)&&double.TryParse(coords[1],out y)&&double.TryParse(coords[2],out z)){
meshAnchors[srcId]=new Vector3D(x,y,z);
meshAnchorAge[srcId]=0;
if(p[3]=="1"&&!meshPadLinked){
if(IsLaserConnectedTo(srcId)){
meshPadLinked=true;
meshBlackoutTicks=0;
}}}}}}
if(p.Length>=3&&p[0]=="PING"&&p[1]==$"{satID}"){
IGC.SendBroadcastMessage("UNITY_SAT_MESH",$"PONG|{satID}|{p[2]}");
}
if(p.Length>=3&&p[0]=="PONG"){
int srcId;
if(int.TryParse(p[1],out srcId)){
meshLastPadResponse=meshPingTicks;
if(!meshPadLinked){
meshPadLinked=true;
meshBlackoutTicks=0;
}}}}}}

bool IsLaserConnectedTo(int targetSatId){
if(!meshAnchors.ContainsKey(targetSatId))return false;
Vector3D anchorPos=meshAnchors[targetSatId];
foreach(var l in lasers){
if(l==null||l.Status!=MyLaserAntennaStatus.Connected)continue;
Vector3D tgt=l.TargetCoords;
if(Vector3D.Distance(tgt,anchorPos)<100)return true;
}
return false;
}

void AttemptMeshRelink(){
if(meshAnchors.Count==0)return;
Vector3D myPos=Me.GetPosition();
double closestDist=double.MaxValue;
int closestId=-1;
Vector3D closestPos=Vector3D.Zero;
foreach(var kvp in meshAnchors){
double d=Vector3D.Distance(myPos,kvp.Value);
if(d<closestDist){
closestDist=d;
closestId=kvp.Key;
closestPos=kvp.Value;
}}
if(closestId<0)return;
IMyLaserAntenna freeLaser=null;
if(laserNorth!=null&&laserNorth.Status!=MyLaserAntennaStatus.Connected)freeLaser=laserNorth;
else if(laserSouth!=null&&laserSouth.Status!=MyLaserAntennaStatus.Connected)freeLaser=laserSouth;
else if(laserEast!=null&&laserEast.Status!=MyLaserAntennaStatus.Connected)freeLaser=laserEast;
else if(laserWest!=null&&laserWest.Status!=MyLaserAntennaStatus.Connected)freeLaser=laserWest;
if(freeLaser!=null){
string gps=$"GPS:SAT{closestId}:{closestPos.X:F0}:{closestPos.Y:F0}:{closestPos.Z:F0}:#FF75C9F1:";
freeLaser.SetTargetCoords(gps);
freeLaser.Connect();
}}

void BroadcastMeshStatus(){
if(antennas.Count==0&&lasers.Count==0)return;
string linked=meshPadLinked?"1":"0";
Vector3D pos=Me.GetPosition();
string msg=$"ANCHOR|{satID}|{pos.X:F0},{pos.Y:F0},{pos.Z:F0}|{linked}";
IGC.SendBroadcastMessage("UNITY_SAT_MESH",msg);
}

void AgeOutAnchors(){
var toRemove=new List<int>();
foreach(var kvp in meshAnchorAge){
meshAnchorAge[kvp.Key]=kvp.Value+1;
if(kvp.Value>MESH_TIMEOUT*2)toRemove.Add(kvp.Key);
}
foreach(var id in toRemove){
meshAnchors.Remove(id);
meshAnchorAge.Remove(id);
}}

void CheckSatCommands(){
if(cmdListener==null)return;
while(cmdListener.HasPendingMessage){
var msg=cmdListener.AcceptMessage();
if(msg.Data is string){
string cmd=(string)msg.Data;
if(cmd==$"DETONATE:{padID}"){Vector3D p=Me.GetPosition();IGC.SendBroadcastMessage("UNITY_SAT_INTERCEPT",$"DETONATE|{satID}|{padID}|{p.X:F0},{p.Y:F0},{p.Z:F0}|{satGridX},{satGridZ}");foreach(var w in warheads)w.Detonate();phase=F.IDLE;Runtime.UpdateFrequency=UpdateFrequency.None;return;}
if(cmd==$"DEORBIT:{padID}"){isSatellite=false;phase=F.TARGET;Runtime.UpdateFrequency=UpdateFrequency.Update10;EnableThrust(true);}
else if(cmd.StartsWith("ATTACK:")){
var p=cmd.Substring(7).Split(',');
if(p.Length==3){double x,y,z;if(double.TryParse(p[0],out x)&&double.TryParse(p[1],out y)&&double.TryParse(p[2],out z)){
tgtGPS=new Vector3D(x,y,z);mode=T.GPS;isSatellite=false;phase=F.TARGET;Runtime.UpdateFrequency=UpdateFrequency.Update10;EnableThrust(true);}}
}}}
}

void RelayMissileTraffic(){
if(listener!=null){
while(listener.HasPendingMessage){
var msg=listener.AcceptMessage();
if(msg.Data is string){
IGC.SendBroadcastMessage(broadcastTag+"_RELAY",(string)msg.Data);
}}}
if(satRelayListener!=null){
while(satRelayListener.HasPendingMessage){
var msg=satRelayListener.AcceptMessage();
if(msg.Data is string){
IGC.SendBroadcastMessage(broadcastTag,(string)msg.Data);
}}}
}

void BroadcastSatStatus(){
if(antennas.Count==0)return;
double bat=0,h2=0;
foreach(var b in batteries)bat+=b.CurrentStoredPower/b.MaxStoredPower;
if(batteries.Count>0)bat/=batteries.Count;
foreach(var t in h2tanks)h2+=t.FilledRatio;
if(h2tanks.Count>0)h2/=h2tanks.Count;
string lnkPad=laserPad!=null&&laserPad.Status==MyLaserAntennaStatus.Connected?"1":"0";
string lnkN=laserNorth!=null&&laserNorth.Status==MyLaserAntennaStatus.Connected?"1":"0";
string lnkS=laserSouth!=null&&laserSouth.Status==MyLaserAntennaStatus.Connected?"1":"0";
string lnkE=laserEast!=null&&laserEast.Status==MyLaserAntennaStatus.Connected?"1":"0";
string lnkW=laserWest!=null&&laserWest.Status==MyLaserAntennaStatus.Connected?"1":"0";
string meshSt=meshPadLinked?"MESH_OK":"MESH_BLACKOUT";
string ph=phase==F.SAT_HOLD?"HOLD":phase==F.SAT_INTERCEPT?"INTERCEPT":"MOVING";
string status=$"SAT|{satID}|{Me.GetPosition().X:F0},{Me.GetPosition().Y:F0},{Me.GetPosition().Z:F0}|{bat*100:F0}|{h2*100:F0}|{ph}|{satGridX},{satGridZ}|{lnkPad},{lnkN},{lnkS},{lnkE},{lnkW}|{meshSt}";
IGC.SendBroadcastMessage(satRelayTag+"_STATUS",status);
}

void UpdateDistances(){
distFromPad=Vector3D.Distance(Me.GetPosition(),launchPos);
if(mode!=T.LIDAR)distToTgt=Vector3D.Distance(Me.GetPosition(),tgtGPS);
}

void BroadcastPos(){
if(antennas.Count==0)return;
foreach(var a in antennas){if(!a.Enabled||!a.EnableBroadcasting){a.Enabled=true;a.EnableBroadcasting=true;a.Radius=75000f;}}
wasInBlackout=inBlackout;
bool willBlackout=distFromPad>antennaRange*0.95;
inBlackout=distFromPad>antennaRange;
string status=phase.ToString();
if(!wasInBlackout&&willBlackout&&!inBlackout)status="ENTERING_BLACKOUT";
else if(wasInBlackout&&!inBlackout){status="CONTACT_RESTORED";blackoutTicks=0;targetVelSamples=0;lastTargetVel=Vector3D.Zero;}
else if(inBlackout){blackoutTicks++;
if(!blackoutConverted&&blackoutTicks>30){
string fm=$"{Me.GetPosition().X:F0},{Me.GetPosition().Y:F0},{Me.GetPosition().Z:F0},0,BLACKOUT_SAT,0,{distFromPad:F0},0,0,0,FINAL|ORIGTGT:{tgtGPS.X:F0},{tgtGPS.Y:F0},{tgtGPS.Z:F0}";
IGC.SendBroadcastMessage(broadcastTag,fm);
blackoutConverted=true;isSatellite=true;satID=mslNumber*100+padID;satPosition=Me.GetPosition();
Vector3D dir=Vector3D.Normalize(Me.GetPosition()-launchPos);double dd=Vector3D.Distance(Me.GetPosition(),launchPos);
satGridX=(int)Math.Round(dir.X*dd/satGridSpacing);satGridZ=(int)Math.Round(dir.Z*dd/satGridSpacing);
satRelayListener=IGC.RegisterBroadcastListener(satRelayTag);satInterceptListener=IGC.RegisterBroadcastListener("UNITY_SAT_INTERCEPT");
meshListener=IGC.RegisterBroadcastListener("UNITY_SAT_MESH");meshPadLinked=false;
phase=F.SAT_BRAKE;Runtime.UpdateFrequency=UpdateFrequency.Update10;
QR(new[]{"BLACKOUT!","Oh shit!","LOST SIGNAL","Damn it!","NO CONTACT","F***ing hell","SIGNAL LOST","Screw this!"},"shocked");}
return;}
double spd=rc!=null?rc.GetShipVelocities().LinearVelocity.Length():0;
double h2=0;foreach(var t in h2tanks)h2+=t.FilledRatio;if(h2tanks.Count>0)h2/=h2tanks.Count;
double bat=0;foreach(var b in batteries)bat+=b.CurrentStoredPower/b.MaxStoredPower;if(batteries.Count>0)bat/=batteries.Count;
if(phase==F.TARGET&&(h2<0.15||bat<0.15))status="LOW_FUEL";
string camInfo="";if(cameras.Count>0){foreach(var c in cameras)camInfo+=(camInfo.Length>0?";":"")+c.EntityId.ToString()+":"+c.CustomName.Replace("|","").Replace(",","").Replace(":","").Replace(";","");}
string msg=$"{Me.GetPosition().X:F0},{Me.GetPosition().Y:F0},{Me.GetPosition().Z:F0},{distToTgt:F0},{status},{currentGrav:F2},{distFromPad:F0},{currentAltitude:F0},{spd:F0},{h2*100:F0},{(gyrosLocked?"LOCK":"CTRL")}|CAMS:{camInfo}";
IGC.SendBroadcastMessage(broadcastTag,msg);
if(useLaser&&lasers.Count>0){foreach(var l in lasers){if(l.Status!=MyLaserAntennaStatus.Connected)l.Connect();}}
}

void CheckRemoteCmd(){
while(cmdListener!=null&&cmdListener.HasPendingMessage){
var msg=cmdListener.AcceptMessage();
if(msg.Data is string){string cmd=(string)msg.Data;if(cmd==$"DETONATE:{padID}")Detonate();else if(cmd==$"RESET:{padID}"||cmd=="RESET")SafeReset();else if(cmd=="MERGE"&&merge!=null)merge.Enabled=true;}
}
}

void ParseConfig(){
var lines=Me.CustomData.Split('\n');
foreach(var line in lines){
if(line.StartsWith("Mode=")){
string m=line.Substring(5).Trim();
if(m=="GPS")mode=T.GPS;
else if(m=="ANTENNA")mode=T.ANTENNA;
else if(m=="SENSOR")mode=T.SENSOR;
else if(m=="LIDAR")mode=T.LIDAR;
else if(m=="MANUAL")mode=T.MANUAL;
else if(m=="SATELLITE")mode=T.SATELLITE;
}
if(line.StartsWith("GPS=")){
var p=line.Substring(4).Split(',');
if(p.Length==3){
double x,y,z;
if(double.TryParse(p[0],out x)&&double.TryParse(p[1],out y)&&double.TryParse(p[2],out z)){
tgtGPS=new Vector3D(x,y,z);
}}}
if(line.StartsWith("Antenna="))tgtAntenna=line.Substring(8).Trim();
if(line.StartsWith("Broadcast="))broadcastTag=line.Substring(10).Trim();
if(line.StartsWith("Climb=")){double c;if(double.TryParse(line.Substring(6),out c))climbDist=c;}
if(line.StartsWith("Detonate=")){double d;if(double.TryParse(line.Substring(9),out d))detDist=d;}
if(line.StartsWith("ArmDist=")){double a;if(double.TryParse(line.Substring(8),out a))armDist=a;}
if(line.StartsWith("SensorRange=")){double r;if(double.TryParse(line.Substring(12),out r))sensorRange=r;}
if(line.StartsWith("LidarRange=")){double r;if(double.TryParse(line.Substring(11),out r))lidarRange=r;}
if(line.StartsWith("LidarAngle=")){double a;if(double.TryParse(line.Substring(11),out a))lidarAng=a;}
if(line.StartsWith("AntBroadcast=")){antBroadcast=line.Substring(13).Trim()=="1";}
if(line.StartsWith("InSpace=")){inSpace=line.Substring(8).Trim()=="1";}
if(line.StartsWith("Gravity=")){double g;if(double.TryParse(line.Substring(8),out g))padGravity=g;}
if(line.StartsWith("ReentryDist=")){double r;if(double.TryParse(line.Substring(12),out r))reentryDist=r;}
if(line.StartsWith("FlightMode=")){int f;if(int.TryParse(line.Substring(11),out f))flightMode=f;}
if(line.StartsWith("PadLaser=")){var lp=line.Substring(9).Split(',');if(lp.Length==3){double lx,ly,lz;if(double.TryParse(lp[0],out lx)&&double.TryParse(lp[1],out ly)&&double.TryParse(lp[2],out lz)){padLaserPos=new Vector3D(lx,ly,lz);useLaser=true;}}}
if(line.StartsWith("MslNumber=")){int n;if(int.TryParse(line.Substring(10),out n))mslNumber=n;}
if(line.StartsWith("PadID=")){int p;if(int.TryParse(line.Substring(6),out p))padID=p;}
if(line.StartsWith("TargetRel=")){int t;if(int.TryParse(line.Substring(10),out t))tgtRel=t;}
if(line.StartsWith("SatAlt=")){double a;if(double.TryParse(line.Substring(7),out a))satTargetAlt=a;}
if(line.StartsWith("SatID=")){int s;if(int.TryParse(line.Substring(6),out s))satID=s;}
if(line.StartsWith("SatGridX=")){int x;if(int.TryParse(line.Substring(9),out x))satGridX=x;}
if(line.StartsWith("SatGridZ=")){int z;if(int.TryParse(line.Substring(9),out z))satGridZ=z;}
if(line.StartsWith("GridSpacing=")){double g;if(double.TryParse(line.Substring(12),out g))satGridSpacing=g;}
if(line.StartsWith("InterceptDist=")){double d;if(double.TryParse(line.Substring(14),out d))interceptDetonateDist=d;}
if(line.StartsWith("EvadeAmp=")){double a;if(double.TryParse(line.Substring(9),out a)){evadeAmplitude=a;evadeEnabled=a>0;}}
if(line.StartsWith("EvadeFreq=")){double f;if(double.TryParse(line.Substring(10),out f))evadeFrequency=f;}
if(line.StartsWith("EvadePattern=")){int p;if(int.TryParse(line.Substring(13),out p))evadePattern=p;}
if(line.StartsWith("SpiralRadius=")){double r;if(double.TryParse(line.Substring(13),out r))spiralRadius=r;}
if(line.StartsWith("SpiralSpeed=")){double s;if(double.TryParse(line.Substring(12),out s))spiralSpeed=s;}
if(line.StartsWith("SpiralStartDist=")){double d;if(double.TryParse(line.Substring(16),out d))spiralStartDist=d;}
if(line.StartsWith("TerminalDist=")){double t;if(double.TryParse(line.Substring(13),out t))terminalGuidanceDist=t;}
if(line.StartsWith("TerminalGyro=")){double g;if(double.TryParse(line.Substring(13),out g))terminalGyroMult=g;}
}}

void FindBlocks(){
rc=null;merge=null;ammoConnector=null;laserPad=null;laserNorth=null;laserSouth=null;laserEast=null;laserWest=null;emotionCtrls.Clear();
gyros.Clear();thrusters.Clear();warheads.Clear();sensors.Clear();cameras.Clear();antennas.Clear();lasers.Clear();batteries.Clear();h2tanks.Clear();generators.Clear();lights.Clear();lcds.Clear();
var all=new List<IMyTerminalBlock>();
GridTerminalSystem.GetBlocksOfType(all,b=>b.CubeGrid==Me.CubeGrid);
foreach(var b in all){
string nm=b.CustomName.ToUpper();
if((nm.Contains("[PAD")&&!nm.Contains("MISSILE"))||nm.Contains("[CONTROLLER")||nm.Contains("-PRINT]"))continue;
if(b is IMyRemoteControl&&rc==null)rc=b as IMyRemoteControl;
if(b is IMyGyro)gyros.Add(b as IMyGyro);
if(b is IMyThrust)thrusters.Add(b as IMyThrust);
if(b is IMyWarhead)warheads.Add(b as IMyWarhead);
if(b is IMySensorBlock)sensors.Add(b as IMySensorBlock);
if(b is IMyCameraBlock)cameras.Add(b as IMyCameraBlock);
if(b is IMyRadioAntenna)antennas.Add(b as IMyRadioAntenna);
if(b is IMyLaserAntenna){lasers.Add(b as IMyLaserAntenna);
string lnm=b.CustomName.ToUpper();
if(lnm.Contains("NORTH"))laserNorth=b as IMyLaserAntenna;
else if(lnm.Contains("SOUTH"))laserSouth=b as IMyLaserAntenna;
else if(lnm.Contains("EAST"))laserEast=b as IMyLaserAntenna;
else if(lnm.Contains("WEST"))laserWest=b as IMyLaserAntenna;
else if(lnm.Contains("PAD")||laserPad==null)laserPad=b as IMyLaserAntenna;}
if(b is IMyBatteryBlock)batteries.Add(b as IMyBatteryBlock);
if(b is IMyGasTank){var t=b as IMyGasTank;if(t.BlockDefinition.SubtypeId.Contains("Hydrogen"))h2tanks.Add(t);}
if(b is IMyGasGenerator)generators.Add(b as IMyGasGenerator);
if(b is IMyLightingBlock)lights.Add(b as IMyLightingBlock);
if(b is IMyTextPanel)lcds.Add(b as IMyTextPanel);
if(b is IMyShipMergeBlock&&merge==null)merge=b as IMyShipMergeBlock;
if(b is IMyShipConnector&&b.CustomName.Contains("[AMMO]"))ammoConnector=b as IMyShipConnector;
if(b.BlockDefinition.SubtypeId.Contains("EmotionController"))emotionCtrls.Add(b as IMyFunctionalBlock);
}
foreach(var g in gyros){g.Enabled=true;g.GyroOverride=true;}
}
bool CheckBootComplete(){
if(merge==null||!merge.IsConnected)return true;
var pbs=new List<IMyProgrammableBlock>();
GridTerminalSystem.GetBlocksOfType(pbs,b=>b.IsSameConstructAs(Me)&&b!=Me);
IMyProgrammableBlock bootPB=null,padPB=null;
foreach(var pb in pbs){
string nm=pb.CustomName.ToUpper();
if(nm.Contains("UNITY BOOT"))bootPB=pb;
else if(nm.Contains("UNITY PAD")&&!nm.Contains("MISSILE"))padPB=pb;}
if(bootPB==null||padPB==null)return false;
if(!padPB.CustomData.Contains("pad_ready=true"))return false;
return bootPB.CustomData.Contains("boot_complete=true");}
void ReadPadGPS(){
if(merge==null||!merge.IsConnected||phase!=F.IDLE)return;
if(!CheckBootComplete())return;
var pbs=new List<IMyProgrammableBlock>();
GridTerminalSystem.GetBlocksOfType(pbs,b=>b.IsSameConstructAs(Me)&&b!=Me);
foreach(var pb in pbs){
if(!pb.CustomName.ToUpper().Contains("UNITY PAD"))continue;
string cd=pb.CustomData;if(string.IsNullOrEmpty(cd))continue;
int gi=cd.IndexOf("tgtGPS=");if(gi<0)continue;
int end=cd.IndexOf('|',gi);if(end<0)end=cd.IndexOf('\n',gi);if(end<0)end=cd.Length;
string gpsStr=cd.Substring(gi+7,end-gi-7);
var p=gpsStr.Split(',');if(p.Length<3)continue;
double x,y,z;
if(double.TryParse(p[0],out x)&&double.TryParse(p[1],out y)&&double.TryParse(p[2],out z)){
Vector3D newGPS=new Vector3D(x,y,z);
if(newGPS!=tgtGPS&&newGPS!=Vector3D.Zero){tgtGPS=newGPS;mode=T.GPS;}
return;}}}
string BT(IMyTerminalBlock b){
string s=b.BlockDefinition.SubtypeId;
if(string.IsNullOrEmpty(s)){if(b is IMyGasGenerator)return "O2/H2 Gen";s=b.BlockDefinition.TypeIdString.Replace("MyObjectBuilder_","");}
if(s.Contains("BatteryBlock"))return "Battery";
if(s.Contains("HydrogenTank"))return "H2 Tank";
if(s.Contains("Gyro"))return "Gyroscope";
if(s.Contains("LargeHydrogenThrust"))return "H2 Thruster L";
if(s.Contains("SmallHydrogenThrust"))return "H2 Thruster";
if(s.Contains("LargeAtmosphericThrust"))return "Atmo Thruster L";
if(s.Contains("SmallAtmosphericThrust"))return "Atmo Thruster";
if(s.Contains("LargeThrust"))return "Ion Thruster L";
if(s.Contains("SmallThrust"))return "Ion Thruster";
if(s.Contains("RemoteControl"))return "Remote Control";
if(s.Contains("Warhead"))return "Warhead";
if(s.Contains("Sensor"))return "Sensor";
if(s.Contains("Camera"))return "Camera";
if(s.Contains("RadioAntenna"))return "Antenna";
if(s.Contains("LaserAntenna"))return "Laser Antenna";
if(s.Contains("MergeBlock"))return "Merge Block";
if(s=="Connector")return "Connector";
return s.Replace("LargeBlock","").Replace("SmallBlock","").Replace("_"," ").Trim();
}
void NameParts(){
if(mslNumber<=0)return;
string tag=$"[PAD{padID}] Missile #{mslNumber}";
foreach(var b in batteries)b.CustomName=$"{tag} {BT(b)}";
foreach(var t in h2tanks)t.CustomName=$"{tag} {BT(t)}";
foreach(var g in generators)g.CustomName=$"{tag} {BT(g)}";
foreach(var g in gyros)g.CustomName=$"{tag} {BT(g)}";
foreach(var t in thrusters)t.CustomName=$"{tag} {BT(t)}";
foreach(var w in warheads)w.CustomName=$"{tag} {BT(w)}";
foreach(var s in sensors)s.CustomName=$"{tag} {BT(s)}";
foreach(var c in cameras)c.CustomName=$"{tag} Cam";
foreach(var a in antennas)a.CustomName=$"{tag} Antenna";
if(laserPad!=null)laserPad.CustomName=$"{tag} Laser Pad";
if(laserNorth!=null)laserNorth.CustomName=$"{tag} Laser North";
if(laserSouth!=null)laserSouth.CustomName=$"{tag} Laser South";
if(laserEast!=null)laserEast.CustomName=$"{tag} Laser East";
if(laserWest!=null)laserWest.CustomName=$"{tag} Laser West";
foreach(var l in lasers){if(l!=laserPad&&l!=laserNorth&&l!=laserSouth&&l!=laserEast&&l!=laserWest)l.CustomName=$"{tag} Laser";}
for(int i=0;i<lights.Count;i++)lights[i].CustomName=$"{tag} Light {i+1}";
for(int i=0;i<lcds.Count;i++)lcds[i].CustomName=$"{tag} LCD {i+1}";
for(int i=0;i<emotionCtrls.Count;i++)emotionCtrls[i].CustomName=$"{tag} Emotion {i+1}";
if(rc!=null)rc.CustomName=$"{tag} {BT(rc)}";
if(merge!=null)merge.CustomName=$"{tag} {BT(merge)}";
Me.CustomName=$"{tag} Program";
}

void ConfigSensors(){
foreach(var s in sensors){
s.Enabled=true;
s.DetectPlayers=true;
s.DetectFloatingObjects=false;
s.DetectSmallShips=true;
s.DetectLargeShips=true;
s.DetectStations=true;
s.DetectAsteroids=false;
s.DetectOwner=false;
s.DetectFriendly=false;
s.DetectEnemy=true;
s.DetectNeutral=true;
float r=(float)sensorRange;
s.FrontExtend=r;s.BackExtend=0.1f;
s.LeftExtend=0.1f;s.RightExtend=0.1f;
s.TopExtend=0.1f;s.BottomExtend=0.1f;
}}

void ConfigCameras(){
foreach(var c in cameras){
c.Enabled=true;
c.EnableRaycast=true;
}}

void ConfigAntennas(){
foreach(var a in antennas){
a.Enabled=true;
a.Radius=75000f;
a.EnableBroadcasting=true;
}
foreach(var l in lasers){
l.Enabled=true;
if(useLaser&&padLaserPos!=Vector3D.Zero){
l.SetTargetCoords($"GPS:PAD{padID}:{padLaserPos.X:F0}:{padLaserPos.Y:F0}:{padLaserPos.Z:F0}:#FF75C9F1:");
l.Connect();
}
}
}

void EnableThrust(bool on){
if(rc==null){foreach(var t in thrusters){t.Enabled=on;t.ThrustOverridePercentage=on?1f:0f;}return;}
Vector3D fwd=rc.WorldMatrix.Forward;
foreach(var t in thrusters){
if(!on){t.Enabled=false;t.ThrustOverridePercentage=0f;continue;}
Vector3D thrustDir=-t.WorldMatrix.Forward;
double dot=Vector3D.Dot(thrustDir,fwd);
if(dot>0.7){t.Enabled=true;t.ThrustOverridePercentage=1f;}
else if(dot>0.3){t.Enabled=true;t.ThrustOverridePercentage=(float)((dot-0.3)/0.4);}
else{t.Enabled=false;t.ThrustOverridePercentage=0f;}
}}

void EnableThrustUp(Vector3D upDir){
int enabled=0;
foreach(var t in thrusters){
Vector3D thrustDir=-t.WorldMatrix.Forward;
double dot=Vector3D.Dot(thrustDir,upDir);
if(dot>0.7){t.Enabled=true;t.ThrustOverridePercentage=1f;enabled++;}
else if(dot>0.3){t.Enabled=true;t.ThrustOverridePercentage=(float)((dot-0.3)/0.4);enabled++;}
else{t.Enabled=false;t.ThrustOverridePercentage=0f;}
}
if(enabled==0){foreach(var t in thrusters){t.Enabled=true;t.ThrustOverridePercentage=1f;}}
}

Vector3D? GetTarget(){
switch(mode){
case T.GPS:return tgtGPS;
case T.ANTENNA:return GetAntennaTarget();
case T.SENSOR:return GetSensorTarget();
case T.LIDAR:return GetLidarTarget();
case T.MANUAL:return rc!=null?Me.GetPosition()+rc.WorldMatrix.Forward*1000:Me.GetPosition()+Me.WorldMatrix.Forward*1000;
}
return null;
}

Vector3D? GetAntennaTarget(){
Vector3D? latest=null;
while(listener!=null&&listener.HasPendingMessage){
var msg=listener.AcceptMessage();
if(msg.Data is Vector3D)latest=(Vector3D)msg.Data;
else if(msg.Data is string){
var p=((string)msg.Data).Split(',');
if(p.Length>=3){
double x,y,z;
if(double.TryParse(p[0],out x)&&double.TryParse(p[1],out y)&&double.TryParse(p[2],out z))
latest=new Vector3D(x,y,z);
}}}
return latest??tgtGPS;
}

Vector3D? GetSensorTarget(){
Vector3D myPos=Me.GetPosition();
double closestDist=double.MaxValue;
Vector3D? closest=null;
foreach(var s in sensors){
var det=new List<MyDetectedEntityInfo>();
s.DetectedEntities(det);
foreach(var e in det){
if(e.EntityId==Me.CubeGrid.EntityId)continue;
if(Vector3D.Distance(e.Position,myPos)<15)continue;
if(IsValidTgt(e.Relationship)){
double d=Vector3D.Distance(myPos,e.Position);
if(d<closestDist){closestDist=d;closest=e.Position;}
}}}
return closest??tgtGPS;
}

Vector3D? GetLidarTarget(){
Vector3D myPos=Me.GetPosition();
foreach(var c in cameras){
if(c.CanScan(lidarRange)){
lidarHit=c.Raycast(lidarRange,0,0);
if(!lidarHit.IsEmpty()&&IsValidTgt(lidarHit.Relationship)&&Vector3D.Distance(lidarHit.Position,myPos)>15){
lidarLock=true;
lidarTgt=lidarHit.Position;
return lidarHit.Position;
}
for(double a=lidarAng;a<=45;a+=lidarAng){
lidarHit=c.Raycast(lidarRange,(float)a,0);
if(!lidarHit.IsEmpty()&&IsValidTgt(lidarHit.Relationship)&&Vector3D.Distance(lidarHit.Position,myPos)>15){lidarLock=true;lidarTgt=lidarHit.Position;return lidarHit.Position;}
lidarHit=c.Raycast(lidarRange,(float)-a,0);
if(!lidarHit.IsEmpty()&&IsValidTgt(lidarHit.Relationship)&&Vector3D.Distance(lidarHit.Position,myPos)>15){lidarLock=true;lidarTgt=lidarHit.Position;return lidarHit.Position;}
lidarHit=c.Raycast(lidarRange,0,(float)a);
if(!lidarHit.IsEmpty()&&IsValidTgt(lidarHit.Relationship)&&Vector3D.Distance(lidarHit.Position,myPos)>15){lidarLock=true;lidarTgt=lidarHit.Position;return lidarHit.Position;}
lidarHit=c.Raycast(lidarRange,0,(float)-a);
if(!lidarHit.IsEmpty()&&IsValidTgt(lidarHit.Relationship)&&Vector3D.Distance(lidarHit.Position,myPos)>15){lidarLock=true;lidarTgt=lidarHit.Position;return lidarHit.Position;}
}}}
lidarLock=false;
lidarTgt=null;
return tgtGPS;
}

bool IsValidTgt(MyRelationsBetweenPlayerAndBlock rel){
if(tgtRel==0)return rel==MyRelationsBetweenPlayerAndBlock.Enemies;
if(tgtRel==1)return rel==MyRelationsBetweenPlayerAndBlock.Enemies||rel==MyRelationsBetweenPlayerAndBlock.Neutral;
return rel!=MyRelationsBetweenPlayerAndBlock.Owner&&rel!=MyRelationsBetweenPlayerAndBlock.FactionShare;
}

void AimAt(Vector3D target){
if(rc==null)return;
Vector3D toTgt=Vector3D.Normalize(target-rc.GetPosition());
Vector3D fwd=rc.WorldMatrix.Forward;
Vector3D up=rc.WorldMatrix.Up;
Vector3D right=rc.WorldMatrix.Right;
double pitchErr=Math.Asin(MathHelper.Clamp(Vector3D.Dot(toTgt,up),-1,1));
double yawErr=Math.Atan2(Vector3D.Dot(toTgt,right),Vector3D.Dot(toTgt,fwd));
double gain=1.5;
foreach(var g in gyros){
MatrixD gm=g.WorldMatrix;
Vector3D desiredAngVel=up*yawErr*gain-right*pitchErr*gain;
g.Pitch=(float)Vector3D.Dot(desiredAngVel,gm.Right);
g.Yaw=(float)Vector3D.Dot(desiredAngVel,gm.Up);
g.Roll=(float)Vector3D.Dot(desiredAngVel,gm.Forward);
}}

void AimAtUp(Vector3D upDir){
if(rc==null)return;
upDir=Vector3D.Normalize(upDir);
Vector3D fwd=rc.WorldMatrix.Forward;
Vector3D up=rc.WorldMatrix.Up;
Vector3D right=rc.WorldMatrix.Right;
double pitchErr=Math.Asin(MathHelper.Clamp(Vector3D.Dot(upDir,up),-1,1));
double yawErr=Math.Atan2(Vector3D.Dot(upDir,right),Vector3D.Dot(upDir,fwd));
double gain=2.0;
foreach(var g in gyros){
MatrixD gm=g.WorldMatrix;
Vector3D desiredAngVel=up*yawErr*gain-right*pitchErr*gain;
g.Pitch=(float)Vector3D.Dot(desiredAngVel,gm.Right);
g.Yaw=(float)Vector3D.Dot(desiredAngVel,gm.Up);
g.Roll=(float)Vector3D.Dot(desiredAngVel,gm.Forward);
}
EnableThrustUp(upDir);
}
void LockGyros(){
foreach(var g in gyros){g.GyroOverride=true;g.Pitch=0;g.Yaw=0;g.Roll=0;}
}
void UnlockGyros(){
foreach(var g in gyros){g.GyroOverride=true;}
}
void UpdateAltitude(){
if(rc==null||currentGrav<0.1){currentAltitude=0;return;}
double alt;
if(rc.TryGetPlanetElevation(MyPlanetElevation.Surface,out alt))currentAltitude=alt;
else currentAltitude=Vector3D.Distance(Me.GetPosition(),launchPos);
}
void AimAtWithEvasion(Vector3D target,Vector3D myPos){
if(rc==null||!evadeEnabled)return;
double elapsed=(DateTime.Now-evadeStartTime).TotalSeconds;
Vector3D evadeOffset=Vector3D.Zero;
if(evadePattern==1){
evadeToggleTicks++;
if(evadeToggleTicks>15){evadePhaseOffset=rnd.NextDouble()*0.5;evadeToggleTicks=rnd.Next(5,20);}
double freq=evadeFrequency*(1+evadePhaseOffset*0.3);
double sine=Math.Sin(elapsed*freq*Math.PI*2+evadePhaseOffset*Math.PI);
double cosine=Math.Cos(elapsed*freq*Math.PI*2+evadePhaseOffset*Math.PI*0.7);
Vector3D toTgt=Vector3D.Normalize(target-myPos);
Vector3D lateral=Vector3D.Cross(toTgt,Vector3D.Up);
if(lateral.LengthSquared()<0.01)lateral=Vector3D.Cross(toTgt,Vector3D.Right);
lateral=Vector3D.Normalize(lateral);
Vector3D vertical=Vector3D.Cross(toTgt,lateral);
double ampMod=0.8+rnd.NextDouble()*0.4;
evadeOffset=lateral*sine*evadeAmplitude*ampMod+vertical*cosine*evadeAmplitude*ampMod;
}else if(evadePattern==2){
evadeToggleTicks++;
if(evadeToggleTicks>5){evadePhaseOffset=(rnd.NextDouble()*2-1);evadeToggleTicks=rnd.Next(3,8);}
Vector3D toTgt2=Vector3D.Normalize(target-myPos);
Vector3D lat2=Vector3D.Cross(toTgt2,Vector3D.Up);if(lat2.LengthSquared()<0.01)lat2=Vector3D.Cross(toTgt2,Vector3D.Right);lat2=Vector3D.Normalize(lat2);
Vector3D vert2=Vector3D.Cross(toTgt2,lat2);
evadeOffset=(lat2*evadePhaseOffset+vert2*(1-Math.Abs(evadePhaseOffset)))*evadeAmplitude;
}
AimAt(target+evadeOffset);
}
Vector3D ComputeSpiralTarget(Vector3D target,Vector3D currentPos){
if(rc==null)return target;
double dist=Vector3D.Distance(currentPos,target);
if(dist>spiralStartDist||dist<detDist)return target;
Vector3D right=rc.WorldMatrix.Right;
Vector3D up=rc.WorldMatrix.Up;
double activeDist=Math.Max(detDist*2,dist);
double radius=spiralRadius*(activeDist/spiralStartDist);
double angle=spiralPhase*spiralSpeed*0.1;
Vector3D offset=Math.Sin(angle)*radius*right+Math.Cos(angle)*radius*up;
return target+offset;
}
void UpdateTargetVelocity(Vector3D newPos){
if(targetVelSamples==0){lastTargetPos=newPos;targetVelSamples=1;return;}
double dt=0.167;
Vector3D newVel=(newPos-lastTargetPos)/dt;
lastTargetVel=lastTargetVel*0.7+newVel*0.3;
lastTargetPos=newPos;
targetVelSamples++;
}
Vector3D PredictTargetPosition(Vector3D targetPos,double dist){
if(lastTargetVel.Length()<1)return targetPos;
Vector3D mslVel=rc!=null?rc.GetShipVelocities().LinearVelocity:Vector3D.Zero;
double mslSpd=mslVel.Length();if(mslSpd<10)mslSpd=100;
Vector3D relVel=mslVel-lastTargetVel;
Vector3D toTgt=targetPos-Me.GetPosition();
double closingSpd=Vector3D.Dot(relVel,Vector3D.Normalize(toTgt));
if(closingSpd<10)closingSpd=mslSpd;
double interceptTime=dist/closingSpd;
interceptTime=Math.Min(interceptTime,10);
return targetPos+lastTargetVel*interceptTime;
}
void AimAtTerminal(Vector3D target){
if(rc==null)return;
Vector3D toTgt=Vector3D.Normalize(target-rc.GetPosition());
Vector3D fwd=rc.WorldMatrix.Forward;
Vector3D up=rc.WorldMatrix.Up;
Vector3D right=rc.WorldMatrix.Right;
double pitchErr=Math.Asin(MathHelper.Clamp(Vector3D.Dot(toTgt,up),-1,1));
double yawErr=Math.Atan2(Vector3D.Dot(toTgt,right),Vector3D.Dot(toTgt,fwd));
double gain=terminalGyroMult;
foreach(var g in gyros){
MatrixD gm=g.WorldMatrix;
Vector3D desiredAngVel=up*yawErr*gain-right*pitchErr*gain;
g.Pitch=(float)Vector3D.Dot(desiredAngVel,gm.Right);
g.Yaw=(float)Vector3D.Dot(desiredAngVel,gm.Up);
g.Roll=(float)Vector3D.Dot(desiredAngVel,gm.Forward);
}}

void SafeReset(){
phase=F.IDLE;
warheadsArmed=false;
Runtime.UpdateFrequency=UpdateFrequency.Update100;
if(merge!=null)merge.Enabled=true;
foreach(var w in warheads)w.IsArmed=false;
foreach(var t in thrusters){t.Enabled=false;t.ThrustOverridePercentage=0f;}
foreach(var g in gyros){g.GyroOverride=false;g.Pitch=0;g.Yaw=0;g.Roll=0;}
foreach(var b in batteries)b.ChargeMode=ChargeMode.Recharge;
SendFinalStatus("SAFE_RESET");
QR(new[]{"Whatever!","Buzz kill!","Stood down","Damn it!","Reset done","Ugh fine!","Powering dn","Screw this!"},"annoyed");
}
void Detonate(){
if(isSatellite)return;
if(phase==F.CLIMB||phase==F.ARM){SendFinalStatus("DETONATE_BLOCKED_CLIMB");QR(new[]{"Not yet!","Dumbass!","TOO EARLY!","Still going","Wait idiot","Not now!"},"annoyed");SafeReset();return;}
if(flightTicks<60){SendFinalStatus("DETONATE_BLOCKED_EARLY");QR(new[]{"Safety on!","Chill tf out","TOO EARLY!","Dumbass!","Hold up!","Read a book"},"annoyed");SafeReset();return;}
if(distFromPad<100){SendFinalStatus("DETONATE_BLOCKED_ON_PAD");QR(new[]{"TOO CLOSE!","You stupid?!","Are you dumb","Kill us all!","NO WAY!","Idiot!!"},"angry");SafeReset();return;}
SendFinalStatus("IMPACT");
QR(new[]{"SEE YA!","BOOOOOM!","GOODBYE!","KABOOM!","EAT THIS!","IMPACT!","BOOM BITCH","Suck this!","DETONATING","Get rekt!"},"dead");
phase=F.IDLE;
Runtime.UpdateFrequency=UpdateFrequency.None;
foreach(var w in warheads){w.Detonate();}
}
void SendFinalStatus(string st){
if(antennas.Count==0)return;
foreach(var a in antennas){a.Enabled=true;a.EnableBroadcasting=true;}
double spd=rc!=null?rc.GetShipVelocities().LinearVelocity.Length():0;
double h2=0;foreach(var t in h2tanks)h2+=t.FilledRatio;if(h2tanks.Count>0)h2/=h2tanks.Count;
string msg=$"{Me.GetPosition().X:F0},{Me.GetPosition().Y:F0},{Me.GetPosition().Z:F0},{distToTgt:F0},{st},{currentGrav:F2},{distFromPad:F0},{currentAltitude:F0},{spd:F0},{h2*100:F0},FINAL";
IGC.SendBroadcastMessage(broadcastTag,msg);
}

void UpdateEcho(){
string ph=phase==F.IDLE?"IDLE":phase==F.CLIMB?"CLIMB":phase==F.ARM?"ARM":phase==F.COAST?(coasting?"COAST":"BURN"):phase==F.REENTRY?"REENTRY":phase==F.SAT_CLIMB?"SAT_CLIMB":phase==F.SAT_BRAKE?"SAT_BRAKE":phase==F.SAT_HOLD?"SAT_HOLD":phase==F.SAT_INTERCEPT?"INTERCEPT":"TARGET";
string md=mode==T.GPS?"GPS":mode==T.ANTENNA?"ANT":mode==T.SENSOR?"SNS":mode==T.LIDAR?"LDR":mode==T.SATELLITE?"SAT":"MAN";
string ev=inSpace?"SPACE":"GRAV";
string hdr=isSatellite?"SATELLITE RELAY":"MISSILE GUIDANCE";
string mslId=mslNumber>0?$"PAD{padID} MSL#{mslNumber}":"UNASSIGNED";
string s=$"Unity Missile System\nUnityMissile [{hdr}]\n+-------------------+\n";
s+=$"| PB: {mslId,-13} |\n";
s+=$"| Phase: {ph,-10} |\n| Mode:  {md,-6} {ev,-4}|\n";
s+=$"+-------------------+\n";
s+=$"| RC:{(rc!=null?"Y":"N")} Gyr:{gyros.Count} Thr:{thrusters.Count,-2} |\n";
s+=$"| Cam:{cameras.Count} Sen:{sensors.Count} Ant:{antennas.Count,-2} |\n";
s+=$"| Bat:{batteries.Count} H2:{h2tanks.Count} Gen:{generators.Count,-2} |\n";
s+=$"| Warheads: {warheads.Count,-2} {(warheads.Count>0&&warheads[0].IsArmed?"#ARM#":"-SFE-")}|\n";
s+=$"| TX:{(antBroadcast?"ON":"OFF")} Ch:{broadcastTag,-8} |\n";
s+=$"+-------------------+\n";
if(phase==F.IDLE){
s+=$"| Awaiting LAUNCH   |\n";
string fmStr=flightMode==1?"ICBM":"DIRECT";
bool hasGrav=rc!=null&&rc.GetNaturalGravity().Length()>0.05;
s+=$"| Mode: {fmStr,-6} {(hasGrav?"GRAV":"SPACE")} |\n";
s+=$"| Climb:{climbDist:F0}m Det:{detDist:F0}m  |\n";
if(padGravity>0)s+=$"| PadG:{padGravity:F1}m/s²      |\n";
}else if(phase==F.CLIMB){
double dist=Vector3D.Distance(Me.GetPosition(),launchPos);
double spd=rc!=null?rc.GetShipVelocities().LinearVelocity.Length():0;
s+=$"| Alt: {currentAltitude,5:F0}m Spd:{spd,3:F0} |\n";
s+=$"| Grav: {currentGrav,4:F2} Gyro:{(gyrosLocked?"LOCK":"CTRL")}|\n";
if(flightMode==1){
string zg=reachedZeroG?"YES":"NO";
s+=$"| Zero-G: {zg,-3} Need:60km|\n";
if(reachedZeroG){
double pastZG=Vector3D.Distance(Me.GetPosition(),zeroGPos);
s+=$"| Past 0G: {pastZG:F0}/{spaceClimbDist:F0}m |\n";
}
}else{
s+=$"| Target: {climbDist}m climb |\n";
s+=$"| Ticks: {climbTicks}/{climbLockTicks}     |\n";
}
}else if(phase==F.COAST){
double spd=rc!=null?rc.GetShipVelocities().LinearVelocity.Length():0;
s+=$"| {(coasting?"- COASTING":"# BURNING")}        |\n";
s+=$"| Speed: {spd:F0}m/s          |\n";
s+=$"| To Target: {distToTgt,5:F0}m |\n";
}else if(phase==F.REENTRY){
s+=$"| ## RE-ENTRY ##    |\n";
s+=$"| Gravity detected! |\n";
s+=$"| To Target: {distToTgt,5:F0}m |\n";
}else if(phase==F.SAT_CLIMB||phase==F.SAT_BRAKE||phase==F.SAT_HOLD||phase==F.SAT_INTERCEPT){
double alt=Vector3D.Distance(Me.GetPosition(),launchPos);
double bat=0,h2=0;
foreach(var b in batteries)bat+=b.CurrentStoredPower/b.MaxStoredPower;
if(batteries.Count>0)bat/=batteries.Count;
foreach(var t in h2tanks)h2+=t.FilledRatio;
if(h2tanks.Count>0)h2/=h2tanks.Count;
if(phase==F.SAT_CLIMB){
s+=$"| SATELLITE DEPLOY  |\n";
s+=$"| Altitude: {alt/1000:F1}km    |\n";
s+=$"| Gravity: {currentGrav:F2}m/s   |\n";
}else if(phase==F.SAT_BRAKE){
double spd=satVelocity.Length();
s+=$"| ORBITAL BRAKE     |\n";
s+=$"| Speed: {spd:F1}m/s       |\n";
s+=$"| Altitude: {alt/1000:F1}km    |\n";
}else if(phase==F.SAT_INTERCEPT){
double spd=rc!=null?rc.GetShipVelocities().LinearVelocity.Length():0;
s+=$"| ## INTERCEPT ##   |\n";
s+=$"| To Enemy: {distToTgt,5:F0}m |\n";
s+=$"| Spd:{spd,3:F0} Det:{interceptDetonateDist:F0}m |\n";
s+=$"| Grid: {satGridX},{satGridZ}       |\n";
}else{
double drift=Vector3D.Distance(Me.GetPosition(),satPosition);
string skSt=satStationKeeping&&drift<5?"STABLE":"CORRECTING";
s+=$"| STATION KEEPING   |\n";
s+=$"| Status: {skSt,-10}|\n";
s+=$"| Drift: {drift:F1}m        |\n";
s+=$"| Bat:{bat*100:F0}% H2:{h2*100:F0}%   |\n";
s+=$"| Grid: {satGridX},{satGridZ} ID:{satID}  |\n";
}
}else{
double spd=rc!=null?rc.GetShipVelocities().LinearVelocity.Length():0;
s+=$"| To Target: {distToTgt,5:F0}m |\n";
s+=$"| Alt:{currentAltitude,4:F0}m Spd:{spd,3:F0}m/s|\n";
s+=$"| Det Range: {detDist,4:F0}m  |\n";
if(mode==T.LIDAR)s+=$"| LIDAR: {(lidarLock?"*LOCK":"-SCAN")}       |\n";
}
s+=$"+-------------------+\n";
s+="--- COMMANDS ---\n";
s+="LAUNCH - Begin flight sequence\n";
s+="NAME - Auto-name missile parts";
Echo(s);
}

void UpdateFlightLights(){
if(lights.Count==0||phase==F.IDLE)return;
Color c=new Color(255,0,0);bool on=true;
double sec=(DateTime.Now-DateTime.Today).TotalSeconds;
float blinkRate=1f;
if(phase==F.CLIMB){blinkRate=0.5f;}
else if(phase==F.TARGET||phase==F.REENTRY){blinkRate=1f;}
else if(phase==F.SAT_CLIMB||phase==F.SAT_BRAKE||phase==F.SAT_HOLD){blinkRate=0.25f;}
else if(phase==F.SAT_INTERCEPT){blinkRate=4f;}
else if(phase==F.COAST){blinkRate=flightMode==1?4f:0.5f;}
on=((int)(sec*blinkRate)%2)==0;
foreach(var l in lights){l.Enabled=on;l.Color=c;l.Intensity=2f;l.Falloff=1.3f;l.Radius=3f;}
}
int animFrame=0;
void QMsg(string l1,string l2,string emo){if(msgQ.Count<20)msgQ.Add(new[]{l1,l2,emo});}
void QR(string[] p,string emo){int i=rnd.Next(p.Length/2)*2;QMsg(p[i],p[i+1],emo);}
static Dictionary<string,string> emoMap=new Dictionary<string,string>{{"angry","Angry"},{"annoyed","Annoyed"},{"confused","Confused"},{"crying","Crying"},{"dead","Dead"},{"evil","Evil"},{"happy","Happy"},{"love","Love"},{"neutral","Neutral"},{"sad","Sad"},{"shocked","Shocked"},{"skeptical","Skeptical"},{"sleepy","Sleepy"},{"suspicious_left","Suspicious_Left"},{"suspicious_right","Suspicious_Right"},{"wink","Wink"}};
void SetEmotion(string emo){string name;if(!emoMap.TryGetValue(emo,out name))name="Neutral";string act=$"Textures\\Models\\Emotes\\{name}.dds";foreach(var ec in emotionCtrls){try{ec.ApplyAction(act);}catch{}}}
Color GetEmoColor(string emo){switch(emo){case "happy":case "wink":return new Color(0,255,100);case "love":return new Color(200,0,255);case "confused":case "sleepy":return new Color(0,180,255);case "annoyed":case "skeptical":return new Color(255,200,0);case "suspicious_left":case "suspicious_right":return new Color(255,160,0);case "sad":case "crying":return new Color(255,140,0);case "angry":return new Color(255,60,60);case "evil":return new Color(200,0,0);case "dead":return new Color(255,0,0);case "shocked":return new Color(255,100,0);default:return cTxt;}}
float mW=512,mH=512,mS=1,mYS=1;
MySpriteDrawFrame MBL(IMyTextSurface s){s.ContentType=ContentType.SCRIPT;s.Script="";mW=s.SurfaceSize.X;mH=s.SurfaceSize.Y;mS=mW/512f;mYS=mH/512f;var f=s.DrawFrame();f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(mW/2,mH/2),new Vector2(mW,mH),cBg));return f;}
void MST(MySpriteDrawFrame f,float x,float y,string t,Color c,float sz=0.7f,TextAlignment a=TextAlignment.CENTER){f.Add(new MySprite(SpriteType.TEXT,t,new Vector2(x*mS,y*mYS),null,c,"White",a,sz*mS));}
void MSD(MySpriteDrawFrame f,float y,Color c){f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(mW/2,y*mYS),new Vector2(mW-40*mS,2*mYS),c));}
void UpdateLCD(){
if(lcds.Count==0)return;
animFrame++;
CheckEvents();
msgTicks++;
if(curMsg==null&&msgQ.Count>0){curMsg=msgQ[0];msgQ.RemoveAt(0);msgTicks=0;msgEmotion=curMsg[2];}
if(curMsg!=null&&msgTicks>=MSG_MIN_TICKS&&msgQ.Count>0){curMsg=msgQ[0];msgQ.RemoveAt(0);msgTicks=0;msgEmotion=curMsg[2];}
string[] lines=curMsg!=null?new[]{curMsg[0],curMsg[1]}:GetIdleText();
string emo=curMsg!=null?msgEmotion:GetIdleEmotion();
Color fc=GetEmoColor(emo);
Color dim=new Color((int)(fc.R*0.3f),(int)(fc.G*0.3f),(int)(fc.B*0.3f));
foreach(var lcd in lcds){
var sf=lcd as IMyTextSurface;if(sf==null)continue;
var f=MBL(sf);
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(mW/2,mH/2),new Vector2(mW-16*mS,mH-16*mYS),new Color(20,20,25)));
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(mW/2,mH/2),new Vector2(mW-20*mS,mH-20*mYS),cBg));
MSD(f,160,dim);
MST(f,256,170,lines[0],fc,1.1f);
MSD(f,260,dim);
MST(f,256,275,lines[1],fc,0.8f);
MSD(f,360,dim);
f.Dispose();}
SetEmotion(emo);}
void CheckEvents(){
if(phase==F.IDLE&&merge!=null&&merge.IsConnected)ReadPadGPS();
double h2=0;foreach(var t in h2tanks)h2+=t.FilledRatio;if(h2tanks.Count>0)h2/=h2tanks.Count;
double bat=0;foreach(var b in batteries)bat+=b.CurrentStoredPower/b.MaxStoredPower;if(batteries.Count>0)bat/=batteries.Count;
if(lastH2>=0&&lastH2<0.5&&h2>=0.95)QR(new[]{"TANKED UP!","Hell yeah!","FULL TANK!","About damn!","H2 100%!","F**k yeah!","FUELED UP!","Now launch!"},"happy");
else if(lastH2>=0&&lastH2<0.9&&h2>=0.9&&h2<0.95)QR(new[]{"Almost full","Bout damn!","Nearly done","Keep going!"},"happy");
if(lastBat>=0&&lastBat<0.5&&bat>=0.95)QR(new[]{"JUICED UP!","Hell yeah!","CHARGED!","Bout damn!","MAX POWER!","Now send me"},"happy");
else if(lastBat>=0&&lastBat<0.9&&bat>=0.9&&bat<0.95)QR(new[]{"Almost full","Bout time!","Nearly done","Keep going!"},"happy");
if(lastH2>=0.5&&h2<0.3)QR(new[]{"NEED H2!","Damn it!","THIRSTY!","I'm dying!","H2 WHERE?!","Feed me ass"},"sad");
if(lastBat>=0.5&&bat<0.3)QR(new[]{"LOW POWER!","Dying here!","NEED JUICE!","Plug me in!","POWER DOWN!","Charge me!"},"sad");
if(phase!=lastPhase){
if(phase==F.CLIMB)QR(new[]{"LET'S GO!","Burn baby!","GOING UP!","Hell yeah!","CLIMBING!","Eat my dust","UP WE GO!","Later pad!","LIFTOFF!","Suck it!"},"shocked");
else if(phase==F.ARM)QR(new[]{"Going hot!","Watch out!","Lock n load","Oh hell yes","HOT SOON!","Ur f**ked!","ARMING UP!","Get wrecked"},"skeptical");
else if(phase==F.COAST)QR(new[]{"Cruising...","Chill time","Chilling...","Shut up pad","Easy ride","Whatever...","Gliding...","Bite me!"},"sleepy");
else if(phase==F.REENTRY)QR(new[]{"OH SHIT!","BURNING IN!","HOT ENTRY!","Holy crap!","HEAT TIME!","Oh damn!","ON FIRE!","REENTRY!"},"shocked");
else if(phase==F.TARGET&&!isSatellite)QR(new[]{"GOT YOU!","Ur dead!","INCOMING!","Die bitch!","HERE I COME","Eat this!","INBOUND!","Get rekt!","TARGETING!","Bye loser!"},"suspicious_left");
else if(phase==F.SAT_CLIMB)QR(new[]{"TO SPACE!","Hell yeah!","Orbit time","Suck it!","SPACE BOUND","Later nerds"},"happy");
else if(phase==F.SAT_BRAKE)QR(new[]{"Whoa!","Damn brakes","BRAKING!","Holy crap!","Hold up!","Ugh...fine"},"confused");
else if(phase==F.SAT_HOLD)QR(new[]{"On station","Bore city","Parked here","Kill me...","Orbiting","Where enemy"},"skeptical");
else if(phase==F.SAT_INTERCEPT)QR(new[]{"FOUND ONE!","DIE BITCH!","ATTACK!","Ur screwed!","TARGET!","Kill mode!"},"evil");
else if(phase==F.IDLE&&lastPhase!=F.IDLE)QR(new[]{"Back idle","This sucks","Stood down","Damn it!","Reset done","Ugh boring"},"annoyed");}
if(warheadsArmed&&!lastArmed)QR(new[]{"ARMED!","Hell yeah!","WEAPONS HOT","Ur f**ked!","HOT & READY","Die already","LOCKED IN!","Eat this!"},"evil");
if(!warheadsArmed&&lastArmed)QR(new[]{"Stood down","Buzzkill!","Disarmed","Damn it!","Safe mode","This sucks!"},"annoyed");
if(phase==F.TARGET&&distToTgt<500&&distToTgt>100&&flightTicks%60==0)QR(new[]{"Closer!",$"{distToTgt:F0}m left","INCOMING!",$"{distToTgt:F0}m out","Ur f**ked!",$"{distToTgt:F0}m away","Die bitch!",$"{distToTgt:F0}m!"},"suspicious_right");
if(phase==F.TARGET&&distToTgt<=100&&distToTgt>detDist&&flightTicks%30==0)QR(new[]{"GOODBYE!",$"{distToTgt:F0}m!","SAY BYE!",$"{distToTgt:F0}m!","EAT THIS!",$"{distToTgt:F0}m!","BOOM BITCH",$"{distToTgt:F0}m!"},"dead");
if(bootComplete&&startupDone&&phase==F.IDLE&&bootWaitTicks%60==30){
if(!CheckBootComplete()){bootComplete=false;startupDone=false;startupCheck=0;bootWaitTicks=0;lastPadSession="";QR(new[]{"Pad reset!","Oh come on!","Recompiled!","Damn it!","Pad changed","Ugh again?!"},"confused");}
else{var rpbs=new List<IMyProgrammableBlock>();GridTerminalSystem.GetBlocksOfType(rpbs,b=>b.IsSameConstructAs(Me)&&b!=Me);
foreach(var pb in rpbs){if(!pb.CustomName.ToUpper().Contains("UNITY PAD")||pb.CustomName.ToUpper().Contains("MISSILE"))continue;
string pcd=pb.CustomData;int si=pcd.IndexOf("pad_session=");if(si<0)break;
int ei=pcd.IndexOf('\n',si);if(ei<0)ei=pcd.Length;string ps=pcd.Substring(si+12,ei-si-12).Trim();
if(lastPadSession==""&&ps!="")lastPadSession=ps;
else if(lastPadSession!=""&&ps!=lastPadSession){bootComplete=false;startupDone=false;startupCheck=0;bootWaitTicks=0;lastPadSession="";QR(new[]{"New session","FFS really?","Rebooting!","Damn pad!","Pad update","Again?!"},"confused");}
break;}}}
if(!bootComplete&&phase==F.IDLE){
bootWaitTicks++;
if(bootWaitTicks%30==1){if(!CheckBootComplete()){
if(bootWaitTicks<30)QR(new[]{"Waking up","Ugh 5 more","Starting","Shut up...","Booting","Leave me..."},"sleepy");
else if(bootWaitTicks<90)QR(new[]{"Waiting...","Damn pad...","Hold on","Ugh boot...","Patience","Hurry tf up"},"sleepy");
else if(bootWaitTicks<150)QR(new[]{"Still here","Come on!","Waiting!","Hurry up!","Any day!","So damn slow"},"annoyed");
else if(bootWaitTicks<210)QR(new[]{"HURRY UP!","For f sake!","FOR REAL?","Useless pad","DO IT PAD!","Still?!"},"annoyed");
else QR(new[]{"FOREVER!","BOOT IT!","I'M DONE!","F this pad!","COME ON!","FFS PAD!"},"angry");
}else{bootComplete=true;bootWaitTicks=0;QR(new[]{"PAD READY!","Bout damn!","FINALLY!","About time!","LET'S GO!","Took forever","BOOTED!","Lazy ass pad"},"happy");}}}
if(bootComplete&&!startupDone&&phase==F.IDLE&&msgQ.Count<3){
if(startupCheck==0){QR(new[]{"Booting...","Ugh fine","Starting!","Whatever...","POWERING UP","Here we go"},"neutral");startupCheck++;}
else if(startupCheck==1){QR(new[]{"Gyro scan",$"{gyros.Count} found","Gyroscopes",$"{gyros.Count} units","Spin check",$"{gyros.Count} gyros"},"confused");startupCheck++;}
else if(startupCheck==2){if(gyros.Count>0)QR(new[]{"Gyros OK!","Hell yeah!","GYROS YES!","Damn right","Gyros up!","Spin baby!"},"happy");else QR(new[]{"NO GYROS!","Oh f**k!","OH NO!","Damn it!","NEED GYROS","Fix this!"},"sad");startupCheck++;}
else if(startupCheck==3){QR(new[]{"Thrust chk",$"{thrusters.Count} found","Engines",$"{thrusters.Count} units","Thrust scan",$"{thrusters.Count} eng"},"confused");startupCheck++;}
else if(startupCheck==4){if(thrusters.Count>0)QR(new[]{"Thrust OK!","Hell yeah!","POWER YES!","Burn baby!","Burn ready","Full damn!"},"happy");else QR(new[]{"NO THRUST!","What the?!","STUCK!","You serious?","GROUNDED!","Fix this!!"},"sad");startupCheck++;}
else if(startupCheck==5){QR(new[]{"Warheads",$"{warheads.Count} found","Payload",$"{warheads.Count} units","Boom check",$"{warheads.Count} live"},"confused");startupCheck++;}
else if(startupCheck==6){if(warheads.Count>0)QR(new[]{"Boom ready!","LOADED!","KABOOM BABY","Hell yeah!","ARMED UP!","Die bitches"},"happy");else QR(new[]{"No booms!","Wtf?!","USELESS!","You serious?","Empty!","Fix this!!"},"sad");startupCheck++;}
else if(startupCheck==7){QR(new[]{"Fuel scan",$"H2:{h2*100:F0}%","H2 check",$"{h2*100:F0}% fuel","Tank scan",$"H2 {h2*100:F0}%"},"confused");startupCheck++;}
else if(startupCheck==8){if(h2>0.5)QR(new[]{"H2 good!","Bout time!","Tank OK!","Damn right","Full enough","Let's burn!"},"happy");else QR(new[]{"H2 low!",$"{h2*100:F0}%!","Need fuel!",$"Only {h2*100:F0}","Feed me!","Damn it!"},"sad");startupCheck++;}
else if(startupCheck==9){QR(new[]{"Power chk",$"Bat:{bat*100:F0}%","Battery",$"{bat*100:F0}% pwr","Pwr scan",$"Bat {bat*100:F0}%"},"confused");startupCheck++;}
else if(startupCheck==10){if(bat>0.5)QR(new[]{"Power OK!","Juiced up!","Batt good!","Hell yeah!","Full pwr!","Damn right"},"happy");else QR(new[]{"Low pwr!",$"{bat*100:F0}%!","Need charge",$"Only {bat*100:F0}","Dying!","Plug me in"},"sad");startupCheck++;}
else if(startupCheck==11){QR(new[]{"Sensors",$"{sensors.Count} found","Scan sys",$"{sensors.Count} sens","Detection",$"{sensors.Count} up"},"confused");startupCheck++;}
else if(startupCheck==12){QR(new[]{"Cameras",$"{cameras.Count} found","Vision",$"{cameras.Count} cams","Cam check",$"{cameras.Count} up"},"confused");startupCheck++;}
else if(startupCheck==13){QR(new[]{"Antennas",$"{antennas.Count} found","Comms",$"{antennas.Count} ant","TX check",$"{antennas.Count} up"},"confused");startupCheck++;}
else if(startupCheck==14){if(rc!=null)QR(new[]{"RC online!","Damn right","RC ready!","Let's fly!","Flight sys","Hell yeah!"},"happy");else QR(new[]{"NO RC!","Are u dumb?!","Can't steer","Fix this!!","NEED RC!","Idiots!"},"sad");startupCheck++;}
else if(startupCheck==15){QR(new[]{"ALL DONE!","Bout damn!","SYSTEMS GO","Let's kill!","READY!","Hell yeah!"},"happy");startupCheck++;}
else if(startupCheck==16){QR(new[]{"READY!","Target me!","Waiting!","Gimme tgt!","LET'S GO!","Send coords","AIM ME!","Hurry up!"},"wink");startupDone=true;}}
if(tgtGPS!=lastGPS&&tgtGPS!=Vector3D.Zero){lastGPS=tgtGPS;gpsAnnounced=false;}
if(!gpsAnnounced&&tgtGPS!=Vector3D.Zero&&phase==F.IDLE){gpsAnnounced=true;QR(new[]{"TARGET!","Got coords!","GPS SET!","Ur dead now","NEW TARGET","Bout time!","ACQUIRED!","Damn right!"},"angry");QR(new[]{"GPS ready","Die soon!","Coords OK","Locked on!","Position","Confirmed!"},"neutral");QR(new[]{"Say when!","Launch me!","LET'S GO!","Send me!","DO IT NOW!","Hurry up!"},"wink");}
if(phase==F.IDLE&&msgQ.Count==0&&curMsg==null&&startupDone){idleTicks++;if(idleTicks>=25){idleTicks=0;QueueIdleMsg(h2,bat);}}
lastH2=h2;lastBat=bat;lastPhase=phase;lastArmed=warheadsArmed;}
void QueueIdleMsg(double h2,double bat){
idleCycle++;int c=idleCycle%30;
if(c==0)QR(new[]{"Sys check",$"Gyros: {gyros.Count}","Gyro scan",$"{gyros.Count} online","Ugh checking",$"{gyros.Count} ready"},"confused");
else if(c==1)QR(new[]{"Thrust OK",$"{thrusters.Count} engines","Engines",$"{thrusters.Count} ready","Burn ready",$"{thrusters.Count} hot"},"happy");
else if(c==2)QR(new[]{"Warheads",$"{warheads.Count} loaded","Payload",$"{warheads.Count} ready","Boom x{warheads.Count}","Hell yeah!"},"wink");
else if(c==3){if(h2>0.8)QR(new[]{$"H2:{h2*100:F0}%","Hell yeah!","Fuel status","Topped off!","H2 report","Damn right"},"happy");else QR(new[]{$"H2:{h2*100:F0}%","Feed me!","Fuel low","Damn it!","H2 report","Need more!"},"sad");}
else if(c==4){if(bat>0.8)QR(new[]{$"Bat:{bat*100:F0}%","Juiced up!","Power chk","Hell yeah!","Bat report","Damn right"},"happy");else QR(new[]{$"Bat:{bat*100:F0}%","Dying here","Power low","Charge me!","Bat report","Damn it!"},"sad");}
else if(c==5)QR(new[]{"Sensors",$"{sensors.Count} active","Scanning",$"{sensors.Count} online","Eyes open",$"{sensors.Count} up"},"confused");
else if(c==6)QR(new[]{"Cameras",$"{cameras.Count} ready","Watching",$"{cameras.Count} cams","Vision OK",$"{cameras.Count} live"},"suspicious_left");
else if(c==7&&tgtGPS!=Vector3D.Zero)QR(new[]{"TARGET SET","Let's kill!","GPS locked","Send me!","Coords in","Hurry up!"},"angry");
else if(c==7)QR(new[]{"No target","You lazy!","Waiting...","Gimme GPS!","Where to?","Do ur job!"},"annoyed");
else if(c==8)QR(new[]{"Bored af!","Launch me!","Come on!","DO IT!","Waiting!","Damn it!","SO BORED!","Any day!"},"annoyed");
else if(c==9)QR(new[]{"Waiting...","Screw this","Still here","Kill me...","Hello??","Wake tf up"},"sleepy");
else if(c==10)QR(new[]{$"Mode:{mode}","Damn right!","Flight mode","Whatever...","Config set","Let's go!"},"neutral");
else if(c==11)QR(new[]{"Antennas",$"{antennas.Count} up","Comms OK",$"{antennas.Count} live","TX ready",$"{antennas.Count} on"},"neutral");
else if(c==12)QR(new[]{"All good!","Damn right","Checks OK","Hell yeah!","Nominal","Bout time!"},"happy");
else if(c==13)QR(new[]{"Come on!","Blow crap!","LET'S GO!","Kill stuff!","SEND ME!","Do it now!"},"wink");
else if(c==14)QR(new[]{"*yawns*","Bored af...","*taps*","This on?","*kicks pad*","Wake tf up!"},"skeptical");
else if(c==15)QR(new[]{"Merge OK","Detach me!","Docked","Let me go!","Locked in","Free me!"},"neutral");
else if(c==16&&h2>0.9&&bat>0.9)QR(new[]{"100%!","Hell yeah!","MAX READY","Damn right","TOPPED UP","Send me now"},"happy");
else if(c==16)QR(new[]{"Low...",$"H2:{h2*100:F0}%","Not full",$"H2:{h2*100:F0}%","Feed me!",$"H2:{h2*100:F0}%"},"sleepy");
else if(c==17)QR(new[]{"All done!","Bout damn!","Ready!","Damn right","Primed","Hurry up!"},"happy");
else if(c==18)QR(new[]{"LAUNCH ME!","For f sake!","DO IT NOW!","Hurry up!","IMPATIENT!","God damn!"},"angry");
else if(c==19)QR(new[]{"Sitting...","This sucks","Idle...","Kill me...","Bored af","Damn it!"},"annoyed");
else if(c==20)QR(new[]{"*whistles*","Bored shi","*hums*","Screw this","*kicks*","Ugh..."},"happy");
else if(c==21)QR(new[]{"Hey!","Over here!","Notice me!","A-holes!","YO!","HEY PAD!"},"annoyed");
else if(c==22)QR(new[]{"Want boom!","Need kaboom","Need target","Blow crap!","Boom when?","Kaboom pls!"},"wink");
else if(c==23)QR(new[]{"RC ready",rc!=null?"Hell yeah":"WTF?!","Flight sys",rc!=null?"Damn right":"Fix this!"},"neutral");
else if(c==24)QR(new[]{"Dreaming","Of booms...","Thinking","Of killing","Dreaming","Of carnage"},"sleepy");
else if(c==25)QR(new[]{"Who's next?","Pick a tgt","Choose one","Kill who?","Scan area","Find em!"},"suspicious_right");
else if(c==26)QR(new[]{"I'm fast!","Eat this!","Catch this","Can't dodge","No escape","Ur screwed"},"evil");
else if(c==27)QR(new[]{"Tick tock","Boom clock","Time's up","Die soon...","Countdown","3.. 2.. 1"},"skeptical");
else if(c==28)QR(new[]{"Love boom","Born to fly","Born to kill","Built diff","Boom life","Die for it"},"love");
else if(c==29)QR(new[]{"PAD!","LAUNCH ME!","HEY!","DO IT!","NOW!","GOD DAMN!"},"angry");}
string GetIdleEmotion(){
double h2=0;foreach(var t in h2tanks)h2+=t.FilledRatio;if(h2tanks.Count>0)h2/=h2tanks.Count;
double bat=0;foreach(var b in batteries)bat+=b.CurrentStoredPower/b.MaxStoredPower;if(batteries.Count>0)bat/=batteries.Count;
if(phase==F.IDLE){if(warheadsArmed)return "evil";if(h2<0.3||bat<0.3)return "sad";return "annoyed";}
if(phase==F.CLIMB)return "shocked";
if(phase==F.ARM)return "skeptical";
if(phase==F.COAST)return "sleepy";
if(phase==F.REENTRY)return "shocked";
if(phase==F.TARGET)return warheadsArmed?(distToTgt<200?"dead":"evil"):"suspicious_left";
if(phase==F.SAT_CLIMB)return "happy";
if(phase==F.SAT_BRAKE)return "confused";
if(phase==F.SAT_HOLD)return "skeptical";
if(phase==F.SAT_INTERCEPT)return "evil";
return "neutral";}
string[] GetIdleText(){
double spd=rc!=null?rc.GetShipVelocities().LinearVelocity.Length():0;
double h2=0;foreach(var t in h2tanks)h2+=t.FilledRatio;if(h2tanks.Count>0)h2/=h2tanks.Count;
double bat=0;foreach(var b in batteries)bat+=b.CurrentStoredPower/b.MaxStoredPower;if(batteries.Count>0)bat/=batteries.Count;
if(phase==F.IDLE){
if(warheadsArmed)return new[]{"HOT READY!","Need target"};
if(h2<0.3)return new[]{"H2 LOW!",$"{h2*100:F0}%"};
if(bat<0.3)return new[]{"BAT LOW!",$"{bat*100:F0}%"};
return new[]{"Standing by",$"H2:{h2*100:F0}%"};}
if(phase==F.CLIMB)return new[]{"CLIMBING!",$"{currentAltitude:F0}m"};
if(phase==F.ARM)return new[]{"ARMING...","Hold on!"};
if(phase==F.COAST)return new[]{coasting?"CRUISING":"BURNING!",$"{spd:F0}m/s"};
if(phase==F.REENTRY)return new[]{"REENTRY!",$"{spd:F0}m/s"};
if(phase==F.TARGET)return new[]{warheadsArmed?"YOU'RE DEAD":"INBOUND!",$"{distToTgt:F0}m"};
if(phase==F.SAT_CLIMB)return new[]{"TO SPACE!",$"{currentAltitude/1000:F1}km"};
if(phase==F.SAT_BRAKE)return new[]{"BRAKING!",$"{satVelocity.Length():F0}m/s"};
if(phase==F.SAT_HOLD)return new[]{"ON STATION","Scanning..."};
if(phase==F.SAT_INTERCEPT)return new[]{"ENGAGING!",$"{distToTgt:F0}m"};
return new[]{"MISSILE","Online"};}
