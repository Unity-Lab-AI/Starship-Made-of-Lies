// <mdk sortorder="300" />
using System.Collections.Generic;
using Sandbox.ModAPI.Ingame;
using VRageMath;

namespace IngameScript
{
    partial class Program
    {
        void ProcessSensorTriggeredDoors()
        {
            for (int i = 0; i < _doors.Count; i++)
            {
                IMyDoor door = _doors[i];
                if (door.CubeGrid != Me.CubeGrid) continue;
                if (!door.IsFunctional) continue;
                if (IsAirlockDoor(door)) continue;

                if (IsSensorActiveNearDoor(door))
                {
                    if (door.OpenRatio < 1f)
                        door.OpenDoor();
                    _doorTimers[door.EntityId] = CLOSE_AFTER_SECONDS;
                }
            }
        }

        bool IsSensorActiveNearDoor(IMyDoor door)
        {
            Vector3I dPos = door.Position;
            for (int i = 0; i < _sensors.Count; i++)
            {
                IMySensorBlock sensor = _sensors[i];
                if (sensor.CubeGrid != Me.CubeGrid) continue;
                if (!sensor.IsFunctional) continue;
                if (IsSensorInAirlock(sensor)) continue;
                if (IsLightSensor(sensor)) continue;

                Vector3I sPos = sensor.Position;
                int dist = System.Math.Abs(sPos.X - dPos.X)
                         + System.Math.Abs(sPos.Y - dPos.Y)
                         + System.Math.Abs(sPos.Z - dPos.Z);
                if (dist <= MAX_SENSOR_DOOR_DISTANCE && sensor.IsActive)
                    return true;
            }
            return false;
        }

        void DetectAndTrackOpeningDoors()
        {
            for (int i = 0; i < _doors.Count; i++)
            {
                IMyDoor door = _doors[i];
                if (door.CubeGrid != Me.CubeGrid) continue;
                if (IsAirlockDoor(door)) continue;

                long id = door.EntityId;
                float now = door.OpenRatio;
                float last;
                bool hadLast = _lastRatio.TryGetValue(id, out last);
                bool opening = hadLast && (now - last > OPENING_EPSILON);

                _lastRatio[id] = now;

                if (opening && !_doorTimers.ContainsKey(id))
                    _doorTimers[id] = CLOSE_AFTER_SECONDS;
            }
        }

        void ProcessAllDoorTimers(double dt)
        {
            List<long> toRemove = new List<long>();

            foreach (long id in _doorTimers.Keys)
            {
                IMyDoor door = FindDoorById(id);
                if (door == null || !door.IsFunctional)
                {
                    toRemove.Add(id);
                    continue;
                }

                if (door.OpenRatio <= 0f)
                {
                    toRemove.Add(id);
                    continue;
                }

                if (IsSensorActiveNearDoor(door))
                {
                    _doorTimers[id] = CLOSE_AFTER_SECONDS;
                }
                else
                {
                    double remaining = _doorTimers[id] - dt;
                    if (remaining <= 0)
                    {
                        door.CloseDoor();
                        toRemove.Add(id);
                    }
                    else
                    {
                        _doorTimers[id] = remaining;
                    }
                }
            }

            for (int i = 0; i < toRemove.Count; i++)
                _doorTimers.Remove(toRemove[i]);
        }

        IMyDoor FindDoorById(long entityId)
        {
            for (int i = 0; i < _doors.Count; i++)
            {
                if (_doors[i].EntityId == entityId)
                    return _doors[i];
            }
            return null;
        }

        void CleanupDeadDoors()
        {
            HashSet<long> liveIds = new HashSet<long>();
            for (int i = 0; i < _doors.Count; i++)
            {
                IMyDoor door = _doors[i];
                if (door.CubeGrid == Me.CubeGrid)
                    liveIds.Add(door.EntityId);
            }

            List<long> deadRatio = new List<long>();
            foreach (long id in _lastRatio.Keys)
            {
                if (!liveIds.Contains(id))
                    deadRatio.Add(id);
            }
            for (int i = 0; i < deadRatio.Count; i++)
                _lastRatio.Remove(deadRatio[i]);

            List<long> deadTimers = new List<long>();
            foreach (long id in _doorTimers.Keys)
            {
                if (!liveIds.Contains(id))
                    deadTimers.Add(id);
            }
            for (int i = 0; i < deadTimers.Count; i++)
                _doorTimers.Remove(deadTimers[i]);
        }

        int GetOpenDoorCount()
        {
            return _doorTimers.Count;
        }

        IMyDoor GetNextDoorToClose(out double timer)
        {
            timer = double.MaxValue;
            IMyDoor next = null;
            foreach (var kv in _doorTimers)
            {
                if (kv.Value < timer)
                {
                    IMyDoor door = FindDoorById(kv.Key);
                    if (door != null)
                    {
                        timer = kv.Value;
                        next = door;
                    }
                }
            }
            return next;
        }
    }
}
