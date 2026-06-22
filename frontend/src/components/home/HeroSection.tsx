"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, BookOpen } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col overflow-hidden">

      {/* ── Farm background image ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&auto=format&fit=crop&q=80"
          alt="Farm field"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-white/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40" />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-6 md:px-10 pt-32 pb-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

        {/* LEFT */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-6xl xl:text-7xl font-extrabold leading-[1.05] text-gray-900 mb-6 tracking-tight"
          >
            Protect Your Crops.
            <br />
            <span className="text-green-600">Empower Your Harvest.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-lg text-gray-600 mb-8 max-w-md leading-relaxed"
          >
            CropGuard AI helps farmers identify crop diseases early, get
            AI-powered recommendations, and improve yields sustainably.
            Smart insights for a healthier harvest.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/auth/register" className="no-underline">
              <button className="flex items-center gap-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all duration-200 shadow-lg shadow-green-700/25">
                <Upload size={17} /> Start Diagnosing
              </button>
            </Link>
            <Link href="/guides" className="no-underline">
              <button className="flex items-center gap-2.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold px-7 py-3.5 rounded-xl text-base border-2 border-gray-200 transition-all duration-200">
                <BookOpen size={17} /> Explore Guides
              </button>
            </Link>
          </motion.div>
        </div>

        {/* RIGHT — Phone mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center lg:justify-end"
        >
          <div className="relative w-[280px] md:w-[300px]">
            {/* Phone shell */}
            <div className="bg-gray-900 rounded-[42px] p-3 shadow-2xl">
              <div className="bg-white rounded-[32px] overflow-hidden">

                {/* Status bar */}
                <div className="bg-gray-50 px-5 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-500">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-1.5 bg-gray-400 rounded-sm" />
                    <div className="w-3 h-1.5 bg-gray-400 rounded-sm" />
                    <div className="w-4 h-1.5 bg-green-600 rounded-sm" />
                  </div>
                </div>

                {/* App header */}
                <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-gray-400 text-lg">←</span>
                  <span className="font-semibold text-gray-800 text-sm">Diagnosis Result</span>
                  <span className="text-gray-400 text-lg">⋮</span>
                </div>

                {/* ── Real tomato leaf disease image ── */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=600&auto=format&fit=crop&q=80"
                    alt="Tomato leaf with disease spots"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      // Fallback to another tomato leaf image if first fails
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80";
                    }}
                  />
                  {/* Scanning overlay to make it look like AI is analysing */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {/* Scan line animation */}
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-green-400/70"
                    initial={{ top: "10%" }}
                    animate={{ top: "90%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "linear",
                    }}
                  />
                  {/* AI analysing badge */}
                  <div className="absolute top-2 right-2 bg-green-600/90 text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Analysing
                  </div>
                  {/* Bottom label */}
                  <div className="absolute bottom-2 left-3 text-white text-[10px] font-semibold drop-shadow">
                    Tomato Leaf · Uploaded just now
                  </div>
                </div>

                {/* Diagnosis content */}
                <div className="px-4 py-3">
                  <div className="text-[10px] text-gray-400 font-medium mb-0.5">
                    Disease Detected
                  </div>
                  <div className="text-green-700 font-bold text-base mb-3">
                    Tomato Leaf Spot
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-xl p-2.5">
                      <div className="text-[9px] text-gray-400 mb-0.5">Confidence</div>
                      <div className="font-bold text-gray-800 text-sm">85%</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2.5">
                      <div className="text-[9px] text-gray-400 mb-0.5">Severity</div>
                      <div className="font-bold text-amber-500 text-sm">Moderate</div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-3 mb-3">
                    <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wide mb-2">
                      Recommended Treatment
                    </div>
                    {[
                      "Remove affected leaves",
                      "Use copper-based fungicide",
                      "Improve field ventilation",
                    ].map((t) => (
                      <div key={t} className="flex items-center gap-1.5 mb-1">
                        <span className="text-green-600 text-[10px]">✓</span>
                        <span className="text-[10px] text-gray-700">{t}</span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full bg-green-700 text-white text-xs font-semibold py-2.5 rounded-xl">
                    Save Result
                  </button>
                </div>
              </div>
            </div>

            {/* Glow under phone */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-8 bg-green-400/20 blur-xl rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* ── Feature strip ── */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "📷", title: "AI Disease Detection",      desc: "Upload a photo and get instant AI insights." },
              { icon: "💊", title: "Treatment Recommendations", desc: "Get practical solutions tailored to your crops." },
              { icon: "📚", title: "Farming Guides",            desc: "Access expert tips and best farming practices." },
              { icon: "📊", title: "Track & Improve",           desc: "Monitor your crop health and boost your yields." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">{title}</div>
                  <div className="text-gray-500 text-xs mt-0.5 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
