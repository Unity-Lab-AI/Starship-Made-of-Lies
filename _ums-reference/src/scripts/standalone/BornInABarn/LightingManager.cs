// <mdk sortorder="250" />
using System;
using System.Collections.Generic;
using Sandbox.ModAPI.Ingame;
using VRageMath;

namespace IngameScript
{
    partial class Program
    {
        readonly List<IMyLightingBlock> _lights = new List<IMyLightingBlock>();
        readonly HashSet<long> _doorSensorIds = new HashSet<long>();
        readonly HashSet<long> _lightSensorIds = new HashSet<long>();

        void ClassifySensors()
        {
            _doorSensorIds.Clear();
            _lightSensorIds.Clear();

            for (int d = 0; d < _doors.Count; d++)
            {
                IMyDoor door = _doors[d];
                if (door.CubeGrid != Me.CubeGrid) continue;
                if (!door.IsFunctional) continue;
                if (IsAirlockDoor(door)) continue;

                Vector3I dPos = door.Position;
                IMySensorBlock closest = null;
                double bestDist = double.MaxValue;

                for (int s = 0; s < _sensors.Count; s++)
                {
                    IMySensorBlock sensor = _sensors[s];
                    if (sensor.CubeGrid != Me.CubeGrid) continue;
                    if (!sensor.IsFunctional) continue;
                    if (IsSensorInAirlock(sensor)) continue;
                    if (_doorSensorIds.Contains(sensor.EntityId)) continue;

                    Vector3I sPos = sensor.Position;
                    double dist = Math.Abs(sPos.X - dPos.X)
                                + Math.Abs(sPos.Y - dPos.Y)
                                + Math.Abs(sPos.Z - dPos.Z);
                    if (dist <= LIGHT_SENSOR_DOOR_DISTANCE && dist < bestDist)
                    {
                        bestDist = dist;
                        closest = sensor;
                    }
                }

                if (closest != null)
                    _doorSensorIds.Add(closest.EntityId);
            }

            for (int s = 0; s < _sensors.Count; s++)
            {
                IMySensorBlock sensor = _sensors[s];
                if (sensor.CubeGrid != Me.CubeGrid) continue;
                if (!sensor.IsFunctional) continue;
                if (_doorSensorIds.Contains(sensor.EntityId)) continue;
                if (IsSensorInAirlock(sensor)) continue;

                _lightSensorIds.Add(sensor.EntityId);
            }
        }

        bool IsSensorInAirlock(IMySensorBlock sensor)
        {
            for (int a = 0; a < _airlocks.Count; a++)
            {
                Airlock al = _airlocks[a];
                for (int s = 0; s < al.Sensors.Count; s++)
                {
                    if (al.Sensors[s].EntityId == sensor.EntityId)
                        return true;
                }
            }
            return false;
        }

        bool IsLightSensor(IMySensorBlock sensor)
        {
            return _lightSensorIds.Contains(sensor.EntityId);
        }

        bool IsDoorSensor(IMySensorBlock sensor)
        {
            return _doorSensorIds.Contains(sensor.EntityId);
        }

        void ConfigureLightSensors()
        {
            for (int i = 0; i < _sensors.Count; i++)
            {
                IMySensorBlock sensor = _sensors[i];
                if (sensor.CubeGrid != Me.CubeGrid) continue;
                if (!IsLightSensor(sensor)) continue;

                sensor.FrontExtend = LIGHT_SENSOR_FRONT_EXTEND;
                sensor.BackExtend = LIGHT_SENSOR_BACK_EXTEND;
                sensor.LeftExtend = LIGHT_SENSOR_LEFT_EXTEND;
                sensor.RightExtend = LIGHT_SENSOR_RIGHT_EXTEND;
                sensor.TopExtend = LIGHT_SENSOR_TOP_EXTEND;
                sensor.BottomExtend = LIGHT_SENSOR_BOTTOM_EXTEND;

                sensor.DetectPlayers = true;
                sensor.DetectOwner = true;
                sensor.DetectFriendly = true;
                sensor.DetectEnemy = false;
                sensor.DetectNeutral = false;

                sensor.DetectLargeShips = false;
                sensor.DetectSmallShips = false;
                sensor.DetectStations = false;
                sensor.DetectSubgrids = false;
                sensor.DetectAsteroids = false;
                sensor.DetectFloatingObjects = false;
            }
        }

        void ConfigureSensorsFromRoomData()
        {
            if (_rooms.Count == 0)
            {
                ConfigureLightSensors();
                return;
            }

            for (int r = 0; r < _rooms.Count; r++)
            {
                Room room = _rooms[r];
                if (room.IsAirlock) continue;

                for (int s = 0; s < room.Sensors.Count; s++)
                {
                    IMySensorBlock sensor = room.Sensors[s];
                    if (sensor.CubeGrid != Me.CubeGrid) continue;
                    if (!sensor.IsFunctional) continue;
                    if (IsSensorInAirlock(sensor)) continue;

                    Vector3I sPos = sensor.Position;
                    bool nearDoor = false;
                    for (int d = 0; d < room.Doors.Count; d++)
                    {
                        IMyDoor door = room.Doors[d];
                        Vector3I dPos = door.Position;
                        double dist = Math.Abs(sPos.X - dPos.X)
                                    + Math.Abs(sPos.Y - dPos.Y)
                                    + Math.Abs(sPos.Z - dPos.Z);
                        if (dist <= LIGHT_SENSOR_DOOR_DISTANCE)
                        {
                            nearDoor = true;
                            break;
                        }
                    }

                    if (nearDoor)
                    {
                        ConfigureDoorSensor(sensor);
                    }
                    else
                    {
                        float range = room.GetRecommendedSensorRange();
                        ConfigureRoomSensor(sensor, room, range);
                    }
                }
            }
        }

        void ConfigureDoorSensor(IMySensorBlock sensor)
        {
            sensor.FrontExtend = SENSOR_FRONT_EXTEND;
            sensor.BackExtend = SENSOR_BACK_EXTEND;
            sensor.LeftExtend = SENSOR_SIDE_EXTEND;
            sensor.RightExtend = SENSOR_SIDE_EXTEND;
            sensor.TopExtend = SENSOR_VERTICAL_EXTEND;
            sensor.BottomExtend = SENSOR_VERTICAL_EXTEND;

            sensor.DetectPlayers = true;
            sensor.DetectOwner = true;
            sensor.DetectFriendly = true;
            sensor.DetectEnemy = false;
            sensor.DetectNeutral = false;

            sensor.DetectLargeShips = false;
            sensor.DetectSmallShips = false;
            sensor.DetectStations = false;
            sensor.DetectSubgrids = false;
            sensor.DetectAsteroids = false;
            sensor.DetectFloatingObjects = false;
        }

        void ConfigureRoomSensor(IMySensorBlock sensor, Room room, float range)
        {
            float depthRange = room.Depth * _gridBlockSize + 2f;
            if (depthRange > 50f) depthRange = 50f;

            float widthHalf = (room.Width * _gridBlockSize) / 2f + 2f;
            if (widthHalf > 50f) widthHalf = 50f;

            float heightRange = room.Height * _gridBlockSize + 2f;
            if (heightRange > 50f) heightRange = 50f;

            sensor.FrontExtend = depthRange;
            sensor.BackExtend = 1f;
            sensor.LeftExtend = widthHalf;
            sensor.RightExtend = widthHalf;
            sensor.TopExtend = 2f;
            sensor.BottomExtend = heightRange;

            sensor.DetectPlayers = true;
            sensor.DetectOwner = true;
            sensor.DetectFriendly = true;
            sensor.DetectEnemy = false;
            sensor.DetectNeutral = false;

            sensor.DetectLargeShips = false;
            sensor.DetectSmallShips = false;
            sensor.DetectStations = false;
            sensor.DetectSubgrids = false;
            sensor.DetectAsteroids = false;
            sensor.DetectFloatingObjects = false;
        }

        void ProcessRoomLighting()
        {
            _lights.Clear();
            GridTerminalSystem.GetBlocksOfType(_lights);

            for (int r = 0; r < _rooms.Count; r++)
            {
                Room room = _rooms[r];
                if (room.IsAirlock) continue;

                bool sensorActive = false;

                for (int s = 0; s < room.Sensors.Count; s++)
                {
                    IMySensorBlock sensor = room.Sensors[s];
                    if (sensor == null || !sensor.IsFunctional) continue;
                    if (IsSensorInAirlock(sensor)) continue;

                    Vector3I sPos = sensor.Position;
                    bool nearDoor = false;
                    for (int d = 0; d < room.Doors.Count; d++)
                    {
                        IMyDoor door = room.Doors[d];
                        Vector3I dPos = door.Position;
                        double dist = Math.Abs(sPos.X - dPos.X)
                                    + Math.Abs(sPos.Y - dPos.Y)
                                    + Math.Abs(sPos.Z - dPos.Z);
                        if (dist <= LIGHT_SENSOR_DOOR_DISTANCE)
                        {
                            nearDoor = true;
                            break;
                        }
                    }

                    if (!nearDoor && sensor.IsActive)
                    {
                        sensorActive = true;
                        break;
                    }
                }

                if (!sensorActive && !room.HasCeilingSensor)
                {
                    for (int s = 0; s < room.Sensors.Count; s++)
                    {
                        IMySensorBlock sensor = room.Sensors[s];
                        if (sensor == null || !sensor.IsFunctional) continue;
                        if (IsSensorInAirlock(sensor)) continue;
                        if (sensor.IsActive)
                        {
                            sensorActive = true;
                            break;
                        }
                    }
                }

                for (int l = 0; l < room.Lights.Count; l++)
                {
                    IMyLightingBlock light = room.Lights[l];
                    if (light == null || !light.IsFunctional) continue;
                    if (light.CubeGrid != Me.CubeGrid) continue;
                    light.Enabled = sensorActive;
                }
            }
        }

        void ProcessLighting()
        {
            _lights.Clear();
            GridTerminalSystem.GetBlocksOfType(_lights);

            HashSet<long> turnOn = new HashSet<long>();

            for (int s = 0; s < _sensors.Count; s++)
            {
                IMySensorBlock sensor = _sensors[s];
                if (sensor.CubeGrid != Me.CubeGrid) continue;
                if (!sensor.IsFunctional) continue;
                if (!IsLightSensor(sensor)) continue;
                if (!sensor.IsActive) continue;

                Vector3D sWorld = sensor.GetPosition();

                for (int l = 0; l < _lights.Count; l++)
                {
                    IMyLightingBlock light = _lights[l];
                    if (light.CubeGrid != Me.CubeGrid) continue;
                    if (!light.IsFunctional) continue;

                    Vector3D lWorld = light.GetPosition();
                    double dist = Vector3D.Distance(sWorld, lWorld);
                    if (dist <= LIGHT_SENSOR_LIGHT_DISTANCE)
                        turnOn.Add(light.EntityId);
                }
            }

            for (int l = 0; l < _lights.Count; l++)
            {
                IMyLightingBlock light = _lights[l];
                if (light.CubeGrid != Me.CubeGrid) continue;
                if (!light.IsFunctional) continue;
                if (!IsLightControlledBySensor(light)) continue;

                light.Enabled = turnOn.Contains(light.EntityId);
            }
        }

        bool IsLightControlledBySensor(IMyLightingBlock light)
        {
            Vector3D lWorld = light.GetPosition();
            for (int s = 0; s < _sensors.Count; s++)
            {
                IMySensorBlock sensor = _sensors[s];
                if (sensor.CubeGrid != Me.CubeGrid) continue;
                if (!sensor.IsFunctional) continue;
                if (!IsLightSensor(sensor)) continue;

                Vector3D sWorld = sensor.GetPosition();
                double dist = Vector3D.Distance(sWorld, lWorld);
                if (dist <= LIGHT_SENSOR_LIGHT_DISTANCE)
                    return true;
            }
            return false;
        }

        int CountControlledLights()
        {
            int count = 0;
            for (int l = 0; l < _lights.Count; l++)
            {
                IMyLightingBlock light = _lights[l];
                if (light.CubeGrid != Me.CubeGrid) continue;
                if (!light.IsFunctional) continue;
                if (IsLightControlledBySensor(light))
                    count++;
            }
            return count;
        }
    }
}
