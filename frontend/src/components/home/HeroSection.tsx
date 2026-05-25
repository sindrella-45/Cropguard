"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, ShieldCheck, Zap } from "lucide-react";

const CROPS = ["Coffee", "Tea", "Cocoa", "Cotton", "Sunflower", "Maize"];

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Subtle particle field — warm gold dots drifting upward
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      speed: Math.random() * 0.4 + 0.15,
      opacity: Math.random() * 0.4 + 0.1,
      drift: (Math.random() - 0.5) * 0.3,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 168, 75, ${p.opacity})`;
        ctx.fill();
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        if (p.x < -5 || p.x > canvas.width + 5) p.x = Math.random() * canvas.width;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#050f05]">

      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Deep forest gradient */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 60% 40%, #0f2d0f 0%, #050f05 70%)" }} />
        {/* Gold accent glow top-right */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #C8A84B 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        {/* Green glow bottom-left */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #2D6A2D 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />
      </div>

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Horizontal rule lines — architectural feel */}
      <div className="absolute left-0 right-0 top-1/3 h-px bg-gradient-to-r from-transparent via-[#C8A84B]/20 to-transparent" />
      <div className="absolute left-0 right-0 top-2/3 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-28 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* LEFT */}
        <div>
          {/* Eyebrow tag */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 mb-8"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#C8A84B]/40 bg-[#C8A84B]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8A84B] animate-pulse" />
              <span className="text-[#C8A84B] text-xs font-semibold tracking-widest uppercase">
                AI-Powered · East Africa
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-6xl xl:text-7xl font-bold text-white leading-[1.08] mb-6 tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Your crops,{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #C8A84B 0%, #E8D080 50%, #C8A84B 100%)" }}>
                protected
              </span>
              <span className="absolute bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C8A84B]/0 via-[#C8A84B]/60 to-[#C8A84B]/0" />
            </span>
            <br />
            by AI that{" "}
            <span className="text-[#5CB85C]">understands</span>
            <br />
            African farms.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-lg text-white/60 leading-relaxed mb-10 max-w-lg"
          >
            Photograph a leaf. Get an instant professional diagnosis — disease name,
            severity, treatment plan, and prevention tips. Built specifically for
            Uganda and East African crop conditions.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap items-center gap-4 mb-12"
          >
            <Link href="/auth/register" className="no-underline group">
              <button
                className="flex items-center gap-2.5 px-7 py-4 rounded-full font-semibold text-[#0a1a0a] text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#C8A84B]/30"
                style={{ background: "linear-gradient(135deg, #C8A84B 0%, #E8D080 100%)" }}
              >
                Start Free Diagnosis
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <a href="#how-it-works" className="no-underline">
              <button className="flex items-center gap-2.5 px-7 py-4 rounded-full font-semibold text-white/80 text-base border border-white/20 hover:border-white/40 hover:text-white transition-all duration-300 hover:bg-white/5">
                See How It Works
              </button>
            </a>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-wrap items-center gap-6"
          >
            {[
              { icon: <ShieldCheck size={15} />, text: "No false promises — honest confidence scores" },
              { icon: <Zap size={15} />, text: "Results in under 60 seconds" },
              { icon: <Leaf size={15} />, text: "5 East African crops supported" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white/45 text-xs">
                <span className="text-[#5CB85C]">{icon}</span>
                {text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — diagnosis card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Glow behind card */}
          <div className="absolute inset-0 rounded-3xl opacity-30"
            style={{ background: "radial-gradient(ellipse at center, #2D6A2D 0%, transparent 70%)", filter: "blur(40px)", transform: "scale(1.2)" }} />

          {/* Main card */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10"
            style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)", backdropFilter: "blur(20px)" }}>

            {/* Card header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-white/40 text-xs font-mono">cropguard-ai · diagnosis</span>
              <div className="w-16" />
            </div>

            <div className="p-6">
              {/* Leaf image area with scan animation */}
              <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-5"
                style={{ background: "linear-gradient(135deg, #0f2d0f 0%, #1a4a1a 50%, #0f2d0f 100%)" }}>
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: "linear-gradient(rgba(200,168,75,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(200,168,75,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                {/* Center leaf */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-7xl filter drop-shadow-2xl">🌿</span>
                </div>
                {/* Scan line */}
                <div className="absolute left-0 right-0 h-0.5 opacity-70 hero-scan"
                  style={{ background: "linear-gradient(90deg, transparent, #C8A84B, transparent)" }} />
                {/* Corner brackets */}
                {[["top-3 left-3 border-t border-l", ""], ["top-3 right-3 border-t border-r", ""], ["bottom-3 left-3 border-b border-l", ""], ["bottom-3 right-3 border-b border-r", ""]].map(([pos], i) => (
                  <div key={i} className={`absolute ${pos} w-5 h-5 border-[#C8A84B] opacity-60`} />
                ))}
                {/* Analysing badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur rounded-full px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8A84B] animate-pulse" />
                  <span className="text-[#C8A84B] text-[10px] font-semibold tracking-wider">ANALYSING</span>
                </div>
              </div>

              {/* Result */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/50 text-xs mb-1 font-medium tracking-wide uppercase">Detected</p>
                  <h3 className="text-white font-bold text-xl leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                    Coffee Leaf Rust
                  </h3>
                  <p className="text-white/50 text-xs mt-1">Hemileia vastatrix · Fungal</p>
                </div>
                <div className="text-right">
                  <div className="text-[#C8A84B] font-bold text-2xl" style={{ fontFamily: "'Fraunces', serif" }}>79%</div>
                  <div className="text-white/40 text-xs">Good Confidence</div>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full mb-5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "79%" }}
                  transition={{ duration: 1.2, delay: 0.9, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #2D6A2D, #C8A84B)" }}
                />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { label: "Moderate Severity", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
                  { label: "Act within 3–7 days", color: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
                  { label: "Lab confirmation advised", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
                ].map(({ label, color }) => (
                  <span key={label} className={`${color} border text-[10px] font-semibold px-2.5 py-1 rounded-full`}>
                    {label}
                  </span>
                ))}
              </div>

              {/* Treatment preview */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-3">Top Treatment</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2D6A2D]/40 border border-[#2D6A2D]/50 flex items-center justify-center text-sm">⚡</div>
                  <div>
                    <p className="text-white/90 text-sm font-semibold">Apply copper-based fungicide</p>
                    <p className="text-white/40 text-xs">According to locally approved label guidance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating stat badges */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute -right-5 top-20 bg-[#0a1a0a] border border-white/15 rounded-2xl px-4 py-3 shadow-2xl hidden lg:block"
          >
            <div className="text-[#C8A84B] font-bold text-xl" style={{ fontFamily: "'Fraunces', serif" }}>12k+</div>
            <div className="text-white/50 text-xs">Farmers using CropGuard</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute -left-5 bottom-24 bg-[#0a1a0a] border border-white/15 rounded-2xl px-4 py-3 shadow-2xl hidden lg:block"
          >
            <div className="text-[#5CB85C] font-bold text-xl" style={{ fontFamily: "'Fraunces', serif" }}>200+</div>
            <div className="text-white/50 text-xs">Diseases in database</div>
          </motion.div>
        </motion.div>
      </div>

      {/* Crop ticker */}
      <div className="relative z-10 border-t border-white/10 py-4 overflow-hidden">
        <div className="flex items-center gap-0 animate-marquee whitespace-nowrap">
          {[...CROPS, ...CROPS, ...CROPS].map((crop, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-8">
              <span className="w-1 h-1 rounded-full bg-[#C8A84B]/60" />
              <span className="text-white/30 text-sm font-medium tracking-widest uppercase">{crop}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Scan line animation CSS */}
      <style jsx global>{`
        .hero-scan {
          animation: scanDown 3s ease-in-out infinite;
        }
        @keyframes scanDown {
          0% { top: 0%; }
          50% { top: 100%; }
          50.01% { top: -2px; }
          100% { top: 0%; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 18s linear infinite;
        }
      `}</style>
    </section>
  );
}
