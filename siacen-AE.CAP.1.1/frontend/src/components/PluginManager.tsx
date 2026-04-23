/**
 * Plugin manager component for CropGuard AI.
 *
 * Allows farmers to enable or disable agent
 * tools dynamically through a toggle UI.
 *
 * Implements Optional Task Medium #8:
 *   'Implement a plugin system that allows users
 *    to add or remove functionalities dynamically'
 *
 * Features:
 *   - List of all available plugins
 *   - Toggle switches for each plugin
 *   - Required plugins cannot be disabled
 *   - Changes take effect immediately
 */

"use client";

import { useState, useEffect } from "react";
import { getPlugins, togglePlugin, Plugin } from "@/services/api";

export default function PluginManager() {
  const [plugins,  setPlugins]  = useState<Plugin[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    getPlugins()
      .then(data => setPlugins(data.plugins))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (pluginId: string) => {
    setToggling(pluginId);
    try {
      const result = await togglePlugin(pluginId);
      setPlugins(prev =>
        prev.map(p =>
          p.id === pluginId
            ? { ...p, enabled: result.enabled }
            : p
        )
      );
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setToggling(null);
    }
  };

  if (loading) return null;

  return (
    <div className="card">
      <h4 style={{
        color:         "#6AAB35",
        margin:        "0 0 16px",
        fontSize:      "13px",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        🔌 Agent Plugins
      </h4>

      <div style={{
        display:       "flex",
        flexDirection: "column",
        gap:           "10px",
      }}>
        {plugins.map(plugin => (
          <div
            key={plugin.id}
            style={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
              background:     "rgba(255, 255, 255, 0.03)",
              border:         "1px solid rgba(106, 171, 53, 0.1)",
              borderRadius:   "10px",
              padding:        "12px 14px",
              opacity:        plugin.required ? 0.7 : 1,
            }}
          >
            {/* Plugin Info */}
            <div>
              <div style={{
                color:      "#F5F0E8",
                fontSize:   "13px",
                fontWeight: "600",
              }}>
                {plugin.icon} {plugin.name}
                {plugin.required && (
                  <span style={{
                    color:     "rgba(180, 220, 120, 0.4)",
                    fontSize:  "11px",
                    marginLeft: "6px",
                  }}>
                    (required)
                  </span>
                )}
              </div>
              <div style={{
                color:    "rgba(180, 220, 120, 0.4)",
                fontSize: "11px",
                marginTop: "3px",
              }}>
                {plugin.description}
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => {
                if (!plugin.required) {
                  handleToggle(plugin.id);
                }
              }}
              disabled={
                plugin.required ||
                toggling === plugin.id
              }
              style={{
                background:   plugin.enabled
                  ? "rgba(106, 171, 53, 0.3)"
                  : "rgba(255, 255, 255, 0.08)",
                border:       plugin.enabled
                  ? "1.5px solid #6AAB35"
                  : "1.5px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "20px",
                width:        "44px",
                height:       "24px",
                cursor:       plugin.required
                  ? "not-allowed"
                  : "pointer",
                position:     "relative",
                flexShrink:   0,
                transition:   "all 0.2s ease",
              }}
            >
              <div style={{
                width:        "16px",
                height:       "16px",
                borderRadius: "50%",
                background:   plugin.enabled
                  ? "#6AAB35"
                  : "rgba(255, 255, 255, 0.3)",
                position:     "absolute",
                top:          "3px",
                left:         plugin.enabled ? "23px" : "3px",
                transition:   "all 0.2s ease",
              }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}