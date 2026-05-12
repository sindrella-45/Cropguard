"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { val: "12K+", lbl: "Active Farmers" },
  { val: "200+", lbl: "Crop Diseases" },
  { val: "98.2%", lbl: "Diagnosis Accuracy" },
  { val: "5", lbl: "Languages Supported" },
];

export function StatsStrip() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="bg-green-600 py-16 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s, i) => (
          <motion.div
            key={s.lbl}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="font-heading font-bold text-4xl text-white mb-1">{s.val}</div>
            <div className="text-green-100 text-sm">{s.lbl}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
