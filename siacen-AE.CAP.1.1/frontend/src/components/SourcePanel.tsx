/**
 * Source panel component for CropGuard AI.
 *
 * Displays the RAG sources used to generate
 * the diagnosis for transparency.
 *
 * This:
 *   'Show source references alongside the answer'
 *   'Clearly separate retrieved context from
 *    model-generated answer'
 *
 * Features:
 *   - List of source documents used
 *   - Similarity scores per source
 *   - Expandable chunk text
 *   - Confidence label (High/Medium/Low)
 */


"use client";

import { useState } from "react";

interface Source {
  document_name:    string;
  chunk_id:         string;
  similarity_score: number;
  page_number:      number | null;
  chunk_text:       string | null;
}

interface SourcePanelProps {
  sources: Source[];
}

export default function SourcePanel(
  { sources }: SourcePanelProps
) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!sources || sources.length === 0) {
    return (
      <div style={{
        background:   "rgba(255, 255, 255, 0.03)",
        border:       "1px solid rgba(106, 171, 53, 0.1)",
        borderRadius: "12px",
        padding:      "16px",
        color:        "rgba(180, 220, 120, 0.4)",
        fontSize:     "13px",
        textAlign:    "center",
      }}>
        No database sources used for this diagnosis.
        Based on visual analysis only.
      </div>
    );
  }

  const getConfidenceLabel = (score: number): string => {
    if (score >= 0.8) return "High";
    if (score >= 0.6) return "Medium";
    return "Low";
  };

  const getConfidenceColor = (score: number): string => {
    if (score >= 0.8) return "#27AE60";
    if (score >= 0.6) return "#E67E22";
    return "#C0392B";
  };

  return (
    <div style={{
      background:   "rgba(255, 255, 255, 0.03)",
      border:       "1px solid rgba(106, 171, 53, 0.15)",
      borderRadius: "16px",
      padding:      "20px",
    }}>
      <h4 style={{
        color:         "#6AAB35",
        margin:        "0 0 14px",
        fontSize:      "13px",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        📚 Knowledge Base Sources Used
      </h4>

      <p style={{
        color:        "rgba(180, 220, 120, 0.5)",
        fontSize:     "12px",
        marginBottom: "14px",
      }}>
        The following verified agricultural documents
        were used to ground this diagnosis:
      </p>

      {sources.map((source, index) => {
        const color = getConfidenceColor(
          source.similarity_score
        );
        const label = getConfidenceLabel(
          source.similarity_score
        );
        const isExpanded = expanded === source.chunk_id;

        return (
          <div
            key={source.chunk_id}
            style={{
              background:   "rgba(255, 255, 255, 0.03)",
              border:       "1px solid rgba(106, 171, 53, 0.15)",
              borderRadius: "10px",
              padding:      "12px",
              marginBottom: "8px",
            }}
          >
            {/* Source Header */}
            <div style={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
              flexWrap:       "wrap",
              gap:            "8px",
            }}>
              <div>
                <span style={{
                  color:      "#F5F0E8",
                  fontSize:   "13px",
                  fontWeight: "600",
                }}>
                  {index + 1}. {source.document_name}
                </span>
                {source.page_number && (
                  <span style={{
                    color:      "rgba(180, 220, 120, 0.4)",
                    fontSize:   "12px",
                    marginLeft: "8px",
                  }}>
                    Page {source.page_number}
                  </span>
                )}
              </div>

              <div style={{
                display:    "flex",
                alignItems: "center",
                gap:        "8px",
              }}>
                <span style={{
                  color:      color,
                  fontSize:   "12px",
                  fontWeight: "700",
                }}>
                  {label} Match
                </span>
                <span style={{
                  background:   `${color}22`,
                  color:        color,
                  border:       `1px solid ${color}`,
                  borderRadius: "12px",
                  padding:      "2px 8px",
                  fontSize:     "11px",
                  fontWeight:   "700",
                }}>
                  {(source.similarity_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Expand Button */}
            {source.chunk_text && (
              <button
                onClick={() => setExpanded(
                  isExpanded ? null : source.chunk_id
                )}
                style={{
                  background: "none",
                  border:     "none",
                  color:      "rgba(180, 220, 120, 0.5)",
                  fontSize:   "12px",
                  cursor:     "pointer",
                  padding:    "4px 0 0",
                  fontFamily: "inherit",
                }}
              >
                {isExpanded
                  ? "▲ Hide excerpt"
                  : "▼ Show excerpt"
                }
              </button>
            )}

            {/* Expanded Chunk Text */}
            {isExpanded && source.chunk_text && (
              <div style={{
                background:   "rgba(0, 0, 0, 0.2)",
                border:       "1px solid rgba(106, 171, 53, 0.1)",
                borderRadius: "8px",
                padding:      "10px 12px",
                marginTop:    "8px",
                color:        "rgba(220, 240, 180, 0.6)",
                fontSize:     "12px",
                lineHeight:   "1.6",
                fontStyle:    "italic",
              }}>
                "{source.chunk_text.slice(0, 300)}
                {source.chunk_text.length > 300
                  ? "..."
                  : ""
                }"
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}