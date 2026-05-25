"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Photograph the leaf",
    description:
      "Open CropGuard AI, select your crop, and take a clear close-up photo of the affected leaf in natural daylight. Our validator ensures the image is suitable before processing.",
    note: "Only clear crop leaf images are accepted — blurry or non-plant images are rejected immediately.",
    icon: "📸",
  },
  {
    number: "02",
    title: "AI identifies crop & symptoms",
    description:
      "Two separate AI calls run in sequence: first identifying the exact crop species, then describing every visible symptom without naming any disease — preventing anchoring bias.",
    note: "Crop identification runs before disease retrieval so the wrong knowledge base is never searched.",
    icon: "🔬",
  },
  {
    number: "03",
    title: "Knowledge base retrieval",
    description:
      "Symptom descriptions are matched against verified agricultural PDFs in ChromaDB. Coffee, tea, cocoa, cotton, and sunflower have dedicated knowledge bases. Nutrient and abiotic chunks are always included.",
    note: "Confidence is calculated from retrieval match quality — not self-reported by the AI.",
    icon: "📚",
  },
  {
    number: "04",
    title: "Differential diagnosis",
    description:
      "The system returns the top 3 most likely explanations — disease, pest, nutrient deficiency, or environmental stress — with supporting evidence and what argues against each.",
    note: "A consistency checker validates that treatments match the disease category before you see them.",
    icon: "🧠",
  },
  {
    number: "05",
    title: "Treatment & prevention plan",
    description:
      "Receive category-specific treatment guidance. Bacterial diseases get bactericides, not fungicides. Viral conditions get vector control advice, not chemical cures. Nutrient issues get soil amendment guidance.",
    note: "Treatments are grounded in locally available products and East African agricultural practice.",
    icon: "💊",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="bg-[#030a03] py-28 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-[#5CB85C] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            The Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: "'Fraunces', serif" }}>
            From photo to treatment plan<br />
            <span className="text-white/40">in under 60 seconds</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[22px] md:left-[30px] top-8 bottom-8 w-px bg-gradient-to-b from-[#C8A84B]/40 via-[#2D6A2D]/40 to-transparent hidden md:block" />

          <div className="flex flex-col gap-12">
            {steps.map(({ number, title, description, note, icon }, i) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="flex gap-6 md:gap-10 items-start group"
              >
                {/* Number bubble */}
                <div className="flex-shrink-0 relative">
                  <div
                    className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border border-white/15 transition-all duration-300 group-hover:border-[#C8A84B]/40"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <span className="text-xl md:text-2xl">{icon}</span>
                  </div>
                  <span
                    className="absolute -top-2 -right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "linear-gradient(135deg, #C8A84B, #E8D080)", color: "#0a1a0a" }}
                  >
                    {number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <h3 className="text-white font-bold text-xl mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
                    {title}
                  </h3>
                  <p className="text-white/55 text-sm leading-relaxed mb-3">
                    {description}
                  </p>
                  <div className="flex items-start gap-2 bg-[#C8A84B]/8 border border-[#C8A84B]/20 rounded-xl px-4 py-3">
                    <span className="text-[#C8A84B] text-xs mt-0.5">→</span>
                    <p className="text-[#C8A84B]/80 text-xs leading-relaxed">{note}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="text-center mt-20"
        >
          <a href="/auth/register" className="no-underline inline-block">
            <button
              className="px-8 py-4 rounded-full font-semibold text-[#0a1a0a] text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#C8A84B]/20"
              style={{ background: "linear-gradient(135deg, #C8A84B, #E8D080)" }}
            >
                  Try It Now — It&apos;s Free

            </button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
