"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Camera, Brain, Globe } from "lucide-react";

const features = [
  {
    icon: <Camera size={22} />,
    title: "Photograph & Diagnose",
    description:
      "Point your phone at an affected leaf and get an instant AI diagnosis. Our validator rejects blurry or non-plant images before processing begins.",
    tag: "Image Analysis",
    color: "#2D6A2D",
  },
  {
    icon: <Brain size={22} />,
    title: "Differential Diagnosis",
    description:
      "Get the top 3 most likely explanations — fungal disease, nutrient deficiency, or pest damage — with supporting evidence and an honest confidence score.",
    tag: "AI Reasoning",
    color: "#C8A84B",
  },
  {
    icon: <Globe size={22} />,
    title: "East Africa First",
    description:
      "Built for Uganda and East African farming conditions. Treatments reference locally available products. Supports English, Swahili, Luganda, French and Runyankole.",
    tag: "Regional Focus",
    color: "#5CB85C",
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="bg-[#050f05] py-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-[#C8A84B] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Why CropGuard AI
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Built for the realities of{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #5CB85C, #C8A84B)" }}
            >
              African smallholder farming
            </span>
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">
            Every decision was made with a Ugandan farmer in mind — from how
            confidence is calculated to what treatments are suggested.
          </p>
        </motion.div>

        {/* 3 feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map(({ icon, title, description, tag, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative rounded-2xl p-6 border border-white/8 hover:border-white/20 transition-all duration-300"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}
              >
                {icon}
              </div>
              <span
                className="text-[10px] font-bold tracking-widest uppercase mb-3 block"
                style={{ color: `${color}cc` }}
              >
                {tag}
              </span>
              <h3
                className="text-white font-bold text-lg mb-3"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">{description}</p>
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 30% 30%, ${color}08 0%, transparent 70%)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
