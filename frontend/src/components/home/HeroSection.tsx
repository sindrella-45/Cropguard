"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Clock } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-white overflow-hidden min-h-[88vh] flex flex-col justify-center">
      {/* Subtle leaf watermarks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 opacity-[0.04]">
          <svg viewBox="0 0 200 200" fill="none">
            <path d="M100 10 C140 10, 180 50, 180 100 C180 150, 140 190, 100 190 C60 190, 10 160, 10 100 C10 40, 60 10, 100 10Z" fill="#16a34a"/>
          </svg>
        </div>
        <div className="absolute top-1/3 right-10 w-64 h-64 opacity-[0.04]">
          <svg viewBox="0 0 200 200" fill="none">
            <path d="M100 10 C140 10, 180 50, 180 100 C180 150, 140 190, 100 190 C60 190, 10 160, 10 100 C10 40, 60 10, 100 10Z" fill="#16a34a"/>
          </svg>
        </div>
        <div className="absolute bottom-10 left-1/3 w-48 h-48 opacity-[0.03]">
          <svg viewBox="0 0 200 200" fill="none">
            <path d="M100 10 C140 10, 180 50, 180 100 C180 150, 140 190, 100 190 C60 190, 10 160, 10 100 C10 40, 60 10, 100 10Z" fill="#16a34a"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-xs font-semibold mb-8 uppercase tracking-widest"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          AI-Powered · Built for East Africa
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-gray-900 leading-[1.05] mb-6 tracking-tight"
        >
          The exact science of{" "}
          <span className="text-green-600">crop</span>
          <br />
          <span className="text-green-600">health.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Instantly identify diseases, nutrient deficiencies, and pests with AI
          built specifically for Uganda and East African crops. Get precise
          treatment plans in under 60 seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <Link href="/auth/register">
            <button className="flex items-center gap-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-lg shadow-green-600/20 hover:shadow-green-600/30">
              <Camera size={18} />
              Start New Diagnosis
            </button>
          </Link>
          <Link href="/auth/login">
            <button className="flex items-center gap-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-4 rounded-xl text-base border-2 border-gray-200 hover:border-gray-300 transition-all duration-200">
              <Clock size={18} />
              View History
            </button>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16 pt-8 border-t border-gray-100"
        >
          {[
            { num: "12,000+", label: "Farmers Protected" },
            { num: "200+",    label: "Diseases Indexed" },
            { num: "96%",     label: "Crop ID Accuracy" },
            { num: "< 60s",   label: "Avg. Diagnosis Time" },
          ].map(({ num, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{num}</div>
              <div className="text-sm text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
