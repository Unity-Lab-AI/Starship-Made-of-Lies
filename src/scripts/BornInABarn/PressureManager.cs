// <mdk sortorder="150" />
using System;
using System.Collections.Generic;
using Sandbox.ModAPI.Ingame;
using SpaceEngineers.Game.ModAPI.Ingame;

namespace IngameScript
{
    partial class Program
    {
        void CheckGridType(double dt)
        {
            _gridCheckTimer += dt;
            if (_gridCheckTimer < GRID_CHECK_INTERVAL) return;
            _gridCheckTimer = 0;

            _gridIsStatic = Me.CubeGrid.IsStatic;

            var thrusters = new List<IMyThrust>();
            GridTerminalSystem.GetBlocksOfType(thrusters, t => t.CubeGrid == Me.CubeGrid);
            _gridHasThrusters = thrusters.Count > 0;
        }

        bool IsGridMobile()
        {
            return !_gridIsStatic && _gridHasThrusters;
        }

        void UpdateOutsidePressureFromReferenceVents()
        {
            IMyAirVent bestVent = null;
            float lowestReading = float.MaxValue;

            for (int i = 0; i < _vents.Count; i++)
            {
                IMyAirVent vent = _vents[i];
                if (vent.CubeGrid != Me.CubeGrid) continue;
                if (!vent.CustomName.Contains(PRESSURE_VENT_TAG)) continue;
                if (!vent.IsFunctional) continue;
                if (!vent.Enabled) continue;
                if (!vent.Depressurize) continue;

                float level = vent.GetOxygenLevel();
                if (level < lowestReading)
                {
                    lowestReading = level;
                    bestVent = vent;
                }
            }

            if (bestVent == null) return;

            bool enabledChanged = bestVent.Enabled != _refVentWasEnabled;
            bool depressChanged = bestVent.Depressurize != _refVentWasDepressurize;
            _refVentWasEnabled = bestVent.Enabled;
            _refVentWasDepressurize = bestVent.Depressurize;

            if (enabledChanged || depressChanged)
            {
                _refVentStableCount = 0;
                _refVentTrusted = false;
                _refVentLastReading = lowestReading;
                return;
            }

            if (_refVentLastReading < 0f)
            {
                _refVentLastReading = lowestReading;
                _refVentStableCount = 0;
                return;
            }

            float diffFromLast = Math.Abs(lowestReading - _refVentLastReading);

            if (diffFromLast <= REF_VENT_STABLE_EPSILON)
            {
                _refVentStableCount++;
            }
            else
            {
                _refVentStableCount = 0;
            }

            if (_refVentTrusted)
            {
                float diffFromTrusted = Math.Abs(lowestReading - _refVentTrustedValue);
                if (diffFromTrusted > REF_VENT_DRASTIC_CHANGE)
                {
                    if (!IsGridMobile())
                    {
                        _refVentTrusted = false;
                        _refVentStableCount = 0;
                    }
                    else
                    {
                        _refVentTrusted = false;
                        _refVentStableCount = 0;
                    }
                }
            }

            if (!_refVentTrusted && _refVentStableCount >= REF_VENT_STABLE_TICKS)
            {
                _refVentTrusted = true;
                _refVentTrustedValue = lowestReading;
            }

            _refVentLastReading = lowestReading;

            if (_refVentTrusted)
            {
                for (int i = 0; i < _airlocks.Count; i++)
                    _airlocks[i].SampleOutsidePressure(_refVentTrustedValue);
            }
        }

        void UpdateInsidePressureFromBaseVents()
        {
            float highest = -1f;
            bool found = false;

            for (int i = 0; i < _vents.Count; i++)
            {
                IMyAirVent vent = _vents[i];
                if (vent.CubeGrid != Me.CubeGrid) continue;
                if (!vent.IsFunctional) continue;
                if (!vent.Enabled) continue;
                if (vent.CustomName.Contains(PRESSURE_VENT_TAG)) continue;
                if (IsVentInAirlock(vent)) continue;
                if (!vent.CanPressurize) continue;

                float level = vent.GetOxygenLevel();
                if (level > highest)
                {
                    highest = level;
                    found = true;
                }
            }

            if (!found) return;

            for (int i = 0; i < _airlocks.Count; i++)
                _airlocks[i].SampleInsidePressure(highest);
        }

        bool IsVentInAirlock(IMyAirVent vent)
        {
            for (int i = 0; i < _airlocks.Count; i++)
            {
                if (_airlocks[i].Vents.Contains(vent))
                    return true;
            }
            return false;
        }
    }
}
