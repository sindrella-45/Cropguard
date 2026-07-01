"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Target, Ruler, Ban, Layers, Leaf,
  AlertTriangle, CheckCircle2, BookOpen, X, Camera,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { dashboardApi } from "@/lib/api";

// ── Guide data with local images ─────────────────────────────────────────────
const STATIC_GUIDES = [
  {
    key:      "tomato",
    image:    "/images/guide-tomato.jpg",
    color:    "from-red-600 to-orange-500",
    badge:    "bg-red-100 text-red-700",
    title:    "Tomato Disease Guide",
    category: "Vegetable",
    desc:     "Covers Late Blight, Early Blight, Mosaic Virus, Bacterial Spot, and 20 more common tomato diseases detected in East Africa.",
    diseases: ["Late Blight", "Early Blight", "Mosaic Virus", "Bacterial Spot", "Leaf Curl"],
    tips: [
      "Water at the base of plants, never on leaves",
      "Remove and destroy infected leaves immediately",
      "Rotate with non-solanaceous crops every season",
      "Apply copper-based fungicide at first sign of disease",
    ],
  },
  {
    key:      "maize",
    image:    "/images/guide-maize.jpg",
    color:    "from-yellow-600 to-amber-500",
    badge:    "bg-yellow-100 text-yellow-700",
    title:    "Maize Pest & Disease",
    category: "Staple Crop",
    desc:     "Identify Fall Armyworm, Maize Streak Virus, Grey Leaf Spot, and other common threats to your maize crop.",
    diseases: ["Fall Armyworm", "Maize Streak Virus", "Grey Leaf Spot", "Stalk Rot", "Ear Rot"],
    tips: [
      "Scout fields weekly — look inside leaf whorls",
      "Apply emamectin benzoate early for armyworm",
      "Intercrop with legumes to reduce pest pressure",
      "Plant certified disease-resistant seed varieties",
    ],
  },
  {
    key:      "coffee",
    image:    "/images/guide-coffee.jpg",
    color:    "from-amber-800 to-yellow-700",
    badge:    "bg-amber-100 text-amber-800",
    title:    "Coffee Leaf Diseases",
    category: "Cash Crop",
    desc:     "Detect Coffee Leaf Rust, Coffee Wilt Disease, and CBD (Coffee Berry Disease) before they spread.",
    diseases: ["Leaf Rust", "Coffee Wilt", "Berry Disease", "Anthracnose"],
    tips: [
      "Maintain proper shade coverage to reduce stress",
      "Prune for air circulation inside the canopy",
      "Apply copper fungicide preventively before rains",
      "Harvest all ripe berries promptly to reduce disease",
    ],
  },
  {
    key:      "banana",
    image:    "/images/guide-banana.jpg",
    color:    "from-green-600 to-emerald-500",
    badge:    "bg-green-100 text-green-700",
    title:    "Banana Wilt & Pests",
    category: "Fruit Crop",
    desc:     "Guide to Xanthomonas Wilt, Fusarium Wilt (Panama Disease), and banana weevil management.",
    diseases: ["Xanthomonas Wilt", "Fusarium Wilt", "Black Sigatoka", "Banana Weevil"],
    tips: [
      "Only use certified, disease-free planting material",
      "Debud with a sterile knife to prevent Xanthomonas",
      "Remove male buds after the last hand emerges",
      "Destroy infected plants — do not compost them",
    ],
  },
  {
    key:      "ipm",
    image:    "/images/guide-ipm.jpg",
    color:    "from-teal-600 to-cyan-500",
    badge:    "bg-teal-100 text-teal-700",
    title:    "Integrated Pest Management",
    category: "Strategy",
    desc:     "Learn sustainable, low-cost approaches to managing crop diseases using IPM principles.",
    diseases: [],
    tips: [
      "Combine biological, cultural, and chemical controls",
      "Monitor pest populations against economic thresholds",
      "Preserve natural enemies such as ladybirds and wasps",
      "Use pesticides only when absolutely necessary",
    ],
  },
  {
    key:      "organic",
    image:    "/images/guide-organic.jpg",
    color:    "from-lime-600 to-green-500",
    badge:    "bg-lime-100 text-lime-700",
    title:    "Organic Treatments",
    category: "Organic",
    desc:     "Natural and organic remedies for common crop diseases — safe for families and the environment.",
    diseases: [],
    tips: [
      "Neem oil spray for fungal diseases and soft insects",
      "Copper sulfate (Bordeaux mixture) for downy mildew",
      "Baking soda solution for powdery mildew",
      "Wood ash around stems deters soil pests",
    ],
  },
];

const photoTips = [
  { icon: <Sun size={16} className="text-amber-500" />,    bg: "bg-amber-50",  tip: "Use natural daylight — avoid artificial light which can alter leaf colors" },
  { icon: <Target size={16} className="text-green-600" />, bg: "bg-green-50",  tip: "Focus directly on the symptoms — ensure the affected area is clear and centered" },
  { icon: <Ruler size={16} className="text-blue-500" />,   bg: "bg-blue-50",   tip: "Keep 20–30 cm distance from the plant for best detail capture" },
  { icon: <Ban size={16} className="text-red-500" />,      bg: "bg-red-50",    tip: "Avoid blurry, dark, or overexposed photos — retake if unsure" },
  { icon: <Layers size={16} className="text-purple-500"/>, bg: "bg-purple-50", tip: "Photograph multiple affected leaves when symptoms are widespread" },
  { icon: <Leaf size={16} className="text-green-600" />,   bg: "bg-green-50",  tip: "Include a mix of healthy and affected tissue in one photo when possible" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function GuidesView() {
  const { addToast, diagnoses } = useAppStore();
  const [selectedGuide, setSelectedGuide] = useState<typeof STATIC_GUIDES[0] | null>(null);
  const [yourDiseases,  setYourDiseases]  = useState<string[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const hist = await dashboardApi.getHistory(50);
        const seen = Array.from(new Set(
          hist.diagnoses.map((d) => d.disease_name).filter((n) => n && n !== "Healthy")
        ));
        setYourDiseases(seen);
      } catch {
        const seen = Array.from(new Set(
          diagnoses.map((d) => d.disease).filter((n) => n && n !== "Healthy")
        ));
        setYourDiseases(seen);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enrichedGuides = STATIC_GUIDES.map((g) => ({
    ...g,
    hasYourDisease: g.diseases.some((d) =>
      yourDiseases.some(
        (yd) => yd.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(yd.toLowerCase())
      )
    ),
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-gray-900">Crop Guides</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Expert guides on crop diseases, pest management, and organic treatments
        </p>
      </div>

      {/* Personalised alert */}
      {!loading && yourDiseases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 flex gap-3"
        >
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-800 text-sm mb-1">
              Guides Recommended for Your Farm
            </div>
            <div className="text-sm text-amber-700">
              Based on your diagnosis history, read the guides for:{" "}
              <strong>{yourDiseases.slice(0, 3).join(", ")}</strong>
              {yourDiseases.length > 3 && ` and ${yourDiseases.length - 3} more`}.
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Photo tips with Lucide icons ── */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <Camera size={18} className="text-green-600" />
          <h3 className="font-semibold text-gray-800">Photo Tips for Best Accuracy</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {photoTips.map(({ icon, bg, tip }, i) => (
            <motion.div
              key={tip}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100"
            >
              <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                {icon}
              </div>
              {tip}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* ── Guide cards with real photos ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {enrichedGuides.map((g, i) => (
          <motion.div
            key={g.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="group"
          >
            <div
              className={`relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 flex flex-col h-full ${
                g.hasYourDisease ? "border-amber-300" : "border-gray-100"
              }`}
              onClick={() => setSelectedGuide(g)}
            >
              {/* ── Real crop photo header ── */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={g.image}
                  alt={g.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/crop-maize.jpg";
                  }}
                />
                {/* Gradient overlay at bottom for category badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Category badge */}
                <div className="absolute bottom-3 left-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${g.badge}`}>
                    {g.category}
                  </span>
                </div>

                {/* "Your farm" alert badge */}
                {g.hasYourDisease && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    <AlertTriangle size={9} />
                    Your Farm
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="p-5 flex flex-col flex-1 bg-white">
                <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug">
                  {g.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-4">
                  {g.desc}
                </p>

                {/* Detected diseases tags */}
                {g.hasYourDisease && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {g.diseases
                      .filter((d) =>
                        yourDiseases.some(
                          (yd) => yd.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(yd.toLowerCase())
                        )
                      )
                      .map((d) => (
                        <span key={d} className="text-[10px] font-medium bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
                          {d} detected
                        </span>
                      ))}
                  </div>
                )}

                <button
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    g.hasYourDisease
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                  }`}
                >
                  <BookOpen size={14} />
                  {g.hasYourDisease ? "Read Now — Urgent" : "Read Guide"}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Guide modal ── */}
      <AnimatePresence>
        {selectedGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSelectedGuide(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed inset-x-4 top-12 bottom-12 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[580px] bg-white rounded-2xl shadow-2xl z-[60] overflow-hidden flex flex-col"
            >
              {/* Modal — crop photo header */}
              <div className="relative h-48 flex-shrink-0">
                <img
                  src={selectedGuide.image}
                  alt={selectedGuide.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/crop-maize.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Close button */}
                <button
                  onClick={() => setSelectedGuide(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>

                {/* Title on photo */}
                <div className="absolute bottom-4 left-5">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2 inline-block ${selectedGuide.badge}`}>
                    {selectedGuide.category}
                  </span>
                  <h2 className="font-heading font-bold text-xl text-white">
                    {selectedGuide.title}
                  </h2>
                </div>
              </div>

              {/* Modal body — scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  {selectedGuide.desc}
                </p>

                {/* Diseases covered */}
                {selectedGuide.diseases.length > 0 && (
                  <div className="mb-5">
                    <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-amber-500" />
                      Diseases Covered
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGuide.diseases.map((d) => {
                        const isYours = yourDiseases.some(
                          (yd) => yd.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(yd.toLowerCase())
                        );
                        return (
                          <span
                            key={d}
                            className={`text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 ${
                              isYours
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {isYours && <AlertTriangle size={9} />}
                            {d}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Management tips */}
                <div className="mb-5">
                  <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />
                    Key Management Tips
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {selectedGuide.tips.map((tip, i) => (
                      <div key={i} className="flex gap-3 text-sm text-gray-700 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 size={11} className="text-green-600" />
                        </div>
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 mb-5 flex gap-2">
                  <Leaf size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  For a personalised diagnosis, go to the{" "}
                  <strong>Diagnose</strong> page and upload a photo of your crop.
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
