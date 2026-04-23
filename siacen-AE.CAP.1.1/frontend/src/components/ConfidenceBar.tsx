/**
 * Confidence bar component for CropGuard AI.
 *
 * Displays the AI's confidence score as a
 * visual progress bar with color coding.
 *
 * Colors:
 *   90-100% — green  (high confidence)
 *   70-89%  — blue   (good confidence)
 *   50-69%  — yellow (moderate confidence)
 *   0-49%   — red    (low confidence)
 */

interface ConfidenceBarProps {
  score: number;
}

export default function ConfidenceBar(
  { score }: ConfidenceBarProps
) {
  const getColor = (s: number): string => {
    if (s >= 90) return "#27AE60";
    if (s >= 70) return "#2980B9";
    if (s >= 50) return "#E67E22";
    return "#C0392B";
  };

  const getLabel = (s: number): string => {
    if (s >= 90) return "High Confidence";
    if (s >= 70) return "Good Confidence";
    if (s >= 50) return "Moderate Confidence";
    return "Low Confidence";
  };

  const color = getColor(score);

  return (
    <div>
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        marginBottom:   "6px",
      }}>
        <span style={{
          color:    "rgba(180, 200, 140, 0.6)",
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          Confidence
        </span>
        <div style={{
          display:    "flex",
          alignItems: "center",
          gap:        "8px",
        }}>
          <span style={{
            color:      color,
            fontWeight: "700",
            fontSize:   "18px",
          }}>
            {score}%
          </span>
          <span style={{
            color:    color,
            fontSize: "12px",
          }}>
            {getLabel(score)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        background:   "rgba(255, 255, 255, 0.08)",
        borderRadius: "4px",
        height:       "6px",
        overflow:     "hidden",
      }}>
        <div style={{
          width:        `${score}%`,
          height:       "100%",
          background:   color,
          borderRadius: "4px",
          transition:   "width 0.8s ease",
          boxShadow:    `0 0 8px ${color}66`,
        }} />
      </div>
    </div>
  );
}