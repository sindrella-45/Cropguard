"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, BookOpen, Camera, Shield, BookMarked, BarChart2 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col overflow-hidden">

      {/* ── Farm background ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&auto=format&fit=crop&q=80"
          alt="Farm field at sunset"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/92 via-white/65 to-white/15" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/30" />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-6 md:px-10 pt-32 pb-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

        {/* LEFT */}
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
                  <div className="flex gap-1.5 items-center">
                    {/* Signal bars */}
                    <div className="flex items-end gap-[2px]">
                      <div className="w-[3px] h-[5px] bg-gray-500 rounded-sm" />
                      <div className="w-[3px] h-[7px] bg-gray-500 rounded-sm" />
                      <div className="w-[3px] h-[9px] bg-gray-500 rounded-sm" />
                      <div className="w-[3px] h-[11px] bg-gray-400 rounded-sm" />
                    </div>
                    {/* WiFi */}
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none" className="opacity-60">
                      <path d="M6 7.5C6.55 7.5 7 7.95 7 8.5C7 9.05 6.55 9.5 6 9.5C5.45 9.5 5 9.05 5 8.5C5 7.95 5.45 7.5 6 7.5Z" fill="#6b7280"/>
                      <path d="M3.5 5.5C4.33 4.67 5.11 4.25 6 4.25C6.89 4.25 7.67 4.67 8.5 5.5" stroke="#6b7280" strokeWidth="1.2" fill="none"/>
                      <path d="M1.5 3C3 1.5 4.39 0.75 6 0.75C7.61 0.75 9 1.5 10.5 3" stroke="#6b7280" strokeWidth="1.2" fill="none"/>
                    </svg>
                    {/* Battery */}
                    <div className="flex items-center gap-[1px]">
                      <div className="w-6 h-3 rounded-[3px] border border-gray-400 p-[1.5px]">
                        <div className="h-full w-4/5 bg-green-600 rounded-[2px]" />
                      </div>
                      <div className="w-[2px] h-[5px] bg-gray-400 rounded-r-sm" />
                    </div>
                  </div>
                </div>

                {/* App header */}
                <div className="bg-white px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                  <button className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M7 1L3 5L7 9" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <span className="font-semibold text-gray-800 text-sm">Diagnosis Result</span>
                  <button className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg width="12" height="3" viewBox="0 0 12 3" fill="#374151">
                      <circle cx="1.5" cy="1.5" r="1.5"/>
                      <circle cx="6" cy="1.5" r="1.5"/>
                      <circle cx="10.5" cy="1.5" r="1.5"/>
                    </svg>
                  </button>
                </div>

                {/* ── Leaf image — inline SVG so it NEVER breaks ── */}
                <div className="relative h-44 overflow-hidden bg-green-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 400 280"
                    className="w-full h-full object-cover"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>
                      <radialGradient id="lg" cx="50%" cy="40%" r="70%">
                        <stop offset="0%" stopColor="#3d7a22"/>
                        <stop offset="60%" stopColor="#2d5a1b"/>
                        <stop offset="100%" stopColor="#1a3a0a"/>
                      </radialGradient>
                      <radialGradient id="sg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9"/>
                        <stop offset="50%" stopColor="#d97706" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#92400e" stopOpacity="0.5"/>
                      </radialGradient>
                      <filter id="sf"><feGaussianBlur stdDeviation="2"/></filter>
                      <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                    </defs>
                    {/* Leaf background */}
                    <rect width="400" height="280" fill="url(#lg)"/>
                    {/* Leaf texture highlights */}
                    <ellipse cx="200" cy="130" rx="185" ry="115" fill="#4a9229" opacity="0.25"/>
                    <ellipse cx="155" cy="110" rx="130" ry="85" fill="#5aad32" opacity="0.15"/>
                    {/* Veins */}
                    <path d="M200 10 C198 80 200 160 202 270" stroke="#1e4d0f" strokeWidth="4" fill="none" opacity="0.7"/>
                    <path d="M200 60 Q150 85 105 115" stroke="#1e4d0f" strokeWidth="2" fill="none" opacity="0.5"/>
                    <path d="M200 85 Q252 105 298 130" stroke="#1e4d0f" strokeWidth="2" fill="none" opacity="0.5"/>
                    <path d="M200 110 Q148 128 108 152" stroke="#1e4d0f" strokeWidth="1.5" fill="none" opacity="0.45"/>
                    <path d="M200 135 Q250 148 292 168" stroke="#1e4d0f" strokeWidth="1.5" fill="none" opacity="0.45"/>
                    <path d="M200 160 Q152 172 118 192" stroke="#1e4d0f" strokeWidth="1.5" fill="none" opacity="0.4"/>
                    <path d="M200 185 Q248 194 285 210" stroke="#1e4d0f" strokeWidth="1.5" fill="none" opacity="0.4"/>
                    {/* Disease spots — large */}
                    <circle cx="142" cy="98" r="20" fill="url(#sg)" filter="url(#sf)"/>
                    <circle cx="142" cy="98" r="12" fill="#d97706" opacity="0.85"/>
                    <circle cx="142" cy="98" r="6" fill="#fde68a" opacity="0.7"/>
                    <circle cx="264" cy="125" r="17" fill="url(#sg)" filter="url(#sf)"/>
                    <circle cx="264" cy="125" r="10" fill="#d97706" opacity="0.85"/>
                    <circle cx="264" cy="125" r="5" fill="#fde68a" opacity="0.6"/>
                    <circle cx="188" cy="178" r="18" fill="url(#sg)" filter="url(#sf)"/>
                    <circle cx="188" cy="178" r="10" fill="#b45309" opacity="0.85"/>
                    <circle cx="188" cy="178" r="5" fill="#fcd34d" opacity="0.6"/>
                    {/* Spots — medium */}
                    <circle cx="112" cy="150" r="11" fill="url(#sg)" filter="url(#sf)"/>
                    <circle cx="112" cy="150" r="6" fill="#d97706" opacity="0.75"/>
                    <circle cx="298" cy="96" r="10" fill="url(#sg)" filter="url(#sf)"/>
                    <circle cx="298" cy="96" r="5" fill="#d97706" opacity="0.75"/>
                    <circle cx="232" cy="198" r="12" fill="url(#sg)" filter="url(#sf)"/>
                    <circle cx="232" cy="198" r="6" fill="#b45309" opacity="0.75"/>
                    <circle cx="152" cy="198" r="9" fill="url(#sg)" filter="url(#sf)"/>
                    <circle cx="152" cy="198" r="4" fill="#d97706" opacity="0.7"/>
                    {/* Spots — small */}
                    <circle cx="168" cy="78" r="6" fill="#d97706" opacity="0.65"/>
                    <circle cx="282" cy="170" r="7" fill="#b45309" opacity="0.6"/>
                    <circle cx="118" cy="88" r="5" fill="#d97706" opacity="0.55"/>
                    <circle cx="322" cy="150" r="6" fill="#92400e" opacity="0.6"/>
                    <circle cx="82" cy="128" r="7" fill="#d97706" opacity="0.55"/>
                    <circle cx="346" cy="128" r="5" fill="#d97706" opacity="0.5"/>
                    <circle cx="208" cy="232" r="6" fill="#b45309" opacity="0.5"/>
                    {/* Yellowing halos around main spots */}
                    <circle cx="142" cy="98" r="30" fill="#eab308" opacity="0.12"/>
                    <circle cx="264" cy="125" r="26" fill="#eab308" opacity="0.1"/>
                    <circle cx="188" cy="178" r="28" fill="#eab308" opacity="0.12"/>
                    {/* Scan line */}
                    <rect x="0" y="60" width="400" height="2" fill="#4ade80" opacity="0.6"/>
                    {/* Bottom gradient */}
                    <rect x="0" y="220" width="400" height="60" fill="url(#lg)" opacity="0.7"/>
                    <rect x="0" y="220" width="400" height="60" fill="rgba(0,0,0,0.4)"/>
                    {/* Bottom text */}
                    <text x="14" y="256" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="600" fill="white">Tomato Leaf · Uploaded just now</text>
                    {/* Analysing badge */}
                    <rect x="286" y="8" width="106" height="22" rx="11" fill="#16a34a" opacity="0.95"/>
                    <circle cx="300" cy="19" r="4" fill="white" opacity="0.95"/>
                    <text x="310" y="23" fontFamily="system-ui,sans-serif" fontSize="11" fontWeight="700" fill="white">Analysing</text>
                  </svg>

                  {/* Animated scan line overlay */}
                  <motion.div
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-70 pointer-events-none"
                    initial={{ top: "10%" }}
                    animate={{ top: "88%" }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "linear",
                    }}
                  />
                </div>

                {/* Diagnosis content */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="text-[10px] text-gray-400 font-medium">Disease Detected</div>
                  </div>
                  <div className="text-green-700 font-bold text-base mb-3">
                    Tomato Leaf Spot
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                      <div className="text-[9px] text-gray-400 mb-0.5 uppercase tracking-wide">Confidence</div>
                      <div className="font-bold text-gray-800 text-sm">85%</div>
                      <div className="mt-1 h-1 bg-gray-200 rounded-full">
                        <div className="h-1 bg-green-500 rounded-full" style={{ width: "85%" }} />
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                      <div className="text-[9px] text-gray-400 mb-0.5 uppercase tracking-wide">Severity</div>
                      <div className="font-bold text-amber-500 text-sm">Moderate</div>
                      <div className="mt-1 h-1 bg-gray-200 rounded-full">
                        <div className="h-1 bg-amber-400 rounded-full" style={{ width: "55%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-3 mb-3 border border-green-100">
                    <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="#16a34a"><path d="M4 0C1.8 0 0 1.8 0 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm-.5 6L1 3.5l.7-.7 1.8 1.8 2.8-2.8.7.7L3.5 6z"/></svg>
                      Recommended Treatment
                    </div>
                    {[
                      "Remove affected leaves",
                      "Use copper-based fungicide",
                      "Improve field ventilation",
                    ].map((t) => (
                      <div key={t} className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                            <path d="M1 3.5L2.8 5.5L6 1.5" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <span className="text-[10px] text-gray-700">{t}</span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full bg-green-700 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-green-700/30">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M5.5 1v6M2.5 7l3 3 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Save Result
                  </button>
                </div>
              </div>
            </div>

            {/* Glow under phone */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-8 bg-green-400/25 blur-2xl rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* ── Feature strip ── */}
      <div className="relative z-10 bg-white/97 backdrop-blur-sm border-t border-gray-100 shadow-md">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: <Camera size={18} className="text-green-600" />,
                bg: "bg-green-50",
                title: "AI Disease Detection",
                desc: "Upload a photo and get instant AI insights.",
              },
              {
                icon: <Shield size={18} className="text-blue-600" />,
                bg: "bg-blue-50",
                title: "Treatment Recommendations",
                desc: "Get practical solutions tailored to your crops.",
              },
              {
                icon: <BookMarked size={18} className="text-amber-600" />,
                bg: "bg-amber-50",
                title: "Farming Guides",
                desc: "Access expert tips and best farming practices.",
              },
              {
                icon: <BarChart2 size={18} className="text-purple-600" />,
                bg: "bg-purple-50",
                title: "Track & Improve",
                desc: "Monitor your crop health and boost your yields.",
              },
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
