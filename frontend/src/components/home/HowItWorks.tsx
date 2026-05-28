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
      "The AI identifies your crop species, then describes every visible symptom without naming any disease — preventing anchoring bias.",
  },
  {
    number: "03",
    icon: "📚",
    title: "Knowledge base retrieval",
    description:
      "Symptoms are matched against verified agricultural PDFs. Each crop has its own dedicated knowledge base for accurate results.",
  },
  {
    number: "04",
    icon: "💊",
    title: "Treatment & prevention plan",
    description:
      "Receive specific guidance grounded in locally available products. Bacterial diseases get bactericides. Viral conditions get vector control advice.",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="bg-white py-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6"
        >
          <div>
            <span className="text-green-600 text-xs font-bold uppercase tracking-widest">
              The Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 leading-tight max-w-lg">
              From photo to treatment plan in under 60 seconds
            </h2>
          </div>
          <Link href="/auth/register" className="no-underline flex-shrink-0">
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-green-600/20">
              Try It Free →
            </button>
          </Link>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ number, icon, title, description }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gray-200 z-0 -translate-x-4" />
              )}

              <div className="relative z-10">
                {/* Number + icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl">
                    {icon}
                  </div>
                  <span className="text-xs font-bold text-gray-300 tracking-widest">
                    {number}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-2 leading-snug">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
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
