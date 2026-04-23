/**
 * Model selector component for CropGuard AI.
 *
 * Allows farmers to choose which LLM to use
 * for their diagnosis.
 *
 
 *
 * Only shows models whose API keys are configured
 * in the backend .env file.
 */

"use client";

import { useState, useEffect } from "react";
import { getAvailableModels, LLMModel } from "@/services/api";

interface ModelSelectorProps {
  selected:   string;
  onSelect:   (modelId: string) => void;
}

export default function ModelSelector(
  { selected, onSelect }: ModelSelectorProps
) {
  const [models,  setModels]  = useState<LLMModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAvailableModels()
      .then(data => setModels(data.models))
      .catch(() => {
        // Fallback to GPT-4o only
        setModels([{
          id:              "gpt-4o",
          name:            "GPT-4o",
          provider:        "OpenAI",
          description:     "Best overall performance.",
          supports_vision: true,
          recommended:     true,
        }]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  // Group models by provider
const grouped = models.reduce(
  (acc: Record<string, LLMModel[]>, model: LLMModel) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, LLMModel[]>
);

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{
        color:        "rgba(180, 220, 120, 0.6)",
        fontSize:     "12px",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        display:      "block",
        marginBottom: "8px",
      }}>
        🤖 AI Model
      </label>

      <div style={{
        display:  "flex",
        gap:      "8px",
        flexWrap: "wrap",
      }}>
        {models.map(model => (
          <button
            key={model.id}
            onClick={() => onSelect(model.id)}
            style={{
              background:   selected === model.id
                ? "rgba(106, 171, 53, 0.2)"
                : "rgba(255, 255, 255, 0.04)",
              border:       selected === model.id
                ? "1.5px solid #6AAB35"
                : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              padding:      "8px 14px",
              cursor:       "pointer",
              fontFamily:   "inherit",
              textAlign:    "left",
              transition:   "all 0.15s ease",
            }}
          >
            <div style={{
              color:      selected === model.id
                ? "#6AAB35"
                : "#F5F0E8",
              fontSize:   "13px",
              fontWeight: "600",
            }}>
              {model.name}
              {model.recommended && (
                <span style={{
                  background:   "rgba(106, 171, 53, 0.2)",
                  color:        "#6AAB35",
                  borderRadius: "8px",
                  padding:      "1px 6px",
                  fontSize:     "10px",
                  marginLeft:   "6px",
                }}>
                  Recommended
                </span>
              )}
            </div>
            <div style={{
              color:    "rgba(180, 220, 120, 0.4)",
              fontSize: "11px",
              marginTop: "2px",
            }}>
              {model.provider}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}