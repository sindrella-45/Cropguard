"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/lib/store";
import { diagnoseApi, type AnalyzeResponse } from "@/lib/api";
import { mapSeverity, mapUrgency } from "@/lib/api";
import { Sun, Target, Ruler, Ban, Leaf, Smartphone } from "lucide-react";

type Stage = "upload" | "loading" | "results";
interface ChatMsg { role: "bot" | "user"; text: string; }

const LOADING_MESSAGES = [
  "Analyzing your crop image...",
  "Identifying disease markers...",
  "Calculating severity and urgency...",
  "Preparing treatment recommendations...",
];

export function DiagnoseView() {
  const { addToast, addDiagnosis } = useAppStore();
  const [stage,       setStage]       = useState<Stage>("upload");
  const [dragOver,    setDragOver]    = useState(false);
  const [selectedFile,setSelectedFile]= useState<File | null>(null);
  const [previewUrl,  setPreviewUrl]  = useState<string | null>(null);
  const [progress,    setProgress]    = useState(0);
  const [loadingMsg,  setLoadingMsg]  = useState(LOADING_MESSAGES[0]);
  const [result,      setResult]      = useState<AnalyzeResponse | null>(null);
  const [chat,        setChat]        = useState<ChatMsg[]>([]);
  const [chatInput,   setChatInput]   = useState("");
  const [typing,      setTyping]      = useState(false);

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatRef        = useRef<HTMLDivElement>(null);

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      addToast("Please upload an image file (JPG, PNG)", "error");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    addToast("Image ready — click Diagnose Crop", "success");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // ── Run diagnosis ──────────────────────────────────────────────────────────
  const runDiagnosis = async () => {
    if (!selectedFile) { addToast("Please select an image first", "error"); return; }

    setStage("loading");
    setProgress(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setLoadingMsg(LOADING_MESSAGES[Math.min(step, LOADING_MESSAGES.length - 1)]);
      setProgress(step * 25);
      if (step >= 3) clearInterval(interval);
    }, 900);

    try {
      const data = await diagnoseApi.analyze(selectedFile, {
        personality: "friendly",
        selected_model: "gpt-4o",
      });

      clearInterval(interval);
      setProgress(100);
      setResult(data);

      if (data.diagnosis_id) {
        addDiagnosis({
          id:         data.diagnosis_id,
          crop:       data.diagnosis.plant_identified,
          cropEmoji:  "🌿",
          disease:    data.diagnosis.diagnosis.name,
          severity:   mapSeverity(data.diagnosis.diagnosis.severity),
          confidence: data.diagnosis.confidence_score,
          date:       new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          plantPart:  "Leaf",
          treatments: (data.treatments || data.diagnosis?.treatments || []).map(
            (t: { action: string; details: string }) => `${t.action}: ${t.details}`
          ),
          prevention: data.prevention_tips || data.diagnosis?.prevention_tips || [],
        });
      }

      setChat([{
        role: "bot",
        text: `I've completed the analysis. Your ${data.diagnosis.plant_identified} shows ${data.diagnosis.diagnosis.name} with ${data.diagnosis.diagnosis.severity} severity. ${data.diagnosis.farmer_advice || ""} What would you like to know?`,
      }]);

      setTimeout(() => {
        setStage("results");
        addToast(`Diagnosis complete — ${data.diagnosis.diagnosis.name} detected`, "success");
      }, 500);

    } catch (err: unknown) {
      clearInterval(interval);
      addToast(err instanceof Error ? err.message : "Diagnosis failed", "error");
      setStage("upload");
    }
  };

  // ── Chatbot ────────────────────────────────────────────────────────────────
  const sendChat = async () => {
    const msg = chatInput.trim();
    if (!msg || !result?.session_id) return;
    setChatInput("");
    setChat((prev) => [...prev, { role: "user", text: msg }]);
    setTyping(true);
    try {
      const res = await diagnoseApi.followup(result.session_id, msg);
      setChat((prev) => [...prev, { role: "bot", text: res.answer }]);
    } catch {
      setChat((prev) => [...prev, { role: "bot", text: "I'm having trouble right now. Please try again." }]);
    } finally {
      setTyping(false);
      setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 50);
    }
  };

  const resetDiagnose = () => {
    setStage("upload");
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setChat([]);
    setProgress(0);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-gray-900">Diagnose Crop</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Upload a photo to get real AI-powered disease diagnosis
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ══════════════ UPLOAD STAGE ══════════════ */}
        {stage === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-6 mb-5">
              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />

              {!previewUrl ? (
                /* ── Drop zone ── */
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all duration-200 ${
                    dragOver
                      ? "border-green-500 bg-green-100"
                      : "border-green-300 bg-green-50 hover:border-green-500 hover:bg-green-100"
                  }`}
                >
                  <div className="text-6xl mb-4">📷</div>
                  <div className="font-semibold text-gray-700 mb-2 text-lg">
                    Drop your crop image here
                  </div>
                  <div className="text-sm text-gray-400 mb-8">
                    Supported: JPG, PNG, HEIC · Max 10MB
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      <Upload size={15} /> Upload Image
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                    >
                      <Camera size={15} /> Take Photo
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── Preview ── */
                <div>
                  {/* Full leaf preview — tall, no cropping */}
                  <div
                    className="w-full rounded-2xl mb-5 overflow-hidden bg-gray-50 border-2 border-gray-100 flex items-center justify-center"
                    style={{ minHeight: "340px" }}
                  >
                    <img
                      src={previewUrl}
                      alt="Crop preview"
                      style={{ maxHeight: "460px", width: "100%", objectFit: "contain" }}
                    />
                  </div>

                  {/* File info */}
                  <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl">
                        🌿
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Image Ready</div>
                        <div className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                          {selectedFile?.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl">
                        📊
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Size</div>
                        <div className="text-sm font-semibold text-gray-800">
                          {selectedFile
                            ? (selectedFile.size / 1024 / 1024).toFixed(1) + " MB"
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <Button className="flex-1" size="lg" onClick={runDiagnosis}>
                      🔬 Diagnose Crop
                    </Button>
                    <Button variant="secondary" onClick={resetDiagnose}>
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Photo tips */}
<Card className="p-5">
  <div className="flex items-center gap-2 mb-4">
    <Camera size={16} className="text-green-600" />
    <h3 className="font-semibold text-sm text-gray-800">Photo Tips for Best Results</h3>
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
    {[
      { icon: <Sun size={14} className="text-amber-500" />,        bg: "bg-amber-50",  text: "Use natural daylight for clearest colors" },
      { icon: <Target size={14} className="text-green-600" />,     bg: "bg-green-50",  text: "Focus directly on the diseased area" },
      { icon: <Ruler size={14} className="text-blue-500" />,       bg: "bg-blue-50",   text: "Keep 20–30 cm from the plant" },
      { icon: <Ban size={14} className="text-red-500" />,          bg: "bg-red-50",    text: "Avoid blurry or dark images" },
      { icon: <Leaf size={14} className="text-green-600" />,       bg: "bg-green-50",  text: "Make sure the leaf fills the frame" },
      { icon: <Smartphone size={14} className="text-purple-500" />, bg: "bg-purple-50", text: "Hold the phone flat and steady" },
    ].map(({ icon, bg, text }) => (
      <div key={text} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <span className="text-sm text-gray-600">{text}</span>
      </div>
    ))}
  </div>
</Card>
</motion.div>
        )}

        {/* ══════════════ LOADING STAGE ══════════════ */}
        {stage === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-12 text-center">
              {/* Leaf image while loading */}
              {previewUrl && (
                <div
                  className="w-32 h-32 rounded-2xl overflow-hidden mx-auto mb-6 border-2 border-green-200"
                  style={{ background: "#f0fdf4" }}
                >
                  <img
                    src={previewUrl}
                    alt="Analyzing"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
              )}
              <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mx-auto mb-6" />
              <div className="font-semibold text-gray-800 text-lg mb-1">{loadingMsg}</div>
              <div className="text-sm text-gray-400 mb-8">Real AI analysis in progress...</div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden max-w-sm mx-auto">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {/* ══════════════ RESULTS STAGE ══════════════ */}
        {stage === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* ── Hero result card ── */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-heading font-bold text-xl text-gray-900">
                    Diagnosis Complete
                  </h2>
                  <div className="text-sm text-gray-400 mt-0.5">
                    {new Date().toLocaleString()}
                  </div>
                </div>
                <span
                  className={`text-sm font-medium px-3 py-1.5 rounded-full ${mapUrgency(
                    result.diagnosis.urgency
                  )}`}
                >
                  {result.diagnosis.urgency?.toUpperCase()} URGENCY
                </span>
              </div>

              {/* Uploaded leaf + key stats side by side */}
              <div className="flex flex-col md:flex-row gap-5 mb-6">
                {/* Leaf image */}
                {previewUrl && (
                  <div
                    className="rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0"
                    style={{ width: "180px", height: "180px" }}
                  >
                    <img
                      src={previewUrl}
                      alt="Diagnosed leaf"
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  </div>
                )}

                {/* Key info */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    ["🌿", "Crop", result.diagnosis.plant_identified],
                    ["🦠", "Disease", result.diagnosis.diagnosis.name],
                    ["📊", "Confidence", `${result.diagnosis.confidence_score?.toFixed(1)}%`],
                  ].map(([emoji, lbl, val]) => (
                    <div key={lbl} className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-3xl mb-2">{emoji}</div>
                      <div className="text-xs text-gray-400 mb-0.5">{lbl}</div>
                      <div className="font-semibold text-sm text-gray-800">{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500 font-medium">AI Confidence Score</span>
                  <span className="font-bold text-green-600">
                    {result.diagnosis.confidence_score?.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.diagnosis.confidence_score}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                  />
                </div>
              </div>

              {/* Farmer advice */}
              {result.diagnosis.farmer_advice && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  💡 <strong>Farmer Advice:</strong> {result.diagnosis.farmer_advice}
                </div>
              )}
            </Card>

            {/* ── Disease details ── */}
            <Card className="p-5">
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                Disease Details
              </h4>
              <div className="text-sm text-gray-700 leading-relaxed mb-2">
                {result.diagnosis.diagnosis.description}
              </div>
              {result.diagnosis.diagnosis.scientific_name && (
                <div className="text-xs text-gray-400 italic">
                  Scientific name: {result.diagnosis.diagnosis.scientific_name}
                </div>
              )}
            </Card>

            {/* ── Causes & Symptoms ── */}
            {(result.diagnosis.causes?.length > 0 ||
              result.diagnosis.symptoms?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {result.diagnosis.causes?.length > 0 && (
                  <Card className="p-5">
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                      Causes
                    </h4>
                    <div className="flex flex-col gap-2">
                      {result.diagnosis.causes.map((c, i) => (
                        <div key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0 mt-1.5" />
                          {c}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                {result.diagnosis.symptoms?.length > 0 && (
                  <Card className="p-5">
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                      Symptoms
                    </h4>
                    <div className="flex flex-col gap-2">
                      {result.diagnosis.symptoms.map((s, i) => (
                        <div key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0 mt-1.5" />
                          {s}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* ── Treatments & Prevention ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Treatments */}
              <Card className="p-5">
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
                  Recommended Treatments
                </h4>
                {(result.treatments || result.diagnosis?.treatments || []).length === 0 ? (
                  <div className="text-sm text-gray-400 text-center py-6">
                    No treatments generated — try diagnosing again with a clearer image
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {(result.treatments || result.diagnosis?.treatments || []).map((t, i) => (
                      <div key={i} className="flex gap-2.5 p-3 bg-green-50 rounded-xl">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-800">{t.action}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{t.details}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Prevention */}
              <Card className="p-5">
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
                  Prevention Tips
                </h4>
                {(result.prevention_tips || result.diagnosis?.prevention_tips || []).length === 0 ? (
                  <div className="text-sm text-gray-400 text-center py-6">
                    No prevention tips generated — try diagnosing again with a clearer image
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {(result.prevention_tips || result.diagnosis?.prevention_tips || []).map(
                      (p, i) => (
                        <div key={i} className="flex gap-2.5 p-3 bg-blue-50 rounded-xl text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0 mt-1.5" />
                          {p}
                        </div>
                      )
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* ── Resources ── */}
            {result.resources && result.resources.length > 0 && (
              <Card className="p-5">
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
                  Reading Resources
                </h4>
                <div className="flex flex-col gap-2">
                  {result.resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors no-underline"
                    >
                      <span className="text-lg">📄</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{r.title}</div>
                        <div className="text-xs text-gray-400">{r.source}</div>
                      </div>
                      <span className="text-xs text-green-600 flex-shrink-0">→</span>
                    </a>
                  ))}
                </div>
              </Card>
            )}

            {/* ── Chatbot ── */}
            {result.session_id && (
              <Card className="overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                  <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-lg">
                    🤖
                  </div>
                  <div>
                    <div className="font-semibold text-sm">CropGuard Assistant</div>
                    <div className="text-xs text-green-600">
                      ● Online — Ask anything about this diagnosis
                    </div>
                  </div>
                </div>
                <div
                  ref={chatRef}
                  className="h-64 overflow-y-auto p-4 flex flex-col gap-3"
                >
                  {chat.map((m, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                          m.role === "bot"
                            ? "bg-green-100"
                            : "bg-green-600 text-white font-semibold"
                        }`}
                      >
                        {m.role === "bot" ? "🤖" : "👤"}
                      </div>
                      <div
                        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          m.role === "bot"
                            ? "bg-gray-100 text-gray-800 rounded-tl-sm"
                            : "bg-green-600 text-white rounded-tr-sm"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {typing && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs">
                        🤖
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="typing-dot"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-100 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChat()}
                    placeholder="Ask about treatments, prevention, or this disease..."
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 placeholder:text-gray-400"
                  />
                  <Button size="sm" onClick={sendChat}>
                    <Send size={14} />
                  </Button>
                </div>
              </Card>
            )}

            {/* ── Bottom actions ── */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => addToast("Opening feedback...", "info")}
              >
                ⭐ Rate This Diagnosis
              </Button>
              <Button className="flex-1" onClick={resetDiagnose}>
                + New Diagnosis
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
