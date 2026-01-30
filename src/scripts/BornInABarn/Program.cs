// <mdk sortorder="0" />
using System.Collections.Generic;
using Sandbox.ModAPI.Ingame;
using SpaceEngineers.Game.ModAPI.Ingame;
using VRageMath;

namespace IngameScript
{
    partial class Program : MyGridProgram
    {
        #region mdk preserve
        const double CLOSE_AFTER_SECONDS = 5.0;
        const float OPENING_EPSILON = 0.01f;
        const double MAX_SENSOR_DOOR_DISTANCE = 5.0;
        const float SENSOR_FRONT_EXTEND = 8f;
        const float SENSOR_BACK_EXTEND = 8f;
        const float SENSOR_SIDE_EXTEND = 3f;
        const float SENSOR_VERTICAL_EXTEND = 3f;
        const float PRESSURIZED_THRESHOLD = 0.75f;
        const float DEPRESSURIZED_THRESHOLD = 0.10f;
        const double AIRLOCK_CYCLE_TIMEOUT = 30.0;
        const double AIRLOCK_DOOR_OPEN_TIME = 5.0;
        const double AIRLOCK_EMERGENCY_TIMEOUT = 90.0;
        const string PRESSURE_VENT_TAG = "[PRESSURE]";
        const string LCD_TAG_BIAB = "[BIAB]";
        const string LCD_TAG_AIRLOCK = "[AIRLOCK]";
        const string INNER_DOOR_TAG = "[IN]";
        const string OUTER_DOOR_TAG = "[OUT]";
        const double LCD_PAGE_CYCLE_TIME = 3.0;
        const double LIGHT_SENSOR_DOOR_DISTANCE = 3.0;
        const double LIGHT_SENSOR_LIGHT_DISTANCE = 8.0;
        const float LIGHT_SENSOR_FRONT_EXTEND = 25f;
        const float LIGHT_SENSOR_BACK_EXTEND = 1f;
        const float LIGHT_SENSOR_LEFT_EXTEND = 25f;
        const float LIGHT_SENSOR_RIGHT_EXTEND = 25f;
        const float LIGHT_SENSOR_TOP_EXTEND = 10f;
        const float LIGHT_SENSOR_BOTTOM_EXTEND = 25f;
        const double BLOCK_REFRESH_INTERVAL = 10.0;
        const double STATE_SAVE_INTERVAL = 30.0;
        #endregion

        readonly Dictionary<long, double> _doorTimers = new Dictionary<long, double>();
        readonly Dictionary<long, float> _lastRatio = new Dictionary<long, float>();
        readonly List<Airlock> _airlocks = new List<Airlock>();
        readonly HashSet<long> _airlockDoorIds = new HashSet<long>();
        bool _airlocksDetected = false;
        bool _firstRunComplete = false;
        bool _masterLock = false;
        int _emergencyCount = 0;
        int _lastDoorCount = 0;
        int _lastVentCount = 0;
        int _lastSensorCount = 0;
        double _refreshTimer = 0;

        readonly List<IMyDoor> _doors = new List<IMyDoor>();
        readonly List<IMySensorBlock> _sensors = new List<IMySensorBlock>();
        readonly List<IMyAirVent> _vents = new List<IMyAirVent>();

        public Program()
        {
            Runtime.UpdateFrequency = UpdateFrequency.Update10;
            LoadPersistedState();
        }

        public void Save() { }

        public void Main(string argument, UpdateType updateSource)
        {
            double dt = Runtime.TimeSinceLastRun.TotalSeconds;
            if (dt <= 0) dt = 0.166;

            _doors.Clear();
            _sensors.Clear();
            _vents.Clear();
            GridTerminalSystem.GetBlocksOfType(_doors);
            GridTerminalSystem.GetBlocksOfType(_sensors);
            GridTerminalSystem.GetBlocksOfType(_vents);

            int doorCount = CountBlocksOnGrid(_doors);
            int ventCount = CountBlocksOnGrid(_vents);
            int sensorCount = CountBlocksOnGrid(_sensors);

            if (!_firstRunComplete)
            {
                CloseAllDoorsOnGrid();
                PerformFullRoomScan();
                _firstRunComplete = true;
            }

            bool forceRefresh = false;
            if (!string.IsNullOrEmpty(argument))
            {
                string cmd = argument.ToLower().Trim();
                if (cmd == "reset" || cmd == "refresh")
                {
                    forceRefresh = true;
                    _roomsNeedRescan = true;
                    for (int a = 0; a < _airlocks.Count; a++)
                    {
                        _airlocks[a].CloseAllDoors();
                        _airlocks[a].Reset();
                    }
                    CloseAllDoorsOnGrid();
                    _masterLock = false;
                }
                else if (cmd == "lock")
                {
                    _masterLock = true;
                    CloseAllDoorsOnGrid();
                    SetAllDoorsEnabled(false);
                }
                else if (cmd == "unlock")
                {
                    _masterLock = false;
                    SetAllDoorsEnabled(true);
                    _emergencyCount = 0;
                }
                else if (cmd == "force")
                {
                    CloseAllDoorsOnGrid();
                    for (int a = 0; a < _airlocks.Count; a++)
                    {
                        _airlocks[a].CloseAllDoors();
                        _airlocks[a].Reset();
                    }
                }
            }

            if (_masterLock) { OutputDebugInfo(doorCount, ventCount, sensorCount); return; }

            _refreshTimer += dt;
            bool blocksChanged = (doorCount != _lastDoorCount)
                || (ventCount != _lastVentCount)
                || (sensorCount != _lastSensorCount);

            if (blocksChanged)
            {
                _lastDoorCount = doorCount;
                _lastVentCount = ventCount;
                _lastSensorCount = sensorCount;
                _roomsNeedRescan = true;
            }

            bool shouldRefresh = !_airlocksDetected
                || forceRefresh
                || (blocksChanged && _refreshTimer >= BLOCK_REFRESH_INTERVAL);

            if (shouldRefresh)
            {
                DetectAirlocks();
                ClassifySensors();
                _airlocksDetected = true;
                _refreshTimer = 0;
            }

            if (_roomsNeedRescan && _refreshTimer >= BLOCK_REFRESH_INTERVAL)
            {
                PerformFullRoomScan();
            }

            ConfigureDoorSensors();
            ConfigureSensorsFromRoomData();

            ProcessAirlocks(dt);

            UpdateOutsidePressureFromReferenceVents();
            UpdateInsidePressureFromBaseVents();

            if (_rooms.Count > 0)
                ProcessRoomLighting();
            else
                ProcessLighting();

            UpdateLcdDisplays(dt);
            OutputDebugInfo(doorCount, ventCount, sensorCount);
            ProcessSensorTriggeredDoors();
            DetectAndTrackOpeningDoors();
            ProcessAllDoorTimers(dt);
            CleanupDeadDoors();
            ProcessStateSave(dt);
        }

        int CountBlocksOnGrid<T>(List<T> blocks) where T : class, IMyTerminalBlock
        {
            int count = 0;
            for (int i = 0; i < blocks.Count; i++)
            {
                if (blocks[i].CubeGrid == Me.CubeGrid)
                    count++;
            }
            return count;
        }

        void CloseAllDoorsOnGrid()
        {
            for (int i = 0; i < _doors.Count; i++)
            {
                IMyDoor d = _doors[i];
                if (d.CubeGrid == Me.CubeGrid && d.IsFunctional)
                    d.CloseDoor();
            }
        }

        void SetAllDoorsEnabled(bool enabled)
        {
            for (int i = 0; i < _doors.Count; i++)
            {
                IMyDoor d = _doors[i];
                if (d.CubeGrid == Me.CubeGrid && d.IsFunctional)
                    d.Enabled = enabled;
            }
        }
    }
}
