# Space Engineers Programmable Block API Reference

Base URL: https://malforge.github.io/spaceengineers/pbapi/

## Overview

Community-maintained documentation for classes, interfaces, and methods available to in-game scripts. Not affiliated with Keen Software House.

## Common Interface Inheritance Pattern

Most block interfaces follow this hierarchy:
```
IMyEntity
└── IMyCubeBlock
    └── IMyTerminalBlock
        └── IMyFunctionalBlock
            └── [Specific Block Interface]
```

---

## IMyProgrammableBlock

Reference: https://malforge.github.io/spaceengineers/pbapi/Sandbox.ModAPI.Ingame.IMyProgrammableBlock.html

Inherits: IMyFunctionalBlock, IMyTextSurfaceProvider

### Properties
| Property | Type | Description |
|----------|------|-------------|
| IsRunning | bool | Indicates if program is currently executing |
| TerminalRunArgument | string | Default terminal argument for the block |
| SurfaceCount | int | Number of text surfaces (from IMyTextSurfaceProvider) |

### Methods
| Method | Description |
|--------|-------------|
| TryRun(string) | Attempts to run this programmable block with given argument. Already-running blocks cannot be invoked again |
| GetSurface(int) | Gets a text surface by index |

---

## IMyRemoteControl

Reference: https://malforge.github.io/spaceengineers/pbapi/Sandbox.ModAPI.Ingame.IMyRemoteControl.html

Inherits: IMyShipController

### Properties
| Property | Type | Description |
|----------|------|-------------|
| CurrentWaypoint | MyWaypointInfo | Gets current target waypoint |
| Direction | Base6Directions.Direction | Gets/sets current flight direction |
| FlightMode | FlightMode | Gets/sets current flight mode |
| IsAutoPilotEnabled | bool | Whether autopilot is enabled |
| SpeedLimit | float | Gets/sets autopilot speed limit |
| WaitForFreeWay | bool | Controls collision avoidance during autopilot |

### Methods
| Method | Description |
|--------|-------------|
| AddWaypoint(Vector3D, string) | Creates a navigation waypoint |
| AddWaypoint(MyWaypointInfo) | Creates waypoint from structured data |
| ClearWaypoints() | Removes all waypoints |
| GetNearestPlayer(out Vector3D) | Gets nearest player position (NPC only) |
| GetWaypointInfo(List<MyWaypointInfo>) | Gets info about configured waypoints |
| SetAutoPilotEnabled(bool) | Toggles autopilot |
| SetCollisionAvoidance(bool) | Toggles collision detection |
| SetDockingMode(bool) | Toggles docking mode |

---

## IMyGyro

Reference: https://malforge.github.io/spaceengineers/pbapi/Sandbox.ModAPI.Ingame.IMyGyro.html

Inherits: IMyFunctionalBlock

### Properties
| Property | Type | Description |
|----------|------|-------------|
| GyroOverride | bool | Gets/sets whether gyro has override enabled |
| GyroPower | float | Gets/sets gyroscope power |
| Pitch | float | Gets/sets the pitch angle |
| Roll | float | Gets/sets the roll angle |
| Yaw | float | Gets/sets the yaw angle |

**Note:** Four gyro variants exist: large/small standard and Prototech versions.

---

## IMyLaserAntenna

Reference: https://malforge.github.io/spaceengineers/pbapi/Sandbox.ModAPI.Ingame.IMyLaserAntenna.html

Inherits: IMyFunctionalBlock

### Properties
| Property | Type | Description |
|----------|------|-------------|
| IsPermanent | bool | Controls permanent connection |
| Range | float | Maximum operational distance |
| RequireLoS | bool | Whether line-of-sight is required |
| Status | MyLaserAntennaStatus | Current operational state |
| TargetCoords | Vector3D | Destination coordinates |

### Methods
| Method | Description |
|--------|-------------|
| Connect() | Initiates connection to target location |
| SetTargetCoords(string) | Assigns destination coordinates |

---

## Common Inherited Properties (from IMyTerminalBlock)

| Property | Description |
|----------|-------------|
| CustomName | Block's custom name |
| CustomData | Custom data string storage |
| Enabled | Whether block is enabled |
| IsWorking | Whether block is operational |
| IsFunctional | Whether block is functional |
| ShowInTerminal | Visibility in terminal |
| ShowOnHUD | Visibility on HUD |
| EntityId | Unique entity identifier |
| CubeGrid | Reference to the grid |
| Position | Block position on grid |
| WorldMatrix | World transformation matrix |
| OwnerId | Owner's player ID |

## Common Inherited Methods

| Method | Description |
|--------|-------------|
| GetActions(List<ITerminalAction>) | Gets available actions |
| GetProperties(List<ITerminalProperty>) | Gets available properties |
| GetActionWithName(string) | Gets action by name |
| GetProperty(string) | Gets property by name |
| HasPlayerAccess(long) | Checks player access |
| GetInventory(int) | Gets inventory by index |
| GetOwnerFactionTag() | Gets owner faction tag |
| GetUserRelationToOwner(long) | Gets relationship to owner |

---

## Finding More API Documentation

Search pattern: `malforge space engineers pbapi [block type]`

Examples:
- Thrusters: `Sandbox.ModAPI.Ingame.IMyThrust`
- Sensors: `Sandbox.ModAPI.Ingame.IMySensorBlock`
- Connectors: `Sandbox.ModAPI.Ingame.IMyShipConnector`
- Drills: `Sandbox.ModAPI.Ingame.IMyShipDrill`
- Welders: `Sandbox.ModAPI.Ingame.IMyShipWelder`
- Grinders: `Sandbox.ModAPI.Ingame.IMyShipGrinder`
- Pistons: `Sandbox.ModAPI.Ingame.IMyPistonBase`
- Rotors: `Sandbox.ModAPI.Ingame.IMyMotorStator`
- Batteries: `Sandbox.ModAPI.Ingame.IMyBatteryBlock`
- Solar Panels: `Sandbox.ModAPI.Ingame.IMySolarPanel`
- Cameras: `Sandbox.ModAPI.Ingame.IMyCameraBlock`
