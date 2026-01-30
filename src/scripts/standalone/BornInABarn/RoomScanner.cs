// <mdk sortorder="50" />
using System;
using System.Collections.Generic;
using Sandbox.ModAPI.Ingame;
using SpaceEngineers.Game.ModAPI.Ingame;
using VRage.Game.ModAPI.Ingame;
using VRageMath;

namespace IngameScript
{
    partial class Program
    {
        class Room
        {
            public Vector3I Min;
            public Vector3I Max;
            public readonly List<IMyDoor> Doors = new List<IMyDoor>();
            public readonly List<IMySensorBlock> Sensors = new List<IMySensorBlock>();
            public readonly List<IMyLightingBlock> Lights = new List<IMyLightingBlock>();
            public readonly List<IMyAirVent> Vents = new List<IMyAirVent>();
            public bool IsAirlock;
            public bool HasCeilingSensor;

            public Room(Vector3I min, Vector3I max)
            {
                Min = min;
                Max = max;
            }

            public int Volume
            {
                get
                {
                    return (Max.X - Min.X + 1)
                         * (Max.Y - Min.Y + 1)
                         * (Max.Z - Min.Z + 1);
                }
            }

            public int Width { get { return Max.X - Min.X + 1; } }
            public int Height { get { return Max.Y - Min.Y + 1; } }
            public int Depth { get { return Max.Z - Min.Z + 1; } }

            public Vector3D Center
            {
                get
                {
                    return new Vector3D(
                        (Min.X + Max.X) / 2.0,
                        (Min.Y + Max.Y) / 2.0,
                        (Min.Z + Max.Z) / 2.0);
                }
            }

            public int MaxDimension
            {
                get
                {
                    int w = Width;
                    int h = Height;
                    int d = Depth;
                    if (w >= h && w >= d) return w;
                    if (h >= w && h >= d) return h;
                    return d;
                }
            }

            public float GetRecommendedSensorRange()
            {
                int maxDim = MaxDimension;
                if (maxDim <= 3) return 3f;
                if (maxDim <= 6) return 5f;
                if (maxDim <= 10) return 8f;
                if (maxDim <= 15) return 12f;
                if (maxDim <= 25) return 18f;
                return 25f;
            }

            public void ExpandBounds(Vector3I pos)
            {
                if (pos.X < Min.X) Min.X = pos.X;
                if (pos.Y < Min.Y) Min.Y = pos.Y;
                if (pos.Z < Min.Z) Min.Z = pos.Z;
                if (pos.X > Max.X) Max.X = pos.X;
                if (pos.Y > Max.Y) Max.Y = pos.Y;
                if (pos.Z > Max.Z) Max.Z = pos.Z;
            }

            public bool ContainsPosition(Vector3I pos)
            {
                return pos.X >= Min.X && pos.X <= Max.X
                    && pos.Y >= Min.Y && pos.Y <= Max.Y
                    && pos.Z >= Min.Z && pos.Z <= Max.Z;
            }
        }

        readonly List<Room> _rooms = new List<Room>();
        readonly HashSet<Vector3I> _roomCells = new HashSet<Vector3I>();
        readonly Dictionary<Vector3I, int> _cellToRoom = new Dictionary<Vector3I, int>();
        readonly HashSet<Vector3I> _previousBlockPositions = new HashSet<Vector3I>();
        bool _roomsNeedRescan = false;
        float _gridBlockSize = 2.5f;

        delegate void BlockAssigner(Room room);

        void PerformFullRoomScan()
        {
            _rooms.Clear();
            _roomCells.Clear();
            _cellToRoom.Clear();
            _roomsNeedRescan = false;

            _gridBlockSize = Me.CubeGrid.GridSize;

            HashSet<Vector3I> occupied = BuildOccupiedSet();
            if (occupied.Count == 0) return;

            List<Vector3I> startPoints = FindInteriorStartPoints(occupied);
            HashSet<Vector3I> visited = new HashSet<Vector3I>();

            for (int i = 0; i < startPoints.Count; i++)
            {
                Vector3I start = startPoints[i];
                if (visited.Contains(start)) continue;
                if (occupied.Contains(start)) continue;

                Room room = FloodFillRoom(start, occupied, visited);
                if (room != null)
                {
                    int roomIdx = _rooms.Count;
                    _rooms.Add(room);
                    MapCellsToRoom(room, roomIdx, occupied);
                }
            }

            AssignBlocksToRooms(occupied);
            ClassifyRooms();
            SaveBlockPositions();
        }

        HashSet<Vector3I> BuildOccupiedSet()
        {
            HashSet<Vector3I> occupied = new HashSet<Vector3I>();
            Vector3I min = Me.CubeGrid.Min;
            Vector3I max = Me.CubeGrid.Max;

            for (int x = min.X; x <= max.X; x++)
            {
                for (int y = min.Y; y <= max.Y; y++)
                {
                    for (int z = min.Z; z <= max.Z; z++)
                    {
                        Vector3I pos = new Vector3I(x, y, z);
                        IMySlimBlock block = Me.CubeGrid.GetCubeBlock(pos);
                        if (block != null)
                            occupied.Add(pos);
                    }
                }
            }
            return occupied;
        }

        HashSet<Vector3I> BuildBlockPositionSet()
        {
            HashSet<Vector3I> positions = new HashSet<Vector3I>();
            Vector3I min = Me.CubeGrid.Min;
            Vector3I max = Me.CubeGrid.Max;

            for (int x = min.X; x <= max.X; x++)
            {
                for (int y = min.Y; y <= max.Y; y++)
                {
                    for (int z = min.Z; z <= max.Z; z++)
                    {
                        Vector3I pos = new Vector3I(x, y, z);
                        IMySlimBlock block = Me.CubeGrid.GetCubeBlock(pos);
                        if (block != null)
                            positions.Add(pos);
                    }
                }
            }
            return positions;
        }

        void SaveBlockPositions()
        {
            _previousBlockPositions.Clear();
            HashSet<Vector3I> current = BuildBlockPositionSet();
            foreach (Vector3I pos in current)
                _previousBlockPositions.Add(pos);
        }

        List<Vector3I> FindInteriorStartPoints(HashSet<Vector3I> occupied)
        {
            List<Vector3I> starts = new List<Vector3I>();
            HashSet<Vector3I> added = new HashSet<Vector3I>();

            for (int i = 0; i < _vents.Count; i++)
            {
                IMyAirVent vent = _vents[i];
                if (vent.CubeGrid != Me.CubeGrid) continue;
                Vector3I pos = vent.Position;
                AddAdjacentEmptyPoints(pos, occupied, starts, added);
            }

            for (int i = 0; i < _lights.Count; i++)
            {
                IMyLightingBlock light = _lights[i];
                if (light.CubeGrid != Me.CubeGrid) continue;
                Vector3I pos = light.Position;
                AddAdjacentEmptyPoints(pos, occupied, starts, added);
            }

            for (int i = 0; i < _sensors.Count; i++)
            {
                IMySensorBlock sensor = _sensors[i];
                if (sensor.CubeGrid != Me.CubeGrid) continue;
                Vector3I pos = sensor.Position;
                AddAdjacentEmptyPoints(pos, occupied, starts, added);
            }

            return starts;
        }

        void AddAdjacentEmptyPoints(Vector3I pos, HashSet<Vector3I> occupied,
            List<Vector3I> starts, HashSet<Vector3I> added)
        {
            Vector3I[] neighbors = new Vector3I[]
            {
                new Vector3I(pos.X + 1, pos.Y, pos.Z),
                new Vector3I(pos.X - 1, pos.Y, pos.Z),
                new Vector3I(pos.X, pos.Y + 1, pos.Z),
                new Vector3I(pos.X, pos.Y - 1, pos.Z),
                new Vector3I(pos.X, pos.Y, pos.Z + 1),
                new Vector3I(pos.X, pos.Y, pos.Z - 1)
            };

            for (int n = 0; n < neighbors.Length; n++)
            {
                Vector3I neighbor = neighbors[n];
                if (!occupied.Contains(neighbor) && !added.Contains(neighbor))
                {
                    Vector3I gridMin = Me.CubeGrid.Min;
                    Vector3I gridMax = Me.CubeGrid.Max;
                    if (neighbor.X >= gridMin.X - 1 && neighbor.X <= gridMax.X + 1
                        && neighbor.Y >= gridMin.Y - 1 && neighbor.Y <= gridMax.Y + 1
                        && neighbor.Z >= gridMin.Z - 1 && neighbor.Z <= gridMax.Z + 1)
                    {
                        starts.Add(neighbor);
                        added.Add(neighbor);
                    }
                }
            }
        }

        Room FloodFillRoom(Vector3I start, HashSet<Vector3I> occupied, HashSet<Vector3I> visited)
        {
            Queue<Vector3I> queue = new Queue<Vector3I>();
            List<Vector3I> cells = new List<Vector3I>();
            HashSet<Vector3I> localVisited = new HashSet<Vector3I>();

            queue.Enqueue(start);
            localVisited.Add(start);

            Vector3I gridMin = Me.CubeGrid.Min;
            Vector3I gridMax = Me.CubeGrid.Max;
            Vector3I boundsMin = new Vector3I(gridMin.X - 1, gridMin.Y - 1, gridMin.Z - 1);
            Vector3I boundsMax = new Vector3I(gridMax.X + 1, gridMax.Y + 1, gridMax.Z + 1);

            bool touchedEdge = false;
            const int MAX_CELLS = 10000;

            while (queue.Count > 0)
            {
                if (cells.Count > MAX_CELLS)
                {
                    foreach (Vector3I c in localVisited)
                        visited.Add(c);
                    return null;
                }

                Vector3I current = queue.Dequeue();
                cells.Add(current);

                if (current.X <= boundsMin.X || current.X >= boundsMax.X
                    || current.Y <= boundsMin.Y || current.Y >= boundsMax.Y
                    || current.Z <= boundsMin.Z || current.Z >= boundsMax.Z)
                {
                    touchedEdge = true;
                }

                Vector3I[] dirs = new Vector3I[]
                {
                    new Vector3I(1, 0, 0),
                    new Vector3I(-1, 0, 0),
                    new Vector3I(0, 1, 0),
                    new Vector3I(0, -1, 0),
                    new Vector3I(0, 0, 1),
                    new Vector3I(0, 0, -1)
                };

                for (int d = 0; d < dirs.Length; d++)
                {
                    Vector3I next = new Vector3I(
                        current.X + dirs[d].X,
                        current.Y + dirs[d].Y,
                        current.Z + dirs[d].Z);

                    if (localVisited.Contains(next)) continue;
                    if (next.X < boundsMin.X || next.X > boundsMax.X
                        || next.Y < boundsMin.Y || next.Y > boundsMax.Y
                        || next.Z < boundsMin.Z || next.Z > boundsMax.Z)
                        continue;

                    if (occupied.Contains(next))
                    {
                        IMySlimBlock slim = Me.CubeGrid.GetCubeBlock(next);
                        if (slim != null && slim.FatBlock is IMyDoor)
                        {
                            localVisited.Add(next);
                            continue;
                        }
                        continue;
                    }

                    localVisited.Add(next);
                    queue.Enqueue(next);
                }
            }

            foreach (Vector3I c in localVisited)
                visited.Add(c);

            if (touchedEdge) return null;
            if (cells.Count == 0) return null;

            Vector3I rMin = cells[0];
            Vector3I rMax = cells[0];
            for (int i = 1; i < cells.Count; i++)
            {
                Vector3I c = cells[i];
                if (c.X < rMin.X) rMin.X = c.X;
                if (c.Y < rMin.Y) rMin.Y = c.Y;
                if (c.Z < rMin.Z) rMin.Z = c.Z;
                if (c.X > rMax.X) rMax.X = c.X;
                if (c.Y > rMax.Y) rMax.Y = c.Y;
                if (c.Z > rMax.Z) rMax.Z = c.Z;
            }

            Room room = new Room(rMin, rMax);

            for (int i = 0; i < cells.Count; i++)
                _roomCells.Add(cells[i]);

            return room;
        }

        void MapCellsToRoom(Room room, int roomIdx, HashSet<Vector3I> occupied)
        {
            Vector3I center = new Vector3I(
                (int)Math.Round(room.Center.X),
                (int)Math.Round(room.Center.Y),
                (int)Math.Round(room.Center.Z));

            Queue<Vector3I> queue = new Queue<Vector3I>();
            HashSet<Vector3I> visited = new HashSet<Vector3I>();

            if (!occupied.Contains(center) && _roomCells.Contains(center))
            {
                queue.Enqueue(center);
                visited.Add(center);
            }
            else
            {
                for (int x = room.Min.X; x <= room.Max.X; x++)
                {
                    for (int y = room.Min.Y; y <= room.Max.Y; y++)
                    {
                        for (int z = room.Min.Z; z <= room.Max.Z; z++)
                        {
                            Vector3I pos = new Vector3I(x, y, z);
                            if (!occupied.Contains(pos) && _roomCells.Contains(pos))
                            {
                                queue.Enqueue(pos);
                                visited.Add(pos);
                                x = room.Max.X + 1;
                                y = room.Max.Y + 1;
                                break;
                            }
                        }
                    }
                }
            }

            Vector3I gridMin = Me.CubeGrid.Min;
            Vector3I gridMax = Me.CubeGrid.Max;
            Vector3I boundsMin = new Vector3I(gridMin.X - 1, gridMin.Y - 1, gridMin.Z - 1);
            Vector3I boundsMax = new Vector3I(gridMax.X + 1, gridMax.Y + 1, gridMax.Z + 1);

            while (queue.Count > 0)
            {
                Vector3I current = queue.Dequeue();

                if (!_cellToRoom.ContainsKey(current))
                    _cellToRoom[current] = roomIdx;

                Vector3I[] dirs = new Vector3I[]
                {
                    new Vector3I(1, 0, 0),
                    new Vector3I(-1, 0, 0),
                    new Vector3I(0, 1, 0),
                    new Vector3I(0, -1, 0),
                    new Vector3I(0, 0, 1),
                    new Vector3I(0, 0, -1)
                };

                for (int d = 0; d < dirs.Length; d++)
                {
                    Vector3I next = new Vector3I(
                        current.X + dirs[d].X,
                        current.Y + dirs[d].Y,
                        current.Z + dirs[d].Z);

                    if (visited.Contains(next)) continue;
                    if (next.X < boundsMin.X || next.X > boundsMax.X
                        || next.Y < boundsMin.Y || next.Y > boundsMax.Y
                        || next.Z < boundsMin.Z || next.Z > boundsMax.Z)
                        continue;

                    if (occupied.Contains(next)) continue;
                    if (!_roomCells.Contains(next)) continue;

                    visited.Add(next);
                    queue.Enqueue(next);
                }
            }
        }

        void AssignBlocksToRooms(HashSet<Vector3I> occupied)
        {
            for (int i = 0; i < _doors.Count; i++)
            {
                IMyDoor door = _doors[i];
                if (door.CubeGrid != Me.CubeGrid) continue;
                AssignBlockToAdjacentRooms(door.Position, occupied,
                    delegate(Room r) { if (!r.Doors.Contains(door)) r.Doors.Add(door); });
            }

            for (int i = 0; i < _sensors.Count; i++)
            {
                IMySensorBlock sensor = _sensors[i];
                if (sensor.CubeGrid != Me.CubeGrid) continue;
                AssignBlockToAdjacentRooms(sensor.Position, occupied,
                    delegate(Room r) { if (!r.Sensors.Contains(sensor)) r.Sensors.Add(sensor); });
            }

            for (int i = 0; i < _lights.Count; i++)
            {
                IMyLightingBlock light = _lights[i];
                if (light.CubeGrid != Me.CubeGrid) continue;
                AssignBlockToAdjacentRooms(light.Position, occupied,
                    delegate(Room r) { if (!r.Lights.Contains(light)) r.Lights.Add(light); });
            }

            for (int i = 0; i < _vents.Count; i++)
            {
                IMyAirVent vent = _vents[i];
                if (vent.CubeGrid != Me.CubeGrid) continue;
                AssignBlockToAdjacentRooms(vent.Position, occupied,
                    delegate(Room r) { if (!r.Vents.Contains(vent)) r.Vents.Add(vent); });
            }
        }

        void AssignBlockToAdjacentRooms(Vector3I blockPos, HashSet<Vector3I> occupied,
            BlockAssigner assigner)
        {
            Vector3I[] dirs = new Vector3I[]
            {
                new Vector3I(1, 0, 0),
                new Vector3I(-1, 0, 0),
                new Vector3I(0, 1, 0),
                new Vector3I(0, -1, 0),
                new Vector3I(0, 0, 1),
                new Vector3I(0, 0, -1)
            };

            for (int d = 0; d < dirs.Length; d++)
            {
                Vector3I neighbor = new Vector3I(
                    blockPos.X + dirs[d].X,
                    blockPos.Y + dirs[d].Y,
                    blockPos.Z + dirs[d].Z);

                int roomIdx;
                if (_cellToRoom.TryGetValue(neighbor, out roomIdx))
                {
                    if (roomIdx >= 0 && roomIdx < _rooms.Count)
                        assigner(_rooms[roomIdx]);
                }
            }
        }

        void ClassifyRooms()
        {
            for (int i = 0; i < _rooms.Count; i++)
            {
                Room room = _rooms[i];

                room.IsAirlock = room.Doors.Count >= 2
                    && room.Vents.Count >= 1
                    && room.Volume <= 100;

                room.HasCeilingSensor = false;
                for (int s = 0; s < room.Sensors.Count; s++)
                {
                    IMySensorBlock sensor = room.Sensors[s];
                    Vector3I sPos = sensor.Position;
                    if (sPos.Y >= room.Max.Y)
                    {
                        room.HasCeilingSensor = true;
                        break;
                    }
                }
            }
        }

        void QueueIncrementalUpdate()
        {
            _roomsNeedRescan = true;
        }

        Room GetRoomAtPosition(Vector3I pos)
        {
            int roomIdx;
            if (_cellToRoom.TryGetValue(pos, out roomIdx))
            {
                if (roomIdx >= 0 && roomIdx < _rooms.Count)
                    return _rooms[roomIdx];
            }
            return null;
        }

        Room GetRoomForBlock(IMyTerminalBlock block)
        {
            if (block == null || block.CubeGrid != Me.CubeGrid)
                return null;

            Vector3I blockPos = block.Position;

            Vector3I[] dirs = new Vector3I[]
            {
                new Vector3I(0, 0, 0),
                new Vector3I(1, 0, 0),
                new Vector3I(-1, 0, 0),
                new Vector3I(0, 1, 0),
                new Vector3I(0, -1, 0),
                new Vector3I(0, 0, 1),
                new Vector3I(0, 0, -1)
            };

            for (int d = 0; d < dirs.Length; d++)
            {
                Vector3I check = new Vector3I(
                    blockPos.X + dirs[d].X,
                    blockPos.Y + dirs[d].Y,
                    blockPos.Z + dirs[d].Z);

                int roomIdx;
                if (_cellToRoom.TryGetValue(check, out roomIdx))
                {
                    if (roomIdx >= 0 && roomIdx < _rooms.Count)
                        return _rooms[roomIdx];
                }
            }
            return null;
        }

        int GetRoomCount()
        {
            return _rooms.Count;
        }

        int GetDetectedAirlockCount()
        {
            int count = 0;
            for (int i = 0; i < _rooms.Count; i++)
            {
                if (_rooms[i].IsAirlock)
                    count++;
            }
            return count;
        }
    }
}
