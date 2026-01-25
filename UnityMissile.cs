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
int coastTicks=0;
int burnTime=5;
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
Vector3D padLaserPos;
bool useLaser=false;
int mslNumber=0;
int padID=1;
int tgtRel=0;
List<IMyBatteryBlock> batteries=new List<IMyBatteryBlock>();
List<IMyGasTank> h2tanks=new List<IMyGasTank>();
List<IMyGasGenerator> generators=new List<IMyGasGenerator>();
List<IMyLightingBlock> lights=new List<IMyLightingBlock>();
IMyShipMergeBlock merge;
IMyShipConnector ammoConnector;
bool isSatellite=false;
Vector3D satPosition;
Vector3D satVelocity;
bool satStationKeeping=false;
int satHoldTicks=0;
int interceptLostTicks=0;
string satRelayTag="UNITY_SAT_RELAY";
IMyBroadcastListener satRelayListener;
IMyBroadcastListener satInterceptListener;
double satTargetAlt=100000;
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
}
public void Save(){Storage=$"{(int)phase}|{(int)mode}|{tgtGPS.X},{tgtGPS.Y},{tgtGPS.Z}|{(warheadsArmed?"1":"0")}|{launchPos.X},{launchPos.Y},{launchPos.Z}";}
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
if(phase!=F.IDLE)Runtime.UpdateFrequency=UpdateFrequency.Update10;
}}

public void Main(string a,UpdateType u){
if(a=="NAME"){FindBlocks();NameParts();return;}
if(a=="RESET"){FindBlocks();SafeReset();return;}
if(a=="LAUNCH"){
ParseConfig();
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
}else if(flightMode==2){
phase=launchedFromGrav?F.CLIMB:F.TARGET;
}else{
phase=F.CLIMB;
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
Vector3D grav=rc.GetNaturalGravity();
if(grav.Length()<0.05){
coastTicks=0;
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
EnableThrust(true);
return;
}
if(dist<reentryDist){
EnableThrust(true);
phase=F.TARGET;
return;
}
AimAt(target.Value);
coastTicks++;
if(coastTicks<burnTime*6){
EnableThrust(true);
coasting=false;
}else{
EnableThrust(false);
coasting=true;
}
}

void DoReentry(){
if(rc==null){EnableThrust(true);return;}
EnableThrust(true);
Vector3D? target=GetTarget();
if(target.HasValue){
AimAt(target.Value);
distToTgt=Vector3D.Distance(Me.GetPosition(),target.Value);
if(distToTgt<reentryDist/2)phase=F.TARGET;
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
if(ammoConnector!=null){ammoConnector.ThrowOut=true;}
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
double alt=Vector3D.Distance(Me.GetPosition(),launchPos);
if(currentGrav<0.05){
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
if(gravMag>0.5){double fallRate=Vector3D.Dot(satVelocity,Vector3D.Normalize(grav));if(fallRate>5){warheadsArmed=false;isSatellite=false;phase=F.TARGET;Runtime.UpdateFrequency=UpdateFrequency.Update10;EnableThrust(true);return;}}
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
if(cmd=="DEORBIT"||cmd==$"DEORBIT:{padID}"||cmd==$"DETONATE:{padID}"){isSatellite=false;phase=F.TARGET;Runtime.UpdateFrequency=UpdateFrequency.Update10;EnableThrust(true);}
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
foreach(var a in antennas){if(!a.Enabled||!a.EnableBroadcasting){a.Enabled=true;a.EnableBroadcasting=true;a.Radius=50000f;}}
wasInBlackout=inBlackout;
bool willBlackout=distFromPad>antennaRange*0.95;
inBlackout=distFromPad>antennaRange;
string status=phase.ToString();
if(!wasInBlackout&&willBlackout&&!inBlackout)status="ENTERING_BLACKOUT";
else if(wasInBlackout&&!inBlackout){status="CONTACT_RESTORED";targetVelSamples=0;lastTargetVel=Vector3D.Zero;}
else if(inBlackout)return;
double spd=rc!=null?rc.GetShipVelocities().LinearVelocity.Length():0;
double h2=0;foreach(var t in h2tanks)h2+=t.FilledRatio;if(h2tanks.Count>0)h2/=h2tanks.Count;
double bat=0;foreach(var b in batteries)bat+=b.CurrentStoredPower/b.MaxStoredPower;if(batteries.Count>0)bat/=batteries.Count;
if(phase==F.TARGET&&(h2<0.15||bat<0.15))status="LOW_FUEL";
string camInfo=$"{cameras.Count}";if(cameras.Count>0){string cn="";foreach(var c in cameras)cn+=(cn.Length>0?",":"")+c.CustomName.Replace("|","");camInfo+=$"|{cn}";}
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
if(line.StartsWith("BurnTime=")){int b;if(int.TryParse(line.Substring(9),out b))burnTime=b;}
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
rc=null;merge=null;ammoConnector=null;laserPad=null;laserNorth=null;laserSouth=null;laserEast=null;laserWest=null;
gyros.Clear();thrusters.Clear();warheads.Clear();sensors.Clear();cameras.Clear();antennas.Clear();lasers.Clear();batteries.Clear();h2tanks.Clear();generators.Clear();lights.Clear();
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
if(b is IMyShipMergeBlock&&merge==null)merge=b as IMyShipMergeBlock;
if(b is IMyShipConnector&&b.CustomName.Contains("[AMMO]"))ammoConnector=b as IMyShipConnector;
}
foreach(var g in gyros){g.Enabled=true;g.GyroOverride=true;}
}
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
a.Radius=50000f;
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
case T.MANUAL:return null;
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
}
void Detonate(){
if(isSatellite)return;
if(phase==F.CLIMB||phase==F.ARM){SendFinalStatus("DETONATE_BLOCKED_CLIMB");SafeReset();return;}
if(flightTicks<60){SendFinalStatus("DETONATE_BLOCKED_EARLY");SafeReset();return;}
if(distFromPad<100){SendFinalStatus("DETONATE_BLOCKED_ON_PAD");SafeReset();return;}
SendFinalStatus("IMPACT");
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
int elapsed=coastTicks/6;
s+=$"| {(coasting?"- COASTING":"# BURNING")}        |\n";
s+=$"| Time: {elapsed}s / {burnTime}s burn |\n";
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
