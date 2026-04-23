// frontend/src/components/Results.tsx
/**
 * Results component for CropGuard AI.
 *
 * IMPROVEMENTS:
 * - Added FollowUpChat component below results
 * - Full responsive layout (mobile / tablet / desktop)
 * - Fixed diagnosisId to use result.diagnosis_id (not session_id)
 */

"use client";

import { useState } from "react";
import TreatmentCard      from "./TreatmentCard";
import SourcePanel        from "./SourcePanel";
import ConfidenceBar      from "./ConfidenceBar";
import FeedbackForm       from "./FeedbackForm";
import FollowUpChat       from "./FollowUpChat";
import { AnalyzeResponse } from "@/services/api";

interface ResultsProps {
  result:       AnalyzeResponse;
  imagePreview: string;
  onReset:      () => void;
  personality:  string;
}

export default function Results(
  { result, imagePreview, onReset, personality }: ResultsProps
) {
  const [showSources,  setShowSources]  = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);

  const { diagnosis } = result;
  if (!diagnosis) return null;

  const isHealthy = diagnosis.health_status === "healthy";

  const healthColors: Record<string, string> = {
    healthy:   "#27AE60",
    diseased:  "#C0392B",
    stressed:  "#E67E22",
    uncertain: "#7F8C8D",
  };

  const severityColors: Record<string, string> = {
    none:     "#27AE60",
    mild:     "#2980B9",
    moderate: "#E67E22",
    severe:   "#C0392B",
  };

  const urgencyColors: Record<string, string> = {
    low:      "#27AE60",
    medium:   "#E67E22",
    high:     "#E74C3C",
    critical: "#C0392B",
  };

  const healthColor = healthColors[diagnosis.health_status] || "#7F8C8D";

  return (
    <div className="fade-in">

      {/* ── Header Card ─────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{
          display:    "flex",
          gap:        "16px",
          flexWrap:   "wrap",
          alignItems: "flex-start",
        }}>

          {/* Image Thumbnail — hidden on very small screens */}
          <img
            src={imagePreview}
            alt="Analyzed leaf"
            style={{
              width:        "clamp(70px, 15vw, 100px)",
              height:       "clamp(70px, 15vw, 100px)",
              objectFit:    "cover",
              borderRadius: "10px",
              flexShrink:   0,
              boxShadow:    "0 4px 16px rgba(0,0,0,0.3)",
            }}
          />

          {/* Diagnosis Info */}
          <div style={{ flex: 1, minWidth: "180px" }}>

            {/* Plant + Status badges */}
            <div style={{
              display:      "flex",
              alignItems:   "center",
              gap:          "8px",
              flexWrap:     "wrap",
              marginBottom: "6px",
            }}>
              <h2 style={{
                color:      "#F5F0E8",
                margin:     0,
                fontSize:   "clamp(16px, 4vw, 22px)",
                fontFamily: "Georgia, serif",
              }}>
                {diagnosis.plant_identified}
              </h2>
              <span style={{
                background:    `${healthColor}22`,
                color:         healthColor,
                border:        `1.5px solid ${healthColor}`,
                borderRadius:  "20px",
                padding:       "2px 10px",
                fontSize:      "11px",
                fontWeight:    "700",
                textTransform: "capitalize",
                whiteSpace:    "nowrap",
              }}>
                {isHealthy ? "✅ " : "🚨 "}{diagnosis.health_status}
              </span>
            </div>

            {/* Disease Name */}
            <h3 style={{
              color:      "#FFD080",
              margin:     "0 0 6px",
              fontSize:   "clamp(14px, 3.5vw, 17px)",
              fontFamily: "Georgia, serif",
            }}>
              {diagnosis.diagnosis.name}
              {diagnosis.diagnosis.scientific_name && (
                <em style={{
                  color:     "rgba(255, 200, 100, 0.5)",
                  fontSize:  "12px",
                  marginLeft: "8px",
                }}>
                  ({diagnosis.diagnosis.scientific_name})
                </em>
              )}
            </h3>

            <p style={{
              color:      "rgba(220, 240, 180, 0.7)",
              fontSize:   "13px",
              lineHeight: "1.5",
              margin:     "0 0 12px",
            }}>
              {diagnosis.diagnosis.description}
            </p>

            {/* Stats Row */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>

              <div>
                <div style={{
                  color:         "rgba(180, 200, 140, 0.5)",
                  fontSize:      "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom:  "3px",
                }}>
                  Severity
                </div>
                <span style={{
                  background:    `${severityColors[diagnosis.diagnosis.severity] || "#7F8C8D"}22`,
                  color:         severityColors[diagnosis.diagnosis.severity] || "#7F8C8D",
                  border:        `1.5px solid ${severityColors[diagnosis.diagnosis.severity] || "#7F8C8D"}`,
                  borderRadius:  "20px",
                  padding:       "2px 10px",
                  fontSize:      "11px",
                  fontWeight:    "700",
                  textTransform: "capitalize",
                }}>
                  {diagnosis.diagnosis.severity}
                </span>
              </div>

              <div>
                <div style={{
                  color:         "rgba(180, 200, 140, 0.5)",
                  fontSize:      "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom:  "3px",
                }}>
                  Urgency
                </div>
                <span style={{
                  color:         urgencyColors[diagnosis.urgency] || "#7F8C8D",
                  fontWeight:    "700",
                  fontSize:      "13px",
                  textTransform: "capitalize",
                }}>
                  {diagnosis.urgency}
                </span>
              </div>

              <div style={{ flex: 1, minWidth: "140px" }}>
                <ConfidenceBar score={diagnosis.confidence_score} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Farmer Advice ───────────────────────────────────── */}
      <div style={{
        background:   "rgba(212, 160, 23, 0.08)",
        border:       "1.5px solid rgba(212, 160, 23, 0.25)",
        borderRadius: "12px",
        padding:      "12px 16px",
        marginBottom: "14px",
        display:      "flex",
        gap:          "10px",
        alignItems:   "center",
      }}>
        <span style={{ fontSize: "22px", flexShrink: 0 }}>👨‍🌾</span>
        <p style={{
          color:      "#FFD080",
          margin:     0,
          fontSize:   "13px",
          fontStyle:  "italic",
          lineHeight: "1.5",
        }}>
          "{diagnosis.farmer_advice}"
        </p>
      </div>

      {/* ── Causes + Symptoms Grid ──────────────────────────── */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap:                 "12px",
        marginBottom:        "12px",
      }}>
        {diagnosis.causes.length > 0 && (
          <div className="card">
            <h4 style={{ color: "#6AAB35", margin: "0 0 10px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              🔬 Causes
            </h4>
            {diagnosis.causes.map((cause, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
                <span style={{ color: "#E67E22", fontSize: "11px", marginTop: "3px", flexShrink: 0 }}>▸</span>
                <span style={{ color: "rgba(220, 240, 180, 0.8)", fontSize: "13px", lineHeight: "1.5" }}>
                  {cause}
                </span>
              </div>
            ))}
          </div>
        )}

        {diagnosis.symptoms.length > 0 && (
          <div className="card">
            <h4 style={{ color: "#6AAB35", margin: "0 0 10px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              🩺 Symptoms
            </h4>
            {diagnosis.symptoms.map((symptom, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
                <span style={{ color: "#C0392B", fontSize: "10px", marginTop: "4px", flexShrink: 0 }}>●</span>
                <span style={{ color: "rgba(220, 240, 180, 0.8)", fontSize: "13px", lineHeight: "1.5" }}>
                  {symptom}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Treatments ─────────────────────────────────────── */}
      {result.treatments && result.treatments.length > 0 && (
        <div className="card" style={{ marginBottom: "12px" }}>
          <h4 style={{ color: "#6AAB35", margin: "0 0 12px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            💊 Recommended Treatments
          </h4>
          {result.treatments.map((treatment, i) => (
            <TreatmentCard key={i} treatment={treatment} />
          ))}
        </div>
      )}

      {/* ── Prevention Tips ────────────────────────────────── */}
      {(result.prevention_tips?.length > 0 || diagnosis.prevention_tips?.length > 0) && (
        <div style={{
          background:   "rgba(39, 174, 96, 0.06)",
          border:       "1px solid rgba(39, 174, 96, 0.2)",
          borderRadius: "12px",
          padding:      "16px",
          marginBottom: "12px",
        }}>
          <h4 style={{ color: "#27AE60", margin: "0 0 10px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🛡️ Prevention Tips
          </h4>
          <div style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap:                 "8px",
          }}>
            {(result.prevention_tips?.length > 0 ? result.prevention_tips : diagnosis.prevention_tips).map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                <span style={{ color: "#27AE60", fontSize: "14px", flexShrink: 0 }}>✓</span>
                <span style={{ color: "rgba(180, 240, 160, 0.8)", fontSize: "13px", lineHeight: "1.5" }}>
                  {tip}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sources ────────────────────────────────────────── */}
      <div style={{ marginBottom: "12px" }}>
        <button
          onClick={() => setShowSources(!showSources)}
          style={{
            background:   "rgba(255, 255, 255, 0.04)",
            border:       "1px solid rgba(106, 171, 53, 0.2)",
            borderRadius: "10px",
            padding:      "10px 16px",
            color:        "#B4DC78",
            fontSize:     "13px",
            cursor:       "pointer",
            fontFamily:   "inherit",
            width:        "100%",
            textAlign:    "left",
          }}
        >
          {showSources ? "▲" : "▼"} Knowledge Base Sources ({result.sources?.length || 0} used)
        </button>
        {showSources && (
          <div style={{ marginTop: "8px" }}>
            <SourcePanel sources={result.sources || []} />
          </div>
        )}
      </div>

      {/* ── Token Usage ─────────────────────────────────────── */}
      {result.tokens_used > 0 && (
        <div style={{
          display:      "flex",
          gap:          "14px",
          flexWrap:     "wrap",
          marginBottom: "14px",
          padding:      "8px 14px",
          background:   "rgba(255, 255, 255, 0.02)",
          border:       "1px solid rgba(106, 171, 53, 0.1)",
          borderRadius: "10px",
        }}>
          <span style={{ color: "rgba(180, 220, 120, 0.4)", fontSize: "12px" }}>
            🔢 {result.tokens_used} tokens
          </span>
          <span style={{ color: "rgba(180, 220, 120, 0.4)", fontSize: "12px" }}>
            💰 ${result.cost_usd?.toFixed(4)}
          </span>
          <span style={{ color: "rgba(180, 220, 120, 0.4)", fontSize: "12px" }}>
            🤖 {result.model_used}
          </span>
        </div>
      )}

      {/* ── Follow-Up Chat ──────────────────────────────────── */}
      <div style={{ marginBottom: "14px" }}>
        {!showFollowUp ? (
          <button
            onClick={() => setShowFollowUp(true)}
            style={{
              background:   "rgba(41, 128, 185, 0.08)",
              border:       "1px solid rgba(41, 128, 185, 0.25)",
              borderRadius: "10px",
              padding:      "12px 18px",
              color:        "#5DADE2",
              fontSize:     "13px",
              cursor:       "pointer",
              fontFamily:   "inherit",
              width:        "100%",
              textAlign:    "left",
              display:      "flex",
              alignItems:   "center",
              gap:          "8px",
            }}
          >
            <span>💬</span>
            <span>Ask a follow-up question about this diagnosis</span>
          </button>
        ) : (
          <FollowUpChat
            sessionId={result.session_id || ""}
            diseaseName={diagnosis.diagnosis.name}
            plantName={diagnosis.plant_identified}
            personality={personality}
          />
        )}
      </div>

      {/* ── Feedback ────────────────────────────────────────── */}
      {!feedbackDone ? (
        <div style={{ marginBottom: "14px" }}>
          {!showFeedback ? (
            <button
              onClick={() => setShowFeedback(true)}
              style={{
                background:   "none",
                border:       "1px solid rgba(106, 171, 53, 0.2)",
                borderRadius: "10px",
                padding:      "10px 16px",
                color:        "rgba(180, 220, 120, 0.5)",
                fontSize:     "13px",
                cursor:       "pointer",
                fontFamily:   "inherit",
                width:        "100%",
              }}
            >
              ⭐ Rate this diagnosis
            </button>
          ) : (
            <FeedbackForm
              diagnosisId={result.diagnosis_id || result.session_id || ""}
              onSubmitted={() => setFeedbackDone(true)}
            />
          )}
        </div>
      ) : (
        <div style={{
          textAlign:    "center",
          padding:      "10px",
          color:        "#27AE60",
          fontSize:     "14px",
          marginBottom: "14px",
        }}>
          ✅ Thank you for your feedback!
        </div>
      )}

      {/* ── Reset Button ────────────────────────────────────── */}
      <div style={{ textAlign: "center" }}>
        <button onClick={onReset} className="btn-primary">
          🌿 Analyze Another Leaf
        </button>
      </div>
    </div>
  );
}
