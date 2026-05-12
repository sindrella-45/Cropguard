"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] },
});

export function HeroSection() {
  return (
    <section className="pt-28 pb-20 px-6 md:px-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
      {/* LEFT */}
      <div>
        <motion.div {...fadeUp(0)}>
          <span className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-1.5 rounded-full text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 dot-pulse" />
            AI-Powered · Used by 12,000+ Farmers
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          className="font-heading font-bold text-5xl md:text-6xl leading-[1.12] text-gray-900 mb-5"
        >
          Protect Crops with{" "}
          <span className="text-green-600">Smart AI Diagnosis</span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.2)}
          className="text-lg text-gray-500 leading-relaxed mb-8 max-w-xl"
        >
          Upload a crop image and instantly detect diseases, severity levels,
          treatments, and prevention tips — powered by advanced computer vision.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="flex flex-wrap gap-4">
          <Link href="/auth/register">
            <Button size="lg">Get Started Free</Button>
          </Link>
          <a href="#how-it-works">
            <Button size="lg" variant="secondary">Learn More</Button>
          </a>
        </motion.div>
      </div>

      {/* RIGHT — diagnosis card */}
      <motion.div {...fadeUp(0.4)} className="relative">
        {/* Floating badges */}
        <div className="absolute -top-5 -right-4 bg-white rounded-xl px-3 py-2 shadow-lg border border-gray-100 text-sm font-medium flex items-center gap-2 float-badge z-10">
          <span className="text-green-600">✓</span> Disease Detected
        </div>
        <div className="absolute -bottom-4 -left-4 bg-white rounded-xl px-3 py-2 shadow-lg border border-gray-100 text-sm font-medium flex items-center gap-2 float-badge-delay z-10">
          <span>🔒</span> Secure & Private
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-5 overflow-hidden">
          {/* Crop image simulation */}
          <div className="relative w-full h-52 rounded-2xl bg-gradient-to-br from-green-100 via-green-200 to-green-400 flex items-center justify-center overflow-hidden mb-3">
            {/* dot pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle, #166534 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <span className="text-8xl drop-shadow-md relative z-10">🌿</span>
            {/* Scan border */}
            <div className="absolute inset-0 border-2 border-green-400 rounded-2xl scan-border opacity-60" />
            {/* Scan line */}
            <div className="absolute left-0 right-0 h-0.5 hero-scan-line opacity-80" />
          </div>

          {/* Result info */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-800 font-heading">
              Tomato — Late Blight
            </span>
            <span className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">
              High Severity
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-amber-50 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">87% Confidence</span>
            <span className="bg-green-50 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Treatment Ready</span>
            <span className="bg-red-50 text-red-700 text-xs font-medium px-3 py-1 rounded-full">Act Now</span>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2">
            {[["98%", "Accuracy"], ["200+", "Diseases"], ["<3s", "Analysis"]].map(([val, lbl]) => (
              <div key={lbl} className="text-center py-3 bg-gray-50 rounded-xl">
                <div className="font-heading font-bold text-lg text-green-700">{val}</div>
                <div className="text-xs text-gray-400 mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
