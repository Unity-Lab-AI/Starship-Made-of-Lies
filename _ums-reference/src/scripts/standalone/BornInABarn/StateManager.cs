// <mdk sortorder="75" />
using System.Collections.Generic;

namespace IngameScript
{
    partial class Program
    {
        double _stateSaveTimer = 0;

        const string STATE_KEY_OUTSIDE_PRESSURE = "OutsidePressure";
        const string STATE_KEY_INSIDE_PRESSURE = "InsidePressure";
        const string STATE_KEY_OUTSIDE_KNOWN = "OutsidePressureKnown";
        const string STATE_KEY_INSIDE_KNOWN = "InsidePressureKnown";
        const string STATE_KEY_MASTER_LOCK = "MasterLock";
        const string STATE_KEY_GRID_IS_STATIC = "GridIsStatic";
        const string STATE_KEY_REF_VENT_TRUSTED = "RefVentTrusted";
        const string STATE_KEY_REF_VENT_TRUSTED_VALUE = "RefVentTrustedValue";

        float _persistedOutsidePressure = 0f;
        float _persistedInsidePressure = 1f;
        bool _persistedOutsideKnown = false;
        bool _persistedInsideKnown = false;

        void LoadPersistedState()
        {
            string data = Me.CustomData;
            if (string.IsNullOrEmpty(data)) return;

            Dictionary<string, string> pairs = ParseCustomData(data);

            string val;
            if (pairs.TryGetValue(STATE_KEY_OUTSIDE_PRESSURE, out val))
            {
                float f;
                if (float.TryParse(val, out f))
                    _persistedOutsidePressure = f;
            }
            if (pairs.TryGetValue(STATE_KEY_INSIDE_PRESSURE, out val))
            {
                float f;
                if (float.TryParse(val, out f))
                    _persistedInsidePressure = f;
            }
            if (pairs.TryGetValue(STATE_KEY_OUTSIDE_KNOWN, out val))
                _persistedOutsideKnown = val == "1";
            if (pairs.TryGetValue(STATE_KEY_INSIDE_KNOWN, out val))
                _persistedInsideKnown = val == "1";
            if (pairs.TryGetValue(STATE_KEY_MASTER_LOCK, out val))
                _masterLock = val == "1";
            if (pairs.TryGetValue(STATE_KEY_GRID_IS_STATIC, out val))
                _gridIsStatic = val == "1";
            if (pairs.TryGetValue(STATE_KEY_REF_VENT_TRUSTED, out val))
                _refVentTrusted = val == "1";
            if (pairs.TryGetValue(STATE_KEY_REF_VENT_TRUSTED_VALUE, out val))
            {
                float f;
                if (float.TryParse(val, out f))
                    _refVentTrustedValue = f;
            }
        }

        void ApplyPersistedStateToAirlock(Airlock airlock)
        {
            if (_persistedOutsideKnown)
            {
                airlock.OutsidePressure = _persistedOutsidePressure;
                airlock.OutsidePressureKnown = true;
            }
            if (_persistedInsideKnown)
            {
                airlock.InsidePressure = _persistedInsidePressure;
                airlock.InsidePressureKnown = true;
            }
        }

        void SavePersistedState()
        {
            float bestOutside = _persistedOutsidePressure;
            float bestInside = _persistedInsidePressure;
            bool outsideKnown = _persistedOutsideKnown;
            bool insideKnown = _persistedInsideKnown;

            for (int i = 0; i < _airlocks.Count; i++)
            {
                Airlock a = _airlocks[i];
                if (a.OutsidePressureKnown)
                {
                    bestOutside = a.OutsidePressure;
                    outsideKnown = true;
                }
                if (a.InsidePressureKnown)
                {
                    bestInside = a.InsidePressure;
                    insideKnown = true;
                }
            }

            _persistedOutsidePressure = bestOutside;
            _persistedInsidePressure = bestInside;
            _persistedOutsideKnown = outsideKnown;
            _persistedInsideKnown = insideKnown;

            string output = STATE_KEY_OUTSIDE_PRESSURE + "=" + _persistedOutsidePressure.ToString() + "\n"
                + STATE_KEY_INSIDE_PRESSURE + "=" + _persistedInsidePressure.ToString() + "\n"
                + STATE_KEY_OUTSIDE_KNOWN + "=" + (_persistedOutsideKnown ? "1" : "0") + "\n"
                + STATE_KEY_INSIDE_KNOWN + "=" + (_persistedInsideKnown ? "1" : "0") + "\n"
                + STATE_KEY_MASTER_LOCK + "=" + (_masterLock ? "1" : "0") + "\n"
                + STATE_KEY_GRID_IS_STATIC + "=" + (_gridIsStatic ? "1" : "0") + "\n"
                + STATE_KEY_REF_VENT_TRUSTED + "=" + (_refVentTrusted ? "1" : "0") + "\n"
                + STATE_KEY_REF_VENT_TRUSTED_VALUE + "=" + _refVentTrustedValue.ToString();

            Me.CustomData = output;
        }

        void ProcessStateSave(double dt)
        {
            _stateSaveTimer += dt;
            if (_stateSaveTimer >= STATE_SAVE_INTERVAL)
            {
                SavePersistedState();
                _stateSaveTimer = 0;
            }
        }

        Dictionary<string, string> ParseCustomData(string data)
        {
            Dictionary<string, string> result = new Dictionary<string, string>();
            string[] lines = data.Split('\n');
            for (int i = 0; i < lines.Length; i++)
            {
                string line = lines[i].Trim();
                if (line.Length == 0) continue;
                int eq = line.IndexOf('=');
                if (eq <= 0) continue;
                string key = line.Substring(0, eq).Trim();
                string value = line.Substring(eq + 1).Trim();
                result[key] = value;
            }
            return result;
        }
    }
}
