"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Crops", href: "#crops" },
  { label: "Testimonials", href: "#testimonials" },
];

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0a1a0a]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-18 flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline group">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#C8A84B] to-[#2D6A2D] opacity-90 rotate-3 group-hover:rotate-6 transition-transform duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-[#0a1a0a] border border-[#C8A84B]/40 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3C8 3 5 7 5 11c0 3 1.5 5.5 4 7l3 2 3-2c2.5-1.5 4-4 4-7 0-4-3-8-7-8z" fill="#2D6A2D" />
                  <path d="M12 3c4 0 7 4 7 8 0 3-1.5 5.5-4 7l-3 2" stroke="#C8A84B" strokeWidth="1.2" fill="none" />
                  <circle cx="12" cy="11" r="2.5" fill="#C8A84B" />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight leading-none block"
                style={{ fontFamily: "'Fraunces', serif" }}>
                CropGuard
              </span>
              <span className="text-[10px] text-[#C8A84B] font-medium tracking-widest uppercase">AI Platform</span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-white/70 hover:text-[#C8A84B] transition-colors duration-200 no-underline font-medium tracking-wide"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login"
              className="text-sm text-white/80 hover:text-white transition-colors no-underline px-4 py-2 font-medium">
              Sign in
            </Link>
            <Link href="/auth/register"
              className="no-underline px-5 py-2.5 rounded-full text-sm font-semibold text-[#0a1a0a] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#C8A84B]/30"
              style={{ background: "linear-gradient(135deg, #C8A84B, #E8C96B)" }}>
              Get Started Free
            </Link>
          </div>

          {/* Hamburger */}
          <button className="md:hidden p-2 text-white/80 hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[66px] left-0 right-0 z-40 bg-[#0a1a0a]/98 backdrop-blur-xl border-b border-white/10 px-6 py-6 flex flex-col gap-4 md:hidden"
          >
            {links.map((l) => (
              <a key={l.label} href={l.href}
                className="text-base text-white/80 no-underline hover:text-[#C8A84B] transition-colors font-medium"
                onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
              <Link href="/auth/login" onClick={() => setOpen(false)}
                className="text-center py-3 text-white/80 no-underline font-medium">
                Sign in
              </Link>
              <Link href="/auth/register" onClick={() => setOpen(false)}
                className="no-underline text-center py-3 rounded-full font-semibold text-[#0a1a0a]"
                style={{ background: "linear-gradient(135deg, #C8A84B, #E8C96B)" }}>
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
