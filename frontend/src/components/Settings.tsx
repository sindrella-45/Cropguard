/**
 * Settings panel component for CropGuard AI.
 *
 * Allows farmers to configure OpenAI settings
 * including temperature, top-p and frequency penalty.
 *
'* Features:
 *   - Temperature slider (creativity)
 *   - Top-p slider (diversity)
 *   - Frequency penalty slider (repetition)
 *   - Reset to defaults button
 */

"use client";

import { useState } from "react";

export interface ModelSettings {
  temperature:       number;
  top_p:             number;
  frequency_penalty: number;
  max_tokens:        number;
}

interface SettingsProps {
  settings:   ModelSettings;
  onChange:   (settings: ModelSettings) => void;
}

const DEFAULTS: ModelSettings = {
  temperature:       0.3,
  top_p:             1.0,
  frequency_penalty: 0.0,
  max_tokens:        1000,
};

interface SliderConfig {
  key:    keyof ModelSettings;
  label:  string;
  min:    number;
  max:    number;
  step:   number;
  tip:    string;
}

const SLIDERS: SliderConfig[] = [
  {
    key:   "temperature",
    label: "Temperature",
    min:   0,
    max:   2,
    step:  0.1,
    tip:   "Lower = more precise. Higher = more creative.",
  },
  {
    key:   "top_p",
    label: "Top-P",
    min:   0,
    max:   1,
    step:  0.05,
    tip:   "Controls diversity of word choices.",
  },
  {
    key:   "frequency_penalty",
    label: "Frequency Penalty",
    min:   0,
    max:   2,
    step:  0.1,
    tip:   "Higher = less repetition in responses.",
  },
  {
    key:   "max_tokens",
    label: "Max Tokens",
    min:   200,
    max:   2000,
    step:  100,
    tip:   "Maximum length of the AI response.",
  },
];

export default function Settings(
  { settings, onChange }: SettingsProps
) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (
    key: keyof ModelSettings,
    value: number
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const handleReset = () => {
    onChange(DEFAULTS);
  };

  return (
    <div style={{ marginBottom: "16px" }}>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background:   "rgba(255, 255, 255, 0.04)",
          border:       "1px solid rgba(106, 171, 53, 0.2)",
          borderRadius: "10px",
          padding:      "10px 18px",
          color:        "#B4DC78",
          fontSize:     "13px",
          cursor:       "pointer",
          fontFamily:   "inherit",
          width:        "100%",
          textAlign:    "left",
          display:      "flex",
          justifyContent: "space-between",
        }}
      >
        <span>⚙️ Model Settings</span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div style={{
          background:   "rgba(255, 255, 255, 0.03)",
          border:       "1px solid rgba(106, 171, 53, 0.15)",
          borderRadius: "0 0 12px 12px",
          padding:      "18px",
          animation:    "fadeIn 0.2s ease",
        }}>
          {SLIDERS.map(slider => (
            <div
              key={slider.key}
              style={{ marginBottom: "16px" }}
            >
              {/* Label + Value */}
              <div style={{
                display:        "flex",
                justifyContent: "space-between",
                marginBottom:   "6px",
              }}>
                <label style={{
                  color:    "#B4DC78",
                  fontSize: "13px",
                }}>
                  {slider.label}
                </label>
                <span style={{
                  color:      "#6AAB35",
                  fontWeight: "700",
                  fontSize:   "13px",
                }}>
                  {settings[slider.key]}
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={settings[slider.key]}
                onChange={e => handleChange(
                  slider.key,
                  parseFloat(e.target.value)
                )}
                style={{
                  width:  "100%",
                  cursor: "pointer",
                  accentColor: "#6AAB35",
                }}
              />

              {/* Tip */}
              <p style={{
                color:    "rgba(180, 220, 120, 0.4)",
                fontSize: "11px",
                margin:   "4px 0 0",
              }}>
                {slider.tip}
              </p>
            </div>
          ))}

          {/* Reset Button */}
          <button
            onClick={handleReset}
            style={{
              background:   "none",
              border:       "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding:      "7px 14px",
              color:        "rgba(180, 220, 120, 0.5)",
              fontSize:     "12px",
              cursor:       "pointer",
              fontFamily:   "inherit",
            }}
          >
            ↩ Reset to Defaults
          </button>
        </div>
      )}
    </div>
  );
}