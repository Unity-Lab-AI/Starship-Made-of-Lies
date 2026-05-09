// <mdk sortorder="400" />
using System;
using System.Collections.Generic;
using System.Text;
using Sandbox.ModAPI.Ingame;
using SpaceEngineers.Game.ModAPI.Ingame;
using VRage.Game.GUI.TextPanel;
using VRageMath;

namespace IngameScript
{
    partial class Program
    {
        const float LCD_SMALL_WIDTH = 256f;
        const float LCD_MEDIUM_WIDTH = 512f;
        const float LCD_LARGE_WIDTH = 1024f;

        readonly List<IMyTextPanel> _lcds = new List<IMyTextPanel>();
        readonly Dictionary<long, int> _lcdCurrentPage = new Dictionary<long, int>();
        readonly Dictionary<long, double> _lcdPageTimer = new Dictionary<long, double>();
        readonly StringBuilder _lcdBuilder = new StringBuilder();

        void UpdateLcdDisplays(double dt)
        {
            _lcds.Clear();
            GridTerminalSystem.GetBlocksOfType(_lcds);

            for (int i = 0; i < _lcds.Count; i++)
            {
                IMyTextPanel lcd = _lcds[i];
                if (lcd.CubeGrid != Me.CubeGrid) continue;
                if (!lcd.IsFunctional) continue;

                string name = lcd.CustomName;
                if (name.Contains(LCD_TAG_BIAB))
                    UpdateBiabDisplay(lcd, dt);
                else if (name.Contains(LCD_TAG_AIRLOCK))
                    UpdateAirlockDisplay(lcd, dt);
            }
        }

        void UpdateBiabDisplay(IMyTextPanel lcd, double dt)
        {
            lcd.ContentType = ContentType.TEXT_AND_IMAGE;
            lcd.Font = "Monospace";
            lcd.FontSize = 0.8f;
            lcd.FontColor = Color.Cyan;

            int category = GetScreenCategory(lcd.SurfaceSize);
            long id = lcd.EntityId;

            _lcdBuilder.Clear();

            if (category == 0)
            {
                int page;
                if (!_lcdCurrentPage.TryGetValue(id, out page))
                {
                    page = 0;
                    _lcdCurrentPage[id] = page;
                }
                double timer;
                if (!_lcdPageTimer.TryGetValue(id, out timer))
                {
                    timer = 0;
                    _lcdPageTimer[id] = timer;
                }

                timer += dt;
                if (timer >= LCD_PAGE_CYCLE_TIME)
                {
                    timer = 0;
                    page = (page + 1) % GetBiabTotalPages();
                    _lcdCurrentPage[id] = page;
                }
                _lcdPageTimer[id] = timer;

                BuildBiabPage(_lcdBuilder, page);
            }
            else if (category == 1)
            {
                BuildBiabMedium(_lcdBuilder);
            }
            else
            {
                BuildBiabFull(_lcdBuilder);
            }

            lcd.WriteText(_lcdBuilder.ToString());
        }

        void UpdateAirlockDisplay(IMyTextPanel lcd, double dt)
        {
            lcd.ContentType = ContentType.TEXT_AND_IMAGE;
            lcd.Font = "Monospace";
            lcd.FontSize = 1.0f;

            _lcdBuilder.Clear();
            _lcdBuilder.AppendLine("=== AIRLOCK STATUS ===");
            _lcdBuilder.AppendLine("");

            if (_airlocks.Count == 0)
            {
                lcd.FontColor = Color.Gray;
                _lcdBuilder.AppendLine("No airlocks detected");
            }
            else
            {
                Airlock nearest = FindNearestAirlock(lcd);
                if (nearest != null)
                {
                    BuildAirlockStatus(_lcdBuilder, nearest, lcd);
                }
                else
                {
                    for (int i = 0; i < _airlocks.Count; i++)
                        BuildAirlockBrief(_lcdBuilder, _airlocks[i], i + 1);
                }
            }

            lcd.WriteText(_lcdBuilder.ToString());
        }

        int GetScreenCategory(Vector2 surfaceSize)
        {
            float area = surfaceSize.X * surfaceSize.Y;
            float smallArea = LCD_SMALL_WIDTH * LCD_SMALL_WIDTH;
            float mediumArea = LCD_MEDIUM_WIDTH * LCD_MEDIUM_WIDTH;

            if (area <= smallArea)
                return 0;
            if (area <= mediumArea)
                return 1;
            return 2;
        }

        int GetBiabTotalPages()
        {
            return 3;
        }

        void BuildBiabPage(StringBuilder sb, int page)
        {
            switch (page)
            {
                case 0:
                    BuildBiabOverviewPage(sb);
                    break;
                case 1:
                    BuildBiabAirlocksPage(sb);
                    break;
                case 2:
                    BuildBiabDoorsPage(sb);
                    break;
            }

            sb.AppendLine("");
            sb.Append("[");
            for (int i = 0; i < GetBiabTotalPages(); i++)
            {
                if (i == page)
                    sb.Append("#");
                else
                    sb.Append("-");
            }
            sb.Append("]");
        }

        void BuildBiabOverviewPage(StringBuilder sb)
        {
            sb.AppendLine("  BORN IN A BARN");
            sb.AppendLine("==================");
            sb.AppendLine("");

            int doorCount = CountBlocksOnGrid(_doors);
            int ventCount = CountBlocksOnGrid(_vents);
            int sensorCount = CountBlocksOnGrid(_sensors);
            int doorSensorCount = _doorSensorIds.Count;
            int lightSensorCount = _lightSensorIds.Count;

            sb.AppendLine("SYSTEM STATUS");
            sb.AppendLine("Doors:    " + doorCount);
            sb.AppendLine("Vents:    " + ventCount);
            sb.AppendLine("Sensors:  " + sensorCount);
            sb.AppendLine("  Door:   " + doorSensorCount);
            sb.AppendLine("  Light:  " + lightSensorCount);
            sb.AppendLine("Airlocks: " + _airlocks.Count);
            sb.AppendLine("");

            int openCount = GetOpenDoorCount();
            if (openCount > 0)
            {
                sb.AppendLine("OPEN DOORS: " + openCount);
                double nextTimer;
                IMyDoor nextDoor = GetNextDoorToClose(out nextTimer);
                if (nextDoor != null)
                {
                    sb.AppendLine("Next close: " + TruncateName(nextDoor.CustomName, 16));
                    sb.AppendLine("  in " + nextTimer.ToString("F1") + "s");
                }
            }
            else
            {
                sb.AppendLine("All doors closed");
            }
        }

        void BuildBiabAirlocksPage(StringBuilder sb)
        {
            sb.AppendLine("  AIRLOCK STATUS");
            sb.AppendLine("==================");
            sb.AppendLine("");

            if (_airlocks.Count == 0)
            {
                sb.AppendLine("No airlocks detected");
                return;
            }

            for (int i = 0; i < _airlocks.Count; i++)
            {
                Airlock al = _airlocks[i];
                float o2 = al.GetOxygenLevel();
                string stateText = GetAirlockStateText(al.State);

                sb.AppendLine("Airlock #" + (i + 1));
                sb.AppendLine("  State: " + stateText);

                if (o2 >= 0f)
                    sb.AppendLine("  O2:    " + (o2 * 100f).ToString("F0") + "%");
                else
                    sb.AppendLine("  O2:    N/A");

                if (al.HasFunctionalVents())
                    sb.AppendLine("  Vents: " + GetVentStatusShort(al));
                else
                    sb.AppendLine("  Vents: NONE");

                if (al.OutsidePressureKnown)
                    sb.AppendLine("  Out P: " + (al.OutsidePressure * 100f).ToString("F0") + "%");
                if (al.InsidePressureKnown)
                    sb.AppendLine("  In P:  " + (al.InsidePressure * 100f).ToString("F0") + "%");

                if (al.State != AirlockState.Idle)
                    sb.AppendLine("  Timer: " + al.CycleTimer.ToString("F1") + "s");

                sb.AppendLine("");
            }
        }

        void BuildBiabDoorsPage(StringBuilder sb)
        {
            sb.AppendLine("   DOOR STATUS");
            sb.AppendLine("==================");
            sb.AppendLine("");

            int shown = 0;
            for (int i = 0; i < _doors.Count; i++)
            {
                IMyDoor door = _doors[i];
                if (door.CubeGrid != Me.CubeGrid) continue;
                if (!door.IsFunctional) continue;
                if (shown >= 8) break;

                float ratio = door.OpenRatio;
                string status;
                if (ratio >= 1f)
                    status = "OPEN";
                else if (ratio <= 0f)
                    status = "CLOSED";
                else
                    status = (ratio * 100f).ToString("F0") + "%";

                string name = TruncateName(door.CustomName, 14);
                sb.AppendLine(name + " " + status);
                shown++;
            }

            if (shown == 0)
                sb.AppendLine("No doors found");
        }

        void BuildBiabMedium(StringBuilder sb)
        {
            int doorCount = CountBlocksOnGrid(_doors);
            int ventCount = CountBlocksOnGrid(_vents);
            int sensorCount = CountBlocksOnGrid(_sensors);
            int openCount = GetOpenDoorCount();

            sb.AppendLine("BORN IN A BARN");
            sb.AppendLine("D:" + doorCount + " V:" + ventCount + " S:" + sensorCount + " AL:" + _airlocks.Count + " Open:" + openCount);
            sb.AppendLine("--------------------------------");

            for (int i = 0; i < _airlocks.Count; i++)
            {
                Airlock al = _airlocks[i];
                float o2 = al.GetOxygenLevel();
                string stateText = GetAirlockStateText(al.State);

                string o2Text = o2 >= 0f ? (o2 * 100f).ToString("F0") + "%" : "N/A";
                string bar = o2 >= 0f ? BuildProgressBar(o2, 10) : "[........]";

                sb.AppendLine("AL#" + (i + 1) + " " + stateText + " O2:" + o2Text + " " + bar);
            }

            if (_airlocks.Count == 0)
                sb.AppendLine("No airlocks");

            sb.AppendLine("--------------------------------");

            if (openCount > 0)
            {
                sb.AppendLine("OPEN DOORS:");
                int shown = 0;
                foreach (long id in _doorTimers.Keys)
                {
                    IMyDoor door = FindDoorById(id);
                    if (door == null) continue;
                    double remaining = _doorTimers[id];
                    sb.AppendLine("  " + TruncateName(door.CustomName, 18) + " " + remaining.ToString("F1") + "s");
                    shown++;
                    if (shown >= 6) break;
                }
            }
            else
            {
                sb.AppendLine("All doors closed");
            }
        }

        void BuildBiabFull(StringBuilder sb)
        {
            sb.AppendLine("========================================");
            sb.AppendLine("         BORN IN A BARN");
            sb.AppendLine("========================================");
            sb.AppendLine("");

            int doorCount = CountBlocksOnGrid(_doors);
            int ventCount = CountBlocksOnGrid(_vents);
            int sensorCount = CountBlocksOnGrid(_sensors);
            int doorSensorCount = _doorSensorIds.Count;
            int lightSensorCount = _lightSensorIds.Count;
            int lightCount = CountControlledLights();
            int openCount = GetOpenDoorCount();

            sb.AppendLine("-- SYSTEM OVERVIEW --");
            sb.AppendLine("Doors:         " + doorCount);
            sb.AppendLine("Vents:         " + ventCount);
            sb.AppendLine("Sensors:       " + sensorCount);
            sb.AppendLine("  Door Sens:   " + doorSensorCount);
            sb.AppendLine("  Light Sens:  " + lightSensorCount);
            sb.AppendLine("Airlocks:      " + _airlocks.Count);
            sb.AppendLine("Lights:        " + lightCount);
            sb.AppendLine("Open Doors:    " + openCount);
            if (_masterLock)
                sb.AppendLine("MASTER LOCK:   ACTIVE");
            if (_emergencyCount > 0)
                sb.AppendLine("Emergencies:   " + _emergencyCount);
            sb.AppendLine("");

            if (_rooms.Count > 0)
            {
                sb.AppendLine("-- DETECTED ROOMS --");
                for (int r = 0; r < _rooms.Count; r++)
                {
                    Room room = _rooms[r];
                    string roomType = room.IsAirlock ? "Airlock" : "Room";
                    sb.AppendLine("#" + (r + 1) + " " + roomType + " " + room.Width + "x" + room.Height + "x" + room.Depth
                        + " D:" + room.Doors.Count + " S:" + room.Sensors.Count + " L:" + room.Lights.Count);
                }
                sb.AppendLine("");
            }

            sb.AppendLine("-- LIGHTING --");
            sb.AppendLine("Controlled Lights: " + lightCount);
            sb.AppendLine("Light Sensors:     " + lightSensorCount);
            sb.AppendLine("Rooms Scanned:     " + _rooms.Count);
            sb.AppendLine("");

            sb.AppendLine("-- DOOR STATUS --");
            if (openCount > 0)
            {
                int shown = 0;
                foreach (long id in _doorTimers.Keys)
                {
                    IMyDoor door = FindDoorById(id);
                    if (door == null) continue;
                    double remaining = _doorTimers[id];
                    string name = TruncateName(door.CustomName, 24);
                    sb.AppendLine("  " + name + " OPEN " + remaining.ToString("F1") + "s");
                    shown++;
                }
                if (shown == 0)
                    sb.AppendLine("  All doors closed");
            }
            else
            {
                sb.AppendLine("  All doors closed");
            }
            sb.AppendLine("");

            sb.AppendLine("-- AIRLOCK STATUS --");
            if (_airlocks.Count == 0)
            {
                sb.AppendLine("  No airlocks detected");
            }
            else
            {
                for (int i = 0; i < _airlocks.Count; i++)
                {
                    Airlock al = _airlocks[i];
                    float o2 = al.GetOxygenLevel();
                    string stateText = GetAirlockStateText(al.State);
                    string o2Text = o2 >= 0f ? (o2 * 100f).ToString("F0") + "%" : "N/A";
                    string bar = o2 >= 0f ? BuildProgressBar(o2, 20) : "[....................]";

                    sb.AppendLine("  Airlock #" + (i + 1) + " [" + stateText + "]");
                    sb.AppendLine("    O2: " + o2Text + " " + bar);
                    sb.AppendLine("    Vents: " + al.Vents.Count + " " + GetVentStatusText(al));
                    sb.AppendLine("    Doors: " + al.Doors.Count + " Sensors: " + al.Sensors.Count);

                    if (al.OutsidePressureKnown || al.InsidePressureKnown)
                    {
                        sb.Append("    Learned: ");
                        if (al.OutsidePressureKnown)
                            sb.Append("Out=" + (al.OutsidePressure * 100f).ToString("F0") + "% ");
                        if (al.InsidePressureKnown)
                            sb.Append("In=" + (al.InsidePressure * 100f).ToString("F0") + "%");
                        sb.AppendLine("");
                    }

                    if (al.State != AirlockState.Idle)
                    {
                        double safetyRemaining = AIRLOCK_EMERGENCY_TIMEOUT - al.TotalCycleTime;
                        sb.AppendLine("    Cycle Timer: " + al.CycleTimer.ToString("F1") + "s");
                        sb.AppendLine("    Safety: " + safetyRemaining.ToString("F0") + "s remaining");
                    }

                    if (al.EntryDoor != null)
                        sb.AppendLine("    Entry: " + TruncateName(al.EntryDoor.CustomName, 20));
                    if (al.ExitDoor != null)
                        sb.AppendLine("    Exit:  " + TruncateName(al.ExitDoor.CustomName, 20));

                    sb.AppendLine("");
                }
            }
        }

        Airlock FindNearestAirlock(IMyTextPanel lcd)
        {
            Vector3I lcdPos = lcd.Position;
            Airlock nearest = null;
            int bestDist = int.MaxValue;

            for (int i = 0; i < _airlocks.Count; i++)
            {
                Airlock al = _airlocks[i];
                for (int v = 0; v < al.Vents.Count; v++)
                {
                    IMyAirVent vent = al.Vents[v];
                    if (vent == null || !vent.IsFunctional) continue;
                    Vector3I vPos = vent.Position;
                    int dist = Math.Abs(lcdPos.X - vPos.X)
                             + Math.Abs(lcdPos.Y - vPos.Y)
                             + Math.Abs(lcdPos.Z - vPos.Z);
                    if (dist < bestDist)
                    {
                        bestDist = dist;
                        nearest = al;
                    }
                }
            }

            if (bestDist <= 10)
                return nearest;
            return null;
        }

        void BuildAirlockStatus(StringBuilder sb, Airlock al, IMyTextPanel lcd)
        {
            float o2 = al.GetOxygenLevel();
            string stateText = GetAirlockStateText(al.State);

            Color stateColor;
            if (al.State == AirlockState.Idle)
                stateColor = Color.Green;
            else if (al.State == AirlockState.EntryDoorOpen || al.State == AirlockState.ExitDoorOpen)
                stateColor = new Color(255, 165, 0);
            else
                stateColor = Color.Yellow;
            lcd.FontColor = stateColor;

            sb.AppendLine("State: " + stateText);
            sb.AppendLine("");

            if (o2 >= 0f)
            {
                string bar = BuildProgressBar(o2, 16);
                sb.AppendLine("O2: " + (o2 * 100f).ToString("F0") + "% " + bar);
            }
            else
            {
                sb.AppendLine("O2: N/A");
            }
            sb.AppendLine("");

            if (al.OutsidePressureKnown || al.InsidePressureKnown)
            {
                sb.AppendLine("LEARNED PRESSURES:");
                if (al.OutsidePressureKnown)
                    sb.AppendLine("  Outside: " + (al.OutsidePressure * 100f).ToString("F0") + "%");
                if (al.InsidePressureKnown)
                    sb.AppendLine("  Inside:  " + (al.InsidePressure * 100f).ToString("F0") + "%");
                sb.AppendLine("");
            }

            sb.AppendLine("Vents:   " + al.Vents.Count + " " + GetVentStatusText(al));
            sb.AppendLine("Doors:   " + al.Doors.Count);
            sb.AppendLine("Sensors: " + al.Sensors.Count);
            sb.AppendLine("");

            if (al.State != AirlockState.Idle)
            {
                sb.AppendLine("Cycle: " + al.CycleTimer.ToString("F1") + "s");
                double safetyRemaining = AIRLOCK_EMERGENCY_TIMEOUT - al.TotalCycleTime;
                sb.AppendLine("Safety: " + safetyRemaining.ToString("F0") + "s");
            }

            if (al.EntryDoor != null)
                sb.AppendLine("Entry: " + TruncateName(al.EntryDoor.CustomName, 18));
            if (al.ExitDoor != null)
                sb.AppendLine("Exit:  " + TruncateName(al.ExitDoor.CustomName, 18));
        }

        void BuildAirlockBrief(StringBuilder sb, Airlock al, int index)
        {
            float o2 = al.GetOxygenLevel();
            string stateText = GetAirlockStateText(al.State);
            string o2Text = o2 >= 0f ? (o2 * 100f).ToString("F0") + "%" : "N/A";

            sb.AppendLine("#" + index + " " + stateText + " O2:" + o2Text + " D:" + al.Doors.Count + " V:" + al.Vents.Count);
        }

        string GetAirlockStateText(AirlockState state)
        {
            switch (state)
            {
                case AirlockState.Idle: return "READY";
                case AirlockState.PreCycling: return "CYCLING";
                case AirlockState.EntryDoorOpen: return "ENTRY OPEN";
                case AirlockState.PostCycling: return "CYCLING";
                case AirlockState.ExitDoorOpen: return "EXIT OPEN";
                default: return "UNKNOWN";
            }
        }

        string BuildProgressBar(float value, int width)
        {
            if (value < 0f) value = 0f;
            if (value > 1f) value = 1f;
            int filled = (int)(value * width);
            if (filled > width) filled = width;

            StringBuilder bar = new StringBuilder(width + 2);
            bar.Append("[");
            for (int i = 0; i < width; i++)
            {
                if (i < filled)
                    bar.Append("|");
                else
                    bar.Append(".");
            }
            bar.Append("]");
            return bar.ToString();
        }

        string TruncateName(string name, int maxLength)
        {
            if (name == null) return "";
            if (name.Length <= maxLength) return name;
            return name.Substring(0, maxLength - 3) + "...";
        }

        string GetVentStatusText(Airlock al)
        {
            if (al.Vents.Count == 0) return "NO VENTS";

            bool anyFunctional = false;
            bool anyEnabled = false;
            bool anyDepressurizing = false;
            bool anyPressurizing = false;

            for (int i = 0; i < al.Vents.Count; i++)
            {
                IMyAirVent v = al.Vents[i];
                if (v == null) continue;
                if (!v.IsFunctional) continue;
                anyFunctional = true;
                if (!v.Enabled) continue;
                anyEnabled = true;
                if (v.Depressurize)
                    anyDepressurizing = true;
                else
                    anyPressurizing = true;
            }

            if (!anyFunctional) return "DAMAGED";
            if (!anyEnabled) return "OFF";
            if (anyDepressurizing) return "DEPRESSURIZING";
            if (anyPressurizing) return "PRESSURIZING";
            return "OFF";
        }

        string GetVentStatusShort(Airlock al)
        {
            if (al.Vents.Count == 0) return "ERR";

            bool anyFunctional = false;
            bool anyEnabled = false;
            bool anyDepressurizing = false;
            bool anyPressurizing = false;

            for (int i = 0; i < al.Vents.Count; i++)
            {
                IMyAirVent v = al.Vents[i];
                if (v == null) continue;
                if (!v.IsFunctional) continue;
                anyFunctional = true;
                if (!v.Enabled) continue;
                anyEnabled = true;
                if (v.Depressurize)
                    anyDepressurizing = true;
                else
                    anyPressurizing = true;
            }

            if (!anyFunctional) return "DMG";
            if (!anyEnabled) return "OFF";
            if (anyDepressurizing) return "DEPR";
            if (anyPressurizing) return "PRES";
            return "OFF";
        }

        void OutputDebugInfo(int doorCount, int ventCount, int sensorCount)
        {
            int openCount = GetOpenDoorCount();
            Echo("BORN IN A BARN");
            Echo("D:" + doorCount + " V:" + ventCount + " S:" + sensorCount);
            Echo("AL:" + _airlocks.Count + " Open:" + openCount);
            if (_masterLock)
                Echo("MASTER LOCK ACTIVE");
            if (_emergencyCount > 0)
                Echo("Emergencies: " + _emergencyCount);
            Echo("Rooms: " + _rooms.Count);
        }
    }
}
