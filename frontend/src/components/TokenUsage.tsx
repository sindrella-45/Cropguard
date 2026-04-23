/**
 * Token usage display component for CropGuard AI.
 *
 * Shows the farmer their API token usage
 * and estimated costs.
 *
 * Implements Optional Task Medium #1:
 *   'Calculate and display token usage and costs'
 *
 * Features:
 *   - Total tokens used
 *   - Total cost in USD
 *   - Number of requests made
 *   - Average tokens per request
 */

"use client";

import { useState, useEffect } from "react";
import { getTokenUsage } from "@/services/api";

export default function TokenUsage() {
  const [usage,   setUsage]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    getTokenUsage()
      .then(setUsage)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{
      textAlign: "center",
      padding:   "20px",
      color:     "rgba(180, 220, 120, 0.4)",
    }}>
      Loading usage stats...
    </div>
  );

  if (error || !usage) return null;

  const stats = [
    {
      icon:  "🔢",
      label: "Total Tokens",
      value: usage.total_tokens.toLocaleString(),
    },
    {
      icon:  "💰",
      label: "Total Cost",
      value: `$${usage.total_cost_usd.toFixed(4)}`,
    },
    {
      icon:  "📊",
      label: "Requests Made",
      value: usage.requests_made,
    },
    {
      icon:  "📈",
      label: "Avg per Request",
      value: `${usage.average_tokens_per_request} tokens`,
    },
  ];

  return (
    <div className="card">
      <h4 style={{
        color:         "#6AAB35",
        margin:        "0 0 16px",
        fontSize:      "13px",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        📊 Your Usage Statistics
      </h4>

      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap:                 "12px",
      }}>
        {stats.map(stat => (
          <div
            key={stat.label}
            style={{
              background:   "rgba(255, 255, 255, 0.03)",
              border:       "1px solid rgba(106, 171, 53, 0.1)",
              borderRadius: "10px",
              padding:      "12px",
              textAlign:    "center",
            }}
          >
            <div style={{ fontSize: "20px" }}>
              {stat.icon}
            </div>
            <div style={{
              color:      "#F5F0E8",
              fontWeight: "700",
              fontSize:   "16px",
              margin:     "4px 0 2px",
            }}>
              {stat.value}
            </div>
            <div style={{
              color:    "rgba(180, 220, 120, 0.4)",
              fontSize: "11px",
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}