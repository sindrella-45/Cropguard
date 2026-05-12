"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { TESTIMONIALS } from "@/lib/data";

export function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-6 md:px-10 max-w-6xl mx-auto" ref={ref}>
      <div className="text-center mb-14">
        <span className="inline-block bg-green-50 text-green-700 border border-green-200 px-4 py-1 rounded-full text-xs font-medium mb-4">
          ✦ Trusted by Farmers
        </span>
        <h2 className="font-heading font-bold text-4xl text-gray-900">Real Results, Real Farmers</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7 hover:shadow-md transition-all duration-200"
          >
            <div className="text-amber-400 text-lg tracking-wide mb-4">★★★★★</div>
            <p className="text-sm text-gray-600 leading-relaxed italic mb-6">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-sm font-semibold text-green-700">
                {t.initials}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{t.name}</div>
                <div className="text-xs text-gray-400">{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
