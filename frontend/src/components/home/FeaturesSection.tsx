"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Zap, Globe, Clock } from "lucide-react";

const features = [
  {
    icon: <ShieldCheck size={22} className="text-green-600" />,
    bg: "bg-green-50",
    title: "Enterprise-Grade Accuracy",
    description:
      "Every diagnosis is cross-referenced with verified agricultural research. Confidence scores are calibrated from retrieval quality — not self-reported by the AI.",
    image: "/images/green-leaves.jpg",
    dark: false,
  },
  {
    icon: <Zap size={22} className="text-amber-600" />,
    bg: "bg-amber-50",
    title: "Instant Treatment Plans",
    description:
      "Stop guessing. Get specific, locally-available treatment recommendations immediately after diagnosis — grounded in East African agricultural practice.",
    image: null,
    dark: false,
  },
  {
    icon: <Globe size={22} className="text-white" />,
    bg: "bg-green-600",
    title: "East Africa First",
    description:
      "Built for Uganda and East African farming conditions. Supports English, Luganda, Swahili, French, and Runyankole.",
    image: "/images/farmer-field.jpg",
    dark: true,
  },
  {
    icon: <Clock size={22} className="text-green-600" />,
    bg: "bg-green-50",
    title: "Track Your Crop History",
    description:
      "Save every diagnosis, monitor recovery progress over time, and access past treatments anytime — even when offline in remote areas.",
    image: null,
    dark: false,
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="bg-gray-50 py-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="text-green-600 text-xs font-bold uppercase tracking-widest">
            Why CropGuard AI
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 leading-tight max-w-xl">
            Built for the realities of African farming
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map(({ icon, bg, title, description, image, dark }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl group ${
                dark ? "border-gray-800" : "border-gray-100"
              }`}
            >
              {/* Background image when available */}
              {image && (
                <>
                  <img
                    src={image}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className={`absolute inset-0 ${
                    dark
                      ? "bg-gradient-to-br from-gray-900/95 via-gray-900/85 to-gray-900/70"
                      : "bg-gradient-to-br from-white/97 via-white/90 to-white/70"
                  }`} />
                </>
              )}

              {/* No image — solid background */}
              {!image && (
                <div className={dark ? "absolute inset-0 bg-gray-900" : "absolute inset-0 bg-white"} />
              )}

              {/* Content */}
              <div className="relative z-10 p-8">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
                  dark ? "bg-green-600" : bg
                }`}>
                  {icon}
                </div>
                <h3 className={`font-bold text-xl mb-3 ${dark ? "text-white" : "text-gray-900"}`}>
                  {title}
                </h3>
                <p className={`text-sm leading-relaxed ${dark ? "text-gray-300" : "text-gray-500"}`}>
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
