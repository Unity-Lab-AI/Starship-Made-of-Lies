using System;
using System.Collections.Generic;
using Sandbox.ModAPI;
using VRage.Game.ModAPI;
using VRage.ModAPI;

namespace UMSMod
{
    public static class DeMergeSession
    {
        private static HashSet<long> _trackedGrids = new HashSet<long>();
        private static bool _registered = false;

        public static void Register()
        {
            if (_registered) return;
            if (MyAPIGateway.Entities == null) return;

            _registered = true;

            MyAPIGateway.Entities.OnEntityAdd += OnEntityAdd;
            MyAPIGateway.Entities.OnEntityRemove += OnEntityRemove;

            try
            {
                var entities = new HashSet<IMyEntity>();
                MyAPIGateway.Entities.GetEntities(entities, e => e is IMyCubeGrid);
                foreach (var entity in entities)
                {
                    SubscribeToGrid(entity as IMyCubeGrid);
                }
            }
            catch { }
        }

        public static void Unregister()
        {
            if (!_registered) return;
            _registered = false;

            try
            {
                if (MyAPIGateway.Entities != null)
                {
                    MyAPIGateway.Entities.OnEntityAdd -= OnEntityAdd;
                    MyAPIGateway.Entities.OnEntityRemove -= OnEntityRemove;
                }
            }
            catch { }

            _trackedGrids.Clear();
        }

        private static void OnEntityAdd(IMyEntity entity)
        {
            var grid = entity as IMyCubeGrid;
            if (grid != null)
            {
                SubscribeToGrid(grid);
            }
        }

        private static void OnEntityRemove(IMyEntity entity)
        {
            var grid = entity as IMyCubeGrid;
            if (grid != null)
            {
                UnsubscribeFromGrid(grid);
            }
        }

        private static void SubscribeToGrid(IMyCubeGrid grid)
        {
            if (grid == null || _trackedGrids.Contains(grid.EntityId)) return;
            _trackedGrids.Add(grid.EntityId);
            grid.OnGridSplit += OnGridSplit;
        }

        private static void UnsubscribeFromGrid(IMyCubeGrid grid)
        {
            if (grid == null || !_trackedGrids.Contains(grid.EntityId)) return;
            _trackedGrids.Remove(grid.EntityId);
            try { grid.OnGridSplit -= OnGridSplit; } catch { }
        }

        private static void OnGridSplit(IMyCubeGrid originalGrid, IMyCubeGrid newGrid)
        {
            SubscribeToGrid(newGrid);

            // Convert NEW grid to ship if it's static
            if (newGrid != null && newGrid.IsStatic)
            {
                MyAPIGateway.Utilities.InvokeOnGameThread(() =>
                {
                    try
                    {
                        if (newGrid != null && !newGrid.Closed && newGrid.IsStatic)
                        {
                            newGrid.IsStatic = false;
                        }
                    }
                    catch { }
                });
            }

            // Convert ORIGINAL grid to ship if it's static AND has thrusters (the missile)
            if (originalGrid != null && originalGrid.IsStatic)
            {
                bool hasThrusters = false;
                try
                {
                    var blocks = new List<IMySlimBlock>();
                    originalGrid.GetBlocks(blocks, b => b.FatBlock is IMyThrust);
                    hasThrusters = blocks.Count > 0;
                }
                catch { }

                if (hasThrusters)
                {
                    MyAPIGateway.Utilities.InvokeOnGameThread(() =>
                    {
                        try
                        {
                            if (originalGrid != null && !originalGrid.Closed && originalGrid.IsStatic)
                            {
                                originalGrid.IsStatic = false;
                            }
                        }
                        catch { }
                    });
                }
            }
        }
    }
}
