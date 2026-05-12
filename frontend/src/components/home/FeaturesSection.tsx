"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { FEATURES } from "@/lib/data";

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-24 px-6 md:px-10 max-w-7xl mx-auto" ref={ref}>
      <div className="text-center mb-16">
        <span className="inline-block bg-green-50 text-green-700 border border-green-200 px-4 py-1 rounded-full text-xs font-medium mb-4">
          ✦ Platform Features
        </span>
        <h2 className="font-heading font-bold text-4xl text-gray-900 mb-3">
          Everything You Need to Protect Your Harvest
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          From instant disease detection to offline access, CropGuard AI is built for the realities of farming.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7 hover:-translate-y-1 hover:shadow-md hover:border-green-200 transition-all duration-200"
          >
            <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center text-2xl mb-5`}>
              {f.icon}
            </div>
            <h3 className="font-heading font-semibold text-base text-gray-900 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
