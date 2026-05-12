"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { HOW_STEPS } from "@/lib/data";

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="py-24 px-6 bg-gray-50" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block bg-green-50 text-green-700 border border-green-200 px-4 py-1 rounded-full text-xs font-medium mb-4">
            ✦ Simple Process
          </span>
          <h2 className="font-heading font-bold text-4xl text-gray-900 mb-3">
            Diagnose in 4 Simple Steps
          </h2>
          <p className="text-gray-500">From photo to prescription in under 30 seconds.</p>
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Connector line */}
          <div className="absolute top-7 left-[14%] right-[14%] h-0.5 bg-gradient-to-r from-green-300 to-green-500 hidden md:block" />

          {HOW_STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative z-10 text-center"
            >
              <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center font-heading font-bold text-xl mx-auto mb-4 shadow-[0_4px_16px_rgba(22,163,74,0.35)]">
                {s.num}
              </div>
              <div className="font-semibold text-sm text-gray-800 mb-1">{s.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
