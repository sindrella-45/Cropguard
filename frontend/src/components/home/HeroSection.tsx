"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, BookOpen, Camera, Shield, BookMarked, BarChart2 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col overflow-hidden">

      {/* ── Background — solid white left, image fades in on right only ── */}
      <div className="absolute inset-0 z-0">
        {/* White base so text side is always clean */}
        <div className="absolute inset-0 bg-white" />
        {/* Farm photo only visible on the right half */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[55%]">
          <img
            src="/images/hero-farm.jpg"
            alt="Farm field"
            className="w-full h-full object-cover object-center"
          />
          {/* Strong fade from left (white) to show image on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/30 to-transparent" />
          {/* Subtle bottom fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-6 md:px-10 pt-32 pb-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

        {/* LEFT — always on pure white, fully readable */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 uppercase tracking-widest"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            AI-Powered · Built for East Africa
          </motion.div>

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

          {/* Trust stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-gray-100"
          >
            {[
              { num: "10,000+", label: "Farmers Helped" },
              { num: "25+",     label: "Crops Supported" },
              { num: "96%",     label: "Accuracy Rate" },
              { num: "< 60s",   label: "Per Diagnosis" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="text-xl font-extrabold text-gray-900">{num}</div>
                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — Phone mockup with REAL leaf photo */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center lg:justify-end"
        >
          <div className="relative w-[270px] md:w-[290px]">
            <div className="absolute -inset-4 bg-green-400/10 blur-3xl rounded-full" />

            {/* Phone shell */}
            <div className="relative bg-gray-900 rounded-[44px] p-[10px] shadow-2xl shadow-gray-900/40">
              {/* Side buttons */}
              <div className="absolute -left-[3px] top-24 w-[3px] h-8 bg-gray-700 rounded-l-sm" />
              <div className="absolute -left-[3px] top-36 w-[3px] h-12 bg-gray-700 rounded-l-sm" />
              <div className="absolute -right-[3px] top-32 w-[3px] h-10 bg-gray-700 rounded-r-sm" />

              <div className="bg-white rounded-[36px] overflow-hidden">

                {/* Status bar */}
                <div className="bg-white px-5 pt-3 pb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-800">9:41</span>
                  <div className="flex gap-1.5 items-center">
                    <div className="flex items-end gap-[2px]">
                      {[5,7,9,11].map((h,i) => (
                        <div key={i} className={`w-[3px] rounded-sm ${i < 3 ? "bg-gray-800" : "bg-gray-300"}`} style={{ height: h }} />
                      ))}
                    </div>
                    <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                      <path d="M6.5 8a1 1 0 100 2 1 1 0 000-2z" fill="#1f2937"/>
                      <path d="M4 6C4.9 5.1 5.65 4.7 6.5 4.7S8.1 5.1 9 6" stroke="#1f2937" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
                      <path d="M1.5 3.5C3 2 4.6 1.2 6.5 1.2S10 2 11.5 3.5" stroke="#1f2937" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
                    </svg>
                    <div className="flex items-center">
                      <div className="w-6 h-[13px] rounded-[3px] border border-gray-400 p-[2px]">
                        <div className="h-full bg-green-500 rounded-[2px]" style={{ width: "80%" }} />
                      </div>
                      <div className="w-[2px] h-[6px] bg-gray-400 rounded-r-sm ml-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Notch */}
                <div className="flex justify-center -mt-1 mb-1">
                  <div className="w-24 h-5 bg-gray-900 rounded-b-2xl" />
                </div>

                {/* App header */}
                <div className="bg-white px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <button className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M6 1.5L3 4.5L6 7.5" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <span className="font-semibold text-gray-800 text-[13px]">Diagnosis Result</span>
                  <button className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg width="13" height="3" viewBox="0 0 13 3">
                      <circle cx="1.5" cy="1.5" r="1.5" fill="#374151"/>
                      <circle cx="6.5" cy="1.5" r="1.5" fill="#374151"/>
                      <circle cx="11.5" cy="1.5" r="1.5" fill="#374151"/>
                    </svg>
                  </button>
                </div>

                {/* ── REAL tomato leaf photo ── */}
                <div className="relative h-44 overflow-hidden bg-green-950">
                  <img
                    src="/images/tomato-leaf-disease.jpg"
                    alt="Diseased tomato leaf"
                    className="w-full h-full object-cover"
                  />
                  {/* Bottom gradient for label legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                  {/* Animated scan line */}
                  <motion.div
                    className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-green-400/80 to-transparent pointer-events-none"
                    initial={{ top: "8%" }}
                    animate={{ top: "88%" }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                  />

                  {/* Detection corner boxes */}
                  {[
                    { top: "18%", left: "22%" },
                    { top: "38%", left: "55%" },
                    { top: "55%", left: "28%" },
                  ].map((pos, i) => (
                    <div key={i} className="absolute w-8 h-8 pointer-events-none" style={pos}>
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-green-400 rounded-tl" />
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-green-400 rounded-tr" />
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-green-400 rounded-bl" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-green-400 rounded-br" />
                    </div>
                  ))}

                  {/* Analysing badge */}
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Analysing
                  </div>

                  {/* Bottom label */}
                  <div className="absolute bottom-2 left-3 text-white text-[11px] font-semibold drop-shadow-md">
                    Tomato Leaf · Just uploaded
                  </div>
                </div>

                {/* Diagnosis content */}
                <div className="px-4 py-3 bg-white">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Disease Detected</span>
                  </div>
                  <div className="text-green-700 font-bold text-[15px] mb-3">Tomato Leaf Spot</div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                      <div className="text-[9px] text-gray-400 mb-1 uppercase tracking-wide">Confidence</div>
                      <div className="font-bold text-gray-800 text-sm">85%</div>
                      <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: "85%" }} />
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                      <div className="text-[9px] text-gray-400 mb-1 uppercase tracking-wide">Severity</div>
                      <div className="font-bold text-amber-500 text-sm">Moderate</div>
                      <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: "55%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-2.5 mb-3 border border-green-100">
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Recommended Treatment
                    </div>
                    {["Remove affected leaves", "Apply copper fungicide", "Improve air circulation"].map((t) => (
                      <div key={t} className="flex items-center gap-1.5 mb-1.5 last:mb-0">
                        <div className="w-3.5 h-3.5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                            <path d="M1 3L2.8 5L6 1" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="text-[10px] text-gray-700">{t}</span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full bg-green-700 text-white text-[11px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 1v6M2 7l3 2.5L8 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Save Result
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-10 bg-green-400/20 blur-2xl rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* ── Feature strip — white background, always readable ── */}
      <div className="relative z-10 bg-white border-t border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Camera size={18} className="text-green-600" />,    bg: "bg-green-50",  title: "AI Disease Detection",      desc: "Upload a photo and get instant AI insights." },
              { icon: <Shield size={18} className="text-blue-600" />,     bg: "bg-blue-50",   title: "Treatment Recommendations", desc: "Practical solutions tailored to your crops." },
              { icon: <BookMarked size={18} className="text-amber-600"/>,  bg: "bg-amber-50",  title: "Farming Guides",            desc: "Expert tips and best farming practices." },
              { icon: <BarChart2 size={18} className="text-purple-600" />, bg: "bg-purple-50", title: "Track & Improve",           desc: "Monitor crop health and boost your yields." },
            ].map(({ icon, bg, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
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
