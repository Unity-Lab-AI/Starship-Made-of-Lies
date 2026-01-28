using System;
using Sandbox.ModAPI;
using VRage.Plugins;

namespace UMSMod
{
    public class Plugin : IPlugin
    {
        public static Plugin Instance { get; private set; }
        private bool _initialized = false;

        public void Init(object gameInstance)
        {
            Instance = this;
        }

        public void Update()
        {
            if (!_initialized && MyAPIGateway.Session != null && MyAPIGateway.Entities != null)
            {
                _initialized = true;
                DeMergeSession.Register();
            }

            if (_initialized && MyAPIGateway.Session == null)
            {
                _initialized = false;
                DeMergeSession.Unregister();
            }
        }

        public void Dispose()
        {
            DeMergeSession.Unregister();
            Instance = null;
        }
    }
}
