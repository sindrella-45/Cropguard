"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { dashboardApi } from "@/lib/api";

// Static guides — enriched with real disease data from your backend history
const STATIC_GUIDES = [
  {
    key: "tomato",
    icon: "🍅",
    title: "Tomato Disease Guide",
    desc: "Covers Late Blight, Early Blight, Mosaic Virus, Bacterial Spot, and 20 more common tomato diseases detected in East Africa.",
    diseases: ["Late Blight", "Early Blight", "Mosaic Virus", "Bacterial Spot", "Leaf Curl"],
    tips: ["Water at the base of plants", "Remove infected leaves immediately", "Rotate with non-solanaceous crops"],
  },
  {
    key: "maize",
    icon: "🌽",
    title: "Maize Pest & Disease",
    desc: "Identify Fall Armyworm, Maize Streak Virus, Grey Leaf Spot, and other common threats to your maize crop.",
    diseases: ["Fall Armyworm", "Maize Streak Virus", "Grey Leaf Spot", "Stalk Rot", "Ear Rot"],
    tips: ["Scout fields weekly", "Apply emamectin benzoate for armyworm", "Intercrop with legumes"],
  },
  {
    key: "coffee",
    icon: "☕",
    title: "Coffee Leaf Diseases",
    desc: "Detect Coffee Leaf Rust, Coffee Wilt Disease, and CBD (Coffee Berry Disease) before they spread.",
    diseases: ["Leaf Rust", "Coffee Wilt", "Berry Disease", "Anthracnose"],
    tips: ["Maintain proper shade coverage", "Prune for air circulation", "Apply copper fungicide preventively"],
  },
  {
    key: "banana",
    icon: "🍌",
    title: "Banana Wilt & Pests",
    desc: "Guide to Xanthomonas Wilt, Fusarium Wilt (Panama Disease), and banana weevil management.",
    diseases: ["Xanthomonas Wilt", "Fusarium Wilt", "Black Sigatoka", "Banana Weevil"],
    tips: ["Use clean planting material", "Debudding with sterile knife", "Remove male buds after last hand"],
  },
  {
    key: "ipm",
    icon: "🌱",
    title: "Integrated Pest Management",
    desc: "Learn sustainable, low-cost approaches to managing crop diseases using IPM principles.",
    diseases: [],
    tips: ["Combine biological, cultural, and chemical controls", "Monitor pest thresholds", "Preserve natural enemies"],
  },
  {
    key: "organic",
    icon: "🌿",
    title: "Organic Treatments",
    desc: "Natural and organic remedies for common crop diseases — safe for families and the environment.",
    diseases: [],
    tips: ["Neem oil for fungal diseases", "Copper sulfate (Bordeaux mixture)", "Baking soda solution for powdery mildew"],
  },
];

const photoTips = [
  { icon: "☀️", tip: "Use natural daylight — avoid artificial light which can alter colors" },
  { icon: "🎯", tip: "Focus directly on the symptoms — ensure the affected area is clear and centered" },
  { icon: "📏", tip: "Keep 20–30 cm distance from the plant for best detail" },
  { icon: "🚫", tip: "Avoid blurry, dark, or overexposed photos — retake if unsure" },
  { icon: "🍃", tip: "Photograph multiple affected leaves when symptoms are widespread" },
  { icon: "🌿", tip: "Include a mix of healthy and affected tissue in one photo when possible" },
];

export function GuidesView() {
  const { addToast, diagnoses } = useAppStore();
  const [selectedGuide, setSelectedGuide] = useState<typeof STATIC_GUIDES[0] | null>(null);
  const [yourDiseases, setYourDiseases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        // Get real diseases from user's own history to personalise guides
        const hist = await dashboardApi.getHistory(50);
        const seen = Array.from(new Set(
          hist.diagnoses
            .map((d) => d.disease_name)
            .filter((n) => n && n !== "Healthy")
        ));
        setYourDiseases(seen);
      } catch {
        // Fall back to local store
        const seen = Array.from(new Set(
          diagnoses
            .map((d) => d.disease)
            .filter((n) => n && n !== "Healthy")
        ));
        setYourDiseases(seen);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark guides that contain diseases from the user's real history
  const enrichedGuides = STATIC_GUIDES.map((g) => ({
    ...g,
    hasYourDisease: g.diseases.some((d) =>
      yourDiseases.some((yd) => yd.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(yd.toLowerCase()))
    ),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-gray-900">Crop Guides</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Learn how to use CropGuard AI and manage crop diseases
        </p>
      </div>

      {/* Personalised alert — based on real diagnosis history */}
      {!loading && yourDiseases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 flex gap-3"
        >
          <span className="text-2xl flex-shrink-0">📋</span>
          <div>
            <div className="font-semibold text-amber-800 text-sm mb-1">Guides Recommended for Your Farm</div>
            <div className="text-sm text-amber-700">
              Based on your diagnosis history, we recommend reading the guides for:{" "}
              <strong>{yourDiseases.slice(0, 3).join(", ")}</strong>
              {yourDiseases.length > 3 && ` and ${yourDiseases.length - 3} more`}.
            </div>
          </div>
        </motion.div>
      )}

      {/* Photo tips */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">📸 Photo Tips for Best Accuracy</h3>
        <div className="flex flex-col gap-2.5">
          {photoTips.map((t, i) => (
            <motion.div
              key={t.tip}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-700"
            >
              <span className="text-lg flex-shrink-0">{t.icon}</span>
              {t.tip}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Guides grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {enrichedGuides.map((g, i) => (
          <motion.div
            key={g.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className={`p-6 h-full flex flex-col cursor-pointer hover:border-green-300 hover:shadow-md transition-all ${g.hasYourDisease ? "border-amber-300 bg-amber-50/30" : ""}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{g.icon}</div>
                {g.hasYourDisease && (
                  <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    ⚠️ Your farm
                  </span>
                )}
              </div>
              <div className="font-semibold text-gray-800 mb-2">{g.title}</div>
              <div className="text-sm text-gray-500 leading-relaxed flex-1">{g.desc}</div>

              {/* Show diseases from user's history that match this guide */}
              {g.hasYourDisease && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {g.diseases
                    .filter((d) => yourDiseases.some((yd) =>
                      yd.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(yd.toLowerCase())
                    ))
                    .map((d) => (
                      <span key={d} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                        {d} detected
                      </span>
                    ))
                  }
                </div>
              )}

              <Button
                size="sm"
                variant={g.hasYourDisease ? "primary" : "secondary"}
                className="mt-4 w-full"
                onClick={() => setSelectedGuide(g)}
              >
                {g.hasYourDisease ? "Read Now ⚠️" : "Read Guide"}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Guide modal */}
      <AnimatePresence>
        {selectedGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setSelectedGuide(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed inset-x-4 top-16 bottom-16 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[560px] bg-white rounded-2xl shadow-2xl z-[60] overflow-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{selectedGuide.icon}</span>
                    <h2 className="font-heading font-bold text-xl text-gray-900">{selectedGuide.title}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedGuide(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >×</button>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-5">{selectedGuide.desc}</p>

                {selectedGuide.diseases.length > 0 && (
                  <div className="mb-5">
                    <h4 className="font-semibold text-gray-800 text-sm mb-3">Diseases Covered</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGuide.diseases.map((d) => {
                        const isYours = yourDiseases.some((yd) =>
                          yd.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(yd.toLowerCase())
                        );
                        return (
                          <span
                            key={d}
                            className={`text-xs font-medium px-3 py-1 rounded-full ${isYours ? "bg-red-50 text-red-600 border border-red-200" : "bg-gray-100 text-gray-600"}`}
                          >
                            {isYours ? "⚠️ " : ""}{d}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mb-5">
                  <h4 className="font-semibold text-gray-800 text-sm mb-3">Key Management Tips</h4>
                  <div className="flex flex-col gap-2.5">
                    {selectedGuide.tips.map((tip, i) => (
                      <div key={i} className="flex gap-2.5 text-sm text-gray-700 p-3 bg-gray-50 rounded-xl">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 mb-5">
                  💡 For a personalised diagnosis of your specific crop, go to the{" "}
                  <strong>Diagnose</strong> page and upload a photo.
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedGuide(null);
                    addToast(`Opened ${selectedGuide.title}`, "info");
                  }}
                >
                  Got it
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
