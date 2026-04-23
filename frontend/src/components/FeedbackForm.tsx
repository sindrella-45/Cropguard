"use client";

// frontend/src/components/FeedbackForm.tsx
// Fixed: diagnosisId prop is now correctly used in the submitFeedback call.
// Fixed: was_accurate sent as boolean (not null).
// Fixed: clear error messages and disabled state during submission.

import { useState } from "react";
import { submitFeedback } from "@/services/api";

interface FeedbackFormProps {
  diagnosisId: string;   // passed from Results.tsx as result.diagnosis_id || result.session_id
  onSubmitted: () => void;
}

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function FeedbackForm({ diagnosisId, onSubmitted }: FeedbackFormProps) {
  const [rating,      setRating]      = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment,     setComment]     = useState("");
  const [wasAccurate, setWasAccurate] = useState<boolean | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a star rating before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Get user from localStorage — falls back to "anonymous" if not logged in
      let userId = "anonymous";
      const stored = localStorage.getItem("cropguard_user");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          userId = user.id || user.user_id || "anonymous";
        } catch {
          // ignore parse errors
        }
      }

      await submitFeedback({
        diagnosis_id: diagnosisId,   // ✅ correctly uses the prop
        user_id:      userId,
        rating,
        comment:      comment.trim() || undefined,
        was_accurate: wasAccurate !== null ? wasAccurate : undefined,
      });

      onSubmitted();
    } catch (err: any) {
      setError(
        err?.message ||
        "Failed to submit feedback. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      background:   "rgba(255, 255, 255, 0.03)",
      border:       "1px solid rgba(106, 171, 53, 0.15)",
      borderRadius: "12px",
      padding:      "18px",
    }}>
      <h4 style={{
        color:      "#F5F0E8",
        margin:     "0 0 14px",
        fontSize:   "15px",
        fontFamily: "Georgia, serif",
      }}>
        How accurate was this diagnosis?
      </h4>

      {/* Star Rating */}
      <div style={{ display: "flex", gap: "4px", alignItems: "center", marginBottom: "14px" }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            style={{
              background: "none",
              border:     "none",
              fontSize:   "28px",
              cursor:     "pointer",
              opacity:    star <= (hoveredStar || rating) ? 1 : 0.25,
              transform:  star <= (hoveredStar || rating) ? "scale(1.15)" : "scale(1)",
              transition: "all 0.15s ease",
              padding:    "2px",
            }}
          >
            ⭐
          </button>
        ))}
        {rating > 0 && (
          <span style={{ color: "#B4DC78", fontSize: "13px", marginLeft: "6px" }}>
            {STAR_LABELS[rating]}
          </span>
        )}
      </div>

      {/* Was it accurate? */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
        <span style={{ color: "rgba(180, 220, 120, 0.6)", fontSize: "13px" }}>
          Was it accurate?
        </span>
        {[
          { label: "✅ Yes", value: true  },
          { label: "❌ No",  value: false },
        ].map(opt => (
          <button
            key={opt.label}
            onClick={() => setWasAccurate(opt.value)}
            style={{
              background:   wasAccurate === opt.value
                ? "rgba(106, 171, 53, 0.2)"
                : "rgba(255, 255, 255, 0.04)",
              border:       wasAccurate === opt.value
                ? "1px solid #6AAB35"
                : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding:      "5px 12px",
              color:        "#F5F0E8",
              fontSize:     "13px",
              cursor:       "pointer",
              fontFamily:   "inherit",
              transition:   "all 0.15s ease",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Optional comment */}
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Optional: what was helpful or what could be improved?"
        rows={2}
        style={{
          background:   "rgba(255, 255, 255, 0.05)",
          border:       "1px solid rgba(74, 122, 40, 0.3)",
          borderRadius: "8px",
          padding:      "10px 12px",
          color:        "#F5F0E8",
          fontSize:     "13px",
          fontFamily:   "Georgia, serif",
          width:        "100%",
          resize:       "vertical",
          outline:      "none",
          marginBottom: "12px",
          boxSizing:    "border-box" as const,
        }}
      />

      {/* Error message */}
      {error && (
        <p style={{
          color:        "#FFAAAA",
          fontSize:     "13px",
          marginBottom: "10px",
          margin:       "0 0 10px",
        }}>
          ⚠️ {error}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          background:   submitting
            ? "rgba(106, 171, 53, 0.3)"
            : "linear-gradient(135deg, #6AAB35, #4A7C2F)",
          color:        "white",
          border:       "none",
          borderRadius: "10px",
          padding:      "11px 0",
          fontSize:     "14px",
          fontWeight:   "700",
          cursor:       submitting ? "not-allowed" : "pointer",
          fontFamily:   "inherit",
          width:        "100%",
          transition:   "all 0.2s ease",
        }}
      >
        {submitting ? "Submitting..." : "Submit Feedback"}
      </button>
    </div>
  );
}
