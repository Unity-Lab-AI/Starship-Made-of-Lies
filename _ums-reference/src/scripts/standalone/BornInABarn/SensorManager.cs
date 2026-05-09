// <mdk sortorder="200" />
using System.Collections.Generic;
using Sandbox.ModAPI.Ingame;
using VRageMath;

namespace IngameScript
{
    partial class Program
    {
        void ConfigureDoorSensors()
        {
            for (int i = 0; i < _sensors.Count; i++)
            {
                IMySensorBlock sensor = _sensors[i];
                if (sensor.CubeGrid != Me.CubeGrid) continue;
                if (!IsSensorNearDoor(sensor)) continue;

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
        }

        bool IsSensorNearDoor(IMySensorBlock sensor)
        {
            Vector3I sPos = sensor.Position;
            for (int i = 0; i < _doors.Count; i++)
            {
                IMyDoor door = _doors[i];
                if (door.CubeGrid != Me.CubeGrid) continue;
                Vector3I dPos = door.Position;
                int dist = System.Math.Abs(sPos.X - dPos.X)
                         + System.Math.Abs(sPos.Y - dPos.Y)
                         + System.Math.Abs(sPos.Z - dPos.Z);
                if (dist <= MAX_SENSOR_DOOR_DISTANCE)
                    return true;
            }
            return false;
        }

        IMyDoor FindNonAirlockDoorTriggeredByAnySensor()
        {
            for (int i = 0; i < _sensors.Count; i++)
            {
                IMySensorBlock sensor = _sensors[i];
                if (sensor.CubeGrid != Me.CubeGrid) continue;
                if (!sensor.IsFunctional) continue;
                if (!sensor.IsActive) continue;

                IMyDoor door = FindClosestNonAirlockDoor(sensor);
                if (door != null)
                    return door;
            }
            return null;
        }

        IMyDoor FindClosestNonAirlockDoor(IMySensorBlock sensor)
        {
            Vector3I sPos = sensor.Position;
            IMyDoor closest = null;
            int bestDist = int.MaxValue;

            for (int i = 0; i < _doors.Count; i++)
            {
                IMyDoor door = _doors[i];
                if (door.CubeGrid != Me.CubeGrid) continue;
                if (!door.IsFunctional) continue;
                if (IsAirlockDoor(door)) continue;

                Vector3I dPos = door.Position;
                int dist = System.Math.Abs(sPos.X - dPos.X)
                         + System.Math.Abs(sPos.Y - dPos.Y)
                         + System.Math.Abs(sPos.Z - dPos.Z);
                if (dist <= MAX_SENSOR_DOOR_DISTANCE && dist < bestDist)
                {
                    bestDist = dist;
                    closest = door;
                }
            }
            return closest;
        }
    }
}
