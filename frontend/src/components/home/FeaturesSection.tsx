"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Camera, Brain, BookOpen, Wifi, Globe, ShieldCheck
} from "lucide-react";

const features = [
  {
    icon: <Camera size={22} />,
    title: "Photograph & Diagnose",
    description:
      "Point your phone at an affected leaf. Our validator ensures only clear crop images proceed — no misdiagnoses from blurry photos or non-plant images.",
    tag: "Image Analysis",
    color: "#2D6A2D",
  },
  {
    icon: <Brain size={22} />,
    title: "Differential Diagnosis",
    description:
      "Receive the top 3 most likely explanations — disease, nutrient deficiency, or abiotic stress — with supporting evidence and what argues against each.",
    tag: "AI Reasoning",
    color: "#C8A84B",
  },
  {
    icon: <BookOpen size={22} />,
    title: "Knowledge Base Grounded",
    description:
      "Every diagnosis is cross-referenced with verified agricultural PDFs. Confidence is calibrated from retrieval quality — not self-reported by the AI.",
    tag: "RAG-Powered",
    color: "#5CB85C",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Biological Consistency",
    description:
      "A rules engine validates diagnoses before they reach you. Fungicides are never recommended for bacterial diseases. Viral cures are never suggested.",
    tag: "Quality Control",
    color: "#C8A84B",
  },
  {
    icon: <Wifi size={22} />,
    title: "Works in Low Connectivity",
    description:
      "Past diagnoses, crop guides, and treatment history are cached locally. Review your records even when the nearest cell tower is far away.",
    tag: "Offline Ready",
    color: "#2D6A2D",
  },
  {
    icon: <Globe size={22} />,
    title: "East Africa First",
    description:
      "Built for Ugandan and East African growing conditions. Treatments reference locally available products. Language support includes Luganda and Swahili.",
    tag: "Regional Focus",
    color: "#5CB85C",
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="bg-[#050f05] py-28 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-[#C8A84B] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Why CropGuard AI
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}>
            Built for the realities of<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #5CB85C, #C8A84B)" }}>
              African smallholder farming
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Not a generic AI wrapper. Every decision in this platform was made
            with a Ugandan farmer in mind — from how confidence is calculated
            to what treatments are suggested.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon, title, description, tag, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative rounded-2xl p-6 border border-white/8 hover:border-white/20 transition-all duration-300 hover:bg-white/3 cursor-default"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}
              >
                {icon}
              </div>

              {/* Tag */}
              <span className="text-[10px] font-bold tracking-widest uppercase mb-3 block"
                style={{ color: `${color}cc` }}>
                {tag}
              </span>

              <h3 className="text-white font-bold text-lg mb-3 leading-snug"
                style={{ fontFamily: "'Fraunces', serif" }}>
                {title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">{description}</p>

              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 30% 30%, ${color}08 0%, transparent 70%)` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
