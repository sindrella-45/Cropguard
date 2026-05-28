"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: "📸",
    title: "Photograph the leaf",
    description:
      "Take a clear close-up photo of the affected leaf in natural daylight. Our validator rejects blurry or non-plant images before processing begins.",
  },
  {
    number: "02",
    icon: "🔬",
    title: "AI identifies crop & symptoms",
    description:
      "The AI first identifies your crop species, then describes every visible symptom without naming any disease — preventing anchoring bias in the diagnosis.",
  },
  {
    number: "03",
    icon: "📚",
    title: "Knowledge base retrieval",
    description:
      "Symptoms are matched against verified agricultural PDFs in ChromaDB. Each crop has its own knowledge base for more accurate, specific results.",
  },
  {
    number: "04",
    icon: "💊",
    title: "Treatment & prevention plan",
    description:
      "Receive category-specific guidance grounded in locally available products. Bacterial diseases get bactericides, not fungicides. Viral conditions get vector control advice.",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="bg-[#030a03] py-20 px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-[#5CB85C] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            The Process
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            From photo to treatment plan{" "}
            <span className="text-white/40">in under 60 seconds</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[27px] top-10 bottom-10 w-px bg-gradient-to-b from-[#C8A84B]/40 via-[#2D6A2D]/30 to-transparent hidden md:block" />

          <div className="flex flex-col gap-10">
            {steps.map(({ number, icon, title, description }, i) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, x: -24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="flex gap-6 items-start group"
              >
                {/* Icon bubble */}
                <div className="flex-shrink-0 relative">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/12 group-hover:border-[#C8A84B]/40 transition-all duration-300"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <span className="text-2xl">{icon}</span>
                  </div>
                  <span
                    className="absolute -top-2 -right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #C8A84B, #E8D080)",
                      color: "#0a1a0a",
                    }}
                  >
                    {number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h3
                    className="text-white font-bold text-xl mb-2"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-center mt-14"
        >
          <Link href="/auth/register" className="no-underline inline-block">
            <button
              className="px-8 py-4 rounded-full font-semibold text-[#0a1a0a] text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#C8A84B]/20"
              style={{ background: "linear-gradient(135deg, #C8A84B, #E8D080)" }}
            >
              Try It Now — It&apos;s Free
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
