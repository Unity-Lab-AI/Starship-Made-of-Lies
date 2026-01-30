// <mdk sortorder="150" />
using System.Collections.Generic;
using Sandbox.ModAPI.Ingame;
using SpaceEngineers.Game.ModAPI.Ingame;

namespace IngameScript
{
    partial class Program
    {
        void UpdateOutsidePressureFromReferenceVents()
        {
            float lowest = float.MaxValue;
            bool found = false;

            for (int i = 0; i < _vents.Count; i++)
            {
                IMyAirVent vent = _vents[i];
                if (vent.CubeGrid != Me.CubeGrid) continue;
                if (!vent.IsFunctional) continue;
                if (!vent.CustomName.Contains(PRESSURE_VENT_TAG)) continue;

                float level = vent.GetOxygenLevel();
                if (level < lowest)
                {
                    lowest = level;
                    found = true;
                }
            }

            if (!found) return;

            for (int i = 0; i < _airlocks.Count; i++)
                _airlocks[i].SampleOutsidePressure(lowest);
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
                if (vent.CustomName.Contains(PRESSURE_VENT_TAG)) continue;
                if (IsVentInAirlock(vent)) continue;

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
