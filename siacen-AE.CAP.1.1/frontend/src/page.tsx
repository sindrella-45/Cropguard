/**
 * Home page for CropGuard AI.
 *
 * The main page where farmers upload leaf photos
 * and receive disease diagnoses.
 *
 * Page flow:
 *   1. Show upload area + settings
 *   2. Farmer uploads photo
 *   3. Show analyze button + preview
 *   4. Run analysis
 *   5. Show results
 *   6. Option to analyze another
 */

"use client";

import { useState } from "react";
import Navbar              from "@/components/Navbar";
import Upload              from "@/components/Upload";
import Results             from "@/components/Results";
import Settings, { ModelSettings } from "@/components/Settings";
import ModelSelector       from "@/components/ModelSelector";
import PersonalitySelector from "@/components/PersonalitySelector";
import HelpChatbot         from "@/components/HelpChatbot";
import { analyzeLeaf, AnalyzeResponse } from "@/services/api";

export default function HomePage() {
  // Image state
  const [imageData,    setImageData]    = useState<string | null>(null);
  const [imageType,    setImageType]    = useState("image/jpeg");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Settings state
  const [personality, setPersonality] = useState("friendly");
  const [model,       setModel]       = useState("gpt-4o");
  const [plantType,   setPlantType]   = useState("");
  const [settings,    setSettings]    = useState<ModelSettings>({
    temperature:       0.3,
    top_p:             1.0,
    frequency_penalty: 0.0,
    max_tokens:        1000,
  });

  // Analysis state
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<AnalyzeResponse | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const handleImageReady = (
    data:    string,
    type:    string,
    preview: string
  ) => {
    setImageData(data);
    setImageType(type);
    setImagePreview(preview);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!imageData) return;

    setLoading(true);
    setError(null);

    try {
      const response = await analyzeLeaf({
        image_data:     imageData,
        image_type:     imageType,
        plant_type:     plantType || undefined,
        personality,
        selected_model: model,
      });
      setResult(response);
    } catch (err: any) {
      setError(
        err.message ||
        "Analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageData(null);
    setImageType("image/jpeg");
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />

      <main style={{
        maxWidth: "800px",
        margin:   "0 auto",
        padding:  "40px 24px 80px",
      }}>

        {/* Hero */}
        {!result && (
          <div style={{
            textAlign:    "center",
            marginBottom: "40px",
          }}>
            <h2 style={{
              color:       "#F5F0E8",
              fontSize:    "clamp(26px, 5vw, 44px)",
              fontWeight:  "700",
              margin:      "0 0 14px",
              fontFamily:  "Georgia, serif",
              textShadow:  "0 2px 20px rgba(0,0,0,0.5)",
            }}>
              Protect Your Harvest
            </h2>
            <p style={{
              color:     "rgba(220, 240, 180, 0.65)",
              fontSize:  "17px",
              maxWidth:  "500px",
              margin:    "0 auto",
              lineHeight: "1.6",
            }}>
              Upload a photo of your plant&apos;s leaf.
              Our AI detects diseases instantly and
              suggests the best treatments.
            </p>
          </div>
        )}

        {/* Results View */}
        {result && imagePreview ? (
          <Results
            result={result}
            imagePreview={imagePreview}
            onReset={handleReset}
          />
        ) : (
          <>
            {/* Upload Area */}
            <Upload onImageReady={handleImageReady} />

            {/* Image Preview + Controls */}
            {imageData && imagePreview && (
              <div
                className="fade-in"
                style={{ marginTop: "20px" }}
              >
                {/* Preview */}
                <div style={{
                  textAlign:    "center",
                  marginBottom: "20px",
                }}>
                  <img
                    src={imagePreview}
                    alt="Leaf preview"
                    style={{
                      maxHeight:    "280px",
                      maxWidth:     "100%",
                      borderRadius: "12px",
                      boxShadow:    "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                  />
                  <p style={{
                    color:     "rgba(180, 220, 120, 0.6)",
                    fontSize:  "13px",
                    marginTop: "8px",
                  }}>
                    ✓ Image ready for analysis
                  </p>
                </div>

                {/* Plant Type Hint */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{
                    color:         "rgba(180, 220, 120, 0.6)",
                    fontSize:      "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    display:       "block",
                    marginBottom:  "6px",
                  }}>
                    🌱 Plant Type (optional)
                  </label>
                  <input
                    type="text"
                    value={plantType}
                    onChange={e => setPlantType(e.target.value)}
                    placeholder="e.g. tomato, maize, potato..."
                    className="input"
                  />
                </div>

                {/* Personality Selector */}
                <PersonalitySelector
                  selected={personality}
                  onSelect={setPersonality}
                />

                {/* Model Selector */}
                <ModelSelector
                  selected={model}
                  onSelect={setModel}
                />

                {/* Settings */}
                <Settings
                  settings={settings}
                  onChange={setSettings}
                />

                {/* Error */}
                {error && (
                  <div style={{
                    background:   "rgba(192, 57, 43, 0.1)",
                    border:       "1.5px solid rgba(192, 57, 43, 0.4)",
                    borderRadius: "10px",
                    padding:      "12px 16px",
                    marginBottom: "14px",
                    color:        "#FFAAAA",
                    fontSize:     "14px",
                  }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{
                  display: "flex",
                  gap:     "12px",
                }}>
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="btn-primary"
                    style={{ flex: 1 }}
                  >
                    {loading
                      ? "🔬 Analyzing..."
                      : "🔍 Analyze Leaf"
                    }
                  </button>
                  <button
                    onClick={handleReset}
                    className="btn-secondary"
                  >
                    ↩ Change
                  </button>
                </div>

                {/* Loading State */}
                {loading && (
                  <div style={{
                    textAlign:  "center",
                    padding:    "32px",
                    marginTop:  "20px",
                  }}>
                    <div style={{
                      width:        "48px",
                      height:       "48px",
                      borderRadius: "50%",
                      border:       "3px solid rgba(106, 171, 53, 0.2)",
                      borderTop:    "3px solid #6AAB35",
                      margin:       "0 auto 16px",
                      animation:    "spin 1s linear infinite",
                    }} />
                    <p style={{
                      color:    "#B4DC78",
                      fontSize: "14px",
                    }}>
                      Analyzing your plant...
                    </p>
                    <p style={{
                      color:    "rgba(180, 220, 120, 0.4)",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}>
                      Examining symptoms, searching disease
                      database and generating diagnosis
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* How It Works */}
            {!imageData && (
              <div style={{ marginTop: "56px" }}>
                <h3 style={{
                  color:         "rgba(180, 220, 120, 0.4)",
                  textAlign:     "center",
                  fontSize:      "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  marginBottom:  "24px",
                }}>
                  How It Works
                </h3>
                <div style={{
                  display:             "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap:                 "14px",
                }}>
                  {[
                    {
                      icon:  "📸",
                      step:  "1",
                      title: "Upload Photo",
                      desc:  "Take a clear photo of an affected leaf",
                    },
                    {
                      icon:  "🔬",
                      step:  "2",
                      title: "AI Analysis",
                      desc:  "Our agent examines patterns and texture",
                    },
                    {
                      icon:  "💊",
                      step:  "3",
                      title: "Get Diagnosis",
                      desc:  "Receive disease ID with confidence score",
                    },
                    {
                      icon:  "🌾",
                      step:  "4",
                      title: "Take Action",
                      desc:  "Follow tailored treatment advice",
                    },
                  ].map(item => (
                    <div key={item.step} className="card" style={{
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: "28px", marginBottom: "10px" }}>
                        {item.icon}
                      </div>
                      <h4 style={{
                        color:      "#F5F0E8",
                        margin:     "0 0 6px",
                        fontSize:   "14px",
                        fontFamily: "Georgia, serif",
                      }}>
                        {item.title}
                      </h4>
                      <p style={{
                        color:    "rgba(180, 220, 120, 0.45)",
                        margin:   0,
                        fontSize: "12px",
                        lineHeight: "1.5",
                      }}>
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Help Chatbot */}
      <HelpChatbot />
    </div>
  );
}