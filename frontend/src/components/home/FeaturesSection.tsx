"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Zap, Target, Clock } from "lucide-react";

const features = [
  {
    icon: <ShieldCheck size={24} className="text-green-600" />,
    bg: "bg-green-50",
    title: "Enterprise-Grade Accuracy",
    description:
      "Every diagnosis is cross-referenced with verified agricultural PDFs. Confidence is calibrated from retrieval quality — not self-reported by the AI.",
    size: "large",
    dark: false,
  },
  {
    icon: <Zap size={24} className="text-amber-600" />,
    bg: "bg-amber-50",
    title: "Instant Action",
    description:
      "Stop guessing. Get specific treatment plans immediately after diagnosis — grounded in locally available East African products.",
    size: "small",
    dark: false,
  },
  {
    icon: <Target size={24} className="text-white" />,
    bg: "bg-green-600",
    title: "East Africa First",
    description:
      "Built for Uganda and East African conditions. Supports Luganda, Swahili, French and Runyankole.",
    size: "small",
    dark: true,
  },
  {
    icon: <Clock size={24} className="text-green-600" />,
    bg: "bg-green-50",
    title: "Track Your History",
    description:
      "Save all your diagnoses, monitor crop recovery over time, and view past treatments and prevention tips anytime — even offline.",
    size: "large",
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
          className="mb-10"
        >
          <span className="text-green-600 text-xs font-bold uppercase tracking-widest">
            Why CropGuard AI
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 leading-tight max-w-xl">
            Built for the realities of African farming
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map(({ icon, bg, title, description, dark }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative rounded-2xl p-8 border transition-all duration-300 hover:shadow-lg ${
                dark
                  ? "bg-gray-900 border-gray-800 text-white"
                  : "bg-white border-gray-100 text-gray-900"
              }`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                dark ? "bg-green-600" : bg
              }`}>
                {icon}
              </div>

              <h3 className={`font-bold text-xl mb-3 ${dark ? "text-white" : "text-gray-900"}`}>
                {title}
              </h3>
              <p className={`text-sm leading-relaxed ${dark ? "text-gray-400" : "text-gray-500"}`}>
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
