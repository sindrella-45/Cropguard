/**
 * Diagnosis history component for CropGuard AI.
 *
 * Displays a list of the farmer's past diagnoses
 * with key details and ability to view or delete.
 *
 * Features:
 *   - List of past diagnoses newest first
 *   - Disease name, severity, date
 *   - Delete individual diagnoses
 *   - Empty state message
 */

"use client";

import { useState, useEffect } from "react";
import { getHistory, deleteDiagnosis } from "@/services/api";

export default function History() {
  const [history,  setHistory]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getHistory(20)
      .then(data => setHistory(data.diagnoses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this diagnosis?")) return;

    setDeleting(id);
    try {
      await deleteDiagnosis(id);
      setHistory(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
    }
  };

  const severityColors: Record<string, string> = {
    none:     "#27AE60",
    mild:     "#2980B9",
    moderate: "#E67E22",
    severe:   "#C0392B",
  };

  if (loading) return (
    <div style={{
      textAlign: "center",
      padding:   "40px",
      color:     "rgba(180, 220, 120, 0.4)",
    }}>
      Loading history...
    </div>
  );

  if (history.length === 0) return (
    <div className="card" style={{ textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>
        📋
      </div>
      <h3 style={{
        color:      "#F5F0E8",
        marginBottom: "8px",
        fontFamily: "Georgia, serif",
      }}>
        No diagnoses yet
      </h3>
      <p style={{
        color:    "rgba(180, 220, 120, 0.5)",
        fontSize: "14px",
      }}>
        Upload your first leaf photo to get started.
      </p>
    </div>
  );

  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      gap:           "12px",
    }}>
      {history.map(diagnosis => {
        const severity = diagnosis.severity || "none";
        const color    = severityColors[severity] || "#7F8C8D";
        const date     = new Date(
          diagnosis.created_at
        ).toLocaleDateString("en-GB", {
          day:   "numeric",
          month: "short",
          year:  "numeric",
        });

        return (
          <div
            key={diagnosis.id}
            className="card card-hover"
          >
            <div style={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "flex-start",
              gap:            "12px",
            }}>

              {/* Left Info */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        "8px",
                  flexWrap:   "wrap",
                  marginBottom: "6px",
                }}>
                  <span style={{
                    color:      "#F5F0E8",
                    fontWeight: "600",
                    fontSize:   "15px",
                  }}>
                    {diagnosis.plant_identified || "Plant"}
                  </span>
                  <span style={{
                    background:    `${color}22`,
                    color:         color,
                    border:        `1px solid ${color}`,
                    borderRadius:  "10px",
                    padding:       "1px 8px",
                    fontSize:      "11px",
                    fontWeight:    "700",
                    textTransform: "capitalize",
                  }}>
                    {severity}
                  </span>
                </div>

                <div style={{
                  color:        "#FFD080",
                  fontSize:     "14px",
                  marginBottom: "4px",
                }}>
                  {diagnosis.disease_name || "No disease"}
                </div>

                <div style={{
                  color:    "rgba(180, 220, 120, 0.4)",
                  fontSize: "12px",
                }}>
                  {date}
                  {diagnosis.confidence_score && (
                    <span style={{ marginLeft: "8px" }}>
                      • {diagnosis.confidence_score}% confidence
                    </span>
                  )}
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(diagnosis.id)}
                disabled={deleting === diagnosis.id}
                style={{
                  background: "rgba(192, 57, 43, 0.1)",
                  border:     "1px solid rgba(192, 57, 43, 0.2)",
                  borderRadius: "8px",
                  padding:    "5px 10px",
                  color:      "rgba(255, 100, 100, 0.6)",
                  fontSize:   "12px",
                  cursor:     "pointer",
                  fontFamily: "inherit",
                  flexShrink: 0,
                }}
              >
                {deleting === diagnosis.id ? "..." : "🗑️"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}