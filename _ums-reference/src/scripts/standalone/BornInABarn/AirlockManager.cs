// <mdk sortorder="100" />
using System;
using System.Collections.Generic;
using Sandbox.ModAPI.Ingame;
using SpaceEngineers.Game.ModAPI.Ingame;
using VRageMath;

namespace IngameScript
{
    partial class Program
    {
        #region mdk preserve
        enum AirlockState
        {
            Idle,
            PreCycling,
            EntryDoorOpen,
            PostCycling,
            ExitDoorOpen
        }
        #endregion

        class Airlock
        {
            public readonly List<IMyDoor> Doors = new List<IMyDoor>();
            public readonly List<IMyAirVent> Vents = new List<IMyAirVent>();
            public readonly List<IMySensorBlock> Sensors = new List<IMySensorBlock>();
            public AirlockState State = AirlockState.Idle;
            public IMyDoor EntryDoor = null;
            public IMyDoor ExitDoor = null;
            public double CycleTimer = 0;
            public double TotalCycleTime = 0;
            public bool EntryNeedsPressurized = false;
            public bool ExitNeedsPressurized = false;
            public float OutsidePressure = 0f;
            public float InsidePressure = 1f;
            public bool OutsidePressureKnown = false;
            public bool InsidePressureKnown = false;
            public bool HasInnerTag = false;
            public bool HasOuterTag = false;
            public readonly List<IMyDoor> InnerDoors = new List<IMyDoor>();
            public readonly List<IMyDoor> OuterDoors = new List<IMyDoor>();

            public Airlock() { }

            public float GetOxygenLevel()
            {
                for (int i = 0; i < Vents.Count; i++)
                {
                    IMyAirVent v = Vents[i];
                    if (v != null && v.IsFunctional)
                        return v.GetOxygenLevel();
                }
                return -1f;
            }

            public void SetDepressurize(bool depressurize)
            {
                for (int i = 0; i < Vents.Count; i++)
                {
                    IMyAirVent v = Vents[i];
                    if (v != null && v.IsFunctional)
                    {
                        v.Depressurize = depressurize;
                        v.Enabled = true;
                    }
                }
            }

            public void DisableVents()
            {
                for (int i = 0; i < Vents.Count; i++)
                {
                    IMyAirVent v = Vents[i];
                    if (v != null && v.IsFunctional)
                        v.Enabled = false;
                }
            }

            public void CloseAllDoors()
            {
                for (int i = 0; i < Doors.Count; i++)
                {
                    IMyDoor d = Doors[i];
                    if (d != null && d.IsFunctional)
                        d.CloseDoor();
                }
            }

            public void OpenDoor(IMyDoor door)
            {
                if (door != null && door.IsFunctional)
                    door.OpenDoor();
            }

            public bool AllDoorsClosed()
            {
                for (int i = 0; i < Doors.Count; i++)
                {
                    IMyDoor d = Doors[i];
                    if (d != null && d.IsFunctional)
                    {
                        if (d.OpenRatio > 0f)
                            return false;
                    }
                }
                return true;
            }

            public bool EntrySensorActive()
            {
                if (EntryDoor == null) return false;
                Vector3I entryPos = EntryDoor.Position;
                for (int i = 0; i < Sensors.Count; i++)
                {
                    IMySensorBlock s = Sensors[i];
                    if (s == null || !s.IsFunctional || !s.IsActive) continue;
                    Vector3I sPos = s.Position;
                    int dist = Math.Abs(sPos.X - entryPos.X)
                             + Math.Abs(sPos.Y - entryPos.Y)
                             + Math.Abs(sPos.Z - entryPos.Z);
                    if (dist <= 3)
                        return true;
                }
                return false;
            }

            public bool ExitSensorActive()
            {
                if (ExitDoor == null) return false;
                Vector3I exitPos = ExitDoor.Position;
                for (int i = 0; i < Sensors.Count; i++)
                {
                    IMySensorBlock s = Sensors[i];
                    if (s == null || !s.IsFunctional || !s.IsActive) continue;
                    Vector3I sPos = s.Position;
                    int dist = Math.Abs(sPos.X - exitPos.X)
                             + Math.Abs(sPos.Y - exitPos.Y)
                             + Math.Abs(sPos.Z - exitPos.Z);
                    if (dist <= 3)
                        return true;
                }
                return false;
            }

            public bool AnySensorActive()
            {
                for (int i = 0; i < Sensors.Count; i++)
                {
                    IMySensorBlock s = Sensors[i];
                    if (s != null && s.IsFunctional && s.IsActive)
                        return true;
                }
                return false;
            }

            public bool HasFunctionalSensors()
            {
                for (int i = 0; i < Sensors.Count; i++)
                {
                    IMySensorBlock s = Sensors[i];
                    if (s != null && s.IsFunctional)
                        return true;
                }
                return false;
            }

            public bool HasFunctionalVents()
            {
                for (int i = 0; i < Vents.Count; i++)
                {
                    IMyAirVent v = Vents[i];
                    if (v != null && v.IsFunctional)
                        return true;
                }
                return false;
            }

            public void SampleOutsidePressure(float sample)
            {
                if (OutsidePressureKnown)
                    OutsidePressure = 0.7f * OutsidePressure + 0.3f * sample;
                else
                    OutsidePressure = sample;
                OutsidePressureKnown = true;
            }

            public void SampleInsidePressure(float sample)
            {
                if (InsidePressureKnown)
                    InsidePressure = 0.7f * InsidePressure + 0.3f * sample;
                else
                    InsidePressure = sample;
                InsidePressureKnown = true;
            }

            public float GetDepressurizeTarget()
            {
                if (OutsidePressureKnown)
                {
                    float target = OutsidePressure + 0.05f;
                    return target;
                }
                return DEPRESSURIZED_THRESHOLD;
            }

            public float GetPressurizeTarget()
            {
                if (InsidePressureKnown)
                {
                    float target = InsidePressure - 0.05f;
                    if (target < PRESSURIZED_THRESHOLD)
                        target = PRESSURIZED_THRESHOLD;
                    return target;
                }
                return PRESSURIZED_THRESHOLD;
            }

            public void Reset()
            {
                State = AirlockState.Idle;
                EntryDoor = null;
                ExitDoor = null;
                CycleTimer = 0;
                TotalCycleTime = 0;
                EntryNeedsPressurized = false;
                ExitNeedsPressurized = false;
                DisableVents();
            }

            public void FullReset()
            {
                Reset();
                OutsidePressure = 0f;
                InsidePressure = 1f;
                OutsidePressureKnown = false;
                InsidePressureKnown = false;
            }
        }

        void DetectAirlocks()
        {
            _airlocks.Clear();
            _airlockDoorIds.Clear();

            for (int v = 0; v < _vents.Count; v++)
            {
                IMyAirVent vent = _vents[v];
                if (vent.CubeGrid != Me.CubeGrid) continue;
                if (vent.CustomName.Contains(PRESSURE_VENT_TAG)) continue;

                Vector3I ventPos = vent.Position;
                List<IMyDoor> nearDoors = new List<IMyDoor>();

                for (int d = 0; d < _doors.Count; d++)
                {
                    IMyDoor door = _doors[d];
                    if (door.CubeGrid != Me.CubeGrid) continue;
                    if (!door.IsFunctional) continue;
                    Vector3I doorPos = door.Position;
                    double dist = Math.Abs(ventPos.X - doorPos.X)
                                + Math.Abs(ventPos.Y - doorPos.Y)
                                + Math.Abs(ventPos.Z - doorPos.Z);
                    if (dist <= MAX_SENSOR_DOOR_DISTANCE)
                        nearDoors.Add(door);
                }

                if (nearDoors.Count < 2) continue;

                Airlock existing = null;
                for (int a = 0; a < _airlocks.Count; a++)
                {
                    Airlock al = _airlocks[a];
                    int matchCount = 0;
                    for (int nd = 0; nd < nearDoors.Count; nd++)
                    {
                        for (int ad = 0; ad < al.Doors.Count; ad++)
                        {
                            if (nearDoors[nd].EntityId == al.Doors[ad].EntityId)
                            {
                                matchCount++;
                                break;
                            }
                        }
                    }
                    if (matchCount >= 2)
                    {
                        existing = al;
                        break;
                    }
                }

                if (existing != null)
                {
                    bool alreadyHasVent = false;
                    for (int ev = 0; ev < existing.Vents.Count; ev++)
                    {
                        if (existing.Vents[ev].EntityId == vent.EntityId)
                        {
                            alreadyHasVent = true;
                            break;
                        }
                    }
                    if (!alreadyHasVent)
                        existing.Vents.Add(vent);
                    continue;
                }

                Airlock newAirlock = new Airlock();
                newAirlock.Vents.Add(vent);

                for (int nd = 0; nd < nearDoors.Count; nd++)
                {
                    IMyDoor door = nearDoors[nd];
                    newAirlock.Doors.Add(door);

                    if (door.CustomName.Contains(INNER_DOOR_TAG))
                    {
                        newAirlock.InnerDoors.Add(door);
                        newAirlock.HasInnerTag = true;
                    }
                    if (door.CustomName.Contains(OUTER_DOOR_TAG))
                    {
                        newAirlock.OuterDoors.Add(door);
                        newAirlock.HasOuterTag = true;
                    }
                }

                for (int s = 0; s < _sensors.Count; s++)
                {
                    IMySensorBlock sensor = _sensors[s];
                    if (sensor.CubeGrid != Me.CubeGrid) continue;
                    if (!sensor.IsFunctional) continue;
                    Vector3I sPos = sensor.Position;

                    for (int nd = 0; nd < nearDoors.Count; nd++)
                    {
                        Vector3I dPos = nearDoors[nd].Position;
                        double sDist = Math.Abs(sPos.X - dPos.X)
                                     + Math.Abs(sPos.Y - dPos.Y)
                                     + Math.Abs(sPos.Z - dPos.Z);
                        if (sDist <= MAX_SENSOR_DOOR_DISTANCE)
                        {
                            bool alreadyAdded = false;
                            for (int es = 0; es < newAirlock.Sensors.Count; es++)
                            {
                                if (newAirlock.Sensors[es].EntityId == sensor.EntityId)
                                {
                                    alreadyAdded = true;
                                    break;
                                }
                            }
                            if (!alreadyAdded)
                                newAirlock.Sensors.Add(sensor);
                            break;
                        }
                    }
                }

                newAirlock.DisableVents();
                ApplyPersistedStateToAirlock(newAirlock);
                _airlocks.Add(newAirlock);
            }

            for (int a = 0; a < _airlocks.Count; a++)
            {
                Airlock al = _airlocks[a];
                for (int d = 0; d < al.Doors.Count; d++)
                    _airlockDoorIds.Add(al.Doors[d].EntityId);
            }
        }

        bool IsAirlockDoor(IMyDoor door)
        {
            return _airlockDoorIds.Contains(door.EntityId);
        }

        Airlock FindAirlockForDoor(IMyDoor door)
        {
            long doorId = door.EntityId;
            for (int a = 0; a < _airlocks.Count; a++)
            {
                Airlock al = _airlocks[a];
                for (int d = 0; d < al.Doors.Count; d++)
                {
                    if (al.Doors[d].EntityId == doorId)
                        return al;
                }
            }
            return null;
        }

        void ProcessAirlocks(double dt)
        {
            for (int i = 0; i < _airlocks.Count; i++)
                ProcessAirlock(_airlocks[i], dt);
        }

        void ProcessAirlock(Airlock airlock, double dt)
        {
            if (airlock.State != AirlockState.Idle)
            {
                airlock.TotalCycleTime += dt;
                if (airlock.TotalCycleTime >= AIRLOCK_EMERGENCY_TIMEOUT)
                {
                    airlock.CloseAllDoors();
                    airlock.Reset();
                    _emergencyCount++;
                    return;
                }
            }

            if (airlock.HasInnerTag && airlock.HasOuterTag)
            {
                bool anyInnerOpen = false;
                for (int i = 0; i < airlock.InnerDoors.Count; i++)
                {
                    IMyDoor d = airlock.InnerDoors[i];
                    if (d != null && d.IsFunctional && d.OpenRatio > 0f)
                    {
                        anyInnerOpen = true;
                        break;
                    }
                }
                bool anyOuterOpen = false;
                for (int i = 0; i < airlock.OuterDoors.Count; i++)
                {
                    IMyDoor d = airlock.OuterDoors[i];
                    if (d != null && d.IsFunctional && d.OpenRatio > 0f)
                    {
                        anyOuterOpen = true;
                        break;
                    }
                }
                if (anyInnerOpen && anyOuterOpen)
                {
                    airlock.CloseAllDoors();
                    airlock.Reset();
                    _emergencyCount++;
                    return;
                }
            }
            else
            {
                if (airlock.State == AirlockState.Idle
                    && airlock.EntryDoor != null && airlock.ExitDoor != null)
                {
                    if (airlock.EntryDoor.IsFunctional && airlock.EntryDoor.OpenRatio > 0f
                        && airlock.ExitDoor.IsFunctional && airlock.ExitDoor.OpenRatio > 0f)
                    {
                        airlock.CloseAllDoors();
                        airlock.Reset();
                        _emergencyCount++;
                        return;
                    }
                }
            }

            float oxygenLevel = airlock.GetOxygenLevel();
            if (oxygenLevel < 0f)
            {
                if (airlock.State != AirlockState.Idle)
                {
                    airlock.CloseAllDoors();
                    airlock.Reset();
                }
                return;
            }

            switch (airlock.State)
            {
                case AirlockState.Idle:
                    ProcessAirlockIdle(airlock, oxygenLevel);
                    break;
                case AirlockState.PreCycling:
                    ProcessAirlockPreCycling(airlock, oxygenLevel, dt);
                    break;
                case AirlockState.EntryDoorOpen:
                    ProcessAirlockEntryDoorOpen(airlock, oxygenLevel, dt);
                    break;
                case AirlockState.PostCycling:
                    ProcessAirlockPostCycling(airlock, oxygenLevel, dt);
                    break;
                case AirlockState.ExitDoorOpen:
                    ProcessAirlockExitDoorOpen(airlock, oxygenLevel, dt);
                    break;
            }
        }

        void ProcessAirlockIdle(Airlock airlock, float oxygenLevel)
        {
            if (!airlock.HasFunctionalSensors()) return;
            if (!airlock.AnySensorActive()) return;

            IMyDoor triggeredDoor = null;
            double bestDist = double.MaxValue;

            for (int s = 0; s < airlock.Sensors.Count; s++)
            {
                IMySensorBlock sensor = airlock.Sensors[s];
                if (sensor == null || !sensor.IsFunctional || !sensor.IsActive) continue;
                Vector3I sPos = sensor.Position;

                for (int d = 0; d < airlock.Doors.Count; d++)
                {
                    IMyDoor door = airlock.Doors[d];
                    if (door == null || !door.IsFunctional) continue;
                    Vector3I dPos = door.Position;
                    double dist = Math.Abs(sPos.X - dPos.X)
                                + Math.Abs(sPos.Y - dPos.Y)
                                + Math.Abs(sPos.Z - dPos.Z);
                    if (dist < bestDist)
                    {
                        bestDist = dist;
                        triggeredDoor = door;
                    }
                }
            }

            if (triggeredDoor == null) return;

            airlock.EntryDoor = triggeredDoor;

            if (airlock.HasInnerTag && airlock.HasOuterTag)
            {
                bool entryIsOuter = false;
                for (int i = 0; i < airlock.OuterDoors.Count; i++)
                {
                    if (airlock.OuterDoors[i].EntityId == triggeredDoor.EntityId)
                    {
                        entryIsOuter = true;
                        break;
                    }
                }

                bool entryIsInner = false;
                for (int i = 0; i < airlock.InnerDoors.Count; i++)
                {
                    if (airlock.InnerDoors[i].EntityId == triggeredDoor.EntityId)
                    {
                        entryIsInner = true;
                        break;
                    }
                }

                if (entryIsOuter)
                {
                    airlock.EntryNeedsPressurized = false;
                    airlock.ExitNeedsPressurized = true;
                    if (airlock.InnerDoors.Count > 0)
                        airlock.ExitDoor = airlock.InnerDoors[0];
                }
                else if (entryIsInner)
                {
                    airlock.EntryNeedsPressurized = true;
                    airlock.ExitNeedsPressurized = false;
                    if (airlock.OuterDoors.Count > 0)
                        airlock.ExitDoor = airlock.OuterDoors[0];
                }
                else
                {
                    airlock.ExitDoor = FindFurthestDoor(airlock, triggeredDoor);
                    DetermineDirectionByPressure(airlock, oxygenLevel);
                }
            }
            else
            {
                airlock.ExitDoor = FindFurthestDoor(airlock, triggeredDoor);
                DetermineDirectionByPressure(airlock, oxygenLevel);
            }

            if (airlock.ExitDoor == null)
            {
                airlock.ExitDoor = FindFurthestDoor(airlock, triggeredDoor);
            }

            if (airlock.ExitDoor == null) return;

            airlock.CloseAllDoors();
            airlock.TotalCycleTime = 0;
            airlock.State = AirlockState.PreCycling;
            airlock.CycleTimer = AIRLOCK_CYCLE_TIMEOUT;
        }

        IMyDoor FindFurthestDoor(Airlock airlock, IMyDoor fromDoor)
        {
            IMyDoor furthest = null;
            double maxDist = -1;
            Vector3I fromPos = fromDoor.Position;

            for (int d = 0; d < airlock.Doors.Count; d++)
            {
                IMyDoor door = airlock.Doors[d];
                if (door == null || !door.IsFunctional) continue;
                if (door.EntityId == fromDoor.EntityId) continue;
                Vector3I dPos = door.Position;
                double dist = Math.Abs(fromPos.X - dPos.X)
                            + Math.Abs(fromPos.Y - dPos.Y)
                            + Math.Abs(fromPos.Z - dPos.Z);
                if (dist > maxDist)
                {
                    maxDist = dist;
                    furthest = door;
                }
            }
            return furthest;
        }

        void DetermineDirectionByPressure(Airlock airlock, float oxygenLevel)
        {
            if (airlock.OutsidePressureKnown && airlock.InsidePressureKnown)
            {
                float midpoint = (airlock.OutsidePressure + airlock.InsidePressure) / 2f;

                if (oxygenLevel >= midpoint + 0.1f)
                {
                    airlock.EntryNeedsPressurized = true;
                    airlock.ExitNeedsPressurized = false;
                }
                else if (oxygenLevel <= midpoint - 0.1f)
                {
                    airlock.EntryNeedsPressurized = false;
                    airlock.ExitNeedsPressurized = true;
                }
                else
                {
                    if (oxygenLevel >= midpoint)
                    {
                        airlock.EntryNeedsPressurized = true;
                        airlock.ExitNeedsPressurized = false;
                    }
                    else
                    {
                        airlock.EntryNeedsPressurized = false;
                        airlock.ExitNeedsPressurized = true;
                    }
                }
            }
            else
            {
                if (oxygenLevel >= PRESSURIZED_THRESHOLD)
                {
                    airlock.EntryNeedsPressurized = true;
                    airlock.ExitNeedsPressurized = false;
                }
                else
                {
                    airlock.EntryNeedsPressurized = false;
                    airlock.ExitNeedsPressurized = true;
                }
            }
        }

        void ProcessAirlockPreCycling(Airlock airlock, float oxygenLevel, double dt)
        {
            airlock.CloseAllDoors();

            if (!airlock.AllDoorsClosed()) return;

            airlock.CycleTimer -= dt;

            if (airlock.EntryNeedsPressurized)
                airlock.SetDepressurize(false);
            else
                airlock.SetDepressurize(true);

            if (airlock.EntryNeedsPressurized)
            {
                float target = airlock.GetPressurizeTarget();
                if (oxygenLevel >= target)
                {
                    airlock.OpenDoor(airlock.EntryDoor);
                    airlock.State = AirlockState.EntryDoorOpen;
                    airlock.CycleTimer = AIRLOCK_DOOR_OPEN_TIME;
                }
            }
            else
            {
                float target = airlock.GetDepressurizeTarget();
                if (oxygenLevel <= target)
                {
                    airlock.OpenDoor(airlock.EntryDoor);
                    airlock.State = AirlockState.EntryDoorOpen;
                    airlock.CycleTimer = AIRLOCK_DOOR_OPEN_TIME;
                }
            }
        }

        void ProcessAirlockEntryDoorOpen(Airlock airlock, float oxygenLevel, double dt)
        {
            airlock.DisableVents();
            airlock.CycleTimer -= dt;

            if (airlock.EntryNeedsPressurized)
                airlock.SampleInsidePressure(oxygenLevel);
            else
                airlock.SampleOutsidePressure(oxygenLevel);

            bool timerExpired = airlock.CycleTimer <= 0;
            bool playerLeft = false;

            if (airlock.EntryDoor != null && airlock.EntryDoor.IsFunctional)
            {
                if (airlock.EntryDoor.OpenRatio < 1.0f && airlock.EntryDoor.Status == DoorStatus.Closing)
                {
                    if (!airlock.EntrySensorActive())
                        playerLeft = true;
                }
            }

            if (timerExpired || playerLeft)
            {
                airlock.CloseAllDoors();
                airlock.State = AirlockState.PostCycling;
                airlock.CycleTimer = AIRLOCK_CYCLE_TIMEOUT;
            }
        }

        void ProcessAirlockPostCycling(Airlock airlock, float oxygenLevel, double dt)
        {
            airlock.CloseAllDoors();

            if (!airlock.AllDoorsClosed()) return;

            airlock.CycleTimer -= dt;

            if (airlock.ExitNeedsPressurized)
                airlock.SetDepressurize(false);
            else
                airlock.SetDepressurize(true);

            if (airlock.ExitNeedsPressurized)
            {
                float target = airlock.GetPressurizeTarget();
                if (oxygenLevel >= target)
                {
                    airlock.OpenDoor(airlock.ExitDoor);
                    airlock.State = AirlockState.ExitDoorOpen;
                    airlock.CycleTimer = AIRLOCK_DOOR_OPEN_TIME;
                }
            }
            else
            {
                float target = airlock.GetDepressurizeTarget();
                if (oxygenLevel <= target)
                {
                    airlock.OpenDoor(airlock.ExitDoor);
                    airlock.State = AirlockState.ExitDoorOpen;
                    airlock.CycleTimer = AIRLOCK_DOOR_OPEN_TIME;
                }
            }
        }

        void ProcessAirlockExitDoorOpen(Airlock airlock, float oxygenLevel, double dt)
        {
            airlock.DisableVents();
            airlock.CycleTimer -= dt;

            if (airlock.ExitNeedsPressurized)
                airlock.SampleInsidePressure(oxygenLevel);
            else
                airlock.SampleOutsidePressure(oxygenLevel);

            bool playerLeft = !airlock.ExitSensorActive();
            bool timerExpired = airlock.CycleTimer <= 0;

            if (playerLeft || timerExpired)
            {
                airlock.CloseAllDoors();
                airlock.Reset();
            }
        }
    }
}
