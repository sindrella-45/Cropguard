/**
 * Treatment card component for CropGuard AI.
 *
 * Displays a single treatment recommendation
 * with type badge, action title and details.
 *
 * Treatment types:
 *   immediate — urgent actions (orange)
 *   organic   — natural treatments (green)
 *   chemical  — chemical treatments (blue)
 *   preventive — prevention measures (purple)
 */

interface Treatment {
  type:    string;
  action:  string;
  details: string;
}

interface TreatmentCardProps {
  treatment: Treatment;
}

export default function TreatmentCard(
  { treatment }: TreatmentCardProps
) {
  type StyleMap = {
    [key: string]: {
      bg:     string;
      border: string;
      text:   string;
      icon:   string;
    };
  };

  const styles: StyleMap = {
    immediate: {
      bg:     "rgba(230, 126, 34, 0.1)",
      border: "#E67E22",
      text:   "#E67E22",
      icon:   "⚡",
    },
    organic: {
      bg:     "rgba(39, 174, 96, 0.1)",
      border: "#27AE60",
      text:   "#27AE60",
      icon:   "🌿",
    },
    chemical: {
      bg:     "rgba(41, 128, 185, 0.1)",
      border: "#2980B9",
      text:   "#2980B9",
      icon:   "🧪",
    },
    preventive: {
      bg:     "rgba(142, 68, 173, 0.1)",
      border: "#8E44AD",
      text:   "#8E44AD",
      icon:   "🛡️",
    },
  };

  const style = styles[treatment.type] || styles.preventive;

  return (
    <div style={{
      background:   style.bg,
      border:       `1.5px solid ${style.border}`,
      borderRadius: "12px",
      padding:      "14px 16px",
      marginBottom: "10px",
    }}>
      {/* Header */}
      <div style={{
        display:      "flex",
        alignItems:   "center",
        gap:          "8px",
        marginBottom: "8px",
        flexWrap:     "wrap",
      }}>
        <span style={{ fontSize: "16px" }}>
          {style.icon}
        </span>
        <span style={{
          color:         style.text,
          fontWeight:    "700",
          fontSize:      "12px",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          {treatment.type}
        </span>
        <span style={{
          color:      "#F5F0E8",
          fontWeight: "600",
          fontSize:   "14px",
        }}>
          {treatment.action}
        </span>
      </div>

      {/* Details */}
      <p style={{
        color:      "rgba(220, 240, 180, 0.75)",
        fontSize:   "13px",
        lineHeight: "1.6",
        margin:     0,
      }}>
        {treatment.details}
      </p>
    </div>
  );
}