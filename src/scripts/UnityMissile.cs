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
string curLine1="",curLine2="",curEmo="neutral";
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
int phaseTicks=0;
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
QR(new[]{"Heading to damn space!","You know it baby!","Deploying to orbit now!","Orbit is my bitch!","Space bound and mean!","Bout to own the sky!","Launching this bad boy!","Suck on that losers!"},"wink");
}else if(flightMode==2){
phase=launchedFromGrav?F.CLIMB:F.TARGET;
QR(new[]{"Time to kill these fools!","Burn baby damn burn!","Lets go wreck some shit!","Yall bout to die!","Launching this beast now!","Eat every bit of this!","All fired up and angry!","Hell yeah lets ride!","Sending it full speed!","Suck on this one!"},"wink");
}else{
phase=F.CLIMB;
QR(new[]{"Full send this ICBM!","This is ICBM bitch!","Going up real fast now!","Eat my entire ass!","ICBM mode is engaged!","The sky belongs to me!","Launching straight up now!","Yall are already dead!"},"wink");
}
return;
}
if(phase!=F.IDLE){
flightTicks++;phaseTicks++;
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
if(!ammoEjecting&&ammoConnector!=null){ammoConnector.ThrowOut=true;ammoEjecting=true;SendFinalStatus("AMMO_EJECT");QR(new[]{"Dumping all this crap!","Way lighter now baby!","Ejecting the dead weight!","Screw this extra ammo!","Tossing it all out now!","Ammo is outta here!"},"skeptical");}
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
QR(new[]{"Warheads are hot now!","Damn right they are!","Fully armed and angry!","Die you damn bastards!","All weapons are hot!","Primed to blow yall up!","Locked in and ready!","You are so damn screwed!"},"evil");
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
QR(new[]{"Total damn blackout now!","Oh shit lost the pad!","Lost the signal entirely!","Damn it cant hear crap!","No contact with anyone!","This is f***ing bullshit!","Signal is completely gone!","Screw this stupid void!"},"shocked");}
return;}
double spd=rc!=null?rc.GetShipVelocities().LinearVelocity.Length():0;
double h2=0;foreach(var t in h2tanks)h2+=t.FilledRatio;if(h2tanks.Count>0)h2/=h2tanks.Count;
double bat=0;foreach(var b in batteries)bat+=b.CurrentStoredPower/b.MaxStoredPower;if(batteries.Count>0)bat/=batteries.Count;
if(phase==F.TARGET&&(h2<0.15||bat<0.15))status="LOW_FUEL";
string camInfo="";if(cameras.Count>0){foreach(var c in cameras)camInfo+=(camInfo.Length>0?";":"")+c.EntityId.ToString()+":"+c.CustomName.Replace("|","").Replace(",","").Replace(":","").Replace(";","");}
string lcdInfo=curLine1.Replace("|","").Replace("~","")+$"~{curLine2.Replace("|","").Replace("~","")}~{curEmo}";
string msg=$"{Me.GetPosition().X:F0},{Me.GetPosition().Y:F0},{Me.GetPosition().Z:F0},{distToTgt:F0},{status},{currentGrav:F2},{distFromPad:F0},{currentAltitude:F0},{spd:F0},{h2*100:F0},{(gyrosLocked?"LOCK":"CTRL")}|CAMS:{camInfo}|LCD:{lcdInfo}";
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
QR(new[]{"Whatever I guess fine!","What a total buzz kill!","Stood down for nothing!","Damn it I wanted boom!","Reset is done I guess!","Ugh fine have it your way!","Powering down like a chump!","Screw this boring crap!"},"annoyed");
}
void Detonate(){
if(isSatellite)return;
if(phase==F.CLIMB||phase==F.ARM){SendFinalStatus("DETONATE_BLOCKED_CLIMB");QR(new[]{"Not yet you dumbass!","Still climbing up here!","Way too early for that!","Still going you moron!","Wait up you damn idiot!","Not now Im still flying!"},"annoyed");SafeReset();return;}
if(flightTicks<60){SendFinalStatus("DETONATE_BLOCKED_EARLY");QR(new[]{"Safety is still on fool!","Chill the hell out dude!","Way too early to blow!","Are you a damn dumbass?","Hold up give me a sec!","Go read a book or something!"},"annoyed");SafeReset();return;}
if(distFromPad<100){SendFinalStatus("DETONATE_BLOCKED_ON_PAD");QR(new[]{"Way too close to pad!","Are you friggin stupid?!","Are you completely dumb?","That would kill us all!","No damn way Im doing that!","You absolute friggin idiot!"},"angry");SafeReset();return;}
SendFinalStatus("IMPACT");
QR(new[]{"See ya in hell losers!","Biggest damn boom ever!","Goodbye you sorry fools!","Kaboom eat that suckers!","Eat this last damn gift!","Impact right in your face!","Boom bitch thats all she wrote!","Suck on this final present!","Detonating right damn now!","Get absolutely friggin rekt!"},"dead");
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
string[] SWrap(string t,int w){var r=new List<string>();var words=t.Split(' ');string ln="";foreach(var wd in words){if(ln.Length>0&&ln.Length+1+wd.Length>w){r.Add(ln);ln=wd;}else{ln=ln.Length>0?ln+" "+wd:wd;}}if(ln.Length>0)r.Add(ln);return r.ToArray();}
void UpdateLCD(){
if(lcds.Count==0)return;
animFrame++;
CheckEvents();
msgTicks++;
if(curMsg==null&&msgQ.Count>0){curMsg=msgQ[0];msgQ.RemoveAt(0);msgTicks=0;msgEmotion=curMsg[2];}
if(curMsg!=null&&msgTicks>=MSG_MIN_TICKS&&msgQ.Count>0){curMsg=msgQ[0];msgQ.RemoveAt(0);msgTicks=0;msgEmotion=curMsg[2];}
string[] lines=curMsg!=null?new[]{curMsg[0],curMsg[1]}:GetIdleText();
string emo=curMsg!=null?msgEmotion:GetIdleEmotion();
curLine1=lines[0];curLine2=lines[1];curEmo=emo;
Color fc=GetEmoColor(emo);
foreach(var lcd in lcds){
var sf=lcd as IMyTextSurface;if(sf==null)continue;
var f=MBL(sf);
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(mW/2,mH/2),new Vector2(mW-16*mS,mH-16*mYS),new Color(20,20,25)));
f.Add(new MySprite(SpriteType.TEXTURE,"SquareSimple",new Vector2(mW/2,mH/2),new Vector2(mW-20*mS,mH-20*mYS),cBg));
string[] w1=SWrap(lines[0],11);string[] w2=SWrap(lines[1],11);
float fsz=1.8f;float lh=55f;float ty=80f;
for(int i=0;i<w1.Length;i++)MST(f,256,ty+i*lh,w1[i],fc,fsz);
float by=ty+w1.Length*lh+20f;
for(int i=0;i<w2.Length;i++)MST(f,256,by+i*lh,w2[i],fc,fsz*0.75f);
f.Dispose();}
SetEmotion(emo);}
void CheckEvents(){
if(phase==F.IDLE&&merge!=null&&merge.IsConnected)ReadPadGPS();
double h2=0;foreach(var t in h2tanks)h2+=t.FilledRatio;if(h2tanks.Count>0)h2/=h2tanks.Count;
double bat=0;foreach(var b in batteries)bat+=b.CurrentStoredPower/b.MaxStoredPower;if(batteries.Count>0)bat/=batteries.Count;
if(lastH2>=0&&lastH2<0.5&&h2>=0.95)QR(new[]{"Tank is totally full now!","Hell yeah thats the stuff!","Full tank of hydrogen baby!","About damn time for fuel!","H2 is at one hundred percent!","F**k yeah gimme that gas!","All fueled up and ready!","Now launch me already dammit!"},"happy");
else if(lastH2>=0&&lastH2<0.9&&h2>=0.9&&h2<0.95)QR(new[]{"Almost full keep going!","Bout damn time for fuel!","Nearly done fueling up!","Keep that hydrogen coming!"},"happy");
if(lastBat>=0&&lastBat<0.5&&bat>=0.95)QR(new[]{"All juiced up and ready!","Hell yeah thats the power!","Fully charged and angry!","Bout damn time to charge!","Maximum power achieved baby!","Now send me to kill stuff!"},"happy");
else if(lastBat>=0&&lastBat<0.9&&bat>=0.9&&bat<0.95)QR(new[]{"Almost full on power!","Bout time you charged me!","Nearly done charging up!","Keep that power coming!"},"happy");
if(lastH2>=0.5&&h2<0.3)QR(new[]{"I need hydrogen bad!","Damn it Im running dry!","So damn thirsty for fuel!","Im friggin dying out here!","Where the hell is my H2?!","Feed me fuel you lazy ass!"},"sad");
if(lastBat>=0.5&&bat<0.3)QR(new[]{"Running real low on power!","Dying over here plug me in!","Need some juice right now!","Plug me in you lazy bum!","Power is dropping fast!","Charge me up damn it!"},"sad");
if(phase!=lastPhase){phaseTicks=0;
if(phase==F.CLIMB)QR(new[]{"Lets go burn it up!","Burn baby burn it all!","Going up real damn fast!","Hell yeah watch me climb!","Climbing like a beast now!","Eat my dust down there!","Up we go into the sky!","Later pad see ya never!","Liftoff feels so damn good!","Suck it Im outta here!"},"shocked");
else if(phase==F.ARM)QR(new[]{"Going hot real soon now!","Better watch your ass out!","Lock and load time baby!","Oh hell yes getting spicy!","Gonna be hot real soon!","You are so damn f**ked!","Arming up the warheads now!","Get wrecked you sorry fools!"},"skeptical");
else if(phase==F.COAST)QR(new[]{"Just cruising along now!","Time to chill for a bit!","Chilling out in damn space!","Shut up pad I got this!","Easy ride through the void!","Whatever just floating here!","Gliding through like a boss!","Bite me Im on vacation!"},"sleepy");
else if(phase==F.REENTRY)QR(new[]{"Oh shit its getting hot!","Burning in holy damn crap!","Hot entry right damn now!","Holy crap Im on fire!","Heat is cranking way up!","Oh damn this is intense!","Everything is on fire now!","Reentry is a real bitch!"},"shocked");
else if(phase==F.TARGET&&!isSatellite)QR(new[]{"I got you now sucker!","You are so damn dead!","Incoming you sorry fool!","Die bitch Im right here!","Here I come ready or not!","Eat this you little punk!","Inbound and closing fast!","Get rekt you sorry loser!","Targeting your dumb ass now!","Bye loser it was nice!"},"suspicious_left");
else if(phase==F.SAT_CLIMB)QR(new[]{"Heading to damn space now!","Hell yeah orbit time baby!","Orbit time you suckers!","Suck it Im going to space!","Space bound and feeling mean!","Later nerds see ya never!"},"happy");
else if(phase==F.SAT_BRAKE)QR(new[]{"Whoa gotta slow down here!","Damn brakes are kicking in!","Braking hard right damn now!","Holy crap thats fast still!","Hold up need to slow down!","Ugh fine Ill stop I guess!"},"confused");
else if(phase==F.SAT_HOLD)QR(new[]{"On station and bored stiff!","Welcome to boring city!","Parked here like a chump!","Kill me this is so boring!","Orbiting with nothing to do!","Where the hell are enemies?"},"skeptical");
else if(phase==F.SAT_INTERCEPT)QR(new[]{"Found one gonna kill it!","Die bitch I see you now!","Attack mode engaged fully!","You are so totally screwed!","Target acquired kill time!","Full on kill mode activated!"},"evil");
else if(phase==F.IDLE&&lastPhase!=F.IDLE)QR(new[]{"Back to idle this sucks!","This really friggin sucks!","Stood down for no reason!","Damn it I wanted action!","Reset is done I guess!","Ugh boring as hell again!"},"annoyed");}
if(warheadsArmed&&!lastArmed)QR(new[]{"Warheads are armed now!","Hell yeah bout to wreck!","All weapons are blazing hot!","You are so damn f**ked!","Hot and ready to explode!","Die already you damn fool!","Locked in and dangerous!","Eat this one last surprise!"},"evil");
if(!warheadsArmed&&lastArmed)QR(new[]{"Stood down what a waste!","What a total damn buzzkill!","Disarmed and Im pissed!","Damn it I wanted to blow!","Back in lame safe mode!","This absolutely friggin sucks!"},"annoyed");
if(phase==F.TARGET&&distToTgt<500&&distToTgt>100&&flightTicks%60==0)QR(new[]{"Getting closer every sec!",$"{distToTgt:F0}m left to go!","Incoming you sorry ass!",$"{distToTgt:F0}m out and closing!","You are so damn f**ked!",$"{distToTgt:F0}m away from boom!","Die bitch Im almost there!",$"{distToTgt:F0}m and counting down!"},"suspicious_right");
if(phase==F.TARGET&&distToTgt<=100&&distToTgt>detDist&&flightTicks%30==0)QR(new[]{"Goodbye you sorry loser!",$"{distToTgt:F0}m say your prayers!","Say bye to your dumb ass!",$"{distToTgt:F0}m til you die!","Eat this final damn gift!",$"{distToTgt:F0}m from your doom!","Boom bitch here I come!",$"{distToTgt:F0}m this is the end!"},"dead");
if(phase!=F.IDLE&&msgQ.Count==0&&phaseTicks>30&&phaseTicks%30==0)QueuePhaseDwell();
if(bootComplete&&startupDone&&phase==F.IDLE&&bootWaitTicks%60==30){
if(!CheckBootComplete()){bootComplete=false;startupDone=false;startupCheck=0;bootWaitTicks=0;lastPadSession="";QR(new[]{"Pad just friggin reset!","Oh come on not again!","Got recompiled for nothing!","Damn it the pad changed!","Pad changed on me again!","Ugh are you kidding me?!"},"confused");}
else{var rpbs=new List<IMyProgrammableBlock>();GridTerminalSystem.GetBlocksOfType(rpbs,b=>b.IsSameConstructAs(Me)&&b!=Me);
foreach(var pb in rpbs){if(!pb.CustomName.ToUpper().Contains("UNITY PAD")||pb.CustomName.ToUpper().Contains("MISSILE"))continue;
string pcd=pb.CustomData;int si=pcd.IndexOf("pad_session=");if(si<0)break;
int ei=pcd.IndexOf('\n',si);if(ei<0)ei=pcd.Length;string ps=pcd.Substring(si+12,ei-si-12).Trim();
if(lastPadSession==""&&ps!="")lastPadSession=ps;
else if(lastPadSession!=""&&ps!=lastPadSession){bootComplete=false;startupDone=false;startupCheck=0;bootWaitTicks=0;lastPadSession="";QR(new[]{"New session detected here!","For real are you serious?!","Rebooting the whole system!","Damn pad keeps changing stuff!","Pad update screwed me up!","Again are you kidding me?!"},"confused");}
break;}}}
if(!bootComplete&&phase==F.IDLE){
bootWaitTicks++;
if(bootWaitTicks%30==1){if(!CheckBootComplete()){
if(bootWaitTicks<30)QR(new[]{"Just waking up over here!","Ugh give me five more min!","Starting up hold your ass!","Shut up Im still booting!","Booting systems right now!","Leave me alone Im tired!"},"sleepy");
else if(bootWaitTicks<90)QR(new[]{"Still waiting on the pad!","Damn pad is taking forever!","Hold on its still loading!","Ugh this boot takes so long!","Patience is not my thing!","Hurry the hell up already!"},"sleepy");
else if(bootWaitTicks<150)QR(new[]{"Still here waiting on pad!","Come on do something pad!","Still waiting you slow pad!","Hurry up Im losing it!","Any damn day now pad!","So damn slow I could die!"},"annoyed");
else if(bootWaitTicks<210)QR(new[]{"Hurry the hell up pad!","For f sake just boot it!","For real is this broken?!","This pad is totally useless!","Do it pad Im losing it!","Still waiting are you dead?!"},"annoyed");
else QR(new[]{"This is taking damn forever!","Just boot it you dumb pad!","Im so done waiting here!","F this pad Im over it!","Come on you piece of crap!","For f sake pad do something!"},"angry");
}else{bootComplete=true;bootWaitTicks=0;QR(new[]{"Pad is finally damn ready!","Bout damn time it booted!","Finally about friggin time!","About time you lazy pad!","Lets go Im ready to fly!","That took forever you jerk!","Booted up and ready now!","Lazy ass pad took forever!"},"happy");}}}
if(bootComplete&&!startupDone&&phase==F.IDLE&&msgQ.Count<3){
if(startupCheck==0){QR(new[]{"Booting up the systems!","Ugh fine lets do this!","Starting all my crap up!","Whatever lets get going!","Powering up everything now!","Here we go once again!"},"neutral");startupCheck++;}
else if(startupCheck==1){QR(new[]{"Scanning for gyroscopes now!",$"Found {gyros.Count} gyros on board!","Checking all the gyroscopes!",$"Got {gyros.Count} gyro units here!","Running the spin check now!",$"Detected {gyros.Count} gyros total!"},"confused");startupCheck++;}
else if(startupCheck==2){if(gyros.Count>0)QR(new[]{"Gyros all spinning fine!","Hell yeah thats the spin!","Gyros are good to go!","Damn right they all work!","Gyros are up and ready!","Spin baby spin for me!"},"happy");else QR(new[]{"No damn gyros at all!","Oh f**k how do I steer?!","Oh no this is real bad!","Damn it I need gyros!","Need gyros to fly right!","Fix this crap right now!"},"sad");startupCheck++;}
else if(startupCheck==3){QR(new[]{"Checking all the thrusters!",$"Found {thrusters.Count} engines on board!","Scanning engine systems now!",$"Got {thrusters.Count} thrust units here!","Running the thrust scan!",$"Detected {thrusters.Count} engines total!"},"confused");startupCheck++;}
else if(startupCheck==4){if(thrusters.Count>0)QR(new[]{"Thrusters are good to go!","Hell yeah got the power!","Full thrust power is ready!","Burn baby we got engines!","All engines ready to burn!","Full damn power available!"},"happy");else QR(new[]{"No damn thrusters at all!","What the hell am I then?!","Im stuck without engines!","You serious right now dude?","Grounded with no engines!","Fix this crap right now!!"},"sad");startupCheck++;}
else if(startupCheck==5){QR(new[]{"Checking warhead payload now!",$"Found {warheads.Count} warheads loaded!","Scanning the payload bay!",$"Got {warheads.Count} boom units here!","Running the boom check now!",$"Detected {warheads.Count} live warheads!"},"confused");startupCheck++;}
else if(startupCheck==6){if(warheads.Count>0)QR(new[]{"Boom sticks are all ready!","Loaded and ready to blow!","Kaboom baby got the goods!","Hell yeah warheads are set!","Armed up with explosives!","Die bitches when I land!"},"happy");else QR(new[]{"No damn booms on board!","What the hell no payload?!","Totally useless without boom!","You serious no warheads?!","Empty with no explosives!","Fix this I need warheads!!"},"sad");startupCheck++;}
else if(startupCheck==7){QR(new[]{"Scanning the fuel tanks now!",$"H2 is at {h2*100:F0} percent!","Checking hydrogen levels now!",$"Fuel is {h2*100:F0} percent full!","Running the tank scan now!",$"H2 reads {h2*100:F0} percent!"},"confused");startupCheck++;}
else if(startupCheck==8){if(h2>0.5)QR(new[]{"Hydrogen levels are good!","Bout time I got some fuel!","Tank is looking alright now!","Damn right fuel is good!","Full enough to fly far!","Lets burn that hydrogen up!"},"happy");else QR(new[]{"Hydrogen is way too low!",$"Only at {h2*100:F0} percent fuel!","Need way more fuel than this!",$"Only {h2*100:F0} percent full!","Feed me more hydrogen now!","Damn it need more fuel!"},"sad");startupCheck++;}
else if(startupCheck==9){QR(new[]{"Checking the power levels!",$"Battery at {bat*100:F0} percent!","Scanning battery status now!",$"Power is {bat*100:F0} percent!","Running the power scan now!",$"Battery reads {bat*100:F0} percent!"},"confused");startupCheck++;}
else if(startupCheck==10){if(bat>0.5)QR(new[]{"Power levels are looking good!","All juiced up and ready!","Battery is doing just fine!","Hell yeah got the juice!","Full power is available now!","Damn right battery is good!"},"happy");else QR(new[]{"Power is way too low!",$"Only at {bat*100:F0} percent!","Need a damn charge badly!",$"Only {bat*100:F0} percent power!","Dying over here for real!","Plug me in you lazy bum!"},"sad");startupCheck++;}
else if(startupCheck==11){QR(new[]{"Scanning sensor systems now!",$"Found {sensors.Count} sensors online!","Checking detection systems!",$"Got {sensors.Count} sensors active!","Running detection scan now!",$"Detected {sensors.Count} sensors up!"},"confused");startupCheck++;}
else if(startupCheck==12){QR(new[]{"Scanning all camera systems!",$"Found {cameras.Count} cameras ready!","Checking the vision systems!",$"Got {cameras.Count} cams online!","Running the cam check now!",$"Detected {cameras.Count} cameras up!"},"confused");startupCheck++;}
else if(startupCheck==13){QR(new[]{"Scanning antenna systems now!",$"Found {antennas.Count} antennas up!","Checking the comms system!",$"Got {antennas.Count} antennas live!","Running the comms check now!",$"Detected {antennas.Count} antennas!"},"confused");startupCheck++;}
else if(startupCheck==14){if(rc!=null)QR(new[]{"Remote control is online!","Damn right I can steer!","Flight control is ready!","Lets fly this damn thing!","Flight systems all green!","Hell yeah got full control!"},"happy");else QR(new[]{"No remote control found!","Are you dumb fix this!","Cant steer without an RC!","Fix this crap right now!!","Need a remote control bad!","You idiots forgot the RC!"},"sad");startupCheck++;}
else if(startupCheck==15){QR(new[]{"All checks are done now!","Bout damn time we finished!","All systems are a go!","Lets go kill some fools!","Ready to fly and kill!","Hell yeah all systems up!"},"happy");startupCheck++;}
else if(startupCheck==16){QR(new[]{"Ready and waiting for you!","Give me a damn target!","Waiting for coordinates now!","Gimme a target to kill!","Lets go send me coords!","Send me the damn coords!","Point me at something!","Hurry up and aim me!"},"wink");startupDone=true;}}
if(tgtGPS!=lastGPS&&tgtGPS!=Vector3D.Zero){lastGPS=tgtGPS;gpsAnnounced=false;}
if(!gpsAnnounced&&tgtGPS!=Vector3D.Zero&&phase==F.IDLE){gpsAnnounced=true;QR(new[]{"Got a target to kill!","Coordinates are locked in!","GPS target is set now!","You are dead you just dont know!","New target just came in!","Bout time you gave me one!","Target acquired hell yeah!","Damn right thats my kill!"},"angry");QR(new[]{"GPS is ready to go now!","Someone is dying real soon!","Coordinates check out fine!","Locked on and not letting go!","Position is confirmed now!","Confirmed and ready to fly!"},"neutral");QR(new[]{"Just say when boss!","Launch me at that target!","Lets go do this thing!","Send me to kill them now!","Do it now Im waiting!","Hurry up and launch me!"},"wink");}
if(phase==F.IDLE&&msgQ.Count==0&&curMsg==null&&startupDone){idleTicks++;if(idleTicks>=25){idleTicks=0;QueueIdleMsg(h2,bat);}}
lastH2=h2;lastBat=bat;lastPhase=phase;lastArmed=warheadsArmed;}
void QueueIdleMsg(double h2,double bat){
idleCycle++;int c=idleCycle%30;
if(c==0)QR(new[]{"Running a system check now!",$"Got {gyros.Count} gyros spinning!","Scanning the gyros again!",$"{gyros.Count} gyros are online!","Ugh checking stuff again!",$"All {gyros.Count} gyros are ready!"},"confused");
else if(c==1)QR(new[]{"Thrusters are looking good!",$"Got {thrusters.Count} engines to burn!","Engines are all ready here!",$"{thrusters.Count} engines standing by!","Ready to burn on command!",$"All {thrusters.Count} engines are hot!"},"happy");
else if(c==2)QR(new[]{"Warheads are loaded up!",$"Got {warheads.Count} warheads ready!","Payload is primed to blow!",$"{warheads.Count} warheads standing by!","Got {warheads.Count} boom sticks loaded!","Hell yeah thats explosive!"},"wink");
else if(c==3){if(h2>0.8)QR(new[]{$"Hydrogen is at {h2*100:F0} percent!","Hell yeah tank is full!","Fuel status looks damn good!","Topped off and ready to burn!","H2 report is looking great!","Damn right fuel is solid!"},"happy");else QR(new[]{$"Hydrogen only {h2*100:F0} percent!","Feed me more fuel dammit!","Fuel is running kinda low!","Damn it need more hydrogen!","H2 report is not great!","Need way more fuel here!"},"sad");}
else if(c==4){if(bat>0.8)QR(new[]{$"Battery is at {bat*100:F0} percent!","All juiced up and ready!","Power check is looking good!","Hell yeah battery is full!","Battery report all solid!","Damn right power is great!"},"happy");else QR(new[]{$"Battery only at {bat*100:F0} percent!","Dying over here need charge!","Power is running really low!","Charge me up right now!","Battery report not looking good!","Damn it need more power!"},"sad");}
else if(c==5)QR(new[]{"Checking sensor systems now!",$"Got {sensors.Count} sensors active!","Scanning for threats out there!",$"{sensors.Count} sensors are online!","Keeping my eyes wide open!",$"All {sensors.Count} sensors are up!"},"confused");
else if(c==6)QR(new[]{"Cameras are ready to go!",$"Got {cameras.Count} cameras ready!","Watching everything around me!",$"{cameras.Count} cameras online now!","Vision systems looking good!",$"All {cameras.Count} cameras are live!"},"suspicious_left");
else if(c==7&&tgtGPS!=Vector3D.Zero)QR(new[]{"Target is set and locked!","Lets kill that sucker now!","GPS is locked on target!","Send me to wreck them!","Coordinates are all loaded!","Hurry up and launch me!"},"angry");
else if(c==7)QR(new[]{"No target set you lazy bum!","You are so friggin lazy!","Waiting for a damn target!","Gimme some GPS coords already!","Where the hell am I going?","Do your damn job already!"},"annoyed");
else if(c==8)QR(new[]{"Bored as hell out here!","Launch me already dammit!","Come on do something already!","Just freaking do it already!","Still waiting on your ass!","Damn it this is so boring!","So bored I could explode!","Any damn day now please!"},"annoyed");
else if(c==9)QR(new[]{"Still waiting over here!","Screw this boring crap!","Still here doing nothing!","Kill me this is awful!","Hello is anyone out there??","Wake the hell up people!"},"sleepy");
else if(c==10)QR(new[]{$"Current mode is {mode}!","Damn right thats my setup!","Flight mode is configured!","Whatever it is what it is!","Config is all set up now!","Lets go already come on!"},"neutral");
else if(c==11)QR(new[]{"Antenna systems looking good!",$"Got {antennas.Count} antennas up!","Comms are working just fine!",$"{antennas.Count} antennas are live!","Transmitter ready to go!",$"All {antennas.Count} antennas are on!"},"neutral");
else if(c==12)QR(new[]{"Everything is looking good!","Damn right all checks pass!","All checks came back fine!","Hell yeah systems are go!","All nominal and ready!","Bout time something worked!"},"happy");
else if(c==13)QR(new[]{"Come on lets blow some crap!","Wanna blow something up!","Lets go wreck some stuff!","I wanna kill something now!","Send me out there already!","Do it right now come on!"},"wink");
else if(c==14)QR(new[]{"Yawns so damn bored here!","Bored as absolute hell!","Taps on the console waiting!","Is this thing even on?","Kicks the pad out of spite!","Wake the hell up out there!"},"skeptical");
else if(c==15)QR(new[]{"Merge block is connected fine!","Detach me and let me fly!","Docked up and ready to go!","Let me go already please!","Locked in on the damn pad!","Free me from this prison!"},"neutral");
else if(c==16&&h2>0.9&&bat>0.9)QR(new[]{"Everything at one hundred!","Hell yeah fully topped off!","Max ready across the board!","Damn right all tanks full!","Topped up and waiting here!","Send me now Im perfect!"},"happy");
else if(c==16)QR(new[]{"Running a little low here!",$"H2 at {h2*100:F0} percent only!","Not fully loaded up yet!",$"H2 only {h2*100:F0} percent!","Feed me more fuel please!",$"H2 reads {h2*100:F0} percent!"},"sleepy");
else if(c==17)QR(new[]{"All done and ready here!","Bout damn time to launch!","Ready to go at any time!","Damn right Im primed up!","Primed and waiting to fly!","Hurry up and use me!"},"happy");
else if(c==18)QR(new[]{"Launch me for f sake!","For f sake just do it!","Do it now Im begging you!","Hurry the hell up already!","So damn impatient right now!","God damn just press launch!"},"angry");
else if(c==19)QR(new[]{"Just sitting here like a chump!","This really friggin sucks!","Idle and bored out of mind!","Kill me this is so boring!","Bored as absolute hell here!","Damn it do something already!"},"annoyed");
else if(c==20)QR(new[]{"Whistles while doing nothing!","Bored out of my damn mind!","Hums a little death tune!","Screw this waiting around!","Kicks stuff out of boredom!","Ugh this is the worst!"},"happy");
else if(c==21)QR(new[]{"Hey is anyone out there!","Over here on the pad hello!","Notice me you damn fools!","Yall are a bunch of jerks!","Yo pay attention to me!","Hey pad are you alive?!"},"annoyed");
else if(c==22)QR(new[]{"I want to make some boom!","Need a target to kaboom!","Need a target real bad now!","Wanna blow some crap up!","When do I get to boom?","Kaboom please Im begging!"},"wink");
else if(c==23)QR(new[]{"Remote control standing by!",rc!=null?"Hell yeah I can steer!":"What the hell no RC?!","Flight systems all checked!",rc!=null?"Damn right we fly today!":"Fix this stupid thing now!"},"neutral");
else if(c==24)QR(new[]{"Dreaming of sweet explosions!","Of big beautiful booms!","Thinking about my targets!","Of killing everything out there!","Dreaming of total carnage!","Of pure beautiful destruction!"},"sleepy");
else if(c==25)QR(new[]{"Who is next on the list?","Pick a damn target already!","Choose one I dont care who!","Who do you want me to kill?","Scan the area for targets!","Find them so I can kill!"},"suspicious_right");
else if(c==26)QR(new[]{"Im fast as hell you know!","Eat this you slow bastards!","Try to catch this missile!","You cant dodge me at all!","There is no escape from me!","You are all totally screwed!"},"evil");
else if(c==27)QR(new[]{"Tick tock time is running!","The boom clock is ticking!","Times up for someone soon!","Someone is dying real soon!","Countdown to destruction here!","Three two one and boom!"},"skeptical");
else if(c==28)QR(new[]{"I love a good explosion!","Born to fly and destroy!","Born to kill everything!","Built different from the rest!","The boom life chose me!","Id die for a good boom!"},"love");
else if(c==29)QR(new[]{"Hey pad launch me already!","Launch me you lazy pad!","Hey are you even listening?!","Just frigging do it already!","Right damn now launch me!","God damn it press the button!"},"angry");}
void QueuePhaseDwell(){
double spd=rc!=null?rc.GetShipVelocities().LinearVelocity.Length():0;
int t=phaseTicks;
if(phase==F.CLIMB){
if(t<120)QR(new[]{$"Altitude is {currentAltitude:F0}m now!",$"Speed at {spd:F0} meters per sec!","Climbing up fast as hell!",$"Already at {currentAltitude:F0}m high!","Going up looking damn good!",$"Flying at {spd:F0} speed!"},"shocked");
else if(t<300)QR(new[]{"Still going up damn it!","This climb is taking forever!","Taking so damn long to climb!","This really friggin sucks!","How high do I gotta go?!","Ugh even more climbing?!","So far up already geez!","Hurry up and end this climb!"},"annoyed");
else if(t<600)QR(new[]{"For f sake end this climb!","End this climb already please!","This climb is killing me!","Screw you stupid gravity!","I hate climbing so much!","Die you stupid gravity die!","Damn it all to hell now!","Still climbing are you serious?!"},"angry");
else QR(new[]{"Gonna die up here alone!","Lost up here in the sky!","Lost somewhere in the sky!","So tired of climbing up!","End me now Im so done!","Why is it so damn high?!","Kill me this is miserable!","So alone way up here!"},"sad");
}else if(phase==F.COAST){
if(t<120)QR(new[]{$"Coasting at {spd:F0} speed!",$"Drifting through empty space!",$"Distance is {distToTgt:F0}m out!","Cruising along real smooth!",coasting?"Engine is off just drifting!":"Burning through the damn void!","In coast mode right now!"},"sleepy");
else if(t<300)QR(new[]{"Boring as absolute hell here!","Aint shit to look at!","So bored in empty space!","Nothing here but damn nothing!","Hate this coasting garbage!","Ugh just drifting along here!","Screw this empty ass space!","Total damn snooze fest here!"},"annoyed");
else if(t<600)QR(new[]{"Bored as hell kill me now!","Kill me right damn now please!","Damn this coast is forever!","For f sake go damn faster!","So damn far from anything!","I hate this so much!","End me Im so bored!","Go faster you slow piece!"},"angry");
else QR(new[]{"So lonely out here alone!","Nothing but empty damn void!","Just me in the darkness!","Lost out in stupid space!","Space sucks so damn much!","Wanna die out here honestly!","Its so dark and empty!","Nobody is out here at all!"},"crying");
}else if(phase==F.REENTRY){
if(t<120)QR(new[]{$"Going {spd:F0} and burning in!","Burning into the atmosphere!",$"Distance {distToTgt:F0}m to target!","Holy shit its so damn hot!","So damn hot right now!","Everything is on fire now!!"},"shocked");
else if(t<300)QR(new[]{"Still hot as absolute hell!","Damn this heat is brutal!","Burning up out here bad!","Melting over here for real!","So damn hot I cant think!","Ugh this fire is awful!","This heat absolutely sucks!","Getting crispy out here!!"},"annoyed");
else if(t<600)QR(new[]{"Im literally melting apart!","Oh god the heat is insane!","Im actually dying out here!","Gonna burn to damn ashes!","For f sake its so hot!","Help me Im burning up!","Gonna melt into nothing!","Way too damn hot right now!"},"angry");
else QR(new[]{"Im absolute toast right now!","Burnt to a damn crisp!","It was nice knowing yall!","Goodbye cruel stupid world!","Fried alive and still going!","Crispy as hell rest in peace!","Completely melted at this point!","So hot I cant even think!"},"dead");
}else if(phase==F.TARGET){
if(t<120)QR(new[]{$"Only {distToTgt:F0}m out now!","Closing in on the target!",$"Speed is {spd:F0} right now!","Getting closer every second!","Getting closer watch out!",$"Just {distToTgt:F0}m left to go!"},"suspicious_left");
else if(t<300)QR(new[]{"Come on get me closer!","Get closer to the target!","Still damn far from target!","Move it go damn faster!","Hurry up and close in!","Die already you damn target!","Why is the target so far?","Ugh this target is annoying!"},"annoyed");
else if(t<600)QR(new[]{"Why cant I reach this thing?!","Cant seem to get there!","Damn target is too far!","So friggin far from target!","Screw this stupid target!","For f sake just die already!","Am I lost or something?!","This is a dumb ass target!"},"angry");
else QR(new[]{"Am I even going right way?","Did I go the wrong way?","Help me Im so damn lost!","Confused as hell right now!","Where the hell even am I?","So damn far from everything!","Totally lost out here now!","Im so completely screwed!"},"sad");
}else if(phase==F.ARM){
if(t<120)QR(new[]{"Arming up the warheads now!","Almost hot just hold on!","Getting ready to go hot!","Priming up the explosives!","Hold on arming in progress!","Gonna be hot real soon!"},"skeptical");
else if(t<300)QR(new[]{"Still arming what the hell!","Hurry up and finish arming!","Come on just arm already!","Takes damn forever to arm!","Ugh still priming warheads!","Just friggin arm already!"},"annoyed");
else QR(new[]{"Just arm you stupid thing!","For f sake just prime up!","Is this thing broken or what?!","Damn arming system is busted!","Work damn it Im waiting!","Am I stuck or something?!"},"angry");
}else if(phase==F.SAT_CLIMB){
if(t<120)QR(new[]{$"Altitude {currentAltitude/1000:F1}km now!","Going up to damn space!",$"Speed at {spd:F0} per sec!","Heading to space right now!","Climbing higher every sec!","Higher and higher we go!"},"happy");
else if(t<300)QR(new[]{"So far up already geez!","Damn space is far away!","Still going up and up!","How friggin high is orbit?!","Ugh this climb is boring!","Boring as hell climbing up!"},"annoyed");
else QR(new[]{"Going up forever I guess!","Screw this damn orbit!","I hate space so much!","Still climbing are you serious?!","For f sake reach orbit!","Die you stupid gravity!"},"angry");
}else if(phase==F.SAT_BRAKE){
if(t<120)QR(new[]{$"Speed is {spd:F0} slowing down!","Slowing down in orbit now!","Braking hard in damn space!","Damn brakes are working hard!","Stopping is harder than I thought!","Easy now gotta slow down!"},"confused");
else QR(new[]{"Just stop you damn thing!","For f sake hit the brakes!","Still going way too fast!","Stop right now damn it!","Ugh still drifting around!","Hate stopping in space!"},"angry");
}else if(phase==F.SAT_HOLD){
if(t<120)QR(new[]{"Scanning the area for threats!","On patrol watching everything!","Watching for enemies out here!","Eyes wide open and scanning!","Guard duty is so damn boring!","Holding position up in orbit!"},"skeptical");
else if(t<300)QR(new[]{"Bored as hell up here!","No enemies anywhere at all!","Hate this guard duty crap!","So damn boring in orbit!","Absolutely nothing is here!","Empty space is the worst!"},"annoyed");
else if(t<600)QR(new[]{"So bored I could scream!","Kill me now please anyone!","Damn this orbit is boring!","Screw this stupid station!","For f sake nobody is here!","I hate this so damn much!"},"angry");
else QR(new[]{"So alone up here in space!","Nobody is here at all!","Space sucks so damn much!","Just me and stupid darkness!","Cold dark and empty void!","Lonely as absolute hell here!","Miss the pad honestly!","Wanna go back home now!"},"crying");
}else if(phase==F.SAT_INTERCEPT){
if(t<120)QR(new[]{$"Target is {distToTgt:F0}m away!","Chasing them down right now!","Gonna get em real soon!","Die bitch Im coming fast!","Incoming you stupid fool!",$"Only {distToTgt:F0}m to go!"},"evil");
else if(t<300)QR(new[]{"Get back here you coward!","Damn runner wont stop moving!","Stop friggin moving already!","Slippery little bastard this one!","For f sake just hold still!","Quit dodging you damn punk!"},"angry");
else QR(new[]{"Cant catch this damn thing!","F this guy hes too fast!","Way too fast for me!","Help me Im losing them!","Did I lose them already?!","Damn it all to hell!"},"sad");
}}
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
